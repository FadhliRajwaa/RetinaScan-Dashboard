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
  
  console.log('Original imagePath:', imagePath);
  
  // Handle various formats of image paths
  let finalPath = imagePath;
  
  // If the path already has the full URL structure, use it directly
  if (finalPath.startsWith('http')) {
    console.log('Path is already a URL:', finalPath);
    return finalPath;
  }
  
  // Extract just the filename in various path formats
  // Handle Windows paths (backslashes)
  if (finalPath.includes('\\')) {
    const parts = finalPath.split('\\');
    finalPath = parts[parts.length - 1];
  }
  
  // Handle Unix paths (forward slashes)
  if (finalPath.includes('/')) {
    const parts = finalPath.split('/');
    finalPath = parts[parts.length - 1];
  }
  
  // Always replace backslashes with forward slashes
  finalPath = finalPath.replace(/\\/g, '/');
  
  // Remove any leading slashes to avoid double slashes in the URL
  finalPath = finalPath.replace(/^\/+/, '');
  
  const fullUrl = `${API_URL}/uploads/${finalPath}`;
  console.log('Generated image URL:', fullUrl);
  
  return fullUrl;
};

// Export default config for axios
export default {
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
};