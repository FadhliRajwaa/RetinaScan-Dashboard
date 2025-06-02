import React, { useEffect, useState } from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font, PDFDownloadLink } from '@react-pdf/renderer';
import { getPdfFontConfig, getOptimizedPdfConfig } from '../../utils/compatibilityUtils';

// Mendapatkan konfigurasi font dengan fallback
const fontConfig = getPdfFontConfig();
const pdfConfig = getOptimizedPdfConfig();

// Mendaftarkan font modern (Google Fonts)
Font.register({
  family: 'Poppins',
  fonts: [
    { src: fontConfig.Poppins.normal, fontWeight: 'normal' },
    { src: fontConfig.Poppins.bold, fontWeight: 'bold' },
    { src: fontConfig.Poppins.normal, fontWeight: 'medium' },
  ],
  fallback: fontConfig.Poppins.fallback
});

Font.register({
  family: 'Nunito',
  fonts: [
    { src: fontConfig.Nunito.normal, fontWeight: 'normal' },
    { src: fontConfig.Nunito.bold, fontWeight: 'bold' },
  ],
  fallback: fontConfig.Nunito.fallback
});

// Membuat stylesheet untuk PDF dengan desain modern
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Nunito',
    backgroundColor: '#FFFFFF',
    paddingBottom: 65, // Ruang untuk footer
  },
  header: {
    backgroundColor: '#3B82F6',
    backgroundImage: 'linear-gradient(120deg, #3B82F6, #6366F1, #8B5CF6)',
    padding: 30,
    paddingBottom: 20,
    marginBottom: 20,
    position: 'relative',
  },
  headerWave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoContainer: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Poppins',
    color: '#FFFFFF',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#E0E7FF',
    textAlign: 'center',
    fontFamily: 'Nunito',
  },
  section: {
    marginBottom: 15,
    padding: '0 30px',
  },
  sectionWithBackground: {
    marginBottom: 15,
    padding: 20,
    margin: '0 30px',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    border: '1px solid #F3F4F6',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins',
    color: '#1F2937',
    marginBottom: 10,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    borderBottomStyle: 'solid',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  label: {
    width: '40%',
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Nunito',
  },
  value: {
    width: '60%',
    fontSize: 12,
    color: '#1F2937',
    fontWeight: 'bold',
    fontFamily: 'Nunito',
  },
  paragraph: {
    fontSize: 12,
    color: '#4B5563',
    marginBottom: 8,
    lineHeight: 1.5,
    fontFamily: 'Nunito',
  },
  image: {
    width: 200,
    height: 200,
    objectFit: 'contain',
    marginBottom: 10,
    alignSelf: 'center',
    borderRadius: 8,
    border: '2px solid #E5E7EB',
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 5,
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 12,
    marginRight: 5,
    color: '#3B82F6',
  },
  listItemText: {
    fontSize: 12,
    color: '#4B5563',
    flex: 1,
    fontFamily: 'Nunito',
  },
  severityBox: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    marginHorizontal: 30,
    borderWidth: 1,
  },
  severityContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  severityIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  severityTextContainer: {
    flex: 1,
  },
  severityLabel: {
    fontSize: 10,
    color: '#4B5563',
    marginBottom: 2,
    fontFamily: 'Nunito',
  },
  severityText: {
    fontWeight: 'bold',
    fontSize: 18,
    fontFamily: 'Poppins',
  },
  mild: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  mildText: {
    color: '#065F46',
  },
  moderate: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  moderateText: {
    color: '#92400E',
  },
  severe: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  severeText: {
    color: '#991B1B',
  },
  normal: {
    backgroundColor: '#EFF6FF',
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
    backgroundColor: '#3B82F6',
    backgroundImage: 'linear-gradient(120deg, #3B82F6, #6366F1)',
    padding: 20,
    fontSize: 10,
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'Nunito',
  },
  confidenceBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginVertical: 5,
    width: '100%',
  },
  confidenceFill: {
    height: 8,
    backgroundColor: '#3B82F6',
    backgroundImage: 'linear-gradient(90deg, #3B82F6, #6366F1)',
    borderRadius: 4,
  },
  disclaimer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    margin: '0 30px',
    border: '1px solid #E5E7EB',
  },
  disclaimerText: {
    fontSize: 9,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'Nunito',
  },
  patientInfoContainer: {
    backgroundColor: '#EFF6FF',
    padding: 20,
    margin: '0 30px 20px 30px',
    borderRadius: 8,
    border: '1px solid #BFDBFE',
  },
  patientInfoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Poppins',
    color: '#1E40AF',
    marginBottom: 8,
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    fontSize: 10,
    fontWeight: 'medium',
    fontFamily: 'Nunito',
    display: 'inline',
    marginLeft: 5,
  },
  badgeMale: {
    backgroundColor: '#DBEAFE',
    color: '#1E40AF',
  },
  badgeFemale: {
    backgroundColor: '#FCE7F3',
    color: '#9D174D',
  },
  badgeBloodType: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
  },
  recommendationBox: {
    backgroundColor: '#F0F9FF',
    border: '1px solid #BAE6FD',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  recommendationTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0369A1',
    marginBottom: 5,
    fontFamily: 'Poppins',
  },
  recommendationText: {
    fontSize: 11,
    color: '#0C4A6E',
    fontFamily: 'Nunito',
  },
  watermark: {
    position: 'absolute',
    bottom: 100,
    right: 40,
    fontSize: 60,
    color: 'rgba(243, 244, 246, 0.5)',
    transform: 'rotate(-45deg)',
    fontFamily: 'Poppins',
    fontWeight: 'bold',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    fontSize: 10,
    color: '#9CA3AF',
    fontFamily: 'Nunito',
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
      return 'https://img.icons8.com/fluency/96/000000/medium-priority.png';
    } else if (severityLower === 'berat' || severityLower === 'sangat berat') {
      return 'https://img.icons8.com/fluency/96/000000/high-priority.png';
    } else {
      return 'https://img.icons8.com/fluency/96/000000/ok.png';
    }
  };

  // Mendapatkan rekomendasi berdasarkan severity
  const getRecommendation = (severity) => {
    const severityLower = severity.toLowerCase();
    if (severityLower === 'tidak ada' || severityLower === 'normal') {
      return 'Lakukan pemeriksaan rutin setiap tahun.';
    } else if (severityLower === 'ringan') {
      return 'Kontrol gula darah dan tekanan darah. Pemeriksaan ulang dalam 9-12 bulan.';
    } else if (severityLower === 'sedang') {
      return 'Konsultasi dengan dokter spesialis mata. Pemeriksaan ulang dalam 6 bulan.';
    } else if (severityLower === 'berat') {
      return 'Rujukan segera ke dokter spesialis mata. Pemeriksaan ulang dalam 2-3 bulan.';
    } else if (severityLower === 'sangat berat') {
      return 'Rujukan segera ke dokter spesialis mata untuk evaluasi dan kemungkinan tindakan laser atau operasi.';
    } else {
      return 'Lakukan pemeriksaan rutin setiap tahun.';
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>RS</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.title}>Laporan Pemeriksaan Retina</Text>
              <Text style={styles.subtitle}>Tanggal: {formatDate(report.date || new Date())}</Text>
            </View>
          </View>
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
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.value}>
                  {report.patient.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
                </Text>
                <Text style={[
                  styles.badge, 
                  report.patient.gender === 'male' ? styles.badgeMale : styles.badgeFemale
                ]}>
                  {report.patient.gender === 'male' ? 'M' : 'F'}
                </Text>
              </View>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Umur:</Text>
              <Text style={styles.value}>{report.patient.age} tahun</Text>
            </View>
            {report.patient.bloodType && (
              <View style={styles.row}>
                <Text style={styles.label}>Golongan Darah:</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.value}>{report.patient.bloodType}</Text>
                  <Text style={[styles.badge, styles.badgeBloodType]}>
                    {report.patient.bloodType}
                  </Text>
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
              </Text>
              {report.confidence && (
                <Text style={{fontSize: 11, color: '#6B7280', fontFamily: 'Nunito'}}>
                  dengan tingkat kepercayaan {Math.round(report.confidence * 100)}%
                </Text>
              )}
            </View>
          </View>
          
          {report.confidence && (
            <View style={{marginTop: 10}}>
              <View style={styles.confidenceBar}>
                <View style={{...styles.confidenceFill, width: `${report.confidence * 100}%`}} />
              </View>
            </View>
          )}
          
          {/* Rekomendasi dalam severity box */}
          <View style={styles.recommendationBox}>
            <Text style={styles.recommendationTitle}>Rekomendasi:</Text>
            <Text style={styles.recommendationText}>
              {report.recommendations || getRecommendation(report.severity)}
            </Text>
          </View>
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
            <Text style={{fontSize: 10, color: '#6B7280', textAlign: 'center', marginTop: 5}}>
              Gambar fundus retina yang dianalisis
            </Text>
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

        {/* Watermark */}
        <Text style={styles.watermark}>RetinaScan</Text>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Dokumen ini dibuat secara otomatis oleh sistem RetinaScan. Hasil pemeriksaan perlu dikonfirmasi oleh dokter mata.
          </Text>
          <Text style={styles.disclaimerText}>
            © {new Date().getFullYear()} RetinaScan AI System | AI-Powered Retinopathy Detection
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

// Komponen untuk tombol download PDF dengan tampilan modern
export const RetinaScanPdfDownload = ({ report, fileName }) => {
  const [isClient, setIsClient] = useState(false);
  
  // Pastikan komponen hanya dirender di client-side
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Jika tidak di client-side, tampilkan placeholder
  if (!isClient) {
    return (
      <button 
        className="flex items-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl transition-all shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700"
        disabled
      >
        <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="font-medium">Memuat...</span>
      </button>
    );
  }
  
  return (
    <PDFDownloadLink 
      document={<RetinaScanPdf report={report} />} 
      fileName={fileName || `RetinaScan_Report_${new Date().toISOString().split('T')[0]}.pdf`}
      className="flex items-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl transition-all shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700"
      style={{ textDecoration: 'none' }}
      options={{
        ...pdfConfig
      }}
    >
      {({ blob, url, loading, error }) => 
        loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="font-medium">Menyiapkan PDF...</span>
          </>
        ) : error ? (
          <>
            <svg className="w-5 h-5 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium">Gagal membuat PDF</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-medium">Unduh Laporan PDF</span>
          </>
        )
      }
    </PDFDownloadLink>
  );
};

export default RetinaScanPdf; 