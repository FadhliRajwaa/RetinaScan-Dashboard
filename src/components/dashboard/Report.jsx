import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiPrinter, FiExternalLink, FiCalendar, FiUser, FiInfo, FiAlertTriangle, FiCheck, FiShare2, FiFileText, FiEye, FiActivity } from 'react-icons/fi';
import jsPDF from 'jspdf';
import { getSeverityBgColor, getSeverityTextColor, getSeverityLabel } from '../../utils/severityUtils';
import { useTheme } from '../../context/ThemeContext';

// Glassmorphism style
const glassEffect = {
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  borderRadius: '16px',
};

function Report({ result }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isShareLoading, setIsShareLoading] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [imageError, setImageError] = useState(false);
  const reportRef = useRef(null);
  const { darkMode } = useTheme();

  if (!result) {
    return (
      <div className={`flex flex-col items-center justify-center p-6 rounded-xl ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      } shadow-lg`}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="text-center p-10"
        >
          <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
            darkMode 
              ? 'bg-gradient-to-r from-indigo-700 to-purple-800 shadow-lg shadow-indigo-900/20' 
              : 'bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg'
          }`}>
            <FiFileText className="w-10 h-10 text-white" />
          </div>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-500'} text-lg mb-2`}>
            Belum ada data analisis tersedia
          </p>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-400'} text-sm`}>
            Silakan unggah dan analisis gambar retina terlebih dahulu
          </p>
        </motion.div>
      </div>
    );
  }

  const { severity, confidence, patient } = result;

  // Helper function untuk menampilkan gambar, prioritaskan imageData jika ada
  const getImageSource = () => {
    if (!result) {
      console.warn('Result object is undefined or null');
      return '/images/default-retina.jpg';
    }
    
    // Jika ada imageData (base64), gunakan itu
    if (result.imageData && result.imageData.startsWith('data:')) {
      return result.imageData;
    }
    
    // Jika ada preview (biasanya dari component UploadImage), gunakan itu
    if (result.preview && typeof result.preview === 'string') {
      return result.preview;
    }
    
    // Jika ada image yang berisi data URL
    if (result.image && typeof result.image === 'string') {
      if (result.image.startsWith('data:')) {
        return result.image;
      }
      
      // Jika image adalah path relatif, tambahkan base URL API
      if (result.image.startsWith('/')) {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        return `${API_URL}${result.image}`;
      }
      
      // Gunakan image sebagai URL
      return result.image;
    }
    
    // Jika ada imageUrl
    if (result.imageUrl) {
      // Jika imageUrl adalah path relatif, tambahkan base URL API
      if (result.imageUrl.startsWith('/')) {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        return `${API_URL}${result.imageUrl}`;
      }
      return result.imageUrl;
    }
    
    // Fallback ke default image jika tidak ada source yang valid
    return '/images/default-retina.jpg';
  };

  // Handler untuk error gambar
  const handleImageError = () => {
    console.error('Gagal memuat gambar retina');
    setImageError(true);
  };

  // Format date dengan validasi
  const formatDate = (date) => {
    try {
      if (!date) return new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      return new Date(date).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Format date error:', error);
      return 'Tanggal tidak valid';
    }
  };

  // Format percentage dengan validasi
  const formatPercentage = (value) => {
    if (value === undefined || value === null) return '0%';
    
    try {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return '0%';
      
      // Jika nilai sudah dalam persentase (misal 78 bukan 0.78)
      if (numValue > 1) {
        return numValue.toFixed(1) + '%';
      }
      return (numValue * 100).toFixed(1) + '%';
    } catch (error) {
      return '0%';
    }
  };

  // Get severity color
  const getSeverityColor = (severity) => {
    const level = severity.toLowerCase();
    if (level === 'ringan') return 'text-green-600';
    if (level === 'sedang') return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get severity card color
  const getSeverityCardColor = (severity) => {
    const level = severity.toLowerCase();
    if (level === 'ringan') return 'bg-green-50 border-green-200';
    if (level === 'sedang') return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  // Get severity gradient
  const getSeverityGradient = (severity) => {
    const level = severity.toLowerCase();
    if (level === 'tidak ada' || level === 'normal') return 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)';
    if (level === 'ringan') return 'linear-gradient(135deg, #34d399 0%, #10b981 100%)';
    if (level === 'sedang') return 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)';
    if (level === 'berat') return 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)';
    return 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)';
  };

  // Get severity icon
  const getSeverityIcon = (severity) => {
    const level = severity.toLowerCase();
    if (level === 'tidak ada' || level === 'normal') {
      return <FiCheck className="text-blue-500" size={24} />;
    } else if (level === 'ringan') {
      return <FiInfo className="text-green-500" size={24} />;
    } else if (level === 'sedang') {
      return <FiInfo className="text-yellow-500" size={24} />;
    } else {
      return <FiAlertTriangle className="text-red-500" size={24} />;
    }
  };

  // Download PDF
  const handleDownload = async () => {
    try {
      setIsLoading(true);
      
      // Pendekatan baru: Buat PDF langsung dengan jsPDF tanpa html2canvas
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      
      // Fungsi untuk menambahkan teks dengan wrapping
      const addWrappedText = (text, x, y, maxWidth, lineHeight) => {
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, x, y);
        return y + (lines.length * lineHeight);
      };
      
      // Header
      pdf.setFillColor(37, 99, 235); // Warna biru
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      pdf.setTextColor(255, 255, 255); // Warna putih untuk teks header
      pdf.setFontSize(24);
      pdf.setFont(undefined, 'bold');
      pdf.text('Laporan Analisis Retina', pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      const currentDate = formatDate(new Date());
      pdf.text(`Tanggal: ${currentDate}`, pageWidth / 2, 30, { align: 'center' });
      
      let yPos = 50;
      
      // Logo RetinaScan (opsional - ganti dengan path logo yang sesuai)
      // pdf.addImage('path/to/logo.png', 'PNG', margin, yPos - 15, 40, 15);
      
      // Informasi pasien jika tersedia
      if (patient) {
        pdf.setFillColor(240, 249, 255); // Warna latar belakang biru muda
        pdf.rect(margin, yPos, pageWidth - (margin * 2), 30, 'F');
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text('Informasi Pasien', margin + 5, yPos + 10);
        
        pdf.setFontSize(11);
        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(60, 60, 60);
        pdf.text(`Nama: ${patient.fullName || patient.name}`, margin + 5, yPos + 20);
        pdf.text(`Jenis Kelamin: ${patient.gender === 'male' ? 'Laki-laki' : 'Perempuan'}, Umur: ${patient.age} tahun`, pageWidth - margin - 5, yPos + 20, { align: 'right' });
        
        yPos += 40;
      } else {
        yPos += 10;
      }
      
      // Hasil analisis
      pdf.setFillColor(245, 250, 255); // Warna latar belakang biru sangat muda
      pdf.rect(margin, yPos, pageWidth - (margin * 2), 50, 'F');
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Hasil Analisis', margin + 5, yPos + 10);
      
      // Tingkat keparahan
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(60, 60, 60);
      pdf.text(`Tingkat Keparahan: ${getSeverityLabel(severity) || severity || 'Tidak diketahui'}`, margin + 5, yPos + 25);
      pdf.text(`Tingkat Kepercayaan: ${formatPercentage(confidence)}`, margin + 5, yPos + 35);
      
      yPos += 60;
      
      // Tambahkan gambar
      try {
        const imgSrc = getImageSource();
        if (imgSrc && imgSrc.startsWith('data:')) {
          // Jika gambar adalah base64
          const imgWidth = 80;
          const imgHeight = 80;
          pdf.addImage(imgSrc, 'JPEG', pageWidth / 2 - imgWidth / 2, yPos, imgWidth, imgHeight);
          yPos += imgHeight + 10;
        }
      } catch (imgErr) {
        console.error('Error adding image to PDF:', imgErr);
      }
      
      // Rekomendasi
      pdf.setFillColor(240, 249, 255);
      pdf.rect(margin, yPos, pageWidth - (margin * 2), 40, 'F');
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Rekomendasi', margin + 5, yPos + 10);
      
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(60, 60, 60);
      
      // Tambahkan rekomendasi dengan text wrapping
      const recommendation = result.recommendation || 'Tidak ada rekomendasi spesifik.';
      addWrappedText(recommendation, margin + 5, yPos + 25, pageWidth - (margin * 2) - 10, 6);
      
      // Footer
      const footerYPos = pageHeight - 20;
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Dokumen ini dibuat secara otomatis oleh sistem RetinaScan.', pageWidth / 2, footerYPos, { align: 'center' });
      pdf.text('© RetinaScan - ' + new Date().getFullYear(), pageWidth / 2, footerYPos + 5, { align: 'center' });
      
      // Simpan PDF
      pdf.save(`RetinaScan_${patient ? patient.fullName || patient.name : 'Pasien'}_${new Date().toISOString().split('T')[0]}.pdf`);
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setIsLoading(false);
    }
  };

  // Print report
  const handlePrint = () => {
    window.print();
  };

  // Share report
  const handleShare = async () => {
    try {
      setIsShareLoading(true);
      
      // Cek apakah Web Share API tersedia
      if (navigator.share) {
        try {
        await navigator.share({
            title: 'Hasil Analisis RetinaScan',
            text: `Hasil analisis retina untuk ${patient ? patient.fullName || patient.name : 'Pasien'}: ${getSeverityLabel(severity) || severity}`,
            // url: window.location.href
          });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
        } catch (err) {
          console.error('Error sharing:', err);
          // Fallback jika user membatalkan sharing
          if (err.name !== 'AbortError') {
            alert('Tidak dapat membagikan hasil. Coba salin URL atau unduh PDF.');
          }
        }
      } else {
        // Fallback jika Web Share API tidak tersedia
        // Copy URL ke clipboard
        await navigator.clipboard.writeText(window.location.href);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error in share handler:', err);
    } finally {
      setIsShareLoading(false);
    }
  };

  // Extract value from object with safe fallback
  const extractValueWithDefault = (obj, path, defaultValue) => {
    if (!obj) return defaultValue;
    
    const keys = path.split('.');
    let value = obj;
    
    for (const key of keys) {
      if (value === null || value === undefined) return defaultValue;
      value = value[key];
    }
    
    return value !== null && value !== undefined ? value : defaultValue;
  };

  // Get patient info
  const patientName = extractValueWithDefault(patient, 'fullName', extractValueWithDefault(patient, 'name', 'Pasien'));
  const patientGender = extractValueWithDefault(patient, 'gender', '-');
  const patientAge = extractValueWithDefault(patient, 'age', extractValueWithDefault(patient, 'dateOfBirth', '-'));
  const patientId = extractValueWithDefault(patient, '_id', extractValueWithDefault(patient, 'id', null));
  
  // Format gender
  const formattedGender = patientGender === 'male' ? 'Laki-laki' : 
                         patientGender === 'female' ? 'Perempuan' : patientGender;

  // Variasi animasi untuk komponen
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
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

  // Component for image viewer
  const ImageViewer = () => (
    <div className={`relative rounded-lg overflow-hidden ${
      darkMode ? 'border border-gray-700' : 'border border-gray-200'
    } shadow-md`}>
      {imageError ? (
        <div className={`aspect-square flex items-center justify-center ${
          darkMode ? 'bg-gray-800' : 'bg-gray-100'
        }`}>
          <FiEye size={48} className={darkMode ? 'text-gray-600' : 'text-gray-400'} />
        </div>
      ) : (
      <img
        src={getImageSource()}
          alt="Retina" 
          onError={handleImageError}
          className="w-full aspect-square object-cover"
        />
      )}
    </div>
  );

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
      ref={reportRef}
    >
      {/* Patient Info */}
      <motion.div
        variants={itemVariants}
        className={`p-5 rounded-xl ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } shadow-md`}
      >
        <div className="flex items-center mb-4">
          <div className={`p-2 rounded-full ${
            darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'
          } mr-3`}>
            <FiUser size={20} />
          </div>
          <h3 className={`text-lg font-medium ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Informasi Pasien
        </h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
            <p className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            } mb-1`}>
              Nama Pasien
            </p>
            <p className={`font-medium ${
              darkMode ? 'text-gray-200' : 'text-gray-800'
            }`}>
              {patientName}
            </p>
          </div>
          
          <div>
            <p className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            } mb-1`}>
              Jenis Kelamin
            </p>
            <p className={`font-medium ${
              darkMode ? 'text-gray-200' : 'text-gray-800'
            }`}>
              {formattedGender}
            </p>
          </div>
          
              <div>
            <p className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            } mb-1`}>
              Tanggal Analisis
            </p>
            <p className={`font-medium ${
              darkMode ? 'text-gray-200' : 'text-gray-800'
            }`}>
              {formatDate(result.createdAt || result.timestamp)}
            </p>
          </div>
        </div>
                </motion.div>
      
      {/* Analysis Results */}
              <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Image */}
        <div className={`p-5 rounded-xl ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } shadow-md`}>
          <div className="flex items-center mb-4">
            <div className={`p-2 rounded-full ${
              darkMode ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-100 text-indigo-600'
            } mr-3`}>
              <FiEye size={20} />
            </div>
            <h3 className={`text-lg font-medium ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              Citra Retina
            </h3>
          </div>
          
          <ImageViewer />
        </div>

        {/* Results */}
        <div className={`p-5 rounded-xl ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } shadow-md`}>
          <div className="flex items-center mb-4">
            <div className={`p-2 rounded-full ${
              darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600'
            } mr-3`}>
              <FiActivity size={20} />
              </div>
            <h3 className={`text-lg font-medium ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              Hasil Analisis
            </h3>
          </div>
          
          <div className="space-y-5">
            <div>
              <p className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              } mb-2`}>
                Tingkat Keparahan:
              </p>
              <div className={`inline-flex items-center px-4 py-2 rounded-lg ${
                getSeverityBgColor(severity, darkMode)
              }`}>
                <span className={`text-lg font-medium ${
                  getSeverityTextColor(severity, darkMode)
                }`}>
                  {getSeverityLabel(severity) || severity || 'Tidak diketahui'}
                </span>
              </div>
            </div>
            
            <div>
              <p className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              } mb-2`}>
                Tingkat Kepercayaan:
              </p>
              <div className="flex items-center">
                <div className={`w-full h-2.5 rounded-full ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-200'
                } mr-3`}>
            <motion.div 
                    className={`h-full rounded-full ${
                      confidence > 0.7
                        ? darkMode ? 'bg-green-500' : 'bg-green-500'
                        : confidence > 0.5
                          ? darkMode ? 'bg-yellow-500' : 'bg-yellow-500'
                          : darkMode ? 'bg-red-500' : 'bg-red-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(confidence || 0) * 100}%` }}
                    transition={{ duration: 0.8, type: 'spring', stiffness: 50 }}
                  />
                </div>
                <span className={`text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {formatPercentage(confidence)}
                </span>
              </div>
                  </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Recommendation */}
              <motion.div 
        variants={itemVariants}
        className={`p-5 rounded-xl ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } shadow-md`}
      >
        <div className="flex items-center mb-4">
          <div className={`p-2 rounded-full ${
            darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-600'
          } mr-3`}>
            <FiInfo size={20} />
          </div>
          <h3 className={`text-lg font-medium ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Rekomendasi
          </h3>
        </div>
        
        <div className={`p-4 rounded-lg ${
          darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
        }`}>
          <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
            {result.recommendation || 'Tidak ada rekomendasi spesifik.'}
          </p>
        </div>
      </motion.div>
      
      {/* Actions */}
        <motion.div 
          variants={itemVariants}
        className="flex flex-wrap gap-3 justify-end"
      >
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleShare}
          disabled={isShareLoading}
          className={`px-4 py-2.5 rounded-lg flex items-center ${
            darkMode
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } transition-colors`}
        >
          {isShareLoading ? (
            <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : shareSuccess ? (
            <FiCheck className="mr-2" />
          ) : (
            <FiShare2 className="mr-2" />
          )}
          {shareSuccess ? 'Berhasil Dibagikan' : 'Bagikan'}
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handlePrint}
          className={`px-4 py-2.5 rounded-lg flex items-center ${
            darkMode
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } transition-colors`}
        >
          <FiPrinter className="mr-2" />
          Cetak
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleDownload}
          disabled={isLoading}
          className={`px-4 py-2.5 rounded-lg flex items-center ${
            darkMode
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } transition-colors`}
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <FiDownload className="mr-2" />
          )}
          {isLoading ? 'Menyiapkan...' : 'Unduh PDF'}
        </motion.button>
      </motion.div>
      
      {/* Disclaimer */}
      <motion.div 
        variants={itemVariants}
        className={`p-4 rounded-lg border ${
          darkMode 
            ? 'bg-gray-800/50 border-gray-700 text-gray-300' 
            : 'bg-blue-50 border-blue-100 text-blue-700'
        } text-sm`}
      >
        <div className="flex items-start">
          <FiInfo className="mt-0.5 mr-3 flex-shrink-0" />
          <p>
            Hasil analisis ini bersifat pendukung dan tidak menggantikan diagnosis dokter. 
            Selalu konsultasikan hasil dengan profesional kesehatan.
          </p>
          </div>
        </motion.div>
      </motion.div>
  );
}

export default Report;