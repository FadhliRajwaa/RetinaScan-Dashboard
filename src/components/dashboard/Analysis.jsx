import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { FiAlertCircle, FiAlertTriangle, FiCheck, FiInfo, FiCpu, FiActivity, FiEye, FiZap } from 'react-icons/fi';
import { getLatestAnalysis } from '../../services/api';
import { getSeverityTextColor, getSeverityBgColor, getSeverityLabel } from '../../utils/severityUtils';

// Glassmorphism style
const glassEffect = {
  background: 'rgba(255, 255, 255, 0.85)',
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

  // Motion values untuk animasi
  const progressX = useMotionValue(0);
  const progressColor = useTransform(
    progressX, 
    [0, 33, 66, 100], 
    ['#3b82f6', '#6366f1', '#8b5cf6', '#10b981']
  );

  // Variants untuk animasi
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.2
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
        stiffness: 300,
        damping: 20
      }
    }
  };

  const confidenceVariants = {
    hidden: { width: '0%' },
    visible: { 
      width: analysis ? `${analysis.confidence * 100}%` : '0%',
      transition: { duration: 1.5, ease: "easeOut" }
    }
  };

  // Animasi untuk proses analisis
  const processStages = [
    { label: "Mempersiapkan Data", icon: <FiActivity className="w-8 h-8" />, color: "from-blue-500 to-cyan-400" },
    { label: "Menganalisis Citra", icon: <FiEye className="w-8 h-8" />, color: "from-indigo-500 to-purple-400" },
    { label: "Mendeteksi Pola", icon: <FiCpu className="w-8 h-8" />, color: "from-purple-500 to-pink-400" },
    { label: "Menyelesaikan Analisis", icon: <FiCheck className="w-8 h-8" />, color: "from-emerald-500 to-green-400" }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto"
      style={{ transform: 'translateZ(0)' }}
    >
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="text-red-500 p-4 rounded-xl mb-5 text-sm sm:text-base flex items-start"
            style={{ ...glassEffect, background: 'rgba(254, 226, 226, 0.7)' }}
          >
            <FiAlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}
        
        {/* Tambahkan indikator mode simulasi */}
        {analysis && (analysis.isSimulation || analysis.simulation_mode || 
          (analysis.raw_prediction && analysis.raw_prediction.is_simulation)) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="text-amber-700 p-4 rounded-xl mb-5 text-sm sm:text-base flex items-start"
            style={{ ...glassEffect, background: 'rgba(254, 240, 199, 0.7)' }}
          >
            <FiAlertTriangle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5 text-amber-600" />
            <div>
              <span className="font-bold block mb-1">PERHATIAN: Mode Simulasi Aktif</span> 
              <span>Hasil analisis ini menggunakan data simulasi karena layanan AI tidak tersedia. Hasil ini TIDAK BOLEH digunakan untuk diagnosis. Silakan konsultasikan dengan dokter mata untuk diagnosis yang akurat.</span>
              {analysis.errorMessage && (
                <div className="mt-2 text-sm font-medium text-red-600">
                  Alasan: {analysis.errorMessage}
                </div>
              )}
              <div className="mt-2 text-xs">
                <span className="font-semibold">Gunakan script "npm run test:flask" untuk menguji koneksi ke Flask API dan memastikan mode simulasi dinonaktifkan.</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left side - Image preview */}
        {image && image.preview && (
          <motion.div 
            variants={itemVariants}
            className="w-full md:w-1/2"
          >
            <motion.div 
              className="rounded-xl overflow-hidden relative"
              style={{ ...glassEffect }}
              whileHover={{ boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
            >
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              />
              <motion.img 
                src={image.preview} 
                alt="Citra Retina" 
                className="w-full h-64 object-contain p-2"
                initial={{ filter: 'blur(10px)', scale: 0.9 }}
                animate={{ filter: 'blur(0px)', scale: 1 }}
                transition={{ duration: 0.5, type: 'spring', stiffness: 300 }}
              />
              
              {/* Overlay untuk efek hover */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4"
              >
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  whileHover={{ y: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  <p className="text-white text-sm font-medium">Gambar Retina</p>
                  {image.patient && (
                    <p className="text-white/80 text-xs mt-1">
                      Pasien: {image.patient.fullName || image.patient.name}
                    </p>
                  )}
                </motion.div>
              </motion.div>
              
              <motion.div className="p-4 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-700">Citra Retina</h3>
                {image.patient && (
                  <p className="text-xs text-gray-500 mt-1">
                    Pasien: {image.patient.fullName || image.patient.name}
                  </p>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* Right side - Analysis results or loading */}
        <motion.div 
          variants={itemVariants}
          className="w-full md:w-1/2"
        >
          {isLoading ? (
            <motion.div 
              className="p-6 rounded-xl h-full flex flex-col justify-center"
              style={{ ...glassEffect }}
            >
              <LoadingIndicator stage={analyzeStage} stages={processStages} />
            </motion.div>
          ) : analysis ? (
            <motion.div 
              className="rounded-xl overflow-hidden"
              style={{ ...glassEffect }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <motion.div 
                className="p-5 border-b border-gray-100"
                style={{
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))'
                }}
              >
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                  <FiZap className="mr-2 text-indigo-500" />
                  Hasil Analisis AI
                </h3>
              </motion.div>
              
              <div className="p-5">
                <motion.div 
                  className="mb-6"
                  variants={itemVariants}
                >
                  <p className="text-sm font-medium text-gray-500 mb-2">Tingkat Keparahan:</p>
                  <div className="flex items-center">
                    <motion.div 
                      className={`text-lg font-bold ${getSeverityTextColor(analysis.severity)}`}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
                    >
                      {analysis.severity}
                    </motion.div>
                    <motion.div 
                      className={`ml-3 px-3 py-1 rounded-full text-xs ${getSeverityBgColor(analysis.severity)}`}
                      initial={{ scale: 0.8, opacity: 0, x: -10 }}
                      animate={{ scale: 1, opacity: 1, x: 0 }}
                      transition={{ delay: 0.4, type: 'spring', stiffness: 400 }}
                    >
                      {getSeverityLabel(analysis.severity)}
                    </motion.div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="mb-6"
                  variants={itemVariants}
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium text-gray-500">Tingkat Kepercayaan:</p>
                    <motion.p 
                      className="text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      {(analysis.confidence * 100).toFixed(1)}%
                    </motion.p>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                      className="h-full rounded-full relative overflow-hidden"
                      style={{ 
                        width: animateProgress ? `${analysis.confidence * 100}%` : '0%'
                      }}
                      initial={{ width: '0%' }}
                      animate={{ width: animateProgress ? `${analysis.confidence * 100}%` : '0%' }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"
                        animate={{
                          x: ['-100%', '0%'],
                        }}
                        transition={{
                          duration: 1,
                          ease: "easeOut",
                          delay: 0.3,
                        }}
                      />
                      <motion.div
                        className="absolute inset-0"
                        style={{
                          background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)',
                        }}
                        animate={{
                          x: ['-100%', '100%'],
                        }}
                        transition={{
                          duration: 1.5,
                          ease: "easeInOut",
                          repeat: Infinity,
                          repeatType: "loop",
                        }}
                      />
                    </motion.div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="p-4 rounded-xl mb-6 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100"
                  variants={itemVariants}
                >
                  <p className="text-sm font-medium text-indigo-700 mb-1">Rekomendasi:</p>
                  <p className="text-sm text-gray-700">{analysis.recommendation || 'Tidak ada rekomendasi spesifik.'}</p>
                </motion.div>
                
                <motion.button
                  onClick={handleViewResults}
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl transition-all"
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3), 0 4px 6px -2px rgba(99, 102, 241, 0.2)'
                  }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                >
                  Lihat Hasil Lengkap
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              className="p-6 rounded-xl h-full flex flex-col justify-center items-center"
              style={{ ...glassEffect }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="text-center"
              >
                <motion.div 
                  className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg"
                  animate={{ 
                    boxShadow: ['0 0 0 0 rgba(99, 102, 241, 0.4)', '0 0 0 20px rgba(99, 102, 241, 0)', '0 0 0 0 rgba(99, 102, 241, 0)'],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                  }}
                >
                  <FiCpu className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Siap untuk Analisis</h3>
                <p className="text-gray-600 mb-8 max-w-xs mx-auto">Klik tombol di bawah untuk memulai analisis citra retina dengan AI</p>
                <motion.button
                  onClick={handleAnalyze}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl shadow-md transition-all"
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3), 0 4px 6px -2px rgba(99, 102, 241, 0.2)'
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  Mulai Analisis
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

const LoadingIndicator = ({ stage, stages }) => {
  return (
    <div className="text-center">
      <motion.div 
        className="w-28 h-28 mx-auto mb-8 relative"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {/* Background circle */}
        <motion.div 
          className="absolute inset-0 rounded-full"
          style={{ border: '4px solid rgba(99, 102, 241, 0.1)' }}
        />
        
        {/* Spinning gradient circle */}
        <motion.div 
          className="absolute inset-0 rounded-full"
          style={{ 
            borderWidth: '4px', 
            borderStyle: 'solid',
            borderImage: 'linear-gradient(to right, #6366f1, #8b5cf6, #ec4899) 1',
            borderRadius: '50%',
            clipPath: 'inset(0 0 0 0 round 50%)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Pulsing inner circle with icon */}
        <motion.div 
          className="absolute inset-0 m-3 rounded-full flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600"
          animate={{ 
            boxShadow: ['0 0 0 0 rgba(99, 102, 241, 0.4)', '0 0 0 10px rgba(99, 102, 241, 0)', '0 0 0 0 rgba(99, 102, 241, 0)'],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
          }}
        >
          {stage === 1 && <FiActivity className="w-10 h-10 text-white" />}
          {stage === 2 && <FiEye className="w-10 h-10 text-white" />}
          {stage === 3 && <FiCpu className="w-10 h-10 text-white" />}
          {stage === 0 && <FiCpu className="w-10 h-10 text-white" />}
        </motion.div>
      </motion.div>
      
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.h3 
          className="text-xl font-semibold text-gray-800"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {getMessage(stage, stages)}
        </motion.h3>
        
        <div className="w-full max-w-md mx-auto">
          {/* Progress steps */}
          <div className="flex justify-between relative mb-2">
            {stages.map((s, index) => (
              <motion.div
                key={index}
                className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                  index <= stage 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-400'
                }`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: index === stage ? [1, 1.1, 1] : 1, 
                  opacity: 1,
                  boxShadow: index === stage ? '0 0 0 4px rgba(99, 102, 241, 0.3)' : 'none'
                }}
                transition={{ 
                  delay: index * 0.15,
                  repeat: index === stage ? Infinity : 0,
                  repeatType: "reverse",
                  duration: index === stage ? 1.5 : 0.3
                }}
              >
                {index < stage ? (
                  <FiCheck className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-medium">{index + 1}</span>
                )}
              </motion.div>
            ))}
            
            {/* Progress line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-100 -translate-y-1/2 z-0">
              <motion.div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
                initial={{ width: '0%' }}
                animate={{ width: `${(stage / (stages.length - 1)) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
          
          {/* Step labels */}
          <div className="flex justify-between">
            {stages.map((s, index) => (
              <motion.div
                key={index}
                className="w-20 text-center text-xs"
                initial={{ opacity: 0 }}
                animate={{ opacity: index <= stage ? 1 : 0.5 }}
                transition={{ delay: index * 0.15 + 0.2 }}
              >
                <p className={`font-medium ${index <= stage ? 'text-indigo-600' : 'text-gray-400'}`}>
                  {s.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const getMessage = (stage, stages) => {
  return stages[stage]?.label || 'Menganalisis...';
};

export default Analysis;