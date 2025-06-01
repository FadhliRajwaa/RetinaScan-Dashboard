import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { withPageTransition } from '../context/ThemeContext';
import UploadImage from '../components/dashboard/UploadImage';
import Analysis from '../components/dashboard/Analysis';
import Report from '../components/dashboard/Report';
import { FiUpload, FiActivity, FiFileText, FiEye } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

function ScanRetinaPageComponent() {
  const [activeStep, setActiveStep] = useState(1);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const { darkMode } = useTheme();

  const handleStepChange = (step) => {
    if ((step === 2 && !uploadedImage) || (step === 3 && !analysisResult)) {
      // Tidak bisa langsung melompat ke tahap yang membutuhkan data sebelumnya
      return;
    }
    setActiveStep(step);
  };

  const handleImageUploaded = (image) => {
    setUploadedImage(image);
    // Automatically move to analysis step after successful upload
    setActiveStep(2);
  };

  const handleAnalysisComplete = (result) => {
    // Tambahkan informasi pasien dari uploadedImage ke result
    const resultWithPatient = {
      ...result,
      patient: uploadedImage?.patient // Ambil informasi pasien dari uploadedImage
    };
    setAnalysisResult(resultWithPatient);
    // Mengubah activeStep ke 3 untuk langsung mengarahkan ke halaman hasil
    setActiveStep(3);
  };

  const steps = [
    { number: 1, title: 'Unggah Citra', icon: <FiUpload className="w-5 h-5" /> },
    { number: 2, title: 'Analisis AI', icon: <FiActivity className="w-5 h-5" /> },
    { number: 3, title: 'Hasil', icon: <FiFileText className="w-5 h-5" /> },
  ];

  // Variants untuk animasi
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        delayChildren: 0.3,
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
        damping: 12,
        stiffness: 100
      }
    }
  };

  const slideVariants = {
    initial: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    },
    exit: (direction) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    })
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
      {/* Header */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <motion.div 
          variants={itemVariants}
          className="flex items-center space-x-3 mb-2"
        >
          <div className={`p-2 rounded-lg ${
            darkMode 
              ? 'bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-900/20' 
              : 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20'
          }`}>
            <FiEye className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              Scan Retina
            </h1>
            <p className={`text-sm ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Analisis gambar retina dengan teknologi AI
            </p>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Stepper */}
      <motion.div 
        className="mt-6 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center w-full max-w-lg mx-auto">
          <div className="relative w-full">
            {/* Progress Line */}
            <div className={`absolute top-1/2 left-0 right-0 h-1.5 ${
              darkMode ? 'bg-gray-700' : 'bg-gray-200'
            } transform -translate-y-1/2 rounded-full`}>
              <motion.div 
                className={`h-full ${
                  darkMode ? 'bg-blue-500' : 'bg-blue-600'
                } rounded-full`}
                initial={{ width: '0%' }}
                animate={{ width: `${((activeStep - 1) / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>

            {/* Step Circles */}
            <div className="flex justify-between relative z-10">
              {steps.map((step) => (
                <div key={step.number} className="flex flex-col items-center">
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStepChange(step.number)}
                    className={`relative flex items-center justify-center w-12 h-12 rounded-full cursor-pointer transition-all duration-300 ${
                      activeStep >= step.number 
                        ? darkMode
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                          : 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : darkMode
                          ? 'bg-gray-800 text-gray-400 border-2 border-gray-700'
                          : 'bg-white text-gray-400 border-2 border-gray-200 shadow-sm'
                    }`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ 
                      scale: 1, 
                      opacity: 1,
                      boxShadow: activeStep === step.number 
                        ? darkMode
                          ? '0 0 0 4px rgba(59, 130, 246, 0.3)'
                          : '0 0 0 4px rgba(59, 130, 246, 0.3)'
                        : 'none'
                    }}
                    transition={{ delay: step.number * 0.1, duration: 0.3 }}
                  >
                    {activeStep > step.number ? (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-lg font-semibold">{step.number}</span>
                    )}
                    
                    {/* Pulse Animation for Active Step */}
                    {activeStep === step.number && (
                      <motion.div
                        className={`absolute inset-0 rounded-full ${
                          darkMode ? 'border-4 border-blue-500/50' : 'border-4 border-blue-400'
                        }`}
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [1, 0.7, 1],
                        }}
                        transition={{
                          duration: 2,
                          ease: "easeInOut",
                          repeat: Infinity,
                        }}
                      />
                    )}
                  </motion.div>
                  <p className={`mt-2 text-xs sm:text-sm font-medium truncate max-w-[80px] text-center ${
                    activeStep >= step.number 
                      ? darkMode ? 'text-blue-400' : 'text-blue-600'
                      : darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="w-full max-w-4xl mx-auto mt-8 mb-8">
        <AnimatePresence mode="wait" custom={activeStep}>
          {activeStep === 1 && (
            <motion.div
              key="upload"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              custom={1}
              className={`${
                darkMode 
                  ? 'bg-gray-800 border border-gray-700 shadow-xl shadow-blue-900/10' 
                  : 'bg-white shadow-xl shadow-blue-200/30'
              } rounded-xl overflow-hidden`}
            >
              <div className={`${
                darkMode 
                  ? 'bg-gradient-to-r from-blue-700 to-blue-600' 
                  : 'bg-gradient-to-r from-blue-600 to-blue-400'
              } p-5`}>
                <h2 className="text-xl font-bold text-white text-center">Unggah Citra Fundus</h2>
                <p className={`${
                  darkMode ? 'text-blue-200' : 'text-blue-100'
                } text-center text-sm mt-1`}>
                  Unggah gambar retina untuk dianalisis oleh sistem AI
                </p>
              </div>
              <div className="p-5 sm:p-6">
                <UploadImage onUploadSuccess={handleImageUploaded} autoUpload={false} />
              </div>
            </motion.div>
          )}

          {activeStep === 2 && (
            <motion.div
              key="analysis"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              custom={activeStep > 1 ? -1 : 1}
              className={`${
                darkMode 
                  ? 'bg-gray-800 border border-gray-700 shadow-xl shadow-indigo-900/10' 
                  : 'bg-white shadow-xl shadow-indigo-200/30'
              } rounded-xl overflow-hidden`}
            >
              <div className={`${
                darkMode 
                  ? 'bg-gradient-to-r from-indigo-700 to-indigo-600' 
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-400'
              } p-5`}>
                <h2 className="text-xl font-bold text-white text-center">Analisis Citra</h2>
                <p className={`${
                  darkMode ? 'text-indigo-200' : 'text-indigo-100'
                } text-center text-sm mt-1`}>
                  Sistem AI menganalisis gambar untuk mendeteksi tanda-tanda retinopati
                </p>
              </div>
              <div className="p-5 sm:p-6">
                <Analysis image={uploadedImage} onAnalysisComplete={handleAnalysisComplete} />
                
                <div className="flex justify-between mt-8">
                  <motion.button 
                    onClick={() => handleStepChange(1)}
                    className={`px-4 py-2.5 text-sm font-medium ${
                      darkMode
                        ? 'text-gray-300 border border-gray-600 bg-gray-700 hover:bg-gray-600'
                        : 'text-gray-600 border border-gray-300 bg-white hover:bg-gray-50'
                    } rounded-lg shadow-sm transition-all`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Kembali
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {activeStep === 3 && (
            <motion.div
              key="report"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              custom={-1}
              className={`${
                darkMode 
                  ? 'bg-gray-800 border border-gray-700 shadow-xl shadow-green-900/10' 
                  : 'bg-white shadow-xl shadow-green-200/30'
              } rounded-xl overflow-hidden`}
            >
              <div className={`${
                darkMode 
                  ? 'bg-gradient-to-r from-green-700 to-emerald-600' 
                  : 'bg-gradient-to-r from-green-600 to-emerald-400'
              } p-5`}>
                <h2 className="text-xl font-bold text-white text-center">Hasil Analisis</h2>
                <p className={`${
                  darkMode ? 'text-green-200' : 'text-green-100'
                } text-center text-sm mt-1`}>
                  Laporan hasil dan rekomendasi berdasarkan analisis
                </p>
              </div>
              <div className="p-5 sm:p-6">
                <Report result={analysisResult} />
                
                <motion.div 
                  className="flex justify-between mt-8"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.button 
                    variants={itemVariants}
                    onClick={() => handleStepChange(2)}
                    className={`px-4 py-2.5 text-sm font-medium ${
                      darkMode
                        ? 'text-gray-300 border border-gray-600 bg-gray-700 hover:bg-gray-600'
                        : 'text-gray-600 border border-gray-300 bg-white hover:bg-gray-50'
                    } rounded-lg shadow-sm transition-all`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Kembali
                  </motion.button>
                  <motion.button 
                    variants={itemVariants}
                    onClick={() => {
                      setActiveStep(1);
                      setUploadedImage(null);
                      setAnalysisResult(null);
                    }}
                    className={`px-4 py-2.5 text-sm font-medium text-white ${
                      darkMode
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                    } rounded-lg shadow-md hover:shadow-lg transition-all`}
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Scan Baru
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

const ScanRetinaPage = withPageTransition(ScanRetinaPageComponent);
export default ScanRetinaPage; 