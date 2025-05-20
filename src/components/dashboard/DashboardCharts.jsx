import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import ReactApexChart from 'react-apexcharts';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import io from 'socket.io-client';

const SeverityDistributionChart = ({ severityDistribution }) => {
  const { theme } = useTheme();
  
  const options = {
    chart: {
      type: 'donut',
      fontFamily: 'Inter, sans-serif',
    },
    colors: ['#10B981', '#FBBF24', '#EF4444'],
    labels: ['Ringan', 'Sedang', 'Berat'],
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

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const [analysesRes, patientsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/analysis/history', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/patients', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setAnalyses(analysesRes.data);
      setPatients(patientsRes.data);
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
      const newSocket = io('http://localhost:5000', {
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

  // Agregasi data untuk chart
  const severityDistribution = React.useMemo(() => {
    const dist = { Ringan: 0, Sedang: 0, Berat: 0 };
    analyses.forEach(a => {
      const sev = a.severity?.toLowerCase();
      if (sev === 'ringan' || sev === 'rendah') dist.Ringan++;
      else if (sev === 'sedang') dist.Sedang++;
      else dist.Berat++;
    });
    return [dist.Ringan, dist.Sedang, dist.Berat];
  }, [analyses]);

  const monthlyTrend = React.useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const trend = Array(12).fill(0);
    analyses.forEach(a => {
      const d = new Date(a.createdAt);
      trend[d.getMonth()]++;
    });
    return { categories: months, data: trend };
  }, [analyses]);

  const ageGroups = React.useMemo(() => {
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

  const confidenceLevels = React.useMemo(() => {
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
        >
          <SeverityDistributionChart severityDistribution={severityDistribution} />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
        >
          <AnalysisTrendChart monthlyTrend={monthlyTrend} />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
        >
          <PatientDemographicsChart ageGroups={ageGroups} />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
        >
          <AIConfidenceChart confidenceLevels={confidenceLevels} />
        </motion.div>
      </div>

      {/* Real-time Status Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-4 flex items-center justify-end"
      >
        <div className="flex items-center text-sm text-gray-600">
          <div className={`w-2 h-2 rounded-full mr-2 ${
            socketStatus === 'connected' ? 'bg-green-500' : 
            socketStatus === 'connecting' ? 'bg-yellow-500' :
            'bg-red-500'
          }`}></div>
          {socketStatus === 'connected' ? 'Real-time updates aktif' :
           socketStatus === 'connecting' ? 'Menghubungkan ke server...' :
           'Gagal terhubung ke server'}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardCharts; 