import { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { FiDownload, FiPrinter, FiExternalLink, FiCalendar, FiUser, FiInfo, FiAlertTriangle, FiCheck, FiBarChart2, FiEye } from 'react-icons/fi';
import jsPDF from 'jspdf';
import { useTheme } from '../../context/ThemeContext';

function Report({ result }) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('report'); // 'report' atau 'visualization'
  const reportRef = useRef(null);
  const { theme } = useTheme();
  
  // Mouse position untuk efek hover yang lebih dinamis
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 300 };
  const mouseXSpring = useSpring(mouseX, springConfig);
  const mouseYSpring = useSpring(mouseY, springConfig);

  // Fungsi untuk efek hover yang lebih dinamis
  const handleMouseMove = (e) => {
    const { currentTarget, clientX, clientY } = e;
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  };

  const resetMousePosition = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Efek glassmorphism
  const glassEffect = {
    background: `rgba(255, 255, 255, 0.7)`,
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
  };

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No analysis data available</p>
      </div>
    );
  }

  const { severity, confidence, image, patient } = result;

  // Format date
  const formatDate = (date) => {
    return new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format percentage
  const formatPercentage = (value) => {
    return (value * 100).toFixed(1) + '%';
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
      if (image && image.preview) {
        try {
          // Tambahkan gambar jika tersedia
          const imgWidth = 100;
          const imgHeight = 100;
          pdf.addImage(image.preview, 'JPEG', pageWidth / 2 - imgWidth / 2, yPos, imgWidth, imgHeight);
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

  // Animation variants yang ditingkatkan
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.15,
        duration: 0.6,
        ease: [0.6, 0.05, -0.01, 0.9]
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: 'spring', 
        damping: 25,
        stiffness: 200
      }
    }
  };
  
  const tabVariants = {
    inactive: { 
      opacity: 0.7,
      scale: 0.95,
      y: 0
    },
    active: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 20 
      }
    },
    hover: {
      y: -3,
      transition: { 
        type: 'spring', 
        stiffness: 500, 
        damping: 15 
      }
    },
    tap: {
      scale: 0.98
    }
  };
  
  // Visualisasi data untuk tingkat keparahan
  const severityData = [
    { level: 'Tidak ada', color: '#10B981', value: 0 },
    { level: 'Ringan', color: '#10B981', value: 1 },
    { level: 'Sedang', color: '#FBBF24', value: 2 },
    { level: 'Berat', color: '#F97316', value: 3 },
    { level: 'Sangat Berat', color: '#EF4444', value: 4 }
  ];
  
  // Mendapatkan nilai numerik untuk tingkat keparahan saat ini
  const getCurrentSeverityValue = () => {
    const currentSeverity = severity.toLowerCase();
    const found = severityData.find(item => item.level.toLowerCase() === currentSeverity);
    return found ? found.value : 0;
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        className="flex justify-between items-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        <h3 className="text-xl font-bold" style={{ color: theme.secondary || "#1F2937" }}>
          Hasil Analisis Retina
        </h3>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            disabled={isLoading}
            className="flex items-center gap-1 px-4 py-2 text-white rounded-xl text-sm font-medium shadow-sm"
            style={{
              background: `linear-gradient(135deg, ${theme.primary || '#3B82F6'}, ${theme.secondary || '#2563EB'})`,
              boxShadow: `0 4px 10px ${theme.primary}40`
            }}
          >
            <FiDownload />
            {isLoading ? 'Memproses...' : 'Unduh PDF'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrint}
            className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium shadow-sm"
            style={{
              background: 'rgba(243, 244, 246, 0.8)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              color: theme.secondary || '#1F2937',
              border: '1px solid rgba(229, 231, 235, 0.5)',
            }}
          >
            <FiPrinter />
            Cetak
          </motion.button>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div 
        className="flex mb-6 border-b"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, delay: 0.1 }}
      >
        <motion.button
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm rounded-t-lg ${activeTab === 'report' ? 'border-b-2' : ''}`}
          style={{
            borderColor: activeTab === 'report' ? theme.primary || '#3B82F6' : 'transparent',
            color: activeTab === 'report' ? theme.primary || '#3B82F6' : theme.secondary || '#6B7280',
          }}
          onClick={() => setActiveTab('report')}
          variants={tabVariants}
          initial="inactive"
          animate={activeTab === 'report' ? "active" : "inactive"}
          whileHover="hover"
          whileTap="tap"
        >
          <FiInfo />
          Laporan Hasil
        </motion.button>
        
        <motion.button
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm rounded-t-lg ${activeTab === 'visualization' ? 'border-b-2' : ''}`}
          style={{
            borderColor: activeTab === 'visualization' ? theme.primary || '#3B82F6' : 'transparent',
            color: activeTab === 'visualization' ? theme.primary || '#3B82F6' : theme.secondary || '#6B7280',
          }}
          onClick={() => setActiveTab('visualization')}
          variants={tabVariants}
          initial="inactive"
          animate={activeTab === 'visualization' ? "active" : "inactive"}
          whileHover="hover"
          whileTap="tap"
        >
          <FiBarChart2 />
          Visualisasi Data
        </motion.button>
      </motion.div>

      {/* Tambahkan indikator mode simulasi */}
      {result && (result.isSimulation || result.simulation_mode || 
        (result.raw_prediction && result.raw_prediction.is_simulation)) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="mb-6 overflow-hidden"
          style={{
            ...glassEffect,
            background: 'rgba(254, 252, 232, 0.8)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
          }}
        >
          <div className="flex items-start p-4 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-300 to-amber-500" />
            <motion.div 
              className="mr-3 flex-shrink-0 p-2 rounded-full bg-amber-100"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            >
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </motion.div>
            <div>
              <motion.p 
                className="font-bold mb-2 text-base text-amber-800"
                animate={{ color: ['#92400E', '#B45309', '#92400E'] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                PERHATIAN: Laporan dalam Mode Simulasi
              </motion.p>
              <p className="mb-2 text-amber-700">Hasil analisis ini menggunakan <span className="font-bold underline">data simulasi</span> karena layanan AI tidak tersedia saat ini.</p>
              <p className="text-amber-800 font-bold">Hasil ini TIDAK BOLEH digunakan untuk diagnosis klinis. Silakan konsultasikan dengan dokter mata untuk evaluasi yang akurat.</p>
              <motion.div 
                className="mt-3 p-3 rounded-md"
                style={{
                  background: 'rgba(254, 243, 199, 0.7)',
                  backdropFilter: 'blur(4px)',
                  WebkitBackdropFilter: 'blur(4px)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                }}
              >
                <p className="text-xs font-semibold text-amber-800">Untuk menggunakan model AI sebenarnya, jalankan script pengujian koneksi:</p>
                <motion.code 
                  className="text-xs p-1.5 rounded mt-1 block font-mono"
                  style={{
                    background: 'rgba(255, 255, 255, 0.7)',
                  }}
                  whileHover={{ 
                    background: 'rgba(255, 255, 255, 0.9)',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                  }}
                >
                  npm run test:flask
                </motion.code>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {activeTab === 'report' && (
          <motion.div
            key="report"
            ref={reportRef}
            className="overflow-hidden shadow-lg pdf-container"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: 20 }}
            style={glassEffect}
            onMouseMove={handleMouseMove}
            onMouseLeave={resetMousePosition}
          >
            <motion.div 
              className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden"
              style={{
                background: `radial-gradient(circle at ${mouseXSpring}px ${mouseYSpring}px, ${theme.primary}15 0%, transparent 70%)`,
                zIndex: 0
              }}
            />
            {/* Header */}
            <div className="relative overflow-hidden">
              <motion.div 
                className="absolute inset-0 z-0"
                animate={{ 
                  background: [
                    `linear-gradient(120deg, ${theme.primary || '#3B82F6'}80, ${theme.accent || '#2563EB'}90)`,
                    `linear-gradient(120deg, ${theme.accent || '#2563EB'}90, ${theme.primary || '#3B82F6'}80)`,
                    `linear-gradient(120deg, ${theme.primary || '#3B82F6'}80, ${theme.accent || '#2563EB'}90)`
                  ]
                }}
                transition={{ duration: 15, repeat: Infinity }}
              />
              <div className="relative z-10 p-8">
                <div className="flex justify-between items-start">
                  <div>
                    <motion.h2 
                      className="text-3xl font-bold mb-2 text-white"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: 'spring', damping: 20 }}
                    >
                      Laporan Analisis Retina
                    </motion.h2>
                    <motion.div 
                      className="flex items-center text-blue-100"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ type: 'spring', damping: 20, delay: 0.1 }}
                    >
                      <FiCalendar className="mr-2" />
                      <span className="text-sm">{formatDate(new Date())}</span>
                    </motion.div>
                  </div>
                  <motion.div 
                    className="text-right"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: 'spring', damping: 20 }}
                  >
                    <div className="text-lg font-semibold text-white">RetinaScan AI</div>
                    <div className="text-sm text-blue-100">Deteksi Retinopati Diabetik</div>
                    {/* Tambahkan label simulasi jika dalam mode simulasi */}
                    {result && (result.isSimulation || result.simulation_mode || 
                      (result.raw_prediction && result.raw_prediction.is_simulation)) && (
                      <motion.div 
                        className="mt-2"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', damping: 20, delay: 0.2 }}
                      >
                        <motion.span 
                          className="bg-amber-600 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-md inline-block"
                          animate={{ 
                            boxShadow: ['0 4px 12px rgba(217, 119, 6, 0.3)', '0 4px 20px rgba(217, 119, 6, 0.6)', '0 4px 12px rgba(217, 119, 6, 0.3)'],
                            opacity: [0.9, 1, 0.9]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          SIMULASI - BUKAN HASIL SEBENARNYA
                        </motion.span>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              </div>
              <motion.div 
                className="absolute bottom-0 left-0 right-0 h-1 bg-white opacity-30"
                animate={{ 
                  scaleX: [0, 1, 0],
                  x: ['-100%', '0%', '100%']
                }}
                transition={{ duration: 8, repeat: Infinity }}
              />
            </div>

            {/* Patient Information */}
            {patient && (
              <motion.div 
                className="p-6 border-b"
                variants={itemVariants}
                style={{
                  background: 'rgba(239, 246, 255, 0.6)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                }}
              >
                <motion.h3 
                  className="font-semibold mb-4 flex items-center text-lg"
                  style={{ color: theme.primary || '#3B82F6' }}
                  whileHover={{ x: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <FiUser className="mr-2" />
                  Informasi Pasien
                </motion.h3>
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-lg"
                  style={{
                    ...glassEffect,
                    background: 'rgba(255, 255, 255, 0.8)',
                  }}
                  whileHover={{ 
                    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
                    y: -3
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <p className="text-sm text-gray-500 mb-1">Nama Lengkap</p>
                    <p className="font-medium text-gray-800">{patient.fullName || patient.name}</p>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <p className="text-sm text-gray-500 mb-1">Jenis Kelamin / Umur</p>
                    <p className="font-medium text-gray-800">
                      {patient.gender === 'male' ? 'Laki-laki' : 'Perempuan'}, {patient.age} tahun
                    </p>
                  </motion.div>
                  {patient.dateOfBirth && (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <p className="text-sm text-gray-500 mb-1">Tanggal Lahir</p>
                      <p className="font-medium text-gray-800">{new Date(patient.dateOfBirth).toLocaleDateString('id-ID')}</p>
                    </motion.div>
                  )}
                  {patient.bloodType && (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <p className="text-sm text-gray-500 mb-1">Golongan Darah</p>
                      <p className="font-medium text-gray-800">{patient.bloodType}</p>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            )}

            {/* Content */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column - Image */}
                <motion.div variants={itemVariants}>
                  <motion.h3 
                    className="font-semibold mb-4 flex items-center text-lg"
                    style={{ color: theme.primary || '#3B82F6' }}
                    whileHover={{ x: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <FiEye className="mr-2" />
                    Gambar yang Dianalisis
                  </motion.h3>
                  <motion.div 
                    className="overflow-hidden rounded-lg"
                    style={{
                      ...glassEffect,
                      padding: '0.5rem',
                    }}
                    whileHover={{ 
                      boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
                      y: -5
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    {image && image.preview && (
                      <motion.div className="relative">
                        <motion.img 
                          src={image.preview} 
                          alt="Retina scan" 
                          className="w-full object-contain rounded h-64"
                          initial={{ filter: 'blur(10px)', opacity: 0 }}
                          animate={{ filter: 'blur(0px)', opacity: 1 }}
                          transition={{ duration: 0.8 }}
                          style={{
                            background: 'rgba(249, 250, 251, 0.5)'
                          }}
                        />
                        <motion.div 
                          className="absolute inset-0 pointer-events-none"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 0.5, 0] }}
                          transition={{ duration: 3, repeat: Infinity }}
                          style={{
                            background: `radial-gradient(circle at 50% 50%, ${theme.primary}30 0%, transparent 70%)`,
                          }}
                        />
                      </motion.div>
                    )}
                  </motion.div>
                  <motion.p 
                    className="text-xs text-gray-500 mt-2 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {image && image.file && image.file.name}
                  </motion.p>
                </motion.div>
                
                {/* Right Column - Analysis Results */}
                <motion.div 
                  className="flex flex-col h-full"
                  variants={itemVariants}
                >
                  <motion.h3 
                    className="font-semibold mb-4 flex items-center text-lg"
                    style={{ color: theme.primary || '#3B82F6' }}
                    whileHover={{ x: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <FiBarChart2 className="mr-2" />
                    Hasil Analisis
                  </motion.h3>
                  
                  {/* Severity */}
                  <motion.div 
                    className={`p-6 rounded-lg mb-6`}
                    style={{
                      ...glassEffect,
                      background: severity === 'Tidak ada' || severity === 'Ringan' 
                        ? 'rgba(209, 250, 229, 0.7)' // green
                        : severity === 'Sedang' 
                        ? 'rgba(254, 249, 195, 0.7)' // yellow
                        : severity === 'Berat' 
                        ? 'rgba(254, 215, 170, 0.7)' // orange
                        : 'rgba(254, 202, 202, 0.7)', // red
                      border: `1px solid ${
                        severity === 'Tidak ada' || severity === 'Ringan' 
                        ? 'rgba(16, 185, 129, 0.3)' // green
                        : severity === 'Sedang' 
                        ? 'rgba(251, 191, 36, 0.3)' // yellow
                        : severity === 'Berat' 
                        ? 'rgba(249, 115, 22, 0.3)' // orange
                        : 'rgba(239, 68, 68, 0.3)' // red
                      }`
                    }}
                    whileHover={{ 
                      boxShadow: `0 15px 30px ${
                        severity === 'Tidak ada' || severity === 'Ringan' 
                        ? 'rgba(16, 185, 129, 0.2)' // green
                        : severity === 'Sedang' 
                        ? 'rgba(251, 191, 36, 0.2)' // yellow
                        : severity === 'Berat' 
                        ? 'rgba(249, 115, 22, 0.2)' // orange
                        : 'rgba(239, 68, 68, 0.2)' // red
                      }`,
                      y: -5
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <div className="flex items-center">
                      <motion.div 
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
                      >
                        {getSeverityIcon(severity)}
                      </motion.div>
                      <div className="ml-4">
                        <p className="text-sm text-gray-700 mb-1">Tingkat Keparahan</p>
                        <motion.p 
                          className={`text-2xl font-bold ${getSeverityColor(severity)}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.5 }}
                        >
                          {severity}
                        </motion.p>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Confidence */}
                  <motion.div 
                    className="mb-6 p-5 rounded-lg"
                    style={{
                      ...glassEffect,
                      background: 'rgba(255, 255, 255, 0.7)'
                    }}
                    whileHover={{ 
                      boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
                      y: -5
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <div className="flex justify-between mb-2">
                      <p className="text-sm font-medium" style={{ color: theme.secondary || "#1F2937" }}>Tingkat Kepercayaan</p>
                      <motion.p 
                        className="text-sm font-bold" 
                        style={{ color: theme.primary || '#3B82F6' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                      >
                        {formatPercentage(confidence)}
                      </motion.p>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full" 
                        style={{
                          background: confidence < 0.5 
                            ? 'linear-gradient(90deg, #EF4444 0%, #F87171 100%)' 
                            : confidence < 0.8 
                              ? 'linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)' 
                              : 'linear-gradient(90deg, #10B981 0%, #34D399 100%)',
                          boxShadow: confidence < 0.5 
                            ? '0 0 15px rgba(239, 68, 68, 0.5)' 
                            : confidence < 0.8 
                              ? '0 0 15px rgba(245, 158, 11, 0.5)' 
                              : '0 0 15px rgba(16, 185, 129, 0.5)'
                        }}
                        initial={{ width: '0%' }}
                        animate={{ width: formatPercentage(confidence) }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.7 }}
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 text-xs text-gray-500 mt-1">
                      <div>Rendah</div>
                      <div className="text-center">Sedang</div>
                      <div className="text-right">Tinggi</div>
                    </div>
                  </motion.div>
                  
                  {/* Recommendation */}
                  <motion.div 
                    className="p-6 rounded-lg mt-auto"
                    style={{
                      ...glassEffect,
                      background: 'rgba(239, 246, 255, 0.7)'
                    }}
                    whileHover={{ 
                      boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
                      y: -5
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <motion.h4 
                      className="font-semibold flex items-center mb-3"
                      style={{ color: theme.primary || '#3B82F6' }}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 300, delay: 0.9 }}
                    >
                      <FiInfo className="mr-2" />
                      Rekomendasi
                    </motion.h4>
                    <motion.p 
                      className="text-blue-700"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.1 }}
                    >
                      {severity === 'Tidak ada' 
                        ? 'Lakukan pemeriksaan rutin setiap tahun.' 
                        : severity === 'Ringan'
                        ? 'Kontrol gula darah dan tekanan darah. Pemeriksaan ulang dalam 9-12 bulan.' 
                        : severity === 'Sedang'
                        ? 'Konsultasi dengan dokter spesialis mata. Pemeriksaan ulang dalam 6 bulan.'
                        : severity === 'Berat'
                        ? 'Rujukan segera ke dokter spesialis mata. Pemeriksaan ulang dalam 2-3 bulan.'
                        : severity === 'Sangat Berat'
                        ? 'Rujukan segera ke dokter spesialis mata untuk evaluasi dan kemungkinan tindakan laser atau operasi.'
                        : 'Lakukan pemeriksaan rutin setiap tahun.'}
                    </motion.p>
                  </motion.div>
                </motion.div>
              </div>
              
              {/* Disclaimer */}
              <motion.div 
                className="mt-8 p-5 rounded-lg text-sm text-gray-500"
                variants={itemVariants}
                style={{
                  ...glassEffect,
                  background: 'rgba(249, 250, 251, 0.7)'
                }}
                whileHover={{ 
                  boxShadow: '0 15px 30px rgba(0, 0, 0, 0.05)',
                  y: -3
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <p className="mb-1"><strong>Disclaimer:</strong> Hasil analisis ini merupakan bantuan diagnostik berbasis AI dan tidak menggantikan diagnosis dari dokter. Selalu konsultasikan dengan tenaga medis profesional untuk diagnosis dan penanganan yang tepat.</p>
                <p>Analisis dilakukan menggunakan gambar fundus retina dengan teknologi AI yang telah dilatih pada kasus retinopati diabetik.</p>
              </motion.div>
            </div>
            
            {/* Footer */}
            <motion.div 
              className="relative overflow-hidden p-6 text-center text-white"
              variants={itemVariants}
            >
              <motion.div 
                className="absolute inset-0 z-0"
                animate={{ 
                  background: [
                    `linear-gradient(120deg, ${theme.primary || '#3B82F6'}80, ${theme.accent || '#2563EB'}90)`,
                    `linear-gradient(120deg, ${theme.accent || '#2563EB'}90, ${theme.primary || '#3B82F6'}80)`,
                    `linear-gradient(120deg, ${theme.primary || '#3B82F6'}80, ${theme.accent || '#2563EB'}90)`
                  ]
                }}
                transition={{ duration: 15, repeat: Infinity }}
              />
              <div className="relative z-10">
                <motion.p 
                  className="font-semibold"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', damping: 20 }}
                >
                  RetinaScan &copy; {new Date().getFullYear()}
                </motion.p>
                <motion.p 
                  className="text-sm text-blue-100 mt-1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', damping: 20, delay: 0.1 }}
                >
                  AI-Powered Retinopathy Detection
                </motion.p>
                <motion.p 
                  className="mt-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', damping: 20, delay: 0.2 }}
                >
                  <motion.a 
                    href="https://retinascan.example.com" 
                    className="text-white flex items-center justify-center gap-1 hover:underline"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>www.retinascan.example.com</span>
                    <FiExternalLink size={14} />
                  </motion.a>
                </motion.p>
              </div>
              <motion.div 
                className="absolute bottom-0 left-0 right-0 h-1 bg-white opacity-30"
                animate={{ 
                  scaleX: [0, 1, 0],
                  x: ['-100%', '0%', '100%']
                }}
                transition={{ duration: 8, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'visualization' && (
          <motion.div
            key="visualization"
            className="overflow-hidden shadow-lg"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: 20 }}
            style={glassEffect}
            onMouseMove={handleMouseMove}
            onMouseLeave={resetMousePosition}
          >
            <motion.div 
              className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden"
              style={{
                background: `radial-gradient(circle at ${mouseXSpring}px ${mouseYSpring}px, ${theme.primary}15 0%, transparent 70%)`,
                zIndex: 0
              }}
            />
            
            {/* Header */}
            <div className="relative overflow-hidden">
              <motion.div 
                className="absolute inset-0 z-0"
                animate={{ 
                  background: [
                    `linear-gradient(120deg, ${theme.accent || '#2563EB'}80, ${theme.primary || '#3B82F6'}90)`,
                    `linear-gradient(120deg, ${theme.primary || '#3B82F6'}90, ${theme.accent || '#2563EB'}80)`,
                    `linear-gradient(120deg, ${theme.accent || '#2563EB'}80, ${theme.primary || '#3B82F6'}90)`
                  ]
                }}
                transition={{ duration: 15, repeat: Infinity }}
              />
              <div className="relative z-10 p-8">
                <motion.h2 
                  className="text-3xl font-bold mb-2 text-white"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', damping: 20 }}
                >
                  Visualisasi Data Analisis
                </motion.h2>
                <motion.div 
                  className="flex items-center text-blue-100"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: 'spring', damping: 20, delay: 0.1 }}
                >
                  <FiBarChart2 className="mr-2" />
                  <span className="text-sm">Representasi visual hasil analisis retina</span>
                </motion.div>
              </div>
              <motion.div 
                className="absolute bottom-0 left-0 right-0 h-1 bg-white opacity-30"
                animate={{ 
                  scaleX: [0, 1, 0],
                  x: ['-100%', '0%', '100%']
                }}
                transition={{ duration: 8, repeat: Infinity }}
              />
            </div>
            
            {/* Content */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column - Severity Chart */}
                <motion.div 
                  variants={itemVariants}
                  className="p-6 rounded-lg"
                  style={{
                    ...glassEffect,
                    background: 'rgba(255, 255, 255, 0.7)'
                  }}
                  whileHover={{ 
                    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
                    y: -5
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <motion.h3 
                    className="font-semibold mb-6 flex items-center text-lg"
                    style={{ color: theme.primary || '#3B82F6' }}
                  >
                    <FiBarChart2 className="mr-2" />
                    Tingkat Keparahan
                  </motion.h3>
                  
                  <div className="relative h-60 w-full">
                    {/* Severity Bar Chart */}
                    <div className="flex items-end h-40 mt-4 space-x-2">
                      {severityData.map((item, index) => {
                        const currentValue = getCurrentSeverityValue();
                        const isActive = index === currentValue;
                        const barHeight = `${(index + 1) * 20}%`;
                        
                        return (
                          <motion.div 
                            key={item.level}
                            className="flex-1 flex flex-col items-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                          >
                            <motion.div 
                              className="w-full rounded-t-lg relative"
                              style={{ 
                                height: barHeight,
                                backgroundColor: isActive ? item.color : `${item.color}50`,
                                boxShadow: isActive ? `0 0 15px ${item.color}80` : 'none'
                              }}
                              whileHover={{ 
                                backgroundColor: item.color,
                                boxShadow: `0 0 15px ${item.color}80`
                              }}
                              animate={isActive ? {
                                scale: [1, 1.05, 1],
                                transition: { duration: 2, repeat: Infinity }
                              } : {}}
                            >
                              {isActive && (
                                <motion.div 
                                  className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full"
                                  style={{ backgroundColor: item.color }}
                                  animate={{ 
                                    y: [0, -10, 0],
                                    opacity: [1, 0.7, 1]
                                  }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                />
                              )}
                            </motion.div>
                            <motion.p 
                              className="text-xs mt-2 font-medium text-center"
                              style={{ 
                                color: isActive ? item.color : theme.secondary || '#6B7280',
                                fontWeight: isActive ? 'bold' : 'normal'
                              }}
                            >
                              {item.level}
                            </motion.p>
                          </motion.div>
                        );
                      })}
                    </div>
                    
                    {/* Current Severity Indicator */}
                    <motion.div 
                      className="absolute bottom-20 left-0 right-0 h-0.5"
                      style={{ 
                        background: `linear-gradient(90deg, transparent, ${theme.primary || '#3B82F6'}, transparent)`,
                        opacity: 0.7
                      }}
                      animate={{ 
                        opacity: [0.3, 0.7, 0.3]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                </motion.div>
                
                {/* Right Column - Confidence Gauge */}
                <motion.div 
                  variants={itemVariants}
                  className="p-6 rounded-lg"
                  style={{
                    ...glassEffect,
                    background: 'rgba(255, 255, 255, 0.7)'
                  }}
                  whileHover={{ 
                    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
                    y: -5
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <motion.h3 
                    className="font-semibold mb-6 flex items-center text-lg"
                    style={{ color: theme.primary || '#3B82F6' }}
                  >
                    <FiBarChart2 className="mr-2" />
                    Tingkat Kepercayaan
                  </motion.h3>
                  
                  <div className="flex flex-col items-center justify-center h-40">
                    {/* Confidence Gauge */}
                    <div className="relative w-40 h-40">
                      {/* Background Circle */}
                      <motion.div 
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: 'rgba(229, 231, 235, 0.5)',
                          border: '4px solid rgba(255, 255, 255, 0.8)'
                        }}
                      />
                      
                      {/* Progress Circle */}
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                        <motion.circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke={
                            confidence < 0.5 
                              ? '#EF4444' 
                              : confidence < 0.8 
                                ? '#F59E0B' 
                                : '#10B981'
                          }
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${confidence * 251.2} 251.2`}
                          strokeDashoffset="0"
                          transform="rotate(-90 50 50)"
                          initial={{ strokeDasharray: "0 251.2" }}
                          animate={{ strokeDasharray: `${confidence * 251.2} 251.2` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                      </svg>
                      
                      {/* Percentage Text */}
                      <motion.div 
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
                      >
                        <motion.p 
                          className="text-3xl font-bold"
                          style={{ 
                            color: confidence < 0.5 
                              ? '#EF4444' 
                              : confidence < 0.8 
                                ? '#F59E0B' 
                                : '#10B981'
                          }}
                          animate={{ 
                            scale: [1, 1.05, 1]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {formatPercentage(confidence)}
                        </motion.p>
                      </motion.div>
                    </div>
                    
                    {/* Confidence Label */}
                    <motion.p 
                      className="mt-4 font-medium"
                      style={{ 
                        color: confidence < 0.5 
                          ? '#EF4444' 
                          : confidence < 0.8 
                            ? '#F59E0B' 
                            : '#10B981'
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                    >
                      {confidence < 0.5 
                        ? 'Kepercayaan Rendah' 
                        : confidence < 0.8 
                          ? 'Kepercayaan Sedang' 
                          : 'Kepercayaan Tinggi'}
                    </motion.p>
                  </div>
                </motion.div>
              </div>
              
              {/* Disclaimer */}
              <motion.div 
                className="mt-8 p-5 rounded-lg text-sm text-gray-500"
                variants={itemVariants}
                style={{
                  ...glassEffect,
                  background: 'rgba(249, 250, 251, 0.7)'
                }}
              >
                <p className="mb-1"><strong>Catatan:</strong> Visualisasi data ini menunjukkan tingkat keparahan retinopati diabetik dan tingkat kepercayaan AI dalam analisis. Semakin tinggi tingkat keparahan, semakin serius kondisi retina pasien.</p>
              </motion.div>
            </div>
            
            {/* Footer */}
            <motion.div 
              className="relative overflow-hidden p-6 text-center text-white"
              variants={itemVariants}
            >
              <motion.div 
                className="absolute inset-0 z-0"
                animate={{ 
                  background: [
                    `linear-gradient(120deg, ${theme.accent || '#2563EB'}80, ${theme.primary || '#3B82F6'}90)`,
                    `linear-gradient(120deg, ${theme.primary || '#3B82F6'}90, ${theme.accent || '#2563EB'}80)`,
                    `linear-gradient(120deg, ${theme.accent || '#2563EB'}80, ${theme.primary || '#3B82F6'}90)`
                  ]
                }}
                transition={{ duration: 15, repeat: Infinity }}
              />
              <div className="relative z-10">
                <motion.p className="font-semibold">RetinaScan &copy; {new Date().getFullYear()}</motion.p>
                <motion.p className="text-sm text-blue-100 mt-1">AI-Powered Retinopathy Detection</motion.p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Report;