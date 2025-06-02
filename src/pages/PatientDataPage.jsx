import { useState } from 'react';
import { FaPlus, FaUserPlus, FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import PatientTable from '../components/dashboard/PatientTable';
import { withPageTransition } from '../context/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';

function PatientDataPageComponent() {
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(null);

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

  // Animasi untuk elemen halaman
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };

  // Glassmorphism style
  const glassmorphismStyle = {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.18)'
  };

  return (
    <motion.div 
      className="p-4 sm:p-6 lg:p-8"
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      <motion.div 
        variants={itemVariants}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <motion.h2 
            className="text-2xl sm:text-3xl font-bold text-gray-800"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            Data Pasien
          </motion.h2>
          <motion.p 
            className="text-gray-500 mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Kelola data pasien dengan mudah dan efisien
          </motion.p>
        </div>
        <motion.button
          onClick={handleAddPatient}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 sm:px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all"
          whileHover={{ scale: 1.05, boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)' }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <FaUserPlus size={16} className="animate-pulse" />
          <span className="font-medium">Tambah Pasien</span>
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
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm flex items-center justify-center"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={backdropVariants}
            onClick={handleOverlayClick}
          >
            <motion.div 
              className="p-6 rounded-2xl w-[90%] max-w-sm mx-4"
              variants={modalVariants}
              onClick={(e) => e.stopPropagation()}
              style={glassmorphismStyle}
            >
              <div className="flex items-center mb-4">
                <div className="bg-red-100 p-2 rounded-full mr-3">
                  <FaExclamationTriangle className="text-red-500 text-lg" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Konfirmasi Hapus</h3>
              </div>
              
              <p className="mb-6 text-gray-600">
                Apakah Anda yakin ingin menghapus data pasien ini? Tindakan ini tidak dapat dibatalkan.
              </p>
              
              <div className="flex justify-end space-x-3">
                <motion.button
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors focus:outline-none text-gray-700 font-medium"
                  whileHover={{ scale: 1.03, backgroundColor: 'rgba(243, 244, 246, 1)' }}
                  whileTap={{ scale: 0.97 }}
                >
                  Batal
                </motion.button>
                <motion.button
                  onClick={confirmDeletePatient}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl shadow-md hover:shadow-lg transition-all focus:outline-none font-medium"
                  whileHover={{ scale: 1.03, boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.3)' }}
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