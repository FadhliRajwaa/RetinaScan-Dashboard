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

        // Format data untuk doughnut chart dengan warna yang lebih modern
        const formattedData = {
          labels: response.data?.labels || [],
          datasets: [
            {
              data: response.data?.data || [],
              backgroundColor: [
                'rgba(239, 68, 68, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(249, 115, 22, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(59, 130, 246, 0.8)',
                'rgba(139, 92, 246, 0.8)',
              ],
              borderColor: [
                'rgba(239, 68, 68, 1)',
                'rgba(245, 158, 11, 1)',
                'rgba(249, 115, 22, 1)',
                'rgba(16, 185, 129, 1)',
                'rgba(59, 130, 246, 1)',
                'rgba(139, 92, 246, 1)',
              ],
              borderWidth: 2,
              hoverOffset: 15
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

  // Doughnut chart options dengan animasi dan styling yang lebih modern
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 12,
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15,
          font: {
            size: 11,
            weight: '500'
          }
        }
      },
      title: {
        display: true,
        text: 'Distribusi Tingkat Keparahan',
        font: {
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
        bodyColor: '#4b5563',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${percentage}%`;
          }
        }
      }
    },
    cutout: '65%',
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1500,
      easing: 'easeOutQuart'
    }
  };

  const handleTimeRangeChange = (range) => {
    setSelectedTimeRange(range);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
          className="mt-3 px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-smooth"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-smooth scale-in">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-3 lg:mb-0">Tingkat Keparahan</h3>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => handleTimeRangeChange('week')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-smooth ${
              selectedTimeRange === 'week' 
                ? 'bg-blue-500 text-white shadow-sm' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Minggu Ini
          </button>
          <button 
            onClick={() => handleTimeRangeChange('month')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-smooth ${
              selectedTimeRange === 'month' 
                ? 'bg-blue-500 text-white shadow-sm' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Bulan Ini
          </button>
          <button 
            onClick={() => handleTimeRangeChange('year')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-smooth ${
              selectedTimeRange === 'year' 
                ? 'bg-blue-500 text-white shadow-sm' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tahun Ini
          </button>
          <button 
            onClick={() => handleTimeRangeChange('all')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-smooth ${
              selectedTimeRange === 'all' 
                ? 'bg-blue-500 text-white shadow-sm' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Semua
          </button>
        </div>
      </div>
      
      <div className="h-80">
        <Doughnut options={chartOptions} data={severityData} />
      </div>
      
      {/* Legend summary with percentage */}
      {severityData.labels.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
          {severityData.labels.map((label, index) => {
            const total = severityData.datasets[0].data.reduce((acc, val) => acc + val, 0);
            const value = severityData.datasets[0].data[index] || 0;
            const percentage = Math.round((value / total) * 100);
            
            return (
              <div key={label} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: severityData.datasets[0].backgroundColor[index] }}
                ></div>
                <span className="text-gray-700">{label}: </span>
                <span className="font-medium ml-1">{percentage}%</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
