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
  BellIcon,
  ChartBarIcon,
  DocumentTextIcon
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

  // Enhanced animation variants
  const sidebarVariants = {
    open: { 
      width: '280px', 
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 30,
        duration: 0.3
      } 
    },
    closed: { 
      width: '80px', 
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 30,
        duration: 0.3
      } 
    },
    mobileOpen: { 
      x: 0, 
      opacity: 1, 
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 30,
        duration: 0.3
      } 
    },
    mobileClosed: { 
      x: '-100%', 
      opacity: 0, 
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 30,
        duration: 0.3
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
        stiffness: 300,
        damping: 30,
        delay: i * 0.05, 
        duration: 0.2
      },
    }),
  };

  return (
    <>
      {/* Overlay for Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
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
        className="lg:hidden fixed top-0 left-0 h-screen w-[280px] z-50 overflow-hidden"
        style={{ 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
          borderRight: '1px solid rgba(255, 255, 255, 0.8)',
          willChange: 'transform, opacity',
          transform: 'translateZ(0)'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header: Logo and Close Button */}
          <motion.div 
            className="p-5 flex items-center justify-between"
            style={{ 
              background: `linear-gradient(135deg, ${theme.primary}10, ${theme.secondary}10)`,
              borderBottom: '1px solid rgba(255, 255, 255, 0.8)'
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3, type: 'spring' }}
          >
            <motion.div
              initial={{ x: -15, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.3, type: 'spring' }}
              className="flex flex-col"
            >
              <h1 className="text-2xl font-extrabold tracking-tight"
                  style={{
                    background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>RetinaScan</h1>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 120 }}
                transition={{ delay: 0.2, duration: 0.4, type: 'spring' }}
                className="h-1 rounded-full mt-1"
                style={{ 
                  background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
                  opacity: 0.7,
                  willChange: 'width' 
                }}
              />
            </motion.div>
            <motion.button
              onClick={toggleMobileMenu}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9, rotate: -5 }}
              className="p-2 rounded-full text-white"
              style={{ 
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                boxShadow: '0 4px 10px rgba(79, 70, 229, 0.2)',
                willChange: 'transform'
              }}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </motion.div>

          {/* Menu Items */}
          <motion.nav 
            className="flex-1 px-3 py-4 overflow-y-auto"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {menuItems.map((item, index) => {
              const isActive = index === activeIndex;
              return (
                <motion.div
                  key={index}
                  custom={index}
                  variants={menuItemVariants}
                >
                  {item.external ? (
                    <a
                      href={item.path}
                      className={`flex items-center px-4 py-3 mb-2 rounded-xl transition-all duration-200 ${
                        isActive 
                          ? 'text-white shadow-md' 
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                      style={
                        isActive 
                          ? {
                              background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                              boxShadow: '0 4px 10px rgba(79, 70, 229, 0.2)'
                            } 
                          : {}
                      }
                    >
                      <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                      <span className="ml-3 font-medium">{item.name}</span>
                    </a>
                  ) : (
                    <Link
                      to={item.path}
                      className={`flex items-center px-4 py-3 mb-2 rounded-xl transition-all duration-200 ${
                        isActive 
                          ? 'text-white shadow-md' 
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                      style={
                        isActive 
                          ? {
                              background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                              boxShadow: '0 4px 10px rgba(79, 70, 229, 0.2)'
                            } 
                          : {}
                      }
                    >
                      <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                      <span className="ml-3 font-medium">{item.name}</span>
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </motion.nav>

          {/* Footer with Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="w-full flex items-center px-4 py-3 rounded-xl text-gray-700 hover:text-white transition-all duration-200 hover:shadow-md"
              style={{
                background: 'transparent',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                hover: {
                  background: 'linear-gradient(135deg, #EF4444, #F87171)'
                }
              }}
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5 text-red-500" />
              <span className="ml-3 font-medium">Logout</span>
            </motion.button>
          </div>
        </div>
      </motion.aside>

      {/* Desktop Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial="open"
        animate={isOpen ? 'open' : 'closed'}
        className="hidden lg:block fixed top-0 left-0 h-screen z-40 overflow-hidden"
        style={{ 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
          borderRight: '1px solid rgba(255, 255, 255, 0.8)',
          willChange: 'width',
          transform: 'translateZ(0)'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header: Logo and Toggle Button */}
          <div className="p-5 flex items-center justify-between">
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col"
                >
                  <h1 className="text-2xl font-extrabold tracking-tight"
                      style={{
                        background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}>RetinaScan</h1>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: 120 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    className="h-1 rounded-full mt-1"
                    style={{ 
                      background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
                      opacity: 0.7
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              whileHover={{ scale: 1.1, rotate: isOpen ? -5 : 5 }}
              whileTap={{ scale: 0.9, rotate: isOpen ? 5 : -5 }}
              className="p-2 rounded-full text-white"
              style={{ 
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                boxShadow: '0 4px 10px rgba(79, 70, 229, 0.2)',
                willChange: 'transform'
              }}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d={isOpen ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} 
                />
              </svg>
            </motion.button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            {menuItems.map((item, index) => {
              const isActive = index === activeIndex;
              return (
                <motion.div
                  key={index}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={menuItemVariants}
                >
                  {item.external ? (
                    <a
                      href={item.path}
                      className={`flex items-center px-4 py-3 mb-2 rounded-xl transition-all duration-200 ${
                        isActive 
                          ? 'text-white shadow-md' 
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                      style={
                        isActive 
                          ? {
                              background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                              boxShadow: '0 4px 10px rgba(79, 70, 229, 0.2)'
                            } 
                          : {}
                      }
                    >
                      <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                      <AnimatePresence>
                        {isOpen && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="ml-3 font-medium whitespace-nowrap"
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </a>
                  ) : (
                    <Link
                      to={item.path}
                      className={`flex items-center px-4 py-3 mb-2 rounded-xl transition-all duration-200 ${
                        isActive 
                          ? 'text-white shadow-md' 
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                      style={
                        isActive 
                          ? {
                              background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                              boxShadow: '0 4px 10px rgba(79, 70, 229, 0.2)'
                            } 
                          : {}
                      }
                    >
                      <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                      <AnimatePresence>
                        {isOpen && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="ml-3 font-medium whitespace-nowrap"
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </nav>

          {/* Footer with Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center px-4 py-3 rounded-xl text-gray-700 hover:text-white transition-all duration-200 hover:shadow-md"
              style={{
                background: 'transparent',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                hover: {
                  background: 'linear-gradient(135deg, #EF4444, #F87171)'
                }
              }}
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5 text-red-500" />
              <AnimatePresence>
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="ml-3 font-medium whitespace-nowrap"
                  >
                    Logout
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

export default Sidebar;