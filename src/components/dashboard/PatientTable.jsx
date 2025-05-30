import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { FaEdit, FaTrash, FaEye, FaSearch, FaSort, FaSortUp, FaSortDown, FaFilter, FaPhone, FaCalendarAlt, FaVenusMars, FaTint } from 'react-icons/fa';
import { format, differenceInYears } from 'date-fns';
import { id } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const PatientTable = ({ onDelete, onRefresh, refreshTrigger, viewMode = 'table' }) => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage, setPatientsPerPage] = useState(viewMode === 'table' ? 8 : 9);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [filterConfig, setFilterConfig] = useState({ gender: 'all', bloodType: 'all' });
  const [showFilters, setShowFilters] = useState(false);
  
  const navigate = useNavigate();

  // Update patients per page when view mode changes
  useEffect(() => {
    setPatientsPerPage(viewMode === 'table' ? 8 : 9);
    setCurrentPage(1); // Reset to first page when changing view
  }, [viewMode]);

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
      
      const response = await axios.get(`${API_URL}/api/patients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatients(response.data);
      setError('');
    } catch (err) {
      console.error('Gagal memuat data pasien:', err);
      setError('Gagal memuat data pasien. Silakan coba lagi.');
      // Use mock data for development/preview
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  // Set mock data for development or when API fails
  const setMockData = () => {
    const mockPatients = [
      { _id: '1', fullName: 'Ahmad Fauzi', dateOfBirth: new Date(1978, 5, 15), gender: 'male', phone: '081234567890', bloodType: 'O+', address: 'Jl. Merdeka No. 123, Jakarta' },
      { _id: '2', fullName: 'Siti Rahayu', dateOfBirth: new Date(1985, 2, 20), gender: 'female', phone: '082345678901', bloodType: 'A+', address: 'Jl. Pahlawan No. 45, Bandung' },
      { _id: '3', fullName: 'Budi Santoso', dateOfBirth: new Date(1971, 8, 5), gender: 'male', phone: '083456789012', bloodType: 'B-', address: 'Jl. Diponegoro No. 67, Surabaya' },
      { _id: '4', fullName: 'Dewi Lestari', dateOfBirth: new Date(1994, 11, 12), gender: 'female', phone: '084567890123', bloodType: 'AB+', address: 'Jl. Sudirman No. 89, Semarang' },
      { _id: '5', fullName: 'Eko Prasetyo', dateOfBirth: new Date(1982, 4, 25), gender: 'male', phone: '085678901234', bloodType: 'O-', address: 'Jl. Gatot Subroto No. 12, Yogyakarta' },
      { _id: '6', fullName: 'Rina Wijaya', dateOfBirth: new Date(1990, 7, 8), gender: 'female', phone: '086789012345', bloodType: 'A-', address: 'Jl. Ahmad Yani No. 34, Medan' },
      { _id: '7', fullName: 'Hadi Susanto', dateOfBirth: new Date(1975, 1, 17), gender: 'male', phone: '087890123456', bloodType: 'B+', address: 'Jl. Imam Bonjol No. 56, Makassar' },
      { _id: '8', fullName: 'Maya Sari', dateOfBirth: new Date(1988, 9, 30), gender: 'female', phone: '088901234567', bloodType: 'AB-', address: 'Jl. Thamrin No. 78, Denpasar' },
      { _id: '9', fullName: 'Doni Kusuma', dateOfBirth: new Date(1980, 3, 22), gender: 'male', phone: '089012345678', bloodType: 'O+', address: 'Jl. Juanda No. 90, Palembang' },
      { _id: '10', fullName: 'Lina Putri', dateOfBirth: new Date(1992, 6, 14), gender: 'female', phone: '081234567891', bloodType: 'A+', address: 'Jl. Veteran No. 23, Padang' }
    ];
    setPatients(mockPatients);
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
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

  // Loading skeleton animation
  const LoadingSkeleton = () => (
    viewMode === 'table' ? (
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
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <div key={`card-skeleton-${index}`} className="bg-white rounded-xl shadow-md p-5 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="flex justify-end space-x-2">
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    )
  );

  // Empty state component
  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-12"
    >
      <div className="bg-gray-50 rounded-full p-6 mb-4">
        <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-800 mb-1">Tidak ada data pasien</h3>
      <p className="text-gray-500 text-center max-w-sm">Tambahkan pasien baru untuk melihat data di sini</p>
    </motion.div>
  );

  // Card view for patients
  const PatientCards = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {currentPatients.map((patient, index) => (
        <motion.div
          key={patient._id}
          variants={itemVariants}
          whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
          className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
        >
          <div className="p-5">
            <h3 className="font-bold text-lg text-gray-800 mb-2">{patient.fullName || patient.name || '-'}</h3>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm">
                <FaCalendarAlt className="text-gray-400 mr-2" />
                <span className="text-gray-600">{formatDate(patient.dateOfBirth)} ({calculateAge(patient.dateOfBirth)} tahun)</span>
              </div>
              
              <div className="flex items-center text-sm">
                <FaVenusMars className="text-gray-400 mr-2" />
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  patient.gender === 'male' 
                    ? 'bg-blue-100 text-blue-800' 
                    : patient.gender === 'female'
                    ? 'bg-pink-100 text-pink-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {getGenderLabel(patient.gender)}
                </span>
              </div>
              
              <div className="flex items-center text-sm">
                <FaPhone className="text-gray-400 mr-2" />
                <span className="text-gray-600">{patient.phone || '-'}</span>
              </div>
              
              <div className="flex items-center text-sm">
                <FaTint className="text-gray-400 mr-2" />
                {patient.bloodType ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {patient.bloodType}
                  </span>
                ) : '-'}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-3 border-t">
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleViewPatientProfile(patient)}
                className="p-2 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                title="Profil Pasien"
              >
                <FaEye />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleEditPatient(patient)}
                className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                title="Edit"
              >
                <FaEdit />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDelete(patient._id)}
                className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                title="Hapus"
              >
                <FaTrash />
              </motion.button>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );

  return (
    <div>
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

      {/* Table View */}
      {viewMode === 'table' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100"
        >
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
                  <tr>
                    <td colSpan="7">
                      <EmptyState />
                    </td>
                  </tr>
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
        </motion.div>
      )}

      {/* Card View */}
      {viewMode === 'card' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {loading ? (
            <LoadingSkeleton />
          ) : currentPatients.length === 0 ? (
            <EmptyState />
          ) : (
            <PatientCards />
          )}
        </motion.div>
      )}
      
      {/* Pagination */}
      {!loading && filteredPatients.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-3">
          <p className="text-sm text-gray-600">
            Menampilkan {indexOfFirstPatient + 1}-{Math.min(indexOfLastPatient, filteredPatients.length)} dari {filteredPatients.length} pasien
          </p>
          <nav className="flex flex-wrap justify-center gap-1">
            <motion.button
              whileHover={currentPage !== 1 ? { scale: 1.05 } : {}}
              whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 rounded-md ${
                currentPage === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              &laquo;
            </motion.button>
            
            {pageNumbers.map(number => (
              <motion.button
                key={number}
                onClick={() => paginate(number)}
                className={`px-3 py-1.5 rounded-md ${
                  currentPage === number 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                whileHover={currentPage !== number ? { scale: 1.05 } : {}}
                whileTap={currentPage !== number ? { scale: 0.95 } : {}}
              >
                {number}
              </motion.button>
            ))}
            
            <motion.button
              whileHover={currentPage !== Math.ceil(filteredPatients.length / patientsPerPage) ? { scale: 1.05 } : {}}
              whileTap={currentPage !== Math.ceil(filteredPatients.length / patientsPerPage) ? { scale: 0.95 } : {}}
              onClick={() => paginate(Math.min(Math.ceil(filteredPatients.length / patientsPerPage), currentPage + 1))}
              disabled={currentPage === Math.ceil(filteredPatients.length / patientsPerPage)}
              className={`px-3 py-1.5 rounded-md ${
                currentPage === Math.ceil(filteredPatients.length / patientsPerPage) 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              &raquo;
            </motion.button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default PatientTable; 