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
    fontFamily: 'Open Sans',
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#2563EB',
    padding: 30,
    paddingBottom: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#DBEAFE',
    textAlign: 'center',
  },
  section: {
    marginBottom: 15,
    padding: '0 30px',
  },
  sectionWithBackground: {
    marginBottom: 15,
    padding: 15,
    margin: '0 30px',
    backgroundColor: '#F0F9FF',
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
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
    fontWeight: 'bold',
  },
  paragraph: {
    fontSize: 12,
    color: '#4B5563',
    marginBottom: 8,
    lineHeight: 1.5,
  },
  image: {
    width: 200,
    height: 200,
    objectFit: 'contain',
    marginBottom: 10,
    alignSelf: 'center',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 5,
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
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    marginHorizontal: 30,
  },
  severityContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  severityIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  severityTextContainer: {
    flex: 1,
  },
  severityLabel: {
    fontSize: 10,
    color: '#4B5563',
    marginBottom: 2,
  },
  severityText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  mild: {
    backgroundColor: '#D1FAE5',
  },
  mildText: {
    color: '#065F46',
  },
  moderate: {
    backgroundColor: '#FEF3C7',
  },
  moderateText: {
    color: '#92400E',
  },
  severe: {
    backgroundColor: '#FEE2E2',
  },
  severeText: {
    color: '#991B1B',
  },
  normal: {
    backgroundColor: '#DBEAFE',
  },
  normalText: {
    color: '#1E40AF',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#2563EB',
    padding: 20,
    fontSize: 10,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  confidenceBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginVertical: 5,
    width: '100%',
  },
  confidenceFill: {
    height: 6,
    backgroundColor: '#2563EB',
    borderRadius: 3,
  },
  disclaimer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 5,
    margin: '0 30px',
  },
  disclaimerText: {
    fontSize: 9,
    color: '#6B7280',
    textAlign: 'center',
  },
  patientInfoContainer: {
    backgroundColor: '#F0F9FF',
    padding: 15,
    margin: '0 30px 20px 30px',
    borderRadius: 5,
  },
  patientInfoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
});

// Komponen untuk laporan PDF
const RetinaScanPdf = ({ report }) => {
  // Helper untuk mendapatkan warna berdasarkan severity
  const getSeverityStyles = (severity) => {
    const severityLower = severity.toLowerCase();
    if (severityLower === 'ringan') {
      return { box: styles.mild, text: styles.mildText };
    } else if (severityLower === 'sedang') {
      return { box: styles.moderate, text: styles.moderateText };
    } else if (severityLower === 'berat' || severityLower === 'sangat berat') {
      return { box: styles.severe, text: styles.severeText };
    } else {
      return { box: styles.normal, text: styles.normalText };
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

  // Mendapatkan icon untuk severity
  const getSeverityIcon = (severity) => {
    const severityLower = severity.toLowerCase();
    if (severityLower === 'ringan') {
      return 'https://img.icons8.com/ios-filled/100/065F46/info.png';
    } else if (severityLower === 'sedang') {
      return 'https://img.icons8.com/ios-filled/100/92400E/warning-shield.png';
    } else if (severityLower === 'berat' || severityLower === 'sangat berat') {
      return 'https://img.icons8.com/ios-filled/100/991B1B/high-priority.png';
    } else {
      return 'https://img.icons8.com/ios-filled/100/1E40AF/checkmark--v1.png';
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Laporan Pemeriksaan Retina</Text>
          <Text style={styles.subtitle}>Tanggal: {formatDate(report.date)}</Text>
        </View>

        {/* Informasi Pasien */}
        {report.patient && (
          <View style={styles.patientInfoContainer}>
            <Text style={styles.patientInfoTitle}>Informasi Pasien</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Nama:</Text>
              <Text style={styles.value}>{report.patient.fullName || report.patient.name}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Jenis Kelamin:</Text>
              <Text style={styles.value}>{report.patient.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Umur:</Text>
              <Text style={styles.value}>{report.patient.age} tahun</Text>
            </View>
          </View>
        )}

        {/* Severity */}
        <View style={{...styles.severityBox, ...getSeverityStyles(report.severity).box}}>
          <View style={styles.severityContent}>
            <Image 
              src={getSeverityIcon(report.severity)} 
              style={styles.severityIcon}
              cache={false}
            />
            <View style={styles.severityTextContainer}>
              <Text style={styles.severityLabel}>Tingkat Keparahan:</Text>
              <Text style={{...styles.severityText, ...getSeverityStyles(report.severity).text}}>
                {report.severity}
                {report.confidence ? ` (${Math.round(report.confidence * 100)}%)` : ''}
          </Text>
            </View>
          </View>
          
          {report.confidence && (
            <View style={{marginTop: 8}}>
              <View style={styles.confidenceBar}>
                <View style={{...styles.confidenceFill, width: `${report.confidence * 100}%`}} />
              </View>
              <Text style={{fontSize: 9, color: '#6B7280', textAlign: 'right'}}>{Math.round(report.confidence * 100)}% kepercayaan</Text>
            </View>
          )}
        </View>

        {/* Gambar Retina */}
        {report.image && (
          <View style={styles.sectionWithBackground}>
            <Text style={styles.sectionTitle}>Gambar Retina</Text>
            <Image 
              src={report.image} 
              style={styles.image} 
              cache={false} 
            />
          </View>
        )}

        {/* Tanda Klinis */}
        {report.clinicalSigns && report.clinicalSigns.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tanda Klinis</Text>
            {report.clinicalSigns.map((sign, index) => (
            <View style={styles.listItem} key={`sign-${index}`}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listItemText}>{sign}</Text>
            </View>
          ))}
        </View>
        )}

        {/* Detail */}
        {report.details && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detail Kondisi</Text>
          <Text style={styles.paragraph}>{report.details}</Text>
        </View>
        )}

        {/* Rekomendasi */}
        <View style={styles.sectionWithBackground}>
          <Text style={styles.sectionTitle}>Rekomendasi</Text>
          <Text style={styles.paragraph}>
            {report.recommendations || (
              report.severity.toLowerCase() === 'tidak ada' || report.severity.toLowerCase() === 'normal'
                ? 'Lakukan pemeriksaan rutin setiap tahun.'
                : report.severity.toLowerCase() === 'ringan'
                ? 'Kontrol gula darah dan tekanan darah. Pemeriksaan ulang dalam 9-12 bulan.'
                : report.severity.toLowerCase() === 'sedang'
                ? 'Konsultasi dengan dokter spesialis mata. Pemeriksaan ulang dalam 6 bulan.'
                : report.severity.toLowerCase() === 'berat'
                ? 'Rujukan segera ke dokter spesialis mata. Pemeriksaan ulang dalam 2-3 bulan.'
                : 'Rujukan segera ke dokter spesialis mata untuk evaluasi dan kemungkinan tindakan laser atau operasi.'
            )}
          </Text>
        </View>

        {/* Informasi Tambahan */}
        {(report.patientRisk || report.followUpTime) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi Tambahan</Text>
            {report.patientRisk && (
          <View style={styles.row}>
            <Text style={styles.label}>Risiko Pasien:</Text>
            <Text style={styles.value}>{report.patientRisk}</Text>
          </View>
            )}
            {report.followUpTime && (
          <View style={styles.row}>
            <Text style={styles.label}>Kunjungan Berikutnya:</Text>
            <Text style={styles.value}>{report.followUpTime}</Text>
          </View>
            )}
          </View>
        )}

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Dokumen ini dibuat secara otomatis oleh sistem RetinaScan. Hasil pemeriksaan perlu dikonfirmasi oleh dokter mata.
          </Text>
          <Text style={styles.disclaimerText}>
            © {new Date().getFullYear()} RetinaScan AI System
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>RetinaScan © {new Date().getFullYear()} | AI-Powered Retinopathy Detection</Text>
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