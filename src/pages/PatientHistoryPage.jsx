import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
      
      // Buat PDF dengan jsPDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      
      // Warna brand RetinaScan
      const colors = {
        primary: [0, 123, 255],
        secondary: [23, 162, 184],
        success: [40, 167, 69],
        warning: [255, 193, 7],
        danger: [220, 53, 69],
        light: [240, 249, 255],
        dark: [52, 58, 64],
        text: [73, 80, 87],
        lightText: [108, 117, 125],
        border: [222, 226, 230]
      };
      
      // Severity color mapping
      const severityColors = {
        'Tidak ada': colors.primary,
        'No DR': colors.primary,
        'Normal': colors.primary,
        'Ringan': colors.success,
        'Mild': colors.success,
        'Sedang': colors.warning,
        'Moderate': colors.warning,
        'Berat': colors.danger,
        'Parah': colors.danger,
        'Sangat Berat': [153, 0, 76],
        'Proliferative DR': [153, 0, 76]
      };
      
      // Helpers
      const addWrappedText = (text, x, y, maxWidth, lineHeight, options = {}) => {
        const { align = 'left', fontSize = 10, fontStyle = 'normal', textColor = colors.text } = options;
        
        pdf.setFontSize(fontSize);
        pdf.setFont(undefined, fontStyle);
        pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
        
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, x, y, { align });
        return y + (lines.length * lineHeight);
      };
      
      // Fungsi untuk menambahkan kotak dengan warna background
      const addColoredBox = (x, y, width, height, color, radius = 0) => {
        pdf.setFillColor(color[0], color[1], color[2]);
        
        if (radius > 0) {
          // Menggambar kotak dengan sudut melengkung
          pdf.roundedRect(x, y, width, height, radius, radius, 'F');
        } else {
          pdf.rect(x, y, width, height, 'F');
        }
      };
      
      // Fungsi untuk menambahkan separator
      const addSeparator = (y, width = contentWidth, color = colors.border) => {
        pdf.setDrawColor(color[0], color[1], color[2]);
        pdf.setLineWidth(0.5);
        pdf.line(margin, y, margin + width, y);
        return y + 3;
      };
      
      // Fungsi untuk menambahkan card container
      const addCard = (y, height, title, callback) => {
        // Latar belakang card
        addColoredBox(margin, y, contentWidth, height, [255, 255, 255]);
        
        // Border
        pdf.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
        pdf.setLineWidth(0.5);
        pdf.rect(margin, y, contentWidth, height);
        
        // Shadow effect (subtle)
        pdf.setDrawColor(240, 240, 240);
        pdf.setLineWidth(0.2);
        pdf.line(margin + contentWidth + 0.5, y + 1, margin + contentWidth + 0.5, y + height);
        pdf.line(margin + 1, y + height + 0.5, margin + contentWidth, y + height + 0.5);
        
        // Judul card
        if (title) {
          addColoredBox(margin, y, contentWidth, 10, colors.light);
          pdf.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
          pdf.setLineWidth(0.2);
          pdf.line(margin, y + 10, margin + contentWidth, y + 10);
          
          pdf.setFont(undefined, 'bold');
          pdf.setFontSize(11);
          pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
          pdf.text(title, margin + 5, y + 7);
        }
        
        const contentY = title ? y + 15 : y + 5;
        
        if (callback) {
          callback(contentY);
        }
        
        return y + height + 5;
      };
      
      // --- HEADER SECTION ---
      // Gradient header background
      const headerHeight = 40;
      for (let i = 0; i <= headerHeight; i++) {
        const ratio = i / headerHeight;
        const r = Math.floor(colors.primary[0] - (colors.primary[0] - 0) * ratio);
        const g = Math.floor(colors.primary[1] - (colors.primary[1] - 72) * ratio);
        const b = Math.floor(colors.primary[2] - (colors.primary[2] - 186) * ratio);
        
        addColoredBox(0, i, pageWidth, 1, [r, g, b]);
      }
      
      // Header content
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(22);
      pdf.setFont(undefined, 'bold');
      pdf.text('LAPORAN PEMERIKSAAN RETINA', pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      pdf.text(`RetinaScan • ${formatDate(analysis.createdAt)}`, pageWidth / 2, 30, { align: 'center' });
      
      // Logo posisi (opsional)
      // pdf.addImage(logoBase64, 'PNG', margin, 10, 20, 20);
      
      let yPos = headerHeight + 10;
      
      // --- PATIENT INFO SECTION ---
      yPos = addCard(yPos, 50, 'INFORMASI PASIEN', (contentY) => {
        // Kolom kiri
        let colY = contentY;
        
        pdf.setFontSize(10);
        pdf.setTextColor(colors.lightText[0], colors.lightText[1], colors.lightText[2]);
        pdf.text('Nama Lengkap', margin + 5, colY);
        
        colY += 5;
        pdf.setFontSize(12);
        pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        pdf.setFont(undefined, 'bold');
        pdf.text(patient.fullName || patient.name, margin + 5, colY);
        
        colY += 10;
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(colors.lightText[0], colors.lightText[1], colors.lightText[2]);
        pdf.text('Jenis Kelamin', margin + 5, colY);
        
        colY += 5;
        pdf.setFontSize(12);
        pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        pdf.text(patient.gender === 'male' ? 'Laki-laki' : 'Perempuan', margin + 5, colY);
        
        // Kolom kanan
        colY = contentY;
        const colX = margin + contentWidth / 2;
        
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(colors.lightText[0], colors.lightText[1], colors.lightText[2]);
        pdf.text('Umur', colX, colY);
        
        colY += 5;
        pdf.setFontSize(12);
        pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        pdf.text(`${patient.age || '-'} tahun`, colX, colY);
        
        colY += 10;
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(colors.lightText[0], colors.lightText[1], colors.lightText[2]);
        pdf.text('Tanggal Pemeriksaan', colX, colY);
        
        colY += 5;
        pdf.setFontSize(12);
        pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        pdf.text(formatDate(analysis.createdAt), colX, colY);
      });
      
      // --- SEVERITY RESULT SECTION ---
      yPos = addCard(yPos, 60, 'HASIL ANALISIS', (contentY) => {
        // Set warna berdasarkan tingkat keparahan
        const severityLevel = analysis.severity;
        const severityColor = severityColors[severityLevel] || colors.primary;
        
        // Bagian kiri - Grafik tingkat keparahan
        const gaugeX = margin + 10;
        const gaugeY = contentY + 15;
        const gaugeWidth = 80;
        const gaugeHeight = 15;
        
        // Background gauge
        addColoredBox(gaugeX, gaugeY, gaugeWidth, gaugeHeight, [240, 240, 240], 5);
        
        // Severity levels
        const severityLevels = ['Tidak ada', 'Ringan', 'Sedang', 'Berat', 'Sangat Berat'];
        const severityIndex = severityLevels.findIndex(s => 
          severityLevel.toLowerCase().includes(s.toLowerCase())
        );
        const severityRatio = (severityIndex !== -1) ? (severityIndex + 1) / 5 : 0.2;
        
        // Filled gauge
        addColoredBox(gaugeX, gaugeY, gaugeWidth * severityRatio, gaugeHeight, severityColor, 5);
        
        // Severity marker labels
        pdf.setFontSize(7);
        pdf.setTextColor(100, 100, 100);
        for (let i = 0; i < 5; i++) {
          const markerX = gaugeX + (gaugeWidth * (i + 1)) / 5;
          const markerText = (i + 1).toString();
          pdf.text(markerText, markerX, gaugeY + gaugeHeight + 5, { align: 'center' });
        }
        
        // Severity title
        pdf.setFontSize(10);
        pdf.setTextColor(colors.lightText[0], colors.lightText[1], colors.lightText[2]);
        pdf.text('Tingkat Keparahan', gaugeX, contentY + 8);
        
        // Severity value
        pdf.setFontSize(16);
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(severityColor[0], severityColor[1], severityColor[2]);
        pdf.text(severityLevel, gaugeX, contentY + 40);
        
        // Bagian kanan - Confidence
        const confidenceX = margin + contentWidth / 2;
        
        // Confidence title
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(colors.lightText[0], colors.lightText[1], colors.lightText[2]);
        pdf.text('Tingkat Kepercayaan', confidenceX, contentY + 8);
        
        // Confidence value
        const confidenceValue = (analysis.confidence * 100).toFixed(1);
        pdf.setFontSize(16);
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        pdf.text(`${confidenceValue}%`, confidenceX, contentY + 40);
        
        // Confidence bar
        const confidenceBarY = contentY + 15;
        const confidenceBarWidth = 80;
        const confidenceBarHeight = 15;
        
        // Background bar
        addColoredBox(confidenceX, confidenceBarY, confidenceBarWidth, confidenceBarHeight, [240, 240, 240], 5);
        
        // Filled bar based on confidence
        const fillWidth = confidenceBarWidth * analysis.confidence;
        addColoredBox(confidenceX, confidenceBarY, fillWidth, confidenceBarHeight, colors.primary, 5);
      });
      
      // --- IMAGE SECTION ---
      if (analysis.imageData) {
        yPos = addCard(yPos, 120, 'GAMBAR RETINA', (contentY) => {
          try {
            // Buat border untuk gambar
            const imgWidth = 100;
            const imgHeight = 100;
            const imgX = margin + (contentWidth - imgWidth) / 2;
            const imgY = contentY + 5;
            
            // Border gambar
            pdf.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
            pdf.setLineWidth(0.5);
            pdf.rect(imgX - 2, imgY - 2, imgWidth + 4, imgHeight + 4);
            
            // Tambahkan gambar
            pdf.addImage(analysis.imageData, 'JPEG', imgX, imgY, imgWidth, imgHeight);
          } catch (imgError) {
            console.error('Error adding image to PDF:', imgError);
            // Pesan error jika gambar gagal ditambahkan
            pdf.setFontSize(10);
            pdf.setTextColor(colors.danger[0], colors.danger[1], colors.danger[2]);
            pdf.text('Gambar tidak dapat ditampilkan', margin + contentWidth / 2, contentY + 50, { align: 'center' });
          }
        });
      }
      
      // --- CLINICAL SIGNS SECTION ---
      const getClinicalSigns = (severity) => {
        const severityLower = severity.toLowerCase();
        if (severityLower.includes('tidak ada') || severityLower.includes('normal') || severityLower.includes('no dr')) {
          return [
            'Tidak ditemukan tanda-tanda retinopati diabetik',
            'Pembuluh darah retina normal',
            'Tidak ada mikroaneurisma',
            'Tidak ada perdarahan retina',
            'Tidak ada eksudat'
          ];
        } else if (severityLower.includes('ringan') || severityLower.includes('mild')) {
          return [
            'Mikroaneurisma (1-5)',
            'Perdarahan intraretinal minimal',
            'Tidak ada eksudat keras',
            'Tidak ada cotton wool spots'
          ];
        } else if (severityLower.includes('sedang') || severityLower.includes('moderate')) {
          return [
            'Mikroaneurisma multipel (>5)',
            'Perdarahan intraretinal di satu hingga tiga kuadran',
            'Eksudat keras',
            'Cotton wool spots (1-3)',
            'Dilatasi vena ringan'
          ];
        } else if (severityLower.includes('berat') || severityLower.includes('parah') || severityLower.includes('severe')) {
          return [
            'Perdarahan intraretinal pada empat kuadran',
            'Eksudat keras multipel',
            'Cotton wool spots multipel (>3)',
            'Abnormalitas mikrovaskuler intraretinal (IRMA)',
            'Vena kalikut',
            'Iskemia retina yang luas'
          ];
        } else if (severityLower.includes('sangat berat') || severityLower.includes('proliferative')) {
          return [
            'Neovaskularisasi pada diskus optikus (NVD)',
            'Neovaskularisasi di tempat lain (NVE)',
            'Perdarahan preretinal atau vitreus',
            'Fibrosis epiretinal',
            'Traksi retina',
            'Risiko ablasio retina',
            'Glaukoma neovaskular'
          ];
        }
        return ['Tidak ditemukan tanda-tanda retinopati yang signifikan'];
      };
      
      const clinicalSigns = getClinicalSigns(analysis.severity);
      
      yPos = addCard(yPos, 50 + (clinicalSigns.length * 6), 'TANDA KLINIS', (contentY) => {
        let bulletY = contentY + 5;
        
        // Set text style untuk daftar tanda klinis
        pdf.setFontSize(10);
        pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        pdf.setFont(undefined, 'normal');
        
        // Tambahkan setiap tanda klinis dengan bullet point
        clinicalSigns.forEach(sign => {
          pdf.circle(margin + 5, bulletY, 1, 'F');
          pdf.text(sign, margin + 10, bulletY + 1);
          bulletY += 8;
        });
      });
      
      // --- RECOMMENDATION SECTION ---
      // Dapatkan rekomendasi berdasarkan tingkat keparahan
      const getRecommendation = (severity) => {
        const severityLower = severity.toLowerCase();
        if (severityLower.includes('tidak ada') || severityLower.includes('normal') || severityLower.includes('no dr')) {
          return 'Lakukan pemeriksaan rutin setiap tahun. Jaga gula darah tetap terkontrol. Lakukan gaya hidup sehat dengan diet seimbang dan olahraga teratur.';
        } else if (severityLower.includes('ringan') || severityLower.includes('mild')) {
          return 'Kontrol gula darah dan tekanan darah. Pemeriksaan ulang dalam 9-12 bulan. Konsultasikan dengan dokter mengenai kontrol diabetes yang lebih ketat.';
        } else if (severityLower.includes('sedang') || severityLower.includes('moderate')) {
          return 'Konsultasi dengan dokter spesialis mata. Pemeriksaan ulang dalam 6 bulan. Kontrol ketat gula darah dan tekanan darah. Perhatikan perubahan pada penglihatan.';
        } else if (severityLower.includes('berat') || severityLower.includes('parah') || severityLower.includes('severe')) {
          return 'Rujukan segera ke dokter spesialis mata. Pemeriksaan ulang dalam 2-3 bulan. Kontrol diabetes secara intensif. Evaluasi untuk kemungkinan terapi laser.';
        } else if (severityLower.includes('sangat berat') || severityLower.includes('proliferative')) {
          return 'Rujukan segera ke dokter spesialis mata untuk evaluasi dan kemungkinan tindakan laser atau operasi. Kontrol diabetes sangat intensif. Pemantauan ketat oleh dokter spesialis mata dan dokter spesialis penyakit dalam.';
        }
        return 'Lakukan pemeriksaan rutin dengan dokter mata setiap tahun. Jaga gula darah tetap terkontrol.';
      };
      
      let recommendation = '';
      if (analysis.notes) {
        recommendation = analysis.notes;
      } else {
        recommendation = getRecommendation(analysis.severity);
      }
      
      // Tambahkan bagian rekomendasi
      const severityLevel = analysis.severity.toLowerCase();
      const recommendationColor = severityColors[analysis.severity] || colors.primary;
      
      yPos = addCard(yPos, 60, 'REKOMENDASI', (contentY) => {
        // Icon atau indikator visual
        pdf.setFillColor(recommendationColor[0], recommendationColor[1], recommendationColor[2]);
        pdf.circle(margin + 10, contentY + 15, 5, 'F');
        
        // Set text style
        pdf.setFontSize(11);
        pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        
        // Tambahkan rekomendasi dengan wrapping
        addWrappedText(recommendation, margin + 20, contentY + 17, contentWidth - 25, 6, {
          fontSize: 11,
          textColor: colors.dark
        });
      });
      
      // --- FOOTER SECTION ---
      // Gradient footer
      const footerY = pageHeight - 25;
      const footerHeight = 25;
      
      for (let i = 0; i < footerHeight; i++) {
        const ratio = i / footerHeight;
        const r = Math.floor(colors.primary[0] * (1 - ratio));
        const g = Math.floor(colors.primary[1] * (1 - ratio));
        const b = Math.floor(colors.primary[2] * (1 - ratio));
        
        addColoredBox(0, footerY + i, pageWidth, 1, [r, g, b]);
      }
      
      // Footer disclaimer
      pdf.setFontSize(8);
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(255, 255, 255);
      pdf.text('Disclaimer: Hasil analisis ini merupakan bantuan diagnostik berbasis AI dan tidak menggantikan diagnosis dari dokter.', 
               pageWidth / 2, footerY + 10, { align: 'center' });
      
      pdf.text(`RetinaScan © ${new Date().getFullYear()} | AI-Powered Retinopathy Detection`, 
               pageWidth / 2, footerY + 15, { align: 'center' });
      
      // Nama file PDF
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
      <div className="max-w-7xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center mb-6">
          <button 
            onClick={handleBack}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FiArrowLeft className="text-gray-600" size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Riwayat Pasien</h1>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-3"></div>
              <p className="text-gray-500">Memuat data pasien...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <FiAlertTriangle className="text-yellow-500 text-5xl mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-800 mb-2">{error}</h3>
            <p className="text-gray-600 mb-6">Tidak dapat menemukan riwayat analisis untuk pasien ini.</p>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Kembali ke Daftar Pasien
            </button>
          </div>
        ) : patientData && patientAnalyses.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patient Info Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FiUser className="mr-2 text-blue-500" />
                  Informasi Pasien
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Nama Lengkap</p>
                    <p className="font-medium">{patientData.fullName || patientData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Jenis Kelamin</p>
                    <p className="font-medium">{patientData.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Usia</p>
                    <p className="font-medium">{patientData.age || '-'} tahun</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tanggal Lahir</p>
                    <p className="font-medium">
                      {patientData.dateOfBirth ? formatDate(patientData.dateOfBirth).split(',')[0] : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Pemindaian</p>
                    <p className="font-medium">{totalAnalyses} kali</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pemindaian Terakhir</p>
                    <p className="font-medium">
                      {patientAnalyses[0] ? formatDate(patientAnalyses[0].createdAt) : '-'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Analysis History List */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FiFileText className="mr-2 text-blue-500" />
                  Riwayat Pemindaian
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {patientAnalyses.map((analysis, index) => (
                    <div 
                      key={analysis.id}
                      onClick={() => setSelectedAnalysisIndex(index)}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        selectedAnalysisIndex === index 
                          ? 'bg-blue-50 border-l-4 border-blue-500' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium">
                            {formatDate(analysis.createdAt)}
                          </p>
                          <div className="flex items-center mt-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${getSeverityBadge(analysis.severity)}`}>
                              {analysis.severity}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              {(analysis.confidence * 100).toFixed(0)}% keyakinan
                            </span>
                          </div>
                        </div>
                        {selectedAnalysisIndex === index && (
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Analysis Details */}
            <div className="lg:col-span-2">
              {patientAnalyses[selectedAnalysisIndex] && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Detail Analisis
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleDownloadPdf}
                        disabled={isPdfLoading}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="Unduh PDF"
                      >
                        {isPdfLoading ? (
                          <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                        ) : (
                          <FiDownload size={18} />
                        )}
                      </button>
                      <button
                        onClick={(e) => handleDelete(patientAnalyses[selectedAnalysisIndex].id, e)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Hapus Analisis"
                      >
                        <FiTrash size={18} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Image Preview */}
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-gray-500 mb-2">Gambar Retina</p>
                      <div className="flex gap-1">
                        <button 
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
                          className="px-2 py-1 bg-green-500 text-white rounded text-xs flex items-center"
                          title="Muat ulang gambar"
                        >
                          <FiRefreshCcw className="mr-1" /> Refresh
                        </button>
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
                            <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-100/80">
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
                          <p className="text-gray-500 text-sm">Gambar tidak tersedia</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Analysis Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-500 mb-2">Nama File</p>
                      <p className="text-base font-medium break-words">
                        {patientAnalyses[selectedAnalysisIndex].originalFilename}
                      </p>
                    </div>
                    
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-500 mb-2">Tingkat Keparahan</p>
                      <span className={`px-3 py-1 rounded-full text-sm inline-block ${
                        getSeverityBadge(patientAnalyses[selectedAnalysisIndex].severity)
                      }`}>
                        {patientAnalyses[selectedAnalysisIndex].severity}
                      </span>
                    </div>
                    
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-500 mb-2">Tingkat Kepercayaan</p>
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${(patientAnalyses[selectedAnalysisIndex].confidence * 100).toFixed(0)}%` }}
                          ></div>
                        </div>
                        <span className="text-base font-medium min-w-[60px] text-right">
                          {(patientAnalyses[selectedAnalysisIndex].confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-500 mb-2">Tanggal Analisis</p>
                      <p className="text-base font-medium">
                        {formatDate(patientAnalyses[selectedAnalysisIndex].createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Notes */}
                  {patientAnalyses[selectedAnalysisIndex].notes && (
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-500 mb-2">Catatan</p>
                      <p className="text-base">
                        {patientAnalyses[selectedAnalysisIndex].notes}
                      </p>
                    </div>
                  )}
                  
                  {/* Recommendations based on severity */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 mb-2">Rekomendasi</p>
                    <p className="text-base text-blue-700">
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
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <FiAlertTriangle className="text-yellow-500 text-5xl mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-800 mb-2">Data Tidak Ditemukan</h3>
            <p className="text-gray-600 mb-6">Tidak dapat menemukan data pasien atau riwayat analisis.</p>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Kembali ke Daftar Pasien
            </button>
          </div>
        )}
      </div>
      
      {/* Confirmation Dialog for Delete */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Konfirmasi Hapus</h3>
            <p className="text-gray-600 mb-6">Apakah Anda yakin ingin menghapus analisis ini? Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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

export default withPageTransition(PatientHistoryPageComponent); 