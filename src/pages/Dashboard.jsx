import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  UsersIcon, 
  DocumentTextIcon, 
  ClockIcon, 
  ExclamationCircleIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import DashboardCharts from '../components/dashboard/DashboardCharts';
import { useTheme } from '../context/ThemeContext';

export default function Dashboard({ userId }) {
  const { theme, darkMode } = useTheme();
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalScans: 0,
    recentScans: 0,
    severeConditions: 0
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
          severeConditions: response.data.severeConditions || 0
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
      icon: <UsersIcon className="w-8 h-8 text-blue-500 dark:text-blue-400" />,
      bgGradient: darkMode 
        ? 'from-blue-900/30 to-blue-800/30 dark:border-blue-800/50'
        : 'from-blue-50 to-blue-100/80',
      textColor: 'text-blue-700 dark:text-blue-300',
      borderColor: 'border-blue-200 dark:border-blue-800/50'
    },
    {
      title: 'Total Scan',
      value: stats.totalScans,
      icon: <DocumentTextIcon className="w-8 h-8 text-green-500 dark:text-green-400" />,
      bgGradient: darkMode 
        ? 'from-green-900/30 to-green-800/30'
        : 'from-green-50 to-green-100/80',
      textColor: 'text-green-700 dark:text-green-300',
      borderColor: 'border-green-200 dark:border-green-800/50'
    },
    {
      title: 'Scan 7 Hari Terakhir',
      value: stats.recentScans,
      icon: <ClockIcon className="w-8 h-8 text-purple-500 dark:text-purple-400" />,
      bgGradient: darkMode 
        ? 'from-purple-900/30 to-purple-800/30'
        : 'from-purple-50 to-purple-100/80',
      textColor: 'text-purple-700 dark:text-purple-300',
      borderColor: 'border-purple-200 dark:border-purple-800/50'
    },
    {
      title: 'Kondisi Parah',
      value: stats.severeConditions,
      icon: <ExclamationCircleIcon className="w-8 h-8 text-red-500 dark:text-red-400" />,
      bgGradient: darkMode 
        ? 'from-red-900/30 to-red-800/30'
        : 'from-red-50 to-red-100/80',
      textColor: 'text-red-700 dark:text-red-300',
      borderColor: 'border-red-200 dark:border-red-800/50'
    }
  ];

  // Animation variants
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
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const titleVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300 animate-pulse">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg">
        <ExclamationCircleIcon className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{error}</h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2 text-center">Terjadi kesalahan saat memuat data. Silakan coba lagi nanti.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-6 px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-4 md:p-6 space-y-8"
    >
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <motion.div variants={titleVariants} className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md">
            <ArrowTrendingUpIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ringkasan data dan statistik RetinaScan</p>
          </div>
        </motion.div>
        
        <motion.div 
          variants={itemVariants}
          className="mt-4 md:mt-0"
        >
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium">Terakhir diperbarui:</span> {new Date().toLocaleDateString('id-ID', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </motion.div>
      </div>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ 
              y: -5, 
              boxShadow: darkMode 
                ? '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)' 
                : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)' 
            }}
            className={`bg-gradient-to-br ${card.bgGradient} rounded-xl border ${card.borderColor} shadow-md p-6 transition-all duration-300`}
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-lg bg-white/80 dark:bg-gray-800/80 shadow-inner">
                {card.icon}
              </div>
              <span className={`text-3xl font-bold ${card.textColor}`}>
                {card.value}
              </span>
            </div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-300 font-medium">{card.title}</p>
            <div className="mt-2 h-1 w-20 bg-gradient-to-r from-blue-500/50 to-purple-500/50 rounded-full"></div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <motion.div 
        variants={itemVariants}
        className="mt-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700/50"
      >
        <DashboardCharts />
      </motion.div>
    </motion.div>
  );
}
