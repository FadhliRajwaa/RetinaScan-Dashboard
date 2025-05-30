import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaUser, FaIdCard, FaCalendarAlt, FaMale, FaFemale, 
  FaPhone, FaMapMarkerAlt, FaTint, FaNotesMedical, FaAllergies, 
  FaCalendarCheck, FaPhoneVolume, FaArrowRight, FaArrowLeft, 
  FaSave, FaChevronRight, FaHome, FaUserPlus
} from 'react-icons/fa';

const AddPatientPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    fullName: '',
    dateOfBirth: '',
    age: '',
    gender: '',
    phone: '',
    address: '',
    bloodType: '',
    medicalHistory: '',
    allergies: '',
    lastCheckup: '',
    emergencyContact: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formStep, setFormStep] = useState(1); // Step 1: Info Dasar, Step 2: Info Tambahan

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Hitung umur otomatis saat tanggal lahir berubah
    if (name === 'dateOfBirth' && value) {
      const birthDate = new Date(value);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      
      // Koreksi umur jika belum ulang tahun
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      
      setFormData(prev => ({ ...prev, age: calculatedAge.toString() }));
    }
  };

  const handleAgeChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, age: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.post(`${API_URL}/api/patients`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLoading(false);
      setSuccess(true);
      
      // Show success message then redirect
      setTimeout(() => {
        navigate('/patient-data');
      }, 1500);
    } catch (err) {
      console.error('Gagal menambahkan pasien:', err);
      setError('Gagal menambahkan pasien. Silakan coba lagi.');
      setLoading(false);
    }
  };

  // Cek apakah semua field wajib di step 1 sudah terisi
  const step1Complete = () => {
    return formData.name && formData.fullName && formData.dateOfBirth && formData.gender && formData.phone && formData.address;
  };

  // Navigasi antar steps
  const nextStep = () => {
    if (step1Complete()) {
      setFormStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setFormStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Variasi animasi untuk konten form
  const formVariants = {
    hidden: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.3
      }
    },
    exit: (direction) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0,
      transition: { duration: 0.2 }
    })
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 py-12 shadow-lg">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3 text-white">
            <FaUserPlus className="text-3xl sm:text-4xl" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Tambah Pasien Baru</h1>
          </div>
          <p className="mt-2 text-blue-100 max-w-3xl">
            Lengkapi informasi pasien untuk memulai proses pendaftaran. Data yang lengkap membantu kami memberikan perawatan terbaik.
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link to="/" className="text-gray-500 hover:text-gray-700 flex items-center">
                <FaHome className="h-4 w-4 mr-1" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li className="flex items-center">
              <FaChevronRight className="h-3 w-3 text-gray-400" />
              <Link to="/patient-data" className="ml-2 text-gray-500 hover:text-gray-700">
                Data Pasien
              </Link>
            </li>
            <li className="flex items-center">
              <FaChevronRight className="h-3 w-3 text-gray-400" />
              <span className="ml-2 text-blue-600 font-medium">Tambah Pasien Baru</span>
            </li>
          </ol>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {success ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 p-6 rounded-lg shadow-md mb-8 text-center"
          >
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-green-800 mb-2">Data Pasien Berhasil Disimpan!</h2>
            <p className="text-green-700 mb-4">Pasien baru telah berhasil didaftarkan dalam sistem.</p>
            <p className="text-sm text-green-600">Mengarahkan kembali ke daftar pasien...</p>
          </motion.div>
        ) : (
          <>
            {error && (
              <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-md border-l-4 border-red-500 flex items-start text-sm">
                <div className="mr-3 mt-0.5">⚠️</div>
                <div>{error}</div>
              </div>
            )}

            {/* Step indicators */}
            <div className="mb-8">
              <div className="flex mb-5 relative">
                {/* Progress bar di background */}
                <div className="absolute top-[15px] left-0 h-1 bg-gray-200 w-full rounded-full"></div>
                <div 
                  className="absolute top-[15px] left-0 h-1 bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: formStep === 1 ? '50%' : '100%' }}
                ></div>

                {/* Step 1 */}
                <div className="flex-1 z-10">
                  <div className="flex flex-col items-center">
                    <div 
                      className={`rounded-full w-8 h-8 flex items-center justify-center mb-2 transition-all duration-300 ${
                        formStep >= 1 
                          ? 'bg-blue-500 text-white shadow-md shadow-blue-200' 
                          : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      1
                    </div>
                    <span className={`text-sm font-medium transition-colors duration-300 ${
                      formStep >= 1 ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      Data Utama
                    </span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex-1 z-10">
                  <div className="flex flex-col items-center">
                    <div 
                      className={`rounded-full w-8 h-8 flex items-center justify-center mb-2 transition-all duration-300 ${
                        formStep >= 2 
                          ? 'bg-blue-500 text-white shadow-md shadow-blue-200' 
                          : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      2
                    </div>
                    <span className={`text-sm font-medium transition-colors duration-300 ${
                      formStep >= 2 ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      Informasi Tambahan
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card container for form */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <AnimatePresence mode="wait" custom={formStep}>
                  {formStep === 1 && (
                    <motion.div 
                      key="step1"
                      custom={1}
                      variants={formVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
                            <FaIdCard className="mr-1.5 text-blue-500" />
                            Nama (untuk Identifikasi) <span className="text-red-500 ml-1">*</span>
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
                            placeholder="Masukkan nama pasien"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
                            <FaUser className="mr-1.5 text-blue-500" />
                            Nama Lengkap <span className="text-red-500 ml-1">*</span>
                          </label>
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
                            placeholder="Masukkan nama lengkap pasien"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
                            <FaCalendarAlt className="mr-1.5 text-blue-500" />
                            Tanggal Lahir <span className="text-red-500 ml-1">*</span>
                          </label>
                          <input
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
                            <span className="text-blue-500 mr-1.5">🧓</span>
                            Umur
                          </label>
                          <div className="flex">
                            <input
                              type="number"
                              name="age"
                              value={formData.age}
                              onChange={handleAgeChange}
                              className="w-full p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
                              placeholder="Umur pasien"
                            />
                            <span className="inline-flex items-center px-4 bg-gray-100 text-gray-600 border border-l-0 border-gray-300 rounded-r-lg text-base">
                              tahun
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 italic">*Terisi otomatis dari tanggal lahir</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
                            {formData.gender === 'Laki-laki' ? (
                              <FaMale className="mr-1.5 text-blue-500" />
                            ) : formData.gender === 'Perempuan' ? (
                              <FaFemale className="mr-1.5 text-pink-500" />
                            ) : (
                              <span className="text-blue-500 mr-1.5">👤</span>
                            )}
                            Jenis Kelamin <span className="text-red-500 ml-1">*</span>
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <motion.button
                              type="button"
                              onClick={() => setFormData({...formData, gender: 'Laki-laki'})}
                              className={`relative p-3 border rounded-lg flex items-center justify-center transition-all overflow-hidden ${
                                formData.gender === 'Laki-laki' 
                                  ? 'border-blue-500 text-blue-700 font-medium' 
                                  : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                              }`}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {formData.gender === 'Laki-laki' && (
                                <motion.div
                                  className="absolute inset-0 bg-blue-50"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  layoutId="genderBg"
                                />
                              )}
                              <span className="relative z-10 flex items-center text-base">
                                <FaMale className={`mr-2 ${formData.gender === 'Laki-laki' ? 'text-blue-500' : 'text-gray-500'}`} /> 
                                Laki-laki
                              </span>
                            </motion.button>
                            <motion.button
                              type="button"
                              onClick={() => setFormData({...formData, gender: 'Perempuan'})}
                              className={`relative p-3 border rounded-lg flex items-center justify-center transition-all overflow-hidden ${
                                formData.gender === 'Perempuan' 
                                  ? 'border-pink-500 text-pink-700 font-medium' 
                                  : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                              }`}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {formData.gender === 'Perempuan' && (
                                <motion.div
                                  className="absolute inset-0 bg-pink-50"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  layoutId="genderBg"
                                />
                              )}
                              <span className="relative z-10 flex items-center text-base">
                                <FaFemale className={`mr-2 ${formData.gender === 'Perempuan' ? 'text-pink-500' : 'text-gray-500'}`} /> 
                                Perempuan
                              </span>
                            </motion.button>
                          </div>
                          <input 
                            type="hidden" 
                            name="gender" 
                            value={formData.gender} 
                            required 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
                            <FaPhone className="mr-1.5 text-blue-500" />
                            Nomor Telepon <span className="text-red-500 ml-1">*</span>
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
                            placeholder="Masukkan nomor telepon"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
                            <FaTint className="mr-1.5 text-red-500" />
                            Golongan Darah
                          </label>
                          <select
                            name="bloodType"
                            value={formData.bloodType}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
                          >
                            <option value="">Pilih golongan darah</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
                          <FaMapMarkerAlt className="mr-1.5 text-blue-500" />
                          Alamat <span className="text-red-500 ml-1">*</span>
                        </label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          rows={2}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
                          placeholder="Masukkan alamat lengkap"
                          required
                        />
                      </div>

                      <div className="flex justify-between pt-6">
                        <Link
                          to="/patient-data"
                          className="px-5 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-base font-medium flex items-center"
                        >
                          <FaArrowLeft className="mr-2" />
                          Kembali
                        </Link>
                        
                        <motion.button
                          type="button"
                          onClick={nextStep}
                          disabled={!step1Complete()}
                          className={`px-6 py-3 text-white rounded-lg text-base font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center ${
                            step1Complete() 
                              ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' 
                              : 'bg-gray-400 cursor-not-allowed'
                          }`}
                          whileHover={step1Complete() ? { scale: 1.03 } : {}}
                          whileTap={step1Complete() ? { scale: 0.98 } : {}}
                        >
                          <span>Selanjutnya</span>
                          <FaArrowRight className="ml-2" />
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {formStep === 2 && (
                    <motion.div 
                      key="step2"
                      custom={-1}
                      variants={formVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
                            <FaCalendarCheck className="mr-1.5 text-blue-500" />
                            Tanggal Pemeriksaan Terakhir
                          </label>
                          <input
                            type="date"
                            name="lastCheckup"
                            value={formData.lastCheckup}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
                            <FaPhoneVolume className="mr-1.5 text-blue-500" />
                            Kontak Darurat
                          </label>
                          <input
                            type="text"
                            name="emergencyContact"
                            value={formData.emergencyContact}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
                            placeholder="Nomor telepon/kontak darurat"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
                            <FaNotesMedical className="mr-1.5 text-blue-500" />
                            Riwayat Penyakit
                          </label>
                          <textarea
                            name="medicalHistory"
                            value={formData.medicalHistory}
                            onChange={handleChange}
                            rows={4}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
                            placeholder="Riwayat penyakit yang pernah diderita"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
                            <FaAllergies className="mr-1.5 text-blue-500" />
                            Alergi
                          </label>
                          <textarea
                            name="allergies"
                            value={formData.allergies}
                            onChange={handleChange}
                            rows={4}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
                            placeholder="Alergi yang dimiliki pasien"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between pt-6">
                        <motion.button
                          type="button"
                          onClick={prevStep}
                          className="px-5 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-base font-medium flex items-center"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <FaArrowLeft className="mr-2" />
                          Kembali
                        </motion.button>
                        <motion.button
                          type="submit"
                          disabled={loading}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium flex items-center"
                          whileHover={!loading ? { scale: 1.03 } : {}}
                          whileTap={!loading ? { scale: 0.98 } : {}}
                        >
                          {loading ? 'Menyimpan...' : (
                            <>
                              <FaSave className="mr-2" />
                              Simpan Pasien
                            </>
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default AddPatientPage; 