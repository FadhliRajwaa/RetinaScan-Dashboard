import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { FiDownload, FiPrinter, FiExternalLink, FiCalendar, FiUser, FiInfo, FiAlertTriangle, FiCheck, FiShare2, FiFileText, FiEye, FiActivity, FiArrowRight, FiClock, FiTrendingUp, FiShield } from 'react-icons/fi';
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

// Enhanced glassmorphism styles
const glassEffectDark = {
  background: 'rgba(15, 23, 42, 0.75)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  boxShadow: '0 8px 32px 0 rgba(15, 23, 42, 0.2)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '16px',
};

const glassEffectBlue = {
  background: 'rgba(219, 234, 254, 0.85)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px 0 rgba(37, 99, 235, 0.15)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '16px',
};

// Animation variants - Optimasi untuk performa yang lebih baik
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: {
      type: "spring",
      stiffness: 200, // Menurunkan stiffness untuk animasi yang lebih halus
      damping: 15,    // Menurunkan damping untuk mengurangi osilasi
      mass: 0.8       // Menambahkan mass untuk animasi yang lebih natural
    }
  },
  exit: { 
    opacity: 0, 
    y: -20, 
    transition: { 
      duration: 0.15  // Mempercepat exit animation untuk responsivitas yang lebih baik
    } 
  }
};

const staggerContainer = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.07, // Mempercepat stagger untuk tampilan yang lebih responsif
      delayChildren: 0.2     // Mengurangi delay untuk pengalaman yang lebih cepat
    }
  }
};

const pulseAnimation = {
  initial: { scale: 1 },
  animate: { 
    scale: [1, 1.02, 1],
    transition: {
      duration: 2.5,       // Memperlambat sedikit untuk efek yang lebih halus
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
      repeatDelay: 0.2     // Menambahkan delay kecil antara repetisi
    }
  }
};

const shimmerEffect = {
  initial: { x: '-100%' },
  animate: {
    x: '100%',
    transition: {
      repeat: Infinity,
      repeatType: "loop",
      duration: 2,        // Memperlambat sedikit untuk efek yang lebih halus
      ease: "easeInOut"
    }
  }
};

// Menambahkan animasi baru untuk optimasi
const scaleAnimation = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 150, 
      damping: 13,
      mass: 0.8
    }
  },
  exit: { 
    scale: 0.95, 
    opacity: 0,
    transition: { duration: 0.2 } 
  }
};

// Animasi untuk elemen interaktif
const hoverScale = {
  scale: 1.03,
  transition: { 
    type: "spring", 
    stiffness: 400, 
    damping: 10 
  }
};

// Optimasi untuk animasi background
const backgroundAnimation = {
  initial: { backgroundPositionX: '0%' },
  animate: { 
    backgroundPositionX: '100%',
    transition: { 
      duration: 25,       // Memperlambat untuk mengurangi penggunaan CPU
      repeat: Infinity, 
      repeatType: "reverse", 
      ease: "linear" 
    }
  }
};

// Menambahkan utility hook untuk mengoptimalkan animasi
const useInView = (options = {}) => {
  const [ref, setRef] = useState(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!ref) return;
    
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, {
      threshold: 0.1,
      ...options
    });
    
    observer.observe(ref);
    
    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return [setRef, isInView];
};

// Optimasi untuk container variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.06, // Optimasi: Mempercepat stagger
      delayChildren: 0.1,    // Optimasi: Mengurangi delay
      when: "beforeChildren"
    }
  }
};

// Optimasi untuk item variants
const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 150, 
      damping: 13,
      mass: 0.8
    }
  }
};

// Optimasi untuk image variants
const imageVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 120, 
      damping: 14,
      mass: 0.8
    }
  }
};

// Optimasi untuk card hover
const cardHover = {
  scale: 1.02,
  y: -5,
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  transition: { 
    type: "spring", 
    stiffness: 400, 
    damping: 15 
  }
};

function Report({ result }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isShareLoading, setIsShareLoading] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [imageError, setImageError] = useState(false);
  const reportRef = useRef(null);
  
  // Menggunakan useAnimation untuk kontrol animasi yang lebih baik
  const controls = useAnimation();
  
  // Menggunakan useSpring untuk animasi yang lebih smooth
  const springProgress = useSpring(0, { 
    stiffness: 100, 
    damping: 20 
  });
  
  // Menggunakan intersection observer untuk lazy animation
  const [headerRef, headerInView] = useInView();
  const [contentRef, contentInView] = useInView();
  
  // Trigger animasi ketika elemen dalam viewport
  useEffect(() => {
    if (headerInView) {
      controls.start("visible");
    }
  }, [headerInView, controls]);

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
      
      // Fungsi untuk menambahkan gradient rectangle
      const addGradientRect = (x, y, width, height, color1, color2) => {
        const numRects = 20;
        const rectWidth = width / numRects;
        
        for (let i = 0; i < numRects; i++) {
          const ratio = i / numRects;
          const r = Math.floor(color1.r + (color2.r - color1.r) * ratio);
          const g = Math.floor(color1.g + (color2.g - color1.g) * ratio);
          const b = Math.floor(color1.b + (color2.b - color1.b) * ratio);
          
          pdf.setFillColor(r, g, b);
          pdf.rect(x + (i * rectWidth), y, rectWidth, height, 'F');
        }
      };
      
      // Fungsi untuk menambahkan rounded rectangle
      const addRoundedRect = (x, y, width, height, radius, fillColor, strokeColor = null) => {
        const r = radius;
        const w = width;
        const h = height;
        
        pdf.setFillColor(fillColor.r, fillColor.g, fillColor.b);
        if (strokeColor) {
          pdf.setDrawColor(strokeColor.r, strokeColor.g, strokeColor.b);
          pdf.setLineWidth(0.5);
        }
        
        // Draw rectangle with rounded corners
        pdf.roundedRect(x, y, w, h, r, r, strokeColor ? 'FD' : 'F');
      };
      
      // Header dengan gradient
      addGradientRect(0, 0, pageWidth, 40, {r: 37, g: 99, b: 235}, {r: 79, g: 70, b: 229});
      
      // Logo dan judul
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont(undefined, 'bold');
      pdf.text('Laporan Analisis Retina', pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      const currentDate = formatDate(new Date());
      pdf.text(`Tanggal: ${currentDate}`, pageWidth / 2, 30, { align: 'center' });
      
      let yPos = 50;
      
      // Decorative element
      addGradientRect(margin, yPos - 3, 50, 1, {r: 79, g: 70, b: 229}, {r: 147, g: 51, b: 234});
      
      // Informasi pasien jika tersedia
      if (patient) {
        addRoundedRect(margin, yPos, pageWidth - (margin * 2), 40, 5, {r: 240, g: 249, b: 255});
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(16);
        pdf.setFont(undefined, 'bold');
        pdf.text('Informasi Pasien', margin + 10, yPos + 15);
        
        pdf.setFontSize(11);
        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(60, 60, 60);
        pdf.text(`Nama: ${patient.fullName || patient.name}`, margin + 10, yPos + 25);
        
        const genderText = patient.gender === 'male' ? 'Laki-laki' : 'Perempuan';
        pdf.text(`Jenis Kelamin: ${genderText}`, margin + 10, yPos + 35);
        
        pdf.text(`Umur: ${patient.age} tahun`, pageWidth - margin - 10, yPos + 25, { align: 'right' });
        
        if (patient.bloodType) {
          pdf.text(`Golongan Darah: ${patient.bloodType}`, pageWidth - margin - 10, yPos + 35, { align: 'right' });
        }
        
        yPos += 50;
      } else {
        yPos += 10;
      }
      
      // Hasil analisis dengan desain modern
      addRoundedRect(margin, yPos, pageWidth - (margin * 2), 60, 5, {r: 245, g: 250, b: 255});
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('Hasil Analisis', margin + 10, yPos + 15);
      
      // Tingkat keparahan dengan badge
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(60, 60, 60);
      pdf.text('Tingkat Keparahan:', margin + 10, yPos + 30);
      
      // Set warna berdasarkan tingkat keparahan
      const severityLevel = severity.toLowerCase();
      let severityColor = {r: 59, g: 130, b: 246}; // Default blue
      
      if (severityLevel === 'ringan') {
        severityColor = {r: 16, g: 185, b: 129}; // Green
      } else if (severityLevel === 'sedang') {
        severityColor = {r: 245, g: 158, b: 11}; // Yellow
      } else if (severityLevel === 'berat' || severityLevel === 'sangat berat') {
        severityColor = {r: 239, g: 68, b: 68}; // Red
      }
      
      // Badge untuk severity
      addRoundedRect(margin + 45, yPos + 25, 60, 10, 5, severityColor);
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'bold');
      pdf.text(severity, margin + 75, yPos + 31.5, { align: 'center' });
      
      // Tingkat kepercayaan
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(60, 60, 60);
      pdf.text(`Tingkat Kepercayaan: ${formatPercentage(confidence)}`, margin + 10, yPos + 45);
      
      // Gambar bar untuk confidence
      const barWidth = 80;
      const barHeight = 6;
      const confidenceWidth = barWidth * confidence;
      
      // Background bar
      addRoundedRect(margin + 60, yPos + 42, barWidth, barHeight, 3, {r: 229, g: 231, b: 235});
      
      // Filled bar with gradient
      if (confidenceWidth > 0) {
        addGradientRect(margin + 60, yPos + 42, confidenceWidth, barHeight, 
          {r: 37, g: 99, b: 235}, {r: 79, g: 70, b: 229});
      }
      
      yPos += 70;
      
      // Gambar
      if (result.image && typeof result.image === 'string') {
        try {
          // Tambahkan gambar jika tersedia
          const imgWidth = 120;
          const imgHeight = 120;
          
          // Background untuk gambar
          addRoundedRect(pageWidth / 2 - imgWidth / 2 - 5, yPos - 5, imgWidth + 10, imgHeight + 10, 5, {r: 249, g: 250, b: 251});
          
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
      addRoundedRect(margin, yPos, pageWidth - (margin * 2), 50, 5, {r: 239, g: 246, b: 255});
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('Rekomendasi', margin + 10, yPos + 15);
      
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
      
      yPos = addWrappedText(recommendation, margin + 10, yPos + 25, pageWidth - (margin * 2) - 20, 6);
      yPos += 15;
      
      // Disclaimer
      addRoundedRect(margin, yPos, pageWidth - (margin * 2), 30, 5, {r: 249, g: 250, b: 251});
      
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      const disclaimer = 'Disclaimer: Hasil analisis ini merupakan bantuan diagnostik berbasis AI dan tidak menggantikan diagnosis dari dokter. Selalu konsultasikan dengan tenaga medis profesional untuk diagnosis dan penanganan yang tepat.';
      yPos = addWrappedText(disclaimer, margin + 10, yPos + 10, pageWidth - (margin * 2) - 20, 5);
      
      // Footer dengan gradient
      addGradientRect(0, pageHeight - 20, pageWidth, 20, {r: 37, g: 99, b: 235}, {r: 79, g: 70, b: 229});
      
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
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 20;
        
        // Fungsi untuk menambahkan teks dengan wrapping
        const addWrappedText = (text, x, y, maxWidth, lineHeight) => {
          const lines = pdf.splitTextToSize(text, maxWidth);
          pdf.text(lines, x, y);
          return y + (lines.length * lineHeight);
        };
        
        // Fungsi untuk menambahkan gradient rectangle
        const addGradientRect = (x, y, width, height, color1, color2) => {
          const numRects = 20;
          const rectWidth = width / numRects;
          
          for (let i = 0; i < numRects; i++) {
            const ratio = i / numRects;
            const r = Math.floor(color1.r + (color2.r - color1.r) * ratio);
            const g = Math.floor(color1.g + (color2.g - color1.g) * ratio);
            const b = Math.floor(color1.b + (color2.b - color1.b) * ratio);
            
            pdf.setFillColor(r, g, b);
            pdf.rect(x + (i * rectWidth), y, rectWidth, height, 'F');
          }
        };
        
        // Fungsi untuk menambahkan rounded rectangle
        const addRoundedRect = (x, y, width, height, radius, fillColor, strokeColor = null) => {
          const r = radius;
          const w = width;
          const h = height;
          
          pdf.setFillColor(fillColor.r, fillColor.g, fillColor.b);
          if (strokeColor) {
            pdf.setDrawColor(strokeColor.r, strokeColor.g, strokeColor.b);
            pdf.setLineWidth(0.5);
          }
          
          // Draw rectangle with rounded corners
          pdf.roundedRect(x, y, w, h, r, r, strokeColor ? 'FD' : 'F');
        };
        
        // Header dengan gradient
        addGradientRect(0, 0, pageWidth, 40, {r: 37, g: 99, b: 235}, {r: 79, g: 70, b: 229});
        
        // Logo dan judul
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(24);
        pdf.setFont(undefined, 'bold');
        pdf.text('Laporan Analisis Retina', pageWidth / 2, 20, { align: 'center' });
        
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');
        const currentDate = formatDate(new Date());
        pdf.text(`Tanggal: ${currentDate}`, pageWidth / 2, 30, { align: 'center' });
        
        let yPos = 50;
        
        // Decorative element
        addGradientRect(margin, yPos - 3, 50, 1, {r: 79, g: 70, b: 229}, {r: 147, g: 51, b: 234});
        
        // Informasi pasien jika tersedia
        if (patient) {
          addRoundedRect(margin, yPos, pageWidth - (margin * 2), 40, 5, {r: 240, g: 249, b: 255});
          
          pdf.setTextColor(0, 0, 0);
          pdf.setFontSize(16);
          pdf.setFont(undefined, 'bold');
          pdf.text('Informasi Pasien', margin + 10, yPos + 15);
          
          pdf.setFontSize(11);
          pdf.setFont(undefined, 'normal');
          pdf.setTextColor(60, 60, 60);
          pdf.text(`Nama: ${patient.fullName || patient.name}`, margin + 10, yPos + 25);
          
          const genderText = patient.gender === 'male' ? 'Laki-laki' : 'Perempuan';
          pdf.text(`Jenis Kelamin: ${genderText}`, margin + 10, yPos + 35);
          
          pdf.text(`Umur: ${patient.age} tahun`, pageWidth - margin - 10, yPos + 25, { align: 'right' });
          
          if (patient.bloodType) {
            pdf.text(`Golongan Darah: ${patient.bloodType}`, pageWidth - margin - 10, yPos + 35, { align: 'right' });
          }
          
          yPos += 50;
        } else {
          yPos += 10;
        }
        
        // Hasil analisis dengan desain modern
        addRoundedRect(margin, yPos, pageWidth - (margin * 2), 60, 5, {r: 245, g: 250, b: 255});
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(16);
        pdf.setFont(undefined, 'bold');
        pdf.text('Hasil Analisis', margin + 10, yPos + 15);
        
        // Tingkat keparahan dengan badge
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(60, 60, 60);
        pdf.text('Tingkat Keparahan:', margin + 10, yPos + 30);
        
        // Set warna berdasarkan tingkat keparahan
        const severityLevel = severity.toLowerCase();
        let severityColor = {r: 59, g: 130, b: 246}; // Default blue
        
        if (severityLevel === 'ringan') {
          severityColor = {r: 16, g: 185, b: 129}; // Green
        } else if (severityLevel === 'sedang') {
          severityColor = {r: 245, g: 158, b: 11}; // Yellow
        } else if (severityLevel === 'berat' || severityLevel === 'sangat berat') {
          severityColor = {r: 239, g: 68, b: 68}; // Red
        }
        
        // Badge untuk severity
        addRoundedRect(margin + 45, yPos + 25, 60, 10, 5, severityColor);
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'bold');
        pdf.text(severity, margin + 75, yPos + 31.5, { align: 'center' });
        
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

  // JSX for Image Viewer with improved error handling
  const ImageViewer = () => (
    <motion.div 
      className="relative w-full h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden shadow-lg"
      variants={fadeInUp}
      whileHover={{ scale: 1.01, transition: { duration: 0.3 } }} // Mengurangi scale untuk performa yang lebih baik
    >
      {/* Loading overlay */}
      {!imageError && (
        <motion.div 
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800/70 to-gray-900/80 z-10"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }} // Mempercepat exit transition
        >
          <div className="relative">
            <motion.div 
              className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }} // Mempercepat rotasi
            />
            <motion.div 
              className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-300 rounded-full"
              animate={{ rotate: -360 }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }} // Mempercepat rotasi
            />
          </div>
        </motion.div>
      )}
      
      {/* Actual image */}
      <motion.img
        src={getImageSource()}
        alt="Retina scan"
        className="w-full h-full object-contain"
        initial={{ filter: 'blur(8px)', scale: 1.05 }}
        animate={{ filter: 'blur(0px)', scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }} // Mempercepat transisi
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
      
      {/* Error overlay - optimized */}
      <AnimatePresence>
        {imageError && (
          <motion.div 
            className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-800/80 to-gray-900/90 z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }} // Mempercepat transisi
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 250, damping: 20 }} // Mengoptimalkan spring
            >
              <FiAlertTriangle className="text-yellow-400 text-5xl mb-4" />
            </motion.div>
            <motion.p 
              className="text-white text-center text-lg font-medium mb-2"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }} // Mengurangi delay
            >
              Gambar tidak dapat ditampilkan
            </motion.p>
            <motion.p 
              className="text-gray-300 text-center text-sm mb-4"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }} // Mengurangi delay
            >
              Terjadi kesalahan saat memuat gambar
            </motion.p>
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
              className="mt-3 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all"
              whileHover={{ scale: 1.03, boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)' }} // Mengurangi scale
              whileTap={{ scale: 0.97 }} // Mengurangi scale
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }} // Mengurangi delay
            >
              <span className="flex items-center gap-2">
                <FiEye className="text-blue-100" />
                Coba Lagi
              </span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        ref={headerRef}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={controls}
        variants={{
          visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
              type: "spring", 
              stiffness: 80, 
              damping: 12 
            }
          }
        }}
      >
        <div>
          <motion.h3 
            className="text-2xl font-bold relative"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              Hasil Analisis Retina
            </span>
            <motion.div 
              className="absolute -bottom-1 left-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '60%' }}
              transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
            />
          </motion.h3>
          <motion.p 
            className="text-gray-500 mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Laporan pemeriksaan tanggal {formatDate(new Date()).split(',')[0]}
          </motion.p>
        </div>

        <motion.div 
          className="flex gap-3"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.button
            variants={fadeInUp}
            whileHover={{ 
              scale: 1.05, 
              boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3), 0 4px 6px -2px rgba(59, 130, 246, 0.2)'
            }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all text-sm font-medium shadow-md"
          >
            {isLoading ? (
              <>
                <motion.div 
                  className="w-4 h-4 border-2 border-blue-100 border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <FiDownload className="text-blue-100" />
                <span>Unduh PDF</span>
              </>
            )}
          </motion.button>
          
          <motion.button
            variants={fadeInUp}
            whileHover={{ 
              scale: 1.05, 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' 
            }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium shadow-md"
            style={glassEffect}
          >
            <FiPrinter className="text-gray-600" />
            <span>Cetak</span>
          </motion.button>
          
          <motion.button
            variants={fadeInUp}
            whileHover={{ 
              scale: 1.05, 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' 
            }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center w-10 h-10 rounded-full"
            style={glassEffect}
            onClick={handleShare}
            disabled={isShareLoading}
          >
            {isShareLoading ? (
              <motion.div 
                className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            ) : shareSuccess ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                <FiCheck className="text-green-600" />
              </motion.div>
            ) : (
              <FiShare2 className="text-gray-600" />
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
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="mb-6 text-sm relative overflow-hidden rounded-xl"
          style={{ ...glassEffectBlue, background: 'rgba(254, 240, 199, 0.7)' }}
        >
          {/* Animated background pattern */}
          <motion.div 
            className="absolute inset-0 opacity-10"
            initial={{ backgroundPositionX: '0%' }}
            animate={{ backgroundPositionX: '100%' }}
            transition={{ duration: 15, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23d97706\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
              backgroundSize: '20px 20px'
            }}
          />
          
          <div className="bg-amber-500 h-full w-2 absolute left-0 top-0"></div>
          <div className="p-5 relative z-10">
            <div className="flex items-start">
              <motion.div
                initial={{ rotate: -10 }}
                animate={{ rotate: [0, -10, 0] }}
                transition={{ duration: 1, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 1 }}
              >
                <FiAlertTriangle className="w-6 h-6 mr-3 flex-shrink-0 text-amber-600" />
              </motion.div>
              <div>
                <motion.p 
                  className="font-bold mb-2 text-base text-amber-800"
                  variants={fadeInUp}
                >
                  PERHATIAN: Laporan dalam Mode Simulasi
                </motion.p>
                <motion.p 
                  className="mb-2 text-amber-700"
                  variants={fadeInUp}
                >
                  Hasil analisis ini menggunakan <span className="font-bold underline">data simulasi</span> karena layanan AI tidak tersedia saat ini.
                </motion.p>
                <motion.p 
                  className="text-amber-800 font-bold"
                  variants={fadeInUp}
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
              whileHover={{ opacity: 1, scale: 1.01, boxShadow: '0 4px 12px rgba(217, 119, 6, 0.15)' }}
              transition={{ delay: 0.2 }}
            >
              <motion.p 
                className="text-xs font-semibold text-amber-700"
                variants={fadeInUp}
              >
                Untuk menggunakan model AI sebenarnya, jalankan script pengujian koneksi:
              </motion.p>
              <motion.code 
                className="text-xs bg-white/70 p-2 rounded mt-1 block text-amber-800 font-mono"
                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
              >
                npm run test:flask
              </motion.code>
            </motion.div>
          </div>
          
          {/* Animated warning indicator */}
          <motion.div 
            className="absolute top-3 right-3 w-3 h-3 rounded-full bg-amber-500"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        </motion.div>
      )}

      <motion.div
        ref={contentRef}
        className="rounded-xl overflow-hidden shadow-xl pdf-container"
        style={{ ...glassEffect, background: 'rgba(255, 255, 255, 0.9)' }}
        variants={containerVariants}
        initial="hidden"
        animate={contentInView ? "visible" : "hidden"}
        whileHover={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}
        transition={{ duration: 0.4 }}
        layout
      >
        {/* Header */}
        <motion.div 
          className="relative overflow-hidden"
          variants={itemVariants}
        >
          {/* Background gradient */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
          />
          
          {/* Background pattern */}
          <motion.div 
            className="absolute inset-0 opacity-10"
            initial={{ backgroundPositionX: '0%' }}
            animate={{ backgroundPositionX: '100%' }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
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
                  transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
                >
                  Laporan Analisis Retina
                </motion.h2>
                <motion.div 
                  className="flex items-center text-blue-100"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <FiCalendar className="mr-2" />
                  <span className="text-sm">{formatDate(new Date())}</span>
                </motion.div>
              </div>
              <motion.div 
                className="text-right"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 20 }}
              >
                <div className="text-lg font-semibold text-white">RetinaScan AI</div>
                <div className="text-sm text-blue-100">Deteksi Retinopati Diabetik</div>
                {/* Tambahkan label simulasi jika dalam mode simulasi */}
                {result && (result.isSimulation || result.simulation_mode || 
                  (result.raw_prediction && result.raw_prediction.is_simulation)) && (
                  <motion.div 
                    className="mt-2"
                    variants={pulseAnimation}
                    initial="initial"
                    animate="animate"
                  >
                    <span className="bg-amber-600 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-md">
                      SIMULASI - BUKAN HASIL SEBENARNYA
                    </span>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
          
          {/* Decorative bottom wave */}
          <motion.div 
            className="absolute bottom-0 left-0 right-0"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" className="w-full h-12">
              <path fill="rgba(255, 255, 255, 0.9)" fillOpacity="1" d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,53.3C672,43,768,21,864,16C960,11,1056,21,1152,32C1248,43,1344,53,1392,58.7L1440,64L1440,100L1392,100C1344,100,1248,100,1152,100C1056,100,960,100,864,100C768,100,672,100,576,100C480,100,384,100,288,100C192,100,96,100,48,100L0,100Z"></path>
            </svg>
          </motion.div>
        </motion.div>

        {/* Patient Information */}
        {patient && (
          <motion.div 
            className="p-6 border-b bg-blue-50"
            variants={itemVariants}
            whileHover={{ backgroundColor: 'rgba(219, 234, 254, 0.7)' }}
          >
            <h3 className="font-semibold mb-4 text-gray-700 flex items-center text-lg">
              <motion.div 
                className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-3 shadow-md"
                whileHover={{ scale: 1.1, backgroundColor: '#3b82f6' }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <FiUser className="text-white" />
              </motion.div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Informasi Pasien
              </span>
            </h3>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-xl"
              style={glassEffect}
              whileHover={{ boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
              transition={{ duration: 0.3 }}
              variants={staggerContainer}
            >
              <motion.div 
                className="p-4 rounded-lg bg-white/50"
                whileHover={{ y: -2, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                variants={fadeInUp}
              >
                <p className="text-sm text-blue-500 font-medium mb-1">Nama Lengkap</p>
                <p className="font-semibold text-gray-800 text-lg">{patient.fullName || patient.name}</p>
              </motion.div>
              <motion.div 
                className="p-4 rounded-lg bg-white/50"
                whileHover={{ y: -2, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                variants={fadeInUp}
              >
                <p className="text-sm text-blue-500 font-medium mb-1">Jenis Kelamin / Umur</p>
                <p className="font-semibold text-gray-800 text-lg">
                  {patient.gender}, {patient.age} tahun
                </p>
              </motion.div>
              {patient.dateOfBirth && (
                <motion.div 
                  className="p-4 rounded-lg bg-white/50"
                  whileHover={{ y: -2, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                  variants={fadeInUp}
                >
                  <p className="text-sm text-blue-500 font-medium mb-1">Tanggal Lahir</p>
                  <p className="font-semibold text-gray-800 text-lg">{new Date(patient.dateOfBirth).toLocaleDateString('id-ID')}</p>
                </motion.div>
              )}
              {patient.bloodType && (
                <motion.div 
                  className="p-4 rounded-lg bg-white/50"
                  whileHover={{ y: -2, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                  variants={fadeInUp}
                >
                  <p className="text-sm text-blue-500 font-medium mb-1">Golongan Darah</p>
                  <motion.div 
                    className="flex items-center"
                    initial={{ x: 0 }}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                  >
                    <motion.span 
                      className="inline-flex items-center justify-center w-8 h-8 mr-2 rounded-full bg-red-100 text-red-800 font-bold text-sm"
                      whileHover={{ scale: 1.1 }}
                    >
                      {patient.bloodType}
                    </motion.span>
                    <p className="font-semibold text-gray-800 text-lg">{patient.bloodType}</p>
                  </motion.div>
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
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center mr-3 shadow-md">
                  <FiEye className="text-white" />
                </div>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                  Citra Retina
                </span>
              </h3>
              
              <motion.div 
                className="p-6 mb-6 rounded-xl shadow-md relative overflow-hidden"
                style={{ ...glassEffect }}
                variants={imageVariants}
                whileHover={cardHover}
              >
                <ImageViewer />
              </motion.div>
            </motion.div>
            
            {/* Right Column - Analysis Results */}
            <motion.div 
              className="flex flex-col h-full"
              variants={itemVariants}
            >
              <h3 className="font-semibold mb-4 text-gray-700 text-lg flex items-center">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center mr-3 shadow-md">
                  <FiActivity className="text-white" />
                </div>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                  Hasil Analisis
                </span>
              </h3>
              
              {/* Severity */}
              <motion.div 
                className={`p-6 rounded-xl mb-6 shadow-md overflow-hidden relative`}
                style={{ ...glassEffect }}
                whileHover={cardHover}
                variants={itemVariants}
              >
                <motion.div 
                  className="absolute inset-0 opacity-10"
                  style={{
                    background: getSeverityGradient(resultSeverity),
                    zIndex: -1
                  }}
                />
                <div className="flex items-center">
                  <div className="p-3 rounded-full" style={{ background: getSeverityBgColor(resultSeverity) }}>
                    {getSeverityIcon(resultSeverity)}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-700 mb-1">Tingkat Keparahan</p>
                    <p className={`text-2xl font-bold ${getSeverityColor(resultSeverity)}`}>
                      {resultSeverity}
                    </p>
                  </div>
                </div>
              </motion.div>
              
              {/* Confidence */}
              <motion.div 
                className="mb-6 p-5 rounded-xl shadow-md"
                style={{ ...glassEffect }}
                whileHover={cardHover}
                variants={itemVariants}
              >
                <div className="flex justify-between mb-2">
                  <p className="text-sm text-gray-700 font-medium">Tingkat Kepercayaan</p>
                  <p className="text-sm font-bold text-blue-600">{formatPercentage(resultConfidence)}</p>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full relative overflow-hidden"
                    style={{ width: formatPercentage(resultConfidence) }}
                    initial={{ width: '0%' }}
                    animate={{ width: formatPercentage(resultConfidence) }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"></div>
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)',
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
                  </motion.div>
                </div>
              </motion.div>
              
              {/* Recommendation */}
              <motion.div 
                className="p-6 rounded-xl mt-auto shadow-md relative overflow-hidden"
                style={{ ...glassEffect }}
                whileHover={cardHover}
                variants={itemVariants}
              >
                <motion.div 
                  className="absolute inset-0 opacity-10"
                  style={{
                    background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                    zIndex: -1
                  }}
                />
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center mr-2 shadow-md">
                    <FiInfo className="text-white text-sm" />
                  </div>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                    Rekomendasi
                  </span>
                </h4>
                <p className="text-blue-700">
                  {resultNotes || 'Tidak ada catatan atau rekomendasi tersedia.'}
                </p>
              </motion.div>
            </motion.div>
          </div>
          
          {/* Disclaimer */}
          <motion.div 
            className="mt-8 p-5 rounded-xl text-sm text-gray-500"
            style={{ ...glassEffect }}
            variants={itemVariants}
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
          variants={itemVariants}
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