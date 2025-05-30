import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import {
  PieChart, Pie, Cell, Sector,
  ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import { FiPieChart, FiUsers, FiInfo, FiAlertTriangle, FiEye, FiPercent } from 'react-icons/fi';

// Konstanta untuk ukuran yang konsisten
const CHART_SIZES = {
  innerRadius: 75,
  outerRadius: 115,
  strokeWidth: 2,
  padding: 16, // 1rem
  iconSize: {
    small: 16,
    medium: 20,
    large: 24
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem'
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px'
  }
};

// Komponen untuk loading state
const SkeletonLoader = () => (
  <motion.div 
    className="animate-pulse bg-gray-200 rounded-xl w-full h-full min-h-[400px]"
    initial={{ opacity: 0.6 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
  />
);

// Komponen badge untuk menampilkan total pasien
const TotalBadge = ({ total }) => (
  <motion.div 
    className="absolute top-4 right-4 z-10"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: 0.5, duration: 0.3 }}
  >
    <div className="flex items-center bg-gradient-to-r from-indigo-600 to-blue-700 text-white px-4 py-2 rounded-lg shadow-md">
      <FiUsers size={CHART_SIZES.iconSize.medium} className="mr-2 text-blue-200" />
      <span className="text-lg font-bold">{total.toLocaleString()}</span>
      <span className="ml-2 text-blue-100 font-medium">Pasien</span>
    </div>
  </motion.div>
);

// Komponen info card untuk detail severity
const SeverityInfoCard = ({ severity, color, description, percent, count }) => (
  <motion.div
    className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-200"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    whileHover={{ y: -2, transition: { duration: 0.2 } }}
  >
    <div className="p-3 border-b border-gray-100" style={{ backgroundColor: `${color}15` }}>
      <div className="flex items-center">
        <div 
          className="w-4 h-4 rounded-full mr-2 border-2 border-white shadow-sm" 
          style={{ backgroundColor: color }}
        />
        <h3 className="font-semibold text-gray-800">{severity}</h3>
        <div className="ml-auto flex items-center bg-white rounded-full px-2 py-1 shadow-sm">
          <span className="text-sm font-bold" style={{ color }}>{percent}%</span>
        </div>
      </div>
    </div>
    <div className="p-3">
      <p className="text-xs text-gray-600 mb-2">{description}</p>
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center text-gray-500">
          <FiUsers size={CHART_SIZES.iconSize.small} className="mr-1" />
          <span>{count} pasien</span>
        </span>
        <span className="flex items-center text-gray-500">
          <FiPercent size={CHART_SIZES.iconSize.small} className="mr-1" />
          <span>{percent}% dari total</span>
        </span>
      </div>
    </div>
  </motion.div>
);

// Animation constants
const ANIMATIONS = {
  spring: {
    type: "spring",
    stiffness: 300,
    damping: 30
  },
  bounce: {
    type: "spring",
    stiffness: 200,
    damping: 15
  },
  easeOut: {
    type: "tween",
    ease: "easeOut",
    duration: 0.4
  },
  easeInOut: {
    type: "tween",
    ease: "easeInOut",
    duration: 0.5
  }
};

const EnhancedSeverityChart = ({ data, loading, props }) => {
  const { theme } = useTheme();
  const [activeIndex, setActiveIndex] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  
  // Colors dengan kontras yang lebih baik dan tema klinis
  const COLORS = ['#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444'];
  const HOVER_COLORS = ['#4338CA', '#0284C7', '#059669', '#D97706', '#B91C1C'];
  
  // Labels untuk tingkat keparahan dengan deskripsi yang lebih jelas
  const LABELS = ['Tidak ada', 'Ringan', 'Sedang', 'Berat', 'Sangat Berat'];
  const DESCRIPTIONS = [
    'Tidak ada tanda retinopati diabetik yang signifikan',
    'Mikroaneurisma ringan terdeteksi pada retina',
    'Perdarahan intraretinal dan eksudat keras terlihat',
    'Banyak perdarahan dan cotton wool spots dengan iskemia',
    'Neovaskularisasi dan risiko tinggi kebutaan'
  ];
  
  // Efek untuk animasi entrance
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      
      // Setelah entrance animation selesai, jalankan animasi detail
      setTimeout(() => {
        setHasAnimated(true);
      }, 800);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Efek terpisah untuk rotasi chart saat data berubah
  useEffect(() => {
    if (data && data.length > 0) {
      setRotation(prevRotation => {
        const newRotation = prevRotation + 15;
        return newRotation >= 360 ? 0 : newRotation;
      });
    }
  }, [data]);
  
  const onPieEnter = (_, index) => {
    setActiveIndex(index);
    // Store hover info for additional effects
    if (transformedData[index]) {
      const item = transformedData[index];
      setHoverInfo({
        name: item.name,
        value: item.value,
        description: item.description,
        color: COLORS[index],
        hoverColor: HOVER_COLORS[index],
        index
      });
    }
  };
  
  const onPieLeave = () => {
    setActiveIndex(null);
    setHoverInfo(null);
  };
  
  // Dynamic data transformation with proper fallbacks
  const transformedData = useMemo(() => {
    // Debug: log incoming data
    if (data) {
      console.log('Raw severity data received:', data);
    }
    
    // Default data jika tidak ada data
    if (!data || data.length === 0) {
      return LABELS.map((label, index) => ({
        name: label,
        value: 20, // Nilai default 20% untuk masing-masing kategori
        index: index,
        description: DESCRIPTIONS[index]
      }));
    }
    
    // Jika data adalah array of numbers (severityDistribution), konversi ke format yang benar
    if (Array.isArray(data) && data.every(item => typeof item === 'number')) {
      return LABELS.map((label, index) => ({
        name: label,
        value: data[index] || 0,
        index: index,
        description: DESCRIPTIONS[index]
      }));
    }
    
    // Jika data kurang dari 5 item, tambahkan items yang hilang
    if (data.length < 5) {
      console.warn(`Severity data incomplete: got ${data.length}, need 5`);
      
      const existingLabels = data.map(item => item.name);
      const missingLabels = LABELS.filter(label => !existingLabels.includes(label));
      
      console.log('Missing severity labels:', missingLabels);
      
      const additionalData = missingLabels.map(label => ({
        name: label,
        value: 0,
        description: DESCRIPTIONS[LABELS.indexOf(label)]
      }));
      
      // Gabungkan data yang ada dengan data tambahan
      const completeData = [...data, ...additionalData];
      
      // Sortir data berdasarkan urutan LABELS
      return completeData
        .sort((a, b) => LABELS.indexOf(a.name) - LABELS.indexOf(b.name))
        .map((item, index) => ({
          ...item,
          index,
          description: DESCRIPTIONS[LABELS.indexOf(item.name)]
        }));
    }
    
    // Jika data sudah 5 item, pastikan urutannya benar
    return data
      .sort((a, b) => LABELS.indexOf(a.name) - LABELS.indexOf(b.name))
      .map((item, index) => ({
        ...item,
        index,
        description: DESCRIPTIONS[LABELS.indexOf(item.name)]
      }));
  }, [data]);

  // Hitung total pasien untuk ditampilkan
  const totalPatients = useMemo(() => {
    // Debug: log incoming data untuk debugging
    console.log('Data untuk perhitungan total pasien:', data);
    
    // Jika tidak ada data sama sekali
    if (!data || (Array.isArray(data) && data.length === 0)) {
      console.warn('Tidak ada data pasien tersedia, menggunakan nilai default');
      return 0;
    }
    
    // Jika data adalah array of numbers (severityDistribution)
    if (Array.isArray(data) && data.every(item => typeof item === 'number')) {
      // Cek jika ada properti tambahan untuk total pasien pada parent props
      if (props && props.totalPatients && typeof props.totalPatients === 'number') {
        return props.totalPatients;
      }
      
      // Jika tidak ada total pasien yang diberikan, hitung dari total persentase
      // Asumsi persentase data sudah benar (sum = 100%)
      // Karena nilai persentase sudah total 100%, kita bisa gunakan jumlah pasien yang sudah terdeteksi
      const apiSumValues = data.reduce((sum, value) => sum + (value || 0), 0);
      if (apiSumValues > 0) {
        // Jika data valid dan jumlahnya sudah 100%, ambil dari context atau default
        return props?.patientCount || 100;
      } else {
        // Jika jumlah total adalah 0, berarti belum ada data
        return 0;
      }
    }
    
    // Jika data memiliki properti count, total, atau value, gunakan untuk menghitung total
    if (data && Array.isArray(data) && data.length > 0) {
      // Coba deteksi format data yang diberikan API
      const firstItem = data[0];
      
      // Cek apakah ada properti eksplisit untuk count
      if (firstItem.patientCount !== undefined) {
        return data.reduce((sum, item) => sum + (item.patientCount || 0), 0);
      }
      
      if (firstItem.count !== undefined) {
        return data.reduce((sum, item) => sum + (item.count || 0), 0);
      }
      
      if (firstItem.total !== undefined) {
        return data.reduce((sum, item) => sum + (item.total || 0), 0);
      }
      
      // Jika format data adalah persentase, dan kita memiliki properti patients di props
      if (firstItem.value !== undefined && props && props.totalPatients) {
        return props.totalPatients;
      }
      
      // Jika kita tahu persentase tapi tidak total pasien, gunakan nilai default tapi berikan warning
      if (firstItem.value !== undefined) {
        console.warn('Data persentase tersedia tetapi total pasien tidak diberikan, menggunakan default');
        return props?.patientCount || 100;
      }
    }
    
    // Fallback ke total dari context atau default
    console.warn('Format data tidak dikenali, menggunakan nilai total dari context atau default');
    return props?.patientCount || 0;
  }, [data, props]);

  // Hitung jumlah pasien per kategori dengan lebih akurat
  const calculatePatientCount = useCallback((percentage) => {
    if (totalPatients <= 0 || !percentage) return 0;
    return Math.round((percentage / 100) * totalPatients);
  }, [totalPatients]);

  // Custom active shape that expands on hover with more detail
  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
    
    // Expanded radius for active segment
    const expandedOuterRadius = outerRadius * 1.08;
    
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={expandedOuterRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={HOVER_COLORS[payload.index]}
          strokeWidth={CHART_SIZES.strokeWidth}
          stroke="#fff"
          style={{ filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.2))' }}
        />
      </g>
    );
  };
  
  // Render labels inside each segment of the pie chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    // Jika persentase sangat kecil, jangan tampilkan label
    if (percent < 0.03) return null;
    
    // Adjust radial position of label based on segment size
    const adjustedRadius = outerRadius * 0.75; // Posisikan label lebih ke dalam
    
    // Calculate position
    const RADIAN = Math.PI / 180;
    const radius = adjustedRadius;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    // Tentukan posisi teks
    const textAnchor = "middle";
    
    return (
      <g>
        {/* Show value (percentage) for all segments with stronger styling */}
        <text 
          x={x} 
          y={y} 
          fill="#FFFFFF" 
          textAnchor={textAnchor} 
          dominantBaseline="central"
          className="text-md font-bold"
          style={{ 
            textShadow: '-1px -1px 0 rgba(0,0,0,0.7), 1px -1px 0 rgba(0,0,0,0.7), -1px 1px 0 rgba(0,0,0,0.7), 1px 1px 0 rgba(0,0,0,0.7)',
            fontWeight: 800,
            fontSize: CHART_SIZES.fontSize.base
          }}
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
        
        {/* Show label for larger segments only */}
        {percent > 0.1 && (
          <text 
            x={x} 
            y={y + 18} 
            fill="#FFFFFF" 
            textAnchor={textAnchor} 
            dominantBaseline="central"
            style={{ 
              textShadow: '-1px -1px 0 rgba(0,0,0,0.7), 1px -1px 0 rgba(0,0,0,0.7), -1px 1px 0 rgba(0,0,0,0.7), 1px 1px 0 rgba(0,0,0,0.7)',
              fontWeight: 600,
              fontSize: CHART_SIZES.fontSize.xs
            }}
          >
            {name}
          </text>
        )}
      </g>
    );
  };
  
  // Animation configuration for chart with improved timing
  const animationProps = {
    isAnimationActive: true,
    animationBegin: 100,
    animationDuration: hasAnimated ? 800 : 1500,
    animationEasing: "ease-out"
  };
  
  if (loading) {
    return <SkeletonLoader />;
  }
  
  return (
    <motion.div 
      className="relative h-full flex flex-col bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={ANIMATIONS.easeOut}
      style={{ minHeight: '500px' }}
    >
      {/* Header with improved animations */}
      <motion.div 
        className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, ...ANIMATIONS.easeOut }}
      >
        <div className="flex items-center">
          <motion.div 
            className="bg-indigo-600 p-2 rounded-md shadow-sm mr-3 flex items-center justify-center w-10 h-10"
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, ...ANIMATIONS.spring }}
            whileHover={{ rotate: 5, scale: 1.05 }}
          >
            <FiPieChart size={CHART_SIZES.iconSize.medium} className="text-white" />
          </motion.div>
          <div>
            <motion.h3 
              className="font-bold text-gray-800 text-lg"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, ...ANIMATIONS.easeOut }}
            >
              Tingkat Keparahan
            </motion.h3>
            <motion.p 
              className="text-xs text-gray-500"
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, ...ANIMATIONS.easeOut }}
            >
              Distribusi berdasarkan tingkat keparahan pasien
            </motion.p>
          </div>
        </div>
        <motion.button
          className="flex items-center text-xs bg-white px-3 py-1.5 rounded-md border border-indigo-200 shadow-sm text-indigo-700 font-medium"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, ...ANIMATIONS.spring }}
          whileHover={{ scale: 1.05, backgroundColor: '#EEF2FF' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowDetails(!showDetails)}
        >
          <FiEye size={CHART_SIZES.iconSize.small} className="mr-1.5" />
          {showDetails ? 'Sembunyikan' : 'Detail'}
        </motion.button>
      </motion.div>
      
      {/* Total Badge with improved animations */}
      <TotalBadge total={totalPatients} />
      
      {/* Chart Container with improved interactions */}
      <div className="flex-grow p-4 relative">
        <ResponsiveContainer width="100%" height={400}>
          <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <defs>
              {COLORS.map((color, index) => (
                <radialGradient key={`radialGradient-${index}`} id={`severity-gradient-${index}`} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                  <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={HOVER_COLORS[index]} stopOpacity={0.7} />
                </radialGradient>
              ))}
              <filter id="glow" height="200%" width="200%" x="-50%" y="-50%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <Pie
              data={transformedData}
              cx="50%"
              cy="50%"
              innerRadius={CHART_SIZES.innerRadius}
              outerRadius={CHART_SIZES.outerRadius}
              dataKey="value"
              paddingAngle={4}
              cornerRadius={5}
              startAngle={90 + rotation}
              endAngle={-270 + rotation}
              {...animationProps}
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              label={renderCustomizedLabel}
              labelLine={false}
            >
              {transformedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#severity-gradient-${index})`} 
                  stroke="#fff" 
                  strokeWidth={CHART_SIZES.strokeWidth}
                  style={{ 
                    filter: activeIndex === index ? 'url(#glow)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </Pie>
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const patientCount = calculatePatientCount(data.value);
                  
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={ANIMATIONS.spring}
                      className="bg-white p-4 rounded-lg shadow-lg border border-gray-100 max-w-xs"
                    >
                      <div className="flex items-center border-b border-gray-100 pb-2 mb-2">
                        <div 
                          className="w-4 h-4 rounded-full mr-2 border border-white shadow-sm" 
                          style={{ backgroundColor: COLORS[data.index] }}
                        />
                        <span className="font-bold text-gray-800 text-lg">{data.name}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{data.description}</p>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-semibold text-gray-700">Persentase:</span>
                        <span className="text-sm font-bold" style={{ color: COLORS[data.index] }}>{`${data.value}%`}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-700">Jumlah Pasien:</span>
                        <span className="text-sm font-bold text-indigo-600">{patientCount} pasien</span>
                      </div>
                      <motion.div 
                        className="w-full bg-gray-200 rounded-full h-2 mt-3 overflow-hidden"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.div 
                          className="h-2 rounded-full" 
                          initial={{ width: 0 }}
                          animate={{ width: `${data.value}%` }}
                          transition={{ delay: 0.2, duration: 0.5 }}
                          style={{ backgroundColor: COLORS[data.index] }}
                        />
                      </motion.div>
                    </motion.div>
                  );
                }
                return null;
              }}
              animationDuration={300}
              coordinate={{ x: 5, y: 5 }} // Small offset for a nicer appearance
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Info di tengah chart - hanya tampilkan jika tidak ada segment yang aktif */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center pointer-events-none">
          <AnimatePresence mode="wait">
            {activeIndex !== null ? (
              <motion.div
                key={`active-info-${activeIndex}`}
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
                transition={ANIMATIONS.spring}
                className="w-36 h-36 flex flex-col items-center justify-center bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm rounded-full shadow-lg"
              >
                {hoverInfo && (
                  <>
                    <motion.div 
                      className="w-8 h-8 rounded-full mb-1 flex items-center justify-center"
                      style={{ backgroundColor: hoverInfo.color }}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, ...ANIMATIONS.spring }}
                    >
                      <span className="text-white text-xs font-bold">{hoverInfo.value}%</span>
                    </motion.div>
                    <motion.p 
                      className="font-bold text-base mb-1" 
                      style={{ color: hoverInfo.color }}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, ...ANIMATIONS.easeOut }}
                    >
                      {hoverInfo.name}
                    </motion.p>
                    <motion.p 
                      className="text-xs text-gray-500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3, ...ANIMATIONS.easeOut }}
                    >
                      {calculatePatientCount(hoverInfo.value)} pasien
                    </motion.p>
                  </>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="center-info"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  rotate: [0, 2, 0, -2, 0],
                }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  ...ANIMATIONS.easeInOut,
                  rotate: {
                    repeat: hasAnimated ? 0 : Infinity,
                    repeatType: "loop",
                    duration: 5,
                    ease: "easeInOut"
                  }
                }}
                className="w-32 h-32 flex flex-col items-center justify-center bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm rounded-full shadow-lg"
              >
                <motion.div 
                  className="bg-indigo-100 p-2 rounded-full mb-2"
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  animate={{ 
                    rotate: hasAnimated ? 0 : [0, 10, 0, -10, 0],
                    scale: hasAnimated ? 1 : [1, 1.05, 1, 1.05, 1]
                  }}
                  transition={{ 
                    repeat: hasAnimated ? 0 : Infinity, 
                    repeatType: "loop", 
                    duration: 6 
                  }}
                >
                  <FiAlertTriangle size={CHART_SIZES.iconSize.medium} className="text-indigo-600" />
                </motion.div>
                <p className="text-gray-800 font-bold text-sm">Tingkat</p>
                <p className="text-gray-800 font-bold text-sm">Keparahan</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Detail Panel - Conditional Rendering with improved animations */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={ANIMATIONS.easeInOut}
            className="border-t border-gray-200 bg-gray-50 overflow-hidden"
          >
            <motion.div 
              className="p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, ...ANIMATIONS.easeOut }}
            >
              <motion.h4 
                className="text-sm font-bold text-gray-700 mb-3 flex items-center"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, ...ANIMATIONS.easeOut }}
              >
                <FiInfo size={CHART_SIZES.iconSize.small} className="mr-1.5 text-indigo-500" />
                Detail Tingkat Keparahan
              </motion.h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {transformedData.map((item, index) => (
                  <motion.div
                    key={`info-card-container-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      delay: 0.1 + (index * 0.1),
                      ...ANIMATIONS.spring
                    }}
                  >
                    <SeverityInfoCard 
                      key={`info-card-${index}`}
                      severity={item.name}
                      color={COLORS[index]}
                      description={item.description}
                      percent={item.value}
                      count={calculatePatientCount(item.value)}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Compact Legend with improved animations */}
      <motion.div 
        className="p-3 border-t border-gray-200 bg-gray-50"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, ...ANIMATIONS.easeOut }}
      >
        <div className="flex flex-wrap justify-center gap-2">
          {LABELS.map((label, index) => {
            const matchingData = transformedData.find(item => item.name === label);
            const value = matchingData ? matchingData.value : 0;
            
            return (
              <motion.div
                key={`legend-${index}`}
                className="flex items-center px-3 py-1.5 rounded-full cursor-pointer"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  x: [0, 0], // Force GPU acceleration for smoother transitions
                }}
                transition={{ 
                  delay: 0.8 + (index * 0.05),
                  ...ANIMATIONS.spring
                }}
                style={{ 
                  backgroundColor: activeIndex === index ? `${COLORS[index]}15` : 'white',
                  border: `1px solid ${activeIndex === index ? COLORS[index] : '#e5e7eb'}`
                }}
                whileHover={{ 
                  scale: 1.05, 
                  backgroundColor: `${COLORS[index]}10`,
                  border: `1px solid ${COLORS[index]}` 
                }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <motion.span 
                  className="w-3 h-3 rounded-full mr-2 border border-white" 
                  style={{ backgroundColor: COLORS[index] }}
                  whileHover={{ scale: 1.2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                />
                <span className="text-xs font-medium text-gray-700">{label}</span>
                <span className="text-xs ml-1.5 px-1.5 py-0.5 bg-gray-100 rounded-full font-semibold" style={{ color: COLORS[index] }}>{value}%</span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EnhancedSeverityChart; 