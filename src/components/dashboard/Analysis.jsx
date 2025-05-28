import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { getLatestAnalysis } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

function Analysis({ image, onAnalysisComplete, analysis: initialAnalysis }) {
  const [analysis, setAnalysis] = useState(initialAnalysis || null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [animateProgress, setAnimateProgress] = useState(false);
  const { theme } = useTheme();
  
  // Mouse position untuk efek hover yang lebih dinamis
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 300 };
  const mouseXSpring = useSpring(mouseX, springConfig);
  const mouseYSpring = useSpring(mouseY, springConfig);

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

  // Fungsi untuk menormalisasi data analisis
  const normalizeAnalysisData = (data) => {
    if (!data) return null;
    
    // Buat salinan data untuk dimodifikasi
    const normalized = { ...data };
    
    // Pastikan severity ada dengan format yang benar
    if (!normalized.severity && normalized.frontendSeverity) {
      normalized.severity = normalized.frontendSeverity;
    } else if (!normalized.severity && normalized.class) {
      // Handle format dari Flask API
      const severityMapping = {
        'No DR': 'Tidak ada',
        'Mild': 'Ringan',
        'Moderate': 'Sedang',
        'Severe': 'Berat',
        'Proliferative DR': 'Sangat Berat'
      };
      normalized.severity = severityMapping[normalized.class] || normalized.class;
    }
    
    // Pastikan severityLevel ada dengan format yang benar
    if (!normalized.severityLevel && normalized.frontendSeverityLevel !== undefined) {
      normalized.severityLevel = normalized.frontendSeverityLevel;
    } else if (!normalized.severityLevel && normalized.severity_level !== undefined) {
      normalized.severityLevel = normalized.severity_level;
    }
    
    // Pastikan confidence ada
    if (!normalized.confidence) {
      normalized.confidence = 0.8; // Default confidence
    }
    
    // Pastikan recommendation ada
    if (!normalized.recommendation && normalized.notes) {
      normalized.recommendation = normalized.notes;
    }

    // Tambahkan mapping rekomendasi berdasarkan severity jika tidak ada
    // Menggunakan rekomendasi yang sama persis dengan yang didefinisikan di flask_service/app.py
    if (!normalized.recommendation) {
      const recommendationMapping = {
        'Tidak ada': 'Lakukan pemeriksaan rutin setiap tahun.',
        'Ringan': 'Kontrol gula darah dan tekanan darah. Pemeriksaan ulang dalam 9-12 bulan.',
        'Sedang': 'Konsultasi dengan dokter spesialis mata. Pemeriksaan ulang dalam 6 bulan.',
        'Berat': 'Rujukan segera ke dokter spesialis mata. Pemeriksaan ulang dalam 2-3 bulan.',
        'Sangat Berat': 'Rujukan segera ke dokter spesialis mata untuk evaluasi dan kemungkinan tindakan laser atau operasi.'
      };
      
      normalized.recommendation = recommendationMapping[normalized.severity] || 'Konsultasikan dengan dokter mata.';
    }
    
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
      onAnalysisComplete(analysis);
    }
  };
  
  // Fungsi untuk efek hover yang lebih dinamis
  const handleMouseMove = (e) => {
    const { currentTarget, clientX, clientY } = e;
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  };

  const resetMousePosition = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Efek glassmorphism
  const glassEffect = {
    background: `rgba(255, 255, 255, 0.7)`,
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
  };

  // Animation variants yang ditingkatkan
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.2,
        duration: 0.6,
        ease: [0.6, 0.05, -0.01, 0.9]
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
        damping: 25,
        stiffness: 200
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto"
    >
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="text-red-500 bg-red-50 p-3 rounded-lg mb-4 text-sm sm:text-base flex items-start"
            style={{
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}
          >
            <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
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
            transition={{ type: 'spring', damping: 20 }}
            className="text-amber-700 bg-amber-50 border border-amber-200 p-4 rounded-lg mb-4 text-sm sm:text-base flex items-start"
            style={{
              boxShadow: '0 4px 15px rgba(245, 158, 11, 0.15)',
            }}
          >
            <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <span className="font-bold block mb-1">PERHATIAN: Mode Simulasi Aktif</span> 
              <span>Hasil analisis ini menggunakan data simulasi karena layanan AI tidak tersedia. Hasil ini TIDAK BOLEH digunakan untuk diagnosis. Silakan konsultasikan dengan dokter mata untuk diagnosis yang akurat.</span>
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
              className="overflow-hidden relative"
              style={{
                ...glassEffect,
                padding: '0.5rem',
              }}
              whileHover={{ 
                boxShadow: `0 15px 35px 0 rgba(31, 38, 135, 0.2)`,
                y: -5
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <img 
                src={image.preview} 
                alt="Fundus image" 
                className="w-full h-48 sm:h-64 object-contain rounded-lg overflow-hidden"
                style={{
                  background: 'rgba(249, 250, 251, 0.8)'
                }}
              />
              
              {isLoading && (
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <LoadingIndicator />
                </motion.div>
              )}
              
              {/* Tambahkan watermark simulasi jika dalam mode simulasi */}
              {analysis && (analysis.isSimulation || analysis.simulation_mode || 
                (analysis.raw_prediction && analysis.raw_prediction.is_simulation)) && !isLoading && (
                <motion.div 
                  className="absolute top-2 right-2"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 20 }}
                >
                  <motion.span 
                    className="bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    SIMULASI
                  </motion.span>
                </motion.div>
              )}
            </motion.div>
            
            <motion.div 
              className="mt-2 text-xs text-center text-gray-500 italic"
              variants={itemVariants}
            >
              Sistem AI menganalisis pola dan gejala pada citra fundus
            </motion.div>
          </motion.div>
        )}
        
        {/* Right side - Analysis results */}
        <div className={`w-full ${image && image.preview ? 'md:w-1/2' : ''}`}>
          <div className="flex-grow">
            {analysis ? (
              <motion.div
                variants={containerVariants}
                className="space-y-5"
              >
                <motion.div 
                  variants={itemVariants} 
                  className="flex flex-col gap-2"
                  style={glassEffect}
                  whileHover={{ 
                    boxShadow: `0 15px 35px 0 rgba(31, 38, 135, 0.2)`,
                    y: -3
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <div className="flex justify-between items-center p-4">
                    <p className="font-medium text-sm sm:text-base lg:text-lg" style={{ color: theme.secondary || "#1F2937" }}>
                      Tingkat Keparahan
                    </p>
                    <span className="text-xs font-medium px-2 py-1 rounded-full" style={{
                      background: `${theme.primary}20` || 'rgba(59, 130, 246, 0.2)',
                      color: theme.primary || '#3B82F6',
                    }}>
                      AI Diagnosis
                    </span>
                  </div>
                  <div className="p-4 rounded-b-xl" style={{
                    background: 'rgba(249, 250, 251, 0.5)',
                    borderTop: '1px solid rgba(229, 231, 235, 0.5)'
                  }}>
                    <div className={`text-xl font-bold ${
                      analysis.severity === 'Tidak ada' ? 'text-green-500' :
                      analysis.severity === 'Ringan' ? 'text-green-500' :
                      analysis.severity === 'Sedang' ? 'text-yellow-500' :
                      analysis.severity === 'Berat' ? 'text-orange-500' :
                      'text-red-500'
                    }`}>
                      <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, type: 'spring', damping: 20 }}
                      >
                        {analysis.severity}
                      </motion.span>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  variants={itemVariants} 
                  className="flex flex-col gap-2"
                  style={glassEffect}
                  whileHover={{ 
                    boxShadow: `0 15px 35px 0 rgba(31, 38, 135, 0.2)`,
                    y: -3
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <div className="flex justify-between items-center p-4">
                    <p className="font-medium text-sm sm:text-base lg:text-lg" style={{ color: theme.secondary || "#1F2937" }}>
                      Keyakinan AI
                    </p>
                    <motion.span
                      className="text-sm font-semibold"
                      style={{ color: theme.primary || '#3B82F6' }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      {(analysis.confidence * 100).toFixed(1)}%
                    </motion.span>
                  </div>
                  <div className="px-4 pb-4">
                    <div className="relative h-4 overflow-hidden rounded-full bg-gray-200">
                      <motion.div 
                        className="h-full absolute left-0 top-0"
                        style={{
                          background: analysis.confidence < 0.5 
                            ? 'linear-gradient(90deg, #EF4444 0%, #F87171 100%)' 
                            : analysis.confidence < 0.8 
                              ? 'linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)' 
                              : 'linear-gradient(90deg, #10B981 0%, #34D399 100%)',
                          boxShadow: analysis.confidence < 0.5 
                            ? '0 0 15px rgba(239, 68, 68, 0.5)' 
                            : analysis.confidence < 0.8 
                              ? '0 0 15px rgba(245, 158, 11, 0.5)' 
                              : '0 0 15px rgba(16, 185, 129, 0.5)'
                        }}
                        initial={{ width: '0%' }}
                        animate={animateProgress ? { width: `${analysis.confidence * 100}%` } : { width: '0%' }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 text-xs text-gray-500 mt-1">
                      <div>Rendah</div>
                      <div className="text-center">Sedang</div>
                      <div className="text-right">Tinggi</div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  variants={itemVariants}
                  style={{
                    ...glassEffect,
                    background: 'rgba(239, 246, 255, 0.7)'
                  }}
                  className="p-4 rounded-xl mt-4"
                  whileHover={{ 
                    boxShadow: `0 15px 35px 0 rgba(31, 38, 135, 0.2)`,
                    y: -3
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <p className="text-blue-800 text-sm">
                    <span className="font-medium block mb-1">Rekomendasi:</span>
                    {analysis.recommendation || analysis.notes || 
                      (analysis.severity === 'Ringan' 
                      ? 'Lakukan pemeriksaan rutin setiap 12 bulan.' 
                      : analysis.severity === 'Sedang'
                      ? 'Konsultasi dengan dokter mata dalam 3-6 bulan.'
                      : 'Segera konsultasikan ke dokter mata spesialis.')
                    }
                  </p>
                </motion.div>

                {/* Tombol "Lihat Hasil" Baru */}
                <motion.button
                  variants={itemVariants}
                  onClick={handleViewResults}
                  className="w-full py-3 rounded-xl text-white font-medium transition-all duration-300 flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${theme.accent || '#10B981'}, ${theme.primary || '#059669'})`,
                    boxShadow: `0 8px 20px -4px ${theme.accent || '#10B981'}40`,
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)'
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: `0 10px 25px -5px ${theme.accent || '#10B981'}50`
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  Lihat Hasil Lengkap 
                  <motion.svg 
                    className="w-5 h-5 ml-2" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </motion.svg>
                </motion.button>
              </motion.div>
            ) : (
              <motion.div 
                variants={containerVariants}
                className="flex flex-col items-center justify-center py-8"
                style={glassEffect}
                whileHover={{ 
                  boxShadow: `0 15px 35px 0 rgba(31, 38, 135, 0.2)`,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                onMouseMove={handleMouseMove}
                onMouseLeave={resetMousePosition}
              >
                <motion.div 
                  className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden"
                  style={{
                    background: `radial-gradient(circle at ${mouseXSpring}px ${mouseYSpring}px, ${theme.primary}15 0%, transparent 60%)`,
                  }}
                />
                
                <motion.div 
                  variants={itemVariants}
                  className="w-full max-w-sm p-6"
                >
                  {isLoading ? (
                    <div className="animate-pulse space-y-6">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                      <div className="space-y-3">
                        <div className="h-20 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6 mx-auto"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto"></div>
                      </div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <motion.svg 
                        className="h-16 w-16 mx-auto" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke={theme.primary || '#3B82F6'}
                        animate={{ 
                          y: [0, -8, 0],
                          opacity: [0.7, 1, 0.7]
                        }}
                        transition={{ 
                          duration: 2.5,
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859M12 3v8.25m0 0l-3-3m3 3l3-3" />
                      </motion.svg>
                      <p className="text-gray-600 mt-4" style={{ color: theme.secondary || "#1F2937" }}>
                        Unggah gambar dan klik "Jalankan Analisis" untuk memulai diagnostik
                      </p>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </div>

          <motion.button
            variants={itemVariants}
            onClick={handleAnalyze}
            disabled={isLoading || !image}
            className="w-full py-3 rounded-xl text-white font-medium transition-all duration-300 mt-5 flex items-center justify-center"
            style={{
              background: isLoading 
                ? 'rgba(79, 70, 229, 0.7)' 
                : !image 
                  ? 'rgba(156, 163, 175, 0.7)' 
                  : `linear-gradient(135deg, ${theme.primary || '#4F46E5'}, ${theme.secondary || '#4338CA'})`,
              boxShadow: isLoading || !image 
                ? 'none' 
                : `0 8px 20px -4px ${theme.primary}40`,
              cursor: isLoading || !image ? 'not-allowed' : 'pointer',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)'
            }}
            whileHover={!isLoading && image ? { 
              scale: 1.02,
              boxShadow: `0 10px 25px -5px ${theme.primary}50`
            } : {}}
            whileTap={!isLoading && image ? { scale: 0.98 } : {}}
          >
            {isLoading ? (
              <>
                <motion.svg 
                  className="mr-2 h-5 w-5 text-white" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                  animate={{ rotate: 360 }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </motion.svg>
                Memproses...
              </>
            ) : (
              <>
                <motion.svg 
                  className="mr-2 h-5 w-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  animate={!isLoading && image ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </motion.svg>
                Jalankan Analisis
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// Tambahkan komponen LoadingIndicator
const LoadingIndicator = () => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [loadingPhase, setLoadingPhase] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    // Ubah fase loading setiap beberapa detik untuk animasi yang lebih menarik
    const phaseTimer = setInterval(() => {
      setLoadingPhase(prev => (prev + 1) % 4);
    }, 3000);
    
    return () => {
      clearInterval(timer);
      clearInterval(phaseTimer);
    };
  }, []);
  
  // Pesan dinamis berdasarkan waktu
  const getMessage = () => {
    if (elapsedTime < 10) {
      return "Menganalisis gambar...";
    } else if (elapsedTime < 30) {
      return "Pemrosesan gambar membutuhkan waktu lebih lama dari biasanya...";
    } else if (elapsedTime < 60) {
      return "Saat ini server free-tier mungkin sedang dalam cold start (2-3 menit)...";
    } else if (elapsedTime < 120) {
      return "Cold start pada free tier menghabiskan waktu hingga 2-3 menit, mohon bersabar...";
    } else {
      return "Masih menunggu respons server, ini mungkin disebabkan oleh lalu lintas tinggi...";
    }
  };

  // Fase-fase analisis untuk animasi
  const phases = [
    "Preprocessing gambar",
    "Mendeteksi fitur retina",
    "Menganalisis pola pembuluh darah",
    "Mengevaluasi tingkat keparahan"
  ];
  
  return (
    <motion.div 
      className="bg-white/90 backdrop-blur-md p-6 rounded-xl shadow-xl flex flex-col items-center max-w-sm"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        border: '1px solid rgba(255, 255, 255, 0.18)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
      }}
    >
      {/* Animasi loading yang lebih menarik */}
      <div className="relative w-20 h-20 mb-4">
        <motion.div 
          className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute inset-2 border-4 border-indigo-500 border-b-transparent rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute inset-4 border-4 border-purple-500 border-l-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute inset-0 w-full h-full flex items-center justify-center"
        >
          <motion.div 
            className="w-3 h-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </div>
      
      <motion.p 
        className="text-gray-800 font-medium text-center"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {getMessage()}
      </motion.p>
      
      {/* Fase analisis dengan animasi */}
      <div className="mt-4 w-full">
        {phases.map((phase, index) => (
          <div key={index} className="flex items-center mb-2">
            <motion.div 
              className={`w-2 h-2 rounded-full mr-2 ${loadingPhase === index ? 'bg-blue-500' : 'bg-gray-300'}`}
              animate={loadingPhase === index ? { scale: [1, 1.5, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <motion.p 
              className={`text-xs ${loadingPhase === index ? 'text-blue-600 font-medium' : 'text-gray-500'}`}
              animate={loadingPhase === index ? { x: [0, 2, 0] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {phase}
            </motion.p>
          </div>
        ))}
      </div>
      
      {elapsedTime > 20 && (
        <motion.p 
          className="text-xs text-gray-500 mt-3 px-3 py-1 rounded-full bg-gray-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Waktu tunggu: {Math.floor(elapsedTime / 60)}m {elapsedTime % 60}s
        </motion.p>
      )}
      
      {elapsedTime > 30 && (
        <motion.div 
          className="mt-3 text-xs text-gray-600 bg-gray-100 p-3 rounded-lg border border-gray-200"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p>
            <b>Info:</b> Free tier pada layanan cloud sering mengalami "sleep mode" 
            setelah 15 menit tidak aktif. Startup pertama bisa memakan waktu 2-3 menit.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Analysis;