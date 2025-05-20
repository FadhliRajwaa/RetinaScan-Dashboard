import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Gunakan HashRouter saat di production untuk menghindari masalah routing pada server static
// BrowserRouter memerlukan konfigurasi server side untuk menangani routing
const Router = import.meta.env.PROD ? HashRouter : BrowserRouter;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <ThemeProvider>
        <App />
        <ToastContainer position="top-right" autoClose={3000} />
      </ThemeProvider>
    </Router>
  </React.StrictMode>
);