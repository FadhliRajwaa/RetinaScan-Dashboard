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

  // Enhanced animation variants dengan spring yang lebih smooth
  const sidebarVariants = {
    open: { 
      width: '280px', 
      transition: { 
        type: 'spring',
        stiffness: 400,
        damping: 40,
        duration: 0.3
      } 
    },
    closed: { 
      width: '80px', 
      transition: { 
        type: 'spring',
        stiffness: 400,
        damping: 40,
        duration: 0.3
      } 
    },
    mobileOpen: { 
      x: 0, 
      opacity: 1, 
      transition: { 
        type: 'spring',
        stiffness: 400,
        damping: 40,
        duration: 0.3
      } 
    },
    mobileClosed: { 
      x: '-100%', 
      opacity: 0, 
      transition: { 
        type: 'spring',
        stiffness: 400,
        damping: 40,
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
        stiffness: 400,
        damping: 40,
        delay: i * 0.05, 
        duration: 0.2
      },
    }),
  };

  // Modern glassmorphism effect
  const glassEffect = {
    background: `rgba(255, 255, 255, 0.7)`,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    borderRight: '1px solid rgba(255, 255, 255, 0.18)',
  };

  // Gradient background for sidebar
  const sidebarGradient = `linear-gradient(135deg, ${theme.primary}20, ${theme.secondary}30)`;

  // Active item style
  const activeItemStyle = {
    background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
    color: '#fff',
    boxShadow: '0 4px 15px 0 rgba(79, 70, 229, 0.35)',
  };
  
  // Hover item style
  const hoverItemStyle = {
    background: `linear-gradient(90deg, ${theme.primary}20, ${theme.secondary}30)`,
    boxShadow: '0 4px 15px 0 rgba(79, 70, 229, 0.15)',
  };

  return (
    <>
      {/* Overlay for Mobile Menu with improved blur */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-md z-40"
            onClick={toggleMobileMenu}
            style={{ willChange: 'opacity' }}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar with improved glassmorphism */}
      <motion.aside
        variants={sidebarVariants}
        initial="mobileClosed"
        animate={isMobileMenuOpen ? 'mobileOpen' : 'mobileClosed'}
        className="lg:hidden fixed top-0 left-0 h-screen text-gray-800 w-[280px] z-50 overflow-hidden rounded-r-2xl"
        style={{ 
          ...glassEffect,
          background: sidebarGradient,
          willChange: 'transform, opacity',
          transform: 'translateZ(0)'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header: Logo and Close Button */}
          <motion.div 
            className="p-5 flex items-center justify-between"
            style={{ 
              background: `linear-gradient(to right, ${theme.primary}20, transparent)`,
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
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
                  background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary}50)`,
                  willChange: 'width' 
                }}
              />
            </motion.div>
            <motion.button
              onClick={toggleMobileMenu}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9, rotate: -5 }}
              className="p-2 rounded-full"
              style={{ 
                background: `linear-gradient(135deg, ${theme.primary}40, ${theme.secondary}40)`,
                backdropFilter: 'blur(4px)',
                willChange: 'transform'
              }}
            >
              <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </motion.div>
          
          {/* Scrollable Navigation with improved animation */}
          <nav className="flex-1 overflow-y-auto p-4 scroll-smooth">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.05,
                    delayChildren: 0.2,
                  }
                },
                hidden: {}
              }}
            >
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  custom={index}
                  variants={menuItemVariants}
                  style={{ willChange: 'transform, opacity' }}
                  className="mb-3"
                >
                  {item.external ? (
                    <motion.a
                      href={item.path}
                      onClick={toggleMobileMenu}
                      className="flex items-center p-4 rounded-xl transition-all duration-200"
                      style={{ 
                        willChange: 'transform, background-color',
                        boxShadow: '0 2px 10px 0 rgba(0, 0, 0, 0.05)',
                      }}
                      whileHover={{ 
                        ...hoverItemStyle,
                        scale: 1.02,
                        x: 4,
                        transition: { duration: 0.2, type: 'spring' }
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="p-2 rounded-lg mr-3" style={{ background: `${theme.primary}20` }}>
                        <item.icon className={`h-5 w-5 text-gray-700`} />
                      </div>
                      <span className="text-base font-medium">{item.name}</span>
                    </motion.a>
                  ) : (
                    <Link to={item.path} onClick={toggleMobileMenu}>
                      <motion.div
                        className={`flex items-center p-4 rounded-xl transition-all duration-200`}
                        style={{ 
                          ...(location.pathname === item.path ? activeItemStyle : {}),
                          willChange: 'transform, background-color',
                          boxShadow: location.pathname === item.path 
                            ? '0 4px 15px 0 rgba(79, 70, 229, 0.35)'
                            : '0 2px 10px 0 rgba(0, 0, 0, 0.05)',
                        }}
                        whileHover={{ 
                          ...(location.pathname !== item.path ? hoverItemStyle : {}),
                          scale: 1.02,
                          x: 4,
                          transition: { duration: 0.2, type: 'spring' }
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div 
                          className="p-2 rounded-lg mr-3" 
                          style={{ 
                            background: location.pathname === item.path 
                              ? 'rgba(255, 255, 255, 0.2)' 
                              : `${theme.primary}20`
                          }}
                        >
                          <item.icon className={`h-5 w-5 ${location.pathname === item.path ? 'text-white' : 'text-gray-700'}`} />
                        </div>
                        <span className={`text-base font-medium ${location.pathname === item.path ? 'text-white' : ''}`}>
                          {item.name}
                        </span>
                      </motion.div>
                    </Link>
                  )}
                </motion.div>
              ))}
            </motion.div>
            
            {/* Logout Button with improved styling */}
            <motion.div
              variants={menuItemVariants}
              initial="hidden"
              animate="visible"
              custom={menuItems.length}
              className="mt-6"
            >
              <motion.button
                onClick={handleLogout}
                className="w-full flex items-center p-4 rounded-xl transition-all duration-200"
                style={{ 
                  background: `linear-gradient(90deg, ${theme.danger}20, ${theme.danger}40)`,
                  boxShadow: '0 2px 10px 0 rgba(0, 0, 0, 0.05)',
                }}
                whileHover={{ 
                  background: `linear-gradient(90deg, ${theme.danger}40, ${theme.danger}60)`,
                  scale: 1.02,
                  x: 4,
                  boxShadow: '0 4px 15px 0 rgba(239, 68, 68, 0.25)',
                  transition: { duration: 0.2, type: 'spring' }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="p-2 rounded-lg mr-3" style={{ background: `${theme.danger}30` }}>
                  <ArrowLeftOnRectangleIcon className="h-5 w-5 text-red-600" />
                </div>
                <span className="text-base font-medium text-red-600">Logout</span>
              </motion.button>
            </motion.div>
          </nav>
        </div>
      </motion.aside>

      {/* Desktop Sidebar with improved glassmorphism */}
      <motion.aside
        variants={sidebarVariants}
        initial={isOpen ? "open" : "closed"}
        animate={isOpen ? "open" : "closed"}
        className="hidden lg:flex fixed top-0 left-0 h-screen flex-col z-40 rounded-r-2xl"
        style={{ 
          ...glassEffect,
          background: sidebarGradient,
          willChange: 'width',
          transform: 'translateZ(0)'
        }}
      >
        {/* Logo and Toggle Button */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <AnimatePresence mode="wait">
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
                  transition={{ delay: 0.1, duration: 0.3, type: 'spring' }}
                  className="h-1 rounded-full mt-1"
                  style={{ 
                    background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary}50)`,
                    willChange: 'width' 
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            whileHover={{ scale: 1.1, rotate: isOpen ? -180 : 0 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full"
            style={{ 
              background: `linear-gradient(135deg, ${theme.primary}40, ${theme.secondary}40)`,
              backdropFilter: 'blur(4px)',
              willChange: 'transform'
            }}
            animate={{ rotate: isOpen ? 0 : 180 }}
            transition={{ duration: 0.3, type: 'spring' }}
          >
            <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>
        </div>
        
        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4 scroll-smooth">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.05,
                  delayChildren: 0.1,
                }
              },
              hidden: {}
            }}
          >
            {menuItems.map((item, index) => (
              <motion.div
                key={item.path}
                custom={index}
                variants={menuItemVariants}
                className="mb-3"
              >
                {item.external ? (
                  <motion.a
                    href={item.path}
                    className={`flex items-center p-3 rounded-xl transition-all duration-200 ${
                      !isOpen ? 'justify-center' : ''
                    }`}
                    style={{ 
                      boxShadow: '0 2px 10px 0 rgba(0, 0, 0, 0.05)',
                      willChange: 'transform, background-color'
                    }}
                    whileHover={{ 
                      ...hoverItemStyle,
                      scale: 1.02,
                      x: isOpen ? 4 : 0,
                      transition: { duration: 0.2, type: 'spring' }
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="p-2 rounded-lg" style={{ background: `${theme.primary}20` }}>
                      <item.icon className="h-5 w-5 text-gray-700" />
                    </div>
                    
                    <AnimatePresence mode="wait">
                      {isOpen && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className="ml-3 text-base font-medium whitespace-nowrap overflow-hidden"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.a>
                ) : (
                  <Link to={item.path}>
                    <motion.div
                      className={`flex items-center p-3 rounded-xl transition-all duration-200 ${
                        !isOpen ? 'justify-center' : ''
                      }`}
                      style={{ 
                        ...(location.pathname === item.path ? activeItemStyle : {}),
                        boxShadow: location.pathname === item.path 
                          ? '0 4px 15px 0 rgba(79, 70, 229, 0.35)'
                          : '0 2px 10px 0 rgba(0, 0, 0, 0.05)',
                        willChange: 'transform, background-color'
                      }}
                      whileHover={{ 
                        ...(location.pathname !== item.path ? hoverItemStyle : {}),
                        scale: 1.02,
                        x: isOpen ? 4 : 0,
                        transition: { duration: 0.2, type: 'spring' }
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div 
                        className="p-2 rounded-lg" 
                        style={{ 
                          background: location.pathname === item.path 
                            ? 'rgba(255, 255, 255, 0.2)' 
                            : `${theme.primary}20`
                        }}
                      >
                        <item.icon className={`h-5 w-5 ${location.pathname === item.path ? 'text-white' : 'text-gray-700'}`} />
                      </div>
                      
                      <AnimatePresence mode="wait">
                        {isOpen && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`ml-3 text-base font-medium whitespace-nowrap overflow-hidden ${
                              location.pathname === item.path ? 'text-white' : ''
                            }`}
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </Link>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* Logout Button */}
          <motion.div
            variants={menuItemVariants}
            initial="hidden"
            animate="visible"
            custom={menuItems.length}
            className="mt-6"
          >
            <motion.button
              onClick={handleLogout}
              className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 ${
                !isOpen ? 'justify-center' : ''
              }`}
              style={{ 
                background: `linear-gradient(90deg, ${theme.danger}20, ${theme.danger}40)`,
                boxShadow: '0 2px 10px 0 rgba(0, 0, 0, 0.05)',
              }}
              whileHover={{ 
                background: `linear-gradient(90deg, ${theme.danger}40, ${theme.danger}60)`,
                scale: 1.02,
                x: isOpen ? 4 : 0,
                boxShadow: '0 4px 15px 0 rgba(239, 68, 68, 0.25)',
                transition: { duration: 0.2, type: 'spring' }
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="p-2 rounded-lg" style={{ background: `${theme.danger}30` }}>
                <ArrowLeftOnRectangleIcon className="h-5 w-5 text-red-600" />
              </div>
              
              <AnimatePresence mode="wait">
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="ml-3 text-base font-medium text-red-600 whitespace-nowrap overflow-hidden"
                  >
                    Logout
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        </nav>
      </motion.aside>
    </>
  );
}

export default Sidebar;