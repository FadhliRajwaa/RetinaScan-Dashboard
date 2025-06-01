import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { uploadImage } from '../../services/api';
import PatientSelector from './PatientSelector';
import { FiUpload, FiFile, FiImage, FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

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
  const { darkMode } = useTheme();

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

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-lg flex items-start ${
              darkMode 
                ? 'bg-red-900/20 border border-red-800/30 text-red-400' 
                : 'bg-red-50 border border-red-100 text-red-600'
            }`}
          >
            <FiAlertCircle className="mt-0.5 mr-3 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
        
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-lg flex items-start ${
              darkMode 
                ? 'bg-green-900/20 border border-green-800/30 text-green-400' 
                : 'bg-green-50 border border-green-100 text-green-600'
            }`}
          >
            <FiCheck className="mt-0.5 mr-3 flex-shrink-0" />
            <span>{success}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Pilih Pasien */}
      <div className="mb-6">
        <label className={`block text-sm font-medium mb-2 ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Pilih Pasien
        </label>
        <PatientSelector 
          onSelectPatient={setSelectedPatient} 
          selectedPatient={selectedPatient} 
        />
      </div>
      
      {/* Upload Area */}
      <div className="mb-6">
        <label className={`block text-sm font-medium mb-2 ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Unggah Gambar Retina
        </label>
        
        <motion.div 
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging 
              ? darkMode 
                ? 'border-blue-500 bg-blue-900/10' 
                : 'border-blue-500 bg-blue-50' 
              : darkMode 
                ? 'border-gray-600 hover:border-blue-500 hover:bg-blue-900/10' 
                : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
          }`}
          animate={dropAreaControls}
          variants={{
            default: { 
              borderColor: darkMode ? 'rgb(75, 85, 99)' : 'rgb(209, 213, 219)', 
              backgroundColor: darkMode ? 'transparent' : 'transparent' 
            },
            dragging: { 
              borderColor: 'rgb(59, 130, 246)', 
              backgroundColor: darkMode ? 'rgba(30, 64, 175, 0.1)' : 'rgb(239, 246, 255)' 
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
        >
          {!preview ? (
            <div className="space-y-3">
              <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${
                darkMode 
                  ? 'bg-blue-900/30 text-blue-400' 
                  : 'bg-blue-100 text-blue-600'
              }`}>
                <FiUpload size={28} />
              </div>
              <div>
                <p className={`text-lg font-medium ${
                  darkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Klik atau seret file ke sini
                </p>
                <p className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Format yang didukung: JPEG, PNG (maks. 5MB)
                </p>
              </div>
            </div>
          ) : (
            <div className="relative">
              <img 
                src={preview} 
                alt="Preview" 
                className="max-h-64 mx-auto rounded-lg shadow-lg" 
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`absolute top-2 right-2 p-1.5 rounded-full ${
                  darkMode 
                    ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                } shadow-md`}
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setPreview(null);
                }}
              >
                <FiX size={16} />
              </motion.button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg, image/png"
            onChange={handleFileChange}
            className="hidden"
          />
        </motion.div>
      </div>
      
      {/* Submit Button */}
      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          disabled={!file || !selectedPatient || isLoading}
          onClick={handleSubmit}
          className={`px-5 py-2.5 rounded-lg font-medium flex items-center justify-center min-w-[120px] ${
            !file || !selectedPatient || isLoading
              ? darkMode 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : darkMode 
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md hover:from-blue-700 hover:to-blue-800' 
                : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md hover:from-blue-700 hover:to-blue-600'
          } transition-all duration-200`}
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <FiUpload className="mr-2" />
          )}
          {isLoading ? 'Mengunggah...' : 'Unggah & Analisis'}
        </motion.button>
      </div>
    </div>
  );
}

export default UploadImage;