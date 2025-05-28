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
  
  useEffect(() => {
    if (!patients || patients.length === 0) return;
    
    // Kelompok usia
    const ageGroups = ['0-10', '11-20', '21-30', '31-40', '41-50', '51-60', '61+'];
    const genders = ['Laki-laki', 'Perempuan'];
    
    // Inisialisasi data heatmap
    const heatmapData = [];
    
    // Menghitung jumlah pasien untuk setiap kombinasi usia dan gender
    genders.forEach((gender, genderIndex) => {
      ageGroups.forEach((ageGroup, ageIndex) => {
        // Menghitung jumlah pasien dalam kelompok ini
        const count = patients.filter(patient => {
          const patientGender = patient.gender;
          const age = patient.age;
          
          let inAgeGroup = false;
          if (ageGroup === '0-10') inAgeGroup = age >= 0 && age <= 10;
          else if (ageGroup === '11-20') inAgeGroup = age >= 11 && age <= 20;
          else if (ageGroup === '21-30') inAgeGroup = age >= 21 && age <= 30;
          else if (ageGroup === '31-40') inAgeGroup = age >= 31 && age <= 40;
          else if (ageGroup === '41-50') inAgeGroup = age >= 41 && age <= 50;
          else if (ageGroup === '51-60') inAgeGroup = age >= 51 && age <= 60;
          else if (ageGroup === '61+') inAgeGroup = age >= 61;
          
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
    
    setChartData(heatmapData);
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
        shadeIntensity: 0.5,
        radius: 8,
        enableShades: true,
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
          <div class="p-2 bg-white shadow-lg rounded-lg border border-gray-200">
            <div class="font-semibold text-gray-800 mb-1">
              ${data.y} (${data.x} tahun)
            </div>
            <div class="text-sm text-gray-600">
              Jumlah: <span class="font-medium">${data.value}</span> pasien
            </div>
            <div class="text-sm text-gray-600">
              Persentase: <span class="font-medium">${data.percentage}%</span>
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
    },
  };
  
  const series = [
    {
      name: 'Jumlah Pasien',
      data: chartData
    }
  ];
  
  // Statistik tambahan
  const totalPatients = patients?.length || 0;
  const maleCount = patients?.filter(p => p.gender === 'Laki-laki').length || 0;
  const femaleCount = patients?.filter(p => p.gender === 'Perempuan').length || 0;
  const malePercentage = totalPatients > 0 ? Math.round((maleCount / totalPatients) * 100) : 0;
  const femalePercentage = totalPatients > 0 ? Math.round((femaleCount / totalPatients) * 100) : 0;
  
  return (
    <motion.div 
      variants={chartContainerVariants}
      initial="hidden"
      animate="visible"
      className="chart-container p-5"
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
        <span className="w-2 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full mr-3"></span>
        Demografi Pasien
      </h3>
      
      <ReactApexChart 
        options={options}
        series={series}
        type="heatmap"
        height={320}
      />
      
      <div className="mt-6 grid grid-cols-2 gap-4">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 flex items-center"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Laki-laki</p>
            <div className="flex items-end">
              <p className="text-2xl font-bold text-blue-600">{maleCount}</p>
              <p className="ml-2 text-sm text-gray-500">({malePercentage}%)</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="p-4 rounded-lg bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-100 flex items-center"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-pink-100 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Perempuan</p>
            <div className="flex items-end">
              <p className="text-2xl font-bold text-pink-600">{femaleCount}</p>
              <p className="ml-2 text-sm text-gray-500">({femalePercentage}%)</p>
            </div>
          </div>
        </motion.div>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">Total: {totalPatients} pasien</p>
      </div>
    </motion.div>
  );
};

const ConfidenceSeverityTimelineChart = ({ analyses }) => {
  const { theme } = useTheme();
  const [chartData, setChartData] = useState({
    confidenceSeries: [],
    severitySeries: [],
    categories: []
  });
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [highlightedPoint, setHighlightedPoint] = useState(null);
  
  // Mapping tingkat keparahan ke nilai numerik untuk visualisasi
  const severityMapping = {
    'Tidak ada': 0,
    'Ringan': 1,
    'Sedang': 2,
    'Berat': 3,
    'Sangat Berat': 4
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
    if (!analyses || analyses.length === 0) return;
    
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
    filteredAnalyses.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    // Siapkan data untuk chart
    const confidenceData = [];
    const severityData = [];
    const timeLabels = [];
    
    filteredAnalyses.forEach(analysis => {
      // Konversi confidence dari 0-1 ke persentase
      const confidence = Math.round(analysis.results.confidence * 100);
      
      // Dapatkan tingkat keparahan dan konversi ke nilai numerik
      const severityLabel = severityLabels[analysis.results.classification] || analysis.results.classification;
      const severityValue = severityMapping[severityLabel] * 25; // Skala 0-100
      
      // Format tanggal untuk label
      const date = new Date(analysis.createdAt);
      const formattedDate = `${date.getDate()}/${date.getMonth() + 1}`;
      
      confidenceData.push(confidence);
      severityData.push(severityValue);
      timeLabels.push(formattedDate);
    });
    
    setChartData({
      confidenceSeries: confidenceData,
      severitySeries: severityData,
      categories: timeLabels
    });
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
      width: [3, 3]
    },
    markers: {
      size: 4,
      strokeWidth: 2,
      hover: {
        size: 7,
      }
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 4,
      padding: {
        left: 0,
        right: 0,
      },
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
        max: 100
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
            if (val === 0) return 'Tidak ada';
            if (val === 25) return 'Ringan';
            if (val === 50) return 'Sedang';
            if (val === 75) return 'Berat';
            if (val === 100) return 'Sangat Berat';
            return '';
          }
        },
        min: 0,
        max: 100,
        tickAmount: 5
      }
    ],
    tooltip: {
      shared: true,
      intersect: false,
      y: [
        {
          formatter: function(val) {
            return val.toFixed(0) + '%';
          }
        },
        {
          formatter: function(val) {
            if (val === 0) return 'Tidak ada';
            if (val === 25) return 'Ringan';
            if (val === 50) return 'Sedang';
            if (val === 75) return 'Berat';
            if (val === 100) return 'Sangat Berat';
            return '';
          }
        }
      ],
      theme: 'light',
      style: {
        fontFamily: 'Inter, sans-serif',
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
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
        vertical: 0
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
  
  // Statistik kepercayaan AI
  const confidenceData = chartData.confidenceSeries;
  const avgConfidence = confidenceData.length > 0 
    ? Math.round(confidenceData.reduce((a, b) => a + b, 0) / confidenceData.length) 
    : 0;
  const highestConfidence = confidenceData.length > 0 
    ? Math.max(...confidenceData) 
    : 0;
  const lowestConfidence = confidenceData.length > 0 
    ? Math.min(...confidenceData) 
    : 0;
  
  // Fungsi untuk mengubah periode yang dipilih
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };
  
  return (
    <motion.div 
      variants={chartContainerVariants}
      initial="hidden"
      animate="visible"
      className="chart-container p-5"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <span className="w-2 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full mr-3"></span>
          Analisis Tingkat Kepercayaan AI
        </h3>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => handlePeriodChange('month')}
            className={`px-3 py-1 text-xs rounded-md transition-all ${
              selectedPeriod === 'month' 
                ? 'bg-indigo-100 text-indigo-700 font-medium' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            1 Bulan
          </button>
          <button 
            onClick={() => handlePeriodChange('quarter')}
            className={`px-3 py-1 text-xs rounded-md transition-all ${
              selectedPeriod === 'quarter' 
                ? 'bg-indigo-100 text-indigo-700 font-medium' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            3 Bulan
          </button>
          <button 
            onClick={() => handlePeriodChange('year')}
            className={`px-3 py-1 text-xs rounded-md transition-all ${
              selectedPeriod === 'year' 
                ? 'bg-indigo-100 text-indigo-700 font-medium' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            1 Tahun
          </button>
          <button 
            onClick={() => handlePeriodChange('all')}
            className={`px-3 py-1 text-xs rounded-md transition-all ${
              selectedPeriod === 'all' 
                ? 'bg-indigo-100 text-indigo-700 font-medium' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Semua
          </button>
        </div>
      </div>
      
      <ReactApexChart 
        options={options}
        series={series}
        type="line"
        height={320}
      />
      
      <div className="mt-4 grid grid-cols-3 gap-3">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100"
        >
          <p className="text-xs text-gray-500">Tertinggi</p>
          <p className="text-lg font-bold text-green-600">{highestConfidence}%</p>
        </motion.div>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100"
        >
          <p className="text-xs text-gray-500">Rata-rata</p>
          <p className="text-lg font-bold text-blue-600">{avgConfidence}%</p>
        </motion.div>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100"
        >
          <p className="text-xs text-gray-500">Terendah</p>
          <p className="text-lg font-bold text-amber-600">{lowestConfidence}%</p>
        </motion.div>
      </div>
      
      {highlightedPoint && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100"
        >
          <p className="text-sm font-medium text-gray-700">
            Pada tanggal {chartData.categories[highlightedPoint.dataPointIndex]}, 
            {highlightedPoint.seriesIndex === 0 ? (
              <span> tingkat kepercayaan AI adalah <span className="font-bold text-indigo-600">{chartData.confidenceSeries[highlightedPoint.dataPointIndex]}%</span></span>
            ) : (
              <span> tingkat keparahan adalah <span className="font-bold text-purple-600">
                {chartData.severitySeries[highlightedPoint.dataPointIndex] === 0 && 'Tidak ada'}
                {chartData.severitySeries[highlightedPoint.dataPointIndex] === 25 && 'Ringan'}
                {chartData.severitySeries[highlightedPoint.dataPointIndex] === 50 && 'Sedang'}
                {chartData.severitySeries[highlightedPoint.dataPointIndex] === 75 && 'Berat'}
                {chartData.severitySeries[highlightedPoint.dataPointIndex] === 100 && 'Sangat Berat'}
              </span></span>
            )}
          </p>
        </motion.div>
      )}
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
              <ConfidenceSeverityTimelineChart analyses={patients} />
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