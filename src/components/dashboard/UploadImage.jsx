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
      
      // Convert file to base64 untuk disimpan langsung di formData
      // Ini memastikan gambar tersedia untuk ditampilkan langsung
      if (file) {
        try {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = async () => {
            const base64Image = reader.result;
            formData.append('imageData', base64Image);
            
            // Lanjutkan dengan upload setelah base64 tersedia
            console.log('Mengunggah gambar dengan imageData untuk analisis...');
            try {
              const result = await uploadImage(formData);
              console.log('Hasil analisis:', result);
              
              handleUploadSuccess(result);
            } catch (uploadError) {
              console.error('Error selama upload:', uploadError);
              handleUploadError(uploadError);
            }
          };
          
          reader.onerror = (error) => {
            console.error('Error mengkonversi file ke base64:', error);
            // Tetap lanjutkan upload tanpa base64
            performUpload();
          };
        } catch (base64Error) {
          console.error('Error mengkonversi file ke base64:', base64Error);
          // Tetap lanjutkan upload tanpa base64
          performUpload();
        }
      } else {
        // Jika tidak ada file, tetap lanjutkan upload
        performUpload();
      }
    } catch (err) {
      handleUploadError(err);
    }
  };
  
  // Fungsi untuk menangani upload tanpa base64
  const performUpload = async () => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('patientId', selectedPatient._id);
      
      console.log('Mengunggah gambar untuk analisis (tanpa base64)...');
      const result = await uploadImage(formData);
      console.log('Hasil analisis:', result);
      
      handleUploadSuccess(result);
    } catch (err) {
      handleUploadError(err);
    }
  };
  
  // Fungsi untuk menangani hasil upload yang sukses
  const handleUploadSuccess = (result) => {
    console.log('Handling upload success with result:', result);
    
    // Implementasi defensive programming untuk menghindari error saat property tidak ada
    if (result && result.analysis) {
      try {
        // Validasi dan ambil data yang dibutuhkan dengan nilai default jika tidak ada
        const analysisId = result.analysis.id || result.analysis._id || '';
        const patientId = selectedPatient?._id || '';
        const patientName = selectedPatient?.fullName || selectedPatient?.name || 'Pasien';
        const timestamp = result.analysis.timestamp || new Date().toISOString();
        const imageUrl = result.analysis.imageUrl || preview || '';
        const imageData = result.analysis.imageData || null;
        
        // Ambil data severity dari hasil dengan validasi bertingkat
        // Cek dari hasil.results (format baru) atau langsung dari root (format lama)
        const results = result.analysis.results || {};
        const severity = result.analysis.results?.severity || result.analysis.severity || 'Tidak diketahui';
        const severityLevel = result.analysis.results?.severityLevel || result.analysis.severityLevel || 0;
        const classification = result.analysis.results?.classification || result.analysis.classification || 'Tidak diketahui';
        const confidence = result.analysis.results?.confidence || result.analysis.confidence || 0;
        const isSimulation = result.analysis.results?.isSimulation || result.analysis.isSimulation || false;
        const errorMessage = result.analysis.results?.errorMessage || result.analysis.errorMessage || null;
        
        // Ambil rekomendasi dan catatan
        const recommendation = result.analysis.recommendation || 'Tidak ada rekomendasi';
        const notes = result.analysis.notes || recommendation || '';
        
        // Simpan data hasil analisis ke localStorage sementara untuk diakses di halaman hasil
        const analysisData = {
          id: analysisId,
          _id: analysisId, // Tambahkan _id juga untuk konsistensi
          patientId: patientId,
          patientName: patientName,
          patient: selectedPatient, // Simpan semua data pasien
          timestamp: timestamp,
          imageUrl: imageUrl,
          imageData: imageData, // Tambahkan imageData jika ada
          severity: severity,
          severityLevel: severityLevel,
          classification: classification,
          confidence: confidence,
          recommendation: recommendation,
          notes: notes,
          isSimulation: isSimulation,
          errorMessage: errorMessage, // Tambahkan pesan error jika ada
          originalFilename: file?.name || 'uploaded-image',
          createdAt: timestamp
        };
        
        localStorage.setItem('currentAnalysis', JSON.stringify(analysisData));
        
        // Reset form setelah berhasil
        setFile(null);
        setPreview(null);
        setSelectedPatient(null);
        setError('');
        
        // Gunakan callback onUploadSuccess jika tersedia
        if (onUploadSuccess && typeof onUploadSuccess === 'function') {
          console.log('Memanggil callback onUploadSuccess dengan data yang divalidasi');
          // Format data sesuai harapan parent component dengan validasi
          const formattedResult = {
            _id: analysisId,
            id: analysisId,
            prediction: {
              severity: severity,
              severityLevel: severityLevel,
              confidence: confidence,
              recommendation: recommendation,
              analysisId: analysisId,
              patientId: patientId,
              isSimulation: isSimulation,
              errorMessage: errorMessage // Tambahkan pesan error jika ada
            },
            preview: preview,
            file: file,
            patient: selectedPatient,
            patientId: selectedPatient, // Duplikasi patientId untuk kompabilitas
            imageData: imageData,
            originalFilename: file?.name || 'uploaded-image',
            createdAt: timestamp,
            response: result,
            errorMessage: errorMessage // Tambahkan pesan error jika ada
          };
          onUploadSuccess(formattedResult);
        } else {
          // Jika tidak ada callback, tampilkan pesan sukses
          setSuccess('Gambar berhasil diunggah dan dianalisis.');
        }
      } catch (parseError) {
        console.error('Error parsing response data:', parseError);
        setError(`Terjadi kesalahan saat memproses hasil analisis: ${parseError.message}`);
      }
    } else {
      console.error('Format respons tidak valid:', result);
      setError('Terjadi kesalahan saat memproses hasil analisis. Format respons tidak valid.');
    }
    setIsLoading(false);
  };
  
  // Fungsi untuk menangani error selama upload
  const handleUploadError = (err) => {
    console.error('Error during image upload:', err);
    const errorMessage = err.response?.data?.message || err.message || 'Terjadi kesalahan saat mengunggah gambar.';
    setError(errorMessage);
    setIsLoading(false);
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

  // Tambahkan style glassmorphism
  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    borderRadius: '16px',
  };

  // Animasi untuk drop area
  const dropAreaVariants = {
    default: { 
      scale: 1,
      borderColor: 'rgba(59, 130, 246, 0.3)',
      backgroundColor: 'rgba(239, 246, 255, 0.6)',
    },
    dragging: { 
      scale: 1.02,
      borderColor: 'rgba(59, 130, 246, 0.8)',
      backgroundColor: 'rgba(219, 234, 254, 0.8)',
      transition: { duration: 0.2 }
    }
  };

  // Render drop area dengan animasi
  const renderDropArea = () => (
    <motion.div
      className="mb-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        variants={itemVariants}
        className="relative"
      >
        <motion.div
          className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer"
          style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}
          animate={isDragging ? "dragging" : "default"}
          variants={dropAreaVariants}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png"
            className="hidden"
          />
          
          <motion.div 
            className="flex flex-col items-center justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="w-20 h-20 mb-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.05, boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)' }}
            >
              <FiUpload className="w-8 h-8 text-white" />
            </motion.div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {isDragging ? 'Lepaskan file di sini' : 'Unggah Gambar Retina'}
            </h3>
            <p className="text-sm text-gray-500 mb-3">
              Seret & lepas file atau klik untuk memilih
            </p>
            <p className="text-xs text-gray-400">
              Format yang didukung: JPEG, PNG (maks. 5MB)
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );

  // Render file preview dengan animasi
  const renderFilePreview = () => (
    <motion.div
      className="mb-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        variants={itemVariants}
        className="relative p-4 rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
        }}
      >
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <motion.div 
            className="relative w-full sm:w-1/3 aspect-square rounded-xl overflow-hidden shadow-lg"
            whileHover={{ scale: 1.02 }}
          >
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover rounded-xl"
            />
            <motion.div 
              className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            />
          </motion.div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <FiFile className="w-5 h-5 text-blue-500 mr-2" />
                <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                  {file?.name}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                  setError('');
                  setSuccess('');
                }}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <FiX className="w-5 h-5 text-gray-500" />
              </motion.button>
            </div>
            
            <div className="text-xs text-gray-500 mb-4">
              {file && (
                <p>
                  Ukuran: {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              )}
            </div>
            
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 px-4 mb-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-all flex items-center justify-center"
            >
              <FiImage className="mr-2" />
              Ganti Gambar
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

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
        {renderDropArea()}
        {renderFilePreview()}
      </form>
    </motion.div>
  );
}

export default UploadImage;