import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api'
});

// Request interceptor for adding the bearer token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || 'Something went wrong';
        
        if (error.response?.status === 401) {
            // Unauthorized - could trigger a logout here
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // window.location.href = '/login';
        }

        console.error('API Error:', message);
        return Promise.reject(error);
    }
);

export default api;
