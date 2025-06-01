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

  // Animasi untuk container dan elemen-elemen
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2,
        duration: 0.5
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
        stiffness: 400,
        damping: 25
      }
    }
  };

  const statCards = [
    {
      title: 'Total Pasien',
      value: stats.totalPatients,
      icon: <UsersIcon className="w-8 h-8 text-blue-500" />,
      bgGradient: 'from-blue-50 to-blue-100',
      iconBg: 'bg-blue-100',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      shadowColor: 'rgba(37, 99, 235, 0.2)'
    },
    {
      title: 'Total Scan',
      value: stats.totalScans,
      icon: <DocumentTextIcon className="w-8 h-8 text-emerald-500" />,
      bgGradient: 'from-emerald-50 to-emerald-100',
      iconBg: 'bg-emerald-100',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200',
      shadowColor: 'rgba(5, 150, 105, 0.2)'
    },
    {
      title: 'Scan 7 Hari Terakhir',
      value: stats.recentScans,
      icon: <ClockIcon className="w-8 h-8 text-violet-500" />,
      bgGradient: 'from-violet-50 to-violet-100',
      iconBg: 'bg-violet-100',
      textColor: 'text-violet-700',
      borderColor: 'border-violet-200',
      shadowColor: 'rgba(109, 40, 217, 0.2)'
    },
    {
      title: 'Kondisi Parah',
      value: stats.severeConditions,
      icon: <ExclamationCircleIcon className="w-8 h-8 text-rose-500" />,
      bgGradient: 'from-rose-50 to-rose-100',
      iconBg: 'bg-rose-100',
      textColor: 'text-rose-700',
      borderColor: 'border-rose-200',
      shadowColor: 'rgba(225, 29, 72, 0.2)'
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <motion.div 
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
          className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center h-full"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-4 p-4 rounded-full bg-red-100"
        >
          <ExclamationCircleIcon className="w-16 h-16 text-red-500" />
        </motion.div>
        <h2 className="text-xl font-semibold text-gray-800 mb-3">{error}</h2>
        <motion.button 
          onClick={() => window.location.reload()} 
          className="px-6 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors shadow-lg hover:shadow-xl"
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
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 md:p-6 space-y-8"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"></div>
      </motion.div>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ 
              y: -5, 
              boxShadow: `0 20px 25px -5px ${card.shadowColor}, 0 8px 10px -6px ${card.shadowColor}`
            }}
            className={`bg-gradient-to-br ${card.bgGradient} rounded-2xl shadow-md p-5 flex items-center border border-${card.borderColor}`}
            style={{ 
              boxShadow: `0 10px 15px -3px ${card.shadowColor}, 0 4px 6px -4px ${card.shadowColor}`,
              backdropFilter: 'blur(8px)'
            }}
          >
            <div className={`mr-5 ${card.iconBg} p-3 rounded-xl`}>
              {card.icon}
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">{card.title}</p>
              <motion.p 
                className={`text-2xl font-bold ${card.textColor}`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  delay: 0.3 + index * 0.1,
                  duration: 0.5,
                  type: "spring",
                  stiffness: 400,
                  damping: 15
                }}
              >
                {card.value}
              </motion.p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <motion.div 
        variants={itemVariants}
        className="mt-10"
      >
        <DashboardCharts />
      </motion.div>
    </motion.div>
  );
}
