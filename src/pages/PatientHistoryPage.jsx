import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { withPageTransition } from '../context/ThemeContext';
import { getHistory, deleteAnalysis } from '../services/api';
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
  FiEye,
  FiInfo
} from 'react-icons/fi';
import { getSeverityBadge, getSeverityBgColor } from '../utils/severityUtils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

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

// Gunakan fungsi ini untuk mendapatkan sumber gambar dengan prioritas yang tepat
const getImageSource = (analysis) => {
  if (!analysis) {
    console.warn('Analysis object is undefined or null');
    return DEFAULT_IMAGE;
  }
  
  // Prioritaskan imageData (base64) jika tersedia
  if (analysis.imageData && analysis.imageData.startsWith('data:')) {
    console.log('Using base64 image data');
    return analysis.imageData;
  }
  
  // Coba imageUrl jika tersedia
  if (analysis.imageUrl) {
    console.log('Using image URL:', analysis.imageUrl);
    return formatImageUrl(analysis.imageUrl);
  }
  
  // Coba imagePath jika tersedia (format lama)
  if (analysis.imagePath) {
    console.log('Using image path:', analysis.imagePath);
    return formatImageUrl(analysis.imagePath);
  }
  
  // Fallback ke gambar default jika tidak ada data gambar
  console.log('No image data available, using default image');
  return DEFAULT_IMAGE;
};

function PatientHistoryPageComponent() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState(null);
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
        // Ambil semua riwayat analisis
        const data = await getHistory();
        console.log('Fetched history data:', data.length);
        
        // Fungsi untuk mengelompokkan analisis berdasarkan pasien
        const groupAnalysesByPatient = (analyses) => {
          // Buat objek untuk menyimpan analisis dikelompokkan berdasarkan patientId
          const groupedByPatient = {};
          
          // Iterasi melalui semua analisis
          analyses.forEach(analysis => {
            if (!analysis.patientId) return;
            
            const id = analysis.patientId._id;
            
            // Jika pasien belum ada di objek, tambahkan
            if (!groupedByPatient[id]) {
              groupedByPatient[id] = {
                patient: analysis.patientId,
                analyses: [analysis],
                latestAnalysis: analysis,
                totalAnalyses: 1
              };
            } else {
              // Tambahkan analisis ke array analisis pasien
              groupedByPatient[id].analyses.push(analysis);
              groupedByPatient[id].totalAnalyses++;
              
              // Perbarui analisis terbaru jika analisis ini lebih baru
              if (new Date(analysis.createdAt) > new Date(groupedByPatient[id].latestAnalysis.createdAt)) {
                groupedByPatient[id].latestAnalysis = analysis;
              }
            }
          });
          
          // Sortir analisis di dalam setiap grup berdasarkan tanggal (terbaru dulu)
          Object.values(groupedByPatient).forEach(group => {
            group.analyses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          });
          
          // Konversi objek menjadi array
          return Object.values(groupedByPatient);
        };

        // Kelompokkan analisis berdasarkan pasien
        const groupedData = groupAnalysesByPatient(data);
        
        // Cari data pasien yang sesuai dengan patientId
        const patientHistory = groupedData.find(item => item.patient._id === patientId);
        
        if (!patientHistory) {
          setError('Data pasien tidak ditemukan');
        } else {
          setPatientData(patientHistory);
          console.log('Patient analyses:', patientHistory.analyses.length);
          
          // Persiapkan gambar dari analisis pertama
          if (patientHistory.analyses.length > 0) {
            const firstAnalysis = patientHistory.analyses[0];
            setImageStatus('loading');
            
            // Periksa prioritas sumber gambar
            if (firstAnalysis.imageData) {
              console.log('Found imageData in first analysis');
              setImageStatus('success');
            } else if (firstAnalysis.imageUrl) {
              console.log('Using imageUrl from first analysis');
              setActiveImageUrl(formatImageUrl(firstAnalysis.imageUrl));
            } else {
              console.log('No image source found in first analysis');
              setImageStatus('error');
            }
          }
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
    if (patientData && patientData.analyses.length > 0) {
      setImageStatus('loading');
      
      const currentAnalysis = patientData.analyses[selectedAnalysisIndex];
      
      // Get image source with proper priority
      const imgSrc = getImageSource(currentAnalysis);
      
      if (imgSrc.startsWith('data:')) {
        // Base64 data is already available, set status to success
        setActiveImageUrl('');
        setImageStatus('success');
      } else {
        // Using URL, need to set active URL and check if it can be loaded
        setActiveImageUrl(imgSrc);
        // Status will be updated by the img onLoad/onError handler
      }
    }
  }, [selectedAnalysisIndex, patientData]);

  // Handle image load errors
  const handleImageError = () => {
    console.error('Failed to load image from URL:', activeImageUrl);
    setImageStatus('error');
    
    // If we've tried less than 3 times and have a URL, try a different format
    if (imageLoadAttempt < 3 && activeImageUrl) {
      setImageLoadAttempt(prev => prev + 1);
      
      // Try alternative URL format
      const urlWithoutQuery = activeImageUrl.split('?')[0];
      const newUrl = `${urlWithoutQuery}?attempt=${imageLoadAttempt + 1}`;
      console.log('Trying alternative URL:', newUrl);
      setActiveImageUrl(newUrl);
    }
  };

  // Handle image load success
  const handleImageLoaded = () => {
    console.log('Image loaded successfully from URL:', activeImageUrl);
    setImageStatus('success');
  };

  // Format date helper dengan validasi
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    try {
      return format(new Date(dateString), 'dd MMMM yyyy, HH:mm', { locale: id });
    } catch (error) {
      console.error('Format date error:', error);
      return 'Format tanggal tidak valid';
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
      setIsLoading(true);
      await deleteAnalysis(idToDelete);
      
      // Update patientData dengan menghapus analisis dari state
      const updatedAnalyses = patientData.analyses.filter(
        analysis => analysis._id !== idToDelete
      );
      
      if (updatedAnalyses.length === 0) {
        // Jika tidak ada analisis lagi, kembali ke halaman history
        navigate('/history');
        return;
      }
      
      setPatientData({
        ...patientData,
        analyses: updatedAnalyses,
        totalAnalyses: updatedAnalyses.length
      });
      
      // Jika index yang dihapus adalah yang sedang dipilih, pilih index 0
      if (selectedAnalysisIndex >= updatedAnalyses.length) {
        setSelectedAnalysisIndex(0);
      }
      
      setShowConfirmDelete(false);
      setIdToDelete(null);
    } catch (error) {
      setError('Gagal menghapus analisis. Silakan coba lagi.');
      console.error('Error deleting analysis:', error);
    } finally {
      setIsLoading(false);
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
    
    patientData.analyses.forEach(analysis => {
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
  const totalAnalyses = patientData?.analyses.length || 0;

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

  // Safe extraction helper function
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

  // Fungsi untuk mengunduh PDF
  const handleDownloadPdf = async () => {
    try {
      if (!patientData || !patientData.analyses[selectedAnalysisIndex]) {
        return;
      }
      
      setIsPdfLoading(true);
      
      const analysis = patientData.analyses[selectedAnalysisIndex];
      const patient = patientData.patient;
      
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

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-3"></div>
            <p className="text-gray-500">Memuat data...</p>
          </div>
        </div>
      ) : error ? (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="bg-red-50 p-4 rounded-lg"
        >
          <p className="text-red-500">{error}</p>
          <button 
            onClick={handleBack}
            className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
          >
            <FiArrowLeft className="mr-2" />
            Kembali ke daftar riwayat
          </button>
        </motion.div>
      ) : patientData && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Back button */}
          <motion.div variants={itemVariants}>
            <button 
              onClick={handleBack}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <FiArrowLeft className="mr-2" />
              Kembali ke daftar riwayat
            </button>
          </motion.div>
          
          {/* Patient overview card */}
          <motion.div 
            variants={itemVariants}
            className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white p-6">
              <h1 className="text-2xl font-bold mb-2">Riwayat Analisis Pasien</h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-blue-50">
                <div className="flex items-center">
                  <FiUser className="mr-2" />
                  <span>{patientData.patient.fullName || patientData.patient.name}</span>
                </div>
                <div>
                  <span className="text-sm">
                    {patientData.patient.gender === 'male' ? 'Laki-laki' : 'Perempuan'}, {patientData.patient.age || '-'} tahun
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <FiBarChart2 className="text-blue-500 mt-1" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-500">Total Pemindaian</h3>
                      <p className="text-2xl font-bold">{totalAnalyses}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <FiCalendar className="text-blue-500 mt-1" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-500">Analisis Terakhir</h3>
                      <p className="text-sm font-medium">
                        {patientData.analyses.length > 0 ? formatDate(patientData.analyses[0].createdAt) : '-'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <FiCalendar className="text-blue-500 mt-1" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-500">Analisis Pertama</h3>
                      <p className="text-sm font-medium">
                        {patientData.analyses.length > 0 ? 
                          formatDate(patientData.analyses[patientData.analyses.length - 1].createdAt) : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Severity distribution */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Distribusi Tingkat Keparahan</h3>
                <div className="grid grid-cols-5 gap-2">
                  <div className="bg-gray-50 p-2 rounded-lg text-center">
                    <div className="inline-block px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
                      Tidak ada
                    </div>
                    <p className="text-lg font-bold mt-1">{severityDistribution.tidakAda || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg text-center">
                    <div className="inline-block px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                      Ringan
                    </div>
                    <p className="text-lg font-bold mt-1">{severityDistribution.ringan || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg text-center">
                    <div className="inline-block px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs">
                      Sedang
                    </div>
                    <p className="text-lg font-bold mt-1">{severityDistribution.sedang || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg text-center">
                    <div className="inline-block px-2 py-1 rounded-full bg-orange-100 text-orange-800 text-xs">
                      Berat
                    </div>
                    <p className="text-lg font-bold mt-1">{severityDistribution.berat || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg text-center">
                    <div className="inline-block px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs">
                      Sangat Berat
                    </div>
                    <p className="text-lg font-bold mt-1">{severityDistribution.sangatBerat || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Two column layout for history and details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left column - List of all analyses */}
            <motion.div 
              variants={itemVariants}
              className="lg:col-span-4"
            >
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-50 border-b">
                  <h2 className="text-lg font-semibold">Daftar Pemindaian ({totalAnalyses})</h2>
                </div>
                
                <div className="p-2 max-h-[600px] overflow-y-auto">
                  {patientData.analyses.map((analysis, index) => (
                    <div 
                      key={analysis._id}
                      onClick={() => setSelectedAnalysisIndex(index)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                        selectedAnalysisIndex === index 
                          ? 'bg-blue-50 border border-blue-200' 
                          : 'hover:bg-gray-50 border border-gray-100'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">Tanggal: {formatDate(analysis.createdAt)}</p>
                          <div className="flex items-center mt-1">
                            <span className={`px-2 py-0.5 text-xs rounded-full mr-2 ${getSeverityBadge(analysis.severity)}`}>
                              {analysis.severity}
                            </span>
                            <span className="text-xs text-gray-500 truncate max-w-[180px]" title={analysis.originalFilename}>
                              {analysis.originalFilename}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={(e) => handleDelete(analysis._id, e)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                            title="Hapus Analisis"
                          >
                            <FiTrash size={16} />
                          </button>
                          {selectedAnalysisIndex === index && (
                            <div className="bg-blue-500 text-white p-1 rounded-full">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
            
            {/* Right column - Selected analysis details */}
            <motion.div 
              variants={itemVariants}
              className="lg:col-span-8"
            >
              {/* Image and details */}
              <div className="p-6">
                {patientData.analyses.length > 0 ? (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Image container */}
                      <div className="relative bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-4">
                        <h3 className="font-semibold mb-4 text-gray-700 flex items-center text-lg">
                          <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center mr-3 shadow-md">
                            <FiEye className="text-white" />
                          </div>
                          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                            Citra Retina
                          </span>
                        </h3>
                        
                        <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-lg">
                          {/* Loading state */}
                          {imageStatus === 'loading' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-10">
                              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                            </div>
                          )}
                          
                          {/* Image */}
                          <img 
                            src={activeImageUrl || getImageSource(patientData.analyses[selectedAnalysisIndex])}
                            alt="Retina scan" 
                            className="w-full h-full object-contain"
                            onLoad={handleImageLoaded}
                            onError={handleImageError}
                            style={{ display: imageStatus === 'loading' ? 'none' : 'block' }}
                          />
                          
                          {/* Error state */}
                          {imageStatus === 'error' && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 bg-opacity-70 z-20">
                              <FiAlertTriangle className="text-yellow-400 text-4xl mb-3" />
                              <p className="text-white text-center">Gambar tidak dapat ditampilkan</p>
                              <button 
                                onClick={() => {
                                  setImageStatus('loading');
                                  setImageLoadAttempt(0);
                                  // Force reload image with different URL
                                  const analysis = patientData.analyses[selectedAnalysisIndex];
                                  const newUrl = getImageSource(analysis) + '?reload=' + Date.now();
                                  setActiveImageUrl(newUrl);
                                }}
                                className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                              >
                                Coba Lagi
                              </button>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 text-center">
                          <p className="text-sm text-gray-500">
                            {extractValueWithDefault(patientData.analyses[selectedAnalysisIndex], 'originalFilename', 'Nama file tidak tersedia')}
                          </p>
                        </div>
                      </div>
                      
                      {/* Analysis details */}
                      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-4">
                        <h3 className="font-semibold mb-4 text-gray-700 flex items-center text-lg">
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-3 shadow-md">
                            <FiInfo className="text-white" />
                          </div>
                          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                            Detail Analisis
                          </span>
                        </h3>
                        
                        <div className="space-y-4">
                          {/* Date and time */}
                          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <FiCalendar className="text-blue-500 mr-3" />
                            <div>
                              <p className="text-xs text-gray-500">Tanggal & Waktu</p>
                              <p className="font-medium">
                                {formatDate(extractValueWithDefault(patientData.analyses[selectedAnalysisIndex], 'createdAt', ''))}
                              </p>
                            </div>
                          </div>
                          
                          {/* Severity */}
                          <div className="flex items-center p-3 rounded-lg" 
                            style={{ 
                              backgroundColor: getSeverityBgColor(
                                extractValueWithDefault(patientData.analyses[selectedAnalysisIndex], 'severity', 'Tidak diketahui')
                              ) + '20' 
                            }}
                          >
                            <FiAlertTriangle className="mr-3" style={{ 
                              color: getSeverityBgColor(
                                extractValueWithDefault(patientData.analyses[selectedAnalysisIndex], 'severity', 'Tidak diketahui')
                              ) 
                            }} />
                            <div>
                              <p className="text-xs text-gray-500">Tingkat Keparahan</p>
                              <p className="font-medium">
                                {extractValueWithDefault(patientData.analyses[selectedAnalysisIndex], 'severity', 'Tidak diketahui')}
                              </p>
                            </div>
                          </div>
                          
                          {/* Confidence */}
                          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <FiPercent className="text-blue-500 mr-3" />
                            <div className="w-full">
                              <div className="flex justify-between mb-1">
                                <p className="text-xs text-gray-500">Tingkat Kepercayaan</p>
                                <p className="text-xs font-medium">
                                  {formatPercentage(extractValueWithDefault(patientData.analyses[selectedAnalysisIndex], 'confidence', 0))}
                                </p>
                              </div>
                              <div className="w-full h-2 bg-gray-200 rounded-full">
                                <div 
                                  className="h-full bg-blue-500 rounded-full"
                                  style={{ 
                                    width: formatPercentage(
                                      extractValueWithDefault(patientData.analyses[selectedAnalysisIndex], 'confidence', 0)
                                    ) 
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Notes */}
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Catatan & Rekomendasi</p>
                            <p className="text-sm">
                              {extractValueWithDefault(
                                patientData.analyses[selectedAnalysisIndex], 
                                'notes', 
                                extractValueWithDefault(patientData.analyses[selectedAnalysisIndex], 'recommendation', 'Tidak ada catatan')
                              )}
                            </p>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="mt-6 flex justify-end space-x-2">
                          <button
                            onClick={() => handleDownloadPdf()}
                            disabled={isPdfLoading}
                            className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center disabled:opacity-50"
                          >
                            {isPdfLoading ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-blue-500 mr-2"></div>
                            ) : (
                              <FiDownload className="mr-2" />
                            )}
                            Unduh PDF
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Recommendation section */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-4 mt-6">
                      <h3 className="font-semibold mb-4 text-gray-700 flex items-center text-lg">
                        <FiFileText className="text-blue-500 mr-2" />
                        Rekomendasi Tindak Lanjut
                      </h3>
                      
                      <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                        <p className="text-blue-800">
                          {(() => {
                            const severity = extractValueWithDefault(
                              patientData.analyses[selectedAnalysisIndex], 
                              'severity', 
                              'Tidak diketahui'
                            ).toLowerCase();
                            
                            if (severity === 'tidak ada' || severity === 'normal') {
                              return 'Lakukan pemeriksaan rutin setiap tahun.';
                            } else if (severity === 'ringan') {
                              return 'Kontrol gula darah dan tekanan darah. Pemeriksaan ulang dalam 9-12 bulan.';
                            } else if (severity === 'sedang') {
                              return 'Konsultasi dengan dokter spesialis mata. Pemeriksaan ulang dalam 6 bulan.';
                            } else if (severity === 'berat') {
                              return 'Rujukan segera ke dokter spesialis mata. Pemeriksaan ulang dalam 2-3 bulan.';
                            } else if (severity === 'sangat berat' || severity === 'proliferative dr') {
                              return 'Rujukan segera ke dokter spesialis mata untuk evaluasi dan kemungkinan tindakan laser atau operasi.';
                            } else {
                              return 'Lakukan pemeriksaan rutin sesuai anjuran dokter.';
                            }
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-6 rounded-lg text-center">
                    <FiInfo className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                    <p className="text-gray-500">Belum ada data analisis untuk pasien ini</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Modal Konfirmasi Delete */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 animate-fade-in">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Konfirmasi Hapus</h3>
            <p className="text-gray-600 mb-6">Apakah Anda yakin ingin menghapus data pemindaian ini? Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowConfirmDelete(false);
                  setIdToDelete(null);
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-md text-white"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const PatientHistoryPage = withPageTransition(PatientHistoryPageComponent);
export default PatientHistoryPage; 