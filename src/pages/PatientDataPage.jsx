import { useState, useEffect } from 'react';
import { FaPlus, FaUserFriends, FaUserCheck, FaUserClock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import PatientTable from '../components/dashboard/PatientTable';
import { withPageTransition } from '../context/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';
import CountUp from 'react-countup';

function PatientDataPageComponent() {
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
  const [stats, setStats] = useState({
    totalPatients: 0,
    newPatientsThisMonth: 0,
    activePatientsThisMonth: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatientStats();
  }, [refreshTrigger]);

  const fetchPatientStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const response = await axios.get(`${API_URL}/api/patients/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setStats({
        totalPatients: response.data.totalPatients || 0,
        newPatientsThisMonth: response.data.newPatientsThisMonth || 0,
        activePatientsThisMonth: response.data.activePatientsThisMonth || 0
      });
    } catch (err) {
      console.error('Gagal memuat statistik pasien:', err);
      // Fallback to mock data if API fails
      setStats({
        totalPatients: 120,
        newPatientsThisMonth: 8,
        activePatientsThisMonth: 45
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = () => {
    navigate('/add-patient');
  };

  const handleDeletePatient = (patientId) => {
    setConfirmDelete(patientId);
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
      document.body.style.overflow = 'auto';
    } catch (err) {
      console.error('Gagal menghapus pasien:', err);
      toast.error('Gagal menghapus data pasien');
    }
  };

  const handleCloseModal = () => {
    setConfirmDelete(null);
    document.body.style.overflow = 'auto';
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 30, 
        duration: 0.4
      }
    },
    exit: { 
      opacity: 0, 
      y: 20, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
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
        stiffness: 400,
        damping: 30
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header with Stats */}
        <motion.div 
          variants={itemVariants}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Data Pasien</h1>
              <p className="text-gray-500 mt-1">Kelola data pasien klinik</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleAddPatient}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-xl hover:shadow-lg transition-all focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              <FaPlus size={14} />
              <span>Tambah Pasien</span>
            </motion.button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div 
              variants={itemVariants}
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-5 text-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-80">Total Pasien</p>
                  <h3 className="text-3xl font-bold mt-1">
                    <CountUp end={stats.totalPatients} duration={2} />
                  </h3>
                </div>
                <div className="bg-white/20 p-3 rounded-xl">
                  <FaUserFriends className="h-6 w-6" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-5 text-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-80">Pasien Baru Bulan Ini</p>
                  <h3 className="text-3xl font-bold mt-1">
                    <CountUp end={stats.newPatientsThisMonth} duration={2} />
                  </h3>
                </div>
                <div className="bg-white/20 p-3 rounded-xl">
                  <FaUserCheck className="h-6 w-6" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-5 text-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-80">Pasien Aktif Bulan Ini</p>
                  <h3 className="text-3xl font-bold mt-1">
                    <CountUp end={stats.activePatientsThisMonth} duration={2} />
                  </h3>
                </div>
                <div className="bg-white/20 p-3 rounded-xl">
                  <FaUserClock className="h-6 w-6" />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* View Toggle and Table/Card View */}
        <motion.div variants={itemVariants}>
          <div className="flex justify-end mb-4">
            <div className="bg-gray-100 p-1 rounded-lg flex">
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'table' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                Tabel
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'card' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                Kartu
              </button>
            </div>
          </div>

          <PatientTable 
            onDelete={handleDeletePatient}
            refreshTrigger={refreshTrigger}
            viewMode={viewMode}
          />
        </motion.div>
      </motion.div>

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
              className="bg-white p-6 rounded-2xl shadow-2xl w-[90%] max-w-md mx-4"
              variants={modalVariants}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-50">
                <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Konfirmasi Hapus</h3>
              <p className="mb-6 text-gray-600 text-center">Apakah Anda yakin ingin menghapus data pasien ini? Tindakan ini tidak dapat dibatalkan.</p>
              <div className="flex justify-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-gray-200 focus:outline-none"
                >
                  Batal
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={confirmDeletePatient}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all focus:ring-2 focus:ring-red-400 focus:outline-none"
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