import { useState, useEffect } from 'react';

// Hook to check if the user is logged in
const useAuth = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            const storedTokens = localStorage.getItem('gmail_tokens');

            // If there are no tokens, set logged in state to false
            if (!storedTokens) {
                setIsLoggedIn(false);
                return;
            }

            // Parse the tokens from local storage
            const googleTokens = JSON.parse(storedTokens);
            const { access_token, expiry_date } = googleTokens;
            console.log('googleTokens:', googleTokens);

            // Check if the access token is present and if it hasn't expired
            const currentTime = Date.now();
            const isTokenValid = access_token && currentTime < expiry_date;

            setIsLoggedIn(isTokenValid);
        };

        checkAuth();
    }, []); // Empty dependency array means this effect runs once on mount

    return isLoggedIn;
};

export default useAuth;
