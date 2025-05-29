import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  
  // Predefined themes
  const themes = [
    {
      name: 'Default Blue',
      primary: '#3b82f6',
      secondary: '#818cf8',
      accent: '#06b6d4',
      textColor: '#334155',
      backgroundColor: '#ffffff',
      chartColors: {
        low: '#8ECAE6',
        medium: '#219EBC',
        high: '#023E8A',
        veryHigh: '#03045E'
      }
    },
    {
      name: 'Purple Dream',
      primary: '#8b5cf6',
      secondary: '#c084fc',
      accent: '#d946ef',
      textColor: '#334155',
      backgroundColor: '#ffffff',
      chartColors: {
        low: '#C9B6E4',
        medium: '#9B72CF',
        high: '#7251B5',
        veryHigh: '#4C2A85'
      }
    },
    {
      name: 'Emerald Green',
      primary: '#10b981',
      secondary: '#34d399',
      accent: '#06d6a0',
      textColor: '#334155',
      backgroundColor: '#ffffff',
      chartColors: {
        low: '#80CFBB',
        medium: '#40B093',
        high: '#2A9D8F',
        veryHigh: '#006466'
      }
    },
    {
      name: 'Sunset Orange',
      primary: '#f97316',
      secondary: '#fb923c',
      accent: '#f59e0b',
      textColor: '#334155',
      backgroundColor: '#ffffff',
      chartColors: {
        low: '#FFCB77',
        medium: '#FE9F5B',
        high: '#F27059',
        veryHigh: '#D62246'
      }
    },
    {
      name: 'Dark Mode',
      primary: '#60a5fa',
      secondary: '#93c5fd',
      accent: '#38bdf8',
      textColor: '#e2e8f0',
      backgroundColor: '#1e293b',
      chartColors: {
        low: '#7DD3FC',
        medium: '#38BDF8',
        high: '#0284C7',
        veryHigh: '#075985'
      },
      isDark: true
    }
  ];
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.theme-switcher')) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  // Apply theme
  const applyTheme = (selectedTheme) => {
    setTheme(selectedTheme);
    setIsOpen(false);
    
    // Save to localStorage
    localStorage.setItem('dashboard-theme', JSON.stringify(selectedTheme));
  };
  
  // Animation variants
  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      y: -10, 
      scale: 0.95,
      transition: {
        duration: 0.15,
        ease: "easeIn"
      }
    }
  };
  
  // Get current theme name
  const getCurrentThemeName = () => {
    const currentTheme = themes.find(t => 
      t.primary === theme.primary && 
      t.secondary === theme.secondary
    );
    
    return currentTheme ? currentTheme.name : 'Custom Theme';
  };

  return (
    <div className="theme-switcher relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleDropdown}
        className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
        style={{
          background: theme.isDark ? '#1e293b' : '#ffffff',
          color: theme.isDark ? '#e2e8f0' : '#334155',
          borderColor: theme.isDark ? '#475569' : '#e2e8f0'
        }}
      >
        <div className="flex items-center space-x-2 mr-2">
          <span 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: theme.primary }}
          ></span>
          <span 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: theme.secondary }}
          ></span>
          <span 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: theme.accent }}
          ></span>
        </div>
        <span className="font-medium">{getCurrentThemeName()}</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-4 w-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg overflow-hidden z-10 border border-gray-200"
            style={{
              background: theme.isDark ? '#1e293b' : '#ffffff',
              borderColor: theme.isDark ? '#475569' : '#e2e8f0'
            }}
          >
            <div className="p-3 border-b border-gray-200" style={{ borderColor: theme.isDark ? '#475569' : '#e2e8f0' }}>
              <h3 className="text-sm font-medium" style={{ color: theme.isDark ? '#e2e8f0' : '#334155' }}>
                Pilih Tema
              </h3>
            </div>
            <div className="p-2 max-h-60 overflow-y-auto">
              {themes.map((themeOption, index) => (
                <motion.button
                  key={index}
                  whileHover={{ 
                    backgroundColor: themeOption.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' 
                  }}
                  onClick={() => applyTheme(themeOption)}
                  className={`w-full flex items-center p-2 rounded-md ${
                    theme.primary === themeOption.primary && theme.secondary === themeOption.secondary
                      ? themeOption.isDark ? 'bg-gray-700' : 'bg-blue-50'
                      : ''
                  }`}
                >
                  <div className="flex items-center space-x-1 mr-2">
                    <span 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: themeOption.primary }}
                    ></span>
                    <span 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: themeOption.secondary }}
                    ></span>
                    <span 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: themeOption.accent }}
                    ></span>
                  </div>
                  <span 
                    className="text-sm font-medium"
                    style={{ 
                      color: theme.isDark ? '#e2e8f0' : '#334155'
                    }}
                  >
                    {themeOption.name}
                  </span>
                  {theme.primary === themeOption.primary && theme.secondary === themeOption.secondary && (
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4 ml-auto" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                      style={{ color: themeOption.primary }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSwitcher; 