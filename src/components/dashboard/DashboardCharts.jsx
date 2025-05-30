import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { getDashboardData } from '../../services/api';
import { useWebSocket } from '../../context/WebSocketContext';
import CountUp from 'react-countup';
import ReactApexChart from 'react-apexcharts';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveLine } from '@nivo/line';
import { format, subMonths } from 'date-fns';
import { id } from 'date-fns/locale';
import EnhancedStats from './EnhancedStats';
import SeverityDistributionChart from './SeverityDistributionChart';
import { 
  UserGroupIcon, 
  DocumentChartBarIcon, 
  ClockIcon, 
  CheckCircleIcon,
  SignalIcon
} from '@heroicons/react/24/outline';

// Glassmorphism style
const glassEffect = {
  background: 'rgba(255, 255, 255, 0.85)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.18)',
};

// Loading skeleton component
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

// Stat card component with animation
const StatCard = ({ icon: Icon, title, value, description, color, isLoading }) => {
  return (
    <motion.div
      whileHover={{ 
        y: -5,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        transition: { type: 'spring', stiffness: 400, damping: 10 }
      }}
      style={{ 
        ...glassEffect,
        transform: 'translateZ(0)',
        willChange: 'transform, opacity'
      }}
      className="relative p-6 rounded-xl overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 transform translate-x-8 -translate-y-8 opacity-10">
        <Icon className="w-full h-full" style={{ color }} />
      </div>
      
      <div className="flex flex-col">
        <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
        
        {isLoading ? (
          <SkeletonLoader className="h-10 w-20 mb-1" />
        ) : (
          <div className="text-3xl font-bold mb-1" style={{ color }}>
            <CountUp
              end={value || 0}
              duration={2.5}
              separator="."
              decimal=","
              decimals={title.includes('Persentase') ? 1 : 0}
              suffix={title.includes('Persentase') ? '%' : ''}
            />
          </div>
        )}
        
        {isLoading ? (
          <SkeletonLoader className="h-4 w-36" />
        ) : (
          <p className="text-xs text-gray-500">{description}</p>
        )}
      </div>
    </motion.div>
  );
};

// Main component
const DashboardCharts = () => {
  const { theme } = useTheme();
  const { lastUpdate, connected, requestUpdate } = useWebSocket();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());
  
  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await getDashboardData();
        setDashboardData(data);
        setLastUpdateTime(new Date());
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set some dummy data for development
        setDashboardData({
          totalPatients: 124,
          totalAnalyses: 387,
          completedAnalyses: 352,
          averageTime: 4.2,
          monthlyCounts: Array.from({ length: 12 }, (_, i) => ({
            month: format(subMonths(new Date(), 11 - i), 'MMM', { locale: id }),
            count: Math.floor(Math.random() * 40) + 10
          })),
          severityDistribution: [
            { id: 'Tidak ada', label: 'Tidak ada', value: 125, color: '#10B981' },
            { id: 'Ringan', label: 'Ringan', value: 98, color: '#3B82F6' },
            { id: 'Sedang', label: 'Sedang', value: 67, color: '#F59E0B' },
            { id: 'Berat', label: 'Berat', value: 45, color: '#EF4444' },
            { id: 'Sangat Berat', label: 'Sangat Berat', value: 17, color: '#7C3AED' }
          ]
        });
      } finally {
        // Simulate loading for better UX
        setTimeout(() => setIsLoading(false), 1000);
      }
    };
    
    fetchData();
    
    // Polling sebagai fallback jika WebSocket tidak tersedia
    const intervalId = setInterval(fetchData, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Update data saat menerima pembaruan real-time dari WebSocket
  useEffect(() => {
    if (lastUpdate) {
      if (lastUpdate.type === 'dashboard' && lastUpdate.data) {
        console.log('Updating dashboard with WebSocket data');
        setDashboardData(prev => ({
          ...prev,
          ...lastUpdate.data
        }));
        setLastUpdateTime(lastUpdate.timestamp);
      } else if (lastUpdate.type === 'severity' && lastUpdate.data?.severityDistribution) {
        console.log('Updating severity distribution with WebSocket data');
        setDashboardData(prev => ({
          ...prev,
          severityDistribution: lastUpdate.data.severityDistribution
        }));
        setLastUpdateTime(lastUpdate.timestamp);
      } else if (lastUpdate.type === 'analysis' && lastUpdate.data) {
        console.log('Updating after analysis completion');
        // Minta pembaruan dashboard secara lengkap setelah analisis selesai
        requestUpdate('dashboard');
      }
    }
  }, [lastUpdate, requestUpdate]);
  
  // Prepare stats for display
  const stats = [
    { 
      icon: UserGroupIcon, 
      title: 'Total Pasien', 
      value: dashboardData?.totalPatients || 0,
      description: 'Total pasien yang terdaftar',
      color: theme.primary
    },
    { 
      icon: DocumentChartBarIcon, 
      title: 'Analisis Retina', 
      value: dashboardData?.totalAnalyses || 0,
      description: 'Total analisis retina yang dilakukan',
      color: theme.accent
    },
    { 
      icon: CheckCircleIcon, 
      title: 'Analisis Selesai', 
      value: dashboardData?.completedAnalyses || 0,
      description: 'Analisis yang telah selesai diproses',
      color: '#10B981'
    },
    { 
      icon: ClockIcon, 
      title: 'Persentase Retinopati', 
      value: dashboardData ? ((dashboardData.totalAnalyses - dashboardData.normalCount) / dashboardData.totalAnalyses) * 100 : 0,
      description: 'Persentase pasien dengan retinopati',
      color: '#EF4444'
    },
  ];
  
  // Line chart configuration
  const lineChartData = dashboardData?.monthlyCounts ? [
    {
      id: 'Analisis Bulanan',
      color: theme.primary,
      data: dashboardData.monthlyCounts.map((item) => ({
        x: item.month,
        y: item.count
      }))
    }
  ] : [];
  
  // ApexCharts options for severity distribution
  const pieChartOptions = {
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
    },
    colors: dashboardData?.severityDistribution?.map(item => item.color) || 
      ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#7C3AED'],
    labels: dashboardData?.severityDistribution?.map(item => item.label) || 
      ['Tidak ada', 'Ringan', 'Sedang', 'Berat', 'Sangat Berat'],
    dataLabels: {
      enabled: true,
      formatter: function(val) {
        return Math.round(val) + '%';
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '55%',
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
              fontSize: '16px',
              fontWeight: 400,
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
        }
      }
    },
    legend: {
      position: 'bottom',
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
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: function(val) {
          return val + ' pasien';
        }
      }
    },
    stroke: {
      width: 2
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
  
  // Main container animations
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
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          Dashboard Analitik
        </h2>
        <div className="flex items-center gap-2">
          <motion.div 
            className="px-3 py-1 rounded-full text-sm flex items-center gap-1"
            style={{ 
              backgroundColor: connected ? `${theme.primary}20` : '#EF444420', 
              color: connected ? theme.primary : '#EF4444'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <SignalIcon className="h-3.5 w-3.5" />
            {connected ? 'Real-time' : 'Offline'}
          </motion.div>
          <motion.div 
            className="px-3 py-1 rounded-full text-sm"
            style={{ backgroundColor: `${theme.primary}20`, color: theme.primary }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? 'Memuat Data...' : `Diperbarui: ${format(lastUpdateTime, 'HH:mm:ss')}`}
          </motion.div>
        </div>
      </motion.div>
      
      {/* Enhanced Stats */}
      <motion.div variants={itemVariants}>
        <EnhancedStats dashboardData={dashboardData} isLoading={isLoading} />
      </motion.div>
      
      {/* Original Stats Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            icon={stat.icon}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            color={stat.color}
            isLoading={isLoading}
          />
        ))}
      </motion.div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Distribution */}
        <SeverityDistributionChart 
          data={dashboardData?.severityDistribution}
          isLoading={isLoading}
          theme={theme}
        />
        
        {/* Monthly Trends */}
        <motion.div
          variants={itemVariants}
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
          <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
            <span className="w-2 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full mr-3"></span>
            Tren Analisis Bulanan
          </h3>
          
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
              ) : dashboardData?.monthlyCounts ? (
                <motion.div
                  key="chart"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="h-full"
                >
                  <ResponsiveLine
                    data={lineChartData}
                    margin={{ top: 20, right: 20, bottom: 60, left: 50 }}
                    xScale={{ type: 'point' }}
                    yScale={{ 
                      type: 'linear', 
                      min: 'auto', 
                      max: 'auto', 
                      stacked: false, 
                      reverse: false 
                    }}
                    curve="cardinal"
                    axisBottom={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: 'Bulan',
                      legendOffset: 45,
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
                    enableGridX={false}
                    colors={{ scheme: 'category10' }}
                    lineWidth={3}
                    pointSize={10}
                    pointColor={{ theme: 'background' }}
                    pointBorderWidth={2}
                    pointBorderColor={{ from: 'serieColor' }}
                    pointLabelYOffset={-12}
                    useMesh={true}
                    enableSlices="x"
                    animate={true}
                    motionConfig="stiff"
                    theme={{
                      axis: {
                        ticks: {
                          text: {
                            fontSize: 12,
                            fill: '#64748b',
                            fontWeight: 500
                          }
                        },
                        legend: {
                          text: {
                            fontSize: 14,
                            fill: '#475569',
                            fontWeight: 600
                          }
                        }
                      },
                      grid: {
                        line: {
                          stroke: '#e2e8f0',
                          strokeWidth: 1
                        }
                      },
                      crosshair: {
                        line: {
                          stroke: theme.primary,
                          strokeWidth: 1,
                          strokeOpacity: 0.35
                        }
                      },
                      tooltip: {
                        container: {
                          background: 'white',
                          color: '#475569',
                          fontSize: 12,
                          borderRadius: 6,
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                          padding: '8px 12px'
                        }
                      }
                    }}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardCharts;
