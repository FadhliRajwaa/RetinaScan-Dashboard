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
import { useTheme } from '../context/ThemeContext';

export default function Dashboard({ userId }) {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalScans: 0,
    recentScans: 0,
    severeConditions: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useTheme();

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

  // Animasi untuk container
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

  // Animasi untuk item
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 40,
        duration: 0.3
      }
    }
  };

  // Modern glassmorphism style
  const glassEffect = {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.5)',
    borderTop: '1px solid rgba(255, 255, 255, 0.5)',
  };

  const statCards = [
    {
      title: 'Total Pasien',
      value: stats.totalPatients,
      icon: <UsersIcon className="w-8 h-8 text-white" />,
      iconBg: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
      textColor: theme.primary,
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: 'Total Scan',
      value: stats.totalScans,
      icon: <DocumentTextIcon className="w-8 h-8 text-white" />,
      iconBg: `linear-gradient(135deg, ${theme.success}, ${theme.info})`,
      textColor: theme.success,
      change: '+8%',
      changeType: 'increase'
    },
    {
      title: 'Scan 7 Hari Terakhir',
      value: stats.recentScans,
      icon: <ClockIcon className="w-8 h-8 text-white" />,
      iconBg: `linear-gradient(135deg, ${theme.secondary}, ${theme.accent})`,
      textColor: theme.secondary,
      change: '+15%',
      changeType: 'increase'
    },
    {
      title: 'Kondisi Parah',
      value: stats.severeConditions,
      icon: <ExclamationCircleIcon className="w-8 h-8 text-white" />,
      iconBg: `linear-gradient(135deg, ${theme.danger}, #F87171)`,
      textColor: theme.danger,
      change: '-3%',
      changeType: 'decrease'
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <motion.div 
          animate={{ 
            rotate: 360,
            transition: { 
              duration: 1.5, 
              ease: "linear", 
              repeat: Infinity 
            } 
          }}
          className="w-16 h-16 border-t-4 border-b-4 border-primary-500 rounded-full"
          style={{ borderColor: theme.primary }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <ExclamationCircleIcon className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800">{error}</h2>
        <motion.button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 text-white rounded-lg shadow-lg"
          style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
          whileHover={{ 
            scale: 1.05, 
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)'
          }}
          whileTap={{ scale: 0.95 }}
        >
          Coba Lagi
        </motion.button>
      </div>
    );
  }

  return (
    <motion.div 
      className="p-4 md:p-6 space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div className="flex flex-col md:flex-row md:items-center md:justify-between" variants={itemVariants}>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">Dashboard</h1>
          <p className="text-sm text-gray-500">Selamat datang di RetinaScan Dashboard</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <motion.button 
            className="px-4 py-2 text-sm rounded-lg text-white shadow-md"
            style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
            whileHover={{ 
              scale: 1.05, 
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            Export Data
          </motion.button>
          <motion.button 
            className="px-4 py-2 text-sm rounded-lg bg-white border border-gray-200 shadow-sm"
            whileHover={{ 
              scale: 1.05, 
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            Filter
          </motion.button>
        </div>
      </motion.div>
      
      {/* Stat Cards with modern design */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6"
        variants={containerVariants}
      >
        {statCards.map((card, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ 
              y: -5, 
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1)'
            }}
            className="rounded-2xl overflow-hidden"
            style={glassEffect}
          >
            <div className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{card.title}</p>
                <h3 className="text-2xl font-bold" style={{ color: card.textColor }}>{card.value}</h3>
                <div className="flex items-center mt-2">
                  <span className={`text-xs font-medium flex items-center ${
                    card.changeType === 'increase' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {card.changeType === 'increase' ? (
                      <ArrowUpIcon className="w-3 h-3 mr-1" />
                    ) : (
                      <ArrowDownIcon className="w-3 h-3 mr-1" />
                    )}
                    {card.change} dari bulan lalu
                  </span>
                </div>
              </div>
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: card.iconBg }}
              >
                {card.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Section with modern design */}
      <motion.div 
        className="mt-8 rounded-2xl p-5"
        variants={itemVariants}
        style={glassEffect}
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Analisis Data</h2>
        <DashboardCharts />
      </motion.div>
    </motion.div>
  );
}
