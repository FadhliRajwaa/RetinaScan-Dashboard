import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  console.log('Environment variables loaded:', {
    VITE_API_URL: env.VITE_API_URL || 'http://localhost:5000',
    VITE_FRONTEND_URL: env.VITE_FRONTEND_URL || 'http://localhost:5173',
  });
  
  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 3000,
    },
    // Expose environment variables to client
    define: {
      'process.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || 'http://localhost:5000'),
      'process.env.VITE_FRONTEND_URL': JSON.stringify(env.VITE_FRONTEND_URL || 'http://localhost:5173'),
    },
  };
});