import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
// eslint-disable-next-line
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
  const [activeIndex, setActiveIndex] = useState(0);

  // Set active menu item based on location
  useEffect(() => {
    const index = menuItems.findIndex(item => item.path === location.pathname);
    setActiveIndex(index >= 0 ? index : 0);
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

  const sidebarVariants = {
    open: { width: '260px', transition: { duration: 0.3, ease: [0.42, 0, 0.58, 1] } },
    closed: { width: '80px', transition: { duration: 0.3, ease: [0.42, 0, 0.58, 1] } },
    mobileOpen: { x: 0, opacity: 1, transition: { duration: 0.3, ease: [0.42, 0, 0.58, 1] } },
    mobileClosed: { x: '-100%', opacity: 0, transition: { duration: 0.3, ease: [0.42, 0, 0.58, 1] } },
  };

  const menuItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, delay: i * 0.07, ease: [0.42, 0, 0.58, 1] },
    }),
  };

  // Animated indicator for active menu item
  const indicatorVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.4, ease: [0.42, 0, 0.58, 1] }
    }
  };

  // Logo animation variants
  const logoVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        delay: 0.2, 
        duration: 0.5,
        ease: [0.42, 0, 0.58, 1]
      } 
    }
  };

  const bgGradient = `linear-gradient(135deg, ${theme.primary}CC, ${theme.accent}CC)`;
  const activeItemBg = `${theme.primary}`;
  const hoverItemBg = `${theme.primary}40`;

  return (
    <>
      {/* Overlay for Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-md z-40"
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
          background: 'rgba(59, 130, 246, 0.85)',
          backdropFilter: 'blur(12px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          willChange: 'transform, opacity',
          transform: 'translateZ(0)'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header: Logo and Close Button */}
          <motion.div 
            className="p-4 pt-6 flex items-center justify-between"
            style={{ backgroundColor: `${theme.accent}30` }}
            variants={logoVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              initial={{ x: -15, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.4 }}
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
                transition={{ delay: 0.3, duration: 0.5 }}
                className="h-1 bg-white/40 rounded-full"
                style={{ willChange: 'width' }}
              />
            </motion.div>
            <motion.button
              onClick={toggleMobileMenu}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9, rotate: -5 }}
              className="p-2 rounded-full"
              style={{ 
                backgroundColor: theme.accent,
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
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
                  style={{ willChange: 'transform, opacity', position: 'relative' }}
                  className="relative mb-3"
                >
                  {/* Active indicator */}
                  {location.pathname === item.path && (
                    <motion.div 
                      className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full"
                      style={{ background: 'white' }}
                      layoutId="activeIndicator"
                      variants={indicatorVariants}
                      initial="initial"
                      animate="animate"
                    />
                  )}
                  
                  {item.external ? (
                    <motion.a
                      href={item.path}
                      onClick={toggleMobileMenu}
                      className={`flex items-center p-4 rounded-xl transition-all duration-300 ${
                        location.pathname === item.path ? 'shadow-inner' : ''
                      }`}
                      style={{ 
                        backgroundColor: location.pathname === item.path ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                        boxShadow: location.pathname === item.path ? 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)' : 'none',
                        willChange: 'transform, background-color'
                      }}
                      whileHover={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                        scale: 1.03,
                        x: 4,
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <motion.div 
                        className="p-2 rounded-lg mr-3"
                        style={{ 
                          backgroundColor: location.pathname === item.path ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'
                        }}
                        whileHover={{ rotate: 5 }}
                        whileTap={{ rotate: -5, scale: 0.95 }}
                      >
                        <item.icon className="h-5 w-5" />
                      </motion.div>
                      <span className="text-base font-medium">{item.name}</span>
                    </motion.a>
                  ) : (
                    <motion.div
                      whileHover={{ 
                        scale: 1.03,
                        x: 4,
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Link
                        to={item.path}
                        onClick={toggleMobileMenu}
                        className={`flex items-center p-4 rounded-xl transition-all duration-300 ${
                          location.pathname === item.path ? 'shadow-inner' : ''
                        }`}
                        style={{ 
                          backgroundColor: location.pathname === item.path ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                          boxShadow: location.pathname === item.path ? 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)' : 'none'
                        }}
                      >
                        <motion.div 
                          className="p-2 rounded-lg mr-3"
                          style={{ 
                            backgroundColor: location.pathname === item.path ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'
                          }}
                          whileHover={{ rotate: 5 }}
                          whileTap={{ rotate: -5, scale: 0.95 }}
                        >
                          <item.icon className="h-5 w-5" />
                        </motion.div>
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
            className="p-4 mt-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <motion.button
              onClick={handleLogout}
              className="flex items-center justify-center w-full p-3 rounded-xl text-white"
              style={{ 
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(5px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
              whileHover={{ 
                scale: 1.03, 
                boxShadow: '0 6px 10px rgba(0, 0, 0, 0.15)',
                background: 'rgba(255, 255, 255, 0.2)'
              }}
              whileTap={{ scale: 0.97 }}
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
              <span>Logout</span>
            </motion.button>
          </motion.div>
        </div>
      </motion.aside>

      {/* Desktop Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial="open"
        animate={isOpen ? 'open' : 'closed'}
        className="hidden lg:flex fixed top-0 left-0 h-screen z-30 flex-col"
        style={{ 
          background: 'rgba(59, 130, 246, 0.85)',
          backdropFilter: 'blur(12px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          willChange: 'width',
          transform: 'translateZ(0)'
        }}
      >
        {/* Logo Container */}
        <motion.div 
          className="p-5 flex items-center"
          variants={logoVariants}
          initial="hidden"
          animate="visible"
        >
          {isOpen ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center"
            >
              <motion.div
                className="w-10 h-10 rounded-xl mr-3 flex items-center justify-center"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
                whileHover={{ rotate: 5, scale: 1.05 }}
                whileTap={{ rotate: -5, scale: 0.95 }}
              >
                <EyeIcon className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-white">RetinaScan</h1>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: 100 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="h-1 bg-white/40 rounded-full"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto"
              style={{ 
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
              whileHover={{ rotate: 5, scale: 1.05 }}
              whileTap={{ rotate: -5, scale: 0.95 }}
            >
              <EyeIcon className="h-6 w-6 text-white" />
            </motion.div>
          )}
        </motion.div>
        
        {/* Toggle Button */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute -right-3 top-16 bg-white w-6 h-6 rounded-full flex items-center justify-center shadow-md"
          style={{ 
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.8)'
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div
            animate={{ rotate: isOpen ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            <svg 
              width="10" 
              height="10" 
              viewBox="0 0 10 10" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              style={{ color: theme.primary }}
            >
              <path d="M3 1L7 5L3 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        </motion.button>
        
        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-8 px-4">
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <motion.li 
                key={item.path}
                custom={index}
                variants={menuItemVariants}
                initial="hidden"
                animate="visible"
                className="relative"
              >
                {/* Active indicator */}
                {location.pathname === item.path && (
                  <motion.div 
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full"
                    style={{ background: 'white' }}
                    layoutId="desktopActiveIndicator"
                    variants={indicatorVariants}
                    initial="initial"
                    animate="animate"
                  />
                )}
                
                {item.external ? (
                  <motion.a
                    href={item.path}
                    className={`flex items-center p-3 rounded-xl ${
                      location.pathname === item.path 
                        ? 'bg-white/15' 
                        : 'hover:bg-white/10'
                    }`}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <motion.div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ 
                        backgroundColor: location.pathname === item.path 
                          ? 'rgba(255, 255, 255, 0.2)' 
                          : 'rgba(255, 255, 255, 0.1)'
                      }}
                      whileHover={{ rotate: 5 }}
                      whileTap={{ rotate: -5, scale: 0.95 }}
                    >
                      <item.icon className="h-5 w-5 text-white" />
                    </motion.div>
                    {isOpen && (
                      <motion.span 
                        className="ml-3 text-white font-medium"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </motion.a>
                ) : (
                  <Link to={item.path}>
                    <motion.div
                      className={`flex items-center p-3 rounded-xl ${
                        location.pathname === item.path 
                          ? 'bg-white/15' 
                          : 'hover:bg-white/10'
                      }`}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <motion.div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ 
                          backgroundColor: location.pathname === item.path 
                            ? 'rgba(255, 255, 255, 0.2)' 
                            : 'rgba(255, 255, 255, 0.1)'
                        }}
                        whileHover={{ rotate: 5 }}
                        whileTap={{ rotate: -5, scale: 0.95 }}
                      >
                        <item.icon className="h-5 w-5 text-white" />
                      </motion.div>
                      {isOpen && (
                        <motion.span 
                          className="ml-3 text-white font-medium"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </motion.div>
                  </Link>
                )}
              </motion.li>
            ))}
          </ul>
        </nav>
        
        {/* Logout Button */}
        <motion.div 
          className="p-4 mt-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <motion.button
            onClick={handleLogout}
            className="flex items-center justify-center w-full p-3 rounded-xl text-white"
            style={{ 
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(5px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
            whileHover={{ 
              scale: 1.03, 
              boxShadow: '0 6px 10px rgba(0, 0, 0, 0.15)',
              background: 'rgba(255, 255, 255, 0.2)'
            }}
            whileTap={{ scale: 0.97 }}
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5" />
            {isOpen && (
              <motion.span 
                className="ml-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                Logout
              </motion.span>
            )}
          </motion.button>
        </motion.div>
      </motion.aside>
    </>
  );
}

export default Sidebar;