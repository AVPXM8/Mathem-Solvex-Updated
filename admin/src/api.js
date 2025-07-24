import axios from 'axios';

// This is the final, correct configuration for your API handler.
const api = axios.create({
  // 1. It checks for a special VITE_API_BASE_URL variable, which we will set on Vercel.
  // 2. It appends the '/api' prefix here, in one central place.
  // 3. If it doesn't find the variable (on your local computer), it falls back to your local server.
  baseURL: (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001') + '/api'
});

// This "interceptor" automatically adds your login token to secure requests.
// This logic is correct and does not need to change.
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