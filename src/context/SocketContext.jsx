import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    try {
      // Inisialisasi socket dengan token otentikasi
      const socketInstance = io(API_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000
      });
      
      socketInstance.on('connect', () => {
        console.log('Socket terhubung dengan ID:', socketInstance.id);
        setConnected(true);
        setReconnectAttempts(0);
        
        // Reset reconnection attempts counter
        socketInstance.io.reconnectionAttempts(10);
        
        // Join authenticated room
        socketInstance.emit('join_authenticated_room');
      });
      
      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
        
        // Hanya tampilkan toast jika bukan error pertama kali
        if (reconnectAttempts > 0) {
          toast.error('Gagal terhubung ke server notifikasi', {
            toastId: 'socket-connect-error' // Mencegah duplikasi toast
          });
        }
        
        setConnected(false);
        setReconnectAttempts(prev => prev + 1);
      });
      
      socketInstance.on('disconnect', (reason) => {
        console.log('Socket terputus:', reason);
        setConnected(false);
        
        if (reason === 'io server disconnect') {
          // Server memutuskan koneksi, coba sambungkan kembali
          setTimeout(() => {
            socketInstance.connect();
          }, 1000);
        }
        
        // Tampilkan toast jika terputus karena masalah jaringan
        if (reason === 'transport close' || reason === 'ping timeout') {
          toast.warning('Koneksi notifikasi terputus. Mencoba menghubungkan kembali...', {
            toastId: 'socket-disconnect' // Mencegah duplikasi toast
          });
        }
      });
      
      // Tambahkan event untuk reconnect
      socketInstance.io.on('reconnect', (attempt) => {
        console.log(`Berhasil terhubung kembali setelah ${attempt} percobaan`);
        toast.success('Berhasil terhubung kembali ke server notifikasi', {
          toastId: 'socket-reconnect-success' // Mencegah duplikasi toast
        });
        setReconnectAttempts(0);
      });
      
      socketInstance.io.on('reconnect_attempt', (attempt) => {
        console.log(`Mencoba terhubung kembali (percobaan ke-${attempt})`);
        setReconnectAttempts(attempt);
      });
      
      socketInstance.io.on('reconnect_error', (error) => {
        console.error('Reconnection error:', error);
      });
      
      socketInstance.io.on('reconnect_failed', () => {
        console.error('Gagal terhubung kembali setelah beberapa percobaan');
        toast.error('Gagal terhubung kembali ke server notifikasi setelah beberapa percobaan', {
          toastId: 'socket-reconnect-failed' // Mencegah duplikasi toast
        });
      });
      
      // Tes koneksi dengan ping-pong
      try {
        socketInstance.emit('ping', { 
          clientTime: new Date().toISOString(),
          message: 'Hello from dashboard client'
        });
        
        socketInstance.on('pong', (data) => {
          console.log('Pong dari server:', data);
        });
      } catch (pingError) {
        console.error('Error saat mengirim ping:', pingError);
      }
      
      setSocket(socketInstance);
      
      return () => {
        try {
          if (socketInstance) {
            console.log('Menutup koneksi socket');
            socketInstance.disconnect();
          }
        } catch (cleanupError) {
          console.error('Error saat menutup socket:', cleanupError);
        }
      };
    } catch (socketError) {
      console.error('Error saat inisialisasi socket:', socketError);
      toast.error('Gagal menginisialisasi koneksi notifikasi');
      return () => {};
    }
  }, []);
  
  const value = {
    socket,
    connected,
    reconnectAttempts,
    // Helper function untuk mengirim event
    emit: (event, data) => {
      try {
        if (socket && connected) {
          socket.emit(event, data);
          return true;
        }
        return false;
      } catch (emitError) {
        console.error(`Error saat emit event ${event}:`, emitError);
        return false;
      }
    }
  };
  
  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext; 