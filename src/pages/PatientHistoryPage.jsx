import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { withPageTransition } from '../context/ThemeContext';
import { getHistory, deleteAnalysis } from '../services/api';
import { API_URL } from '../utils/api';
import axios from 'axios';
import { 
  FiArrowLeft, 
  FiUser, 
  FiCalendar, 
  FiAlertTriangle, 
  FiPercent, 
  FiFileText,
  FiBarChart2,
  FiRefreshCcw,
  FiTrash
} from 'react-icons/fi';

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
  
  // Metode 2: Jika path berisi 'uploads', ekstrak bagian setelahnya
  if (sanitizedPath.includes('uploads')) {
    const parts = sanitizedPath.split(/uploads[\/\\]?/);
    if (parts.length > 1) {
      const afterUploads = parts[parts.length - 1];
      // Hapus slash awal jika ada
      filename = afterUploads.replace(/^[\/\\]/, '');
    }
  }
  
  // Pastikan tidak ada backslash di URL (ganti dengan forward slash)
  filename = filename.replace(/\\/g, '/');
  
  // Hapus karakter khusus atau path traversal yang tidak valid dalam URL
  filename = filename.replace(/[\/\\:*?"<>|]/g, '');
  
  if (!filename || filename.trim() === '') {
    console.error('Failed to extract valid filename from path:', imagePath);
    return DEFAULT_IMAGE;
  }
  
  // Coba semua alternatif URL yang mungkin (tanpa timestamp)
  return `${API_URL}/uploads/${filename}`;
};

function PatientHistoryPageComponent() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState(null);
  const [selectedAnalysisIndex, setSelectedAnalysisIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageStatus, setImageStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [imageLoadAttempt, setImageLoadAttempt] = useState(0);
  const [activeImageUrl, setActiveImageUrl] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  useEffect(() => {
    const fetchPatientHistory = async () => {
      try {
        setIsLoading(true);
        // Ambil semua riwayat analisis
        const data = await getHistory();
        
        // Fungsi untuk mengelompokkan analisis berdasarkan pasien
        const groupAnalysesByPatient = (analyses) => {
          // Buat objek untuk menyimpan analisis dikelompokkan berdasarkan patientId
          const groupedByPatient = {};
          
          // Iterasi melalui semua analisis
          analyses.forEach(analysis => {
            if (!analysis.patientId) return;
            
            const id = analysis.patientId._id;
            
            // Jika pasien belum ada di objek, tambahkan
            if (!groupedByPatient[id]) {
              groupedByPatient[id] = {
                patient: analysis.patientId,
                analyses: [analysis],
                latestAnalysis: analysis,
                totalAnalyses: 1
              };
            } else {
              // Tambahkan analisis ke array analisis pasien
              groupedByPatient[id].analyses.push(analysis);
              groupedByPatient[id].totalAnalyses++;
              
              // Perbarui analisis terbaru jika analisis ini lebih baru
              if (new Date(analysis.createdAt) > new Date(groupedByPatient[id].latestAnalysis.createdAt)) {
                groupedByPatient[id].latestAnalysis = analysis;
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

        // Kelompokkan analisis berdasarkan pasien
        const groupedData = groupAnalysesByPatient(data);
        
        // Cari data pasien yang sesuai dengan patientId
        const patientHistory = groupedData.find(item => item.patient._id === patientId);
        
        if (!patientHistory) {
          setError('Data pasien tidak ditemukan');
        } else {
          setPatientData(patientHistory);
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
    if (patientData && patientData.analyses.length > 0) {
      setImageStatus('loading');
      
      // Prioritaskan penggunaan imageData (base64) jika tersedia
      if (patientData.analyses[selectedAnalysisIndex].imageData) {
        // Jika ada imageData, tidak perlu URL tambahan
        setActiveImageUrl('');
        console.log('Menggunakan data base64 dari database untuk analisis');
      } 
      // Jika tidak ada imageData, coba gunakan path sebagai fallback
      else if (patientData.analyses[selectedAnalysisIndex].imagePath) {
        const baseUrl = formatImageUrl(patientData.analyses[selectedAnalysisIndex].imagePath);
        const timestamp = new Date().getTime();
        const urlWithTimestamp = `${baseUrl}?nocache=${timestamp}`;
        setActiveImageUrl(urlWithTimestamp);
        console.log('Menggunakan URL gambar sebagai fallback:', urlWithTimestamp);
      } else {
        // Tidak ada imageData atau imagePath, gunakan gambar default
        setActiveImageUrl(DEFAULT_IMAGE);
        console.log('Tidak ada data gambar tersedia, menggunakan gambar default');
      }
    }
  }, [selectedAnalysisIndex, patientData]);

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
      setIsLoading(true);
      await deleteAnalysis(idToDelete);
      
      // Update patientData dengan menghapus analisis dari state
      const updatedAnalyses = patientData.analyses.filter(
        analysis => analysis._id !== idToDelete
      );
      
      if (updatedAnalyses.length === 0) {
        // Jika tidak ada analisis lagi, kembali ke halaman history
        navigate('/history');
        return;
      }
      
      setPatientData({
        ...patientData,
        analyses: updatedAnalyses,
        totalAnalyses: updatedAnalyses.length
      });
      
      // Jika index yang dihapus adalah yang sedang dipilih, pilih index 0
      if (selectedAnalysisIndex >= updatedAnalyses.length) {
        setSelectedAnalysisIndex(0);
      }
      
      setShowConfirmDelete(false);
      setIdToDelete(null);
    } catch (error) {
      setError('Gagal menghapus analisis. Silakan coba lagi.');
      console.error('Error deleting analysis:', error);
    } finally {
      setIsLoading(false);
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
    
    patientData.analyses.forEach(analysis => {
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
  const totalAnalyses = patientData?.analyses.length || 0;

  // Container animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  // Child animation
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 12 }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-3"></div>
            <p className="text-gray-500">Memuat data...</p>
          </div>
        </div>
      ) : error ? (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="bg-red-50 p-4 rounded-lg"
        >
          <p className="text-red-500">{error}</p>
          <button 
            onClick={handleBack}
            className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
          >
            <FiArrowLeft className="mr-2" />
            Kembali ke daftar riwayat
          </button>
        </motion.div>
      ) : patientData && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Back button */}
          <motion.div variants={itemVariants}>
            <button 
              onClick={handleBack}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <FiArrowLeft className="mr-2" />
              Kembali ke daftar riwayat
            </button>
          </motion.div>
          
          {/* Patient overview card */}
          <motion.div 
            variants={itemVariants}
            className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white p-6">
              <h1 className="text-2xl font-bold mb-2">Riwayat Analisis Pasien</h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-blue-50">
                <div className="flex items-center">
                  <FiUser className="mr-2" />
                  <span>{patientData.patient.fullName || patientData.patient.name}</span>
                </div>
                <div>
                  <span className="text-sm">
                    {patientData.patient.gender === 'male' ? 'Laki-laki' : 'Perempuan'}, {patientData.patient.age || '-'} tahun
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <FiBarChart2 className="text-blue-500 mt-1" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-500">Total Pemindaian</h3>
                      <p className="text-2xl font-bold">{totalAnalyses}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <FiCalendar className="text-blue-500 mt-1" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-500">Analisis Terakhir</h3>
                      <p className="text-sm font-medium">
                        {patientData.analyses.length > 0 ? formatDate(patientData.analyses[0].createdAt) : '-'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <FiCalendar className="text-blue-500 mt-1" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-500">Analisis Pertama</h3>
                      <p className="text-sm font-medium">
                        {patientData.analyses.length > 0 ? 
                          formatDate(patientData.analyses[patientData.analyses.length - 1].createdAt) : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Severity distribution */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Distribusi Tingkat Keparahan</h3>
                <div className="grid grid-cols-5 gap-2">
                  <div className="bg-gray-50 p-2 rounded-lg text-center">
                    <div className="inline-block px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
                      Tidak ada
                    </div>
                    <p className="text-lg font-bold mt-1">{severityDistribution.tidakAda || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg text-center">
                    <div className="inline-block px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                      Ringan
                    </div>
                    <p className="text-lg font-bold mt-1">{severityDistribution.ringan || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg text-center">
                    <div className="inline-block px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs">
                      Sedang
                    </div>
                    <p className="text-lg font-bold mt-1">{severityDistribution.sedang || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg text-center">
                    <div className="inline-block px-2 py-1 rounded-full bg-orange-100 text-orange-800 text-xs">
                      Berat
                    </div>
                    <p className="text-lg font-bold mt-1">{severityDistribution.berat || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg text-center">
                    <div className="inline-block px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs">
                      Sangat Berat
                    </div>
                    <p className="text-lg font-bold mt-1">{severityDistribution.sangatBerat || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Two column layout for history and details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left column - List of all analyses */}
            <motion.div 
              variants={itemVariants}
              className="lg:col-span-4"
            >
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-50 border-b">
                  <h2 className="text-lg font-semibold">Daftar Pemindaian ({totalAnalyses})</h2>
                </div>
                
                <div className="p-2 max-h-[600px] overflow-y-auto">
                  {patientData.analyses.map((analysis, index) => (
                    <div 
                      key={analysis._id}
                      onClick={() => setSelectedAnalysisIndex(index)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                        selectedAnalysisIndex === index 
                          ? 'bg-blue-50 border border-blue-200' 
                          : 'hover:bg-gray-50 border border-gray-100'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">Tanggal: {formatDate(analysis.createdAt)}</p>
                          <div className="flex items-center mt-1">
                            <span className={`px-2 py-0.5 text-xs rounded-full mr-2 ${getSeverityBadge(analysis.severity)}`}>
                              {analysis.severity}
                            </span>
                            <span className="text-xs text-gray-500 truncate max-w-[180px]" title={analysis.originalFilename}>
                              {analysis.originalFilename}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={(e) => handleDelete(analysis._id, e)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                            title="Hapus Analisis"
                          >
                            <FiTrash size={16} />
                          </button>
                          {selectedAnalysisIndex === index && (
                            <div className="bg-blue-500 text-white p-1 rounded-full">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
            
            {/* Right column - Selected analysis details */}
            <motion.div 
              variants={itemVariants}
              className="lg:col-span-8"
            >
              {patientData.analyses.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b">
                    <h2 className="text-lg font-semibold">Detail Analisis</h2>
                    <p className="text-sm text-gray-500">
                      {formatDate(patientData.analyses[selectedAnalysisIndex].createdAt)}
                    </p>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    {/* Image Preview */}
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-gray-500 mb-2">Gambar Retina</p>
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
                                  imgEl.src = formatImageUrl(patientData.analyses[selectedAnalysisIndex].imagePath);
                                }, 50);
                              }
                            }}
                            className="px-2 py-1 bg-green-500 text-white rounded text-xs flex items-center"
                            title="Muat ulang gambar"
                          >
                            <FiRefreshCcw className="mr-1" /> Refresh
                          </button>
                          <button 
                            onClick={() => {
                              const el = document.getElementById('debug-image-info');
                              if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
                            }}
                            className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                          >
                            Debug Info
                          </button>
                        </div>
                      </div>
                      
                      {/* Debug controls */}
                      <div className="mb-2 text-xs flex gap-1 flex-wrap">
                        {FALLBACK_API_URLS.map((url, i) => (
                          <button 
                            key={i}
                            onClick={() => {
                              const imgEl = document.getElementById('retina-image');
                              if (imgEl && patientData.analyses[selectedAnalysisIndex].imagePath) {
                                const filename = patientData.analyses[selectedAnalysisIndex].imagePath.split(/[\/\\]/).pop();
                                const cleanFilename = filename.replace(/[\/\\:*?"<>|]/g, '');
                                imgEl.src = `${url}/uploads/${cleanFilename}`;
                                imgEl.dataset.fallbackAttempted = "true"; // Set the flag
                              }
                            }}
                            className="px-2 py-1 bg-gray-500 text-white rounded"
                          >
                            Try API {i+1}
                          </button>
                        ))}
                      </div>
                      
                      {/* Debug info panel */}
                      <div id="debug-image-info" className="mb-2 p-2 bg-gray-700 text-white text-xs rounded hidden">
                        {patientData.analyses[selectedAnalysisIndex].imagePath && (
                          <>
                            <p><strong>Original:</strong> {patientData.analyses[selectedAnalysisIndex].imagePath}</p>
                            <p><strong>Filename:</strong> {patientData.analyses[selectedAnalysisIndex].imagePath.split(/[\/\\]/).pop()}</p>
                            <p><strong>URL:</strong> {formatImageUrl(patientData.analyses[selectedAnalysisIndex].imagePath)}</p>
                            <p className="mt-1 text-yellow-300">
                              <strong>Tip:</strong> Jika gambar tidak muncul, coba klik tombol "Refresh" 
                              atau tombol "Try API" untuk mencoba server alternatif
                            </p>
                          </>
                        )}
                      </div>
                      
                      <div className="relative aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden">
                        {patientData.analyses[selectedAnalysisIndex] ? (
                          <>
                            {imageStatus === 'loading' && (
                              <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-100/80">
                                <div className="flex flex-col items-center space-y-2">
                                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                  <p className="text-xs text-gray-600">Memuat gambar...</p>
                                </div>
                              </div>
                            )}
                            <img 
                              id="retina-image"
                              src={patientData.analyses[selectedAnalysisIndex].imageData || activeImageUrl || DEFAULT_IMAGE}
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
                                if (patientData.analyses[selectedAnalysisIndex].imageData) {
                                  console.log('Menggunakan data base64 dari database');
                                  
                                  // Pastikan imageData adalah string base64 yang valid
                                  const imageData = patientData.analyses[selectedAnalysisIndex].imageData;
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
                            
                            {/* Info debug URLs - hanya tampilkan di development */}
                            {import.meta.env.DEV && (
                              <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 text-xs text-white">
                                <p>Original: {patientData.analyses[selectedAnalysisIndex].imagePath}</p>
                                <p>URL: {formatImageUrl(patientData.analyses[selectedAnalysisIndex].imagePath)}</p>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500 text-sm">Gambar tidak tersedia</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Analysis Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-500 mb-2">Nama File</p>
                        <p className="text-base font-medium break-words">
                          {patientData.analyses[selectedAnalysisIndex].originalFilename}
                        </p>
                      </div>
                      
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-500 mb-2">Tingkat Keparahan</p>
                        <span className={`px-3 py-1 rounded-full text-sm inline-block ${
                          getSeverityBadge(patientData.analyses[selectedAnalysisIndex].severity)
                        }`}>
                          {patientData.analyses[selectedAnalysisIndex].severity}
                        </span>
                      </div>
                      
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-500 mb-2">Tingkat Kepercayaan</p>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: `${(patientData.analyses[selectedAnalysisIndex].confidence * 100).toFixed(0)}%` }}
                            ></div>
                          </div>
                          <span className="text-base font-medium min-w-[60px] text-right">
                            {(patientData.analyses[selectedAnalysisIndex].confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-500 mb-2">Tanggal Analisis</p>
                        <p className="text-base font-medium">
                          {formatDate(patientData.analyses[selectedAnalysisIndex].createdAt)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Notes */}
                    {patientData.analyses[selectedAnalysisIndex].notes && (
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-500 mb-2">Catatan</p>
                        <p className="text-base">
                          {patientData.analyses[selectedAnalysisIndex].notes}
                        </p>
                      </div>
                    )}
                    
                    {/* Recommendations based on severity */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-blue-800 mb-2">Rekomendasi</p>
                      <p className="text-base text-blue-700">
                        {patientData.analyses[selectedAnalysisIndex].notes ? (
                          patientData.analyses[selectedAnalysisIndex].notes
                        ) : patientData.analyses[selectedAnalysisIndex].severity.toLowerCase() === 'tidak ada' ? (
                          'Lakukan pemeriksaan rutin setiap tahun.'
                        ) : patientData.analyses[selectedAnalysisIndex].severity.toLowerCase() === 'ringan' ? (
                          'Kontrol gula darah dan tekanan darah. Pemeriksaan ulang dalam 9-12 bulan.'
                        ) : patientData.analyses[selectedAnalysisIndex].severity.toLowerCase() === 'sedang' ? (
                          'Konsultasi dengan dokter spesialis mata. Pemeriksaan ulang dalam 6 bulan.'
                        ) : patientData.analyses[selectedAnalysisIndex].severity.toLowerCase() === 'berat' ? (
                          'Rujukan segera ke dokter spesialis mata. Pemeriksaan ulang dalam 2-3 bulan.'
                        ) : patientData.analyses[selectedAnalysisIndex].severity.toLowerCase() === 'sangat berat' ? (
                          'Rujukan segera ke dokter spesialis mata untuk evaluasi dan kemungkinan tindakan laser atau operasi.'
                        ) : (
                          'Lakukan pemeriksaan rutin setiap tahun.'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Modal Konfirmasi Delete */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 animate-fade-in">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Konfirmasi Hapus</h3>
            <p className="text-gray-600 mb-6">Apakah Anda yakin ingin menghapus data pemindaian ini? Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowConfirmDelete(false);
                  setIdToDelete(null);
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-md text-white"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const PatientHistoryPage = withPageTransition(PatientHistoryPageComponent);
export default PatientHistoryPage; 