import express, { Request, Response, Router } from 'express';
import axios from 'axios';

interface GenrePercentage {
  genre: string;
  percentage: string;
}

const calculateGenrePercentages = (genres: string[]): GenrePercentage[] => {
  const genreCounts = genres.reduce((acc: Record<string, number>, genre: string) => {
    acc[genre] = (acc[genre] || 0) + 1;
    return acc;
  }, {});

  const total = Object.values(genreCounts).reduce((sum: number, count: number) => sum + count, 0);
  const percentages = Object.entries(genreCounts).map(([genre, count]): GenrePercentage => ({
    genre,
    percentage: ((count / total) * 100).toFixed(2)
  }));

  return percentages.sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));
};

const fetchAndComputeGenres = async (token: string, artistIds: string[]): Promise<GenrePercentage[]> => {
    const chunkSize = 50; // Limit imposed by the API
    let allGenres: string[] = [];

    for (let i = 0; i < artistIds.length; i += chunkSize) {
        const chunk = artistIds.slice(i, i + chunkSize);
        const idsParam = chunk.join(',');
        try {
            const response = await axios.get(`https://api.spotify.com/v1/artists?ids=${idsParam}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const genres = response.data.artists.flatMap((artist: any) => artist.genres);
            allGenres = allGenres.concat(genres);
        } catch (error: any) {
            console.error('Error fetching artist genres:', error.message);
            throw new Error('Failed to fetch genres');
        }
    }

    return calculateGenrePercentages(allGenres);
};

export const buildGenreController = (): Router => {
    const router: Router = express.Router();

    router.get('/compute-genres', async (req: Request, res: Response) => {
        const { token, artistIds } = req.query;

        if (typeof token !== 'string' || typeof artistIds !== 'string') {
            return res.status(400).json({ error: "Token and artist IDs are required as strings." });
        }

        try {
            const artistIdsArray: string[] = artistIds.split(',');
            const genres = await fetchAndComputeGenres(token, artistIdsArray);
            res.json(genres);
        } catch (error: any) {
            res.status(500).json({ error: error.message || 'Failed to fetch and compute genres' });
        }
    });

    return router;
};
