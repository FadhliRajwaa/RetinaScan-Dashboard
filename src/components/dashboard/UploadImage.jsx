import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { uploadImage } from '../../services/api';
import PatientSelector from './PatientSelector';
import { FiUpload, FiFile, FiImage, FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

function UploadImage({ onUploadSuccess, autoUpload = true }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const fileInputRef = useRef(null);
  const dropAreaControls = useAnimation();
  const navigate = useNavigate();

  // Gunakan ref untuk melacak apakah file sudah diupload
  const uploadedFileRef = useRef(null);
  
  // Effect untuk auto upload saat file atau pasien berubah
  useEffect(() => {
    // Hanya upload jika file dan pasien ada, dan file belum diupload
    if (file && autoUpload && selectedPatient && 
        (!uploadedFileRef.current || uploadedFileRef.current !== file.name + selectedPatient._id)) {
      
      console.log('Auto uploading file:', file.name, 'for patient:', selectedPatient.fullName || selectedPatient.name);
      
      // Tandai file ini sebagai sedang diupload
      uploadedFileRef.current = file.name + selectedPatient._id;
      
      // Gunakan setTimeout untuk memastikan UI diupdate terlebih dahulu
      setTimeout(() => {
        handleSubmit();
      }, 100);
    }
  }, [file, selectedPatient]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    processFile(selectedFile);
    
    // Jika pasien sudah dipilih dan autoUpload aktif, langsung upload
    if (selectedPatient && autoUpload) {
      console.log('File dipilih dan pasien sudah ada, langsung upload');
      // Kita tidak perlu setTimeout di sini karena processFile sudah mengupdate state
      // dan useEffect akan menangani upload otomatis
    } else if (!selectedPatient && autoUpload) {
      console.log('File dipilih, tapi pasien belum dipilih. Menunggu pemilihan pasien...');
    }
  };

  const processFile = (selectedFile) => {
    if (selectedFile && ['image/jpeg', 'image/png'].includes(selectedFile.type)) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('Ukuran file terlalu besar (maks. 5MB).');
        setFile(null);
        setPreview(null);
        return;
      }
      
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError('');
      setSuccess('');
    } else {
      setError('Hanya file JPEG/PNG yang diizinkan (maks. 5MB).');
      setFile(null);
      setPreview(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    dropAreaControls.start("dragging");
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dropAreaControls.start("default");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dropAreaControls.start("default");
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!file) {
      setError('Pilih file terlebih dahulu.');
      return;
    }

    if (!selectedPatient) {
      setError('Pilih pasien terlebih dahulu.');
      return;
    }
    
    // Cek apakah file ini sudah dalam proses upload
    if (isLoading) {
      console.log('Upload sudah dalam proses, menghindari duplikasi');
      return;
    }
    
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('patientId', selectedPatient._id);
      
      console.log('Mengunggah gambar untuk analisis...');
      const result = await uploadImage(formData);
      console.log('Hasil analisis:', result);
      
      // Pastikan semua data tersedia
      if (result && result.analysis && result.analysis.id) {
        // Simpan data hasil analisis ke localStorage sementara untuk diakses di halaman hasil
        const analysisData = {
          id: result.analysis.id,
          patientId: selectedPatient._id,
          patientName: selectedPatient.fullName || selectedPatient.name,
          patient: selectedPatient, // Simpan semua data pasien
          timestamp: result.analysis.timestamp,
          imageUrl: result.analysis.imageUrl,
          imageData: result.analysis.imageData, // Tambahkan imageData jika ada
          severity: result.analysis.results.severity,
          severityLevel: result.analysis.results.severityLevel,
          classification: result.analysis.results.classification,
          confidence: result.analysis.results.confidence,
          recommendation: result.analysis.recommendation,
          notes: result.analysis.notes,
          isSimulation: result.analysis.results.isSimulation || false
        };
        
        localStorage.setItem('currentAnalysis', JSON.stringify(analysisData));
        
        // Reset form setelah berhasil
        setFile(null);
        setPreview(null);
        setSelectedPatient(null);
        setError('');
        
        // Gunakan callback onUploadSuccess jika tersedia
        if (onUploadSuccess && typeof onUploadSuccess === 'function') {
          console.log('Memanggil callback onUploadSuccess');
          // Format data sesuai harapan parent component
          const formattedResult = {
            prediction: {
              severity: result.analysis.results.severity,
              severityLevel: result.analysis.results.severityLevel,
              confidence: result.analysis.results.confidence,
              recommendation: result.analysis.recommendation,
              analysisId: result.analysis.id,
              patientId: selectedPatient._id,
              isSimulation: result.analysis.results.isSimulation || false
            },
            preview: preview,
            file: file,
            patient: selectedPatient,
            imageData: result.analysis.imageData, // Tambahkan imageData
            response: result
          };
          onUploadSuccess(formattedResult);
        } else {
          // Jika tidak ada callback, tampilkan pesan sukses
          setSuccess('Gambar berhasil diunggah dan dianalisis.');
        }
      } else {
        console.error('Format respons tidak valid:', result);
        setError('Terjadi kesalahan saat memproses hasil analisis. Format respons tidak valid.');
      }
    } catch (err) {
      console.error('Error during image upload:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Terjadi kesalahan saat mengunggah gambar.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
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

  const dropzoneVariants = {
    default: { 
      borderColor: 'rgba(209, 213, 219, 1)',
      scale: 1,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    dragging: { 
      borderColor: 'rgba(59, 130, 246, 1)',
      scale: 1.02,
      boxShadow: '0 8px 16px rgba(59, 130, 246, 0.2)'
    },
    hover: {
      scale: 1.01,
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
    }
  };

  const iconVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 20 }
    },
    hover: { 
      scale: 1.1,
      transition: { type: 'spring', stiffness: 400, damping: 10 }
    },
    tap: { scale: 0.9 }
  };

  const filePreviewVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 25 }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto"
    >
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="text-red-500 bg-red-50 p-4 rounded-xl mb-5 text-sm sm:text-base flex items-start shadow-sm border border-red-100"
          >
            <FiAlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}
        
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="text-green-600 bg-green-50 p-4 rounded-xl mb-5 text-sm sm:text-base flex items-start shadow-sm border border-green-100"
          >
            <FiCheck className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        variants={itemVariants}
        className="mb-6"
      >
        <PatientSelector 
          onSelectPatient={setSelectedPatient} 
          selectedPatient={selectedPatient} 
        />
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div 
          variants={itemVariants}
          className="space-y-2"
        >
          <motion.div
            variants={dropzoneVariants}
            initial="default"
            animate={dropAreaControls}
            whileHover="hover"
            className={`relative border-2 border-dashed rounded-2xl p-8 transition-all ${
              isDragging ? 'bg-blue-50' : 'bg-white'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/jpeg, image/png"
              disabled={isLoading}
            />
            
            <AnimatePresence mode="wait">
              {!preview ? (
                <motion.div 
                  key="upload-prompt"
                  className="flex flex-col items-center justify-center text-center"
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="w-20 h-20 mb-4 bg-blue-50 rounded-full flex items-center justify-center text-blue-500"
                    variants={iconVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <FiUpload className="w-8 h-8" />
                  </motion.div>
                  
                  <motion.h3 
                    className="text-lg font-medium text-gray-700 mb-2"
                    variants={itemVariants}
                  >
                    Seret & Lepaskan Gambar Retina
                  </motion.h3>
                  
                  <motion.p 
                    className="text-sm text-gray-500 mb-4"
                    variants={itemVariants}
                  >
                    atau klik untuk memilih file
                  </motion.p>
                  
                  <motion.button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
                    variants={itemVariants}
                    whileHover={{ scale: 1.05, boxShadow: "0 5px 15px rgba(59, 130, 246, 0.4)" }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Mengunggah...' : 'Pilih File'}
                  </motion.button>
                  
                  <motion.p 
                    className="text-xs text-gray-400 mt-4"
                    variants={itemVariants}
                  >
                    Format yang didukung: JPG, PNG (maks. 5MB)
                  </motion.p>
                </motion.div>
              ) : (
                <motion.div 
                  key="file-preview"
                  className="flex flex-col items-center"
                  variants={filePreviewVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="relative w-full max-w-xs mx-auto">
                    <motion.div
                      className="relative rounded-lg overflow-hidden shadow-lg border-4 border-white"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <img 
                        src={preview} 
                        alt="Preview" 
                        className="w-full h-auto object-cover"
                      />
                      
                      <motion.button
                        type="button"
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                        onClick={() => {
                          setFile(null);
                          setPreview(null);
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FiX className="w-5 h-5" />
                      </motion.button>
                    </motion.div>
                    
                    <motion.div 
                      className="mt-4 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <p className="text-sm font-medium text-gray-700 flex items-center justify-center">
                        <FiImage className="mr-2" /> {file?.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(file?.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </motion.div>
                  </div>
                  
                  <motion.div 
                    className="mt-6 flex space-x-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <motion.button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isLoading}
                    >
                      Ganti Gambar
                    </motion.button>
                    
                    {!autoUpload && (
                      <motion.button
                        type="submit"
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
                        whileHover={{ scale: 1.05, boxShadow: "0 5px 15px rgba(59, 130, 246, 0.4)" }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isLoading || !selectedPatient}
                      >
                        {isLoading ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Mengunggah...
                          </span>
                        ) : (
                          'Unggah & Analisis'
                        )}
                      </motion.button>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Animated decorative elements */}
            <motion.div 
              className="absolute -z-10 top-1/4 -left-10 w-20 h-20 bg-blue-400/10 rounded-full blur-xl"
              animate={{ 
                x: [0, 10, 0],
                y: [0, -10, 0],
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 5,
                ease: "easeInOut" 
              }}
            />
            <motion.div 
              className="absolute -z-10 bottom-1/4 -right-10 w-32 h-32 bg-indigo-400/10 rounded-full blur-xl"
              animate={{ 
                x: [0, -10, 0],
                y: [0, 10, 0],
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 7,
                ease: "easeInOut" 
              }}
            />
          </motion.div>
          
          {isLoading && (
            <motion.div 
              className="mt-4 bg-white rounded-lg p-4 shadow-sm border border-gray-100"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <motion.div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    initial={{ width: "5%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                  />
                </div>
                <span className="text-sm text-gray-500 ml-4 whitespace-nowrap">Mengunggah...</span>
              </div>
            </motion.div>
          )}
        </motion.div>
      </form>
    </motion.div>
  );
}

export default UploadImage;