// src/genreWorker.js
self.onmessage = async (e) => {
    const { token, artistIds } = e.data;
    const chunkSize = 50;
    let allGenres = [];

    for (let i = 0; i < artistIds.length; i += chunkSize) {
        const chunk = artistIds.slice(i, i + chunkSize);
        const idsParam = chunk.join(',');
        try {
            const response = await fetch(`https://api.spotify.com/v1/artists?ids=${idsParam}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            const genres = data.artists.flatMap(artist => artist.genres);
            allGenres = allGenres.concat(genres);
        } catch (error) {
            console.error("Error fetching artist genres:", error);
        }
    }

    const genreCounts = allGenres.reduce((acc, genre) => {
        acc[genre] = (acc[genre] || 0) + 1;
        return acc;
    }, {});

    const total = Object.values(genreCounts).reduce((sum, count) => sum + count, 0);
    const percentages = Object.entries(genreCounts)
        .map(([genre, count]) => ({
            genre,
            percentage: ((count / total) * 100).toFixed(2)
        }))
        .sort((a, b) => b.percentage - a.percentage);

    self.postMessage({ percentages });
};
