import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiUsers, FiCamera, FiActivity, FiClock, FiFileText, FiMenu, FiX, FiLogOut, FiChevronRight } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import { safeLogout } from '../../utils/logoutHelper';

const Sidebar = ({ toggleMobileMenu, isMobileMenuOpen }) => {
  const location = useLocation();
  const { isMobile } = useTheme();
  const [activeMenu, setActiveMenu] = useState('');
  const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';

  useEffect(() => {
    // Set active menu based on current path
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') setActiveMenu('dashboard');
    else if (path === '/patient-data' || path.includes('/patient-profile') || path.includes('/edit-patient') || path === '/add-patient') setActiveMenu('patient-data');
    else if (path === '/scan-retina') setActiveMenu('scan-retina');
    else if (path === '/analysis') setActiveMenu('analysis');
    else if (path === '/history' || path.includes('/patient-history')) setActiveMenu('history');
    else if (path === '/report') setActiveMenu('report');
    else setActiveMenu('');
  }, [location.pathname]);

  // Animation variants
  const sidebarVariants = {
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    },
    closed: {
      x: isMobile ? "-100%" : 0,
      opacity: isMobile ? 0 : 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.05,
        staggerDirection: -1,
        when: "afterChildren"
      }
    }
  };

  const menuItemVariants = {
    open: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    closed: {
      y: 20,
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  const handleLogout = () => {
    safeLogout(FRONTEND_URL);
  };

  const menuItems = [
    { id: 'dashboard', path: '/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { id: 'patient-data', path: '/patient-data', icon: <FiUsers />, label: 'Data Pasien' },
    { id: 'scan-retina', path: '/scan-retina', icon: <FiCamera />, label: 'Scan Retina' },
    { id: 'analysis', path: '/analysis', icon: <FiActivity />, label: 'Analisis' },
    { id: 'history', path: '/history', icon: <FiClock />, label: 'Riwayat' },
    { id: 'report', path: '/report', icon: <FiFileText />, label: 'Laporan' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && (
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-20"
              onClick={toggleMobileMenu}
            />
          )}
        </AnimatePresence>
      )}

      {/* Sidebar */}
      <motion.div
        variants={sidebarVariants}
        initial={isMobile ? "closed" : "open"}
        animate={isMobileMenuOpen || !isMobile ? "open" : "closed"}
        className={`fixed lg:sticky top-0 left-0 h-screen bg-white shadow-lg z-30 lg:z-10 overflow-hidden transition-all duration-300 ${
          isMobile ? 'w-64' : 'w-20 lg:w-64'
        }`}
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRight: '1px solid rgba(229, 231, 235, 0.5)'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <motion.div 
              className="flex items-center space-x-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <motion.span 
                className={`font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 ${!isMobile && 'lg:block hidden'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                RetinaScan
              </motion.span>
            </motion.div>
            
            {isMobile && (
              <motion.button 
                className="text-gray-500 hover:text-gray-800 focus:outline-none"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleMobileMenu}
              >
                <FiX size={24} />
              </motion.button>
            )}
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-2 space-y-1">
              {menuItems.map((item) => {
                const isActive = activeMenu === item.id;
                
                return (
                  <motion.div
                    key={item.id}
                    variants={menuItemVariants}
                    className="relative"
                  >
                    <Link to={item.path}>
                      <motion.div
                        className={`flex items-center px-4 py-3 rounded-xl mb-1 group relative overflow-hidden ${
                          isActive
                            ? 'text-white'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                        whileHover={{ 
                          scale: 1.02,
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Background for active item */}
                        {isActive && (
                          <motion.div
                            layoutId="activeBackground"
                            className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                        
                        {/* Hover effect */}
                        <motion.div
                          className="absolute inset-0 bg-gray-100 rounded-xl opacity-0 group-hover:opacity-100"
                          initial={false}
                          animate={{ opacity: isActive ? 0 : 0 }}
                          whileHover={{ opacity: isActive ? 0 : 0.6 }}
                          transition={{ duration: 0.2 }}
                        />
                        
                        {/* Icon */}
                        <span className="relative text-xl mr-3">{item.icon}</span>
                        
                        {/* Label */}
                        <span className={`relative font-medium ${!isMobile && 'lg:block hidden'}`}>
                          {item.label}
                        </span>
                        
                        {/* Active indicator */}
                        {isActive && (
                          <motion.span
                            className="absolute right-2 text-white"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                          >
                            <FiChevronRight />
                          </motion.span>
                        )}
                      </motion.div>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
          </div>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-100">
            <motion.button
              className="flex items-center w-full px-4 py-3 text-gray-600 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
              onClick={handleLogout}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-xl mr-3"><FiLogOut /></span>
              <span className={`font-medium ${!isMobile && 'lg:block hidden'}`}>Keluar</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Mobile menu toggle button */}
      {isMobile && !isMobileMenuOpen && (
        <motion.button
          className="fixed top-4 left-4 z-20 p-2 rounded-full bg-white shadow-lg text-gray-600"
          onClick={toggleMobileMenu}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FiMenu size={24} />
        </motion.button>
      )}
    </>
  );
};

export default Sidebar;