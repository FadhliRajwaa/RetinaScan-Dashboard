import React, { useEffect, useState } from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font, PDFDownloadLink } from '@react-pdf/renderer';
import { getPdfFontConfig, getOptimizedPdfConfig } from '../../utils/compatibilityUtils';
import { saveAs } from 'file-saver';

// Mendapatkan konfigurasi font dengan fallback
const fontConfig = getPdfFontConfig();
const pdfConfig = getOptimizedPdfConfig();

// Mendaftarkan font modern (Google Fonts)
Font.register({
  family: 'Poppins',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrFJA.ttf', fontWeight: 'normal' },
    { src: 'https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLCz7V1s.ttf', fontWeight: 'bold' },
    { src: 'https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLEj6V1s.ttf', fontWeight: 'medium' },
    { src: 'https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLDz8V1s.ttf', fontWeight: 'light' },
  ],
});

Font.register({
  family: 'Nunito',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/nunito/v25/XRXV3I6Li01BKofINeaE.ttf', fontWeight: 'normal' },
    { src: 'https://fonts.gstatic.com/s/nunito/v25/XRXW3I6Li01BKofAjsOUYevN.ttf', fontWeight: 'bold' },
  ],
});

// Fallback fonts
const fontFallbacks = {
  main: 'Poppins',
  secondary: 'Nunito',
  fallback: 'Helvetica',
};

// Membuat stylesheet untuk PDF dengan desain modern
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#FFFFFF',
    fontFamily: fontFallbacks.main,
    position: 'relative',
  },
  header: {
    backgroundColor: '#4F46E5',
    padding: 20,
    marginBottom: 20,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: '#4F46E5',
    zIndex: -1,
  },
  headerContent: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: `${fontFallbacks.main}`,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    fontFamily: `${fontFallbacks.secondary}`,
  },
  logo: {
    width: 50,
    height: 50,
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    borderLeft: '4px solid #4F46E5',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1F2937',
    fontFamily: `${fontFallbacks.main}`,
  },
  patientInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
  },
  patientInfoItem: {
    width: '50%',
    marginBottom: 10,
  },
  label: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 3,
    fontFamily: `${fontFallbacks.secondary}`,
  },
  value: {
    fontSize: 12,
    color: '#111827',
    fontFamily: `${fontFallbacks.main}`,
  },
  badge: {
    fontSize: 10,
    color: '#FFFFFF',
    backgroundColor: '#4F46E5',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginLeft: 5,
    display: 'inline',
  },
  genderBadgeMale: {
    backgroundColor: '#3B82F6',
  },
  genderBadgeFemale: {
    backgroundColor: '#EC4899',
  },
  bloodTypeBadge: {
    backgroundColor: '#EF4444',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 250,
    height: 250,
    objectFit: 'contain',
    borderRadius: 6,
    marginBottom: 5,
  },
  imageCaption: {
    fontSize: 10,
    color: '#6B7280',
    fontFamily: `${fontFallbacks.secondary}`,
    textAlign: 'center',
  },
  resultSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
  },
  severityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    borderRadius: 6,
  },
  severityNormal: {
    backgroundColor: '#DBEAFE',
    borderLeft: '4px solid #1E40AF',
  },
  severityMild: {
    backgroundColor: '#D1FAE5',
    borderLeft: '4px solid #065F46',
  },
  severityModerate: {
    backgroundColor: '#FEF3C7',
    borderLeft: '4px solid #92400E',
  },
  severitySevere: {
    backgroundColor: '#FEE2E2',
    borderLeft: '4px solid #991B1B',
  },
  severityText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: `${fontFallbacks.main}`,
  },
  severityTextNormal: {
    color: '#1E40AF',
  },
  severityTextMild: {
    color: '#065F46',
  },
  severityTextModerate: {
    color: '#92400E',
  },
  severityTextSevere: {
    color: '#991B1B',
  },
  confidenceBar: {
    height: 8,
    width: '100%',
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginTop: 5,
    marginBottom: 15,
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4,
  },
  confidenceLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 3,
    fontFamily: `${fontFallbacks.secondary}`,
  },
  confidenceValue: {
    fontSize: 12,
    color: '#111827',
    fontWeight: 'bold',
    fontFamily: `${fontFallbacks.main}`,
    textAlign: 'right',
  },
  recommendation: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    borderLeft: '4px solid #8B5CF6',
  },
  followUp: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  followUpTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 5,
    fontFamily: `${fontFallbacks.main}`,
  },
  followUpText: {
    fontSize: 10,
    color: '#4B5563',
    fontFamily: `${fontFallbacks.secondary}`,
  },
  disclaimer: {
    fontSize: 9,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 20,
    padding: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    fontFamily: `${fontFallbacks.secondary}`,
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
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
    fontFamily: `${fontFallbacks.secondary}`,
  },
  watermark: {
    position: 'absolute',
    bottom: 120,
    right: 40,
    fontSize: 60,
    color: '#F3F4F6',
    transform: 'rotate(-45deg)',
    opacity: 0.3,
    fontFamily: `${fontFallbacks.main}`,
    fontWeight: 'bold',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    fontSize: 10,
    color: '#9CA3AF',
    fontFamily: `${fontFallbacks.secondary}`,
  },
});

// Komponen untuk laporan PDF
const RetinaScanPdf = ({ report }) => {
  const { severity, confidence, patient } = report || {};
  
  // Get image source
  const getImageSource = () => {
    if (!report) return '';
    
    if (report.imageData && report.imageData.startsWith('data:')) {
      return report.imageData;
    }
    
    if (report.preview && typeof report.preview === 'string') {
      return report.preview;
    }
    
    if (report.image && typeof report.image === 'string') {
      if (report.image.startsWith('data:')) {
        return report.image;
      }
      
      if (report.image.startsWith('/')) {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        return `${API_URL}${report.image}`;
      }
      
      return report.image;
    }
    
    if (report.imageUrl) {
      if (report.imageUrl.startsWith('/')) {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        return `${API_URL}${report.imageUrl}`;
      }
      return report.imageUrl;
    }
    
    return '';
  };
  
  const severityStyles = getSeverityStyles(severity);
  const confidenceValue = parseFloat(confidence);
  const confidencePercentage = isNaN(confidenceValue) ? 0 : 
    confidenceValue > 1 ? confidenceValue / 100 : confidenceValue;
  
  // Helper untuk mendapatkan warna berdasarkan severity
  const getSeverityStyles = (severity) => {
    const level = severity?.toLowerCase();
    
    if (level === 'ringan' || level === 'mild') {
      return {
        container: styles.severityMild,
        text: styles.severityTextMild,
        color: '#10B981',
      };
    } else if (level === 'sedang' || level === 'moderate') {
      return {
        container: styles.severityModerate,
        text: styles.severityTextModerate,
        color: '#F59E0B',
      };
    } else if (level === 'berat' || level === 'severe' || level === 'sangat berat' || level === 'proliferative') {
      return {
        container: styles.severitySevere,
        text: styles.severityTextSevere,
        color: '#EF4444',
      };
    }
    
    return {
      container: styles.severityNormal,
      text: styles.severityTextNormal,
      color: '#3B82F6',
    };
  };

  // Format tanggal
  const formatDate = (date) => {
    try {
      if (!date) return new Date().toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      
      return new Date(date).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return 'Tanggal tidak valid';
    }
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

  // Format percentage
  const formatPercentage = (value) => {
    if (value === undefined || value === null) return '0%';
    
    try {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return '0%';
      
      // If value is already in percentage (e.g., 78 not 0.78)
      if (numValue > 1) {
        return numValue.toFixed(1) + '%';
      }
      return (numValue * 100).toFixed(1) + '%';
    } catch (error) {
      return '0%';
    }
  };

  // Get recommendation based on severity
  const getRecommendation = (severity) => {
    const level = severity?.toLowerCase();
    
    if (level === 'tidak ada' || level === 'normal') {
      return 'Tidak ditemukan tanda-tanda retinopati diabetik. Lakukan pemeriksaan rutin setiap tahun.';
    } else if (level === 'ringan' || level === 'mild') {
      return 'Terdapat tanda-tanda ringan retinopati diabetik. Kontrol gula darah dan tekanan darah. Pemeriksaan ulang dalam 9-12 bulan.';
    } else if (level === 'sedang' || level === 'moderate') {
      return 'Terdapat tanda-tanda sedang retinopati diabetik. Konsultasi dengan dokter spesialis mata. Pemeriksaan ulang dalam 6 bulan.';
    } else if (level === 'berat' || level === 'severe') {
      return 'Terdapat tanda-tanda berat retinopati diabetik. Rujukan segera ke dokter spesialis mata. Pemeriksaan ulang dalam 2-3 bulan.';
    } else if (level === 'sangat berat' || level === 'proliferative') {
      return 'Terdapat tanda-tanda sangat berat retinopati diabetik. Rujukan segera ke dokter spesialis mata untuk evaluasi dan kemungkinan tindakan laser atau operasi.';
    }
    
    return 'Tidak ada rekomendasi spesifik. Konsultasikan dengan dokter untuk evaluasi lebih lanjut.';
  };

  // Get follow-up period based on severity
  const getFollowUpPeriod = (severity) => {
    const level = severity?.toLowerCase();
    
    if (level === 'tidak ada' || level === 'normal') {
      return 'Pemeriksaan rutin setiap 12 bulan';
    } else if (level === 'ringan' || level === 'mild') {
      return 'Pemeriksaan ulang dalam 9-12 bulan';
    } else if (level === 'sedang' || level === 'moderate') {
      return 'Pemeriksaan ulang dalam 6 bulan';
    } else if (level === 'berat' || level === 'severe') {
      return 'Pemeriksaan ulang dalam 2-3 bulan';
    } else if (level === 'sangat berat' || level === 'proliferative') {
      return 'Konsultasi segera dengan dokter spesialis mata';
    }
    
    return 'Konsultasi dengan dokter untuk jadwal pemeriksaan';
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Gradient */}
        <View style={styles.headerGradient} />
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Laporan Analisis Retina</Text>
            <Text style={styles.subtitle}>Tanggal: {formatDate(report?.createdAt || new Date())}</Text>
          </View>
          {/* Logo could be added here */}
        </View>
        
        {/* Patient Information */}
        {patient && (
          <View style={styles.patientInfo}>
            <View style={styles.patientInfoItem}>
              <Text style={styles.label}>Nama Pasien</Text>
              <Text style={styles.value}>{patient.fullName || patient.name || 'Tidak ada nama'}</Text>
            </View>
            
            <View style={styles.patientInfoItem}>
              <Text style={styles.label}>Jenis Kelamin</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.value}>
                  {patient.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
                </Text>
                <Text style={[
                  styles.badge, 
                  patient.gender === 'male' ? styles.genderBadgeMale : styles.genderBadgeFemale
                ]}>
                  {patient.gender === 'male' ? 'M' : 'F'}
                </Text>
              </View>
            </View>
            
            <View style={styles.patientInfoItem}>
              <Text style={styles.label}>Umur</Text>
              <Text style={styles.value}>{patient.age} tahun</Text>
            </View>
            
            {patient.bloodType && (
              <View style={styles.patientInfoItem}>
                <Text style={styles.label}>Golongan Darah</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.value}>{patient.bloodType}</Text>
                  <Text style={[styles.badge, styles.bloodTypeBadge]}>{patient.bloodType}</Text>
                </View>
              </View>
            )}
          </View>
        )}
        
        {/* Retina Image */}
        <View style={styles.imageContainer}>
          <Image 
            src={getImageSource()} 
            style={styles.image}
          />
          <Text style={styles.imageCaption}>Gambar Retina yang Dianalisis</Text>
        </View>
        
        {/* Analysis Results */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hasil Analisis</Text>
          
          {/* Severity */}
          <View style={[styles.severityContainer, severityStyles.container]}>
            <View>
              <Text style={styles.label}>Tingkat Keparahan</Text>
              <Text style={[styles.severityText, severityStyles.text]}>{severity || 'Tidak diketahui'}</Text>
            </View>
          </View>
          
          {/* Confidence */}
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.confidenceLabel}>Tingkat Kepercayaan</Text>
              <Text style={styles.confidenceValue}>{formatPercentage(confidence)}</Text>
            </View>
            <View style={styles.confidenceBar}>
              <View 
                style={[
                  styles.confidenceFill, 
                  { 
                    width: `${confidencePercentage * 100}%`,
                    backgroundColor: severityStyles.color
                  }
                ]} 
              />
            </View>
          </View>
        </View>
        
        {/* Recommendation */}
        <View style={styles.recommendation}>
          <Text style={styles.sectionTitle}>Rekomendasi</Text>
          <Text style={styles.value}>{getRecommendation(severity)}</Text>
          
          <View style={styles.followUp}>
            <Text style={styles.followUpTitle}>Tindak Lanjut</Text>
            <Text style={styles.followUpText}>{getFollowUpPeriod(severity)}</Text>
          </View>
        </View>
        
        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text>
            Disclaimer: Hasil analisis ini merupakan bantuan diagnostik berbasis AI dan tidak menggantikan diagnosis dari dokter. 
            Selalu konsultasikan dengan tenaga medis profesional untuk diagnosis dan penanganan yang tepat.
          </Text>
        </View>
        
        {/* Watermark */}
        <Text style={styles.watermark}>RetinaScan</Text>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text>RetinaScan © {new Date().getFullYear()} | AI-Powered Retinopathy Detection</Text>
        </View>
        
        {/* Page Number */}
        <Text style={styles.pageNumber}>1</Text>
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

// Function to create and download PDF
export const downloadRetinaScanPdf = async (report) => {
  const blob = await pdf(<RetinaScanPdf report={report} />).toBlob();
  saveAs(blob, `retina-analysis-${new Date().getTime()}.pdf`);
};

export default RetinaScanPdf; 