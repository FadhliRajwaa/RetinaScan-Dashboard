import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiPrinter, FiExternalLink, FiCalendar, FiUser, FiInfo, FiAlertTriangle, FiCheck, FiShare2, FiFileText, FiEye, FiActivity, FiList, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
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
          transition={{ 
            type: 'spring', 
            stiffness: 300, 
            damping: 25,
            duration: 0.8 
          }}
          className="text-center p-10"
        >
          <motion.div 
            className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg"
            animate={{ 
              boxShadow: ["0 10px 15px -3px rgba(79, 70, 229, 0.3)", "0 15px 20px -3px rgba(79, 70, 229, 0.5)", "0 10px 15px -3px rgba(79, 70, 229, 0.3)"]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.05, 1]
              }}
              transition={{
                rotate: { 
                  duration: 20, 
                  ease: "linear", 
                  repeat: Infinity 
                },
                scale: {
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }
              }}
            >
              <FiFileText className="w-10 h-10 text-white" />
            </motion.div>
          </motion.div>
          <motion.p 
            className="text-gray-500 text-lg mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Belum ada data analisis tersedia
          </motion.p>
          <motion.p 
            className="text-gray-400 text-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Silakan unggah dan analisis gambar retina terlebih dahulu
          </motion.p>
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

  // Severity - Improved visualization
  const SeverityIndicator = ({ severity, size = 'medium' }) => {
    const level = severity.toLowerCase();
    
    // Size variants
    const sizes = {
      small: {
        outer: "w-6 h-6",
        inner: "w-4 h-4",
        icon: 14,
        pulse: "w-8 h-8"
      },
      medium: {
        outer: "w-10 h-10",
        inner: "w-7 h-7",
        icon: 20,
        pulse: "w-12 h-12"
      },
      large: {
        outer: "w-14 h-14",
        inner: "w-10 h-10",
        icon: 28,
        pulse: "w-16 h-16"
      }
    };
    
    const sizeConfig = sizes[size];
    
    // Get color and icon based on severity
    let bgColor, iconComponent, pulseColor;
    
    if (level === 'tidak ada' || level === 'normal') {
      bgColor = 'bg-gradient-to-br from-blue-400 to-blue-600';
      pulseColor = 'rgba(59, 130, 246, 0.5)';
      iconComponent = <FiCheck className="text-white" size={sizeConfig.icon} />;
    } else if (level === 'ringan') {
      bgColor = 'bg-gradient-to-br from-green-400 to-green-600';
      pulseColor = 'rgba(16, 185, 129, 0.5)';
      iconComponent = <FiInfo className="text-white" size={sizeConfig.icon} />;
    } else if (level === 'sedang') {
      bgColor = 'bg-gradient-to-br from-yellow-400 to-yellow-600';
      pulseColor = 'rgba(245, 158, 11, 0.5)';
      iconComponent = <FiAlertCircle className="text-white" size={sizeConfig.icon} />;
    } else {
      bgColor = 'bg-gradient-to-br from-red-400 to-red-600';
      pulseColor = 'rgba(239, 68, 68, 0.5)';
      iconComponent = <FiAlertTriangle className="text-white" size={sizeConfig.icon} />;
    }
    
    return (
      <motion.div className="relative flex items-center justify-center">
        {/* Pulse effect */}
        <motion.div
          className={`absolute rounded-full ${sizeConfig.pulse}`}
          style={{ backgroundColor: pulseColor }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 0.2, 0.7]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        {/* Outer circle with gradient */}
        <motion.div
          className={`${sizeConfig.outer} ${bgColor} rounded-full flex items-center justify-center shadow-lg z-10`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: [
              '0 4px 6px rgba(0, 0, 0, 0.1)',
              '0 6px 10px rgba(0, 0, 0, 0.15)',
              '0 4px 6px rgba(0, 0, 0, 0.1)'
            ]
          }}
          transition={{
            boxShadow: {
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }
          }}
        >
          {/* Inner content */}
          <motion.div
            className={`${sizeConfig.inner} rounded-full flex items-center justify-center`}
            animate={{ rotate: [0, 5, 0, -5, 0] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut"
            }}
          >
            {iconComponent}
          </motion.div>
        </motion.div>
      </motion.div>
    );
  };

  // Confidence Bar - Enhanced visualization
  const ConfidenceBar = ({ value, color, showLabels = true, height = 'medium', animate = true }) => {
    // Convert value to percentage if needed
    const percentage = value > 1 ? value : value * 100;
    
    // Height variants
    const heights = {
      small: "h-2",
      medium: "h-3",
      large: "h-4",
      xlarge: "h-6"
    };
    
    const barHeight = heights[height];
    
    // Determine color gradient based on value
    const getBarGradient = () => {
      if (color) return color;
      
      if (percentage < 30) {
        return 'linear-gradient(90deg, #f87171 0%, #ef4444 100%)';
      } else if (percentage < 70) {
        return 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)';
      } else {
        return 'linear-gradient(90deg, #34d399 0%, #10b981 100%)';
      }
    };
    
    return (
      <div className="w-full">
        {/* Bar container with glass effect */}
        <div className={`w-full ${barHeight} rounded-full overflow-hidden shadow-inner relative`} 
          style={{
            background: 'rgba(229, 231, 235, 0.5)',
            backdropFilter: 'blur(4px)',
            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
        >
          {/* Animated fill */}
          <motion.div 
            className={`${barHeight} rounded-full relative overflow-hidden`}
            style={{ 
              background: getBarGradient(),
              width: animate ? '0%' : `${percentage}%`,
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            animate={animate ? { width: `${percentage}%` } : {}}
            transition={{
              type: "spring",
              stiffness: 50,
              damping: 15,
              delay: 0.3
            }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 w-full h-full"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              }}
              animate={{ x: ['0%', '100%', '0%'] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
          
          {/* Value indicator dot */}
          <motion.div
            className="absolute top-1/2 transform -translate-y-1/2 rounded-full bg-white shadow-md border-2"
            style={{
              width: parseInt(barHeight) + 6 + 'px',
              height: parseInt(barHeight) + 6 + 'px',
              left: `calc(${percentage}% - ${(parseInt(barHeight) + 6) / 2}px)`,
              borderColor: percentage > 50 ? '#10b981' : percentage > 30 ? '#f59e0b' : '#ef4444',
              opacity: 0
            }}
            animate={animate ? { 
              opacity: [0, 1],
              scale: [0.5, 1.2, 1]
            } : { opacity: 1 }}
            transition={{
              delay: 0.8,
              duration: 0.5
            }}
          />
        </div>
        
        {/* Labels */}
        {showLabels && (
          <div className="flex justify-between mt-1">
            <motion.div 
              className="text-xs text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              0%
            </motion.div>
            <motion.div 
              className="text-xs text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
            >
              50%
            </motion.div>
            <motion.div 
              className="text-xs text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              100%
            </motion.div>
          </div>
        )}
        
        {/* Value display */}
        <motion.div 
          className="text-right text-xs font-medium mt-1"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <span className={`font-bold ${
            percentage > 70 ? 'text-green-600' : 
            percentage > 30 ? 'text-yellow-600' : 
            'text-red-600'
          }`}>
            {percentage.toFixed(1)}%
          </span>
          <span className="text-gray-500 ml-1">kepercayaan</span>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        className="flex justify-between items-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 200, 
          damping: 20,
          duration: 0.6 
        }}
      >
        <motion.h3 
          className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 20,
            delay: 0.1 
          }}
        >
          Hasil Analisis Retina
        </motion.h3>
        <motion.div 
          className="flex gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 20,
            delay: 0.2 
          }}
        >
          <motion.button
            whileHover={{ 
              scale: 1.05, 
              boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.4), 0 4px 6px -2px rgba(59, 130, 246, 0.3)',
              background: 'linear-gradient(to right, #3b82f6, #4f46e5, #6366f1)',
              y: -2
            }}
            whileTap={{ scale: 0.95, y: 0 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 15,
              delay: 0.3 
            }}
            onClick={handleDownload}
            disabled={isLoading}
            className={`flex items-center gap-2 px-5 py-2.5 text-white rounded-xl transition-all text-sm font-medium shadow-md ${
              isLoading 
                ? 'bg-gradient-to-r from-blue-500/80 to-indigo-500/80 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
            }`}
          >
            <motion.div
              animate={isLoading ? { 
                rotate: 360,
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7]
              } : { rotate: 0 }}
              transition={isLoading ? { 
                rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
                scale: { duration: 1, repeat: Infinity, repeatType: "reverse" },
                opacity: { duration: 1, repeat: Infinity, repeatType: "reverse" }
              } : {}}
              className={`${isLoading ? 'mr-1' : ''}`}
            >
              <FiDownload className={`text-blue-100 ${isLoading ? 'animate-pulse' : ''}`} />
            </motion.div>
            <motion.span
              animate={isLoading ? { opacity: [0.7, 1, 0.7] } : {}}
              transition={isLoading ? { duration: 1, repeat: Infinity, repeatType: "reverse" } : {}}
            >
              {isLoading ? 'Memproses...' : 'Unduh PDF'}
            </motion.span>
            {!isLoading && (
              <motion.div 
                className="ml-1 w-1.5 h-1.5 rounded-full bg-blue-200"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
            )}
          </motion.button>
          <motion.button
            whileHover={{ 
              scale: 1.05, 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              y: -2
            }}
            whileTap={{ scale: 0.95, y: 0 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 15,
              delay: 0.4 
            }}
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium shadow-md"
            style={glassEffect}
          >
            <motion.div
              whileHover={{ 
                rotate: [0, -10, 0],
                transition: { duration: 0.5 }
              }}
            >
              <FiPrinter className="text-gray-600" />
            </motion.div>
            <span>Cetak</span>
            <motion.div 
              className="ml-1 w-1.5 h-1.5 rounded-full bg-gray-400"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
          </motion.button>
          <motion.button
            whileHover={{ 
              scale: 1.05, 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              y: -2
            }}
            whileTap={{ scale: 0.95, y: 0 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 15,
              delay: 0.5 
            }}
            className="flex items-center justify-center w-10 h-10 rounded-full relative"
            style={glassEffect}
            onClick={handleShare}
            disabled={isShareLoading}
          >
            {isShareLoading ? (
              <motion.div 
                className="w-5 h-5 border-t-2 border-b-2 border-gray-600 rounded-full"
                animate={{ 
                  rotate: 360,
                  borderColor: ['#4b5563', '#6b7280', '#4b5563']
                }}
                transition={{ 
                  rotate: { duration: 1, repeat: Infinity, ease: "linear" },
                  borderColor: { duration: 2, repeat: Infinity, repeatType: "reverse" }
                }}
              ></motion.div>
            ) : shareSuccess ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ 
                  scale: [0, 1.2, 1],
                  rotate: [0, 20, 0]
                }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 15
                }}
              >
                <FiCheck className="text-green-600" />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-green-400"
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 1 }}
                />
              </motion.div>
            ) : (
              <motion.div
                whileHover={{ 
                  rotate: [0, -10, 10, -5, 5, 0],
                  transition: { duration: 0.8 }
                }}
              >
                <FiShare2 className="text-gray-600" />
                <motion.div 
                  className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-gray-400"
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
              </motion.div>
            )}
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Tambahkan indikator mode simulasi */}
      {result && (result.isSimulation || result.simulation_mode || 
        (result.raw_prediction && result.raw_prediction.is_simulation)) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            type: 'spring', 
            stiffness: 500, 
            damping: 30,
            duration: 0.6 
          }}
          className="mb-6 text-sm flex items-start rounded-xl overflow-hidden"
          style={{ ...glassEffect, background: 'rgba(254, 240, 199, 0.7)' }}
        >
          <motion.div 
            className="bg-amber-500 h-full w-2"
            animate={{ 
              backgroundColor: ['#f59e0b', '#fbbf24', '#f59e0b'],
              height: ['100%', '102%', '100%'] 
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              repeatType: "reverse" 
            }}
          ></motion.div>
          <div className="p-5">
            <div className="flex items-start">
              <motion.div
                animate={{ 
                  rotate: [0, 5, 0, -5, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  repeatType: "reverse" 
                }}
              >
                <FiAlertTriangle className="w-6 h-6 mr-3 flex-shrink-0 text-amber-600" />
              </motion.div>
              <div>
                <motion.p 
                  className="font-bold mb-2 text-base text-amber-800"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  PERHATIAN: Laporan dalam Mode Simulasi
                </motion.p>
                <motion.p 
                  className="mb-2 text-amber-700"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  Hasil analisis ini menggunakan <span className="font-bold underline">data simulasi</span> karena layanan AI tidak tersedia saat ini.
                </motion.p>
                <motion.p 
                  className="text-amber-800 font-bold"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  Hasil ini TIDAK BOLEH digunakan untuk diagnosis klinis. Silakan konsultasikan dengan dokter mata untuk evaluasi yang akurat.
                </motion.p>
              </div>
            </div>
            <motion.div 
              className="mt-3 p-3 rounded-md border border-amber-200"
              style={{ background: 'rgba(254, 243, 199, 0.7)' }}
              initial={{ opacity: 0.8, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ 
                opacity: 1, 
                scale: 1.01,
                boxShadow: '0 4px 12px rgba(251, 191, 36, 0.2)'
              }}
              transition={{ 
                type: 'spring',
                stiffness: 300,
                damping: 20
              }}
            >
              <p className="text-xs font-semibold text-amber-700">Untuk menggunakan model AI sebenarnya, jalankan script pengujian koneksi:</p>
              <motion.code 
                className="text-xs bg-white/70 p-2 rounded mt-1 block text-amber-800 font-mono"
                whileHover={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  scale: 1.02
                }}
              >
                npm run test:flask
              </motion.code>
            </motion.div>
          </div>
        </motion.div>
      )}

      <motion.div
        ref={reportRef}
        className="rounded-xl overflow-hidden shadow-xl pdf-container"
        style={{ ...glassEffect, background: 'rgba(255, 255, 255, 0.9)' }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        transition={{
          duration: 0.6,
          when: "beforeChildren",
          staggerChildren: 0.1
        }}
      >
        {/* Header */}
        <div className="relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
          
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
          ></motion.div>
          
          {/* Content */}
          <div className="relative p-8 text-white z-10">
            <div className="flex justify-between items-start">
              <div>
                <motion.h2 
                  className="text-3xl font-bold mb-2"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: 0.2 
                  }}
                >
                  Laporan Analisis Retina
                </motion.h2>
                <motion.div 
                  className="flex items-center text-blue-100"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ 
                    delay: 0.3,
                    duration: 0.5
                  }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 500,
                      damping: 15,
                      delay: 0.4
                    }}
                  >
                    <FiCalendar className="mr-2" />
                  </motion.div>
                  <motion.span 
                    className="text-sm"
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                  >
                    {formatDate(new Date())}
                  </motion.span>
                </motion.div>
              </div>
              <motion.div 
                className="text-right"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  delay: 0.4 
                }}
              >
                <motion.div 
                  className="text-lg font-semibold text-white"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                >
                  RetinaScan AI
                </motion.div>
                <motion.div 
                  className="text-sm text-blue-100"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.3 }}
                >
                  Deteksi Retinopati Diabetik
                </motion.div>
                {/* Tambahkan label simulasi jika dalam mode simulasi */}
                {result && (result.isSimulation || result.simulation_mode || 
                  (result.raw_prediction && result.raw_prediction.is_simulation)) && (
                  <motion.div 
                    className="mt-2"
                    animate={{ 
                      opacity: [0.7, 1, 0.7],
                      scale: [1, 1.02, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    <motion.span 
                      className="bg-amber-600 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-md"
                      whileHover={{ 
                        scale: 1.05,
                        boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)'
                      }}
                    >
                      SIMULASI - BUKAN HASIL SEBENARNYA
                    </motion.span>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
          
          {/* Decorative bottom wave */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" className="w-full h-12">
              <path fill="rgba(255, 255, 255, 0.9)" fillOpacity="1" d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,53.3C672,43,768,21,864,16C960,11,1056,21,1152,32C1248,43,1344,53,1392,58.7L1440,64L1440,100L1392,100C1344,100,1248,100,1152,100C1056,100,960,100,864,100C768,100,672,100,576,100C480,100,384,100,288,100C192,100,96,100,48,100L0,100Z"></path>
            </svg>
          </div>
        </div>

        {/* Patient Information */}
        {patient && (
          <motion.div 
            className="p-6 border-b bg-blue-50"
            variants={itemVariants}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20
            }}
          >
            <motion.h3 
              className="font-semibold mb-4 text-gray-700 flex items-center text-lg"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: 0.1 
              }}
            >
              <motion.div 
                className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-3 shadow-md"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 15,
                  delay: 0.2
                }}
                whileHover={{ 
                  scale: 1.1,
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}
              >
                <FiUser className="text-white" />
              </motion.div>
              <motion.span 
                className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Informasi Pasien
              </motion.span>
            </motion.h3>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-xl"
              style={glassEffect}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
                delay: 0.2
              }}
              whileHover={{ 
                boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                y: -2
              }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="p-4 rounded-lg bg-white/50"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                whileHover={{ y: -2, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
              >
                <p className="text-sm text-blue-500 font-medium mb-1">Nama Lengkap</p>
                <p className="font-semibold text-gray-800 text-lg">{patientName}</p>
              </motion.div>
              <motion.div 
                className="p-4 rounded-lg bg-white/50"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                whileHover={{ y: -2, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
              >
                <p className="text-sm text-blue-500 font-medium mb-1">Jenis Kelamin / Umur</p>
                <p className="font-semibold text-gray-800 text-lg">
                  {patientGender}, {patientAge} tahun
                </p>
              </motion.div>
              {patient.dateOfBirth && (
                <motion.div 
                  className="p-4 rounded-lg bg-white/50"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  whileHover={{ y: -2, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                >
                  <p className="text-sm text-blue-500 font-medium mb-1">Tanggal Lahir</p>
                  <p className="font-semibold text-gray-800 text-lg">{new Date(patient.dateOfBirth).toLocaleDateString('id-ID')}</p>
                </motion.div>
              )}
              {patient.bloodType && (
                <motion.div 
                  className="p-4 rounded-lg bg-white/50"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  whileHover={{ y: -2, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                >
                  <p className="text-sm text-blue-500 font-medium mb-1">Golongan Darah</p>
                  <p className="font-semibold text-gray-800 text-lg">{patient.bloodType}</p>
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
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20
              }}
            >
              <motion.h3 
                className="font-semibold mb-4 text-gray-700 text-lg flex items-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  delay: 0.1 
                }}
              >
                <motion.div 
                  className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center mr-3 shadow-md"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 15,
                    delay: 0.2
                  }}
                  whileHover={{ 
                    scale: 1.1,
                    boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)'
                  }}
                >
                  <FiEye className="text-white" />
                </motion.div>
                <motion.span 
                  className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  Citra Retina
                </motion.span>
              </motion.h3>
              
              <motion.div 
                className="p-6 mb-6 rounded-xl shadow-md relative overflow-hidden"
                style={{ ...glassEffect }}
                variants={itemVariants}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                  delay: 0.3
                }}
                whileHover={{ 
                  y: -3, 
                  boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }
                }}
              >
                <ImageViewer />
              </motion.div>
            </motion.div>
            
            {/* Right Column - Analysis Results */}
            <motion.div 
              className="flex flex-col h-full"
              variants={itemVariants}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20
              }}
            >
              <motion.h3 
                className="font-semibold mb-4 text-gray-700 text-lg flex items-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  delay: 0.1 
                }}
              >
                <motion.div 
                  className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center mr-3 shadow-md"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 15,
                    delay: 0.2
                  }}
                  whileHover={{ 
                    scale: 1.1,
                    boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)'
                  }}
                >
                  <FiActivity className="text-white" />
                </motion.div>
                <motion.span 
                  className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  Hasil Analisis
                </motion.span>
              </motion.h3>
              
              {/* Severity - Enhanced version */}
              <motion.div 
                className={`p-6 rounded-xl mb-6 shadow-md overflow-hidden relative`}
                style={{ ...glassEffect }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                  delay: 0.3
                }}
                whileHover={{ 
                  y: -3, 
                  boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }
                }}
              >
                <motion.div 
                  className="absolute inset-0 opacity-10"
                  style={{
                    background: getSeverityGradient(resultSeverity),
                    zIndex: -1
                  }}
                  animate={{
                    opacity: [0.1, 0.15, 0.1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                ></motion.div>
                
                {/* New severity display with enhanced visualization */}
                <div className="flex items-center">
                  <SeverityIndicator severity={resultSeverity} size="medium" />
                  
                  <div className="ml-4">
                    <motion.p 
                      className="text-sm text-gray-700 mb-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                    >
                      Tingkat Keparahan
                    </motion.p>
                    <motion.div 
                      className="flex items-center"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                    >
                      <motion.p 
                        className={`text-2xl font-bold ${getSeverityColor(resultSeverity)}`}
                        animate={{ scale: [1, 1.03, 1] }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                      >
                        {resultSeverity}
                      </motion.p>
                      
                      {/* Severity badge */}
                      <motion.div 
                        className={`ml-3 px-2 py-1 rounded-md text-xs font-semibold ${
                          resultSeverity.toLowerCase() === 'ringan' ? 'bg-green-100 text-green-800' :
                          resultSeverity.toLowerCase() === 'sedang' ? 'bg-yellow-100 text-yellow-800' :
                          resultSeverity.toLowerCase() === 'berat' || resultSeverity.toLowerCase() === 'sangat berat' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 15,
                          delay: 0.7
                        }}
                        whileHover={{ scale: 1.05 }}
                      >
                        {resultSeverity.toLowerCase() === 'ringan' ? 'MILD' :
                         resultSeverity.toLowerCase() === 'sedang' ? 'MODERATE' :
                         resultSeverity.toLowerCase() === 'berat' || resultSeverity.toLowerCase() === 'sangat berat' ? 'SEVERE' :
                         'NORMAL'}
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
                
                {/* Severity scale visualization */}
                <motion.div 
                  className="mt-4 pt-2 border-t border-gray-100"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full bg-blue-500 ${resultSeverity.toLowerCase() === 'tidak ada' || resultSeverity.toLowerCase() === 'normal' ? 'ring-2 ring-blue-300 ring-offset-2' : ''}`}></div>
                      <span className="text-xs mt-1 text-gray-600">Normal</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full bg-green-500 ${resultSeverity.toLowerCase() === 'ringan' ? 'ring-2 ring-green-300 ring-offset-2' : ''}`}></div>
                      <span className="text-xs mt-1 text-gray-600">Ringan</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full bg-yellow-500 ${resultSeverity.toLowerCase() === 'sedang' ? 'ring-2 ring-yellow-300 ring-offset-2' : ''}`}></div>
                      <span className="text-xs mt-1 text-gray-600">Sedang</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full bg-red-500 ${resultSeverity.toLowerCase() === 'berat' || resultSeverity.toLowerCase() === 'sangat berat' ? 'ring-2 ring-red-300 ring-offset-2' : ''}`}></div>
                      <span className="text-xs mt-1 text-gray-600">Berat</span>
                    </div>
                  </div>
                  
                  {/* Severity progress bar */}
                  <div className="mt-2 h-1.5 bg-gradient-to-r from-blue-500 via-green-500 via-yellow-500 to-red-500 rounded-full"></div>
                  
                  {/* Severity marker */}
                  <motion.div 
                    className="relative h-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    <motion.div
                      className="absolute -top-3 transform -translate-x-1/2"
                      style={{ 
                        left: resultSeverity.toLowerCase() === 'tidak ada' || resultSeverity.toLowerCase() === 'normal' ? '12.5%' :
                              resultSeverity.toLowerCase() === 'ringan' ? '37.5%' :
                              resultSeverity.toLowerCase() === 'sedang' ? '62.5%' :
                              '87.5%'
                      }}
                      animate={{ y: [0, -3, 0] }}
                      transition={{ 
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    >
                      <div className="w-3 h-3 bg-white border-2 border-gray-400 rounded-full"></div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>
              
              {/* Confidence - Enhanced version */}
              <motion.div 
                className="mb-6 p-5 rounded-xl shadow-md"
                style={{ ...glassEffect }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                  delay: 0.3
                }}
                whileHover={{ 
                  y: -3, 
                  boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }
                }}
              >
                <motion.p 
                  className="text-sm text-gray-700 mb-1"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  Tingkat Kepercayaan
                </motion.p>
                <motion.div 
                  className="flex items-center mb-3"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <motion.p 
                    className="text-2xl font-bold text-indigo-700 mr-3"
                    animate={{ 
                      scale: [1, 1.03, 1],
                      color: [
                        'rgb(79, 70, 229)', // indigo-600
                        'rgb(99, 102, 241)', // indigo-500
                        'rgb(79, 70, 229)'  // indigo-600
                      ]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    {Math.round(resultConfidence * 100)}%
                  </motion.p>
                  
                  {/* Confidence level badge */}
                  <motion.div 
                    className={`px-2 py-1 rounded-md text-xs font-semibold ${
                      resultConfidence > 0.7 ? 'bg-green-100 text-green-800' :
                      resultConfidence > 0.4 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 15,
                      delay: 0.6
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {resultConfidence > 0.7 ? 'TINGGI' :
                     resultConfidence > 0.4 ? 'SEDANG' :
                     'RENDAH'}
                  </motion.div>
                </motion.div>
                
                {/* Enhanced confidence bar */}
                <ConfidenceBar 
                  value={resultConfidence} 
                  color={getSeverityGradient(resultSeverity)}
                  height="large"
                />
              </motion.div>
              
              {/* Recommendation */}
              <motion.div 
                className="p-6 rounded-xl mt-auto shadow-md relative overflow-hidden"
                style={{ ...glassEffect }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                  delay: 0.3
                }}
                whileHover={{ 
                  y: -3, 
                  boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }
                }}
              >
                <motion.div 
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ background: getSeverityGradient(resultSeverity) }}
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                ></motion.div>
                <motion.h4 
                  className="font-semibold mb-4 text-gray-700 flex items-center"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <motion.div 
                    className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center mr-2 shadow-md"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 15,
                      delay: 0.5
                    }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <FiCheckCircle className="text-white text-sm" />
                  </motion.div>
                  <span>Rekomendasi</span>
                </motion.h4>
                <motion.p 
                  className="text-gray-700"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  {resultNotes || 'Tidak ada catatan atau rekomendasi tersedia.'}
                </motion.p>
              </motion.div>
            </motion.div>
          </div>
          
          {/* Disclaimer */}
          <motion.div 
            className="mt-8 p-5 rounded-xl text-sm text-gray-500"
            style={{ ...glassEffect }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              delay: 0.3
            }}
            whileHover={{ boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
          >
            <div className="flex items-start">
              <div className="bg-gray-100 p-2 rounded-full mr-3">
                <FiAlertTriangle className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="mb-1"><span className="font-bold text-gray-700">Disclaimer:</span> Hasil analisis ini merupakan bantuan diagnostik berbasis AI dan tidak menggantikan diagnosis dari dokter. Selalu konsultasikan dengan tenaga medis profesional untuk diagnosis dan penanganan yang tepat.</p>
                <p>Analisis dilakukan menggunakan gambar fundus retina dengan teknologi AI yang telah dilatih pada kasus retinopati diabetik.</p>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Footer */}
        <motion.div 
          className="p-6 text-center text-white relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
            delay: 0.3
          }}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
          
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
          ></motion.div>
          
          {/* Content */}
          <div className="relative z-10">
            <motion.p 
              className="font-semibold text-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              RetinaScan &copy; {new Date().getFullYear()}
            </motion.p>
            <motion.p 
              className="text-sm text-blue-100 mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              AI-Powered Retinopathy Detection
            </motion.p>
            <motion.div 
              className="mt-3 flex justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.a 
                href="https://retinascan.example.com" 
                className="text-white flex items-center justify-center gap-1 hover:underline bg-white/10 px-4 py-2 rounded-full"
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                whileTap={{ scale: 0.95 }}
              >
                <span>www.retinascan.example.com</span>
                <FiExternalLink size={14} />
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
      </motion.div>
    </div>
  );
}

export default Report;