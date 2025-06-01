import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { ExclamationCircleIcon, ChartPieIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';

// Registrasi komponen Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function EnhancedSeverityChart() {
  const { darkMode } = useTheme();
  const [severityData, setSeverityData] = useState({
    labels: [],
    datasets: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('all'); // 'week', 'month', 'year', 'all'

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchSeverityData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Token tidak ditemukan');
        }

        const response = await axios.get(`${API_URL}/api/dashboard/severity`, {
          params: { timeRange: selectedTimeRange },
          headers: {
            Authorization: `Bearer ${token}`
          },
          timeout: 30000 // 30 detik timeout untuk cold start
        });

        // Format data untuk doughnut chart
        const formattedData = {
          labels: response.data?.labels || [],
          datasets: [
            {
              data: response.data?.data || [],
              backgroundColor: [
                'rgba(255, 99, 132, 0.8)',
                'rgba(255, 159, 64, 0.8)',
                'rgba(255, 206, 86, 0.8)',
                'rgba(75, 192, 192, 0.8)',
                'rgba(54, 162, 235, 0.8)',
                'rgba(153, 102, 255, 0.8)',
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(153, 102, 255, 1)',
              ],
              borderWidth: 1
            }
          ]
        };

        setSeverityData(formattedData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching severity data:', err);
        setError('Gagal memuat data tingkat keparahan');
        setLoading(false);
        toast.error('Gagal memuat data tingkat keparahan. Silakan coba lagi nanti.');
      }
    };

    fetchSeverityData();
  }, [API_URL, selectedTimeRange]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: darkMode ? '#e5e7eb' : '#374151',
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Distribusi Tingkat Keparahan',
        color: darkMode ? '#e5e7eb' : '#374151',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        backgroundColor: darkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        titleColor: darkMode ? '#e5e7eb' : '#111827',
        bodyColor: darkMode ? '#e5e7eb' : '#374151',
        borderColor: darkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '60%'
  };

  const handleTimeRangeChange = (range) => {
    setSelectedTimeRange(range);
  };

  // Animation variants
  const buttonVariants = {
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300 animate-pulse">Memuat data tingkat keparahan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
        <ExclamationCircleIcon className="w-12 h-12 text-red-500 mb-2" />
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{error}</h2>
        <p className="text-gray-600 dark:text-gray-300 text-center mt-2">Terjadi kesalahan saat memuat data tingkat keparahan.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      whileHover={{ 
        y: -5, 
        boxShadow: darkMode 
          ? '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)' 
          : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)' 
      }}
      className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/50 transition-all duration-300"
    >
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <div className="flex items-center space-x-3 mb-4 md:mb-0">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-md">
            <ChartPieIcon className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">Tingkat Keparahan</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <motion.button 
            onClick={() => handleTimeRangeChange('week')}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
              selectedTimeRange === 'week' 
                ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Minggu Ini
          </motion.button>
          <motion.button 
            onClick={() => handleTimeRangeChange('month')}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
              selectedTimeRange === 'month' 
                ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Bulan Ini
          </motion.button>
          <motion.button 
            onClick={() => handleTimeRangeChange('year')}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
              selectedTimeRange === 'year' 
                ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Tahun Ini
          </motion.button>
          <motion.button 
            onClick={() => handleTimeRangeChange('all')}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
              selectedTimeRange === 'all' 
                ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Semua
          </motion.button>
        </div>
      </div>
      
      <div className="h-[250px]">
        <Doughnut options={chartOptions} data={severityData} />
      </div>
      
      {/* Legend dengan detail tambahan */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        {severityData.labels.map((label, index) => {
          const value = severityData.datasets[0].data[index];
          const total = severityData.datasets[0].data.reduce((acc, val) => acc + val, 0);
          const percentage = Math.round((value / total) * 100) || 0;
          const bgColor = severityData.datasets[0].backgroundColor[index];
          
          return (
            <motion.div 
              key={index} 
              className="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div 
                className="w-4 h-4 mr-2 rounded-sm" 
                style={{ backgroundColor: bgColor }}
              ></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {label}: <span className="font-medium">{value}</span> <span className="text-gray-500 dark:text-gray-400">({percentage}%)</span>
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
