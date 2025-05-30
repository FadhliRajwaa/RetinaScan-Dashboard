import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import {
  PieChart, Pie, Cell, Sector,
  ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import { FiPieChart, FiUsers, FiInfo, FiAlertTriangle } from 'react-icons/fi';

// Komponen untuk loading state
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

// Komponen badge untuk menampilkan total pasien
const TotalBadge = ({ total }) => (
  <motion.div 
    className="absolute top-0 right-0 mt-2 mr-2 z-10"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: 0.5, duration: 0.3 }}
  >
    <div className="flex items-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-3 py-1.5 rounded-full shadow-lg">
      <FiUsers className="mr-1.5" />
      <span className="font-semibold">{total}</span>
      <span className="ml-1 text-blue-100">Pasien</span>
    </div>
  </motion.div>
);

// Komponen info card untuk detail severity
const SeverityInfoCard = ({ severity, color, description, percent, count }) => (
  <motion.div
    className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
      <div className="flex items-center">
        <div 
          className="w-3 h-3 rounded-full mr-2" 
          style={{ backgroundColor: color }}
        />
        <h3 className="font-medium text-gray-800">{severity}</h3>
        <div className="ml-auto flex items-center">
          <span className="text-sm font-bold">{percent}%</span>
          <span className="text-xs text-gray-500 ml-1">({count} pasien)</span>
        </div>
      </div>
    </div>
    <div className="p-2 text-xs text-gray-600">
      <p>{description}</p>
    </div>
  </motion.div>
);

const EnhancedSeverityChart = ({ data, loading }) => {
  const { theme } = useTheme();
  const [activeIndex, setActiveIndex] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  // Colors with more clinical-focused gradient - dari hijau ke merah
  const COLORS = ['#3B82F6', '#10B981', '#FBBF24', '#F59E0B', '#EF4444'];
  const HOVER_COLORS = ['#1D4ED8', '#059669', '#D97706', '#EA580C', '#B91C1C'];
  
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
  };
  
  const onPieLeave = () => {
    setActiveIndex(null);
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
    // Default value jika tidak ada data
    if (!data) return 100;
    
    // Jika data adalah array of numbers (severityDistribution), cari total dari patients di parent component
    if (Array.isArray(data) && data.every(item => typeof item === 'number')) {
      // Jika total tidak diberikan, asumsikan data adalah persentase yang totalnya 100
      return 100;
    }
    
    // Jika data memiliki properti count atau total, gunakan untuk menghitung total
    if (data && data.length > 0) {
      const firstItem = data[0];
      if (firstItem && (firstItem.count !== undefined || firstItem.total !== undefined)) {
        const countField = firstItem.count !== undefined ? 'count' : 'total';
        return data.reduce((sum, item) => sum + (item[countField] || 0), 0);
      }
    }
    
    // Fallback ke 100 (asumsi persentase)
    return 100;
  }, [data]);

  // Custom active shape that expands on hover with more detail
  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
    
    // Expanded radius for active segment
    const expandedOuterRadius = outerRadius * 1.1;
    
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
          strokeWidth={2}
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
    const adjustedRadius = outerRadius * 0.72; // Posisikan label lebih ke dalam
    
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
          className="text-sm font-bold"
          style={{ 
            textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
            fontWeight: 800
          }}
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
        
        {/* Show label for larger segments only */}
        {percent > 0.1 && (
          <text 
            x={x} 
            y={y + 15} 
            fill="#FFFFFF" 
            textAnchor={textAnchor} 
            dominantBaseline="central"
            className="text-xs"
            style={{ 
              textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
              fontWeight: 600
            }}
          >
            {name}
          </text>
        )}
      </g>
    );
  };
  
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
  
  // Hitung jumlah pasien per kategori
  const calculatePatientCount = (value) => {
    return Math.round((value / 100) * totalPatients);
  };
  
  return (
    <motion.div 
      className="relative h-full flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center">
          <FiPieChart className="text-blue-600 mr-2" />
          <h3 className="font-semibold text-gray-800">Distribusi Tingkat Keparahan</h3>
        </div>
        <motion.button
          className="flex items-center text-xs bg-white px-2 py-1 rounded-md border border-gray-200 shadow-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowDetails(!showDetails)}
        >
          <FiInfo className="mr-1 text-blue-500" />
          {showDetails ? 'Sembunyikan Detail' : 'Lihat Detail'}
        </motion.button>
      </div>
      
      {/* Total Badge */}
      <TotalBadge total={totalPatients} />
      
      {/* Chart Container */}
      <div className="flex-grow p-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
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
              innerRadius={60}
              outerRadius={90} 
              dataKey="value"
              paddingAngle={4}
              cornerRadius={3}
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
                  strokeWidth={2}
                  style={{ 
                    filter: activeIndex === index ? 'url(#glow)' : 'none',
                    cursor: 'pointer'
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
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white p-3 rounded-lg shadow-lg border border-gray-100 max-w-xs"
                    >
                      <div className="flex items-center">
                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[data.index] }}></span>
                        <span className="font-bold text-gray-800">{data.name}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{data.description}</p>
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold">{`${data.value}%`}</span>
                          <span className="text-xs text-gray-500">{patientCount} pasien</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div 
                            className="h-1.5 rounded-full" 
                            style={{ 
                              width: `${data.value}%`, 
                              backgroundColor: COLORS[data.index]
                            }}
                          ></div>
                        </div>
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
        
        {/* Info di tengah chart */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center pointer-events-none">
          <AnimatePresence mode="wait">
            {activeIndex !== null ? (
              <motion.div
                key={`info-${activeIndex}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="w-28 h-28 flex flex-col items-center justify-center bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm rounded-full shadow-lg"
              >
                <p className="font-semibold text-sm" style={{ color: COLORS[activeIndex] }}>
                  {transformedData[activeIndex]?.name}
                </p>
                <p className="text-xl font-bold" style={{ color: COLORS[activeIndex] }}>
                  {transformedData[activeIndex]?.value}%
                </p>
                <p className="text-xs text-gray-500">
                  {calculatePatientCount(transformedData[activeIndex]?.value)} pasien
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-32 h-32 flex flex-col items-center justify-center bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm rounded-full shadow-lg"
              >
                <FiAlertTriangle className="text-blue-500 mb-1" />
                <p className="text-gray-800 font-bold text-base">Tingkat</p>
                <p className="text-gray-800 font-bold text-base">Keparahan</p>
                <div className="w-10 h-0.5 bg-gray-200 my-1"></div>
                <p className="text-xs text-blue-500 font-medium">{totalPatients} Pasien</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Detail Panel - Conditional Rendering */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-100 bg-gray-50 overflow-hidden"
          >
            <div className="p-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Detail Tingkat Keparahan</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                {transformedData.map((item, index) => (
                  <SeverityInfoCard 
                    key={`info-card-${index}`}
                    severity={item.name}
                    color={COLORS[index]}
                    description={item.description}
                    percent={item.value}
                    count={calculatePatientCount(item.value)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Compact Legend */}
      <div className="p-2 border-t border-gray-100">
        <div className="flex flex-wrap justify-center gap-2">
          {LABELS.map((label, index) => {
            const matchingData = transformedData.find(item => item.name === label);
            const value = matchingData ? matchingData.value : 0;
            
            return (
              <motion.div
                key={`legend-${index}`}
                className="flex items-center px-2 py-1 rounded-full cursor-pointer"
                style={{ 
                  backgroundColor: activeIndex === index ? `${COLORS[index]}20` : 'transparent',
                  border: `1px solid ${activeIndex === index ? COLORS[index] : 'transparent'}`
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
                <span 
                  className="w-3 h-3 rounded-full mr-1" 
                  style={{ backgroundColor: COLORS[index] }}
                />
                <span className="text-xs font-semibold">{label}</span>
                <span className="text-xs ml-1 text-gray-600 font-medium">({value}%)</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedSeverityChart; 