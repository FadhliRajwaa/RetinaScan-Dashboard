import { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { globalTheme, animations as sharedAnimations } from '../utils/theme';

// Theme Context
export const ThemeContext = createContext();

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [theme, setTheme] = useState(globalTheme);
  const [pageTransitionKey, setPageTransitionKey] = useState(0);
  const [transitionDirection, setTransitionDirection] = useState(1); // 1: forward, -1: backward

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

  // Fungsi untuk memicu transisi halaman
  const triggerPageTransition = (direction = 1) => {
    setTransitionDirection(direction);
    setPageTransitionKey(prev => prev + 1);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      isMobile, 
      pageTransitionKey, 
      triggerPageTransition,
      transitionDirection 
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

// Efek transisi halaman yang tersedia
const pageTransitionEffects = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, ease: "easeInOut" }
  },
  slideX: (direction) => ({
    initial: { opacity: 0, x: direction * 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: direction * -50 },
    transition: { type: "spring", stiffness: 300, damping: 30 }
  }),
  slideY: (direction) => ({
    initial: { opacity: 0, y: direction * 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: direction * -30 },
    transition: { type: "spring", stiffness: 300, damping: 30 }
  }),
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { type: "spring", stiffness: 300, damping: 30 }
  },
  flip: (direction) => ({
    initial: { opacity: 0, rotateY: direction * 90 },
    animate: { opacity: 1, rotateY: 0 },
    exit: { opacity: 0, rotateY: direction * -45 },
    transition: { type: "spring", stiffness: 300, damping: 30 }
  }),
  blur: {
    initial: { opacity: 0, filter: "blur(8px)" },
    animate: { opacity: 1, filter: "blur(0px)" },
    exit: { opacity: 0, filter: "blur(8px)" },
    transition: { duration: 0.3, ease: "easeInOut" }
  }
};

// HOC untuk mendukung animasi page transition
export const withPageTransition = (Component, effectName = "slideX") => {
  return (props) => {
    const { transitionDirection } = useTheme();
    
    // Pilih efek transisi berdasarkan nama
    const getTransitionProps = () => {
      const effect = pageTransitionEffects[effectName];
      if (typeof effect === 'function') {
        return effect(transitionDirection);
      }
      return effect;
    };

    const transitionProps = getTransitionProps();

    return (
      <motion.div
        initial={transitionProps.initial}
        animate={transitionProps.animate}
        exit={transitionProps.exit}
        transition={transitionProps.transition}
        style={{ 
          willChange: 'transform, opacity',
          transform: 'translateZ(0)',
          position: 'relative',
          width: '100%',
          height: '100%'
        }}
      >
        <Component {...props} />
      </motion.div>
    );
  };
};

// Export animations dari tema bersama
export const animations = sharedAnimations; 