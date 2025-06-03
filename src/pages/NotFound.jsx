import React from 'react';
import { Link } from 'react-router-dom';
import { withPageTransition } from '../context/ThemeContext';

function NotFoundComponent() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">Halaman Tidak Ditemukan</h2>
      <p className="text-gray-600 mb-8 max-w-md">
        Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah dipindahkan.
      </p>
      <Link 
        to="/" 
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Kembali ke Dashboard
      </Link>
    </div>
  );
}

const NotFound = withPageTransition(NotFoundComponent);
export default NotFound; 