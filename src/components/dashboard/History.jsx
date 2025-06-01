import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getHistory, deleteAnalysis } from '../../services/api';
import { FiCalendar, FiAlertTriangle, FiPercent, FiFileText, FiSearch, FiChevronLeft, FiChevronRight, FiFilter, FiEye, FiUser, FiList, FiClock, FiTrash } from 'react-icons/fi';
import axios from 'axios';
import { getPatientInfo, getSeverityBadge, normalizePatientData, normalizeGender, normalizeAge } from '../../utils/severityUtils';
import { useTheme } from '../../context/ThemeContext';

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
  const { darkMode } = useTheme();

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
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', damping: 12 }
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
      console.error('Error in getPatientDetails:', error);
      return { name: 'Pasien Tidak Tersedia', info: 'Data Tidak Tersedia' };
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
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`${
          darkMode 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white'
        } p-4 sm:p-6 lg:p-8 rounded-xl shadow-xl mx-2 sm:mx-0 w-full`}
      >
        <div className="flex flex-col h-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <motion.h3 
              variants={itemVariants}
              className={`text-lg sm:text-xl lg:text-2xl font-semibold ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}
            >
              Riwayat Analisis
            </motion.h3>
            <motion.div 
              variants={itemVariants}
              className="mt-3 md:mt-0 flex flex-col sm:flex-row gap-2"
            >
              {/* Search Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari..."
                  className={`pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm w-full ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-700 placeholder-gray-500'
                  }`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
              </div>
              
              {/* Severity Filter Dropdown */}
              <div className="relative">
                <select
                  className={`pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none cursor-pointer w-full ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200' 
                      : 'bg-white border-gray-300 text-gray-700'
                  }`}
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                >
                  <option value="all">Semua Tingkat</option>
                  <option value="tidak ada">Tidak Ada</option>
                  <option value="ringan">Ringan</option>
                  <option value="sedang">Sedang</option>
                  <option value="berat">Berat</option>
                  <option value="sangat berat">Sangat Berat</option>
                </select>
                <FiFilter className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
              </div>
              
              {/* Patient Filter Dropdown */}
              <div className="relative">
                <select
                  className={`pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none cursor-pointer w-full ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200' 
                      : 'bg-white border-gray-300 text-gray-700'
                  }`}
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
                <FiUser className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
              </div>
            </motion.div>
          </div>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className={`${
                darkMode 
                  ? 'bg-red-900/20 border border-red-800/30 text-red-400' 
                  : 'bg-red-50 border border-red-100 text-red-600'
              } p-3 rounded-lg mb-4 flex items-center`}
            >
              <FiAlertTriangle className="mr-2 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </motion.div>
          )}
          
          {isLoading ? (
            <motion.div 
              variants={itemVariants}
              className="flex justify-center items-center py-12"
            >
              <div className="flex flex-col items-center">
                <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${
                  darkMode ? 'border-blue-500' : 'border-blue-600'
                } mb-3`}></div>
                <p className={darkMode ? 'text-gray-300' : 'text-gray-500'}>Memuat data...</p>
              </div>
            </motion.div>
          ) : filteredGroupedAnalyses.length === 0 ? (
            <motion.div 
              variants={itemVariants}
              className={`${
                darkMode 
                  ? 'bg-gray-700/50 border border-gray-600' 
                  : 'bg-gray-50 border border-gray-100'
              } rounded-lg p-8 text-center`}
            >
              <div className="flex flex-col items-center">
                <FiFileText className={`${
                  darkMode ? 'text-gray-400' : 'text-gray-400'
                } text-5xl mb-4`} />
                <h4 className={`text-xl font-medium ${
                  darkMode ? 'text-gray-200' : 'text-gray-700'
                } mb-2`}>Belum Ada Data</h4>
                <p className={`${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                } max-w-sm mx-auto`}>
                  {search || severityFilter !== 'all' || patientFilter !== 'all'
                    ? 'Tidak ada riwayat analisis yang sesuai dengan kriteria pencarian.'
                    : 'Belum ada riwayat analisis retina. Mulai dengan unggah gambar untuk analisis.'}
                </p>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Analysis Items - dikelompokkan berdasarkan pasien */}
              <div className="space-y-4 mb-6">
                <AnimatePresence>
                  {currentItems.map((item, index) => (
                    <motion.div
                      key={item.patient._id || index}
                      variants={itemVariants}
                      whileHover={{ 
                        scale: 1.01,
                        boxShadow: darkMode 
                          ? '0 8px 30px rgba(0, 0, 0, 0.3)' 
                          : '0 8px 30px rgba(0, 0, 0, 0.1)'
                      }}
                      onClick={() => navigateToPatientDetail(item)}
                      className={`border p-4 rounded-xl transition-all cursor-pointer ${
                        darkMode 
                          ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700' 
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
                        {/* Patient Name */}
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-full ${
                            darkMode 
                              ? 'bg-blue-900/30 text-blue-400' 
                              : 'bg-blue-100 text-blue-600'
                          }`}>
                            <FiUser className="w-4 h-4" />
                          </div>
                          <div>
                            <p className={`text-xs font-medium ${
                              darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>Pasien</p>
                            <p className={`text-sm font-medium ${
                              darkMode ? 'text-gray-100' : 'text-gray-800'
                            }`}>{item.patient.fullName || item.patient.name || 'Pasien Tidak Tersedia'}</p>
                            <p className={`text-xs ${
                              darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {(() => {
                                // Gunakan fungsi getPatientDetails yang lebih robust
                                const patientInfo = getPatientDetails(item.patient);
                                return patientInfo.info;
                              })()}
                            </p>
                          </div>
                        </div>
                        
                        {/* Latest Analysis Date */}
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-full ${
                            darkMode 
                              ? 'bg-purple-900/30 text-purple-400' 
                              : 'bg-purple-100 text-purple-600'
                          }`}>
                            <FiCalendar className="w-4 h-4" />
                          </div>
                          <div>
                            <p className={`text-xs font-medium ${
                              darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>Analisis Terakhir</p>
                            <p className={`text-sm font-medium ${
                              darkMode ? 'text-gray-100' : 'text-gray-800'
                            }`}>{formatDate(item.latestAnalysis.createdAt)}</p>
                          </div>
                        </div>
                        
                        {/* Latest Analysis Severity */}
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-full ${
                            darkMode 
                              ? 'bg-amber-900/30 text-amber-400' 
                              : 'bg-amber-100 text-amber-600'
                          }`}>
                            <FiAlertTriangle className="w-4 h-4" />
                          </div>
                          <div>
                            <p className={`text-xs font-medium ${
                              darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>Tingkat Keparahan Terakhir</p>
                            <span className={`px-2 py-1 rounded-full text-xs inline-block mt-1 ${
                              darkMode
                                ? item.latestAnalysis.severity.toLowerCase().includes('tidak') || item.latestAnalysis.severity.toLowerCase().includes('normal')
                                  ? 'bg-blue-900/30 text-blue-400'
                                  : item.latestAnalysis.severity.toLowerCase().includes('ringan')
                                    ? 'bg-green-900/30 text-green-400'
                                    : item.latestAnalysis.severity.toLowerCase().includes('sedang')
                                      ? 'bg-yellow-900/30 text-yellow-400'
                                      : item.latestAnalysis.severity.toLowerCase().includes('berat')
                                        ? 'bg-red-900/30 text-red-400'
                                        : 'bg-purple-900/30 text-purple-400'
                                : getSeverityBadge(item.latestAnalysis.severity)
                            }`}>
                              {item.latestAnalysis.severity || 'Tidak ada'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Total Analyses Count */}
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-full ${
                            darkMode 
                              ? 'bg-green-900/30 text-green-400' 
                              : 'bg-green-100 text-green-600'
                          }`}>
                            <FiList className="w-4 h-4" />
                          </div>
                          <div>
                            <p className={`text-xs font-medium ${
                              darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>Total Pemindaian</p>
                            <p className={`text-sm font-medium ${
                              darkMode ? 'text-gray-100' : 'text-gray-800'
                            }`}>{item.totalAnalyses} kali</p>
                          </div>
                        </div>
                        
                        {/* First Analysis Date */}
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-full ${
                            darkMode 
                              ? 'bg-indigo-900/30 text-indigo-400' 
                              : 'bg-indigo-100 text-indigo-600'
                          }`}>
                            <FiClock className="w-4 h-4" />
                          </div>
                          <div>
                            <p className={`text-xs font-medium ${
                              darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>Pertama Kali Pemindaian</p>
                            <p className={`text-sm font-medium ${
                              darkMode ? 'text-gray-100' : 'text-gray-800'
                            }`}>{formatDate(item.analyses[item.analyses.length - 1].createdAt)}</p>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex justify-end items-center h-full">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateToPatientDetail(item);
                            }}
                            className={`inline-flex items-center px-3 py-2 text-xs font-medium text-white rounded-lg transition-colors ${
                              darkMode
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-md shadow-blue-900/20'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20'
                            }`}
                          >
                            <FiEye className="mr-1" />
                            Detail
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div 
                  variants={itemVariants}
                  className="flex items-center justify-center mt-6 space-x-1"
                >
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`flex items-center justify-center w-8 h-8 rounded-md ${
                      currentPage === 1 
                        ? darkMode 
                          ? 'text-gray-600 cursor-not-allowed' 
                          : 'text-gray-400 cursor-not-allowed'
                        : darkMode
                          ? 'text-gray-300 hover:bg-gray-700'
                          : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FiChevronLeft />
                  </motion.button>
                  
                  {[...Array(totalPages).keys()].map(number => (
                    <motion.button
                      key={number + 1}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => paginate(number + 1)}
                      className={`flex items-center justify-center w-8 h-8 rounded-md ${
                        currentPage === number + 1
                          ? darkMode
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-600 text-white'
                          : darkMode
                            ? 'text-gray-300 hover:bg-gray-700'
                            : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {number + 1}
                    </motion.button>
                  ))}
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`flex items-center justify-center w-8 h-8 rounded-md ${
                      currentPage === totalPages 
                        ? darkMode 
                          ? 'text-gray-600 cursor-not-allowed' 
                          : 'text-gray-400 cursor-not-allowed'
                        : darkMode
                          ? 'text-gray-300 hover:bg-gray-700'
                          : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FiChevronRight />
                  </motion.button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </>
  );
}

export default History;