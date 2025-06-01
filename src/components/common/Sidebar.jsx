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

  // Enhanced animation variants with smoother transitions
  const sidebarVariants = {
    open: { 
      width: '280px', 
      transition: { 
        type: 'spring',
        stiffness: 400,
        damping: 30,
        duration: 0.5
      } 
    },
    closed: { 
      width: '80px', 
      transition: { 
        type: 'spring',
        stiffness: 400,
        damping: 30,
        duration: 0.5
      } 
    },
    mobileOpen: { 
      x: 0, 
      opacity: 1, 
      transition: { 
        type: 'spring',
        stiffness: 400,
        damping: 30,
        duration: 0.5
      } 
    },
    mobileClosed: { 
      x: '-100%', 
      opacity: 0, 
      transition: { 
        type: 'spring',
        stiffness: 400,
        damping: 30,
        duration: 0.5
      } 
    },
  };

  const menuItemVariants = {
    hidden: { opacity: 0, x: -25 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { 
        type: 'spring',
        stiffness: 400,
        damping: 30,
        delay: i * 0.07, 
        duration: 0.3
      },
    }),
    hover: {
      scale: 1.05,
      x: 5,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 20
      }
    },
    tap: {
      scale: 0.95,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 20
      }
    }
  };

  // Modern gradient background with enhanced glassmorphism effect
  const bgGradient = `linear-gradient(135deg, ${theme.primary}DD, ${theme.accent}DD)`;
  const activeItemBg = `${theme.primary}`;
  const hoverItemBg = `${theme.primary}30`;
  
  // Enhanced glassmorphism style
  const glassEffect = {
    background: bgGradient,
    backdropFilter: 'blur(15px)',
    WebkitBackdropFilter: 'blur(15px)',
    boxShadow: '0 10px 40px 0 rgba(31, 38, 135, 0.25)',
    borderRight: '1px solid rgba(255, 255, 255, 0.2)',
  };

  return (
    <>
      {/* Overlay for Mobile Menu with improved animation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-md z-40"
            onClick={toggleMobileMenu}
            style={{ willChange: 'opacity' }}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar with enhanced design */}
      <motion.aside
        variants={sidebarVariants}
        initial="mobileClosed"
        animate={isMobileMenuOpen ? 'mobileOpen' : 'mobileClosed'}
        className="lg:hidden fixed top-0 left-0 h-screen text-white w-[280px] z-50 overflow-hidden"
        style={{ 
          ...glassEffect,
          willChange: 'transform, opacity',
          transform: 'translateZ(0)'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header: Logo and Close Button with enhanced animation */}
          <motion.div 
            className="p-6 flex items-center justify-between"
            style={{ backgroundColor: `${theme.accent}30` }}
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4, type: 'spring' }}
          >
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4, type: 'spring' }}
              className="flex flex-col"
            >
              <h1 className="text-2xl font-extrabold tracking-tight"
                  style={{
                    background: 'linear-gradient(90deg, white, rgba(255,255,255,0.7))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 2px 10px rgba(255,255,255,0.2)'
                  }}>RetinaScan</h1>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 140 }}
                transition={{ delay: 0.25, duration: 0.5, type: 'spring' }}
                className="h-1.5 bg-white/50 rounded-full mt-1.5"
                style={{ willChange: 'width' }}
              />
            </motion.div>
            <motion.button
              onClick={toggleMobileMenu}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9, rotate: -5 }}
              className="p-2.5 rounded-full"
              style={{ 
                backgroundColor: `${theme.accent}70`,
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 15px -3px rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.15)',
                willChange: 'transform'
              }}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </motion.div>
          
          {/* Mobile Menu Items with enhanced animation */}
          <div className="flex-1 overflow-y-auto py-4 px-3">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.08
                  }
                }
              }}
              className="space-y-2.5"
            >
              {menuItems.map((item, index) => (
                <motion.div
                  key={index}
                  custom={index}
                  variants={menuItemVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  {item.external ? (
                    <a
                      href={item.path}
                      className={`flex items-center p-3.5 rounded-xl text-white transition-all duration-300 ${
                        activeIndex === index 
                          ? 'bg-white/20 shadow-lg' 
                          : 'hover:bg-white/10'
                      }`}
                      style={{
                        boxShadow: activeIndex === index ? '0 8px 20px -4px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.15) inset' : 'none',
                        transform: activeIndex === index ? 'translateY(-2px)' : 'none'
                      }}
                    >
                      <div className={`mr-3 p-2.5 rounded-lg ${activeIndex === index ? 'bg-white/20' : 'bg-white/10'}`}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <span className="font-medium">{item.name}</span>
                    </a>
                  ) : (
                    <Link
                      to={item.path}
                      className={`flex items-center p-3.5 rounded-xl text-white transition-all duration-300 ${
                        activeIndex === index 
                          ? 'bg-white/20 shadow-lg' 
                          : 'hover:bg-white/10'
                      }`}
                      style={{
                        boxShadow: activeIndex === index ? '0 8px 20px -4px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.15) inset' : 'none',
                        transform: activeIndex === index ? 'translateY(-2px)' : 'none'
                      }}
                    >
                      <div className={`mr-3 p-2.5 rounded-lg ${activeIndex === index ? 'bg-white/20' : 'bg-white/10'}`}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <span className="font-medium">{item.name}</span>
                      
                      {/* Active indicator */}
                      {activeIndex === index && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="ml-auto h-2 w-2 rounded-full bg-white"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20
                          }}
                        />
                      )}
                    </Link>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
          
          {/* Logout Button with enhanced styling */}
          <motion.div
            className="p-4 mt-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full flex items-center p-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-all duration-300"
              style={{
                boxShadow: '0 4px 15px -3px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.1) inset',
              }}
            >
              <div className="mr-3 p-2 rounded-lg bg-white/10">
                <ArrowLeftOnRectangleIcon className="h-5 w-5" />
              </div>
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
        className="hidden lg:block fixed top-0 left-0 h-screen text-white z-40 overflow-hidden"
        style={{ 
          ...glassEffect,
          willChange: 'width, transform',
          transform: 'translateZ(0)'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo and Toggle Button */}
          <div className="p-6 flex items-center justify-between">
            <AnimatePresence mode="wait">
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.3, type: 'spring' }}
                  className="flex flex-col"
                >
                  <h1 className="text-2xl font-extrabold tracking-tight"
                      style={{
                        background: 'linear-gradient(90deg, white, rgba(255,255,255,0.7))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 2px 10px rgba(255,255,255,0.2)'
                      }}>RetinaScan</h1>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.1, duration: 0.5, type: 'spring' }}
                    className="h-1.5 bg-white/50 rounded-full mt-1.5"
                  />
                </motion.div>
              )}
            </AnimatePresence>
            
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              whileHover={{ scale: 1.1, rotate: isOpen ? -5 : 5 }}
              whileTap={{ scale: 0.9, rotate: isOpen ? 5 : -5 }}
              className="p-2.5 rounded-full"
              style={{ 
                backgroundColor: `${theme.accent}70`,
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 15px -3px rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.15)',
                willChange: 'transform'
              }}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d={isOpen 
                    ? "M15 19l-7-7 7-7" 
                    : "M9 5l7 7-7 7"} 
                />
              </svg>
            </motion.button>
          </div>
          
          {/* Desktop Navigation */}
          <div className="flex-1 overflow-y-auto py-4 px-3">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.08
                  }
                }
              }}
              className="space-y-2.5"
            >
              {menuItems.map((item, index) => (
                <motion.div
                  key={index}
                  custom={index}
                  variants={menuItemVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  {item.external ? (
                    <a
                      href={item.path}
                      className={`flex items-center p-3.5 rounded-xl text-white transition-all duration-300 ${
                        activeIndex === index 
                          ? 'bg-white/20 shadow-lg' 
                          : 'hover:bg-white/10'
                      }`}
                      style={{
                        boxShadow: activeIndex === index ? '0 8px 20px -4px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.15) inset' : 'none',
                        transform: activeIndex === index ? 'translateY(-2px)' : 'none'
                      }}
                    >
                      <div className={`mr-3 p-2.5 rounded-lg ${activeIndex === index ? 'bg-white/20' : 'bg-white/10'}`}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      {isOpen && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.3 }}
                          className="font-medium whitespace-nowrap"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </a>
                  ) : (
                    <Link
                      to={item.path}
                      className={`flex items-center p-3.5 rounded-xl text-white transition-all duration-300 ${
                        activeIndex === index 
                          ? 'bg-white/20 shadow-lg' 
                          : 'hover:bg-white/10'
                      }`}
                      style={{
                        boxShadow: activeIndex === index ? '0 8px 20px -4px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.15) inset' : 'none',
                        transform: activeIndex === index ? 'translateY(-2px)' : 'none'
                      }}
                    >
                      <div className={`mr-3 p-2.5 rounded-lg ${activeIndex === index ? 'bg-white/20' : 'bg-white/10'}`}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      {isOpen && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.3 }}
                          className="font-medium whitespace-nowrap"
                        >
                          {item.name}
                        </motion.span>
                      )}
                      
                      {/* Active indicator */}
                      {activeIndex === index && isOpen && (
                        <motion.div
                          layoutId="desktopActiveIndicator"
                          className="ml-auto h-2 w-2 rounded-full bg-white"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20
                          }}
                        />
                      )}
                    </Link>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
          
          {/* Logout Button */}
          <motion.div
            className="p-4 mt-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full flex items-center p-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-all duration-300"
              style={{
                boxShadow: '0 4px 15px -3px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.1) inset',
              }}
            >
              <div className="mr-3 p-2 rounded-lg bg-white/10">
                <ArrowLeftOnRectangleIcon className="h-5 w-5" />
              </div>
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.3 }}
                  className="font-medium whitespace-nowrap"
                >
                  Logout
                </motion.span>
              )}
            </motion.button>
          </motion.div>
        </div>
      </motion.aside>
    </>
  );
}

export default Sidebar;