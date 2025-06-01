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

  const statCards = [
    {
      title: 'Total Pasien',
      value: stats.totalPatients,
      icon: <UsersIcon className="w-8 h-8 text-blue-500" />,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      title: 'Total Scan',
      value: stats.totalScans,
      icon: <DocumentTextIcon className="w-8 h-8 text-green-500" />,
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      title: 'Scan 7 Hari Terakhir',
      value: stats.recentScans,
      icon: <ClockIcon className="w-8 h-8 text-purple-500" />,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    {
      title: 'Kondisi Parah',
      value: stats.severeConditions,
      icon: <ExclamationCircleIcon className="w-8 h-8 text-red-500" />,
      bgColor: 'bg-red-50',
      textColor: 'text-red-700'
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <ExclamationCircleIcon className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800">{error}</h2>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${card.bgColor} rounded-lg shadow-sm p-4 md:p-6 flex items-center`}
          >
            <div className="mr-4">{card.icon}</div>
            <div>
              <p className="text-sm text-gray-600">{card.title}</p>
              <p className={`text-2xl font-semibold ${card.textColor}`}>{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="mt-8">
        <DashboardCharts />
      </div>
    </div>
  );
}
