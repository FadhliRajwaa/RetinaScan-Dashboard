import { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { globalTheme, animations as sharedAnimations } from '../utils/theme';

// Theme Context
export const ThemeContext = createContext();

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [theme, setTheme] = useState(globalTheme);
  const [pageTransitionVariant, setPageTransitionVariant] = useState('fade');

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

  // Fungsi untuk mengubah variasi transisi halaman
  const changePageTransition = (variant) => {
    if (['fade', 'slide', 'scale', 'flip', 'none'].includes(variant)) {
      setPageTransitionVariant(variant);
    } else {
      setPageTransitionVariant('fade');
    }
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      isMobile, 
      pageTransitionVariant,
      changePageTransition 
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

// Variasi animasi transisi halaman
const pageTransitions = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, ease: "easeInOut" }
  },
  slide: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.4, ease: "easeInOut" }
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 },
    transition: { duration: 0.4, ease: [0.19, 1.0, 0.22, 1.0] }
  },
  flip: {
    initial: { opacity: 0, rotateY: 10 },
    animate: { opacity: 1, rotateY: 0 },
    exit: { opacity: 0, rotateY: -10 },
    transition: { duration: 0.5, ease: "easeOut" }
  },
  none: {
    initial: {},
    animate: {},
    exit: {},
    transition: {}
  }
};

// HOC untuk mendukung animasi page transition
export const withPageTransition = (Component) => {
  return (props) => {
    const { pageTransitionVariant = 'fade' } = useTheme();
    const variants = pageTransitions[pageTransitionVariant] || pageTransitions.fade;
    
    return (
      <motion.div
        initial={variants.initial}
        animate={variants.animate}
        exit={variants.exit}
        transition={variants.transition}
        style={{ 
          willChange: 'opacity, transform',
          transform: 'translateZ(0)',
          perspective: '1000px',
          backfaceVisibility: 'hidden'
        }}
      >
        <Component {...props} />
      </motion.div>
    );
  };
};

// Wrapper component untuk mengelola transisi antar route
export const PageTransitionWrapper = ({ children }) => {
  return (
    <AnimatePresence mode="wait">
      {children}
    </AnimatePresence>
  );
};

// Export animations dari tema bersama
export const animations = {
  ...sharedAnimations,
  pageTransitions
}; 