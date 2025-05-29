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

const AgeGenderHeatmapChart = ({ patients }) => {
  const { theme } = useTheme();
  const [chartData, setChartData] = useState([]);
  const [genderStats, setGenderStats] = useState({
    maleCount: 0,
    femaleCount: 0,
    malePercentage: 0,
    femalePercentage: 0,
    totalPatients: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!patients || patients.length === 0) {
      console.log('No patient data available for AgeGenderHeatmapChart');
      setIsLoading(false);
      return;
    }
    
    console.log('Processing patient data for AgeGenderHeatmapChart:', patients.length);
    setIsLoading(true);
    
    // Kelompok usia
    const ageGroups = ['0-10', '11-20', '21-30', '31-40', '41-50', '51-60', '61+'];
    const genders = ['Laki-laki', 'Perempuan'];
    
    // Inisialisasi data heatmap
    const heatmapData = [];
    
    // Menghitung jumlah pasien untuk setiap gender
    let maleCount = 0;
    let femaleCount = 0;
    let totalValidPatients = 0;
    
    // Menghitung jumlah pasien untuk setiap kombinasi usia dan gender
    genders.forEach((gender, genderIndex) => {
      ageGroups.forEach((ageGroup, ageIndex) => {
        // Menghitung jumlah pasien dalam kelompok ini
        const count = patients.filter(patient => {
          // Validasi data pasien
          if (!patient || typeof patient.gender === 'undefined' || typeof patient.age === 'undefined') {
            console.log('Invalid patient data:', patient);
            return false;
          }
          
          const patientGender = patient.gender;
          const age = parseInt(patient.age);
          
          // Skip jika umur tidak valid
          if (isNaN(age) || age < 0) {
            console.log('Invalid age for patient:', patient);
            return false;
          }
          
          let inAgeGroup = false;
          if (ageGroup === '0-10') inAgeGroup = age >= 0 && age <= 10;
          else if (ageGroup === '11-20') inAgeGroup = age >= 11 && age <= 20;
          else if (ageGroup === '21-30') inAgeGroup = age >= 21 && age <= 30;
          else if (ageGroup === '31-40') inAgeGroup = age >= 31 && age <= 40;
          else if (ageGroup === '41-50') inAgeGroup = age >= 41 && age <= 50;
          else if (ageGroup === '51-60') inAgeGroup = age >= 51 && age <= 60;
          else if (ageGroup === '61+') inAgeGroup = age >= 61;
          
          // Hitung total untuk setiap gender
          if (patientGender === gender) {
            if (gender === 'Laki-laki') maleCount++;
            else if (gender === 'Perempuan') femaleCount++;
          }
          
          return patientGender === gender && inAgeGroup;
        }).length;
        
        // Menambahkan data ke array heatmap
        heatmapData.push({
          x: ageGroup,
          y: gender,
          value: count,
          // Menghitung persentase untuk tooltip
          percentage: patients.length > 0 ? Math.round((count / patients.length) * 100) : 0
        });
      });
    });
    
    // Hitung total pasien valid
    totalValidPatients = maleCount + femaleCount;
    
    // Hitung persentase
    const malePercentage = totalValidPatients > 0 ? Math.round((maleCount / totalValidPatients) * 100) : 0;
    const femalePercentage = totalValidPatients > 0 ? Math.round((femaleCount / totalValidPatients) * 100) : 0;
    
    // Update state
    setGenderStats({
      maleCount,
      femaleCount,
      malePercentage,
      femalePercentage,
      totalPatients: totalValidPatients
    });
    
    // Gunakan setTimeout untuk memberikan efek animasi loading
    setTimeout(() => {
      setChartData(heatmapData);
      setIsLoading(false);
    }, 800);
    
    console.log('Heatmap data processed:', heatmapData.length);
    console.log('Gender stats:', { maleCount, femaleCount, totalValidPatients });
  }, [patients]);
  
  const options = {
    chart: {
      type: 'heatmap',
      fontFamily: 'Inter, sans-serif',
      toolbar: {
        show: false
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 1000,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 450
        }
      },
      dropShadow: {
        enabled: true,
        top: 3,
        left: 3,
        blur: 6,
        opacity: 0.15,
        color: theme.primary
      }
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '14px',
        fontWeight: '600',
        fontFamily: 'Inter, sans-serif',
      },
      formatter: function(val) {
        return val > 0 ? val : '';
      }
    },
    colors: [theme.primary],
    title: {
      text: 'Distribusi Pasien berdasarkan Usia dan Gender',
      align: 'center',
      style: {
        fontSize: '16px',
        fontWeight: 600,
        fontFamily: 'Inter, sans-serif',
        color: '#1e293b'
      }
    },
    plotOptions: {
      heatmap: {
        shadeIntensity: 0.6,
        radius: 10,
        enableShades: true,
        distributed: true,
        useFillColorAsStroke: false,
        colorScale: {
          ranges: [
            {
              from: 0,
              to: 0,
              color: '#F9FAFB',
              name: 'Tidak ada'
            },
            {
              from: 1,
              to: 5,
              color: '#DBEAFE',
              name: 'Sangat sedikit'
            },
            {
              from: 6,
              to: 10,
              color: '#93C5FD',
              name: 'Sedikit'
            },
            {
              from: 11,
              to: 20,
              color: '#60A5FA',
              name: 'Sedang'
            },
            {
              from: 21,
              to: 30,
              color: '#3B82F6',
              name: 'Banyak'
            },
            {
              from: 31,
              to: 1000,
              color: '#1D4ED8',
              name: 'Sangat banyak'
            }
          ]
        }
      }
    },
    stroke: {
      width: 1,
      colors: ['#fff']
    },
    tooltip: {
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const data = w.config.series[seriesIndex].data[dataPointIndex];
        return `
          <div class="p-3 bg-white shadow-lg rounded-lg border border-gray-200">
            <div class="font-semibold text-gray-800 mb-2 text-base">
              ${data.y} (${data.x} tahun)
            </div>
            <div class="text-sm text-gray-600 flex items-center">
              <span class="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
              Jumlah: <span class="font-medium ml-1">${data.value}</span> pasien
            </div>
            <div class="text-sm text-gray-600 flex items-center mt-1">
              <span class="inline-block w-3 h-3 rounded-full bg-indigo-500 mr-2"></span>
              Persentase: <span class="font-medium ml-1">${data.percentage}%</span>
            </div>
          </div>
        `;
      }
    },
    xaxis: {
      categories: ['0-10', '11-20', '21-30', '31-40', '41-50', '51-60', '61+'],
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '13px',
          fontWeight: 500,
        },
      },
      title: {
        text: 'Kelompok Usia',
        style: {
          fontSize: '14px',
          fontWeight: 500,
          color: '#64748b'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '13px',
          fontWeight: 500,
        },
      },
      title: {
        text: 'Gender',
        style: {
          fontSize: '14px',
          fontWeight: 500,
          color: '#64748b'
        }
      }
    }
  };

  const series = [
    {
      name: 'Jumlah Pasien',
      data: chartData
    }
  ];

  const { maleCount, femaleCount, malePercentage, femalePercentage, totalPatients } = genderStats;

  return (
    <motion.div 
      variants={chartContainerVariants}
      initial="hidden"
      animate="visible"
      className="chart-container p-5"
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
        <span className="w-2 h-6 bg-gradient-to-b from-indigo-500 to-blue-500 rounded-full mr-3"></span>
        Demografi Pasien
      </h3>
      
      <div className="mb-6 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10 rounded-lg" style={{ minHeight: "320px" }}>
            <motion.div
              animate={{ 
                rotate: 360,
                transition: { 
                  repeat: Infinity, 
                  duration: 1.5, 
                  ease: "linear" 
                }
              }}
              className="w-10 h-10 border-4 border-t-4 rounded-full"
              style={{
                borderColor: `${theme.accent}30`,
                borderTopColor: theme.primary
              }}
            />
          </div>
        ) : null}
        
        <ReactApexChart 
          options={options}
          series={series}
          type="heatmap"
          height={320}
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <motion.div 
          whileHover={{ scale: 1.05, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
          className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 flex items-center transition-all duration-300"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Laki-laki</p>
            <div className="flex items-end">
              <motion.p 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-2xl font-bold text-blue-600"
              >
                {maleCount}
              </motion.p>
              <p className="ml-2 text-sm text-gray-500">({malePercentage}%)</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.05, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
          className="p-4 rounded-lg bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-100 flex items-center transition-all duration-300"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-pink-100 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Perempuan</p>
            <div className="flex items-end">
              <motion.p 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-2xl font-bold text-pink-600"
              >
                {femaleCount}
              </motion.p>
              <p className="ml-2 text-sm text-gray-500">({femalePercentage}%)</p>
            </div>
          </div>
        </motion.div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-4 text-center"
      >
        <p className="text-sm text-gray-500">Total: <span className="font-medium">{totalPatients}</span> pasien</p>
        {totalPatients === 0 && (
          <p className="text-xs text-gray-400 mt-1">Tidak ada data pasien yang tersedia</p>
        )}
      </motion.div>
    </motion.div>
  );
};

const ConfidenceSeverityTimelineChart = ({ analyses, confidenceLevels }) => {
  const { theme } = useTheme();
  const [chartData, setChartData] = useState({
    confidenceSeries: [],
    severitySeries: [],
    categories: []
  });
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [highlightedPoint, setHighlightedPoint] = useState(null);
  const [noDataAvailable, setNoDataAvailable] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Menyediakan nilai default untuk confidenceLevels jika tidak ada
  const defaultConfidenceLevels = useMemo(() => ({
    average: 0,
    highest: 0,
    lowest: 0
  }), []);
  
  // Gunakan confidenceLevels yang diberikan atau nilai default
  const safeConfidenceLevels = useMemo(() => {
    // Log untuk debugging
    console.log('ConfidenceSeverityTimelineChart received confidenceLevels:', confidenceLevels);
    
    // Validasi confidenceLevels
    if (!confidenceLevels) {
      console.warn('ConfidenceSeverityTimelineChart: confidenceLevels prop is missing, using default values');
      return defaultConfidenceLevels;
    }
    
    // Validasi properti yang diharapkan
    const { average, highest, lowest } = confidenceLevels;
    if (average === undefined || highest === undefined || lowest === undefined) {
      console.warn('ConfidenceSeverityTimelineChart: confidenceLevels is missing required properties, using default values');
      return {
        average: average ?? defaultConfidenceLevels.average,
        highest: highest ?? defaultConfidenceLevels.highest,
        lowest: lowest ?? defaultConfidenceLevels.lowest
      };
    }
    
    return confidenceLevels;
  }, [confidenceLevels, defaultConfidenceLevels]);
  
  // Mapping tingkat keparahan ke nilai numerik untuk visualisasi
  const severityMapping = {
    'Tidak ada': 0,
    'Ringan': 1,
    'Sedang': 2,
    'Berat': 3,
    'Sangat Berat': 4,
    // Tambahkan mapping bahasa Inggris
    'No DR': 0,
    'Mild': 1,
    'Moderate': 2,
    'Severe': 3,
    'Proliferative DR': 4
  };
  
  // Mapping dari kelas bahasa Inggris ke Indonesia
  const severityLabels = {
    'No DR': 'Tidak ada',
    'Mild': 'Ringan',
    'Moderate': 'Sedang',
    'Severe': 'Berat',
    'Proliferative DR': 'Sangat Berat'
  };
  
  useEffect(() => {
    if (!analyses || analyses.length === 0) {
      console.log('No analyses data available for ConfidenceSeverityTimelineChart');
      setNoDataAvailable(true);
      return;
    }
    
    console.log('Processing analyses data for ConfidenceSeverityTimelineChart:', analyses.length);
    setNoDataAvailable(false);
    setIsAnimating(true);
    
    // Filter data berdasarkan periode yang dipilih
    let filteredAnalyses = [...analyses];
    const now = new Date();
    
    if (selectedPeriod === 'month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);
      filteredAnalyses = analyses.filter(a => new Date(a.createdAt) >= oneMonthAgo);
    } else if (selectedPeriod === 'quarter') {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(now.getMonth() - 3);
      filteredAnalyses = analyses.filter(a => new Date(a.createdAt) >= threeMonthsAgo);
    } else if (selectedPeriod === 'year') {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      filteredAnalyses = analyses.filter(a => new Date(a.createdAt) >= oneYearAgo);
    }
    
    // Urutkan analisis berdasarkan waktu
    filteredAnalyses.sort((a, b) => new Date(a.createdAt || a.timestamp || 0) - new Date(b.createdAt || b.timestamp || 0));
    
    // Siapkan data untuk chart
    const confidenceData = [];
    const severityData = [];
    const timeLabels = [];
    const validAnalyses = [];
    
    filteredAnalyses.forEach(analysis => {
      // Tambahkan validasi untuk memastikan analysis.results ada dan memiliki properti confidence
      if (!analysis || !analysis.results || typeof analysis.results.confidence === 'undefined') {
        console.warn('Skipping analysis with invalid data structure:', analysis);
        return; // Skip item ini
      }
      
      try {
        // Konversi confidence dari 0-1 ke persentase
        const confidence = Math.round((analysis.results.confidence || 0) * 100);
        
        // Dapatkan tingkat keparahan dan konversi ke nilai numerik
        const classification = analysis.results.classification || 'No DR';
        const severityLabel = severityLabels[classification] || classification;
        const severityValue = (severityMapping[severityLabel] || severityMapping[classification] || 0) * 25; // Skala 0-100
        
        // Format tanggal untuk label
        const date = new Date(analysis.createdAt || analysis.timestamp || 0);
        const formattedDate = `${date.getDate()}/${date.getMonth() + 1}`;
        
        confidenceData.push(confidence);
        severityData.push(severityValue);
        timeLabels.push(formattedDate);
        validAnalyses.push(analysis);
      } catch (error) {
        console.error('Error processing analysis data:', error, analysis);
      }
    });
    
    // Jika tidak ada data valid, tampilkan pesan
    if (validAnalyses.length === 0) {
      setNoDataAvailable(true);
    }
    
    console.log(`Processed ${validAnalyses.length} valid analyses for chart`);
    
    setChartData({
      confidenceSeries: confidenceData,
      severitySeries: severityData,
      categories: timeLabels
    });
    
    // Matikan animasi setelah data diproses
    setTimeout(() => {
      setIsAnimating(false);
    }, 1000);
  }, [analyses, selectedPeriod]);
  
  const options = {
    chart: {
      height: 350,
      type: 'line',
      fontFamily: 'Inter, sans-serif',
      toolbar: {
        show: false
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 1000,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 450
        }
      },
      dropShadow: {
        enabled: true,
        top: 3,
        left: 3,
        blur: 5,
        opacity: 0.15,
        color: theme.primary
      },
      events: {
        mouseMove: function(event, chartContext, config) {
          if (config.dataPointIndex !== -1) {
            setHighlightedPoint({
              seriesIndex: config.seriesIndex,
              dataPointIndex: config.dataPointIndex
            });
          }
        },
        mouseLeave: function() {
          setHighlightedPoint(null);
        }
      }
    },
    colors: [theme.primary, theme.accent],
    stroke: {
      curve: 'smooth',
      width: [4, 3],
      dashArray: [0, 5]
    },
    markers: {
      size: 5,
      strokeWidth: 2,
      strokeColors: ['#fff', '#fff'],
      hover: {
        size: 8,
        sizeOffset: 3
      }
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 4,
      padding: {
        left: 10,
        right: 10,
        top: 10
      },
      xaxis: {
        lines: {
          show: true
        }
      }
    },
    xaxis: {
      categories: chartData.categories,
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '13px',
          fontWeight: 500,
        },
      },
      title: {
        text: 'Tanggal Analisis',
        style: {
          fontSize: '14px',
          fontWeight: 500,
          color: '#64748b'
        }
      },
      tooltip: {
        enabled: false
      }
    },
    yaxis: [
      {
        title: {
          text: 'Tingkat Kepercayaan (%)',
          style: {
            fontSize: '14px',
            fontWeight: 500,
            color: '#64748b'
          }
        },
        labels: {
          style: {
            colors: '#64748b',
            fontSize: '13px',
            fontWeight: 500,
          },
          formatter: function(val) {
            return val.toFixed(0) + '%';
          }
        },
        min: 0,
        max: 100,
        forceNiceScale: true
      },
      {
        opposite: true,
        title: {
          text: 'Tingkat Keparahan',
          style: {
            fontSize: '14px',
            fontWeight: 500,
            color: '#64748b'
          }
        },
        labels: {
          style: {
            colors: '#64748b',
            fontSize: '13px',
            fontWeight: 500,
          },
          formatter: function(val) {
            const severityLevels = ['Tidak ada', 'Ringan', 'Sedang', 'Berat', 'Sangat Berat'];
            const index = Math.round(val / 25);
            return severityLevels[index] || '';
          }
        },
        min: 0,
        max: 100,
        tickAmount: 4
      }
    ],
    tooltip: {
      shared: true,
      intersect: false,
      theme: 'light',
      style: {
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif'
      },
      marker: {
        show: true,
      },
      x: {
        show: true,
        format: 'dd MMM',
      },
      y: [{
        formatter: function(y) {
          if(typeof y !== "undefined") {
            return y.toFixed(0) + "%";
          }
          return y;
        }
      }, {
        formatter: function(y) {
          if(typeof y !== "undefined") {
            const severityLevels = ['Tidak ada', 'Ringan', 'Sedang', 'Berat', 'Sangat Berat'];
            const index = Math.round(y / 25);
            return severityLevels[index] || '';
          }
          return y;
        }
      }]
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      floating: true,
      offsetY: -25,
      offsetX: -5,
      markers: {
        width: 12,
        height: 12,
        radius: 6,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 0
      }
    },
    fill: {
      type: ['gradient', 'gradient'],
      gradient: {
        shade: 'light',
        type: "vertical",
        shadeIntensity: 0.4,
        gradientToColors: [theme.primary, theme.accent],
        inverseColors: false,
        opacityFrom: 0.9,
        opacityTo: 0.3,
        stops: [0, 100]
      }
    }
  };

  const series = [
    {
      name: 'Tingkat Kepercayaan',
      type: 'line',
      data: chartData.confidenceSeries
    },
    {
      name: 'Tingkat Keparahan',
      type: 'line',
      data: chartData.severitySeries
    }
  ];

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    setIsAnimating(true);
  };

  return (
    <motion.div 
      variants={chartContainerVariants}
      initial="hidden"
      animate="visible"
      className="chart-container p-5"
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
        <span className="w-2 h-6 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-full mr-3"></span>
        Analisis Tingkat Kepercayaan AI
      </h3>
      
      <div className="mb-6 flex flex-wrap items-center justify-between">
        <p className="text-sm text-gray-600 mb-2 md:mb-0">
          Menampilkan tren tingkat kepercayaan AI dan tingkat keparahan dari waktu ke waktu
        </p>
        
        <div className="flex space-x-2">
          <motion.button 
            onClick={() => handlePeriodChange('month')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-3 py-1 text-xs rounded-full transition-all duration-300 ${
              selectedPeriod === 'month' 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            1 Bulan
          </motion.button>
          <motion.button 
            onClick={() => handlePeriodChange('quarter')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-3 py-1 text-xs rounded-full transition-all duration-300 ${
              selectedPeriod === 'quarter' 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            3 Bulan
          </motion.button>
          <motion.button 
            onClick={() => handlePeriodChange('year')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-3 py-1 text-xs rounded-full transition-all duration-300 ${
              selectedPeriod === 'year' 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            1 Tahun
          </motion.button>
          <motion.button 
            onClick={() => handlePeriodChange('all')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-3 py-1 text-xs rounded-full transition-all duration-300 ${
              selectedPeriod === 'all' 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Semua
          </motion.button>
        </div>
      </div>
      
      {noDataAvailable ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200"
        >
          <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600 text-center">Tidak ada data analisis yang tersedia untuk periode ini.</p>
          <p className="text-gray-500 text-sm mt-2">Silakan lakukan analisis retina untuk melihat data.</p>
        </motion.div>
      ) : (
        <div className="relative">
          {isAnimating && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10 rounded-lg">
              <motion.div
                animate={{ 
                  rotate: 360,
                  transition: { 
                    repeat: Infinity, 
                    duration: 1.5, 
                    ease: "linear" 
                  }
                }}
                className="w-10 h-10 border-4 border-t-4 rounded-full"
                style={{
                  borderColor: `${theme.accent}30`,
                  borderTopColor: theme.primary
                }}
              />
            </div>
          )}
          <ReactApexChart 
            options={options}
            series={series}
            type="line"
            height={350}
          />
        </div>
      )}
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          whileHover={{ scale: 1.03, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100 transition-all duration-300"
        >
          <p className="text-sm text-gray-500 mb-1">Rata-rata Kepercayaan AI</p>
          <p className="text-2xl font-bold text-blue-600">{safeConfidenceLevels.average}%</p>
        </motion.div>
        <motion.div 
          whileHover={{ scale: 1.03, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
          className="bg-gradient-to-br from-green-50 to-teal-50 p-4 rounded-lg border border-green-100 transition-all duration-300"
        >
          <p className="text-sm text-gray-500 mb-1">Kepercayaan Tertinggi</p>
          <p className="text-2xl font-bold text-green-600">{safeConfidenceLevels.highest}%</p>
        </motion.div>
        <motion.div 
          whileHover={{ scale: 1.03, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
          className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-100 transition-all duration-300"
        >
          <p className="text-sm text-gray-500 mb-1">Kepercayaan Terendah</p>
          <p className="text-2xl font-bold text-amber-600">{safeConfidenceLevels.lowest}%</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

const DashboardCharts = () => {
  const [patients, setPatients] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [severityDistribution, setSeverityDistribution] = useState([0, 0, 0, 0, 0]);
  const [monthlyTrend, setMonthlyTrend] = useState({
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  });
  const [ageGroups, setAgeGroups] = useState({
    categories: ['0-10', '11-20', '21-30', '31-40', '41-50', '51-60', '61+'],
    data: [0, 0, 0, 0, 0, 0, 0]
  });
  const [confidenceLevels, setConfidenceLevels] = useState({
    average: 0,
    highest: 0,
    lowest: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(60); // dalam detik
  const [refreshCountdown, setRefreshCountdown] = useState(0);
  const { theme } = useTheme();
  
  // Tambahkan state untuk statistik pengguna
  const [userStats, setUserStats] = useState({
    totalAnalyses: 0,
    lastActivity: '-',
    profileStatus: 'Aktif'
  });

  // Format tanggal dan waktu
  const formatDateTime = (date) => {
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Refresh data function
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching dashboard data...');
      const dashboardData = await getDashboardData();
      console.log('Dashboard data received:', dashboardData);
      
      if (dashboardData) {
        // Selalu update state dengan data dari API tanpa kondisi tambahan
        console.log('Setting severity distribution:', dashboardData.severityDistribution);
        setSeverityDistribution(dashboardData.severityDistribution);
        
        console.log('Setting monthly trend:', dashboardData.monthlyTrend);
        setMonthlyTrend(dashboardData.monthlyTrend);
        
        console.log('Setting age groups:', dashboardData.ageGroups);
        setAgeGroups(dashboardData.ageGroups);
        
        // Validasi confidenceLevels sebelum menetapkan state
        if (dashboardData.confidenceLevels) {
          console.log('Setting confidence levels:', dashboardData.confidenceLevels);
          // Pastikan semua properti yang diharapkan ada
          const validatedConfidenceLevels = {
            average: dashboardData.confidenceLevels.average ?? 0,
            highest: dashboardData.confidenceLevels.highest ?? 0,
            lowest: dashboardData.confidenceLevels.lowest ?? 0
          };
          setConfidenceLevels(validatedConfidenceLevels);
        } else {
          console.warn('Dashboard data does not contain confidenceLevels, using default values');
          setConfidenceLevels({
            average: 0,
            highest: 0,
            lowest: 0
          });
        }
        
        console.log('Setting patients:', dashboardData.patients ? dashboardData.patients.length : 0);
        setPatients(dashboardData.patients || []);
        
        // Simpan data analisis
        console.log('Setting analyses:', dashboardData.analyses ? dashboardData.analyses.length : 0);
        setAnalyses(dashboardData.analyses || []);
        
        // Update user stats
        const totalAnalyses = dashboardData.analyses ? dashboardData.analyses.length : 0;
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

        // Update waktu refresh terakhir
        setLastRefresh(new Date());
        // Reset countdown
        setRefreshCountdown(refreshInterval);
      } else {
        // Jika tidak ada data, tampilkan pesan error
        setError('Tidak ada data yang diterima dari server');
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error refreshing dashboard data:', err);
      setError('Gagal memuat data dashboard. Silakan coba lagi nanti.');
      setIsLoading(false);
    }
  }, [refreshInterval]);

  // Toggle auto refresh
  const toggleAutoRefresh = () => {
    setAutoRefresh(prev => !prev);
  };

  // Handle interval change
  const handleIntervalChange = (e) => {
    const newInterval = parseInt(e.target.value);
    setRefreshInterval(newInterval);
    setRefreshCountdown(newInterval);
  };

  // Countdown timer untuk auto refresh
  useEffect(() => {
    let timer;
    if (autoRefresh && !isLoading) {
      timer = setInterval(() => {
        setRefreshCountdown(prev => {
          if (prev <= 1) {
            refreshData();
            return refreshInterval;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [autoRefresh, refreshInterval, isLoading, refreshData]);

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
          // Selalu update state dengan data dari API tanpa kondisi tambahan
          console.log('Setting severity distribution:', dashboardData.severityDistribution);
          setSeverityDistribution(dashboardData.severityDistribution);
          
          console.log('Setting monthly trend:', dashboardData.monthlyTrend);
          setMonthlyTrend(dashboardData.monthlyTrend);
          
          console.log('Setting age groups:', dashboardData.ageGroups);
          setAgeGroups(dashboardData.ageGroups);
          
          // Validasi confidenceLevels sebelum menetapkan state
          if (dashboardData.confidenceLevels) {
            console.log('Setting confidence levels:', dashboardData.confidenceLevels);
            // Pastikan semua properti yang diharapkan ada
            const validatedConfidenceLevels = {
              average: dashboardData.confidenceLevels.average ?? 0,
              highest: dashboardData.confidenceLevels.highest ?? 0,
              lowest: dashboardData.confidenceLevels.lowest ?? 0
            };
            setConfidenceLevels(validatedConfidenceLevels);
          } else {
            console.warn('Dashboard data does not contain confidenceLevels, using default values');
            setConfidenceLevels({
              average: 0,
              highest: 0,
              lowest: 0
            });
          }
          
          console.log('Setting patients:', dashboardData.patients ? dashboardData.patients.length : 0);
          setPatients(dashboardData.patients || []);
          
          // Simpan data analisis
          console.log('Setting analyses:', dashboardData.analyses ? dashboardData.analyses.length : 0);
          setAnalyses(dashboardData.analyses || []);
          
          // Update user stats
          const totalAnalyses = dashboardData.analyses ? dashboardData.analyses.length : 0;
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

          // Update waktu refresh terakhir
          setLastRefresh(new Date());
          // Set countdown
          setRefreshCountdown(refreshInterval);
        } else {
          // Jika tidak ada data, tampilkan pesan error
          setError('Tidak ada data yang diterima dari server');
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Gagal memuat data dashboard. Silakan coba lagi nanti.');
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [refreshInterval]);

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
                className="rounded-xl overflow-hidden transition-all duration-300 lg:col-span-2"
              >
                <AgeGenderHeatmapChart patients={patients} />
              </motion.div>
            </div>
            
            {/* Grafik Confidence vs Severity Timeline */}
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
              {/* Log untuk debugging */}
              {console.log('Rendering ConfidenceSeverityTimelineChart with confidenceLevels:', confidenceLevels)}
              <ConfidenceSeverityTimelineChart 
                analyses={analyses} 
                confidenceLevels={confidenceLevels}  // Lewatkan confidenceLevels sebagai prop
              />
            </motion.div>
            
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
                  className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-lg border border-green-100"
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

            {/* Refresh Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
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
                  
                  <div className="flex items-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={autoRefresh} 
                        onChange={toggleAutoRefresh}
                        className="sr-only peer" 
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      <span className="ms-3 text-sm font-medium text-gray-700">Auto Refresh</span>
                    </label>
                  </div>
                  
                  {autoRefresh && (
                    <div className="flex items-center space-x-2">
                      <select 
                        value={refreshInterval} 
                        onChange={handleIntervalChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
                      >
                        <option value="30">30 detik</option>
                        <option value="60">1 menit</option>
                        <option value="300">5 menit</option>
                        <option value="600">10 menit</option>
                      </select>
                      
                      <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        Refresh dalam: <span className="font-medium">{refreshCountdown}</span> detik
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="text-xs text-gray-500 flex items-center">
                  <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Terakhir diperbarui: {formatDateTime(lastRefresh)}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardCharts; 