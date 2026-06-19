import axios from 'axios';

export const apiClient = axios.create({
    baseURL: 'http://localhost:8080',
    timeout: 8000,
    headers: {
        'Content-Type': 'application/json'
    }
});

apiClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        // Safely extract Quarkus text or JSON validation errors
        const fallbackMessage = 'An unexpected server error occurred.';
        let cleanMessage = fallbackMessage;

        if (error.response) {
            cleanMessage = typeof error.response.data === 'string'
                ? error.response.data
                : (error.response.data?.message || fallbackMessage);
        } else if (error.request) {
            cleanMessage = 'No response received from backend. Check if service is running.';
        }

        return Promise.reject(new Error(cleanMessage));
    }
);