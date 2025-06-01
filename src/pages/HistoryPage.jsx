import { motion } from 'framer-motion';
import History from '../components/dashboard/History';
import { withPageTransition } from '../context/ThemeContext';
import { useTheme } from '../context/ThemeContext';
import { FiClock } from 'react-icons/fi';

function HistoryPageComponent() {
  const { darkMode } = useTheme();

  return (
    <motion.div 
      className={`p-4 sm:p-6 lg:p-8 min-h-screen ${
        darkMode 
          ? 'bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-b from-blue-50 to-white'
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center space-x-3 mb-2">
          <div className={`p-2 rounded-lg ${
            darkMode 
              ? 'bg-gradient-to-br from-purple-600 to-indigo-700 shadow-lg shadow-purple-900/20' 
              : 'bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/20'
          }`}>
            <FiClock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              Riwayat Analisis
            </h1>
            <p className={`text-sm ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Lihat dan kelola riwayat analisis retina pasien
            </p>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mt-6"
      >
        <History />
      </motion.div>
    </motion.div>
  );
}

const HistoryPage = withPageTransition(HistoryPageComponent);
export default HistoryPage;