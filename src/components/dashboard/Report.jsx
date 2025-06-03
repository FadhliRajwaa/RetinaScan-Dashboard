import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiPrinter, FiExternalLink, FiCalendar, FiUser, FiInfo, FiAlertTriangle, FiCheck, FiShare2, FiFileText, FiEye, FiActivity, FiMinus, FiPlus, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
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

  // State untuk loading gambar, zoom dan drag control
  const [imageLoading, setImageLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Fungsi untuk zoom control
  const handleZoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.2, 3));
  };
  
  const handleZoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.5));
  };
  
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };
  
  // Fungsi untuk drag control
  const handleDragStart = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
  };
  
  const handleDrag = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
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
  const ImageViewer = () => {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [showAnnotation, setShowAnnotation] = useState(false);
    const constraintsRef = useRef(null);
    
    const handleZoomIn = () => {
      setScale(prevScale => Math.min(prevScale + 0.25, 3));
    };
    
    const handleZoomOut = () => {
      setScale(prevScale => Math.max(prevScale - 0.25, 0.5));
    };
    
    const handleReset = () => {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    };
    
    const handleDragStart = () => {
      setIsDragging(true);
    };
    
    const handleDragEnd = () => {
      setIsDragging(false);
    };
    
    return (
      <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden shadow-lg bg-gray-900/5">
        {/* Loading overlay with improved animation */}
      {!imageError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 bg-opacity-70 z-10">
            <div className="relative">
              <svg className="w-12 h-12 animate-spin text-blue-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-2 w-2 bg-white rounded-full animate-ping"></div>
              </div>
            </div>
            <p className="text-white text-sm mt-3 animate-pulse">Memuat gambar...</p>
        </div>
      )}
      
        {/* Image container with drag capability */}
        <div className="w-full h-full overflow-hidden" ref={constraintsRef}>
          <motion.div
            className="relative w-full h-full"
            style={{ cursor: scale > 1 ? 'grab' : 'default' }}
            drag={scale > 1}
            dragConstraints={constraintsRef}
            dragElastic={0.1}
            dragMomentum={false}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <motion.img
        src={getImageSource()}
        alt="Retina scan"
              className={`w-full h-full object-contain transition-all duration-300 ${isDragging ? 'brightness-90' : ''}`}
              style={{ 
                scale,
                x: position.x,
                y: position.y,
              }}
        onLoad={(e) => {
          // Hide loading overlay
                if (e.target.previousElementSibling) {
                  e.target.previousElementSibling.style.display = 'none';
          }
        }}
        onError={(e) => {
          handleImageError();
                if (e.target.previousElementSibling) {
                  e.target.previousElementSibling.style.display = 'none';
          }
          e.target.onerror = null;
          e.target.src = '/images/default-retina.jpg';
        }}
      />
      
            {/* Image annotations */}
            {showAnnotation && !imageError && (
              <motion.div
                className="absolute top-1/4 left-1/2 w-16 h-16 -ml-8 -mt-8 rounded-full border-2 border-blue-500 pointer-events-none"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="absolute inset-0 border-2 border-blue-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <div className="absolute -right-24 top-0 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  Area of interest
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
        
        {/* Error overlay with improved design */}
      {imageError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 bg-opacity-80 z-20">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="bg-gray-900/80 p-6 rounded-xl backdrop-blur-sm border border-red-500/30"
            >
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                    <FiAlertTriangle className="text-red-500 text-3xl" />
                  </div>
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-red-500"
                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <h3 className="text-white font-bold mt-4 text-center">Gambar tidak dapat ditampilkan</h3>
                <p className="text-gray-300 text-sm mt-2 text-center max-w-xs">
                  Terjadi kesalahan saat memuat gambar retina. Silakan coba lagi.
                </p>
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
                  className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-md hover:from-blue-600 hover:to-indigo-700 transition-colors flex items-center gap-2 group"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <path d="M2 12C2 6.47715 6.47715 2 12 2V5C8.13401 5 5 8.13401 5 12H2Z" fill="currentColor">
                        <animateTransform
                          attributeName="transform"
                          attributeType="XML"
                          type="rotate"
                          from="0 12 12"
                          to="360 12 12"
                          dur="1s"
                          repeatCount="indefinite"
                        />
                      </path>
                    </svg>
                  </motion.div>
            Coba Lagi
          </button>
              </div>
            </motion.div>
        </div>
      )}
        
        {/* Zoom controls */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-2 z-30">
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleZoomIn}
            className="w-8 h-8 rounded-full bg-white/80 shadow-md flex items-center justify-center backdrop-blur-sm"
            disabled={scale >= 3}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleZoomOut}
            className="w-8 h-8 rounded-full bg-white/80 shadow-md flex items-center justify-center backdrop-blur-sm"
            disabled={scale <= 0.5}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="w-8 h-8 rounded-full bg-white/80 shadow-md flex items-center justify-center backdrop-blur-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </motion.button>
        </div>
        
        {/* Annotation toggle */}
        <motion.button
          whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAnnotation(!showAnnotation)}
          className={`absolute bottom-3 left-3 w-8 h-8 rounded-full shadow-md flex items-center justify-center backdrop-blur-sm z-30 ${showAnnotation ? 'bg-blue-500' : 'bg-white/80'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${showAnnotation ? 'text-white' : 'text-indigo-600'}`} viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
        </motion.button>
        
        {/* Scale indicator */}
        <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm z-30">
          {Math.round(scale * 100)}%
        </div>
    </div>
  );
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="relative">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-800">
          Hasil Analisis Retina
        </h3>
          <motion.div 
            className="h-1 w-24 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full mt-2"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 96, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          />
          <motion.div
            className="text-sm text-gray-500 mt-2 flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <FiCalendar className="mr-1" size={14} />
            <span>{formatDate(new Date()).split(',')[0]}</span>
            <span className="mx-2">•</span>
            <FiEye className="mr-1" size={14} />
            <span>ID: {result?.id?.substring(0, 8) || 'New'}</span>
          </motion.div>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ 
              scale: 1.05, 
              boxShadow: '0 10px 25px -3px rgba(59, 130, 246, 0.4), 0 4px 6px -2px rgba(59, 130, 246, 0.3)',
              backgroundImage: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 50%, #2563eb 100%)'
            }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl transition-all text-sm font-medium shadow-lg relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-100 group-hover:opacity-0 transition-opacity duration-300"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <motion.div 
              className="absolute inset-0 bg-white opacity-0"
              animate={{ opacity: [0, 0.2, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
            />
            <FiDownload className="text-blue-100 relative z-10" />
            <span className="relative z-10">{isLoading ? 'Memproses...' : 'Unduh PDF'}</span>
          </motion.button>
          <motion.button
            whileHover={{ 
              scale: 1.05, 
              boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
              backgroundColor: 'rgba(255, 255, 255, 1)'
            }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium shadow-md relative overflow-hidden"
            style={{...glassEffect, background: 'rgba(255, 255, 255, 0.9)'}}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-100/30 to-indigo-100/30 opacity-0 hover:opacity-100 transition-opacity duration-300"
            />
            <FiPrinter className="text-indigo-600 relative z-10" />
            <span className="text-gray-700 relative z-10">Cetak</span>
          </motion.button>
          <motion.button
            whileHover={{ 
              scale: 1.05, 
              boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
              backgroundColor: 'rgba(255, 255, 255, 1)'
            }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center w-10 h-10 rounded-full relative overflow-hidden"
            style={{...glassEffect, background: 'rgba(255, 255, 255, 0.9)'}}
            onClick={handleShare}
            disabled={isShareLoading}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-100/30 to-indigo-100/30 opacity-0 hover:opacity-100 transition-opacity duration-300"
            />
            {isShareLoading ? (
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin relative z-10"></div>
            ) : shareSuccess ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <FiCheck className="text-green-600 relative z-10" />
              </motion.div>
            ) : (
              <FiShare2 className="text-indigo-600 relative z-10" />
            )}
          </motion.button>
        </div>
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
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm-6 60c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
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
            className="p-6 border-b"
            variants={itemVariants}
            style={{
              background: 'linear-gradient(to right, rgba(239, 246, 255, 0.8), rgba(224, 231, 255, 0.8))',
              borderBottom: '1px solid rgba(191, 219, 254, 0.5)'
            }}
          >
            <h3 className="font-semibold mb-5 text-gray-700 flex items-center text-lg">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mr-3 shadow-lg">
                <FiUser className="text-white" size={20} />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 text-xl">
                Informasi Pasien
              </span>
            </h3>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-xl"
              style={{...glassEffect, background: 'rgba(255, 255, 255, 0.7)'}}
              whileHover={{ boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', background: 'rgba(255, 255, 255, 0.8)' }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="p-4 rounded-lg bg-white/60 border border-blue-100 shadow-sm"
                whileHover={{ y: -3, backgroundColor: 'rgba(255, 255, 255, 0.9)', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.1), 0 4px 6px -2px rgba(59, 130, 246, 0.05)' }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-sm text-blue-500 font-medium mb-1 flex items-center">
                  <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                    <FiUser size={12} className="text-blue-500" />
                  </span>
                  Nama Lengkap
                </p>
                <p className="font-semibold text-gray-800 text-lg ml-8">{patientName}</p>
              </motion.div>
              <motion.div 
                className="p-4 rounded-lg bg-white/60 border border-blue-100 shadow-sm"
                whileHover={{ y: -3, backgroundColor: 'rgba(255, 255, 255, 0.9)', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.1), 0 4px 6px -2px rgba(59, 130, 246, 0.05)' }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-sm text-blue-500 font-medium mb-1 flex items-center">
                  <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </span>
                  Jenis Kelamin / Umur
                </p>
                <p className="font-semibold text-gray-800 text-lg ml-8">
                  {patientGender === 'male' ? 'Laki-laki' : patientGender === 'female' ? 'Perempuan' : patientGender}, {patientAge} tahun
                </p>
              </motion.div>
              {patient.dateOfBirth && (
                <motion.div 
                  className="p-4 rounded-lg bg-white/60 border border-blue-100 shadow-sm"
                  whileHover={{ y: -3, backgroundColor: 'rgba(255, 255, 255, 0.9)', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.1), 0 4px 6px -2px rgba(59, 130, 246, 0.05)' }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-sm text-blue-500 font-medium mb-1 flex items-center">
                    <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                      <FiCalendar size={12} className="text-blue-500" />
                    </span>
                    Tanggal Lahir
                  </p>
                  <p className="font-semibold text-gray-800 text-lg ml-8">{new Date(patient.dateOfBirth).toLocaleDateString('id-ID')}</p>
                </motion.div>
              )}
              {patient.bloodType && (
                <motion.div 
                  className="p-4 rounded-lg bg-white/60 border border-blue-100 shadow-sm"
                  whileHover={{ y: -3, backgroundColor: 'rgba(255, 255, 255, 0.9)', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.1), 0 4px 6px -2px rgba(59, 130, 246, 0.05)' }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-sm text-blue-500 font-medium mb-1 flex items-center">
                    <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.5 2a3.5 3.5 0 101.665 6.58L8.585 10l-1.42 1.42a3.5 3.5 0 101.414 1.414L10 11.414l1.42 1.42a3.5 3.5 0 101.414-1.414L11.414 10l1.42-1.42A3.5 3.5 0 1010.5 2 3.5 3.5 0 005.5 2zM7 5.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm1.5 8.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" clipRule="evenodd" />
                      </svg>
                    </span>
                    Golongan Darah
                  </p>
                  <p className="font-semibold text-gray-800 text-lg ml-8">{patient.bloodType}</p>
                </motion.div>
              )}
              {patientPhone && (
                <motion.div 
                  className="p-4 rounded-lg bg-white/60 border border-blue-100 shadow-sm"
                  whileHover={{ y: -3, backgroundColor: 'rgba(255, 255, 255, 0.9)', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.1), 0 4px 6px -2px rgba(59, 130, 246, 0.05)' }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-sm text-blue-500 font-medium mb-1 flex items-center">
                    <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </span>
                    Nomor Telepon
                  </p>
                  <p className="font-semibold text-gray-800 text-lg ml-8">{patientPhone}</p>
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
                
                {/* Image viewer component */}
                <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden">
                  {imageLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 bg-opacity-70 z-10">
                      <div className="relative">
                        <svg className="w-12 h-12 animate-spin text-blue-500" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-2 w-2 bg-white rounded-full animate-ping"></div>
                        </div>
                      </div>
                      <p className="text-white text-sm mt-3 animate-pulse">Memuat gambar...</p>
                    </div>
                  )}
                  
                  {imageError ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800">
                      <div className="rounded-full bg-red-100 p-3">
                        <FiAlertCircle className="text-red-500 w-8 h-8" />
                      </div>
                      <h3 className="text-white font-bold mt-4 text-center">Gambar tidak dapat ditampilkan</h3>
                      <p className="text-gray-300 text-sm mt-2 text-center max-w-xs">
                        Terjadi kesalahan saat memuat gambar retina. Silakan coba lagi.
                      </p>
                      <button 
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        onClick={() => {
                          setImageError(false);
                          setImageLoading(true);
                          // Force reload image with timestamp
                          setTimeout(() => setImageLoading(false), 1000);
                        }}
                      >
                        Coba Lagi
                      </button>
                    </div>
                  ) : (
                    <img 
                      src={getImageSource()} 
                      alt="Retina scan" 
                      className="w-full h-full object-contain"
                      style={{ 
                        transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                        cursor: isDragging ? 'grabbing' : 'grab',
                        transition: isDragging ? 'none' : 'transform 0.3s ease-out'
                      }}
                      onError={() => setImageError(true)}
                      onLoad={() => setImageLoading(false)}
                      onMouseDown={handleDragStart}
                      onMouseUp={handleDragEnd}
                      onMouseLeave={handleDragEnd}
                      onMouseMove={handleDrag}
                    />
                  )}
                  
                  {/* Image controls */}
                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
                    <button 
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
                      onClick={() => handleZoomOut()}
                    >
                      <FiMinus size={16} />
                    </button>
                    <button 
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
                      onClick={() => handleReset()}
                    >
                      <FiRefreshCw size={16} />
                    </button>
                    <button 
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
                      onClick={() => handleZoomIn()}
                    >
                      <FiPlus size={16} />
                    </button>
                  </div>
                </div>
                
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
                  <span className="text-xl font-bold text-purple-700">
                  Hasil Analisis Retina
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
                  
                <div className="flex flex-col md:flex-row items-start md:items-center">
                  {/* Severity indicator with animated rings */}
                  <div className="relative mb-4 md:mb-0">
                      <motion.div 
                        className="absolute inset-0 rounded-full"
                        animate={{
                        scale: [1, 1.3, 1],
                          opacity: [0.7, 0, 0.7]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                        style={{ background: getSeverityBgColor(resultSeverity) }}
                      />
                    <motion.div 
                      className="absolute inset-0 rounded-full"
                      animate={{
                        scale: [1, 1.15, 1],
                        opacity: [0.5, 0.2, 0.5]
                      }}
                      transition={{
                        duration: 1.5,
                        delay: 0.5,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                      style={{ background: getSeverityBgColor(resultSeverity) }}
                    />
                    <div className="p-5 rounded-full relative z-10" style={{ background: getSeverityBgColor(resultSeverity) }}>
                    {getSeverityIcon(resultSeverity)}
                  </div>
                    </div>
                  
                  {/* Severity details with animated scale */}
                  <div className="md:ml-6 flex-grow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-700 mb-1 font-medium">Tingkat Keparahan</p>
                      <motion.p 
                        className={`text-2xl font-bold ${getSeverityColor(resultSeverity)}`}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 10, delay: 0.2 }}
                      >
                      {resultSeverity}
                      </motion.p>
                  </div>
                      
                      {/* Severity scale indicator */}
                      <motion.div 
                        className="hidden md:block"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        <div className="flex items-center space-x-1">
                          {['Tidak ada', 'Ringan', 'Sedang', 'Berat', 'Proliferatif'].map((level, index) => {
                            const isActive = level.toLowerCase() === resultSeverity.toLowerCase();
                            const getColor = () => {
                              switch(index) {
                                case 0: return isActive ? 'bg-green-500' : 'bg-green-200';
                                case 1: return isActive ? 'bg-blue-500' : 'bg-blue-200';
                                case 2: return isActive ? 'bg-yellow-500' : 'bg-yellow-200';
                                case 3: return isActive ? 'bg-orange-500' : 'bg-orange-200';
                                case 4: return isActive ? 'bg-red-500' : 'bg-red-200';
                                default: return isActive ? 'bg-gray-500' : 'bg-gray-200';
                              }
                            };
                            return (
                              <motion.div 
                                key={level}
                                className={`h-6 w-4 rounded-sm ${getColor()}`}
                                whileHover={{ scale: 1.2 }}
                                animate={isActive ? { scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] } : {}}
                                transition={isActive ? { duration: 1.5, repeat: Infinity } : {}}
                              />
                            );
                          })}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex justify-between">
                          <span>Normal</span>
                          <span className="mr-1">Parah</span>
                        </div>
                      </motion.div>
                </div>
                  
                    {/* Severity description with enhanced styling */}
                  <motion.div 
                      className="mt-4 p-4 rounded-lg bg-white/60 border border-gray-100 shadow-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                      <div className="flex items-start">
                        <div className="mr-3 mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${getSeverityColor(resultSeverity)}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                      {resultSeverity.toLowerCase() === 'tidak ada' || resultSeverity.toLowerCase() === 'normal'
                            ? 'Tidak terdeteksi adanya tanda retinopati diabetik pada gambar retina. Tetap lakukan pemeriksaan rutin sesuai anjuran dokter.'
                        : resultSeverity.toLowerCase() === 'ringan'
                            ? 'Terdeteksi tanda-tanda ringan retinopati diabetik, seperti mikroaneurisma. Disarankan untuk konsultasi dengan dokter spesialis mata.'
                        : resultSeverity.toLowerCase() === 'sedang'
                            ? 'Terdeteksi tanda-tanda sedang retinopati diabetik, seperti perdarahan intraretinal atau cotton wool spots. Perlu evaluasi lebih lanjut oleh dokter spesialis mata.'
                        : resultSeverity.toLowerCase() === 'berat'
                            ? 'Terdeteksi tanda-tanda berat retinopati diabetik, memerlukan perhatian medis segera. Segera konsultasikan dengan dokter spesialis mata.'
                            : 'Terdeteksi tanda-tanda sangat berat retinopati diabetik, memerlukan intervensi medis segera. Harap segera konsultasikan dengan dokter spesialis mata.'}
                    </p>
                      </div>
                  </motion.div>
                  </div>
                </div>
              </motion.div>
              
              {/* Confidence with enhanced animated progress */}
              <motion.div 
                  className="mb-6 p-6 rounded-xl shadow-lg"
                  style={{ ...glassEffect, background: 'rgba(255, 255, 255, 0.7)' }}
                  whileHover={{ 
                    y: -5, 
                    boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
                    background: 'rgba(255, 255, 255, 0.8)'
                  }}
                  transition={{ duration: 0.3 }}
              >
                  <div className="flex justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mr-3 shadow-md">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700 font-medium">Tingkat Kepercayaan</p>
                      <p className="text-xs text-gray-500">Akurasi prediksi AI</p>
                    </div>
                  </div>
                  <motion.div 
                    className="text-xl font-bold text-indigo-600 flex items-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                  >
                    <motion.span
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 10, delay: 0.7 }}
                    >
                      {formatPercentage(resultConfidence)}
                    </motion.span>
                    <motion.svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 ml-1 text-indigo-500" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      transition={{ delay: 0.8, type: "spring" }}
                    >
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </motion.svg>
                  </motion.div>
                </div>
                
                {/* Ultra modern progress bar */}
                <div className="w-full h-8 bg-gray-100 rounded-xl overflow-hidden relative mt-4 shadow-inner">
                    {/* Background pattern with subtle grid */}
                    <div className="absolute inset-0 opacity-10" style={{
                      backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)',
                      backgroundSize: '10px 10px'
                    }}></div>
                    
                  {/* Ultra modern progress bar with animated fill */}
                  <motion.div 
                      className="h-full relative overflow-hidden rounded-xl"
                      style={{ width: '0%' }}
                      animate={{ 
                        width: typeof resultConfidence === 'string' 
                          ? (parseFloat(resultConfidence) > 1 
                              ? `${parseFloat(resultConfidence)}%` 
                              : `${parseFloat(resultConfidence) * 100}%`)
                          : (resultConfidence > 1 
                              ? `${resultConfidence}%` 
                              : `${resultConfidence * 100}%`)
                      }}
                      transition={{ 
                        duration: 2.2, 
                        ease: [0.22, 1.2, 0.36, 1],
                        delay: 0.3 
                      }}
                  >
                    {/* Modern gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                    
                    {/* Shine effect */}
                    <motion.div
                      className="absolute inset-0"
                      style={{
                          background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%)',
                          filter: 'blur(5px)',
                      }}
                      animate={{
                        x: ['-120%', '120%'],
                      }}
                      transition={{
                        duration: 2.5,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatType: "loop",
                        delay: 0.5
                      }}
                    />
                    
                    {/* Percentage display */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-white text-sm flex items-center">
                      {formatPercentage(resultConfidence)}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    
                    {/* Markers */}
                    {[1, 2, 3, 4].map((_, i) => (
                      <div
                        key={i}
                        className="absolute top-0 bottom-0 flex items-center justify-center"
                        style={{ left: `${(i + 1) * 20}%` }}
                      >
                        <div className="h-full w-0.5 bg-white/30"></div>
                      </div>
                    ))}
                  </motion.div>
                </div>
                
                {/* Progress labels */}
                <div className="flex justify-between px-1 mt-2 text-xs text-gray-500">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
                
                <div className="mt-4 p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                  <div className="flex items-start">
                    <div className="mr-2 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-xs text-indigo-700">
                      {resultConfidence > 0.95 || resultConfidence > 95
                        ? "Tingkat kepercayaan sangat tinggi, hasil prediksi sangat dapat diandalkan."
                        : resultConfidence > 0.85 || resultConfidence > 85
                        ? "Tingkat kepercayaan tinggi, hasil prediksi dapat diandalkan."
                        : resultConfidence > 0.7 || resultConfidence > 70
                        ? "Tingkat kepercayaan cukup baik, hasil prediksi dapat menjadi acuan awal."
                        : "Tingkat kepercayaan cukup rendah, disarankan untuk melakukan pemeriksaan ulang."}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between mt-2 text-xs font-medium">
                  <span className="text-gray-500">0%</span>
                  <span className="text-indigo-400">25%</span>
                  <span className="text-indigo-500">50%</span>
                  <span className="text-indigo-600">75%</span>
                  <span className="text-indigo-700">100%</span>
                </div>
                
                {/* Confidence description with enhanced styling */}
                <motion.div 
                  className="mt-4 p-3 rounded-lg bg-indigo-50 border border-indigo-100 text-sm text-indigo-700"
                    initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                  <div className="flex">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>
                      Tingkat kepercayaan menunjukkan seberapa yakin sistem AI dalam menentukan diagnosis. 
                      {resultConfidence < 0.7 && " Tingkat kepercayaan yang rendah mungkin mengindikasikan perlunya pemeriksaan lebih lanjut oleh dokter spesialis."}
                    </span>
                  </div>
              </motion.div>
              </motion.div>
              
              {/* Additional analysis metrics */}
              <motion.div 
                className="mb-6 p-6 rounded-xl shadow-lg"
                style={{ ...glassEffect, background: 'rgba(255, 255, 255, 0.7)' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                whileHover={{ 
                  y: -5, 
                  boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
                  background: 'rgba(255, 255, 255, 0.8)'
                }}
              >
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                  Detail Analisis
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Analysis date */}
                  <motion.div 
                    className="p-3 rounded-lg bg-white/60 border border-gray-100"
                    whileHover={{ y: -2, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                  >
                    <p className="text-xs text-gray-500 mb-1">Tanggal Analisis</p>
                    <p className="font-medium text-gray-800">{formatDate(resultDate)}</p>
            </motion.div>
                  
                  {/* Model version */}
                  <motion.div 
                    className="p-3 rounded-lg bg-white/60 border border-gray-100"
                    whileHover={{ y: -2, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                  >
                    <p className="text-xs text-gray-500 mb-1">Versi Model</p>
                    <p className="font-medium text-gray-800">{result?.modelVersion || 'RetinaScan v1.0'}</p>
                  </motion.div>
                  
                  {/* Processing time */}
                  <motion.div 
                    className="p-3 rounded-lg bg-white/60 border border-gray-100"
                    whileHover={{ y: -2, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                  >
                    <p className="text-xs text-gray-500 mb-1">Waktu Pemrosesan</p>
                    <p className="font-medium text-gray-800">{result?.processingTime || '1.2'} detik</p>
                  </motion.div>
                  
                  {/* Image quality */}
                  <motion.div 
                    className="p-3 rounded-lg bg-white/60 border border-gray-100"
                    whileHover={{ y: -2, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                  >
                    <p className="text-xs text-gray-500 mb-1">Kualitas Gambar</p>
                    <div className="flex items-center">
                      <p className="font-medium text-gray-800 mr-2">{result?.imageQuality || 'Baik'}</p>
                      {(result?.imageQuality || 'Baik') === 'Baik' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>
          </div>
              
              {/* Recommendation */}
              <motion.div 
          className="p-8 rounded-xl mt-8 shadow-lg relative overflow-hidden"
            style={{ ...glassEffect, background: 'rgba(255, 255, 255, 0.7)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
            whileHover={{ 
              y: -5, 
              boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
              background: 'rgba(255, 255, 255, 0.8)'
            }}
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
            
          <div className="flex flex-col md:flex-row items-start gap-6 relative z-10">
            {/* Left side - Icon and title */}
            <div className="flex flex-col items-center md:items-start">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg mb-3">
                <FiInfo className="text-white" size={28} />
              </div>
              <h4 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-2 text-center md:text-left">
                    Rekomendasi
                </h4>
              <div className="hidden md:block mt-4">
                <motion.div 
                  className="relative w-32 h-32"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {/* Circular progress indicator based on severity */}
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke="#e5e7eb" 
                      strokeWidth="8"
                    />
                    <motion.circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke={
                        resultSeverity.toLowerCase() === 'tidak ada' || resultSeverity.toLowerCase() === 'normal'
                          ? '#10b981' // green
                          : resultSeverity.toLowerCase() === 'ringan'
                          ? '#3b82f6' // blue
                          : resultSeverity.toLowerCase() === 'sedang'
                          ? '#f59e0b' // amber
                          : resultSeverity.toLowerCase() === 'berat'
                          ? '#ef4444' // red
                          : '#7c3aed' // purple
                      } 
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray="283"
                      strokeDashoffset={
                        resultSeverity.toLowerCase() === 'tidak ada' || resultSeverity.toLowerCase() === 'normal'
                          ? "225" // 20%
                          : resultSeverity.toLowerCase() === 'ringan'
                          ? "170" // 40%
                          : resultSeverity.toLowerCase() === 'sedang'
                          ? "113" // 60%
                          : resultSeverity.toLowerCase() === 'berat'
                          ? "56" // 80%
                          : "0" // 100%
                      }
                      initial={{ strokeDashoffset: "283" }}
                      animate={{ strokeDashoffset: 
                        resultSeverity.toLowerCase() === 'tidak ada' || resultSeverity.toLowerCase() === 'normal'
                          ? "225"
                          : resultSeverity.toLowerCase() === 'ringan'
                          ? "170"
                          : resultSeverity.toLowerCase() === 'sedang'
                          ? "113"
                          : resultSeverity.toLowerCase() === 'berat'
                          ? "56"
                          : "0"
                      }}
                      transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                    />
                    <text 
                      x="50" 
                      y="50" 
                      textAnchor="middle" 
                      dominantBaseline="middle" 
                      className="text-lg font-medium"
                      fill={
                        resultSeverity.toLowerCase() === 'tidak ada' || resultSeverity.toLowerCase() === 'normal'
                          ? '#10b981'
                          : resultSeverity.toLowerCase() === 'ringan'
                          ? '#3b82f6'
                          : resultSeverity.toLowerCase() === 'sedang'
                          ? '#f59e0b'
                          : resultSeverity.toLowerCase() === 'berat'
                          ? '#ef4444'
                          : '#7c3aed'
                      }
                    >
                      {resultSeverity.toLowerCase() === 'tidak ada' || resultSeverity.toLowerCase() === 'normal'
                        ? 'Tahunan'
                        : resultSeverity.toLowerCase() === 'ringan'
                        ? '9-12 bln'
                        : resultSeverity.toLowerCase() === 'sedang'
                        ? '6 bln'
                        : resultSeverity.toLowerCase() === 'berat'
                        ? '2-3 bln'
                        : 'Segera'}
                    </text>
                  </svg>
                  <div className="text-center text-xs text-gray-500 mt-2">Jadwal kontrol</div>
                </motion.div>
              </div>
            </div>
            
            {/* Right side - Recommendation content */}
            <div className="flex-1">
              {/* Main recommendation */}
            <motion.div 
                className="p-5 rounded-xl bg-white/70 border border-blue-100 shadow-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.1), 0 4px 6px -2px rgba(59, 130, 246, 0.05)' }}
              >
                <div className="flex items-start">
                  <div className="mr-4 mt-1 flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      resultSeverity.toLowerCase() === 'tidak ada' || resultSeverity.toLowerCase() === 'normal'
                        ? 'bg-green-100'
                        : resultSeverity.toLowerCase() === 'ringan'
                        ? 'bg-blue-100'
                        : resultSeverity.toLowerCase() === 'sedang'
                        ? 'bg-amber-100'
                        : resultSeverity.toLowerCase() === 'berat'
                        ? 'bg-red-100'
                        : 'bg-purple-100'
                    }`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${
                        resultSeverity.toLowerCase() === 'tidak ada' || resultSeverity.toLowerCase() === 'normal'
                          ? 'text-green-500'
                          : resultSeverity.toLowerCase() === 'ringan'
                          ? 'text-blue-500'
                          : resultSeverity.toLowerCase() === 'sedang'
                          ? 'text-amber-500'
                          : resultSeverity.toLowerCase() === 'berat'
                          ? 'text-red-500'
                          : 'text-purple-500'
                      }`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">Rekomendasi Medis</h5>
                    <p className={`text-base leading-relaxed ${
                      resultSeverity.toLowerCase() === 'tidak ada' || resultSeverity.toLowerCase() === 'normal'
                        ? 'text-green-700'
                        : resultSeverity.toLowerCase() === 'ringan'
                        ? 'text-blue-700'
                        : resultSeverity.toLowerCase() === 'sedang'
                        ? 'text-amber-700'
                        : resultSeverity.toLowerCase() === 'berat'
                        ? 'text-red-700'
                        : 'text-purple-700'
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
                </div>
              </motion.div>
            
              {/* Action steps */}
            <motion.div 
                className="mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
                <h5 className="font-medium text-gray-700 mb-3 ml-1">Langkah Selanjutnya:</h5>
                <div className="space-y-2">
                  {/* Step 1 */}
                  <motion.div 
                    className="flex items-center p-3 rounded-lg bg-white/50 border border-gray-100"
                    whileHover={{ y: -2, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-medium">1</span>
                    </div>
                    <span className="text-gray-700">
                      {resultSeverity.toLowerCase() === 'tidak ada' || resultSeverity.toLowerCase() === 'normal'
                        ? 'Jaga kadar gula darah dan tekanan darah dalam batas normal'
                        : 'Konsultasikan hasil pemeriksaan dengan dokter'}
                    </span>
              </motion.div>
                  
                  {/* Step 2 */}
                  <motion.div 
                    className="flex items-center p-3 rounded-lg bg-white/50 border border-gray-100"
                    whileHover={{ y: -2, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-medium">2</span>
                    </div>
                    <span className="text-gray-700">
                      {resultSeverity.toLowerCase() === 'tidak ada' || resultSeverity.toLowerCase() === 'normal'
                        ? 'Lakukan pemeriksaan mata rutin setiap tahun'
                        : resultSeverity.toLowerCase() === 'ringan'
                        ? 'Pantau kadar gula darah dan tekanan darah secara ketat'
                        : 'Ikuti petunjuk pengobatan dari dokter spesialis mata'}
                    </span>
            </motion.div>
                  
                  {/* Step 3 */}
                  <motion.div 
                    className="flex items-center p-3 rounded-lg bg-white/50 border border-gray-100"
                    whileHover={{ y: -2, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-medium">3</span>
          </div>
                    <span className="text-gray-700">
                      Jadwalkan pemeriksaan lanjutan sesuai rekomendasi
                      {resultSeverity.toLowerCase() !== 'tidak ada' && resultSeverity.toLowerCase() !== 'normal' && ' dokter'}
                    </span>
                  </motion.div>
                </div>
              </motion.div>
              
              {/* Schedule reminder */}
              <motion.div 
                className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-100 flex items-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h5 className="font-medium text-blue-800">Jadwal Kontrol Berikutnya</h5>
                  <p className="text-blue-600 text-sm">
                    {resultSeverity.toLowerCase() === 'tidak ada' || resultSeverity.toLowerCase() === 'normal'
                      ? `${formatDate(new Date(new Date().setFullYear(new Date().getFullYear() + 1)))}`
                      : resultSeverity.toLowerCase() === 'ringan'
                      ? `${formatDate(new Date(new Date().setMonth(new Date().getMonth() + 9)))}`
                      : resultSeverity.toLowerCase() === 'sedang'
                      ? `${formatDate(new Date(new Date().setMonth(new Date().getMonth() + 6)))}`
                      : resultSeverity.toLowerCase() === 'berat'
                      ? `${formatDate(new Date(new Date().setMonth(new Date().getMonth() + 2)))}`
                      : `${formatDate(new Date(new Date().setDate(new Date().getDate() + 14)))}`}
                  </p>
                </div>
                <motion.button 
                  className="ml-auto bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg flex items-center gap-1 transition-colors"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Tambah ke Kalender
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>
          
        {/* Disclaimer with improved design */}
          <motion.div 
          className="mt-12 mx-auto max-w-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <motion.div
            className="relative p-6 rounded-xl text-sm overflow-hidden"
          style={{ 
            ...glassEffect, 
              background: 'linear-gradient(to right, rgba(249, 250, 251, 0.8), rgba(243, 244, 246, 0.8))',
              borderTop: '1px solid rgba(255, 255, 255, 0.5)',
              borderLeft: '1px solid rgba(255, 255, 255, 0.5)',
            }}
            whileHover={{ 
              boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              y: -2
            }}
            transition={{ duration: 0.3 }}
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path fill="#6B7280" d="M39.9,-48.5C51.1,-40.5,59.4,-28.4,65.6,-13.8C71.8,0.8,76,17.9,71.1,32.6C66.3,47.4,52.6,59.8,37.4,64.2C22.2,68.5,5.5,64.8,-8.3,59.3C-22.2,53.8,-33.2,46.4,-42.8,36.5C-52.5,26.5,-60.8,13.3,-62.8,-1.9C-64.7,-17.2,-60.3,-34.3,-49.8,-42.4C-39.3,-50.4,-22.7,-49.3,-7.3,-51.1C8.1,-52.9,28.7,-56.6,39.9,-48.5Z" transform="translate(100 100)" />
              </svg>
            </div>
            
            {/* Content */}
            <div className="flex items-start relative z-10">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 shadow-md flex items-center justify-center">
                <FiAlertTriangle className="w-5 h-5 text-gray-500" />
              </div>
              </div>
              
              <div className="ml-4 flex-1">
                <div className="flex items-center mb-3">
                  <h5 className="font-bold text-gray-700 text-base">Disclaimer</h5>
                  <div className="ml-2 h-px flex-1 bg-gradient-to-r from-gray-300 to-transparent"></div>
                </div>
                
                <motion.div 
                  className="space-y-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="text-gray-600 leading-relaxed">
                    Hasil analisis ini merupakan bantuan diagnostik berbasis AI dan tidak menggantikan diagnosis dari dokter. Selalu konsultasikan dengan tenaga medis profesional untuk diagnosis dan penanganan yang tepat.
                  </p>
                  
                  <div className="flex items-start pt-2">
                    <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center mr-2 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-sm">
                Analisis dilakukan menggunakan gambar fundus retina dengan teknologi AI yang telah dilatih pada kasus retinopati diabetik.
                    </p>
                  </div>
                </motion.div>
              
                {/* Expandable information section */}
              <motion.div 
                  className="mt-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                >
                  <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                      <span className="text-sm text-blue-600">Sumber Daya</span>
                </div>
                    
                    <div className="flex space-x-2">
                      <a href="#" className="text-xs text-blue-500 hover:text-blue-700 hover:underline transition-colors flex items-center">
                        <span>Tentang Retinopati</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </a>
                      <span className="text-gray-300">|</span>
                      <a href="#" className="text-xs text-blue-500 hover:text-blue-700 hover:underline transition-colors flex items-center">
                        <span>FAQ</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </a>
              </div>
            </div>
          </motion.div>
        </div>
            </div>
          </motion.div>
        </motion.div>
        
      {/* Footer with improved design */}
        <motion.div 
          className="mt-12 relative overflow-hidden rounded-t-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          {/* Top wave decoration */}
          <div className="absolute top-0 left-0 right-0 z-10">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-16">
              <path fill="rgba(255, 255, 255, 0.9)" fillOpacity="1" d="M0,64L48,69.3C96,75,192,85,288,90.7C384,96,480,96,576,85.3C672,75,768,53,864,48C960,43,1056,53,1152,64C1248,75,1344,85,1392,90.7L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
            </svg>
          </div>
          
          {/* Main footer content */}
          <div className="pt-16 pb-10 px-8 text-center text-white relative">
        {/* Animated background gradient */}
        <motion.div 
              className="absolute inset-0 -z-10"
          animate={{
            background: [
                  'linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)',
                  'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #2563eb 100%)',
                  'linear-gradient(135deg, #7c3aed 0%, #2563eb 50%, #4f46e5 100%)',
                  'linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)'
                ]
              }}
              transition={{ duration: 15, repeat: Infinity, repeatType: "loop" }}
        />
          
          {/* Background pattern */}
          <motion.div 
              className="absolute inset-0 opacity-10 -z-10"
            initial={{ backgroundPositionX: '0%' }}
            animate={{ backgroundPositionX: '100%' }}
              transition={{ duration: 30, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
              backgroundSize: '30px 30px'
            }}
        />
        
        {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden -z-10">
              {[...Array(20)].map((_, i) => (
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
          
            {/* Logo and content */}
            <div className="relative z-10 max-w-xl mx-auto">
              {/* Logo */}
              <motion.div 
                className="mb-6"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
              >
                <div className="flex items-center justify-center mb-2">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-2xl">RetinaScan</h3>
                    <p className="text-xs text-blue-100 opacity-80">AI-Powered Retinopathy Detection</p>
                  </div>
                </div>
              </motion.div>
              
              {/* Links */}
            <motion.div 
                className="mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
            >
                <div className="flex flex-wrap justify-center gap-3">
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
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </motion.a>
                  <motion.a 
                    href="#" 
                    className="text-white flex items-center justify-center gap-1 hover:underline bg-white/10 px-4 py-2 rounded-full"
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>Kontak</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </motion.a>
          </div>
              </motion.div>
              
              {/* Social links */}
              <motion.div 
                className="flex justify-center gap-4 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <motion.a 
                  href="#" 
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
            </svg>
                </motion.a>
                <motion.a 
                  href="#" 
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
                  </svg>
                </motion.a>
                <motion.a 
                  href="#" 
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                  </svg>
                </motion.a>
              </motion.div>
              
              {/* Copyright */}
              <motion.div 
                className="text-xs text-blue-100/80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <p>&copy; {new Date().getFullYear()} RetinaScan. All rights reserved.</p>
                <p className="mt-1">Developed by team RetinaScan for better eye health.</p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Report;