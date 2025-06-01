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
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
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
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.5)',
              tension: 0.4,
              borderWidth: 3,
              pointBackgroundColor: 'white',
              pointBorderColor: 'rgb(59, 130, 246)',
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
              fill: true
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
                'rgba(239, 68, 68, 0.8)',
                'rgba(59, 130, 246, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(139, 92, 246, 0.8)',
                'rgba(236, 72, 153, 0.8)'
              ],
              borderColor: [
                'rgba(239, 68, 68, 1)',
                'rgba(59, 130, 246, 1)',
                'rgba(16, 185, 129, 1)',
                'rgba(245, 158, 11, 1)',
                'rgba(139, 92, 246, 1)',
                'rgba(236, 72, 153, 1)'
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
              backgroundColor: 'rgba(139, 92, 246, 0.8)',
              borderColor: 'rgba(139, 92, 246, 1)',
              borderWidth: 2,
              borderRadius: 6,
              hoverBackgroundColor: 'rgba(124, 58, 237, 0.9)'
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

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: 'Inter, sans-serif',
            size: 12,
            weight: '500'
          },
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: true,
        text: 'Tren Scan Retina',
        font: {
          family: 'Inter, sans-serif',
          size: 16,
          weight: '600'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1f2937',
        bodyColor: '#1f2937',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        usePointStyle: true,
        titleFont: {
          family: 'Inter, sans-serif',
          size: 14,
          weight: '600'
        },
        bodyFont: {
          family: 'Inter, sans-serif',
          size: 13
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          font: {
            family: 'Inter, sans-serif',
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
          drawBorder: false
        },
        ticks: {
          font: {
            family: 'Inter, sans-serif',
            size: 11
          }
        }
      }
    },
    elements: {
      line: {
        tension: 0.4
      }
    },
    animation: {
      duration: 2000,
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
          font: {
            family: 'Inter, sans-serif',
            size: 12,
            weight: '500'
          },
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: true,
        text: 'Distribusi Umur Pasien',
        font: {
          family: 'Inter, sans-serif',
          size: 16,
          weight: '600'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1f2937',
        bodyColor: '#1f2937',
        borderColor: 'rgba(139, 92, 246, 0.5)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        titleFont: {
          family: 'Inter, sans-serif',
          size: 14,
          weight: '600'
        },
        bodyFont: {
          family: 'Inter, sans-serif',
          size: 13
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          font: {
            family: 'Inter, sans-serif',
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
          drawBorder: false
        },
        ticks: {
          font: {
            family: 'Inter, sans-serif',
            size: 11
          }
        }
      }
    },
    animation: {
      delay: (context) => context.dataIndex * 100,
      duration: 1000,
      easing: 'easeOutQuart'
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
            family: 'Inter, sans-serif',
            size: 12,
            weight: '500'
          },
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: true,
        text: 'Distribusi Kondisi',
        font: {
          family: 'Inter, sans-serif',
          size: 16,
          weight: '600'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1f2937',
        bodyColor: '#1f2937',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        titleFont: {
          family: 'Inter, sans-serif',
          size: 14,
          weight: '600'
        },
        bodyFont: {
          family: 'Inter, sans-serif',
          size: 13
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1500,
      easing: 'easeOutCirc'
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div 
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
          className="w-14 h-14 border-4 border-blue-200 border-t-blue-500 rounded-full"
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
        className="flex flex-col items-center justify-center h-64"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-3 p-3 rounded-full bg-red-100"
        >
          <ExclamationCircleIcon className="w-12 h-12 text-red-500" />
        </motion.div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">{error}</h2>
        <motion.button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-500 text-white text-sm rounded-xl hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Coba Lagi
        </motion.button>
      </motion.div>
    );
  }

  const chartCardStyle = {
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05)",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.18)"
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <motion.div variants={itemVariants} className="flex items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Analisis Data</h2>
        <div className="ml-3 h-1 w-16 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"></div>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart - Scan Trends */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ 
            y: -5, 
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)" 
          }}
          className="p-5 rounded-2xl shadow-md border border-blue-100"
          style={chartCardStyle}
        >
          <div className="h-72">
            <Line options={lineOptions} data={chartData.scanTrends} />
          </div>
        </motion.div>
        
        {/* Pie Chart - Condition Distribution */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ 
            y: -5, 
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)" 
          }}
          className="p-5 rounded-2xl shadow-md border border-violet-100"
          style={chartCardStyle}
        >
          <div className="h-72">
            <Pie options={pieOptions} data={chartData.conditionDistribution} />
          </div>
        </motion.div>
        
        {/* Bar Chart - Age Distribution */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ 
            y: -5, 
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)" 
          }}
          className="p-5 rounded-2xl shadow-md border border-emerald-100"
          style={chartCardStyle}
        >
          <div className="h-72">
            <Bar options={barOptions} data={chartData.ageDistribution} />
          </div>
        </motion.div>
        
        {/* Enhanced Severity Chart */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ 
            y: -5, 
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)" 
          }}
          className="p-5 rounded-2xl shadow-md border border-amber-100"
          style={chartCardStyle}
        >
          <div className="h-72">
            <EnhancedSeverityChart />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
