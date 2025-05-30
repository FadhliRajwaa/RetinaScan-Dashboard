import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { API_URL } from '../utils/api';

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Inisialisasi socket dengan token untuk autentikasi
    const socketInstance = io(API_URL, {
      transports: ['websocket'],
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    socketInstance.on('connect', () => {
      console.log('WebSocket connected!');
      setConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    });

    socketInstance.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    socketInstance.on('dashboard_update', (data) => {
      console.log('Received dashboard update:', data);
      setLastUpdate({ type: 'dashboard', data, timestamp: new Date() });
    });

    socketInstance.on('severity_update', (data) => {
      console.log('Received severity distribution update:', data);
      setLastUpdate({ type: 'severity', data, timestamp: new Date() });
    });
    
    socketInstance.on('analysis_complete', (data) => {
      console.log('Analysis completed:', data);
      setLastUpdate({ type: 'analysis', data, timestamp: new Date() });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Fungsi untuk meminta pembaruan manual
  const requestUpdate = (updateType) => {
    if (!socket || !connected) return;
    
    socket.emit('request_update', { type: updateType });
  };

  return (
    <WebSocketContext.Provider value={{ socket, connected, lastUpdate, requestUpdate }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext); 