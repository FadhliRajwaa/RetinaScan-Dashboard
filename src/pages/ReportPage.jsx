import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Report from '../components/dashboard/Report';
import { withPageTransition } from '../context/ThemeContext';
import { FiFileText, FiDownload, FiPrinter, FiInfo } from 'react-icons/fi';

function ReportPageComponent() {
  const [result, setResult] = useState(null);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);

    // Attempt to get result from localStorage (if it was passed from analysis page)
    const savedResult = localStorage.getItem('analysisResult');
    if (savedResult) {
      try {
        setResult(JSON.parse(savedResult));
      } catch (error) {
        console.error('Error parsing saved result:', error);
      }
    }
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Laporan Analisis</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Lihat dan kelola laporan hasil analisis retina dalam format yang mudah dibaca
          </p>
        </div>

        {/* Action Buttons */}
        {result && (
          <motion.div 
            className="flex flex-wrap justify-center gap-4 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.button
              variants={itemVariants}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <FiDownload />
              <span>Unduh PDF</span>
            </motion.button>
            
            <motion.button
              variants={itemVariants}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 hover:shadow-md transition-all"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <FiPrinter />
              <span>Cetak Laporan</span>
            </motion.button>
            
            <motion.button
              variants={itemVariants}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 hover:shadow-md transition-all"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <FiInfo />
              <span>Bantuan</span>
            </motion.button>
          </motion.div>
        )}

        {/* Info Banner when no result */}
        {!result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="max-w-3xl mx-auto mb-8 p-6 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200"
          >
            <div className="flex items-start">
              <div className="bg-amber-500 p-3 rounded-full text-white mr-4">
                <FiInfo className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-amber-800 mb-2">Tidak Ada Data Laporan</h3>
                <p className="text-amber-700 mb-3">
                  Tidak ada data laporan yang tersedia. Untuk melihat laporan, silakan lakukan analisis retina terlebih dahulu.
                </p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                  onClick={() => window.location.href = '/analysis'}
                >
                  Mulai Analisis Baru
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
          style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)'
          }}
        >
          <Report result={result} />
        </motion.div>
      </motion.div>
    </div>
  );
}

const ReportPage = withPageTransition(ReportPageComponent);
export default ReportPage;