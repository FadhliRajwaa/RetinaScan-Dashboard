import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getLatestAnalysis } from '../../services/api';

function Analysis({ image, onAnalysisComplete, analysis: initialAnalysis }) {
  const [analysis, setAnalysis] = useState(initialAnalysis || null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [animateProgress, setAnimateProgress] = useState(false);

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
    }
    
    // Pastikan severityLevel ada dengan format yang benar
    if (!normalized.severityLevel && normalized.frontendSeverityLevel !== undefined) {
      normalized.severityLevel = normalized.frontendSeverityLevel;
    }
    
    // Pastikan confidence ada
    if (!normalized.confidence) {
      normalized.confidence = 0.8; // Default confidence
    }
    
    // Pastikan recommendation ada
    if (!normalized.recommendation && normalized.notes) {
      normalized.recommendation = normalized.notes;
    }
    
    return normalized;
  };

  const handleAnalyze = async () => {
    try {
      setIsLoading(true);
      setAnimateProgress(false);
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
      setError('');
      setAnimateProgress(true);
      
      // Menghapus pemanggilan otomatis onAnalysisComplete
      // User harus mengklik tombol untuk melihat hasil
    } catch (err) {
      setError('Gagal mendapatkan hasil analisis.');
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
      transition: { type: 'spring', damping: 12 }
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
            className="text-red-500 bg-red-50 p-3 rounded-lg mb-4 text-sm sm:text-base flex items-start"
          >
            <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
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
            <div className="rounded-xl overflow-hidden border border-gray-200 relative shadow-md">
              <img 
                src={image.preview} 
                alt="Fundus image" 
                className="w-full h-48 sm:h-64 object-contain bg-gray-50"
              />
              
              {isLoading && (
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center bg-black/40"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div 
                    className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-gray-700 font-medium">Menganalisis...</p>
                  </motion.div>
                </motion.div>
              )}
            </div>
            
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
                >
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-sm sm:text-base lg:text-lg">
                      Tingkat Keparahan
                    </p>
                    <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      AI Diagnosis
                    </span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl shadow-sm">
                    <div className={`text-xl font-bold ${
                      analysis.severity === 'Ringan' ? 'text-green-500' :
                      analysis.severity === 'Sedang' ? 'text-yellow-500' :
                      'text-red-500'
                    }`}>
                      <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        {analysis.severity}
                      </motion.span>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  variants={itemVariants} 
                  className="flex flex-col gap-2"
                >
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-sm sm:text-base lg:text-lg">
                      Keyakinan AI
                    </p>
                    <motion.span
                      className="text-sm font-semibold text-blue-600"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      {(analysis.confidence * 100).toFixed(1)}%
                    </motion.span>
                  </div>
                  <div className="relative h-4 overflow-hidden rounded-full bg-gray-200">
                    <motion.div 
                      className={`h-full absolute left-0 top-0 ${
                        analysis.confidence < 0.5 ? 'bg-red-500' :
                        analysis.confidence < 0.8 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
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
                </motion.div>
                
                <motion.div
                  variants={itemVariants}
                  className="bg-blue-50 p-4 rounded-xl border border-blue-100 mt-4"
                >
                  <p className="text-blue-800 text-sm">
                    <span className="font-medium block mb-1">Rekomendasi:</span>
                    {analysis.recommendation || 
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
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-xl shadow-md transition-all mt-4 text-sm sm:text-base flex items-center justify-center"
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  Lihat Hasil Lengkap <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </motion.button>
              </motion.div>
            ) : (
              <motion.div 
                variants={containerVariants}
                className="flex flex-col items-center justify-center py-8"
              >
                <motion.div 
                  variants={itemVariants}
                  className="w-full max-w-sm bg-gray-50 rounded-xl p-6 shadow-sm"
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
                      <svg className="h-16 w-16 text-gray-400 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859M12 3v8.25m0 0l-3-3m3 3l3-3" />
                      </svg>
                      <p className="text-gray-600 mt-4">Unggah gambar dan klik "Jalankan Analisis" untuk memulai diagnostik</p>
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
            className={`w-full ${
              isLoading ? 'bg-indigo-400' : 
              !image ? 'bg-gray-400 cursor-not-allowed' : 
              'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700'
            } text-white py-3 rounded-xl shadow-md transition-all mt-5 text-sm sm:text-base flex items-center justify-center`}
            whileHover={!isLoading && image ? { scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" } : {}}
            whileTap={!isLoading && image ? { scale: 0.98 } : {}}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses...
              </>
            ) : (
              'Jalankan Analisis'
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default Analysis;