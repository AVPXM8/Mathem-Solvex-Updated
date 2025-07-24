import axios from 'axios';

// This creates a central instance of axios for your entire app.
// By setting the baseURL to '/api', all requests will automatically go
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
});

// This "interceptor" automatically adds your login token to every secure request.
// This logic does not need to change.
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
