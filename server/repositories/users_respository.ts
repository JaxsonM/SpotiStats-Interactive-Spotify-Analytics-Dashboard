import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

export type CreateUserPayload = {
  email: string,
  password: string,
  firstName: string,
  lastName: string,
}

export class UsersRepository {
  private db: PrismaClient
  private static instance: UsersRepository
  constructor(db: PrismaClient) {
    this.db = db;
  }

  static getInstance(db?: PrismaClient): UsersRepository {
    if (!this.instance) {
      this.instance = new UsersRepository(db!!);
    }
    return this.instance;
  }

  async createUser({email, password, firstName, lastName}: CreateUserPayload) {
    return this.db.user.create({
      data: {
        email: email,
        password_hash: bcrypt.hashSync(password),
        firstName: firstName,
        lastName: lastName,
        profile: {
          create: {}
        }
      }
    });
  }

  async getUserById(id: number) {
    return this.db.user.findUnique({
      where: {
        id: id
      },
    });
  }

  // New function to retrieve user with Spotify tokens
  async getUserWithTokens(userId: number) {
    return this.db.user.findUnique({
      where: {
        id: userId
      },
      select: {
        spotifyAccessToken: true,
        spotifyRefreshToken: true
      }
    });
  }
  async updateUserTokens(userId: number, accessToken: string, refreshToken: string) {
    return this.db.user.update({
      where: { id: userId },
      data: {
        spotifyAccessToken: accessToken,
        spotifyRefreshToken: refreshToken,
      },
    });
  }
  async hasUserSpotifyTokens(userId: number) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: {
        spotifyAccessToken: true,
        spotifyRefreshToken: true
      }
    });
    return user && user.spotifyAccessToken && user.spotifyRefreshToken;
}
}

