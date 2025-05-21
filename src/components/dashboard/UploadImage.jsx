import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadImage } from '../../services/api';
import PatientSelector from './PatientSelector';

function UploadImage({ onUploadSuccess, autoUpload = true }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const fileInputRef = useRef(null);

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
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
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
      
      console.log('Mengunggah file:', file.name, 'untuk pasien:', selectedPatient.fullName || selectedPatient.name);
      const response = await uploadImage(formData);
      setSuccess(`Gambar berhasil diunggah!`);
      setError('');
      
      // Call the callback function if provided
      if (onUploadSuccess) {
        onUploadSuccess({
          file,
          preview: preview,
          patient: selectedPatient,
          response
        });
      }
      
      // Reset form setelah upload berhasil
      if (autoUpload) {
        // Jika autoUpload aktif, reset file dan preview
        setFile(null);
        setPreview(null);
        // Reset tracking
        uploadedFileRef.current = null;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengunggah gambar. Coba lagi.');
      setSuccess('');
      // Reset tracking jika gagal
      uploadedFileRef.current = null;
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
      scale: 1
    },
    dragging: { 
      borderColor: 'rgba(59, 130, 246, 1)',
      scale: 1.02,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto"
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
        
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="text-green-600 bg-green-50 p-3 rounded-lg mb-4 text-sm sm:text-base flex items-start"
          >
            <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={itemVariants}>
        <PatientSelector 
          onSelectPatient={setSelectedPatient} 
          selectedPatient={selectedPatient} 
        />
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <motion.div 
          variants={itemVariants}
          className="space-y-2"
        >
          <motion.div
            variants={dropzoneVariants}
            initial="default"
            animate={isDragging ? "dragging" : "default"}
            className={`relative border-2 border-dashed rounded-xl p-4 sm:p-6 transition-colors ${
              isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isLoading}
            />
            <div className="text-center">
              <motion.div 
                animate={{ 
                  y: [0, -8, 0],
                  transition: { 
                    repeat: Infinity, 
                    duration: 2.5,
                    repeatType: "reverse", 
                    ease: "easeInOut" 
                  }
                }}
              >
                <svg
                  className="mx-auto h-16 w-16 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </motion.div>
              <motion.p 
                className="mt-4 text-sm sm:text-base font-medium text-gray-700"
                variants={itemVariants}
              >
                {file ? `${file.name} (klik untuk mengganti)` : 'Seret gambar atau klik untuk memilih'}
              </motion.p>
              <motion.p 
                className="mt-2 text-xs text-gray-500"
                variants={itemVariants}
              >
                Format: JPEG/PNG (maks. 5MB)
              </motion.p>
              {autoUpload && (
                <motion.div
                  className={`mt-2 text-xs ${isLoading ? 'text-blue-500' : file ? 'text-green-500' : 'text-gray-500'}`}
                  variants={itemVariants}
                >
                  {isLoading ? (
                    <p className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-3 w-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sedang mengunggah otomatis...
                    </p>
                  ) : file && selectedPatient ? (
                    <p>Upload otomatis akan dimulai segera...</p>
                  ) : file ? (
                    <p>Pilih pasien untuk upload otomatis</p>
                  ) : (
                    <p>Setelah memilih file, upload akan dilakukan otomatis</p>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {preview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border border-gray-200 p-4 rounded-lg overflow-hidden"
            >
              <p className="text-sm font-medium mb-2">Preview:</p>
              <div className="relative">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="w-full h-48 object-contain rounded bg-gray-50"
                />
                <button
                  type="button"
                  className="absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                    // Reset uploaded file tracking
                    uploadedFileRef.current = null;
                  }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tombol upload hanya muncul jika autoUpload tidak aktif */}
        {!autoUpload && (
          <motion.div variants={itemVariants}>
            <button
              type="submit"
              disabled={isLoading || !file || !selectedPatient}
              className={`w-full py-2 px-4 rounded-lg text-white font-medium transition-all ${
                isLoading || !file || !selectedPatient
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Mengunggah...
                </span>
              ) : (
                'Unggah Gambar'
              )}
            </button>
          </motion.div>
        )}
        
        {/* Tombol untuk mode autoUpload yang hanya muncul jika file dan pasien sudah dipilih tapi belum diupload */}
        {autoUpload && file && selectedPatient && !isLoading && (
          <motion.div variants={itemVariants}>
            <div className="flex justify-center">
              <p className="text-sm text-green-600">
                Gambar akan diunggah otomatis...
              </p>
            </div>
          </motion.div>
        )}
      </form>
    </motion.div>
  );
}

export default UploadImage;