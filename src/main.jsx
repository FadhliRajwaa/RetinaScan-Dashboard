import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import './pdf-compat.css'; // Import CSS kompatibilitas PDF
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Menggunakan HashRouter untuk mengatasi masalah routing di static hosting
// HashRouter menambahkan # di URL (contoh: https://example.com/#/dashboard)
// Ini lebih handal untuk static hosting seperti Render.com dan mencegah 404 saat refresh

// Cek token dan redirect ke login jika tidak ada
const token = localStorage.getItem('token');
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';

if (!token) {
  window.location.href = `${FRONTEND_URL}/#/login?redirect=dashboard`;
} else {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ThemeProvider>
        <HashRouter>
          <App />
          <ToastContainer 
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </HashRouter>
      </ThemeProvider>
    </React.StrictMode>,
  );
}