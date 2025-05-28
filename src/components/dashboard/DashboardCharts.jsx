import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactApexChart from 'react-apexcharts';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import io from 'socket.io-client';
import '../../utils/animation.css';

// Komponen untuk menampilkan status Flask API dinonaktifkan
// karena masalah dengan endpoint /flask-info
// Comment out untuk sementara sampai endpoint diperbaiki

const SeverityDistributionChart = ({ severityDistribution }) => {
  const { theme } = useTheme();
  
  const options = {
    chart: {
      type: 'donut',
      fontFamily: 'Inter, sans-serif',
      animations: {
        enabled: true,
        speed: 500,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      },
      dropShadow: {
        enabled: true,
        top: 0,
        left: 0,
        blur: 3,
        opacity: 0.1
      }
    },
    colors: ['#34D399', '#10B981', '#FBBF24', '#F59E0B', '#EF4444'],
    labels: ['Tidak ada', 'Ringan', 'Sedang', 'Berat', 'Sangat Berat'],
    legend: {
      position: 'bottom',
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      markers: {
        width: 12,
        height: 12,
        radius: 6
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '60%',
          background: 'transparent',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '16px',
              fontFamily: 'Inter, sans-serif',
              offsetY: -10
            },
            value: {
              show: true,
              fontSize: '16px',
              fontFamily: 'Inter, sans-serif',
              formatter: function (val) {
                return val + '%';
              },
            },
            total: {
              show: true,
              label: 'Total',
              fontFamily: 'Inter, sans-serif',
              color: '#64748b',
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
      theme: 'light',
      style: {
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif'
      }
    },
  };

  const series = severityDistribution;

  return (
    <motion.div 
      className="chart-container bg-white p-5 rounded-xl shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Distribusi Tingkat Keparahan</h3>
      <ReactApexChart 
        options={options}
        series={series}
        type="donut"
        height={330}
      />
    </motion.div>
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
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      },
      dropShadow: {
        enabled: true,
        top: 0,
        left: 0,
        blur: 3,
        opacity: 0.1
      }
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
        colorStops: [
          {
            offset: 0,
            color: '#3B82F6',
            opacity: 0.8
          },
          {
            offset: 100,
            color: '#3B82F6',
            opacity: 0.2
          }
        ]
      },
    },
    xaxis: {
      categories: monthlyTrend.categories,
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif'
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
          fontFamily: 'Inter, sans-serif'
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
      theme: 'light',
      style: {
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif'
      }
    },
    markers: {
      size: 4,
      colors: ['#3B82F6'],
      strokeColors: '#fff',
      strokeWidth: 2,
      hover: {
        size: 6,
      }
    }
  };

  const series = [{
    name: 'Analisis',
    data: monthlyTrend.data,
  }];

  return (
    <motion.div 
      className="chart-container bg-white p-5 rounded-xl shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Tren Analisis Bulanan</h3>
      <ReactApexChart 
        options={options}
        series={series}
        type="area"
        height={330}
      />
    </motion.div>
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
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      }
    },
    colors: ['#8B5CF6'],
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: '60%',
        distributed: true,
        backgroundBarColors: ['#f1f5f9'],
        backgroundBarRadius: 6,
        dataLabels: {
          position: 'top'
        }
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
          fontFamily: 'Inter, sans-serif'
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
          fontFamily: 'Inter, sans-serif'
        },
      },
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif'
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
      theme: 'light',
      style: {
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif'
      }
    },
  };

  const series = [{
    name: 'Pasien',
    data: ageGroups.data,
  }];

  return (
    <motion.div 
      className="chart-container bg-white p-5 rounded-xl shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Demografi Pasien (Usia)</h3>
      <ReactApexChart 
        options={options}
        series={series}
        type="bar"
        height={330}
      />
    </motion.div>
  );
};

const AIConfidenceChart = ({ confidenceLevels }) => {
  const { theme } = useTheme();
  
  const options = {
    chart: {
      type: 'radialBar',
      fontFamily: 'Inter, sans-serif',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      },
      dropShadow: {
        enabled: true,
        top: 0,
        left: 0,
        blur: 3,
        opacity: 0.1
      }
    },
    colors: ['#10B981', '#6366F1', '#F59E0B', '#EC4899', '#3B82F6'],
    plotOptions: {
      radialBar: {
        dataLabels: {
          name: {
            fontSize: '14px',
            color: '#64748b',
            fontFamily: 'Inter, sans-serif',
          },
          value: {
            fontSize: '16px',
            fontWeight: 500,
            fontFamily: 'Inter, sans-serif',
            formatter: function (val) {
              return val + '%';
            },
          },
          total: {
            show: true,
            label: 'Total',
            fontFamily: 'Inter, sans-serif',
            formatter: function (w) {
              return '100%';
            },
          }
        },
        track: {
          background: '#f1f5f9',
          strokeWidth: '97%',
          margin: 5
        },
        hollow: {
          margin: 15,
          size: '35%'
        }
      },
    },
    labels: confidenceLevels.categories,
    legend: {
      show: true,
      position: 'bottom',
      fontSize: '13px',
      fontFamily: 'Inter, sans-serif',
      fontWeight: 500,
      offsetY: 5,
      markers: {
        width: 12,
        height: 12,
        radius: 6
      }
    },
    stroke: {
      lineCap: 'round'
    }
  };

  // Konversi data ke persentase relatif untuk chart radial
  const total = confidenceLevels.data.reduce((acc, item) => acc + item, 0);
  const series = confidenceLevels.data.map(item => 
    Math.round((item / total) * 100)
  );

  return (
    <motion.div 
      className="chart-container bg-white p-5 rounded-xl shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Tingkat Kepercayaan AI</h3>
      <ReactApexChart 
        options={options}
        series={series}
        type="radialBar"
        height={330}
      />
    </motion.div>
  );
};

const DashboardCharts = () => {
  const [analyses, setAnalyses] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [socketStatus, setSocketStatus] = useState('connecting');
  const { theme } = useTheme();

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
    
    // Jika tidak ada data, berikan sample untuk visualisasi
    if (analyses.length === 0) {
      return [30, 25, 20, 15, 10]; // Contoh data untuk demonstrasi
    }
    
    return [dist['Tidak ada'], dist.Ringan, dist.Sedang, dist.Berat, dist['Sangat Berat']];
  }, [analyses]);

  const monthlyTrend = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const trend = Array(12).fill(0);
    
    analyses.forEach(a => {
      const date = new Date(a.createdAt);
      const monthIndex = date.getMonth();
      trend[monthIndex]++;
    });
    
    // Jika tidak ada data, berikan sample untuk visualisasi
    if (analyses.length === 0) {
      return {
        categories: months,
        data: [5, 8, 12, 15, 20, 18, 22, 25, 20, 18, 15, 10] // Contoh data untuk demonstrasi
      };
    }
    
    return {
      categories: months,
      data: trend
    };
  }, [analyses]);

  const ageGroups = useMemo(() => {
    const groups = {
      'Di bawah 30': 0,
      '30-40': 0,
      '41-50': 0,
      '51-60': 0,
      'Di atas 60': 0
    };
    
    patients.forEach(p => {
      const age = p.age || 0;
      if (age < 30) groups['Di bawah 30']++;
      else if (age >= 30 && age <= 40) groups['30-40']++;
      else if (age >= 41 && age <= 50) groups['41-50']++;
      else if (age >= 51 && age <= 60) groups['51-60']++;
      else groups['Di atas 60']++;
    });
    
    // Jika tidak ada data, berikan sample untuk visualisasi
    if (patients.length === 0) {
      return {
        categories: Object.keys(groups),
        data: [8, 15, 22, 18, 12] // Contoh data untuk demonstrasi
      };
    }
    
    return {
      categories: Object.keys(groups),
      data: Object.values(groups)
    };
  }, [patients]);

  const confidenceLevels = useMemo(() => {
    const levels = {
      'Sangat Tinggi': 0,
      'Tinggi': 0,
      'Sedang': 0,
      'Rendah': 0,
      'Sangat Rendah': 0
    };
    
    analyses.forEach(a => {
      const confidence = a.confidence || 0;
      if (confidence >= 0.9) levels['Sangat Tinggi']++;
      else if (confidence >= 0.7) levels['Tinggi']++;
      else if (confidence >= 0.5) levels['Sedang']++;
      else if (confidence >= 0.3) levels['Rendah']++;
      else levels['Sangat Rendah']++;
    });
    
    // Jika tidak ada data, berikan sample untuk visualisasi
    if (analyses.length === 0) {
      return {
        categories: Object.keys(levels),
        data: [40, 30, 15, 10, 5] // Contoh data untuk demonstrasi
      };
    }
    
    return {
      categories: Object.keys(levels),
      data: Object.values(levels)
    };
  }, [analyses]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatePresence>
        {loading ? (
          <motion.div 
            className="flex justify-center py-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="inline-flex items-center px-4 py-2 rounded-xl bg-blue-50 text-blue-700">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Memuat data analitik...</span>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SeverityDistributionChart severityDistribution={severityDistribution} />
            <AnalysisTrendChart monthlyTrend={monthlyTrend} />
            <PatientDemographicsChart ageGroups={ageGroups} />
            <AIConfidenceChart confidenceLevels={confidenceLevels} />
          </div>
        )}
      </AnimatePresence>
      
      {socketStatus === 'error' && (
        <motion.div 
          className="mt-6 bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-lg flex items-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <span>
            Koneksi realtime tidak tersedia. Data tidak akan diperbarui secara otomatis.
          </span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default DashboardCharts; 