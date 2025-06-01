import { useState } from 'react';
import { FaPlus, FaUserPlus } from 'react-icons/fa';
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

  // Animasi untuk container utama
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

  // Animasi untuk item individual
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }
  };

  return (
    <motion.div 
      className="p-4 sm:p-6 lg:p-8 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        variants={itemVariants}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"
      >
        <div>
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">Data Pasien</h2>
          <p className="text-gray-500 mt-1">Kelola informasi dan riwayat pasien</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddPatient}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-500 text-white px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform"
        >
          <FaUserPlus className="text-white" size={16} />
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
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm flex items-center justify-center"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={backdropVariants}
            onClick={handleOverlayClick}
          >
            <motion.div 
              className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl w-[90%] max-w-md mx-4 border border-white/20"
              variants={modalVariants}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center mb-4 text-red-600">
                <svg className="w-8 h-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <h3 className="text-lg font-semibold">Konfirmasi Hapus</h3>
              </div>
              <p className="mb-6 text-gray-600">Apakah Anda yakin ingin menghapus data pasien ini? Tindakan ini tidak dapat dibatalkan.</p>
              <div className="flex justify-end space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-gray-200 focus:outline-none"
                >
                  Batal
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={confirmDeletePatient}
                  className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:shadow-lg transition-all focus:ring-2 focus:ring-red-400 focus:outline-none"
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