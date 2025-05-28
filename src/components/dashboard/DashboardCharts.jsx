import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import ReactApexChart from 'react-apexcharts';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import io from 'socket.io-client';

// Komponen untuk menampilkan status Flask API dinonaktifkan
// karena masalah dengan endpoint /flask-info
// Comment out untuk sementara sampai endpoint diperbaiki

const SeverityDistributionChart = ({ severityDistribution }) => {
  const { theme } = useTheme();
  
  const options = {
    chart: {
      type: 'donut',
      fontFamily: 'Inter, sans-serif',
    },
    colors: ['#34D399', '#10B981', '#FBBF24', '#F59E0B', '#EF4444'],
    labels: ['Tidak ada', 'Ringan', 'Sedang', 'Berat', 'Sangat Berat'],
    legend: {
      position: 'bottom',
      fontFamily: 'Inter, sans-serif',
    },
    plotOptions: {
      pie: {
        donut: {
          size: '60%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '16px',
            },
            value: {
              show: true,
              fontSize: '16px',
              formatter: function (val) {
                return val + '%';
              },
            },
            total: {
              show: true,
              label: 'Total',
              formatter: function() {
                return '100%';
              },
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          height: 250,
        },
        legend: {
          position: 'bottom',
        },
      },
    }],
    stroke: {
      width: 2,
      colors: ['#fff']
    },
    tooltip: {
      y: {
        formatter: function(val) {
          return val + '%';
        },
      },
    },
  };

  const series = severityDistribution;

  return (
    <div className="chart-container">
      <h3 className="text-lg font-semibold mb-3">Distribusi Tingkat Keparahan</h3>
      <ReactApexChart 
        options={options}
        series={series}
        type="donut"
        height={300}
      />
    </div>
  );
};

const AnalysisTrendChart = ({ monthlyTrend }) => {
  const { theme } = useTheme();
  
  const options = {
    chart: {
      type: 'area',
      fontFamily: 'Inter, sans-serif',
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    colors: ['#3B82F6'],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100],
      },
    },
    xaxis: {
      categories: monthlyTrend.categories,
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '12px',
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '12px',
        },
      },
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 4,
      padding: {
        left: 0,
        right: 0,
      },
    },
    tooltip: {
      y: {
        formatter: function(val) {
          return val + ' analisis';
        },
      },
    },
  };

  const series = [{
    name: 'Analisis',
    data: monthlyTrend.data,
  }];

  return (
    <div className="chart-container">
      <h3 className="text-lg font-semibold mb-3">Tren Analisis Bulanan</h3>
      <ReactApexChart 
        options={options}
        series={series}
        type="area"
        height={300}
      />
    </div>
  );
};

const PatientDemographicsChart = ({ ageGroups }) => {
  const { theme } = useTheme();
  
  const options = {
    chart: {
      type: 'bar',
      fontFamily: 'Inter, sans-serif',
      toolbar: {
        show: false,
      },
    },
    colors: ['#8B5CF6'],
    plotOptions: {
      bar: {
        borderRadius: 5,
        columnWidth: '60%',
        distributed: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    xaxis: {
      categories: ageGroups.categories,
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '12px',
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        text: 'Jumlah Pasien',
        style: {
          color: '#64748b',
        },
      },
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '12px',
        },
      },
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 4,
      padding: {
        left: 0,
        right: 0,
      },
    },
    tooltip: {
      y: {
        formatter: function(val) {
          return val + ' pasien';
        },
      },
    },
  };

  const series = [{
    name: 'Pasien',
    data: ageGroups.data,
  }];

  return (
    <div className="chart-container">
      <h3 className="text-lg font-semibold mb-3">Demografi Pasien (Usia)</h3>
      <ReactApexChart 
        options={options}
        series={series}
        type="bar"
        height={300}
      />
    </div>
  );
};

const AIConfidenceChart = ({ confidenceLevels }) => {
  const { theme } = useTheme();
  
  const options = {
    chart: {
      type: 'radialBar',
      fontFamily: 'Inter, sans-serif',
    },
    colors: ['#10B981', '#6366F1', '#F59E0B', '#EC4899', '#3B82F6'],
    plotOptions: {
      radialBar: {
        dataLabels: {
          name: {
            fontSize: '14px',
            color: '#64748b',
          },
          value: {
            fontSize: '16px',
            fontWeight: 500,
            formatter: function (val) {
              return val + '%';
            },
          },
          total: {
            show: true,
            label: 'Total',
            formatter: function (w) {
              return '100%';
            },
          }
        },
        track: {
          background: '#f1f5f9',
        },
      },
    },
    labels: confidenceLevels.categories,
    legend: {
      show: true,
      position: 'bottom',
      fontSize: '12px',
      fontFamily: 'Inter, sans-serif',
      offsetY: 5,
    },
  };

  // Konversi data ke persentase relatif untuk chart radial
  const total = confidenceLevels.data.reduce((acc, item) => acc + item, 0);
  const series = confidenceLevels.data.map(item => 
    Math.round((item / total) * 100)
  );

  return (
    <div className="chart-container">
      <h3 className="text-lg font-semibold mb-3">Tingkat Kepercayaan AI</h3>
      <ReactApexChart 
        options={options}
        series={series}
        type="radialBar"
        height={300}
      />
    </div>
  );
};

const DashboardCharts = () => {
  const [analyses, setAnalyses] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [socketStatus, setSocketStatus] = useState('connecting');
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('weekly');

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      console.log('Fetching data from API:', API_URL);
      
      const [analysesRes, patientsRes] = await Promise.all([
        axios.get(`${API_URL}/api/analysis/history`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/patients`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setAnalyses(analysesRes.data);
      setPatients(patientsRes.data);
      console.log('Data fetched successfully:', { analyses: analysesRes.data.length, patients: patientsRes.data.length });
    } catch (err) {
      console.error('Gagal mengambil data dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Setup Socket.IO connection with retry logic
    const setupSocket = () => {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      console.log('Connecting to Socket.IO server at:', API_URL);
      
      const newSocket = io(API_URL, {
        auth: {
          token: localStorage.getItem('token')
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Connected to WebSocket server');
        setSocketStatus('connected');
      });

      newSocket.on('connect_error', (error) => {
        console.log('Socket connection error:', error);
        setSocketStatus('error');
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Disconnected from WebSocket server:', reason);
        setSocketStatus('disconnected');
      });

      newSocket.on('analysisUpdated', () => {
        console.log('Analysis data updated, refreshing...');
        fetchData();
      });

      newSocket.on('patientUpdated', () => {
        console.log('Patient data updated, refreshing...');
        fetchData();
      });

      setSocket(newSocket);

      return newSocket;
    };

    const socket = setupSocket();

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [fetchData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  const tabVariants = {
    inactive: { 
      color: '#6B7280',
      backgroundColor: 'transparent',
      scale: 0.95,
      boxShadow: 'none'
    },
    active: { 
      color: 'white',
      backgroundColor: theme.primary,
      scale: 1,
      boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
    },
    hover: { 
      scale: 1.05,
      boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.2)'
    },
    tap: { scale: 0.98 }
  };

  const chartContainerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const chartItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
        duration: 0.5
      }
    }
  };

  // Agregasi data untuk chart
  const severityDistribution = useMemo(() => {
    const dist = { 'Tidak ada': 0, Ringan: 0, Sedang: 0, Berat: 0, 'Sangat Berat': 0 };
    analyses.forEach(a => {
      const sev = a.severity?.toLowerCase();
      if (sev === 'tidak ada' || sev === 'normal') dist['Tidak ada']++;
      else if (sev === 'ringan' || sev === 'rendah') dist.Ringan++;
      else if (sev === 'sedang') dist.Sedang++;
      else if (sev === 'berat' || sev === 'parah') dist.Berat++;
      else if (sev === 'sangat berat' || sev === 'proliferative dr') dist['Sangat Berat']++;
      else {
        // Fallback berdasarkan severityLevel jika ada
        const level = a.severityLevel || 0;
        if (level === 0) dist['Tidak ada']++;
        else if (level === 1) dist.Ringan++;
        else if (level === 2) dist.Sedang++;
        else if (level === 3) dist.Berat++;
        else if (level === 4) dist['Sangat Berat']++;
      }
    });
    return [dist['Tidak ada'], dist.Ringan, dist.Sedang, dist.Berat, dist['Sangat Berat']];
  }, [analyses]);

  const monthlyTrend = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const trend = Array(12).fill(0);
    analyses.forEach(a => {
      const d = new Date(a.createdAt);
      trend[d.getMonth()]++;
    });
    return { categories: months, data: trend };
  }, [analyses]);

  const ageGroups = useMemo(() => {
    const groups = { '< 30': 0, '30-40': 0, '41-50': 0, '51-60': 0, '61-70': 0, '> 70': 0 };
    patients.forEach(p => {
      const age = p.age || 0;
      if (age < 30) groups['< 30']++;
      else if (age <= 40) groups['30-40']++;
      else if (age <= 50) groups['41-50']++;
      else if (age <= 60) groups['51-60']++;
      else if (age <= 70) groups['61-70']++;
      else groups['> 70']++;
    });
    return { categories: Object.keys(groups), data: Object.values(groups) };
  }, [patients]);

  const confidenceLevels = useMemo(() => {
    const levels = { '< 70%': 0, '70-80%': 0, '81-90%': 0, '91-95%': 0, '96-100%': 0 };
    analyses.forEach(a => {
      const conf = (a.confidence || 0) * 100;
      if (conf < 70) levels['< 70%']++;
      else if (conf <= 80) levels['70-80%']++;
      else if (conf <= 90) levels['81-90%']++;
      else if (conf <= 95) levels['91-95%']++;
      else levels['96-100%']++;
    });
    return { categories: Object.keys(levels), data: Object.values(levels) };
  }, [analyses]);

  if (loading) return <div className="text-center py-12">Memuat data statistik...</div>;

  return (
    <motion.div
      variants={chartContainerVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      className="mt-8"
    >
      <motion.div 
        className="bg-white p-5 rounded-2xl mb-8"
        variants={chartItemVariants}
        style={{ 
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.8)'
        }}
        whileHover={{ 
          boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
          y: -5,
          transition: { duration: 0.3 }
        }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-1 text-gray-800">Statistik Analisis</h3>
            <p className="text-sm text-gray-500">Tren analisis dan pasien baru</p>
          </div>
          
          <div className="flex mt-4 sm:mt-0 p-1 bg-gray-100 rounded-lg">
            {['weekly', 'monthly', 'yearly'].map((tab) => (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-4 py-2 rounded-md text-sm font-medium"
                variants={tabVariants}
                initial="inactive"
                animate={activeTab === tab ? "active" : "inactive"}
                whileHover={activeTab !== tab ? "hover" : undefined}
                whileTap="tap"
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                {tab === 'weekly' ? 'Mingguan' : tab === 'monthly' ? 'Bulanan' : 'Tahunan'}
              </motion.button>
            ))}
          </div>
        </div>
        
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
        >
          <ReactApexChart 
            options={lineChartOptions} 
            series={lineChartSeries} 
            type="line" 
            height={350} 
          />
        </motion.div>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          className="bg-white p-5 rounded-2xl"
          variants={chartItemVariants}
          style={{ 
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.8)'
          }}
          whileHover={{ 
            boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
            y: -5,
            transition: { duration: 0.3 }
          }}
        >
          <h3 className="text-lg sm:text-xl font-bold mb-1 text-gray-800">Distribusi Tingkat Keparahan</h3>
          <p className="text-sm text-gray-500 mb-6">Proporsi tingkat keparahan retinopati diabetik</p>
          <ReactApexChart 
            options={donutChartOptions} 
            series={donutChartSeries} 
            type="donut" 
            height={350} 
          />
        </motion.div>
        
        <motion.div 
          className="bg-white p-5 rounded-2xl"
          variants={chartItemVariants}
          style={{ 
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.8)'
          }}
          whileHover={{ 
            boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
            y: -5,
            transition: { duration: 0.3 }
          }}
        >
          <h3 className="text-lg sm:text-xl font-bold mb-1 text-gray-800">Statistik Pengguna</h3>
          <p className="text-sm text-gray-500 mb-6">Informasi aktivitas pengguna terkini</p>
          
          <div className="space-y-5">
            {[
              { label: 'Total Analisis', value: 124, color: theme.primary, growth: '+12%', icon: '📊' },
              { label: 'Pasien Aktif', value: 87, color: theme.secondary, growth: '+5%', icon: '👥' },
              { label: 'Rata-rata Waktu Analisis', value: '2.5 detik', color: theme.accent, growth: '-8%', icon: '⏱️' },
              { label: 'Tingkat Akurasi', value: '98%', color: '#F59E0B', growth: '+2%', icon: '🎯' }
            ].map((stat, index) => (
              <motion.div 
                key={stat.label}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-50"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                whileHover={{ 
                  backgroundColor: `${stat.color}10`,
                  x: 5,
                  transition: { duration: 0.2 }
                }}
              >
                <div className="flex items-center">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center mr-4 text-lg"
                    style={{ backgroundColor: `${stat.color}20` }}
                  >
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-lg font-bold text-gray-800">{stat.value}</p>
                  </div>
                </div>
                <div 
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    stat.growth.startsWith('+') ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                  }`}
                >
                  {stat.growth}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardCharts; 