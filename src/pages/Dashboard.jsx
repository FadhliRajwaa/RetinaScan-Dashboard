import { motion, useMotionTemplate, useMotionValue, AnimatePresence } from 'framer-motion';
import { useTheme, animations, withPageTransition } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import {
  ArrowUpTrayIcon,
  ChartBarIcon,
  DocumentChartBarIcon,
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import DashboardCharts from '../components/dashboard/DashboardCharts';

// Glassmorphism style
const glassEffect = {
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.18)',
};

const features = [
  {
    title: 'Unggah Citra',
    description: 'Unggah citra fundus retina dengan aman dan mudah.',
    icon: ArrowUpTrayIcon,
    path: '/scan-retina',
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)',
  },
  {
    title: 'Analisis AI',
    description: 'Dapatkan prediksi tingkat keparahan secara instan.',
    icon: ChartBarIcon,
    path: '/scan-retina',
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981, #059669)',
  },
  {
    title: 'Laporan Hasil',
    description: 'Lihat laporan deteksi dalam format yang jelas.',
    icon: DocumentChartBarIcon,
    path: '/scan-retina',
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
  },
  {
    title: 'Riwayat Analisis',
    description: 'Tinjau semua analisis sebelumnya dengan detail.',
    icon: ClockIcon,
    path: '/history',
    color: '#EC4899',
    gradient: 'linear-gradient(135deg, #EC4899, #DB2777)',
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
    radius.set(300);
  };

  const resetRadius = () => radius.set(0);

  return (
    <motion.div
      key={feature.title}
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        type: 'spring',
        stiffness: 300,
        damping: 30,
        duration: 0.5, 
        delay: index * 0.1 
      }}
      whileHover={{ 
        scale: 1.05,
        y: -8,
        transition: { type: 'spring', stiffness: 400, damping: 15 }
      }}
      whileTap={{ scale: 0.98 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetRadius}
      className="relative p-6 rounded-xl flex flex-col items-center text-center overflow-hidden"
      style={{ 
        ...glassEffect,
        transform: 'translateZ(0)',
        willChange: 'transform, opacity'
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
          transition={{ type: 'spring', stiffness: 400, delay: index * 0.1 + 0.2 }}
          className="rounded-full p-4 mb-5"
          style={{ 
            background: feature.gradient,
            boxShadow: `0 10px 15px -3px ${feature.color}40`
          }}
        >
          <feature.icon 
            className="h-8 w-8 text-white" 
          />
        </motion.div>
        <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-800">
          {feature.title}
        </h3>
        <p className="text-sm sm:text-base text-gray-600">{feature.description}</p>
      </motion.div>
    </motion.div>
  );
}

function DashboardComponent() {
  const { theme } = useTheme();

  // Background gradient animation
  const backgroundVariants = {
    initial: {
      backgroundPosition: '0% 0%',
    },
    animate: {
      backgroundPosition: '100% 100%',
      transition: { 
        repeat: Infinity, 
        repeatType: "reverse", 
        duration: 20,
        ease: "linear"
      }
    }
  };

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
      className="flex-1 p-4 sm:p-6 lg:p-8 overflow-hidden" 
      style={{ 
        background: `linear-gradient(120deg, ${theme.background}, ${theme.backgroundAlt})`,
        backgroundSize: '200% 200%',
      }}
      variants={backgroundVariants}
      initial="initial"
      animate="animate"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mt-4 space-y-10"
      >
        <motion.div
          className="text-center mb-10"
          variants={itemVariants}
        >
          <motion.div 
            className="inline-flex items-center px-4 py-2 rounded-full mb-4"
            style={{ 
              background: `linear-gradient(to right, ${theme.primary}20, ${theme.accent}20)`,
              border: `1px solid ${theme.primary}30`
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <SparklesIcon className="h-5 w-5 mr-2" style={{ color: theme.primary }} />
            <span className="text-sm font-medium" style={{ color: theme.primary }}>
              Platform AI Retinopati Diabetik
            </span>
          </motion.div>
          
          <motion.h2 
            className="text-3xl sm:text-4xl font-bold mb-4 text-gray-800"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Selamat Datang di RetinaScan
          </motion.h2>
          
          <motion.p
            className="text-gray-600 max-w-3xl mx-auto text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Platform deteksi dini retinopati diabetik dengan teknologi AI canggih
          </motion.p>
        </motion.div>
        
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
        >
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </motion.div>
        
        {/* Dashboard Analytics Charts */}
        <motion.div variants={itemVariants}>
          <DashboardCharts />
        </motion.div>
        
        <motion.div 
          variants={itemVariants}
          style={{ 
            ...glassEffect,
            transform: 'translateZ(0)',
            willChange: 'transform, opacity'
          }}
          className="p-8 rounded-xl"
          whileHover={{ 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          }}
        >
          <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
            <span className="w-2 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full mr-3"></span>
            Statistik Pengguna
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100"
            >
              <p className="text-sm text-gray-500 mb-2">Total Analisis</p>
              <p className="text-3xl font-bold" style={{ color: theme.primary }}>0</p>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-100"
            >
              <p className="text-sm text-gray-500 mb-2">Terakhir Aktivitas</p>
              <p className="text-3xl font-bold" style={{ color: theme.accent }}>-</p>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-lg border border-purple-100"
            >
              <p className="text-sm text-gray-500 mb-2">Status Profil</p>
              <p className="text-3xl font-bold" style={{ color: theme.secondary }}>Aktif</p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// Menggunakan HOC untuk menambahkan animasi page transition
const Dashboard = withPageTransition(DashboardComponent);
export default Dashboard;