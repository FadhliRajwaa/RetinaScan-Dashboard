import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { 
  BellIcon, 
  CheckCircleIcon, 
  XMarkIcon, 
  TrashIcon, 
  CheckIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  UserPlusIcon,
  UserMinusIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';
import NotificationSound from '../../../public/notification-sound.mp3';

const NotificationCenter = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { theme, isDarkMode } = useTheme();
  const { unreadCount, setUnreadCount, socket } = useNotification();
  const navigate = useNavigate();
  const notificationSound = new Audio(NotificationSound);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  // Fungsi untuk mendapatkan notifikasi
  const fetchNotifications = useCallback(async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan');
      }
      
      const response = await axios.get(`${API_URL}/api/notifications?page=${pageNum}&limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const { notifications: fetchedNotifications, pagination, unreadCount } = response.data;
      
      // Update state notifikasi
      setNotifications(prev => 
        append ? [...prev, ...fetchedNotifications] : fetchedNotifications
      );
      
      // Update jumlah notifikasi yang belum dibaca
      setUnreadCount(unreadCount);
      
      // Cek apakah masih ada halaman berikutnya
      setHasMore(pagination.page < pagination.pages);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Gagal memuat notifikasi');
      setLoading(false);
    }
  }, [API_URL, setUnreadCount]);
  
  // Fungsi untuk memuat lebih banyak notifikasi
  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotifications(nextPage, true);
    }
  };
  
  // Fungsi untuk menandai notifikasi sebagai dibaca
  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan');
      }
      
      await axios.patch(`${API_URL}/api/notifications/${notificationId}/read`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update state notifikasi
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
      
      // Update jumlah notifikasi yang belum dibaca
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Gagal menandai notifikasi sebagai dibaca');
    }
  };
  
  // Fungsi untuk menandai semua notifikasi sebagai dibaca
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan');
      }
      
      await axios.patch(`${API_URL}/api/notifications/read-all`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update state notifikasi
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      
      // Update jumlah notifikasi yang belum dibaca
      setUnreadCount(0);
      
      toast.success('Semua notifikasi ditandai sebagai dibaca');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Gagal menandai semua notifikasi sebagai dibaca');
    }
  };
  
  // Fungsi untuk menghapus notifikasi
  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan');
      }
      
      await axios.delete(`${API_URL}/api/notifications/${notificationId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update state notifikasi
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      
      toast.success('Notifikasi berhasil dihapus');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Gagal menghapus notifikasi');
    }
  };
  
  // Fungsi untuk menghapus semua notifikasi
  const deleteAllNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan');
      }
      
      await axios.delete(`${API_URL}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update state notifikasi
      setNotifications([]);
      
      // Update jumlah notifikasi yang belum dibaca
      setUnreadCount(0);
      
      toast.success('Semua notifikasi berhasil dihapus');
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      toast.error('Gagal menghapus semua notifikasi');
    }
  };
  
  // Fungsi untuk menangani klik pada notifikasi
  const handleNotificationClick = (notification) => {
    // Tandai notifikasi sebagai dibaca jika belum dibaca
    if (!notification.read) {
      markAsRead(notification._id);
    }
    
    // Navigasi berdasarkan tipe notifikasi
    if (notification.type === 'patient_added' || notification.type === 'patient_updated') {
      const patientId = notification.entityId;
      if (patientId) {
        navigate(`/patient-profile/${patientId}`);
        onClose();
      }
    } else if (notification.type === 'scan_added' || notification.type === 'scan_updated') {
      const scanId = notification.entityId;
      if (scanId) {
        navigate(`/scan-result/${scanId}`);
        onClose();
      }
    }
  };
  
  // Fungsi untuk mendapatkan ikon berdasarkan tipe notifikasi
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'patient_added':
        return <UserPlusIcon className="h-6 w-6 text-green-500" />;
      case 'patient_updated':
        return <PencilSquareIcon className="h-6 w-6 text-blue-500" />;
      case 'patient_deleted':
        return <UserMinusIcon className="h-6 w-6 text-red-500" />;
      case 'scan_added':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'scan_updated':
        return <PencilSquareIcon className="h-6 w-6 text-blue-500" />;
      case 'system':
        return <InformationCircleIcon className="h-6 w-6 text-purple-500" />;
      default:
        return <BellIcon className="h-6 w-6 text-gray-500" />;
    }
  };
  
  // Fungsi untuk memformat waktu relatif
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'baru saja';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} menit yang lalu`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} jam yang lalu`;
    } else {
      return format(date, 'dd MMMM yyyy, HH:mm', { locale: id });
    }
  };
  
  // Efek untuk memuat notifikasi saat komponen dimuat
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);
  
  // Efek untuk menangani notifikasi baru dari Socket.IO
  useEffect(() => {
    if (socket) {
      const handleNewNotification = (data) => {
        // Putar suara notifikasi
        notificationSound.play().catch(e => console.log('Error playing sound:', e));
        
        // Update state notifikasi
        setNotifications(prev => [data.notification, ...prev]);
        
        // Update jumlah notifikasi yang belum dibaca
        setUnreadCount(data.unreadCount);
        
        // Tampilkan toast
        toast.info(data.notification.message, {
          icon: () => getNotificationIcon(data.notification.type)
        });
      };
      
      socket.on('notification', handleNewNotification);
      
      return () => {
        socket.off('notification', handleNewNotification);
      };
    }
  }, [socket, setUnreadCount, notificationSound]);
  
  // Variasi animasi
  const containerVariants = {
    hidden: { opacity: 0, x: 300 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      opacity: 0, 
      x: 300,
      transition: { 
        duration: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={onClose}
          />
          
          {/* Notification Panel */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`fixed right-0 top-0 h-full w-full sm:w-96 z-50 ${
              isDarkMode 
                ? 'bg-gray-900 text-white' 
                : 'bg-white text-gray-800'
            } shadow-lg overflow-hidden flex flex-col`}
          >
            {/* Header */}
            <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
              <div className="flex items-center">
                <BellIcon className="h-6 w-6 mr-2" />
                <h2 className="text-xl font-semibold">Notifikasi</h2>
                {unreadCount > 0 && (
                  <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-red-500 text-white">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className={`p-1 rounded-full ${
                  isDarkMode 
                    ? 'hover:bg-gray-800' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            {/* Actions */}
            <div className={`p-2 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between`}>
              <button
                onClick={markAllAsRead}
                className="px-3 py-1 text-sm flex items-center rounded-md hover:bg-blue-100 hover:text-blue-700 transition-colors"
                disabled={unreadCount === 0}
              >
                <CheckIcon className="h-4 w-4 mr-1" />
                Tandai Semua Dibaca
              </button>
              <button
                onClick={deleteAllNotifications}
                className="px-3 py-1 text-sm flex items-center rounded-md hover:bg-red-100 hover:text-red-700 transition-colors"
                disabled={notifications.length === 0}
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                Hapus Semua
              </button>
            </div>
            
            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto p-2">
              {loading && notifications.length === 0 ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-64 text-center">
                  <BellIcon className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">Tidak ada notifikasi</p>
                </div>
              ) : (
                <>
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification._id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.05 }}
                      className={`mb-2 p-3 rounded-lg cursor-pointer ${
                        notification.read 
                          ? isDarkMode 
                            ? 'bg-gray-800' 
                            : 'bg-gray-50' 
                          : isDarkMode 
                            ? 'bg-blue-900/30' 
                            : 'bg-blue-50'
                      } hover:bg-opacity-80 transition-colors relative`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex">
                        <div className="mr-3">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{notification.title}</h3>
                          <p className="text-sm">{notification.message}</p>
                          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {formatRelativeTime(notification.createdAt)}
                          </p>
                        </div>
                        <div className="flex flex-col space-y-2">
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification._id);
                              }}
                              className="p-1 rounded-full hover:bg-blue-200 text-blue-700"
                              title="Tandai sebagai dibaca"
                            >
                              <CheckCircleIcon className="h-5 w-5" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification._id);
                            }}
                            className="p-1 rounded-full hover:bg-red-200 text-red-700"
                            title="Hapus notifikasi"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Load More Button */}
                  {hasMore && (
                    <div className="flex justify-center my-4">
                      <button
                        onClick={loadMore}
                        disabled={loading}
                        className={`px-4 py-2 rounded-md ${
                          isDarkMode 
                            ? 'bg-gray-800 hover:bg-gray-700' 
                            : 'bg-gray-100 hover:bg-gray-200'
                        } transition-colors`}
                      >
                        {loading ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                        ) : (
                          'Muat Lebih Banyak'
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationCenter; 