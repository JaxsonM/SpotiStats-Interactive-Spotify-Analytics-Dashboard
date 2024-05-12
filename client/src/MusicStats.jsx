import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useApi } from "./utils/use_api";
import { requireLogin } from "./utils/require_login";
import { useNavigate } from 'react-router-dom';

export const MusicStatsPage = () => {
    requireLogin();
    const navigate = useNavigate();
    const api = useApi();
    const [topArtists, setTopArtists] = useState([]);
    const [topTracks, setTopTracks] = useState([]);
    const [genreStats, setGenreStats] = useState([]);
    const [artistTimeRange, setArtistTimeRange] = useState('medium_term');
    const [trackTimeRange, setTrackTimeRange] = useState('medium_term');
    const [genreTimeRange, setGenreTimeRange] = useState('medium_term');

    useEffect(() => {
        const checkStoredTokens = async () => {
            const { hasTokens } = await api.get('/users/has_spotify_tokens');
            if (hasTokens) {
                const { spotifyAccessToken } = await api.get('/users/me/tokens');
                fetchTopArtists(spotifyAccessToken, artistTimeRange);
                fetchTopTracks(spotifyAccessToken, trackTimeRange);
            } else {
                navigate('/spotify/auth/spotify');
            }
        };

        const fetchTopArtists = async (token, range) => {
            const artists = await fetchData('top/artists', token, range);
            if (artists) setTopArtists(artists);
        };

        const fetchTopTracks = async (token, range) => {
            const tracks = await fetchData('top/tracks', token, range);
            if (tracks) {
                setTopTracks(tracks);
                const artistIds = tracks.map(track => track.artists.map(artist => artist.id)).flat();
                fetchArtistGenres(token, artistIds);
            }
        };

        const fetchData = async (endpoint, token, range) => {
            try {
                const response = await axios.get(`https://api.spotify.com/v1/me/${endpoint}?limit=50&time_range=${range}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                return response.data.items;
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        const fetchArtistGenres = async (token, artistIds) => {
            try {
                const response = await axios.get(`api/compute-genres`, {
                    params: { token: token, artistIds: artistIds.join(',') }
                });
                setGenreStats(response.data);
            } catch (error) {
                console.error("Error fetching genre percentages:", error);
            }
        };

        checkStoredTokens();
    }, [api, artistTimeRange, trackTimeRange, genreTimeRange, navigate]);

    const handleArtistTimeRangeSelection = (range) => {
        setArtistTimeRange(range);
    };

    const handleTrackTimeRangeSelection = (range) => {
        setTrackTimeRange(range);
    };

    const handleGenreTimeRangeSelection = (range) => {
        setGenreTimeRange(range);
    };

    const isSelected = (range, type) => type === range ? 'bg-blue-300' : 'bg-white';

    return (
        <div className="mx-auto my-10 p-5 border-2 rounded flex flex-col space-y-5 bg-gray-100" id="music-stats-container">
            <h1 className="text-3xl font-bold text-center text-gray-800">Your Spotify Music Stats</h1>
            <div className="flex space-x-5">
                <div className="w-1/2 border p-5 rounded bg-white">
                    <h2 className="text-2xl font-bold mb-3 text-blue-500">Top 50 Artists</h2>
                    <div className="flex flex-wrap justify-between text-center mb-3">
                        <button className={`w-1/3 p-2 ${isSelected(artistTimeRange, 'short_term')}`} onClick={() => handleArtistTimeRangeSelection('short_term')}>4 Weeks</button>
                        <button className={`w-1/3 p-2 ${isSelected(artistTimeRange, 'medium_term')}`} onClick={() => handleArtistTimeRangeSelection('medium_term')}>6 Months</button>
                        <button className={`w-1/3 p-2 ${isSelected(artistTimeRange, 'long_term')}`} onClick={() => handleArtistTimeRangeSelection('long_term')}>Lifetime</button>
                    </div>
                    <ul className="overflow-auto h-96">
                        {topArtists.map((artist, index) => (
                            <li key={artist.id} className="mb-2 p-2 border border-gray-200 rounded">
                                {index + 1}. {artist.name}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="w-1/2 border p-5 rounded bg-white">
                    <h2 className="text-2xl font-bold mb-3 text-green-500">Top 50 Tracks</h2>
                    <div className="flex flex-wrap justify-between text-center mb-3">
                        <button className={`w-1/3 p-2 ${isSelected(trackTimeRange, 'short_term')}`} onClick={() => handleTrackTimeRangeSelection('short_term')}>4 Weeks</button>
                        <button className={`w-1/3 p-2 ${isSelected(trackTimeRange, 'medium_term')}`} onClick={() => handleTrackTimeRangeSelection('medium_term')}>6 Months</button>
                        <button className={`w-1/3 p-2 ${isSelected(trackTimeRange, 'long_term')}`} onClick={() => handleTrackTimeRangeSelection('long_term')}>Lifetime</button>
                    </div>
                    <ul className="overflow-auto h-96">
                        {topTracks.map((track, index) => (
                            <li key={track.id} className="mb-2 p-2 border border-gray-200 rounded">
                                {index + 1}. {track.name}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="border p-5 rounded bg-white">
                <h2 className="text-2xl font-bold mb-3 text-purple-500">Genre Percentages</h2>
                <ul className="overflow-auto h-96">
                    {genreStats.map(genreStat => (
                        <li key={genreStat.genre} className="mb-2 p-2 border border-gray-200 rounded">
                            {genreStat.genre}: {genreStat.percentage}%
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};
