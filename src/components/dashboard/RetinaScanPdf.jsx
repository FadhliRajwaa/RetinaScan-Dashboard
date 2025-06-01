import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font, PDFDownloadLink } from '@react-pdf/renderer';

// Mendaftarkan font modern
Font.register({
  family: 'Montserrat',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/montserrat/v15/JTUSjIg1_i6t8kCHKm459Wlhzg.ttf', fontWeight: 'normal' },
    { src: 'https://fonts.gstatic.com/s/montserrat/v15/JTURjIg1_i6t8kCHKm45_bZF3gnD-w.ttf', fontWeight: 'bold' },
    { src: 'https://fonts.gstatic.com/s/montserrat/v15/JTURjIg1_i6t8kCHKm45_c5H3gnD-w.ttf', fontWeight: 'semibold' },
  ]
});

// Membuat stylesheet untuk PDF dengan desain modern
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Montserrat',
    backgroundColor: '#FFFFFF',
    paddingBottom: 65, // Untuk footer
  },
  header: {
    backgroundColor: '#3B82F6',
    backgroundImage: 'linear-gradient(45deg, #3B82F6, #6366F1)',
    padding: 30,
    paddingBottom: 25,
    marginBottom: 25,
    borderBottomRightRadius: 50,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#E0F2FE',
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
    padding: '0 30px',
  },
  sectionWithBackground: {
    marginBottom: 20,
    padding: 20,
    margin: '0 30px',
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    border: '1px solid #E0F2FE',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
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
    marginBottom: 10,
    lineHeight: 1.6,
  },
  image: {
    width: 220,
    height: 220,
    objectFit: 'contain',
    marginBottom: 12,
    alignSelf: 'center',
    borderRadius: 8,
    border: '1px solid #E5E7EB',
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  bullet: {
    fontSize: 12,
    marginRight: 8,
  },
  listItemText: {
    fontSize: 12,
    color: '#4B5563',
    flex: 1,
    lineHeight: 1.4,
  },
  severityBox: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    marginHorizontal: 30,
    border: '1px solid #E5E7EB',
  },
  severityContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  severityIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  severityTextContainer: {
    flex: 1,
  },
  severityLabel: {
    fontSize: 11,
    color: '#4B5563',
    marginBottom: 3,
  },
  severityText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  mild: {
    backgroundColor: '#D1FAE5',
    border: '1px solid #A7F3D0',
  },
  mildText: {
    color: '#065F46',
  },
  moderate: {
    backgroundColor: '#FEF3C7',
    border: '1px solid #FDE68A',
  },
  moderateText: {
    color: '#92400E',
  },
  severe: {
    backgroundColor: '#FEE2E2',
    border: '1px solid #FECACA',
  },
  severeText: {
    color: '#991B1B',
  },
  normal: {
    backgroundColor: '#DBEAFE',
    border: '1px solid #BFDBFE',
  },
  normalText: {
    color: '#1E40AF',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#3B82F6',
    backgroundImage: 'linear-gradient(45deg, #3B82F6, #6366F1)',
    padding: 20,
    fontSize: 10,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  confidenceBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginVertical: 6,
    width: '100%',
  },
  confidenceFill: {
    height: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  disclaimer: {
    marginTop: 25,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    margin: '0 30px',
    border: '1px solid #E5E7EB',
  },
  disclaimerText: {
    fontSize: 9,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 1.4,
  },
  patientInfoContainer: {
    backgroundColor: '#F0F9FF',
    padding: 20,
    margin: '0 30px 25px 30px',
    borderRadius: 8,
    border: '1px solid #BFDBFE',
  },
  patientInfoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
  },
  logoContainer: {
    position: 'absolute',
    top: 15,
    left: 30,
  },
  logo: {
    width: 40,
    height: 40,
  },
  watermark: {
    position: 'absolute',
    bottom: 100,
    right: 40,
    fontSize: 60,
    color: 'rgba(243, 244, 246, 0.5)',
    transform: 'rotate(-45deg)',
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

  // Logo RetinaScan
  const logoUrl = 'https://i.imgur.com/jNNT4LE.png'; // Placeholder logo URL - ganti dengan logo RetinaScan yang sebenarnya

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Watermark */}
        <Text style={styles.watermark}>RetinaScan</Text>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image src={logoUrl} style={styles.logo} />
          </View>
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
            {report.patient.medicalRecord && (
              <View style={styles.row}>
                <Text style={styles.label}>No. Rekam Medis:</Text>
                <Text style={styles.value}>{report.patient.medicalRecord}</Text>
              </View>
            )}
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
            © {new Date().getFullYear()} RetinaScan AI System | Powered by Advanced Retina Analysis Technology
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
export const RetinaScanPdfDownload = ({ report, fileName, darkMode = false }) => (
  <PDFDownloadLink 
    document={<RetinaScanPdf report={report} />} 
    fileName={fileName || `RetinaScan_Report_${new Date().toISOString().split('T')[0]}.pdf`}
    className={`flex items-center px-4 py-2.5 rounded-lg transition-all duration-300 shadow-md ${
      darkMode 
        ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-blue-900/20' 
        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/20'
    }`}
    style={{ textDecoration: 'none' }}
  >
    {({ blob, url, loading, error }) => 
      loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm font-medium">Menyiapkan PDF...</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5 mr-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-sm font-medium">Unduh PDF</span>
        </>
      )
    }
  </PDFDownloadLink>
);

export default RetinaScanPdf; 