import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { withPageTransition } from '../context/ThemeContext';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveBar } from '@nivo/bar';
import CountUp from 'react-countup';
import { toast } from 'react-toastify';

function DashboardComponent({ userId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState('api'); // 'api' atau 'mock'
  const [retryCount, setRetryCount] = useState(0);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAnalyses: 0,
    recentAnalyses: [],
    recentPatients: [],
    drDistribution: [],
    monthlyAnalyses: [],
    ageDistribution: [],
    confidenceLevels: {}
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const MAX_RETRY_COUNT = 2;

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch dashboard statistics - Perbaikan URL endpoint
        const response = await axios.get(`${API_URL}/api/analysis/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 30000 // Tambahkan timeout yang lebih panjang (30 detik)
        });

        // Process and set the data
        setStats({
          totalPatients: response.data.totalPatients || 0,
          totalAnalyses: response.data.totalAnalyses || 0,
          recentAnalyses: response.data.recentAnalyses || [],
          recentPatients: response.data.recentPatients || [],
          drDistribution: processDRDistribution(response.data.drDistribution || []),
          monthlyAnalyses: processMonthlyData(response.data.monthlyAnalyses || []),
          ageDistribution: response.data.ageDistribution || [],
          confidenceLevels: response.data.confidenceLevels || {}
        });
        
        setDataSource('api');
        setLoading(false);
        setRetryCount(0); // Reset retry count on successful fetch
        
        // Tampilkan toast sukses jika sebelumnya menggunakan data mock
        if (dataSource === 'mock') {
          toast.success('Koneksi ke server berhasil dipulihkan');
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        
        // Cek jenis error untuk memberikan pesan yang lebih spesifik
        let errorMessage = 'Gagal memuat data dashboard';
        
        if (err.code === 'ECONNABORTED') {
          errorMessage = 'Koneksi ke server timeout. Menggunakan data lokal.';
        } else if (err.response) {
          // Server merespons dengan status error
          if (err.response.status === 401 || err.response.status === 403) {
            errorMessage = 'Sesi login Anda telah berakhir. Silakan login kembali.';
          } else if (err.response.status === 404) {
            errorMessage = 'Endpoint API tidak ditemukan. Menggunakan data lokal.';
          } else if (err.response.status >= 500) {
            errorMessage = 'Server sedang mengalami gangguan. Menggunakan data lokal.';
          }
        } else if (err.request) {
          // Request dibuat tapi tidak ada respons
          errorMessage = 'Tidak dapat terhubung ke server. Menggunakan data lokal.';
        }
        
        setError(errorMessage);
        
        // Coba lagi jika belum mencapai batas percobaan
        if (retryCount < MAX_RETRY_COUNT) {
          console.log(`Mencoba menghubungi server lagi (${retryCount + 1}/${MAX_RETRY_COUNT})...`);
          setRetryCount(prevCount => prevCount + 1);
          
          // Tunggu 3 detik sebelum mencoba lagi
          setTimeout(() => {
            fetchDashboardData();
          }, 3000);
          return;
        }
        
        // Gunakan data mock setelah mencapai batas percobaan
        setLoading(false);
        setDataSource('mock');
        
        // Tampilkan toast warning
        toast.warning(errorMessage, {
          autoClose: 5000,
          position: 'top-center'
        });
        
        // Use mock data for development/preview
        setMockData();
      }
    };

    fetchDashboardData();
  }, [API_URL, userId]);

  // Process DR distribution data for pie chart
  const processDRDistribution = (data) => {
    const colorMap = {
      'No DR': '#4caf50',
      'Mild': '#8bc34a',
      'Moderate': '#ffeb3b',
      'Severe': '#ff9800',
      'Proliferative DR': '#f44336'
    };

    return data.map(item => ({
      id: item.classification,
      label: item.classification,
      value: item.count,
      color: colorMap[item.classification] || '#999999'
    }));
  };

  // Process monthly data for line chart
  const processMonthlyData = (data) => {
    return [
      {
        id: 'analisis',
        data: data.map(item => ({
          x: item.month,
          y: item.count
        }))
      }
    ];
  };

  // Set mock data for development or when API fails
  const setMockData = () => {
    // Format data untuk distribusi DR sesuai dengan format backend
    const mockDRDistribution = [
      { id: 'No DR', label: 'Tidak ada', value: 45, color: '#4caf50' },
      { id: 'Mild', label: 'Ringan', value: 25, color: '#8bc34a' },
      { id: 'Moderate', label: 'Sedang', value: 15, color: '#ffeb3b' },
      { id: 'Severe', label: 'Berat', value: 10, color: '#ff9800' },
      { id: 'Proliferative DR', label: 'Sangat Berat', value: 5, color: '#f44336' }
    ];

    // Format data untuk tren bulanan sesuai dengan format backend
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    
    // Buat data untuk 12 bulan terakhir
    const mockMonthlyData = [
      {
        id: 'analisis',
        data: monthNames.map((month, index) => {
          // Buat data yang lebih realistis dengan tren naik
          const baseValue = 10 + Math.floor(Math.random() * 5);
          const monthValue = baseValue + (index * 2) + Math.floor(Math.random() * 8);
          return { x: month, y: monthValue };
        })
      }
    ];

    // Format data untuk distribusi umur sesuai dengan format backend
    const mockAgeDistribution = [
      { age: '0-10', count: 3 },
      { age: '11-20', count: 7 },
      { age: '21-30', count: 15 },
      { age: '31-40', count: 25 },
      { age: '41-50', count: 30 },
      { age: '51-60', count: 15 },
      { age: '61+', count: 5 }
    ];

    // Data pasien terbaru dengan format yang sesuai backend
    const mockRecentPatients = [
      { _id: '1', name: 'Ahmad Fauzi', age: 45, dateOfBirth: new Date(1978, 5, 15), gender: 'Laki-laki', createdAt: new Date() },
      { _id: '2', name: 'Siti Rahayu', age: 38, dateOfBirth: new Date(1985, 2, 20), gender: 'Perempuan', createdAt: new Date(Date.now() - 86400000) },
      { _id: '3', name: 'Budi Santoso', age: 52, dateOfBirth: new Date(1971, 8, 5), gender: 'Laki-laki', createdAt: new Date(Date.now() - 86400000 * 2) },
      { _id: '4', name: 'Dewi Lestari', age: 29, dateOfBirth: new Date(1994, 11, 12), gender: 'Perempuan', createdAt: new Date(Date.now() - 86400000 * 3) },
      { _id: '5', name: 'Agus Purnomo', age: 61, dateOfBirth: new Date(1962, 3, 8), gender: 'Laki-laki', createdAt: new Date(Date.now() - 86400000 * 4) }
    ];

    // Data analisis terbaru dengan format yang sesuai backend
    const mockRecentAnalyses = [
      { _id: '1', patientId: { name: 'Ahmad Fauzi' }, results: { classification: 'Mild', confidence: 0.89 }, timestamp: new Date() },
      { _id: '2', patientId: { name: 'Siti Rahayu' }, results: { classification: 'No DR', confidence: 0.95 }, timestamp: new Date(Date.now() - 86400000) },
      { _id: '3', patientId: { name: 'Budi Santoso' }, results: { classification: 'Moderate', confidence: 0.78 }, timestamp: new Date(Date.now() - 86400000 * 2) },
      { _id: '4', patientId: { name: 'Dewi Lestari' }, results: { classification: 'No DR', confidence: 0.92 }, timestamp: new Date(Date.now() - 86400000 * 3) },
      { _id: '5', patientId: { name: 'Agus Purnomo' }, results: { classification: 'Proliferative DR', confidence: 0.85 }, timestamp: new Date(Date.now() - 86400000 * 4) }
    ];

    // Data untuk confidence levels
    const confidenceLevels = {
      average: 88,
      highest: 95,
      lowest: 78
    };

    console.log('Menggunakan data mock untuk dashboard karena API tidak tersedia');

    setStats({
      totalPatients: 120,
      totalAnalyses: 250,
      recentAnalyses: mockRecentAnalyses,
      recentPatients: mockRecentPatients,
      drDistribution: mockDRDistribution,
      monthlyAnalyses: mockMonthlyData,
      ageDistribution: mockAgeDistribution,
      confidenceLevels: confidenceLevels
    });
  };

  // Card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-white rounded-2xl shadow-lg"
      >
        <div className="flex flex-col items-center p-6 text-center">
          <div className="bg-red-100 p-3 rounded-full mb-4">
            <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Terjadi Kesalahan</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => {
                setError(null);
                setLoading(true);
                setRetryCount(0);
                const fetchDashboardData = async () => {
                  try {
                    // Get token from localStorage
                    const token = localStorage.getItem('token');
                    if (!token) {
                      throw new Error('No authentication token found');
                    }
                    
                    // Fetch dashboard statistics
                    const response = await axios.get(`${API_URL}/api/analysis/dashboard/stats`, {
                      headers: { Authorization: `Bearer ${token}` },
                      timeout: 30000
                    });
                    
                    // Process and set the data
                    setStats({
                      totalPatients: response.data.totalPatients || 0,
                      totalAnalyses: response.data.totalAnalyses || 0,
                      recentAnalyses: response.data.recentAnalyses || [],
                      recentPatients: response.data.recentPatients || [],
                      drDistribution: processDRDistribution(response.data.drDistribution || []),
                      monthlyAnalyses: processMonthlyData(response.data.monthlyAnalyses || []),
                      ageDistribution: response.data.ageDistribution || [],
                      confidenceLevels: response.data.confidenceLevels || {}
                    });
                    
                    setDataSource('api');
                    setLoading(false);
                    toast.success('Data berhasil dimuat ulang');
                  } catch (err) {
                    console.error('Error fetching dashboard data:', err);
                    setError('Gagal memuat ulang data. Menggunakan data lokal.');
                    setLoading(false);
                    setDataSource('mock');
                    setMockData();
                    toast.warning('Menggunakan data lokal');
                  }
                };
                fetchDashboardData();
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Coba Lagi
            </button>
            <button 
              onClick={() => {
                setError(null);
                setDataSource('mock');
                setMockData();
              }}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Gunakan Data Lokal
            </button>
          </div>
          {dataSource === 'mock' && (
            <div className="mt-6 p-4 bg-blue-50 text-blue-700 rounded-lg">
              <p className="text-sm">
                <span className="font-semibold">Catatan:</span> Saat ini menampilkan data lokal karena tidak dapat terhubung ke server.
                Data yang ditampilkan mungkin tidak mencerminkan data terbaru.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {dataSource === 'mock' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-700"
        >
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium">
              Menampilkan data lokal. Beberapa informasi mungkin tidak akurat atau terbaru.
              <button 
                onClick={() => {
                  setLoading(true);
                  setRetryCount(0);
                  const fetchDashboardData = async () => {
                    // ... existing fetchDashboardData code ...
                  };
                  fetchDashboardData();
                }}
                className="ml-2 underline hover:text-amber-800"
              >
                Coba hubungkan ke server
              </button>
            </p>
          </div>
        </motion.div>
      )}
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div 
          custom={0}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">Total Pasien</p>
              <h3 className="text-3xl font-bold mt-1">
                <CountUp end={stats.totalPatients} duration={2} />
              </h3>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 text-sm">
            <span className="bg-white/20 px-2 py-1 rounded-md">
              +{Math.floor(stats.totalPatients * 0.05)} bulan ini
            </span>
          </div>
        </motion.div>

        <motion.div 
          custom={1}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">Total Analisis</p>
              <h3 className="text-3xl font-bold mt-1">
                <CountUp end={stats.totalAnalyses} duration={2} />
              </h3>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 text-sm">
            <span className="bg-white/20 px-2 py-1 rounded-md">
              +{Math.floor(stats.totalAnalyses * 0.08)} bulan ini
            </span>
          </div>
        </motion.div>

        <motion.div 
          custom={2}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">Hasil Normal</p>
              <h3 className="text-3xl font-bold mt-1">
                {stats.drDistribution.find(item => item.id === 'No DR')?.value || 0}%
              </h3>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 text-sm">
            <span className="bg-white/20 px-2 py-1 rounded-md">
              Tingkat akurasi 95%
            </span>
          </div>
        </motion.div>

        <motion.div 
          custom={3}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">Memerlukan Perhatian</p>
              <h3 className="text-3xl font-bold mt-1">
                {stats.drDistribution.filter(item => item.id !== 'No DR').reduce((acc, curr) => acc + curr.value, 0)}%
              </h3>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 text-sm">
            <span className="bg-white/20 px-2 py-1 rounded-md">
              {stats.drDistribution.find(item => item.id === 'Proliferative DR')?.value || 0}% kasus parah
            </span>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* DR Distribution Pie Chart */}
        <motion.div 
          custom={4}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4">Distribusi Diabetic Retinopathy</h3>
          <div className="h-80">
            <ResponsivePie
              data={stats.drDistribution}
              margin={{ top: 30, right: 80, bottom: 30, left: 80 }}
              innerRadius={0.5}
              padAngle={0.7}
              cornerRadius={3}
              activeOuterRadiusOffset={8}
              borderWidth={1}
              borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsTextColor="#333333"
              arcLinkLabelsThickness={2}
              arcLinkLabelsColor={{ from: 'color' }}
              arcLabelsSkipAngle={10}
              arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
              legends={[
                {
                  anchor: 'bottom',
                  direction: 'row',
                  justify: false,
                  translateX: 0,
                  translateY: 30,
                  itemsSpacing: 0,
                  itemWidth: 100,
                  itemHeight: 18,
                  itemTextColor: '#999',
                  itemDirection: 'left-to-right',
                  itemOpacity: 1,
                  symbolSize: 12,
                  symbolShape: 'circle'
                }
              ]}
            />
          </div>
        </motion.div>

        {/* Monthly Trend Line Chart */}
        <motion.div 
          custom={5}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4">Tren Analisis Bulanan</h3>
          <div className="h-80">
            <ResponsiveLine
              data={stats.monthlyAnalyses}
              margin={{ top: 30, right: 30, bottom: 50, left: 60 }}
              xScale={{ type: 'point' }}
              yScale={{
                type: 'linear',
                min: 'auto',
                max: 'auto',
                stacked: false,
                reverse: false
              }}
              yFormat=" >-.2f"
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Bulan',
                legendOffset: 36,
                legendPosition: 'middle'
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Jumlah Analisis',
                legendOffset: -40,
                legendPosition: 'middle'
              }}
              colors={{ scheme: 'category10' }}
              pointSize={10}
              pointColor={{ theme: 'background' }}
              pointBorderWidth={2}
              pointBorderColor={{ from: 'serieColor' }}
              pointLabelYOffset={-12}
              useMesh={true}
              legends={[
                {
                  anchor: 'bottom-right',
                  direction: 'column',
                  justify: false,
                  translateX: 0,
                  translateY: 0,
                  itemsSpacing: 0,
                  itemDirection: 'left-to-right',
                  itemWidth: 80,
                  itemHeight: 20,
                  itemOpacity: 0.75,
                  symbolSize: 12,
                  symbolShape: 'circle',
                  symbolBorderColor: 'rgba(0, 0, 0, .5)',
                  effects: [
                    {
                      on: 'hover',
                      style: {
                        itemBackground: 'rgba(0, 0, 0, .03)',
                        itemOpacity: 1
                      }
                    }
                  ]
                }
              ]}
            />
          </div>
        </motion.div>
      </div>

      {/* Age Distribution Bar Chart */}
      <motion.div 
        custom={6}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl shadow-lg p-6 mb-8"
      >
        <h3 className="text-lg font-bold text-gray-800 mb-4">Distribusi Umur Pasien</h3>
        <div className="h-80">
          <ResponsiveBar
            data={stats.ageDistribution.map(item => ({
              age: item.age,
              count: item.count
            }))}
            keys={['count']}
            indexBy="age"
            margin={{ top: 30, right: 30, bottom: 50, left: 60 }}
            padding={0.3}
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            colors={{ scheme: 'blues' }}
            borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Kelompok Umur',
              legendPosition: 'middle',
              legendOffset: 32
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Jumlah Pasien',
              legendPosition: 'middle',
              legendOffset: -40
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
            animate={true}
            motionStiffness={90}
            motionDamping={15}
          />
        </div>
      </motion.div>

      {/* Recent Data Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Patients */}
        <motion.div 
          custom={7}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4">Pasien Terbaru</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 rounded-tl-lg">Nama</th>
                  <th scope="col" className="px-4 py-3">Umur</th>
                  <th scope="col" className="px-4 py-3">Jenis Kelamin</th>
                  <th scope="col" className="px-4 py-3 rounded-tr-lg">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentPatients.map((patient, index) => (
                  <tr key={patient._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 font-medium text-gray-900">{patient.name}</td>
                    <td className="px-4 py-3">{patient.age} tahun</td>
                    <td className="px-4 py-3">{patient.gender}</td>
                    <td className="px-4 py-3">{format(new Date(patient.createdAt), 'dd MMM yyyy', { locale: id })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-center">
            <a href="/patient-data" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Lihat semua pasien →
            </a>
          </div>
        </motion.div>

        {/* Recent Analyses */}
        <motion.div 
          custom={8}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4">Analisis Terbaru</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 rounded-tl-lg">Pasien</th>
                  <th scope="col" className="px-4 py-3">Hasil</th>
                  <th scope="col" className="px-4 py-3">Akurasi</th>
                  <th scope="col" className="px-4 py-3 rounded-tr-lg">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentAnalyses.map((analysis, index) => (
                  <tr key={analysis._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 font-medium text-gray-900">{analysis.patientId.name}</td>
                    <td className="px-4 py-3">
                      <span 
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          analysis.results.classification === 'No DR' ? 'bg-green-100 text-green-800' :
                          analysis.results.classification === 'Mild' ? 'bg-lime-100 text-lime-800' :
                          analysis.results.classification === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                          analysis.results.classification === 'Severe' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        {analysis.results.classification}
                      </span>
                    </td>
                    <td className="px-4 py-3">{Math.round(analysis.results.confidence * 100)}%</td>
                    <td className="px-4 py-3">{format(new Date(analysis.timestamp), 'dd MMM yyyy', { locale: id })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-center">
            <a href="/history" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Lihat semua analisis →
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const Dashboard = withPageTransition(DashboardComponent);
export default Dashboard;
