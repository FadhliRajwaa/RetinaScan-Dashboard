import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { 
  BellIcon, 
  Cog6ToothIcon, 
  UserCircleIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

function Header({ title, toggleMobileMenu, isMobileMenuOpen }) {
  const { theme, isMobile } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  
  const headerVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: 'spring',
        stiffness: 400,
        damping: 30,
        duration: 0.4,
        staggerChildren: 0.06,
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
        stiffness: 400,
        damping: 30,
        duration: 0.4
      }
    }
  };

  // Function to handle click explicitly
  const handleMenuClick = (e) => {
    e.stopPropagation();
    if (typeof toggleMobileMenu === 'function') {
      toggleMobileMenu();
    } else {
      console.error('toggleMobileMenu is not a function!');
    }
  };

  // Enhanced glassmorphism style
  const glassEffect = {
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(15px)',
    WebkitBackdropFilter: 'blur(15px)',
    boxShadow: '0 10px 30px 0 rgba(31, 38, 135, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
  };

  // Mock notifications
  const notifications = [
    { id: 1, title: 'Pasien baru terdaftar', time: '5 menit yang lalu' },
    { id: 2, title: 'Hasil analisis retina selesai', time: '1 jam yang lalu' },
    { id: 3, title: 'Pengingat jadwal pemeriksaan', time: '3 jam yang lalu' }
  ];
  
  return (
    <motion.header 
      variants={headerVariants}
      initial="hidden"
      animate="visible"
      className="mx-2 sm:mx-4 md:mx-6 mb-6 p-4 sm:p-5 flex flex-col sticky top-2 z-45 rounded-xl"
      style={{
        ...glassEffect,
        willChange: 'transform, opacity',
        transform: 'translateZ(0)'
      }}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <motion.div
            variants={itemVariants}
            whileHover={{ 
              scale: 1.05,
              rotate: 3,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)'
            }}
            whileTap={{ scale: 0.95, rotate: -3 }}
            className="w-14 h-14 rounded-xl mr-4 flex items-center justify-center shadow-lg"
            style={{ 
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
              boxShadow: `0 10px 15px -3px ${theme.primary}40`,
              willChange: 'transform',
              transform: 'translateZ(0)'
            }}
          >
            {title === 'Scan Retina' ? (
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : title === 'Dashboard' ? (
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h2a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3" />
              </svg>
            ) : title === 'Data Pasien' ? (
              <UserCircleIcon className="w-7 h-7 text-white" />
            ) : title === 'History' ? (
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : title === 'Analysis' ? (
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            ) : title === 'Report' ? (
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            ) : (
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            )}
          </motion.div>
          <div>
            <motion.h2 
              variants={itemVariants}
              className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800"
            >
              {title}
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: '100%' }}
              transition={{ 
                delay: 0.2, 
                duration: 0.6,
                type: 'spring',
                stiffness: 400,
                damping: 30
              }}
              className="h-1 rounded-full mt-1 max-w-[160px]"
              style={{ 
                background: `linear-gradient(to right, ${theme.primary}, ${theme.accent})`,
                willChange: 'width, opacity'
              }}
            />
          </div>
        </div>

        {/* Search Bar - Hidden on Mobile */}
        <motion.div 
          variants={itemVariants}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="hidden md:flex items-center relative max-w-md flex-1 mx-4"
        >
          <motion.div 
            className="relative w-full"
            animate={{ 
              width: searchFocused ? '100%' : '90%',
              boxShadow: searchFocused 
                ? '0 10px 25px -5px rgba(0, 0, 0, 0.1)' 
                : '0 4px 12px -2px rgba(0, 0, 0, 0.05)'
            }}
            transition={{ duration: 0.3 }}
          >
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari pasien, analisis, atau laporan..."
              className="pl-10 pr-4 py-2 w-full rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </motion.div>
        </motion.div>

        {/* Header Actions */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="hidden md:flex items-center space-x-3"
        >
          {/* Notifications */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-white/50 hover:bg-white/80 transition-colors duration-300 relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <BellIcon className="h-5 w-5 text-gray-600" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </motion.button>
            
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg overflow-hidden z-50"
                  style={{
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                  }}
                >
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <h3 className="font-medium">Notifikasi</h3>
                  </div>
                  <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                      <motion.div 
                        key={notification.id}
                        className="p-3 hover:bg-gray-50 cursor-pointer"
                        whileHover={{ backgroundColor: 'rgba(243, 244, 246, 0.8)' }}
                      >
                        <p className="text-sm font-medium text-gray-800">{notification.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </motion.div>
                    ))}
                  </div>
                  <div className="p-2 text-center border-t border-gray-100">
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      Lihat semua notifikasi
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Settings */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg bg-white/50 hover:bg-white/80 transition-colors duration-300"
          >
            <Cog6ToothIcon className="h-5 w-5 text-gray-600" />
          </motion.button>
          
          {/* User Profile */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-1 rounded-lg bg-white/50 hover:bg-white/80 transition-colors duration-300 flex items-center"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                A
              </div>
              <ChevronDownIcon className="h-4 w-4 text-gray-600 ml-1" />
            </motion.button>
            
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg overflow-hidden z-50"
                  style={{
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                  }}
                >
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <p className="font-medium">Admin</p>
                    <p className="text-xs opacity-80">admin@retinascan.com</p>
                  </div>
                  <div className="divide-y divide-gray-100">
                    <button className="p-3 w-full text-left hover:bg-gray-50 text-sm">
                      Profil Saya
                    </button>
                    <button className="p-3 w-full text-left hover:bg-gray-50 text-sm">
                      Pengaturan
                    </button>
                    <button className="p-3 w-full text-left hover:bg-gray-50 text-sm text-red-600">
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Hamburger button in the header for mobile */}
        {isMobile && (
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
              position: 'relative'
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
      </div>
      
      {/* Mobile Search Bar */}
      <motion.div
        variants={itemVariants}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="mt-4 md:hidden relative"
      >
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Cari..."
          className="pl-10 pr-4 py-2 w-full rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
        />
      </motion.div>
      
      {/* Breadcrumb - Optional */}
      {title !== 'Dashboard' && (
        <motion.div
          variants={itemVariants}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-2 flex items-center text-xs text-gray-500"
        >
          <span className="hover:text-blue-600 cursor-pointer">Dashboard</span>
          <svg className="h-3 w-3 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-blue-600 font-medium">{title}</span>
        </motion.div>
      )}
    </motion.header>
  );
}

export default Header;