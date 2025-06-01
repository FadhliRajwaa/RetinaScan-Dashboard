import { createContext, useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { lightTheme, darkTheme, animations as sharedAnimations } from '../utils/theme';

// Theme Context
export const ThemeContext = createContext();

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Cek preferensi tema dari localStorage atau preferensi sistem
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Jika tidak ada preferensi tersimpan, gunakan preferensi sistem
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  const [theme, setTheme] = useState(isDarkMode ? darkTheme : lightTheme);

  // Fungsi untuk toggle tema
  const toggleTheme = () => {
    const newIsDarkMode = !isDarkMode;
    setIsDarkMode(newIsDarkMode);
    localStorage.setItem('theme', newIsDarkMode ? 'dark' : 'light');
  };

  // Update tema ketika isDarkMode berubah
  useEffect(() => {
    setTheme(isDarkMode ? darkTheme : lightTheme);
    
    // Update class pada document.documentElement untuk styling global
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Deteksi perangkat mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isMobile, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook untuk menggunakan theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// HOC untuk mendukung animasi page transition
export const withPageTransition = (Component) => {
  return (props) => {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ 
          duration: 0.2,
          ease: "easeOut" 
        }}
        style={{ 
          willChange: 'opacity',
          transform: 'translateZ(0)'
        }}
      >
        <Component {...props} />
      </motion.div>
    );
  };
};

// Export animations dari tema bersama
export const animations = sharedAnimations; 