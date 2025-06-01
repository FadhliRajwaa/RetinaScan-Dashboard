import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  UsersIcon, 
  DocumentTextIcon, 
  ClockIcon, 
  ExclamationCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import DashboardCharts from '../components/dashboard/DashboardCharts';

export default function Dashboard({ userId }) {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalScans: 0,
    recentScans: 0,
    severeConditions: 0,
    patientGrowth: 5,
    scanGrowth: 12,
    recentScanGrowth: 8,
    severeGrowth: -3
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Token tidak ditemukan');
        }

        const response = await axios.get(`${API_URL}/api/dashboard/stats`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          timeout: 30000 // 30 detik timeout untuk cold start
        });

        setStats({
          totalPatients: response.data.totalPatients || 0,
          totalScans: response.data.totalScans || 0,
          recentScans: response.data.recentScans || 0,
          severeConditions: response.data.severeConditions || 0,
          patientGrowth: response.data.patientGrowth || 5,
          scanGrowth: response.data.scanGrowth || 12,
          recentScanGrowth: response.data.recentScanGrowth || 8,
          severeGrowth: response.data.severeGrowth || -3
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Gagal memuat data dashboard');
        setLoading(false);
        toast.error('Gagal memuat data dashboard. Silakan coba lagi nanti.');
      }
    };

    fetchDashboardData();
    
    // Polling data setiap 5 menit untuk mendapatkan update real-time
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [API_URL]);

  const statCards = [
    {
      title: 'Total Pasien',
      value: stats.totalPatients,
      growth: stats.patientGrowth,
      icon: <UsersIcon className="w-8 h-8" />,
      color: 'indigo'
    },
    {
      title: 'Total Scan',
      value: stats.totalScans,
      growth: stats.scanGrowth,
      icon: <DocumentTextIcon className="w-8 h-8" />,
      color: 'sky'
    },
    {
      title: 'Scan 7 Hari Terakhir',
      value: stats.recentScans,
      growth: stats.recentScanGrowth,
      icon: <ClockIcon className="w-8 h-8" />,
      color: 'violet'
    },
    {
      title: 'Kondisi Parah',
      value: stats.severeConditions,
      growth: stats.severeGrowth,
      icon: <ExclamationCircleIcon className="w-8 h-8" />,
      color: 'rose'
    }
  ];

  // Animasi container untuk staggered children
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

  // Animasi untuk item individual
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }
  };

  // Animasi untuk chart container
  const chartContainerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.4,
        duration: 0.5,
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-3"></div>
          <p className="text-indigo-600 font-medium">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md"
        >
          <ExclamationCircleIcon className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{error}</h2>
          <p className="text-gray-600 mb-6">Terjadi kesalahan saat memuat data dashboard. Silakan coba lagi.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            Coba Lagi
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-gray-500 mt-1">Ringkasan dan analisis data RetinaScan</p>
        </div>
        <div className="mt-4 md:mt-0">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-gray-700 flex items-center"
          >
            <ClockIcon className="w-5 h-5 mr-2 text-indigo-500" />
            <span>Hari ini</span>
          </motion.button>
        </div>
      </motion.div>
      
      {/* Stat Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6"
      >
        {statCards.map((card, index) => {
          const isPositiveGrowth = card.growth >= 0;
          const gradientColors = {
            indigo: 'from-indigo-600 to-indigo-400',
            sky: 'from-sky-600 to-sky-400',
            violet: 'from-violet-600 to-violet-400',
            rose: 'from-rose-600 to-rose-400'
          };
          
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
              className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100"
            >
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{card.title}</p>
                    <h3 className="text-2xl font-bold text-gray-800">{card.value}</h3>
                    <div className="flex items-center mt-2">
                      <span className={`text-xs font-medium ${isPositiveGrowth ? 'text-green-600' : 'text-rose-600'}`}>
                        {isPositiveGrowth ? '+' : ''}{card.growth}%
                      </span>
                      {isPositiveGrowth ? (
                        <ArrowUpIcon className="w-3 h-3 text-green-600 ml-1" />
                      ) : (
                        <ArrowDownIcon className="w-3 h-3 text-rose-600 ml-1" />
                      )}
                      <span className="text-xs text-gray-500 ml-1">vs bulan lalu</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradientColors[card.color]} text-white`}>
                    {card.icon}
                  </div>
                </div>
              </div>
              <div className="h-1 w-full bg-gray-100">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (card.value / 100) * 100)}%` }}
                  transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                  className={`h-full bg-gradient-to-r ${gradientColors[card.color]}`}
                />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts */}
      <motion.div 
        variants={chartContainerVariants}
        initial="hidden"
        animate="visible"
        className="mt-8 bg-white rounded-2xl shadow-md p-6 border border-gray-100"
      >
        <DashboardCharts />
      </motion.div>
    </div>
  );
}
