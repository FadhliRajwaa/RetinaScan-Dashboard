import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { safeLogout, handleLogoutEvent } from '../../utils/logoutHelper';
import {
  HomeIcon,
  UserIcon,
  EyeIcon,
  ClockIcon,
  ArrowLeftOnRectangleIcon,
  ArrowLeftCircleIcon,
  Cog6ToothIcon,
  BellIcon
} from '@heroicons/react/24/outline';

// Environment variables
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';

const menuItems = [
  { name: 'Dashboard', path: '/', icon: HomeIcon },
  { name: 'Data Pasien', path: '/patient-data', icon: UserIcon },
  { name: 'Scan Retina', path: '/scan-retina', icon: EyeIcon },
  { name: 'History', path: '/history', icon: ClockIcon },
  { 
    name: 'Kembali ke Beranda', 
    path: FRONTEND_URL,
    icon: ArrowLeftCircleIcon,
    external: true
  },
];

function Sidebar({ toggleMobileMenu, isMobileMenuOpen }) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);
  const location = useLocation();
  const { theme } = useTheme();
  
  // Set active index based on current location
  useEffect(() => {
    const index = menuItems.findIndex(item => item.path === location.pathname);
    setActiveIndex(index >= 0 ? index : null);
  }, [location.pathname]);

  const handleLogout = async () => {
    console.log('Logging out from dashboard');
    
    try {
      // Gunakan helper function untuk logout yang lebih aman
      await safeLogout(FRONTEND_URL);
    } catch (error) {
      console.error('Error during logout:', error);
      // Fallback jika terjadi error
      alert('Terjadi kesalahan saat logout. Mencoba metode alternatif...');
      window.location.href = `${FRONTEND_URL}/#/?logout=true&from=dashboard&error=true`;
    }
  };

  // Modern animation variants with spring physics for smoother motion
  const sidebarVariants = {
    open: { 
      width: '280px', 
      transition: { 
        type: 'spring',
        stiffness: 400,
        damping: 40,
        mass: 1.2,
        duration: 0.4
      } 
    },
    closed: { 
      width: '80px', 
      transition: { 
        type: 'spring',
        stiffness: 400,
        damping: 40,
        mass: 1.2,
        duration: 0.4
      } 
    },
    mobileOpen: { 
      x: 0, 
      opacity: 1, 
      transition: { 
        type: 'spring',
        stiffness: 400,
        damping: 40,
        mass: 1.2,
        duration: 0.4
      } 
    },
    mobileClosed: { 
      x: '-100%', 
      opacity: 0, 
      transition: { 
        type: 'spring',
        stiffness: 400,
        damping: 40,
        mass: 1.2,
        duration: 0.4
      } 
    },
  };

  const menuItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { 
        type: 'spring',
        stiffness: 400,
        damping: 40,
        mass: 1,
        delay: i * 0.05, 
        duration: 0.3
      },
    }),
  };

  // Modern white glassmorphism style with subtle gradient
  const glassEffect = {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    borderRight: '1px solid rgba(255, 255, 255, 0.18)',
  };

  // Subtle gradient overlay for active items
  const activeItemBg = `linear-gradient(135deg, ${theme.primary}20, ${theme.primary}40)`;
  const hoverItemBg = `rgba(255, 255, 255, 0.8)`;

  return (
    <>
      {/* Overlay for Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-md z-40"
            onClick={toggleMobileMenu}
            style={{ willChange: 'opacity' }}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial="mobileClosed"
        animate={isMobileMenuOpen ? 'mobileOpen' : 'mobileClosed'}
        className="lg:hidden fixed top-0 left-0 h-screen text-gray-800 w-[280px] z-50 overflow-hidden"
        style={{ 
          ...glassEffect,
          willChange: 'transform, opacity',
          transform: 'translateZ(0)'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header: Logo and Close Button */}
          <motion.div 
            className="p-5 flex items-center justify-between"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4, type: 'spring', stiffness: 400, damping: 40 }}
          >
            <motion.div
              initial={{ x: -15, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4, type: 'spring', stiffness: 400, damping: 40 }}
              className="flex flex-col"
            >
              <h1 className="text-2xl font-extrabold tracking-tight"
                  style={{
                    background: `linear-gradient(90deg, ${theme.primary}, ${theme.accent})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>RetinaScan</h1>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 120 }}
                transition={{ delay: 0.2, duration: 0.5, type: 'spring', stiffness: 400, damping: 40 }}
                className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-1"
                style={{ willChange: 'width' }}
              />
            </motion.div>
            <motion.button
              onClick={toggleMobileMenu}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9, rotate: -5 }}
              className="p-2 rounded-full"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                willChange: 'transform'
              }}
            >
              <svg className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </motion.div>
          
          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto py-4 px-3">
            {menuItems.map((item, i) => {
              const isActive = activeIndex === i;
              
              return (
                <motion.div
                  key={i}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={menuItemVariants}
                >
                  {item.external ? (
                    <motion.a
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center px-4 py-3 mb-2 rounded-xl text-gray-800 transition-all duration-300 ${
                        isActive ? 'font-medium' : ''
                      }`}
                      style={{
                        background: isActive ? activeItemBg : 'transparent',
                        boxShadow: isActive ? '0 4px 12px rgba(0, 0, 0, 0.05)' : 'none',
                      }}
                      whileHover={{
                        backgroundColor: hoverItemBg,
                        scale: 1.02,
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <motion.div
                        className={`p-2 rounded-lg mr-3 ${
                          isActive ? 'bg-white' : 'bg-gray-100'
                        }`}
                        style={{
                          boxShadow: isActive 
                            ? '0 4px 12px rgba(0, 0, 0, 0.08)' 
                            : '0 2px 6px rgba(0, 0, 0, 0.04)',
                        }}
                      >
                        <item.icon className={`h-5 w-5 ${
                          isActive 
                            ? `text-${theme.primary.replace('#', '')}`
                            : 'text-gray-600'
                        }`} />
                      </motion.div>
                      <span>{item.name}</span>
                    </motion.a>
                  ) : (
                    <motion.div
                      whileHover={{
                        backgroundColor: hoverItemBg,
                        scale: 1.02,
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.98 }}
                      className="relative"
                    >
                      <Link
                        to={item.path}
                        className={`flex items-center px-4 py-3 mb-2 rounded-xl text-gray-800 transition-all duration-300 ${
                          isActive ? 'font-medium' : ''
                        }`}
                        style={{
                          background: isActive ? activeItemBg : 'transparent',
                          boxShadow: isActive ? '0 4px 12px rgba(0, 0, 0, 0.05)' : 'none',
                        }}
                      >
                        <motion.div
                          className={`p-2 rounded-lg mr-3 ${
                            isActive ? 'bg-white' : 'bg-gray-100'
                          }`}
                          style={{
                            boxShadow: isActive 
                              ? '0 4px 12px rgba(0, 0, 0, 0.08)' 
                              : '0 2px 6px rgba(0, 0, 0, 0.04)',
                          }}
                        >
                          <item.icon className={`h-5 w-5 ${
                            isActive 
                              ? `text-${theme.primary.replace('#', '')}`
                              : 'text-gray-600'
                          }`} />
                        </motion.div>
                        <span>{item.name}</span>
                      </Link>
                      {isActive && (
                        <motion.div
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b from-blue-500 to-purple-500"
                          layoutId="activeIndicator"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
          
          {/* Logout Button */}
          <motion.div 
            className="p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center px-4 py-3 rounded-xl text-white transition-all duration-300"
              style={{ 
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
                boxShadow: `0 4px 12px ${theme.primary}40`,
                willChange: 'transform',
                transform: 'translateZ(0)'
              }}
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
              <span className="font-medium">Logout</span>
            </motion.button>
          </motion.div>
        </div>
      </motion.aside>

      {/* Desktop Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial="open"
        animate={isOpen ? 'open' : 'closed'}
        className="hidden lg:block fixed top-0 left-0 h-screen text-gray-800 z-40"
        style={{
          ...glassEffect,
          willChange: 'width',
          transform: 'translateZ(0)'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo and Toggle Button */}
          <div className="flex items-center justify-between p-5">
            <AnimatePresence mode="wait">
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, type: 'spring', stiffness: 400, damping: 40 }}
                  className="flex flex-col"
                >
                  <h1 className="text-2xl font-extrabold tracking-tight"
                      style={{
                        background: `linear-gradient(90deg, ${theme.primary}, ${theme.accent})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}>RetinaScan</h1>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: 120 }}
                    transition={{ delay: 0.1, duration: 0.5, type: 'spring', stiffness: 400, damping: 40 }}
                    className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-1"
                  />
                </motion.div>
              )}
            </AnimatePresence>
            
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              whileHover={{ scale: 1.1, rotate: isOpen ? -5 : 5 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                willChange: 'transform'
              }}
            >
              <svg 
                className="h-6 w-6 text-gray-800" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                )}
              </svg>
            </motion.button>
          </div>
          
          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto py-4 px-3">
            {menuItems.map((item, i) => {
              const isActive = activeIndex === i;
              
              return (
                <motion.div
                  key={i}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={menuItemVariants}
                >
                  {item.external ? (
                    <motion.a
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center px-4 py-3 mb-2 rounded-xl text-gray-800 transition-all duration-300 ${
                        isActive ? 'font-medium' : ''
                      } ${!isOpen ? 'justify-center' : ''}`}
                      style={{
                        background: isActive ? activeItemBg : 'transparent',
                        boxShadow: isActive ? '0 4px 12px rgba(0, 0, 0, 0.05)' : 'none',
                      }}
                      whileHover={{
                        backgroundColor: hoverItemBg,
                        scale: 1.02,
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <motion.div
                        className={`p-2 rounded-lg ${isOpen ? 'mr-3' : ''} ${
                          isActive ? 'bg-white' : 'bg-gray-100'
                        }`}
                        style={{
                          boxShadow: isActive 
                            ? '0 4px 12px rgba(0, 0, 0, 0.08)' 
                            : '0 2px 6px rgba(0, 0, 0, 0.04)',
                        }}
                      >
                        <item.icon className={`h-5 w-5 ${
                          isActive 
                            ? `text-${theme.primary.replace('#', '')}`
                            : 'text-gray-600'
                        }`} />
                      </motion.div>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.a>
                  ) : (
                    <motion.div
                      whileHover={{
                        backgroundColor: hoverItemBg,
                        scale: 1.02,
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.98 }}
                      className="relative"
                    >
                      <Link
                        to={item.path}
                        className={`flex items-center px-4 py-3 mb-2 rounded-xl text-gray-800 transition-all duration-300 ${
                          isActive ? 'font-medium' : ''
                        } ${!isOpen ? 'justify-center' : ''}`}
                        style={{
                          background: isActive ? activeItemBg : 'transparent',
                          boxShadow: isActive ? '0 4px 12px rgba(0, 0, 0, 0.05)' : 'none',
                        }}
                      >
                        <motion.div
                          className={`p-2 rounded-lg ${isOpen ? 'mr-3' : ''} ${
                            isActive ? 'bg-white' : 'bg-gray-100'
                          }`}
                          style={{
                            boxShadow: isActive 
                              ? '0 4px 12px rgba(0, 0, 0, 0.08)' 
                              : '0 2px 6px rgba(0, 0, 0, 0.04)',
                          }}
                        >
                          <item.icon className={`h-5 w-5 ${
                            isActive 
                              ? `text-${theme.primary.replace('#', '')}`
                              : 'text-gray-600'
                          }`} />
                        </motion.div>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.span
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: 'auto' }}
                              exit={{ opacity: 0, width: 0 }}
                              transition={{ duration: 0.2 }}
                              style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}
                            >
                              {item.name}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </Link>
                      {isActive && (
                        <motion.div
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b from-blue-500 to-purple-500"
                          layoutId="activeIndicator"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
          
          {/* Logout Button */}
          <motion.div 
            className="p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`w-full flex ${isOpen ? 'justify-start px-4' : 'justify-center'} items-center py-3 rounded-xl text-white transition-all duration-300`}
              style={{ 
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
                boxShadow: `0 4px 12px ${theme.primary}40`,
                willChange: 'transform',
                transform: 'translateZ(0)'
              }}
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5" />
              <AnimatePresence>
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="ml-2 font-medium"
                    style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}
                  >
                    Logout
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        </div>
      </motion.aside>
    </>
  );
}

export default Sidebar;