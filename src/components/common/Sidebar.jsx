import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
// eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import {
  HomeIcon,
  UserIcon,
  EyeIcon,
  ClockIcon,
  ArrowLeftOnRectangleIcon,
  ArrowLeftCircleIcon,
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
  const location = useLocation();
  const { theme } = useTheme();

  const handleLogout = () => {
    // Hapus token dari localStorage
    localStorage.removeItem('token');
    
    // Hapus semua data session lainnya jika ada
    sessionStorage.clear();
    
    // Redirect ke landing page dengan parameter logout=true
    window.location.href = `${FRONTEND_URL}/?logout=true&from=dashboard`;
  };

  const sidebarVariants = {
    open: { width: '260px', transition: { duration: 0.2, ease: 'easeOut' } },
    closed: { width: '80px', transition: { duration: 0.2, ease: 'easeOut' } },
    mobileOpen: { x: 0, opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
    mobileClosed: { x: '-100%', opacity: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  };

  const menuItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.15, delay: i * 0.05, ease: 'easeOut' },
    }),
  };

  const bgGradient = `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`;
  const activeItemBg = `${theme.primary}`;
  const hoverItemBg = `${theme.primary}90`;

  return (
    <>
      {/* Overlay for Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
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
        className="lg:hidden fixed top-0 left-0 h-screen text-white w-64 z-50 shadow-2xl overflow-hidden"
        style={{ 
          background: bgGradient,
          willChange: 'transform, opacity',
          transform: 'translateZ(0)'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header: Logo and Close Button */}
          <motion.div 
            className="p-4 pt-6 flex items-center justify-between"
            style={{ backgroundColor: `${theme.accent}30` }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.2 }}
          >
            <motion.div
              initial={{ x: -15, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.2 }}
            >
              <h1 className="text-2xl font-extrabold tracking-tight"
                  style={{
                    background: 'linear-gradient(90deg, white, rgba(255,255,255,0.8))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>RetinaScan</h1>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 120 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="h-1 bg-white/40 rounded-full"
                style={{ willChange: 'width' }}
              />
            </motion.div>
            <motion.button
              onClick={toggleMobileMenu}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full"
              style={{ 
                backgroundColor: theme.accent,
                willChange: 'transform'
              }}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </motion.div>
          
          {/* Scrollable Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 scroll-smooth">
            <AnimatePresence mode="wait">
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  custom={index}
                  variants={menuItemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  style={{ willChange: 'transform, opacity' }}
                >
                  {item.external ? (
                    <motion.a
                      href={item.path}
                      onClick={toggleMobileMenu}
                      className={`flex items-center p-4 mb-3 rounded-xl transition-all duration-200 ${
                        location.pathname === item.path ? 'shadow-inner' : ''
                      }`}
                      style={{ 
                        backgroundColor: location.pathname === item.path ? activeItemBg : 'transparent',
                        boxShadow: location.pathname === item.path ? 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)' : 'none',
                        willChange: 'transform, background-color'
                      }}
                      whileHover={{ 
                        backgroundColor: hoverItemBg, 
                        scale: 1.01,
                        x: 2,
                        transition: { duration: 0.15 }
                      }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <item.icon className="h-6 w-6 mr-3" />
                      <span className="text-base font-medium">{item.name}</span>
                    </motion.a>
                  ) : (
                    <motion.div
                      whileHover={{ 
                        scale: 1.01,
                        x: 2,
                        transition: { duration: 0.15 }
                      }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <Link
                        to={item.path}
                        onClick={toggleMobileMenu}
                        className={`flex items-center p-4 mb-3 rounded-xl transition-all duration-200 ${
                          location.pathname === item.path ? 'shadow-inner' : ''
                        }`}
                        style={{ 
                          backgroundColor: location.pathname === item.path ? activeItemBg : 'transparent',
                          boxShadow: location.pathname === item.path ? 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)' : 'none'
                        }}
                      >
                        <item.icon className="h-6 w-6 mr-3" />
                        <span className="text-base font-medium">{item.name}</span>
                      </Link>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </nav>
          
          {/* Logout Button */}
          <motion.div 
            className="p-4 border-t border-white/10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.2 }}
          >
            <motion.button
              onClick={handleLogout}
              className="flex items-center p-4 w-full rounded-xl transition-all duration-200"
              style={{ 
                background: 'linear-gradient(135deg, #ef4444, #f87171)',
                willChange: 'transform, background-color'
              }}
              whileHover={{ scale: 1.02, backgroundColor: '#dc2626' }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeftOnRectangleIcon className="h-6 w-6 mr-3" />
              <span className="text-base font-medium">Logout</span>
            </motion.button>
          </motion.div>
        </div>
      </motion.aside>

      {/* Desktop/Tablet Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        animate={isOpen ? 'open' : 'closed'}
        className="hidden lg:flex flex-col h-screen sticky top-0 shadow-2xl text-white"
        style={{ 
          background: bgGradient,
          willChange: 'width',
          transform: 'translateZ(0)'
        }}
      >
        <div className="p-4 flex justify-between items-center">
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.h1 
                key="full-logo"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="text-2xl font-extrabold tracking-tight"
                style={{
                  background: 'linear-gradient(90deg, white, rgba(255,255,255,0.8))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                RetinaScan
              </motion.h1>
            ) : (
              <motion.h1
                key="logo-icon"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1.3 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="text-2xl font-extrabold tracking-tight w-10 h-10 flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${theme.accent}, ${theme.primary})`,
                  borderRadius: '10px',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
                }}
              >
                R
              </motion.h1>
            )}
          </AnimatePresence>
          
          <motion.button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors duration-150"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            style={{ willChange: 'transform' }}
          >
            <svg 
              className="w-6 h-6 text-white" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              style={{
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease-out'
              }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-4 pt-4 pb-20">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.path}
              custom={index}
              variants={menuItemVariants}
              initial="hidden"
              animate="visible"
              style={{ willChange: 'transform, opacity' }}
              className="mb-2"
            >
              {item.external ? (
                <motion.a
                  href={item.path}
                  className={`flex items-center p-3 rounded-xl transition-all duration-200 ${
                    location.pathname === item.path ? 'shadow-inner' : ''
                  }`}
                  style={{ 
                    backgroundColor: location.pathname === item.path ? activeItemBg : 'transparent',
                    boxShadow: location.pathname === item.path ? 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)' : 'none'
                  }}
                  whileHover={{ 
                    backgroundColor: hoverItemBg, 
                    scale: 1.01,
                    x: 2,
                    transition: { duration: 0.15 }
                  }}
                  whileTap={{ scale: 0.99 }}
                >
                  <item.icon className="h-5 w-5 min-w-[1.25rem]" />
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="ml-3 text-sm font-medium whitespace-nowrap overflow-hidden"
                      style={{ willChange: 'width, opacity' }}
                    >
                      {item.name}
                    </motion.span>
                  )}
                </motion.a>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center p-3 rounded-xl transition-all duration-200 ${
                    location.pathname === item.path ? 'shadow-inner' : ''
                  }`}
                  style={{ 
                    backgroundColor: location.pathname === item.path ? activeItemBg : 'transparent',
                    boxShadow: location.pathname === item.path ? 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)' : 'none',
                    willChange: 'transform, background-color'
                  }}
                >
                  <motion.div
                    whileHover={{ 
                      scale: 1.01,
                      x: 2,
                      transition: { duration: 0.15 }
                    }}
                    whileTap={{ scale: 0.99 }}
                    className="flex items-center w-full"
                  >
                    <item.icon className="h-5 w-5 min-w-[1.25rem]" />
                    {isOpen && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="ml-3 text-sm font-medium whitespace-nowrap overflow-hidden"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </motion.div>
                </Link>
              )}
            </motion.div>
          ))}
        </nav>
        
        {/* Logout Button for Desktop */}
        <div className={`p-4 border-t border-white/10 ${isOpen ? 'block' : 'hidden'}`}>
          <motion.button
            onClick={handleLogout}
            className="flex items-center p-3 w-full rounded-xl transition-all duration-200"
            style={{ 
              background: 'linear-gradient(135deg, #ef4444, #f87171)',
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5 min-w-[1.25rem]" />
            {isOpen && (
              <motion.span 
                className="ml-3 text-sm font-medium whitespace-nowrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                Logout
              </motion.span>
            )}
          </motion.button>
        </div>
        
        {/* Logout icon only for collapsed sidebar */}
        {!isOpen && (
          <div className="p-4 border-t border-white/10">
            <motion.button
              onClick={handleLogout}
              className="flex items-center justify-center p-3 w-full rounded-xl transition-all duration-200"
              style={{ 
                background: 'linear-gradient(135deg, #ef4444, #f87171)',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5" />
            </motion.button>
          </div>
        )}
      </motion.aside>
    </>
  );
}

export default Sidebar;