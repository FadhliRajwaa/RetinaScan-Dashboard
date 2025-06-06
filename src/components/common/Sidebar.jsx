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
  // Inisialisasi state isOpen dari localStorage atau default ke true
  const [isOpen, setIsOpen] = useState(() => {
    const savedState = localStorage.getItem('sidebarOpen');
    return savedState !== null ? savedState === 'true' : true;
  });
  
  const [activeIndex, setActiveIndex] = useState(null);
  const location = useLocation();
  const { theme, isDarkMode } = useTheme();
  
  // Set active index based on current location
  useEffect(() => {
    const index = menuItems.findIndex(item => item.path === location.pathname);
    setActiveIndex(index >= 0 ? index : null);
  }, [location.pathname]);

  // Simpan state isOpen ke localStorage setiap kali berubah
  useEffect(() => {
    localStorage.setItem('sidebarOpen', isOpen);
  }, [isOpen]);

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

  // Warna untuk tema gelap dan terang
  const bgColor = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const textColorPrimary = isDarkMode ? 'text-white' : 'text-gray-800';
  const textColorSecondary = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const borderColor = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const hoverBgColor = isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100';
  const activeBgColor = isDarkMode 
    ? `bg-opacity-20 bg-${theme.primary.replace('#', '')}`
    : `bg-opacity-10 bg-${theme.primary.replace('#', '')}`;

  // Toggle sidebar function
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Overlay for Mobile Menu */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-screen w-[280px] z-50 overflow-hidden ${bgColor} shadow-lg transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Header: Logo and Close Button */}
          <div className={`p-5 flex items-center justify-between ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="flex flex-col">
              <h1 
                className="text-2xl font-extrabold tracking-tight"
                style={{
                  background: `linear-gradient(90deg, ${theme.primary}, ${theme.accent})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                RetinaScan
              </h1>
              <div className={`h-1 w-28 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full mt-1`} />
            </div>
            <button
              onClick={toggleMobileMenu}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'} hover:scale-105 active:scale-95 transition-transform`}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Scrollable Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 scroll-smooth">
            {menuItems.map((item, index) => (
              <div
                key={item.path}
                className="mb-2"
              >
                {item.external ? (
                  <a
                    href={item.path}
                    onClick={toggleMobileMenu}
                    className={`flex items-center p-4 rounded-xl transition-all duration-200 ${textColorSecondary} ${location.pathname === item.path ? `${activeBgColor} shadow-inner` : ''} ${hoverBgColor}`}
                  >
                    <item.icon className={`h-6 w-6 mr-3`} style={{ color: theme.primary }} />
                    <span className="text-base font-medium">{item.name}</span>
                  </a>
                ) : (
                  <Link
                    to={item.path}
                    onClick={toggleMobileMenu}
                    className={`flex items-center p-4 rounded-xl transition-all duration-200 ${textColorSecondary} ${location.pathname === item.path ? `${activeBgColor} shadow-inner` : ''} ${hoverBgColor}`}
                  >
                    <item.icon className={`h-6 w-6 mr-3`} style={{ color: theme.primary }} />
                    <span className="text-base font-medium">{item.name}</span>
                  </Link>
                )}
              </div>
            ))}
          </nav>
          
          {/* Logout Button */}
          <div className={`p-4 border-t ${borderColor}`}>
            <button
              onClick={(e) => handleLogoutEvent(e, toggleMobileMenu, FRONTEND_URL)}
              className="flex items-center p-4 w-full rounded-xl transition-all duration-200 bg-gradient-to-r from-red-500 to-red-400 text-white hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              <ArrowLeftOnRectangleIcon className="h-6 w-6 mr-3" />
              <span className="text-base font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Desktop/Tablet Sidebar */}
      <aside
        className={`hidden lg:flex flex-col h-screen sticky top-0 z-40 ${bgColor} shadow-md transition-all duration-300 ease-in-out ${isOpen ? 'w-[280px]' : 'w-[80px]'}`}
      >
        <div className={`p-5 flex justify-between items-center border-b ${borderColor}`}>
          {isOpen ? (
            <div className="flex flex-col">
              <h1 
                className="text-2xl font-extrabold tracking-tight"
                style={{
                  background: `linear-gradient(90deg, ${theme.primary}, ${theme.accent})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                RetinaScan
              </h1>
              <div className={`h-1 w-28 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full mt-1`} />
            </div>
          ) : (
            <div
              className="w-10 h-10 flex items-center justify-center rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${theme.accent}, ${theme.primary})`,
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
              }}
            >
              <span className="text-xl font-extrabold text-white">R</span>
            </div>
          )}
          
          <button 
            onClick={toggleSidebar}
            className={`p-2 rounded-xl ${hoverBgColor} transition-colors duration-150`}
            style={{ color: theme.primary }}
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              style={{
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease-out'
              }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-4 py-5 pb-20">
          {menuItems.map((item, index) => (
            <div
              key={item.path}
              className="mb-2"
            >
              {item.external ? (
                <a
                  href={item.path}
                  className={`flex items-center p-3 rounded-xl transition-all duration-200 ${textColorSecondary} ${location.pathname === item.path ? `${activeBgColor} shadow-inner` : ''} ${hoverBgColor}`}
                >
                  <item.icon className="h-5 w-5 min-w-[1.25rem]" style={{ color: theme.primary }} />
                  {isOpen && (
                    <span className="ml-3 text-sm font-medium whitespace-nowrap overflow-hidden">
                      {item.name}
                    </span>
                  )}
                </a>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center p-3 rounded-xl transition-all duration-200 ${textColorSecondary} ${location.pathname === item.path ? `${activeBgColor} shadow-inner` : ''} ${hoverBgColor}`}
                >
                  <item.icon className="h-5 w-5 min-w-[1.25rem]" style={{ color: theme.primary }} />
                  {isOpen && (
                    <span className="ml-3 text-sm font-medium whitespace-nowrap overflow-hidden">
                      {item.name}
                    </span>
                  )}
                </Link>
              )}
            </div>
          ))}
        </nav>
        
        {/* Logout Button for Desktop */}
        {isOpen ? (
          <div className={`p-4 border-t ${borderColor}`}>
            <button
              onClick={(e) => handleLogoutEvent(e, null, FRONTEND_URL)}
              className="flex items-center p-3 w-full rounded-xl transition-all duration-200 bg-gradient-to-r from-red-500 to-red-400 text-white hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5 min-w-[1.25rem]" />
              <span className="ml-3 text-sm font-medium whitespace-nowrap">
                Logout
              </span>
            </button>
          </div>
        ) : (
          <div className={`p-4 border-t ${borderColor}`}>
            <button
              onClick={(e) => handleLogoutEvent(e, null, FRONTEND_URL)}
              className="flex items-center justify-center p-3 w-full rounded-xl transition-all duration-200 bg-gradient-to-r from-red-500 to-red-400 text-white hover:shadow-md hover:scale-110 active:scale-90"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

export default Sidebar;