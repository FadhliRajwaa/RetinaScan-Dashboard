import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function PatientDataForm({ onProfileComplete }) {
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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { 
          fullName, 
          dateOfBirth, 
          gender, 
          phone, 
          address,
          bloodType,
          medicalHistory,
          allergies,
          lastCheckup,
          emergencyContact 
        } = response.data;
        
        // Hitung umur jika tanggal lahir tersedia
        let calculatedAge = '';
        if (dateOfBirth) {
          const birthDate = new Date(dateOfBirth);
          const today = new Date();
          calculatedAge = today.getFullYear() - birthDate.getFullYear();
          
          // Koreksi umur jika belum ulang tahun
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            calculatedAge--;
          }
        }
        
        setFormData({
          fullName: fullName || '',
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString().split('T')[0] : '',
          age: calculatedAge.toString(),
          gender: gender || '',
          phone: phone || '',
          address: address || '',
          bloodType: bloodType || '',
          medicalHistory: medicalHistory || '',
          allergies: allergies || '',
          lastCheckup: lastCheckup ? new Date(lastCheckup).toISOString().split('T')[0] : '',
          emergencyContact: emergencyContact || '',
        });
      } catch (err) {
        console.error('Gagal memuat data pasien:', err);
      }
    };
    fetchPatientData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // Hitung umur otomatis saat tanggal lahir berubah
    if (e.target.name === 'dateOfBirth' && e.target.value) {
      const birthDate = new Date(e.target.value);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/user/profile', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Data pasien berhasil disimpan!');
      setError('');
      
      // Update profile complete status
      if (onProfileComplete) {
        onProfileComplete();
      }
      
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError('Gagal menyimpan data pasien.');
      setSuccess('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-lg max-w-md md:max-w-lg lg:max-w-2xl mx-2 sm:mx-auto"
    >
      <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4 md:mb-6">Data Pasien</h3>
      {error && (
        <p className="text-red-500 bg-red-50 p-2 sm:p-3 rounded mb-4 text-sm sm:text-base">
          {error}
        </p>
      )}
      {success && (
        <p className="text-green-600 bg-green-50 p-2 sm:p-3 rounded mb-4 text-sm sm:text-base">
          {success}
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
          <div>
            <label className="block text-xs sm:text-sm md:text-base font-medium text-gray-700 mb-1 sm:mb-2">
              Nama Lengkap Pasien
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="mt-1 w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              required
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm md:text-base font-medium text-gray-700 mb-1 sm:mb-2">
              Nomor Telepon
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
          <div>
            <label className="block text-xs sm:text-sm md:text-base font-medium text-gray-700 mb-1 sm:mb-2">
              Tanggal Lahir
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="mt-1 w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              required
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm md:text-base font-medium text-gray-700 mb-1 sm:mb-2">
              Umur
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              readOnly
              className="mt-1 w-full p-2 sm:p-3 border rounded-lg bg-gray-50 text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm md:text-base font-medium text-gray-700 mb-1 sm:mb-2">
              Jenis Kelamin
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="mt-1 w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              required
            >
              <option value="">Pilih</option>
              <option value="male">Laki-laki</option>
              <option value="female">Perempuan</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs sm:text-sm md:text-base font-medium text-gray-700 mb-1 sm:mb-2">
            Alamat
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={2}
            className="mt-1 w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
          <div>
            <label className="block text-xs sm:text-sm md:text-base font-medium text-gray-700 mb-1 sm:mb-2">
              Golongan Darah
            </label>
            <select
              name="bloodType"
              value={formData.bloodType}
              onChange={handleChange}
              className="mt-1 w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            >
              <option value="">Pilih</option>
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
            <label className="block text-xs sm:text-sm md:text-base font-medium text-gray-700 mb-1 sm:mb-2">
              Tanggal Pemeriksaan Terakhir
            </label>
            <input
              type="date"
              name="lastCheckup"
              value={formData.lastCheckup}
              onChange={handleChange}
              className="mt-1 w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
          <div>
            <label className="block text-xs sm:text-sm md:text-base font-medium text-gray-700 mb-1 sm:mb-2">
              Riwayat Penyakit
            </label>
            <textarea
              name="medicalHistory"
              value={formData.medicalHistory}
              onChange={handleChange}
              rows={3}
              className="mt-1 w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm md:text-base font-medium text-gray-700 mb-1 sm:mb-2">
              Alergi
            </label>
            <textarea
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
              rows={3}
              className="mt-1 w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs sm:text-sm md:text-base font-medium text-gray-700 mb-1 sm:mb-2">
            Kontak Darurat
          </label>
          <input
            type="text"
            name="emergencyContact"
            value={formData.emergencyContact}
            onChange={handleChange}
            className="mt-1 w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base md:text-lg"
        >
          Simpan Data Pasien
        </button>
      </form>
    </motion.div>
  );
}

export default PatientDataForm;