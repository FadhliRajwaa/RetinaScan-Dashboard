import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactApexChart from 'react-apexcharts';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import io from 'socket.io-client';
import { getDashboardData } from '../../services/api';

// Komponen untuk menampilkan status Flask API dinonaktifkan
// karena masalah dengan endpoint /flask-info
// Comment out untuk sementara sampai endpoint diperbaiki

// Animasi untuk chart containers
const chartContainerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      duration: 0.5
    }
  }
};

// Glassmorphism style
const glassEffect = {
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.18)',
};

const SeverityDistributionChart = ({ severityDistribution }) => {
  const { theme } = useTheme();
  
  const options = {
    chart: {
      type: 'donut',
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
        top: 3,
        left: 3,
        blur: 4,
        opacity: 0.12
      },
    },
    colors: ['#10B981', '#06D6A0', '#FBBF24', '#F59E0B', '#EF4444'],
    labels: ['Tidak ada', 'Ringan', 'Sedang', 'Berat', 'Sangat Berat'],
    legend: {
      position: 'bottom',
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      fontWeight: 500,
      markers: {
        width: 12,
        height: 12,
        radius: 6,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '16px',
              fontWeight: 600,
              offsetY: -10,
            },
            value: {
              show: true,
              fontSize: '18px',
              fontWeight: 700,
              color: theme.primary,
              formatter: function (val) {
                return val + '%';
              },
            },
            total: {
              show: true,
              label: 'Total',
              color: theme.primary,
              fontWeight: 700,
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
          height: 280,
        },
        legend: {
          position: 'bottom',
          fontSize: '12px',
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
        fontFamily: 'Inter, sans-serif',
      }
    },
  };

  const series = severityDistribution;

  return (
    <motion.div 
      variants={chartContainerVariants}
      initial="hidden"
      animate="visible"
      className="chart-container p-5"
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
        <span className="w-2 h-6 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full mr-3"></span>
        Distribusi Tingkat Keparahan
      </h3>
      <ReactApexChart 
        options={options}
        series={series}
        type="donut"
        height={320}
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
        top: 3,
        left: 3,
        blur: 5,
        opacity: 0.1
      },
    },
    colors: [theme.primary],
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
            color: theme.primary,
            opacity: 0.8
          },
          {
            offset: 100,
            color: theme.accent,
            opacity: 0.2
          }
        ]
      },
    },
    markers: {
      size: 4,
      colors: ['#fff'],
      strokeColors: theme.primary,
      strokeWidth: 2,
      hover: {
        size: 7,
      }
    },
    xaxis: {
      categories: monthlyTrend.categories,
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '13px',
          fontWeight: 500,
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
          fontSize: '13px',
          fontWeight: 500,
        },
        formatter: function(val) {
          return val.toFixed(0);
        }
      },
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 4,
      padding: {
        left: 0,
        right: 0,
      },
      xaxis: {
        lines: {
          show: true
        }
      }
    },
    tooltip: {
      y: {
        formatter: function(val) {
          return val + ' analisis';
        },
      },
      theme: 'light',
      style: {
        fontFamily: 'Inter, sans-serif',
      }
    },
  };

  const series = [{
    name: 'Analisis',
    data: monthlyTrend.data,
  }];

  return (
    <motion.div 
      variants={chartContainerVariants}
      initial="hidden"
      animate="visible"
      className="chart-container p-5"
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
        <span className="w-2 h-6 bg-gradient-to-b from-blue-500 to-cyan-400 rounded-full mr-3"></span>
        Tren Analisis Bulanan
      </h3>
      <ReactApexChart 
        options={options}
        series={series}
        type="area"
        height={320}
      />
    </motion.div>
  );
};

const AgeDistributionChart = ({ ageDistribution }) => {
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
      },
      dropShadow: {
        enabled: true,
        top: 3,
        left: 3,
        blur: 4,
        opacity: 0.1
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '70%',
        distributed: true,
        dataLabels: {
          position: 'top',
        },
      },
    },
    colors: [
      '#0ea5e9', '#0284c7', '#0369a1', '#075985', '#0c4a6e', '#082f49'
    ],
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val + '%';
      },
      offsetY: -20,
      style: {
        fontSize: '12px',
        fontWeight: '600',
        colors: ["#64748b"]
      }
    },
    legend: {
      show: false,
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 4,
      padding: {
        top: 20,
        right: 0,
        left: 0,
      },
    },
    xaxis: {
      categories: ageDistribution.categories,
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '13px',
          fontWeight: 500,
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
          fontSize: '13px',
          fontWeight: 500,
        },
        formatter: function(val) {
          return val + '%';
        }
      },
    },
    tooltip: {
      y: {
        formatter: function(val) {
          return val + '%';
        },
      },
      theme: 'light',
      style: {
        fontFamily: 'Inter, sans-serif',
      }
    },
  };

  const series = [{
    name: 'Persentase',
    data: ageDistribution.data,
  }];

  return (
    <motion.div 
      variants={chartContainerVariants}
      initial="hidden"
      animate="visible"
      className="chart-container p-5"
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
        <span className="w-2 h-6 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full mr-3"></span>
        Distribusi Umur Pasien
      </h3>
      <ReactApexChart 
        options={options}
        series={series}
        type="bar"
        height={320}
      />
    </motion.div>
  );
};

const GenderDistributionChart = ({ genderDistribution }) => {
  const { theme } = useTheme();
  
  console.log('GenderDistribution data received:', genderDistribution);
  
  // Memastikan genderDistribution adalah array dengan dua nilai
  const safeGenderDistribution = Array.isArray(genderDistribution) && genderDistribution.length === 2 
    ? genderDistribution 
    : [50, 50]; // Default fallback jika data tidak valid
  
  const options = {
    chart: {
      type: 'pie',
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
        top: 3,
        left: 3,
        blur: 4,
        opacity: 0.12
      },
    },
    colors: ['#3b82f6', '#ec4899'],
    labels: ['Laki-laki', 'Perempuan'],
    legend: {
      position: 'bottom',
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      fontWeight: 500,
      markers: {
        width: 12,
        height: 12,
        radius: 6,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5
      }
    },
    plotOptions: {
      pie: {
        expandOnClick: true,
        dataLabels: {
          offset: -10,
        }
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val.toFixed(1) + '%';
      },
      style: {
        fontSize: '14px',
        fontWeight: '600',
        fontFamily: 'Inter, sans-serif',
      },
      dropShadow: {
        enabled: false,
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          height: 280,
        },
        legend: {
          position: 'bottom',
          fontSize: '12px',
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
        fontFamily: 'Inter, sans-serif',
      }
    },
  };

  const series = safeGenderDistribution;

  return (
    <motion.div 
      variants={chartContainerVariants}
      initial="hidden"
      animate="visible"
      className="chart-container p-5"
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
        <span className="w-2 h-6 bg-gradient-to-b from-blue-500 to-pink-500 rounded-full mr-3"></span>
        Distribusi Gender
      </h3>
      <ReactApexChart 
        options={options}
        series={series}
        type="pie"
        height={320}
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
        top: 3,
        left: 3,
        blur: 4,
        opacity: 0.12
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        dataLabels: {
          name: {
            fontSize: '16px',
            color: '#64748b',
            offsetY: 80,
          },
          value: {
            offsetY: 40,
            fontSize: '22px',
            fontWeight: 700,
            color: theme.primary,
            formatter: function (val) {
              return val + '%';
            }
          }
        },
        hollow: {
          margin: 15,
          size: '65%',
        },
        track: {
          background: '#f1f5f9',
          strokeWidth: '100%',
          margin: 0,
        },
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'horizontal',
        shadeIntensity: 0.5,
        gradientToColors: [theme.accent],
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100]
      }
    },
    colors: [theme.primary],
    stroke: {
      dashArray: 4,
      lineCap: 'round'
    },
    labels: ['Tingkat Kepercayaan AI'],
  };

  const series = [confidenceLevels.average];

  return (
    <motion.div 
      variants={chartContainerVariants}
      initial="hidden"
      animate="visible"
      className="chart-container p-5"
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
        <span className="w-2 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full mr-3"></span>
        Tingkat Kepercayaan AI
      </h3>
      <ReactApexChart 
        options={options}
        series={series}
        type="radialBar"
        height={320}
      />
      <div className="mt-4 grid grid-cols-3 gap-3">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100"
        >
          <p className="text-xs text-gray-500">Tertinggi</p>
          <p className="text-lg font-bold text-green-600">{confidenceLevels.highest}%</p>
        </motion.div>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100"
        >
          <p className="text-xs text-gray-500">Rata-rata</p>
          <p className="text-lg font-bold text-blue-600">{confidenceLevels.average}%</p>
        </motion.div>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100"
        >
          <p className="text-xs text-gray-500">Terendah</p>
          <p className="text-lg font-bold text-amber-600">{confidenceLevels.lowest}%</p>
        </motion.div>
    </div>
    </motion.div>
  );
};

const DashboardCharts = () => {
  const [patients, setPatients] = useState([]);
  const [severityDistribution, setSeverityDistribution] = useState([20, 25, 30, 15, 10]);
  const [monthlyTrend, setMonthlyTrend] = useState({
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    data: [30, 40, 35, 50, 49, 60, 70, 91, 125, 150, 180, 220]
  });
  const [ageGroups, setAgeGroups] = useState({
    categories: ['0-10', '11-20', '21-30', '31-40', '41-50', '51-60', '61+'],
    data: [5, 10, 15, 25, 20, 15, 10]
  });
  const [confidenceLevels, setConfidenceLevels] = useState({
    average: 87,
    highest: 98,
    lowest: 72
  });
  const [genderDistribution, setGenderDistribution] = useState([60, 40]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { theme } = useTheme();
  
  // Tambahkan state untuk statistik pengguna
  const [userStats, setUserStats] = useState({
    totalAnalyses: 0,
    lastActivity: '-',
    profileStatus: 'Aktif'
  });

  // Refresh data function
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching dashboard data...');
      const dashboardData = await getDashboardData();
      console.log('Dashboard data received:', dashboardData);
      
      if (dashboardData) {
        if (dashboardData.severityDistribution) {
          console.log('Setting severity distribution:', dashboardData.severityDistribution);
          setSeverityDistribution(dashboardData.severityDistribution);
        }
        
        if (dashboardData.monthlyTrend) {
          console.log('Setting monthly trend:', dashboardData.monthlyTrend);
          setMonthlyTrend(dashboardData.monthlyTrend);
        }
        
        if (dashboardData.ageGroups) {
          console.log('Setting age groups:', dashboardData.ageGroups);
          setAgeGroups(dashboardData.ageGroups);
        }
        
        if (dashboardData.confidenceLevels) {
          console.log('Setting confidence levels:', dashboardData.confidenceLevels);
          setConfidenceLevels(dashboardData.confidenceLevels);
        }
        
        if (dashboardData.genderDistribution) {
          console.log('Setting gender distribution:', dashboardData.genderDistribution);
          setGenderDistribution(dashboardData.genderDistribution);
        }
        
        if (dashboardData.patients) {
          console.log('Setting patients:', dashboardData.patients.length);
          setPatients(dashboardData.patients);
          
          // Update user stats
          const totalAnalyses = dashboardData.patients.length;
          let lastActivity = '-';
          
          if (totalAnalyses > 0 && dashboardData.monthlyTrend && dashboardData.monthlyTrend.data) {
            const currentMonth = new Date().getMonth();
            const thisMonthAnalyses = dashboardData.monthlyTrend.data[currentMonth] || 0;
            lastActivity = `${thisMonthAnalyses} analisis bulan ini`;
          }
          
          setUserStats({
            totalAnalyses,
            lastActivity,
            profileStatus: 'Aktif'
          });
        }
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error refreshing dashboard data:', err);
      setError('Gagal memuat data dashboard. Silakan coba lagi nanti.');
      setIsLoading(false);
    }
  }, []);

  // Fetch data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch real data from backend API
        console.log('Initial fetch of dashboard data...');
        const dashboardData = await getDashboardData();
        console.log('Initial dashboard data received:', dashboardData);
        
        // Update state with real data if available
        if (dashboardData) {
          if (dashboardData.severityDistribution) {
            console.log('Setting severity distribution:', dashboardData.severityDistribution);
            setSeverityDistribution(dashboardData.severityDistribution);
          }
          
          if (dashboardData.monthlyTrend) {
            console.log('Setting monthly trend:', dashboardData.monthlyTrend);
            setMonthlyTrend(dashboardData.monthlyTrend);
          }
          
          if (dashboardData.ageGroups) {
            console.log('Setting age groups:', dashboardData.ageGroups);
            setAgeGroups(dashboardData.ageGroups);
          }
          
          if (dashboardData.confidenceLevels) {
            console.log('Setting confidence levels:', dashboardData.confidenceLevels);
            setConfidenceLevels(dashboardData.confidenceLevels);
          }
          
          if (dashboardData.genderDistribution) {
            console.log('Setting gender distribution:', dashboardData.genderDistribution);
            setGenderDistribution(dashboardData.genderDistribution);
          }
          
          if (dashboardData.patients) {
            console.log('Setting patients:', dashboardData.patients.length);
            setPatients(dashboardData.patients);
            
            // Update user stats
            const totalAnalyses = dashboardData.patients.length;
            let lastActivity = '-';
            
            if (totalAnalyses > 0 && dashboardData.monthlyTrend && dashboardData.monthlyTrend.data) {
              const currentMonth = new Date().getMonth();
              const thisMonthAnalyses = dashboardData.monthlyTrend.data[currentMonth] || 0;
              lastActivity = `${thisMonthAnalyses} analisis bulan ini`;
            }
            
            setUserStats({
              totalAnalyses,
              lastActivity,
              profileStatus: 'Aktif'
            });
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Gagal memuat data dashboard. Silakan coba lagi nanti.');
        setIsLoading(false);
        
        // Fallback to dummy data if API fails
        // Keep existing dummy data
      }
    };
    
    fetchDashboardData();
  }, []);

  const chartContainerStyle = {
    ...glassEffect,
    transform: 'translateZ(0)',
    willChange: 'transform, opacity'
  };

  return (
    <div className="dashboard-charts">
      <AnimatePresence>
        {isLoading ? (
    <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center items-center h-64"
          >
            <div className="loader">
        <motion.div
                animate={{ 
                  rotate: 360,
                  transition: { 
                    repeat: Infinity, 
                    duration: 1.5, 
                    ease: "linear" 
                  }
                }}
                className="w-12 h-12 border-4 border-t-4 rounded-full"
                style={{
                  borderColor: `${theme.accent}30`,
                  borderTopColor: theme.primary
                }}
              />
              <p className="mt-4 text-gray-600">Memuat data...</p>
            </div>
          </motion.div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700"
          >
            <p className="font-medium">Error: {error}</p>
            <p className="text-sm mt-1">Gagal memuat data. Silakan coba lagi nanti.</p>
        </motion.div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
                style={chartContainerStyle}
                whileHover={{ 
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  translateY: -4
                }}
                className="rounded-xl overflow-hidden transition-all duration-300"
        >
          <SeverityDistributionChart severityDistribution={severityDistribution} />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
                style={chartContainerStyle}
                whileHover={{ 
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  translateY: -4
                }}
                className="rounded-xl overflow-hidden transition-all duration-300"
        >
          <AnalysisTrendChart monthlyTrend={monthlyTrend} />
        </motion.div>
            </div>
        
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
                style={chartContainerStyle}
                whileHover={{ 
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  translateY: -4
                }}
                className="rounded-xl overflow-hidden transition-all duration-300"
              >
                <AgeDistributionChart ageDistribution={ageGroups} />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
                style={chartContainerStyle}
                whileHover={{ 
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  translateY: -4
                }}
                className="rounded-xl overflow-hidden transition-all duration-300"
              >
                <GenderDistributionChart genderDistribution={genderDistribution} />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                style={chartContainerStyle}
                whileHover={{ 
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  translateY: -4
                }}
                className="rounded-xl overflow-hidden transition-all duration-300"
        >
          <AIConfidenceChart confidenceLevels={confidenceLevels} />
        </motion.div>
      </div>
      
      {/* Statistik Pengguna */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        style={chartContainerStyle}
        whileHover={{ 
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          translateY: -4
        }}
        className="rounded-xl overflow-hidden transition-all duration-300 p-6 mt-6"
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
          <span className="w-2 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full mr-3"></span>
          Statistik Pengguna
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <motion.div 
            whileHover={{ scale: 1.03 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100"
          >
            <p className="text-sm text-gray-500 mb-2">Total Analisis</p>
            <p className="text-3xl font-bold" style={{ color: theme.primary }}>{userStats.totalAnalyses}</p>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.03 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-100"
          >
            <p className="text-sm text-gray-500 mb-2">Terakhir Aktivitas</p>
            <p className="text-3xl font-bold" style={{ color: theme.accent }}>{userStats.lastActivity}</p>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.03 }}
            className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-lg border border-purple-100"
          >
            <p className="text-sm text-gray-500 mb-2">Status Profil</p>
            <p className="text-3xl font-bold" style={{ color: theme.secondary }}>{userStats.profileStatus}</p>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mt-4 flex items-center justify-end"
      >
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={refreshData}
          disabled={isLoading}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg flex items-center space-x-2"
        >
          <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{isLoading ? 'Memuat...' : 'Refresh Data'}</span>
        </motion.button>
      </motion.div>
          </div>
        )}
      </AnimatePresence>
        </div>
  );
};

export default DashboardCharts; 