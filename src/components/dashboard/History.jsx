import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getHistory } from '../../services/api';
import { FiCalendar, FiAlertTriangle, FiPercent, FiFileText, FiSearch, FiChevronLeft, FiChevronRight, FiFilter, FiEye, FiUser, FiList, FiClock, FiImage, FiInfo } from 'react-icons/fi';
import axios from 'axios';
import { getSeverityBadge } from '../../utils/severityUtils';
import { toast } from 'react-toastify';

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
        console.log('Fetched history data:', data.length);
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
    // Pastikan patientGroup.patient dan patientGroup.patient._id ada sebelum navigasi
    if (patientGroup && patientGroup.patient && patientGroup.patient._id) {
      navigate(`/patient-history/${patientGroup.patient._id}`);
    } else {
      // Tampilkan pesan error dan tetap di halaman yang sama
      console.error('Data pasien tidak valid atau tidak memiliki ID');
      // Gunakan toast jika tersedia, jika tidak gunakan alert
      if (typeof toast !== 'undefined') {
        toast.error('Data pasien tidak valid. Silakan pilih pasien lain.');
      } else {
        alert('Data pasien tidak valid. Silakan pilih pasien lain.');
      }
    }
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

  // Format date helper dengan validasi
  const formatDate = (dateString) => {
    if (!dateString) return 'Tanggal tidak tersedia';
    
    try {
      const options = { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString('id-ID', options);
    } catch (error) {
      console.error('Format date error:', error);
      return 'Format tanggal tidak valid';
    }
  };

  // Format short date helper
  const formatShortDate = (dateString) => {
    if (!dateString) return '-';
    
    try {
      return new Date(dateString).toLocaleDateString('id-ID');
    } catch (error) {
      return '-';
    }
  };

  // Format percentage dengan validasi
  const formatPercentage = (value) => {
    if (value === undefined || value === null) return '-';
    try {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return '0%';
      
      // Jika nilai sudah dalam persentase (misal 78 bukan 0.78)
      if (numValue > 1) {
        return numValue.toFixed(1) + '%';
      }
      return (numValue * 100).toFixed(1) + '%';
    } catch (error) {
      return '0%';
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
  
  // Helper untuk mendapatkan sumber gambar dengan prioritas imageData dan validasi
  const getImageSource = (analysis) => {
    if (!analysis) {
      console.warn('Analysis object is undefined or null');
      return '/images/default-retina.jpg';
    }
    
    // Jika ada imageData (base64), gunakan itu
    if (analysis.imageData && analysis.imageData.startsWith('data:')) {
      return analysis.imageData;
    }
    
    // Jika ada imageUrl
    if (analysis.imageUrl) {
      // Jika imageUrl adalah path relatif, tambahkan base URL API
      if (analysis.imageUrl.startsWith('/')) {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        return `${API_URL}${analysis.imageUrl}`;
      }
      return analysis.imageUrl;
    }
    
    // Coba gunakan field image jika ada
    if (analysis.image && typeof analysis.image === 'string') {
      return analysis.image;
    }
    
    // Fallback ke default image jika tidak ada source yang valid
    return '/images/default-retina.jpg';
  };

  // Fungsi untuk mengelompokkan analisis berdasarkan pasien dengan validasi tambahan
  const groupAnalysesByPatient = (analyses) => {
    if (!Array.isArray(analyses)) {
      console.error('Expected analyses to be an array, got:', typeof analyses);
      return [];
    }
    
    // Buat objek untuk menyimpan analisis dikelompokkan berdasarkan patientId
    const groupedByPatient = {};
    
    // Iterasi melalui semua analisis
    analyses.forEach(analysis => {
      // Skip analisis tanpa patientId atau jika patientId tidak memiliki _id
      if (!analysis.patientId || !analysis.patientId._id) {
        console.warn('Analisis ditemukan tanpa patientId valid:', analysis._id || 'unknown');
        return;
      }
      
      // Validasi data analisis
      const validAnalysis = {
        ...analysis,
        severity: analysis.severity || 'Tidak diketahui',
        confidence: analysis.confidence !== undefined ? analysis.confidence : 0,
        createdAt: analysis.createdAt || new Date().toISOString(),
        notes: analysis.notes || analysis.recommendation || '',
        originalFilename: analysis.originalFilename || 'Unnamed File'
      };
      
      const patientId = analysis.patientId._id;
      
      // Jika pasien belum ada di objek, tambahkan
      if (!groupedByPatient[patientId]) {
        groupedByPatient[patientId] = {
          patient: analysis.patientId,
          analyses: [validAnalysis],
          latestAnalysis: validAnalysis,
          totalAnalyses: 1
        };
      } else {
        // Tambahkan analisis ke array analisis pasien
        groupedByPatient[patientId].analyses.push(validAnalysis);
        groupedByPatient[patientId].totalAnalyses++;
        
        // Perbarui analisis terbaru jika analisis ini lebih baru
        try {
          if (new Date(validAnalysis.createdAt) > new Date(groupedByPatient[patientId].latestAnalysis.createdAt)) {
            groupedByPatient[patientId].latestAnalysis = validAnalysis;
          }
        } catch (error) {
          console.error('Error comparing dates:', error);
        }
      }
    });
    
    // Sortir analisis di dalam setiap grup berdasarkan tanggal (terbaru dulu)
    Object.values(groupedByPatient).forEach(group => {
      try {
        group.analyses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } catch (error) {
        console.error('Error sorting analyses by date:', error);
      }
    });
    
    // Konversi objek menjadi array
    return Object.values(groupedByPatient);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Memuat riwayat analisis...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
        <FiAlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-600">{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition"
          onClick={() => window.location.reload()}
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  if (groupedAnalyses.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-md text-center">
        <img src="/images/empty-data.svg" alt="Empty Data" className="h-40 mx-auto mb-6" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Belum ada riwayat analisis</h3>
        <p className="text-gray-600 mb-6">Mulai dengan mengunggah gambar retina untuk dianalisis.</p>
        <button 
          onClick={() => navigate('/scan-retina')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Mulai Analisis Baru
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
        <h2 className="text-xl font-bold text-white">Riwayat Analisis Pasien</h2>
        <p className="text-blue-100 mt-1 text-sm">Klik pada baris untuk melihat detail riwayat pasien</p>
      </div>
      
      {/* Filters */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari nama pasien..."
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            <div className="relative">
              <select
                className="pl-10 pr-8 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none"
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
              <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <FiChevronRight className="transform rotate-90 text-gray-400" />
              </div>
            </div>
            
            <div className="relative">
              <select
                className="pl-10 pr-8 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none"
                value={patientFilter}
                onChange={(e) => setPatientFilter(e.target.value)}
              >
                <option value="all">Semua Pasien</option>
                {patients.map(patient => (
                  <option key={patient._id} value={patient._id}>
                    {patient.fullName || patient.name || 'Pasien Tanpa Nama'}
                  </option>
                ))}
              </select>
              <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <FiChevronRight className="transform rotate-90 text-gray-400" />
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            Total: <span className="font-semibold">{filteredGroupedAnalyses.length} pasien</span>
          </div>
        </div>
      </div>
      
      {/* History List - Grouped by Patient */}
      <div className="divide-y divide-gray-200">
        <AnimatePresence>
          {currentItems.length > 0 ? (
            currentItems.map((patientGroup, index) => (
              <motion.div 
                key={patientGroup.patient._id || `patient-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                className="p-5 hover:bg-blue-50 transition-colors cursor-pointer relative"
                onClick={() => navigateToPatientDetail(patientGroup)}
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Thumbnail dan badge severity */}
                  <div className="md:col-span-2 relative">
                    <div className="relative h-20 w-20 md:h-24 md:w-24 rounded-lg overflow-hidden border border-gray-200 shadow-sm transition-transform hover:scale-105">
                      {/* Image loading state */}
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10 opacity-0 transition-opacity" id={`loading-${patientGroup.patient._id}`}>
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                      </div>
                      
                      {/* Gambar thumbnail */}
                      <img 
                        src={getImageSource(patientGroup.latestAnalysis)} 
                        alt="Retina scan" 
                        className="h-full w-full object-cover transform transition-transform hover:scale-110"
                        onLoad={() => {
                          const loadingEl = document.getElementById(`loading-${patientGroup.patient._id}`);
                          if (loadingEl) loadingEl.style.opacity = '0';
                        }}
                        onError={(e) => {
                          const loadingEl = document.getElementById(`loading-${patientGroup.patient._id}`);
                          if (loadingEl) loadingEl.style.opacity = '0';
                          
                          e.target.onerror = null;
                          e.target.src = '/images/default-retina.jpg';
                        }}
                      />
                      
                      {/* Badge overlay */}
                      <div className="absolute bottom-0 left-0 right-0 py-1 px-2 bg-black bg-opacity-60">
                        <div className="flex items-center justify-center">
                          {getSeverityBadge(patientGroup.latestAnalysis.severity || 'Tidak diketahui', 'sm')}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Info pasien */}
                  <div className="md:col-span-4">
                    <h3 className="font-semibold text-gray-800 text-lg">
                      {patientGroup.patient.fullName || patientGroup.patient.name || 'Pasien Tanpa Nama'}
                    </h3>
                    <div className="flex items-center mt-2 text-sm text-gray-600">
                      <FiUser className="mr-2 text-blue-500" />
                      <span>
                        {patientGroup.patient.gender === 'male' ? 'Laki-laki' : 
                         patientGroup.patient.gender === 'female' ? 'Perempuan' : 'Tidak diketahui'}, 
                        {patientGroup.patient.age ? ` ${patientGroup.patient.age} tahun` : ' Umur tidak diketahui'}
                      </span>
                    </div>
                    <div className="flex items-center mt-2 text-sm text-gray-600">
                      <FiList className="mr-2 text-blue-500" />
                      <span>{patientGroup.totalAnalyses || 0} analisis</span>
                    </div>
                  </div>
                  
                  {/* Latest analysis info */}
                  <div className="md:col-span-4">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                          <FiCalendar className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Terbaru</p>
                          <p className="text-sm font-medium text-gray-700">
                            {formatDate(patientGroup.latestAnalysis?.createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
                          <FiPercent className="text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Kepercayaan</p>
                          <p className="text-sm font-medium text-gray-700">
                            {formatPercentage(patientGroup.latestAnalysis?.confidence)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                          <FiFileText className="text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Catatan</p>
                          <p className="text-sm font-medium text-gray-700 truncate max-w-[250px]" title={patientGroup.latestAnalysis?.notes || patientGroup.latestAnalysis?.recommendation || 'Tidak ada catatan'}>
                            {patientGroup.latestAnalysis?.notes || patientGroup.latestAnalysis?.recommendation || 'Tidak ada catatan'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action button */}
                  <div className="md:col-span-2 flex justify-end">
                    <motion.div 
                      className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FiEye className="text-white text-lg" />
                    </motion.div>
                  </div>
                </div>
                
                {/* Latest analysis time & count badge */}
                <div className="absolute top-2 right-2 flex items-center space-x-2">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {patientGroup.totalAnalyses || 0} pemindaian
                  </span>
                  <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                    <FiClock className="mr-1" />
                    {formatShortDate(patientGroup.latestAnalysis?.createdAt)}
                  </span>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 text-center"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <FiInfo className="text-blue-500 text-xl" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Tidak Ada Data Ditemukan</h3>
              <p className="text-gray-500">Tidak ada data yang sesuai dengan filter yang dipilih.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-200 flex justify-center">
          <div className="flex items-center space-x-2">
            <button
              className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <FiChevronLeft />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`w-8 h-8 rounded-md flex items-center justify-center ${
                  currentPage === i + 1
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-100'
                }`}
                onClick={() => paginate(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            
            <button
              className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default History;