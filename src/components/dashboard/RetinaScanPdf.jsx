import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font, PDFDownloadLink } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

// Register font
Font.register({
  family: 'Nunito',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/nunito/v16/XRXV3I6Li01BKofINeaE.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/nunito/v16/XRXW3I6Li01BKofA6sKUYevN.ttf', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/nunito/v16/XRXW3I6Li01BKofAjsOUYevN.ttf', fontWeight: 700 },
  ],
});

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Nunito',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
    borderBottomStyle: 'solid',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'column',
  },
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  logo: {
    width: 50,
    height: 50,
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
  },
  date: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 5,
  },
  reportId: {
    fontSize: 10,
    color: '#6b7280',
  },
  section: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    borderLeftStyle: 'solid',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1e3a8a',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderBottomStyle: 'solid',
  },
  patientInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  patientInfoItem: {
    width: '50%',
    marginBottom: 8,
  },
  patientInfoLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  patientInfoValue: {
    fontSize: 11,
    color: '#111827',
    fontWeight: 600,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  image: {
    width: 250,
    height: 250,
    objectFit: 'contain',
    borderRadius: 8,
    marginBottom: 5,
  },
  imageCaption: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
  },
  resultSection: {
    marginBottom: 15,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1e3a8a',
    flex: 1,
  },
  severityBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    fontSize: 10,
    fontWeight: 700,
  },
  severityNone: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
  },
  severityMild: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
  },
  severityModerate: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  severitySevere: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
  },
  severityProliferative: {
    backgroundColor: '#fecaca',
    color: '#991b1b',
  },
  confidenceBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginVertical: 5,
  },
  confidenceFill: {
    height: 6,
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },
  confidenceText: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'right',
  },
  detailItem: {
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 11,
    color: '#111827',
  },
  recommendationBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  recommendationTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#1e40af',
    marginBottom: 5,
  },
  recommendationText: {
    fontSize: 11,
    color: '#1e3a8a',
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 9,
    color: '#9ca3af',
    textAlign: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    borderTopStyle: 'solid',
  },
  watermark: {
    position: 'absolute',
    bottom: 60,
    right: 30,
    fontSize: 8,
    color: '#d1d5db',
    transform: 'rotate(-45deg)',
  },
  gradientBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 10,
    backgroundColor: '#3b82f6',
  }
});

// Helper function to get severity style
const getSeverityStyle = (severity) => {
  const level = severity?.toLowerCase() || '';
  
  if (level.includes('tidak ada') || level.includes('normal') || level.includes('no dr')) {
    return styles.severityNone;
  } else if (level.includes('ringan') || level.includes('mild')) {
    return styles.severityMild;
  } else if (level.includes('sedang') || level.includes('moderate')) {
    return styles.severityModerate;
  } else if (level.includes('berat') || level.includes('severe')) {
    return styles.severitySevere;
  } else if (level.includes('sangat berat') || level.includes('proliferative')) {
    return styles.severityProliferative;
  }
  
  return styles.severityNone;
  };

// Format date helper
const formatDate = (date) => {
  try {
    return format(new Date(date), 'dd MMMM yyyy, HH:mm', { locale: id });
  } catch (error) {
    return format(new Date(), 'dd MMMM yyyy, HH:mm', { locale: id });
  }
  };

// Main PDF Document Component
const RetinaScanPdf = ({ data }) => {
  // Extract data with fallbacks
  const {
    patient = {},
    severity = 'Tidak ada',
    confidence = 0.8,
    recommendation = 'Tidak ada rekomendasi khusus.',
    timestamp = new Date(),
    imageUrl = '',
    analysisId = 'RS' + Math.floor(Math.random() * 10000),
  } = data || {};

  // Format confidence as percentage
  const confidencePercent = typeof confidence === 'number' 
    ? (confidence > 1 ? confidence : confidence * 100).toFixed(1)
    : 80;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Gradient bar at top */}
        <View style={styles.gradientBar} />
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Hasil Scan Retina</Text>
            <Text style={styles.subtitle}>RetinaScan AI Analysis Report</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.date}>{formatDate(timestamp)}</Text>
            <Text style={styles.reportId}>ID: {analysisId}</Text>
          </View>
        </View>

        {/* Patient Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi Pasien</Text>
          <View style={styles.patientInfo}>
            <View style={styles.patientInfoItem}>
              <Text style={styles.patientInfoLabel}>Nama</Text>
              <Text style={styles.patientInfoValue}>{patient.fullName || patient.name || 'Tidak tersedia'}</Text>
            </View>
            <View style={styles.patientInfoItem}>
              <Text style={styles.patientInfoLabel}>ID Pasien</Text>
              <Text style={styles.patientInfoValue}>{patient._id || 'Tidak tersedia'}</Text>
            </View>
            <View style={styles.patientInfoItem}>
              <Text style={styles.patientInfoLabel}>Tanggal Lahir</Text>
              <Text style={styles.patientInfoValue}>
                {patient.dateOfBirth ? formatDate(patient.dateOfBirth).split(',')[0] : 'Tidak tersedia'}
              </Text>
            </View>
            <View style={styles.patientInfoItem}>
              <Text style={styles.patientInfoLabel}>Jenis Kelamin</Text>
              <Text style={styles.patientInfoValue}>
                {patient.gender === 'male' ? 'Laki-laki' : 
                 patient.gender === 'female' ? 'Perempuan' : 
                 patient.gender || 'Tidak tersedia'}
          </Text>
            </View>
          </View>
        </View>

        {/* Image Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Citra Retina</Text>
          <View style={styles.imageContainer}>
            <Image 
              src={imageUrl || 'https://via.placeholder.com/300?text=No+Image'} 
              style={styles.image} 
            />
            <Text style={styles.imageCaption}>Gambar retina yang dianalisis oleh sistem AI</Text>
          </View>
        </View>

        {/* Analysis Result */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hasil Analisis</Text>
          
          <View style={styles.resultSection}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>Tingkat Keparahan</Text>
              <Text style={[styles.severityBadge, getSeverityStyle(severity)]}>
                {severity}
          </Text>
        </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Tingkat Keyakinan</Text>
              <View style={styles.confidenceBar}>
                <View style={[styles.confidenceFill, { width: `${confidencePercent}%` }]} />
              </View>
              <Text style={styles.confidenceText}>{confidencePercent}%</Text>
          </View>
          </View>

          <View style={styles.recommendationBox}>
            <Text style={styles.recommendationTitle}>Rekomendasi</Text>
            <Text style={styles.recommendationText}>{recommendation}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Dokumen ini dibuat secara otomatis oleh sistem RetinaScan AI. 
            Hasil analisis hanya bersifat prediktif dan harus dikonfirmasi oleh dokter spesialis mata.
          </Text>
        </View>

        {/* Watermark */}
        <Text style={styles.watermark}>RetinaScan AI • {formatDate(timestamp)}</Text>
      </Page>
    </Document>
  );
};

// Komponen untuk tombol download PDF
export const RetinaScanPdfDownload = ({ report, fileName }) => (
  <PDFDownloadLink 
    document={<RetinaScanPdf report={report} />} 
    fileName={fileName || `RetinaScan_Report.pdf`}
    className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
    style={{ textDecoration: 'none' }}
  >
    {({ blob, url, loading, error }) => 
      loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Menyiapkan PDF...
        </>
      ) : (
        <>
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Unduh PDF (Kualitas Tinggi)
        </>
      )
    }
  </PDFDownloadLink>
);

export default RetinaScanPdf; 