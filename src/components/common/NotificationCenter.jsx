import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useNotification } from '../../context/NotificationContext';
import { 
  BellIcon, 
  XMarkIcon, 
  CheckIcon, 
  TrashIcon, 
  UserPlusIcon, 
  UserIcon, 
  EyeIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotification();
  const notificationRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Deteksi perubahan ukuran layar
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Close notification center when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const toggleNotificationCenter = () => {
    setIsOpen(!isOpen);
  };
  
  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Handle different notification types
    switch (notification.type) {
      case 'new_analysis':
        // Navigate to analysis details page
        if (notification.data && notification.data.analysisId) {
          window.location.href = `/#/scan-retina?analysisId=${notification.data.analysisId}`;
        }
        break;
      case 'patient_added':
      case 'patient_updated':
        // Navigate to patient details page
        if (notification.data && notification.data.patientId) {
          window.location.href = `/#/patients/${notification.data.patientId}`;
        }
        break;
      case 'patient_deleted':
        // Navigate to patients list
        window.location.href = '/#/patients';
        break;
      default:
        break;
    }
  };
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'patient_added':
        return <UserPlusIcon className="w-5 h-5 text-green-500" />;
      case 'patient_updated':
        return <UserIcon className="w-5 h-5 text-blue-500" />;
      case 'patient_deleted':
        return <TrashIcon className="w-5 h-5 text-red-500" />;
      case 'new_analysis':
        return <EyeIcon className="w-5 h-5 text-purple-500" />;
      default:
        return <ExclamationCircleIcon className="w-5 h-5 text-gray-500" />;
    }
  };
  
  const getNotificationColor = (notification) => {
    // Untuk notifikasi scan retina, warna berdasarkan tingkat keparahan
    if (notification.type === 'new_analysis' && notification.data && notification.data.severityLevel !== undefined) {
      const severityLevel = notification.data.severityLevel;
      
      switch (severityLevel) {
        case 0: // Tidak ada
          return 'bg-green-50 hover:bg-green-100';
        case 1: // Ringan
          return 'bg-blue-50 hover:bg-blue-100';
        case 2: // Sedang
          return 'bg-yellow-50 hover:bg-yellow-100';
        case 3: // Berat
          return 'bg-orange-50 hover:bg-orange-100';
        case 4: // Sangat Berat
          return 'bg-red-50 hover:bg-red-100';
        default:
          return notification.read ? '' : 'bg-blue-50';
      }
    }
    
    // Default untuk notifikasi lain
    return notification.read ? '' : 'bg-blue-50';
  };
  
  const formatTimestamp = (timestamp) => {
    try {
      return format(new Date(timestamp), 'dd MMM yyyy, HH:mm', { locale: id });
    } catch (error) {
      return 'Waktu tidak valid';
    }
  };
  
  return (
    <div className="relative" ref={notificationRef}>
      {/* Notification Bell Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleNotificationCenter}
        className="p-2 rounded-lg bg-white/50 hover:bg-white/80 transition-colors duration-200 relative"
        aria-label="Notifikasi"
      >
        <BellIcon className="h-5 w-5 sm:h-5 sm:w-5 text-gray-600" />
        
        {/* Notification Badge */}
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </motion.button>
      
      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed sm:absolute right-0 sm:right-0 top-16 sm:top-auto sm:mt-2 w-full sm:w-80 md:w-96 max-h-[80vh] bg-white rounded-xl shadow-lg z-50 overflow-hidden"
            style={{
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: '1px solid rgba(229, 231, 235, 1)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600">
              <h3 className="text-lg font-medium text-white">Notifikasi</h3>
              <div className="flex space-x-2">
                <button 
                  onClick={markAllAsRead} 
                  className="p-1 rounded-full hover:bg-white/20 transition-colors"
                  title="Tandai semua sudah dibaca"
                >
                  <CheckIcon className="h-5 w-5 text-white" />
                </button>
                <button 
                  onClick={clearAll} 
                  className="p-1 rounded-full hover:bg-white/20 transition-colors"
                  title="Hapus semua notifikasi"
                >
                  <TrashIcon className="h-5 w-5 text-white" />
                </button>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-1 rounded-full hover:bg-white/20 transition-colors"
                  title="Tutup"
                >
                  <XMarkIcon className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>
            
            {/* Notification List */}
            <div className="overflow-y-auto max-h-[60vh]">
              {notifications.length === 0 ? (
                <div className="py-8 px-4 text-center text-gray-500">
                  <p>Tidak ada notifikasi</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <motion.li
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ backgroundColor: 'rgba(243, 244, 246, 0.5)' }}
                      onClick={() => handleNotificationClick(notification)}
                      className={`px-4 py-3 cursor-pointer transition-colors ${getNotificationColor(notification)}`}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                            {!notification.read && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Baru
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter; 