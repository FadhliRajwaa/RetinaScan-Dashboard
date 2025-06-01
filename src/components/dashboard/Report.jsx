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
      pdf.text('Laporan Analisis Retina', pageWidth / 2, 25, { align: 'center' });
      
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'normal');
      const currentDate = formatDate(new Date());
      pdf.text(`Tanggal: ${currentDate}`, pageWidth / 2, 35, { align: 'center' });
      
      let yPos = 65;
      
      // Informasi pasien jika tersedia
      if (patient) {
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
      } else {
        yPos += 10;
      }
      
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
      const severityLevel = severity.toLowerCase();
      let severityColor;
      
      if (severityLevel === 'ringan') {
        severityColor = { r: 34, g: 197, b: 94 }; // Green-500
      } else if (severityLevel === 'sedang') {
        severityColor = { r: 234, g: 179, b: 8 }; // Yellow-500
      } else if (severityLevel === 'berat' || severityLevel === 'sangat berat') {
        severityColor = { r: 239, g: 68, b: 68 }; // Red-500
      } else {
        severityColor = { r: 59, g: 130, b: 246 }; // Blue-500
      }
      
      // Badge untuk severity
      const severityText = severity;
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
      pdf.text(`Tingkat Kepercayaan: ${formatPercentage(confidence)}`, margin + 15, yPos + 40);
      
      // Progress bar untuk confidence dengan gradient
      const barWidth = 80;
      const barHeight = 6;
      const confidenceWidth = barWidth * confidence;
      
      // Background bar
      drawRoundedRect(margin + 90, yPos + 37, barWidth, barHeight, 3, lightGrayColor);
      
      // Filled bar dengan gradient
      if (confidenceWidth > 0) {
        drawGradientRect(margin + 90, yPos + 37, confidenceWidth, barHeight, primaryColor, secondaryColor, 'horizontal');
      }
      
      yPos += 70;
      
      // Gambar
      if (result.image && typeof result.image === 'string') {
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
          pdf.addImage(result.image, 'JPEG', imgX, yPos, imgWidth, imgHeight);
          
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
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        className="flex justify-between items-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
          Hasil Analisis Retina
        </h3>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3), 0 4px 6px -2px rgba(59, 130, 246, 0.2)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all text-sm font-medium shadow-md"
          >
            <FiDownload className="text-blue-100" />
            {isLoading ? 'Memproses...' : 'Unduh PDF'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium shadow-md"
            style={glassEffect}
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
          >
            {isShareLoading ? (
              <div className="w-5 h-5 border-t-2 border-b-2 border-gray-600 rounded-full animate-spin"></div>
            ) : shareSuccess ? (
              <FiCheck className="text-green-600" />
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
    </div>
  );
}

export default Report;