import { motion, useMotionTemplate, useMotionValue, AnimatePresence } from 'framer-motion';
import { useTheme, animations, withPageTransition } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import CountUp from 'react-countup';
import {
  ArrowUpTrayIcon,
  ChartBarIcon,
  DocumentChartBarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import DashboardCharts from '../components/dashboard/DashboardCharts';

const features = [
  {
    title: 'Unggah Citra',
    description: 'Unggah citra fundus retina dengan aman dan mudah.',
    icon: ArrowUpTrayIcon,
    path: '/scan-retina',
    color: '#3B82F6',
  },
  {
    title: 'Analisis AI',
    description: 'Dapatkan prediksi tingkat keparahan secara instan.',
    icon: ChartBarIcon,
    path: '/scan-retina',
    color: '#10B981',
  },
  {
    title: 'Laporan Hasil',
    description: 'Lihat laporan deteksi dalam format yang jelas.',
    icon: DocumentChartBarIcon,
    path: '/scan-retina',
    color: '#8B5CF6',
  },
  {
    title: 'Riwayat Analisis',
    description: 'Tinjau semua analisis sebelumnya dengan detail.',
    icon: ClockIcon,
    path: '/history',
    color: '#EC4899',
  },
];

function FeatureCard({ feature, index }) {
  const { theme } = useTheme();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const radius = useMotionValue(0);
  const background = useMotionTemplate`radial-gradient(${radius}px at ${mouseX}px ${mouseY}px, ${feature.color}30, transparent 70%)`;

  const handleMouseMove = ({ currentTarget, clientX, clientY }) => {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
    radius.set(250);
  };

  const resetRadius = () => radius.set(0);

  return (
    <motion.div
      key={feature.title}
      initial={{ opacity: 0, scale: 0.9, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        type: "spring",
        stiffness: 100, 
        damping: 15,
        duration: 0.6, 
        delay: index * 0.15 
      }}
      whileHover={{ 
        scale: 1.05, 
        boxShadow: '0 20px 30px rgba(0, 0, 0, 0.12)',
        y: -8
      }}
      whileTap={{ scale: 0.98 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetRadius}
      className="relative bg-white p-6 rounded-2xl flex flex-col items-center text-center overflow-hidden"
      style={{ 
        backgroundImage: 'radial-gradient(circle at center, white, #f9fafb)',
        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.8)'
      }}
    >
      <Link to={feature.path} className="absolute inset-0 z-10" aria-label={feature.title}></Link>
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background }}
      />
      <motion.div
        className="relative z-10 flex flex-col items-center"
      >
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            delay: index * 0.15 + 0.2 
          }}
          className="rounded-full p-4 mb-5"
          style={{ 
            backgroundColor: `${feature.color}15`,
            boxShadow: `0 8px 16px ${feature.color}20`
          }}
        >
          <feature.icon 
            className="h-9 w-9" 
            style={{ color: feature.color }}
          />
        </motion.div>
        <motion.h3 
          className="text-lg sm:text-xl font-bold mb-3"
          style={{
            background: `linear-gradient(135deg, #1F2937, ${feature.color})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {feature.title}
        </motion.h3>
        <p className="text-sm sm:text-base text-gray-600">{feature.description}</p>
      </motion.div>
    </motion.div>
  );
}

function StatCard({ title, value, color, icon: Icon, delay = 0 }) {
  const { theme } = useTheme();
  
  return (
    <motion.div 
      className="bg-white p-5 rounded-xl"
      style={{ 
        boxShadow: theme.mediumShadow,
        border: '1px solid rgba(255, 255, 255, 0.8)'
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ 
        y: -5, 
        boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
        transition: { duration: 0.2 }
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm text-gray-500 font-medium">{title}</h3>
        <motion.div 
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
          whileHover={{ rotate: 15, scale: 1.1 }}
          whileTap={{ rotate: 0, scale: 0.95 }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </motion.div>
      </div>
      <div className="flex items-end">
        <span className="text-2xl font-bold" style={{ color }}>
          <CountUp end={value} duration={2.5} />
        </span>
        <motion.div 
          className="flex items-center ml-2 text-green-500 text-xs"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: delay + 0.5, duration: 0.3 }}
        >
          <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
          <span>+5%</span>
        </motion.div>
      </div>
    </motion.div>
  );
}

function DashboardComponent() {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Delay to ensure animations trigger after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8" style={{ backgroundColor: theme.background }}>
      <motion.div
        variants={animations.container}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        className="mt-4"
      >
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.h2 
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Selamat Datang di RetinaScan
          </motion.h2>
          <motion.p
            className="text-gray-600 max-w-3xl mx-auto text-base sm:text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Platform deteksi dini retinopati diabetik dengan teknologi AI canggih
          </motion.p>
          
          <motion.div
            className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 96, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          />
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12"
        >
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </motion.div>
        
        {/* Stats Cards */}
        <motion.div 
          className="mb-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <StatCard 
            title="Total Analisis" 
            value={124} 
            color={theme.primary} 
            icon={ChartBarIcon}
            delay={0.1}
          />
          <StatCard 
            title="Pasien Aktif" 
            value={87} 
            color={theme.secondary} 
            icon={UserIcon}
            delay={0.2}
          />
          <StatCard 
            title="Analisis Bulan Ini" 
            value={42} 
            color={theme.accent} 
            icon={ClockIcon}
            delay={0.3}
          />
          <StatCard 
            title="Akurasi Deteksi" 
            value={98} 
            color="#EC4899" 
            icon={DocumentChartBarIcon}
            delay={0.4}
          />
        </motion.div>
        
        {/* Dashboard Analytics Charts */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <DashboardCharts />
        </motion.div>
      </motion.div>
    </div>
  );
}

// Menggunakan HOC untuk menambahkan animasi page transition
const Dashboard = withPageTransition(DashboardComponent);
export default Dashboard;

// Placeholder untuk UserIcon yang tidak diimpor sebelumnya
function UserIcon(props) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth={1.5} 
      stroke="currentColor" 
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}