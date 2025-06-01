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
    visible: { opacity: 1, transition: { duration: 0.3 } },
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
        stiffness: 400, 
        damping: 25, 
        duration: 0.4
      }
    },
    exit: { 
      opacity: 0, 
      y: 20, 
      scale: 0.95,
      transition: { duration: 0.3 }
    }
  };

  // Animasi untuk container dan elemen-elemen
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2,
        duration: 0.5
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
        stiffness: 400,
        damping: 25
      }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 sm:p-6 lg:p-8"
    >
      <motion.div 
        variants={itemVariants}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Data Pasien</h2>
          <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"></div>
        </div>
        <motion.button
          variants={itemVariants}
          whileHover={{ 
            scale: 1.05, 
            boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3), 0 4px 6px -4px rgba(59, 130, 246, 0.3)'
          }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddPatient}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 sm:px-5 py-2.5 rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        >
          <FaUserPlus size={16} />
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
            className="fixed inset-0 bg-black/70 z-50 backdrop-blur-md flex items-center justify-center"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={backdropVariants}
            onClick={handleOverlayClick}
          >
            <motion.div 
              className="bg-white p-6 rounded-2xl shadow-2xl w-[90%] max-w-sm mx-4 border border-gray-100"
              variants={modalVariants}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
            >
              <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-800 border-b pb-3">Konfirmasi Hapus</h3>
              <p className="mb-6 text-gray-600">Apakah Anda yakin ingin menghapus data pasien ini? Tindakan ini tidak dapat dibatalkan.</p>
              <div className="flex justify-end space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-gray-200 focus:outline-none font-medium"
                >
                  Batal
                </motion.button>
                <motion.button
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.3), 0 4px 6px -4px rgba(239, 68, 68, 0.3)'
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={confirmDeletePatient}
                  className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl shadow-lg hover:from-red-700 hover:to-red-600 transition-all duration-300 focus:ring-2 focus:ring-red-400 focus:outline-none font-medium"
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