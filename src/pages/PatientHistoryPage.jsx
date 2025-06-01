import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { withPageTransition } from '../context/ThemeContext';
import { getPatientHistory, deleteAnalysis } from '../services/api';
import { API_URL } from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import { RetinaScanPdfDownload } from '../components/dashboard/RetinaScanPdf';
import { 
  FiArrowLeft, 
  FiUser, 
  FiCalendar, 
  FiAlertTriangle, 
  FiPercent, 
  FiFileText,
  FiBarChart2,
  FiRefreshCcw,
  FiTrash,
  FiDownload
} from 'react-icons/fi';
import ReactDOM from 'react-dom';

// Daftar URL endpoint alternatif yang akan dicoba jika URL utama gagal
const FALLBACK_API_URLS = [
  API_URL,
  'https://retinascan-backend-eszo.onrender.com'
];

// Default fallback image ketika gambar tidak dapat ditemukan
const DEFAULT_IMAGE = '/images/not-found.jpg';

// Fungsi untuk cek apakah gambar benar-benar ada di server
const checkImageExistence = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Failed to check image existence:', error);
    return false;
  }
};

// Format image URL properly regardless of path separator
const formatImageUrl = (imagePath) => {
  if (!imagePath) return DEFAULT_IMAGE;
  
  // Jika imagePath sudah berupa data base64, gunakan langsung
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  // Jika imagePath sudah lengkap (relatif maupun absolut), gunakan langsung
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Sanitasi path - hilangkan karakter tidak valid
  let sanitizedPath = imagePath.replace(/[*?"<>|]/g, '');
  
  // Ekstrak filename dari path apapun (Windows atau Unix)
  let filename;
  
  // Metode 1: Ambil bagian setelah karakter / atau \ terakhir
  const lastSlashIndex = Math.max(
    sanitizedPath.lastIndexOf('/'), 
    sanitizedPath.lastIndexOf('\\')
  );
  
  if (lastSlashIndex !== -1) {
    filename = sanitizedPath.substring(lastSlashIndex + 1);
  } else {
    filename = sanitizedPath; // Jika tidak ada slash, maka ini sudah filename
  }
  
  // Pastikan tidak ada backslash di URL (ganti dengan forward slash)
  filename = filename.replace(/\\/g, '/');
  
  // Hapus karakter khusus atau path traversal yang tidak valid dalam URL
  filename = filename.replace(/[\/\\:*?"<>|]/g, '');
  
  if (!filename || filename.trim() === '') {
    console.error('Failed to extract valid filename from path:', imagePath);
    return DEFAULT_IMAGE;
  }
  
  // Coba semua alternatif URL yang mungkin
  const timestamp = new Date().getTime(); // Tambahkan timestamp untuk mencegah cache
  
  // Gunakan URL yang lebih konsisten dengan base URL API
  if (API_URL) {
    return `${API_URL}/uploads/${filename}?t=${timestamp}`;
  }
  
  // Fallback jika API_URL tidak tersedia
  return `/uploads/${filename}?t=${timestamp}`;
};

function PatientHistoryPageComponent() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState(null);
  const [patientAnalyses, setPatientAnalyses] = useState([]);
  const [selectedAnalysisIndex, setSelectedAnalysisIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageStatus, setImageStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [imageLoadAttempt, setImageLoadAttempt] = useState(0);
  const [activeImageUrl, setActiveImageUrl] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
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

  useEffect(() => {
    const fetchPatientHistory = async () => {
      try {
        setIsLoading(true);
        
        // Gunakan fungsi getPatientHistory dari services/api.js
        const response = await getPatientHistory(patientId);
        
        // Respons berisi data pasien dan riwayat analisisnya
        const { patient, analyses } = response;
        
        if (analyses.length === 0) {
          setError('Pasien ini belum memiliki riwayat analisis');
        } else {
          setPatientData(patient);
          setPatientAnalyses(analyses);
        }
      } catch (err) {
        console.error('Error fetching patient history:', err);
        setError('Gagal memuat riwayat pasien. Mohon coba lagi nanti.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPatientHistory();
  }, [patientId]);

  // Reset image status when changing analysis
  useEffect(() => {
    if (patientAnalyses && patientAnalyses.length > 0) {
      setImageStatus('loading');
      
      // Prioritaskan penggunaan imageData (base64) jika tersedia
      if (patientAnalyses[selectedAnalysisIndex].imageData) {
        // Jika ada imageData, tidak perlu URL tambahan
        setActiveImageUrl('');
        console.log('Menggunakan data base64 dari database untuk analisis');
      } 
      // Jika tidak ada imageData, coba gunakan path sebagai fallback
      else if (patientAnalyses[selectedAnalysisIndex].imageUrl) {
        const imageUrl = formatImageUrl(patientAnalyses[selectedAnalysisIndex].imageUrl);
        setActiveImageUrl(imageUrl);
        console.log('Menggunakan URL gambar sebagai fallback:', imageUrl);
      } else {
        // Tidak ada imageData atau imagePath, gunakan gambar default
        setActiveImageUrl(DEFAULT_IMAGE);
        console.log('Tidak ada data gambar tersedia, menggunakan gambar default');
      }
    }
  }, [selectedAnalysisIndex, patientAnalyses]);

  // Format date helper
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Get severity badge style
  const getSeverityBadge = (severity) => {
    const severityLower = severity.toLowerCase();
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

  // Handle back to history page
  const handleBack = () => {
    navigate('/history');
  };
  
  // Menampilkan konfirmasi delete
  const handleDelete = (id, e) => {
    e.stopPropagation(); // Mencegah event click menyebar ke div parent
    setIdToDelete(id);
    setShowConfirmDelete(true);
  };
  
  // Menghandle konfirmasi delete
  const handleConfirmDelete = async () => {
    try {
      await deleteAnalysis(idToDelete);
      
      // Refresh data setelah menghapus
      const response = await getPatientHistory(patientId);
      
      // Perbarui state dengan data terbaru
      if (response.analyses.length === 0) {
        setError('Pasien ini belum memiliki riwayat analisis');
        setPatientAnalyses([]);
      } else {
        setPatientData(response.patient);
        setPatientAnalyses(response.analyses);
        
        // Reset selectedAnalysisIndex jika analisis yang dihapus adalah yang sedang dipilih
        if (selectedAnalysisIndex >= response.analyses.length) {
          setSelectedAnalysisIndex(0);
        }
      }
      
      setShowConfirmDelete(false);
      setIdToDelete(null);
    } catch (err) {
      console.error('Error deleting analysis:', err);
      alert('Gagal menghapus analisis. Silakan coba lagi nanti.');
    }
  };

  // Menghitung distribusi tingkat keparahan
  const calculateSeverityDistribution = () => {
    if (!patientData) return {};
    
    const distribution = {
      tidakAda: 0,
      ringan: 0,
      sedang: 0,
      berat: 0,
      sangatBerat: 0
    };
    
    patientAnalyses.forEach(analysis => {
      const severity = analysis.severity.toLowerCase();
      if (severity === 'tidak ada' || severity === 'normal') {
        distribution.tidakAda++;
      } else if (severity === 'ringan' || severity === 'rendah') {
        distribution.ringan++;
      } else if (severity === 'sedang') {
        distribution.sedang++;
      } else if (severity === 'berat' || severity === 'parah') {
        distribution.berat++;
      } else if (severity === 'sangat berat' || severity === 'proliferative dr') {
        distribution.sangatBerat++;
      } else {
        // Fallback berdasarkan severityLevel jika ada
        const level = analysis.severityLevel || 0;
        if (level === 0) distribution.tidakAda++;
        else if (level === 1) distribution.ringan++;
        else if (level === 2) distribution.sedang++;
        else if (level === 3) distribution.berat++;
        else if (level === 4) distribution.sangatBerat++;
        else distribution.ringan++; // Default fallback
      }
    });
    
    return distribution;
  };
  
  const severityDistribution = calculateSeverityDistribution();
  const totalAnalyses = patientAnalyses.length;

  // Fungsi untuk mengunduh PDF
  const handleDownloadPdf = async () => {
    try {
      if (!patientData || !patientAnalyses[selectedAnalysisIndex]) {
        return;
      }
      
      setIsPdfLoading(true);
      
      const analysis = patientAnalyses[selectedAnalysisIndex];
      const patient = patientData;
      
      // Siapkan data untuk PDF
      const reportData = {
        date: analysis.createdAt,
        patient: patient,
        severity: analysis.severity,
        confidence: analysis.confidence,
        image: analysis.imageData || activeImageUrl,
        details: analysis.notes || '',
        recommendations: analysis.notes || '',
      };
      
      // Nama file
      const fileName = `RetinaScan_${patient.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Buat elemen untuk RetinaScanPdfDownload
      const pdfLink = document.createElement('div');
      pdfLink.style.display = 'none';
      document.body.appendChild(pdfLink);
      
      // Render RetinaScanPdfDownload
      ReactDOM.render(
        <RetinaScanPdfDownload report={reportData} fileName={fileName} darkMode={darkMode} />,
        pdfLink,
        () => {
          // Klik tombol download secara otomatis
          setTimeout(() => {
            const downloadButton = pdfLink.querySelector('a');
            if (downloadButton) {
              downloadButton.click();
            }
            // Hapus elemen setelah download
            setTimeout(() => {
              ReactDOM.unmountComponentAtNode(pdfLink);
              document.body.removeChild(pdfLink);
              setIsPdfLoading(false);
            }, 1000);
          }, 100);
        }
      );
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Gagal membuat PDF. Silakan coba lagi.');
      setIsPdfLoading(false);
    }
  };

  return (
    <motion.div 
      className={`p-4 sm:p-6 lg:p-8 min-h-screen ${
        darkMode 
          ? 'bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-b from-blue-50 to-white'
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header with back button */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex items-center mb-6"
        >
          <motion.button 
            variants={itemVariants}
            onClick={handleBack}
            className={`mr-4 p-2 rounded-full transition-colors ${
              darkMode 
                ? 'hover:bg-gray-700 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiArrowLeft size={20} />
          </motion.button>
          <motion.h1 
            variants={itemVariants}
            className={`text-2xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}
          >
            Riwayat Pasien
          </motion.h1>
        </motion.div>
        
        {isLoading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center py-20"
          >
            <div className="flex flex-col items-center">
              <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${
                darkMode ? 'border-blue-500' : 'border-blue-600'
              } mb-3`}></div>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-500'}>Memuat data pasien...</p>
            </div>
          </motion.div>
        ) : error ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`${
              darkMode 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white'
            } rounded-xl shadow-xl p-6 text-center`}
          >
            <motion.div variants={itemVariants}>
              <FiAlertTriangle className={`${
                darkMode ? 'text-yellow-400' : 'text-yellow-500'
              } text-5xl mx-auto mb-4`} />
              <h3 className={`text-xl font-medium ${
                darkMode ? 'text-gray-200' : 'text-gray-800'
              } mb-2`}>{error}</h3>
              <p className={`${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              } mb-6`}>Tidak dapat menemukan riwayat analisis untuk pasien ini.</p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleBack}
                className={`px-4 py-2 ${
                  darkMode
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                } text-white rounded-lg shadow-md transition-colors`}
              >
                Kembali ke Daftar Pasien
              </motion.button>
            </motion.div>
          </motion.div>
        ) : patientData && patientAnalyses.length > 0 ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Patient Info Card */}
            <motion.div 
              variants={itemVariants}
              className="lg:col-span-1"
            >
              <div className={`${
                darkMode 
                  ? 'bg-gray-800 border border-gray-700' 
                  : 'bg-white'
              } rounded-xl shadow-xl p-6 mb-6`}>
                <h3 className={`text-lg font-semibold ${
                  darkMode ? 'text-white' : 'text-gray-800'
                } mb-4 flex items-center`}>
                  <div className={`p-2 rounded-full mr-3 ${
                    darkMode 
                      ? 'bg-blue-900/30 text-blue-400' 
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    <FiUser />
                  </div>
                  Informasi Pasien
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>Nama Lengkap</p>
                    <p className={`font-medium ${
                      darkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>{patientData.fullName || patientData.name}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>Jenis Kelamin</p>
                    <p className={`font-medium ${
                      darkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>{patientData.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>Usia</p>
                    <p className={`font-medium ${
                      darkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>{patientData.age || '-'} tahun</p>
                  </div>
                  <div>
                    <p className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>Tanggal Lahir</p>
                    <p className={`font-medium ${
                      darkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                      {patientData.dateOfBirth ? formatDate(patientData.dateOfBirth).split(',')[0] : '-'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>Total Pemindaian</p>
                    <p className={`font-medium ${
                      darkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>{totalAnalyses} kali</p>
                  </div>
                  <div>
                    <p className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>Pemindaian Terakhir</p>
                    <p className={`font-medium ${
                      darkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                      {patientAnalyses[0] ? formatDate(patientAnalyses[0].createdAt) : '-'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Analysis History List */}
              <div className={`${
                darkMode 
                  ? 'bg-gray-800 border border-gray-700' 
                  : 'bg-white'
              } rounded-xl shadow-xl p-6`}>
                <h3 className={`text-lg font-semibold ${
                  darkMode ? 'text-white' : 'text-gray-800'
                } mb-4 flex items-center`}>
                  <div className={`p-2 rounded-full mr-3 ${
                    darkMode 
                      ? 'bg-purple-900/30 text-purple-400' 
                      : 'bg-purple-100 text-purple-600'
                  }`}>
                    <FiFileText />
                  </div>
                  Riwayat Pemindaian
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  <AnimatePresence>
                    {patientAnalyses.map((analysis, index) => (
                      <motion.div 
                        key={analysis.id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedAnalysisIndex(index)}
                        className={`p-3 rounded-lg cursor-pointer transition-all ${
                          selectedAnalysisIndex === index 
                            ? darkMode
                              ? 'bg-blue-900/30 border-l-4 border-blue-500'
                              : 'bg-blue-50 border-l-4 border-blue-500'
                            : darkMode
                              ? 'bg-gray-700/50 hover:bg-gray-700'
                              : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className={`text-sm font-medium ${
                              darkMode ? 'text-gray-200' : 'text-gray-800'
                            }`}>
                              {formatDate(analysis.createdAt)}
                            </p>
                            <div className="flex items-center mt-1">
                              <span className={`px-2 py-0.5 rounded-full text-xs ${
                                darkMode
                                  ? analysis.severity.toLowerCase().includes('tidak') || analysis.severity.toLowerCase().includes('normal')
                                    ? 'bg-blue-900/30 text-blue-400'
                                    : analysis.severity.toLowerCase().includes('ringan')
                                      ? 'bg-green-900/30 text-green-400'
                                      : analysis.severity.toLowerCase().includes('sedang')
                                        ? 'bg-yellow-900/30 text-yellow-400'
                                        : analysis.severity.toLowerCase().includes('berat')
                                          ? 'bg-red-900/30 text-red-400'
                                          : 'bg-purple-900/30 text-purple-400'
                                  : getSeverityBadge(analysis.severity)
                              }`}>
                                {analysis.severity}
                              </span>
                              <span className={`text-xs ${
                                darkMode ? 'text-gray-400' : 'text-gray-500'
                              } ml-2`}>
                                {(analysis.confidence * 100).toFixed(0)}% keyakinan
                              </span>
                            </div>
                          </div>
                          {selectedAnalysisIndex === index && (
                            <div className={`h-2 w-2 rounded-full ${
                              darkMode ? 'bg-blue-500' : 'bg-blue-500'
                            }`}></div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
            
            {/* Analysis Details */}
            <motion.div 
              variants={itemVariants}
              className="lg:col-span-2"
            >
              {patientAnalyses[selectedAnalysisIndex] && (
                <div className={`${
                  darkMode 
                    ? 'bg-gray-800 border border-gray-700' 
                    : 'bg-white'
                } rounded-xl shadow-xl p-6`}>
                  <div className="flex justify-between items-start mb-6">
                    <h3 className={`text-lg font-semibold ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      Detail Analisis
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleDownloadPdf}
                        disabled={isPdfLoading}
                        className={`p-2 ${
                          darkMode
                            ? 'text-blue-300 hover:bg-gray-700'
                            : 'text-blue-600 hover:bg-gray-100'
                        } rounded-full transition-colors`}
                        title="Unduh PDF"
                      >
                        {isPdfLoading ? (
                          <div className={`animate-spin h-5 w-5 ${
                            darkMode ? 'border-blue-300' : 'border-blue-600'
                          } border-t-transparent rounded-full`}></div>
                        ) : (
                          <FiDownload size={18} />
                        )}
                      </button>
                      <button
                        onClick={(e) => handleDelete(patientAnalyses[selectedAnalysisIndex].id, e)}
                        className={`p-2 ${
                          darkMode
                            ? 'text-red-300 hover:bg-gray-700'
                            : 'text-red-600 hover:bg-gray-100'
                        } rounded-full transition-colors`}
                        title="Hapus Analisis"
                      >
                        <FiTrash size={18} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Image Preview */}
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <p className={`text-sm font-medium ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      } mb-2`}>Gambar Retina</p>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => {
                            const imgEl = document.getElementById('retina-image');
                            if (imgEl) {
                              delete imgEl.dataset.fallbackAttempted;
                              setImageStatus('loading');
                              setImageLoadAttempt(prev => prev + 1);
                              
                              // Enforce re-rendering with a small delay
                              setTimeout(() => {
                                if (patientAnalyses[selectedAnalysisIndex].imagePath) {
                                imgEl.src = formatImageUrl(patientAnalyses[selectedAnalysisIndex].imagePath);
                                } else if (patientAnalyses[selectedAnalysisIndex].imageData) {
                                  imgEl.src = patientAnalyses[selectedAnalysisIndex].imageData;
                                }
                              }, 50);
                            }
                          }}
                          className={`px-2 py-1 ${
                            darkMode
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                          } rounded text-xs flex items-center`}
                          title="Muat ulang gambar"
                        >
                          <FiRefreshCcw className="mr-1" /> Refresh
                        </button>
                      </div>
                    </div>
                    
                    {/* Debug info panel (tersembunyi) */}
                    <div id="debug-image-info" className="mb-2 p-2 bg-gray-700 text-white text-xs rounded hidden">
                      {patientAnalyses[selectedAnalysisIndex].imagePath && (
                        <>
                          <p><strong>Original:</strong> {patientAnalyses[selectedAnalysisIndex].imagePath}</p>
                          <p><strong>Filename:</strong> {patientAnalyses[selectedAnalysisIndex].imagePath.split(/[\/\\]/).pop()}</p>
                          <p><strong>URL:</strong> {formatImageUrl(patientAnalyses[selectedAnalysisIndex].imagePath)}</p>
                        </>
                      )}
                    </div>
                    
                    <div className="relative aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden">
                      {patientAnalyses[selectedAnalysisIndex] ? (
                        <>
                          {imageStatus === 'loading' && (
                            <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-100/80">
                              <div className="flex flex-col items-center space-y-2">
                                <div className={`animate-spin rounded-full h-8 w-8 ${
                                  darkMode ? 'border-blue-300' : 'border-blue-600'
                                } border-t-2 border-b-2`}></div>
                                <p className={`text-xs ${
                                  darkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>Memuat gambar...</p>
                              </div>
                            </div>
                          )}
                          <img 
                            id="retina-image"
                            src={patientAnalyses[selectedAnalysisIndex].imageData || activeImageUrl || DEFAULT_IMAGE}
                            alt="Retina scan"
                            className="object-cover w-full h-full"
                            onLoad={() => setImageStatus('success')}
                            onError={(e) => {
                              console.error('Error loading image:', e.target.src.substring(0, 50) + '...');
                              
                              // Stop onError dari berjalan lagi untuk mencegah infinite loop
                              e.target.onerror = null;
                              
                              // Tandai error dan gunakan gambar default
                              setImageStatus('error');
                              
                              // Prioritaskan imageData (base64) jika tersedia
                              if (patientAnalyses[selectedAnalysisIndex].imageData) {
                                console.log('Menggunakan data base64 dari database');
                                
                                // Pastikan imageData adalah string base64 yang valid
                                const imageData = patientAnalyses[selectedAnalysisIndex].imageData;
                                if (imageData && imageData.startsWith('data:')) {
                                  e.target.src = imageData;
                                  return;
                                }
                              }
                              
                              // Coba file path sebagai alternatif jika yang gagal adalah base64
                              if (activeImageUrl) {
                                console.log('Mencoba menggunakan URL file sebagai fallback');
                                e.target.src = activeImageUrl;
                                return;
                              }
                              
                              // Gunakan gambar not-found.jpg sebagai fallback terakhir
                              e.target.src = DEFAULT_IMAGE;
                              console.log('Menggunakan gambar tidak ditemukan:', DEFAULT_IMAGE);
                            }}
                          />
                          
                          {imageStatus === 'error' && (
                            <div className="absolute bottom-0 left-0 right-0 bg-red-500/80 p-2 text-xs text-white text-center">
                              Gagal memuat gambar. Silakan coba tombol Refresh atau API alternatif.
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className={`text-sm ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>Gambar tidak tersedia</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Analysis Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <p className={`text-sm font-medium ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      } mb-2`}>Nama File</p>
                      <p className={`text-base font-medium break-words ${
                        darkMode ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        {patientAnalyses[selectedAnalysisIndex].originalFilename}
                      </p>
                    </div>
                    
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <p className={`text-sm font-medium ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      } mb-2`}>Tingkat Keparahan</p>
                      <span className={`px-3 py-1 rounded-full text-sm inline-block ${
                        darkMode
                          ? analysis.severity.toLowerCase().includes('tidak') || analysis.severity.toLowerCase().includes('normal')
                            ? 'bg-blue-900/30 text-blue-400'
                            : analysis.severity.toLowerCase().includes('ringan')
                              ? 'bg-green-900/30 text-green-400'
                              : analysis.severity.toLowerCase().includes('sedang')
                                ? 'bg-yellow-900/30 text-yellow-400'
                                : analysis.severity.toLowerCase().includes('berat')
                                  ? 'bg-red-900/30 text-red-400'
                                  : 'bg-purple-900/30 text-purple-400'
                          : getSeverityBadge(analysis.severity)
                      }`}>
                        {analysis.severity}
                      </span>
                    </div>
                    
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <p className={`text-sm font-medium ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      } mb-2`}>Tingkat Kepercayaan</p>
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                          <div 
                            className={`bg-blue-600 h-2.5 rounded-full ${
                              darkMode ? 'bg-blue-900' : ''
                            }`}
                            style={{ width: `${(analysis.confidence * 100).toFixed(0)}%` }}
                          ></div>
                        </div>
                        <span className={`text-base font-medium min-w-[60px] text-right ${
                          darkMode ? 'text-gray-200' : 'text-gray-800'
                        }`}>
                          {(analysis.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <p className={`text-sm font-medium ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      } mb-2`}>Tanggal Analisis</p>
                      <p className={`text-base font-medium ${
                        darkMode ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        {formatDate(analysis.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Notes */}
                  {analysis.notes && (
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <p className={`text-sm font-medium ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      } mb-2`}>Catatan</p>
                      <p className={`text-base ${
                        darkMode ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        {analysis.notes}
                      </p>
                    </div>
                  )}
                  
                  {/* Recommendations based on severity */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className={`text-sm font-medium ${
                      darkMode ? 'text-blue-200' : 'text-blue-800'
                    } mb-2`}>Rekomendasi</p>
                    <p className={`text-base text-blue-700 ${
                      darkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                      {analysis.notes ? (
                        analysis.notes
                      ) : analysis.severity.toLowerCase() === 'tidak ada' ? (
                        'Lakukan pemeriksaan rutin setiap tahun.'
                      ) : analysis.severity.toLowerCase() === 'ringan' ? (
                        'Kontrol gula darah dan tekanan darah. Pemeriksaan ulang dalam 9-12 bulan.'
                      ) : analysis.severity.toLowerCase() === 'sedang' ? (
                        'Konsultasi dengan dokter spesialis mata. Pemeriksaan ulang dalam 6 bulan.'
                      ) : analysis.severity.toLowerCase() === 'berat' ? (
                        'Rujukan segera ke dokter spesialis mata. Pemeriksaan ulang dalam 2-3 bulan.'
                      ) : analysis.severity.toLowerCase() === 'sangat berat' ? (
                        'Rujukan segera ke dokter spesialis mata untuk evaluasi dan kemungkinan tindakan laser atau operasi.'
                      ) : (
                        'Lakukan pemeriksaan rutin setiap tahun.'
                      )}
                    </p>
                  </div>
                  
                  {/* Download PDF Button */}
                  <div className="mt-6 flex justify-center">
                    {patientAnalyses[selectedAnalysisIndex] && (
                      <RetinaScanPdfDownload
                        report={{
                          date: patientAnalyses[selectedAnalysisIndex].createdAt,
                          patient: patientData,
                          severity: patientAnalyses[selectedAnalysisIndex].severity,
                          confidence: patientAnalyses[selectedAnalysisIndex].confidence,
                          image: patientAnalyses[selectedAnalysisIndex].imageData || activeImageUrl,
                          details: patientAnalyses[selectedAnalysisIndex].notes || '',
                          recommendations: patientAnalyses[selectedAnalysisIndex].notes || '',
                        }}
                        fileName={`RetinaScan_${patientData.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`}
                        darkMode={darkMode}
                      />
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`${
              darkMode 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white'
            } rounded-xl shadow-xl p-6 text-center`}
          >
            <motion.div variants={itemVariants}>
              <FiFileText className={`${
                darkMode ? 'text-gray-400' : 'text-gray-400'
              } text-5xl mx-auto mb-4`} />
              <h3 className={`text-xl font-medium ${
                darkMode ? 'text-gray-200' : 'text-gray-700'
              } mb-2`}>Belum Ada Riwayat</h3>
              <p className={`${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              } mb-6`}>Pasien ini belum memiliki riwayat analisis retina.</p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleBack}
                className={`px-4 py-2 ${
                  darkMode
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                } text-white rounded-lg shadow-md transition-colors`}
              >
                Kembali ke Daftar Pasien
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </div>
      
      {/* Confirm Delete Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`${
              darkMode 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white'
            } rounded-xl shadow-xl p-6 max-w-md w-full mx-4`}
          >
            <h3 className={`text-xl font-medium ${
              darkMode ? 'text-white' : 'text-gray-800'
            } mb-4`}>Konfirmasi Hapus</h3>
            <p className={`${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            } mb-6`}>Apakah Anda yakin ingin menghapus analisis ini? Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex justify-end space-x-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowConfirmDelete(false)}
                className={`px-4 py-2 rounded-lg ${
                  darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Batal
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleConfirmDelete}
                className={`px-4 py-2 ${
                  darkMode
                    ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                } text-white rounded-lg shadow-md transition-colors`}
              >
                Hapus
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

const PatientHistoryPage = withPageTransition(PatientHistoryPageComponent);
export default PatientHistoryPage; 