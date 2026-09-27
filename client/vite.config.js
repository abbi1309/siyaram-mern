import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                secure: false
            },
            '/uploads': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                secure: false
            }
            // ⚠️ '/images' proxy HATA diya — Vite apne public/ se serve karega
        }
    },
    build: {
        outDir: 'dist',
        assetsDir: 'assets'
    }
});