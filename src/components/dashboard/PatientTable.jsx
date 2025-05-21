import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { FaEdit, FaTrash, FaEye, FaSearch, FaSort, FaSortUp, FaSortDown, FaFilter } from 'react-icons/fa';
import { format, differenceInYears } from 'date-fns';
import { id } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const PatientTable = ({ onDelete, onRefresh, refreshTrigger }) => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(5);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [filterConfig, setFilterConfig] = useState({ gender: 'all', bloodType: 'all' });
  const [showFilters, setShowFilters] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, [refreshTrigger]);

  useEffect(() => {
    filterAndSortPatients();
  }, [searchTerm, sortConfig, filterConfig, patients]);

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

  const filterAndSortPatients = () => {
    let filtered = [...patients];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(patient => 
        (patient.fullName || patient.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.phone || '').includes(searchTerm)
      );
    }
    
    // Apply gender filter
    if (filterConfig.gender !== 'all') {
      filtered = filtered.filter(patient => patient.gender === filterConfig.gender);
    }
    
    // Apply blood type filter
    if (filterConfig.bloodType !== 'all') {
      filtered = filtered.filter(patient => patient.bloodType === filterConfig.bloodType);
    }
    
    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredPatients(filtered);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: id });
    } catch (error) {
      return dateString;
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return '-';
    try {
      return differenceInYears(new Date(), new Date(dateOfBirth));
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

  const handleEditPatient = (patient) => {
    navigate(`/edit-patient/${patient._id}`);
  };
  
  const handleViewPatientHistory = (patient) => {
    navigate(`/patient-history/${patient._id}`);
  };
  
  const handleViewPatientProfile = (patient) => {
    navigate(`/patient-profile/${patient._id}`);
  };
  
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (columnName) => {
    if (sortConfig.key !== columnName) {
      return <FaSort className="ml-1 text-gray-400 inline" />;
    }
    return sortConfig.direction === 'ascending' 
      ? <FaSortUp className="ml-1 text-blue-600 inline" /> 
      : <FaSortDown className="ml-1 text-blue-600 inline" />;
  };
  
  // Get current patients for pagination
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredPatients.length / patientsPerPage); i++) {
    pageNumbers.push(i);
  }
  
  // Blood type options for filter
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Loading skeleton animation
  const LoadingSkeleton = () => (
    <>
      {[...Array(5)].map((_, index) => (
        <tr key={`skeleton-${index}`} className="border-b animate-pulse">
          <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
          <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
          <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-1/4"></div></td>
          <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-2/3"></div></td>
          <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
          <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-1/4"></div></td>
          <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-full"></div></td>
        </tr>
      ))}
    </>
  );

  // Empty state component
  const EmptyState = () => (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <td colSpan="7" className="px-4 py-8 text-center">
        <div className="flex flex-col items-center justify-center">
          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-500 font-medium mb-1">Tidak ada data pasien</p>
          <p className="text-gray-400 text-sm">Tambahkan pasien baru untuk melihat data di sini</p>
        </div>
      </td>
    </motion.tr>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Data Pasien</h3>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari pasien..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          
          {/* Filter Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              showFilters ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaFilter size={14} />
            <span>Filter</span>
          </motion.button>
        </div>
      </div>
      
      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={filterConfig.gender}
                    onChange={(e) => setFilterConfig({...filterConfig, gender: e.target.value})}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Semua</option>
                    <option value="male">Laki-laki</option>
                    <option value="female">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Golongan Darah</label>
                  <select
                    value={filterConfig.bloodType}
                    onChange={(e) => setFilterConfig({...filterConfig, bloodType: e.target.value})}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Semua</option>
                    {bloodTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => {
                    setFilterConfig({ gender: 'all', bloodType: 'all' });
                    setSearchTerm('');
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Reset Filter
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-red-50 text-red-500 p-4 rounded-lg border border-red-200 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </motion.div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm text-left">
          <thead className="text-xs font-medium text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-4 py-3 cursor-pointer select-none" onClick={() => requestSort('fullName')}>
                <div className="flex items-center">
                  Nama {getSortIcon('fullName')}
                </div>
              </th>
              <th className="px-4 py-3 cursor-pointer select-none" onClick={() => requestSort('dateOfBirth')}>
                <div className="flex items-center">
                  Tgl. Lahir {getSortIcon('dateOfBirth')}
                </div>
              </th>
              <th className="px-4 py-3">Umur</th>
              <th className="px-4 py-3 cursor-pointer select-none" onClick={() => requestSort('gender')}>
                <div className="flex items-center">
                  Jenis Kelamin {getSortIcon('gender')}
                </div>
              </th>
              <th className="px-4 py-3">Telepon</th>
              <th className="px-4 py-3 cursor-pointer select-none" onClick={() => requestSort('bloodType')}>
                <div className="flex items-center">
                  Gol. Darah {getSortIcon('bloodType')}
                </div>
              </th>
              <th className="px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <LoadingSkeleton />
            ) : currentPatients.length === 0 ? (
              <EmptyState />
            ) : (
              currentPatients.map((patient, index) => {
                return (
                  <motion.tr 
                    key={patient._id} 
                    className="border-b hover:bg-blue-50 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {patient.fullName || patient.name || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(patient.dateOfBirth)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {calculateAge(patient.dateOfBirth) || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        patient.gender === 'male' 
                          ? 'bg-blue-100 text-blue-800' 
                          : patient.gender === 'female'
                          ? 'bg-pink-100 text-pink-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {getGenderLabel(patient.gender)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {patient.phone || '-'}
                    </td>
                    <td className="px-4 py-3">
                      {patient.bloodType ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {patient.bloodType}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleViewPatientProfile(patient)}
                          className="text-indigo-600 hover:text-indigo-800 transition-colors"
                          title="Profil Pasien"
                        >
                          <FaEye />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEditPatient(patient)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit"
                        >
                          <FaEdit />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onDelete(patient._id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Hapus"
                        >
                          <FaTrash />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {!loading && filteredPatients.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-gray-600">
            Menampilkan {indexOfFirstPatient + 1}-{Math.min(indexOfLastPatient, filteredPatients.length)} dari {filteredPatients.length} pasien
          </p>
          <nav className="flex space-x-1">
            <button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${
                currentPage === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              &laquo;
            </button>
            
            {pageNumbers.map(number => (
              <motion.button
                key={number}
                onClick={() => paginate(number)}
                className={`px-3 py-1 rounded ${
                  currentPage === number 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                whileHover={currentPage !== number ? { scale: 1.1 } : {}}
                whileTap={currentPage !== number ? { scale: 0.9 } : {}}
              >
                {number}
              </motion.button>
            ))}
            
            <button
              onClick={() => paginate(Math.min(Math.ceil(filteredPatients.length / patientsPerPage), currentPage + 1))}
              disabled={currentPage === Math.ceil(filteredPatients.length / patientsPerPage)}
              className={`px-3 py-1 rounded ${
                currentPage === Math.ceil(filteredPatients.length / patientsPerPage) 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              &raquo;
            </button>
          </nav>
        </div>
      )}
    </motion.div>
  );
};

export default PatientTable; 