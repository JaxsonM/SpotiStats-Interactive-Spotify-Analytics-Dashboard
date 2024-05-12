# SpotiStats - Spotify Music Analytics Platform

Welcome to SpotiStats, an advanced music analytics platform that integrates with Spotify to provide insights into your listening habits. This project is developed as part of the USU CS 4610 course and serves as a showcase of applying modern web development techniques and technologies.

## Project Overview

SpotiStats offers users detailed statistics about their top tracks, artists, and genres over different time periods. It uses Spotify's Web API to fetch user-specific data and provides an interactive and user-friendly interface to explore music preferences and trends.

## Features

- **User Authentication**: Secure login and session management with Spotify accounts.
- **Music Statistics**: Visualization of top tracks and artists fetched directly from Spotify.
- **Genre Analysis**: Computes and displays genre percentages to uncover musical preferences.
- **Responsive Design**: Optimized for a variety of devices using Tailwind CSS.

## Technologies Used

- **React**: Frontend library for building the user interface.
- **Express**: Backend framework for handling API requests.
- **Prisma**: ORM for database management.
- **Spotify Web API**: Integration for fetching user-related data.
- **Docker**: Containerization of the database for easy setup and deployment.
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development.

## Setup Instructions

### Prerequisites
- Node.js
- Yarn or npm
- Docker

### Install Dependencies
Install dependencies in both the root and client directories:
```bash
# Root directory
yarn
```

# Client directory
cd client
yarn

### Environment Setup
Create a `.env` file in the root directory based on the `.env.example` template. Adjust the environment variables according to your setup.

### Database Setup
Use Docker to set up and run the database:
```bash
docker compose up -d
```

## Running the Application
Run both the server and the client to launch the application:
```bash
# Start the server
yarn dev

# In a new terminal, start the client
cd client
yarn dev
```
Visit `http://localhost:3000` to access the application.

## Development Utilities

- **Database Migrations**: Manage database schema changes:
  ```bash
  yarn migrate-dev
  ```

- **Prisma Studio**: Inspect the database and manage data:
  ```bash
  yarn console
  ```

- **Database Reset**: Reset and re-seed the database:
  ```bash
  yarn migrate-reset
  ```

- **Seeding the Database**: Populate the database with initial data:
  ```bash
  yarn seed
  ```
