import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  UsersIcon, 
  DocumentTextIcon, 
  ClockIcon, 
  ExclamationCircleIcon 
} from '@heroicons/react/24/outline';
import DashboardCharts from '../components/dashboard/DashboardCharts';

export default function Dashboard({ userId }) {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalScans: 0,
    recentScans: 0,
    severeConditions: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  };

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
      icon: <UsersIcon className="w-8 h-8 text-blue-500" />,
      bgColor: 'from-blue-500/20 to-blue-500/5',
      textColor: 'text-blue-700',
      iconBg: 'bg-blue-100'
    },
    {
      title: 'Total Scan',
      value: stats.totalScans,
      icon: <DocumentTextIcon className="w-8 h-8 text-green-500" />,
      bgColor: 'from-green-500/20 to-green-500/5',
      textColor: 'text-green-700',
      iconBg: 'bg-green-100'
    },
    {
      title: 'Scan 7 Hari Terakhir',
      value: stats.recentScans,
      icon: <ClockIcon className="w-8 h-8 text-purple-500" />,
      bgColor: 'from-purple-500/20 to-purple-500/5',
      textColor: 'text-purple-700',
      iconBg: 'bg-purple-100'
    },
    {
      title: 'Kondisi Parah',
      value: stats.severeConditions,
      icon: <ExclamationCircleIcon className="w-8 h-8 text-red-500" />,
      bgColor: 'from-red-500/20 to-red-500/5',
      textColor: 'text-red-700',
      iconBg: 'bg-red-100'
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative h-16 w-16">
          <div className="absolute top-0 left-0 right-0 bottom-0 animate-spin rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-300 border-l-transparent"></div>
          <div className="absolute top-2 left-2 right-2 bottom-2 animate-ping rounded-full border-2 border-blue-500 opacity-30"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center h-64 bg-white p-6 rounded-xl shadow-sm"
      >
        <ExclamationCircleIcon className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800">{error}</h2>
        <motion.button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Coba Lagi
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 
        className="text-2xl font-bold text-gray-800 mb-6"
        variants={itemVariants}
      >
        Dashboard
      </motion.h1>
      
      {/* Stat Cards */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
      >
        {statCards.map((card, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ 
              y: -5,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              transition: { duration: 0.2 }
            }}
            className={`bg-gradient-to-br ${card.bgColor} rounded-xl shadow-soft p-6 flex items-center justify-between`}
          >
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">{card.title}</p>
              <p className={`text-3xl font-bold ${card.textColor}`}>{card.value}</p>
            </div>
            <div className={`p-3 rounded-xl ${card.iconBg} shadow-sm`}>
              {card.icon}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts */}
      <motion.div 
        className="mt-10"
        variants={itemVariants}
      >
        <DashboardCharts />
      </motion.div>
    </motion.div>
  );
}
