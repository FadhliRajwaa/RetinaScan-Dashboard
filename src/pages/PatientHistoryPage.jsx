import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { withPageTransition } from '../context/ThemeContext';
import { getPatientHistory, deleteAnalysis } from '../services/api';
import { API_URL } from '../utils/api';
import axios from 'axios';
import jsPDF from 'jspdf';
import { 
  FiArrowLeft, 
  FiUser, 
  FiCalendar, 
  FiAlertTriangle, 
  FiPercent, 
  FiFileText,
  FiBarChart2,
  FiRefreshCcw,
  FiTrash,
  FiDownload,
  FiClock,
  FiActivity,
  FiEye
} from 'react-icons/fi';

// Daftar URL endpoint alternatif yang akan dicoba jika URL utama gagal
const FALLBACK_API_URLS = [
  API_URL,
  'https://retinascan-backend-eszo.onrender.com'
];

// Default fallback image ketika gambar tidak dapat ditemukan
const DEFAULT_IMAGE = '/images/not-found.jpg';

// Fungsi untuk cek apakah gambar benar-benar ada di server
const checkImageExistence = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Failed to check image existence:', error);
    return false;
  }
};

// Format image URL properly regardless of path separator
const formatImageUrl = (imagePath) => {
  if (!imagePath) return DEFAULT_IMAGE;
  
  // Jika imagePath sudah berupa data base64, gunakan langsung
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  // Jika imagePath sudah lengkap (relatif maupun absolut), gunakan langsung
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Sanitasi path - hilangkan karakter tidak valid
  let sanitizedPath = imagePath.replace(/[*?"<>|]/g, '');
  
  // Ekstrak filename dari path apapun (Windows atau Unix)
  let filename;
  
  // Metode 1: Ambil bagian setelah karakter / atau \ terakhir
  const lastSlashIndex = Math.max(
    sanitizedPath.lastIndexOf('/'), 
    sanitizedPath.lastIndexOf('\\')
  );
  
  if (lastSlashIndex !== -1) {
    filename = sanitizedPath.substring(lastSlashIndex + 1);
  } else {
    filename = sanitizedPath; // Jika tidak ada slash, maka ini sudah filename
  }
  
  // Pastikan tidak ada backslash di URL (ganti dengan forward slash)
  filename = filename.replace(/\\/g, '/');
  
  // Hapus karakter khusus atau path traversal yang tidak valid dalam URL
  filename = filename.replace(/[\/\\:*?"<>|]/g, '');
  
  if (!filename || filename.trim() === '') {
    console.error('Failed to extract valid filename from path:', imagePath);
    return DEFAULT_IMAGE;
  }
  
  // Coba semua alternatif URL yang mungkin
  const timestamp = new Date().getTime(); // Tambahkan timestamp untuk mencegah cache
  
  // Gunakan URL yang lebih konsisten dengan base URL API
  if (API_URL) {
    return `${API_URL}/uploads/${filename}?t=${timestamp}`;
  }
  
  // Fallback jika API_URL tidak tersedia
  return `/uploads/${filename}?t=${timestamp}`;
};

// Animasi untuk container
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.3 }
  }
};

// Animasi untuk item
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: 'spring', stiffness: 100, damping: 12 }
  },
  exit: {
    y: -20,
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

// Animasi untuk fade in
const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

// Animasi untuk slide in
const slideInVariants = {
  hidden: { x: 20, opacity: 0 },
  visible: { 
    x: 0,
    opacity: 1,
    transition: { 
      type: 'spring',
      stiffness: 100,
      damping: 12
    }
  }
};

function PatientHistoryPageComponent() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState(null);
  const [patientAnalyses, setPatientAnalyses] = useState([]);
  const [selectedAnalysisIndex, setSelectedAnalysisIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageStatus, setImageStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [imageLoadAttempt, setImageLoadAttempt] = useState(0);
  const [activeImageUrl, setActiveImageUrl] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  useEffect(() => {
    const fetchPatientHistory = async () => {
      try {
        setIsLoading(true);
        
        // Gunakan fungsi getPatientHistory dari services/api.js
        const response = await getPatientHistory(patientId);
        
        // Respons berisi data pasien dan riwayat analisisnya
        const { patient, analyses } = response;
        
        if (analyses.length === 0) {
          setError('Pasien ini belum memiliki riwayat analisis');
        } else {
          setPatientData(patient);
          setPatientAnalyses(analyses);
        }
      } catch (err) {
        console.error('Error fetching patient history:', err);
        setError('Gagal memuat riwayat pasien. Mohon coba lagi nanti.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPatientHistory();
  }, [patientId]);

  // Reset image status when changing analysis
  useEffect(() => {
    if (patientAnalyses && patientAnalyses.length > 0) {
      setImageStatus('loading');
      
      // Prioritaskan penggunaan imageData (base64) jika tersedia
      if (patientAnalyses[selectedAnalysisIndex].imageData) {
        // Jika ada imageData, tidak perlu URL tambahan
        setActiveImageUrl('');
        console.log('Menggunakan data base64 dari database untuk analisis');
      } 
      // Jika tidak ada imageData, coba gunakan path sebagai fallback
      else if (patientAnalyses[selectedAnalysisIndex].imageUrl) {
        const imageUrl = formatImageUrl(patientAnalyses[selectedAnalysisIndex].imageUrl);
        setActiveImageUrl(imageUrl);
        console.log('Menggunakan URL gambar sebagai fallback:', imageUrl);
      } else {
        // Tidak ada imageData atau imagePath, gunakan gambar default
        setActiveImageUrl(DEFAULT_IMAGE);
        console.log('Tidak ada data gambar tersedia, menggunakan gambar default');
      }
    }
  }, [selectedAnalysisIndex, patientAnalyses]);

  // Format date helper
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Get severity badge style
  const getSeverityBadge = (severity) => {
    const severityLower = severity.toLowerCase();
    if (severityLower === 'tidak ada' || severityLower === 'normal') {
      return 'bg-blue-100 text-blue-800';
    } else if (severityLower === 'ringan' || severityLower === 'rendah') {
      return 'bg-green-100 text-green-800';
    } else if (severityLower === 'sedang') {
      return 'bg-yellow-100 text-yellow-800';
    } else if (severityLower === 'berat' || severityLower === 'parah') {
      return 'bg-orange-100 text-orange-800';
    } else if (severityLower === 'sangat berat' || severityLower === 'proliferative dr') {
      return 'bg-red-100 text-red-800';
    } else {
      // Fallback berdasarkan severityLevel jika ada
      const level = parseInt(severity);
      if (!isNaN(level)) {
        if (level === 0) return 'bg-blue-100 text-blue-800';
        if (level === 1) return 'bg-green-100 text-green-800';
        if (level === 2) return 'bg-yellow-100 text-yellow-800';
        if (level === 3) return 'bg-orange-100 text-orange-800';
        if (level === 4) return 'bg-red-100 text-red-800';
      }
      return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle back to history page
  const handleBack = () => {
    navigate('/history');
  };
  
  // Menampilkan konfirmasi delete
  const handleDelete = (id, e) => {
    e.stopPropagation(); // Mencegah event click menyebar ke div parent
    setIdToDelete(id);
    setShowConfirmDelete(true);
  };
  
  // Menghandle konfirmasi delete
  const handleConfirmDelete = async () => {
    try {
      await deleteAnalysis(idToDelete);
      
      // Refresh data setelah menghapus
      const response = await getPatientHistory(patientId);
      
      // Perbarui state dengan data terbaru
      if (response.analyses.length === 0) {
        setError('Pasien ini belum memiliki riwayat analisis');
        setPatientAnalyses([]);
      } else {
        setPatientData(response.patient);
        setPatientAnalyses(response.analyses);
        
        // Reset selectedAnalysisIndex jika analisis yang dihapus adalah yang sedang dipilih
        if (selectedAnalysisIndex >= response.analyses.length) {
          setSelectedAnalysisIndex(0);
        }
      }
      
      setShowConfirmDelete(false);
      setIdToDelete(null);
    } catch (err) {
      console.error('Error deleting analysis:', err);
      alert('Gagal menghapus analisis. Silakan coba lagi nanti.');
    }
  };

  // Menghitung distribusi tingkat keparahan
  const calculateSeverityDistribution = () => {
    if (!patientData) return {};
    
    const distribution = {
      tidakAda: 0,
      ringan: 0,
      sedang: 0,
      berat: 0,
      sangatBerat: 0
    };
    
    patientAnalyses.forEach(analysis => {
      const severity = analysis.severity.toLowerCase();
      if (severity === 'tidak ada' || severity === 'normal') {
        distribution.tidakAda++;
      } else if (severity === 'ringan' || severity === 'rendah') {
        distribution.ringan++;
      } else if (severity === 'sedang') {
        distribution.sedang++;
      } else if (severity === 'berat' || severity === 'parah') {
        distribution.berat++;
      } else if (severity === 'sangat berat' || severity === 'proliferative dr') {
        distribution.sangatBerat++;
      } else {
        // Fallback berdasarkan severityLevel jika ada
        const level = analysis.severityLevel || 0;
        if (level === 0) distribution.tidakAda++;
        else if (level === 1) distribution.ringan++;
        else if (level === 2) distribution.sedang++;
        else if (level === 3) distribution.berat++;
        else if (level === 4) distribution.sangatBerat++;
        else distribution.ringan++; // Default fallback
      }
    });
    
    return distribution;
  };
  
  const severityDistribution = calculateSeverityDistribution();
  const totalAnalyses = patientAnalyses.length;

  // Fungsi untuk mengunduh PDF
  const handleDownloadPdf = async () => {
    try {
      if (!patientData || !patientAnalyses[selectedAnalysisIndex]) {
        return;
      }
      
      setIsPdfLoading(true);
      
      const analysis = patientAnalyses[selectedAnalysisIndex];
      const patient = patientData;
      
      // Buat PDF langsung dengan jsPDF
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

      // Fungsi untuk membuat gradient background pada rectangle
      const drawGradientRect = (x, y, width, height, color1, color2, direction = 'horizontal') => {
        const totalSteps = 20;
        const stepSize = direction === 'horizontal' ? width / totalSteps : height / totalSteps;
        
        for (let i = 0; i < totalSteps; i++) {
          const ratio = i / (totalSteps - 1);
          const r = Math.floor(color1.r + ratio * (color2.r - color1.r));
          const g = Math.floor(color1.g + ratio * (color2.g - color1.g));
          const b = Math.floor(color1.b + ratio * (color2.b - color1.b));
          
          pdf.setFillColor(r, g, b);
          
          if (direction === 'horizontal') {
            pdf.rect(x + (i * stepSize), y, stepSize, height, 'F');
          } else {
            pdf.rect(x, y + (i * stepSize), width, stepSize, 'F');
          }
        }
      };
      
      // Fungsi untuk membuat rounded rectangle
      const drawRoundedRect = (x, y, width, height, radius, fillColor, strokeColor = null) => {
        // Simpan state
        const oldFillColor = pdf.getFillColor();
        
        // Set fill color
        if (fillColor) {
          pdf.setFillColor(fillColor.r, fillColor.g, fillColor.b);
        }
        
        // Set stroke color jika ada
        if (strokeColor) {
          pdf.setDrawColor(strokeColor.r, strokeColor.g, strokeColor.b);
          pdf.setLineWidth(0.5);
        }
        
        // Draw rounded rectangle
        pdf.roundedRect(x, y, width, height, radius, radius, fillColor ? 'F' : strokeColor ? 'D' : 'FD');
        
        // Restore state
        pdf.setFillColor(oldFillColor);
      };
      
      // Warna untuk gradient
      const primaryColor = { r: 79, g: 70, b: 229 }; // Indigo-600
      const secondaryColor = { r: 139, g: 92, b: 246 }; // Violet-500
      const lightBlueColor = { r: 219, g: 234, b: 254 }; // Blue-100
      const whiteColor = { r: 255, g: 255, b: 255 };
      const lightGrayColor = { r: 243, g: 244, b: 246 }; // Gray-100
      
      // Background gradient untuk seluruh halaman
      drawGradientRect(0, 0, pageWidth, pageHeight, 
        { r: 249, g: 250, b: 251 }, // Gray-50
        { r: 243, g: 244, b: 246 }, // Gray-100
        'vertical'
      );
      
      // Header dengan gradient
      drawGradientRect(0, 0, pageWidth, 50, primaryColor, secondaryColor, 'horizontal');
      
      // Tambahkan efek bayangan di bawah header (simulasi dengan rectangle semi-transparan)
      pdf.setFillColor(0, 0, 0);
      pdf.setGState(new pdf.GState({ opacity: 0.05 }));
      pdf.rect(0, 50, pageWidth, 3, 'F');
      pdf.setGState(new pdf.GState({ opacity: 1 }));
      
      // Logo atau icon (simulasi dengan lingkaran)
      pdf.setFillColor(255, 255, 255);
      pdf.circle(margin + 5, 25, 8, 'F');
      
      // Judul dan tanggal
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont(undefined, 'bold');
      pdf.text('Laporan Pemeriksaan Retina', pageWidth / 2, 25, { align: 'center' });
      
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Tanggal: ${formatDate(analysis.createdAt)}`, pageWidth / 2, 35, { align: 'center' });
      
      let yPos = 65;
      
      // Informasi pasien dengan card design
      drawRoundedRect(margin, yPos, pageWidth - (margin * 2), 40, 4, whiteColor);
      
      // Gradient strip di sisi kiri card
      drawGradientRect(margin, yPos, 5, 40, primaryColor, secondaryColor, 'vertical');
      
      pdf.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Informasi Pasien', margin + 15, yPos + 12);
      
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(60, 60, 60);
      pdf.text(`Nama: ${patient.fullName || patient.name}`, margin + 15, yPos + 22);
      pdf.text(`Jenis Kelamin: ${patient.gender === 'male' ? 'Laki-laki' : 'Perempuan'}, Umur: ${patient.age || '-'} tahun`, margin + 15, yPos + 30);
      
      yPos += 50;
      
      // Hasil analisis dengan card design
      drawRoundedRect(margin, yPos, pageWidth - (margin * 2), 60, 4, whiteColor);
      
      // Gradient strip di sisi kiri card
      drawGradientRect(margin, yPos, 5, 60, primaryColor, secondaryColor, 'vertical');
      
      pdf.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Hasil Analisis', margin + 15, yPos + 12);
      
      // Tingkat keparahan
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(60, 60, 60);
      pdf.text('Tingkat Keparahan:', margin + 15, yPos + 25);
      
      // Set warna berdasarkan tingkat keparahan dan buat badge
      const severityLevel = analysis.severity.toLowerCase();
      let severityColor;
      
      if (severityLevel === 'ringan' || severityLevel === 'rendah') {
        severityColor = { r: 34, g: 197, b: 94 }; // Green-500
      } else if (severityLevel === 'sedang') {
        severityColor = { r: 234, g: 179, b: 8 }; // Yellow-500
      } else if (severityLevel === 'berat' || severityLevel === 'parah' || severityLevel === 'sangat berat') {
        severityColor = { r: 239, g: 68, b: 68 }; // Red-500
      } else {
        severityColor = { r: 59, g: 130, b: 246 }; // Blue-500
      }
      
      // Badge untuk severity
      const severityText = analysis.severity;
      const textWidth = pdf.getStringUnitWidth(severityText) * pdf.getFontSize() / pdf.internal.scaleFactor;
      const badgeWidth = textWidth + 10;
      
      drawRoundedRect(margin + 55, yPos + 21, badgeWidth, 8, 4, 
        { r: severityColor.r, g: severityColor.g, b: severityColor.b, a: 0.1 }
      );
      
      pdf.setTextColor(severityColor.r, severityColor.g, severityColor.b);
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'bold');
      pdf.text(severityText, margin + 60, yPos + 26);
      
      // Tingkat kepercayaan
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(60, 60, 60);
      pdf.text(`Tingkat Kepercayaan: ${(analysis.confidence * 100).toFixed(1)}%`, margin + 15, yPos + 40);
      
      // Progress bar untuk confidence dengan gradient
      const barWidth = 80;
      const barHeight = 6;
      const confidenceWidth = barWidth * analysis.confidence;
      
      // Background bar
      drawRoundedRect(margin + 90, yPos + 37, barWidth, barHeight, 3, lightGrayColor);
      
      // Filled bar dengan gradient
      if (confidenceWidth > 0) {
        drawGradientRect(margin + 90, yPos + 37, confidenceWidth, barHeight, primaryColor, secondaryColor, 'horizontal');
      }
      
      yPos += 70;
      
      // Gambar
      if (analysis.imageData) {
        try {
          // Tambahkan gambar jika tersedia dengan border dan shadow effect
          const imgWidth = 120;
          const imgHeight = 120;
          const imgX = pageWidth / 2 - imgWidth / 2;
          
          // Shadow effect (rectangle semi-transparan di bawah gambar)
          pdf.setFillColor(0, 0, 0);
          pdf.setGState(new pdf.GState({ opacity: 0.1 }));
          pdf.roundedRect(imgX + 2, yPos + 2, imgWidth, imgHeight, 2, 2, 'F');
          pdf.setGState(new pdf.GState({ opacity: 1 }));
          
          // Border untuk gambar
          drawRoundedRect(imgX, yPos, imgWidth, imgHeight, 2, whiteColor);
          
          // Gambar
          pdf.addImage(analysis.imageData, 'JPEG', imgX, yPos, imgWidth, imgHeight);
          
          yPos += imgHeight + 15;
          
          // Tambahkan label gambar dengan style yang lebih modern
          pdf.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b, 0.1);
          const labelWidth = 80;
          pdf.roundedRect(pageWidth / 2 - labelWidth / 2, yPos - 10, labelWidth, 8, 4, 4, 'F');
          
          pdf.setFontSize(9);
          pdf.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
          pdf.text('Gambar Retina', pageWidth / 2, yPos - 5, { align: 'center' });
          
          yPos += 15;
        } catch (imgError) {
          console.error('Error adding image to PDF:', imgError);
          // Lanjutkan tanpa gambar jika gagal
          yPos += 10;
        }
      }
      
      // Rekomendasi dengan card design
      drawRoundedRect(margin, yPos, pageWidth - (margin * 2), 50, 4, whiteColor);
      
      // Gradient strip di sisi kiri card
      drawGradientRect(margin, yPos, 5, 50, primaryColor, secondaryColor, 'vertical');
      
      pdf.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Rekomendasi', margin + 15, yPos + 12);
      
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(60, 60, 60);
      
      let recommendation = '';
      if (analysis.notes) {
        recommendation = analysis.notes;
      } else if (severityLevel === 'tidak ada' || severityLevel === 'normal') {
        recommendation = 'Lakukan pemeriksaan rutin setiap tahun.';
      } else if (severityLevel === 'ringan' || severityLevel === 'rendah') {
        recommendation = 'Kontrol gula darah dan tekanan darah. Pemeriksaan ulang dalam 9-12 bulan.';
      } else if (severityLevel === 'sedang') {
        recommendation = 'Konsultasi dengan dokter spesialis mata. Pemeriksaan ulang dalam 6 bulan.';
      } else if (severityLevel === 'berat' || severityLevel === 'parah') {
        recommendation = 'Rujukan segera ke dokter spesialis mata. Pemeriksaan ulang dalam 2-3 bulan.';
      } else if (severityLevel === 'sangat berat' || severityLevel === 'proliferative dr') {
        recommendation = 'Rujukan segera ke dokter spesialis mata untuk evaluasi dan kemungkinan tindakan laser atau operasi.';
      } else {
        recommendation = 'Lakukan pemeriksaan rutin setiap tahun.';
      }
      
      yPos = addWrappedText(recommendation, margin + 15, yPos + 22, pageWidth - (margin * 2) - 30, 5);
      yPos += 20;
      
      // Disclaimer dengan style yang lebih modern
      drawRoundedRect(margin, yPos, pageWidth - (margin * 2), 30, 4, 
        { r: 254, g: 242, b: 242 } // Red-50
      );
      
      pdf.setFontSize(8);
      pdf.setTextColor(239, 68, 68); // Red-500
      const disclaimer = 'Disclaimer: Hasil analisis ini merupakan bantuan diagnostik berbasis AI dan tidak menggantikan diagnosis dari dokter. Selalu konsultasikan dengan tenaga medis profesional untuk diagnosis dan penanganan yang tepat.';
      addWrappedText(disclaimer, margin + 10, yPos + 10, pageWidth - (margin * 2) - 20, 4);
      
      // Footer dengan gradient
      drawGradientRect(0, pageHeight - 25, pageWidth, 25, primaryColor, secondaryColor, 'horizontal');
      
      // Logo RetinaScan di footer (simulasi dengan lingkaran)
      pdf.setFillColor(255, 255, 255);
      pdf.circle(margin + 10, pageHeight - 12.5, 4, 'F');
      
      pdf.setFontSize(9);
      pdf.setTextColor(255, 255, 255);
      pdf.text(`RetinaScan © ${new Date().getFullYear()} | AI-Powered Retinopathy Detection`, pageWidth / 2, pageHeight - 15, { align: 'center' });
      
      // QR code simulasi (kotak kecil di pojok kanan bawah)
      pdf.setFillColor(255, 255, 255);
      pdf.rect(pageWidth - margin - 10, pageHeight - 20, 10, 10, 'F');
      
      // Nama file
      const fileName = `RetinaScan_${patient.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Simpan PDF
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Gagal membuat PDF. Silakan coba lagi.');
    } finally {
      setIsPdfLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto">
        {/* Header with back button */}
        <motion.div 
          className="flex items-center mb-8"
          initial="hidden"
          animate="visible"
          variants={fadeInVariants}
        >
          <motion.button 
            onClick={handleBack}
            className="mr-4 p-3 rounded-full bg-white shadow-md hover:shadow-lg hover:bg-gray-50 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiArrowLeft className="text-indigo-600" size={20} />
          </motion.button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
              Riwayat Pasien
            </h1>
            <p className="text-gray-500 mt-1">
              Melihat riwayat pemeriksaan dan analisis retina pasien
            </p>
          </div>
        </motion.div>
        
        {isLoading ? (
          <motion.div 
            className="flex justify-center items-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col items-center">
              <div className="relative h-20 w-20">
                <div className="absolute inset-0 rounded-full border-t-4 border-b-4 border-indigo-500 animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-r-4 border-l-4 border-violet-300 animate-spin animate-reverse"></div>
              </div>
              <p className="text-gray-500 mt-4 font-medium">Memuat data pasien...</p>
            </div>
          </motion.div>
        ) : error ? (
          <motion.div 
            className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-8 text-center border border-white/20"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <FiAlertTriangle className="text-amber-500 text-6xl mx-auto mb-4" />
            </motion.div>
            <motion.h3 variants={itemVariants} className="text-xl font-medium text-gray-800 mb-2">
              {error}
            </motion.h3>
            <motion.p variants={itemVariants} className="text-gray-600 mb-6">
              Tidak dapat menemukan riwayat analisis untuk pasien ini.
            </motion.p>
            <motion.button
              variants={itemVariants}
              onClick={handleBack}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:shadow-lg hover:from-indigo-700 hover:to-violet-700 transition-all"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Kembali ke Daftar Pasien
            </motion.button>
          </motion.div>
        ) : patientData && patientAnalyses.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {/* Patient Info Card */}
            <motion.div 
              className="lg:col-span-1"
              variants={itemVariants}
            >
              <motion.div 
                className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6 mb-6 border border-white/20"
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1)" }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent mb-4 flex items-center">
                  <FiUser className="mr-2 text-indigo-500" />
                  Informasi Pasien
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3 flex-shrink-0">
                      <FiUser className="text-indigo-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Nama Lengkap</p>
                      <p className="font-medium text-gray-800">{patientData.fullName || patientData.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3 flex-shrink-0">
                      <FiActivity className="text-indigo-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Jenis Kelamin</p>
                      <p className="font-medium text-gray-800">{patientData.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3 flex-shrink-0">
                      <FiCalendar className="text-indigo-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Usia</p>
                      <p className="font-medium text-gray-800">{patientData.age || '-'} tahun</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3 flex-shrink-0">
                      <FiCalendar className="text-indigo-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Tanggal Lahir</p>
                      <p className="font-medium text-gray-800">
                        {patientData.dateOfBirth ? formatDate(patientData.dateOfBirth).split(',')[0] : '-'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3 flex-shrink-0">
                      <FiEye className="text-indigo-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Pemindaian</p>
                      <p className="font-medium text-gray-800">{totalAnalyses} kali</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3 flex-shrink-0">
                      <FiClock className="text-indigo-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Pemindaian Terakhir</p>
                      <p className="font-medium text-gray-800">
                        {patientAnalyses[0] ? formatDate(patientAnalyses[0].createdAt) : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Analysis History List */}
              <motion.div 
                className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6 border border-white/20"
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1)" }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent mb-4 flex items-center">
                  <FiFileText className="mr-2 text-indigo-500" />
                  Riwayat Pemindaian
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  <AnimatePresence>
                    {patientAnalyses.map((analysis, index) => (
                      <motion.div 
                        key={analysis.id}
                        onClick={() => setSelectedAnalysisIndex(index)}
                        className={`p-4 rounded-xl cursor-pointer transition-all ${
                          selectedAnalysisIndex === index 
                            ? 'bg-gradient-to-r from-indigo-50 to-violet-50 border-l-4 border-indigo-500 shadow-md' 
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        whileHover={{ 
                          scale: 1.02,
                          boxShadow: selectedAnalysisIndex === index ? "0 8px 15px -3px rgba(99, 102, 241, 0.2)" : "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {formatDate(analysis.createdAt)}
                            </p>
                            <div className="flex items-center mt-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityBadge(analysis.severity)}`}>
                                {analysis.severity}
                              </span>
                              <div className="flex items-center ml-2 bg-white/80 px-2 py-1 rounded-full">
                                <div className="w-2 h-2 rounded-full bg-indigo-500 mr-1"></div>
                                <span className="text-xs text-gray-600">
                                  {(analysis.confidence * 100).toFixed(0)}% keyakinan
                                </span>
                              </div>
                            </div>
                          </div>
                          {selectedAnalysisIndex === index && (
                            <div className="h-3 w-3 rounded-full bg-indigo-500 animate-pulse"></div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
            
            {/* Analysis Details */}
            <motion.div 
              className="lg:col-span-2"
              variants={itemVariants}
            >
              {patientAnalyses[selectedAnalysisIndex] && (
                <motion.div 
                  className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6 border border-white/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  key={patientAnalyses[selectedAnalysisIndex].id}
                  layoutId={`analysis-${patientAnalyses[selectedAnalysisIndex].id}`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
                      Detail Analisis
                    </h3>
                    <div className="flex space-x-2">
                      <motion.button
                        onClick={handleDownloadPdf}
                        disabled={isPdfLoading}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
                        title="Unduh PDF"
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {isPdfLoading ? (
                          <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                        ) : (
                          <FiDownload size={18} />
                        )}
                      </motion.button>
                      <motion.button
                        onClick={(e) => handleDelete(patientAnalyses[selectedAnalysisIndex].id, e)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-all"
                        title="Hapus Analisis"
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FiTrash size={18} />
                      </motion.button>
                    </div>
                  </div>
                  
                  {/* Image Preview */}
                  <motion.div 
                    className="bg-gradient-to-br from-gray-50 to-indigo-50 p-6 rounded-xl mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-gray-700 mb-2">Gambar Retina</p>
                      <motion.button 
                        onClick={() => {
                          const imgEl = document.getElementById('retina-image');
                          if (imgEl) {
                            delete imgEl.dataset.fallbackAttempted;
                            setImageStatus('loading');
                            setImageLoadAttempt(prev => prev + 1);
                            
                            // Enforce re-rendering with a small delay
                            setTimeout(() => {
                              if (patientAnalyses[selectedAnalysisIndex].imagePath) {
                              imgEl.src = formatImageUrl(patientAnalyses[selectedAnalysisIndex].imagePath);
                              } else if (patientAnalyses[selectedAnalysisIndex].imageData) {
                                imgEl.src = patientAnalyses[selectedAnalysisIndex].imageData;
                              }
                            }, 50);
                          }
                        }}
                        className="px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-lg text-xs flex items-center shadow-md hover:shadow-lg"
                        title="Muat ulang gambar"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FiRefreshCcw className="mr-1.5" /> Refresh
                      </motion.button>
                    </div>
                    
                    {/* Debug info panel (tersembunyi) */}
                    <div id="debug-image-info" className="mb-2 p-2 bg-gray-700 text-white text-xs rounded hidden">
                      {patientAnalyses[selectedAnalysisIndex].imagePath && (
                        <>
                          <p><strong>Original:</strong> {patientAnalyses[selectedAnalysisIndex].imagePath}</p>
                          <p><strong>Filename:</strong> {patientAnalyses[selectedAnalysisIndex].imagePath.split(/[\/\\]/).pop()}</p>
                          <p><strong>URL:</strong> {formatImageUrl(patientAnalyses[selectedAnalysisIndex].imagePath)}</p>
                        </>
                      )}
                    </div>
                    
                    <div className="relative aspect-w-16 aspect-h-9 bg-white/50 rounded-lg overflow-hidden shadow-inner mt-2">
                      {patientAnalyses[selectedAnalysisIndex] ? (
                        <>
                          {imageStatus === 'loading' && (
                            <motion.div 
                              className="absolute inset-0 flex items-center justify-center z-10 bg-gray-100/80"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              <div className="flex flex-col items-center space-y-2">
                                <div className="relative h-12 w-12">
                                  <div className="absolute inset-0 rounded-full border-t-2 border-b-2 border-indigo-500 animate-spin"></div>
                                  <div className="absolute inset-1 rounded-full border-r-2 border-l-2 border-violet-300 animate-spin animate-reverse"></div>
                                </div>
                                <p className="text-xs text-gray-600">Memuat gambar...</p>
                              </div>
                            </motion.div>
                          )}
                          <motion.img 
                            id="retina-image"
                            src={patientAnalyses[selectedAnalysisIndex].imageData || activeImageUrl || DEFAULT_IMAGE}
                            alt="Retina scan"
                            className="object-contain w-full h-full"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ 
                              opacity: imageStatus === 'success' ? 1 : 0.7,
                              scale: imageStatus === 'success' ? 1 : 0.95
                            }}
                            transition={{ duration: 0.3 }}
                            onLoad={() => setImageStatus('success')}
                            onError={(e) => {
                              console.error('Error loading image:', e.target.src.substring(0, 50) + '...');
                              
                              // Stop onError dari berjalan lagi untuk mencegah infinite loop
                              e.target.onerror = null;
                              
                              // Tandai error dan gunakan gambar default
                              setImageStatus('error');
                              
                              // Prioritaskan imageData (base64) jika tersedia
                              if (patientAnalyses[selectedAnalysisIndex].imageData) {
                                console.log('Menggunakan data base64 dari database');
                                
                                // Pastikan imageData adalah string base64 yang valid
                                const imageData = patientAnalyses[selectedAnalysisIndex].imageData;
                                if (imageData && imageData.startsWith('data:')) {
                                  e.target.src = imageData;
                                  return;
                                }
                              }
                              
                              // Coba file path sebagai alternatif jika yang gagal adalah base64
                              if (activeImageUrl) {
                                console.log('Mencoba menggunakan URL file sebagai fallback');
                                e.target.src = activeImageUrl;
                                return;
                              }
                              
                              // Gunakan gambar not-found.jpg sebagai fallback terakhir
                              e.target.src = DEFAULT_IMAGE;
                              console.log('Menggunakan gambar tidak ditemukan:', DEFAULT_IMAGE);
                            }}
                          />
                          
                          {imageStatus === 'error' && (
                            <motion.div 
                              className="absolute bottom-0 left-0 right-0 bg-red-500/90 p-2 text-xs text-white text-center"
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            >
                              Gagal memuat gambar. Silakan coba tombol Refresh atau API alternatif.
                            </motion.div>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-gray-500 text-sm">Gambar tidak tersedia</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                  
                  {/* Analysis Details */}
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    variants={containerVariants}
                  >
                    <motion.div 
                      className="bg-gradient-to-br from-gray-50 to-indigo-50 p-4 rounded-xl shadow-sm"
                      whileHover={{ y: -3, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                      variants={itemVariants}
                    >
                      <p className="text-sm font-medium text-gray-700 mb-2">Nama File</p>
                      <p className="text-base font-medium break-words text-gray-800">
                        {patientAnalyses[selectedAnalysisIndex].originalFilename}
                      </p>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-gradient-to-br from-gray-50 to-indigo-50 p-4 rounded-xl shadow-sm"
                      whileHover={{ y: -3, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                      variants={itemVariants}
                    >
                      <p className="text-sm font-medium text-gray-700 mb-2">Tingkat Keparahan</p>
                      <span className={`px-4 py-1.5 rounded-full text-sm inline-block font-medium ${
                        getSeverityBadge(patientAnalyses[selectedAnalysisIndex].severity)
                      }`}>
                        {patientAnalyses[selectedAnalysisIndex].severity}
                      </span>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-gradient-to-br from-gray-50 to-indigo-50 p-4 rounded-xl shadow-sm"
                      whileHover={{ y: -3, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                      variants={itemVariants}
                    >
                      <p className="text-sm font-medium text-gray-700 mb-2">Tingkat Kepercayaan</p>
                      <div className="flex items-center">
                        <div className="w-full bg-white/60 rounded-full h-3 mr-2 overflow-hidden">
                          <motion.div 
                            className="bg-gradient-to-r from-indigo-500 to-violet-500 h-3 rounded-full" 
                            initial={{ width: 0 }}
                            animate={{ width: `${(patientAnalyses[selectedAnalysisIndex].confidence * 100).toFixed(0)}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          ></motion.div>
                        </div>
                        <span className="text-base font-medium min-w-[60px] text-right text-indigo-700">
                          {(patientAnalyses[selectedAnalysisIndex].confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-gradient-to-br from-gray-50 to-indigo-50 p-4 rounded-xl shadow-sm"
                      whileHover={{ y: -3, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                      variants={itemVariants}
                    >
                      <p className="text-sm font-medium text-gray-700 mb-2">Tanggal Analisis</p>
                      <p className="text-base font-medium text-gray-800 flex items-center">
                        <FiCalendar className="mr-2 text-indigo-500" />
                        {formatDate(patientAnalyses[selectedAnalysisIndex].createdAt)}
                      </p>
                    </motion.div>
                  </motion.div>
                  
                  {/* Notes */}
                  {patientAnalyses[selectedAnalysisIndex].notes && (
                    <motion.div 
                      className="bg-gradient-to-br from-gray-50 to-indigo-50 p-4 rounded-xl shadow-sm mb-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <p className="text-sm font-medium text-gray-700 mb-2">Catatan</p>
                      <p className="text-base text-gray-800">
                        {patientAnalyses[selectedAnalysisIndex].notes}
                      </p>
                    </motion.div>
                  )}
                  
                  {/* Recommendations based on severity */}
                  <motion.div 
                    className="bg-gradient-to-r from-indigo-50 to-violet-50 p-6 rounded-xl shadow-sm border border-indigo-100"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <p className="text-sm font-medium text-indigo-800 mb-2 flex items-center">
                      <FiFileText className="mr-2" />
                      Rekomendasi
                    </p>
                    <p className="text-base text-indigo-700">
                      {patientAnalyses[selectedAnalysisIndex].notes ? (
                        patientAnalyses[selectedAnalysisIndex].notes
                      ) : patientAnalyses[selectedAnalysisIndex].severity.toLowerCase() === 'tidak ada' ? (
                        'Lakukan pemeriksaan rutin setiap tahun.'
                      ) : patientAnalyses[selectedAnalysisIndex].severity.toLowerCase() === 'ringan' ? (
                        'Kontrol gula darah dan tekanan darah. Pemeriksaan ulang dalam 9-12 bulan.'
                      ) : patientAnalyses[selectedAnalysisIndex].severity.toLowerCase() === 'sedang' ? (
                        'Konsultasi dengan dokter spesialis mata. Pemeriksaan ulang dalam 6 bulan.'
                      ) : patientAnalyses[selectedAnalysisIndex].severity.toLowerCase() === 'berat' ? (
                        'Rujukan segera ke dokter spesialis mata. Pemeriksaan ulang dalam 2-3 bulan.'
                      ) : patientAnalyses[selectedAnalysisIndex].severity.toLowerCase() === 'sangat berat' ? (
                        'Rujukan segera ke dokter spesialis mata untuk evaluasi dan kemungkinan tindakan laser atau operasi.'
                      ) : (
                        'Lakukan pemeriksaan rutin setiap tahun.'
                      )}
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-8 text-center border border-white/20"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <FiAlertTriangle className="text-amber-500 text-6xl mx-auto mb-4" />
            </motion.div>
            <motion.h3 variants={itemVariants} className="text-xl font-medium text-gray-800 mb-2">
              Data Tidak Ditemukan
            </motion.h3>
            <motion.p variants={itemVariants} className="text-gray-600 mb-6">
              Tidak dapat menemukan data pasien atau riwayat analisis.
            </motion.p>
            <motion.button
              variants={itemVariants}
              onClick={handleBack}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:shadow-lg hover:from-indigo-700 hover:to-violet-700 transition-all"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Kembali ke Daftar Pasien
            </motion.button>
          </motion.div>
        )}
      </div>
      
      {/* Confirmation Dialog for Delete */}
      <AnimatePresence>
        {showConfirmDelete && (
          <motion.div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Konfirmasi Hapus</h3>
              <p className="text-gray-600 mb-6">Apakah Anda yakin ingin menghapus analisis ini? Tindakan ini tidak dapat dibatalkan.</p>
              <div className="flex justify-end space-x-3">
                <motion.button
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Batal
                </motion.button>
                <motion.button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Hapus
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default withPageTransition(PatientHistoryPageComponent); 