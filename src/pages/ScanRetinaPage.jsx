import { useState } from 'react';
import { motion, AnimatePresence, useSpring } from 'framer-motion';
import { withPageTransition } from '../context/ThemeContext';
import UploadImage from '../components/dashboard/UploadImage';
import Analysis from '../components/dashboard/Analysis';
import Report from '../components/dashboard/Report';

function ScanRetinaPageComponent({ toggleMobileMenu, isMobileMenuOpen }) {
  const [activeStep, setActiveStep] = useState(1);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

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
    { number: 1, title: 'Unggah Citra', icon: 'upload' },
    { number: 2, title: 'Analisis AI', icon: 'analysis' },
    { number: 3, title: 'Hasil', icon: 'report' },
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
        damping: 25,
        stiffness: 400
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
        x: { type: 'spring', stiffness: 400, damping: 30 },
        opacity: { duration: 0.3 }
      }
    },
    exit: (direction) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0,
      transition: {
        x: { type: 'spring', stiffness: 400, damping: 30 },
        opacity: { duration: 0.3 }
      }
    })
  };

  // Glassmorphism style
  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    borderRadius: '16px',
  };

  return (
    <motion.div 
      className="p-4 sm:p-6 lg:p-8 min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #f0f7ff 0%, #e6f0ff 100%)',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Scan Retina</h1>
          <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full mx-auto"></div>
        </motion.div>
      
        {/* Stepper */}
        <motion.div 
          variants={itemVariants}
          className="mt-8 mb-10"
        >
          <div className="flex items-center justify-center w-full max-w-lg mx-auto">
            <div className="relative w-full">
              {/* Progress Line */}
              <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-gray-200 transform -translate-y-1/2 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-blue-500 to-violet-500"
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
                      whileHover={activeStep !== step.number ? { scale: 1.1 } : {}}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleStepChange(step.number)}
                      className={`relative flex items-center justify-center w-14 h-14 rounded-full cursor-pointer transition-all duration-300 ${
                        activeStep >= step.number 
                          ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white' 
                          : 'bg-white text-gray-400 border-2 border-gray-200'
                      }`}
                      style={{
                        boxShadow: activeStep >= step.number 
                          ? '0 10px 15px -3px rgba(59, 130, 246, 0.3), 0 4px 6px -4px rgba(59, 130, 246, 0.3)' 
                          : '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                      }}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ 
                        scale: 1, 
                        opacity: 1,
                        boxShadow: activeStep === step.number ? '0 0 0 4px rgba(59, 130, 246, 0.3)' : 'none'
                      }}
                      transition={{ delay: step.number * 0.1, duration: 0.3 }}
                    >
                      {activeStep > step.number ? (
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-lg font-bold">{step.number}</span>
                      )}
                      
                      {/* Pulse Animation for Active Step */}
                      {activeStep === step.number && (
                        <motion.div
                          className="absolute inset-0 rounded-full border-4 border-blue-400"
                          animate={{
                            scale: [1, 1.15, 1],
                            opacity: [1, 0.5, 1],
                          }}
                          transition={{
                            duration: 2,
                            ease: "easeInOut",
                            repeat: Infinity,
                          }}
                        />
                      )}
                    </motion.div>
                    <p className={`mt-3 text-sm font-medium truncate max-w-[80px] text-center ${
                      activeStep >= step.number ? 'text-blue-600 font-semibold' : 'text-gray-500'
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
        <motion.div 
          variants={itemVariants}
          className="w-full max-w-4xl mx-auto mt-8 mb-8"
        >
          <AnimatePresence mode="wait" custom={activeStep}>
            {activeStep === 1 && (
              <motion.div
                key="upload"
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                custom={1}
                className="overflow-hidden"
                style={glassStyle}
              >
                <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-5">
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
                custom={activeStep > 1 ? -1 : 1}
                className="overflow-hidden"
                style={glassStyle}
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
                      className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 transition-all"
                      whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
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
                className="overflow-hidden"
                style={glassStyle}
              >
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5">
                  <h2 className="text-xl font-bold text-white text-center">Hasil Analisis</h2>
                  <p className="text-emerald-100 text-center text-sm mt-1">Laporan hasil dan rekomendasi berdasarkan analisis</p>
                </div>
                <div className="p-5 sm:p-8">
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
                      className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 transition-all"
                      whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
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
                      className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl shadow-md hover:shadow-lg transition-all"
                      whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.3), 0 4px 6px -4px rgba(59, 130, 246, 0.3)" }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Scan Baru
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

const ScanRetinaPage = withPageTransition(ScanRetinaPageComponent);
export default ScanRetinaPage; 