import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getHistory, deleteAnalysis } from '../../services/api';
import { FiCalendar, FiAlertTriangle, FiPercent, FiFileText, FiSearch, FiChevronLeft, FiChevronRight, FiFilter, FiEye, FiUser, FiList, FiClock, FiTrash, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import axios from 'axios';
import { getPatientInfo, getSeverityBadge, normalizePatientData, normalizeGender, normalizeAge } from '../../utils/severityUtils';

// Glassmorphism style
const glassEffect = {
  background: 'rgba(255, 255, 255, 0.85)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  borderRadius: '16px',
};

function History() {
  // State management
  const [analyses, setAnalyses] = useState([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState([]);
  const [groupedAnalyses, setGroupedAnalyses] = useState([]);
  const [filteredGroupedAnalyses, setFilteredGroupedAnalyses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [patientFilter, setPatientFilter] = useState('all');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [patients, setPatients] = useState([]);
  const navigate = useNavigate();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: 'spring',
        stiffness: 400,
        damping: 30
      }
    }
  };

  // Fetch data
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const data = await getHistory();
        console.log('Data history dari API:', data.slice(0, 3)); // Log sampel data
        
        // Periksa data pasien dalam history
        data.forEach((item, index) => {
          if (index < 3) { // Hanya log beberapa item pertama
            console.log(`Patient ${index} info:`, {
              id: item.patientId?._id,
              name: item.patientId?.fullName || item.patientId?.name,
              gender: item.patientId?.gender,
              age: item.patientId?.age
            });
          }
        });
        
        // Pra-normalisasi data analisis dengan properti pasien
        const normalizedData = data.map(item => {
          // Buat deep copy untuk menghindari mutasi data asli
          const normalizedItem = { ...item };
          
          // Jika item.patientId ada dan itu adalah objek, normalisasi data pasien
          if (normalizedItem.patientId && typeof normalizedItem.patientId === 'object') {
            normalizedItem.patientId = normalizePatientData(normalizedItem.patientId);
            
            // Log normalisasi untuk debugging
            console.log('Normalisasi data pasien:', {
              before: {
                gender: item.patientId.gender,
                age: item.patientId.age
              },
              after: {
                gender: normalizedItem.patientId.gender,
                age: normalizedItem.patientId.age
              }
            });
          }
          
          return normalizedItem;
        });
        
        setAnalyses(normalizedData);
        
        // Kelompokkan analisis berdasarkan pasien dengan data yang sudah dinormalisasi
        const grouped = groupAnalysesByPatient(normalizedData);
        console.log('Data yang dikelompokkan:', grouped.slice(0, 3)); // Log sampel data
        setGroupedAnalyses(grouped);
        setFilteredGroupedAnalyses(grouped);
        
        setError('');
      } catch (err) {
        console.error('Error fetching history:', err);
        setError('Gagal memuat riwayat. Mohon coba lagi nanti.');
      } finally {
        setIsLoading(false);
      }
    };
    
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await axios.get(`${API_URL}/api/patients`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Data pasien dari API:', response.data.slice(0, 3)); // Log sampel data
        
        // Normalisasi data pasien sebelum disimpan ke state
        const normalizedPatients = response.data.map(normalizePatientData);
        
        setPatients(normalizedPatients);
        console.log('Fetched patients after normalization:', normalizedPatients.length);
      } catch (err) {
        console.error('Gagal memuat data pasien:', err);
      }
    };
    
    fetchHistory();
    fetchPatients();
  }, []);

  // Filter and sort data untuk data yang dikelompokkan
  useEffect(() => {
    let result = [...groupedAnalyses];
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(item => 
        (item.patient.fullName && item.patient.fullName.toLowerCase().includes(searchLower)) ||
        (item.patient.name && item.patient.name.toLowerCase().includes(searchLower)) ||
        // Cari di semua analisis untuk pasien ini
        item.analyses.some(analysis => 
          (analysis.originalFilename && analysis.originalFilename.toLowerCase().includes(searchLower)) ||
          (analysis.severity && analysis.severity.toLowerCase().includes(searchLower)) ||
          (analysis.notes && analysis.notes.toLowerCase().includes(searchLower))
        )
      );
    }
    
    // Apply severity filter - filter pasien yang memiliki setidaknya satu analisis dengan tingkat keparahan yang ditentukan
    if (severityFilter !== 'all') {
      result = result.filter(item => 
        item.analyses.some(analysis => 
          analysis.severity.toLowerCase() === severityFilter.toLowerCase()
        )
      );
    }
    
    // Apply patient filter
    if (patientFilter !== 'all') {
      result = result.filter(item => item.patient._id === patientFilter);
    }
    
    // Apply sorting based on the latest analysis for each patient
    result.sort((a, b) => {
      if (sortField === 'createdAt' || sortField === 'updatedAt') {
        const dateA = new Date(a.latestAnalysis[sortField]);
        const dateB = new Date(b.latestAnalysis[sortField]);
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      let fieldA = a.latestAnalysis[sortField];
      let fieldB = b.latestAnalysis[sortField];
      
      if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredGroupedAnalyses(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [groupedAnalyses, search, severityFilter, patientFilter, sortField, sortDirection]);

  // Pagination logic untuk data yang dikelompokkan
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredGroupedAnalyses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredGroupedAnalyses.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Fungsi untuk navigasi ke halaman detail pasien
  const navigateToPatientDetail = (patientGroup) => {
    // Dapatkan ID pasien dari berbagai kemungkinan struktur data
    const patientId = patientGroup.patient._id || patientGroup.patient.id || patientGroup.patientId;
    
    if (!patientId) {
      console.error('ID pasien tidak ditemukan:', patientGroup);
      return;
    }
    
    navigate(`/patient-history/${patientId}`);
  };

  // Handle sort direction change
  const handleSortChange = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Get patient name
  const getPatientName = (item) => {
    if (item.patientId) {
      // Gunakan fullName jika tersedia, jika tidak gunakan name
      // Dan pastikan mengembalikan string yang valid
      const name = item.patientId.fullName || item.patientId.name;
      return name || 'Pasien Tidak Tersedia';
    }
    return 'Pasien Tidak Tersedia';
  };

  // Fungsi untuk mendapatkan info pasien pada bagian pengelompokan data
  const getPatientDetails = (patient) => {
    try {
      if (!patient) return { name: 'Pasien Tidak Tersedia', info: 'Data Tidak Tersedia' };
      
      // Nama pasien
      const name = patient.fullName || patient.name || 'Pasien Tidak Tersedia';
      
      // Info pasien (gender, umur) menggunakan util function
      let info = getPatientInfo(patient);
      
      // Logging untuk debugging
      console.log('getPatientDetails for patient:', { 
        id: patient._id, 
        name, 
        gender: patient.gender,
        age: patient.age,
        computed_info: info
      });
      
      // Double-check jika masih "Data Tidak Tersedia" padahal data ada
      if (info === 'Data Tidak Tersedia' && (patient.gender || patient.age)) {
        // Coba build info secara manual jika getPatientInfo gagal
        const genderText = normalizeGender(patient.gender);
        const age = normalizeAge(patient.age);
        
        if (genderText !== 'Tidak Diketahui' && age !== null) {
          info = `${genderText}, ${age} tahun`;
        } else if (genderText !== 'Tidak Diketahui') {
          info = genderText;
        } else if (age !== null) {
          info = `${age} tahun`;
        }
        
        console.log('getPatientDetails fallback info:', info);
      }
      
      return { name, info };
    } catch (error) {
      console.error('Error getting patient details:', error);
      return { name: 'Error', info: 'Error Saat Memuat Data' };
    }
  };
  
  // Helper untuk menangani gambar yang dapat dimuat
  const canLoadImage = (src) => {
    return src && (src.startsWith('data:image') || src.startsWith('http'));
  };

  // Fungsi untuk mengelompokkan analisis berdasarkan pasien
  const groupAnalysesByPatient = (analyses) => {
    try {
      // Buat objek untuk menyimpan analisis dikelompokkan berdasarkan patientId
      const groupedByPatient = {};
      
      // Iterasi melalui semua analisis
      analyses.forEach(analysis => {
        if (!analysis.patientId) {
          console.warn('Analysis without patientId:', analysis);
          return;
        }
        
        // Handle kasus di mana patientId bisa berupa objek atau string
        const patientId = typeof analysis.patientId === 'object' ? analysis.patientId._id : analysis.patientId;
        
        // Dapatkan nama pasien dari berbagai kemungkinan sumber data
        const patientName = typeof analysis.patientId === 'object' 
          ? (analysis.patientId.fullName || analysis.patientId.name) 
          : analysis.patientName || 'Pasien Tidak Diketahui';
        
        // Normalisasi data pasien jika tersedia
        let patientData = typeof analysis.patientId === 'object' 
          ? normalizePatientData(analysis.patientId)
          : { _id: patientId, name: patientName };
        
        // Log data pasien untuk debugging
        if (typeof analysis.patientId === 'object') {
          console.log('groupAnalysesByPatient processing patient:', { 
            id: patientId, 
            name: patientName,
            gender: analysis.patientId.gender,
            normalized_gender: patientData.gender,
            age: analysis.patientId.age,
            normalized_age: patientData.age
          });
        }
        
        // Jika pasien belum ada di objek, tambahkan
        if (!groupedByPatient[patientId]) {
          groupedByPatient[patientId] = {
            patient: patientData,
            analyses: [analysis],
            latestAnalysis: analysis,
            totalAnalyses: 1
          };
        } else {
          // Tambahkan analisis ke array analisis pasien
          groupedByPatient[patientId].analyses.push(analysis);
          groupedByPatient[patientId].totalAnalyses++;
          
          // Perbarui analisis terbaru jika analisis ini lebih baru
          if (new Date(analysis.createdAt) > new Date(groupedByPatient[patientId].latestAnalysis.createdAt)) {
            groupedByPatient[patientId].latestAnalysis = analysis;
          }
        }
      });
      
      // Sortir analisis di dalam setiap grup berdasarkan tanggal (terbaru dulu)
      Object.values(groupedByPatient).forEach(group => {
        group.analyses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      });
      
      // Log for debugging
      console.log('Grouped patient data sample:', Object.values(groupedByPatient).slice(0, 2));
      
      // Pastikan setiap pasien memiliki data gender dan usia yang valid
      const finalGroupedData = Object.values(groupedByPatient).map(group => {
        // Jika data pasien tidak lengkap, coba temukan data dari analisis lain
        if (!group.patient.gender || !group.patient.age) {
          // Cari data pasien dari seluruh analisis yang terkait dengan pasien ini
          for (const analysis of group.analyses) {
            if (typeof analysis.patientId === 'object') {
              if (!group.patient.gender && analysis.patientId.gender) {
                group.patient.gender = normalizeGender(analysis.patientId.gender);
              }
              
              if (!group.patient.age && analysis.patientId.age) {
                group.patient.age = normalizeAge(analysis.patientId.age);
              }
              
              // Jika kedua data sudah tersedia, berhenti mencari
              if (group.patient.gender && group.patient.age) break;
            }
          }
        }
        
        return group;
      });
      
      // Konversi objek menjadi array
      return finalGroupedData;
    } catch (error) {
      console.error('Error grouping analyses by patient:', error);
      return [];
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {error && (
        <motion.div 
          className="bg-red-50 p-4 rounded-xl mb-6 text-red-600 flex items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <FiAlertTriangle className="mr-3 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Filter and search section */}
      <motion.div 
        className="mb-6 p-5 rounded-xl"
        variants={itemVariants}
        style={glassEffect}
      >
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 pr-4 py-2.5 w-full rounded-xl border border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white/70"
              placeholder="Cari pasien atau analisis..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            {/* Severity filter */}
            <div className="relative w-full sm:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiFilter className="text-gray-400" />
              </div>
              <select
                className="pl-10 pr-8 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white/70 appearance-none w-full sm:w-auto"
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
              >
                <option value="all">Semua Tingkat Keparahan</option>
                <option value="tidak ada">Tidak Ada</option>
                <option value="ringan">Ringan</option>
                <option value="sedang">Sedang</option>
                <option value="berat">Berat</option>
                <option value="sangat berat">Sangat Berat</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <FiChevronRight className="text-gray-400 transform rotate-90" />
              </div>
            </div>
            
            {/* Patient filter */}
            {patients.length > 0 && (
              <div className="relative w-full sm:w-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400" />
                </div>
                <select
                  className="pl-10 pr-8 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white/70 appearance-none w-full sm:w-auto"
                  value={patientFilter}
                  onChange={(e) => setPatientFilter(e.target.value)}
                >
                  <option value="all">Semua Pasien</option>
                  {patients.map(patient => (
                    <option key={patient._id} value={patient._id}>
                      {patient.fullName || patient.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <FiChevronRight className="text-gray-400 transform rotate-90" />
                </div>
              </div>
            )}
            
            {/* Sort filter */}
            <div className="relative w-full sm:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiList className="text-gray-400" />
              </div>
              <select
                className="pl-10 pr-8 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white/70 appearance-none w-full sm:w-auto"
                value={sortField}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <option value="createdAt">Urutkan: Tanggal</option>
                <option value="severity">Urutkan: Keparahan</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <FiChevronRight className="text-gray-400 transform rotate-90" />
              </div>
            </div>
            
            {/* Sort direction */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              className="p-2.5 rounded-xl border border-gray-200 bg-white/70 text-gray-600 hover:bg-gray-50"
            >
              {sortDirection === 'asc' ? (
                <FiChevronUp className="w-5 h-5" />
              ) : (
                <FiChevronDown className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Results section */}
      {isLoading ? (
        <motion.div 
          className="flex justify-center items-center p-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
            <div className="absolute inset-3 rounded-full bg-white flex items-center justify-center">
              <FiClock className="text-blue-500 w-6 h-6" />
            </div>
          </div>
        </motion.div>
      ) : filteredGroupedAnalyses.length === 0 ? (
        <motion.div 
          className="bg-white/80 backdrop-blur-sm p-12 rounded-xl text-center shadow-sm border border-gray-100"
          variants={itemVariants}
        >
          <FiFileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Tidak Ada Data</h3>
          <p className="text-gray-500">
            {search || severityFilter !== 'all' || patientFilter !== 'all' 
              ? 'Tidak ada hasil yang cocok dengan filter Anda. Coba ubah filter atau hapus pencarian.'
              : 'Belum ada data riwayat analisis. Silakan lakukan analisis terlebih dahulu.'}
          </p>
        </motion.div>
      ) : (
        <AnimatePresence>
          <motion.div variants={itemVariants}>
            {currentItems.map((patientGroup, index) => (
              <motion.div
                key={patientGroup.patient._id || index}
                className="mb-6 overflow-hidden rounded-xl"
                style={glassEffect}
                whileHover={{ 
                  y: -5,
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                onClick={() => navigateToPatientDetail(patientGroup)}
              >
                <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex flex-wrap items-center justify-between">
                    <div className="flex items-center mb-2 sm:mb-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white mr-3">
                        <FiUser className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {getPatientDetails(patientGroup.patient).name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {getPatientDetails(patientGroup.patient).info}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">
                        <FiCalendar className="inline mr-1" />
                        {formatDate(patientGroup.latestAnalysis.createdAt)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityBadge(patientGroup.latestAnalysis.severity)}`}>
                        {patientGroup.latestAnalysis.severity}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-500">
                      <span className="font-medium text-gray-700">{patientGroup.analyses.length}</span> analisis tersedia
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">
                        Tingkat Kepercayaan:
                      </span>
                      <span className="text-sm font-medium text-blue-600">
                        {(patientGroup.latestAnalysis.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {patientGroup.latestAnalysis.notes || patientGroup.latestAnalysis.recommendation || 'Tidak ada catatan'}
                    </p>
                    <motion.div 
                      className="flex items-center text-blue-600 font-medium text-sm"
                      whileHover={{ x: 3 }}
                    >
                      <span>Lihat Detail</span>
                      <FiEye className="ml-1" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {!isLoading && filteredGroupedAnalyses.length > itemsPerPage && (
        <motion.div 
          className="mt-8 flex justify-center"
          variants={itemVariants}
        >
          <nav className="flex items-center space-x-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg ${
                currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FiChevronLeft className="w-5 h-5" />
            </motion.button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
              <motion.button
                key={number}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => paginate(number)}
                className={`w-10 h-10 flex items-center justify-center rounded-lg ${
                  currentPage === number
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {number}
              </motion.button>
            ))}
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg ${
                currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FiChevronRight className="w-5 h-5" />
            </motion.button>
          </nav>
        </motion.div>
      )}
    </motion.div>
  );
}

export default History;