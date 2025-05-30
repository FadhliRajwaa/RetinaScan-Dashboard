import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import {
  PieChart, Pie, Cell, Sector,
  ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import { FiPieChart, FiUsers, FiInfo, FiAlertTriangle, FiEye, FiPercent } from 'react-icons/fi';
import CountUp from 'react-countup';

// Konstanta untuk ukuran yang konsisten
const CHART_SIZES = {
  // Radius chart 
  innerRadius: 90,     // Meningkatkan agar area tengah lebih besar
  outerRadius: 150,    // Meningkatkan untuk pie chart yang lebih besar
  activeOuterRadius: 158, // Radius ketika segment aktif (hovered)
  
  // Tebal stroke dan padding
  strokeWidth: 2,
  padding: 20, // Meningkatkan padding
  
  // Ketebalan garis hover pada bagian dalam
  innerHoverStrokeWidth: 4,
  
  // Height untuk responsive container
  chartHeight: 450, // Meningkatkan tinggi chart
  
  // Ukuran ikon
  iconSize: {
    tiny: 12,
    small: 16,
    medium: 20,
    large: 24,
    xl: 32
  },
  
  // Ukuran font
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem'
  },
  
  // Border radius
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px'
  },
  
  // Elevasi shadow
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
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
    initial={{ opacity: 0, scale: 0.8, y: -10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ delay: 0.5, ...ANIMATIONS.spring }}
  >
    <motion.div 
      className="flex items-center bg-gradient-to-r from-indigo-600 to-blue-700 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
      whileHover={ANIMATIONS.hoverBounce}
      whileTap={ANIMATIONS.tap}
    >
      <motion.div
        initial={{ rotate: -5, scale: 0.9 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ delay: 0.7, ...ANIMATIONS.spring }}
      >
        <FiUsers size={CHART_SIZES.iconSize.medium} className="mr-2 text-blue-200" />
      </motion.div>
      <span className="text-lg font-bold">
        <CountUpValue value={total} duration={2} />
      </span>
      <span className="ml-2 text-blue-100 font-medium">Pasien</span>
    </motion.div>
  </motion.div>
);

// Komponen untuk animasi angka
const CountUpValue = ({ value, duration = 2 }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.span
          key="count-value"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {value.toLocaleString()}
        </motion.span>
      )}
    </AnimatePresence>
  );
};

// Komponen info card untuk detail severity
const SeverityInfoCard = ({ severity, color, description, percent, count }) => (
  <motion.div
    className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-300"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    whileHover={{ 
      y: -3, 
      boxShadow: CHART_SIZES.shadow.lg,
      borderColor: `${color}40` 
    }}
  >
    <div className="p-3 border-b border-gray-100" style={{ backgroundColor: `${color}15` }}>
      <div className="flex items-center">
        <motion.div 
          className="w-5 h-5 rounded-full mr-2 border-2 border-white shadow-sm" 
          style={{ backgroundColor: color }}
          whileHover={{ scale: 1.2 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        />
        <h3 className="font-semibold text-gray-800">{severity}</h3>
        <motion.div 
          className="ml-auto flex items-center bg-white rounded-full px-2 py-1 shadow-sm"
          whileHover={{ scale: 1.1, backgroundColor: `${color}10` }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          <span className="text-sm font-bold" style={{ color }}>{percent}%</span>
        </motion.div>
      </div>
    </div>
    <div className="p-3">
      <p className="text-xs text-gray-600 mb-3">{description}</p>
      <div className="flex items-center justify-between text-xs mb-2">
        <motion.span 
          className="flex items-center text-gray-500"
          whileHover={{ color: color, scale: 1.05 }}
        >
          <FiUsers size={CHART_SIZES.iconSize.small} className="mr-1" />
          <span>{count} pasien</span>
        </motion.span>
        <motion.span 
          className="flex items-center text-gray-500"
          whileHover={{ color: color, scale: 1.05 }}
        >
          <FiPercent size={CHART_SIZES.iconSize.small} className="mr-1" />
          <span>{percent}% dari total</span>
        </motion.span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <motion.div 
          className="h-1.5 rounded-full" 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  </motion.div>
);

// Animation constants
const ANIMATIONS = {
  // Spring animations
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
  gentleBounce: {
    type: "spring",
    stiffness: 100,
    damping: 20
  },
  
  // Tween animations
  easeOut: {
    type: "tween",
    ease: "easeOut",
    duration: 0.4
  },
  easeInOut: {
    type: "tween",
    ease: "easeInOut",
    duration: 0.5
  },
  easeOutLong: {
    type: "tween",
    ease: "easeOut",
    duration: 0.8
  },
  
  // Staggered animations
  staggered: (delay = 0.05, startDelay = 0) => ({
    type: "tween",
    ease: "easeOut",
    duration: 0.4,
    delay: startDelay + delay
  }),
  
  // Special animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.4, ease: "easeOut" }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.4, ease: "easeOut" }
  },
  slideInBottom: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: "easeOut" }
  },
  slideInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.4, ease: "easeOut" }
  },
  slideInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.4, ease: "easeOut" }
  },
  
  // Hover animations
  hover: {
    scale: 1.05,
    transition: { duration: 0.2 }
  },
  hoverBounce: {
    scale: 1.05,
    transition: { type: "spring", stiffness: 400, damping: 10 }
  },
  
  // Tap animations
  tap: {
    scale: 0.95
  }
};

// Komponen untuk animasi di tengah chart saat hover
const CenterInfo = ({ isHovering, hoverInfo, hasAnimated, calculatePatientCount }) => {
  if (isHovering && hoverInfo) {
    return (
      <motion.div
        key={`active-info-${hoverInfo.index}`}
        initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
        transition={ANIMATIONS.spring}
        className="w-40 h-40 flex flex-col items-center justify-center bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm rounded-full shadow-lg"
        style={{ boxShadow: CHART_SIZES.shadow.lg + ', inset 0 0 0 1px rgba(255, 255, 255, 0.4)' }}
      >
        <motion.div 
          className="w-12 h-12 rounded-full mb-2 flex items-center justify-center"
          style={{ 
            backgroundColor: hoverInfo.color,
            boxShadow: `0 0 0 2px white, 0 0 0 4px ${hoverInfo.color}40`
          }}
          initial={{ scale: 0.8 }}
          animate={{ 
            scale: [0.9, 1.05, 1],
            rotate: [0, 2, 0, -2, 0],
          }}
          transition={{ 
            scale: { delay: 0.1, ...ANIMATIONS.spring },
            rotate: { 
              repeat: Infinity, 
              repeatType: "loop", 
              duration: 3,
              ease: "easeInOut"
            }
          }}
        >
          <span className="text-white text-sm font-bold">{hoverInfo.value}%</span>
        </motion.div>
        <motion.p 
          className="font-bold text-lg mb-1" 
          style={{ color: hoverInfo.color }}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, ...ANIMATIONS.easeOut }}
        >
          {hoverInfo.name}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, ...ANIMATIONS.easeOut }}
          className="flex flex-col items-center"
        >
          <motion.p className="text-sm text-gray-500">
            {calculatePatientCount(hoverInfo.value)} pasien
          </motion.p>
          <motion.div 
            className="w-24 h-1 mt-2 rounded-full overflow-hidden bg-gray-200"
            initial={{ width: 0 }}
            animate={{ width: "24px" }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <motion.div 
              className="h-1 rounded-full"
              style={{ background: `linear-gradient(90deg, ${hoverInfo.color}80, ${hoverInfo.color})` }}
              initial={{ width: 0 }}
              animate={{ width: `100%` }}
              transition={{ delay: 0.5, duration: 0.6 }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }
  
  return (
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
      className="w-36 h-36 flex flex-col items-center justify-center bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm rounded-full shadow-lg"
      style={{ boxShadow: CHART_SIZES.shadow.lg + ', inset 0 0 0 1px rgba(255, 255, 255, 0.4)' }}
    >
      <motion.div 
        className="bg-gradient-to-br from-indigo-100 to-blue-100 p-3 rounded-full mb-2"
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
  );
};

// Komponen untuk header yang lebih animatif
const AnimatedHeader = ({ showDetails, setShowDetails }) => {
  return (
    <motion.div 
      className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, ...ANIMATIONS.easeOut }}
    >
      <div className="flex items-center">
        <motion.div 
          className="bg-gradient-to-br from-indigo-600 to-blue-700 p-2 rounded-md shadow-md mr-3 flex items-center justify-center w-10 h-10"
          initial={{ scale: 0.8, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, ...ANIMATIONS.spring }}
          whileHover={{ 
            rotate: 5, 
            scale: 1.05, 
            boxShadow: '0 6px 20px rgba(79, 70, 229, 0.4)'
          }}
        >
          <motion.div
            animate={{ 
              rotate: [0, 180, 360],
            }}
            transition={{
              rotate: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 20,
                ease: "linear"
              }
            }}
          >
            <FiPieChart size={CHART_SIZES.iconSize.medium} className="text-white" />
          </motion.div>
        </motion.div>
        <div>
          <motion.h3 
            className="font-bold text-gray-800 text-lg bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-700"
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
        whileHover={{ 
          scale: 1.05, 
          backgroundColor: '#EEF2FF', 
          boxShadow: '0 4px 12px rgba(79, 70, 229, 0.15)'
        }}
        whileTap={ANIMATIONS.tap}
        onClick={() => setShowDetails(!showDetails)}
      >
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: showDetails ? 90 : 0 }}
          transition={ANIMATIONS.spring}
          className="mr-1.5"
        >
          <FiEye size={CHART_SIZES.iconSize.small} />
        </motion.div>
        {showDetails ? 'Sembunyikan' : 'Detail'}
      </motion.button>
    </motion.div>
  );
};

// Compact Legend item component for better styling
const LegendItem = ({ label, index, value, isActive, onMouseEnter, onMouseLeave }) => {
  return (
    <motion.div
      className="flex items-center px-3 py-2 rounded-full cursor-pointer"
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
        backgroundColor: isActive ? `${COLORS[index]}15` : 'white',
        border: `1px solid ${isActive ? COLORS[index] : '#e5e7eb'}`
      }}
      whileHover={{ 
        scale: 1.05, 
        backgroundColor: `${COLORS[index]}10`,
        border: `1px solid ${COLORS[index]}`,
        boxShadow: `0 4px 12px ${COLORS[index]}25`
      }}
      whileTap={{ scale: 0.95 }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <motion.span 
        className="w-4 h-4 rounded-full mr-2 border border-white" 
        style={{ backgroundColor: COLORS[index] }}
        whileHover={{ scale: 1.2 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      />
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <span className="text-xs ml-2 px-2 py-0.5 bg-gray-100 rounded-full font-semibold" style={{ color: COLORS[index] }}>{value}%</span>
    </motion.div>
  );
};

const EnhancedSeverityChart = ({ data, loading, props }) => {
  const { theme } = useTheme();
  const [activeIndex, setActiveIndex] = useState(null);
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
    const expandedOuterRadius = CHART_SIZES.activeOuterRadius;
    
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
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={innerRadius - CHART_SIZES.innerHoverStrokeWidth}
          outerRadius={innerRadius - 1}
          fill={HOVER_COLORS[payload.index]}
        />
      </g>
    );
  };
  
  // Render labels inside each segment of the pie chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    // Jika persentase sangat kecil, jangan tampilkan label
    if (percent < 0.05) return null;
    
    // Adjust radial position of label based on segment size
    const adjustedRadius = outerRadius * 0.82; // Posisikan label lebih ke luar
    
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
            fontSize: percent > 0.2 ? CHART_SIZES.fontSize.lg : CHART_SIZES.fontSize.base
          }}
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
        
        {/* Show label for larger segments only with better spacing */}
        {percent > 0.15 && (
          <text 
            x={x} 
            y={y + 24} 
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
  
  // Custom tooltip content with improved styling
  const renderTooltip = (props) => {
    const { active, payload } = props;
    
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const patientCount = calculatePatientCount(data.value);
      
      return (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          transition={ANIMATIONS.spring}
          className="bg-white p-4 rounded-lg shadow-lg border border-gray-100 max-w-xs"
          style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)' }}
        >
          <div className="flex items-center border-b border-gray-100 pb-2 mb-2">
            <motion.div 
              className="w-5 h-5 rounded-full mr-2 border border-white shadow-sm flex items-center justify-center" 
              style={{ 
                backgroundColor: COLORS[data.index],
                boxShadow: `0 0 0 2px white, 0 0 0 3px ${COLORS[data.index]}40`
              }}
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 5, 0]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                repeatType: "loop",
                ease: "easeInOut"
              }}
            >
              <span className="text-white text-xs font-bold">{data.value}%</span>
            </motion.div>
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
              style={{ background: `linear-gradient(90deg, ${COLORS[data.index]} 0%, ${HOVER_COLORS[data.index]} 100%)` }}
            />
          </motion.div>
        </motion.div>
      );
    }
    return null;
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
      style={{ minHeight: '600px' }}
    >
      {/* Header with improved animations */}
      <AnimatedHeader showDetails={showDetails} setShowDetails={setShowDetails} />
      
      {/* Total Badge with improved animations */}
      <TotalBadge total={totalPatients} />
      
      {/* Chart Container with improved interactions */}
      <div className="flex-grow p-6 relative">
        <ResponsiveContainer width="100%" height={CHART_SIZES.chartHeight}>
          <PieChart margin={{ top: 30, right: 30, bottom: 30, left: 30 }}>
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
              paddingAngle={6}
              cornerRadius={5}
              startAngle={90}
              endAngle={-270}
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
              content={renderTooltip}
              animationDuration={300}
              coordinate={{ x: 5, y: 5 }} // Small offset for a nicer appearance
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Info di tengah chart - hanya tampilkan jika tidak ada segment yang aktif */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center pointer-events-none">
          <AnimatePresence mode="wait">
            {activeIndex !== null ? (
              <CenterInfo 
                isHovering={true}
                hoverInfo={hoverInfo}
                hasAnimated={hasAnimated}
                calculatePatientCount={calculatePatientCount}
              />
            ) : (
              <CenterInfo 
                isHovering={false}
                hoverInfo={null}
                hasAnimated={hasAnimated}
                calculatePatientCount={calculatePatientCount}
              />
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
            className="border-t border-gray-200 bg-gradient-to-b from-gray-50 to-white overflow-hidden"
          >
            <motion.div 
              className="p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, ...ANIMATIONS.easeOut }}
            >
              <motion.h4 
                className="text-sm font-bold text-gray-700 mb-4 flex items-center"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, ...ANIMATIONS.easeOut }}
              >
                <FiInfo size={CHART_SIZES.iconSize.small} className="mr-1.5 text-indigo-500" />
                Detail Tingkat Keparahan
              </motion.h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
        className="p-4 border-t border-gray-200 bg-gradient-to-b from-gray-100 to-gray-50"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 }
        }}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.7, ...ANIMATIONS.easeOut }}
      >
        <div className="flex flex-wrap justify-center gap-3">
          {LABELS.map((label, index) => {
            const matchingData = transformedData.find(item => item.name === label);
            const value = matchingData ? matchingData.value : 0;
            
            return (
              <LegendItem
                key={`legend-${index}`}
                label={label}
                index={index}
                value={value}
                isActive={activeIndex === index}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              />
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EnhancedSeverityChart; 