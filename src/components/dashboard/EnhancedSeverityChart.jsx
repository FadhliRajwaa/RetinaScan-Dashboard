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
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
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
  const chartRef = useRef(null);

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

        // Membuat gradient untuk doughnut chart
        const ctx = chartRef.current?.canvas?.getContext('2d');
        let gradients = [];
        
        if (ctx) {
          // Membuat gradients untuk setiap segment
          const baseColors = [
            ['rgba(255, 99, 132, 0.9)', 'rgba(255, 99, 132, 0.6)'],
            ['rgba(255, 159, 64, 0.9)', 'rgba(255, 159, 64, 0.6)'],
            ['rgba(255, 206, 86, 0.9)', 'rgba(255, 206, 86, 0.6)'],
            ['rgba(75, 192, 192, 0.9)', 'rgba(75, 192, 192, 0.6)'],
            ['rgba(54, 162, 235, 0.9)', 'rgba(54, 162, 235, 0.6)'],
            ['rgba(153, 102, 255, 0.9)', 'rgba(153, 102, 255, 0.6)'],
          ];
          
          baseColors.forEach(colorPair => {
            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, colorPair[0]);
            gradient.addColorStop(1, colorPair[1]);
            gradients.push(gradient);
          });
        }

        // Format data untuk doughnut chart
        const formattedData = {
          labels: response.data?.labels || [],
          datasets: [
            {
              data: response.data?.data || [],
              backgroundColor: gradients.length ? gradients : [
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
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 2000,
      easing: 'easeOutQuart',
    },
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
                  fillStyle: Array.isArray(dataset.backgroundColor) ? dataset.backgroundColor[i] : dataset.backgroundColor,
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
        text: 'Distribusi Tingkat Keparahan',
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
    cutout: '60%',
    elements: {
      arc: {
        borderWidth: 2
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

  const buttonVariants = {
    inactive: { 
      scale: 1,
      backgroundColor: 'rgb(243, 244, 246)',
      color: 'rgb(55, 65, 81)'
    },
    active: { 
      scale: 1.05,
      backgroundColor: 'rgb(59, 130, 246)',
      color: 'rgb(255, 255, 255)'
    },
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  const handleTimeRangeChange = (range) => {
    setSelectedTimeRange(range);
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
    <motion.div 
      whileHover={{ scale: 1.02, boxShadow: '0 10px 40px rgba(31, 38, 135, 0.15)' }}
      className="p-4 rounded-lg"
      style={cardStyle}
    >
      <div className="flex justify-between items-center mb-4">
        <motion.h3 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-lg font-medium text-gray-800"
        >
          Tingkat Keparahan
        </motion.h3>
        <div className="flex space-x-2">
          <motion.button 
            initial="inactive"
            animate={selectedTimeRange === 'week' ? 'active' : 'inactive'}
            whileHover="hover"
            whileTap="tap"
            variants={buttonVariants}
            onClick={() => handleTimeRangeChange('week')}
            className="px-3 py-1 text-sm rounded-md"
          >
            Minggu Ini
          </motion.button>
          <motion.button 
            initial="inactive"
            animate={selectedTimeRange === 'month' ? 'active' : 'inactive'}
            whileHover="hover"
            whileTap="tap"
            variants={buttonVariants}
            onClick={() => handleTimeRangeChange('month')}
            className="px-3 py-1 text-sm rounded-md"
          >
            Bulan Ini
          </motion.button>
          <motion.button 
            initial="inactive"
            animate={selectedTimeRange === 'year' ? 'active' : 'inactive'}
            whileHover="hover"
            whileTap="tap"
            variants={buttonVariants}
            onClick={() => handleTimeRangeChange('year')}
            className="px-3 py-1 text-sm rounded-md"
          >
            Tahun Ini
          </motion.button>
          <motion.button 
            initial="inactive"
            animate={selectedTimeRange === 'all' ? 'active' : 'inactive'}
            whileHover="hover"
            whileTap="tap"
            variants={buttonVariants}
            onClick={() => handleTimeRangeChange('all')}
            className="px-3 py-1 text-sm rounded-md"
          >
            Semua
          </motion.button>
        </div>
      </div>
      
      <div className="h-64">
        <Doughnut ref={chartRef} options={chartOptions} data={severityData} />
      </div>
      
      {/* Legend dengan detail tambahan dan animasi hover */}
      <div className="mt-6 grid grid-cols-2 gap-2">
        {severityData.labels.map((label, index) => {
          const value = severityData.datasets[0].data[index];
          const total = severityData.datasets[0].data.reduce((acc, val) => acc + val, 0);
          const percentage = Math.round((value / total) * 100) || 0;
          const bgColor = Array.isArray(severityData.datasets[0].backgroundColor) 
            ? severityData.datasets[0].backgroundColor[index] 
            : severityData.datasets[0].backgroundColor;
          
          return (
            <motion.div 
              key={index} 
              className="flex items-center p-1 rounded-md"
              whileHover={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
            >
              <motion.div 
                className="w-4 h-4 mr-2 rounded-sm" 
                style={{ backgroundColor: bgColor }}
                whileHover={{ scale: 1.2 }}
              ></motion.div>
              <span className="text-sm text-gray-700">
                {label}: {value} ({percentage}%)
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
