import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';
import { withPageTransition } from '../context/ThemeContext';
import { 
  FaArrowLeft, FaUser, FaIdCard, FaCalendarAlt, FaMale, FaFemale, 
  FaPhone, FaMapMarkerAlt, FaTint, FaNotesMedical, FaAllergies, 
  FaCalendarCheck, FaPhoneVolume, FaSave, FaEdit
} from 'react-icons/fa';

function EditPatientPageComponent() {
  const { patientId } = useParams();
  const navigate = useNavigate();
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
  const [patientLoading, setPatientLoading] = useState(true);
  const [error, setError] = useState('');
  const [patientName, setPatientName] = useState('');

  // Mengambil data pasien
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setPatientLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/patients/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const patient = response.data;
        setPatientName(patient.fullName || patient.name || 'Pasien');
        
        // Mengisi form data
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
        
        setError('');
      } catch (err) {
        console.error('Gagal memuat data pasien:', err);
        setError('Gagal memuat data pasien. Silakan coba lagi nanti.');
      } finally {
        setPatientLoading(false);
      }
    };
    
    if (patientId) {
      fetchPatient();
    }
  }, [patientId]);

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
      await axios.put(`http://localhost:5000/api/patients/${patientId}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Data pasien berhasil diperbarui');
      navigate('/patient-data');
    } catch (err) {
      console.error('Gagal mengupdate pasien:', err);
      setError('Gagal mengupdate data pasien. Silakan coba lagi.');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/patient-data');
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

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {patientLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-3"></div>
            <p className="text-gray-500">Memuat data pasien...</p>
          </div>
        </div>
      ) : error && !patientName ? (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="bg-red-50 p-4 rounded-lg flex flex-col items-start"
        >
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/patient-data')}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <FaArrowLeft className="mr-2" />
            Kembali ke daftar pasien
          </button>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto"
        >
          {/* Header dengan tombol kembali */}
          <motion.div 
            variants={itemVariants}
            className="flex items-center justify-between mb-6"
          >
            <div className="flex items-center">
              <button
                onClick={handleCancel}
                className="text-blue-600 hover:text-blue-800 mr-4 flex items-center"
              >
                <FaArrowLeft className="mr-2" />
                <span className="hidden sm:inline">Kembali</span>
              </button>
              <h1 className="text-2xl font-bold">Edit Data Pasien</h1>
            </div>
          </motion.div>
          
          {/* Card info pasien */}
          <motion.div 
            variants={itemVariants}
            className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-6"
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white p-6">
              <div className="flex items-center">
                <FaUser className="text-2xl mr-3" />
                <div>
                  <h2 className="text-xl font-semibold">{patientName}</h2>
                  <p className="text-blue-100 text-sm">ID Pasien: {patientId}</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Form */}
          <motion.div 
            variants={itemVariants}
            className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-6"
          >
            {error && (
              <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-md border-l-4 border-red-500 flex items-start text-sm">
                <div className="mr-3 mt-0.5">⚠️</div>
                <div>{error}</div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informasi Dasar */}
              <div>
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Informasi Dasar</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                
                <div className="mt-5">
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
                  <div className="flex flex-wrap gap-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={formData.gender === 'male'}
                        onChange={handleChange}
                        className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                        required
                      />
                      <span className="ml-2 text-gray-700">Laki-laki</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={formData.gender === 'female'}
                        onChange={handleChange}
                        className="h-5 w-5 text-pink-600 border-gray-300 focus:ring-pink-500"
                      />
                      <span className="ml-2 text-gray-700">Perempuan</span>
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Informasi Medis */}
              <div>
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Informasi Medis</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
                      <FaCalendarCheck className="mr-1.5 text-blue-500" />
                      Pemeriksaan Terakhir
                    </label>
                    <input
                      type="date"
                      name="lastCheckup"
                      value={formData.lastCheckup}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
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
              </div>
              
              {/* Informasi Kontak */}
              <div>
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Informasi Kontak & Alamat</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
                      <FaMapMarkerAlt className="mr-1.5 text-blue-500" />
                      Alamat
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={2}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
                      placeholder="Alamat lengkap pasien"
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
                      placeholder="Kontak yang dapat dihubungi dalam keadaan darurat"
                    />
                  </div>
                </div>
              </div>
              
              {/* Tombol Aksi */}
              <div className="pt-4 flex justify-end space-x-3 border-t">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 flex items-center justify-center rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                    loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" />
                      Simpan Perubahan
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

const EditPatientPage = withPageTransition(EditPatientPageComponent);
export default EditPatientPage; 