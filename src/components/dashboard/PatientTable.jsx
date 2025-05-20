import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const PatientTable = ({ onDelete, onRefresh, refreshTrigger }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, [refreshTrigger]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      console.log('Fetching patients from:', `${API_URL}/api/patients`);
      
      const response = await axios.get(`${API_URL}/api/patients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Patients data received:', response.data.length);
      setPatients(response.data);
      setError('');
    } catch (err) {
      console.error('Gagal memuat data pasien:', err);
      setError('Gagal memuat data pasien. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: id });
    } catch (error) {
      return dateString;
    }
  };

  const getGenderLabel = (gender) => {
    switch (gender) {
      case 'male': return 'Laki-laki';
      case 'female': return 'Perempuan';
      default: return '-';
    }
  };

  const handleEditPatient = (patient) => {
    navigate(`/edit-patient/${patient._id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-4 sm:p-6 rounded-lg shadow-md"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg sm:text-xl font-semibold">Data Pasien</h3>
        {loading && <p className="text-sm text-gray-500">Memuat data...</p>}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-500 p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-4 py-3 rounded-tl-lg">Nama</th>
              <th className="px-4 py-3">Tgl. Lahir</th>
              <th className="px-4 py-3">Umur</th>
              <th className="px-4 py-3">Jenis Kelamin</th>
              <th className="px-4 py-3">Telepon</th>
              <th className="px-4 py-3">Gol. Darah</th>
              <th className="px-4 py-3 rounded-tr-lg">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {patients.length === 0 && !loading ? (
              <tr>
                <td colSpan="7" className="px-4 py-3 text-center text-gray-500">
                  Tidak ada data pasien
                </td>
              </tr>
            ) : (
              patients.map((patient) => {
                return (
                  <tr 
                    key={patient._id} 
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium">
                      {patient.fullName || patient.name || '-'}
                    </td>
                    <td className="px-4 py-3">
                      {formatDate(patient.dateOfBirth)}
                    </td>
                    <td className="px-4 py-3">
                      {patient.age || '-'}
                    </td>
                    <td className="px-4 py-3">
                      {getGenderLabel(patient.gender)}
                    </td>
                    <td className="px-4 py-3">
                      {patient.phone || '-'}
                    </td>
                    <td className="px-4 py-3">
                      {patient.bloodType || '-'}
                    </td>
                    <td className="px-4 py-3 space-x-2">
                      <button
                        onClick={() => handleEditPatient(patient)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => onDelete(patient._id)}
                        className="text-red-600 hover:text-red-800"
                        title="Hapus"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default PatientTable; 