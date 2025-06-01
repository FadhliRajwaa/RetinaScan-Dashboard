import { useState } from 'react';
import { motion, AnimatePresence, useSpring } from 'framer-motion';
import { withPageTransition, useTheme } from '../context/ThemeContext';
import UploadImage from '../components/dashboard/UploadImage';
import Analysis from '../components/dashboard/Analysis';
import Report from '../components/dashboard/Report';

function ScanRetinaPageComponent({ toggleMobileMenu, isMobileMenuOpen }) {
  const [activeStep, setActiveStep] = useState(1);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const { theme, isDarkMode } = useTheme();
  
  // Get theme-specific colors
  const currentTheme = isDarkMode ? theme.dark : theme.light;

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

  // Glassmorphism style based on theme
  const glassEffect = isDarkMode ? theme.dark.glassEffect : theme.light.glassEffect;

  // Background gradients for each step
  const stepGradients = {
    1: isDarkMode ? currentTheme.blueGradient : 'linear-gradient(135deg, #3B82F6, #60A5FA)',
    2: isDarkMode ? currentTheme.purpleGradient : 'linear-gradient(135deg, #6366F1, #818CF8)',
    3: isDarkMode ? currentTheme.successGradient : 'linear-gradient(135deg, #10B981, #34D399)'
  };

  return (
    <div 
      className={`p-4 sm:p-6 lg:p-8 min-h-screen ${isDarkMode ? 'dark' : ''}`}
      style={{ 
        background: isDarkMode 
          ? `linear-gradient(135deg, ${currentTheme.background}, ${currentTheme.backgroundAlt})` 
          : 'linear-gradient(135deg, #F9FAFB, #F3F4F6)'
      }}
    >
      
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
            <div 
              className="absolute top-1/2 left-0 right-0 h-1 transform -translate-y-1/2"
              style={{ 
                backgroundColor: isDarkMode 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : 'rgba(0, 0, 0, 0.1)' 
              }}
            >
              <motion.div 
                className="h-full"
                style={{ 
                  background: isDarkMode 
                    ? currentTheme.coolGradient 
                    : currentTheme.primaryGradient 
                }}
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
                    className="relative flex items-center justify-center w-12 h-12 rounded-full cursor-pointer transition-all duration-300"
                    style={{ 
                      background: activeStep >= step.number 
                        ? isDarkMode 
                          ? currentTheme.coolGradient 
                          : currentTheme.primaryGradient
                        : isDarkMode 
                          ? 'rgba(255, 255, 255, 0.05)' 
                          : 'white',
                      color: activeStep >= step.number 
                        ? 'white' 
                        : isDarkMode 
                          ? currentTheme.textSecondary 
                          : 'rgba(107, 114, 128, 1)',
                      border: activeStep >= step.number 
                        ? 'none' 
                        : `2px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                      boxShadow: activeStep === step.number 
                        ? isDarkMode 
                          ? '0 0 15px rgba(59, 130, 246, 0.5)' 
                          : '0 0 15px rgba(59, 130, 246, 0.3)'
                        : 'none'
                    }}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ 
                      scale: 1, 
                      opacity: 1
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
                        className="absolute inset-0 rounded-full"
                        style={{
                          border: `3px solid ${isDarkMode ? 'rgba(59, 130, 246, 0.6)' : 'rgba(59, 130, 246, 0.4)'}`
                        }}
                        animate={{
                          scale: [1, 1.2, 1],
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
                  <p 
                    className={`mt-2 text-xs sm:text-sm font-medium truncate max-w-[80px] text-center`}
                    style={{ 
                      color: activeStep >= step.number 
                        ? isDarkMode 
                          ? currentTheme.accent 
                          : currentTheme.primary
                        : isDarkMode 
                          ? currentTheme.textSecondary 
                          : 'rgba(107, 114, 128, 1)'
                    }}
                  >
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
              className="rounded-xl overflow-hidden"
              style={{
                ...glassEffect,
                boxShadow: isDarkMode 
                  ? currentTheme.mediumShadow
                  : '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div 
                className="p-4"
                style={{ background: stepGradients[1] }}
              >
                <h2 className="text-xl font-bold text-white text-center">Unggah Citra Fundus</h2>
                <p className="text-blue-100 text-center text-sm mt-1">Unggah gambar retina untuk dianalisis oleh sistem AI</p>
              </div>
              <div className="p-4 sm:p-6">
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
              className="rounded-xl overflow-hidden"
              style={{
                ...glassEffect,
                boxShadow: isDarkMode 
                  ? currentTheme.mediumShadow
                  : '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div 
                className="p-4"
                style={{ background: stepGradients[2] }}
              >
                <h2 className="text-xl font-bold text-white text-center">Analisis Citra</h2>
                <p className="text-indigo-100 text-center text-sm mt-1">Sistem AI menganalisis gambar untuk mendeteksi tanda-tanda retinopati</p>
              </div>
              <div className="p-4 sm:p-6">
                <Analysis image={uploadedImage} onAnalysisComplete={handleAnalysisComplete} />
                
                <div className="flex justify-between mt-8">
                  <motion.button 
                    onClick={() => handleStepChange(1)}
                    className="px-4 py-2 text-sm font-medium rounded-lg"
                    style={{
                      color: isDarkMode ? currentTheme.text : 'rgba(75, 85, 99, 1)',
                      border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                      backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.3)' : 'rgba(249, 250, 251, 0.7)',
                    }}
                    whileHover={theme.animations.smoothHover}
                    whileTap={theme.animations.smoothTap}
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
              className="rounded-xl overflow-hidden"
              style={{
                ...glassEffect,
                boxShadow: isDarkMode 
                  ? currentTheme.mediumShadow
                  : '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div 
                className="p-4"
                style={{ background: stepGradients[3] }}
              >
                <h2 className="text-xl font-bold text-white text-center">Hasil Analisis</h2>
                <p className="text-green-100 text-center text-sm mt-1">Laporan hasil dan rekomendasi berdasarkan analisis</p>
              </div>
              <div className="p-4 sm:p-6">
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
                    className="px-4 py-2 text-sm font-medium rounded-lg"
                    style={{
                      color: isDarkMode ? currentTheme.text : 'rgba(75, 85, 99, 1)',
                      border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                      backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.3)' : 'rgba(249, 250, 251, 0.7)',
                    }}
                    whileHover={theme.animations.smoothHover}
                    whileTap={theme.animations.smoothTap}
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
                    className="px-4 py-2 text-sm font-medium text-white rounded-lg"
                    style={{
                      background: isDarkMode 
                        ? currentTheme.coolGradient 
                        : currentTheme.primaryGradient,
                      boxShadow: isDarkMode 
                        ? '0 4px 12px rgba(59, 130, 246, 0.3)' 
                        : '0 4px 12px rgba(59, 130, 246, 0.2)',
                    }}
                    whileHover={theme.animations.smoothHover}
                    whileTap={theme.animations.smoothTap}
                  >
                    Scan Baru
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const ScanRetinaPage = withPageTransition(ScanRetinaPageComponent);
export default ScanRetinaPage; 