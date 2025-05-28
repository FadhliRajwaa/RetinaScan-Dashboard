import { useState } from 'react';
import { motion, useMotionTemplate, useMotionValue, AnimatePresence, useTransform } from 'framer-motion';
import { useTheme, animations, withPageTransition } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import {
  ArrowUpTrayIcon,
  ChartBarIcon,
  DocumentChartBarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  EyeIcon,
  ChartPieIcon,
} from '@heroicons/react/24/outline';
import DashboardCharts from '../components/dashboard/DashboardCharts';
import InteractiveCharts from '../components/dashboard/InteractiveCharts';
import ParticleBackground from '../components/common/ParticleBackground';
import AnimatedBackground from '../components/common/AnimatedBackground';
import GradientBackground from '../components/common/GradientBackground';
import '../utils/animation.css';

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

// Kartu fitur dengan animasi interaktif
function FeatureCard({ feature, index }) {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  
  // Setup for subtle 3D rotation effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useTransform(y, [-50, 50], [2, -2]); 
  const rotateY = useTransform(x, [-50, 50], [-2, 2]);
  
  const boxShadow = useTransform(
    y,
    [-50, 50],
    [
      `0 ${isHovered ? 15 : 5}px 15px rgba(0, 0, 0, 0.1)`,
      `0 ${isHovered ? 15 : 5}px 15px rgba(0, 0, 0, 0.1)`
    ]
  );
  
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const centerX = rect.left + width / 2;
    const centerY = rect.top + height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    x.set(mouseX);
    y.set(mouseY);
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };
  
  return (
    <motion.div
      className="relative h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
    >
      <Link to={feature.path}>
        <motion.div 
          className="h-full p-6 rounded-xl flex flex-col transition-colors duration-300 group overflow-hidden relative"
          style={{ 
            backgroundColor: 'white',
            rotateX,
            rotateY,
            boxShadow,
            transformPerspective: 1000,
          }}
          whileHover={{ scale: 1.02 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Background gradient */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            animate={{
              background: isHovered 
                ? `linear-gradient(135deg, ${feature.color}08, ${feature.color}18)`
                : `linear-gradient(135deg, transparent, transparent)`
            }}
          />
          
          {/* Icon with background */}
          <div 
            className="mb-4 rounded-lg p-3 w-12 h-12 flex items-center justify-center"
            style={{ 
              backgroundColor: `${feature.color}15`,
              color: feature.color 
            }}
          >
            <feature.icon className="w-6 h-6" />
          </div>
          
          {/* Content */}
          <h3 className="text-lg font-semibold mb-2 text-gray-800">{feature.title}</h3>
          <p className="text-gray-500 text-sm flex-grow">{feature.description}</p>
          
          <motion.div 
            className="flex items-center mt-4 text-sm font-medium group"
            animate={{ 
              color: isHovered ? feature.color : '#6B7280'
            }}
          >
            <span>Lihat Selengkapnya</span>
            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </motion.div>
          
          {/* Corner accent decoration */}
          <motion.div 
            className="absolute top-0 right-0 w-12 h-12 origin-top-right"
            style={{
              borderRadius: '0 0 0 100%',
              background: feature.color,
              opacity: 0,
              transform: 'scale(0)',
            }}
            animate={{
              opacity: isHovered ? 0.1 : 0,
              transform: isHovered ? 'scale(1)' : 'scale(0)',
            }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      </Link>
    </motion.div>
  );
}

// Komponen untuk statistik dengan animasi counter
function StatCard({ icon: Icon, title, value, color, delay, formatter = (val) => val }) {
  const { theme } = useTheme();
  
  return (
    <motion.div 
      className="bg-white rounded-xl p-5 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5, boxShadow: theme.mediumShadow }}
      style={{ 
        boxShadow: theme.smallShadow,
        borderLeft: `4px solid ${color}`,
        willChange: 'transform, box-shadow',
        transform: 'translateZ(0)'
      }}
    >
      <div className="flex items-start">
        <div 
          className="p-3 rounded-lg mr-4"
          style={{ 
            backgroundColor: `${color}15`,
            boxShadow: `0 4px 8px -2px ${color}20`
          }}
        >
          <Icon className="h-6 w-6" style={{ color }} />
        </div>
        
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <AnimatePresence mode="wait">
            <motion.p 
              key={value}
              className="text-2xl font-bold"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              style={{ color }}
            >
              {formatter(value)}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
      
      <div 
        className="absolute bottom-0 right-0 w-24 h-24 -m-6 rounded-full opacity-10"
        style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }}
      />
    </motion.div>
  );
}

function DashboardComponent() {
  const { theme } = useTheme();
  const [showAdvancedCharts, setShowAdvancedCharts] = useState(false);
  const [backgroundType, setBackgroundType] = useState('particles'); // 'particles', 'animated', 'gradient'
  
  // Dummy data untuk statistik
  const stats = [
    { title: 'Total Analisis', value: 128, icon: ChartBarIcon, color: theme.primary },
    { title: 'Total Pasien', value: 85, icon: UserGroupIcon, color: theme.secondary },
    { title: 'Pemindaian Hari Ini', value: 12, icon: EyeIcon, color: theme.accent },
    { title: 'Pertumbuhan', value: 24, icon: ArrowTrendingUpIcon, color: theme.success, formatter: (val) => `+${val}%` },
  ];

  // Toggle background effect
  const toggleBackground = () => {
    const types = ['particles', 'animated', 'gradient'];
    const currentIndex = types.indexOf(backgroundType);
    const nextIndex = (currentIndex + 1) % types.length;
    setBackgroundType(types[nextIndex]);
  };

  // Background components based on current type
  const renderBackground = () => {
    switch (backgroundType) {
      case 'animated':
        return <AnimatedBackground variant="gradient" particleCount={40} speed={0.5} />;
      case 'gradient':
        return <GradientBackground variant="rainbow" blur={80} opacity={0.3} />;
      case 'particles':
      default:
        return <ParticleBackground variant="light" particleDensity={30} />;
    }
  };
  
  return (
    <div className="flex-1 pb-8 relative" style={{ backgroundColor: theme.background }}>
      {/* Particle background for the entire page with lower opacity */}
      <div className="fixed inset-0 z-0 opacity-10">
        {renderBackground()}
      </div>
      
      {/* Rest of the content */}
      <div className="relative z-1">
        {/* Header Banner dengan Particle Effect */}
        <div className="relative w-full h-64 mb-8 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <ParticleBackground variant="light" />
          </div>
          
          <div 
            className="absolute inset-0 z-0" 
            style={{ 
              background: `linear-gradient(135deg, ${theme.primary}80, ${theme.accent}80)`,
              opacity: 0.8
            }}
          />
          
          <motion.div
            className="relative z-10 h-full flex flex-col justify-center items-center text-white px-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h1 
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 tracking-tight"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              style={{
                textShadow: '0 2px 10px rgba(0,0,0,0.2)'
              }}
            >
              Selamat Datang di RetinaScan
            </motion.h1>
            
            <motion.p
              className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Platform deteksi dini retinopati diabetik dengan teknologi AI canggih
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex space-x-4"
            >
              <Link 
                to="/scan-retina" 
                className="inline-flex items-center px-6 py-3 rounded-full font-medium text-white hover-lift"
                style={{ 
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }}
              >
                <EyeIcon className="h-5 w-5 mr-2" />
                Mulai Pemindaian
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              
              <motion.button
                onClick={toggleBackground}
                className="inline-flex items-center px-4 py-2 rounded-full text-white hover-lift"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ 
                  background: 'rgba(0,0,0,0.2)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <span className="text-sm">Ganti Efek</span>
              </motion.button>
            </motion.div>
          </motion.div>
          
          {/* Wave separator */}
          <div className="absolute bottom-0 left-0 right-0 h-16 text-gray-50">
            <svg preserveAspectRatio="none" width="100%" height="100%" viewBox="0 0 1440 74" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 24L120 34C240 44 480 64 720 64C960 64 1200 44 1320 34L1440 24V74H1320C1200 74 960 74 720 74C480 74 240 74 120 74H0V24Z" fill="currentColor"/>
            </svg>
          </div>
        </div>
        
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Stat Cards Row with Animation Classes */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            variants={animations.container}
            initial="hidden"
            animate="visible"
          >
            {stats.map((stat, index) => (
              <StatCard 
                key={stat.title}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                color={stat.color}
                delay={index * 0.1}
                formatter={stat.formatter}
              />
            ))}
          </motion.div>
          
          {/* Feature Cards with New Animation Classes */}
          <motion.div
            className="mb-10"
            variants={animations.container}
            initial="hidden"
            animate="visible"
          >
            <motion.h2 
              className="text-2xl font-bold mb-6 text-gray-800 relative inline-block"
              variants={animations.fadeInUp}
            >
              <span className="text-gradient-primary">Fitur Utama</span>
              <motion.div
                className="absolute bottom-0 left-0 h-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.3, duration: 0.5 }}
              />
            </motion.h2>
            
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
            >
              {features.map((feature, index) => (
                <FeatureCard key={feature.title} feature={feature} index={index} />
              ))}
            </motion.div>
          </motion.div>
          
          {/* Dashboard Analytics Charts with Glass Effect */}
          <motion.div
            className="mb-10 p-6 rounded-xl glass-deep"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="flex justify-between items-center mb-6">
              <motion.h2 
                className="text-2xl font-bold text-gray-800 relative inline-block"
                variants={animations.fadeInUp}
              >
                <span className="text-gradient-cool">Analitik & Statistik</span>
                <motion.div
                  className="absolute bottom-0 left-0 h-1 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                />
              </motion.h2>
            </div>
            
            <DashboardCharts />
          </motion.div>
  
          {/* Interactive Visualizations Section with Animation */}
          <motion.div 
            className="mb-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="flex justify-between items-center mb-6">
              <motion.h2 
                className="text-2xl font-bold text-gray-800 relative inline-block"
                variants={animations.fadeInUp}
              >
                <span className="text-gradient-vibrant">Visualisasi Interaktif</span>
                <motion.div
                  className="absolute bottom-0 left-0 h-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                />
              </motion.h2>
              
              <motion.button
                onClick={() => setShowAdvancedCharts(!showAdvancedCharts)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white hover-lift"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ 
                  background: theme.primaryGradient,
                  boxShadow: theme.smallShadow
                }}
              >
                <ChartPieIcon className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {showAdvancedCharts ? 'Sembunyikan Visualisasi' : 'Tampilkan Visualisasi'}
                </span>
              </motion.button>
            </div>
            
            <AnimatePresence>
              {showAdvancedCharts && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{ overflow: 'hidden' }}
                >
                  <InteractiveCharts />
                </motion.div>
              )}
            </AnimatePresence>
  
            {!showAdvancedCharts && (
              <motion.div 
                className="glass-frost rounded-xl p-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <ChartPieIcon className="h-12 w-12 mx-auto text-blue-500 mb-3 animate-float" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Visualisasi Data Interaktif</h3>
                <p className="text-gray-600 mb-4 max-w-2xl mx-auto">
                  Lihat visualisasi data interaktif yang membantu Anda memahami distribusi dan pola dalam data pasien dan analisis retina.
                </p>
                <motion.button
                  onClick={() => setShowAdvancedCharts(true)}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium inline-flex items-center hover-glow"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>Tampilkan Visualisasi</span>
                  <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
      
      {/* Footer wave with particles */}
      <div className="relative mt-16 pt-16">
        <div className="absolute inset-0 opacity-20">
          <ParticleBackground variant="dark" particleDensity={30} />
        </div>
        
        <div className="absolute top-0 left-0 right-0 h-16 text-primary transform rotate-180">
          <svg preserveAspectRatio="none" width="100%" height="100%" viewBox="0 0 1440 74" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 24L120 34C240 44 480 64 720 64C960 64 1200 44 1320 34L1440 24V74H1320C1200 74 960 74 720 74C480 74 240 74 120 74H0V24Z" fill="currentColor" fillOpacity="0.1"/>
          </svg>
        </div>
        
        <div className="container mx-auto text-center py-8 relative z-10">
          <motion.p 
            className="text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            RetinaScan • Platform Deteksi Dini Retinopati Diabetik dengan AI
          </motion.p>
        </div>
      </div>
    </div>
  );
}

// Menggunakan HOC untuk menambahkan animasi page transition
const Dashboard = withPageTransition(DashboardComponent);
export default Dashboard;