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
  RadialLinearScale
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { ExclamationCircleIcon, ArrowPathIcon, ChartBarIcon, ChartPieIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import EnhancedSeverityChart from './EnhancedSeverityChart';

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
  ArcElement,
  RadialLinearScale
);

export default function DashboardCharts() {
  const [chartData, setChartData] = useState({
    scanTrends: {
      labels: [],
      datasets: []
    },
    conditionDistribution: {
      labels: [],
      datasets: []
    },
    ageDistribution: {
      labels: [],
      datasets: []
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Token tidak ditemukan');
        }

        const response = await axios.get(`${API_URL}/api/dashboard/charts`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          timeout: 30000 // 30 detik timeout untuk cold start
        });

        // Format data untuk scan trends (line chart)
        const scanTrendsData = {
          labels: response.data.scanTrends?.labels || [],
          datasets: [
            {
              label: 'Jumlah Scan',
              data: response.data.scanTrends?.data || [],
              borderColor: 'rgb(99, 102, 241)',
              backgroundColor: 'rgba(99, 102, 241, 0.5)',
              tension: 0.4,
              fill: true,
              pointBackgroundColor: 'rgb(79, 70, 229)',
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6
            }
          ]
        };

        // Format data untuk condition distribution (pie chart)
        const conditionData = {
          labels: response.data.conditionDistribution?.labels || [],
          datasets: [
            {
              data: response.data.conditionDistribution?.data || [],
              backgroundColor: [
                'rgba(99, 102, 241, 0.8)',   // Indigo
                'rgba(14, 165, 233, 0.8)',   // Sky
                'rgba(139, 92, 246, 0.8)',   // Violet
                'rgba(16, 185, 129, 0.8)',   // Green
                'rgba(245, 158, 11, 0.8)',   // Amber
                'rgba(239, 68, 68, 0.8)'     // Red
              ],
              borderColor: [
                'rgb(79, 70, 229)',
                'rgb(2, 132, 199)',
                'rgb(124, 58, 237)',
                'rgb(5, 150, 105)',
                'rgb(217, 119, 6)',
                'rgb(220, 38, 38)'
              ],
              borderWidth: 2,
              hoverOffset: 10
            }
          ]
        };

        // Format data untuk age distribution (bar chart)
        const ageData = {
          labels: response.data.ageDistribution?.labels || [],
          datasets: [
            {
              label: 'Jumlah Pasien',
              data: response.data.ageDistribution?.data || [],
              backgroundColor: 'rgba(14, 165, 233, 0.7)',
              borderColor: 'rgb(2, 132, 199)',
              borderWidth: 1,
              borderRadius: 6,
              hoverBackgroundColor: 'rgba(14, 165, 233, 0.9)'
            }
          ]
        };

        setChartData({
          scanTrends: scanTrendsData,
          conditionDistribution: conditionData,
          ageDistribution: ageData
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching chart data:', err);
        setError('Gagal memuat data grafik');
        setLoading(false);
        toast.error('Gagal memuat data grafik. Silakan coba lagi nanti.');
      }
    };

    fetchChartData();
    
    // Polling data setiap 5 menit untuk mendapatkan update real-time
    const interval = setInterval(() => {
      fetchChartData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [API_URL]);

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: 'Inter',
            size: 12
          },
          usePointStyle: true,
          boxWidth: 6
        }
      },
      title: {
        display: true,
        text: 'Tren Scan Retina',
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
        usePointStyle: true,
        bodyFont: {
          family: 'Inter'
        },
        titleFont: {
          family: 'Inter',
          weight: 'bold'
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: 'Inter'
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            family: 'Inter'
          }
        }
      }
    },
    elements: {
      line: {
        tension: 0.4
      }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: 'Inter',
            size: 12
          },
          usePointStyle: true,
          boxWidth: 6
        }
      },
      title: {
        display: true,
        text: 'Distribusi Umur Pasien',
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
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: 'Inter'
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            family: 'Inter'
          }
        }
      }
    }
  };

  const pieOptions = {
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
        text: 'Distribusi Kondisi',
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
    cutout: '60%'
  };

  // Animasi untuk chart container
  const chartContainerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    }
  };

  // Animasi untuk tab items
  const tabVariants = {
    inactive: { scale: 1 },
    active: { 
      scale: 1.05,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-b-3 border-indigo-600 mb-3"></div>
          <p className="text-indigo-600 font-medium text-sm">Memuat data grafik...</p>
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
        className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm p-6"
      >
        <ExclamationCircleIcon className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-lg font-semibold text-gray-800 mb-2">{error}</h2>
        <p className="text-gray-500 text-sm mb-4 text-center">Terjadi kesalahan saat memuat data grafik.</p>
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
      variants={chartContainerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Analisis Data</h2>
        
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mt-4 md:mt-0">
          <motion.button
            variants={tabVariants}
            animate={activeTab === 'all' ? 'active' : 'inactive'}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'all' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Semua
          </motion.button>
          <motion.button
            variants={tabVariants}
            animate={activeTab === 'weekly' ? 'active' : 'inactive'}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('weekly')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'weekly' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Mingguan
          </motion.button>
          <motion.button
            variants={tabVariants}
            animate={activeTab === 'monthly' ? 'active' : 'inactive'}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('monthly')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'monthly' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Bulanan
          </motion.button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart - Scan Trends */}
        <motion.div 
          whileHover={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
          className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 transition-all duration-300"
        >
          <div className="flex items-center mb-4 text-indigo-600">
            <ArrowTrendingUpIcon className="w-5 h-5 mr-2" />
            <h3 className="font-medium">Tren Scan Retina</h3>
          </div>
          <div className="h-64">
            <Line options={lineOptions} data={chartData.scanTrends} />
          </div>
        </motion.div>
        
        {/* Pie Chart - Condition Distribution */}
        <motion.div 
          whileHover={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
          className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 transition-all duration-300"
        >
          <div className="flex items-center mb-4 text-indigo-600">
            <ChartPieIcon className="w-5 h-5 mr-2" />
            <h3 className="font-medium">Distribusi Kondisi</h3>
          </div>
          <div className="h-64">
            <Pie options={pieOptions} data={chartData.conditionDistribution} />
          </div>
        </motion.div>
        
        {/* Bar Chart - Age Distribution */}
        <motion.div 
          whileHover={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
          className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 transition-all duration-300"
        >
          <div className="flex items-center mb-4 text-indigo-600">
            <ChartBarIcon className="w-5 h-5 mr-2" />
            <h3 className="font-medium">Distribusi Umur Pasien</h3>
          </div>
          <div className="h-64">
            <Bar options={barOptions} data={chartData.ageDistribution} />
          </div>
        </motion.div>
        
        {/* Enhanced Severity Chart */}
        <EnhancedSeverityChart />
      </div>
    </motion.div>
  );
}
