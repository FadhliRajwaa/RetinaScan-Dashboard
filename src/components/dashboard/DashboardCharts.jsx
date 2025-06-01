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
  RadialLinearScale
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import EnhancedSeverityChart from './EnhancedSeverityChart';
import { motion } from 'framer-motion';

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
  const chartRefs = {
    lineChart: useRef(null),
    pieChart: useRef(null),
    barChart: useRef(null)
  };

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

        // Membuat gradient untuk line chart
        const lineCtx = chartRefs.lineChart.current?.canvas?.getContext('2d');
        let lineGradient = null;
        if (lineCtx) {
          lineGradient = lineCtx.createLinearGradient(0, 0, 0, 400);
          lineGradient.addColorStop(0, 'rgba(53, 162, 235, 0.8)');
          lineGradient.addColorStop(1, 'rgba(53, 162, 235, 0.1)');
        }

        // Format data untuk scan trends (line chart)
        const scanTrendsData = {
          labels: response.data.scanTrends?.labels || [],
          datasets: [
            {
              label: 'Jumlah Scan',
              data: response.data.scanTrends?.data || [],
              borderColor: 'rgb(53, 162, 235)',
              backgroundColor: lineGradient || 'rgba(53, 162, 235, 0.5)',
              tension: 0.4,
              fill: true,
              pointBackgroundColor: 'rgb(53, 162, 235)',
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointHoverBackgroundColor: 'rgb(53, 162, 235)',
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
                'rgba(255, 99, 132, 0.8)',
                'rgba(54, 162, 235, 0.8)',
                'rgba(255, 206, 86, 0.8)',
                'rgba(75, 192, 192, 0.8)',
                'rgba(153, 102, 255, 0.8)',
                'rgba(255, 159, 64, 0.8)'
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
              ],
              borderWidth: 2,
              hoverOffset: 15
            }
          ]
        };

        // Membuat gradient untuk bar chart
        const barCtx = chartRefs.barChart.current?.canvas?.getContext('2d');
        let barGradient = null;
        if (barCtx) {
          barGradient = barCtx.createLinearGradient(0, 0, 0, 400);
          barGradient.addColorStop(0, 'rgba(75, 192, 192, 0.9)');
          barGradient.addColorStop(1, 'rgba(75, 192, 192, 0.3)');
        }

        // Format data untuk age distribution (bar chart)
        const ageData = {
          labels: response.data.ageDistribution?.labels || [],
          datasets: [
            {
              label: 'Jumlah Pasien',
              data: response.data.ageDistribution?.data || [],
              backgroundColor: barGradient || 'rgba(75, 192, 192, 0.7)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
              borderRadius: 6,
              hoverBackgroundColor: 'rgba(75, 192, 192, 1)'
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

  // Konfigurasi animasi umum untuk semua chart
  const commonAnimationOptions = {
    animation: {
      duration: 2000,
      easing: 'easeOutQuart'
    },
    transitions: {
      active: {
        animation: {
          duration: 400
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false
  };

  // Konfigurasi tooltip umum
  const commonTooltipOptions = {
    enabled: true,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    titleColor: '#333',
    bodyColor: '#666',
    titleFont: {
      size: 14,
      weight: 'bold'
    },
    bodyFont: {
      size: 13
    },
    padding: 12,
    cornerRadius: 8,
    displayColors: true,
    usePointStyle: true,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderWidth: 1,
    caretSize: 8,
    caretPadding: 10
  };

  const lineOptions = {
    ...commonAnimationOptions,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Tren Scan Retina',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        ...commonTooltipOptions,
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
          display: false,
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
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
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    },
    hover: {
      mode: 'index',
      intersect: false
    }
  };

  const barOptions = {
    ...commonAnimationOptions,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Distribusi Umur Pasien',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        ...commonTooltipOptions,
        callbacks: {
          label: function(context) {
            return `Jumlah Pasien: ${context.parsed.y}`;
          }
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
            size: 11
          }
        }
      },
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
      }
    }
  };

  const pieOptions = {
    ...commonAnimationOptions,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 11
          },
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const dataset = data.datasets[0];
                const value = dataset.data[i];
                const total = dataset.data.reduce((acc, val) => acc + val, 0);
                const percentage = Math.round((value / total) * 100);
                
                return {
                  text: `${label}: ${percentage}%`,
                  fillStyle: dataset.backgroundColor[i],
                  strokeStyle: dataset.borderColor[i],
                  lineWidth: dataset.borderWidth,
                  hidden: isNaN(dataset.data[i]) || chart.getDatasetMeta(0).data[i].hidden,
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      title: {
        display: true,
        text: 'Distribusi Kondisi',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        ...commonTooltipOptions,
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
    }
  };

  // Card style dengan glassmorphism effect
  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  };

  // Animation variants untuk cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: 'easeOut'
      }
    })
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div 
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
        ></motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center h-64"
      >
        <ExclamationCircleIcon className="w-12 h-12 text-red-500 mb-2" />
        <h2 className="text-lg font-semibold text-gray-800">{error}</h2>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.location.reload()} 
          className="mt-3 px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
        >
          Coba Lagi
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.h2 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="text-xl font-semibold text-gray-800"
      >
        Analisis Data
      </motion.h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart - Scan Trends */}
        <motion.div 
          custom={0}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ scale: 1.02, boxShadow: '0 10px 40px rgba(31, 38, 135, 0.15)' }}
          className="p-4 rounded-lg"
          style={cardStyle}
        >
          <div className="h-64">
            <Line ref={chartRefs.lineChart} options={lineOptions} data={chartData.scanTrends} />
          </div>
        </motion.div>
        
        {/* Pie Chart - Condition Distribution */}
        <motion.div 
          custom={1}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ scale: 1.02, boxShadow: '0 10px 40px rgba(31, 38, 135, 0.15)' }}
          className="p-4 rounded-lg"
          style={cardStyle}
        >
          <div className="h-64">
            <Pie ref={chartRefs.pieChart} options={pieOptions} data={chartData.conditionDistribution} />
          </div>
        </motion.div>
        
        {/* Bar Chart - Age Distribution */}
        <motion.div 
          custom={2}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ scale: 1.02, boxShadow: '0 10px 40px rgba(31, 38, 135, 0.15)' }}
          className="p-4 rounded-lg"
          style={cardStyle}
        >
          <div className="h-64">
            <Bar ref={chartRefs.barChart} options={barOptions} data={chartData.ageDistribution} />
          </div>
        </motion.div>
        
        {/* Enhanced Severity Chart */}
        <motion.div
          custom={3}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <EnhancedSeverityChart />
        </motion.div>
      </div>
    </div>
  );
}
