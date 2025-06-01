import { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import PatientTable from '../components/dashboard/PatientTable';
import { withPageTransition } from '../context/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

function PatientDataPageComponent() {
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const { theme, isDarkMode } = useTheme();

  // Get theme-specific colors
  const currentTheme = isDarkMode ? theme.dark : theme.light;

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
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30, 
        duration: 0.3
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      y: 20,
      transition: { duration: 0.2 }
    }
  };

  // Glassmorphism style based on theme
  const glassEffect = isDarkMode ? theme.dark.glassEffect : theme.light.glassEffect;

  return (
    <div className={`p-4 sm:p-6 lg:p-8 ${isDarkMode ? 'dark' : ''}`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex justify-between items-center mb-6"
      >
        <motion.h2 
          className="text-xl sm:text-2xl font-semibold"
          style={{ 
            background: isDarkMode 
              ? currentTheme.coolGradient 
              : currentTheme.primaryGradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Data Pasien
        </motion.h2>
        <motion.button
          onClick={handleAddPatient}
          whileHover={theme.animations.smoothHover}
          whileTap={theme.animations.smoothTap}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg focus:outline-none"
          style={{ 
            background: isDarkMode 
              ? currentTheme.primaryGradient 
              : currentTheme.primaryGradient,
            color: 'white',
            boxShadow: isDarkMode 
              ? currentTheme.smallShadow
              : currentTheme.smallShadow,
            willChange: 'transform'
          }}
        >
          <FaPlus size={14} />
          <span>Tambah Pasien</span>
        </motion.button>
      </motion.div>

      <PatientTable 
        onDelete={handleDeletePatient}
        refreshTrigger={refreshTrigger}
      />

      {/* Modal Konfirmasi Hapus dengan Animasi */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={backdropVariants}
            onClick={handleOverlayClick}
            style={{
              backdropFilter: 'blur(5px)',
              backgroundColor: isDarkMode 
                ? 'rgba(0, 0, 0, 0.7)' 
                : 'rgba(0, 0, 0, 0.5)'
            }}
          >
            <motion.div 
              className="p-6 rounded-xl w-[90%] max-w-sm mx-4"
              variants={modalVariants}
              onClick={(e) => e.stopPropagation()}
              style={{
                ...glassEffect,
                boxShadow: isDarkMode 
                  ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
                  : '0 8px 32px rgba(0, 0, 0, 0.1)',
                color: isDarkMode ? currentTheme.text : 'inherit',
                backgroundColor: isDarkMode 
                  ? 'rgba(31, 41, 55, 0.8)' 
                  : 'rgba(255, 255, 255, 0.8)',
              }}
            >
              <h3 className="text-base sm:text-lg font-semibold mb-3 border-b pb-2"
                  style={{ 
                    borderColor: isDarkMode 
                      ? 'rgba(255, 255, 255, 0.1)' 
                      : 'rgba(0, 0, 0, 0.1)' 
                  }}>
                Konfirmasi Hapus
              </h3>
              <p className="mb-5" style={{ 
                color: isDarkMode 
                  ? currentTheme.textSecondary 
                  : 'rgba(75, 85, 99, 1)'
              }}>
                Apakah Anda yakin ingin menghapus data pasien ini? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex justify-end space-x-3">
                <motion.button
                  onClick={handleCloseModal}
                  whileHover={theme.animations.smoothHover}
                  whileTap={theme.animations.smoothTap}
                  className="px-3 py-2 rounded-lg"
                  style={{
                    border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                    backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(243, 244, 246, 0.7)',
                    color: isDarkMode ? currentTheme.textSecondary : 'inherit',
                  }}
                >
                  Batal
                </motion.button>
                <motion.button
                  onClick={confirmDeletePatient}
                  whileHover={theme.animations.smoothHover}
                  whileTap={theme.animations.smoothTap}
                  className="px-3 py-2 rounded-lg text-white"
                  style={{
                    background: theme.dangerGradient,
                    boxShadow: isDarkMode 
                      ? '0 4px 12px rgba(239, 68, 68, 0.3)' 
                      : '0 4px 12px rgba(239, 68, 68, 0.2)',
                  }}
                >
                  Hapus
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const PatientDataPage = withPageTransition(PatientDataPageComponent);
export default PatientDataPage; 