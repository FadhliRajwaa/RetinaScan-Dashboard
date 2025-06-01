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
  RadialLinearScale,
  Filler
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import EnhancedSeverityChart from './EnhancedSeverityChart';
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
  ArcElement,
  RadialLinearScale,
  Filler
);

export default function DashboardCharts() {
  const { theme } = useTheme();
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

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
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
              borderColor: theme.primary,
              backgroundColor: `${theme.primary}20`,
              tension: 0.4,
              fill: true,
              pointBackgroundColor: theme.primary,
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointHoverBackgroundColor: theme.primary,
              pointHoverBorderColor: '#fff',
              pointHoverBorderWidth: 2
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
                'rgba(59, 130, 246, 0.8)', // blue
                'rgba(16, 185, 129, 0.8)', // green
                'rgba(249, 115, 22, 0.8)', // orange
                'rgba(139, 92, 246, 0.8)', // purple
                'rgba(236, 72, 153, 0.8)', // pink
                'rgba(245, 158, 11, 0.8)'  // yellow
              ],
              borderColor: [
                'rgba(59, 130, 246, 1)',
                'rgba(16, 185, 129, 1)',
                'rgba(249, 115, 22, 1)',
                'rgba(139, 92, 246, 1)',
                'rgba(236, 72, 153, 1)',
                'rgba(245, 158, 11, 1)'
              ],
              borderWidth: 2,
              hoverOffset: 15
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
              backgroundColor: `${theme.accent}80`,
              borderColor: theme.accent,
              borderWidth: 2,
              borderRadius: 8,
              hoverBackgroundColor: theme.accent
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
  }, [API_URL, theme]);

  // Modern chart options
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 15,
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          }
        }
      },
      title: {
        display: true,
        text: 'Tren Scan Retina',
        font: {
          size: 16,
          weight: 'bold',
          family: "'Inter', sans-serif"
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1F2937',
        bodyColor: '#4B5563',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        titleFont: {
          size: 14,
          weight: 'bold',
          family: "'Inter', sans-serif"
        },
        bodyFont: {
          size: 13,
          family: "'Inter', sans-serif"
        },
        callbacks: {
          label: function(context) {
            return `Jumlah Scan: ${context.parsed.y}`;
          }
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
            family: "'Inter', sans-serif"
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
            family: "'Inter', sans-serif"
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 15,
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          }
        }
      },
      title: {
        display: true,
        text: 'Distribusi Umur Pasien',
        font: {
          size: 16,
          weight: 'bold',
          family: "'Inter', sans-serif"
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1F2937',
        bodyColor: '#4B5563',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        titleFont: {
          size: 14,
          weight: 'bold',
          family: "'Inter', sans-serif"
        },
        bodyFont: {
          size: 13,
          family: "'Inter', sans-serif"
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
            family: "'Inter', sans-serif"
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
            family: "'Inter', sans-serif"
          }
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
      delay: (context) => context.dataIndex * 100
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 15,
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          }
        }
      },
      title: {
        display: true,
        text: 'Distribusi Kondisi',
        font: {
          size: 16,
          weight: 'bold',
          family: "'Inter', sans-serif"
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1F2937',
        bodyColor: '#4B5563',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        titleFont: {
          size: 14,
          weight: 'bold',
          family: "'Inter', sans-serif"
        },
        bodyFont: {
          size: 13,
          family: "'Inter', sans-serif"
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: 'easeOutQuart',
      delay: (context) => context.dataIndex * 100
    }
  };

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
        <ExclamationCircleIcon className="w-12 h-12 text-red-500 mb-2" />
        <h2 className="text-lg font-semibold text-gray-800">{error}</h2>
        <motion.button 
          onClick={() => window.location.reload()} 
          className="mt-3 px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
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
      <motion.h2 
        className="text-xl font-semibold text-gray-800"
        variants={itemVariants}
      >
        Analisis Data
      </motion.h2>
      
      {/* Tren Scan Retina - Full Width */}
      <motion.div 
        className="bg-white p-6 rounded-xl shadow-soft hover:shadow-soft-md transition-shadow duration-300"
        variants={itemVariants}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tren Scan Retina</h3>
        <div className="h-80">
          <Line options={lineOptions} data={chartData.scanTrends} />
        </div>
      </motion.div>
      
      {/* Two Column Charts */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={containerVariants}
      >
        {/* Pie Chart - Condition Distribution */}
        <motion.div 
          className="bg-white p-6 rounded-xl shadow-soft hover:shadow-soft-md transition-shadow duration-300"
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribusi Kondisi</h3>
          <div className="h-80">
            <Pie options={pieOptions} data={chartData.conditionDistribution} />
          </div>
        </motion.div>
        
        {/* Bar Chart - Age Distribution */}
        <motion.div 
          className="bg-white p-6 rounded-xl shadow-soft hover:shadow-soft-md transition-shadow duration-300"
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribusi Umur Pasien</h3>
          <div className="h-80">
            <Bar options={barOptions} data={chartData.ageDistribution} />
          </div>
        </motion.div>
        
        {/* Enhanced Severity Chart */}
        <motion.div 
          className="bg-white p-6 rounded-xl shadow-soft hover:shadow-soft-md transition-shadow duration-300 lg:col-span-2"
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tingkat Keparahan</h3>
          <div className="h-80">
            <EnhancedSeverityChart />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
