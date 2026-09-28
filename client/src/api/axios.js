import axios from 'axios';

// ============================================
// BASE URL LOGIC
// Local:    '/api' → Vite proxy → localhost:5000
// Vercel:   VITE_API_URL + '/api' → Render backend
// ============================================

const getBaseURL = () => {
    const envURL = import.meta.env.VITE_API_URL;

    // Agar VITE_API_URL set nahi hai (local dev)
    // to '/api' use karo — Vite proxy handle karega
    if (!envURL) {
        return '/api';
    }

    // Agar URL already '/api' pe khatam ho raha hai
    // to duplicate mat lagao
    const cleanURL = envURL.replace(/\/$/, ''); // trailing slash hatao

    if (cleanURL.endsWith('/api')) {
        return cleanURL;
    }

    // Warna '/api' add karo
    return `${cleanURL}/api`;
};

const API = axios.create({
    baseURL: getBaseURL(),
    headers: { 'Content-Type': 'application/json' },
});

// ============================================
// REQUEST INTERCEPTOR — Token attach karo
// ============================================
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ============================================
// RESPONSE INTERCEPTOR — 401 handle karo
// ============================================
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (!window.location.hash.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default API;