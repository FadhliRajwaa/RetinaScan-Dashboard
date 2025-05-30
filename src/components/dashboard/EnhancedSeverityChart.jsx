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
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

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
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Distribusi Tingkat Keparahan'
      },
      tooltip: {
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
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800">Tingkat Keparahan</h3>
        <div className="flex space-x-2">
          <button 
            onClick={() => handleTimeRangeChange('week')}
            className={`px-3 py-1 text-sm rounded-md ${
              selectedTimeRange === 'week' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Minggu Ini
          </button>
          <button 
            onClick={() => handleTimeRangeChange('month')}
            className={`px-3 py-1 text-sm rounded-md ${
              selectedTimeRange === 'month' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Bulan Ini
          </button>
          <button 
            onClick={() => handleTimeRangeChange('year')}
            className={`px-3 py-1 text-sm rounded-md ${
              selectedTimeRange === 'year' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tahun Ini
          </button>
          <button 
            onClick={() => handleTimeRangeChange('all')}
            className={`px-3 py-1 text-sm rounded-md ${
              selectedTimeRange === 'all' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Semua
          </button>
        </div>
      </div>
      
      <div className="h-64">
        <Doughnut options={chartOptions} data={severityData} />
      </div>
      
      {/* Legend dengan detail tambahan */}
      <div className="mt-6 grid grid-cols-2 gap-2">
        {severityData.labels.map((label, index) => {
          const value = severityData.datasets[0].data[index];
          const total = severityData.datasets[0].data.reduce((acc, val) => acc + val, 0);
          const percentage = Math.round((value / total) * 100) || 0;
          const bgColor = severityData.datasets[0].backgroundColor[index];
          
          return (
            <div key={index} className="flex items-center">
              <div 
                className="w-4 h-4 mr-2 rounded-sm" 
                style={{ backgroundColor: bgColor }}
              ></div>
              <span className="text-sm text-gray-700">
                {label}: {value} ({percentage}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
