import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiPrinter, FiExternalLink, FiCalendar, FiUser, FiInfo, FiAlertTriangle, FiCheck, FiShare2, FiFileText, FiEye, FiActivity } from 'react-icons/fi';
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

// Import font untuk PDF
import 'jspdf-autotable';

// Tambahkan fungsi untuk membuat donut chart pada PDF
function createDonutChart(pdf, centerX, centerY, radius, innerRadius, percentage, color) {
  const startAngle = -90; // Start from top
  const endAngle = startAngle + (percentage / 100) * 360;
  
  // Draw background circle (gray)
  pdf.setDrawColor(220, 220, 220);
  pdf.setFillColor(220, 220, 220);
  pdf.circle(centerX, centerY, radius, 'F');
  
  // Draw colored arc for percentage
  if (percentage > 0) {
    pdf.setDrawColor(color.r, color.g, color.b);
    pdf.setFillColor(color.r, color.g, color.b);
    
    // Draw arc segment
    pdf.saveGraphicsState();
    pdf.moveTo(centerX, centerY);
    pdf.arc(centerX, centerY, radius, startAngle * (Math.PI / 180), endAngle * (Math.PI / 180), false);
    pdf.lineTo(centerX, centerY);
    pdf.clip();
    pdf.discardPath();
    
    // Fill the clipped area
    pdf.circle(centerX, centerY, radius, 'F');
    pdf.restoreGraphicsState();
  }
  
  // Draw inner circle (white) to create donut
  pdf.setDrawColor(255, 255, 255);
  pdf.setFillColor(255, 255, 255);
  pdf.circle(centerX, centerY, innerRadius, 'F');
}

// Tambahkan fungsi untuk mendapatkan warna berdasarkan tingkat keparahan untuk PDF
function getSeverityPdfColor(severity) {
  const level = severity.toLowerCase();
  if (level === 'tidak ada' || level === 'normal') return { r: 59, g: 130, b: 246 }; // blue
  if (level === 'ringan') return { r: 16, g: 185, b: 129 }; // green
  if (level === 'sedang') return { r: 245, g: 158, b: 11 }; // yellow
  if (level === 'berat') return { r: 239, g: 68, b: 68 }; // red
  return { r: 225, g: 29, b: 72 }; // pink for sangat berat
}

// Tambahkan fungsi untuk membuat badge pada PDF
function createBadge(pdf, x, y, text, color) {
  const textWidth = pdf.getStringUnitWidth(text) * 5;
  const width = textWidth + 10;
  
  pdf.setFillColor(color.r, color.g, color.b, 0.1);
  pdf.setDrawColor(color.r, color.g, color.b, 0.3);
  pdf.roundedRect(x, y, width, 10, 5, 5, 'FD');
  
  pdf.setTextColor(color.r, color.g, color.b);
  pdf.setFontSize(8);
  pdf.text(text, x + 5, y + 7);
  
  return width;
}

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
    } catch (err) {
      console.error('Format date error:', err);
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
    } catch (err) {
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
      const margin = 15;
      
      // Fungsi untuk menambahkan teks dengan wrapping
      const addWrappedText = (text, x, y, maxWidth, lineHeight, options = {}) => {
        const { align = 'left', fontSize = 11, textColor = [0, 0, 0] } = options;
        
        pdf.setFontSize(fontSize);
        pdf.setTextColor(...textColor);
        
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, x, y, { align });
        return y + (lines.length * lineHeight);
      };
      
      // Tambahkan background gradien halaman
      const grd = pdf.context2d.createLinearGradient(0, 0, 0, pageHeight);
      grd.addColorStop(0, '#f0f9ff');
      grd.addColorStop(1, '#ffffff');
      pdf.context2d.fillStyle = grd;
      pdf.context2d.fillRect(0, 0, pageWidth, pageHeight);
      
      // Header dengan gradien modern
      pdf.setFillColor(37, 99, 235);
      const headerGrd = pdf.context2d.createLinearGradient(0, 0, pageWidth, 0);
      headerGrd.addColorStop(0, '#3b82f6');
      headerGrd.addColorStop(0.5, '#4f46e5');
      headerGrd.addColorStop(1, '#7c3aed');
      pdf.context2d.fillStyle = headerGrd;
      pdf.context2d.fillRect(0, 0, pageWidth, 45);
      
      // Tambahkan pattern overlay pada header
      pdf.setDrawColor(255, 255, 255);
      pdf.setLineWidth(0.1);
      for (let i = 0; i < pageWidth; i += 10) {
        pdf.line(i, 0, i, 45);
      }
      
      // Tambahkan judul laporan dengan efek bayangan
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont(undefined, 'bold');
      
      // Efek bayangan untuk teks header
      pdf.setTextColor(0, 0, 0, 0.3);
      pdf.text('Laporan Analisis Retina', pageWidth / 2 + 0.5, 20 + 0.5, { align: 'center' });
      
      // Teks header utama
      pdf.setTextColor(255, 255, 255);
      pdf.text('Laporan Analisis Retina', pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      const currentDate = formatDate(new Date());
      pdf.text(`Tanggal: ${currentDate}`, pageWidth / 2, 30, { align: 'center' });
      
      // Tambahkan efek wave di bagian bawah header
      const waveHeight = 10;
      pdf.setDrawColor(255, 255, 255);
      pdf.setFillColor(255, 255, 255);
      
      let wavePoints = [];
      for (let x = 0; x <= pageWidth; x += 5) {
        const y = 45 - Math.sin(x / 10) * (waveHeight / 2);
        wavePoints.push({ x, y });
      }
      
      pdf.setLineWidth(0);
      pdf.lines(
        wavePoints.map(p => [p.x, p.y]),
        0, 0, 
        [1, 0],
        'F'
      );
      
      let yPos = 60;
      
      // Informasi pasien jika tersedia
      if (patient) {
        // Card dengan efek bayangan untuk informasi pasien
        pdf.setFillColor(240, 249, 255);
        pdf.setDrawColor(214, 232, 248);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(margin, yPos, pageWidth - (margin * 2), 35, 5, 5, 'FD');
        
        // Icon untuk pasien
        pdf.setFillColor(59, 130, 246);
        pdf.circle(margin + 10, yPos + 10, 5, 'F');
        
        pdf.setTextColor(59, 130, 246);
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text('Informasi Pasien', margin + 20, yPos + 12);
        
        pdf.setFontSize(11);
        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(60, 60, 60);
        
        // Informasi pasien dalam grid layout
        const colWidth = (pageWidth - (margin * 2) - 20) / 2;
        
        // Kolom kiri
        pdf.setFontSize(9);
        pdf.setTextColor(100, 116, 139);
        pdf.text('Nama Lengkap:', margin + 10, yPos + 22);
      
        pdf.setFontSize(11);
        pdf.setTextColor(15, 23, 42);
      pdf.setFont(undefined, 'bold');
        pdf.text(patient.fullName || patient.name || '-', margin + 10, yPos + 27);
      
        // Kolom kanan
        pdf.setFontSize(9);
        pdf.setTextColor(100, 116, 139);
        pdf.text('Jenis Kelamin / Umur:', margin + 10 + colWidth, yPos + 22);
        
        pdf.setFontSize(11);
        pdf.setTextColor(15, 23, 42);
        pdf.setFont(undefined, 'bold');
        const genderText = patient.gender === 'male' ? 'Laki-laki' : patient.gender === 'female' ? 'Perempuan' : patient.gender || '-';
        pdf.text(`${genderText}, ${patient.age || '-'} tahun`, margin + 10 + colWidth, yPos + 27);
        
        yPos += 45;
      } else {
        yPos += 10;
      }
      
      // Grid layout untuk hasil analisis dan gambar
      const colWidth = (pageWidth - (margin * 2)) / 2 - 5;
      
      // Kolom kiri - Hasil analisis
      pdf.setFillColor(250, 250, 255);
      pdf.setDrawColor(230, 230, 250);
      pdf.roundedRect(margin, yPos, colWidth, 100, 5, 5, 'FD');
      
      // Icon untuk hasil analisis
      pdf.setFillColor(79, 70, 229);
      pdf.circle(margin + 10, yPos + 10, 5, 'F');
      
      pdf.setTextColor(79, 70, 229);
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Hasil Analisis', margin + 20, yPos + 12);
      
      // Tingkat keparahan dengan visualisasi
      const severityColor = getSeverityPdfColor(severity);
      
          pdf.setFontSize(10);
      pdf.setTextColor(100, 116, 139);
      pdf.text('Tingkat Keparahan:', margin + 10, yPos + 25);
      
      // Badge untuk tingkat keparahan
      createBadge(pdf, margin + 10, yPos + 28, severity, severityColor);
      
      // Visualisasi donut chart untuk tingkat kepercayaan
      pdf.setFontSize(10);
      pdf.setTextColor(100, 116, 139);
      pdf.text('Tingkat Kepercayaan:', margin + 10, yPos + 45);
      
      // Convert confidence to percentage
      const confidenceValue = parseFloat(confidence);
      const confidencePercentage = isNaN(confidenceValue) ? 
        0 : (confidenceValue > 1 ? confidenceValue : confidenceValue * 100);
      
      // Create donut chart
      createDonutChart(
        pdf, 
        margin + 35, 
        yPos + 60, 
        15, // outer radius
        10, // inner radius
        confidencePercentage, 
        severityColor
      );
      
      // Add percentage text in middle of donut
      pdf.setFontSize(10);
      pdf.setTextColor(15, 23, 42);
      pdf.setFont(undefined, 'bold');
      const confidenceText = `${confidencePercentage.toFixed(0)}%`;
      const textWidth = pdf.getStringUnitWidth(confidenceText) * 10 / 2;
      pdf.text(confidenceText, margin + 35 - textWidth/2, yPos + 62);
      
      // Rekomendasi
      pdf.setFontSize(10);
      pdf.setTextColor(100, 116, 139);
      pdf.text('Rekomendasi:', margin + 10, yPos + 80);
      
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
      
      pdf.setFontSize(9);
      pdf.setTextColor(15, 23, 42);
      addWrappedText(recommendation, margin + 10, yPos + 85, colWidth - 20, 4);
      
      // Kolom kanan - Gambar retina
      pdf.setFillColor(250, 250, 255);
      pdf.setDrawColor(230, 230, 250);
      pdf.roundedRect(margin + colWidth + 10, yPos, colWidth, 100, 5, 5, 'FD');
      
      // Icon untuk gambar retina
      pdf.setFillColor(124, 58, 237);
      pdf.circle(margin + colWidth + 20, yPos + 10, 5, 'F');
      
      pdf.setTextColor(124, 58, 237);
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Citra Retina', margin + colWidth + 30, yPos + 12);
      
      // Tambahkan gambar jika tersedia
      if (result.image && typeof result.image === 'string') {
        try {
          const imgWidth = colWidth - 20;
          const imgHeight = 70;
          pdf.addImage(result.image, 'JPEG', margin + colWidth + 20, yPos + 20, imgWidth, imgHeight);
        } catch (imgError) {
          console.error('Error adding image to PDF:', imgError);
          
          // Tambahkan placeholder jika gambar gagal dimuat
          pdf.setFillColor(240, 240, 240);
          pdf.roundedRect(margin + colWidth + 20, yPos + 20, colWidth - 20, 70, 3, 3, 'F');
          
          pdf.setTextColor(150, 150, 150);
          pdf.setFontSize(10);
          pdf.text('Gambar tidak tersedia', margin + colWidth + colWidth/2, yPos + 55, { align: 'center' });
        }
      } else {
        // Tambahkan placeholder jika tidak ada gambar
        pdf.setFillColor(240, 240, 240);
        pdf.roundedRect(margin + colWidth + 20, yPos + 20, colWidth - 20, 70, 3, 3, 'F');
        
        pdf.setTextColor(150, 150, 150);
        pdf.setFontSize(10);
        pdf.text('Gambar tidak tersedia', margin + colWidth + colWidth/2, yPos + 55, { align: 'center' });
      }
      
      yPos += 110;
      
      // Disclaimer dengan style modern
      pdf.setFillColor(254, 242, 242);
      pdf.setDrawColor(254, 226, 226);
      pdf.roundedRect(margin, yPos, pageWidth - (margin * 2), 25, 5, 5, 'FD');
      
      // Icon untuk disclaimer
      pdf.setFillColor(239, 68, 68);
      pdf.circle(margin + 10, yPos + 10, 5, 'F');
      
      pdf.setTextColor(239, 68, 68);
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'bold');
      pdf.text('Disclaimer:', margin + 20, yPos + 10);
      
      pdf.setFontSize(8);
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(127, 29, 29);
      const disclaimer = 'Hasil analisis ini merupakan bantuan diagnostik berbasis AI dan tidak menggantikan diagnosis dari dokter. Selalu konsultasikan dengan tenaga medis profesional untuk diagnosis dan penanganan yang tepat.';
      addWrappedText(disclaimer, margin + 10, yPos + 15, pageWidth - (margin * 2) - 20, 4);
      
      // Footer dengan gradien modern
      const footerHeight = 20;
      pdf.setFillColor(37, 99, 235);
      const footerGrd = pdf.context2d.createLinearGradient(0, pageHeight - footerHeight, pageWidth, pageHeight);
      footerGrd.addColorStop(0, '#3b82f6');
      footerGrd.addColorStop(0.5, '#4f46e5');
      footerGrd.addColorStop(1, '#7c3aed');
      pdf.context2d.fillStyle = footerGrd;
      pdf.context2d.fillRect(0, pageHeight - footerHeight, pageWidth, footerHeight);
      
      // Tambahkan wave di bagian atas footer
      const footerWaveHeight = 5;
      pdf.setDrawColor(255, 255, 255);
      pdf.setFillColor(255, 255, 255);
      
      let footerWavePoints = [];
      for (let x = 0; x <= pageWidth; x += 5) {
        const y = (pageHeight - footerHeight) + Math.sin(x / 10) * (footerWaveHeight / 2);
        footerWavePoints.push({ x, y });
      }
      
      pdf.setLineWidth(0);
      pdf.lines(
        footerWavePoints.map(p => [p.x, p.y]),
        0, 0, 
        [1, 0],
        'F'
      );
      
      pdf.setFontSize(10);
      pdf.setTextColor(255, 255, 255);
      pdf.text(`RetinaScan © ${new Date().getFullYear()} | AI-Powered Retinopathy Detection`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      // Simpan PDF dengan nama yang lebih deskriptif
      const pdfName = patient 
        ? `retina-analysis-${patient.fullName || patient.name}-${new Date().toISOString().slice(0,10)}.pdf`
        : `retina-analysis-${new Date().toISOString().slice(0,10)}.pdf`;
      
      pdf.save(pdfName);
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

  // Safe extraction of result data
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
          transition={{ duration: 0.8, delay: 1 }}
        >
          <motion.div 
            className="h-16 w-16 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-indigo-500 border-l-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          ></motion.div>
        </motion.div>
      )}
      
      {/* Actual image */}
      <motion.img
        src={getImageSource()}
        alt="Retina scan"
        className="w-full h-full object-contain"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.5, type: "spring", stiffness: 100 }}
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
        <motion.div 
          className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 bg-opacity-70 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
          <FiAlertTriangle className="text-yellow-400 text-4xl mb-3" />
          </motion.div>
          <motion.p 
            className="text-white text-center"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Gambar tidak dapat ditampilkan
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
            className="mt-3 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-md hover:bg-blue-600 transition-colors shadow-md"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.05, boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)' }}
            whileTap={{ scale: 0.95 }}
          >
            Coba Lagi
          </motion.button>
        </motion.div>
      )}
      
      {/* Decorative elements */}
      <motion.div 
        className="absolute top-0 right-0 w-32 h-32 opacity-20 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(79, 70, 229, 0.8) 0%, rgba(79, 70, 229, 0) 70%)' }}
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      <motion.div 
        className="absolute bottom-0 left-0 w-24 h-24 opacity-20 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.8) 0%, rgba(59, 130, 246, 0) 70%)' }}
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2]
        }}
        transition={{ 
          duration: 4,
          delay: 1,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        className="flex justify-between items-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        <motion.h3 
          className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1, type: "spring" }}
        >
          Hasil Analisis Retina
        </motion.h3>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3), 0 4px 6px -2px rgba(59, 130, 246, 0.2)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all text-sm font-medium shadow-md"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {isLoading ? (
              <motion.div 
                className="w-4 h-4 border-2 border-blue-100 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            ) : (
            <FiDownload className="text-blue-100" />
            )}
            {isLoading ? 'Memproses...' : 'Unduh PDF'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium shadow-md"
            style={glassEffect}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <FiPrinter className="text-gray-600" />
            Cetak
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center w-10 h-10 rounded-full"
            style={glassEffect}
            onClick={handleShare}
            disabled={isShareLoading}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {isShareLoading ? (
              <motion.div 
                className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full"
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
        </div>
      </motion.div>

      {/* Tambahkan indikator mode simulasi */}
      {result && (result.isSimulation || result.simulation_mode || 
        (result.raw_prediction && result.raw_prediction.is_simulation)) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
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
          
          {/* Animated particles */}
          <motion.div 
            className="absolute inset-0 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            {[...Array(10)].map((_, i) => (
              <motion.div 
                key={i}
                className="absolute rounded-full bg-white"
                style={{ 
                  width: Math.random() * 6 + 2,
                  height: Math.random() * 6 + 2,
                  left: `${Math.random() * 100}%`, 
                  top: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.5 + 0.3
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: Math.random() * 2
                }}
              />
            ))}
          </motion.div>
          
          {/* Content */}
          <div className="relative p-8 text-white z-10">
            <div className="flex justify-between items-start">
              <div>
                <motion.h2 
                  className="text-3xl font-bold mb-2"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
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
                transition={{ delay: 0.4, type: "spring" }}
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
            className="p-6 border-b bg-blue-50/50"
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
                <motion.span 
                  className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Citra Retina
                </motion.span>
              </h3>
              
              <motion.div 
                className="p-6 mb-6 rounded-xl shadow-md relative overflow-hidden"
                style={{ ...glassEffect }}
                variants={itemVariants}
                whileHover={{ 
                  y: -3, 
                  boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  transition: { duration: 0.3 }
                }}
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
                <motion.span 
                  className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Hasil Analisis
                </motion.span>
              </h3>
              
              {/* Severity */}
              <motion.div 
                className={`p-6 rounded-xl mb-6 shadow-md overflow-hidden relative`}
                style={{ ...glassEffect }}
                whileHover={{ 
                  y: -3, 
                  boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  transition: { duration: 0.3 }
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <motion.div 
                  className="absolute inset-0 opacity-10"
                  style={{
                    background: getSeverityGradient(resultSeverity),
                    zIndex: -1
                  }}
                  animate={{ 
                    opacity: [0.05, 0.15, 0.05],
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
                <div className="flex items-center">
                  <motion.div 
                    className="p-3 rounded-full" 
                    style={{ background: getSeverityBgColor(resultSeverity) }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 300, 
                      damping: 20,
                      delay: 0.3
                    }}
                  >
                    {getSeverityIcon(resultSeverity)}
                  </motion.div>
                  <div className="ml-4">
                    <motion.p 
                      className="text-sm text-gray-700 mb-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      Tingkat Keparahan
                    </motion.p>
                    <motion.p 
                      className={`text-2xl font-bold ${getSeverityColor(resultSeverity)}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        delay: 0.5, 
                        type: "spring",
                        stiffness: 200,
                        damping: 10
                      }}
                    >
                      {resultSeverity}
                    </motion.p>
                  </div>
                </div>
              </motion.div>
              
              {/* Confidence */}
              <motion.div 
                className="mb-6 p-5 rounded-xl shadow-md"
                style={{ ...glassEffect }}
                whileHover={{ 
                  y: -3, 
                  boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  transition: { duration: 0.3 }
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="flex justify-between mb-2">
                  <motion.p 
                    className="text-sm text-gray-700 font-medium"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    Tingkat Kepercayaan
                  </motion.p>
                  <motion.p 
                    className="text-sm font-bold text-blue-600"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    {formatPercentage(resultConfidence)}
                  </motion.p>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full relative overflow-hidden"
                    style={{ width: formatPercentage(resultConfidence) }}
                    initial={{ width: '0%' }}
                    animate={{ width: formatPercentage(resultConfidence) }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.7 }}
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

                {/* Circular progress indicator */}
                <motion.div 
                  className="mt-4 flex justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                >
                  <div className="relative w-24 h-24">
                    {/* Background circle */}
                    <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                    
                    {/* Progress circle */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="46"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${parseFloat(resultConfidence) * 2.9}, 1000`}
                        strokeDashoffset="0"
                        transform="rotate(-90, 50, 50)"
                        initial={{ strokeDasharray: "0, 1000" }}
                        animate={{ strokeDasharray: `${parseFloat(resultConfidence) * 2.9}, 1000` }}
                        transition={{ duration: 1.8, delay: 1, ease: "easeOut" }}
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="50%" stopColor="#4f46e5" />
                          <stop offset="100%" stopColor="#7c3aed" />
                        </linearGradient>
                      </defs>
                    </svg>
                    
                    {/* Percentage text */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        className="text-lg font-bold text-blue-700"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 1.2 }}
                      >
                        {formatPercentage(resultConfidence)}
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
              
              {/* Recommendation */}
              <motion.div 
                className="p-6 rounded-xl mt-auto shadow-md relative overflow-hidden"
                style={{ ...glassEffect }}
                whileHover={{ 
                  y: -3, 
                  boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  transition: { duration: 0.3 }
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <motion.div 
                  className="absolute inset-0 opacity-10"
                  style={{
                    background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                    zIndex: -1
                  }}
                  animate={{ 
                    opacity: [0.05, 0.15, 0.05],
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
                <motion.h4 
                  className="font-semibold text-blue-800 mb-3 flex items-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3 }}
                >
                  <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center mr-2 shadow-md">
                    <FiInfo className="text-white text-sm" />
                  </div>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                    Rekomendasi
                  </span>
                </motion.h4>
                <motion.p 
                  className="text-blue-700"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4 }}
                >
                  {resultNotes || 'Tidak ada catatan atau rekomendasi tersedia.'}
                </motion.p>
              </motion.div>
            </motion.div>
          </div>
          
          {/* Disclaimer */}
          <motion.div 
            className="mt-8 p-5 rounded-xl text-sm text-gray-500"
            style={{ ...glassEffect }}
            variants={itemVariants}
            whileHover={{ boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-start">
              <motion.div 
                className="bg-gray-100 p-2 rounded-full mr-3"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 1.5 }}
              >
                <FiAlertTriangle className="w-5 h-5 text-gray-500" />
              </motion.div>
              <div>
                <motion.p 
                  className="mb-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.6 }}
                >
                  <span className="font-bold text-gray-700">Disclaimer:</span> Hasil analisis ini merupakan bantuan diagnostik berbasis AI dan tidak menggantikan diagnosis dari dokter. Selalu konsultasikan dengan tenaga medis profesional untuk diagnosis dan penanganan yang tepat.
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.7 }}
                >
                  Analisis dilakukan menggunakan gambar fundus retina dengan teknologi AI yang telah dilatih pada kasus retinopati diabetik.
                </motion.p>
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
          
          {/* Animated particles */}
          <motion.div 
            className="absolute inset-0 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ duration: 1, delay: 1.8 }}
          >
            {[...Array(8)].map((_, i) => (
              <motion.div 
                key={i}
                className="absolute rounded-full bg-white"
                style={{ 
                  width: Math.random() * 4 + 2,
                  height: Math.random() * 4 + 2,
                  left: `${Math.random() * 100}%`, 
                  top: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.5 + 0.3
                }}
                animate={{
                  y: [0, -15, 0],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: Math.random() * 2
                }}
              />
            ))}
          </motion.div>
          
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