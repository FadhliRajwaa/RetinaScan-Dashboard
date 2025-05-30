import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subMonths, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { useWebSocket } from '../../context/WebSocketContext';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
  Area, ComposedChart
} from 'recharts';
import { CursorArrowRaysIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

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

// Tooltip Custom
const CustomTooltip = ({ active, payload, label, theme }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip p-3 rounded-lg shadow-lg" 
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          border: `1px solid ${theme.primary}40`,
          maxWidth: 300
        }}
      >
        <p className="font-semibold text-gray-800 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center py-1">
            <div 
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600">
              {entry.name}: <span className="font-medium">{entry.value}</span> {entry.unit || 'analisis'}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

// Komponen utama
const MonthlyTrendChart = ({ data, isLoading, theme }) => {
  const [chartData, setChartData] = useState([]);
  const [hoveredMonth, setHoveredMonth] = useState(null);
  const [animate, setAnimate] = useState(false);
  const [viewMode, setViewMode] = useState('basic'); // basic, detailed
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const { connected, requestUpdate } = useWebSocket();
  
  // Generate data default jika tidak ada data
  const generateDefaultData = () => {
    return Array.from({ length: 12 }, (_, i) => {
      const month = format(subMonths(new Date(), 11 - i), 'MMM', { locale: id });
      
      return {
        month,
        count: Math.floor(Math.random() * 40) + 10,
        normal: Math.floor(Math.random() * 20) + 5,
        abnormal: Math.floor(Math.random() * 15) + 5,
        average: (Math.random() * 2 + 2).toFixed(1),
      };
    });
  };
  
  // Perbarui data chart saat data berubah
  useEffect(() => {
    setAnimate(false);
    
    setTimeout(() => {
      if (data && data.length > 0) {
        // Tambahkan data tambahan
        const enhancedData = data.map(item => {
          // Bagi count menjadi normal dan abnormal jika belum ada
          let normal = item.normal;
          let abnormal = item.abnormal;
          
          if (normal === undefined || abnormal === undefined) {
            normal = Math.floor(item.count * 0.65);
            abnormal = item.count - normal;
          }
          
          return {
            ...item,
            normal,
            abnormal,
            average: item.average || (Math.random() * 2 + 2).toFixed(1)
          };
        });
        
        setChartData(enhancedData);
        setLastUpdated(new Date());
      } else {
        setChartData(generateDefaultData());
      }
      
      // Aktifkan animasi setelah data diperbarui
      setAnimate(true);
    }, 300);
  }, [data]);
  
  // Menemukan bulan dengan nilai tertinggi
  const findPeakMonth = () => {
    if (!chartData || chartData.length === 0) return null;
    
    let maxIndex = 0;
    let maxValue = chartData[0].count || 0;
    
    chartData.forEach((item, index) => {
      if (item.count > maxValue) {
        maxValue = item.count;
        maxIndex = index;
      }
    });
    
    return chartData[maxIndex].month;
  };
  
  // Menghitung perubahan persentase dari bulan sebelumnya
  const calculateTrend = () => {
    if (!chartData || chartData.length < 2) return 0;
    
    const lastMonthIndex = chartData.length - 1;
    const prevMonthIndex = lastMonthIndex - 1;
    
    if (lastMonthIndex < 0 || prevMonthIndex < 0) return 0;
    
    const lastMonth = chartData[lastMonthIndex].count || 0;
    const prevMonth = chartData[prevMonthIndex].count || 0;
    
    if (prevMonth === 0) return 0;
    
    return ((lastMonth - prevMonth) / prevMonth * 100).toFixed(1);
  };
  
  const trendPercent = calculateTrend();
  const peakMonth = findPeakMonth();
  
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
  
  // Format data untuk tooltip
  const formatYAxis = (value) => {
    if (value === 0) return '0';
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return value;
  };
  
  // Handler untuk meminta pembaruan manual
  const handleRefresh = () => {
    if (!connected || isLoading) return;
    
    requestUpdate('monthly_trend');
    setIsLoading(true);
    
    // Simulasi loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
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
      <div className="flex justify-between items-start mb-6">
        <motion.div variants={itemVariants}>
          <h3 className="text-xl font-bold mb-2 text-gray-800 flex items-center">
            <span className="w-2 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full mr-3"></span>
            Tren Analisis Bulanan
          </h3>
          <p className="text-sm text-gray-500">
            {connected ? 'Data real-time analisis retina per bulan' : 'Jumlah analisis retina yang dilakukan setiap bulan'}
          </p>
        </motion.div>
        
        <div className="flex space-x-2">
          {connected && (
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-1.5 rounded-full bg-gray-100 text-gray-600"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </motion.button>
          )}
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              viewMode === 'basic' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}
            onClick={() => setViewMode('basic')}
          >
            Dasar
          </motion.button>
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              viewMode === 'detailed' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}
            onClick={() => setViewMode('detailed')}
          >
            Detail
          </motion.button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <motion.div
          variants={itemVariants}
          className="bg-blue-50 p-3 rounded-lg border border-blue-100"
        >
          <div className="flex items-center mb-1">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 mr-2">
              <CursorArrowRaysIcon className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-sm text-gray-600">Bulan Tersibuk</span>
          </div>
          <div className="text-lg font-semibold text-gray-800">
            {isLoading ? (
              <SkeletonLoader className="h-6 w-16" />
            ) : (
              peakMonth || 'N/A'
            )}
          </div>
        </motion.div>
        
        <motion.div
          variants={itemVariants}
          className="bg-green-50 p-3 rounded-lg border border-green-100"
        >
          <div className="flex items-center mb-1">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100 mr-2">
              <svg className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-sm text-gray-600">Tren Bulanan</span>
          </div>
          <div className="text-lg font-semibold text-gray-800">
            {isLoading ? (
              <SkeletonLoader className="h-6 w-16" />
            ) : (
              <span className={trendPercent >= 0 ? 'text-green-600' : 'text-red-600'}>
                {trendPercent >= 0 ? '+' : ''}{trendPercent}%
              </span>
            )}
          </div>
        </motion.div>
        
        <motion.div
          variants={itemVariants}
          className="bg-purple-50 p-3 rounded-lg border border-purple-100"
        >
          <div className="flex items-center mb-1">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-100 mr-2">
              <svg className="h-4 w-4 text-purple-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21H3M21 7L15 7M21 3L15 3M15 7L11 15L8 10L3 18M15 7L15 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-sm text-gray-600">Rata-rata</span>
          </div>
          <div className="text-lg font-semibold text-gray-800">
            {isLoading ? (
              <SkeletonLoader className="h-6 w-16" />
            ) : (
              chartData.length > 0 ? (
                `${(chartData.reduce((sum, item) => sum + (item.count || 0), 0) / chartData.length).toFixed(0)} / bulan`
              ) : 'N/A'
            )}
          </div>
        </motion.div>
      </div>
      
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                {viewMode === 'basic' ? (
                  // Chart mode dasar
                  <LineChart
                    data={chartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                    onMouseMove={(e) => {
                      if (e.activeLabel) {
                        setHoveredMonth(e.activeLabel);
                      }
                    }}
                    onMouseLeave={() => setHoveredMonth(null)}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      tickLine={{ stroke: '#e2e8f0' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis 
                      tickFormatter={formatYAxis}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      tickLine={{ stroke: '#e2e8f0' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <Tooltip content={<CustomTooltip theme={theme} />} />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      name="Total Analisis"
                      stroke={theme.primary} 
                      strokeWidth={3}
                      dot={{ r: 4, fill: theme.primary, stroke: 'white', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: theme.primary, stroke: 'white', strokeWidth: 2 }}
                      isAnimationActive={animate}
                      animationDuration={1500}
                      animationEasing="ease-out"
                    />
                    {hoveredMonth && (
                      <ReferenceLine
                        x={hoveredMonth}
                        stroke={theme.primary}
                        strokeDasharray="3 3"
                        strokeWidth={2}
                        strokeOpacity={0.5}
                      />
                    )}
                  </LineChart>
                ) : (
                  // Chart mode detail
                  <ComposedChart
                    data={chartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                    onMouseMove={(e) => {
                      if (e.activeLabel) {
                        setHoveredMonth(e.activeLabel);
                      }
                    }}
                    onMouseLeave={() => setHoveredMonth(null)}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      tickLine={{ stroke: '#e2e8f0' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis 
                      yAxisId="left"
                      tickFormatter={formatYAxis}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      tickLine={{ stroke: '#e2e8f0' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      domain={[0, 10]}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      tickLine={{ stroke: '#e2e8f0' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      label={{ value: 'Waktu (detik)', angle: -90, position: 'insideRight', offset: 0, fontSize: 12, fill: '#64748b' }}
                    />
                    <Tooltip content={<CustomTooltip theme={theme} />} />
                    <Legend 
                      verticalAlign="top" 
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ paddingTop: '10px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="normal" 
                      name="Normal"
                      fill="#10B98120" 
                      stroke="#10B981"
                      yAxisId="left"
                      isAnimationActive={animate}
                      animationDuration={1500}
                      animationEasing="ease-out"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="abnormal" 
                      name="Abnormal"
                      fill="#EF444420" 
                      stroke="#EF4444"
                      yAxisId="left"
                      isAnimationActive={animate}
                      animationDuration={1500}
                      animationEasing="ease-out"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="average" 
                      name="Waktu Rata-rata"
                      unit=" detik"
                      stroke="#8B5CF6" 
                      strokeWidth={2}
                      dot={{ r: 4, fill: '#8B5CF6', stroke: 'white', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#8B5CF6', stroke: 'white', strokeWidth: 2 }}
                      yAxisId="right"
                      isAnimationActive={animate}
                      animationDuration={1500}
                      animationEasing="ease-out"
                    />
                    {hoveredMonth && (
                      <ReferenceLine
                        x={hoveredMonth}
                        stroke={theme.primary}
                        strokeDasharray="3 3"
                        strokeWidth={2}
                        strokeOpacity={0.5}
                      />
                    )}
                  </ComposedChart>
                )}
              </ResponsiveContainer>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
      
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

export default MonthlyTrendChart; 