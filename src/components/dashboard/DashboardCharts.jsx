import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import CountUp from 'react-countup';
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, Sector, ComposedChart, ReferenceLine, Rectangle, RadialBarChart, RadialBar
} from 'recharts';
import { FiUsers, FiActivity, FiTrendingUp, FiShield } from 'react-icons/fi';
import EnhancedSeverityChart from './EnhancedSeverityChart';

// Komponen custom untuk skeleton loading
const SkeletonLoader = ({ height = 300 }) => (
  <motion.div 
    className="animate-pulse bg-gray-200 rounded-xl w-full"
    style={{ height }}
    initial={{ opacity: 0.6 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
  />
);

// Custom tooltip untuk charts
const CustomTooltip = ({ active, payload, label, unit = '', formatter }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const value = formatter ? formatter(payload[0].value) : payload[0].value;
    
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
        <p className="font-semibold">{label}</p>
        <p className="text-sm">
          <span className="font-medium" style={{ color: payload[0].color }}>
            {value} {unit}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

const StatCard = ({ title, value, icon: Icon, color, increase, prefix = '', suffix = '', decimals = 0 }) => {
  const { theme } = useTheme();

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      whileHover={{ 
        y: -5,
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        transition: { type: 'spring', stiffness: 500, damping: 30 }
      }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-600 font-medium text-sm">{title}</h3>
        <div className="rounded-full p-2" style={{ background: `${color}20` }}>
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-baseline">
            {prefix && <span className="text-lg mr-1 text-gray-500">{prefix}</span>}
            <CountUp
              start={0}
              end={value}
              duration={2.5}
              separator=","
              decimals={decimals}
              decimal="."
              prefix=""
              suffix=""
              className="text-3xl font-bold text-gray-800"
            />
            {suffix && <span className="text-lg ml-1 text-gray-500">{suffix}</span>}
          </div>
          
          {increase !== undefined && (
            <div className="flex items-center mt-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, delay: 0.5 }}
                className={`text-xs font-medium px-2 py-0.5 rounded ${
                  increase >= 0 
                    ? 'text-green-800 bg-green-100' 
                    : 'text-red-800 bg-red-100'
                }`}
              >
                <span className="flex items-center">
                  {increase >= 0 ? '+' : ''}{increase}%
                </span>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const ChartCard = ({ title, children, height = 300 }) => {
  const { theme } = useTheme();
  
  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      whileHover={{ 
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        transition: { type: 'spring', stiffness: 500, damping: 30 }
      }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}
    >
      <h3 className="text-gray-800 font-medium mb-6 flex items-center">
        <span className="w-1.5 h-5 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-3"></span>
        {title}
      </h3>
      <div style={{ height }}>
        {children}
      </div>
    </motion.div>
  );
};

// Enhanced PieChart component for Severity Distribution
const EnhancedSeverityChart = ({ data, loading }) => {
  const { theme } = useTheme();
  const [activeIndex, setActiveIndex] = useState(null);
  const [rotation, setRotation] = useState(0);
  
  // Colors with more vibrant gradient
  const COLORS = ['#10B981', '#3B82F6', '#EC4899', '#F59E0B', '#EF4444'];
  const HOVER_COLORS = ['#059669', '#2563EB', '#DB2777', '#D97706', '#DC2626'];
  
  // Labels for severity levels
  const LABELS = ['Tidak ada', 'Ringan', 'Sedang', 'Berat', 'Sangat Berat'];
  const DESCRIPTIONS = [
    'Tidak ada tanda retinopati diabetik',
    'Mikroaneurisma ringan terdeteksi',
    'Perdarahan intraretinal dan eksudat keras',
    'Banyak perdarahan dan cotton wool spots',
    'Neovaskularisasi dan risiko kebutaan'
  ];
  
  useEffect(() => {
    // Rotate chart slightly on data change for animation effect
    if (data && data.length > 0) {
      setRotation(prev => prev + 15);
      
      // Reset rotation after 360 degrees
      if (rotation >= 360) {
        setRotation(0);
      }
    }
  }, [data]);
  
  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };
  
  const onPieLeave = () => {
    setActiveIndex(null);
  };
  
  // Custom active shape that expands on hover
  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    
    // Expanded radius for active segment
    const expandedOuterRadius = outerRadius * 1.1;
    
    return (
      <g>
        <text x={cx} y={cy - 20} dy={8} textAnchor="middle" fill={fill} className="text-lg font-bold">
          {payload.name}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#888" className="text-sm">
          {`${(percent * 100).toFixed(0)}%`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={expandedOuterRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={HOVER_COLORS[payload.index]}
          strokeWidth={2}
          stroke="#fff"
        />
      </g>
    );
  };
  
  // Dynamic data transformation with proper fallbacks
  const transformedData = useMemo(() => {
    if (!data || data.length === 0) {
      return LABELS.map((label, index) => ({
        name: label,
        value: 0,
        index: index,
        description: DESCRIPTIONS[index]
      }));
    }
    
    return data.map((item, index) => ({
      ...item,
      index,
      description: DESCRIPTIONS[index]
    }));
  }, [data]);
  
  // Animation configuration for chart
  const animationProps = {
    isAnimationActive: true,
    animationBegin: 0,
    animationDuration: 1500,
    animationEasing: "ease-out"
  };
  
  if (loading) {
    return <SkeletonLoader />;
  }
  
  return (
    <div className="relative h-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <defs>
            {COLORS.map((color, index) => (
              <radialGradient key={`radialGradient-${index}`} id={`severity-gradient-${index}`} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                <stop offset="100%" stopColor={color} stopOpacity={0.7} />
              </radialGradient>
            ))}
          </defs>
          <Pie
            data={transformedData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            dataKey="value"
            paddingAngle={4}
            startAngle={90 + rotation}
            endAngle={-270 + rotation}
            {...animationProps}
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
          >
            {transformedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={`url(#severity-gradient-${index})`} 
                stroke="#fff" 
                strokeWidth={2}
                style={{ filter: activeIndex === index ? 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.2))' : 'none' }}
              />
            ))}
          </Pie>
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white p-3 rounded-lg shadow-lg border border-gray-100 max-w-xs"
                  >
                    <p className="font-bold text-gray-800">{data.name}</p>
                    <p className="text-sm text-gray-600 mt-1">{data.description}</p>
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-sm font-semibold">
                        <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ backgroundColor: COLORS[data.index] }}></span>
                        <span>{`${(payload[0].percent * 100).toFixed(0)}%`}</span>
                      </p>
                    </div>
                  </motion.div>
                );
              }
              return null;
            }}
            animationDuration={300}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Legend with interactive elements */}
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {transformedData.map((entry, index) => (
          <motion.div
            key={`legend-${index}`}
            className="flex items-center px-2 py-1 rounded-full cursor-pointer"
            style={{ 
              backgroundColor: activeIndex === index ? `${COLORS[index]}20` : 'transparent',
              border: `1px solid ${activeIndex === index ? COLORS[index] : 'transparent'}`
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <span 
              className="w-3 h-3 rounded-full mr-1" 
              style={{ backgroundColor: COLORS[index] }}
            />
            <span className="text-xs font-medium">{entry.name}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Enhanced Monthly Trend Chart
const EnhancedMonthlyTrendChart = ({ data, loading }) => {
  const { theme } = useTheme();
  const [focusBar, setFocusBar] = useState(null);
  const [playAnimation, setPlayAnimation] = useState(false);
  
  // Vibrant color scheme
  const primaryColor = '#3B82F6';
  const secondaryColor = '#60A5FA';
  const accentColor = '#2563EB';
  
  // Play animation when data changes or component mounts
  useEffect(() => {
    if (data && data.length > 0) {
      setPlayAnimation(true);
      
      // Reset animation flag after animation completes
      const timer = setTimeout(() => {
        setPlayAnimation(false);
      }, 2500);
      
      return () => clearTimeout(timer);
    }
  }, [data]);
  
  // Custom cursor for chart interactivity
  const CustomCursor = ({ x, y, width, height, stroke }) => {
    return (
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        stroke="none"
        fill={`${primaryColor}10`}
      />
    );
  };
  
  // Custom active dot with pulse animation
  const CustomActiveDot = (props) => {
    const { cx, cy, stroke, dataKey, fill } = props;
    
    return (
      <g>
        {/* Outer pulse effect */}
        <circle
          cx={cx}
          cy={cy}
          r={8}
          stroke={primaryColor}
          strokeWidth={2}
          fill="white"
        />
        
        {/* Inner dot */}
        <circle
          cx={cx}
          cy={cy}
          r={4}
          stroke="none"
          fill={primaryColor}
        />
        
        {/* Pulse animation */}
        <circle
          cx={cx}
          cy={cy}
          r={12}
          stroke={primaryColor}
          strokeWidth={1}
          fill="none"
          opacity={0.3}
          style={{
            animation: 'pulse 1.5s ease-out infinite',
          }}
        />
        
        <style>
          {`
          @keyframes pulse {
            0% {
              transform: scale(0.5);
              opacity: 0.8;
            }
            100% {
              transform: scale(2);
              opacity: 0;
            }
          }
          `}
        </style>
      </g>
    );
  };
  
  // Format data with proper fallbacks
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      // Generate sample data if none provided
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.map(month => ({ name: month, value: 0, avg: 0 }));
    }
    
    // Add rolling average to the data
    const withAverage = [...data];
    
    // Calculate 3-month rolling average
    for (let i = 0; i < withAverage.length; i++) {
      let sum = 0;
      let count = 0;
      
      // Look at previous, current, and next month (if available)
      for (let j = Math.max(0, i - 1); j <= Math.min(withAverage.length - 1, i + 1); j++) {
        sum += withAverage[j].value;
        count++;
      }
      
      withAverage[i].avg = Math.round(sum / count);
    }
    
    return withAverage;
  }, [data]);
  
  if (loading) {
    return <SkeletonLoader />;
  }
  
  return (
    <div className="relative h-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <defs>
            <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={primaryColor} stopOpacity={0.8} />
              <stop offset="95%" stopColor={primaryColor} stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={accentColor} stopOpacity={0.8} />
              <stop offset="95%" stopColor={accentColor} stopOpacity={0.1} />
            </linearGradient>
            <filter id="shadow" height="200%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor={`${primaryColor}40`} />
            </filter>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
          
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#6B7280', fontSize: 12 }} 
            axisLine={{ stroke: '#E5E7EB' }} 
            tickLine={false}
          />
          
          <YAxis 
            tick={{ fill: '#6B7280', fontSize: 12 }} 
            axisLine={{ stroke: '#E5E7EB' }} 
            tickLine={false}
            width={30}
          />
          
          <Tooltip 
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white p-3 rounded-lg shadow-lg border border-gray-100"
                  >
                    <p className="font-bold text-gray-800 mb-1">{label}</p>
                    <div className="space-y-1">
                      <p className="text-sm flex items-center">
                        <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                        <span className="text-gray-600">Analisis:</span>
                        <span className="font-medium ml-2">{payload[0].value}</span>
                      </p>
                      <p className="text-sm flex items-center">
                        <span className="w-2 h-2 rounded-full bg-indigo-600 mr-2"></span>
                        <span className="text-gray-600">Rata-rata 3 bulan:</span>
                        <span className="font-medium ml-2">{payload[1].value}</span>
                      </p>
                    </div>
                  </motion.div>
                );
              }
              return null;
            }}
            cursor={<CustomCursor />}
          />
          
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={primaryColor} 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorTrend)"
            activeDot={<CustomActiveDot />}
            isAnimationActive={true}
            animationBegin={0}
            animationDuration={1500}
            animationEasing="ease-out"
          />
          
          <Line 
            type="monotone" 
            dataKey="avg" 
            stroke={accentColor} 
            strokeWidth={2} 
            dot={false}
            strokeDasharray={playAnimation ? "4 4" : "0 0"}
            isAnimationActive={true}
            animationBegin={500}
            animationDuration={1500}
            animationEasing="ease-out"
          />
          
          {/* Current month highlight */}
          {chartData && chartData.length > 0 && (
            <ReferenceLine 
              x={chartData[new Date().getMonth()].name} 
              stroke={secondaryColor}
              strokeWidth={2}
              strokeDasharray="3 3"
              label={{
                value: 'Bulan ini',
                position: 'top',
                fill: secondaryColor,
                fontSize: 12
              }}
            />
          )}
          
          {/* Reference for average all-time */}
          {chartData && chartData.length > 0 && (
            <ReferenceLine 
              y={Math.round(chartData.reduce((sum, item) => sum + item.value, 0) / chartData.length)} 
              stroke="#9CA3AF"
              strokeWidth={1}
              strokeDasharray="3 3"
              label={{
                value: 'Rata-rata',
                position: 'right',
                fill: '#6B7280',
                fontSize: 10
              }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-2">
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full mr-1 bg-blue-500"></span>
          <span className="text-xs text-gray-600">Jumlah Analisis</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full mr-1 bg-indigo-600"></span>
          <span className="text-xs text-gray-600">Rata-rata 3 Bulan</span>
        </div>
      </div>
    </div>
  );
};

// Enhanced Age Distribution Chart
const EnhancedAgeDistributionChart = ({ data, loading }) => {
  const { theme } = useTheme();
  const [activeIndex, setActiveIndex] = useState(null);
  const [hoverInfo, setHoverInfo] = useState(null);
  
  // Color scheme
  const primaryColor = '#10B981';  // Green
  const secondaryColor = '#059669'; // Darker green
  const gradients = [
    ['#10B981', '#059669'],
    ['#0EA5E9', '#0284C7'],
    ['#8B5CF6', '#6D28D9'],
    ['#EC4899', '#BE185D'],
    ['#F59E0B', '#D97706'],
    ['#6366F1', '#4338CA'],
    ['#EF4444', '#B91C1C']
  ];

  // Animation properties
  const barAnimProps = {
    initial: { width: 0, opacity: 0 },
    animate: { width: '100%', opacity: 1 },
    transition: { duration: 0.8, ease: "easeOut" }
  };
  
  // Format the data with detailed information
  const formattedData = useMemo(() => {
    if (!data || data.length === 0) {
      const ageGroups = ['0-10', '11-20', '21-30', '31-40', '41-50', '51-60', '61+'];
      return ageGroups.map((age, index) => ({
        name: age,
        value: 0,
        description: `Pasien berusia ${age} tahun`,
        color: gradients[index % gradients.length][0],
        gradient: `linear-gradient(to right, ${gradients[index % gradients.length][0]}, ${gradients[index % gradients.length][1]})`
      }));
    }
    
    const ageDescriptions = {
      '0-10': 'Anak-anak',
      '11-20': 'Remaja',
      '21-30': 'Dewasa Muda',
      '31-40': 'Dewasa',
      '41-50': 'Paruh Baya',
      '51-60': 'Pra-Lansia',
      '61+': 'Lansia'
    };
    
    return data.map((item, index) => ({
      ...item,
      description: ageDescriptions[item.name] || `Pasien berusia ${item.name}`,
      color: gradients[index % gradients.length][0],
      gradient: `linear-gradient(to right, ${gradients[index % gradients.length][0]}, ${gradients[index % gradients.length][1]})`
    }));
  }, [data]);
  
  const handleMouseEnter = (data, index) => {
    setActiveIndex(index);
    setHoverInfo({
      x: 0,
      y: 0,
      name: data.name,
      value: data.value,
      description: data.description
    });
  };
  
  const handleMouseLeave = () => {
    setActiveIndex(null);
    setHoverInfo(null);
  };
  
  if (loading) {
    return <SkeletonLoader />;
  }
  
  return (
    <div className="h-full">
      <ResponsiveContainer width="100%" height="80%">
        <BarChart
          data={formattedData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          barCategoryGap={8}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.1} />
          <XAxis 
            type="number" 
            domain={[0, 100]}
            tick={{ fill: '#6B7280', fontSize: 12 }} 
            axisLine={{ stroke: '#E5E7EB' }} 
            tickLine={false}
            tickFormatter={(value) => `${value}%`}
          />
          <YAxis 
            type="category"
            dataKey="name" 
            tick={{ fill: '#6B7280', fontSize: 12 }} 
            axisLine={{ stroke: '#E5E7EB' }} 
            tickLine={false}
            width={40}
          />
          <Tooltip 
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white p-3 rounded-lg shadow-lg border border-gray-100"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span 
                        className="w-3 h-3 rounded-full" 
                        style={{ background: data.gradient }}
                      ></span>
                      <p className="font-semibold text-gray-800">
                        {data.name} <span className="font-normal text-gray-500">({data.description})</span>
                      </p>
                    </div>
                    <p className="text-lg font-bold" style={{ color: data.color }}>
                      {data.value}%
                    </p>
                  </motion.div>
                );
              }
              return null;
            }}
          />
          <Bar 
            dataKey="value" 
            isAnimationActive={true}
            animationBegin={0}
            animationDuration={1500}
            animationEasing="ease-out"
            barSize={20}
            radius={[0, 4, 4, 0]}
          >
            {formattedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={`url(#ageGradient${index})`}
                style={{ 
                  filter: activeIndex === index ? 'brightness(110%) drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.1))' : 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={() => handleMouseEnter(entry, index)}
                onMouseLeave={handleMouseLeave}
              />
            ))}
          </Bar>
          <defs>
            {formattedData.map((entry, index) => (
              <linearGradient 
                id={`ageGradient${index}`} 
                key={`gradient-${index}`} 
                x1="0" y1="0" x2="1" y2="0"
              >
                <stop offset="0%" stopColor={gradients[index % gradients.length][0]} />
                <stop offset="100%" stopColor={gradients[index % gradients.length][1]} />
              </linearGradient>
            ))}
          </defs>
        </BarChart>
      </ResponsiveContainer>
      
      {/* Detailed age group information */}
      <div className="h-[20%] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {activeIndex !== null && (
            <motion.div
              key={`info-${activeIndex}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <p className="text-sm text-gray-600">{formattedData[activeIndex]?.description}</p>
              <p className="text-lg font-bold" style={{ color: formattedData[activeIndex]?.color }}>
                {formattedData[activeIndex]?.value}% dari total pasien
              </p>
            </motion.div>
          )}
          {activeIndex === null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ duration: 0.5 }}
              className="text-xl text-gray-400"
            >
              Arahkan kursor ke batang untuk detail
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Enhanced Gender Distribution Chart
const EnhancedGenderDistributionChart = ({ data, loading }) => {
  const { theme } = useTheme();
  const [selectedGender, setSelectedGender] = useState(null);
  const [animate, setAnimate] = useState(false);
  
  // Colors
  const COLORS = ['#3B82F6', '#EC4899']; // Blue for male, Pink for female
  const genderIcons = {
    'Laki-laki': '♂',
    'Perempuan': '♀'
  };
  
  // Trigger animation on data change
  useEffect(() => {
    if (data && data.length > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [data]);
  
  // Transform data for the gauge chart
  const transformedData = useMemo(() => {
    if (!data || data.length === 0) {
      return [
        { name: 'Laki-laki', value: 50, fill: COLORS[0] },
        { name: 'Perempuan', value: 50, fill: COLORS[1] }
      ];
    }
    
    return data.map((entry, index) => ({
      ...entry,
      fill: COLORS[index % COLORS.length]
    }));
  }, [data]);
  
  // Handle gender selection
  const handleGenderSelect = (entry, index) => {
    setSelectedGender(selectedGender === index ? null : index);
  };
  
  // Calculate total
  const total = transformedData.reduce((sum, entry) => sum + entry.value, 0);
  
  // Custom shape for the pie chart
  const renderCustomizedShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, index } = props;
    
    // Expand the selected segment
    const isSelected = selectedGender === index;
    const radius = isSelected ? outerRadius * 1.1 : outerRadius;
    
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={radius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          stroke="#fff"
          strokeWidth={2}
          style={{ 
            filter: isSelected ? 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.1))' : 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        />
      </g>
    );
  };
  
  if (loading) {
    return <SkeletonLoader />;
  }
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              <filter id="glow" height="300%" width="300%" x="-100%" y="-100%">
                <feGaussianBlur stdDeviation="5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {/* Gradients */}
              <radialGradient id="maleGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="#60A5FA" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity={1} />
              </radialGradient>
              <radialGradient id="femaleGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="#F9A8D4" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#EC4899" stopOpacity={1} />
              </radialGradient>
            </defs>
            <Pie
              data={transformedData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              paddingAngle={4}
              cornerRadius={6}
              isAnimationActive={true}
              animationBegin={0}
              animationDuration={1500}
              animationEasing="ease-out"
              onMouseEnter={handleGenderSelect}
              onClick={handleGenderSelect}
              activeIndex={selectedGender !== null ? [selectedGender] : []}
              activeShape={renderCustomizedShape}
              shape={renderCustomizedShape}
            >
              <Cell key="male" fill="url(#maleGradient)" filter={animate ? "url(#glow)" : "none"} />
              <Cell key="female" fill="url(#femaleGradient)" filter={animate ? "url(#glow)" : "none"} />
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white p-3 rounded-lg shadow-lg border border-gray-100"
                    >
                      <p className="font-semibold text-gray-800">{data.name}</p>
                      <p className="text-lg font-bold" style={{ color: data.fill }}>
                        {data.value}%
                      </p>
                      <p className="text-xs text-gray-500">
                        dari total pasien
                      </p>
                    </motion.div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center gender info */}
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
          style={{ pointerEvents: 'none' }}
        >
          <AnimatePresence mode="wait">
            {selectedGender !== null ? (
              <motion.div
                key={`gender-${selectedGender}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div 
                  className="text-3xl mb-1"
                  style={{ color: COLORS[selectedGender] }}
                >
                  {genderIcons[transformedData[selectedGender]?.name]}
                </div>
                <div className="text-lg font-bold" style={{ color: COLORS[selectedGender] }}>
                  {transformedData[selectedGender]?.value}%
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ duration: 0.5 }}
                className="text-xl text-gray-400"
              >
                {total}%
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex justify-center gap-8">
        {transformedData.map((entry, index) => (
          <motion.div
            key={`legend-${index}`}
            className="flex items-center cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleGenderSelect(entry, index)}
          >
            <div 
              className="w-4 h-4 rounded-full mr-2"
              style={{ 
                background: index === 0 ? "url(#maleGradient)" : "url(#femaleGradient)",
                boxShadow: selectedGender === index ? `0 0 0 2px ${COLORS[index]}` : 'none'
              }}
            />
            <span 
              className="text-sm"
              style={{ 
                fontWeight: selectedGender === index ? 'bold' : 'normal',
                color: selectedGender === index ? COLORS[index] : '#6B7280'
              }}
            >
              {entry.name} ({entry.value}%)
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Menerima props dari Dashboard.jsx
const DashboardCharts = ({ dashboardData, loading, error }) => {
  const { theme } = useTheme();
  const [dataError, setDataError] = useState(null);

  // Colors for charts
  const COLORS = ['#10B981', '#3B82F6', '#EC4899', '#F59E0B', '#EF4444'];
  const GRADIENT_COLORS = ['#10B98190', '#3B82F690', '#EC489990', '#F59E0B90', '#EF444490'];
  
  // Transformasi data untuk pie chart distribusi tingkat keparahan dengan validasi dan logging yang lebih baik
  const getSeverityData = useCallback(() => {
    try {
      if (!dashboardData) {
        console.warn('Dashboard data is null or undefined');
        return [];
      }

      if (!dashboardData.severityDistribution || !Array.isArray(dashboardData.severityDistribution)) {
        console.warn('severityDistribution is missing or not an array:', dashboardData.severityDistribution);
        return createDefaultSeverityData();
      }
      
      const labels = ['Tidak ada', 'Ringan', 'Sedang', 'Berat', 'Sangat Berat'];
      
      // Pastikan array memiliki 5 elemen (termasuk "Sangat Berat")
      if (dashboardData.severityDistribution.length !== 5) {
        console.warn(`severityDistribution length mismatch. Expected 5, got ${dashboardData.severityDistribution.length}`);
        // Tambahkan zeros jika kurang dari 5 elemen
        const paddedData = [...dashboardData.severityDistribution];
        while (paddedData.length < 5) {
          paddedData.push(0);
        }
        return paddedData.slice(0, 5).map((value, index) => ({
          name: labels[index],
          value: isNaN(value) ? 0 : value
        }));
      }
      
      return dashboardData.severityDistribution.map((value, index) => ({
        name: labels[index],
        value: isNaN(value) ? 0 : value
      }));
    } catch (error) {
      console.error('Error transforming severity data:', error);
      setDataError('Gagal memproses data distribusi tingkat keparahan');
      return createDefaultSeverityData();
    }
  }, [dashboardData]);
  
  // Data default untuk distribusi tingkat keparahan
  const createDefaultSeverityData = () => {
    const labels = ['Tidak ada', 'Ringan', 'Sedang', 'Berat', 'Sangat Berat'];
    return labels.map(name => ({ name, value: 20 })); // Default 20% masing-masing
  };
  
  // Data untuk chart tren bulanan dengan validasi dan logging yang lebih baik
  const getMonthlyTrendData = useCallback(() => {
    try {
      if (!dashboardData) {
        console.warn('Dashboard data is null or undefined');
        return [];
      }

      if (!dashboardData.monthlyTrend || !dashboardData.monthlyTrend.categories || !dashboardData.monthlyTrend.data) {
        console.warn('monthlyTrend data is missing or incomplete:', dashboardData.monthlyTrend);
        return createDefaultMonthlyData();
      }
      
      if (!Array.isArray(dashboardData.monthlyTrend.categories) || !Array.isArray(dashboardData.monthlyTrend.data)) {
        console.warn('monthlyTrend categories or data is not an array');
        return createDefaultMonthlyData();
      }
      
      // Jika panjang array tidak sama, menggunakan array yang lebih pendek
      const minLength = Math.min(
        dashboardData.monthlyTrend.categories.length, 
        dashboardData.monthlyTrend.data.length
      );
      
      if (minLength === 0) {
        console.warn('monthlyTrend categories or data array is empty');
        return createDefaultMonthlyData();
      }
      
      return Array(minLength).fill().map((_, index) => ({
        name: dashboardData.monthlyTrend.categories[index] || `Month ${index+1}`,
        value: isNaN(dashboardData.monthlyTrend.data[index]) ? 0 : dashboardData.monthlyTrend.data[index]
      }));
    } catch (error) {
      console.error('Error transforming monthly trend data:', error);
      setDataError('Gagal memproses data tren bulanan');
      return createDefaultMonthlyData();
    }
  }, [dashboardData]);
  
  // Data default untuk tren bulanan
  const createDefaultMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({ name: month, value: Math.floor(Math.random() * 50) }));
  };
  
  // Data untuk chart distribusi umur dengan validasi dan logging yang lebih baik
  const getAgeGroupData = useCallback(() => {
    try {
      if (!dashboardData) {
        console.warn('Dashboard data is null or undefined');
        return [];
      }

      if (!dashboardData.ageGroups || !dashboardData.ageGroups.categories || !dashboardData.ageGroups.data) {
        console.warn('ageGroups data is missing or incomplete:', dashboardData.ageGroups);
        return createDefaultAgeData();
      }
      
      if (!Array.isArray(dashboardData.ageGroups.categories) || !Array.isArray(dashboardData.ageGroups.data)) {
        console.warn('ageGroups categories or data is not an array');
        return createDefaultAgeData();
      }
      
      // Jika panjang array tidak sama, menggunakan array yang lebih pendek
      const minLength = Math.min(
        dashboardData.ageGroups.categories.length, 
        dashboardData.ageGroups.data.length
      );
      
      if (minLength === 0) {
        console.warn('ageGroups categories or data array is empty');
        return createDefaultAgeData();
      }
      
      return Array(minLength).fill().map((_, index) => ({
        name: dashboardData.ageGroups.categories[index] || `Age ${index+1}`,
        value: isNaN(dashboardData.ageGroups.data[index]) ? 0 : dashboardData.ageGroups.data[index]
      }));
    } catch (error) {
      console.error('Error transforming age group data:', error);
      setDataError('Gagal memproses data distribusi umur');
      return createDefaultAgeData();
    }
  }, [dashboardData]);
  
  // Data default untuk distribusi umur
  const createDefaultAgeData = () => {
    const ageGroups = ['0-10', '11-20', '21-30', '31-40', '41-50', '51-60', '61+'];
    return ageGroups.map(age => ({ name: age, value: Math.floor(Math.random() * 25) }));
  };
  
  // Data untuk chart distribusi gender dengan validasi dan logging yang lebih baik
  const getGenderData = useCallback(() => {
    try {
      if (!dashboardData) {
        console.warn('Dashboard data is null or undefined');
        return createDefaultGenderData();
      }

      // Jika kita memiliki data pasien langsung, gunakan itu untuk menghitung distribusi gender
      if (dashboardData.patients && Array.isArray(dashboardData.patients) && dashboardData.patients.length > 0) {
        console.log('Menggunakan data pasien untuk distribusi gender');
        
        // Hitung jumlah laki-laki dan perempuan dari data pasien
        let maleCount = 0;
        let femaleCount = 0;
        let totalWithGender = 0;
        
        dashboardData.patients.forEach(patient => {
          // Periksa apakah gender ada dan normalisasi
          if (patient.gender) {
            totalWithGender++;
            const genderLower = patient.gender.toLowerCase();
            if (genderLower === 'laki-laki' || genderLower === 'male' || genderLower === 'l' || genderLower === 'm') {
              maleCount++;
            } else if (genderLower === 'perempuan' || genderLower === 'female' || genderLower === 'p' || genderLower === 'f') {
              femaleCount++;
            }
          }
        });
        
        // Hindari pembagian dengan nol
        const totalForCalculation = totalWithGender || 1;
        
        return [
          { name: 'Laki-laki', value: Math.round((maleCount / totalForCalculation) * 100) },
          { name: 'Perempuan', value: Math.round((femaleCount / totalForCalculation) * 100) }
        ];
      }

      // Gunakan data genderDistribution yang sudah diolah dari backend jika tersedia
      if (dashboardData.genderDistribution && Array.isArray(dashboardData.genderDistribution)) {
        // Validasi nilai dalam array
        const maleValue = isNaN(dashboardData.genderDistribution[0]) ? 50 : dashboardData.genderDistribution[0];
        const femaleValue = isNaN(dashboardData.genderDistribution[1]) ? 50 : dashboardData.genderDistribution[1];
        
        // Pastikan total adalah 100%
        const total = maleValue + femaleValue;
        if (total === 0) {
          return createDefaultGenderData();
        }
        
        // Normalisasi untuk memastikan total 100%
        return [
          { name: 'Laki-laki', value: Math.round((maleValue / total) * 100) },
          { name: 'Perempuan', value: Math.round((femaleValue / total) * 100) }
        ];
      }
      
      console.warn('Tidak ada data gender yang valid tersedia');
      return createDefaultGenderData();
    } catch (error) {
      console.error('Error transforming gender data:', error);
      setDataError('Gagal memproses data distribusi gender');
      return createDefaultGenderData();
    }
  }, [dashboardData]);
  
  // Data default untuk distribusi gender
  const createDefaultGenderData = () => {
    return [
      { name: 'Laki-laki', value: 50 },
      { name: 'Perempuan', value: 50 }
    ];
  };

  // Statistik totals untuk stat cards dengan validasi yang lebih baik
  const getPatientCount = useCallback(() => {
    try {
      if (!dashboardData || !dashboardData.patients) return 0;
      if (!Array.isArray(dashboardData.patients)) {
        console.warn('patients is not an array:', dashboardData.patients);
        return 0;
      }
      return dashboardData.patients.length;
    } catch (error) {
      console.error('Error getting patient count:', error);
      return 0;
    }
  }, [dashboardData]);
  
  const getAnalysisCount = useCallback(() => {
    try {
      if (!dashboardData || !dashboardData.analyses) return 0;
      if (!Array.isArray(dashboardData.analyses)) {
        console.warn('analyses is not an array:', dashboardData.analyses);
        return 0;
      }
      return dashboardData.analyses.length;
    } catch (error) {
      console.error('Error getting analysis count:', error);
      return 0;
    }
  }, [dashboardData]);
  
  const getAvgConfidence = useCallback(() => {
    try {
      if (!dashboardData || !dashboardData.confidenceLevels) return 0;
      if (typeof dashboardData.confidenceLevels !== 'object') {
        console.warn('confidenceLevels is not an object:', dashboardData.confidenceLevels);
        return 0;
      }
      return isNaN(dashboardData.confidenceLevels.average) ? 0 : dashboardData.confidenceLevels.average;
    } catch (error) {
      console.error('Error getting average confidence:', error);
      return 0;
    }
  }, [dashboardData]);
  
  const getHighRiskPercentage = useCallback(() => {
    try {
      if (!dashboardData || !dashboardData.severityDistribution) return 0;
      if (!Array.isArray(dashboardData.severityDistribution) || dashboardData.severityDistribution.length < 5) {
        console.warn('severityDistribution is missing or incomplete:', dashboardData.severityDistribution);
        return 0;
      }
      
      // Berat + Sangat Berat (indeks 3 dan 4)
      const berat = isNaN(dashboardData.severityDistribution[3]) ? 0 : dashboardData.severityDistribution[3];
      const sangatBerat = isNaN(dashboardData.severityDistribution[4]) ? 0 : dashboardData.severityDistribution[4];
      
      return berat + sangatBerat;
    } catch (error) {
      console.error('Error getting high risk percentage:', error);
      return 0;
    }
  }, [dashboardData]);

  // Animasi saat data berubah dan logging data untuk debugging
  useEffect(() => {
    if (dashboardData) {
      console.log('Dashboard data received:', dashboardData);
      
      // Validasi data yang diterima
      if (!dashboardData.severityDistribution) console.warn('Missing severityDistribution');
      if (!dashboardData.monthlyTrend) console.warn('Missing monthlyTrend');
      if (!dashboardData.ageGroups) console.warn('Missing ageGroups');
      if (!dashboardData.genderDistribution) console.warn('Missing genderDistribution');
      
      // Reset error state jika data ada
      setDataError(null);
    } else {
      console.warn('Dashboard data is null or undefined');
    }
  }, [dashboardData]);

  if (error || dataError) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        className="p-6 bg-red-50 rounded-xl border border-red-100 text-red-800"
      >
        <p>{error || dataError}</p>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <div className="space-y-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Pasien" 
            value={getPatientCount()} 
            icon={FiUsers} 
            color="#3B82F6"
            increase={8}
          />
          <StatCard 
            title="Total Analisis" 
            value={getAnalysisCount()} 
            icon={FiActivity} 
            color="#10B981"
            increase={12}
          />
          <StatCard 
            title="Rata-rata Akurasi AI" 
            value={getAvgConfidence()} 
            icon={FiShield} 
            color="#F59E0B"
            increase={3}
            suffix="%"
          />
          <StatCard 
            title="Pasien Risiko Tinggi" 
            value={getHighRiskPercentage()} 
            icon={FiTrendingUp} 
            color="#EF4444"
            increase={-5}
            suffix="%"
          />
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribusi Tingkat Keparahan */}
          <ChartCard title="Distribusi Tingkat Keparahan">
            <EnhancedSeverityChart data={getSeverityData()} loading={loading} />
          </ChartCard>
          
          {/* Tren Bulanan */}
          <ChartCard title="Tren Analisis Bulanan">
            <EnhancedMonthlyTrendChart data={getMonthlyTrendData()} loading={loading} />
          </ChartCard>
          
          {/* Distribusi Umur */}
          <ChartCard title="Distribusi Umur Pasien">
            <EnhancedAgeDistributionChart data={getAgeGroupData()} loading={loading} />
          </ChartCard>
          
          {/* Distribusi Gender */}
          <ChartCard title="Distribusi Gender Pasien">
            <EnhancedGenderDistributionChart data={getGenderData()} loading={loading} />
          </ChartCard>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default DashboardCharts;
