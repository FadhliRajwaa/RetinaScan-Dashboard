import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { safeLogout, handleLogoutEvent } from '../../utils/logoutHelper';
import ParticleBackground from './ParticleBackground';
import '../../../src/utils/animation.css';
import {
  HomeIcon,
  UserIcon,
  EyeIcon,
  ClockIcon,
  ArrowLeftOnRectangleIcon,
  ArrowLeftCircleIcon,
  ChartBarIcon,
  DocumentChartBarIcon,
} from '@heroicons/react/24/outline';

// Environment variables
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';

const menuItems = [
  { name: 'Dashboard', path: '/', icon: HomeIcon },
  { name: 'Data Pasien', path: '/patient-data', icon: UserIcon },
  { name: 'Scan Retina', path: '/scan-retina', icon: EyeIcon },
  { name: 'History', path: '/history', icon: ClockIcon },
  { name: 'Analisis', path: '/analysis', icon: ChartBarIcon },
  { name: 'Laporan', path: '/report', icon: DocumentChartBarIcon },
  { 
    name: 'Kembali ke Beranda', 
    path: FRONTEND_URL,
    icon: ArrowLeftCircleIcon,
    external: true
  },
];

function Sidebar({ toggleMobileMenu, isMobileMenuOpen }) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('/');
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, isMobile } = useTheme();

  // Update active item when location changes
  useEffect(() => {
    setActiveItem(location.pathname === '/dashboard' ? '/' : location.pathname);
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
    open: { 
      width: '260px', 
      transition: { 
        type: 'spring', 
        damping: 20, 
        stiffness: 200,
        duration: 0.3 
      } 
    },
    closed: { 
      width: '80px', 
      transition: { 
        type: 'spring', 
        damping: 20, 
        stiffness: 200,
        duration: 0.3 
      } 
    },
    mobileOpen: { 
      x: 0, 
      opacity: 1, 
      transition: { 
        type: 'spring', 
        damping: 25, 
        stiffness: 250, 
        duration: 0.3 
      } 
    },
    mobileClosed: { 
      x: '-100%', 
      opacity: 0, 
      transition: { 
        type: 'spring', 
        damping: 25, 
        stiffness: 250, 
        duration: 0.3 
      } 
    },
  };

  const menuItemVariants = {
    hidden: { opacity: 0, x: -15 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { 
        type: 'spring', 
        damping: 15, 
        stiffness: 200, 
        delay: i * 0.05,
      },
    }),
  };

  const logoVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: 'spring', 
        damping: 15, 
        stiffness: 200, 
        delay: 0.1,
      },
    },
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
            transition={{ duration: 0.2 }}
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
          background: theme.darkGradient,
          willChange: 'transform, opacity',
          transform: 'translateZ(0)'
        }}
      >
        <div className="absolute inset-0 opacity-30 z-0">
          <ParticleBackground variant="dark" />
        </div>
        
        <div className="flex flex-col h-full relative z-10">
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
              transition={{ delay: 0.15, duration: 0.2 }}
              className="flex items-center"
            >
              <motion.div 
                className="w-10 h-10 rounded-xl mr-3 flex items-center justify-center"
                style={{ background: theme.accentGradient }}
                animate={{ rotate: [0, 5, 0, -5, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <EyeIcon className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight"
                    style={{
                      background: 'linear-gradient(90deg, white, rgba(255,255,255,0.8))',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                  RetinaScan
                </h1>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: 120 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="h-1 bg-white/40 rounded-full"
                  style={{ willChange: 'width' }}
                />
              </div>
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
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.08, delayChildren: 0.2 }}
                className="space-y-3"
              >
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
                        className="flex items-center p-3 rounded-xl transition-all duration-200"
                        style={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                          willChange: 'transform, background-color'
                        }}
                        whileHover={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.15)', 
                          scale: 1.03,
                          x: 3,
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <item.icon className="h-6 w-6 mr-3" />
                        <span className="text-base font-medium">{item.name}</span>
                      </motion.a>
                    ) : (
                      <motion.div
                        whileHover={{ 
                          scale: 1.03,
                          x: 3,
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Link
                          to={item.path}
                          onClick={toggleMobileMenu}
                          className="flex items-center p-3 rounded-xl transition-all duration-200"
                          style={{ 
                            backgroundColor: activeItem === item.path 
                              ? 'rgba(255, 255, 255, 0.2)' 
                              : 'rgba(255, 255, 255, 0.05)',
                            boxShadow: activeItem === item.path 
                              ? 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)' 
                              : 'none'
                          }}
                        >
                          <item.icon className="h-6 w-6 mr-3" />
                          <span className="text-base font-medium">{item.name}</span>
                          
                          {activeItem === item.path && (
                            <motion.div 
                              layoutId="activeIndicator"
                              className="w-1.5 h-6 rounded-full bg-white ml-auto"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.3 }}
                            />
                          )}
                        </Link>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </nav>
          
          {/* Logout Button */}
          <motion.div 
            className="p-4 mt-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <motion.button
              onClick={handleLogout}
              className="flex items-center w-full p-3 rounded-xl text-white"
              style={{ 
                background: 'rgba(239, 68, 68, 0.2)',
                backdropFilter: 'blur(4px)',
                boxShadow: '0 4px 6px rgba(239, 68, 68, 0.1)',
                willChange: 'transform, background-color'
              }}
              whileHover={{ 
                scale: 1.02, 
                background: 'rgba(239, 68, 68, 0.3)',
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeftOnRectangleIcon className="h-6 w-6 mr-3" />
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
        className="hidden lg:flex h-screen fixed left-0 top-0 flex-col text-white overflow-hidden z-30"
        style={{ 
          background: theme.darkGradient,
          boxShadow: theme.largeShadow,
          willChange: 'width, transform',
          transform: 'translateZ(0)'
        }}
      >
        <div className="absolute inset-0 opacity-30 z-0">
          <ParticleBackground variant="dark" />
        </div>
        
        <div className="relative z-10 h-full flex flex-col">
          {/* Logo and Toggle */}
          <div className="p-4 flex items-center justify-between">
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div 
                  className="flex items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div 
                    className="w-10 h-10 rounded-xl mr-3 flex items-center justify-center"
                    style={{ background: theme.accentGradient }}
                    animate={{ rotate: [0, 5, 0, -5, 0], scale: [1, 1.05, 1] }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <EyeIcon className="h-6 w-6 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-xl font-extrabold tracking-tight"
                        style={{
                          background: 'linear-gradient(90deg, white, rgba(255,255,255,0.8))',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}>
                      RetinaScan
                    </h1>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                      className="h-1 bg-white/40 rounded-full"
                      style={{ willChange: 'width' }}
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: theme.accentGradient }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <EyeIcon className="h-6 w-6 text-white" />
                </motion.div>
              )}
            </AnimatePresence>
            
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full"
              style={{ 
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(4px)',
                willChange: 'transform'
              }}
            >
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.3s ease' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-3 overflow-y-auto">
            <ul className="space-y-2">
              {menuItems.map((item, index) => (
                <li key={item.path}>
                  {item.external ? (
                    <a
                      href={item.path}
                      className="flex items-center p-3 rounded-xl transition-all duration-200"
                      style={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        willChange: 'transform, background-color'
                      }}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="relative"
                      >
                        <item.icon className="h-6 w-6" />
                      </motion.div>
                      
                      <AnimatePresence>
                        {isOpen && (
                          <motion.span 
                            className="ml-3 text-sm font-medium"
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </a>
                  ) : (
                    <Link
                      to={item.path}
                      className="flex items-center p-3 rounded-xl relative transition-all duration-200"
                      style={{ 
                        backgroundColor: activeItem === item.path 
                          ? 'rgba(255, 255, 255, 0.2)' 
                          : 'rgba(255, 255, 255, 0.05)',
                        boxShadow: activeItem === item.path 
                          ? 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)' 
                          : 'none'
                      }}
                    >
                      {activeItem === item.path && (
                        <motion.div 
                          layoutId="desktopActiveIndicator"
                          className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                      
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        animate={activeItem === item.path ? { 
                          scale: [1, 1.15, 1],
                          transition: { 
                            duration: 0.5,
                            repeat: 0
                          }
                        } : {}}
                        className="relative"
                      >
                        <item.icon className="h-6 w-6" />
                        
                        {activeItem === item.path && (
                          <motion.div 
                            className="absolute inset-0 bg-white rounded-full blur-lg opacity-30" 
                            animate={{ 
                              scale: [1, 1.2, 1],
                              opacity: [0.3, 0.5, 0.3],
                            }}
                            transition={{ 
                              duration: 2,
                              repeat: Infinity,
                              repeatType: 'reverse'
                            }}
                          />
                        )}
                      </motion.div>
                      
                      <AnimatePresence>
                        {isOpen && (
                          <motion.span 
                            className="ml-3 text-sm font-medium"
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          
          {/* Logout Button */}
          <div className="p-3 mt-auto">
            <motion.button
              onClick={handleLogout}
              className="flex items-center p-3 rounded-xl w-full"
              style={{ 
                background: 'rgba(239, 68, 68, 0.2)',
                backdropFilter: 'blur(4px)',
                boxShadow: '0 4px 6px rgba(239, 68, 68, 0.1)',
                willChange: 'transform, background-color'
              }}
              whileHover={{ 
                scale: 1.02, 
                background: 'rgba(239, 68, 68, 0.3)',
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
              >
                <ArrowLeftOnRectangleIcon className="h-6 w-6" />
              </motion.div>
              
              <AnimatePresence>
                {isOpen && (
                  <motion.span 
                    className="ml-3 text-sm font-medium"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
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