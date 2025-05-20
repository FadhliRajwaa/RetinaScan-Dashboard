import { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
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
      await axios.delete(`http://localhost:5000/api/patients/${confirmDelete}`, {
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

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold">Data Pasien</h2>
        <button
          onClick={handleAddPatient}
          className="flex items-center gap-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-400 focus:outline-none"
        >
          <FaPlus size={14} />
          <span>Tambah Pasien</span>
        </button>
      </div>

      <PatientTable 
        onDelete={handleDeletePatient}
        refreshTrigger={refreshTrigger}
      />

      {/* Modal Konfirmasi Hapus dengan Animasi */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div 
            className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm flex items-center justify-center"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={backdropVariants}
            onClick={handleOverlayClick}
          >
            <motion.div 
              className="bg-white p-4 rounded-xl shadow-2xl w-[90%] max-w-sm mx-4"
              variants={modalVariants}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-base sm:text-lg font-semibold mb-3 border-b pb-2">Konfirmasi Hapus</h3>
              <p className="mb-5 text-gray-600 text-sm">Apakah Anda yakin ingin menghapus data pasien ini? Tindakan ini tidak dapat dibatalkan.</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCloseModal}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-gray-200 focus:outline-none text-sm"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDeletePatient}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:ring-2 focus:ring-red-400 focus:outline-none text-sm"
                >
                  Hapus
                </button>
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