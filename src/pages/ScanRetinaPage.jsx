import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { withPageTransition } from '../context/ThemeContext';
import UploadImage from '../components/dashboard/UploadImage';
import Analysis from '../components/dashboard/Analysis';
import Report from '../components/dashboard/Report';
import { FiUpload, FiCpu, FiFileText, FiArrowLeft, FiArrowRight } from 'react-icons/fi';

function ScanRetinaPageComponent() {
  const [activeStep, setActiveStep] = useState(1);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [direction, setDirection] = useState(0); // For animation direction

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  const handleStepChange = (step) => {
    if ((step === 2 && !uploadedImage) || (step === 3 && !analysisResult)) {
      // Tidak bisa langsung melompat ke tahap yang membutuhkan data sebelumnya
      return;
    }
    setDirection(step > activeStep ? 1 : -1);
    setActiveStep(step);
  };

  const handleImageUploaded = (image) => {
    setUploadedImage(image);
    // Automatically move to analysis step after successful upload
    setDirection(1);
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
    setDirection(1);
    setActiveStep(3);
  };

  const steps = [
    { number: 1, title: 'Unggah Citra', icon: <FiUpload className="w-5 h-5" /> },
    { number: 2, title: 'Analisis AI', icon: <FiCpu className="w-5 h-5" /> },
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

  // Glassmorphism style
  const glassEffect = {
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    borderRadius: '16px',
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto"
      >
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Scan Retina</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Unggah gambar retina untuk dianalisis oleh sistem AI dan dapatkan hasil deteksi retinopati diabetik secara instan
          </p>
        </div>
        
        {/* Stepper */}
        <motion.div 
          className="mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-center w-full max-w-2xl mx-auto">
            <div className="relative w-full">
              {/* Progress Line */}
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 transform -translate-y-1/2">
                <motion.div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
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
                      className={`relative flex items-center justify-center w-14 h-14 rounded-full cursor-pointer transition-all duration-300 ${
                        activeStep >= step.number 
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                          : 'bg-white text-gray-400 border-2 border-gray-200'
                      }`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ 
                        scale: 1, 
                        opacity: 1,
                        boxShadow: activeStep === step.number ? '0 0 0 4px rgba(59, 130, 246, 0.3)' : 'none'
                      }}
                      transition={{ delay: step.number * 0.1, duration: 0.3 }}
                    >
                      {activeStep > step.number ? (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <div className="flex flex-col items-center justify-center">
                          {step.icon}
                        </div>
                      )}
                      
                      {/* Pulse Animation for Active Step */}
                      {activeStep === step.number && (
                        <motion.div
                          className="absolute inset-0 rounded-full border-4 border-blue-400"
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
                    <p className={`mt-2 text-sm font-medium text-center ${
                      activeStep >= step.number ? 'text-blue-600' : 'text-gray-500'
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
          <AnimatePresence mode="wait" custom={direction}>
            {activeStep === 1 && (
              <motion.div
                key="upload"
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                custom={direction}
                className="rounded-2xl overflow-hidden shadow-xl"
                style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e6f0fb 100%)' }}
              >
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5">
                  <h2 className="text-xl font-bold text-white text-center">Unggah Citra Fundus</h2>
                  <p className="text-blue-100 text-center text-sm mt-1">Unggah gambar retina untuk dianalisis oleh sistem AI</p>
                </div>
                <div className="p-5 sm:p-8">
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
                custom={direction}
                className="rounded-2xl overflow-hidden shadow-xl"
                style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #e6ebfb 100%)' }}
              >
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5">
                  <h2 className="text-xl font-bold text-white text-center">Analisis Citra</h2>
                  <p className="text-indigo-100 text-center text-sm mt-1">Sistem AI menganalisis gambar untuk mendeteksi tanda-tanda retinopati</p>
                </div>
                <div className="p-5 sm:p-8">
                  <Analysis image={uploadedImage} onAnalysisComplete={handleAnalysisComplete} />
                  
                  <div className="flex justify-between mt-8">
                    <motion.button 
                      onClick={() => handleStepChange(1)}
                      className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      whileHover={{ scale: 1.03, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <FiArrowLeft className="w-4 h-4" />
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
                custom={direction}
                className="rounded-2xl overflow-hidden shadow-xl"
                style={{ background: 'linear-gradient(135deg, #f0fff4 0%, #e6fbef 100%)' }}
              >
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-5">
                  <h2 className="text-xl font-bold text-white text-center">Hasil Analisis</h2>
                  <p className="text-green-100 text-center text-sm mt-1">Laporan hasil dan rekomendasi berdasarkan analisis</p>
                </div>
                <div className="p-5 sm:p-8">
                  <Report result={analysisResult} />
                  
                  <motion.div 
                    className="flex flex-col sm:flex-row justify-between gap-4 mt-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.button 
                      variants={itemVariants}
                      onClick={() => handleStepChange(2)}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      whileHover={{ scale: 1.03, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <FiArrowLeft className="w-4 h-4" />
                      Kembali ke Analisis
                    </motion.button>
                    <motion.button 
                      variants={itemVariants}
                      onClick={() => {
                        setActiveStep(1);
                        setUploadedImage(null);
                        setAnalysisResult(null);
                      }}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Scan Baru
                      <FiArrowRight className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

const ScanRetinaPage = withPageTransition(ScanRetinaPageComponent);
export default ScanRetinaPage; 