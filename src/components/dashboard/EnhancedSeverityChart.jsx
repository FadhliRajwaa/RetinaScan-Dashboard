import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import {
  PieChart, Pie, Cell, Sector,
  ResponsiveContainer, Tooltip
} from 'recharts';

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

const EnhancedSeverityChart = ({ data, loading }) => {
  const { theme } = useTheme();
  const [activeIndex, setActiveIndex] = useState(null);
  const [rotation, setRotation] = useState(0);
  
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
  
  // Dynamic data transformation with proper fallbacks
  const transformedData = useMemo(() => {
    // Default data jika tidak ada data
    if (!data || data.length === 0) {
      return LABELS.map((label, index) => ({
        name: label,
        value: 20, // Nilai default 20% untuk masing-masing kategori
        index: index,
        description: DESCRIPTIONS[index]
      }));
    }
    
    // Debug: log incoming data
    console.log('Raw severity data received:', data);
    
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

  // Custom active shape that expands on hover with more detail
  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    
    // Expanded radius for active segment
    const expandedOuterRadius = outerRadius * 1.1;
    
    return (
      <g>
        <text x={cx} y={cy - 25} dy={8} textAnchor="middle" fill={fill} className="text-lg font-bold">
          {payload.name}
        </text>
        <text x={cx} y={cy} textAnchor="middle" fill="#888" className="text-sm">
          {`${(percent * 100).toFixed(0)}%`}
        </text>
        <text x={cx} y={cy + 20} textAnchor="middle" fill="#666" className="text-xs">
          {`dari total pasien`}
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
          style={{ filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.2))' }}
        />
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
  
  return (
    <div className="relative h-full">
      <ResponsiveContainer width="100%" height="80%">
        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
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
            outerRadius={80}
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
      
      {/* Legend dengan tampilan yang lebih menarik */}
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {LABELS.map((label, index) => {
          const matchingData = transformedData.find(item => item.name === label);
          const value = matchingData ? matchingData.value : 0;
          
          return (
            <motion.div
              key={`legend-${index}`}
              className="flex items-center px-3 py-1.5 rounded-full cursor-pointer"
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
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: COLORS[index] }}
              />
              <span className="text-xs font-medium">{label}</span>
              <span className="text-xs ml-1 text-gray-500">({value}%)</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default EnhancedSeverityChart; 