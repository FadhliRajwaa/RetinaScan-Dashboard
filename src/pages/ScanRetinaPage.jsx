import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { withPageTransition } from '../context/ThemeContext';
import UploadImage from '../components/dashboard/UploadImage';
import Analysis from '../components/dashboard/Analysis';
import Report from '../components/dashboard/Report';
import StepTransition from '../components/dashboard/StepTransition';
import { FiUploadCloud, FiActivity, FiFileText, FiArrowLeft, FiRefreshCw } from 'react-icons/fi';

function ScanRetinaPageComponent({ toggleMobileMenu, isMobileMenuOpen }) {
  const [activeStep, setActiveStep] = useState(1);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward
  const containerRef = useRef(null);
  
  // State untuk animasi transisi
  const [transitionState, setTransitionState] = useState({
    isVisible: false,
    fromStep: 1,
    toStep: 1
  });
  
  // Mouse position untuk efek hover yang lebih dinamis
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 300 };
  const mouseXSpring = useSpring(mouseX, springConfig);
  const mouseYSpring = useSpring(mouseY, springConfig);

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

  // Fungsi untuk menangani perubahan langkah dengan animasi transisi
  const handleStepChange = (step) => {
    if ((step === 2 && !uploadedImage) || (step === 3 && !analysisResult)) {
      // Tidak bisa langsung melompat ke tahap yang membutuhkan data sebelumnya
      return;
    }
    
    // Set direction for animation
    setDirection(step > activeStep ? 1 : -1);
    
    // Tampilkan animasi transisi
    setTransitionState({
      isVisible: true,
      fromStep: activeStep,
      toStep: step
    });
    
    // Setelah delay, ubah activeStep dan sembunyikan animasi transisi
    setTimeout(() => {
      setActiveStep(step);
      setTimeout(() => {
        setTransitionState(prev => ({...prev, isVisible: false}));
      }, 300); // Delay sebelum menyembunyikan animasi
    }, 1200); // Delay sebelum mengubah langkah
  };

  const handleImageUploaded = (image) => {
    setUploadedImage(image);
    
    // Set direction for animation
    setDirection(1);
    
    // Tampilkan animasi transisi
    setTransitionState({
      isVisible: true,
      fromStep: 1,
      toStep: 2
    });
    
    // Setelah delay, ubah activeStep dan sembunyikan animasi transisi
    setTimeout(() => {
      setActiveStep(2);
      setTimeout(() => {
        setTransitionState(prev => ({...prev, isVisible: false}));
      }, 300);
    }, 1200);
  };

  const handleAnalysisComplete = (result) => {
    // Tambahkan informasi pasien dari uploadedImage ke result
    const resultWithPatient = {
      ...result,
      patient: uploadedImage?.patient // Ambil informasi pasien dari uploadedImage
    };
    setAnalysisResult(resultWithPatient);
    
    // Set direction for animation
    setDirection(1);
    
    // Tampilkan animasi transisi
    setTransitionState({
      isVisible: true,
      fromStep: 2,
      toStep: 3
    });
    
    // Setelah delay, ubah activeStep dan sembunyikan animasi transisi
    setTimeout(() => {
      setActiveStep(3);
      setTimeout(() => {
        setTransitionState(prev => ({...prev, isVisible: false}));
      }, 300);
    }, 1200);
  };

  const steps = [
    { number: 1, title: 'Unggah Citra', icon: <FiUploadCloud className="w-5 h-5" /> },
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
      scale: 0.9,
      rotateY: direction > 0 ? '5deg' : '-5deg',
    }),
    animate: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: '0deg',
      transition: {
        x: { type: 'spring', stiffness: 200, damping: 25 },
        opacity: { duration: 0.4 },
        scale: { type: 'spring', stiffness: 300, damping: 25 },
        rotateY: { type: 'spring', stiffness: 300, damping: 25 }
      }
    },
    exit: (direction) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0,
      scale: 0.9,
      rotateY: direction > 0 ? '-5deg' : '5deg',
      transition: {
        x: { type: 'spring', stiffness: 200, damping: 25 },
        opacity: { duration: 0.4 },
        scale: { duration: 0.3 },
        rotateY: { duration: 0.3 }
      }
    })
  };

  // Animasi untuk background
  const gradientColors = {
    1: ['#3B82F6', '#60A5FA', '#93C5FD'],
    2: ['#4F46E5', '#6366F1', '#818CF8'],
    3: ['#10B981', '#34D399', '#6EE7B7']
  };

  // Efek background yang bergerak
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Handler untuk setelah animasi transisi selesai
  const handleTransitionComplete = () => {
    console.log("Transisi selesai");
  };

  return (
    <motion.div 
      className="p-4 sm:p-6 lg:p-8 min-h-screen relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetMousePosition}
    >
      {/* Background gradients */}
      <motion.div 
        className="absolute inset-0 z-0"
        animate={{ 
          background: [
            `radial-gradient(circle at ${50 + mousePosition.x * 20}% ${50 + mousePosition.y * 20}%, rgba(219, 234, 254, 0.8) 0%, rgba(239, 246, 255, 0.4) 60%, rgba(249, 250, 251, 0) 100%)`,
            `radial-gradient(circle at ${60 + mousePosition.x * 20}% ${40 + mousePosition.y * 20}%, rgba(219, 234, 254, 0.8) 0%, rgba(239, 246, 255, 0.4) 60%, rgba(249, 250, 251, 0) 100%)`,
            `radial-gradient(circle at ${40 + mousePosition.x * 20}% ${60 + mousePosition.y * 20}%, rgba(219, 234, 254, 0.8) 0%, rgba(239, 246, 255, 0.4) 60%, rgba(249, 250, 251, 0) 100%)`
          ]
        }}
        transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
      />
      
      <motion.div 
        className="absolute inset-0 z-0 opacity-30"
        animate={{ 
          background: [
            `linear-gradient(120deg, ${gradientColors[activeStep][0]}20 0%, ${gradientColors[activeStep][1]}30 50%, ${gradientColors[activeStep][2]}20 100%)`,
            `linear-gradient(120deg, ${gradientColors[activeStep][2]}20 0%, ${gradientColors[activeStep][0]}30 50%, ${gradientColors[activeStep][1]}20 100%)`,
            `linear-gradient(120deg, ${gradientColors[activeStep][1]}20 0%, ${gradientColors[activeStep][2]}30 50%, ${gradientColors[activeStep][0]}20 100%)`
          ]
        }}
        transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
      />
      
      {/* Stepper */}
      <motion.div 
        className="mt-6 mb-8 relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={glassEffect}
      >
        <div className="flex items-center justify-center w-full max-w-lg mx-auto p-4">
          <div className="relative w-full">
            {/* Progress Line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 transform -translate-y-1/2 rounded-full overflow-hidden">
              <motion.div 
                className="h-full"
                style={{
                  background: `linear-gradient(90deg, ${gradientColors[activeStep][0]} 0%, ${gradientColors[activeStep][1]} 50%, ${gradientColors[activeStep][2]} 100%)`
                }}
                initial={{ width: '0%', x: '-10%' }}
                animate={{ 
                  width: `${((activeStep - 1) / (steps.length - 1)) * 100}%`,
                  x: '0%'
                }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            </div>

            {/* Step Circles */}
            <div className="flex justify-between relative z-10">
              {steps.map((step) => (
                <div key={step.number} className="flex flex-col items-center">
                  <motion.div
                    whileHover={{ scale: 1.1, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStepChange(step.number)}
                    className={`relative flex items-center justify-center w-14 h-14 rounded-full cursor-pointer transition-all duration-300 ${
                      activeStep >= step.number 
                        ? 'text-white' 
                        : 'bg-white text-gray-400 border-2 border-gray-200'
                    }`}
                    style={
                      activeStep >= step.number 
                        ? { 
                            background: `linear-gradient(135deg, ${gradientColors[step.number][0]}, ${gradientColors[step.number][1]})`,
                            boxShadow: `0 8px 20px -4px ${gradientColors[step.number][0]}60`
                          } 
                        : {}
                    }
                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                    animate={{ 
                      scale: 1, 
                      opacity: 1,
                      y: 0,
                      boxShadow: activeStep === step.number 
                        ? `0 0 0 4px ${gradientColors[step.number][0]}40, 0 8px 20px -4px ${gradientColors[step.number][0]}60` 
                        : activeStep > step.number
                        ? `0 8px 20px -4px ${gradientColors[step.number][0]}40`
                        : 'none'
                    }}
                    transition={{ 
                      delay: step.number * 0.15, 
                      duration: 0.4,
                      type: 'spring',
                      stiffness: 300,
                      damping: 20
                    }}
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
                        className="absolute inset-0 rounded-full"
                        style={{
                          border: `2px solid ${gradientColors[step.number][0]}`,
                        }}
                        animate={{
                          scale: [1, 1.15, 1],
                          opacity: [0.7, 0.5, 0.7],
                        }}
                        transition={{
                          duration: 2.5,
                          ease: "easeInOut",
                          repeat: Infinity,
                        }}
                      />
                    )}
                  </motion.div>
                  <motion.p 
                    className={`mt-3 text-xs sm:text-sm font-medium truncate max-w-[80px] text-center ${
                      activeStep >= step.number 
                        ? 'font-semibold' 
                        : 'text-gray-500'
                    }`}
                    style={{
                      color: activeStep >= step.number ? gradientColors[step.number][0] : undefined
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: step.number * 0.15 + 0.2, duration: 0.4 }}
                  >
                    {step.title}
                  </motion.p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="w-full max-w-4xl mx-auto mt-8 mb-8 relative z-10">
        <AnimatePresence mode="wait" custom={direction}>
          {activeStep === 1 && (
            <motion.div
              key="upload"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              custom={direction}
              style={glassEffect}
              className="overflow-hidden"
              onMouseMove={handleMouseMove}
              onMouseLeave={resetMousePosition}
            >
              <motion.div 
                className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden"
                style={{
                  background: `radial-gradient(circle at ${mouseXSpring}px ${mouseYSpring}px, ${gradientColors[1][0]}15 0%, transparent 70%)`,
                  zIndex: 0
                }}
              />
              
              <div className="relative overflow-hidden">
                <motion.div 
                  className="absolute inset-0 z-0"
                  animate={{ 
                    background: [
                      `linear-gradient(120deg, ${gradientColors[1][0]}90, ${gradientColors[1][1]}95)`,
                      `linear-gradient(120deg, ${gradientColors[1][1]}95, ${gradientColors[1][0]}90)`,
                      `linear-gradient(120deg, ${gradientColors[1][0]}90, ${gradientColors[1][1]}95)`
                    ]
                  }}
                  transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
                />
                <div className="relative z-10 p-6">
                  <motion.h2 
                    className="text-2xl font-bold text-white text-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 20 }}
                  >
                    Unggah Citra Fundus
                  </motion.h2>
                  <motion.p 
                    className="text-blue-100 text-center text-sm mt-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    Unggah gambar retina untuk dianalisis oleh sistem AI
                  </motion.p>
                </div>
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 h-1 bg-white opacity-30"
                  animate={{ 
                    scaleX: [0, 1, 0],
                    x: ['-100%', '0%', '100%']
                  }}
                  transition={{ duration: 8, repeat: Infinity }}
                />
              </div>
              
              <div className="p-6 relative z-10">
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
              style={glassEffect}
              className="overflow-hidden"
              onMouseMove={handleMouseMove}
              onMouseLeave={resetMousePosition}
            >
              <motion.div 
                className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden"
                style={{
                  background: `radial-gradient(circle at ${mouseXSpring}px ${mouseYSpring}px, ${gradientColors[2][0]}15 0%, transparent 70%)`,
                  zIndex: 0
                }}
              />
              
              <div className="relative overflow-hidden">
                <motion.div 
                  className="absolute inset-0 z-0"
                  animate={{ 
                    background: [
                      `linear-gradient(120deg, ${gradientColors[2][0]}90, ${gradientColors[2][1]}95)`,
                      `linear-gradient(120deg, ${gradientColors[2][1]}95, ${gradientColors[2][0]}90)`,
                      `linear-gradient(120deg, ${gradientColors[2][0]}90, ${gradientColors[2][1]}95)`
                    ]
                  }}
                  transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
                />
                <div className="relative z-10 p-6">
                  <motion.h2 
                    className="text-2xl font-bold text-white text-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 20 }}
                  >
                    Analisis Citra
                  </motion.h2>
                  <motion.p 
                    className="text-indigo-100 text-center text-sm mt-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    Sistem AI menganalisis gambar untuk mendeteksi tanda-tanda retinopati
                  </motion.p>
                </div>
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 h-1 bg-white opacity-30"
                  animate={{ 
                    scaleX: [0, 1, 0],
                    x: ['-100%', '0%', '100%']
                  }}
                  transition={{ duration: 8, repeat: Infinity }}
                />
              </div>
              
              <div className="p-6 relative z-10">
                <Analysis image={uploadedImage} onAnalysisComplete={handleAnalysisComplete} />
                
                <motion.div 
                  className="flex justify-between mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <motion.button 
                    onClick={() => handleStepChange(1)}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl shadow-sm transition-all"
                    style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(4px)',
                      WebkitBackdropFilter: 'blur(4px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: gradientColors[2][0]
                    }}
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: `0 10px 25px -5px ${gradientColors[2][0]}30`
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiArrowLeft /> Kembali
                  </motion.button>
                </motion.div>
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
              style={glassEffect}
              className="overflow-hidden"
              onMouseMove={handleMouseMove}
              onMouseLeave={resetMousePosition}
            >
              <motion.div 
                className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden"
                style={{
                  background: `radial-gradient(circle at ${mouseXSpring}px ${mouseYSpring}px, ${gradientColors[3][0]}15 0%, transparent 70%)`,
                  zIndex: 0
                }}
              />
              
              <div className="relative overflow-hidden">
                <motion.div 
                  className="absolute inset-0 z-0"
                  animate={{ 
                    background: [
                      `linear-gradient(120deg, ${gradientColors[3][0]}90, ${gradientColors[3][1]}95)`,
                      `linear-gradient(120deg, ${gradientColors[3][1]}95, ${gradientColors[3][0]}90)`,
                      `linear-gradient(120deg, ${gradientColors[3][0]}90, ${gradientColors[3][1]}95)`
                    ]
                  }}
                  transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
                />
                <div className="relative z-10 p-6">
                  <motion.h2 
                    className="text-2xl font-bold text-white text-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 20 }}
                  >
                    Hasil Analisis
                  </motion.h2>
                  <motion.p 
                    className="text-green-100 text-center text-sm mt-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    Laporan hasil dan rekomendasi berdasarkan analisis
                  </motion.p>
                </div>
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 h-1 bg-white opacity-30"
                  animate={{ 
                    scaleX: [0, 1, 0],
                    x: ['-100%', '0%', '100%']
                  }}
                  transition={{ duration: 8, repeat: Infinity }}
                />
              </div>
              
              <div className="p-6 relative z-10">
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
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl shadow-sm transition-all"
                    style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(4px)',
                      WebkitBackdropFilter: 'blur(4px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: gradientColors[3][0]
                    }}
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: `0 10px 25px -5px ${gradientColors[3][0]}30`
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiArrowLeft /> Kembali
                  </motion.button>
                  <motion.button 
                    variants={itemVariants}
                    onClick={() => {
                      // Tampilkan animasi transisi kembali ke langkah 1
                      setTransitionState({
                        isVisible: true,
                        fromStep: 3,
                        toStep: 1
                      });
                      
                      // Setelah delay, reset state dan sembunyikan animasi transisi
                      setTimeout(() => {
                        setActiveStep(1);
                        setUploadedImage(null);
                        setAnalysisResult(null);
                        setTimeout(() => {
                          setTransitionState(prev => ({...prev, isVisible: false}));
                        }, 300);
                      }, 1200);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-xl shadow-md transition-all"
                    style={{
                      background: `linear-gradient(135deg, ${gradientColors[1][0]}, ${gradientColors[1][1]})`,
                      boxShadow: `0 8px 20px -4px ${gradientColors[1][0]}60`
                    }}
                    whileHover={{ 
                      scale: 1.05, 
                      boxShadow: `0 15px 30px -5px ${gradientColors[1][0]}60` 
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiRefreshCw /> Scan Baru
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Step Transition Animation */}
      <AnimatePresence>
        {transitionState.isVisible && (
          <StepTransition
            fromStep={transitionState.fromStep}
            toStep={transitionState.toStep}
            isVisible={transitionState.isVisible}
            onAnimationComplete={handleTransitionComplete}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const ScanRetinaPage = withPageTransition(ScanRetinaPageComponent);
export default ScanRetinaPage; 