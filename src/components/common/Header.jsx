import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';
import { BellIcon, Cog6ToothIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import NotificationCenter from '../notifications/NotificationCenter';
import axios from 'axios';

function Header({ title, toggleMobileMenu, isMobileMenuOpen }) {
  const { theme, isMobile, isDarkMode } = useTheme();
  const { 
    unreadCount, 
    isNotificationOpen, 
    toggleNotification, 
    closeNotification 
  } = useNotification();
  
  const [userInitial, setUserInitial] = useState('A');
  const [userName, setUserName] = useState('');
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await axios.get(`${API_URL}/api/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data) {
          const name = response.data.fullName || response.data.name || '';
          setUserName(name);
          if (name) {
            setUserInitial(name.charAt(0).toUpperCase());
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    
    fetchUserProfile();
  }, []);
  
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

  // Animasi untuk badge notifikasi
  const badgeVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 15
      }
    },
    exit: { 
      scale: 0, 
      opacity: 0,
      transition: {
        duration: 0.2
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

  // Glassmorphism style
  const glassEffect = {
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
  };
  
  return (
    <>
      <motion.header 
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="mx-2 sm:mx-4 md:mx-6 mb-6 p-4 sm:p-5 flex justify-between items-center sticky top-2 z-50 rounded-xl"
        style={{
          ...glassEffect,
          willChange: 'transform, opacity',
          transform: 'translateZ(0)',
          position: 'sticky'
        }}
      >
        <div className="flex items-center">
          <motion.div
            variants={itemVariants}
            whileHover={{ 
              scale: 1.05,
              rotate: 3,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)'
            }}
            whileTap={{ scale: 0.95, rotate: -3 }}
            className="w-12 h-12 rounded-xl mr-4 flex items-center justify-center shadow-lg"
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
            ) : title === 'Settings' ? (
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
                background: `linear-gradient(to right, ${theme.primary}, ${theme.accent})`,
                willChange: 'width, opacity'
              }}
            />
          </div>
        </div>

        {/* Header Actions */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="hidden md:flex items-center space-x-3"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg bg-white/50 hover:bg-white/80 transition-colors duration-200 relative"
            onClick={toggleNotification}
            aria-label="Notifikasi"
          >
            <BellIcon className="h-5 w-5 text-gray-600" />
            
            {/* Badge Notifikasi */}
            {unreadCount > 0 && (
              <motion.div
                variants={badgeVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                style={{
                  minWidth: '18px',
                  height: '18px',
                  padding: unreadCount > 9 ? '0 4px' : '0'
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </motion.div>
            )}
          </motion.button>
          
          <Link to="/settings">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-white/50 hover:bg-white/80 transition-colors duration-200"
              aria-label="Pengaturan"
            >
              <Cog6ToothIcon className="h-5 w-5 text-gray-600" />
            </motion.button>
          </Link>
          
          <Link to="/profile">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-1 rounded-lg bg-white/50 hover:bg-white/80 transition-colors duration-200"
            >
              <div 
                className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium"
                title={userName || 'Profil Pengguna'}
              >
                {userInitial}
              </div>
            </motion.div>
          </Link>
        </motion.div>

        {/* Hamburger button in the header for mobile */}
        {isMobile && (
          <div className="flex items-center space-x-2">
            {/* Notification Button for Mobile */}
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleNotification}
              className="p-2 rounded-lg bg-white/50 hover:bg-white/80 transition-colors duration-200 relative"
              aria-label="Notifikasi"
            >
              <BellIcon className="h-5 w-5 text-gray-600" />
              
              {/* Badge Notifikasi */}
              {unreadCount > 0 && (
                <motion.div
                  variants={badgeVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                  style={{
                    minWidth: '18px',
                    height: '18px',
                    padding: unreadCount > 9 ? '0 4px' : '0'
                  }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </motion.div>
              )}
            </motion.button>
            
            {/* Profile Button for Mobile */}
            <Link to="/profile">
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-1 rounded-lg bg-white/50 hover:bg-white/80 transition-colors duration-200"
              >
                <div 
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium"
                  title={userName || 'Profil Pengguna'}
                >
                  {userInitial}
                </div>
              </motion.div>
            </Link>
            
            {/* Settings Button for Mobile */}
            <Link to="/settings">
              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-white/50 hover:bg-white/80 transition-colors duration-200"
                aria-label="Pengaturan"
              >
                <Cog6ToothIcon className="h-5 w-5 text-gray-600" />
              </motion.button>
            </Link>
            
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleMenuClick}
              className="p-3 rounded-lg text-white shadow-lg z-50"
              style={{ 
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
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
          </div>
        )}
      </motion.header>
      
      {/* Notification Center */}
      <NotificationCenter isOpen={isNotificationOpen} onClose={closeNotification} />
    </>
  );
}

export default Header;