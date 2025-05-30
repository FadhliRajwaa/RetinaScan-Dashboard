import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import './pdf-compat.css'; // Import CSS kompatibilitas PDF
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Menggunakan HashRouter untuk mengatasi masalah routing di static hosting
// HashRouter menambahkan # di URL (contoh: https://example.com/#/dashboard)
// Ini lebih handal untuk static hosting seperti Render.com dan mencegah 404 saat refresh

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <ThemeProvider>
        <App />
        <ToastContainer position="top-right" autoClose={3000} />
      </ThemeProvider>
    </HashRouter>
  </React.StrictMode>
);