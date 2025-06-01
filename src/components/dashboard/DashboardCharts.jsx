import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
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
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { ExclamationCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
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
  const [activeTab, setActiveTab] = useState('weekly');
  const { theme } = useTheme();
  const chartRefs = {
    line: useRef(null),
    pie: useRef(null),
    bar: useRef(null)
  };

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

  // Tab style
  const getTabStyle = (tab) => {
    return {
      background: activeTab === tab 
        ? `linear-gradient(135deg, ${theme.primary}20, ${theme.secondary}30)`
        : 'transparent',
      color: activeTab === tab ? theme.primary : 'gray',
      fontWeight: activeTab === tab ? '600' : '400',
      boxShadow: activeTab === tab 
        ? '0 4px 15px -3px rgba(0, 0, 0, 0.1)'
        : 'none'
    };
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
              borderWidth: 2,
              pointBackgroundColor: theme.primary,
              pointBorderColor: 'white',
              pointRadius: 4,
              pointHoverRadius: 6,
              fill: true
            }
          ]
        };

        // Format data untuk condition distribution (doughnut chart)
        const conditionData = {
          labels: response.data.conditionDistribution?.labels || [],
          datasets: [
            {
              data: response.data.conditionDistribution?.data || [],
              backgroundColor: [
                theme.primary,
                theme.secondary,
                theme.accent,
                theme.info,
                theme.success,
                theme.warning
              ],
              borderColor: 'white',
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
              backgroundColor: `${theme.secondary}80`,
              borderColor: theme.secondary,
              borderWidth: 1,
              borderRadius: 8,
              hoverBackgroundColor: theme.secondary
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

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: false,
        text: 'Tren Scan Retina'
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        titleColor: theme.textDark,
        bodyColor: theme.textDark,
        titleFont: {
          size: 13,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        padding: 12,
        boxPadding: 8,
        usePointStyle: true,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        borderWidth: 0.5,
        boxWidth: 8,
        boxHeight: 8,
        caretSize: 6
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    },
    elements: {
      line: {
        borderWidth: 2
      },
      point: {
        radius: 4,
        hoverRadius: 6
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
          usePointStyle: true,
          boxWidth: 6,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: false,
        text: 'Distribusi Umur Pasien'
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        titleColor: theme.textDark,
        bodyColor: theme.textDark,
        titleFont: {
          size: 13,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        padding: 12,
        boxPadding: 8,
        usePointStyle: true,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        borderWidth: 0.5
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
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

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          font: {
            size: 11
          },
          padding: 15
        }
      },
      title: {
        display: false,
        text: 'Distribusi Kondisi'
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        titleColor: theme.textDark,
        bodyColor: theme.textDark,
        titleFont: {
          size: 13,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        padding: 12,
        boxPadding: 8,
        usePointStyle: true,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        borderWidth: 0.5
      }
    },
    cutout: '65%',
    animation: {
      animateRotate: true,
      animateScale: true
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    const fetchChartData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Token tidak ditemukan');
        }

        const response = await axios.get(`${API_URL}/api/dashboard/charts`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          timeout: 30000
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
              borderWidth: 2,
              pointBackgroundColor: theme.primary,
              pointBorderColor: 'white',
              pointRadius: 4,
              pointHoverRadius: 6,
              fill: true
            }
          ]
        };

        // Format data untuk condition distribution (doughnut chart)
        const conditionData = {
          labels: response.data.conditionDistribution?.labels || [],
          datasets: [
            {
              data: response.data.conditionDistribution?.data || [],
              backgroundColor: [
                theme.primary,
                theme.secondary,
                theme.accent,
                theme.info,
                theme.success,
                theme.warning
              ],
              borderColor: 'white',
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
              backgroundColor: `${theme.secondary}80`,
              borderColor: theme.secondary,
              borderWidth: 1,
              borderRadius: 8,
              hoverBackgroundColor: theme.secondary
            }
          ]
        };

        setChartData({
          scanTrends: scanTrendsData,
          conditionDistribution: conditionData,
          ageDistribution: ageData
        });
        
        setLoading(false);
        toast.success('Data grafik berhasil diperbarui');
      } catch (err) {
        console.error('Error refreshing chart data:', err);
        setError('Gagal memuat data grafik');
        setLoading(false);
        toast.error('Gagal memuat data grafik. Silakan coba lagi nanti.');
      }
    };

    fetchChartData();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div 
          animate={{ 
            rotate: 360,
            transition: { 
              duration: 1.5, 
              ease: "linear", 
              repeat: Infinity 
            } 
          }}
          className="w-12 h-12 border-t-3 border-b-3 border-primary-500 rounded-full"
          style={{ borderColor: theme.primary }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <ExclamationCircleIcon className="w-12 h-12 text-red-500 mb-2" />
        <h2 className="text-lg font-semibold text-gray-800">{error}</h2>
        <motion.button 
          onClick={() => window.location.reload()} 
          className="mt-3 px-4 py-2 text-white text-sm rounded-lg shadow-md"
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
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {['weekly', 'monthly', 'yearly'].map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2 rounded-lg text-sm transition-all duration-200"
              style={getTabStyle(tab)}
              whileHover={{ 
                scale: 1.02,
                boxShadow: '0 4px 15px -3px rgba(0, 0, 0, 0.1)'
              }}
              whileTap={{ scale: 0.98 }}
            >
              {tab === 'weekly' ? 'Mingguan' : tab === 'monthly' ? 'Bulanan' : 'Tahunan'}
            </motion.button>
          ))}
        </div>
        <motion.button
          onClick={handleRefresh}
          className="p-2 rounded-lg bg-white shadow-sm border border-gray-200"
          whileHover={{ 
            scale: 1.05,
            boxShadow: '0 4px 15px -3px rgba(0, 0, 0, 0.1)'
          }}
          whileTap={{ scale: 0.95 }}
          disabled={loading}
        >
          <ArrowPathIcon className="w-5 h-5 text-gray-600" />
        </motion.button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart - Scan Trends */}
        <motion.div 
          className="bg-white rounded-2xl p-5"
          variants={itemVariants}
          style={glassEffect}
          whileHover={{ 
            y: -5, 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Tren Scan Retina</h3>
            <div className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
              {activeTab === 'weekly' ? '7 hari terakhir' : activeTab === 'monthly' ? '30 hari terakhir' : '12 bulan terakhir'}
            </div>
          </div>
          <div className="h-[240px]">
            <Line ref={chartRefs.line} options={lineOptions} data={chartData.scanTrends} />
          </div>
        </motion.div>
        
        {/* Doughnut Chart - Condition Distribution */}
        <motion.div 
          className="bg-white rounded-2xl p-5"
          variants={itemVariants}
          style={glassEffect}
          whileHover={{ 
            y: -5, 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Distribusi Kondisi</h3>
            <div className="text-xs font-medium px-2 py-1 bg-purple-50 text-purple-600 rounded-full">
              Total: {chartData.conditionDistribution.datasets[0].data.reduce((a, b) => a + b, 0)}
            </div>
          </div>
          <div className="h-[240px] flex items-center justify-center">
            <Doughnut ref={chartRefs.pie} options={doughnutOptions} data={chartData.conditionDistribution} />
          </div>
        </motion.div>
        
        {/* Bar Chart - Age Distribution */}
        <motion.div 
          className="bg-white rounded-2xl p-5"
          variants={itemVariants}
          style={glassEffect}
          whileHover={{ 
            y: -5, 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Distribusi Umur Pasien</h3>
            <div className="text-xs font-medium px-2 py-1 bg-green-50 text-green-600 rounded-full">
              Total: {chartData.ageDistribution.datasets[0].data.reduce((a, b) => a + b, 0)}
            </div>
          </div>
          <div className="h-[240px]">
            <Bar ref={chartRefs.bar} options={barOptions} data={chartData.ageDistribution} />
          </div>
        </motion.div>
        
        {/* Enhanced Severity Chart */}
        <motion.div 
          className="bg-white rounded-2xl p-5"
          variants={itemVariants}
          style={glassEffect}
          whileHover={{ 
            y: -5, 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Tingkat Keparahan</h3>
            <div className="text-xs font-medium px-2 py-1 bg-red-50 text-red-600 rounded-full">
              Analisis Risiko
            </div>
          </div>
          <div className="h-[240px]">
            <EnhancedSeverityChart />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
