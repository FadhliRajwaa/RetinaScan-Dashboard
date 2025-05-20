import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  FaTimes, FaUser, FaIdCard, FaCalendarAlt, FaMale, FaFemale, 
  FaPhone, FaMapMarkerAlt, FaTint, FaNotesMedical, FaAllergies, 
  FaCalendarCheck, FaPhoneVolume, FaArrowRight, FaArrowLeft, FaSave
} from 'react-icons/fa';

const AddPatientForm = ({ onClose, onSuccess }) => {
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

  // Memungkinkan pengubahan umur secara manual
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
      await axios.post('http://localhost:5000/api/patients', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLoading(false);
      onSuccess();
      onClose();
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
    }
  };

  const prevStep = () => {
    setFormStep(1);
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden rounded-xl w-full max-w-4xl mx-auto"
    >
      {/* Header dengan gradient dan glassmorphism effect */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 p-4 text-white shadow-lg">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
        <div className="relative flex justify-between items-center">
          <h3 className="text-lg md:text-xl font-semibold flex items-center">
            <FaUser className="mr-2" />
            {formStep === 1 ? 'Data Pasien Baru' : 'Informasi Tambahan Pasien'}
          </h3>
          <button 
            onClick={onClose}
            className="text-white hover:bg-white/30 p-2 rounded-full transition-all duration-200"
            aria-label="Tutup"
          >
            <FaTimes size={18} />
          </button>
        </div>
      </div>

      {error && (
        <div className="m-4 bg-red-50 text-red-600 p-3 rounded-md border-l-4 border-red-500 flex items-start text-sm">
          <div className="mr-3 mt-0.5">⚠️</div>
          <div>{error}</div>
        </div>
      )}

      {/* Step indicators dengan animasi */}
      <div className="px-4 pt-4">
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

      <form onSubmit={handleSubmit} className="p-4 space-y-5">
        <AnimatePresence mode="wait" custom={formStep}>
          {formStep === 1 && (
            <motion.div 
              key="step1"
              custom={1}
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-5"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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
                    {formData.gender === 'male' ? (
                      <FaMale className="mr-1.5 text-blue-500" />
                    ) : formData.gender === 'female' ? (
                      <FaFemale className="mr-1.5 text-pink-500" />
                    ) : (
                      <span className="text-blue-500 mr-1.5">👤</span>
                    )}
                    Jenis Kelamin <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      type="button"
                      onClick={() => setFormData({...formData, gender: 'male'})}
                      className={`relative p-3 border rounded-lg flex items-center justify-center transition-all overflow-hidden ${
                        formData.gender === 'male' 
                          ? 'border-blue-500 text-blue-700 font-medium' 
                          : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                      }`}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {formData.gender === 'male' && (
                        <motion.div
                          className="absolute inset-0 bg-blue-50"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          layoutId="genderBg"
                        />
                      )}
                      <span className="relative z-10 flex items-center text-base">
                        <FaMale className={`mr-2 ${formData.gender === 'male' ? 'text-blue-500' : 'text-gray-500'}`} /> 
                        Laki-laki
                      </span>
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => setFormData({...formData, gender: 'female'})}
                      className={`relative p-3 border rounded-lg flex items-center justify-center transition-all overflow-hidden ${
                        formData.gender === 'female' 
                          ? 'border-pink-500 text-pink-700 font-medium' 
                          : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                      }`}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {formData.gender === 'female' && (
                        <motion.div
                          className="absolute inset-0 bg-pink-50"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          layoutId="genderBg"
                        />
                      )}
                      <span className="relative z-10 flex items-center text-base">
                        <FaFemale className={`mr-2 ${formData.gender === 'female' ? 'text-pink-500' : 'text-gray-500'}`} /> 
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

              <div className="flex justify-end pt-4">
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
              className="space-y-5"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
                    <FaNotesMedical className="mr-1.5 text-blue-500" />
                    Riwayat Penyakit
                  </label>
                  <textarea
                    name="medicalHistory"
                    value={formData.medicalHistory}
                    onChange={handleChange}
                    rows={3}
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
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
                    placeholder="Alergi yang dimiliki pasien"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between pt-4 border-t mt-5 gap-4">
                <motion.button
                  type="button"
                  onClick={prevStep}
                  className="px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-base font-medium flex items-center justify-center w-full sm:w-auto"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaArrowLeft className="mr-2" />
                  Kembali
                </motion.button>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <motion.button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-base font-medium w-full sm:w-auto"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Batal
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium flex items-center justify-center w-full sm:w-auto"
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
};

export default AddPatientForm; 