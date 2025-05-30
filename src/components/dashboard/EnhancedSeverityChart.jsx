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
  
  // Colors with more vibrant gradient
  const COLORS = ['#10B981', '#3B82F6', '#EC4899', '#F59E0B', '#EF4444'];
  const HOVER_COLORS = ['#059669', '#2563EB', '#DB2777', '#D97706', '#DC2626'];
  
  // Labels for severity levels - Memastikan selalu ada 5 tingkatan
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
  
  // Dynamic data transformation with proper fallbacks - Memastikan selalu 5 kategori
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
    
    // Jika data kurang dari 5 item, tambahkan items yang hilang
    if (data.length < 5) {
      const missingLabels = LABELS.filter(label => 
        !data.some(item => item.name === label)
      );
      
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
      
      {/* Legend with interactive elements - Memastikan selalu menampilkan 5 kategori */}
      <div className="flex flex-wrap justify-center gap-2 mt-4">
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
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <span 
                className="w-3 h-3 rounded-full mr-1" 
                style={{ backgroundColor: COLORS[index] }}
              />
              <span className="text-xs font-medium">{label}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default EnhancedSeverityChart; 