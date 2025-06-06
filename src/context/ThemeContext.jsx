import { createContext, useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { globalTheme, animations as sharedAnimations, availableThemes } from '../utils/theme';

// Theme Context
export const ThemeContext = createContext();

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [theme, setTheme] = useState(globalTheme);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentThemeName, setCurrentThemeName] = useState('blue');

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

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedDarkMode = localStorage.getItem('darkMode');
    
    if (savedTheme) {
      try {
        const themeObject = JSON.parse(savedTheme);
        setTheme(themeObject);
      } catch (error) {
        console.error('Error parsing theme from localStorage:', error);
      }
    }

    if (savedDarkMode) {
      setIsDarkMode(savedDarkMode === 'true');
    } else {
      // Cek preferensi sistem
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDarkMode);
    }
    
    // Load theme name
    const savedThemeName = localStorage.getItem('themeName');
    if (savedThemeName) {
      setCurrentThemeName(savedThemeName);
    }
  }, []);

  // Apply dark mode to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDarkMode);
  }, [isDarkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // Update theme
  const updateTheme = (themeName) => {
    const selectedTheme = availableThemes.find(t => t.name === themeName);
    
    if (selectedTheme) {
      const newTheme = {
        ...globalTheme,
        primary: selectedTheme.primary,
        accent: selectedTheme.accent,
        primaryGradient: `linear-gradient(135deg, ${selectedTheme.primary}, ${selectedTheme.accent})`,
      };
      
      setTheme(newTheme);
      setCurrentThemeName(themeName);
      
      // Save to localStorage
      localStorage.setItem('theme', JSON.stringify(newTheme));
      localStorage.setItem('themeName', themeName);
    }
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme: updateTheme, 
      isMobile, 
      isDarkMode, 
      toggleDarkMode,
      currentThemeName
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