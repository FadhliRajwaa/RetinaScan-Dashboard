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

function DashboardComponent({ userId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAnalyses: 0,
    recentAnalyses: [],
    recentPatients: [],
    drDistribution: [],
    monthlyAnalyses: [],
    ageDistribution: []
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

        // Fetch dashboard statistics
        const response = await axios.get(`${API_URL}/api/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Process and set the data
        setStats({
          totalPatients: response.data.totalPatients || 0,
          totalAnalyses: response.data.totalAnalyses || 0,
          recentAnalyses: response.data.recentAnalyses || [],
          recentPatients: response.data.recentPatients || [],
          drDistribution: processDRDistribution(response.data.drDistribution || []),
          monthlyAnalyses: processMonthlyData(response.data.monthlyAnalyses || []),
          ageDistribution: response.data.ageDistribution || []
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Gagal memuat data dashboard');
        setLoading(false);
        
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
    const mockDRDistribution = [
      { id: 'No DR', label: 'No DR', value: 45, color: '#4caf50' },
      { id: 'Mild', label: 'Mild', value: 25, color: '#8bc34a' },
      { id: 'Moderate', label: 'Moderate', value: 15, color: '#ffeb3b' },
      { id: 'Severe', label: 'Severe', value: 10, color: '#ff9800' },
      { id: 'Proliferative DR', label: 'Proliferative DR', value: 5, color: '#f44336' }
    ];

    const mockMonthlyData = [
      {
        id: 'analisis',
        data: [
          { x: 'Jan', y: 12 },
          { x: 'Feb', y: 18 },
          { x: 'Mar', y: 15 },
          { x: 'Apr', y: 22 },
          { x: 'May', y: 28 },
          { x: 'Jun', y: 30 }
        ]
      }
    ];

    const mockAgeDistribution = [
      { age: '0-20', count: 5 },
      { age: '21-40', count: 25 },
      { age: '41-60', count: 40 },
      { age: '61-80', count: 20 },
      { age: '80+', count: 10 }
    ];

    const mockRecentPatients = [
      { _id: '1', name: 'Ahmad Fauzi', age: 45, dateOfBirth: new Date(1978, 5, 15), gender: 'Laki-laki', createdAt: new Date(2023, 5, 10) },
      { _id: '2', name: 'Siti Rahayu', age: 38, dateOfBirth: new Date(1985, 2, 20), gender: 'Perempuan', createdAt: new Date(2023, 5, 12) },
      { _id: '3', name: 'Budi Santoso', age: 52, dateOfBirth: new Date(1971, 8, 5), gender: 'Laki-laki', createdAt: new Date(2023, 5, 15) },
      { _id: '4', name: 'Dewi Lestari', age: 29, dateOfBirth: new Date(1994, 11, 12), gender: 'Perempuan', createdAt: new Date(2023, 5, 18) }
    ];

    const mockRecentAnalyses = [
      { _id: '1', patientId: { name: 'Ahmad Fauzi' }, results: { classification: 'Mild', confidence: 0.89 }, timestamp: new Date(2023, 5, 20) },
      { _id: '2', patientId: { name: 'Siti Rahayu' }, results: { classification: 'No DR', confidence: 0.95 }, timestamp: new Date(2023, 5, 21) },
      { _id: '3', patientId: { name: 'Budi Santoso' }, results: { classification: 'Moderate', confidence: 0.78 }, timestamp: new Date(2023, 5, 22) },
      { _id: '4', patientId: { name: 'Dewi Lestari' }, results: { classification: 'No DR', confidence: 0.92 }, timestamp: new Date(2023, 5, 23) }
    ];

    setStats({
      totalPatients: 120,
      totalAnalyses: 250,
      recentAnalyses: mockRecentAnalyses,
      recentPatients: mockRecentPatients,
      drDistribution: mockDRDistribution,
      monthlyAnalyses: mockMonthlyData,
      ageDistribution: mockAgeDistribution
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
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        <h3 className="font-bold">Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
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
