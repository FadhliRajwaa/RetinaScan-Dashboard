import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { useTheme, animations, withPageTransition } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import {
  ArrowUpTrayIcon,
  ChartBarIcon,
  DocumentChartBarIcon,
  ClockIcon,
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
  const background = useMotionTemplate`radial-gradient(${radius}px at ${mouseX}px ${mouseY}px, ${feature.color}20, transparent 60%)`;

  const handleMouseMove = ({ currentTarget, clientX, clientY }) => {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
    radius.set(200);
  };

  const resetRadius = () => radius.set(0);

  return (
    <motion.div
      key={feature.title}
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ 
        scale: 1.03, 
        boxShadow: theme.largeShadow,
        y: -5
      }}
      whileTap={{ scale: 0.98 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetRadius}
      className="relative bg-white p-6 rounded-xl flex flex-col items-center text-center overflow-hidden"
      style={{ 
        backgroundImage: 'radial-gradient(circle at center, white, #f9fafb)',
        boxShadow: theme.mediumShadow
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
          transition={{ type: 'spring', stiffness: 300, delay: index * 0.1 + 0.2 }}
          className="rounded-full p-3 mb-4"
          style={{ backgroundColor: `${feature.color}15` }}
        >
          <feature.icon 
            className="h-8 w-8" 
            style={{ color: feature.color }}
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

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8" style={{ backgroundColor: theme.background }}>
      <motion.div
        variants={animations.container}
        initial="hidden"
        animate="visible"
        className="mt-4"
      >
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h2 
            className="text-2xl sm:text-3xl font-bold mb-3 text-gray-800"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Selamat Datang di RetinaScan
          </motion.h2>
          <motion.p
            className="text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Platform deteksi dini retinopati diabetik dengan teknologi AI canggih
          </motion.p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
        >
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </motion.div>
        
        {/* Dashboard Analytics Charts */}
        <DashboardCharts />
        
        <motion.div 
          className="mt-12 bg-white p-6 rounded-xl"
          style={{ boxShadow: theme.mediumShadow }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <h3 className="text-xl font-bold mb-4 text-gray-800">Statistik Pengguna</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Total Analisis</p>
              <p className="text-2xl font-bold" style={{ color: theme.primary }}>0</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Terakhir Aktivitas</p>
              <p className="text-2xl font-bold" style={{ color: theme.accent }}>-</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Status Profil</p>
              <p className="text-2xl font-bold" style={{ color: theme.secondary }}>Aktif</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Menggunakan HOC untuk menambahkan animasi page transition
const Dashboard = withPageTransition(DashboardComponent);
export default Dashboard;