import { useState, useEffect } from 'react';
import { motion, useMotionTemplate, useMotionValue, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import '../../../src/utils/animation.css';

function Header({ title, toggleMobileMenu, isMobileMenuOpen }) {
  const { theme, isMobile } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const radius = useMotionValue(0);
  
  // Effect untuk mendeteksi scroll
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);
  
  // Efek hover dengan radial gradient
  const background = useMotionTemplate`radial-gradient(${radius}px at ${mouseX}px ${mouseY}px, ${theme.primary}20, transparent 70%)`;
  
  const handleMouseMove = ({ currentTarget, clientX, clientY }) => {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
    radius.set(250);
  };
  
  const resetRadius = () => radius.set(0);
  
  const headerVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: 'spring',
        damping: 20,
        stiffness: 200,
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: 'spring',
        damping: 15,
        stiffness: 200
      }
    }
  };

  // Function to handle click explicitly
  const handleMenuClick = (e) => {
    // Prevent event bubbling
    e.stopPropagation();
    
    // Call the toggle function
    if (typeof toggleMobileMenu === 'function') {
      toggleMobileMenu();
    } else {
      console.error('toggleMobileMenu is not a function!');
    }
  };
  
  return (
    <motion.header 
      variants={headerVariants}
      initial="hidden"
      animate="visible"
      className="mx-2 sm:mx-4 md:mx-6 mb-6 p-3 sm:p-4 md:p-5 flex justify-between items-center sticky top-2 z-45 rounded-xl"
      style={{
        ...(scrolled ? theme.glassEffect : theme.primaryGlassEffect),
        boxShadow: scrolled ? theme.mediumShadow : theme.smallShadow,
        willChange: 'transform, opacity, backdrop-filter',
        transform: 'translateZ(0)',
        transition: theme.transitionNormal
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetRadius}
    >
      <motion.div 
        className="absolute inset-0 rounded-xl pointer-events-none z-0"
        style={{ background }}
      />
      
      <div className="flex items-center relative z-10">
        <motion.div
          variants={itemVariants}
          whileHover={{ 
            scale: 1.05,
            rotate: 3,
            boxShadow: theme.glow
          }}
          whileTap={{ scale: 0.95, rotate: -3 }}
          className="w-12 h-12 rounded-xl mr-4 flex items-center justify-center shadow-md"
          style={{ 
            background: theme.primaryGradient,
            boxShadow: `0 8px 12px -3px ${theme.primary}30`,
            willChange: 'transform',
            transform: 'translateZ(0)'
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={title}
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
              transition={{ duration: 0.3 }}
            >
              {title === 'Scan Retina' ? (
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : title === 'Dashboard' ? (
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h2a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3" />
                </svg>
              ) : title === 'Profile' ? (
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
        <div>
          <motion.h2 
            variants={itemVariants}
            className="text-lg sm:text-xl md:text-2xl font-bold"
            style={{ 
              background: theme.primaryGradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent'
            }}
          >
            {title}
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: '100%' }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="h-1 rounded-full mt-1 max-w-[100px]"
            style={{ 
              background: theme.primaryGradient,
              willChange: 'width, opacity'
            }}
          />
        </div>
      </div>

      {/* Hamburger button in the header for mobile */}
      {isMobile && (
        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleMenuClick}
          className="p-3 rounded-lg text-white shadow-md z-50 relative"
          style={{ 
            background: theme.primaryGradient,
            boxShadow: theme.glow,
            willChange: 'transform',
            transform: 'translateZ(0)',
          }}
          aria-label="Toggle menu"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isMobileMenuOpen ? 'close' : 'open'}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.button>
      )}
    </motion.header>
  );
}

export default Header;