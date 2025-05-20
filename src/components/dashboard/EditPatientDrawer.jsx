import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { 
  FaTimes, FaUser, FaIdCard, FaCalendarAlt, FaMale, FaFemale, 
  FaPhone, FaMapMarkerAlt, FaTint, FaNotesMedical, FaAllergies, 
  FaCalendarCheck, FaPhoneVolume, FaSave, FaEdit
} from 'react-icons/fa';

const EditPatientDrawer = ({ patient, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
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
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close drawer with Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Mengisi form data saat komponen di-mount atau patient berubah
  useEffect(() => {
    if (patient) {
      setFormData({
        fullName: patient.fullName || '',
        dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : '',
        age: patient.age ? patient.age.toString() : '',
        gender: patient.gender || '',
        phone: patient.phone || '',
        address: patient.address || '',
        bloodType: patient.bloodType || '',
        medicalHistory: patient.medicalHistory || '',
        allergies: patient.allergies || '',
        lastCheckup: patient.lastCheckup ? new Date(patient.lastCheckup).toISOString().split('T')[0] : '',
        emergencyContact: patient.emergencyContact || '',
      });
    }
  }, [patient]);

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
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.put(`${API_URL}/api/patients/${patient._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Data pasien berhasil diperbarui!');
      setError('');
      
      if (onSuccess) {
        onSuccess();
      }
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error updating patient:', err);
      setError('Gagal memperbarui data pasien.');
      setSuccess('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  };

  const drawerVariants = {
    hidden: { x: '100%' },
    visible: { x: 0, transition: { type: "spring", damping: 25, stiffness: 300 } }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop overlay */}
          <motion.div 
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-[1px]"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
            onClick={onClose}
          />
          
          {/* Drawer panel */}
          <div className="absolute inset-y-0 right-0 max-w-full flex outline-none">
            <motion.div 
              className="relative w-screen max-w-md sm:max-w-lg md:max-w-xl"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={drawerVariants}
            >
              <div className="h-full flex flex-col bg-white shadow-xl overflow-hidden">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 p-4 text-white shadow-lg">
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
                  <div className="relative flex justify-between items-center">
                    <div className="flex-1 mr-4">
                      <div className="flex items-center">
                        <FaEdit className="w-5 h-5 mr-2" />
                        <h2 className="text-lg font-medium">Edit Data Pasien</h2>
                      </div>
                      <div className="mt-1 text-sm text-blue-100 font-medium truncate">
                        {patient?.fullName}
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="rounded-full p-2 inline-flex text-white hover:bg-white/30 transition-colors"
                      aria-label="Close panel"
                    >
                      <FaTimes size={18} />
                    </button>
                  </div>
                </div>

                {/* Body with scrolling content */}
                <div className="flex-1 overflow-y-auto p-4">
                  {error && (
                    <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-md border-l-4 border-red-500 flex items-start text-sm">
                      <div className="mr-3 mt-0.5">⚠️</div>
                      <div>{error}</div>
                    </div>
                  )}
                  
                  <form id="edit-patient-form" onSubmit={handleSubmit} className="space-y-5">
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                              layoutId="genderBgEdit"
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
                              layoutId="genderBgEdit"
                            />
                          )}
                          <span className="relative z-10 flex items-center text-base">
                            <FaFemale className={`mr-2 ${formData.gender === 'female' ? 'text-pink-500' : 'text-gray-500'}`} /> 
                            Perempuan
                          </span>
                        </motion.button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

                    <div className="grid grid-cols-1 gap-5">
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                  </form>
                </div>
                
                {/* Actions footer */}
                <div className="flex-shrink-0 bg-gray-50 px-4 py-3 sm:px-6 border-t border-gray-200">
                  <div className="flex justify-end space-x-3">
                    <motion.button
                      type="button"
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={onClose}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Batal
                    </motion.button>
                    <motion.button
                      type="submit"
                      form="edit-patient-form"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                      disabled={loading}
                      whileHover={!loading ? { scale: 1.02 } : {}}
                      whileTap={!loading ? { scale: 0.98 } : {}}
                    >
                      {loading ? 'Menyimpan...' : (
                        <>
                          <FaSave className="mr-2" />
                          Simpan Perubahan
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default EditPatientDrawer; 