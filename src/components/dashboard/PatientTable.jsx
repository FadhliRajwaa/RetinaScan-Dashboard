import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { FaEdit, FaTrash, FaEye, FaSearch, FaSort, FaSortUp, FaSortDown, FaFilter, FaUserFriends } from 'react-icons/fa';
import { format, differenceInYears } from 'date-fns';
import { id } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { normalizeGender } from '../../utils/severityUtils';

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
    
    // Apply gender filter with normalization
    if (filterConfig.gender !== 'all') {
      filtered = filtered.filter(patient => {
        if (!patient.gender) return false;
        
        const normalizedGender = normalizeGender(patient.gender);
        
        if (filterConfig.gender === 'male') {
          return normalizedGender === 'Laki-laki';
        } else if (filterConfig.gender === 'female') {
          return normalizedGender === 'Perempuan';
        }
        return false;
      });
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
    if (!gender) return '-';
    
    // Untuk nilai format lama
    if (gender === 'male') return 'Laki-laki';
    if (gender === 'female') return 'Perempuan';
    
    // Untuk nilai format baru yang sudah disimpan dalam bahasa Indonesia
    if (gender === 'Laki-laki' || gender === 'Perempuan') return gender;
    
    return '-';
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
        duration: 0.5,
        staggerChildren: 0.1
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
        stiffness: 260,
        damping: 20
      }
    }
  };

  const filterVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { 
      opacity: 1, 
      height: 'auto',
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 25
      }
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 35
      }
    }
  };

  // Glassmorphism style
  const glassmorphismStyle = {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.18)'
  };

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
      transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      className="overflow-hidden rounded-2xl"
      style={glassmorphismStyle}
    >
      <motion.div 
        className="p-6 border-b border-gray-100"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
    >
        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4"
        >
          <div className="flex items-center">
            <div className="bg-blue-100 p-2.5 rounded-xl mr-3">
              <FaUserFriends className="text-blue-600 text-lg" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">Data Pasien</h3>
              <p className="text-gray-500 text-sm">
                Total: {filteredPatients.length} pasien
              </p>
            </div>
          </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Search Bar */}
            <motion.div 
              className="relative w-full sm:w-64"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
            >
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500">
                <FaSearch />
              </div>
            <input
              type="text"
              placeholder="Cari pasien..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
            />
            </motion.div>
          
          {/* Filter Button */}
          <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.05, boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)' }}
              whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl transition-all ${
                showFilters 
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md' 
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <FaFilter size={14} />
              <span className="font-medium">Filter</span>
          </motion.button>
        </div>
        </motion.div>
      
      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
              variants={filterVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="overflow-hidden"
          >
              <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 mt-2 mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Kelamin</label>
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setFilterConfig({...filterConfig, gender: 'all'})}
                        className={`px-4 py-2 rounded-lg flex-1 transition-all ${
                          filterConfig.gender === 'all' 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'bg-white text-gray-700 border border-gray-200'
                        }`}
                      >
                        Semua
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setFilterConfig({...filterConfig, gender: 'male'})}
                        className={`px-4 py-2 rounded-lg flex-1 transition-all ${
                          filterConfig.gender === 'male' 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'bg-white text-gray-700 border border-gray-200'
                        }`}
                      >
                        Laki-laki
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setFilterConfig({...filterConfig, gender: 'female'})}
                        className={`px-4 py-2 rounded-lg flex-1 transition-all ${
                          filterConfig.gender === 'female' 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'bg-white text-gray-700 border border-gray-200'
                        }`}
                      >
                        Perempuan
                      </motion.button>
                </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">Golongan Darah</label>
                    <div className="grid grid-cols-4 gap-2">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setFilterConfig({...filterConfig, bloodType: 'all'})}
                        className={`px-3 py-2 rounded-lg transition-all ${
                          filterConfig.bloodType === 'all' 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'bg-white text-gray-700 border border-gray-200'
                        }`}
                      >
                        Semua
                      </motion.button>
                    {bloodTypes.map(type => (
                        <motion.button
                          key={type}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setFilterConfig({...filterConfig, bloodType: type})}
                          className={`px-3 py-2 rounded-lg transition-all ${
                            filterConfig.bloodType === type 
                              ? 'bg-blue-600 text-white shadow-md' 
                              : 'bg-white text-gray-700 border border-gray-200'
                          }`}
                        >
                          {type}
                        </motion.button>
                    ))}
                </div>
                  </motion.div>
              </div>
              
                <motion.div 
                  className="flex justify-end mt-5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setFilterConfig({ gender: 'all', bloodType: 'all' });
                    setSearchTerm('');
                  }}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Reset Filter
                  </motion.button>
                </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 text-red-500 p-4 rounded-xl border border-red-200 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </motion.div>
      )}
      </motion.div>

      {/* Table content */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <motion.thead 
            className="text-xs font-medium text-gray-700 uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <tr>
              <motion.th 
                className="px-6 py-4 cursor-pointer select-none rounded-tl-lg bg-gray-50"
                whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                onClick={() => requestSort('fullName')}
              >
                <div className="flex items-center">
                  <span>Nama</span> 
                  <motion.span
                    animate={{ 
                      rotate: sortConfig.key === 'fullName' && sortConfig.direction === 'descending' ? 180 : 0,
                      color: sortConfig.key === 'fullName' ? '#2563eb' : '#9ca3af'
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {getSortIcon('fullName')}
                  </motion.span>
                </div>
              </motion.th>
              <motion.th 
                className="px-6 py-4 cursor-pointer select-none bg-gray-50"
                whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                onClick={() => requestSort('dateOfBirth')}
              >
                <div className="flex items-center">
                  <span>Tgl. Lahir</span>
                  <motion.span
                    animate={{ 
                      rotate: sortConfig.key === 'dateOfBirth' && sortConfig.direction === 'descending' ? 180 : 0,
                      color: sortConfig.key === 'dateOfBirth' ? '#2563eb' : '#9ca3af'
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {getSortIcon('dateOfBirth')}
                  </motion.span>
                </div>
              </motion.th>
              <motion.th className="px-6 py-4 bg-gray-50">
                <div className="flex items-center">Umur</div>
              </motion.th>
              <motion.th 
                className="px-6 py-4 cursor-pointer select-none bg-gray-50"
                whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                onClick={() => requestSort('gender')}
              >
                <div className="flex items-center">
                  <span>Jenis Kelamin</span>
                  <motion.span
                    animate={{ 
                      rotate: sortConfig.key === 'gender' && sortConfig.direction === 'descending' ? 180 : 0,
                      color: sortConfig.key === 'gender' ? '#2563eb' : '#9ca3af'
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {getSortIcon('gender')}
                  </motion.span>
                </div>
              </motion.th>
              <motion.th className="px-6 py-4 bg-gray-50">
                <div className="flex items-center">Telepon</div>
              </motion.th>
              <motion.th 
                className="px-6 py-4 cursor-pointer select-none bg-gray-50"
                whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                onClick={() => requestSort('bloodType')}
              >
                <div className="flex items-center">
                  <span>Gol. Darah</span>
                  <motion.span
                    animate={{ 
                      rotate: sortConfig.key === 'bloodType' && sortConfig.direction === 'descending' ? 180 : 0,
                      color: sortConfig.key === 'bloodType' ? '#2563eb' : '#9ca3af'
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {getSortIcon('bloodType')}
                  </motion.span>
                </div>
              </motion.th>
              <motion.th className="px-6 py-4 rounded-tr-lg bg-gray-50">
                <div className="flex items-center">Aksi</div>
              </motion.th>
            </tr>
          </motion.thead>
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
                    className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ 
                      backgroundColor: 'rgba(59, 130, 246, 0.05)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                    }}
                    layout
                  >
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {patient.fullName || patient.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatDate(patient.dateOfBirth)}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {calculateAge(patient.dateOfBirth) || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <motion.span 
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        patient.gender === 'male' || patient.gender === 'Laki-laki'
                          ? 'bg-blue-100 text-blue-800' 
                          : patient.gender === 'female' || patient.gender === 'Perempuan'
                          ? 'bg-pink-100 text-pink-800'
                          : 'bg-gray-100 text-gray-800'
                        }`}
                        whileHover={{ scale: 1.05 }}
                      >
                        {getGenderLabel(patient.gender)}
                      </motion.span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {patient.phone || '-'}
                    </td>
                    <td className="px-6 py-4">
                      {patient.bloodType ? (
                        <motion.span 
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
                          whileHover={{ scale: 1.05 }}
                        >
                          {patient.bloodType}
                        </motion.span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-3">
                        <motion.button
                          whileHover={{ scale: 1.2, color: '#4f46e5' }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleViewPatientProfile(patient)}
                          className="text-indigo-500 hover:text-indigo-700 transition-colors"
                          title="Profil Pasien"
                        >
                          <FaEye size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.2, color: '#2563eb' }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEditPatient(patient)}
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                          title="Edit"
                        >
                          <FaEdit size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.2, color: '#dc2626' }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onDelete(patient._id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Hapus"
                        >
                          <FaTrash size={16} />
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
        <motion.div 
          className="flex flex-col sm:flex-row justify-between items-center p-6 border-t border-gray-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-sm text-gray-600 mb-4 sm:mb-0">
            Menampilkan <span className="font-semibold">{indexOfFirstPatient + 1}-{Math.min(indexOfLastPatient, filteredPatients.length)}</span> dari <span className="font-semibold">{filteredPatients.length}</span> pasien
          </p>
          <nav className="flex items-center space-x-1">
            <motion.button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded-lg transition-all ${
                currentPage === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-blue-300'
              }`}
              whileHover={currentPage !== 1 ? { scale: 1.05 } : {}}
              whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
            >
              &laquo;
            </motion.button>
            
            <div className="flex space-x-1">
            {pageNumbers.map(number => (
              <motion.button
                key={number}
                onClick={() => paginate(number)}
                  className={`px-3 py-2 rounded-lg transition-all ${
                  currentPage === number 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md' 
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-blue-300'
                }`}
                  whileHover={currentPage !== number ? { scale: 1.05 } : {}}
                  whileTap={currentPage !== number ? { scale: 0.95 } : {}}
              >
                {number}
              </motion.button>
            ))}
            </div>
            
            <motion.button
              onClick={() => paginate(Math.min(Math.ceil(filteredPatients.length / patientsPerPage), currentPage + 1))}
              disabled={currentPage === Math.ceil(filteredPatients.length / patientsPerPage)}
              className={`px-3 py-2 rounded-lg transition-all ${
                currentPage === Math.ceil(filteredPatients.length / patientsPerPage) 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-blue-300'
              }`}
              whileHover={currentPage !== Math.ceil(filteredPatients.length / patientsPerPage) ? { scale: 1.05 } : {}}
              whileTap={currentPage !== Math.ceil(filteredPatients.length / patientsPerPage) ? { scale: 0.95 } : {}}
            >
              &raquo;
            </motion.button>
          </nav>
        </motion.div>
      )}
    </motion.div>
  );
};

export default PatientTable; 