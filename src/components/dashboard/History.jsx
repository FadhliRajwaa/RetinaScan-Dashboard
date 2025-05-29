import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getHistory } from '../../services/api';
import { FiCalendar, FiAlertTriangle, FiPercent, FiFileText, FiSearch, FiChevronLeft, FiChevronRight, FiFilter, FiEye, FiUser, FiList, FiClock } from 'react-icons/fi';
import axios from 'axios';

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

  // Fetch data
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const data = await getHistory();
        setAnalyses(data);
        
        // Kelompokkan analisis berdasarkan pasien
        const grouped = groupAnalysesByPatient(data);
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
        setPatients(response.data);
        console.log('Fetched patients:', response.data.length);
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
    navigate(`/patient-history/${patientGroup.patient._id}`);
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

  // Get severity badge style
  const getSeverityBadge = (severity) => {
    const severityLower = severity?.toLowerCase() || '';
    if (severityLower === 'tidak ada' || severityLower === 'normal') {
      return 'bg-blue-100 text-blue-800';
    } else if (severityLower === 'ringan' || severityLower === 'rendah') {
      return 'bg-green-100 text-green-800';
    } else if (severityLower === 'sedang') {
      return 'bg-yellow-100 text-yellow-800';
    } else if (severityLower === 'berat' || severityLower === 'parah') {
      return 'bg-orange-100 text-orange-800';
    } else if (severityLower === 'sangat berat' || severityLower === 'proliferative dr') {
      return 'bg-red-100 text-red-800';
    } else {
      // Fallback berdasarkan severityLevel jika ada
      const level = parseInt(severity);
      if (!isNaN(level)) {
        if (level === 0) return 'bg-blue-100 text-blue-800';
        if (level === 1) return 'bg-green-100 text-green-800';
        if (level === 2) return 'bg-yellow-100 text-yellow-800';
        if (level === 3) return 'bg-orange-100 text-orange-800';
        if (level === 4) return 'bg-red-100 text-red-800';
      }
      return 'bg-gray-100 text-gray-800';
    }
  };

  // Get patient name
  const getPatientName = (item) => {
    if (item.patientId) {
      return item.patientId.fullName || item.patientId.name || 'Pasien Tidak Diketahui';
    }
    return 'Pasien Tidak Diketahui';
  };

  // Get patient gender and age
  const getPatientInfo = (item) => {
    if (item.patientId) {
      const gender = item.patientId.gender === 'male' ? 'Laki-laki' : 'Perempuan';
      const age = item.patientId.age || '-';
      return `${gender}, ${age} tahun`;
    }
    return '-';
  };
  
  // Helper untuk menangani gambar yang dapat dimuat
  const canLoadImage = (src) => {
    return src && (src.startsWith('data:image') || src.startsWith('http'));
  };

  // Fungsi untuk mengelompokkan analisis berdasarkan pasien
  const groupAnalysesByPatient = (analyses) => {
    // Buat objek untuk menyimpan analisis dikelompokkan berdasarkan patientId
    const groupedByPatient = {};
    
    // Iterasi melalui semua analisis
    analyses.forEach(analysis => {
      if (!analysis.patientId) return;
      
      const patientId = analysis.patientId._id;
      
      // Jika pasien belum ada di objek, tambahkan
      if (!groupedByPatient[patientId]) {
        groupedByPatient[patientId] = {
          patient: analysis.patientId,
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
    
    // Konversi objek menjadi array
    return Object.values(groupedByPatient);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-lg mx-2 sm:mx-0 w-full"
      >
        <div className="flex flex-col h-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold">
              Riwayat Analisis
            </h3>
            <div className="mt-3 md:mt-0 flex flex-col sm:flex-row gap-2">
              {/* Search Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm w-full"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              
              {/* Severity Filter Dropdown */}
              <div className="relative">
                <select
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none cursor-pointer w-full"
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                >
                  <option value="all">Semua Tingkat</option>
                  <option value="ringan">Ringan</option>
                  <option value="sedang">Sedang</option>
                  <option value="berat">Berat</option>
                </select>
                <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              
              {/* Patient Filter Dropdown */}
              <div className="relative">
                <select
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none cursor-pointer w-full"
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
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 bg-red-50 p-3 rounded-lg mb-4"
            >
              <p className="text-sm">{error}</p>
            </motion.div>
          )}
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-3"></div>
                <p className="text-gray-500">Memuat data...</p>
              </div>
            </div>
          ) : filteredGroupedAnalyses.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="bg-gray-50 rounded-lg p-8 text-center"
            >
              <div className="flex flex-col items-center">
                <FiFileText className="text-gray-400 text-5xl mb-4" />
                <h4 className="text-xl font-medium text-gray-700 mb-2">Belum Ada Data</h4>
                <p className="text-gray-500 max-w-sm mx-auto">
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
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.01 }}
                      className="border border-gray-200 p-4 rounded-lg hover:shadow-md transition-all bg-white"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
                        {/* Patient Name */}
                        <div className="flex items-start space-x-3">
                          <FiUser className="text-blue-500 mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-gray-500">Pasien</p>
                            <p className="text-sm font-medium">{item.patient.fullName || item.patient.name || 'Pasien Tidak Diketahui'}</p>
                            <p className="text-xs text-gray-500">
                              {item.patient.gender === 'male' ? 'Laki-laki' : 'Perempuan'}, {item.patient.age || '-'} tahun
                            </p>
                          </div>
                        </div>
                        
                        {/* Latest Analysis Date */}
                        <div className="flex items-start space-x-3">
                          <FiCalendar className="text-blue-500 mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-gray-500">Analisis Terakhir</p>
                            <p className="text-sm font-medium">{formatDate(item.latestAnalysis.createdAt)}</p>
                          </div>
                        </div>
                        
                        {/* Latest Analysis Severity */}
                        <div className="flex items-start space-x-3">
                          <FiAlertTriangle className="text-blue-500 mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-gray-500">Tingkat Keparahan Terakhir</p>
                            <span className={`px-2 py-1 rounded-full text-xs inline-block mt-1 ${getSeverityBadge(item.latestAnalysis.severity)}`}>
                              {item.latestAnalysis.severity || 'Tidak ada'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Total Analyses Count */}
                        <div className="flex items-start space-x-3">
                          <FiList className="text-blue-500 mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-gray-500">Total Pemindaian</p>
                            <p className="text-sm font-medium">{item.totalAnalyses} kali</p>
                          </div>
                        </div>
                        
                        {/* First Analysis Date */}
                        <div className="flex items-start space-x-3">
                          <FiClock className="text-blue-500 mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-gray-500">Pertama Kali Pemindaian</p>
                            <p className="text-sm font-medium">{formatDate(item.analyses[item.analyses.length - 1].createdAt)}</p>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex justify-end items-center h-full">
                          <button
                            onClick={() => navigateToPatientDetail(item)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                          >
                            <FiEye className="mr-1" />
                            Detail
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center mt-6 space-x-1">
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`flex items-center justify-center w-8 h-8 rounded-md ${
                      currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FiChevronLeft />
                  </button>
                  
                  {[...Array(totalPages).keys()].map(number => (
                    <button
                      key={number + 1}
                      onClick={() => paginate(number + 1)}
                      className={`flex items-center justify-center w-8 h-8 rounded-md ${
                        currentPage === number + 1
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {number + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`flex items-center justify-center w-8 h-8 rounded-md ${
                      currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FiChevronRight />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </>
  );
}

export default History;