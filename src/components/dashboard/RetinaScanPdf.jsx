import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font, PDFDownloadLink } from '@react-pdf/renderer';

// Mendaftarkan font dengan tambahan font modern
Font.register({
  family: 'Open Sans',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf', fontWeight: 'normal' },
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf', fontWeight: 'bold' },
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf', fontWeight: 'heavy' },
  ]
});

// Membuat stylesheet untuk PDF dengan desain modern
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Open Sans',
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  header: {
    backgroundColor: '#2563EB',
    padding: 30,
    paddingBottom: 20,
    marginBottom: 30,
    position: 'relative',
    backgroundImage: 'linear-gradient(120deg, #2563EB 0%, #4F46E5 50%, #7C3AED 100%)',
  },
  headerPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  title: {
    fontSize: 26,
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
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    border: '1px solid #E0F2FE',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundImage: 'linear-gradient(90deg, #2563EB 0%, #4F46E5 100%)',
    backgroundClip: 'text',
    color: 'transparent',
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
    borderWidth: 1,
    borderColor: '#E5E7EB',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  bullet: {
    fontSize: 12,
    marginRight: 6,
  },
  listItemText: {
    fontSize: 12,
    color: '#4B5563',
    flex: 1,
    lineHeight: 1.5,
  },
  severityBox: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    marginHorizontal: 30,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
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
    backgroundImage: 'linear-gradient(120deg, #D1FAE5 0%, #A7F3D0 100%)',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  mildText: {
    color: '#065F46',
  },
  moderate: {
    backgroundColor: '#FEF3C7',
    backgroundImage: 'linear-gradient(120deg, #FEF3C7 0%, #FDE68A 100%)',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  moderateText: {
    color: '#92400E',
  },
  severe: {
    backgroundColor: '#FEE2E2',
    backgroundImage: 'linear-gradient(120deg, #FEE2E2 0%, #FECACA 100%)',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  severeText: {
    color: '#991B1B',
  },
  normal: {
    backgroundColor: '#DBEAFE',
    backgroundImage: 'linear-gradient(120deg, #DBEAFE 0%, #BFDBFE 100%)',
    borderWidth: 1,
    borderColor: '#BFDBFE',
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
    backgroundImage: 'linear-gradient(90deg, #2563EB 0%, #4F46E5 100%)',
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
    backgroundColor: '#2563EB',
    backgroundImage: 'linear-gradient(90deg, #2563EB 0%, #4F46E5 100%)',
    borderRadius: 4,
  },
  disclaimer: {
    marginTop: 25,
    padding: 15,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    margin: '0 30px',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  disclaimerText: {
    fontSize: 9,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 1.5,
  },
  patientInfoContainer: {
    backgroundColor: '#F0F9FF',
    padding: 20,
    margin: '0 30px 25px 30px',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundImage: 'linear-gradient(120deg, #F0F9FF 0%, #E0F2FE 100%)',
  },
  patientInfoTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 10,
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    fontSize: 10,
    fontWeight: 'bold',
    display: 'inline-block',
    marginRight: 5,
  },
  badgeBlue: {
    backgroundColor: '#DBEAFE',
    color: '#1E40AF',
  },
  badgeGreen: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
  },
  badgeYellow: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  },
  badgeRed: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 15,
  },
  watermark: {
    position: 'absolute',
    bottom: 100,
    right: 40,
    fontSize: 60,
    color: 'rgba(229, 231, 235, 0.3)',
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

  // Mendapatkan badge style berdasarkan severity
  const getSeverityBadgeStyle = (severity) => {
    const severityLower = severity.toLowerCase();
    if (severityLower === 'ringan') {
      return styles.badgeGreen;
    } else if (severityLower === 'sedang') {
      return styles.badgeYellow;
    } else if (severityLower === 'berat' || severityLower === 'sangat berat') {
      return styles.badgeRed;
    } else {
      return styles.badgeBlue;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Watermark */}
        <Text style={styles.watermark}>RetinaScan</Text>

        {/* Header */}
        <View style={styles.header}>
          {/* Header Pattern */}
          <View style={styles.headerPattern}>
            {/* Pattern dibuat dengan teks dot untuk efek visual */}
            {Array(20).fill().map((_, i) => (
              <Text key={i} style={{
                position: 'absolute',
                top: i * 15,
                left: (i % 2) * 15,
                color: 'white',
                opacity: 0.1,
                fontSize: 20
              }}>● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ●</Text>
            ))}
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
            {report.patient.bloodType && (
              <View style={styles.row}>
                <Text style={styles.label}>Golongan Darah:</Text>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text style={{...styles.badge, ...styles.badgeBlue}}>{report.patient.bloodType}</Text>
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
              <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 2}}>
                <Text style={{...styles.severityText, ...getSeverityStyles(report.severity).text}}>
                  {report.severity}
                </Text>
                <Text style={{...styles.badge, ...getSeverityBadgeStyle(report.severity), marginLeft: 8}}>
                  {Math.round(report.confidence * 100)}%
                </Text>
              </View>
            </View>
          </View>
          
          {report.confidence && (
            <View style={{marginTop: 12}}>
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
            <Text style={{fontSize: 9, color: '#6B7280', textAlign: 'center', marginTop: 5}}>
              Gambar dianalisis pada: {formatDate(report.date)}
            </Text>
          </View>
        )}

        {/* Tanda Klinis */}
        {report.clinicalSigns && report.clinicalSigns.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tanda Klinis</Text>
          <View style={{backgroundColor: '#F9FAFB', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB'}}>
            {report.clinicalSigns.map((sign, index) => (
              <View style={styles.listItem} key={`sign-${index}`}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listItemText}>{sign}</Text>
              </View>
            ))}
          </View>
        </View>
        )}

        {/* Detail */}
        {report.details && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detail Kondisi</Text>
          <View style={{backgroundColor: '#F9FAFB', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB'}}>
            <Text style={styles.paragraph}>{report.details}</Text>
          </View>
        </View>
        )}

        {/* Divider */}
        <View style={styles.divider} />

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
          <View style={{backgroundColor: '#F9FAFB', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB'}}>
            {report.patientRisk && (
            <View style={styles.row}>
              <Text style={styles.label}>Risiko Pasien:</Text>
              <View style={{flexDirection: 'row'}}>
                <Text style={{...styles.badge, ...getSeverityBadgeStyle(report.patientRisk)}}>
                  {report.patientRisk}
                </Text>
              </View>
            </View>
            )}
            {report.followUpTime && (
            <View style={styles.row}>
              <Text style={styles.label}>Kunjungan Berikutnya:</Text>
              <Text style={styles.value}>{report.followUpTime}</Text>
            </View>
            )}
          </View>
        </View>
        )}

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Dokumen ini dibuat secara otomatis oleh sistem RetinaScan. Hasil pemeriksaan perlu dikonfirmasi oleh dokter mata.
          </Text>
          <Text style={styles.disclaimerText}>
            © {new Date().getFullYear()} RetinaScan AI System | Powered by AI-Retinopathy Detection
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
  <div className="flex flex-col sm:flex-row gap-3">
    <PDFDownloadLink 
      document={<RetinaScanPdf report={report} />} 
      fileName={fileName || `RetinaScan_Report_${new Date().toISOString().split('T')[0]}.pdf`}
      className="flex items-center justify-center px-5 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0 duration-300 group relative overflow-hidden"
      style={{ 
        textDecoration: 'none',
        position: 'relative'
      }}
    >
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-white/20 to-blue-500/0 animate-shimmer"></div>
      
      {/* Animated border effect */}
      <div className="absolute inset-0 rounded-xl border border-white/20 group-hover:border-white/40 transition-colors duration-300"></div>
      
      {({ blob, url, loading, error }) => 
        loading ? (
          <div className="flex items-center justify-center">
            <div className="relative">
              <svg className="animate-spin mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-2 w-2 bg-white rounded-full animate-ping"></div>
              </div>
            </div>
            <span className="font-medium text-white/90 group-hover:text-white transition-colors">Menyiapkan PDF...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center relative">
            <div className="flex items-center">
              <div className="mr-3 relative">
                <svg 
                  className="w-6 h-6 text-white transition-transform duration-300 group-hover:scale-110 group-hover:drop-shadow-glow" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                    className="group-hover:stroke-[2.5px] transition-all duration-300"
                  />
                </svg>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity"></div>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-white group-hover:text-white transition-colors">Unduh PDF Kualitas Tinggi</span>
                <span className="text-xs text-blue-100 opacity-80 group-hover:opacity-100 transition-opacity">Laporan lengkap dengan semua detail</span>
              </div>
              <span className="ml-3 bg-white/20 text-xs px-2 py-1 rounded-md font-bold group-hover:bg-white/30 transition-colors duration-300 group-hover:scale-105 transform">HD</span>
            </div>
          </div>
        )
      }
    </PDFDownloadLink>
    
    <button 
      onClick={() => window.print()}
      className="flex items-center justify-center px-5 py-3.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1 active:translate-y-0 duration-300 group relative overflow-hidden"
    >
      {/* Subtle hover gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative flex items-center">
        <div className="mr-3 relative">
          <svg 
            className="w-6 h-6 text-gray-600 transition-transform duration-300 group-hover:scale-110 group-hover:text-gray-800" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" 
              className="group-hover:stroke-[2.5px] transition-all duration-300"
            />
          </svg>
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-gray-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity"></div>
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Cetak Laporan</span>
          <span className="text-xs text-gray-500 opacity-80 group-hover:opacity-100 transition-opacity">Format yang siap cetak</span>
        </div>
      </div>
    </button>
  </div>
);

export default RetinaScanPdf; 