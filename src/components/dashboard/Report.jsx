import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDownload, FiPrinter, FiExternalLink, FiCalendar, FiUser, FiInfo, FiAlertTriangle, FiCheck, FiShare2, FiFileText, FiEye, FiActivity, FiAlertCircle } from 'react-icons/fi';
import jsPDF from 'jspdf';
import { getSeverityBgColor, getSeverityTextColor, getSeverityLabel } from '../../utils/severityUtils';
import { useTheme } from '../../context/ThemeContext';

function Report({ result }) {
  const { theme, isDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isShareLoading, setIsShareLoading] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [imageError, setImageError] = useState(false);
  const reportRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const pdfContainerRef = useRef(null);

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
    borderRadius: '16px',
  };

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
      
      // Buat PDF dengan jsPDF
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
      
      // Fungsi untuk menambahkan kotak dengan sudut melengkung
      const addRoundedRect = (x, y, width, height, radius, fillColor) => {
        const r = radius;
        const w = width;
        const h = height;
        
        pdf.setFillColor(...fillColor);
        
        // Gambar kotak dengan sudut melengkung
        pdf.roundedRect(x, y, w, h, r, r, 'F');
      };
      
      // Header dengan gradient effect
      const headerHeight = 50;
      
      // Background header
      pdf.setFillColor(37, 99, 235); // Warna biru utama
      pdf.rect(0, 0, pageWidth, headerHeight, 'F');
      
      // Tambahkan efek gradient dengan menggambar beberapa kotak transparan
      pdf.setFillColor(59, 130, 246, 0.5); // Biru lebih terang, semi transparan
      pdf.circle(pageWidth - 20, 10, 30, 'F'); // Lingkaran di pojok kanan atas
      pdf.setFillColor(79, 70, 229, 0.3); // Ungu, semi transparan
      pdf.circle(20, headerHeight - 10, 20, 'F'); // Lingkaran di pojok kiri bawah
      
      // Logo dan judul
      pdf.setTextColor(255, 255, 255); // Warna putih untuk teks header
      pdf.setFontSize(28);
      pdf.setFont(undefined, 'bold');
      pdf.text('RetinaScan', margin, 20);
      
      pdf.setFontSize(24);
      pdf.text('Laporan Analisis Retina', pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      const currentDate = formatDate(new Date());
      pdf.text(`Tanggal: ${currentDate}`, pageWidth / 2, 30, { align: 'center' });
      
      // Tambahkan icon atau simbol
      pdf.setFillColor(255, 255, 255, 0.8);
      pdf.circle(pageWidth - margin - 5, 15, 5, 'F'); // Simbol lingkaran kecil
      
      let yPos = headerHeight + 10;
      
      // Informasi pasien jika tersedia
      if (patient) {
        // Kotak informasi pasien dengan sudut melengkung
        pdf.setFillColor(240, 249, 255); // Warna latar belakang biru muda
        pdf.roundedRect(margin, yPos, pageWidth - (margin * 2), 40, 3, 3, 'F');
        
        // Garis dekoratif di sisi kiri
        pdf.setFillColor(37, 99, 235);
        pdf.rect(margin, yPos, 3, 40, 'F');
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(16);
        pdf.setFont(undefined, 'bold');
        pdf.text('Informasi Pasien', margin + 10, yPos + 12);
        
        pdf.setFontSize(11);
        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(60, 60, 60);
        
        // Tambahkan ikon simbol pasien (lingkaran untuk kepala)
        pdf.setFillColor(37, 99, 235, 0.7);
        pdf.circle(margin + 15, yPos + 25, 3, 'F');
        
        pdf.text(`Nama: ${patient.fullName || patient.name}`, margin + 25, yPos + 25);
        
        // Informasi tambahan
        const genderText = patient.gender === 'male' ? 'Laki-laki' : 'Perempuan';
        const ageText = patient.age ? `${patient.age} tahun` : '-';
        pdf.text(`Jenis Kelamin: ${genderText}, Umur: ${ageText}`, margin + 25, yPos + 32);
        
        yPos += 50;
      } else {
        yPos += 10;
      }
      
      // Hasil analisis dengan desain modern
      // Background panel dengan sudut melengkung
      pdf.setFillColor(245, 250, 255);
      pdf.roundedRect(margin, yPos, pageWidth - (margin * 2), 60, 3, 3, 'F');
      
      // Garis dekoratif di sisi kiri
      const severityColor = getSeverityColor(severity);
      let accentColor = [52, 152, 219]; // Default biru
      
      // Set warna berdasarkan tingkat keparahan
      const severityLevel = severity.toLowerCase();
      if (severityLevel === 'ringan') {
        accentColor = [39, 174, 96]; // Hijau
      } else if (severityLevel === 'sedang') {
        accentColor = [241, 196, 15]; // Kuning
      } else if (severityLevel === 'berat' || severityLevel === 'sangat berat') {
        accentColor = [231, 76, 60]; // Merah
      }
      
      // Garis samping dengan warna sesuai severity
      pdf.setFillColor(...accentColor);
      pdf.rect(margin, yPos, 3, 60, 'F');
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('Hasil Analisis', margin + 10, yPos + 12);
      
      // Tingkat keparahan dengan badge
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(60, 60, 60);
      pdf.text('Tingkat Keparahan:', margin + 10, yPos + 25);
      
      // Badge untuk severity
      pdf.setFillColor(...accentColor, 0.2); // Warna dengan opacity
      pdf.roundedRect(margin + 60, yPos + 20, 40, 10, 5, 5, 'F');
      
      // Teks severity
      pdf.setTextColor(...accentColor);
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text(severity, margin + 80, yPos + 26, { align: 'center' });
      
      // Tingkat kepercayaan dengan progress bar modern
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(60, 60, 60);
      pdf.text('Tingkat Kepercayaan:', margin + 10, yPos + 40);
      
      // Progress bar background dengan sudut melengkung
      const barWidth = 60;
      const barHeight = 6;
      const confidenceWidth = barWidth * confidence;
      
      // Background bar
      pdf.setFillColor(220, 220, 220);
      pdf.roundedRect(margin + 60, yPos + 37, barWidth, barHeight, barHeight/2, barHeight/2, 'F');
      
      // Filled bar
      pdf.setFillColor(...accentColor);
      if (confidenceWidth > 0) {
        // Untuk progress bar yang tidak kosong, gambar dengan sudut melengkung
        const radius = barHeight/2;
        if (confidenceWidth >= barWidth) {
          // Jika penuh, gambar seluruh bar dengan sudut melengkung di kedua sisi
          pdf.roundedRect(margin + 60, yPos + 37, barWidth, barHeight, radius, radius, 'F');
        } else {
          // Jika tidak penuh, gambar dengan sudut melengkung hanya di sisi kiri
          pdf.roundedRect(margin + 60, yPos + 37, confidenceWidth, barHeight, radius, 0, 'F');
        }
      }
      
      // Teks persentase
      pdf.setTextColor(...accentColor);
      pdf.text(`${(confidence * 100).toFixed(1)}%`, margin + 125, yPos + 40);
      
      yPos += 70;
      
      // Gambar dengan border dan sudut melengkung
      if (result.image && typeof result.image === 'string') {
        try {
          // Background panel untuk gambar
          pdf.setFillColor(250, 250, 250);
          pdf.roundedRect(margin, yPos, pageWidth - (margin * 2), 120, 3, 3, 'F');
          
          // Judul panel
          pdf.setTextColor(60, 60, 60);
          pdf.setFontSize(14);
          pdf.setFont(undefined, 'bold');
          pdf.text('Citra Retina', margin + 10, yPos + 12);
          
          // Tambahkan gambar dengan posisi yang lebih baik
          const imgWidth = 100;
          const imgHeight = 100;
          const imgX = pageWidth / 2 - imgWidth / 2;
          const imgY = yPos + 15;
          
          // Tambahkan border untuk gambar
          pdf.setDrawColor(200, 200, 200);
          pdf.setLineWidth(0.5);
          pdf.rect(imgX - 1, imgY - 1, imgWidth + 2, imgHeight + 2);
          
          // Tambahkan gambar
          pdf.addImage(result.image, 'JPEG', imgX, imgY, imgWidth, imgHeight);
          
          // Label gambar
          pdf.setFontSize(10);
          pdf.setTextColor(100, 100, 100);
          pdf.text('Gambar Retina yang Dianalisis', pageWidth / 2, imgY + imgHeight + 10, { align: 'center' });
          
          yPos += 130;
        } catch (imgError) {
          console.error('Error adding image to PDF:', imgError);
          yPos += 10;
        }
      }
      
      // Rekomendasi dengan desain modern
      pdf.setFillColor(245, 250, 255);
      pdf.roundedRect(margin, yPos, pageWidth - (margin * 2), 50, 3, 3, 'F');
      
      // Garis dekoratif di sisi kiri
      pdf.setFillColor(37, 99, 235);
      pdf.rect(margin, yPos, 3, 50, 'F');
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('Rekomendasi', margin + 10, yPos + 12);
      
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
      
      // Disclaimer dengan desain modern
      pdf.setFillColor(245, 245, 245);
      pdf.roundedRect(margin, yPos, pageWidth - (margin * 2), 30, 3, 3, 'F');
      
      // Icon peringatan (lingkaran dengan tanda seru)
      pdf.setFillColor(150, 150, 150);
      pdf.circle(margin + 10, yPos + 10, 3, 'F');
      
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      const disclaimer = 'Disclaimer: Hasil analisis ini merupakan bantuan diagnostik berbasis AI dan tidak menggantikan diagnosis dari dokter. Selalu konsultasikan dengan tenaga medis profesional untuk diagnosis dan penanganan yang tepat.';
      yPos = addWrappedText(disclaimer, margin + 20, yPos + 10, pageWidth - (margin * 2) - 30, 5);
      
      // Footer dengan desain modern
      const footerHeight = 25;
      
      // Background footer
      pdf.setFillColor(37, 99, 235);
      pdf.rect(0, pageHeight - footerHeight, pageWidth, footerHeight, 'F');
      
      // Tambahkan efek gradient
      pdf.setFillColor(59, 130, 246, 0.3);
      pdf.circle(20, pageHeight - footerHeight + 10, 15, 'F');
      pdf.setFillColor(79, 70, 229, 0.2);
      pdf.circle(pageWidth - 30, pageHeight - 10, 20, 'F');
      
      // Teks footer
      pdf.setFontSize(10);
      pdf.setTextColor(255, 255, 255);
      pdf.text(`RetinaScan © ${new Date().getFullYear()} | AI-Powered Retinopathy Detection`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      // QR Code placeholder (opsional)
      pdf.setFillColor(255, 255, 255, 0.8);
      pdf.roundedRect(pageWidth - 25, pageHeight - footerHeight + 5, 15, 15, 2, 2, 'F');
      
      // Simpan PDF dengan nama yang lebih deskriptif
      const patientName = patient ? (patient.fullName || patient.name).replace(/\s+/g, '_') : 'Pasien';
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `RetinaScan_${patientName}_${dateStr}.pdf`;
      
      pdf.save(fileName);
      setSuccess('PDF berhasil dibuat dan diunduh.');
      
      // Sembunyikan pesan sukses setelah 3 detik
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Gagal membuat PDF. Silakan coba lagi.');
      
      // Sembunyikan pesan error setelah 3 detik
      setTimeout(() => {
        setError('');
      }, 3000);
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
        // Buat PDF untuk dishare menggunakan template yang sama dengan handleDownload
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
        
        // Fungsi untuk menambahkan kotak dengan sudut melengkung
        const addRoundedRect = (x, y, width, height, radius, fillColor) => {
          const r = radius;
          const w = width;
          const h = height;
          
          pdf.setFillColor(...fillColor);
          
          // Gambar kotak dengan sudut melengkung
          pdf.roundedRect(x, y, w, h, r, r, 'F');
        };
        
        // Header dengan gradient effect
        const headerHeight = 50;
        
        // Background header
        pdf.setFillColor(37, 99, 235); // Warna biru utama
        pdf.rect(0, 0, pageWidth, headerHeight, 'F');
        
        // Tambahkan efek gradient dengan menggambar beberapa kotak transparan
        pdf.setFillColor(59, 130, 246, 0.5); // Biru lebih terang, semi transparan
        pdf.circle(pageWidth - 20, 10, 30, 'F'); // Lingkaran di pojok kanan atas
        pdf.setFillColor(79, 70, 229, 0.3); // Ungu, semi transparan
        pdf.circle(20, headerHeight - 10, 20, 'F'); // Lingkaran di pojok kiri bawah
        
        // Logo dan judul
        pdf.setTextColor(255, 255, 255); // Warna putih untuk teks header
        pdf.setFontSize(28);
        pdf.setFont(undefined, 'bold');
        pdf.text('RetinaScan', margin, 20);
        
        pdf.setFontSize(24);
        pdf.text('Laporan Analisis Retina', pageWidth / 2, 20, { align: 'center' });
        
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');
        const currentDate = formatDate(new Date());
        pdf.text(`Tanggal: ${currentDate}`, pageWidth / 2, 30, { align: 'center' });
        
        // Tambahkan icon atau simbol
        pdf.setFillColor(255, 255, 255, 0.8);
        pdf.circle(pageWidth - margin - 5, 15, 5, 'F'); // Simbol lingkaran kecil
        
        // Simpan PDF ke Blob
        const pdfBlob = pdf.output('blob');
        
        // Buat file dari blob
        const patientName = patient ? (patient.fullName || patient.name).replace(/\s+/g, '_') : 'Pasien';
        const dateStr = new Date().toISOString().split('T')[0];
        const fileName = `RetinaScan_${patientName}_${dateStr}.pdf`;
        
        const pdfFile = new File([pdfBlob], fileName, { 
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
        setSuccess('Laporan telah disalin ke clipboard.');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error sharing report:', error);
      setError('Gagal membagikan laporan. Silakan coba lagi.');
      setTimeout(() => setError(''), 3000);
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full"
    >
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={`text-red-500 ${isDarkMode ? 'bg-red-900/30' : 'bg-red-50'} p-4 rounded-xl mb-5 text-sm sm:text-base flex items-start shadow-sm ${isDarkMode ? 'border border-red-800/50' : 'border border-red-100'}`}
          >
            <FiAlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}
        
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={`text-green-600 ${isDarkMode ? 'bg-green-900/30' : 'bg-green-50'} p-4 rounded-xl mb-5 text-sm sm:text-base flex items-start shadow-sm ${isDarkMode ? 'border border-green-800/50' : 'border border-green-100'}`}
          >
            <FiCheck className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`rounded-xl overflow-hidden shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} mb-6`}
        style={glassEffect}
      >
        <div className={`p-4 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-green-700 to-emerald-600' 
            : 'bg-gradient-to-r from-green-600 to-emerald-400'
        }`}>
          <h2 className="text-xl font-bold text-white">Laporan Analisis Retina</h2>
          <p className="text-green-100 text-sm">
            {new Date().toLocaleDateString('id-ID', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        
        <div className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <div className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <FiUser className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              </div>
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Pasien
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {patient?.fullName || patient?.name || 'Tidak diketahui'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <FiCalendar className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              </div>
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tanggal Scan
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {new Date().toLocaleDateString('id-ID')}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-2 ml-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-lg ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                } transition-colors`}
                onClick={handlePrint}
                disabled={isLoading}
              >
                <FiPrinter className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-lg ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                } transition-colors`}
                onClick={handleDownload}
                disabled={isLoading}
              >
                <FiDownload className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-lg ${
                  isDarkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                } transition-colors`}
                onClick={handleShare}
                disabled={isShareLoading}
              >
                {isShareLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : shareSuccess ? (
                  <FiCheck className="w-5 h-5" />
                ) : (
                  <FiShare2 className="w-5 h-5" />
                )}
              </motion.button>
            </div>
          </div>
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
        className="rounded-xl overflow-hidden shadow-xl pdf-container"
        style={{ ...glassEffect, background: 'rgba(255, 255, 255, 0.9)' }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
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
                  transition={{ delay: 0.2 }}
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
                transition={{ delay: 0.4 }}
              >
                <div className="text-lg font-semibold text-white">RetinaScan AI</div>
                <div className="text-sm text-blue-100">Deteksi Retinopati Diabetik</div>
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
                    <span className="bg-amber-600 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-md">
                      SIMULASI - BUKAN HASIL SEBENARNYA
                    </span>
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
          >
            <h3 className="font-semibold mb-4 text-gray-700 flex items-center text-lg">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-3 shadow-md">
                <FiUser className="text-white" />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Informasi Pasien
              </span>
            </h3>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-xl"
              style={glassEffect}
              whileHover={{ boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="p-4 rounded-lg bg-white/50"
                whileHover={{ y: -2, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
              >
                <p className="text-sm text-blue-500 font-medium mb-1">Nama Lengkap</p>
                <p className="font-semibold text-gray-800 text-lg">{patientName}</p>
              </motion.div>
              <motion.div 
                className="p-4 rounded-lg bg-white/50"
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
                  whileHover={{ y: -2, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                >
                  <p className="text-sm text-blue-500 font-medium mb-1">Tanggal Lahir</p>
                  <p className="font-semibold text-gray-800 text-lg">{new Date(patient.dateOfBirth).toLocaleDateString('id-ID')}</p>
                </motion.div>
              )}
              {patient.bloodType && (
                <motion.div 
                  className="p-4 rounded-lg bg-white/50"
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
                variants={itemVariants}
                whileHover={{ y: -3, boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
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
                whileHover={{ y: -3, boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
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
                whileHover={{ y: -3, boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
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
                whileHover={{ y: -3, boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
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
    </motion.div>
  );
}

export default Report;