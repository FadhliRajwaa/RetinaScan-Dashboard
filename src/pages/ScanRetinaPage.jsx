import { useState } from 'react';
import { motion, AnimatePresence, useSpring } from 'framer-motion';
import { withPageTransition } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import UploadImage from '../components/dashboard/UploadImage';
import Analysis from '../components/dashboard/Analysis';
import Report from '../components/dashboard/Report';
import { saveAnalysisResult } from '../services/api';

function ScanRetinaPageComponent({ toggleMobileMenu, isMobileMenuOpen }) {
  const [activeStep, setActiveStep] = useState(1);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

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

  const handleAnalysisComplete = async (result) => {
    try {
      // Tambahkan informasi pasien dari uploadedImage ke result
      const resultWithPatient = {
        ...result,
        patient: uploadedImage?.patient, // Ambil informasi pasien dari uploadedImage
        // Jangan simpan ke database saat pertama kali menampilkan hasil
        saveToDatabase: false 
      };
      
      // Set state hasil analisis
      setAnalysisResult(resultWithPatient);
      
      // Jika flag saveToDatabase=true, simpan hasil dan redirect ke history
      if (result.saveToDatabase === true) {
        console.log('Menyimpan hasil berdasarkan flag saveToDatabase=true');
        await handleSaveAndRedirect(resultWithPatient);
      } else {
        // Jika tidak, hanya tampilkan hasil (tidak simpan ke database)
        console.log('Menampilkan hasil tanpa menyimpan ke database');
        setActiveStep(3);
      }
    } catch (error) {
      console.error('Error handling analysis completion:', error);
      toast.error('Terjadi kesalahan saat memproses hasil analisis');
    }
  };
  
  // Fungsi baru untuk menyimpan hasil dan mengarahkan ke halaman history
  const handleSaveAndRedirect = async (result) => {
    try {
      setIsSaving(true);
      
      console.log('Menyimpan hasil analisis ke database dan mengarahkan ke halaman history');
      
      // Validasi data sebelum dikirim ke server
      if (!result) {
        throw new Error('Tidak ada data analisis yang tersedia untuk disimpan');
      }
      
      // Pastikan ada data pasien
      if (!result.patientId && !result.patient) {
        throw new Error('Tidak ada data pasien dalam hasil analisis');
      }
      
      // Pastikan ada data gambar
      if (!result.imageData && !result.image) {
        console.warn('Tidak ada imageData yang valid dalam hasil analisis');
        
        // Jika tidak ada imageData, coba ambil dari uploadedImage
        if (uploadedImage && uploadedImage.preview) {
          console.log('Menggunakan preview dari uploadedImage sebagai imageData');
          result.imageData = uploadedImage.preview;
        } else {
          throw new Error('Tidak ada data gambar yang valid untuk disimpan');
        }
      }
      
      // Jika result.image adalah string base64 tapi result.imageData kosong
      if (!result.imageData && result.image && typeof result.image === 'string' && result.image.startsWith('data:')) {
        console.log('Menggunakan result.image sebagai imageData');
        result.imageData = result.image;
      }
      
      // Log data lengkap yang akan dikirim
      console.log('Data lengkap untuk disimpan:', {
        hasPatientId: !!result.patientId,
        hasPatient: !!result.patient,
        patientType: result.patient ? typeof result.patient : 'undefined',
        hasImageData: !!result.imageData,
        hasImage: !!result.image,
        imageType: result.image ? typeof result.image : 'undefined'
      });
      
      // Simpan hasil analisis ke database
      const savedResult = await saveAnalysisResult(result);
      
      toast.success('Hasil analisis berhasil disimpan');
      
      // Redirect ke halaman history
      navigate('/history');
    } catch (error) {
      console.error('Error saving analysis result:', error);
      toast.error('Gagal menyimpan hasil analisis: ' + (error.message || 'Terjadi kesalahan'));
      
      // Tetap tampilkan hasil meskipun gagal menyimpan
      setActiveStep(3);
    } finally {
      setIsSaving(false);
    }
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gradient-to-b from-blue-50 to-white">
      
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
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 transform -translate-y-1/2">
              <motion.div 
                className="h-full bg-blue-500"
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
                        ? 'bg-blue-600 text-white' 
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
                      <span className="text-lg font-semibold">{step.number}</span>
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
                  <p className={`mt-2 text-xs sm:text-sm font-medium truncate max-w-[80px] text-center ${
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
        <AnimatePresence mode="wait" custom={activeStep}>
          {activeStep === 1 && (
            <motion.div
              key="upload"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              custom={1}
              className="bg-white rounded-xl shadow-xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-4">
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
              className="bg-white rounded-xl shadow-xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-400 p-4">
                <h2 className="text-xl font-bold text-white text-center">Analisis Citra</h2>
                <p className="text-indigo-100 text-center text-sm mt-1">Sistem AI menganalisis gambar untuk mendeteksi tanda-tanda retinopati</p>
              </div>
              <div className="p-4 sm:p-6">
                <Analysis image={uploadedImage} onAnalysisComplete={handleAnalysisComplete} />
                
                <div className="flex justify-between mt-8">
                  <motion.button 
                    onClick={() => handleStepChange(1)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-all"
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
              className="bg-white rounded-xl shadow-xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-green-600 to-emerald-400 p-4">
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
                    className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-all"
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
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-md hover:shadow-lg transition-all"
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Scan Baru
                  </motion.button>
                  
                  {/* Tombol Simpan & Lihat History */}
                  <motion.button 
                    variants={itemVariants}
                    onClick={() => handleSaveAndRedirect(analysisResult)}
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg shadow-md hover:shadow-lg transition-all"
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 mr-2 border-2 border-t-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Menyimpan...
                      </div>
                    ) : (
                      "Simpan & Lihat History"
                    )}
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