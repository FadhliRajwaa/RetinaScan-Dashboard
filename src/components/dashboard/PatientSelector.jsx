import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FiUsers, FiUser, FiCheck, FiSearch } from 'react-icons/fi';

const PatientSelector = ({ onSelectPatient, selectedPatient }) => {
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/patients', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatients(response.data);
      setError('');
    } catch (err) {
      console.error('Gagal memuat data pasien:', err);
      setError('Gagal memuat data pasien');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient => {
    const fullName = patient.fullName || patient.name || '';
    return fullName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSelectPatient = (patient) => {
    onSelectPatient(patient);
    setShowDropdown(false);
    setSearchTerm('');
  };

  return (
    <div className="w-full mb-5">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Pilih Pasien
      </label>
      <div className="relative">
        <div
          className={`flex items-center border ${error ? 'border-red-300' : 'border-gray-300'} 
            ${selectedPatient ? 'bg-blue-50 border-blue-300' : 'bg-white'} 
            rounded-lg p-2 cursor-pointer`}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          {selectedPatient ? (
            <div className="flex items-center flex-1">
              <div className="bg-blue-100 p-2 rounded-full mr-2">
                <FiUser className="text-blue-600" />
              </div>
              <div>
                <p className="font-medium">{selectedPatient.fullName || selectedPatient.name}</p>
                <p className="text-xs text-gray-500">
                  {selectedPatient.gender === 'male' ? 'Laki-laki' : 'Perempuan'} • {selectedPatient.age} tahun
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center text-gray-500 flex-1">
              <FiUsers className="mr-2" />
              <span>{isLoading ? 'Memuat pasien...' : 'Pilih pasien untuk pemindaian'}</span>
            </div>
          )}
          <svg
            className={`ml-2 h-5 w-5 text-gray-400 transition-transform duration-200 ${
              showDropdown ? 'transform rotate-180' : ''
            }`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {error && (
          <p className="mt-1 text-xs text-red-500">{error}</p>
        )}

        {/* Dropdown menu */}
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg border border-gray-200 max-h-72 overflow-auto"
          >
            <div className="sticky top-0 bg-white border-b p-2">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Cari pasien..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="p-2">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-spin inline-block w-6 h-6 border-2 border-t-blue-500 border-blue-200 rounded-full mb-2"></div>
                  <p>Memuat data pasien...</p>
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p>Tidak ada pasien yang sesuai</p>
                  <button
                    className="mt-2 text-sm text-blue-500 hover:text-blue-700"
                    onClick={() => window.location.href = '/add-patient'}
                  >
                    + Tambah Pasien Baru
                  </button>
                </div>
              ) : (
                filteredPatients.map((patient) => (
                  <div
                    key={patient._id}
                    className={`flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer ${
                      selectedPatient && selectedPatient._id === patient._id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleSelectPatient(patient)}
                  >
                    <div className="flex-1">
                      <p className="font-medium">
                        {patient.fullName || patient.name}
                        {selectedPatient && selectedPatient._id === patient._id && (
                          <FiCheck className="inline-block ml-2 text-green-500" />
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {patient.gender === 'male' ? 'Laki-laki' : 'Perempuan'} • {patient.age} tahun
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PatientSelector; 