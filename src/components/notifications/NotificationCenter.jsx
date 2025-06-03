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

// Fungsi untuk menyimpan notifikasi ke localStorage
const saveNotificationsToStorage = (notifications) => {
  try {
    localStorage.setItem('notifications', JSON.stringify(notifications));
    console.log('Saved notifications to localStorage:', notifications.length);
  } catch (error) {
    console.error('Error saving notifications to localStorage:', error);
  }
};

// Fungsi untuk mengambil notifikasi dari localStorage
const getNotificationsFromStorage = () => {
  try {
    const storedNotifications = localStorage.getItem('notifications');
    if (storedNotifications) {
      const parsed = JSON.parse(storedNotifications);
      console.log('Loaded notifications from localStorage:', parsed.length);
      return parsed;
    }
  } catch (error) {
    console.error('Error loading notifications from localStorage:', error);
  }
  return [];
};

const NotificationCenter = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState(() => getNotificationsFromStorage());
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
      
      console.log('Fetched notifications:', fetchedNotifications);
      
      // Update state notifikasi - hanya ganti jika ini adalah request halaman pertama dan bukan append
      let updatedNotifications;
      
      // Jika server mengembalikan array kosong dan kita sudah memiliki notifikasi di localStorage,
      // pertahankan notifikasi yang sudah ada
      if (fetchedNotifications.length === 0 && notifications.length > 0) {
        console.log('Server returned empty array, keeping existing notifications');
        updatedNotifications = notifications;
      } else if (append) {
        // Jika append, tambahkan notifikasi baru ke daftar yang sudah ada
        updatedNotifications = [...notifications, ...fetchedNotifications];
        setNotifications(updatedNotifications);
      } else if (pageNum === 1) {
        // Jika halaman pertama dan server mengembalikan data
        updatedNotifications = fetchedNotifications;
        setNotifications(updatedNotifications);
      } else {
        updatedNotifications = notifications;
      }
      
      // Simpan notifikasi ke localStorage
      saveNotificationsToStorage(updatedNotifications);
      
      // Update jumlah notifikasi yang belum dibaca
      if (typeof unreadCount === 'number') {
        setUnreadCount(unreadCount);
      } else {
        // Hitung jumlah notifikasi yang belum dibaca dari state
        const unreadNotifications = updatedNotifications.filter(n => n.read === false).length;
        setUnreadCount(unreadNotifications);
      }
      
      // Cek apakah masih ada halaman berikutnya
      setHasMore(pagination && pagination.page < pagination.pages);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Gagal memuat notifikasi');
      setLoading(false);
    }
  }, [API_URL, setUnreadCount, notifications]);
  
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
      // Validasi notificationId
      if (!notificationId) {
        console.error('Notification ID is undefined');
        toast.error('Gagal menandai notifikasi: ID tidak valid');
        return;
      }
      
      console.log('Marking notification as read, ID:', notificationId);
      
      // Jika ini adalah ID temporer (dimulai dengan 'temp_'), hanya update state lokal
      if (notificationId.startsWith('temp_')) {
        console.log('Marking notification with temporary ID as read (local state only)');
        
        // Update state notifikasi
        const updatedNotifications = notifications.map(notif => 
          notif._id === notificationId ? { ...notif, read: true } : notif
        );
        
        setNotifications(updatedNotifications);
        
        // Simpan notifikasi yang diperbarui ke localStorage
        saveNotificationsToStorage(updatedNotifications);
        
        // Update jumlah notifikasi yang belum dibaca
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        return;
      }
      
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
      const updatedNotifications = notifications.map(notif => 
        notif._id === notificationId ? { ...notif, read: true } : notif
      );
      
      setNotifications(updatedNotifications);
      
      // Simpan notifikasi yang diperbarui ke localStorage
      saveNotificationsToStorage(updatedNotifications);
      
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
      const updatedNotifications = notifications.map(notif => ({ ...notif, read: true }));
      setNotifications(updatedNotifications);
      
      // Simpan notifikasi yang diperbarui ke localStorage
      saveNotificationsToStorage(updatedNotifications);
      
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
      // Validasi notificationId
      if (!notificationId) {
        console.error('Notification ID is undefined');
        toast.error('Gagal menghapus notifikasi: ID tidak valid');
        return;
      }
      
      console.log('Deleting notification, ID:', notificationId);
      
      // Jika ini adalah ID temporer (dimulai dengan 'temp_'), hanya hapus dari state lokal
      if (notificationId.startsWith('temp_')) {
        console.log('Deleting notification with temporary ID from local state only');
        
        // Update state notifikasi
        const updatedNotifications = notifications.filter(notif => notif._id !== notificationId);
        setNotifications(updatedNotifications);
        
        // Simpan notifikasi yang diperbarui ke localStorage
        saveNotificationsToStorage(updatedNotifications);
        
        toast.success('Notifikasi berhasil dihapus');
        return;
      }
      
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
      const updatedNotifications = notifications.filter(notif => notif._id !== notificationId);
      setNotifications(updatedNotifications);
      
      // Simpan notifikasi yang diperbarui ke localStorage
      saveNotificationsToStorage(updatedNotifications);
      
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
      
      // Hapus notifikasi dari localStorage
      saveNotificationsToStorage([]);
      
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
    if (!notification) {
      console.error('Invalid notification object');
      return;
    }
    
    console.log('Clicked notification:', notification);
    
    if (!notification._id) {
      console.error('Notification has no valid ID:', notification);
      toast.error('Notifikasi tidak memiliki ID yang valid');
      return;
    }
    
    // Tandai notifikasi sebagai dibaca jika belum dibaca
    if (notification.read === false) {
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
  
  // Efek untuk menangani notifikasi baru dari Socket.IO
  useEffect(() => {
    if (socket) {
      const handleNewNotification = (data) => {
        try {
          // Log data notifikasi yang diterima untuk debugging
          console.log('Received notification data:', data);
          
          // Putar suara notifikasi
          notificationSound.play().catch(e => console.log('Error playing sound:', e));
          
          // Periksa struktur data
          if (!data) {
            console.error('Received empty notification data');
            return;
          }
          
          // Handle berbagai format data yang mungkin diterima
          const notification = data.notification || data;
          const newUnreadCount = data.unreadCount !== undefined ? data.unreadCount : (unreadCount + 1);
          
          if (!notification) {
            console.error('Invalid notification format received');
            return;
          }
          
          // Validasi ID notifikasi
          if (!notification._id) {
            console.error('Notification missing _id property:', notification);
            
            // Jika tidak ada ID, buat ID temporer
            notification._id = 'temp_' + new Date().getTime();
            console.log('Created temporary ID for notification:', notification._id);
          }
          
          // Log notifikasi yang akan ditambahkan
          console.log('Adding notification to state:', notification);
          
          // Update state notifikasi
          const updatedNotifications = [notification, ...notifications];
          setNotifications(updatedNotifications);
          
          // Simpan notifikasi yang diperbarui ke localStorage
          saveNotificationsToStorage(updatedNotifications);
          
          // Update jumlah notifikasi yang belum dibaca
          setUnreadCount(newUnreadCount);
          
          // Tampilkan toast jika ada pesan
          if (notification.message) {
            toast.info(notification.message, {
              icon: () => getNotificationIcon(notification.type)
            });
          }
        } catch (error) {
          console.error('Error handling notification:', error);
        }
      };
      
      socket.on('notification', handleNewNotification);
      
      return () => {
        socket.off('notification', handleNewNotification);
      };
    }
  }, [socket, setUnreadCount, notificationSound, unreadCount, notifications]);
  
  // Efek untuk memuat notifikasi saat komponen dibuka
  useEffect(() => {
    if (isOpen) {
      fetchNotifications(1, false);
    }
  }, [isOpen, fetchNotifications]);
  
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
                className={`px-3 py-1 text-sm flex items-center rounded-md transition-colors ${
                  unreadCount === 0 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'hover:bg-blue-100 hover:text-blue-700'
                }`}
                disabled={unreadCount === 0}
              >
                <CheckIcon className="h-4 w-4 mr-1" />
                Tandai Semua Dibaca
              </button>
              <button
                onClick={deleteAllNotifications}
                className={`px-3 py-1 text-sm flex items-center rounded-md transition-colors ${
                  notifications.length === 0 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'hover:bg-red-100 hover:text-red-700'
                }`}
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
                      key={notification._id || `notification-${index}`}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.05 }}
                      className={`mb-2 p-3 rounded-lg cursor-pointer ${
                        notification && notification.read === true
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
                          {getNotificationIcon(notification?.type || 'system')}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{notification?.title || 'Notifikasi'}</h3>
                          <p className="text-sm">{notification?.message || 'Tidak ada pesan'}</p>
                          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {notification?.createdAt ? formatRelativeTime(notification.createdAt) : 'Waktu tidak diketahui'}
                          </p>
                        </div>
                        <div className="flex flex-col space-y-2">
                          {notification && notification.read === false && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (notification && notification._id) {
                                  markAsRead(notification._id);
                                } else {
                                  console.error('Invalid notification ID');
                                  toast.error('Gagal menandai: ID notifikasi tidak valid');
                                }
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
                              if (notification && notification._id) {
                                deleteNotification(notification._id);
                              } else {
                                console.error('Invalid notification ID');
                                toast.error('Gagal menghapus: ID notifikasi tidak valid');
                              }
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