import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font, PDFDownloadLink } from '@react-pdf/renderer';

// Mendaftarkan font dengan pilihan yang lebih modern
Font.register({
  family: 'Montserrat',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/montserrat-fonts@1.0.0/fonts/montserrat-regular.ttf', fontWeight: 'normal' },
    { src: 'https://cdn.jsdelivr.net/npm/montserrat-fonts@1.0.0/fonts/montserrat-600.ttf', fontWeight: 'bold' },
    { src: 'https://cdn.jsdelivr.net/npm/montserrat-fonts@1.0.0/fonts/montserrat-700.ttf', fontWeight: 'heavy' },
  ]
});

// Membuat stylesheet untuk PDF dengan desain yang lebih modern
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Montserrat',
    backgroundColor: '#FFFFFF',
    padding: 0,
  },
  header: {
    backgroundColor: '#2563EB',
    backgroundImage: 'linear-gradient(120deg, #2563EB 0%, #4F46E5 50%, #7C3AED 100%)',
    padding: 30,
    paddingBottom: 25,
    marginBottom: 30,
    position: 'relative',
  },
  headerPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  headerWave: {
    position: 'absolute',
    bottom: -2,
    left: 0,
    right: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: 'heavy',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#DBEAFE',
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
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    border: '1px solid #E2E8F0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 12,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    borderBottomStyle: 'solid',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
  },
  label: {
    width: '40%',
    fontSize: 12,
    color: '#64748B',
  },
  value: {
    width: '60%',
    fontSize: 12,
    color: '#1E293B',
    fontWeight: 'bold',
  },
  paragraph: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 10,
    lineHeight: 1.6,
  },
  image: {
    width: 220,
    height: 220,
    objectFit: 'contain',
    marginBottom: 10,
    alignSelf: 'center',
    borderRadius: 8,
    border: '1px solid #CBD5E1',
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'center',
  },
  bullet: {
    fontSize: 12,
    marginRight: 8,
    color: '#3B82F6',
  },
  listItemText: {
    fontSize: 12,
    color: '#475569',
    flex: 1,
    lineHeight: 1.4,
  },
  severityBox: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    marginHorizontal: 30,
    flexDirection: 'column',
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
    fontSize: 10,
    color: '#64748B',
    marginBottom: 4,
  },
  severityText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  mild: {
    backgroundColor: 'rgba(209, 250, 229, 0.8)',
    borderLeft: '4px solid #10B981',
  },
  mildText: {
    color: '#065F46',
  },
  moderate: {
    backgroundColor: 'rgba(254, 243, 199, 0.8)',
    borderLeft: '4px solid #F59E0B',
  },
  moderateText: {
    color: '#92400E',
  },
  severe: {
    backgroundColor: 'rgba(254, 226, 226, 0.8)',
    borderLeft: '4px solid #EF4444',
  },
  severeText: {
    color: '#991B1B',
  },
  normal: {
    backgroundColor: 'rgba(219, 234, 254, 0.8)',
    borderLeft: '4px solid #3B82F6',
  },
  normalText: {
    color: '#1E40AF',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1E40AF',
    backgroundImage: 'linear-gradient(120deg, #2563EB 0%, #4F46E5 50%, #7C3AED 100%)',
    padding: 20,
    fontSize: 10,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  confidenceBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginVertical: 8,
    width: '100%',
  },
  confidenceFill: {
    height: 8,
    backgroundColor: '#3B82F6',
    backgroundImage: 'linear-gradient(90deg, #3B82F6 0%, #6366F1 100%)',
    borderRadius: 4,
  },
  disclaimer: {
    marginTop: 30,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    margin: '0 30px',
    border: '1px solid #E2E8F0',
  },
  disclaimerText: {
    fontSize: 9,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 1.5,
  },
  disclaimerTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 4,
    textAlign: 'center',
  },
  patientInfoContainer: {
    backgroundColor: '#F0F9FF',
    padding: 20,
    margin: '0 30px 20px 30px',
    borderRadius: 8,
    border: '1px solid #BAE6FD',
  },
  patientInfoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0369A1',
    marginBottom: 10,
  },
  patientInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  recommendationCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    padding: 12,
    marginTop: 8,
    border: '1px solid #BFDBFE',
  },
  recommendationTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 6,
  },
  clinicalSignsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4B5563',
    marginBottom: 8,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    fontSize: 10,
    color: '#94A3B8',
  },
  headerLogo: {
    position: 'absolute',
    top: 20,
    left: 30,
    width: 40,
    height: 40,
  },
  headerRight: {
    position: 'absolute',
    top: 20,
    right: 30,
    color: '#FFFFFF',
    fontSize: 10,
    textAlign: 'right',
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
      return 'https://img.icons8.com/fluency/96/000000/info-squared.png';
    } else if (severityLower === 'sedang') {
      return 'https://img.icons8.com/fluency/96/000000/medium-risk.png';
    } else if (severityLower === 'berat' || severityLower === 'sangat berat') {
      return 'https://img.icons8.com/fluency/96/000000/high-risk.png';
    } else {
      return 'https://img.icons8.com/fluency/96/000000/ok.png';
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {/* Header Background Pattern */}
          <Image 
            src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0ibm9uZSIvPgo8cGF0aCBkPSJNMzAgNUw1NSAzMEwzMCA1NUw1IDMweiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iMC4xNSIgZmlsbD0ibm9uZSIvPgo8L3N2Zz4=" 
            style={styles.headerPattern}
          />
          
          {/* Logo (optional) */}
          <Image 
            src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiNmZmZmZmYiLz4KPHBhdGggZD0iTTEyIDZDMTIgNiAxNiAxMCAxNiAxMkMxNiAxNiAxMiAxOCAxMiAxOEM4IDE4IDYgMTYgNiAxMkM2IDEwIDEyIDYgMTIgNloiIHN0cm9rZT0iIzNCODJGNiIgc3Ryb2tlLXdpZHRoPSIxLjUiIGZpbGw9Im5vbmUiLz4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMyIgZmlsbD0iIzNCODJGNiIvPgo8L3N2Zz4K" 
            style={styles.headerLogo}
          />
          
          {/* Header Right Info */}
          <Text style={styles.headerRight}>ID: {report.id || 'RS-' + Math.floor(Math.random() * 10000)}</Text>
          
          <Text style={styles.title}>Laporan Pemeriksaan Retina</Text>
          <Text style={styles.subtitle}>Tanggal: {formatDate(report.date || new Date())}</Text>
          
          {/* Bottom Wave */}
          <Image 
            src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQ0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDE0NDAgNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0wIDEwQzE0NCAxMCAyMTYgNDAgMzYwIDQwQzUwNCA0MCA1NzYgMTAgNzIwIDEwQzg2NCAxMCA5MzYgNDAgMTA4MCA0MEMxMjI0IDQwIDEyOTYgMTAgMTQ0MCAxMFY0MEgwVjEwWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==" 
            style={styles.headerWave}
          />
        </View>

        {/* Informasi Pasien */}
        {report.patient && (
          <View style={styles.patientInfoContainer}>
            <Text style={styles.patientInfoTitle}>Informasi Pasien</Text>
            <View style={styles.patientInfoCard}>
              <View style={styles.row}>
                <Text style={styles.label}>Nama:</Text>
                <Text style={styles.value}>{report.patient.fullName || report.patient.name}</Text>
              </View>
            </View>
            
            <View style={styles.patientInfoCard}>
              <View style={styles.row}>
                <Text style={styles.label}>Jenis Kelamin:</Text>
                <Text style={styles.value}>{report.patient.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</Text>
              </View>
            </View>
            
            <View style={styles.patientInfoCard}>
              <View style={styles.row}>
                <Text style={styles.label}>Umur:</Text>
                <Text style={styles.value}>{report.patient.age} tahun</Text>
              </View>
            </View>
            
            {report.patient.bloodType && (
              <View style={styles.patientInfoCard}>
                <View style={styles.row}>
                  <Text style={styles.label}>Golongan Darah:</Text>
                  <Text style={styles.value}>{report.patient.bloodType}</Text>
                </View>
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
            <View style={{marginTop: 10}}>
              <View style={styles.confidenceBar}>
                <View style={{...styles.confidenceFill, width: `${report.confidence * 100}%`}} />
              </View>
              <Text style={{fontSize: 9, color: '#64748B', textAlign: 'right'}}>{Math.round(report.confidence * 100)}% kepercayaan</Text>
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
            <Text style={{fontSize: 9, color: '#64748B', textAlign: 'center', marginTop: 4}}>
              Gambar fundus retina yang dianalisis
            </Text>
          </View>
        )}

        {/* Tanda Klinis */}
        {report.clinicalSigns && report.clinicalSigns.length > 0 && (
          <View style={styles.sectionWithBackground}>
            <Text style={styles.clinicalSignsTitle}>Tanda Klinis</Text>
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
          <View style={styles.recommendationCard}>
            <Text style={styles.recommendationTitle}>Tindak Lanjut</Text>
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
          <Text style={styles.disclaimerTitle}>PERHATIAN</Text>
          <Text style={styles.disclaimerText}>
            Dokumen ini dibuat secara otomatis oleh sistem RetinaScan. Hasil pemeriksaan perlu dikonfirmasi oleh dokter mata.
            Analisis berbasis AI tidak menggantikan diagnosis medis profesional.
          </Text>
          <Text style={styles.disclaimerText}>
            © {new Date().getFullYear()} RetinaScan AI System - Deteksi Retinopati Diabetik
          </Text>
        </View>

        {/* Page Number */}
        <Text style={styles.pageNumber}>Halaman 1</Text>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>RetinaScan © {new Date().getFullYear()} | AI-Powered Retinopathy Detection</Text>
        </View>
      </Page>
    </Document>
  );
};

// Komponen untuk tombol download PDF dengan desain yang lebih modern
export const RetinaScanPdfDownload = ({ report, fileName }) => (
  <PDFDownloadLink 
    document={<RetinaScanPdf report={report} />} 
    fileName={fileName || `RetinaScan_Report_${new Date().toISOString().slice(0,10)}.pdf`}
    className="flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md"
    style={{ textDecoration: 'none' }}
  >
    {({ blob, url, loading, error }) => 
      loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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