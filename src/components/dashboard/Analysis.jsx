import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { FiAlertCircle, FiAlertTriangle, FiCheck, FiInfo, FiCpu, FiActivity, FiEye } from 'react-icons/fi';
import { getLatestAnalysis } from '../../services/api';
import { getSeverityTextColor, getSeverityBgColor, getSeverityLabel } from '../../utils/severityUtils';
import { useTheme } from '../../context/ThemeContext';

// Glassmorphism style
const glassEffect = {
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  borderRadius: '16px',
};

function Analysis({ image, onAnalysisComplete, analysis: initialAnalysis }) {
  const [analysis, setAnalysis] = useState(initialAnalysis || null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [animateProgress, setAnimateProgress] = useState(false);
  const [analyzeStage, setAnalyzeStage] = useState(0); // 0: not started, 1: loading, 2: processing, 3: finalizing
  const { darkMode } = useTheme();

  // Motion values untuk animasi
  const progressX = useMotionValue(0);
  const progressColor = useTransform(
    progressX, 
    [0, 33, 66, 100], 
    ['#3b82f6', '#6366f1', '#8b5cf6', '#10b981']
  );

  // Auto-analyze when image is provided and no initial analysis
  useEffect(() => {
    if (image && !initialAnalysis) {
      handleAnalyze();
    } else if (initialAnalysis) {
      // Jika analysis sudah disediakan, gunakan itu
      // Pastikan data memiliki format yang benar
      const normalizedAnalysis = normalizeAnalysisData(initialAnalysis);
      setAnalysis(normalizedAnalysis);
      setAnimateProgress(true);
    }
  }, [image, initialAnalysis]);

  // Animasi tahapan analisis
  useEffect(() => {
    let timer;
    if (isLoading) {
      setAnalyzeStage(1);
      timer = setTimeout(() => {
        setAnalyzeStage(2);
        timer = setTimeout(() => {
          setAnalyzeStage(3);
        }, 2000);
      }, 1500);
    } else {
      setAnalyzeStage(0);
    }

    return () => clearTimeout(timer);
  }, [isLoading]);

  // Fungsi untuk menormalisasi data analisis
  const normalizeAnalysisData = (data) => {
    if (!data) return null;
    
    // Buat salinan data untuk dimodifikasi
    const normalized = { ...data };
    
    // Mapping dari nilai bahasa Inggris ke Indonesia
    const severityMapping = {
      'No DR': 'Tidak ada',
      'Mild': 'Ringan',
      'Moderate': 'Sedang',
      'Severe': 'Berat',
      'Proliferative DR': 'Sangat Berat'
    };
    
    console.log('Normalizing data structure:', data);
    
    // Pastikan severity ada dengan format yang benar
    if (!normalized.severity) {
      // Coba dapatkan dari frontendSeverity
      if (normalized.frontendSeverity) {
        normalized.severity = normalized.frontendSeverity;
      } 
      // Coba dapatkan dari class (format dari Flask API)
      else if (normalized.class) {
        normalized.severity = severityMapping[normalized.class] || normalized.class;
      }
      // Coba dari respons API yang bersarang
      else if (normalized.prediction?.class) {
        normalized.severity = severityMapping[normalized.prediction.class] || normalized.prediction.class;
      }
      // Coba dari structure API baru
      else if (normalized.response?.analysis?.results?.classification) {
        const classification = normalized.response.analysis.results.classification;
        normalized.severity = severityMapping[classification] || classification;
      }
    }
    
    // Pastikan severityLevel ada dengan format yang benar
    if (!normalized.severityLevel && normalized.severityLevel !== 0) {
      if (normalized.frontendSeverityLevel !== undefined) {
        normalized.severityLevel = normalized.frontendSeverityLevel;
      } else if (normalized.severity_level !== undefined) {
        normalized.severityLevel = normalized.severity_level;
      } else if (normalized.severity) {
        // Tentukan severityLevel berdasarkan severity
        const severityLevelMapping = {
          'Tidak ada': 0,
          'No DR': 0,
          'Ringan': 1, 
          'Mild': 1,
          'Sedang': 2,
          'Moderate': 2,
          'Berat': 3,
          'Severe': 3,
          'Sangat Berat': 4,
          'Proliferative DR': 4
        };
        normalized.severityLevel = severityLevelMapping[normalized.severity] || 0;
      }
    }
    
    // Pastikan confidence ada
    if (!normalized.confidence) {
      if (normalized.prediction?.confidence) {
        normalized.confidence = normalized.prediction.confidence;
      } else if (normalized.response?.analysis?.results?.confidence) {
        normalized.confidence = normalized.response.analysis.results.confidence;
      } else {
        normalized.confidence = 0.8; // Default confidence
      }
    }
    
    // Pastikan recommendation ada
    if (!normalized.recommendation) {
      if (normalized.notes) {
        normalized.recommendation = normalized.notes;
      } else if (normalized.response?.analysis?.recommendation) {
        normalized.recommendation = normalized.response.analysis.recommendation;
      } else if (normalized.severity) {
        // Tambahkan mapping rekomendasi berdasarkan severity jika tidak ada
        // Menggunakan rekomendasi yang sama persis dengan yang didefinisikan di flask_service/app.py
        const recommendationMapping = {
          'Tidak ada': 'Lakukan pemeriksaan rutin setiap tahun.',
          'No DR': 'Lakukan pemeriksaan rutin setiap tahun.',
          'Ringan': 'Kontrol gula darah dan tekanan darah. Pemeriksaan ulang dalam 9-12 bulan.',
          'Mild': 'Kontrol gula darah dan tekanan darah. Pemeriksaan ulang dalam 9-12 bulan.',
          'Sedang': 'Konsultasi dengan dokter spesialis mata. Pemeriksaan ulang dalam 6 bulan.',
          'Moderate': 'Konsultasi dengan dokter spesialis mata. Pemeriksaan ulang dalam 6 bulan.',
          'Berat': 'Rujukan segera ke dokter spesialis mata. Pemeriksaan ulang dalam 2-3 bulan.',
          'Severe': 'Rujukan segera ke dokter spesialis mata. Pemeriksaan ulang dalam 2-3 bulan.',
          'Sangat Berat': 'Rujukan segera ke dokter spesialis mata untuk evaluasi dan kemungkinan tindakan laser atau operasi.',
          'Proliferative DR': 'Rujukan segera ke dokter spesialis mata untuk evaluasi dan kemungkinan tindakan laser atau operasi.'
        };
        
        normalized.recommendation = recommendationMapping[normalized.severity] || 'Konsultasikan dengan dokter mata.';
      }
    }
    
    // Pastikan ada ID analisis
    if (!normalized.analysisId && normalized.response?.analysis?.id) {
      normalized.analysisId = normalized.response.analysis.id;
    }
    
    // Pastikan ada data pasien
    if (!normalized.patientId && normalized.response?.analysis?.patientId) {
      normalized.patientId = normalized.response.analysis.patientId;
    }
    
    // Periksa apakah ini mode simulasi
    if (normalized.isSimulation === undefined) {
      if (normalized.prediction?.isSimulation !== undefined) {
        normalized.isSimulation = normalized.prediction.isSimulation;
      } else if (normalized.response?.analysis?.results?.isSimulation !== undefined) {
        normalized.isSimulation = normalized.response.analysis.results.isSimulation;
      }
    }
    
    console.log('Normalized data:', normalized);
    
    return normalized;
  };

  const handleAnalyze = async () => {
    try {
      setIsLoading(true);
      setAnimateProgress(false);
      setError(''); // Reset error message
      
      // Menambahkan delay sedikit untuk animasi loading
      const data = await getLatestAnalysis();
      
      // Normalisasi data
      const normalizedData = normalizeAnalysisData(data);
      
      // Tambahkan gambar ke objek analisis
      const analysisWithImage = {
        ...normalizedData,
        image: image // Menyimpan gambar yang diupload dalam hasil analisis
      };
      
      setAnalysis(analysisWithImage);
      setAnimateProgress(true);
      
      // Menghapus pemanggilan otomatis onAnalysisComplete
      // User harus mengklik tombol untuk melihat hasil
    } catch (err) {
      setError(err.message || 'Gagal mendapatkan hasil analisis. Pastikan Flask API dengan model ML tersedia.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi baru untuk menangani tombol "Lihat Hasil"
  const handleViewResults = () => {
    if (analysis && onAnalysisComplete) {
      // Pastikan data gambar dan pasien disertakan saat memanggil callback
      const analysisWithImage = {
        ...analysis,
        image: image?.preview || image || analysis.image, // Tambahkan gambar yang diupload
        preview: image?.preview || analysis.preview, // Tambahkan preview gambar
        patient: image?.patient || analysis.patient, // Tambahkan data pasien dari gambar
        patientId: image?.patientId || analysis.patientId, // Pastikan patientId terikut
        _id: analysis._id || analysis.id || analysis.analysisId, // Pastikan ID analisis konsisten
        id: analysis._id || analysis.id || analysis.analysisId, // Duplikasi ID untuk kompatibilitas
        originalFilename: image?.name || analysis.originalFilename || analysis.imageDetails?.originalname,
        createdAt: analysis.createdAt || new Date().toISOString(),
      };
      
      // Log data untuk debugging
      console.log('Meneruskan hasil analisis ke callback:', analysisWithImage);
      
      // Pastikan imageData tersedia
      if (!analysisWithImage.imageData && analysisWithImage.image && typeof analysisWithImage.image === 'string' && analysisWithImage.image.startsWith('data:')) {
        analysisWithImage.imageData = analysisWithImage.image;
      }
      
      // Pastikan patientId tersedia dalam format yang benar
      if (analysisWithImage.patient && !analysisWithImage.patientId) {
        analysisWithImage.patientId = analysisWithImage.patient;
      }
      
      onAnalysisComplete(analysisWithImage);
    } else {
      console.error('Tidak dapat meneruskan hasil: data analisis tidak lengkap', { analysis, image });
    }
  };

  // Komponen untuk menampilkan status loading
  const LoadingIndicator = ({ stage, stages }) => {
    return (
      <div className="w-full">
        <div className={`h-2 w-full rounded-full overflow-hidden mb-2 ${
          darkMode ? 'bg-gray-700' : 'bg-gray-200'
        }`}>
          <motion.div
            className="h-full"
            style={{ 
              width: progressX, 
              background: progressColor 
            }}
            animate={{ 
              width: isLoading ? [`${stage * 100 / stages}%`, `${(stage + 1) * 100 / stages}%`] : '100%' 
            }}
            transition={{ 
              duration: isLoading ? 1.5 : 0.5, 
              ease: "easeInOut",
              repeat: isLoading ? Infinity : 0
            }}
          />
        </div>
        <div className="flex justify-between text-xs">
          <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
            {getMessage(stage, stages)}
          </span>
          <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
            {Math.round((stage + 1) * 100 / stages)}%
          </span>
        </div>
      </div>
    );
  };

  // Fungsi untuk mendapatkan pesan berdasarkan tahapan
  const getMessage = (stage, stages) => {
    const messages = [
      'Mempersiapkan analisis...',
      'Memproses gambar...',
      'Menjalankan model AI...',
      'Menghasilkan laporan...'
    ];
    return messages[stage % messages.length];
  };

  // Warna berdasarkan severity
  const getSeverityColor = (severity) => {
    if (!severity) return 'gray';
    const level = severity.toLowerCase();
    if (level.includes('tidak') || level.includes('normal') || level === 'no dr') return 'blue';
    if (level.includes('ringan') || level === 'mild') return 'green';
    if (level.includes('sedang') || level === 'moderate') return 'yellow';
    if (level.includes('berat') || level === 'severe') return 'red';
    if (level.includes('sangat') || level.includes('proliferative')) return 'pink';
    return 'gray';
  };

  // Variasi animasi untuk komponen
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Gambar Retina */}
          <motion.div
        variants={itemVariants}
        className={`p-5 rounded-xl ${
          darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
        }`}
      >
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="w-full sm:w-1/2">
            <h3 className={`text-lg font-medium mb-3 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              Gambar Retina
            </h3>
            
            <div className={`aspect-square rounded-lg overflow-hidden border ${
              darkMode ? 'border-gray-600' : 'border-gray-200'
            } shadow-md`}>
              {image?.preview ? (
                <img 
                  src={image.preview} 
                  alt="Retina" 
                  className="w-full h-full object-cover"
                />
              ) : image ? (
                <img 
                  src={typeof image === 'string' ? image : URL.createObjectURL(image)} 
                  alt="Retina" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center ${
                  darkMode ? 'bg-gray-800' : 'bg-gray-100'
                }`}>
                  <FiEye size={48} className={darkMode ? 'text-gray-600' : 'text-gray-400'} />
                </div>
              )}
            </div>
          </div>
          
          <div className="w-full sm:w-1/2">
            <h3 className={`text-lg font-medium mb-3 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              Status Analisis
            </h3>
            
            {isLoading ? (
              <div className={`p-5 rounded-lg ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              } shadow-md`}>
                <div className="flex items-center mb-4">
                  <div className={`p-2 rounded-full ${
                    darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'
                  } mr-3`}>
                    <FiCpu size={20} />
                  </div>
                  <h4 className={`font-medium ${
                    darkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Memproses
                  </h4>
                </div>
                
                <LoadingIndicator stage={analyzeStage} stages={4} />
                
                <p className={`mt-4 text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Sistem AI sedang menganalisis gambar retina. Proses ini membutuhkan waktu beberapa detik.
                </p>
              </div>
            ) : error ? (
              <div className={`p-5 rounded-lg ${
                darkMode ? 'bg-red-900/20 border border-red-800/30' : 'bg-red-50 border border-red-100'
              } flex items-start`}>
                <FiAlertCircle className={`mt-0.5 mr-3 flex-shrink-0 ${
                  darkMode ? 'text-red-400' : 'text-red-500'
                }`} />
                <div>
                  <h4 className={`font-medium ${
                    darkMode ? 'text-red-400' : 'text-red-600'
                  }`}>
                    Gagal Menganalisis
                  </h4>
                  <p className={`text-sm mt-1 ${
                    darkMode ? 'text-red-300' : 'text-red-500'
                  }`}>
                    {error}
                  </p>
                  <button 
                    onClick={handleAnalyze}
                    className={`mt-3 px-4 py-2 text-sm font-medium rounded-lg ${
                      darkMode 
                        ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' 
                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                    } transition-colors`}
                  >
                    Coba Lagi
                  </button>
                </div>
              </div>
            ) : analysis ? (
              <div className={`p-5 rounded-lg ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              } shadow-md`}>
                <div className="flex items-center mb-4">
                  <div className={`p-2 rounded-full ${
                    darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600'
                  } mr-3`}>
                    <FiCheck size={20} />
                  </div>
                  <h4 className={`font-medium ${
                    darkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Analisis Selesai
                  </h4>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    } mb-1`}>
                      Tingkat Keparahan:
                    </p>
                    <div className={`inline-flex items-center px-3 py-1.5 rounded-lg ${
                      getSeverityBgColor(analysis.severity, darkMode)
                    }`}>
                      <span className={`font-medium ${
                        getSeverityTextColor(analysis.severity, darkMode)
                      }`}>
                        {getSeverityLabel(analysis.severity) || 'Tidak diketahui'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <p className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    } mb-1`}>
                      Tingkat Kepercayaan:
                    </p>
                    <div className={`w-full h-2 rounded-full ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                    <motion.div 
                        className={`h-full rounded-full ${
                          analysis.confidence > 0.7
                            ? darkMode ? 'bg-green-500' : 'bg-green-500'
                            : analysis.confidence > 0.5
                              ? darkMode ? 'bg-yellow-500' : 'bg-yellow-500'
                              : darkMode ? 'bg-red-500' : 'bg-red-500'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${(analysis.confidence || 0) * 100}%` }}
                        transition={{ duration: 0.8, type: 'spring', stiffness: 50 }}
                      />
                    </div>
                    <p className={`text-right text-xs mt-1 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {Math.round((analysis.confidence || 0) * 100)}%
                    </p>
                </div>
                
                <motion.button
                    variants={itemVariants}
                  onClick={handleViewResults}
                    className={`w-full py-2.5 px-4 mt-4 rounded-lg font-medium ${
                      darkMode
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                    } shadow-md hover:shadow-lg transition-all`}
                    whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Lihat Hasil Lengkap
                </motion.button>
                </div>
              </div>
            ) : (
              <div className={`p-5 rounded-lg ${
                darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              } shadow-md`}>
                <div className="flex items-center mb-4">
                  <div className={`p-2 rounded-full ${
                    darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'
                  } mr-3`}>
                    <FiActivity size={20} />
                  </div>
                  <h4 className={`font-medium ${
                    darkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Siap Menganalisis
                  </h4>
                </div>
                
                <p className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                } mb-4`}>
                  Sistem AI siap menganalisis gambar retina untuk mendeteksi tanda-tanda retinopati diabetik.
                </p>
                
                <motion.button
                  variants={itemVariants}
                  onClick={handleAnalyze}
                  className={`w-full py-2.5 px-4 rounded-lg font-medium ${
                    darkMode
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                  } shadow-md hover:shadow-lg transition-all`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Mulai Analisis
                </motion.button>
              </div>
          )}
          </div>
      </div>
      </motion.div>
      
      {/* Disclaimer */}
      <motion.div 
        variants={itemVariants}
        className={`p-4 rounded-lg border ${
          darkMode 
            ? 'bg-gray-800/50 border-gray-700 text-gray-300' 
            : 'bg-blue-50 border-blue-100 text-blue-700'
        } text-sm`}
      >
        <div className="flex items-start">
          <FiInfo className="mt-0.5 mr-3 flex-shrink-0" />
          <p>
            Hasil analisis ini bersifat pendukung dan tidak menggantikan diagnosis dokter. 
            Selalu konsultasikan hasil dengan profesional kesehatan.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Analysis;