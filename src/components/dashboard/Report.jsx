import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDownload, FiPrinter, FiExternalLink, FiCalendar, FiUser, FiInfo, FiAlertTriangle, FiCheck, FiShare2, FiFileText, FiEye, FiActivity, FiArrowRight, FiClock, FiHeart, FiShield } from 'react-icons/fi';
import jsPDF from 'jspdf';
import { getSeverityBgColor } from '../../utils/severityUtils';
import { 
  getGlassmorphismStyle, 
  prefersReducedMotion, 
  getAccessibleAnimationVariants 
} from '../../utils/compatibilityUtils';

// Glassmorphism style
const glassEffect = {
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  borderRadius: '16px',
};

// Modern color palette
const colors = {
  primary: {
    light: '#6366F1', // Indigo
    main: '#4F46E5',
    dark: '#4338CA',
  },
  secondary: {
    light: '#10B981', // Emerald
    main: '#059669',
    dark: '#047857',
  },
  accent: {
    light: '#F472B6', // Pink
    main: '#EC4899',
    dark: '#DB2777',
  },
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  severity: {
    normal: { bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD' },
    mild: { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' },
    moderate: { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
    severe: { bg: '#FEE2E2', text: '#991B1B', border: '#FECACA' },
  }
};

function Report({ result }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isShareLoading, setIsShareLoading] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const reportRef = useRef(null);

  // Periksa preferensi reduced motion saat komponen dimount
  useEffect(() => {
    setReducedMotion(prefersReducedMotion());
    
    // Tambahkan listener untuk perubahan preferensi
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => setReducedMotion(mediaQuery.matches);
    
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else if (typeof mediaQuery.addListener === 'function') {
      // Fallback untuk browser lama
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  // Terapkan glassmorphism style dengan fallback
  const adaptiveGlassEffect = getGlassmorphismStyle(glassEffect);

  // Enhanced animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: reducedMotion ? 0.05 : 0.12,
        delayChildren: reducedMotion ? 0.05 : 0.1,
        duration: reducedMotion ? 0.3 : 0.6
      }
    }
  };

  const itemVariants = {
    hidden: { y: reducedMotion ? 10 : 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: reducedMotion ? 'tween' : 'spring', 
        damping: reducedMotion ? 7 : 12,
        stiffness: reducedMotion ? 100 : 200,
        duration: reducedMotion ? 0.3 : undefined
      }
    }
  };

  const headerVariants = {
    hidden: { y: reducedMotion ? -20 : -50, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: {
        type: reducedMotion ? 'tween' : 'spring',
        damping: reducedMotion ? 10 : 20,
        stiffness: reducedMotion ? 150 : 300,
        duration: reducedMotion ? 0.3 : undefined
      }
    }
  };

  const buttonVariants = {
    hover: !reducedMotion ? { 
      scale: 1.05, 
      boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3), 0 4px 6px -2px rgba(79, 70, 229, 0.2)',
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10
      }
    } : {},
    tap: !reducedMotion ? { 
      scale: 0.95,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10
      }
    } : {}
  };

  if (!result) {
    return (
        <motion.div 
        className="flex flex-col items-center justify-center p-8 rounded-xl"
        style={adaptiveGlassEffect}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          type: 'spring', 
          stiffness: 300,
          damping: 20
        }}
      >
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            transition: {
              delay: 0.2,
              duration: 0.8,
              type: 'spring',
              stiffness: 200
            }
          }}
          className="text-center p-10 max-w-md"
        >
          <motion.div 
            className="w-24 h-24 mx-auto mb-8 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg"
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ 
              scale: 1, 
              rotate: 0,
              transition: {
                type: 'spring',
                stiffness: 260,
                damping: 20,
                delay: 0.3
              }
            }}
            whileHover={{
              scale: 1.05,
              rotate: 5,
              transition: { type: 'spring', stiffness: 300 }
            }}
          >
            <motion.div
              animate={{
                opacity: [0.7, 1, 0.7],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              <FiFileText className="w-12 h-12 text-white" />
        </motion.div>
          </motion.div>
          <motion.h2 
            className="text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              transition: { delay: 0.5, duration: 0.5 }
            }}
          >
            Belum Ada Data Analisis
          </motion.h2>
          <motion.p 
            className="text-gray-500 text-base mb-8"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              transition: { delay: 0.7, duration: 0.5 }
            }}
          >
            Silakan unggah dan analisis gambar retina terlebih dahulu untuk melihat hasil analisis lengkap
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              transition: {
                delay: 0.9,
                duration: 0.5
              }
            }}
          >
            <motion.button
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-md font-medium flex items-center justify-center gap-2 w-full"
              whileHover={{ 
                scale: 1.05, 
                boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.4)'
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/scan-retina'}
            >
              <FiEye className="text-indigo-100" />
              Mulai Analisis Baru
              <FiArrowRight className="ml-1" />
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
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
    if (level === 'ringan' || level === 'mild') return colors.severity.mild.text;
    if (level === 'sedang' || level === 'moderate') return colors.severity.moderate.text;
    if (level === 'berat' || level === 'severe' || level === 'sangat berat') return colors.severity.severe.text;
    return colors.severity.normal.text;
  };

  // Get severity card color
  const getSeverityCardColor = (severity) => {
    const level = severity.toLowerCase();
    if (level === 'ringan' || level === 'mild') return colors.severity.mild;
    if (level === 'sedang' || level === 'moderate') return colors.severity.moderate;
    if (level === 'berat' || level === 'severe' || level === 'sangat berat') return colors.severity.severe;
    return colors.severity.normal;
  };

  // Get severity gradient
  const getSeverityGradient = (severity) => {
    const level = severity.toLowerCase();
    if (level === 'tidak ada' || level === 'normal') return 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)';
    if (level === 'ringan' || level === 'mild') return 'linear-gradient(135deg, #6EE7B7 0%, #059669 100%)';
    if (level === 'sedang' || level === 'moderate') return 'linear-gradient(135deg, #FCD34D 0%, #D97706 100%)';
    if (level === 'berat' || level === 'severe') return 'linear-gradient(135deg, #FCA5A5 0%, #DC2626 100%)';
    return 'linear-gradient(135deg, #FB7185 0%, #BE185D 100%)';
  };

  // Get severity icon
  const getSeverityIcon = (severity) => {
    const level = severity.toLowerCase();
    if (level === 'tidak ada' || level === 'normal') {
      return <FiCheck className="text-blue-500" size={24} />;
    } else if (level === 'ringan' || level === 'mild') {
      return <FiInfo className="text-green-500" size={24} />;
    } else if (level === 'sedang' || level === 'moderate') {
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
        <motion.div 
          className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-10"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="h-16 w-16 rounded-full border-t-3 border-b-3 border-white" />
        </motion.div>
      )}
      
      {/* Actual image without zoom effect on hover */}
      <div className="w-full h-full">
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
      </div>
      
      {/* Error overlay with improved animation */}
      <AnimatePresence>
      {imageError && (
          <motion.div 
            className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 bg-opacity-70 z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <FiAlertTriangle className="text-yellow-400 text-4xl mb-3" />
            <p className="text-white text-center font-medium">
              Gambar tidak dapat ditampilkan
            </p>
            <motion.button 
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
              className="mt-4 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all text-sm font-medium shadow-md"
              whileHover={{ scale: 1.05, boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)' }}
              whileTap={{ scale: 0.95 }}
            >
              Coba Lagi
            </motion.button>
          </motion.div>
      )}
      </AnimatePresence>
    </div>
  );

  return (
      <motion.div
      className="w-full max-w-5xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Modern Header with Gradient Background */}
      <motion.div
        className="relative overflow-hidden rounded-2xl mb-8 shadow-xl"
        variants={headerVariants}
      >
        {/* Background gradient with pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800"></div>
        
        {/* Animated pattern overlay */}
        <motion.div 
          className="absolute inset-0 opacity-10"
          animate={{ 
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            repeatType: 'reverse',
            ease: 'linear'
          }}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Floating particles */}
        {!reducedMotion && Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full bg-white/20"
            style={{
              width: Math.random() * 60 + 20,
              height: Math.random() * 60 + 20,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              zIndex: 1
            }}
            animate={{ 
              opacity: [0, 0.5, 0],
              scale: [0, 1, 0],
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut"
            }}
          />
        ))}
        
        {/* Header content */}
        <div className="relative z-10 p-8 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-4 md:mb-0">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-white mb-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: 0.2,
                type: "spring",
                stiffness: 200,
                damping: 20
              }}
            >
          Hasil Analisis Retina
            </motion.h2>
            <motion.div 
              className="flex items-center text-white text-sm font-medium drop-shadow-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <FiCalendar className="mr-2" />
              <span>{formatDate(result.createdAt || new Date())}</span>
            </motion.div>
          </div>
          
          <motion.div 
            className="flex gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
          <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            onClick={handleDownload}
            disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all text-sm font-medium shadow-md border border-white/30 drop-shadow-lg"
          >
              <FiDownload className="text-white" />
              <span className="text-white drop-shadow-md">{isLoading ? 'Memproses...' : 'Unduh PDF'}</span>
          </motion.button>
          <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all text-sm font-medium shadow-md border border-white/30 drop-shadow-lg"
          >
              <FiPrinter className="text-white" />
              <span className="text-white drop-shadow-md">Cetak</span>
          </motion.button>
          <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md border border-white/30 drop-shadow-lg"
            onClick={handleShare}
            disabled={isShareLoading}
          >
            {isShareLoading ? (
                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
            ) : shareSuccess ? (
                <FiCheck className="text-white" />
            ) : (
                <FiShare2 className="text-white" />
            )}
          </motion.button>
          </motion.div>
        </div>
        
        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 160" className="w-full">
            <motion.path 
              fill="#ffffff" 
              fillOpacity="1" 
              d="M0,128L48,117.3C96,107,192,85,288,90.7C384,96,480,128,576,128C672,128,768,96,864,80C960,64,1056,64,1152,74.7C1248,85,1344,107,1392,117.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            />
          </svg>
        </div>
      </motion.div>

      {/* Simulation Mode Warning */}
      {result && (result.isSimulation || result.simulation_mode || 
        (result.raw_prediction && result.raw_prediction.is_simulation)) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="mb-6 text-sm flex items-start rounded-xl overflow-hidden"
          style={{ background: 'rgba(254, 240, 199, 0.7)', ...adaptiveGlassEffect }}
        >
          <div className="bg-amber-500 h-full w-1.5"></div>
          <div className="p-4">
            <div className="flex items-start">
            <motion.div 
                animate={{ 
                  rotate: [0, 5, 0, -5, 0],
                  scale: [1, 1.1, 1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "loop",
                  repeatDelay: 3
                }}
              >
                <FiAlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 text-amber-600 mt-0.5" />
            </motion.div>
              <div>
                <p className="font-bold mb-1 text-sm text-amber-800">Mode Simulasi</p>
                <p className="text-xs text-amber-700">Hasil analisis ini menggunakan data simulasi. Tidak untuk diagnosis klinis.</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        variants={itemVariants}
      >
        {/* Patient Info Card */}
        {patient && (
          <motion.div 
            className="md:col-span-3 rounded-xl overflow-hidden shadow-md"
            style={adaptiveGlassEffect}
            whileHover={{ 
              y: -5, 
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-3 shadow-md">
                  <FiUser className="text-white" />
              </div>
                <h3 className="text-lg font-semibold text-gray-800">Informasi Pasien</h3>
            </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Nama Lengkap</p>
                  <p className="font-medium text-gray-800">{patient.fullName || patient.name || 'Tidak ada nama'}</p>
          </div>
          
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Jenis Kelamin / Usia</p>
                  <div className="flex items-center">
                    <p className="font-medium text-gray-800">
                      {patient.gender === 'male' ? 'Laki-laki' : 'Perempuan'}, {patient.age} tahun
                    </p>
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                      patient.gender === 'male' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-pink-100 text-pink-800'
                    }`}>
                      {patient.gender === 'male' ? 'M' : 'F'}
                    </span>
          </div>
        </div>

                {patient.dateOfBirth && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Tanggal Lahir</p>
                    <div className="flex items-center">
                      <FiCalendar className="text-gray-400 mr-2 text-sm" />
                      <p className="font-medium text-gray-800">{new Date(patient.dateOfBirth).toLocaleDateString('id-ID')}</p>
              </div>
                  </div>
                )}
                
                {patient.bloodType && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Golongan Darah</p>
                    <div className="flex items-center">
                      <FiHeart className="text-red-400 mr-2 text-sm" />
                      <p className="font-medium text-gray-800">{patient.bloodType}</p>
                      <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800">
                        {patient.bloodType}
              </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
              </motion.div>
        )}
      </motion.div>
      
      {/* Main content container */}
      <div id="hasil-detail" className="rounded-xl overflow-hidden shadow-xl">
        <motion.div
          ref={reportRef}
          className="pdf-container"
          style={{ ...adaptiveGlassEffect, background: 'rgba(255, 255, 255, 0.9)' }}
          variants={itemVariants}
        >
          {/* Main Content Grid */}
        <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column - Retina Image */}
            <motion.div 
                className="lg:col-span-5 flex flex-col space-y-6"
              variants={itemVariants}
            >
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-3 shadow-md">
                  <FiEye className="text-white" />
                </div>
                  <h3 className="text-lg font-semibold text-gray-800">Citra Retina</h3>
                </div>
              
              <motion.div 
                  className="rounded-xl shadow-md relative overflow-hidden bg-white"
                  whileHover={{ 
                    y: -5, 
                    boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  <div className="relative aspect-square w-full">
                <ImageViewer />
            
                    {/* Image Controls Overlay */}
            <motion.div 
                      className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-white text-xs font-medium">Gambar Retina</span>
                        <div className="flex gap-2">
                          <button className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                            <FiEye className="text-white text-sm" />
                          </button>
                          <button className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                            <FiDownload className="text-white text-sm" />
                          </button>
                </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
                
                {/* Image Analysis Card */}
              <motion.div 
                  className="rounded-xl shadow-md overflow-hidden"
                  style={adaptiveGlassEffect}
                  whileHover={{ 
                    y: -5, 
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <div className="p-5">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Detail Gambar</h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Resolusi</p>
                        <p className="font-medium text-gray-800 text-sm">1280 x 720 px</p>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Format</p>
                        <p className="font-medium text-gray-800 text-sm">JPEG</p>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Tanggal Scan</p>
                        <p className="font-medium text-gray-800 text-sm">{formatDate(result.createdAt || new Date()).split(',')[0]}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Kualitas</p>
                <div className="flex items-center">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <div 
                                key={i} 
                                className={`w-2 h-4 rounded-sm mr-0.5 ${i < 4 ? 'bg-indigo-500' : 'bg-gray-300'}`}
                              />
                            ))}
                  </div>
                          <span className="ml-2 text-xs font-medium text-gray-700">Baik</span>
                        </div>
                      </div>
                  </div>
                </div>
                </motion.div>
              </motion.div>
              
              {/* Right Column - Analysis Results */}
              <motion.div 
                className="lg:col-span-7 flex flex-col space-y-6"
                variants={itemVariants}
              >
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center mr-3 shadow-lg">
                    <FiActivity className="text-white" />
                </div>
                  <h3 className="text-lg font-semibold text-gray-800">Detail Analisis</h3>
                </div>
                
                {/* Severity Card with Radar Chart */}
                  <motion.div 
                  className="rounded-xl shadow-md overflow-hidden bg-white"
                  whileHover={{ 
                    y: -5, 
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  <div className="p-6 bg-gradient-to-br from-white via-white to-indigo-50/70">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-1">Tingkat Keparahan</h4>
                        <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r" 
                           style={{ 
                             backgroundImage: getSeverityGradient(severity),
                             color: getSeverityColor(severity)
                           }}>
                          {severity}
                        </p>
                      </div>
                      <div className="px-3 py-1.5 rounded-full shadow-md" style={{ 
                        backgroundColor: getSeverityCardColor(severity).bg,
                        color: getSeverityColor(severity),
                        borderColor: getSeverityCardColor(severity).border,
                        borderWidth: '1px'
                      }}>
                        {getSeverityIcon(severity)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Confidence Gauge */}
                      <div>
                        <p className="text-xs text-gray-500 mb-2 text-center">Tingkat Kepercayaan</p>
                        <div className="relative flex items-center justify-center">
                          <svg className="w-32 h-32" viewBox="0 0 120 120">
                            {/* Background arc */}
                            <path 
                              d="M10,60 A50,50 0 1,1 110,60" 
                              fill="none" 
                              stroke="#E5E7EB" 
                              strokeWidth="10" 
                              strokeLinecap="round"
                            />
                            
                            {/* Foreground arc with dynamic length based on confidence */}
                            <motion.path 
                              d={`M10,60 A50,50 0 ${confidence > 0.5 ? 1 : 0},1 ${
                                10 + 100 * confidence
                              },${
                                confidence <= 0.5 
                                  ? 60 - Math.sin(Math.PI * confidence) * 50
                                  : 60 - Math.sin(Math.PI * (1 - confidence)) * 50
                              }`} 
                              fill="none" 
                              stroke="url(#gradient)" 
                              strokeWidth="10" 
                              strokeLinecap="round"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                            />
                            
                            {/* Gradient definition */}
                            <defs>
                              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#4F46E5" />
                                <stop offset="50%" stopColor="#8B5CF6" />
                                <stop offset="100%" stopColor="#EC4899" />
                              </linearGradient>
                            </defs>
                          </svg>
                          
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">{formatPercentage(confidence)}</span>
                            <span className="text-xs text-gray-500">Confidence</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Risk Factors */}
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Faktor Risiko</p>
                        <div className="space-y-2">
                          {[
                            { name: 'Mikroaneurisma', value: 0.75, color: 'from-indigo-500 to-blue-600' },
                            { name: 'Hemorrhage', value: 0.3, color: 'from-rose-500 to-red-600' },
                            { name: 'Hard Exudate', value: 0.5, color: 'from-amber-500 to-yellow-600' },
                            { name: 'Cotton Wool Spots', value: 0.2, color: 'from-emerald-500 to-green-600' },
                          ].map((factor, index) => (
                            <div key={index} className="flex items-center">
                              <div className="w-24 text-xs font-medium text-gray-700">{factor.name}</div>
                              <div className="flex-grow">
                                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                  <motion.div
                                    className={`h-full bg-gradient-to-r ${factor.color} relative`}
                                    style={{
                                      width: `${factor.value * 100}%`
                                    }}
                                    initial={{ width: '0%' }}
                                    animate={{ width: `${factor.value * 100}%` }}
                                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 + index * 0.1 }}
                                  >
                                    <div className="absolute inset-0 bg-white/20 rounded-r-full" />
                                  </motion.div>
                                </div>
                              </div>
                              <div className="w-12 text-right text-xs font-medium bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 ml-2">
                                {Math.round(factor.value * 100)}%
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                </div>
              </motion.div>
              
                {/* Recommendation Card */}
              <motion.div 
                  className="rounded-xl shadow-md overflow-hidden"
                  style={{
                    ...adaptiveGlassEffect,
                    background: `linear-gradient(to right, ${getSeverityCardColor(severity).bg}40, white)`
                  }}
                  whileHover={{ 
                    y: -5, 
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  <div className="p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-100/30 to-purple-100/30 rounded-full -mr-20 -mt-20 z-0"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-100/30 to-cyan-100/30 rounded-full -ml-16 -mb-16 z-0"></div>
                    <div className="relative z-10">
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-3 shadow-md">
                      <FiInfo className="text-white text-sm" />
                    </div>
                        <h4 className="text-sm font-semibold text-gray-700">Rekomendasi Lengkap</h4>
                      </div>
                      
                      <div className="pl-11">
                        <p className="text-gray-700 mb-4 font-medium">
                          {severity === 'Tidak ada' || severity === 'Normal' ? (
                            'Tidak Ada Tanda Retinopati'
                          ) : severity === 'Ringan' || severity === 'Mild' ? (
                            'Retinopati Diabetik Non-proliferatif Ringan'
                          ) : severity === 'Sedang' || severity === 'Moderate' ? (
                            'Retinopati Diabetik Non-proliferatif Sedang'
                          ) : severity === 'Berat' || severity === 'Severe' ? (
                            'Retinopati Diabetik Non-proliferatif Berat'
                          ) : severity === 'Sangat Berat' || severity === 'Proliferative' ? (
                            'Retinopati Diabetik Proliferatif'
                          ) : (
                            'Status Tidak Diketahui'
                          )}
                        </p>
                        
                        <div className="bg-white/80 rounded-lg p-4 border border-gray-100 shadow-sm">
                          <h5 className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
                            <FiClock className="mr-1 text-indigo-500" />
                            Tindak Lanjut
                          </h5>
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getSeverityColor(severity) }}></div>
                            <p className="ml-2 text-sm text-gray-700">
                              {severity === 'Tidak ada' || severity === 'Normal' ? (
                                'Pemeriksaan rutin setiap 12 bulan'
                              ) : severity === 'Ringan' || severity === 'Mild' ? (
                                'Pemeriksaan ulang dalam 9-12 bulan'
                              ) : severity === 'Sedang' || severity === 'Moderate' ? (
                                'Pemeriksaan ulang dalam 6 bulan'
                              ) : severity === 'Berat' || severity === 'Severe' ? (
                                'Pemeriksaan ulang dalam 2-3 bulan'
                              ) : severity === 'Sangat Berat' || severity === 'Proliferative' ? (
                                'Konsultasi segera dengan dokter spesialis mata'
                              ) : (
                                'Konsultasi dengan dokter untuk jadwal pemeriksaan'
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
              </motion.div>
            </motion.div>
          </div>
          
            {/* Recommendation and Additional Info Section */}
          <motion.div 
              className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8"
            variants={itemVariants}
            >
              {/* Detailed Recommendations */}
              <div className="lg:col-span-7">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-3 shadow-md">
                    <FiShield className="text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Rekomendasi Lengkap</h3>
                </div>
                
                <motion.div 
                  className="rounded-xl shadow-md overflow-hidden"
                  style={{
                    ...adaptiveGlassEffect,
                    background: `linear-gradient(to right, ${getSeverityCardColor(severity).bg}40, white)`
                  }}
                  whileHover={{ 
                    y: -5, 
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  <div className="p-6">
                    <div className="flex items-start mb-4">
                      <div className={`p-2 rounded-full mr-4 flex-shrink-0`} style={{ backgroundColor: getSeverityCardColor(severity).bg }}>
                        {getSeverityIcon(severity)}
                      </div>
                      <div>
                        <h4 className="text-base font-semibold mb-2" style={{ color: getSeverityColor(severity) }}>
                          {severity === 'Tidak ada' || severity === 'Normal' ? (
                            'Tidak Ada Tanda Retinopati'
                          ) : severity === 'Ringan' || severity === 'Mild' ? (
                            'Retinopati Diabetik Non-proliferatif Ringan'
                          ) : severity === 'Sedang' || severity === 'Moderate' ? (
                            'Retinopati Diabetik Non-proliferatif Sedang'
                          ) : severity === 'Berat' || severity === 'Severe' ? (
                            'Retinopati Diabetik Non-proliferatif Berat'
                          ) : severity === 'Sangat Berat' || severity === 'Proliferative' ? (
                            'Retinopati Diabetik Proliferatif'
                          ) : (
                            'Status Tidak Diketahui'
                          )}
                        </h4>
                        <p className="text-gray-600 text-sm">
                          {severity === 'Tidak ada' || severity === 'Normal' ? (
                            'Tidak ditemukan tanda-tanda retinopati diabetik. Lakukan pemeriksaan rutin setiap tahun.'
                          ) : severity === 'Ringan' || severity === 'Mild' ? (
                            'Terdapat tanda-tanda ringan retinopati diabetik. Kontrol gula darah dan tekanan darah. Pemeriksaan ulang dalam 9-12 bulan.'
                          ) : severity === 'Sedang' || severity === 'Moderate' ? (
                            'Terdapat tanda-tanda sedang retinopati diabetik. Konsultasi dengan dokter spesialis mata. Pemeriksaan ulang dalam 6 bulan.'
                          ) : severity === 'Berat' || severity === 'Severe' ? (
                            'Terdapat tanda-tanda berat retinopati diabetik. Rujukan segera ke dokter spesialis mata. Pemeriksaan ulang dalam 2-3 bulan.'
                          ) : severity === 'Sangat Berat' || severity === 'Proliferative' ? (
                            'Terdapat tanda-tanda sangat berat retinopati diabetik. Rujukan segera ke dokter spesialis mata untuk evaluasi dan kemungkinan tindakan laser atau operasi.'
                          ) : (
                            'Tidak ada rekomendasi spesifik. Konsultasikan dengan dokter untuk evaluasi lebih lanjut.'
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-6 space-y-4">
                      <h5 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2">Langkah-langkah yang Disarankan:</h5>
                      
                      <div className="space-y-3">
                        {/* Medical Follow-up */}
            <div className="flex items-start">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-3 flex-shrink-0">
                            <FiClock className="text-indigo-600 text-sm" />
              </div>
              <div>
                            <p className="text-sm font-medium text-gray-700">Tindak Lanjut Medis</p>
                            <p className="text-xs text-gray-500">
                              {severity === 'Tidak ada' || severity === 'Normal' ? (
                                'Pemeriksaan rutin setiap 12 bulan'
                              ) : severity === 'Ringan' || severity === 'Mild' ? (
                                'Pemeriksaan ulang dalam 9-12 bulan'
                              ) : severity === 'Sedang' || severity === 'Moderate' ? (
                                'Pemeriksaan ulang dalam 6 bulan'
                              ) : severity === 'Berat' || severity === 'Severe' ? (
                                'Pemeriksaan ulang dalam 2-3 bulan'
                              ) : severity === 'Sangat Berat' || severity === 'Proliferative' ? (
                                'Konsultasi segera dengan dokter spesialis mata'
                              ) : (
                                'Konsultasi dengan dokter untuk jadwal pemeriksaan'
                              )}
                            </p>
                          </div>
                        </div>
                        
                        {/* Blood Sugar Control */}
                        <div className="flex items-start">
                          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3 flex-shrink-0">
                            <FiActivity className="text-green-600 text-sm" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Kontrol Gula Darah</p>
                            <p className="text-xs text-gray-500">
                              Pertahankan kadar HbA1c di bawah 7.0% dan monitor gula darah secara teratur
                            </p>
                          </div>
                        </div>
                        
                        {/* Blood Pressure Control */}
                        <div className="flex items-start">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                            <FiHeart className="text-blue-600 text-sm" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Kontrol Tekanan Darah</p>
                            <p className="text-xs text-gray-500">
                              Pertahankan tekanan darah di bawah 130/80 mmHg
                            </p>
                          </div>
                        </div>
                        
                        {/* Lifestyle */}
                        <div className="flex items-start">
                          <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mr-3 flex-shrink-0">
                            <FiUser className="text-purple-600 text-sm" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Gaya Hidup</p>
                            <p className="text-xs text-gray-500">
                              Pertahankan diet seimbang, aktivitas fisik teratur, dan hindari merokok
                            </p>
                          </div>
                        </div>
                      </div>
              </div>
            </div>
          </motion.div>
        </div>
        
              {/* Notes and Additional Resources */}
              <div className="lg:col-span-5">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-3 shadow-md">
                    <FiFileText className="text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Catatan & Sumber Daya</h3>
                </div>
                
                {/* Notes Card */}
        <motion.div 
                  className="rounded-xl shadow-md overflow-hidden mb-6"
                  style={adaptiveGlassEffect}
                  whileHover={{ 
                    y: -5, 
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  <div className="p-5">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <FiInfo className="mr-2 text-indigo-500" />
                      Catatan Penting
                    </h4>
                    
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                      <p className="text-xs text-yellow-800">
                        Hasil analisis ini merupakan bantuan diagnostik berbasis AI dan tidak menggantikan diagnosis dari dokter. 
                        Selalu konsultasikan dengan tenaga medis profesional untuk diagnosis dan penanganan yang tepat.
                      </p>
                    </div>
                    
                    {result.notes && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600">
                          {result.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
                
                {/* Resources Card */}
          <motion.div 
                  className="rounded-xl shadow-md overflow-hidden"
                  style={adaptiveGlassEffect}
                  whileHover={{ 
                    y: -5, 
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  <div className="p-5">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Sumber Daya</h4>
                    
                    <div className="space-y-3">
                      <a 
                        href="https://www.idf.org/our-activities/care-prevention/eye-health/dr-guide.html" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-start p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                          <FiExternalLink className="text-blue-600 text-sm" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Panduan IDF untuk Retinopati Diabetik</p>
                          <p className="text-xs text-gray-500">International Diabetes Federation</p>
                        </div>
                      </a>
                      
                      <a 
                        href="https://www.nei.nih.gov/learn-about-eye-health/eye-conditions-and-diseases/diabetic-retinopathy" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-start p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                          <FiExternalLink className="text-blue-600 text-sm" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Informasi Retinopati Diabetik</p>
                          <p className="text-xs text-gray-500">National Eye Institute</p>
                        </div>
                      </a>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
            
            {/* Footer */}
            <motion.div 
              className="mt-12 text-center"
              variants={itemVariants}
            >
              <div className="p-6 rounded-xl" style={adaptiveGlassEffect}>
                <div className="flex justify-center space-x-6 mb-4">
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={handleDownload}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all text-sm font-medium shadow-md border border-white/30 drop-shadow-lg"
                  >
                    <FiDownload className="text-white" />
                    <span className="text-white drop-shadow-md">{isLoading ? 'Memproses...' : 'Unduh PDF'}</span>
                  </motion.button>
                  
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all text-sm font-medium shadow-md border border-white/30 drop-shadow-lg"
                  >
                    <FiPrinter className="text-white" />
                    <span className="text-white drop-shadow-md">Cetak</span>
                  </motion.button>
                  
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={handleShare}
                    disabled={isShareLoading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md border border-white/30 drop-shadow-lg"
                  >
                    {isShareLoading ? (
                      <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                    ) : shareSuccess ? (
                      <FiCheck className="text-white" />
                    ) : (
                      <FiShare2 className="text-white" />
                    )}
                    <span className="text-white drop-shadow-md">{shareSuccess ? 'Dibagikan' : 'Bagikan'}</span>
                  </motion.button>
          </div>
          
                <p className="text-xs text-gray-500 max-w-lg mx-auto">
                  RetinaScan menggunakan teknologi AI untuk membantu deteksi dini retinopati diabetik. 
                  Hasil analisis ini bukan pengganti diagnosis medis profesional.
                  <br />© {new Date().getFullYear()} RetinaScan | AI-Powered Retinopathy Detection
                </p>
          </div>
        </motion.div>
          </div>
      </motion.div>
    </div>
    </motion.div>
  );
}

export default Report;