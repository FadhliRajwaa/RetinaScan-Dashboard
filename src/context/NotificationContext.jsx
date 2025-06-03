import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useSocket } from './SocketContext';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket, connected } = useSocket();
  
  // Deteksi perangkat mobile
  const isMobile = window.innerWidth < 768;
  
  // Batasi jumlah notifikasi yang disimpan berdasarkan jenis perangkat
  const maxNotifications = isMobile ? 20 : 50;
  
  // Load notifications from localStorage on mount
  useEffect(() => {
    try {
      const savedNotifications = localStorage.getItem('notifications');
      if (savedNotifications) {
        try {
          const parsedNotifications = JSON.parse(savedNotifications);
          // Batasi jumlah notifikasi yang dimuat
          const limitedNotifications = parsedNotifications.slice(0, maxNotifications);
          setNotifications(limitedNotifications);
          
          // Count unread notifications
          const unread = limitedNotifications.filter(notif => !notif.read).length;
          setUnreadCount(unread);
        } catch (error) {
          console.error('Error parsing saved notifications:', error);
          // Reset jika terjadi error parsing
          localStorage.removeItem('notifications');
          setNotifications([]);
          setUnreadCount(0);
        }
      }
    } catch (error) {
      console.error('Error loading notifications from localStorage:', error);
    }
  }, [maxNotifications]);
  
  // Save notifications to localStorage whenever they change
  useEffect(() => {
    try {
      if (notifications.length > 0) {
        localStorage.setItem('notifications', JSON.stringify(notifications));
      }
    } catch (error) {
      console.error('Error saving notifications to localStorage:', error);
    }
  }, [notifications]);
  
  // Handle new notification - menggunakan useCallback untuk mencegah re-render berlebihan
  const handleNewNotification = useCallback((notification) => {
    try {
      setNotifications(prev => {
        // Limit to maxNotifications
        const updated = [notification, ...prev].slice(0, maxNotifications);
        return updated;
      });
      
      setUnreadCount(prev => prev + 1);
      
      // Show toast notification
      toast.info(notification.message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        // Responsif untuk mobile
        style: {
          fontSize: '14px',
          maxWidth: '100%',
          width: isMobile ? '90%' : '400px'
        }
      });
      
      // Play notification sound
      playNotificationSound();
    } catch (error) {
      console.error('Error handling new notification:', error);
    }
  }, [maxNotifications, isMobile]);
  
  // Listen for socket events
  useEffect(() => {
    if (!socket || !connected) return;
    
    try {
      // Listen for patient-related notifications
      socket.on('patient_added', (data) => {
        handleNewNotification({
          id: `patient_added_${Date.now()}`,
          type: 'patient_added',
          title: 'Pasien Baru',
          message: `Pasien baru telah ditambahkan: ${data.patientName || 'Tanpa nama'}`,
          timestamp: new Date().toISOString(),
          data,
          read: false
        });
      });
      
      socket.on('patient_updated', (data) => {
        handleNewNotification({
          id: `patient_updated_${Date.now()}`,
          type: 'patient_updated',
          title: 'Data Pasien Diperbarui',
          message: `Data pasien telah diperbarui: ${data.patientName || 'Tanpa nama'}`,
          timestamp: new Date().toISOString(),
          data,
          read: false
        });
      });
      
      socket.on('patient_deleted', (data) => {
        handleNewNotification({
          id: `patient_deleted_${Date.now()}`,
          type: 'patient_deleted',
          title: 'Pasien Dihapus',
          message: `Data pasien telah dihapus: ${data.patientName || 'Tanpa nama'}`,
          timestamp: new Date().toISOString(),
          data,
          read: false
        });
      });
      
      // Listen for new analysis notification
      socket.on('new_analysis', (data) => {
        handleNewNotification({
          id: `new_analysis_${Date.now()}`,
          type: 'new_analysis',
          title: 'Hasil Scan Retina Baru',
          message: `Hasil scan retina untuk pasien ${data.patientName || 'Tanpa nama'} telah tersedia. Tingkat keparahan: ${data.severity || 'Tidak diketahui'}`,
          timestamp: new Date().toISOString(),
          data,
          read: false
        });
      });
      
      // Listen for general notifications
      socket.on('notification', (data) => {
        handleNewNotification({
          id: `notification_${Date.now()}`,
          type: 'general',
          title: data.title || 'Notifikasi',
          message: data.message || 'Anda memiliki notifikasi baru',
          timestamp: new Date().toISOString(),
          data,
          read: false
        });
      });
      
      return () => {
        try {
          socket.off('patient_added');
          socket.off('patient_updated');
          socket.off('patient_deleted');
          socket.off('new_analysis');
          socket.off('notification');
        } catch (error) {
          console.error('Error removing socket listeners:', error);
        }
      };
    } catch (error) {
      console.error('Error setting up notification listeners:', error);
      return () => {};
    }
  }, [socket, connected, handleNewNotification]);
  
  // Play notification sound
  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.5;
      
      // Tambahkan event listener untuk error
      audio.addEventListener('error', (e) => {
        console.error('Error loading notification sound:', e);
        
        // Fallback ke beep API jika tersedia
        if ('Audio' in window) {
          try {
            const beep = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU");
            beep.volume = 0.5;
            beep.play().catch(err => {
              console.error('Error playing fallback beep:', err);
            });
          } catch (beepError) {
            console.error('Error playing fallback beep:', beepError);
          }
        }
      });
      
      // Play audio dengan promise handling
      const playPromise = audio.play();
      
      // Modern browsers return a promise
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Error playing notification sound:', error);
          // Tidak perlu menampilkan toast error untuk masalah suara
        });
      }
    } catch (error) {
      console.error('Error in audio playback:', error);
    }
  }, []);
  
  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    try {
      setNotifications(prev => {
        const updated = prev.map(notif => {
          if (notif.id === notificationId) {
            return { ...notif, read: true };
          }
          return notif;
        });
        
        return updated;
      });
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);
  
  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    try {
      setNotifications(prev => {
        const updated = prev.map(notif => ({ ...notif, read: true }));
        return updated;
      });
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, []);
  
  // Clear all notifications
  const clearAll = useCallback(() => {
    try {
      setNotifications([]);
      setUnreadCount(0);
      localStorage.removeItem('notifications');
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }, []);
  
  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext; 