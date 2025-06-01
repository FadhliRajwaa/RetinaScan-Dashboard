import { createContext, useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { globalTheme, animations as sharedAnimations } from '../utils/theme';

// Theme Context
export const ThemeContext = createContext();

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [theme, setTheme] = useState({
    ...globalTheme,
    animations: sharedAnimations // Pastikan animations tersedia di theme
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Cek localStorage untuk preferensi tema yang tersimpan
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  
  // Efek untuk mengubah tema berdasarkan mode gelap/terang
  useEffect(() => {
    // Simpan preferensi ke localStorage
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    
    // Terapkan class dark ke body jika dark mode aktif
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Update tema berdasarkan mode
    setTheme(prevTheme => ({
      ...prevTheme,
      // Tema akan diupdate dari theme.js berdasarkan mode
      ...(isDarkMode ? globalTheme.dark : globalTheme.light),
      animations: sharedAnimations // Pastikan animations tetap tersedia setelah update
    }));
  }, [isDarkMode]);

  // Toggle dark/light mode
  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

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
    <ThemeContext.Provider value={{ 
      theme: {
        ...theme,
        animations: sharedAnimations // Pastikan animations selalu tersedia di context
      }, 
      setTheme, 
      isMobile, 
      isDarkMode, 
      toggleDarkMode 
    }}>
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
    const { isDarkMode } = useTheme();
    
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
        className={isDarkMode ? 'dark' : ''}
      >
        <Component {...props} />
      </motion.div>
    );
  };
};

// Export animations dari tema bersama
export const animations = sharedAnimations; 