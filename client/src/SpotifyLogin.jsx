import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApi } from './utils/use_api'; // Utility to handle API requests

export const SpotifyLogin = () => {
  const [email, setEmail] = useState(""); // State to hold the email input
  const [password, setPassword] = useState(""); // State to hold the password input
  const navigate = useNavigate(); // Hook to navigate between routes
  const location = useLocation(); // Hook to access the URL
  const api = useApi(); // API utility for making requests

  // Extract tokenIdentifier from URL to be used in token attachment
  const queryParams = new URLSearchParams(location.search);
  const tokenIdentifier = queryParams.get('tokenIdentifier');

  // Function to attach Spotify tokens to the user profile after login
  async function attachTokensToUserProfile(userToken, tokenIdentifier) {
    const headers = {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    };

    try {
      const response = await fetch('/users/attach_spotify_tokens', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ tokenIdentifier })
      });

      if (!response.ok) {
        throw new Error('Failed to attach Spotify tokens to user profile');
      }

      const data = await response.json();
      console.log('Spotify tokens attached successfully:', data);
      navigate("/music_stats"); // Redirect to the music stats page on successful token attachment
    } catch (error) {
      console.error('Error attaching Spotify tokens to user profile:', error);
    }
  }

  // Handle user login
  async function handleLogin(e) {
    e.preventDefault();
    try {
      const response = await api.post("/sessions", { email, password });

      if (response.token) {
        await attachTokensToUserProfile(response.token, tokenIdentifier);
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-5 border rounded shadow-lg">
      <h2 className="text-lg font-semibold mb-4">Login to Link Spotify</h2>
      <p className="text-sm text-gray-600 mb-4">
        Please log back in to authenticate the link between this account and your Spotify account.
      </p>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          className="w-full p-2 border rounded"
          placeholder="Email"
          type="email"
          value={email}
          required
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="Password"
          type="password"
          value={password}
          required
          onChange={e => setPassword(e.target.value)}
        />
        <button className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Sign In
        </button>
      </form>
    </div>
  );
};
