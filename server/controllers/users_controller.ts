import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { authMiddleware } from "../middleware/authentication";
import { UsersRepository } from "../repositories/users_respository";
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
interface MyTokenPayload extends JwtPayload {
  userId: number;
}

// /users/...
export const buildUsersController = (usersRepository: UsersRepository) => {
  const router = Router();

  router.post("/", async (req, res) => {
    const user = await usersRepository.createUser(req.body);

    const token = jwt.sign({
      userId: user.id,
    }, process.env.ENCRYPTION_KEY as string);

    res.json({ user, token });
  });

  router.get("/me", authMiddleware, (req, res) => {
    res.json({ user: req.user });
  });

  // Endpoint to retrieve Spotify tokens
router.get("/me/tokens", authMiddleware, async (req, res) => {
  //console.log("Received request for Spotify tokens")
  if (!req.user) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  try {
    const user = await usersRepository.getUserWithTokens(req.user.id);
    if (!user || !user.spotifyAccessToken) {  // Check if user or token doesn't exist
      return res.status(404).json({ error: "User or access token not found" });
    }
    res.json({
      spotifyAccessToken: user.spotifyAccessToken
    });
  } catch (error) {
    console.error('Failed to retrieve Spotify tokens:', error);
    res.status(500).send('Internal Server Error');
  }
});


  // Endpoint to get Spotify authorization URL
  const SPOTIFY_CLIENT_ID = "00ed30d4fa214614be034225cd52f0fb";
  const SPOTIFY_CLIENT_SECRET = "b66a9b46099e4a0cb2cae5411a828896";
  const REDIRECT_URI = 'http://localhost:3000/users/callback';
  const scope = 'user-top-read user-read-private user-read-email';

  router.get("/me/authURL", authMiddleware, (req, res) => {
    const { user } = req;
    if (!user) {
        return res.status(401).send('User must be logged in.');
    }

    // Ensure the encryption key is defined
    if (!process.env.ENCRYPTION_KEY) {
        console.error('Encryption key is not set in the environment variables');
        return res.status(500).send('Internal server error');
    }

    const state = jwt.sign({ userId: user.id }, process.env.ENCRYPTION_KEY, {
      expiresIn: '1h' // Short expiry as this is sensitive
    });
    const scope = 'user-top-read user-read-private user-read-email';
    const redirectUri = encodeURIComponent(REDIRECT_URI);
    //const url = `https://accounts.spotify.com/authorize?response_type=code&client_id=${SPOTIFY_CLIENT_ID}&scope=${encodeURIComponent(scope)}&redirect_uri=${redirectUri}&state=${encodeURIComponent(state)}`;
    const url = `https://accounts.spotify.com/authorize?response_type=code&client_id=${SPOTIFY_CLIENT_ID}&scope=${encodeURIComponent(scope)}&redirect_uri=${redirectUri}`;
    //console.log("Sending Spotify URL:", url);
    res.json({ url });
});



// Endpoint to handle Spotify callback with the authorization code

const tempTokenStorage: { [key: string]: any } = {};

function storeTokensTemporarily(tokenIdentifier: string, accessToken: string, refreshToken: string) {
  tempTokenStorage[tokenIdentifier] = {
    accessToken,
    refreshToken,
    timestamp: new Date() // Store timestamp to handle expiry if needed
  };
}

function generateTokenIdentifier() {
  return uuidv4(); // Generates a unique identifier
}

router.get("/callback", async (req, res) => {
  //console.log("Received Spotify callback");
  const code = req.query.code;
 //console.log("code", code);
  if (!code) {
    return res.status(400).send("Authorization code is required.");
  }

  try {
    const tokenResponse = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string, // Cast 'code' to string
        redirect_uri: REDIRECT_URI,
        client_id: SPOTIFY_CLIENT_ID,
        client_secret: SPOTIFY_CLIENT_SECRET,
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')
      }
    });
    //console.log("tokenResponse", tokenResponse);

    const { access_token, refresh_token } = tokenResponse.data;
    //console.log("access_token", access_token);
    //console.log("refresh_token", refresh_token);
    // Store these tokens temporarily with a unique identifier
    const tokenIdentifier = generateTokenIdentifier(); // Implement this function to generate a unique ID
    storeTokensTemporarily(tokenIdentifier, access_token, refresh_token); // Implement this to store the tokens with the identifier

    // Redirect user to login with the token identifier as a query parameter or in a cookie
    res.redirect(`/#/spotify_login?tokenIdentifier=${tokenIdentifier}`);
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    res.status(500).send('Failed to exchange code for tokens');
  }
});

router.post('/attach_spotify_tokens', authMiddleware, async (req, res) => {
  const { tokenIdentifier } = req.body;
  if (!req.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  try {
    const tokens = tempTokenStorage[tokenIdentifier];
    if (!tokens) {
      return res.status(404).send('Token not found or expired');
    }
    await usersRepository.updateUserTokens(req.user.id, tokens.accessToken, tokens.refreshToken);
    delete tempTokenStorage[tokenIdentifier]; // Clean up after attaching
    res.status(200).json({ message: 'Spotify tokens attached successfully to user profile' });
  } catch (error) {
    console.error('Failed to attach Spotify tokens:', error);
    res.status(500).send('Failed to attach Spotify tokens');
  }
});
router.get("/has_spotify_tokens", authMiddleware, async (req, res) => {
  if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
  }

  try {
      const hasTokens = await usersRepository.hasUserSpotifyTokens(req.user.id);
      res.json({ hasTokens });
  } catch (error) {
      console.error('Failed to check Spotify tokens:', error);
      res.status(500).send('Internal Server Error');
  }
});
// Endpoint to refresh Spotify access tokens
router.post("/me/tokens/refresh", authMiddleware, async (req, res) => {
  if (!req.user) {
    return res.status(401).send('User must be logged in.');
  }

  try {
    const user = await usersRepository.getUserWithTokens(req.user.id);
    if (!user || !user.spotifyRefreshToken) {
      return res.status(404).send('Refresh token not found');
    }

    const tokenResponse = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')
      },
      data: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: user.spotifyRefreshToken
      })
    });

    const { access_token, expires_in } = tokenResponse.data;

    // Update the stored access token and expiration in your database
    await usersRepository.updateUserTokens(req.user.id, access_token, user.spotifyRefreshToken);

    res.json({ access_token });
  } catch (error) {
    console.error('Failed to refresh token:', error);
    res.status(500).send('Failed to refresh token');
  }
});


return router;
};