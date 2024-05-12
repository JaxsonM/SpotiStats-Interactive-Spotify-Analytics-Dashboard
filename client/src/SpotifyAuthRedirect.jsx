import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from './utils/use_api';

export const SpotifyAuthRedirect = () => {
    const navigate = useNavigate();
    const api = useApi();

    useEffect(() => {
        const fetchSpotifyAuthUrl = async () => {
            try {
                // Directly using the JSON object returned from the API
                const response = await api.get('/users/me/authURL');
                //console.log("Response url:", response);
                if (response.url) {
                    //console.log("Navigating to Spotify auth URL:", response.url);
                    window.location.href = response.url;
                } else {
                    throw new Error('No link found');
                }
            } catch (error) {
                console.error('Failed to fetch Spotify auth URL from api:', error);
                //navigate('/'); // Redirect to home on failure
            }
        };

        fetchSpotifyAuthUrl();
    }, [api, navigate]);

    return (
        <div>Loading...</div>
    );
};
