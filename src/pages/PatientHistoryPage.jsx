import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { withPageTransition } from '../context/ThemeContext';
import { useTheme } from '../context/ThemeContext';
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
  FiInfo,
  FiCheck,
  FiEye,
  FiActivity,
  FiAlertCircle,
  FiClock,
  FiCalendar,
  FiPhone
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

function PatientHistoryPageComponent() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { theme, isDarkMode } = useTheme();
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

  // Glassmorphism style berdasarkan tema
  const glassEffect = {
    background: isDarkMode 
      ? 'rgba(17, 24, 39, 0.7)' 
      : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    boxShadow: isDarkMode 
      ? '0 8px 32px 0 rgba(0, 0, 0, 0.2)' 
      : '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
    border: isDarkMode 
      ? '1px solid rgba(255, 255, 255, 0.05)' 
      : '1px solid rgba(255, 255, 255, 0.18)',
  };

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
      return isDarkMode 
        ? 'bg-blue-900/50 text-blue-200' 
        : 'bg-blue-100 text-blue-800';
    } else if (severityLower === 'ringan' || severityLower === 'rendah') {
      return isDarkMode 
        ? 'bg-green-900/50 text-green-200' 
        : 'bg-green-100 text-green-800';
    } else if (severityLower === 'sedang') {
      return isDarkMode 
        ? 'bg-yellow-900/50 text-yellow-200' 
        : 'bg-yellow-100 text-yellow-800';
    } else if (severityLower === 'berat' || severityLower === 'parah') {
      return isDarkMode 
        ? 'bg-orange-900/50 text-orange-200' 
        : 'bg-orange-100 text-orange-800';
    } else if (severityLower === 'sangat berat' || severityLower === 'proliferative dr') {
      return isDarkMode 
        ? 'bg-red-900/50 text-red-200' 
        : 'bg-red-100 text-red-800';
    } else {
      // Fallback berdasarkan severityLevel jika ada
      const level = parseInt(severity);
      if (!isNaN(level)) {
        if (level === 0) return isDarkMode ? 'bg-blue-900/50 text-blue-200' : 'bg-blue-100 text-blue-800';
        if (level === 1) return isDarkMode ? 'bg-green-900/50 text-green-200' : 'bg-green-100 text-green-800';
        if (level === 2) return isDarkMode ? 'bg-yellow-900/50 text-yellow-200' : 'bg-yellow-100 text-yellow-800';
        if (level === 3) return isDarkMode ? 'bg-orange-900/50 text-orange-200' : 'bg-orange-100 text-orange-800';
        if (level === 4) return isDarkMode ? 'bg-red-900/50 text-red-200' : 'bg-red-100 text-red-800';
      }
      return isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
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

  // Container animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  // Child animation
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 12 }
    }
  };

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
      
      // Header dengan gradient
      // Header
      pdf.setFillColor(37, 99, 235); // Warna biru
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      // Tambahkan lingkaran dekoratif di header
      pdf.setFillColor(96, 165, 250);  // Biru muda
      pdf.circle(15, 15, 8, 'F');
      pdf.setFillColor(147, 197, 253);  // Biru sangat muda
      pdf.circle(pageWidth - 15, 30, 5, 'F');
      
      // Tambahkan garis dekoratif
      pdf.setDrawColor(147, 197, 253);
      pdf.setLineWidth(0.5);
      pdf.line(margin, 38, pageWidth - margin, 38);
      
      pdf.setTextColor(255, 255, 255); // Warna putih untuk teks header
      pdf.setFontSize(24);
      pdf.setFont(undefined, 'bold');
      pdf.text('Laporan Riwayat Pemeriksaan', pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Tanggal: ${formatDate(analysis.createdAt)}`, pageWidth / 2, 30, { align: 'center' });
      
      let yPos = 50;
      
      // Fungsi untuk menggambar persegi panjang dengan sudut melengkung
      const drawRoundedRect = (x, y, width, height, radius, color) => {
        pdf.setFillColor(color);
        // Gambar persegi panjang dengan sudut melengkung
        pdf.roundedRect(x, y, width, height, radius, radius, 'F');
      };
      
      // Informasi pasien
      drawRoundedRect(margin, yPos, pageWidth - (margin * 2), 35, 3, '#f0f9ff');
      
      // Garis dekoratif di sisi kiri panel
      pdf.setFillColor('#3b82f6');
      pdf.rect(margin, yPos, 3, 35, 'F');
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Informasi Pasien', margin + 10, yPos + 10);
      
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(60, 60, 60);
      pdf.text(`Nama: ${patient.fullName || patient.name}`, margin + 10, yPos + 20);
      pdf.text(`Jenis Kelamin: ${patient.gender === 'male' ? 'Laki-laki' : 'Perempuan'}, Umur: ${patient.age || '-'} tahun`, pageWidth - margin - 10, yPos + 20, { align: 'right' });
      
      yPos += 45;
      
      // Hasil analisis
      drawRoundedRect(margin, yPos, pageWidth - (margin * 2), 60, 3, '#f0f7ff');
      
      // Warna garis dekoratif berdasarkan tingkat keparahan
      const severityLevel = analysis.severity.toLowerCase();
      let severityColor = '#3b82f6'; // Default: biru
      
      if (severityLevel === 'ringan' || severityLevel === 'rendah') {
        severityColor = '#10b981'; // Hijau
      } else if (severityLevel === 'sedang') {
        severityColor = '#f59e0b'; // Kuning
      } else if (severityLevel === 'berat' || severityLevel === 'parah') {
        severityColor = '#f97316'; // Orange
      } else if (severityLevel === 'sangat berat' || severityLevel === 'proliferative dr') {
        severityColor = '#ef4444'; // Merah
      }
      
      // Garis dekoratif di sisi kiri panel
      pdf.setFillColor(severityColor);
      pdf.rect(margin, yPos, 3, 60, 'F');
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Hasil Analisis', margin + 10, yPos + 10);
      
      // Tingkat keparahan
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(60, 60, 60);
      pdf.text('Tingkat Keparahan:', margin + 10, yPos + 25);
      
      // Set warna berdasarkan tingkat keparahan
      pdf.setTextColor(severityColor);
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text(analysis.severity, margin + 55, yPos + 25);
      
      // Badge untuk tingkat keparahan
      const badgeWidth = pdf.getStringUnitWidth(analysis.severity) * 5 + 10;
      drawRoundedRect(margin + 55 - 2, yPos + 25 - 10, badgeWidth, 12, 6, severityColor + '20');
      
      // Tingkat kepercayaan
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(60, 60, 60);
      pdf.text(`Tingkat Kepercayaan: ${(analysis.confidence * 100).toFixed(1)}%`, margin + 10, yPos + 40);
      
      // Progress bar dengan sudut melengkung untuk confidence
      const barWidth = 70;
      const barHeight = 6;
      const confidenceWidth = barWidth * analysis.confidence;
      
      // Background bar
      drawRoundedRect(margin + 65, yPos + 37, barWidth, barHeight, 3, '#e5e7eb');
      
      // Filled bar
      pdf.setFillColor(severityColor);
      if (confidenceWidth < barWidth) {
        drawRoundedRect(margin + 65, yPos + 37, confidenceWidth, barHeight, 3, severityColor);
      } else {
        // Jika 100%, pastikan sudut kanan juga melengkung
        drawRoundedRect(margin + 65, yPos + 37, barWidth, barHeight, 3, severityColor);
      }
      
      yPos += 70;
      
      // Gambar
      if (analysis.imageData) {
        try {
          // Tambahkan gambar jika tersedia
          const imgWidth = 100;
          const imgHeight = 100;
          
          // Tambahkan bingkai untuk gambar
          drawRoundedRect(pageWidth / 2 - imgWidth / 2 - 5, yPos - 5, imgWidth + 10, imgHeight + 10, 3, '#f3f4f6');
          pdf.addImage(analysis.imageData, 'JPEG', pageWidth / 2 - imgWidth / 2, yPos, imgWidth, imgHeight);
          
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
      drawRoundedRect(margin, yPos, pageWidth - (margin * 2), 50, 3, '#f0f9ff');
      
      // Garis dekoratif di sisi kiri panel
      pdf.setFillColor('#3b82f6');
      pdf.rect(margin, yPos, 3, 50, 'F');
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Rekomendasi', margin + 10, yPos + 10);
      
      pdf.setFontSize(11);
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
      
      yPos = addWrappedText(recommendation, margin + 10, yPos + 20, pageWidth - (margin * 2) - 20, 6);
      yPos += 15;
      
      // Disclaimer
      drawRoundedRect(margin, yPos, pageWidth - (margin * 2), 30, 3, '#f3f4f6');
      
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      const disclaimer = 'Disclaimer: Hasil analisis ini merupakan bantuan diagnostik berbasis AI dan tidak menggantikan diagnosis dari dokter. Selalu konsultasikan dengan tenaga medis profesional untuk diagnosis dan penanganan yang tepat.';
      yPos = addWrappedText(disclaimer, margin + 10, yPos + 10, pageWidth - (margin * 2) - 20, 5);
      
      // Footer
      pdf.setFillColor(37, 99, 235); // Warna biru
      pdf.rect(0, pageHeight - 20, pageWidth, 20, 'F');
      
      // Tambahkan lingkaran dekoratif di footer
      pdf.setFillColor(96, 165, 250);
      pdf.circle(pageWidth - 10, pageHeight - 10, 3, 'F');
      
      pdf.setFontSize(10);
      pdf.setTextColor(255, 255, 255);
      pdf.text(`RetinaScan © ${new Date().getFullYear()} | AI-Powered Retinopathy Detection`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      // Nama file yang lebih deskriptif
      const formattedDate = new Date().toISOString().split('T')[0];
      const patientName = patient.name.replace(/\s+/g, '_');
      const severityText = analysis.severity.toLowerCase().replace(/\s+/g, '_');
      const fileName = `RetinaScan_${patientName}_${severityText}_${formattedDate}.pdf`;
      
      // Simpan PDF
      pdf.save(fileName);
      
      // Tampilkan pesan sukses
      console.log('PDF berhasil dibuat:', fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Gagal membuat PDF. Silakan coba lagi.');
    } finally {
      setIsPdfLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with back button */}
        <motion.div 
          className="flex items-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button 
            onClick={handleBack}
            className={`mr-4 p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
          >
            <FiArrowLeft className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} size={20} />
          </button>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Riwayat Pasien</h1>
        </motion.div>
        
        {isLoading ? (
          <motion.div 
            className="flex justify-center items-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col items-center">
              <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${isDarkMode ? 'border-blue-400' : 'border-blue-500'} mb-3`}></div>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Memuat data pasien...</p>
            </div>
          </motion.div>
        ) : error ? (
          <motion.div 
            className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 text-center`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={glassEffect}
          >
            <FiAlertTriangle className="text-yellow-500 text-5xl mx-auto mb-4" />
            <h3 className={`text-xl font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2`}>{error}</h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>Tidak dapat menemukan riwayat analisis untuk pasien ini.</p>
            <button
              onClick={handleBack}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors`}
            >
              Kembali ke Daftar Pasien
            </button>
          </motion.div>
        ) : patientData && patientAnalyses.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Patient Info Card */}
            <div className="lg:col-span-1">
              <motion.div 
                className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 mb-6`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                style={glassEffect}
              >
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-4 flex items-center`}>
                  <FiUser className="mr-2 text-blue-500" />
                  Informasi Pasien
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Nama Lengkap</p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{patientData.fullName || patientData.name}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Jenis Kelamin</p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{patientData.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Usia</p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{patientData.age || '-'} tahun</p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tanggal Lahir</p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {patientData.dateOfBirth ? formatDate(patientData.dateOfBirth).split(',')[0] : '-'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Pemindaian</p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{totalAnalyses} kali</p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pemindaian Terakhir</p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {patientAnalyses[0] ? formatDate(patientAnalyses[0].createdAt) : '-'}
                    </p>
                  </div>
                </div>
              </motion.div>
              
              {/* Analysis History List */}
              <motion.div 
                className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={glassEffect}
              >
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-4 flex items-center`}>
                  <FiFileText className="mr-2 text-blue-500" />
                  Riwayat Pemindaian
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  {patientAnalyses.map((analysis, index) => (
                    <motion.div 
                      key={analysis.id}
                      onClick={() => setSelectedAnalysisIndex(index)}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        selectedAnalysisIndex === index 
                          ? isDarkMode 
                            ? 'bg-blue-900/30 border-l-4 border-blue-500' 
                            : 'bg-blue-50 border-l-4 border-blue-500' 
                          : isDarkMode
                            ? 'bg-gray-700/50 hover:bg-gray-700'
                            : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            {formatDate(analysis.createdAt)}
                          </p>
                          <div className="flex items-center mt-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${getSeverityBadge(analysis.severity)}`}>
                              {analysis.severity}
                            </span>
                            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} ml-2`}>
                              {(analysis.confidence * 100).toFixed(0)}% keyakinan
                            </span>
                          </div>
                        </div>
                        {selectedAnalysisIndex === index && (
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
            
            {/* Analysis Details */}
            <div className="lg:col-span-2">
              {patientAnalyses[selectedAnalysisIndex] && (
                <motion.div 
                  className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  style={glassEffect}
                  key={patientAnalyses[selectedAnalysisIndex].id}
                >
                  <div className="flex justify-between items-start mb-6">
                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Detail Analisis
                    </h3>
                    <div className="flex space-x-2">
                      <motion.button
                        onClick={handleDownloadPdf}
                        disabled={isPdfLoading}
                        className={`p-2 ${isDarkMode ? 'text-blue-400 hover:bg-blue-900/30' : 'text-blue-600 hover:bg-blue-50'} rounded-full transition-colors`}
                        title="Unduh PDF"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {isPdfLoading ? (
                          <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                        ) : (
                          <FiDownload size={18} />
                        )}
                      </motion.button>
                      <motion.button
                        onClick={(e) => handleDelete(patientAnalyses[selectedAnalysisIndex].id, e)}
                        className={`p-2 ${isDarkMode ? 'text-red-400 hover:bg-red-900/30' : 'text-red-600 hover:bg-red-50'} rounded-full transition-colors`}
                        title="Hapus Analisis"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FiTrash size={18} />
                      </motion.button>
                    </div>
                  </div>
                  
                  {/* Image Preview */}
                  <motion.div 
                    className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded-lg mb-6`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <div className="flex justify-between items-center">
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} mb-2`}>Gambar Retina</p>
                      <div className="flex gap-1">
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
                          className="px-2 py-1 bg-green-500 text-white rounded text-xs flex items-center hover:bg-green-600 transition-colors"
                          title="Muat ulang gambar"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FiRefreshCcw className="mr-1" /> Refresh
                        </motion.button>
                      </div>
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
                    
                    <div className={`relative aspect-w-16 aspect-h-9 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-lg overflow-hidden shadow-inner`}>
                      {patientAnalyses[selectedAnalysisIndex] ? (
                        <>
                          {imageStatus === 'loading' && (
                            <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-100/80 backdrop-blur-sm">
                              <div className="flex flex-col items-center space-y-2">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                <p className="text-xs text-gray-600">Memuat gambar...</p>
                              </div>
                            </div>
                          )}
                          <img 
                            id="retina-image"
                            src={patientAnalyses[selectedAnalysisIndex].imageData || activeImageUrl || DEFAULT_IMAGE}
                            alt="Retina scan"
                            className="object-cover w-full h-full transition-opacity duration-300"
                            style={{ opacity: imageStatus === 'success' ? 1 : 0.8 }}
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
                            <div className="absolute bottom-0 left-0 right-0 bg-red-500/80 p-2 text-xs text-white text-center backdrop-blur-sm">
                              Gagal memuat gambar. Silakan coba tombol Refresh atau API alternatif.
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Gambar tidak tersedia</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                  
                  {/* Analysis Details */}
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded-lg`}>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} mb-2`}>Nama File</p>
                      <p className={`text-base font-medium break-words ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        {patientAnalyses[selectedAnalysisIndex].originalFilename}
                      </p>
                    </div>
                    
                    <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded-lg`}>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} mb-2`}>Tingkat Keparahan</p>
                      <span className={`px-3 py-1 rounded-full text-sm inline-block ${
                        getSeverityBadge(patientAnalyses[selectedAnalysisIndex].severity)
                      }`}>
                        {patientAnalyses[selectedAnalysisIndex].severity}
                      </span>
                    </div>
                    
                    <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded-lg`}>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} mb-2`}>Tingkat Kepercayaan</p>
                      <div className="flex items-center">
                        <div className={`w-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-2.5 mr-2`}>
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${(patientAnalyses[selectedAnalysisIndex].confidence * 100).toFixed(0)}%` }}
                          ></div>
                        </div>
                        <span className={`text-base font-medium min-w-[60px] text-right ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          {(patientAnalyses[selectedAnalysisIndex].confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded-lg`}>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} mb-2`}>Tanggal Analisis</p>
                      <p className={`text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        {formatDate(patientAnalyses[selectedAnalysisIndex].createdAt)}
                      </p>
                    </div>
                  </motion.div>
                  
                  {/* Notes */}
                  {patientAnalyses[selectedAnalysisIndex].notes && (
                    <motion.div 
                      className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded-lg mb-6`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} mb-2`}>Catatan</p>
                      <p className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        {patientAnalyses[selectedAnalysisIndex].notes}
                      </p>
                    </motion.div>
                  )}
                  
                  {/* Recommendations based on severity */}
                  <motion.div 
                    className={`${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'} p-4 rounded-lg`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-800'} mb-2`}>Rekomendasi</p>
                    <p className={`text-base ${isDarkMode ? 'text-blue-100' : 'text-blue-700'}`}>
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
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 text-center`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={glassEffect}
          >
            <FiAlertTriangle className="text-yellow-500 text-5xl mx-auto mb-4" />
            <h3 className={`text-xl font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2`}>Data Tidak Ditemukan</h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>Tidak dapat menemukan data pasien atau riwayat analisis.</p>
            <motion.button
              onClick={handleBack}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
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
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-md w-full`}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={glassEffect}
            >
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2`}>Konfirmasi Hapus</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>Apakah Anda yakin ingin menghapus analisis ini? Tindakan ini tidak dapat dibatalkan.</p>
              <div className="flex justify-end space-x-3">
                <motion.button
                  onClick={() => setShowConfirmDelete(false)}
                  className={`px-4 py-2 ${isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} rounded-lg transition-colors`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Batal
                </motion.button>
                <motion.button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
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

// Tambahkan CSS untuk custom scrollbar
const style = document.createElement('style');
style.textContent = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(107, 114, 128, 0.5);
    border-radius: 20px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(107, 114, 128, 0.7);
  }
  
  /* Untuk tema gelap */
  .dark .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.3);
  }
  
  .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(156, 163, 175, 0.5);
  }
`;
document.head.appendChild(style); 