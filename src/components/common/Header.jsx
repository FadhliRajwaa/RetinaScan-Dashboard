import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

function Header({ title, toggleMobileMenu, isMobileMenuOpen }) {
  const { theme, isMobile } = useTheme();
  
  const headerVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: 'spring',
        damping: 20,
        stiffness: 100,
        duration: 0.4,
        staggerChildren: 0.07,
        delayChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: -15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: 'spring',
        damping: 20,
        stiffness: 100,
        duration: 0.3
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
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.6)',
        willChange: 'transform, opacity',
        transform: 'translateZ(0)'
      }}
    >
      <div className="flex items-center">
        <motion.div
          variants={itemVariants}
          whileHover={{ 
            scale: 1.08,
            rotate: 5,
            boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.15)'
          }}
          whileTap={{ scale: 0.92, rotate: -5 }}
          className="w-12 h-12 rounded-xl mr-4 flex items-center justify-center"
          style={{ 
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
            boxShadow: `0 10px 15px -3px ${theme.primary}40`,
            willChange: 'transform',
            transform: 'translateZ(0)'
          }}
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
        <div>
          <motion.h2 
            variants={itemVariants}
            className="text-lg sm:text-xl md:text-2xl font-bold"
            style={{
              background: `linear-gradient(135deg, ${theme.text}, ${theme.primary})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {title}
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: '100%' }}
            transition={{ delay: 0.3, duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
            className="h-1 rounded-full mt-1 max-w-[120px]"
            style={{ 
              background: `linear-gradient(to right, ${theme.primary}, ${theme.accent})`,
              boxShadow: `0 2px 6px ${theme.primary}40`,
              willChange: 'width, opacity'
            }}
          />
        </div>
      </div>

      {/* Animated decorative elements */}
      <motion.div
        className="absolute top-0 right-0 w-32 h-32 -z-10 opacity-20"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        style={{
          background: `radial-gradient(circle, ${theme.accent}80, transparent 70%)`,
          filter: 'blur(20px)',
          borderRadius: '50%',
          transform: 'translate(30%, -30%)',
        }}
      />
      
      <motion.div
        className="absolute bottom-0 left-0 w-24 h-24 -z-10 opacity-20"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ delay: 0.6, duration: 1 }}
        style={{
          background: `radial-gradient(circle, ${theme.primary}80, transparent 70%)`,
          filter: 'blur(20px)',
          borderRadius: '50%',
          transform: 'translate(-30%, 30%)',
        }}
      />

      {/* Hamburger button in the header for mobile */}
      {isMobile && (
        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.05, boxShadow: '0 8px 15px rgba(0, 0, 0, 0.1)' }}
          whileTap={{ scale: 0.95 }}
          onClick={handleMenuClick}
          className="p-3 rounded-lg text-white shadow-md z-50"
          style={{ 
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
            willChange: 'transform',
            transform: 'translateZ(0)',
            position: 'relative' // Ensure it's above other elements
          }}
          aria-label="Toggle menu"
        >
          <AnimatePresence mode="wait">
            {isMobileMenuOpen ? (
              <motion.svg 
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </motion.svg>
            ) : (
              <motion.svg 
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.button>
      )}
    </motion.header>
  );
}

export default Header;