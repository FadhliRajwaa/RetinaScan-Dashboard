import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactApexChart from 'react-apexcharts';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useWebSocket } from '../../context/WebSocketContext';

// Komponen loading skeleton
const SkeletonLoader = ({ className }) => (
  <motion.div
    initial={{ opacity: 0.5 }}
    animate={{ 
      opacity: [0.5, 0.8, 0.5],
      transition: { repeat: Infinity, duration: 1.5 }
    }}
    className={`bg-gray-200 rounded-md ${className}`}
  />
);

// Style glassmorphism
const glassEffect = {
  background: 'rgba(255, 255, 255, 0.85)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.18)',
};

const SeverityDistributionChart = ({ data, isLoading, theme }) => {
  const [chartData, setChartData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [chartHeight, setChartHeight] = useState(350);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const { connected } = useWebSocket();
  
  // Perbarui data chart saat data berubah
  useEffect(() => {
    if (data && data.length > 0) {
      setChartData(data);
      setLastUpdated(new Date());
    } else {
      // Data default jika tidak ada data
      setChartData([
        { id: 'Tidak ada', label: 'Tidak ada', value: 125, color: '#10B981' },
        { id: 'Ringan', label: 'Ringan', value: 98, color: '#3B82F6' },
        { id: 'Sedang', label: 'Sedang', value: 67, color: '#F59E0B' },
        { id: 'Berat', label: 'Berat', value: 45, color: '#EF4444' },
        { id: 'Sangat Berat', label: 'Sangat Berat', value: 17, color: '#7C3AED' }
      ]);
    }
  }, [data]);
  
  // Perbarui chart height ketika ukuran window berubah
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setChartHeight(300);
      } else {
        setChartHeight(350);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Panggil sekali pada awal
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Definisi warna berdasarkan tingkat keparahan
  const severityColors = {
    'Tidak ada': '#10B981',   // hijau
    'Ringan': '#3B82F6',      // biru
    'Sedang': '#F59E0B',      // kuning
    'Berat': '#EF4444',       // merah
    'Sangat Berat': '#7C3AED' // ungu
  };
  
  // Konfigurasi chart
  const chartOptions = {
    chart: {
      type: 'donut',
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
      fontFamily: 'Inter, system-ui, sans-serif',
      foreColor: '#64748b',
      events: {
        dataPointSelection: (event, chartContext, config) => {
          setActiveIndex(config.dataPointIndex);
        },
        dataPointMouseEnter: (event, chartContext, config) => {
          setActiveIndex(config.dataPointIndex);
        },
        dataPointMouseLeave: () => {
          setActiveIndex(null);
        }
      },
      toolbar: {
        show: false
      }
    },
    colors: chartData.map(item => item.color || severityColors[item.label] || '#CBD5E1'),
    labels: chartData.map(item => item.label),
    dataLabels: {
      enabled: true,
      formatter: function(val) {
        return Math.round(val) + '%';
      },
      style: {
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 600
      },
      dropShadow: {
        enabled: false
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
              fontSize: '22px',
              fontWeight: 600,
              offsetY: -10,
            },
            value: {
              show: true,
              fontSize: '18px',
              fontWeight: 500,
              formatter: function (val) {
                return val;
              }
            },
            total: {
              show: true,
              showAlways: true,
              label: 'Total',
              fontSize: '16px',
              fontWeight: 600,
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
              }
            }
          }
        },
        expandOnClick: true
      }
    },
    legend: {
      position: 'bottom',
      fontSize: '14px',
      fontWeight: 500,
      formatter: function(seriesName, opts) {
        return `${seriesName}: <strong>${opts.w.globals.series[opts.seriesIndex]}</strong>`;
      },
      markers: {
        width: 12,
        height: 12,
        radius: 6,
      },
      onItemClick: {
        toggleDataSeries: false
      },
      onItemHover: {
        highlightDataSeries: true
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5
      }
    },
    tooltip: {
      enabled: true,
      theme: 'light',
      style: {
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif'
      },
      y: {
        formatter: function(val) {
          return val + ' pasien';
        },
        title: {
          formatter: function (seriesName) {
            return `<div style="font-weight:600">${seriesName}:</div>`;
          }
        }
      },
      marker: {
        show: false
      },
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const severity = w.globals.labels[seriesIndex];
        const value = series[seriesIndex];
        const color = w.globals.colors[seriesIndex];
        
        return `
          <div class="custom-tooltip" style="
            background: white; 
            padding: 10px 15px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            font-family: Inter, sans-serif;
          ">
            <div style="
              display: flex;
              align-items: center;
              margin-bottom: 5px;
              font-weight: 600;
              font-size: 14px;
            ">
              <span style="
                display: inline-block;
                width: 10px; 
                height: 10px; 
                border-radius: 50%;
                margin-right: 8px;
                background-color: ${color};
              "></span>
              ${severity}
            </div>
            <div style="font-size: 16px; font-weight: 500;">
              ${value} pasien
            </div>
          </div>
        `;
      }
    },
    stroke: {
      width: 0,
      lineCap: 'round',
    },
    states: {
      hover: {
        filter: {
          type: 'darken',
          value: 0.1
        }
      },
      active: {
        filter: {
          type: 'darken',
          value: 0.1
        }
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.2,
        gradientToColors: chartData.map(item => {
          const color = item.color || severityColors[item.label] || '#CBD5E1';
          return color + '99'; // Menambahkan transparansi
        }),
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 0.9,
        stops: [0, 90],
      }
    },
    responsive: [{
      breakpoint: 640,
      options: {
        chart: {
          height: 260
        },
        legend: {
          position: 'bottom',
          fontSize: '12px',
        }
      }
    }]
  };
  
  // Definisi animasi
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  };
  
  // Detil untuk tingkat keparahan yang dipilih
  const severityDetails = {
    'Tidak ada': {
      description: 'Tidak ada tanda retinopati diabetik yang terdeteksi pada retina.',
      recommendation: 'Kontrol rutin setiap tahun.'
    },
    'Ringan': {
      description: 'Terdapat beberapa mikroaneurisma yang menunjukkan kebocoran kapiler retina di beberapa area.',
      recommendation: 'Kontrol gula darah dan tekanan darah. Pemeriksaan ulang dalam 9-12 bulan.'
    },
    'Sedang': {
      description: 'Terdapat perdarahan intraretinal dan eksudat keras yang menunjukkan penurunan fungsi barrier darah-retina.',
      recommendation: 'Konsultasi dengan dokter spesialis mata. Pemeriksaan ulang dalam 6 bulan.'
    },
    'Berat': {
      description: 'Terdapat banyak perdarahan retina, eksudat keras, dan cotton wool spots yang menandakan iskemia retina yang signifikan.',
      recommendation: 'Rujukan segera ke dokter spesialis mata. Pemeriksaan ulang dalam 2-3 bulan.'
    },
    'Sangat Berat': {
      description: 'Terdapat pembentukan pembuluh darah baru (neovaskularisasi) yang abnormal pada retina dan/atau diskus optikus.',
      recommendation: 'Rujukan segera ke dokter spesialis mata untuk evaluasi dan kemungkinan tindakan laser atau operasi.'
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ 
        ...glassEffect,
        transform: 'translateZ(0)',
        willChange: 'transform, opacity'
      }}
      className="p-6 rounded-xl"
      whileHover={{ 
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }}
    >
      <motion.div variants={itemVariants}>
        <h3 className="text-xl font-bold mb-2 text-gray-800 flex items-center">
          <span className="w-2 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full mr-3"></span>
          Distribusi Tingkat Keparahan
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          {connected ? 'Data real-time persebaran pasien berdasarkan tingkat keparahan' : 'Persebaran pasien berdasarkan tingkat keparahan retinopati diabetik'}
        </p>
      </motion.div>
      
      <div className="h-80">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-full"
            >
              <SkeletonLoader className="h-64 w-full rounded-lg" />
            </motion.div>
          ) : chartData.length > 0 ? (
            <motion.div
              key="chart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="h-full"
            >
              <ReactApexChart
                options={chartOptions}
                series={chartData.map(item => item.value)}
                type="donut"
                height={chartHeight}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
      
      {/* Detail panel untuk tingkat keparahan yang dipilih */}
      {activeIndex !== null && chartData[activeIndex] && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
          className="mt-4 p-4 rounded-lg"
          style={{ 
            backgroundColor: `${chartData[activeIndex].color || severityColors[chartData[activeIndex].label]}10`,
            borderLeft: `4px solid ${chartData[activeIndex].color || severityColors[chartData[activeIndex].label]}`
          }}
        >
          <h4 className="font-semibold text-gray-800 mb-2">
            {chartData[activeIndex].label}
          </h4>
          <p className="text-sm text-gray-600 mb-2">
            {severityDetails[chartData[activeIndex].label]?.description || 
             'Informasi detail tidak tersedia untuk tingkat keparahan ini.'}
          </p>
          <p className="text-sm font-medium text-gray-700">
            Rekomendasi: {severityDetails[chartData[activeIndex].label]?.recommendation || 
              'Konsultasikan dengan dokter mata.'}
          </p>
        </motion.div>
      )}
      
      <motion.div 
        variants={itemVariants} 
        className="flex justify-end mt-3"
      >
        <span className="text-xs text-gray-400">
          Diperbarui: {format(lastUpdated, 'dd MMM yyyy, HH:mm:ss', { locale: id })}
        </span>
      </motion.div>
    </motion.div>
  );
};

export default SeverityDistributionChart; 