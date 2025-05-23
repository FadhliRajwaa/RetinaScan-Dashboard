import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiPrinter, FiExternalLink, FiCalendar, FiUser } from 'react-icons/fi';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function Report({ result }) {
  const [isLoading, setIsLoading] = useState(false);
  const reportRef = useRef(null);

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

  // Download PDF
  const handleDownload = async () => {
    try {
      setIsLoading(true);
      
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;
      
      pdf.setFontSize(16);
      pdf.text('Laporan Analisis Retina', pdfWidth / 2, 15, { align: 'center' });
      pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      pdf.save('retina-analysis-report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Print report
  const handlePrint = () => {
    window.print();
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

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        className="flex justify-between items-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-xl font-bold">Hasil Analisis Retina</h3>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            <FiDownload />
            {isLoading ? 'Memproses...' : 'Unduh PDF'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrint}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
          >
            <FiPrinter />
            Cetak
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        ref={reportRef}
        className="bg-white border rounded-xl overflow-hidden shadow-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-1">Laporan Analisis Retina</h2>
              <div className="flex items-center text-blue-100">
                <FiCalendar className="mr-1" />
                <span className="text-sm">{formatDate(new Date())}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-100">RetinaScan AI</div>
              <div className="text-xs text-blue-200">Deteksi Retinopati Diabetik</div>
            </div>
          </div>
        </div>

        {/* Patient Information */}
        {patient && (
          <motion.div 
            className="p-6 border-b"
            variants={itemVariants}
          >
            <h3 className="font-medium mb-3 text-gray-700 flex items-center">
              <FiUser className="mr-2 text-blue-500" />
              Informasi Pasien
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nama Lengkap</p>
                <p className="font-medium">{patient.fullName || patient.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Jenis Kelamin / Umur</p>
                <p className="font-medium">
                  {patient.gender === 'male' ? 'Laki-laki' : 'Perempuan'}, {patient.age} tahun
                </p>
              </div>
              {patient.dateOfBirth && (
                <div>
                  <p className="text-sm text-gray-500">Tanggal Lahir</p>
                  <p className="font-medium">{new Date(patient.dateOfBirth).toLocaleDateString('id-ID')}</p>
                </div>
              )}
              {patient.bloodType && (
                <div>
                  <p className="text-sm text-gray-500">Golongan Darah</p>
                  <p className="font-medium">{patient.bloodType}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Image */}
            <motion.div variants={itemVariants}>
              <h3 className="font-medium mb-3 text-gray-700">Gambar yang Dianalisis</h3>
              <div className="bg-gray-100 p-3 rounded-lg overflow-hidden">
                {image && image.preview && (
                  <img 
                    src={image.preview} 
                    alt="Retina scan" 
                    className="w-full object-contain rounded h-64"
                  />
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {image && image.file && image.file.name}
              </p>
            </motion.div>
            
            {/* Right Column - Analysis Results */}
            <motion.div 
              className="flex flex-col h-full"
              variants={itemVariants}
            >
              <h3 className="font-medium mb-3 text-gray-700">Hasil Analisis</h3>
              
              {/* Severity */}
              <div className={`p-4 rounded-lg border mb-4 ${getSeverityCardColor(severity)}`}>
                <p className="text-sm text-gray-700 mb-1">Tingkat Keparahan</p>
                <p className={`text-2xl font-bold ${getSeverityColor(severity)}`}>
                  {severity}
                </p>
              </div>
              
              {/* Confidence */}
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <p className="text-sm text-gray-700">Tingkat Kepercayaan</p>
                  <p className="text-sm font-medium">{formatPercentage(confidence)}</p>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600" 
                    style={{ width: formatPercentage(confidence) }}
                  ></div>
                </div>
              </div>
              
              {/* Recommendation */}
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mt-auto">
                <h4 className="font-medium text-blue-800 mb-2">Rekomendasi</h4>
                <p className="text-blue-700 text-sm">
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
                </p>
              </div>
            </motion.div>
          </div>
          
          {/* Disclaimer */}
          <motion.div 
            className="mt-6 bg-gray-50 p-4 rounded-lg text-xs text-gray-500"
            variants={itemVariants}
          >
            <p className="mb-1"><strong>Disclaimer:</strong> Hasil analisis ini merupakan bantuan diagnostik berbasis AI dan tidak menggantikan diagnosis dari dokter. Selalu konsultasikan dengan tenaga medis profesional untuk diagnosis dan penanganan yang tepat.</p>
            <p>Analisis dilakukan menggunakan gambar fundus retina dengan teknologi AI yang telah dilatih pada kasus retinopati diabetik.</p>
          </motion.div>
        </div>
        
        {/* Footer */}
        <motion.div 
          className="bg-gray-50 p-4 border-t text-center text-xs text-gray-500"
          variants={itemVariants}
        >
          <p>RetinaScan &copy; {new Date().getFullYear()} | AI-Powered Retinopathy Detection</p>
          <p className="mt-1">
            <a href="https://retinascan.example.com" className="text-blue-500 flex items-center justify-center gap-1 hover:underline">
              <span>www.retinascan.example.com</span>
              <FiExternalLink size={12} />
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Report;