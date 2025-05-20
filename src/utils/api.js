/**
 * API Utility functions
 * Contains common API-related constants and functions
 */

// Get the API URL from environment variables or fallback to localhost
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Get authentication token from local storage
export const getToken = () => localStorage.getItem('token');

// Formats an API endpoint with the correct base URL
export const endpoint = (path) => `${API_URL}${path}`;

// Returns standard authorization headers
export const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`
});

// Formats a full image URL from a relative path
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder-eye.png';
  
  // Jika imagePath sudah lengkap (relatif maupun absolut), gunakan langsung
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Dapatkan hanya nama file, terlepas dari format path
  let filename = imagePath;
  
  // Jika itu adalah path lengkap dengan uploads (dalam format windows atau unix)
  if (imagePath.includes('uploads\\') || imagePath.includes('uploads/')) {
    // Pisahkan berdasarkan 'uploads' dan ambil bagian terakhir
    const parts = imagePath.split(/uploads[\/\\]/);
    if (parts.length > 1) {
      filename = parts[parts.length - 1];
    }
  } else {
    // Jika hanya nama file, gunakan langsung
    // Pisahkan berdasarkan separator terakhir jika ada
    const lastSlashIndex = Math.max(
      imagePath.lastIndexOf('/'), 
      imagePath.lastIndexOf('\\')
    );
    if (lastSlashIndex !== -1) {
      filename = imagePath.substring(lastSlashIndex + 1);
    }
  }
  
  // Pastikan tidak ada backslash di URL (ganti dengan forward slash)
  filename = filename.replace(/\\/g, '/');
  
  return `${API_URL}/uploads/${filename}`;
};

// Export default config for axios
export default {
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
};