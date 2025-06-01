import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { BellIcon, Cog6ToothIcon, UserCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

function Header({ title, toggleMobileMenu, isMobileMenuOpen }) {
  const { theme, isMobile } = useTheme();
  
  const headerVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 30,
        duration: 0.3,
        staggerChildren: 0.05,
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
        stiffness: 300,
        damping: 30,
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
      className="mx-2 sm:mx-4 md:mx-6 mb-6 p-4 sm:p-5 flex justify-between items-center sticky top-2 z-45 rounded-xl glass-effect"
      style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        willChange: 'transform, opacity',
        transform: 'translateZ(0)'
      }}
    >
      <div className="flex items-center">
        <motion.div
          variants={itemVariants}
          whileHover={{ 
            scale: 1.05,
            rotate: 3,
            boxShadow: '0 15px 30px -10px rgba(79, 70, 229, 0.3)'
          }}
          whileTap={{ scale: 0.95, rotate: -3 }}
          className="w-12 h-12 rounded-xl mr-4 flex items-center justify-center shadow-lg"
          style={{ 
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
            boxShadow: `0 10px 15px -3px ${theme.primary}30`,
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
            className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800"
          >
            {title}
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: '100%' }}
            transition={{ 
              delay: 0.2, 
              duration: 0.5,
              type: 'spring',
              stiffness: 300,
              damping: 30
            }}
            className="h-1 rounded-full mt-1 max-w-[120px]"
            style={{ 
              background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})`,
              willChange: 'width, opacity'
            }}
          />
        </div>
      </div>

      {/* Search Bar - New Addition */}
      <motion.div 
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: 'auto' }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="hidden md:flex items-center relative mx-4 flex-1 max-w-md"
      >
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white/50 backdrop-blur-sm text-gray-700 transition-all duration-300"
            placeholder="Cari..."
          />
        </div>
      </motion.div>

      {/* Header Actions */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="hidden md:flex items-center space-x-3"
      >
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-lg bg-white hover:bg-gray-50 shadow-sm hover:shadow transition-all duration-200 relative"
        >
          <BellIcon className="h-5 w-5 text-gray-600" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">2</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-lg bg-white hover:bg-gray-50 shadow-sm hover:shadow transition-all duration-200"
        >
          <Cog6ToothIcon className="h-5 w-5 text-gray-600" />
        </motion.button>
        <motion.div
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="p-1 rounded-lg bg-white hover:bg-gray-50 shadow-sm hover:shadow transition-all duration-200"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white font-medium">
            A
          </div>
        </motion.div>
      </motion.div>

      {/* Hamburger button in the header for mobile */}
      {isMobile && (
        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleMenuClick}
          className="p-3 rounded-xl text-white shadow-lg z-50"
          style={{ 
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
            boxShadow: '0 10px 20px -5px rgba(79, 70, 229, 0.3)',
            willChange: 'transform',
            transform: 'translateZ(0)',
            position: 'relative' // Ensure it's above other elements
          }}
          aria-label="Toggle menu"
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
        </motion.button>
      )}
    </motion.header>
  );
}

export default Header;