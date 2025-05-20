import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { withPageTransition } from '../context/ThemeContext';
import { getHistory } from '../services/api';
import { API_URL, getImageUrl } from '../utils/api';
import axios from 'axios';
import { 
  FiArrowLeft, 
  FiUser, 
  FiCalendar, 
  FiAlertTriangle, 
  FiPercent, 
  FiFileText,
  FiBarChart2
} from 'react-icons/fi';

// Format image URL properly regardless of path separator
const formatImageUrl = (imagePath) => {
  console.log('PatientHistoryPage - Processing imagePath:', imagePath);
  
  if (!imagePath) {
    console.log('Image path is empty, using placeholder');
    return '/placeholder-eye.png';
  }
  
  const url = getImageUrl(imagePath);
  console.log('Formatted image URL:', url);
  return url;
};

function PatientHistoryPageComponent() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState(null);
  const [selectedAnalysisIndex, setSelectedAnalysisIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatientHistory = async () => {
      try {
        setIsLoading(true);
        // Ambil semua riwayat analisis
        const data = await getHistory();
        console.log('API Response - Raw analysis data:', data);
        
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
          console.log('Patient history data:', patientHistory);
          console.log('Analyses for this patient:', patientHistory.analyses);
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

  // Format date helper
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Get severity badge style
  const getSeverityBadge = (severity) => {
    const severityLower = severity.toLowerCase();
    if (severityLower === 'ringan' || severityLower === 'rendah') {
      return 'bg-green-100 text-green-800';
    } else if (severityLower === 'sedang') {
      return 'bg-yellow-100 text-yellow-800';
    } else {
      return 'bg-red-100 text-red-800';
    }
  };

  // Handle back to history page
  const handleBack = () => {
    navigate('/history');
  };

  // Menghitung distribusi tingkat keparahan
  const calculateSeverityDistribution = () => {
    if (!patientData) return {};
    
    const distribution = {
      ringan: 0,
      sedang: 0,
      berat: 0
    };
    
    patientData.analyses.forEach(analysis => {
      const severity = analysis.severity.toLowerCase();
      if (severity === 'ringan' || severity === 'rendah') {
        distribution.ringan++;
      } else if (severity === 'sedang') {
        distribution.sedang++;
      } else {
        distribution.berat++;
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
                <div className="flex space-x-4">
                  <div className="flex-1 bg-gray-50 p-3 rounded-lg text-center">
                    <div className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm">
                      Ringan
                    </div>
                    <p className="text-xl font-bold mt-1">{severityDistribution.ringan || 0}</p>
                  </div>
                  <div className="flex-1 bg-gray-50 p-3 rounded-lg text-center">
                    <div className="inline-block px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm">
                      Sedang
                    </div>
                    <p className="text-xl font-bold mt-1">{severityDistribution.sedang || 0}</p>
                  </div>
                  <div className="flex-1 bg-gray-50 p-3 rounded-lg text-center">
                    <div className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm">
                      Berat
                    </div>
                    <p className="text-xl font-bold mt-1">{severityDistribution.berat || 0}</p>
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
                        {selectedAnalysisIndex === index && (
                          <div className="bg-blue-500 text-white p-1 rounded-full">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
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
                      <p className="text-sm font-medium text-gray-500 mb-2">Gambar Retina</p>
                      <div className="relative aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden">
                        {patientData.analyses[selectedAnalysisIndex].imagePath ? (
                          <>
                            <img 
                              src={formatImageUrl(patientData.analyses[selectedAnalysisIndex].imagePath)}
                              alt="Retina scan"
                              className="object-cover w-full h-full"
                              onLoad={() => console.log('Image loaded successfully:', patientData.analyses[selectedAnalysisIndex].imagePath)}
                              onError={(e) => {
                                console.error('Failed to load image:', patientData.analyses[selectedAnalysisIndex].imagePath);
                                console.error('Error event:', e);
                                // Try showing the original path directly as fallback
                                const originalPath = patientData.analyses[selectedAnalysisIndex].imagePath;
                                console.log('Trying fallback with original path:', originalPath);
                                e.target.onerror = () => {
                                  console.error('Fallback also failed, using placeholder');
                                  e.target.src = '/placeholder-eye.png';
                                };
                                e.target.src = `${API_URL}/uploads/${originalPath.split(/[/\\]/).pop()}`;
                              }}
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-1 text-xs">
                              Path: {patientData.analyses[selectedAnalysisIndex].imagePath.split(/[/\\]/).pop()}
                            </div>
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
                        {patientData.analyses[selectedAnalysisIndex].severity.toLowerCase() === 'ringan' ? (
                          'Konsultasi dengan dokter mata dalam 6-12 bulan. Kontrol gula darah secara ketat.'
                        ) : patientData.analyses[selectedAnalysisIndex].severity.toLowerCase() === 'sedang' ? (
                          'Konsultasi dengan dokter mata dalam 3-6 bulan. Evaluasi faktor risiko kardiovaskular.'
                        ) : (
                          'Konsultasi dengan dokter mata spesialis retina segera (dalam 1 bulan). Kontrol gula darah secara ketat.'
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
    </div>
  );
}

const PatientHistoryPage = withPageTransition(PatientHistoryPageComponent);
export default PatientHistoryPage; 