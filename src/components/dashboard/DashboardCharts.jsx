import { useState, useEffect } from 'react';
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
              borderColor: 'rgb(53, 162, 235)',
              backgroundColor: 'rgba(53, 162, 235, 0.5)',
              tension: 0.3
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
                'rgba(255, 99, 132, 0.7)',
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 206, 86, 0.7)',
                'rgba(75, 192, 192, 0.7)',
                'rgba(153, 102, 255, 0.7)',
                'rgba(255, 159, 64, 0.7)'
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
              ],
              borderWidth: 1
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
              backgroundColor: 'rgba(75, 192, 192, 0.7)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
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
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Tren Scan Retina'
      }
    }
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Distribusi Umur Pasien'
      }
    }
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Distribusi Kondisi'
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <ExclamationCircleIcon className="w-12 h-12 text-red-500 mb-2" />
        <h2 className="text-lg font-semibold text-gray-800">{error}</h2>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-3 px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-gray-800">Analisis Data</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart - Scan Trends */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <Line options={lineOptions} data={chartData.scanTrends} />
        </div>
        
        {/* Pie Chart - Condition Distribution */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <Pie options={pieOptions} data={chartData.conditionDistribution} />
        </div>
        
        {/* Bar Chart - Age Distribution */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <Bar options={barOptions} data={chartData.ageDistribution} />
        </div>
        
        {/* Enhanced Severity Chart */}
        <EnhancedSeverityChart />
      </div>
    </div>
  );
}
