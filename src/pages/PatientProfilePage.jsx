import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';
import { withPageTransition } from '../context/ThemeContext';
import { useTheme } from '../context/ThemeContext';
import { 
  FaArrowLeft, FaUser, FaIdCard, FaCalendarAlt, FaMale, FaFemale, 
  FaPhone, FaMapMarkerAlt, FaTint, FaNotesMedical, FaAllergies, 
  FaCalendarCheck, FaPhoneVolume, FaSave, FaEdit, FaTrash,
  FaHistory, FaFileMedical, FaUserMd, FaClipboardList
} from 'react-icons/fa';

function PatientProfilePageComponent() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Mengambil data pasien
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await axios.get(`${API_URL}/api/patients/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setPatient(response.data);
        setError('');
      } catch (err) {
        console.error('Gagal memuat data pasien:', err);
        setError('Gagal memuat data pasien. Silakan coba lagi nanti.');
      } finally {
        setLoading(false);
      }
    };
    
    if (patientId) {
      fetchPatient();
    }
  }, [patientId]);

  const handleEditPatient = () => {
    navigate(`/edit-patient/${patientId}`);
  };

  const handleDeletePatient = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.delete(`${API_URL}/api/patients/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      toast.success('Data pasien berhasil dihapus');
      navigate('/patient-data');
    } catch (err) {
      console.error('Gagal menghapus pasien:', err);
      toast.error('Gagal menghapus data pasien');
      setShowDeleteModal(false);
    }
  };

  const handleViewHistory = () => {
    navigate(`/patient-history/${patientId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('id-ID', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }).format(date);
    } catch (error) {
      return dateString;
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return '-';
    try {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    } catch (error) {
      return '-';
    }
  };

  const getGenderLabel = (gender) => {
    switch (gender) {
      case 'male': return 'Laki-laki';
      case 'female': return 'Perempuan';
      default: return '-';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'P';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getGenderIcon = (gender) => {
    switch (gender) {
      case 'male': return <FaMale className="text-blue-500" />;
      case 'female': return <FaFemale className="text-pink-500" />;
      default: return <FaUser className="text-gray-500" />;
    }
  };

  const getGenderColor = (gender) => {
    switch (gender) {
      case 'male': return 'from-blue-400 to-blue-600';
      case 'female': return 'from-pink-400 to-pink-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  // Animation variants
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
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 12 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { type: 'spring', stiffness: 100, damping: 12 }
    },
    hover: {
      scale: 1.02,
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      transition: { duration: 0.2 }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-3"></div>
          <p className="text-gray-500">Memuat profil pasien...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        className="p-4 sm:p-6 lg:p-8"
      >
        <div className="bg-red-50 p-4 rounded-lg flex flex-col items-start">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/patient-data')}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <FaArrowLeft className="mr-2" />
            Kembali ke daftar pasien
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto"
      >
        {/* Header dengan tombol kembali */}
        <motion.div 
          variants={itemVariants}
          className="flex items-center justify-between mb-6"
        >
          <button
            onClick={() => navigate('/patient-data')}
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <FaArrowLeft className="mr-2" />
            <span>Kembali ke daftar pasien</span>
          </button>
        </motion.div>
        
        {/* Profil Header */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 border border-gray-100"
        >
          <div className="relative h-32 bg-gradient-to-r from-blue-500 to-indigo-600">
            <div className="absolute -bottom-16 left-8 flex items-end">
              <div className={`h-32 w-32 rounded-full bg-gradient-to-br ${getGenderColor(patient?.gender)} border-4 border-white shadow-md flex items-center justify-center text-white text-3xl font-bold`}>
                {getInitials(patient?.fullName || patient?.name)}
              </div>
            </div>
          </div>
          
          <div className="pt-20 pb-6 px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {patient?.fullName || patient?.name || 'Pasien'}
                </h1>
                <div className="flex items-center mt-2 text-gray-600">
                  {getGenderIcon(patient?.gender)}
                  <span className="ml-2">{getGenderLabel(patient?.gender)}</span>
                  <span className="mx-2">•</span>
                  <FaCalendarAlt className="mr-1" />
                  <span>{calculateAge(patient?.dateOfBirth)} tahun</span>
                  {patient?.bloodType && (
                    <>
                      <span className="mx-2">•</span>
                      <FaTint className="text-red-500 mr-1" />
                      <span>Gol. Darah {patient?.bloodType}</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="mt-4 sm:mt-0 flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEditPatient}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaEdit className="mr-2" />
                  Edit Profil
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <FaTrash className="mr-2" />
                  Hapus
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Grid Kartu Informasi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Informasi Pribadi */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
          >
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
              <h2 className="text-white text-lg font-bold flex items-center">
                <FaUser className="mr-2" />
                Informasi Pribadi
              </h2>
            </div>
            <div className="p-6">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <FaIdCard className="mt-1 mr-3 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Nama Lengkap</p>
                    <p className="font-medium">{patient?.fullName || patient?.name || '-'}</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <FaCalendarAlt className="mt-1 mr-3 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Tanggal Lahir</p>
                    <p className="font-medium">{formatDate(patient?.dateOfBirth)}</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="mt-1 mr-3 text-blue-500">
                    {getGenderIcon(patient?.gender)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Jenis Kelamin</p>
                    <p className="font-medium">{getGenderLabel(patient?.gender)}</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <FaTint className="mt-1 mr-3 text-red-500" />
                  <div>
                    <p className="text-sm text-gray-500">Golongan Darah</p>
                    <p className="font-medium">{patient?.bloodType || '-'}</p>
                  </div>
                </li>
              </ul>
            </div>
          </motion.div>
          
          {/* Informasi Kontak */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
          >
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
              <h2 className="text-white text-lg font-bold flex items-center">
                <FaPhone className="mr-2" />
                Informasi Kontak
              </h2>
            </div>
            <div className="p-6">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <FaPhone className="mt-1 mr-3 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">Nomor Telepon</p>
                    <p className="font-medium">{patient?.phone || '-'}</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <FaMapMarkerAlt className="mt-1 mr-3 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">Alamat</p>
                    <p className="font-medium">{patient?.address || '-'}</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <FaPhoneVolume className="mt-1 mr-3 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">Kontak Darurat</p>
                    <p className="font-medium">{patient?.emergencyContact || '-'}</p>
                  </div>
                </li>
              </ul>
            </div>
          </motion.div>
          
          {/* Informasi Medis */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 md:col-span-2"
          >
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
              <h2 className="text-white text-lg font-bold flex items-center">
                <FaNotesMedical className="mr-2" />
                Informasi Medis
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-gray-700 font-medium mb-2 flex items-center">
                    <FaFileMedical className="mr-2 text-purple-500" />
                    Riwayat Medis
                  </h3>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg min-h-[100px]">
                    {patient?.medicalHistory || 'Tidak ada riwayat medis yang tercatat.'}
                  </p>
                </div>
                <div>
                  <h3 className="text-gray-700 font-medium mb-2 flex items-center">
                    <FaAllergies className="mr-2 text-purple-500" />
                    Alergi
                  </h3>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg min-h-[100px]">
                    {patient?.allergies || 'Tidak ada alergi yang tercatat.'}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-start">
                  <FaCalendarCheck className="mt-1 mr-3 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-500">Pemeriksaan Terakhir</p>
                    <p className="font-medium">{formatDate(patient?.lastCheckup) || 'Belum pernah melakukan pemeriksaan'}</p>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleViewHistory}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <FaHistory className="mr-2" />
                  Lihat Riwayat Pemeriksaan
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Tombol Aksi Tambahan */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row justify-center gap-4 mt-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/scan-retina')}
            className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <FaEye className="mr-2" />
            Lakukan Scan Retina
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/patient-data')}
            className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <FaArrowLeft className="mr-2" />
            Kembali ke Daftar Pasien
          </motion.button>
        </motion.div>
      </motion.div>
      
      {/* Modal Konfirmasi Hapus */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-3">Konfirmasi Hapus</h3>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus data pasien <span className="font-semibold">{patient?.fullName || patient?.name}</span>? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeletePatient}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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

const PatientProfilePage = withPageTransition(PatientProfilePageComponent);
export default PatientProfilePage; 