import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { FiDownload, FiPrinter, FiExternalLink, FiCalendar, FiUser, FiInfo, FiAlertTriangle, FiCheck, FiShare2, FiFileText, FiEye, FiActivity, FiMinus, FiPlus, FiRefreshCw, FiAlertCircle, FiArrowLeft, FiZap, FiTrendingUp, FiBarChart2, FiShield } from 'react-icons/fi';
import jsPDF from 'jspdf';
import { getSeverityBgColor } from '../../utils/severityUtils';

// Particle component untuk efek visual modern
const Particles = () => {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-gradient-to-br from-blue-400 to-indigo-400"
          style={{
            width: Math.random() * 20 + 5,
            height: Math.random() * 20 + 5,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0.1 + Math.random() * 0.1,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 10 + Math.random() * 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  );
};

// Glassmorphism style with improved design
const glassEffect = {
  background: 'rgba(255, 255, 255, 0.85)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  boxShadow: '0 10px 30px rgba(31, 38, 135, 0.07)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  borderRadius: '20px',
};

// Enhanced glassmorphism with subtle depth
const enhancedGlassEffect = {
  ...glassEffect,
  background: 'rgba(255, 255, 255, 0.9)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.5)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
};

// Animation variants for reuse
const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const elementVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

// 3D card hover effect
const hover3DEffect = {
  rest: { scale: 1, rotateX: 0, rotateY: 0 },
  hover: { scale: 1.02, rotateX: 5, rotateY: 5, transition: { duration: 0.4, ease: "easeOut" } }
};

function Report({ result }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isShareLoading, setIsShareLoading] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [cardState, setCardState] = useState("rest");
  const [isHovering, setIsHovering] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const reportRef = useRef(null);
  const cardControls = useAnimation();
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  // Effect for entrance animation
  useEffect(() => {
    if (result) {
      cardControls.start("visible");
    }
  }, [result, cardControls]);
  
  // Effect untuk memperbarui waktu setiap detik
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => {
      clearInterval(timer);
    };
  }, []);

  // Mouse move handler for 3D effect
  const handleMouseMove = (e) => {
    if (!isHovering) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  if (!result) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center p-8 rounded-2xl relative overflow-hidden" 
        style={enhancedGlassEffect}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Particles />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
          className="text-center p-10 relative z-10"
        >
          <motion.div 
            className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-purple-600 shadow-lg"
            animate={{ 
              boxShadow: ["0 5px 20px rgba(79, 70, 229, 0.3)", "0 10px 25px rgba(79, 70, 229, 0.5)", "0 5px 20px rgba(79, 70, 229, 0.3)"]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <FiFileText className="w-12 h-12 text-white" />
        </motion.div>
          <motion.p 
            className="text-gray-600 text-xl mb-3 font-medium"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Belum ada data analisis tersedia
          </motion.p>
          <motion.p 
            className="text-gray-400 text-base"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Silakan unggah dan analisis gambar retina terlebih dahulu
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-8"
          >
            <div className="inline-flex px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer">
              <FiArrowLeft className="mr-2" />
              <span>Kembali ke Upload</span>
      </div>
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
  
  // Format tanggal untuk tampilan yang lebih bagus
  const formatDisplayDate = (date) => {
    try {
      const options = { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
      };
      
      return date.toLocaleDateString('id-ID', options);
    } catch (error) {
      return 'Tanggal tidak valid';
    }
  };
  
  // Format waktu untuk tampilan yang lebih bagus
  const formatDisplayTime = (date) => {
    try {
      return date.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      return 'Waktu tidak valid';
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
    } catch (_) {
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

  // Add a function to generate a gradient based on severity glow
  const getSeverityGlowColor = (severity) => {
    const level = severity.toLowerCase();
    if (level === 'tidak ada' || level === 'normal') return 'rgba(59, 130, 246, 0.5)'; // blue
    if (level === 'ringan') return 'rgba(16, 185, 129, 0.5)'; // green
    if (level === 'sedang') return 'rgba(245, 158, 11, 0.5)'; // yellow
    if (level === 'berat') return 'rgba(239, 68, 68, 0.5)'; // red
    return 'rgba(225, 29, 72, 0.5)'; // severe red
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
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  
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
    setDragStartPos({
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
        x: e.clientX - dragStartPos.x,
        y: e.clientY - dragStartPos.y
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

  // Highlight number animation component
  const AnimatedNumber = ({ value, suffix = "", className = "" }) => {
    const num = parseFloat(value);
    const [displayValue, setDisplayValue] = useState(0);
    
    useEffect(() => {
      // Setup animation from 0 to value
      let startTimestamp;
      const duration = 1500; // 1.5s
      const startValue = 0;
      
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        
        setDisplayValue(startValue + (num - startValue) * easedProgress);
        
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      
      window.requestAnimationFrame(step);
    }, [num]);
    
    return (
      <span className={className}>
        {displayValue.toFixed(1)}{suffix}
      </span>
    );
  };

  // ImageViewer component with enhanced features
  const ImageViewer = () => {
    const [viewerScale, setViewerScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [showAnnotation, setShowAnnotation] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
    const imgContainerRef = useRef(null);
    
    // Untuk menyimpan status apakah mouse sedang ditekan
    const mouseDown = useRef(false);
    // Menyimpan posisi mouse terakhir
    const lastMousePos = useRef({ x: 0, y: 0 });
    
    // Handle zoom in
    const handleZoomIn = () => {
      setViewerScale(prev => {
        const newScale = Math.min(prev + 0.25, 3);
        return newScale;
      });
    };
    
    // Handle zoom out
    const handleZoomOut = () => {
      setViewerScale(prev => {
        const newScale = Math.max(prev - 0.25, 0.5);
        if (newScale === 1) {
          // Reset position jika kembali ke skala 1
          setPosition({ x: 0, y: 0 });
        }
        return newScale;
      });
    };
    
    // Reset zoom dan position
    const handleReset = () => {
      setViewerScale(1);
      setPosition({ x: 0, y: 0 });
    };
    
    // Handle mouse wheel untuk zoom
    const handleWheel = (e) => {
      e.preventDefault();
      
      if (e.deltaY < 0) {
        // Zoom in (scroll up)
        handleZoomIn();
      } else {
        // Zoom out (scroll down)
        handleZoomOut();
      }
    };
    
    // Implementasi mouse down untuk memulai drag
    const handleMouseDown = (e) => {
      // Hanya aktifkan drag jika gambar diperbesar
      if (viewerScale <= 1) return;
      
      mouseDown.current = true;
      setIsDragging(true);
      
      // Simpan posisi awal mouse
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      
      // Menghentikan event default untuk mencegah highlighting
      e.preventDefault();
    };
    
    // Implementasi mouse move untuk drag
    const handleMouseMove = (e) => {
      if (!mouseDown.current) return;
      
      // Hitung perubahan posisi mouse
      const deltaX = e.clientX - lastMousePos.current.x;
      const deltaY = e.clientY - lastMousePos.current.y;
      
      // Update posisi terakhir
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      
      // Update posisi gambar dengan batasan
      const containerWidth = imgContainerRef.current?.clientWidth || 0;
      const containerHeight = imgContainerRef.current?.clientHeight || 0;
      
      // Hitung batas pergerakan berdasarkan zoom level
      const maxOffsetX = (containerWidth * (viewerScale - 1)) / 2;
      const maxOffsetY = (containerHeight * (viewerScale - 1)) / 2;
      
      setPosition(prev => ({
        x: Math.max(Math.min(prev.x + deltaX, maxOffsetX), -maxOffsetX),
        y: Math.max(Math.min(prev.y + deltaY, maxOffsetY), -maxOffsetY)
      }));
    };
    
    // Implementasi mouse up untuk mengakhiri drag
    const handleMouseUp = () => {
      mouseDown.current = false;
      setIsDragging(false);
    };
    
    // Tangani kasus mouse keluar dari container
    const handleMouseLeave = () => {
      if (mouseDown.current) {
        mouseDown.current = false;
        setIsDragging(false);
      }
    };
    
    // Effect untuk menangani event mouse
    useEffect(() => {
      const container = imgContainerRef.current;
      if (!container) return;
      
      // Tambahkan event listeners
      container.addEventListener('wheel', handleWheel, { passive: false });
      container.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      container.addEventListener('mouseleave', handleMouseLeave);
      
      // Cleanup event listeners saat unmount
      return () => {
        container.removeEventListener('wheel', handleWheel);
        container.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        container.removeEventListener('mouseleave', handleMouseLeave);
      };
    }, [viewerScale]); // Re-apply listeners ketika viewerScale berubah
    
    return (
      <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden shadow-lg bg-gray-900/5">
        {/* Loading overlay */}
        {!imageError && isLoading && (
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
      
        {/* Image container */}
        <div 
          ref={imgContainerRef}
          className="relative w-full h-full overflow-hidden touch-none"
          style={{ 
            cursor: viewerScale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
          }}
        >
          {/* Image dengan transform */}
          <img
            src={getImageSource()}
            alt="Retina scan"
            className={`w-full h-full object-contain transition-all duration-150 ${isDragging ? 'brightness-90' : ''}`}
            style={{ 
              transform: `scale(${viewerScale}) translate(${position.x / viewerScale}px, ${position.y / viewerScale}px)`,
              transformOrigin: 'center',
            }}
            onLoad={() => {
              setIsLoading(false);
            }}
            onError={(e) => {
              handleImageError();
              setIsLoading(false);
              e.target.onerror = null;
              e.target.src = '/images/default-retina.jpg';
            }}
            draggable="false"
          />
    
          {/* Image annotations */}
          {showAnnotation && !imageError && (
            <div
              className="absolute top-1/4 left-1/2 w-16 h-16 -ml-8 -mt-8 rounded-full border-2 border-blue-500 pointer-events-none z-20"
              style={{ 
                transform: `translate(${position.x}px, ${position.y}px) scale(${1/viewerScale})`,
              }}
            >
              <motion.div 
                className="absolute inset-0 border-2 border-blue-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <div className="absolute -right-24 top-0 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                Area of interest
              </div>
            </div>
          )}
        </div>
        
        {/* Error overlay */}
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
                    setIsLoading(true);
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
            disabled={viewerScale >= 3}
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
            disabled={viewerScale <= 0.5}
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
          {Math.round(viewerScale * 100)}%
        </div>
      </div>
    );
  };

  // Main analysis results section
  const AnalysisResultsSection = () => {
  return (
      <motion.div
        className="mb-8 relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Particles />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10">
          {/* Left column - Severity card and chart */}
          <div className="md:col-span-7">
          <motion.div 
              initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-6"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FiActivity className="mr-2 text-indigo-600" />
                Hasil Analisis Keparahan
              </h3>
              
              {/* Severity Result Card with 3D Effect */}
      <motion.div
                className="relative overflow-hidden rounded-2xl p-0.5"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                {/* Animated glowing border based on severity */}
          <motion.div 
                  className="absolute inset-0 rounded-2xl"
                style={{
                    background: getSeverityGradient(severity),
                    filter: `blur(15px)`,
                    opacity: 0.7
                }}
                animate={{
                    opacity: [0.5, 0.8, 0.5],
                    filter: ['blur(10px)', 'blur(15px)', 'blur(10px)']
                  }}
                  transition={{ duration: 3, repeat: Infinity, repeatType: "mirror" }}
                />
                
                <div className="relative rounded-2xl overflow-hidden bg-white p-6">
                  <div className="absolute top-0 right-0 h-32 w-32 -mt-8 -mr-8 bg-gradient-to-b from-blue-50 to-transparent rounded-full opacity-70"></div>
                  
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    {/* Severity icon with pulse effect */}
                <motion.div 
                      className="flex-shrink-0 w-24 h-24 rounded-2xl flex items-center justify-center"
                      style={{ background: getSeverityGradient(severity) }}
                      whileHover={{ scale: 1.05 }}
                    >
              <motion.div 
                        className="absolute w-full h-full rounded-2xl"
                    animate={{ 
                          boxShadow: [
                            `0 0 0 0px ${getSeverityGlowColor(severity)}`,
                            `0 0 0 10px transparent`
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <div className="text-white text-3xl">
                        {getSeverityIcon(severity)}
        </div>
                    </motion.div>
                    
                    <div className="flex-grow">
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-500 font-medium">Tingkat Keparahan</span>
                        <motion.h4 
                          className={`text-3xl font-bold ${getSeverityColor(severity)}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.4 }}
                        >
                          {severity}
                        </motion.h4>
                        
                        <div className="mt-3">
                          <div className="flex items-center">
                            <span className="text-gray-500 mr-3 text-sm">Tingkat Kepercayaan:</span>
                            <div className="flex-grow max-w-xs">
                              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <motion.div 
                                  className="h-full rounded-full relative"
                                  style={{ background: getSeverityGradient(severity) }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${confidence * 100}%` }}
                                  transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            >
              <motion.div 
                                    className="absolute top-0 bottom-0 right-0 w-4 bg-white opacity-30"
                                    animate={{ x: ["-100%", "100%"] }}
                                    transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop", ease: "linear" }}
                                  />
              </motion.div>
                </div>
                        </div>
                            <AnimatedNumber 
                              value={confidence * 100} 
                              suffix="%" 
                              className="ml-3 font-medium"
                            />
                      </div>
                    </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
            
            {/* Recommendation card */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FiInfo className="mr-2 text-indigo-600" />
                Rekomendasi
              </h3>
              
              <motion.div 
                className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-blue-100 relative overflow-hidden"
                whileHover={{ scale: 1.01, boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)" }}
              >
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 bg-blue-100 rounded-full opacity-30"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 -mb-12 -ml-12 bg-indigo-100 rounded-full opacity-30"></div>
                
                <div className="flex items-start relative z-10">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                    <FiInfo className="text-blue-600" />
                  </div>
                      <div>
                      <motion.p 
                      className="text-gray-700"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {severity === 'Tidak ada' && (
                        "Lakukan pemeriksaan rutin setiap tahun."
                      )}
                      {severity === 'Ringan' && (
                        "Kontrol gula darah dan tekanan darah. Pemeriksaan ulang dalam 9-12 bulan."
                      )}
                      {severity === 'Sedang' && (
                        "Konsultasi dengan dokter spesialis mata. Pemeriksaan ulang dalam 6 bulan."
                      )}
                      {severity === 'Berat' && (
                        "Rujukan segera ke dokter spesialis mata. Pemeriksaan ulang dalam 2-3 bulan."
                      )}
                      {severity === 'Sangat Berat' && (
                        "Rujukan segera ke dokter spesialis mata untuk evaluasi dan kemungkinan tindakan laser atau operasi."
                      )}
                      {!['Tidak ada', 'Ringan', 'Sedang', 'Berat', 'Sangat Berat'].includes(severity) && (
                        "Lakukan pemeriksaan rutin setiap tahun."
                      )}
                      </motion.p>
                      
                      <motion.div 
                      className="mt-4 flex items-center text-xs text-gray-500"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                      <FiAlertCircle className="mr-1" />
                      <span>Selalu konsultasikan hasil dengan dokter spesialis mata</span>
                    </motion.div>
                        </div>
                        </div>
              </motion.div>
                      </motion.div>
                </div>
                  
          {/* Right column - Image with interactive viewer */}
          <div className="md:col-span-5">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-6"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FiEye className="mr-2 text-indigo-600" />
                Gambar Retina
              </h3>
              
              <motion.div 
                className="rounded-xl overflow-hidden bg-gray-50 border border-gray-100 p-1"
                whileHover={{ boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)" }}
              >
                <ImageViewer />
              </motion.div>
              
                  <motion.div 
                className="mt-3 text-center text-sm text-gray-500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Geser mouse untuk memperbesar dan menggeser gambar
              </motion.div>
                  </motion.div>
                </div>
        </div>
      </motion.div>
    );
  };

  // Disclaimer and footer section
  const DisclaimerSection = () => {
    return (
                  <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
                    <motion.div
          className="bg-gray-50 rounded-xl p-6 border border-gray-200 relative overflow-hidden"
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.3 }}
        >
          {/* Subtle decoration */}
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-indigo-50 rounded-full"></div>
          <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-blue-50 rounded-full"></div>
          
          <div className="relative z-10">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
              <FiAlertCircle className="mr-2 text-indigo-600" />
              Disclaimer
            </h4>
            <p className="text-sm text-gray-600">
              Hasil analisis ini merupakan bantuan diagnostik berbasis AI dan tidak menggantikan diagnosis dari dokter. 
              Selalu konsultasikan dengan tenaga medis profesional untuk diagnosis dan penanganan yang tepat.
                    </p>
                  </div>
        </motion.div>
        
                <motion.div 
          className="mt-8 text-center text-gray-400 text-xs"
                    initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 0.6 }}
        >
          <p>RetinaScan AI &copy; {new Date().getFullYear()} | AI-Powered Retinopathy Detection</p>
              </motion.div>
              </motion.div>
    );
  };

  // Patient Info Component
  const PatientInfoCard = () => {
    // Safely extract patient data with fallbacks
    const patientName = extractValueWithDefault(patient, 'fullName', extractValueWithDefault(patient, 'name', 'Tidak ada nama'));
    const patientGender = extractValueWithDefault(patient, 'gender', '');
    const patientAge = extractValueWithDefault(patient, 'age', '');
    
    if (!patientName && !patientGender && !patientAge) return null;

    return (
              <motion.div 
        initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-6 rounded-xl overflow-hidden relative"
        style={enhancedGlassEffect}
      >
        <div className="p-5">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
            Info Pasien
          </h3>
                
          <div className="space-y-2">
            {patientName && (
                  <motion.div 
                className="flex items-center"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span className="text-gray-500 w-24">Nama</span>
                <span className="font-medium">{patientName}</span>
            </motion.div>
            )}
                  
            {patientGender && (
                  <motion.div 
                className="flex items-center"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <span className="text-gray-500 w-24">Jenis Kelamin</span>
                <span className="font-medium">{patientGender === 'male' ? 'Laki-laki' : patientGender === 'female' ? 'Perempuan' : patientGender}</span>
                  </motion.div>
            )}
                  
            {patientAge && (
                  <motion.div 
                className="flex items-center"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <span className="text-gray-500 w-24">Umur</span>
                <span className="font-medium">{patientAge} tahun</span>
                  </motion.div>
                      )}
                    </div>
                </div>
              </motion.div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto relative px-4 sm:px-6">
      <Particles />
      
      {/* Header section with title and actions */}
      <motion.div
        className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4 relative z-10"
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
            className="text-sm text-gray-500 mt-2 flex flex-wrap items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center mr-3 mb-1">
              <FiCalendar className="mr-1" size={14} />
              <span>{formatDisplayDate(currentTime)}</span>
            </div>
            <div className="flex items-center mb-1">
              <svg className="w-3.5 h-3.5 mr-1 text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{formatDisplayTime(currentTime)}</span>
            </div>
          </motion.div>
          <motion.div
            className="text-sm text-gray-500 mt-1 flex flex-wrap items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center mb-1">
              <FiEye className="mr-1" size={14} />
              <span>ID: {result?.id?.substring(0, 8) || 'New'}</span>
            </div>
          </motion.div>
        </div>
        <div className="flex flex-wrap gap-3 justify-end">
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
          className="mb-6 text-sm flex flex-col sm:flex-row items-start rounded-xl overflow-hidden"
          style={{ ...glassEffect, background: 'rgba(254, 240, 199, 0.7)' }}
        >
          <div className="bg-amber-500 h-2 sm:h-full sm:w-2 w-full"></div>
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
              <code className="text-xs bg-white/70 p-2 rounded mt-1 block text-amber-800 font-mono overflow-x-auto">npm run test:flask</code>
            </motion.div>
          </div>
              </motion.div>
      )}

      {/* Patient Info Card - if present */}
      {patient && <PatientInfoCard />}

      <AnalysisResultsSection />
      <DisclaimerSection />
    </div>
  );
}

export default Report;