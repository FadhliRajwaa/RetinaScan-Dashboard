import { createContext, useState, useContext, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    patient_added: true,
    patient_updated: true,
    patient_deleted: true,
    scan_added: true,
    scan_updated: true,
    system: true
  });
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  // Fungsi untuk mengambil pengaturan notifikasi
  const fetchNotificationSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) return;
      
      const response = await axios.get(`${API_URL}/api/users/notification-settings`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.notificationSettings) {
        setNotificationSettings(response.data.notificationSettings);
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    }
  };
  
  // Fungsi untuk menyimpan pengaturan notifikasi
  const updateNotificationSettings = async (settings) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) return;
      
      const response = await axios.put(
        `${API_URL}/api/users/notification-settings`,
        { notificationSettings: settings },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data && response.data.notificationSettings) {
        setNotificationSettings(response.data.notificationSettings);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      return false;
    }
  };
  
  // Mengambil pengaturan notifikasi saat komponen dimount
  useEffect(() => {
    fetchNotificationSettings();
  }, []);
  
  // Inisialisasi Socket.IO dan koneksikan ke server
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) return;
    
    // Cek apakah token masih valid
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      if (decoded.exp < currentTime) {
        console.log('Token expired');
        localStorage.removeItem('token');
        return;
      }
      
      // Buat koneksi Socket.IO
      const socketInstance = io(API_URL, {
        auth: {
          token
        },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000
      });
      
      socketInstance.on('connect', () => {
        console.log('Socket.IO connected:', socketInstance.id);
        
        // Dapatkan jumlah notifikasi yang belum dibaca
        socketInstance.emit('get_unread_count');
      });
      
      socketInstance.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error.message);
        toast.error('Gagal terhubung ke server notifikasi');
      });
      
      socketInstance.on('error', (error) => {
        console.error('Socket.IO error:', error.message);
      });
      
      socketInstance.on('disconnect', (reason) => {
        console.log('Socket.IO disconnected:', reason);
      });
      
      socketInstance.on('unread_count', (data) => {
        setUnreadCount(data.unreadCount);
      });
      
      setSocket(socketInstance);
      
      // Cleanup pada unmount
      return () => {
        socketInstance.disconnect();
      };
    } catch (error) {
      console.error('Error initializing socket:', error);
    }
  }, [API_URL]);
  
  // Dapatkan jumlah notifikasi yang belum dibaca dari API
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) return;
        
        const response = await axios.get(`${API_URL}/api/notifications?limit=1`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setUnreadCount(response.data.unreadCount);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };
    
    fetchUnreadCount();
    
    // Polling setiap 5 menit sebagai fallback jika Socket.IO tidak berfungsi
    const interval = setInterval(fetchUnreadCount, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [API_URL]);
  
  // Fungsi untuk membuka/menutup notifikasi
  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };
  
  // Fungsi untuk menutup notifikasi
  const closeNotification = () => {
    setIsNotificationOpen(false);
  };
  
  return (
    <NotificationContext.Provider value={{ 
      unreadCount, 
      isNotificationOpen, 
      toggleNotification, 
      closeNotification,
      notificationSettings,
      updateNotificationSettings
    }}>
      {children}
    </NotificationContext.Provider>
  );
}; 