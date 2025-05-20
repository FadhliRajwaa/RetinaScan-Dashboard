import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font, PDFDownloadLink } from '@react-pdf/renderer';

// Mendaftarkan font (opsional - bisa disesuaikan dengan kebutuhan)
Font.register({
  family: 'Open Sans',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf', fontWeight: 'normal' },
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf', fontWeight: 'bold' },
  ]
});

// Membuat stylesheet untuk PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Open Sans',
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: '40%',
    fontSize: 12,
    color: '#4B5563',
  },
  value: {
    width: '60%',
    fontSize: 12,
    color: '#1F2937',
  },
  paragraph: {
    fontSize: 12,
    color: '#4B5563',
    marginBottom: 5,
    lineHeight: 1.5,
  },
  image: {
    width: 250,
    height: 250,
    objectFit: 'contain',
    marginBottom: 10,
    alignSelf: 'center',
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  bullet: {
    fontSize: 12,
    marginRight: 5,
  },
  listItemText: {
    fontSize: 12,
    color: '#4B5563',
    flex: 1,
  },
  severityBox: {
    padding: 8,
    borderRadius: 4,
    marginBottom: 10,
    alignItems: 'center',
  },
  severityText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  mild: {
    backgroundColor: '#D1FAE5',
  },
  moderate: {
    backgroundColor: '#FEF3C7',
  },
  severe: {
    backgroundColor: '#FEE2E2',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
});

// Komponen untuk laporan PDF
const RetinaScanPdf = ({ report }) => {
  // Helper untuk mendapatkan warna berdasarkan severity
  const getSeverityStyles = (severity) => {
    switch (severity) {
      case 'Ringan':
        return { ...styles.severityBox, ...styles.mild };
      case 'Sedang':
        return { ...styles.severityBox, ...styles.moderate };
      case 'Berat':
        return { ...styles.severityBox, ...styles.severe };
      default:
        return styles.severityBox;
    }
  };

  // Format tanggal
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Laporan Pemeriksaan Retina</Text>
          <Text style={styles.subtitle}>Tanggal: {formatDate(report.date)}</Text>
        </View>

        {/* Severity */}
        <View style={getSeverityStyles(report.severity)}>
          <Text style={styles.severityText}>
            Tingkat Keparahan: {report.severity}
            {report.confidence ? ` (Tingkat Kepastian: ${Math.round(report.confidence * 100)}%)` : ''}
          </Text>
        </View>

        {/* Gambar Retina */}
        {report.image && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gambar Retina</Text>
            <Image 
              src={report.image} 
              style={styles.image} 
              cache={false} 
            />
          </View>
        )}

        {/* Tanda Klinis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tanda Klinis</Text>
          {report.clinicalSigns && report.clinicalSigns.map((sign, index) => (
            <View style={styles.listItem} key={`sign-${index}`}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listItemText}>{sign}</Text>
            </View>
          ))}
        </View>

        {/* Detail */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detail Kondisi</Text>
          <Text style={styles.paragraph}>{report.details}</Text>
        </View>

        {/* Rekomendasi */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rekomendasi</Text>
          <Text style={styles.paragraph}>{report.recommendations}</Text>
        </View>

        {/* Informasi Tambahan */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi Tambahan</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Risiko Pasien:</Text>
            <Text style={styles.value}>{report.patientRisk}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Kunjungan Berikutnya:</Text>
            <Text style={styles.value}>{report.followUpTime}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Dokumen ini dibuat secara otomatis oleh sistem RetinaScan. Hasil pemeriksaan perlu dikonfirmasi oleh dokter mata.</Text>
          <Text>© {new Date().getFullYear()} RetinaScan AI System</Text>
        </View>
      </Page>
    </Document>
  );
};

// Komponen untuk tombol download PDF
export const RetinaScanPdfDownload = ({ report, fileName }) => (
  <PDFDownloadLink 
    document={<RetinaScanPdf report={report} />} 
    fileName={fileName || `RetinaScan_Report.pdf`}
    className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
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