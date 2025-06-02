import React, { useState } from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font, PDFDownloadLink } from '@react-pdf/renderer';
import { motion } from 'framer-motion';

// Mendaftarkan font (opsional - bisa disesuaikan dengan kebutuhan)
Font.register({
  family: 'Open Sans',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf', fontWeight: 'normal' },
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf', fontWeight: 'bold' },
  ]
});

// Mendaftarkan font tambahan untuk desain yang lebih modern
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ]
});

// Membuat stylesheet untuk PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Roboto'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottom: '1px solid #e0e0e0',
  },
  headerLeft: {
    flexDirection: 'column',
  },
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1e40af',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 10,
  },
  date: {
    fontSize: 10,
    color: '#6b7280',
  },
  section: {
    margin: 10,
    padding: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 15,
    border: '1px solid #f3f4f6',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1e40af',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  patientInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  patientInfoItem: {
    width: '50%',
    marginBottom: 10,
  },
  patientInfoLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 2,
  },
  patientInfoValue: {
    fontSize: 12,
    fontWeight: 500,
    color: '#111827',
  },
  resultSection: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  resultImage: {
    width: 250,
    height: 250,
    objectFit: 'contain',
    marginRight: 15,
    border: '1px solid #e0e0e0',
    borderRadius: 8,
  },
  resultDetails: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  resultItem: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    border: '1px solid #e0e0e0',
  },
  resultItemTitle: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 2,
  },
  resultItemValue: {
    fontSize: 14,
    fontWeight: 500,
    color: '#111827',
  },
  severityNone: {
    color: '#10b981',
  },
  severityMild: {
    color: '#f59e0b',
  },
  severityModerate: {
    color: '#f97316',
  },
  severitySevere: {
    color: '#ef4444',
  },
  severityUnknown: {
    color: '#6b7280',
  },
  confidenceBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginTop: 5,
    position: 'relative',
  },
  confidenceFill: {
    position: 'absolute',
    height: 8,
    borderRadius: 4,
    left: 0,
    top: 0,
  },
  recommendationSection: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#eff6ff',
    borderRadius: 6,
    border: '1px solid #dbeafe',
  },
  recommendationTitle: {
    fontSize: 12,
    fontWeight: 500,
    color: '#1e40af',
    marginBottom: 5,
  },
  recommendationText: {
    fontSize: 11,
    color: '#1e3a8a',
    lineHeight: 1.5,
  },
  disclaimer: {
    fontSize: 9,
    color: '#6b7280',
    marginTop: 30,
    padding: 10,
    borderTop: '1px solid #e0e0e0',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
    paddingTop: 10,
    borderTop: '1px solid #e0e0e0',
  },
  watermark: {
    position: 'absolute',
    bottom: 60,
    right: 30,
    fontSize: 8,
    color: '#d1d5db',
    transform: 'rotate(-45deg)',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: 700,
    color: '#1e40af',
    marginLeft: 5,
  },
  simulationBadge: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    padding: '4 8',
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 500,
    marginTop: 5,
    textAlign: 'center',
  }
});

// Komponen untuk laporan PDF
const RetinaScanPdf = ({ report }) => {
  // Extract data from report
  const patientName = report?.patient?.name || 'Tidak Diketahui';
  const patientGender = report?.patient?.gender || 'Tidak Diketahui';
  const patientAge = report?.patient?.age || 'Tidak Diketahui';
  const patientDOB = report?.patient?.dateOfBirth ? formatDate(report.patient.dateOfBirth) : 'Tidak Diketahui';
  const patientBloodType = report?.patient?.bloodType || 'Tidak Diketahui';
  
  const resultSeverity = report?.severity || 'Tidak Diketahui';
  const resultConfidence = report?.confidence || 0;
  const resultNotes = report?.notes || 'Tidak ada catatan atau rekomendasi tersedia.';
  const resultDate = report?.createdAt ? formatDate(report.createdAt) : formatDate(new Date());
  
  const isSimulation = report?.isSimulation || report?.simulation_mode || 
    (report?.raw_prediction && report?.raw_prediction.is_simulation);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>RetinaScan AI</Text>
            </View>
            <Text style={styles.subtitle}>Deteksi Retinopati Diabetik</Text>
            {isSimulation && (
              <Text style={styles.simulationBadge}>SIMULASI - BUKAN HASIL SEBENARNYA</Text>
            )}
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.title}>Laporan Analisis</Text>
            <Text style={styles.date}>{resultDate}</Text>
          </View>
        </View>

        {/* Patient Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi Pasien</Text>
          <View style={styles.patientInfo}>
            <View style={styles.patientInfoItem}>
              <Text style={styles.patientInfoLabel}>Nama Lengkap</Text>
              <Text style={styles.patientInfoValue}>{patientName}</Text>
            </View>
            <View style={styles.patientInfoItem}>
              <Text style={styles.patientInfoLabel}>Jenis Kelamin / Umur</Text>
              <Text style={styles.patientInfoValue}>{patientGender}, {patientAge} tahun</Text>
            </View>
            <View style={styles.patientInfoItem}>
              <Text style={styles.patientInfoLabel}>Tanggal Lahir</Text>
              <Text style={styles.patientInfoValue}>{patientDOB}</Text>
            </View>
            <View style={styles.patientInfoItem}>
              <Text style={styles.patientInfoLabel}>Golongan Darah</Text>
              <Text style={styles.patientInfoValue}>{patientBloodType}</Text>
            </View>
          </View>
        </View>
        
        {/* Results */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hasil Analisis</Text>
          <View style={styles.resultSection}>
            {/* Image */}
            <Image 
              src={report?.imageUrl || '/images/default-retina.jpg'} 
              style={styles.resultImage} 
            />
            
            {/* Results */}
            <View style={styles.resultDetails}>
              {/* Severity */}
              <View style={styles.resultItem}>
                <Text style={styles.resultItemTitle}>Tingkat Keparahan</Text>
                <Text style={{...styles.resultItemValue, ...getSeverityColor(resultSeverity)}}>
                  {resultSeverity}
          </Text>
              </View>
              
              {/* Confidence */}
              <View style={styles.resultItem}>
                <Text style={styles.resultItemTitle}>Tingkat Kepercayaan</Text>
                <Text style={styles.resultItemValue}>
                  {Math.round(resultConfidence * 100)}%
                </Text>
                <View style={styles.confidenceBar}>
                  <View style={{
                    ...styles.confidenceFill,
                    width: `${Math.round(resultConfidence * 100)}%`,
                    backgroundColor: resultConfidence > 0.7 ? '#10b981' : resultConfidence > 0.4 ? '#f59e0b' : '#ef4444'
                  }} />
            </View>
          </View>
          
              {/* Recommendation */}
              <View style={styles.recommendationSection}>
                <Text style={styles.recommendationTitle}>Rekomendasi</Text>
                <Text style={styles.recommendationText}>{resultNotes}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          Disclaimer: Hasil analisis ini merupakan bantuan diagnostik berbasis AI dan tidak menggantikan diagnosis dari dokter. 
          Selalu konsultasikan dengan tenaga medis profesional untuk diagnosis dan penanganan yang tepat.
          Analisis dilakukan menggunakan gambar fundus retina dengan teknologi AI yang telah dilatih pada kasus retinopati diabetik.
          </Text>

        {/* Footer */}
        <Text style={styles.footer}>
          RetinaScan © {new Date().getFullYear()} - AI-Powered Retinopathy Detection - www.retinascan.example.com
        </Text>
        
        {/* Watermark */}
        <Text style={styles.watermark}>
          Generated by RetinaScan AI - {new Date().toISOString().split('T')[0]}
        </Text>
      </Page>
    </Document>
  );
};

// Perbarui komponen RetinaScanPdfDownload dengan animasi yang lebih baik
export const RetinaScanPdfDownload = ({ report, fileName }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
  <PDFDownloadLink 
    document={<RetinaScanPdf report={report} />} 
    fileName={fileName || `RetinaScan_Report.pdf`}
      className="inline-block"
    style={{ textDecoration: 'none' }}
  >
      {({ blob, url, loading, error }) => (
        <motion.button
          className={`flex items-center px-5 py-3 rounded-xl transition-all shadow-md relative overflow-hidden ${
            error 
              ? "bg-red-600 hover:bg-red-700 text-white" 
              : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
          }`}
          whileHover={{ 
            scale: 1.05, 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
          whileTap={{ scale: 0.95 }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          disabled={loading}
        >
          {/* Background animation */}
          <motion.div 
            className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-indigo-600"
            animate={{
              backgroundPosition: isHovered ? ['0% 0%', '100% 0%'] : '0% 0%'
            }}
            transition={{
              duration: 3,
              ease: "easeInOut"
            }}
            style={{
              backgroundSize: '200% 100%'
            }}
          />
          
          {/* Shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
            initial={{ x: '-100%' }}
            animate={isHovered ? { x: '100%' } : { x: '-100%' }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
          
          {/* Loading spinner or icon */}
          <div className="relative z-10 flex items-center">
            {loading ? (
              <div className="flex items-center">
                <motion.svg 
                  className="mr-3 h-6 w-6 text-white" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </motion.svg>
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  Menyiapkan PDF...
                </motion.span>
              </div>
            ) : error ? (
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-3 text-red-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
                <span>Gagal Membuat PDF</span>
              </div>
            ) : (
              <div className="flex items-center">
                <motion.svg 
                  className="w-6 h-6 mr-3" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  initial={{ scale: 1 }}
                  animate={isHovered ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </motion.svg>
                <span className="font-medium">Unduh PDF (Kualitas Tinggi)</span>
              </div>
            )}
          </div>
          
          {/* Loading progress animation */}
          {loading && (
            <motion.div 
              className="absolute bottom-0 left-0 h-1 bg-white"
              initial={{ width: "0%" }}
              animate={{ width: ["0%", "50%", "75%", "90%"] }}
              transition={{ 
                times: [0, 0.4, 0.8, 1],
                duration: 3, 
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
          )}
        </motion.button>
      )}
    </PDFDownloadLink>
  );
};

// Tambahkan komponen loading overlay untuk PDF
export const PDFLoadingOverlay = ({ isVisible }) => (
  <motion.div 
    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
    initial={{ opacity: 0 }}
    animate={{ opacity: isVisible ? 1 : 0 }}
    exit={{ opacity: 0 }}
    style={{ pointerEvents: isVisible ? "auto" : "none" }}
  >
    <motion.div 
      className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-md"
      initial={{ scale: 0.8, y: 20 }}
      animate={{ scale: isVisible ? 1 : 0.8, y: isVisible ? 0 : 20 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
    >
      <div className="w-20 h-20 mb-6 relative">
        <motion.div 
          className="absolute inset-0 border-8 border-blue-600/20 rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        />
        <motion.div 
          className="absolute inset-0 border-8 border-transparent border-t-blue-600 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute inset-2 bg-blue-100 rounded-full flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </motion.div>
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">Menyiapkan PDF</h3>
      <p className="text-gray-600 text-center mb-4">Mohon tunggu sebentar sementara kami menyiapkan dokumen PDF berkualitas tinggi</p>
      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
          initial={{ width: "0%" }}
          animate={{ width: ["0%", "100%"] }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        />
      </div>
    </motion.div>
  </motion.div>
);

// Fungsi untuk mendapatkan warna berdasarkan severity
const getSeverityColor = (severity) => {
  const severityLower = severity?.toLowerCase() || '';
  
  if (severityLower.includes('none') || severityLower.includes('tidak ada')) {
    return styles.severityNone;
  } else if (severityLower.includes('mild') || severityLower.includes('ringan')) {
    return styles.severityMild;
  } else if (severityLower.includes('moderate') || severityLower.includes('sedang')) {
    return styles.severityModerate;
  } else if (severityLower.includes('severe') || severityLower.includes('parah')) {
    return styles.severitySevere;
  } else {
    return styles.severityUnknown;
  }
};

// Fungsi untuk memformat tanggal
const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default RetinaScanPdf; 