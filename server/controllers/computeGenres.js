import { get } from 'axios';

// Function to calculate genre percentages
function calculateGenrePercentages(genres) {
  const genreCounts = genres.reduce((counts, genre) => {
    counts[genre] = (counts[genre] || 0) + 1;
    return counts;
  }, {});

  const total = genres.length;
  const genrePercentages = Object.entries(genreCounts).map(([genre, count]) => ({
    genre,
    percentage: ((count / total) * 100).toFixed(2)
  }));

  return genrePercentages.sort((a, b) => b.percentage - a.percentage); // Sort by percentage in descending order
}

// Function to fetch artist genres and compute their percentages
async function fetchAndComputeGenres(token, artistIds) {
  const idsParam = artistIds.join(',');
  try {
    const response = await get(`https://api.spotify.com/v1/artists?ids=${idsParam}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.data.artists) {
      const genres = response.data.artists.flatMap(artist => artist.genres);
      const genrePercentages = calculateGenrePercentages(genres);
      return genrePercentages;
    } else {
      throw new Error('No artists data received');
    }
  } catch (error) {
    console.error('Error fetching artist genres:', error);
    process.send({ success: false, error: 'Failed to fetch genres' });
  }
}

// Listen for messages from the parent process
process.on('message', async (message) => {
  const genrePercentages = await fetchAndComputeGenres(message.token, message.artistIds);
  if (genrePercentages) {
    process.send({ success: true, genres: genrePercentages });
  } else {
    process.send({ success: false, error: 'Failed to compute genre percentages' });
  }
});
