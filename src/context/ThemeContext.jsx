import React, { createContext, useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { globalTheme, animations as sharedAnimations } from '../utils/theme';

// Default theme
const defaultTheme = {
  primary: '#3b82f6', // blue-500
  secondary: '#818cf8', // indigo-400
  accent: '#06b6d4', // cyan-500
  textColor: '#334155', // slate-700
  backgroundColor: '#ffffff', // white
  isDark: false,
  chartColors: {
    low: '#8ECAE6',
    medium: '#219EBC',
    high: '#023E8A',
    veryHigh: '#03045E'
  }
};

// Create context
const ThemeContext = createContext();

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // Try to get theme from localStorage
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('dashboard-theme');
    if (savedTheme) {
      try {
        return JSON.parse(savedTheme);
      } catch (e) {
        console.error('Error parsing theme from localStorage:', e);
        return defaultTheme;
      }
    }
    return defaultTheme;
  });
  
  // Update body class when theme changes
  useEffect(() => {
    if (theme.isDark) {
      document.body.classList.add('dark');
      document.documentElement.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
      document.documentElement.classList.remove('dark');
    }
  }, [theme.isDark]);
  
  // Update CSS variables for theme colors
  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', theme.primary);
    document.documentElement.style.setProperty('--color-secondary', theme.secondary);
    document.documentElement.style.setProperty('--color-accent', theme.accent);
    document.documentElement.style.setProperty('--color-text', theme.textColor);
    document.documentElement.style.setProperty('--color-background', theme.backgroundColor);
    
    // Chart colors
    document.documentElement.style.setProperty('--chart-color-low', theme.chartColors.low);
    document.documentElement.style.setProperty('--chart-color-medium', theme.chartColors.medium);
    document.documentElement.style.setProperty('--chart-color-high', theme.chartColors.high);
    document.documentElement.style.setProperty('--chart-color-very-high', theme.chartColors.veryHigh);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
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

export default ThemeContext; 