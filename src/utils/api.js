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
  if (!imagePath) return '/placeholder-image.png';
  
  // If imagePath contains 'uploads\\', extract the part after it
  const parts = imagePath.split('uploads\\');
  const imagePathFormatted = parts.length > 1 ? parts[1] : imagePath;
  
  return `${API_URL}/uploads/${imagePathFormatted}`;
};

// Export default config for axios
export default {
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
};