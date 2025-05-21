/**
 * Utility function to safely logout from dashboard
 * @param {string} frontendUrl - URL of the frontend to redirect to
 * @returns {Promise<void>}
 */
export const safeLogout = async (frontendUrl) => {
  try {
    console.group('Logout Process');
    console.log('Starting logout process...');
    
    // Step 1: Clear localStorage
    console.log('Step 1: Clearing localStorage');
    localStorage.removeItem('token');
    
    // Step 2: Clear sessionStorage
    console.log('Step 2: Clearing sessionStorage');
    sessionStorage.clear();
    
    // Step 3: Prepare redirect URL with correct HashRouter format
    const timestamp = Date.now();
    // Pastikan URL menggunakan format yang benar untuk HashRouter: frontendUrl/#/?logout=true
    const logoutUrl = `${frontendUrl}/#/?logout=true&from=dashboard&t=${timestamp}`;
    console.log('Step 3: Prepared redirect URL', logoutUrl);
    
    // Step 4: Perform redirect
    console.log('Step 4: Performing redirect...');
    
    // Use timeout to ensure console logs are printed
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('Redirecting to:', logoutUrl);
    console.groupEnd();
    
    // Use location.replace to prevent back button from returning to dashboard
    window.location.replace(logoutUrl);
    
    // Fallback if replace doesn't work
    setTimeout(() => {
      console.log('Fallback redirect');
      window.location.href = logoutUrl;
    }, 200);
    
    return true;
  } catch (error) {
    console.error('Error during logout:', error);
    
    // Emergency fallback
    try {
      window.location.href = `${frontendUrl}/#/?logout=true&error=true`;
    } catch (e) {
      console.error('Critical error during logout redirect:', e);
    }
    
    return false;
  }
};

/**
 * Utility function to handle logout events
 * @param {Event} e - Event object
 * @param {Function} callback - Optional callback after logout
 * @param {string} frontendUrl - URL of the frontend to redirect to
 */
export const handleLogoutEvent = (e, callback, frontendUrl) => {
  // Prevent default behavior
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  // Execute callback if provided
  if (typeof callback === 'function') {
    callback();
  }
  
  // Perform logout
  safeLogout(frontendUrl);
};