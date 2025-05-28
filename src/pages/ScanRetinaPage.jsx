import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { withPageTransition } from '../context/ThemeContext';
import UploadImage from '../components/dashboard/UploadImage';
import Analysis from '../components/dashboard/Analysis';
import Report from '../components/dashboard/Report';

function ScanRetinaPageComponent({ toggleMobileMenu, isMobileMenuOpen }) {
  const [activeStep, setActiveStep] = useState(1);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [direction, setDirection] = useState(0);

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
    { number: 1, title: 'Unggah Citra', icon: 'upload', color: 'from-blue-600 to-blue-400' },
    { number: 2, title: 'Analisis AI', icon: 'analysis', color: 'from-indigo-600 to-indigo-400' },
    { number: 3, title: 'Hasil', icon: 'report', color: 'from-green-600 to-emerald-400' },
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

  // Progress bar animation
  const progress = useMotionValue(0);
  const progressPercent = useTransform(progress, [0, steps.length - 1], [0, 100]);
  
  useEffect(() => {
    progress.set((activeStep - 1) / (steps.length - 1));
  }, [activeStep, steps.length, progress]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-white">
      
      {/* Header Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">
          Scan Retina
        </h1>
        <p className="text-slate-600 mt-2 max-w-2xl mx-auto">
          Deteksi dini retinopati diabetik dengan teknologi AI canggih
        </p>
      </motion.div>
      
      {/* Modern Stepper */}
      <motion.div 
        className="mt-6 mb-12 relative"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center w-full max-w-3xl mx-auto">
          <div className="relative w-full">
            {/* Progress Bar Background with Glassmorphism */}
            <div className="absolute top-1/2 left-0 right-0 h-2 bg-white/50 backdrop-blur-sm rounded-full shadow-inner transform -translate-y-1/2">
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 rounded-full"
                style={{ width: progressPercent.get() + '%' }}
                animate={{ width: progressPercent.get() + '%' }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            </div>

            {/* Step Circles */}
            <div className="flex justify-between relative z-10">
              {steps.map((step) => (
                <div key={step.number} className="flex flex-col items-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStepChange(step.number)}
                    className={`relative flex items-center justify-center w-14 h-14 rounded-full cursor-pointer transition-all duration-500 ${
                      activeStep >= step.number 
                        ? 'bg-gradient-to-r ' + step.color + ' text-white shadow-lg' 
                        : 'bg-white text-gray-400 border-2 border-gray-200 shadow-sm'
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
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-lg font-bold">{step.number}</span>
                    )}
                    
                    {/* Pulse Animation for Active Step */}
                    {activeStep === step.number && (
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        animate={{
                          boxShadow: ['0 0 0 0px rgba(59, 130, 246, 0.3)', '0 0 0 8px rgba(59, 130, 246, 0)'],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          repeatType: "loop",
                        }}
                      />
                    )}
                  </motion.div>
                  <motion.div 
                    className="mt-3 flex flex-col items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: step.number * 0.1 + 0.2 }}
                  >
                    <p className={`text-sm font-medium ${
                      activeStep >= step.number ? 'text-blue-600 font-bold' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                    {activeStep === step.number && (
                      <motion.div
                        className="h-1 w-10 bg-blue-500 mt-1 rounded-full"
                        layoutId="activeStepIndicator"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content with Glassmorphism Cards */}
      <div className="w-full max-w-4xl mx-auto mt-8 mb-8 relative">
        <AnimatePresence mode="wait" custom={direction}>
          {activeStep === 1 && (
            <motion.div
              key="upload"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              custom={direction}
              className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-white/20"
            >
              <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-5">
                <h2 className="text-2xl font-bold text-white text-center">Unggah Citra Fundus</h2>
                <p className="text-blue-100 text-center text-sm mt-1">Unggah gambar retina untuk dianalisis oleh sistem AI</p>
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
              custom={direction}
              className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-white/20"
            >
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-400 p-5">
                <h2 className="text-2xl font-bold text-white text-center">Analisis Citra</h2>
                <p className="text-indigo-100 text-center text-sm mt-1">Sistem AI menganalisis gambar untuk mendeteksi tanda-tanda retinopati</p>
              </div>
              <div className="p-5 sm:p-6">
                <Analysis image={uploadedImage} onAnalysisComplete={handleAnalysisComplete} />
                
                <div className="flex justify-between mt-8">
                  <motion.button 
                    onClick={() => handleStepChange(1)}
                    className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-all"
                    whileHover={{ scale: 1.05, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}
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
              custom={direction}
              className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-white/20"
            >
              <div className="bg-gradient-to-r from-green-600 to-emerald-400 p-5">
                <h2 className="text-2xl font-bold text-white text-center">Hasil Analisis</h2>
                <p className="text-green-100 text-center text-sm mt-1">Laporan hasil dan rekomendasi berdasarkan analisis</p>
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
                    className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-all"
                    whileHover={{ scale: 1.05, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Kembali
                  </motion.button>
                  <motion.button 
                    variants={itemVariants}
                    onClick={() => {
                      // Reset state untuk memulai scan baru
                      setUploadedImage(null);
                      setAnalysisResult(null);
                      setActiveStep(1);
                    }}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-500 rounded-lg shadow-md hover:from-blue-700 hover:to-indigo-600 transition-all"
                    whileHover={{ scale: 1.05, boxShadow: "0 5px 15px rgba(59, 130, 246, 0.4)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Scan Baru
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Decorative elements */}
        <div className="absolute -z-10 top-1/4 -left-20 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -z-10 bottom-1/4 -right-20 w-60 h-60 bg-indigo-400/20 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}

const ScanRetinaPage = withPageTransition(ScanRetinaPageComponent, "flip");
export default ScanRetinaPage; 