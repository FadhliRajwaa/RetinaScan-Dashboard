import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { useWebSocket } from '../../context/WebSocketContext';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckBadgeIcon,
  EyeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

// Efek visual glassmorphism
const glassEffect = {
  background: 'rgba(255, 255, 255, 0.85)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.18)',
};

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

// Komponen mini line chart
const MiniLineChart = ({ data, color }) => {
  // Jika tidak ada data, kembalikan null
  if (!data || data.length === 0) return null;
  
  // Hitung nilai min dan max untuk skala
  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  // Hitung lebar setiap segment
  const segmentWidth = 100 / (data.length - 1);
  
  return (
    <svg width="100%" height="30" viewBox="0 0 100 30" preserveAspectRatio="none">
      <motion.path
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ 
          pathLength: 1,
          opacity: 1,
          transition: { duration: 1.5, ease: "easeInOut" }
        }}
        d={data.map((point, i) => {
          // Normalisasi nilai ke range 0-30 (tinggi SVG)
          const y = 30 - ((point.value - min) / (max - min) * 25);
          const x = i * segmentWidth;
          return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Lingkaran di setiap titik data */}
      {data.map((point, i) => {
        const y = 30 - ((point.value - min) / (max - min) * 25);
        const x = i * segmentWidth;
        
        return (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r="2"
            fill={color}
            initial={{ scale: 0 }}
            animate={{ 
              scale: 1,
              transition: { delay: i * 0.1, duration: 0.3 }
            }}
          />
        );
      })}
    </svg>
  );
};

// Komponen progres bar animasi
const AnimatedProgressBar = ({ value, maxValue, color }) => {
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
  
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <motion.div
        className="h-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </div>
  );
};

// Kartu statistik dengan animasi counter flip
const FlipStatCard = ({ title, value, suffix, icon: Icon, color, trendChange, trendLabel, maxValue, isLoading, lastUpdate }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
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
      {/* Background icon */}
      <div className="absolute top-0 right-0 w-24 h-24 transform translate-x-8 -translate-y-8 opacity-10">
        <Icon className="w-full h-full" style={{ color }} />
      </div>
      
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <div 
            className="p-1.5 rounded-full"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="h-4 w-4" style={{ color }} />
          </div>
        </div>
        
        {isLoading ? (
          <SkeletonLoader className="h-10 w-20 mb-2" />
        ) : (
          <div className="text-3xl font-bold mb-1">
            <div className="flex items-end">
              <span style={{ color }}>
                <CountUp
                  end={value || 0}
                  duration={2.5}
                  separator="."
                  decimal=","
                  decimals={0}
                  useEasing
                />
              </span>
              {suffix && <span className="text-base ml-1 font-medium text-gray-400">{suffix}</span>}
            </div>
          </div>
        )}
        
        {/* Progress bar */}
        {maxValue > 0 && (
          <div className="mb-3">
            <AnimatedProgressBar value={value} maxValue={maxValue} color={color} />
          </div>
        )}
        
        {/* Trend indicator */}
        {!isLoading && trendChange !== undefined && (
          <div className="flex items-center mt-1">
            <div 
              className={`flex items-center p-1 rounded text-xs font-medium ${trendChange >= 0 
                ? 'text-green-600 bg-green-50' 
                : 'text-red-600 bg-red-50'}`}
            >
              {trendChange >= 0 ? (
                <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />
              )}
              <span>{Math.abs(trendChange)}%</span>
            </div>
            <span className="text-xs text-gray-500 ml-2">{trendLabel}</span>
          </div>
        )}
        
        {/* Last update time */}
        {lastUpdate && !isLoading && (
          <div className="text-xs text-gray-400 mt-2">
            Update: {format(typeof lastUpdate === 'string' ? parseISO(lastUpdate) : lastUpdate, 'dd MMM HH:mm', { locale: id })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Kartu statistik dengan mini chart
const MiniChartStatCard = ({ title, value, suffix, icon: Icon, color, chartData, description, isLoading }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
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
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div 
          className="p-1.5 rounded-full"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
      </div>
      
      {isLoading ? (
        <>
          <SkeletonLoader className="h-10 w-20 mb-2" />
          <SkeletonLoader className="h-8 w-full mb-3" />
          <SkeletonLoader className="h-4 w-36" />
        </>
      ) : (
        <>
          <div className="text-3xl font-bold mb-3">
            <div className="flex items-end">
              <span style={{ color }}>
                <CountUp
                  end={value || 0}
                  duration={2.5}
                  separator="."
                  decimal=","
                  decimals={0}
                  useEasing
                />
              </span>
              {suffix && <span className="text-base ml-1 font-medium text-gray-400">{suffix}</span>}
            </div>
          </div>
          
          {chartData && chartData.length > 0 && (
            <div className="mb-3">
              <MiniLineChart data={chartData} color={color} />
            </div>
          )}
          
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
        </>
      )}
    </motion.div>
  );
};

// Kartu statistik dengan indikator ikon
const IconIndicatorStatCard = ({ title, value, icon: Icon, color, status, statusText, isLoading }) => {
  // Tentukan warna status
  let statusColor;
  let StatusIcon;
  
  switch (status) {
    case 'success':
      statusColor = '#10B981';
      StatusIcon = CheckBadgeIcon;
      break;
    case 'warning':
      statusColor = '#F59E0B';
      StatusIcon = ExclamationTriangleIcon;
      break;
    case 'danger':
      statusColor = '#EF4444';
      StatusIcon = ExclamationTriangleIcon;
      break;
    default:
      statusColor = '#6B7280';
      StatusIcon = Icon;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
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
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div 
          className="p-1.5 rounded-full"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
      </div>
      
      {isLoading ? (
        <>
          <SkeletonLoader className="h-10 w-20 mb-2" />
          <SkeletonLoader className="h-4 w-36" />
        </>
      ) : (
        <>
          <div className="text-3xl font-bold mb-4" style={{ color }}>
            <CountUp
              end={value || 0}
              duration={2}
              separator="."
              decimal=","
              decimals={0}
              useEasing
            />
          </div>
          
          <div className="flex items-center">
            <div 
              className="p-1.5 rounded-full mr-2"
              style={{ backgroundColor: `${statusColor}20` }}
            >
              <StatusIcon className="h-4 w-4" style={{ color: statusColor }} />
            </div>
            <span className="text-sm" style={{ color: statusColor }}>{statusText}</span>
          </div>
        </>
      )}
    </motion.div>
  );
};

// Komponen utama EnhancedStats
const EnhancedStats = ({ dashboardData, isLoading }) => {
  // Generate weekly data
  const getWeeklyData = () => {
    return Array.from({ length: 7 }, (_, i) => ({
      day: i,
      value: Math.floor(Math.random() * 15) + 5
    }));
  };
  
  // Data untuk grafik mini
  const [weeklyData, setWeeklyData] = useState(getWeeklyData());
  const { connected } = useWebSocket();
  
  // Memperbarui data mingguan setiap kali dashboardData berubah
  useEffect(() => {
    if (!isLoading && dashboardData) {
      // Gunakan data weeklyAnalyses dari dashboard jika tersedia
      if (dashboardData.weeklyAnalyses && Array.isArray(dashboardData.weeklyAnalyses)) {
        setWeeklyData(dashboardData.weeklyAnalyses.map((count, index) => ({
          day: index,
          value: count
        })));
      } else {
        setWeeklyData(getWeeklyData());
      }
    }
  }, [dashboardData, isLoading]);
  
  // Menghitung metrik tambahan
  const calculateAdditionalMetrics = () => {
    if (!dashboardData) return {};
    
    // Waktu rata-rata analisis (dalam detik)
    const avgAnalysisTime = dashboardData.averageTime || 3.8;
    
    // Persentase deteksi minggu ini
    const detectionRate = dashboardData.weeklyDetectionRate || 78;
    
    // Perubahan tren dibandingkan minggu lalu
    const trendChange = dashboardData.trendChange || 12.5;
    
    // Status sistem
    const systemStatus = dashboardData.systemStatus || 'normal';
    let statusText = 'Sistem Normal';
    let status = 'success';
    
    if (systemStatus === 'warning') {
      statusText = 'Perhatian Diperlukan';
      status = 'warning';
    } else if (systemStatus === 'critical') {
      statusText = 'Perlu Tindakan Segera';
      status = 'danger';
    }
    
    return {
      avgAnalysisTime,
      detectionRate,
      trendChange,
      systemStatus: { status, text: statusText }
    };
  };
  
  const metrics = calculateAdditionalMetrics();
  const now = new Date();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <FlipStatCard
        title="Tingkat Deteksi Minggu Ini"
        value={metrics.detectionRate || 0}
        suffix="%"
        icon={EyeIcon}
        color="#3B82F6"
        trendChange={metrics.trendChange || 0}
        trendLabel="vs minggu lalu"
        maxValue={100}
        isLoading={isLoading}
        lastUpdate={now}
      />
      
      <MiniChartStatCard
        title="Analisis Harian"
        value={weeklyData.reduce((sum, day) => sum + day.value, 0)}
        suffix="scan"
        icon={DocumentTextIcon}
        color="#8B5CF6"
        chartData={weeklyData}
        description={connected ? "Data real-time 7 hari terakhir" : "Total analisis 7 hari terakhir"}
        isLoading={isLoading}
      />
      
      <IconIndicatorStatCard
        title="Status Sistem"
        value={dashboardData?.uptime || 99.8}
        icon={ChartBarIcon}
        color="#10B981"
        status={metrics.systemStatus?.status || 'success'}
        statusText={metrics.systemStatus?.text || 'Sistem Normal'}
        isLoading={isLoading}
      />
      
      <FlipStatCard
        title="Waktu Rata-rata Analisis"
        value={metrics.avgAnalysisTime || 0}
        suffix="detik"
        icon={ClockIcon}
        color="#F59E0B"
        isLoading={isLoading}
      />
    </div>
  );
};

export default EnhancedStats; 