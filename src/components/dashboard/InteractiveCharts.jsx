import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactApexChart from 'react-apexcharts';
import { useTheme } from '../../context/ThemeContext';
import '../../utils/animation.css';

export const HeatMapChart = ({ data = [] }) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  
  // Generate sample data jika tidak ada data
  const generateData = (count, min, max) => {
    const series = [];
    for (let i = 0; i < count; i++) {
      const dataPoints = [];
      for (let j = 0; j < 12; j++) {
        dataPoints.push(Math.floor(Math.random() * (max - min + 1)) + min);
      }
      series.push({
        name: `Region ${i + 1}`,
        data: dataPoints
      });
    }
    return series;
  };
  
  const chartData = data.length ? data : generateData(5, 0, 100);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  
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
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    colors: [theme.primary],
    title: {
      text: 'Distribusi Aktivitas per Bulan',
      align: 'left',
      style: {
        fontSize: '16px',
        fontWeight: 600,
        fontFamily: 'Inter, sans-serif',
        color: '#334155'
      }
    },
    plotOptions: {
      heatmap: {
        colorScale: {
          ranges: [
            {
              from: 0,
              to: 20,
              color: '#BBDEFB',
              name: 'Rendah'
            },
            {
              from: 21,
              to: 50,
              color: '#64B5F6',
              name: 'Sedang'
            },
            {
              from: 51,
              to: 80,
              color: '#2196F3',
              name: 'Tinggi'
            },
            {
              from: 81,
              to: 100,
              color: '#1565C0',
              name: 'Sangat Tinggi'
            }
          ]
        },
        radius: 3,
        enableShades: true,
        shadeIntensity: 0.5
      }
    },
    xaxis: {
      categories: months,
      labels: {
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif',
          colors: '#64748b'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif',
          colors: '#64748b'
        }
      }
    },
    tooltip: {
      theme: 'light',
      style: {
        fontSize: '12px',
        fontFamily: 'Inter, sans-serif'
      },
      y: {
        formatter: function(val) {
          return val + ' aktivitas';
        }
      }
    },
    legend: {
      position: 'bottom',
      fontSize: '12px',
      fontFamily: 'Inter, sans-serif',
      offsetY: 5
    }
  };

  return (
    <motion.div 
      className="chart-container bg-white p-5 rounded-xl shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ boxShadow: theme.mediumShadow }}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-800">Distribusi Aktivitas</h3>
        <motion.div 
          className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full"
          animate={{ 
            scale: isHovered ? 1.05 : 1,
            backgroundColor: isHovered ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'
          }}
        >
          Interaktif
        </motion.div>
      </div>
      <ReactApexChart 
        options={options}
        series={chartData}
        type="heatmap"
        height={350}
      />
    </motion.div>
  );
};

export const BubbleChart = ({ data = [] }) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  
  // Generate sample data jika tidak ada data
  const generateData = (baseval, count, min, max) => {
    const series = [];
    const groups = ['Keparahan Rendah', 'Keparahan Sedang', 'Keparahan Tinggi'];
    
    for (let i = 0; i < 3; i++) {
      const data = [];
      for (let j = 0; j < count; j++) {
        const x = Math.floor(Math.random() * (max - min + 1)) + min;
        const y = Math.floor(Math.random() * (max - min + 1)) + min;
        const z = Math.floor(Math.random() * (max - min + 1)) + min;
        data.push({ x, y, z });
      }
      series.push({
        name: groups[i],
        data
      });
    }
    return series;
  };
  
  const chartData = data.length ? data : generateData(new Date('11 Feb 2017 GMT').getTime(), 10, 10, 50);
  
  const options = {
    chart: {
      type: 'bubble',
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
        }
      }
    },
    colors: ['#10B981', '#F59E0B', '#EF4444'],
    dataLabels: {
      enabled: false
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.5,
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 0.8,
      }
    },
    title: {
      text: 'Distribusi Pasien berdasarkan Usia dan Keparahan',
      align: 'left',
      style: {
        fontSize: '16px',
        fontWeight: 600,
        fontFamily: 'Inter, sans-serif',
        color: '#334155'
      }
    },
    xaxis: {
      title: {
        text: 'Usia',
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif',
          color: '#64748b'
        }
      },
      labels: {
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif',
          colors: '#64748b'
        },
        formatter: function(val) {
          return val + ' tahun';
        }
      },
      tickAmount: 10
    },
    yaxis: {
      title: {
        text: 'IMT (Indeks Massa Tubuh)',
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif',
          color: '#64748b'
        }
      },
      labels: {
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif',
          colors: '#64748b'
        }
      },
      max: 60
    },
    tooltip: {
      theme: 'light',
      style: {
        fontSize: '12px',
        fontFamily: 'Inter, sans-serif'
      },
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
        return `
          <div class="p-2">
            <div class="mb-1 font-medium">${w.globals.initialSeries[seriesIndex].name}</div>
            <div class="text-xs">
              <div>Usia: ${data.x} tahun</div>
              <div>IMT: ${data.y}</div>
              <div>Jumlah: ${data.z} pasien</div>
            </div>
          </div>
        `;
      }
    },
    legend: {
      position: 'bottom',
      fontSize: '12px',
      fontFamily: 'Inter, sans-serif',
      offsetY: 5
    }
  };

  return (
    <motion.div 
      className="chart-container bg-white p-5 rounded-xl shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ boxShadow: theme.mediumShadow }}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-800">Korelasi Usia & IMT</h3>
        <motion.div 
          className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full"
          animate={{ 
            scale: isHovered ? 1.05 : 1,
            backgroundColor: isHovered ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'
          }}
        >
          Interaktif
        </motion.div>
      </div>
      <ReactApexChart 
        options={options}
        series={chartData}
        type="bubble"
        height={350}
      />
    </motion.div>
  );
};

export const PolarAreaChart = ({ data = [] }) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  
  // Data default jika tidak ada data
  const defaultData = {
    series: [42, 47, 52, 58, 65],
    labels: ['Diabetes', 'Hipertensi', 'Obesitas', 'Hiperlipidemia', 'Penyakit Jantung']
  };
  
  const chartData = data.length ? data : defaultData.series;
  const labels = data.length && data.labels ? data.labels : defaultData.labels;
  
  const options = {
    chart: {
      type: 'polarArea',
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
        }
      }
    },
    labels: labels,
    colors: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899'],
    fill: {
      opacity: 0.8
    },
    stroke: {
      width: 2,
      colors: ['#fff']
    },
    yaxis: {
      show: false
    },
    legend: {
      position: 'bottom',
      fontSize: '12px',
      fontFamily: 'Inter, sans-serif',
      offsetY: 5
    },
    plotOptions: {
      polarArea: {
        rings: {
          strokeWidth: 0
        },
        spokes: {
          strokeWidth: 0
        }
      }
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '12px',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        colors: ['#fff']
      },
      formatter: function (val, opts) {
        return Math.round(val) + '%';
      },
      dropShadow: {
        enabled: true,
        top: 1,
        left: 1,
        blur: 2,
        color: 'rgba(0, 0, 0, 0.35)',
        opacity: 0.8
      }
    },
    tooltip: {
      theme: 'light',
      style: {
        fontSize: '12px',
        fontFamily: 'Inter, sans-serif'
      },
      y: {
        formatter: function(val) {
          return val + '%';
        }
      }
    }
  };

  return (
    <motion.div 
      className="chart-container bg-white p-5 rounded-xl shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ boxShadow: theme.mediumShadow }}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-800">Komorbiditas Pasien</h3>
        <motion.div 
          className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full"
          animate={{ 
            scale: isHovered ? 1.05 : 1,
            backgroundColor: isHovered ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'
          }}
        >
          Interaktif
        </motion.div>
      </div>
      <ReactApexChart 
        options={options}
        series={chartData}
        type="polarArea"
        height={350}
      />
    </motion.div>
  );
};

export const TreemapChart = ({ data = [] }) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  
  // Data default jika tidak ada data
  const defaultData = [
    {
      name: 'Klinik',
      data: [
        { x: 'Klinik A', y: 218 },
        { x: 'Klinik B', y: 149 },
        { x: 'Klinik C', y: 184 },
        { x: 'Klinik D', y: 55 },
        { x: 'Klinik E', y: 84 },
        { x: 'Klinik F', y: 31 }
      ]
    }
  ];
  
  const chartData = data.length ? data : defaultData;
  
  const options = {
    chart: {
      type: 'treemap',
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
        }
      }
    },
    colors: [
      '#3B82F6',
      '#8B5CF6',
      '#10B981',
      '#F59E0B',
      '#EC4899',
      '#6366F1'
    ],
    plotOptions: {
      treemap: {
        distributed: true,
        enableShades: false
      }
    },
    title: {
      text: 'Distribusi Pasien per Klinik',
      align: 'left',
      style: {
        fontSize: '16px',
        fontWeight: 600,
        fontFamily: 'Inter, sans-serif',
        color: '#334155'
      }
    },
    legend: {
      show: false
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        colors: ['#fff']
      },
      formatter: function(text, op) {
        return [text, op.value + ' pasien'];
      },
      dropShadow: {
        enabled: true,
        top: 1,
        left: 1,
        blur: 1,
        color: 'rgba(0, 0, 0, 0.3)',
        opacity: 0.7
      }
    },
    tooltip: {
      theme: 'light',
      style: {
        fontSize: '12px',
        fontFamily: 'Inter, sans-serif'
      },
      y: {
        formatter: function(val) {
          return val + ' pasien';
        }
      }
    }
  };

  return (
    <motion.div 
      className="chart-container bg-white p-5 rounded-xl shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ boxShadow: theme.mediumShadow }}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-800">Distribusi Klinik</h3>
        <motion.div 
          className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full"
          animate={{ 
            scale: isHovered ? 1.05 : 1,
            backgroundColor: isHovered ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'
          }}
        >
          Interaktif
        </motion.div>
      </div>
      <ReactApexChart 
        options={options}
        series={chartData}
        type="treemap"
        height={350}
      />
    </motion.div>
  );
};

const InteractiveCharts = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <HeatMapChart />
      <BubbleChart />
      <PolarAreaChart />
      <TreemapChart />
    </div>
  );
};

export default InteractiveCharts; 