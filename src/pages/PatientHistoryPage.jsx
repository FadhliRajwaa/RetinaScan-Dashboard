import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { withPageTransition, useTheme } from '../context/ThemeContext';
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
  FiDownload
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
  const { theme, isDarkMode } = useTheme();
  
  // Get theme-specific colors
  const currentTheme = isDarkMode ? theme.dark : theme.light;

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
      return isDarkMode ? 'bg-blue-900/40 text-blue-200' : 'bg-blue-100 text-blue-800';
    } else if (severityLower === 'ringan' || severityLower === 'rendah') {
      return isDarkMode ? 'bg-green-900/40 text-green-200' : 'bg-green-100 text-green-800';
    } else if (severityLower === 'sedang') {
      return isDarkMode ? 'bg-yellow-900/40 text-yellow-200' : 'bg-yellow-100 text-yellow-800';
    } else if (severityLower === 'berat' || severityLower === 'parah') {
      return isDarkMode ? 'bg-orange-900/40 text-orange-200' : 'bg-orange-100 text-orange-800';
    } else if (severityLower === 'sangat berat' || severityLower === 'proliferative dr') {
      return isDarkMode ? 'bg-red-900/40 text-red-200' : 'bg-red-100 text-red-800';
    } else {
      // Fallback berdasarkan severityLevel jika ada
      const level = parseInt(severity);
      if (!isNaN(level)) {
        if (level === 0) return isDarkMode ? 'bg-blue-900/40 text-blue-200' : 'bg-blue-100 text-blue-800';
        if (level === 1) return isDarkMode ? 'bg-green-900/40 text-green-200' : 'bg-green-100 text-green-800';
        if (level === 2) return isDarkMode ? 'bg-yellow-900/40 text-yellow-200' : 'bg-yellow-100 text-yellow-800';
        if (level === 3) return isDarkMode ? 'bg-orange-900/40 text-orange-200' : 'bg-orange-100 text-orange-800';
        if (level === 4) return isDarkMode ? 'bg-red-900/40 text-red-200' : 'bg-red-100 text-red-800';
      }
      return isDarkMode ? 'bg-gray-800/40 text-gray-200' : 'bg-gray-100 text-gray-800';
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
      
      // Header
      pdf.setFillColor(37, 99, 235); // Warna biru
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      pdf.setTextColor(255, 255, 255); // Warna putih untuk teks header
      pdf.setFontSize(24);
      pdf.setFont(undefined, 'bold');
      pdf.text('Laporan Riwayat Pemeriksaan', pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Tanggal: ${formatDate(analysis.createdAt)}`, pageWidth / 2, 30, { align: 'center' });
      
      let yPos = 50;
      
      // Informasi pasien
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
      pdf.text(`Jenis Kelamin: ${patient.gender === 'male' ? 'Laki-laki' : 'Perempuan'}, Umur: ${patient.age || '-'} tahun`, pageWidth - margin - 5, yPos + 20, { align: 'right' });
      
      yPos += 40;
      
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
      const severityLevel = analysis.severity.toLowerCase();
      if (severityLevel === 'ringan' || severityLevel === 'rendah') {
        pdf.setTextColor(39, 174, 96); // Hijau
      } else if (severityLevel === 'sedang') {
        pdf.setTextColor(241, 196, 15); // Kuning
      } else if (severityLevel === 'berat' || severityLevel === 'parah' || severityLevel === 'sangat berat') {
        pdf.setTextColor(231, 76, 60); // Merah
      } else {
        pdf.setTextColor(52, 152, 219); // Biru
      }
      
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text(analysis.severity, margin + 50, yPos + 25);
      
      // Tingkat kepercayaan
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(60, 60, 60);
      pdf.text(`Tingkat Kepercayaan: ${(analysis.confidence * 100).toFixed(1)}%`, margin + 5, yPos + 40);
      
      // Gambar bar untuk confidence
      const barWidth = 50;
      const confidenceWidth = barWidth * analysis.confidence;
      pdf.setFillColor(220, 220, 220); // Background bar
      pdf.rect(margin + 80, yPos + 37, barWidth, 5, 'F');
      pdf.setFillColor(37, 99, 235); // Filled bar
      pdf.rect(margin + 80, yPos + 37, confidenceWidth, 5, 'F');
      
      yPos += 60;
      
      // Gambar
      if (analysis.imageData) {
        try {
          // Tambahkan gambar jika tersedia
          const imgWidth = 100;
          const imgHeight = 100;
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

  // Glassmorphism style based on theme
  const glassEffect = isDarkMode ? theme.dark.glassEffect : theme.light.glassEffect;

  return (
    <div className={`p-4 sm:p-6 lg:p-8 ${isDarkMode ? 'dark' : ''}`}
         style={{ 
           background: isDarkMode 
             ? `linear-gradient(135deg, ${currentTheme.background}, ${currentTheme.backgroundAlt})` 
             : 'linear-gradient(135deg, #F9FAFB, #F3F4F6)'
         }}>
      <div className="max-w-7xl mx-auto">
        {/* Header with back button */}
        <motion.div 
          className="flex items-center mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.button 
            onClick={handleBack}
            className="mr-4 p-2 rounded-full"
            whileHover={theme.animations.smoothHover}
            whileTap={theme.animations.smoothTap}
            style={{ 
              backgroundColor: isDarkMode 
                ? 'rgba(255, 255, 255, 0.05)' 
                : 'rgba(0, 0, 0, 0.05)'
            }}
          >
            <FiArrowLeft className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} size={20} />
          </motion.button>
          <motion.h1 
            className="text-2xl font-bold"
            style={{ 
              background: isDarkMode 
                ? currentTheme.coolGradient 
                : currentTheme.primaryGradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Riwayat Pasien
          </motion.h1>
        </motion.div>
        
        {isLoading ? (
          <motion.div 
            className="flex justify-center items-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col items-center">
              <motion.div 
                className={`rounded-full h-12 w-12 border-t-2 border-b-2 ${isDarkMode ? 'border-blue-400' : 'border-blue-500'}`}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              ></motion.div>
              <p className={isDarkMode ? 'text-gray-300 mt-3' : 'text-gray-500 mt-3'}>Memuat data pasien...</p>
            </div>
          </motion.div>
        ) : error ? (
          <motion.div 
            className="rounded-lg p-6 text-center"
            style={{
              ...glassEffect,
              boxShadow: isDarkMode ? currentTheme.mediumShadow : '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <FiAlertTriangle className={`text-yellow-500 text-5xl mx-auto mb-4 ${isDarkMode ? 'opacity-80' : ''}`} />
            <h3 className={`text-xl font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{error}</h3>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Tidak dapat menemukan riwayat analisis untuk pasien ini.</p>
            <motion.button
              onClick={handleBack}
              className="px-4 py-2 text-white rounded-lg"
              style={{ 
                background: isDarkMode 
                  ? currentTheme.primaryGradient 
                  : currentTheme.primaryGradient,
                boxShadow: isDarkMode 
                  ? '0 4px 12px rgba(59, 130, 246, 0.3)' 
                  : '0 4px 12px rgba(59, 130, 246, 0.2)',
              }}
              whileHover={theme.animations.smoothHover}
              whileTap={theme.animations.smoothTap}
            >
              Kembali ke Daftar Pasien
            </motion.button>
          </motion.div>
        ) : patientData && patientAnalyses.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patient Info Card */}
            <div className="lg:col-span-1">
              <motion.div 
                className="rounded-lg p-6 mb-6"
                style={{
                  ...glassEffect,
                  boxShadow: isDarkMode ? currentTheme.mediumShadow : '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center"
                    style={{ 
                      color: isDarkMode ? currentTheme.text : currentTheme.text
                    }}>
                  <FiUser className="mr-2" style={{ color: isDarkMode ? currentTheme.accent : currentTheme.primary }} />
                  Informasi Pasien
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Nama Lengkap</p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : ''}`}>{patientData.fullName || patientData.name}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Jenis Kelamin</p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : ''}`}>{patientData.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Usia</p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : ''}`}>{patientData.age || '-'} tahun</p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tanggal Lahir</p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : ''}`}>
                      {patientData.dateOfBirth ? formatDate(patientData.dateOfBirth).split(',')[0] : '-'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Pemindaian</p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : ''}`}>{totalAnalyses} kali</p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pemindaian Terakhir</p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : ''}`}>
                      {patientAnalyses[0] ? formatDate(patientAnalyses[0].createdAt) : '-'}
                    </p>
                  </div>
                </div>
              </motion.div>
              
              {/* Analysis History List */}
              <motion.div 
                className="rounded-lg p-6"
                style={{
                  ...glassEffect,
                  boxShadow: isDarkMode ? currentTheme.mediumShadow : '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center"
                    style={{ 
                      color: isDarkMode ? currentTheme.text : currentTheme.text
                    }}>
                  <FiFileText className="mr-2" style={{ color: isDarkMode ? currentTheme.accent : currentTheme.primary }} />
                  Riwayat Pemindaian
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {patientAnalyses.map((analysis, index) => (
                    <motion.div 
                      key={analysis.id}
                      onClick={() => setSelectedAnalysisIndex(index)}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        selectedAnalysisIndex === index 
                          ? isDarkMode 
                            ? 'bg-blue-900/20 border-l-4 border-blue-500' 
                            : 'bg-blue-50 border-l-4 border-blue-500' 
                          : isDarkMode
                            ? 'bg-gray-800/30 hover:bg-gray-700/30'
                            : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      whileHover={{ 
                        x: 4, 
                        transition: { duration: 0.2 }
                      }}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : ''}`}>
                            {formatDate(analysis.createdAt)}
                          </p>
                          <div className="flex items-center mt-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${getSeverityBadge(analysis.severity)}`}>
                              {analysis.severity}
                            </span>
                            <span className={`text-xs ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {(analysis.confidence * 100).toFixed(0)}% keyakinan
                            </span>
                          </div>
                        </div>
                        {selectedAnalysisIndex === index && (
                          <motion.div 
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: isDarkMode ? currentTheme.accent : currentTheme.primary }}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3 }}
                          ></motion.div>
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
                  className="rounded-lg p-6"
                  style={{
                    ...glassEffect,
                    boxShadow: isDarkMode ? currentTheme.mediumShadow : '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  key={patientAnalyses[selectedAnalysisIndex].id}
                >
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-lg font-semibold" style={{ color: isDarkMode ? currentTheme.text : 'inherit' }}>
                      Detail Analisis
                    </h3>
                    <div className="flex space-x-2">
                      <motion.button
                        onClick={handleDownloadPdf}
                        disabled={isPdfLoading}
                        className="p-2 rounded-full"
                        style={{
                          color: isDarkMode ? currentTheme.accent : currentTheme.primary,
                          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(59, 130, 246, 0.1)'
                        }}
                        whileHover={theme.animations.smoothHover}
                        whileTap={theme.animations.smoothTap}
                        title="Unduh PDF"
                      >
                        {isPdfLoading ? (
                          <motion.div 
                            className="h-5 w-5 rounded-full border-2 border-t-transparent"
                            style={{ borderColor: isDarkMode ? `${currentTheme.accent} transparent ${currentTheme.accent} ${currentTheme.accent}` : `${currentTheme.primary} transparent ${currentTheme.primary} ${currentTheme.primary}` }}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          ></motion.div>
                        ) : (
                          <FiDownload size={18} />
                        )}
                      </motion.button>
                      <motion.button
                        onClick={(e) => handleDelete(patientAnalyses[selectedAnalysisIndex].id, e)}
                        className="p-2 rounded-full"
                        style={{
                          color: isDarkMode ? '#f87171' : '#ef4444',
                          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(239, 68, 68, 0.1)'
                        }}
                        whileHover={theme.animations.smoothHover}
                        whileTap={theme.animations.smoothTap}
                        title="Hapus Analisis"
                      >
                        <FiTrash size={18} />
                      </motion.button>
                    </div>
                  </div>
                  
                  {/* Image Preview */}
                  <div className={`p-4 rounded-lg mb-4 ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
                    <div className="flex justify-between items-center">
                      <p className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Gambar Retina</p>
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
                          className="px-2 py-1 text-white rounded text-xs flex items-center"
                          style={{
                            background: isDarkMode ? 'rgba(16, 185, 129, 0.7)' : 'rgba(16, 185, 129, 0.9)'
                          }}
                          whileHover={theme.animations.smoothHover}
                          whileTap={theme.animations.smoothTap}
                          title="Muat ulang gambar"
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
                    
                    <div className="relative aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden">
                      {patientAnalyses[selectedAnalysisIndex] ? (
                        <>
                          {imageStatus === 'loading' && (
                            <div className={`absolute inset-0 flex items-center justify-center z-10 ${isDarkMode ? 'bg-gray-800/80' : 'bg-gray-100/80'}`}>
                              <div className="flex flex-col items-center space-y-2">
                                <motion.div 
                                  className={`rounded-full h-8 w-8 border-t-2 border-b-2 ${isDarkMode ? 'border-blue-400' : 'border-blue-500'}`}
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                ></motion.div>
                                <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Memuat gambar...</p>
                              </div>
                            </div>
                          )}
                          <img 
                            id="retina-image"
                            src={patientAnalyses[selectedAnalysisIndex].imageData || activeImageUrl || DEFAULT_IMAGE}
                            alt="Retina scan"
                            className="object-cover w-full h-full"
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
                            <div className="absolute bottom-0 left-0 right-0 bg-red-500/80 p-2 text-xs text-white text-center">
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
                  </div>
                  
                  {/* Analysis Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div 
                      className="p-4 rounded-lg"
                      style={{ 
                        backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.4)' : 'rgba(243, 244, 246, 0.7)'
                      }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <p className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Nama File</p>
                      <p className={`text-base font-medium break-words ${isDarkMode ? 'text-white' : ''}`}>
                        {patientAnalyses[selectedAnalysisIndex].originalFilename}
                      </p>
                    </motion.div>
                    
                    <motion.div 
                      className="p-4 rounded-lg"
                      style={{ 
                        backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.4)' : 'rgba(243, 244, 246, 0.7)'
                      }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.15 }}
                    >
                      <p className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Tingkat Keparahan</p>
                      <span className={`px-3 py-1 rounded-full text-sm inline-block ${
                        getSeverityBadge(patientAnalyses[selectedAnalysisIndex].severity)
                      }`}>
                        {patientAnalyses[selectedAnalysisIndex].severity}
                      </span>
                    </motion.div>
                    
                    <motion.div 
                      className="p-4 rounded-lg"
                      style={{ 
                        backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.4)' : 'rgba(243, 244, 246, 0.7)'
                      }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <p className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Tingkat Kepercayaan</p>
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                          <motion.div 
                            className="h-2.5 rounded-full" 
                            style={{ 
                              background: isDarkMode ? currentTheme.primaryGradient : currentTheme.primaryGradient
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${(patientAnalyses[selectedAnalysisIndex].confidence * 100).toFixed(0)}%` }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                          ></motion.div>
                        </div>
                        <span className={`text-base font-medium min-w-[60px] text-right ${isDarkMode ? 'text-white' : ''}`}>
                          {(patientAnalyses[selectedAnalysisIndex].confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="p-4 rounded-lg"
                      style={{ 
                        backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.4)' : 'rgba(243, 244, 246, 0.7)'
                      }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.25 }}
                    >
                      <p className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Tanggal Analisis</p>
                      <p className={`text-base font-medium ${isDarkMode ? 'text-white' : ''}`}>
                        {formatDate(patientAnalyses[selectedAnalysisIndex].createdAt)}
                      </p>
                    </motion.div>
                  </div>
                  
                  {/* Notes */}
                  {patientAnalyses[selectedAnalysisIndex].notes && (
                    <motion.div 
                      className="p-4 rounded-lg mt-4"
                      style={{ 
                        backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.4)' : 'rgba(243, 244, 246, 0.7)'
                      }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                    >
                      <p className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Catatan</p>
                      <p className={`text-base ${isDarkMode ? 'text-white' : ''}`}>
                        {patientAnalyses[selectedAnalysisIndex].notes}
                      </p>
                    </motion.div>
                  )}
                  
                  {/* Recommendations based on severity */}
                  <motion.div 
                    className="p-4 rounded-lg mt-4"
                    style={{ 
                      backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)'
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.35 }}
                  >
                    <p className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>Rekomendasi</p>
                    <p className={`text-base ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>
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
          </div>
        ) : (
          <motion.div 
            className="rounded-lg p-6 text-center"
            style={{
              ...glassEffect,
              boxShadow: isDarkMode ? currentTheme.mediumShadow : '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <FiAlertTriangle className={`text-yellow-500 text-5xl mx-auto mb-4 ${isDarkMode ? 'opacity-80' : ''}`} />
            <h3 className={`text-xl font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Data Tidak Ditemukan</h3>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Tidak dapat menemukan data pasien atau riwayat analisis.</p>
            <motion.button
              onClick={handleBack}
              className="px-4 py-2 text-white rounded-lg"
              style={{ 
                background: isDarkMode 
                  ? currentTheme.primaryGradient 
                  : currentTheme.primaryGradient,
                boxShadow: isDarkMode 
                  ? '0 4px 12px rgba(59, 130, 246, 0.3)' 
                  : '0 4px 12px rgba(59, 130, 246, 0.2)',
              }}
              whileHover={theme.animations.smoothHover}
              whileTap={theme.animations.smoothTap}
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
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          >
            <motion.div 
              className="rounded-lg p-6 max-w-md w-full"
              style={{
                ...glassEffect,
                boxShadow: isDarkMode ? '0 8px 32px rgba(0, 0, 0, 0.4)' : '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Konfirmasi Hapus</h3>
              <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Apakah Anda yakin ingin menghapus analisis ini? Tindakan ini tidak dapat dibatalkan.</p>
              <div className="flex justify-end space-x-3">
                <motion.button
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-4 py-2 rounded-lg"
                  style={{
                    backgroundColor: isDarkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(229, 231, 235, 0.7)',
                    color: isDarkMode ? 'white' : 'rgba(55, 65, 81, 1)'
                  }}
                  whileHover={theme.animations.smoothHover}
                  whileTap={theme.animations.smoothTap}
                >
                  Batal
                </motion.button>
                <motion.button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 text-white rounded-lg"
                  style={{
                    background: theme.dangerGradient,
                    boxShadow: isDarkMode 
                      ? '0 4px 12px rgba(239, 68, 68, 0.3)' 
                      : '0 4px 12px rgba(239, 68, 68, 0.2)',
                  }}
                  whileHover={theme.animations.smoothHover}
                  whileTap={theme.animations.smoothTap}
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