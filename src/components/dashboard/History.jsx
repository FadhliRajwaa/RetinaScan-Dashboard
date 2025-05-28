import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getHistory } from '../../services/api';
import { FiCalendar, FiAlertTriangle, FiPercent, FiFileText, FiSearch, FiChevronLeft, FiChevronRight, FiFilter, FiEye, FiUser, FiList, FiClock } from 'react-icons/fi';
import axios from 'axios';
import { getSeverityBadge } from '../../utils/severityUtils';

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
  
  // Helper untuk mendapatkan sumber gambar dengan prioritas imageData
  const getImageSource = (analysis) => {
    // Jika ada imageData (base64), gunakan itu
    if (analysis.imageData) {
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
    
    // Fallback ke default image jika tidak ada source yang valid
    return '/images/default-retina.jpg';
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
                    {patient.fullName || patient.name}
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
          {currentItems.map((patientGroup, index) => (
            <motion.div 
              key={patientGroup.patient._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 hover:bg-blue-50 transition-colors cursor-pointer relative"
              onClick={() => navigateToPatientDetail(patientGroup)}
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Thumbnail dan badge severity */}
                <div className="md:col-span-2 relative">
                  <div className="relative h-16 w-16 md:h-20 md:w-20 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                    {/* Gambar thumbnail */}
                    <img 
                      src={getImageSource(patientGroup.latestAnalysis)} 
                      alt="Retina scan" 
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/default-retina.jpg';
                      }}
                    />
                    
                    {/* Badge overlay */}
                    <div className="absolute bottom-0 left-0 right-0 py-1 px-2 bg-black bg-opacity-60">
                      <div className="flex items-center justify-center">
                        {getSeverityBadge(patientGroup.latestAnalysis.severity, 'sm')}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Info pasien */}
                <div className="md:col-span-4">
                  <h3 className="font-semibold text-gray-800">{patientGroup.patient.fullName || patientGroup.patient.name}</h3>
                  <div className="flex items-center mt-1 text-sm text-gray-600">
                    <FiUser className="mr-1 text-blue-500" />
                    <span>{patientGroup.patient.gender === 'male' ? 'Laki-laki' : 'Perempuan'}, {patientGroup.patient.age || '-'} tahun</span>
                  </div>
                  <div className="flex items-center mt-1 text-sm text-gray-600">
                    <FiList className="mr-1 text-blue-500" />
                    <span>{patientGroup.totalAnalyses} analisis</span>
                  </div>
                </div>
                
                {/* Latest analysis info */}
                <div className="md:col-span-4">
                  <div className="flex flex-col">
                    <div className="flex items-center mb-1">
                      <FiCalendar className="mr-1 text-blue-500" />
                      <span className="text-sm text-gray-600">Terbaru: {formatDate(patientGroup.latestAnalysis.createdAt)}</span>
                    </div>
                    <div className="flex items-center mb-1">
                      <FiPercent className="mr-1 text-blue-500" />
                      <span className="text-sm text-gray-600">Confidence: {(patientGroup.latestAnalysis.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center">
                      <FiFileText className="mr-1 text-blue-500" />
                      <span className="text-sm text-gray-600 truncate max-w-xs">
                        {patientGroup.latestAnalysis.notes || patientGroup.latestAnalysis.recommendation || 'Tidak ada catatan'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Action button */}
                <div className="md:col-span-2 flex justify-end">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors">
                    <FiEye className="text-blue-600" />
                  </div>
                </div>
              </div>
              
              {/* Latest analysis time */}
              <div className="absolute top-2 right-2 flex items-center text-xs text-gray-500">
                <FiClock className="mr-1" />
                <span>{new Date(patientGroup.latestAnalysis.createdAt).toLocaleDateString('id-ID')}</span>
              </div>
            </motion.div>
          ))}
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