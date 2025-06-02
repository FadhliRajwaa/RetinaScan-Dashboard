import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiPrinter, FiExternalLink, FiCalendar, FiUser, FiInfo, FiAlertTriangle, FiCheck, FiShare2, FiFileText, FiEye, FiActivity, FiBarChart2, FiZap } from 'react-icons/fi';
import jsPDF from 'jspdf';
import { getSeverityBgColor } from '../../utils/severityUtils';

// Glassmorphism style
const glassEffect = {
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  borderRadius: '16px',
};

// Enhanced glassmorphism style
const enhancedGlassEffect = {
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '16px',
};

function Report({ result }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isShareLoading, setIsShareLoading] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [imageError, setImageError] = useState(false);
  const reportRef = useRef(null);

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center p-6 rounded-xl" style={glassEffect}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="text-center p-10"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg">
            <FiFileText className="w-10 h-10 text-white" />
          </div>
          <p className="text-gray-500 text-lg mb-2">Belum ada data analisis tersedia</p>
          <p className="text-gray-400 text-sm">Silakan unggah dan analisis gambar retina terlebih dahulu</p>
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
      pdf.text('Tingkat Keparahan:', margin + 5, yPos + 25);
      
      // Set warna berdasarkan tingkat keparahan
      const severityLevel = severity.toLowerCase();
      if (severityLevel === 'ringan') {
        pdf.setTextColor(39, 174, 96); // Hijau
      } else if (severityLevel === 'sedang') {
        pdf.setTextColor(241, 196, 15); // Kuning
      } else if (severityLevel === 'berat' || severityLevel === 'sangat berat') {
        pdf.setTextColor(231, 76, 60); // Merah
      } else {
        pdf.setTextColor(52, 152, 219); // Biru
      }
      
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text(severity, margin + 50, yPos + 25);
      
      // Tingkat kepercayaan
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(60, 60, 60);
      pdf.text(`Tingkat Kepercayaan: ${formatPercentage(confidence)}`, margin + 5, yPos + 40);
      
      // Gambar bar untuk confidence
      const barWidth = 50;
      const confidenceWidth = barWidth * confidence;
      pdf.setFillColor(220, 220, 220); // Background bar
      pdf.rect(margin + 80, yPos + 37, barWidth, 5, 'F');
      pdf.setFillColor(37, 99, 235); // Filled bar
      pdf.rect(margin + 80, yPos + 37, confidenceWidth, 5, 'F');
      
      yPos += 60;
      
      // Gambar
      if (result.image && typeof result.image === 'string') {
        try {
          // Tambahkan gambar jika tersedia
          const imgWidth = 100;
          const imgHeight = 100;
          pdf.addImage(result.image, 'JPEG', pageWidth / 2 - imgWidth / 2, yPos, imgWidth, imgHeight);
          yPos += imgHeight + 10;
          
          // Tambahkan label gambar
          pdf.setFontSize(10);
          pdf.setTextColor(100, 100, 100);
          pdf.text('Gambar Retina yang Dianalisis', pageWidth / 2, yPos, { align: 'center' });
          yPos += 15;
        } catch (imgError) {
          console.error('Error adding image to PDF:', imgError);
          // Lanjutkan tanpa gambar jika gagal
          yPos += 10;
        }
      }
      
      // Rekomendasi
      pdf.setFillColor(245, 250, 255); // Warna latar belakang biru sangat muda
      pdf.rect(margin, yPos, pageWidth - (margin * 2), 40, 'F');
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Rekomendasi', margin + 5, yPos + 10);
      
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(60, 60, 60);
      
      let recommendation = '';
      if (severity === 'Tidak ada') {
        recommendation = 'Lakukan pemeriksaan rutin setiap tahun.';
      } else if (severity === 'Ringan') {
        recommendation = 'Kontrol gula darah dan tekanan darah. Pemeriksaan ulang dalam 9-12 bulan.';
      } else if (severity === 'Sedang') {
        recommendation = 'Konsultasi dengan dokter spesialis mata. Pemeriksaan ulang dalam 6 bulan.';
      } else if (severity === 'Berat') {
        recommendation = 'Rujukan segera ke dokter spesialis mata. Pemeriksaan ulang dalam 2-3 bulan.';
      } else if (severity === 'Sangat Berat') {
        recommendation = 'Rujukan segera ke dokter spesialis mata untuk evaluasi dan kemungkinan tindakan laser atau operasi.';
      } else {
        recommendation = 'Lakukan pemeriksaan rutin setiap tahun.';
      }
      
      yPos = addWrappedText(recommendation, margin + 5, yPos + 20, pageWidth - (margin * 2) - 10, 6);
      yPos += 15;
      
      // Disclaimer
      pdf.setFillColor(245, 245, 245); // Warna latar belakang abu-abu muda
      pdf.rect(margin, yPos, pageWidth - (margin * 2), 25, 'F');
      
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      const disclaimer = 'Disclaimer: Hasil analisis ini merupakan bantuan diagnostik berbasis AI dan tidak menggantikan diagnosis dari dokter. Selalu konsultasikan dengan tenaga medis profesional untuk diagnosis dan penanganan yang tepat.';
      yPos = addWrappedText(disclaimer, margin + 5, yPos + 10, pageWidth - (margin * 2) - 10, 5);
      
      // Footer
      pdf.setFillColor(37, 99, 235); // Warna biru
      pdf.rect(0, pageHeight - 20, pageWidth, 20, 'F');
      
      pdf.setFontSize(10);
      pdf.setTextColor(255, 255, 255);
      pdf.text(`RetinaScan © ${new Date().getFullYear()} | AI-Powered Retinopathy Detection`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      // Simpan PDF
      pdf.save('retina-analysis-report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Gagal membuat PDF. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Print report
  const handlePrint = () => {
    window.print();
  };

  // Handle share report
  const handleShare = async () => {
    try {
      setIsShareLoading(true);
      
      // Cek apakah Web Share API tersedia
      if (navigator.share) {
        // Buat PDF untuk dishare
        const pdf = new jsPDF('p', 'mm', 'a4');
        // Gunakan fungsi yang sama dengan handleDownload untuk membuat PDF
        
        // Simpan PDF ke Blob
        const pdfBlob = pdf.output('blob');
        
        // Buat file dari blob
        const pdfFile = new File([pdfBlob], "retina-analysis-report.pdf", { 
          type: 'application/pdf' 
        });
        
        // Share file menggunakan Web Share API
        await navigator.share({
          title: 'Laporan Analisis Retina',
          text: `Laporan analisis retina dengan tingkat keparahan: ${result.severity}`,
          files: [pdfFile]
        });
        
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
      } else {
        // Fallback jika Web Share API tidak tersedia
        // Gunakan clipboard API untuk menyalin teks laporan
        const reportText = `Laporan Analisis Retina\n\nTingkat Keparahan: ${result.severity}\nTingkat Kepercayaan: ${(result.confidence * 100).toFixed(1)}%\n\nRekomendasi: ${
          result.severity === 'Tidak ada' 
            ? 'Lakukan pemeriksaan rutin setiap tahun.' 
            : result.severity === 'Ringan'
            ? 'Kontrol gula darah dan tekanan darah. Pemeriksaan ulang dalam 9-12 bulan.' 
            : result.severity === 'Sedang'
            ? 'Konsultasi dengan dokter spesialis mata. Pemeriksaan ulang dalam 6 bulan.'
            : result.severity === 'Berat'
            ? 'Rujukan segera ke dokter spesialis mata. Pemeriksaan ulang dalam 2-3 bulan.'
            : result.severity === 'Sangat Berat'
            ? 'Rujukan segera ke dokter spesialis mata untuk evaluasi dan kemungkinan tindakan laser atau operasi.'
            : 'Lakukan pemeriksaan rutin setiap tahun.'
        }`;
        
        await navigator.clipboard.writeText(reportText);
        alert('Laporan telah disalin ke clipboard.');
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error sharing report:', error);
      alert('Gagal membagikan laporan. Silakan coba lagi.');
    } finally {
      setIsShareLoading(false);
    }
  };

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

  // Safely extract values with defaults
  const extractValueWithDefault = (obj, path, defaultValue) => {
    try {
      const parts = path.split('.');
      let current = obj;
      
      for (const part of parts) {
        if (current === undefined || current === null) {
          return defaultValue;
        }
        current = current[part];
      }
      
      return current !== undefined && current !== null ? current : defaultValue;
    } catch (e) {
      console.error(`Error extracting ${path}:`, e);
      return defaultValue;
    }
  };

  // Safe extraction of patient data
  const patientName = extractValueWithDefault(patient, 'fullName', extractValueWithDefault(patient, 'name', 'Tidak ada nama'));
  const patientGender = extractValueWithDefault(patient, 'gender', '');
  const patientAge = extractValueWithDefault(patient, 'age', '');
  const patientPhone = extractValueWithDefault(patient, 'phone', '-');

  // Safe extraction of result data
  const resultDate = extractValueWithDefault(result, 'createdAt', new Date().toISOString());
  const resultSeverity = extractValueWithDefault(result, 'severity', 'Tidak diketahui');
  const resultConfidence = extractValueWithDefault(result, 'confidence', 0);
  const resultNotes = extractValueWithDefault(result, 'notes', extractValueWithDefault(result, 'recommendation', 'Tidak ada catatan'));

  // JSX for Image Viewer with improved error handling
  const ImageViewer = () => (
    <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden shadow-lg">
      {/* Loading overlay */}
      {!imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}
      
      {/* Actual image */}
      <img
        src={getImageSource()}
        alt="Retina scan"
        className="w-full h-full object-contain"
        onLoad={(e) => {
          // Hide loading overlay
          if (e.target.previousSibling) {
            e.target.previousSibling.style.display = 'none';
          }
        }}
        onError={(e) => {
          handleImageError();
          if (e.target.previousSibling) {
            e.target.previousSibling.style.display = 'none';
          }
          e.target.onerror = null;
          e.target.src = '/images/default-retina.jpg';
        }}
      />
      
      {/* Error overlay */}
      {imageError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 bg-opacity-70 z-20">
          <FiAlertTriangle className="text-yellow-400 text-4xl mb-3" />
          <p className="text-white text-center">Gambar tidak dapat ditampilkan</p>
          <button 
            onClick={() => {
              setImageError(false);
              // Force reload image with timestamp
              const img = document.querySelector('img[alt="Retina scan"]');
              if (img) {
                const imgSrc = getImageSource();
                img.src = imgSrc.includes('?') 
                  ? `${imgSrc}&reload=${new Date().getTime()}`
                  : `${imgSrc}?reload=${new Date().getTime()}`;
              }
            }}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        className="flex flex-col justify-between items-center mb-8 relative"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Background decoration */}
        <motion.div 
          className="absolute inset-0 -z-10 rounded-2xl opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(79, 70, 229, 0.2) 0%, rgba(79, 70, 229, 0) 70%)'
          }}
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        <div className="flex w-full justify-between items-center mb-3">
          <div className="flex items-center">
            <motion.div
              className="mr-3 p-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <FiActivity className="text-white w-6 h-6" />
            </motion.div>
            <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
              Hasil Analisis Retina
            </h3>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 10px 25px -3px rgba(59, 130, 246, 0.4), 0 4px 6px -2px rgba(59, 130, 246, 0.3)' }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownload}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all text-sm font-medium shadow-lg"
            >
              <FiDownload className="text-blue-100" />
              {isLoading ? 'Memproses...' : 'Unduh PDF'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.1)' }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium shadow-md"
              style={{...enhancedGlassEffect, background: 'rgba(255, 255, 255, 0.85)'}}
            >
              <FiPrinter className="text-indigo-600" />
              Cetak
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.1)' }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center w-10 h-10 rounded-full"
              style={{...enhancedGlassEffect, background: 'rgba(255, 255, 255, 0.85)'}}
              onClick={handleShare}
              disabled={isShareLoading}
            >
              {isShareLoading ? (
                <div className="w-5 h-5 border-t-2 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
              ) : shareSuccess ? (
                <FiCheck className="text-green-600" />
              ) : (
                <FiShare2 className="text-indigo-600" />
              )}
            </motion.button>
          </div>
        </div>
        
        {/* Subtitle with animation */}
        <motion.div
          className="text-sm text-gray-500 ml-12 self-start"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 0.5 }}
        >
          Analisis gambar retina menggunakan teknologi AI untuk deteksi retinopati diabetik
        </motion.div>
      </motion.div>

      {/* Tambahkan indikator mode simulasi */}
      {result && (result.isSimulation || result.simulation_mode || 
        (result.raw_prediction && result.raw_prediction.is_simulation)) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="mb-6 text-sm flex items-start rounded-xl overflow-hidden"
          style={{ ...glassEffect, background: 'rgba(254, 240, 199, 0.7)' }}
        >
          <div className="bg-amber-500 h-full w-2"></div>
          <div className="p-5">
            <div className="flex items-start">
              <FiAlertTriangle className="w-6 h-6 mr-3 flex-shrink-0 text-amber-600" />
              <div>
                <p className="font-bold mb-2 text-base text-amber-800">PERHATIAN: Laporan dalam Mode Simulasi</p>
                <p className="mb-2 text-amber-700">Hasil analisis ini menggunakan <span className="font-bold underline">data simulasi</span> karena layanan AI tidak tersedia saat ini.</p>
                <p className="text-amber-800 font-bold">Hasil ini TIDAK BOLEH digunakan untuk diagnosis klinis. Silakan konsultasikan dengan dokter mata untuk evaluasi yang akurat.</p>
              </div>
            </div>
            <motion.div 
              className="mt-3 p-3 rounded-md border border-amber-200"
              style={{ background: 'rgba(254, 243, 199, 0.7)' }}
              initial={{ opacity: 0.8 }}
              whileHover={{ opacity: 1, scale: 1.01 }}
            >
              <p className="text-xs font-semibold text-amber-700">Untuk menggunakan model AI sebenarnya, jalankan script pengujian koneksi:</p>
              <code className="text-xs bg-white/70 p-2 rounded mt-1 block text-amber-800 font-mono">npm run test:flask</code>
            </motion.div>
          </div>
        </motion.div>
      )}

      <motion.div
        ref={reportRef}
        className="rounded-2xl overflow-hidden shadow-2xl pdf-container"
        style={{ ...glassEffect, background: 'rgba(255, 255, 255, 0.9)' }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <div className="relative overflow-hidden">
          {/* Background gradient with animated effect */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600"
            animate={{ 
              background: [
                'linear-gradient(90deg, rgba(37,99,235,1) 0%, rgba(79,70,229,1) 50%, rgba(124,58,237,1) 100%)',
                'linear-gradient(90deg, rgba(79,70,229,1) 0%, rgba(124,58,237,1) 50%, rgba(37,99,235,1) 100%)',
                'linear-gradient(90deg, rgba(124,58,237,1) 0%, rgba(37,99,235,1) 50%, rgba(79,70,229,1) 100%)',
                'linear-gradient(90deg, rgba(37,99,235,1) 0%, rgba(79,70,229,1) 50%, rgba(124,58,237,1) 100%)'
              ]
            }}
            transition={{ duration: 10, repeat: Infinity, repeatType: "loop" }}
          />
          
          {/* Animated floating particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  width: Math.random() * 6 + 2,
                  height: Math.random() * 6 + 2,
                  x: Math.random() * 100 + "%",
                  y: Math.random() * 100 + "%",
                  opacity: Math.random() * 0.5 + 0.1
                }}
                animate={{
                  y: ["-10%", "110%"],
                  opacity: [0, 0.7, 0]
                }}
                transition={{
                  duration: Math.random() * 10 + 10,
                  repeat: Infinity,
                  delay: Math.random() * 5
                }}
              />
            ))}
          </div>
          
          {/* Background pattern with parallax effect */}
          <motion.div 
            className="absolute inset-0 opacity-10"
            initial={{ backgroundPositionX: '0%' }}
            animate={{ backgroundPositionX: '100%' }}
            transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
              backgroundSize: '30px 30px'
            }}
          ></motion.div>
          
          {/* Content with staggered animations */}
          <div className="relative p-10 text-white z-10">
            <div className="flex justify-between items-start">
              <div>
                <motion.h2 
                  className="text-4xl font-bold mb-3"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.7, type: "spring" }}
                >
                  Laporan Analisis Retina
                </motion.h2>
                <motion.div 
                  className="flex items-center text-blue-100"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <FiCalendar className="mr-2" />
                  <span>{formatDate(new Date())}</span>
                </motion.div>
              </div>
              <motion.div 
                className="text-right"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <div className="text-xl font-semibold text-white">RetinaScan AI</div>
                <div className="text-blue-100">Deteksi Retinopati Diabetik</div>
                {/* Tambahkan label simulasi jika dalam mode simulasi */}
                {result && (result.isSimulation || result.simulation_mode || 
                  (result.raw_prediction && result.raw_prediction.is_simulation)) && (
                  <motion.div 
                    className="mt-3"
                    animate={{ 
                      opacity: [0.7, 1, 0.7],
                      scale: [1, 1.03, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    <span className="bg-amber-600 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-lg">
                      SIMULASI - BUKAN HASIL SEBENARNYA
                    </span>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
          
          {/* Decorative bottom wave with animation */}
          <motion.div 
            className="absolute bottom-0 left-0 right-0"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.7 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" className="w-full h-12">
              <motion.path 
                fill="rgba(255, 255, 255, 0.9)" 
                fillOpacity="1" 
                d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,53.3C672,43,768,21,864,16C960,11,1056,21,1152,32C1248,43,1344,53,1392,58.7L1440,64L1440,100L1392,100C1344,100,1248,100,1152,100C1056,100,960,100,864,100C768,100,672,100,576,100C480,100,384,100,288,100C192,100,96,100,48,100L0,100Z"
                animate={{
                  d: [
                    "M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,53.3C672,43,768,21,864,16C960,11,1056,21,1152,32C1248,43,1344,53,1392,58.7L1440,64L1440,100L1392,100C1344,100,1248,100,1152,100C1056,100,960,100,864,100C768,100,672,100,576,100C480,100,384,100,288,100C192,100,96,100,48,100L0,100Z",
                    "M0,64L48,58.7C96,53,192,43,288,48C384,53,480,75,576,80C672,85,768,75,864,69.3C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,100L1392,100C1344,100,1248,100,1152,100C1056,100,960,100,864,100C768,100,672,100,576,100C480,100,384,100,288,100C192,100,96,100,48,100L0,100Z",
                    "M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,53.3C672,43,768,21,864,16C960,11,1056,21,1152,32C1248,43,1344,53,1392,58.7L1440,64L1440,100L1392,100C1344,100,1248,100,1152,100C1056,100,960,100,864,100C768,100,672,100,576,100C480,100,384,100,288,100C192,100,96,100,48,100L0,100Z"
                  ]
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "easeInOut"
                }}
              />
            </svg>
          </motion.div>
        </div>

        {/* Patient Information */}
        {patient && (
          <motion.div 
            className="p-8 border-b"
            variants={itemVariants}
            style={{
              background: 'linear-gradient(to right, rgba(239, 246, 255, 0.8), rgba(224, 231, 255, 0.8))',
              borderBottom: '1px solid rgba(191, 219, 254, 0.5)'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mr-4 shadow-lg transform rotate-3">
                  <FiUser className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                    Informasi Pasien
                  </h3>
                  <p className="text-blue-600 text-sm opacity-80">Data pasien untuk analisis retina</p>
                </div>
              </div>
              
              {/* Patient ID Badge */}
              {patient.id && (
                <motion.div 
                  className="px-4 py-2 rounded-full text-xs font-medium"
                  style={{...enhancedGlassEffect, background: 'rgba(255, 255, 255, 0.9)'}}
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="text-gray-500">ID Pasien:</span> 
                  <span className="ml-1 text-indigo-600 font-bold">{patient.id}</span>
                </motion.div>
              )}
            </div>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 rounded-xl"
              style={{...enhancedGlassEffect, background: 'rgba(255, 255, 255, 0.7)'}}
              whileHover={{ boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', background: 'rgba(255, 255, 255, 0.8)' }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="p-4 rounded-lg bg-white/70 border border-blue-100 shadow-md relative overflow-hidden"
                whileHover={{ y: -3, backgroundColor: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.15), 0 4px 6px -2px rgba(59, 130, 246, 0.1)' }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-500"></div>
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 shadow-sm">
                    <FiUser size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-blue-500 font-medium mb-1">Nama Lengkap</p>
                    <p className="font-semibold text-gray-800 text-lg">{patientName}</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="p-4 rounded-lg bg-white/70 border border-blue-100 shadow-md relative overflow-hidden"
                whileHover={{ y: -3, backgroundColor: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.15), 0 4px 6px -2px rgba(59, 130, 246, 0.1)' }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-indigo-500"></div>
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-purple-500 font-medium mb-1">Jenis Kelamin / Umur</p>
                    <p className="font-semibold text-gray-800 text-lg">
                      {patientGender === 'male' ? 'Laki-laki' : patientGender === 'female' ? 'Perempuan' : patientGender}, {patientAge} tahun
                    </p>
                  </div>
                </div>
              </motion.div>
              
              {patient.dateOfBirth && (
                <motion.div 
                  className="p-4 rounded-lg bg-white/70 border border-blue-100 shadow-md relative overflow-hidden"
                  whileHover={{ y: -3, backgroundColor: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.15), 0 4px 6px -2px rgba(59, 130, 246, 0.1)' }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-500 to-teal-500"></div>
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3 shadow-sm">
                      <FiCalendar size={18} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-green-500 font-medium mb-1">Tanggal Lahir</p>
                      <p className="font-semibold text-gray-800 text-lg">{new Date(patient.dateOfBirth).toLocaleDateString('id-ID')}</p>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {patient.bloodType && (
                <motion.div 
                  className="p-4 rounded-lg bg-white/70 border border-blue-100 shadow-md relative overflow-hidden"
                  whileHover={{ y: -3, backgroundColor: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.15), 0 4px 6px -2px rgba(59, 130, 246, 0.1)' }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-500 to-pink-500"></div>
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3 shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.5 2a3.5 3.5 0 101.665 6.58L8.585 10l-1.42 1.42a3.5 3.5 0 101.414 1.414L10 11.414l1.42 1.42a3.5 3.5 0 101.414-1.414L11.414 10l1.42-1.42A3.5 3.5 0 1010.5 2 3.5 3.5 0 005.5 2zM7 5.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm1.5 8.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-red-500 font-medium mb-1">Golongan Darah</p>
                      <p className="font-semibold text-gray-800 text-lg">{patient.bloodType}</p>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {patientPhone && (
                <motion.div 
                  className="p-4 rounded-lg bg-white/70 border border-blue-100 shadow-md relative overflow-hidden"
                  whileHover={{ y: -3, backgroundColor: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.15), 0 4px 6px -2px rgba(59, 130, 246, 0.1)' }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-500 to-orange-500"></div>
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3 shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-amber-500 font-medium mb-1">Nomor Telepon</p>
                      <p className="font-semibold text-gray-800 text-lg">{patientPhone}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Gambar Retina */}
            <motion.div 
              className="flex flex-col space-y-6"
              variants={itemVariants}
            >
              <h3 className="font-semibold mb-4 text-gray-700 text-lg flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center mr-3 shadow-lg">
                  <FiEye className="text-white" size={20} />
                </div>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 text-xl">
                  Citra Retina
                </span>
              </h3>
              
              <motion.div 
                className="p-6 mb-6 rounded-xl shadow-lg relative overflow-hidden"
                style={{ ...glassEffect, background: 'rgba(255, 255, 255, 0.7)' }}
                variants={itemVariants}
                whileHover={{ 
                  y: -5, 
                  boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
                  background: 'rgba(255, 255, 255, 0.8)'
                }}
                transition={{ duration: 0.3 }}
              >
                {/* Decorative corner elements */}
                <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-indigo-300 rounded-tl-lg opacity-60"></div>
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-indigo-300 rounded-br-lg opacity-60"></div>
                
                <ImageViewer />
                
                {/* Image caption */}
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/50 to-transparent text-white text-center text-sm font-medium"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  Gambar Retina untuk Analisis
                </motion.div>
              </motion.div>
            </motion.div>
            
            {/* Right Column - Analysis Results */}
            <motion.div 
              className="flex flex-col h-full"
              variants={itemVariants}
            >
              <h3 className="font-semibold mb-4 text-gray-700 text-lg flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-3 shadow-lg">
                    <FiActivity className="text-white" size={20} />
                </div>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 text-xl">
                  Hasil Analisis
                </span>
              </h3>
              
                {/* Severity with improved design */}
              <motion.div 
                  className={`p-6 rounded-xl mb-6 shadow-lg overflow-hidden relative`}
                  style={{ ...glassEffect, background: 'rgba(255, 255, 255, 0.7)' }}
                  whileHover={{ 
                    y: -5, 
                    boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
                    background: 'rgba(255, 255, 255, 0.8)'
                  }}
                  transition={{ duration: 0.3 }}
              >
                  {/* Animated background gradient based on severity */}
                <motion.div 
                  className="absolute inset-0 opacity-10"
                    animate={{
                      background: [
                        getSeverityGradient(resultSeverity),
                        getSeverityGradient(resultSeverity) + '80', // Adding transparency
                        getSeverityGradient(resultSeverity)
                      ],
                      opacity: [0.1, 0.15, 0.1]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  style={{
                    zIndex: -1
                  }}
                />
                  
                  {/* Animated pulse ring around severity icon */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="relative">
                        <motion.div 
                          className="absolute inset-0 rounded-full"
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.7, 0, 0.7]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "reverse"
                          }}
                          style={{ background: getSeverityBgColor(resultSeverity) }}
                        />
                        <div className="p-4 rounded-full relative z-10" style={{ background: getSeverityBgColor(resultSeverity) }}>
                          {getSeverityIcon(resultSeverity)}
                        </div>
                      </div>
                      <div className="ml-5">
                        <p className="text-sm text-gray-700 mb-1 flex items-center">
                          <FiBarChart2 className="mr-1 text-indigo-500" size={14} />
                          <span>Tingkat Keparahan</span>
                        </p>
                        <motion.p 
                          className={`text-2xl font-bold ${getSeverityColor(resultSeverity)}`}
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 10, delay: 0.2 }}
                        >
                          {resultSeverity}
                        </motion.p>
                      </div>
                    </div>
                    
                    {/* Severity badge */}
                    <motion.div
                      className="hidden md:block"
                      initial={{ scale: 0, opacity: 0, rotate: -10 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 15 }}
                    >
                      <div 
                        className="p-3 rounded-lg shadow-lg transform rotate-3"
                        style={{ 
                          background: getSeverityGradient(resultSeverity),
                          border: '2px solid white'
                        }}
                      >
                        <p className="text-white text-xs font-bold">
                          {resultSeverity.toLowerCase() === 'tidak ada' || resultSeverity.toLowerCase() === 'normal'
                            ? 'NORMAL'
                            : resultSeverity.toLowerCase() === 'ringan'
                            ? 'PERLU PERHATIAN'
                            : resultSeverity.toLowerCase() === 'sedang'
                            ? 'PERLU TINDAKAN'
                            : 'SEGERA TANGANI'}
                        </p>
                      </div>
                    </motion.div>
                </div>
                  
                  {/* Severity description with improved design */}
                  <motion.div 
                    className="mt-6 p-4 rounded-lg bg-white/50 border border-gray-100"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="flex">
                      <div className="mr-3 mt-1 flex-shrink-0">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center" 
                          style={{ background: getSeverityBgColor(resultSeverity) }}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          {resultSeverity.toLowerCase() === 'tidak ada' || resultSeverity.toLowerCase() === 'normal'
                            ? 'Tidak terdeteksi adanya tanda retinopati diabetik pada gambar retina.'
                            : resultSeverity.toLowerCase() === 'ringan'
                            ? 'Terdeteksi tanda-tanda ringan retinopati diabetik, seperti mikroaneurisma.'
                            : resultSeverity.toLowerCase() === 'sedang'
                            ? 'Terdeteksi tanda-tanda sedang retinopati diabetik, seperti perdarahan intraretinal atau cotton wool spots.'
                            : resultSeverity.toLowerCase() === 'berat'
                            ? 'Terdeteksi tanda-tanda berat retinopati diabetik, memerlukan perhatian medis segera.'
                            : 'Terdeteksi tanda-tanda sangat berat retinopati diabetik, memerlukan intervensi medis segera.'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Key indicators section */}
                    <motion.div 
                      className="mt-4 pt-4 border-t border-gray-100"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <p className="text-xs text-gray-500 mb-2 font-medium">Indikator Kunci:</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full ${
                            resultSeverity.toLowerCase() === 'tidak ada' || resultSeverity.toLowerCase() === 'normal' ? 'bg-green-500' : 'bg-gray-300'
                          } mr-1.5`}></div>
                          <span className="text-xs">Tidak ada lesi</span>
                        </div>
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full ${
                            resultSeverity.toLowerCase() === 'ringan' || resultSeverity.toLowerCase() === 'sedang' || resultSeverity.toLowerCase() === 'berat' ? 'bg-yellow-500' : 'bg-gray-300'
                          } mr-1.5`}></div>
                          <span className="text-xs">Mikroaneurisma</span>
                        </div>
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full ${
                            resultSeverity.toLowerCase() === 'sedang' || resultSeverity.toLowerCase() === 'berat' ? 'bg-orange-500' : 'bg-gray-300'
                          } mr-1.5`}></div>
                          <span className="text-xs">Perdarahan</span>
                        </div>
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full ${
                            resultSeverity.toLowerCase() === 'berat' ? 'bg-red-500' : 'bg-gray-300'
                          } mr-1.5`}></div>
                          <span className="text-xs">Neovaskularisasi</span>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
              </motion.div>
              
                {/* Confidence with animated progress */}
              <motion.div 
                  className="mb-6 p-6 rounded-xl shadow-lg overflow-hidden relative"
                  style={{ ...enhancedGlassEffect, background: 'rgba(255, 255, 255, 0.7)' }}
                  whileHover={{ 
                    y: -5, 
                    boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
                    background: 'rgba(255, 255, 255, 0.8)'
                  }}
                  transition={{ duration: 0.3 }}
              >
                  {/* Background pattern */}
                  <motion.div 
                    className="absolute inset-0 opacity-5 z-0"
                    initial={{ backgroundPositionX: '0%' }}
                    animate={{ backgroundPositionX: '100%' }}
                    transition={{ duration: 60, repeat: Infinity, repeatType: 'loop', ease: 'linear' }}
                    style={{
                      backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%233b82f6\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
                      backgroundSize: '80px 80px'
                    }}
                  />
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-sm text-gray-700 font-medium flex items-center">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2 shadow-sm">
                            <FiZap className="h-4 w-4 text-indigo-600" />
                          </div>
                          <span>Tingkat Kepercayaan</span>
                        </p>
                        <p className="text-xs text-gray-500 ml-10">Seberapa yakin sistem AI dalam diagnosis</p>
                      </div>
                      <motion.div 
                        className="text-lg font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg shadow-sm"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6, type: "spring", stiffness: 300 }}
                      >
                        {formatPercentage(resultConfidence)}
                      </motion.div>
                    </div>
                    
                    {/* Enhanced progress bar with animation */}
                    <div className="mt-4">
                      <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden relative">
                        {/* Background pattern */}
                        <div className="absolute inset-0 opacity-20" style={{
                          backgroundImage: 'linear-gradient(45deg, rgba(0,0,0,0.1) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.1) 75%, transparent 75%, transparent)',
                          backgroundSize: '10px 10px'
                        }}></div>
                        
                        <motion.div 
                          className="h-full relative overflow-hidden rounded-full"
                          style={{ width: '0%' }}
                          animate={{ width: formatPercentage(resultConfidence) }}
                          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                        >
                          {/* Gradient background */}
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"></div>
                          
                          {/* Animated shine effect */}
                          <motion.div
                            className="absolute inset-0"
                            style={{
                              background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)',
                            }}
                            animate={{
                              x: ['-100%', '100%'],
                            }}
                            transition={{
                              duration: 1.5,
                              ease: "easeInOut",
                              repeat: Infinity,
                              repeatType: "loop",
                            }}
                          />
                          
                          {/* Percentage markers */}
                          <div className="absolute inset-0 flex items-center justify-between px-2">
                            {[25, 50, 75].map((mark) => (
                              <div 
                                key={mark} 
                                className={`h-full w-px bg-white/30 ${parseFloat(formatPercentage(resultConfidence)) < mark ? 'hidden' : ''}`}
                                style={{ left: `${mark}%` }}
                              />
                            ))}
                          </div>
                        </motion.div>
                      </div>
                      
                      {/* Confidence scale */}
                      <div className="flex justify-between mt-1 text-xs text-gray-500">
                        <span>0%</span>
                        <span>25%</span>
                        <span>50%</span>
                        <span>75%</span>
                        <span>100%</span>
                      </div>
                    </div>
                    
                    {/* Confidence interpretation */}
                    <motion.div 
                      className="mt-5 p-3 rounded-lg bg-white/70 border border-indigo-100"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Interpretasi: </span>
                        {parseFloat(formatPercentage(resultConfidence)) > 90
                          ? 'Tingkat kepercayaan sangat tinggi. Hasil analisis dapat diandalkan.'
                          : parseFloat(formatPercentage(resultConfidence)) > 75
                          ? 'Tingkat kepercayaan tinggi. Hasil analisis cukup dapat diandalkan.'
                          : parseFloat(formatPercentage(resultConfidence)) > 50
                          ? 'Tingkat kepercayaan sedang. Pertimbangkan pemeriksaan lanjutan.'
                          : 'Tingkat kepercayaan rendah. Disarankan untuk melakukan pemeriksaan ulang.'
                        }
                      </p>
                    </motion.div>
                  </div>
              </motion.div>
              
              {/* Additional analysis details */}
              <motion.div 
                className="mb-6 p-6 rounded-xl shadow-lg overflow-hidden"
                style={{ ...enhancedGlassEffect, background: 'rgba(255, 255, 255, 0.7)' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                whileHover={{ 
                  y: -5, 
                  boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
                  background: 'rgba(255, 255, 255, 0.8)'
                }}
              >
                <h4 className="font-medium text-gray-800 mb-4 flex items-center">
                  <FiBarChart2 className="mr-2 text-purple-600" />
                  Detail Analisis
                </h4>
                
                <div className="space-y-3">
                  {/* Analysis date */}
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/50">
                    <div className="flex items-center">
                      <FiCalendar className="text-purple-500 mr-2" size={16} />
                      <span className="text-sm text-gray-700">Tanggal Analisis</span>
                    </div>
                    <span className="text-sm font-medium">{formatDate(resultDate)}</span>
                  </div>
                  
                  {/* Analysis method */}
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/50">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-700">Metode Analisis</span>
                    </div>
                    <span className="text-sm font-medium">AI Deep Learning</span>
                  </div>
                  
                  {/* Model version */}
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/50">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-700">Versi Model</span>
                    </div>
                    <span className="text-sm font-medium">RetinaScan v2.1</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
              
              {/* Recommendation */}
              <motion.div 
            className="p-6 rounded-xl mt-auto shadow-lg relative overflow-hidden"
            style={{ ...enhancedGlassEffect, background: 'rgba(255, 255, 255, 0.7)' }}
            whileHover={{ 
              y: -5, 
              boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
              background: 'rgba(255, 255, 255, 0.8)'
            }}
            transition={{ duration: 0.3 }}
              >
            {/* Animated background gradient */}
                <motion.div 
                  className="absolute inset-0 opacity-10"
              animate={{
                background: [
                  'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                  'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)'
                ]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              style={{ zIndex: -1 }}
            />
            
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-16 h-16 opacity-20">
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path fill="#3B82F6" d="M46.5,-78.3C59.2,-71.6,68.1,-57.9,75.1,-43.5C82.1,-29,87.2,-14.5,87.7,0.3C88.2,15.1,84.1,30.2,76.1,42.9C68.1,55.6,56.1,65.8,42.5,73.2C28.9,80.5,14.4,85,0.2,84.7C-14.1,84.4,-28.2,79.4,-40.5,71.5C-52.8,63.6,-63.2,52.8,-70.6,40.1C-78,27.4,-82.3,13.7,-82.6,-0.2C-82.9,-14.1,-79.3,-28.2,-72.1,-41C-64.9,-53.8,-54.2,-65.3,-41.4,-71.9C-28.6,-78.5,-14.3,-80.2,0.7,-81.4C15.7,-82.6,33.8,-85,46.5,-78.3Z" transform="translate(100 100)" />
              </svg>
            </div>
            
            {/* Header with improved design */}
            <div className="flex items-center justify-between mb-5 relative z-10">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mr-3 shadow-lg">
                  <FiInfo className="text-white" size={20} />
                </div>
                <div>
                  <h4 className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 text-lg">
                    Rekomendasi
                  </h4>
                  <p className="text-xs text-blue-500 opacity-80">Tindak lanjut berdasarkan hasil analisis</p>
                </div>
              </div>
              
              {/* Severity indicator */}
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                resultSeverity.toLowerCase() === 'tidak ada' || resultSeverity.toLowerCase() === 'normal'
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : resultSeverity.toLowerCase() === 'ringan'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : resultSeverity.toLowerCase() === 'sedang'
                  ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                {resultSeverity.toLowerCase() === 'tidak ada' || resultSeverity.toLowerCase() === 'normal'
                  ? 'Pemeriksaan Rutin'
                  : resultSeverity.toLowerCase() === 'ringan'
                  ? 'Kontrol Rutin'
                  : resultSeverity.toLowerCase() === 'sedang'
                  ? 'Konsultasi Dokter'
                  : 'Rujukan Segera'}
              </div>
            </div>
            
            {/* Main recommendation content */}
            <motion.div 
              className="p-5 rounded-lg bg-white/70 border border-blue-100 shadow-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {/* Recommendation icon based on severity */}
              <div className="flex mb-4">
                <div className={`p-2 rounded-lg mr-3 flex-shrink-0 ${
                  resultSeverity.toLowerCase() === 'tidak ada' || resultSeverity.toLowerCase() === 'normal'
                    ? 'bg-green-50'
                    : resultSeverity.toLowerCase() === 'ringan'
                    ? 'bg-blue-50'
                    : resultSeverity.toLowerCase() === 'sedang'
                    ? 'bg-yellow-50'
                    : 'bg-red-50'
                }`}>
                  {resultSeverity.toLowerCase() === 'tidak ada' || resultSeverity.toLowerCase() === 'normal' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : resultSeverity.toLowerCase() === 'ringan' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : resultSeverity.toLowerCase() === 'sedang' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                
                <p className={`text-base leading-relaxed ${
                  resultSeverity.toLowerCase() === 'tidak ada' || resultSeverity.toLowerCase() === 'normal'
                    ? 'text-green-700'
                    : resultSeverity.toLowerCase() === 'ringan'
                    ? 'text-blue-700'
                    : resultSeverity.toLowerCase() === 'sedang'
                    ? 'text-yellow-700'
                    : 'text-red-700'
                }`}>
                  {resultNotes || (
                    resultSeverity.toLowerCase() === 'tidak ada' || resultSeverity.toLowerCase() === 'normal'
                      ? 'Lakukan pemeriksaan rutin setiap tahun untuk memantau kondisi retina.'
                      : resultSeverity.toLowerCase() === 'ringan'
                      ? 'Kontrol gula darah dan tekanan darah secara rutin. Pemeriksaan ulang dalam 9-12 bulan disarankan.'
                      : resultSeverity.toLowerCase() === 'sedang'
                      ? 'Konsultasi dengan dokter spesialis mata untuk evaluasi lebih lanjut. Pemeriksaan ulang dalam 6 bulan disarankan.'
                      : resultSeverity.toLowerCase() === 'berat'
                      ? 'Rujukan segera ke dokter spesialis mata untuk tindakan lebih lanjut. Pemeriksaan ulang dalam 2-3 bulan disarankan.'
                      : 'Rujukan segera ke dokter spesialis mata untuk evaluasi dan kemungkinan tindakan laser atau operasi.'
                  )}
                </p>
              </div>
              
              {/* Checklist of actions */}
              <div className="mt-4 pt-4 border-t border-blue-100">
                <p className="text-xs text-gray-500 mb-2 font-medium">Tindakan yang disarankan:</p>
                <div className="space-y-2">
                  {resultSeverity.toLowerCase() === 'tidak ada' || resultSeverity.toLowerCase() === 'normal' ? (
                    <>
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-700">Pemeriksaan rutin tahunan</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-700">Jaga pola makan sehat</span>
                      </div>
                    </>
                  ) : resultSeverity.toLowerCase() === 'ringan' ? (
                    <>
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-700">Kontrol gula darah secara rutin</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-700">Kontrol tekanan darah</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-700">Pemeriksaan ulang dalam 9-12 bulan</span>
                      </div>
                    </>
                  ) : resultSeverity.toLowerCase() === 'sedang' ? (
                    <>
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full bg-yellow-100 flex items-center justify-center mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-700">Konsultasi dengan dokter spesialis mata</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full bg-yellow-100 flex items-center justify-center mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-700">Kontrol ketat gula darah</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full bg-yellow-100 flex items-center justify-center mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-700">Pemeriksaan ulang dalam 6 bulan</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-700">Rujukan segera ke dokter spesialis mata</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-700">Evaluasi kemungkinan tindakan laser/operasi</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-700">Pemeriksaan ulang dalam 2-3 bulan</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
            
            {/* Follow-up reminder */}
            <motion.div 
              className="mt-4 flex items-center justify-between"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center text-sm text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 11-1.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>Jadwalkan pemeriksaan lanjutan</span>
              </div>
              
              <motion.button
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                Buat Janji
              </motion.button>
            </motion.div>
          </div>
          
        {/* Disclaimer with improved design */}
          <motion.div 
          className="mt-8 p-6 rounded-xl text-sm"
          style={{ 
            ...glassEffect, 
            background: 'linear-gradient(to right, rgba(243, 244, 246, 0.7), rgba(249, 250, 251, 0.7))',
            borderTop: '1px solid rgba(229, 231, 235, 0.5)',
            borderLeft: '1px solid rgba(229, 231, 235, 0.5)',
          }}
            variants={itemVariants}
            whileHover={{ boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
          >
            <div className="flex items-start">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-3 rounded-full mr-4 shadow-md">
                <FiAlertTriangle className="w-5 h-5 text-gray-500" />
              </div>
              <div>
              <motion.p 
                className="mb-2"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="font-bold text-gray-700">Disclaimer:</span> 
                <span className="text-gray-600"> Hasil analisis ini merupakan bantuan diagnostik berbasis AI dan tidak menggantikan diagnosis dari dokter. Selalu konsultasikan dengan tenaga medis profesional untuk diagnosis dan penanganan yang tepat.</span>
              </motion.p>
              <motion.p 
                className="text-gray-500"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Analisis dilakukan menggunakan gambar fundus retina dengan teknologi AI yang telah dilatih pada kasus retinopati diabetik.
              </motion.p>
              
              {/* Additional information */}
              <motion.div 
                className="mt-3 p-3 rounded-md bg-white/50 border border-gray-100"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center text-xs text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm1.5 8.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" clipRule="evenodd" />
                  </svg>
                  <span>Untuk informasi lebih lanjut tentang retinopati diabetik, kunjungi <a href="#" className="text-blue-500 hover:underline">www.retinascan.example.com/info</a></span>
                </div>
              </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
        
      {/* Footer with improved design */}
        <motion.div 
        className="p-8 text-center text-white relative overflow-hidden"
          variants={itemVariants}
        >
        {/* Animated background gradient */}
        <motion.div 
          className="absolute inset-0"
          animate={{
            background: [
              'linear-gradient(to right, #2563eb, #4f46e5, #7c3aed)',
              'linear-gradient(to right, #4f46e5, #7c3aed, #2563eb)',
              'linear-gradient(to right, #7c3aed, #2563eb, #4f46e5)',
              'linear-gradient(to right, #2563eb, #4f46e5, #7c3aed)'
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "loop" }}
        />
          
          {/* Background pattern */}
          <motion.div 
            className="absolute inset-0 opacity-10"
            initial={{ backgroundPositionX: '0%' }}
            animate={{ backgroundPositionX: '100%' }}
            transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
              backgroundSize: '30px 30px'
            }}
        />
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 4 + 2,
                height: Math.random() * 4 + 2,
                x: Math.random() * 100 + "%",
                y: Math.random() * 100 + "%",
                opacity: Math.random() * 0.5 + 0.1
              }}
              animate={{
                y: ["-10%", "110%"],
                opacity: [0, 0.7, 0]
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                delay: Math.random() * 5
              }}
            />
          ))}
        </div>
          
          {/* Content */}
          <div className="relative z-10">
            <motion.p 
            className="font-bold text-xl mb-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
            RetinaScan
            </motion.p>
            <motion.p 
            className="text-sm text-blue-100 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
            AI-Powered Retinopathy Detection &copy; {new Date().getFullYear()}
            </motion.p>
            <motion.div 
            className="flex justify-center gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.a 
              href="#" 
                className="text-white flex items-center justify-center gap-1 hover:underline bg-white/10 px-4 py-2 rounded-full"
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                whileTap={{ scale: 0.95 }}
              >
              <span>Website</span>
                <FiExternalLink size={14} />
              </motion.a>
            <motion.a 
              href="#" 
              className="text-white flex items-center justify-center gap-1 hover:underline bg-white/10 px-4 py-2 rounded-full"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Bantuan</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </motion.a>
          </motion.div>
          </div>
          
          {/* Decorative top wave */}
          <div className="absolute top-0 left-0 right-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" className="w-full h-12 rotate-180">
              <path fill="rgba(255, 255, 255, 0.9)" fillOpacity="1" d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,53.3C672,43,768,21,864,16C960,11,1056,21,1152,32C1248,43,1344,53,1392,58.7L1440,64L1440,100L1392,100C1344,100,1248,100,1152,100C1056,100,960,100,864,100C768,100,672,100,576,100C480,100,384,100,288,100C192,100,96,100,48,100L0,100Z"></path>
            </svg>
          </div>
      </motion.div>
    </div>
  );
}

export default Report;