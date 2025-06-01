import { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import PatientTable from '../components/dashboard/PatientTable';
import { withPageTransition, useTheme } from '../context/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';

function PatientDataPageComponent() {
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const { theme, isDarkMode } = useTheme();

  const handleAddPatient = () => {
    navigate('/add-patient');
  };

  const handleDeletePatient = (patientId) => {
    setConfirmDelete(patientId);
    // Nonaktifkan scrolling pada body saat modal terbuka
    document.body.style.overflow = 'hidden';
  };

  const confirmDeletePatient = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.delete(`${API_URL}/api/patients/${confirmDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      toast.success('Data pasien berhasil dihapus');
      setRefreshTrigger(prev => prev + 1);
      setConfirmDelete(null);
      // Aktifkan kembali scrolling pada body
      document.body.style.overflow = 'auto';
    } catch (err) {
      console.error('Gagal menghapus pasien:', err);
      toast.error('Gagal menghapus data pasien');
    }
  };

  // Handler untuk menutup modal
  const handleCloseModal = () => {
    setConfirmDelete(null);
    // Aktifkan kembali scrolling pada body
    document.body.style.overflow = 'auto';
  };

  // Handler untuk menutup modal jika overlay diklik
  const handleOverlayClick = (e) => {
    // Hanya menutup jika overlay yang diklik, bukan konten modal
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  // Variasi animasi untuk backdrop
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  // Variasi animasi untuk modal konfirmasi
  const modalVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30, 
        duration: 0.3
      }
    },
    exit: { 
      opacity: 0, 
      y: 20, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  // Animasi untuk tombol
  const buttonVariants = {
    hover: { 
      scale: 1.05,
      boxShadow: `0 10px 15px -3px ${theme.primary}40, 0 4px 6px -2px ${theme.primary}30`,
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.95 }
  };

  // Animasi untuk container
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
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  return (
    <motion.div 
      className={`p-4 sm:p-6 lg:p-8 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="flex justify-between items-center mb-6"
        variants={itemVariants}
      >
        <h2 className="text-xl sm:text-2xl font-semibold">Data Pasien</h2>
        <motion.button
          onClick={handleAddPatient}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isDarkMode 
              ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 focus:ring-offset-gray-900' 
              : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-400 focus:ring-offset-white'
          }`}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          style={{
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
            boxShadow: `0 4px 6px -1px ${theme.primary}30, 0 2px 4px -1px ${theme.primary}20`
          }}
        >
          <FaPlus size={14} />
          <span>Tambah Pasien</span>
        </motion.button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <PatientTable 
          onDelete={handleDeletePatient}
          refreshTrigger={refreshTrigger}
        />
      </motion.div>

      {/* Modal Konfirmasi Hapus dengan Animasi */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={backdropVariants}
            onClick={handleOverlayClick}
          >
            <motion.div 
              className={`p-6 rounded-xl shadow-2xl w-[90%] max-w-sm mx-4 ${
                isDarkMode 
                  ? 'bg-gray-800 border border-gray-700' 
                  : 'bg-white border border-gray-100'
              }`}
              variants={modalVariants}
              onClick={(e) => e.stopPropagation()}
              style={{
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: isDarkMode 
                  ? '0 25px 50px -12px rgba(0, 0, 0, 0.4)' 
                  : '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
            >
              <h3 className={`text-lg font-semibold mb-3 border-b pb-2 ${
                isDarkMode ? 'border-gray-700 text-gray-100' : 'border-gray-200 text-gray-800'
              }`}>Konfirmasi Hapus</h3>
              
              <p className={`mb-5 text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Apakah Anda yakin ingin menghapus data pasien ini? Tindakan ini tidak dapat dibatalkan.</p>
              
              <div className="flex justify-end space-x-3">
                <motion.button
                  onClick={handleCloseModal}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 text-sm ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                  }`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Batal
                </motion.button>
                
                <motion.button
                  onClick={confirmDeletePatient}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 text-sm"
                  whileHover={{ 
                    scale: 1.03,
                    boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.3), 0 4px 6px -2px rgba(239, 68, 68, 0.2)'
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  Hapus
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const PatientDataPage = withPageTransition(PatientDataPageComponent);
export default PatientDataPage; 