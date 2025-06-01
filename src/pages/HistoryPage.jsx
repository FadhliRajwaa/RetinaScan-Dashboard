import { motion } from 'framer-motion';
import History from '../components/dashboard/History';
import { withPageTransition } from '../context/ThemeContext';

function HistoryPageComponent() {
  // Variants untuk animasi
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
        damping: 25,
        stiffness: 400
      }
    }
  };

  return (
    <motion.div 
      className="p-4 sm:p-6 lg:p-8 min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #f0f7ff 0%, #e6f0ff 100%)',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Riwayat Analisis</h1>
          <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Lihat dan kelola riwayat analisis retina pasien Anda di sini
          </p>
        </motion.div>
        
        <motion.div variants={itemVariants} className="mt-6">
          <History />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

const HistoryPage = withPageTransition(HistoryPageComponent);
export default HistoryPage;