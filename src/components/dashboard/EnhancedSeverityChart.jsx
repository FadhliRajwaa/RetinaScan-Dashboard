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
import { ExclamationCircleIcon, ArrowPathIcon, ChartPieIcon } from '@heroicons/react/24/outline';

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
                'rgba(239, 68, 68, 0.85)',    // Red (Severe)
                'rgba(245, 158, 11, 0.85)',   // Amber (Moderate)
                'rgba(16, 185, 129, 0.85)',   // Green (Mild)
                'rgba(99, 102, 241, 0.85)',   // Indigo (Normal)
                'rgba(139, 92, 246, 0.85)',   // Violet (Other)
                'rgba(209, 213, 219, 0.85)',  // Gray (Undefined)
              ],
              borderColor: [
                'rgb(220, 38, 38)',
                'rgb(217, 119, 6)',
                'rgb(5, 150, 105)',
                'rgb(79, 70, 229)',
                'rgb(124, 58, 237)',
                'rgb(156, 163, 175)',
              ],
              borderWidth: 2,
              hoverOffset: 15,
              hoverBorderWidth: 3
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
          font: {
            family: 'Inter',
            size: 12
          },
          usePointStyle: true,
          boxWidth: 6,
          padding: 20
        }
      },
      title: {
        display: true,
        text: 'Distribusi Tingkat Keparahan',
        font: {
          family: 'Inter',
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1F2937',
        bodyColor: '#4B5563',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        bodyFont: {
          family: 'Inter'
        },
        titleFont: {
          family: 'Inter',
          weight: 'bold'
        },
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
    cutout: '65%'
  };

  const handleTimeRangeChange = (range) => {
    setSelectedTimeRange(range);
  };

  // Animasi untuk button
  const buttonVariants = {
    inactive: { scale: 1 },
    active: { 
      scale: 1.05,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center items-center h-64 bg-white p-5 rounded-xl shadow-sm border border-gray-100"
      >
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-b-3 border-indigo-600 mb-3"></div>
          <p className="text-indigo-600 font-medium text-sm">Memuat data...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm p-6 border border-gray-100"
      >
        <ExclamationCircleIcon className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-lg font-semibold text-gray-800 mb-2">{error}</h2>
        <p className="text-gray-500 text-sm mb-4 text-center">Terjadi kesalahan saat memuat data tingkat keparahan.</p>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
        >
          <ArrowPathIcon className="w-4 h-4 mr-2" />
          Coba Lagi
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      whileHover={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
      className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 transition-all duration-300"
    >
      <div className="flex items-center mb-4 text-indigo-600">
        <ChartPieIcon className="w-5 h-5 mr-2" />
        <h3 className="font-medium">Tingkat Keparahan</h3>
      </div>
      
      <div className="flex flex-wrap justify-center mb-4 gap-2">
        <motion.button 
          variants={buttonVariants}
          animate={selectedTimeRange === 'week' ? 'active' : 'inactive'}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => handleTimeRangeChange('week')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
            selectedTimeRange === 'week' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Minggu Ini
        </motion.button>
        <motion.button 
          variants={buttonVariants}
          animate={selectedTimeRange === 'month' ? 'active' : 'inactive'}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => handleTimeRangeChange('month')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
            selectedTimeRange === 'month' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Bulan Ini
        </motion.button>
        <motion.button 
          variants={buttonVariants}
          animate={selectedTimeRange === 'year' ? 'active' : 'inactive'}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => handleTimeRangeChange('year')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
            selectedTimeRange === 'year' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Tahun Ini
        </motion.button>
        <motion.button 
          variants={buttonVariants}
          animate={selectedTimeRange === 'all' ? 'active' : 'inactive'}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => handleTimeRangeChange('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
            selectedTimeRange === 'all' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Semua
        </motion.button>
      </div>
      
      <div className="h-48 md:h-56">
        <Doughnut options={chartOptions} data={severityData} />
      </div>
      
      {/* Legend dengan detail tambahan */}
      <div className="mt-4 grid grid-cols-2 gap-y-2 gap-x-4">
        {severityData.labels.map((label, index) => {
          const value = severityData.datasets[0].data[index];
          const total = severityData.datasets[0].data.reduce((acc, val) => acc + val, 0);
          const percentage = Math.round((value / total) * 100) || 0;
          const bgColor = severityData.datasets[0].backgroundColor[index];
          
          return (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center p-1.5 rounded-lg hover:bg-gray-50"
            >
              <div 
                className="w-3 h-3 mr-2 rounded-sm" 
                style={{ backgroundColor: bgColor }}
              ></div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-800">{label}</span>
                <div className="flex items-center">
                  <span className="text-xs text-gray-500">{value}</span>
                  <span className="mx-1 text-xs text-gray-400">•</span>
                  <span className="text-xs font-medium text-indigo-600">{percentage}%</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
