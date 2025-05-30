import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import History from '../components/dashboard/History';
import { withPageTransition } from '../context/ThemeContext';
import { FiClock, FiBarChart2, FiFileText } from 'react-icons/fi';

function HistoryPageComponent() {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: 'spring',
        damping: 12,
        stiffness: 100
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Riwayat Analisis</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Lihat dan kelola riwayat analisis retina pasien yang telah dilakukan sebelumnya
          </p>
        </div>

        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Total Analyses Card */}
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow"
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white mr-4">
                <FiFileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Analisis</p>
                <div className="flex items-end">
                  <h3 className="text-2xl font-bold text-gray-800">-</h3>
                  <span className="text-xs text-green-500 ml-2 mb-0.5">Memuat...</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Monthly Analyses Card */}
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow"
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white mr-4">
                <FiBarChart2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Analisis Bulan Ini</p>
                <div className="flex items-end">
                  <h3 className="text-2xl font-bold text-gray-800">-</h3>
                  <span className="text-xs text-green-500 ml-2 mb-0.5">Memuat...</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Last Analysis Card */}
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow"
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white mr-4">
                <FiClock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Analisis Terakhir</p>
                <div className="flex items-end">
                  <h3 className="text-2xl font-bold text-gray-800">-</h3>
                  <span className="text-xs text-green-500 ml-2 mb-0.5">Memuat...</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <History />
        </motion.div>
      </motion.div>
    </div>
  );
}

const HistoryPage = withPageTransition(HistoryPageComponent);
export default HistoryPage;