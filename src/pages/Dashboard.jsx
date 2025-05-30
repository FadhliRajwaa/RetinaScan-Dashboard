import { motion, useMotionTemplate, useMotionValue, AnimatePresence } from 'framer-motion';
import { useTheme, animations, withPageTransition } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowUpTrayIcon,
  ChartBarIcon,
  DocumentChartBarIcon,
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import DashboardCharts from '../components/dashboard/DashboardCharts';
import { getDashboardData } from '../services/api';
import { io } from 'socket.io-client';
import { completeDashboardFallbackData, getRandomizedFallbackData } from '../utils/fallbackData';

// Glassmorphism style
const glassEffect = {
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.18)',
};

const features = [
  {
    title: 'Unggah Citra',
    description: 'Unggah citra fundus retina dengan aman dan mudah.',
    icon: ArrowUpTrayIcon,
    path: '/scan-retina',
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)',
  },
  {
    title: 'Scan Retina',
    description: 'Analisis citra retina dan dapatkan laporan hasil deteksi secara instan.',
    icon: ChartBarIcon,
    path: '/scan-retina',
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981, #059669)',
  },
  {
    title: 'Riwayat Analisis',
    description: 'Tinjau semua analisis sebelumnya dengan detail.',
    icon: ClockIcon,
    path: '/history',
    color: '#EC4899',
    gradient: 'linear-gradient(135deg, #EC4899, #DB2777)',
  },
];

function FeatureCard({ feature, index }) {
  const { theme } = useTheme();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const radius = useMotionValue(0);
  const background = useMotionTemplate`radial-gradient(${radius}px at ${mouseX}px ${mouseY}px, ${feature.color}30, transparent 70%)`;

  const handleMouseMove = ({ currentTarget, clientX, clientY }) => {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
    radius.set(300);
  };

  const resetRadius = () => radius.set(0);

  return (
    <motion.div
      key={feature.title}
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        type: 'spring',
        stiffness: 300,
        damping: 30,
        duration: 0.5, 
        delay: index * 0.1 
      }}
      whileHover={{ 
        scale: 1.05,
        y: -8,
        transition: { type: 'spring', stiffness: 400, damping: 15 }
      }}
      whileTap={{ scale: 0.98 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetRadius}
      className="relative p-6 rounded-xl flex flex-col items-center text-center overflow-hidden"
      style={{ 
        ...glassEffect,
        transform: 'translateZ(0)',
        willChange: 'transform, opacity'
      }}
    >
      <Link to={feature.path} className="absolute inset-0 z-10" aria-label={feature.title}></Link>
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background }}
      />
      <motion.div
        className="relative z-10 flex flex-col items-center"
      >
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, delay: index * 0.1 + 0.2 }}
          className="rounded-full p-4 mb-5"
          style={{ 
            background: feature.gradient,
            boxShadow: `0 10px 15px -3px ${feature.color}40`
          }}
        >
          <feature.icon 
            className="h-8 w-8 text-white" 
          />
        </motion.div>
        <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-800">
          {feature.title}
        </h3>
        <p className="text-sm sm:text-base text-gray-600">{feature.description}</p>
      </motion.div>
    </motion.div>
  );
}

function DashboardComponent() {
  const { theme } = useTheme();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [socketConnected, setSocketConnected] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);

  // Background gradient animation
  const backgroundVariants = {
    initial: {
      backgroundPosition: '0% 0%',
    },
    animate: {
      backgroundPosition: '100% 100%',
      transition: { 
        repeat: Infinity, 
        repeatType: "reverse", 
        duration: 20,
        ease: "linear"
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
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

  // Fungsi untuk mengambil data dashboard dengan logging yang lebih detail
  const fetchDashboardData = useCallback(async () => {
    try {
      console.log('Fetching dashboard data...');
      setLoading(true);
      
      // Tambahkan penghitung percobaan koneksi yang gagal
      if (failedAttempts >= 3) {
        console.warn(`Failed ${failedAttempts} times, using fallback data instead`);
        
        // Gunakan data fallback yang dirandomisasi untuk simulasi data dinamis
        const fallbackData = getRandomizedFallbackData();
        console.log('Using randomized fallback data:', fallbackData);
        
        setDashboardData(fallbackData);
        setLastUpdate(new Date());
        setConnectionStatus('using_fallback');
        setUsingFallbackData(true);
        setError(null);
        setLoading(false);
        return;
      }
      
      // Catat waktu mulai untuk mengukur latency
      const startTime = Date.now();
      
      // Mencoba mengambil data dari API
      const data = await getDashboardData();
      
      // Hitung latency
      const latency = Date.now() - startTime;
      console.log(`Dashboard data fetched successfully in ${latency}ms`);
      
      // Log data yang diterima untuk debugging
      console.log('Raw dashboard data received:', data);
      
      // Validasi data yang diterima
      validateDashboardData(data);
      
      setDashboardData(data);
      setLastUpdate(new Date());
      setError(null);
      setConnectionStatus('connected');
      setUsingFallbackData(false);
      setFailedAttempts(0); // Reset counter saat berhasil
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      
      // Increment counter untuk percobaan yang gagal
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);
      
      // Log informasi error yang lebih detail
      if (err.response) {
        // Error respons dari server
        console.error('Server responded with error:', {
          status: err.response.status,
          data: err.response.data
        });
        setConnectionStatus('error_server');
      } else if (err.request) {
        // Request dibuat tapi tidak ada respons
        console.error('No response from server, connection issue');
        setConnectionStatus('error_connection');
      } else {
        // Error lainnya
        console.error('Error creating request:', err.message);
        setConnectionStatus('error_other');
      }
      
      // Gunakan data fallback setelah beberapa kali percobaan gagal
      if (newFailedAttempts >= 3) {
        console.warn(`Failed ${newFailedAttempts} times, switching to fallback data`);
        
        // Gunakan data fallback yang statis untuk pertama kali
        console.log('Using fallback data for first time');
        setDashboardData(completeDashboardFallbackData);
        setLastUpdate(new Date());
        setConnectionStatus('using_fallback');
        setUsingFallbackData(true);
        setError(null);
      } else {
        // Masih menampilkan error message jika belum mencapai batas percobaan
        setError('Gagal memuat data dashboard. Silakan coba lagi nanti.');
      }
    } finally {
      setLoading(false);
    }
  }, [failedAttempts]);
  
  // Fungsi untuk memvalidasi data yang diterima dari backend
  const validateDashboardData = (data) => {
    if (!data) {
      console.warn('Received null or undefined dashboard data');
      return;
    }
    
    // Validasi format data yang diharapkan
    const expectedProps = [
      'severityDistribution', 
      'monthlyTrend', 
      'ageGroups', 
      'genderDistribution',
      'confidenceLevels',
      'patients',
      'analyses'
    ];
    
    const missingProps = expectedProps.filter(prop => !data.hasOwnProperty(prop));
    
    if (missingProps.length > 0) {
      console.warn('Missing expected properties in dashboard data:', missingProps);
    }
    
    // Validasi tipe data
    if (data.severityDistribution && !Array.isArray(data.severityDistribution)) {
      console.warn('severityDistribution is not an array:', data.severityDistribution);
    }
    
    if (data.monthlyTrend) {
      if (!data.monthlyTrend.categories || !Array.isArray(data.monthlyTrend.categories)) {
        console.warn('monthlyTrend.categories is missing or not an array:', data.monthlyTrend);
      }
      if (!data.monthlyTrend.data || !Array.isArray(data.monthlyTrend.data)) {
        console.warn('monthlyTrend.data is missing or not an array:', data.monthlyTrend);
      }
    } else {
      console.warn('monthlyTrend is missing');
    }
    
    if (data.ageGroups) {
      if (!data.ageGroups.categories || !Array.isArray(data.ageGroups.categories)) {
        console.warn('ageGroups.categories is missing or not an array:', data.ageGroups);
      }
      if (!data.ageGroups.data || !Array.isArray(data.ageGroups.data)) {
        console.warn('ageGroups.data is missing or not an array:', data.ageGroups);
      }
    } else {
      console.warn('ageGroups is missing');
    }
    
    if (data.genderDistribution && !Array.isArray(data.genderDistribution)) {
      console.warn('genderDistribution is not an array:', data.genderDistribution);
    }
    
    // Log summary
    console.log('Dashboard data validation summary:', {
      totalPatients: data.patients?.length || 0,
      totalAnalyses: data.analyses?.length || 0,
      hasSeverityDistribution: !!data.severityDistribution,
      hasMonthlyTrend: !!data.monthlyTrend,
      hasAgeGroups: !!data.ageGroups,
      hasGenderDistribution: !!data.genderDistribution,
      confidenceLevels: data.confidenceLevels || 'Missing'
    });
  };

  // Menangani socket.io untuk data realtime dengan logging yang lebih detail
  useEffect(() => {
    // Setup socket.io untuk update realtime
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    console.log('Connecting to socket server at:', API_URL);
    
    // Ambil token dari localStorage dan verifikasi apakah tersedia
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Token not found in localStorage, socket authentication will fail');
      setConnectionStatus('error_auth');
      setSocketConnected(false);
      // Tetap lanjutkan dengan fetchDashboardData untuk mendapatkan data awal
      fetchDashboardData();
      return;
    }
    
    // Konfigurasi socket.io dengan auth yang lebih sederhana dan robust
    const socket = io(API_URL, {
      auth: {
        token: token
      },
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 3000,
      timeout: 10000,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('Socket connected successfully with ID:', socket.id);
      setSocketConnected(true);
      setConnectionStatus('socket_connected');
      setConnectionAttempts(0);
      setFailedAttempts(0); // Reset counter saat berhasil terhubung
      setUsingFallbackData(false);
      
      // Untuk debugging, tampilkan room yang sedang didengarkan
      console.log('Listening for events on rooms:', socket.rooms);
      
      // Testing socket connection dengan mengirim ping
      socket.emit('ping', { timestamp: new Date().toISOString() });
      console.log('Ping sent to server');
    });

    // Menambahkan handler untuk event pong dari server
    socket.on('pong', (data) => {
      console.log('Received pong from server:', data);
      // Hitung latency
      if (data.timestamp) {
        const latency = Date.now() - new Date(data.timestamp).getTime();
        console.log(`Socket latency: ${latency}ms`);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected. Reason:', reason);
      setSocketConnected(false);
      setConnectionStatus('disconnected');
    });
    
    socket.on('connect_error', (error) => {
      const attempts = connectionAttempts + 1;
      console.error(`Socket connection error (attempt ${attempts}):`, error.message);
      setSocketConnected(false);
      setConnectionStatus('error_socket');
      setConnectionAttempts(attempts);
      
      // Log additional details about the connection attempt
      console.warn('Connection details:', {
        url: API_URL,
        authToken: token ? `${token.substring(0, 10)}...` : 'missing',
        socketOptions: {
          transports: socket.io?.opts?.transports || ['unknown'],
          timeout: socket.io?.opts?.timeout || 'default',
          reconnection: socket.io?.opts?.reconnection
        },
        attempt: attempts
      });
    });

    socket.on('dashboard_update', (data) => {
      // Jika menggunakan fallback data, jangan gunakan updates dari socket
      if (usingFallbackData) {
        console.log('Ignoring socket update because using fallback data');
        return;
      }
      
      console.log('Received real-time dashboard update:', data);
      
      // Validasi data update yang diterima
      validateDashboardData(data);
      
      setDashboardData(prevData => {
        // Log perubahan data untuk debugging
        console.log('Updating dashboard data. Previous vs New:', {
          previousData: prevData,
          newData: data
        });
        
        return {
          ...prevData,
          ...data
        };
      });
      
      setLastUpdate(new Date());
      
      // Increment notification counter when new data arrives
      setNotificationCount(prev => prev + 1);
      
      // Reset notification counter after 3 seconds
      setTimeout(() => {
        setNotificationCount(0);
      }, 3000);
    });
    
    // Tambahkan listener untuk notifikasi analisis baru
    socket.on('new_analysis', (data) => {
      console.log('Received new analysis notification:', data);
      
      // Tampilkan notifikasi untuk pengguna
      setNotificationCount(prev => prev + 1);
      
      // Opsional: Ambil data dashboard baru
      if (!usingFallbackData) {
        fetchDashboardData();
      }
    });

    // Tambahkan deteksi error pada socket.io
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      setConnectionStatus('error_socket');
    });
    
    socket.on('reconnect', (attemptNumber) => {
      console.log(`Socket reconnected after ${attemptNumber} attempts`);
      setConnectionStatus('socket_connected');
    });
    
    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Socket reconnection attempt ${attemptNumber}`);
    });
    
    socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
    });
    
    socket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed after all attempts');
      setConnectionStatus('error_socket');
    });

    // Ambil data awal saat komponen di-mount
    fetchDashboardData();
    
    // Set interval polling sebagai fallback jika websocket tidak tersedia
    const intervalId = setInterval(() => {
      if (!socketConnected) {
        console.log('Using polling fallback for dashboard data');
        
        // Jika menggunakan fallback data dan ingin mempertahankan simulasi data dinamis
        if (usingFallbackData) {
          console.log('Using randomized fallback data for polling');
          setDashboardData(getRandomizedFallbackData());
          setLastUpdate(new Date());
          return;
        }
        
        fetchDashboardData();
      }
    }, 30000); // Poll every 30 seconds if socket is not connected

    // Cleanup function untuk socket dan interval
    return () => {
      console.log('Cleaning up socket connection and polling interval');
      socket.disconnect();
      clearInterval(intervalId);
    };
  }, [fetchDashboardData, connectionAttempts, usingFallbackData]);

  // Format waktu terakhir update
  const formatLastUpdate = () => {
    const hours = lastUpdate.getHours().toString().padStart(2, '0');
    const minutes = lastUpdate.getMinutes().toString().padStart(2, '0');
    const seconds = lastUpdate.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };
  
  // Get connection status text and color
  const getConnectionStatusInfo = () => {
    switch (connectionStatus) {
      case 'socket_connected':
        return { text: 'Realtime', color: 'bg-green-500' };
      case 'connected':
        return { text: 'Polling', color: 'bg-blue-500' };
      case 'connecting':
        return { text: 'Connecting...', color: 'bg-yellow-500' };
      case 'using_fallback':
        return { text: 'Data Simulasi', color: 'bg-purple-500' };
      case 'disconnected':
        return { text: 'Disconnected', color: 'bg-orange-500' };
      case 'error_connection':
        return { text: 'Connection Error', color: 'bg-red-500' };
      case 'error_server':
        return { text: 'Server Error', color: 'bg-red-500' };
      case 'error_socket':
        return { text: 'Socket Error', color: 'bg-red-500' };
      case 'error_auth':
        return { text: 'Authentication Error', color: 'bg-red-500' };
      default:
        return { text: 'Unknown', color: 'bg-gray-500' };
    }
  };

  return (
    <motion.div 
      className="flex-1 p-4 sm:p-6 lg:p-8 overflow-hidden" 
      style={{ 
        background: `linear-gradient(120deg, ${theme.background}, ${theme.backgroundAlt})`,
        backgroundSize: '200% 200%',
      }}
      variants={backgroundVariants}
      initial="initial"
      animate="animate"
    >
      {/* Tampilkan banner jika menggunakan data fallback */}
      {usingFallbackData && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-purple-100 border border-purple-300 rounded-lg text-purple-800 text-sm"
        >
          <div className="flex items-center">
            <SparklesIcon className="h-5 w-5 mr-2 text-purple-600" />
            <span>
              Menggunakan data simulasi karena server backend tidak tersedia. 
              Data akan diperbarui setiap 30 detik untuk mensimulasikan data realtime.
            </span>
          </div>
        </motion.div>
      )}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mt-4 space-y-10"
      >
        <motion.div
          className="text-center mb-10"
          variants={itemVariants}
        >
          <motion.div 
            className="inline-flex items-center px-4 py-2 rounded-full mb-4"
            style={{ 
              background: `linear-gradient(to right, ${theme.primary}20, ${theme.accent}20)`,
              border: `1px solid ${theme.primary}30`
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <SparklesIcon className="h-5 w-5 mr-2" style={{ color: theme.primary }} />
            <span className="text-sm font-medium" style={{ color: theme.primary }}>
              Platform AI Retinopati Diabetik
            </span>
          </motion.div>
          
          <motion.h2 
            className="text-3xl sm:text-4xl font-bold mb-4 text-gray-800"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Selamat Datang di RetinaScan
          </motion.h2>
          
          <motion.p
            className="text-gray-600 max-w-3xl mx-auto text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Platform deteksi dini retinopati diabetik dengan teknologi AI canggih
          </motion.p>
          
          {/* Realtime Update Status with more detailed info */}
          <motion.div 
            className="flex items-center justify-center mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="flex items-center text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              <div className={`w-2 h-2 rounded-full mr-2 ${getConnectionStatusInfo().color}`}></div>
              <span>
                {getConnectionStatusInfo().text} · Update terakhir: {formatLastUpdate()}
                {connectionAttempts > 0 && ` · Percobaan: ${connectionAttempts}`}
              </span>
              
              {/* Notification Badge */}
              <AnimatePresence>
                {notificationCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="ml-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                  >
                    {notificationCount}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
        
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
        >
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </motion.div>
        
        {/* Dashboard Analytics Charts */}
        <motion.div variants={itemVariants}>
          <DashboardCharts dashboardData={dashboardData} loading={loading} error={error} />
        </motion.div>
        
        {/* Recent Activity */}
        <motion.div 
          variants={itemVariants}
          style={{ 
            ...glassEffect,
            transform: 'translateZ(0)',
            willChange: 'transform, opacity'
          }}
          className="p-8 rounded-xl"
          whileHover={{ 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          }}
        >
          <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
            <span className="w-2 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full mr-3"></span>
            Recent Activity
          </h3>
          
          {/* Show recent activities from dashboardData if available */}
          {dashboardData?.analyses?.slice(0, 5).map((analysis, index) => (
            <motion.div 
              key={analysis.id}
              className="mb-4 p-4 bg-white rounded-lg border border-gray-100"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ x: 5 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">
                    {analysis.patientId?.name || 'Pasien'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(analysis.createdAt).toLocaleString('id-ID', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: 
                      analysis.results.classification === 'No DR' ? '#10B98120' :
                      analysis.results.classification === 'Mild' ? '#3B82F620' :
                      analysis.results.classification === 'Moderate' ? '#F59E0B20' :
                      analysis.results.classification === 'Severe' ? '#EF444420' :
                      analysis.results.classification === 'Proliferative DR' ? '#BE185D20' :
                      '#6B728020',
                    color: 
                      analysis.results.classification === 'No DR' ? '#10B981' :
                      analysis.results.classification === 'Mild' ? '#3B82F6' :
                      analysis.results.classification === 'Moderate' ? '#F59E0B' :
                      analysis.results.classification === 'Severe' ? '#EF4444' :
                      analysis.results.classification === 'Proliferative DR' ? '#BE185D' :
                      '#6B7280'
                  }}
                >
                  {analysis.results.classification}
                </div>
              </div>
            </motion.div>
          ))}
          
          {/* Loading state */}
          {loading && !dashboardData?.analyses && (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          )}
          
          {/* Empty state */}
          {!loading && (!dashboardData?.analyses || dashboardData.analyses.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              Tidak ada aktivitas terbaru
            </div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// Menggunakan HOC untuk menambahkan animasi page transition
const Dashboard = withPageTransition(DashboardComponent);
export default Dashboard;