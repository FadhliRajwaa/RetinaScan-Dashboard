import React, { useMemo } from 'react';
import { Document, Page, Text, View, Image, StyleSheet, Font } from '@react-pdf/renderer';
import { formatDate, formatPercentage } from '../../utils/formatters';

// Register fonts - Menggunakan Roboto untuk tampilan yang lebih modern dan konsisten
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 'normal' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf', fontStyle: 'italic' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 'medium' },
  ]
});

// Create styles - Optimasi dengan pengelompokan style yang lebih baik
const styles = StyleSheet.create({
  page: {
    padding: 0,
    backgroundColor: '#ffffff',
    fontFamily: 'Roboto',
  },
  // Header styles
  header: {
    height: 80,
    backgroundColor: '#3b82f6',
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    opacity: 0.8,
  },
  headerPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  headerTitle: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    zIndex: 1,
  },
  headerDate: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
    zIndex: 1,
  },
  // Section styles
  section: {
    margin: 10,
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 15,
    border: '1px solid #f3f4f6',
    position: 'relative', // Untuk positioning elemen dekoratif
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1f2937',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: 5,
  },
  // Patient info styles
  patientInfoContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  patientInfoItem: {
    width: '50%',
    marginBottom: 8,
  },
  patientInfoLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 2,
  },
  patientInfoValue: {
    fontSize: 12,
    color: '#111827',
    fontWeight: 'bold',
  },
  // Analysis result styles
  analysisResultContainer: {
    marginTop: 10,
  },
  resultRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  resultLabel: {
    fontSize: 12,
    color: '#4b5563',
    width: '40%',
  },
  resultValue: {
    fontSize: 12,
    color: '#111827',
    fontWeight: 'bold',
    width: '60%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  severityBadge: {
    padding: '3 8',
    borderRadius: 12,
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  confidenceBarContainer: {
    width: 100,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginLeft: 10,
  },
  confidenceBar: {
    height: 8,
    borderRadius: 4,
  },
  // Image styles
  imageContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
    marginBottom: 15,
    position: 'relative',
  },
  image: {
    width: 200,
    height: 200,
    objectFit: 'contain',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    backgroundColor: '#f8fafc', // Menambahkan background untuk gambar
  },
  imageCaption: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 5,
  },
  // Text and content styles
  recommendationText: {
    fontSize: 12,
    color: '#111827',
    lineHeight: 1.5,
    marginTop: 5,
  },
  disclaimerContainer: {
    margin: 10,
    padding: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 5,
    marginTop: 20,
  },
  disclaimerText: {
    fontSize: 8,
    color: '#6b7280',
    lineHeight: 1.4,
  },
  // Footer styles
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: '#3b82f6',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  footerText: {
    fontSize: 10,
    color: '#ffffff',
    textAlign: 'center',
  },
  // Simulation badge styles
  simulationBadge: {
    position: 'absolute',
    top: 85,
    right: 20,
    padding: '5 10',
    backgroundColor: '#f59e0b',
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    borderRadius: 4,
    transform: 'rotate(15deg)',
    border: '1px solid #d97706', // Menambahkan border
  },
  // Decorative elements
  decorativeLine: {
    height: 3,
    width: 40,
    backgroundColor: '#3b82f6',
    marginBottom: 10,
    borderRadius: 2,
  },
  // Menambahkan style baru untuk elemen dekoratif
  decorativeCircle: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    top: 10,
    right: 10,
  },
  decorativePattern: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 30,
    height: 30,
    opacity: 0.1,
  }
});

// Severity color mapping - Mengoptimalkan dengan warna yang lebih konsisten
const getSeverityStyle = (severity) => {
  const severityLevel = severity.toLowerCase();
  let backgroundColor = '#3b82f6'; // Default blue
  
  if (severityLevel === 'ringan') {
    backgroundColor = '#10b981'; // Green
  } else if (severityLevel === 'sedang') {
    backgroundColor = '#f59e0b'; // Yellow
  } else if (severityLevel === 'berat' || severityLevel === 'sangat berat') {
    backgroundColor = '#ef4444'; // Red
  }
  
  return {
    ...styles.severityBadge,
    backgroundColor,
  };
};

// Confidence bar color - Mengoptimalkan dengan gradient untuk tampilan yang lebih menarik
const getConfidenceBarStyle = (confidence) => {
  // Menggunakan gradient berdasarkan tingkat kepercayaan
  let gradientColors = {
    start: '#3b82f6',
    end: '#6366f1'
  };
  
  // Warna berbeda berdasarkan tingkat kepercayaan
  if (confidence < 0.5) {
    gradientColors = {
      start: '#f59e0b',
      end: '#f97316'
    };
  } else if (confidence >= 0.8) {
    gradientColors = {
      start: '#10b981',
      end: '#059669'
    };
  }
  
  return {
    ...styles.confidenceBar,
    width: `${confidence * 100}%`,
    backgroundColor: gradientColors.start,
  };
};

// Recommendation based on severity - Mengoptimalkan dengan rekomendasi yang lebih detail
const getRecommendation = (severity) => {
  const severityLevel = severity.toLowerCase();
  
  if (severityLevel === 'tidak ada' || severityLevel === 'normal') {
    return 'Lakukan pemeriksaan rutin setiap tahun untuk memantau kesehatan retina. Jaga pola makan sehat dan kontrol gula darah secara teratur.';
  } else if (severityLevel === 'ringan') {
    return 'Kontrol gula darah dan tekanan darah secara ketat. Lakukan pemeriksaan ulang dalam 9-12 bulan. Konsultasikan dengan dokter mengenai pola makan dan gaya hidup yang mendukung kesehatan mata.';
  } else if (severityLevel === 'sedang') {
    return 'Konsultasi dengan dokter spesialis mata dalam waktu dekat. Pemeriksaan ulang dalam 6 bulan. Pertimbangkan pemeriksaan tambahan seperti OCT (Optical Coherence Tomography) untuk evaluasi lebih lanjut.';
  } else if (severityLevel === 'berat') {
    return 'Rujukan segera ke dokter spesialis mata. Pemeriksaan ulang dalam 2-3 bulan. Kemungkinan memerlukan tindakan laser atau terapi lain untuk mencegah kerusakan lebih lanjut pada retina.';
  } else if (severityLevel === 'sangat berat') {
    return 'Rujukan segera ke dokter spesialis mata untuk evaluasi komprehensif dan kemungkinan tindakan laser, injeksi anti-VEGF, atau operasi. Kondisi ini memerlukan penanganan segera untuk mencegah kehilangan penglihatan.';
  }
  
  return 'Lakukan pemeriksaan rutin setiap tahun untuk memantau kesehatan retina.';
};

// Helper function untuk membuat elemen dekoratif
const createDecorativeElements = (count, style) => {
  return Array(count).fill().map((_, i) => (
    <View 
      key={i}
      style={{
        ...style,
        top: style.top + (i * 15),
        left: style.left + (i * 15),
        opacity: 0.1 - (i * 0.02)
      }}
    />
  ));
};

// Create Document Component
const RetinaScanPdf = ({ result, patient }) => {
  const severity = result?.severity || 'Tidak ada';
  const confidence = result?.confidence || 0;
  const isSimulation = result?.isSimulation || result?.simulation_mode || 
    (result?.raw_prediction && result?.raw_prediction.is_simulation);
  
  // Menggunakan useMemo untuk mengoptimalkan performa rendering
  const decorativeElements = useMemo(() => createDecorativeElements(3, {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3b82f6',
    top: 10,
    left: 10,
  }), []);
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with gradient effect */}
        <View style={styles.header}>
          {/* Simulating gradient with multiple rectangles - Optimasi dengan lebih banyak rectangle untuk gradient yang lebih halus */}
          <View style={styles.headerGradient}>
            {Array(30).fill().map((_, i) => (
              <View 
                key={i}
                style={{
                  position: 'absolute',
                  left: `${i * 3.33}%`,
                  top: 0,
                  bottom: 0,
                  width: '3.33%',
                  backgroundColor: i < 15 ? `rgba(59, 130, 246, ${1 - i * 0.02})` : `rgba(79, 70, 229, ${0.7 + (i - 15) * 0.02})`,
                }}
              />
            ))}
          </View>
          
          {/* Header content */}
          <Text style={styles.headerTitle}>Laporan Analisis Retina</Text>
          <Text style={styles.headerDate}>Tanggal: {formatDate(new Date())}</Text>
        </View>
        
        {/* Simulation badge if applicable - Meningkatkan visibilitas badge */}
        {isSimulation && (
          <View style={{
            ...styles.simulationBadge,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <Text>SIMULASI</Text>
          </View>
        )}
        
        {/* Patient Information - Menambahkan elemen dekoratif */}
        {patient && (
          <View style={styles.section}>
            <View style={styles.decorativeLine} />
            <Text style={styles.sectionTitle}>Informasi Pasien</Text>
            
            {/* Elemen dekoratif */}
            <View style={styles.decorativeCircle} />
            
            <View style={styles.patientInfoContainer}>
              <View style={styles.patientInfoItem}>
                <Text style={styles.patientInfoLabel}>Nama</Text>
                <Text style={styles.patientInfoValue}>{patient.fullName || patient.name}</Text>
              </View>
              <View style={styles.patientInfoItem}>
                <Text style={styles.patientInfoLabel}>Jenis Kelamin</Text>
                <Text style={styles.patientInfoValue}>{patient.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</Text>
              </View>
              <View style={styles.patientInfoItem}>
                <Text style={styles.patientInfoLabel}>Umur</Text>
                <Text style={styles.patientInfoValue}>{patient.age} tahun</Text>
              </View>
              {patient.bloodType && (
                <View style={styles.patientInfoItem}>
                  <Text style={styles.patientInfoLabel}>Golongan Darah</Text>
                  <Text style={styles.patientInfoValue}>{patient.bloodType}</Text>
                </View>
              )}
              {patient.phone && (
                <View style={styles.patientInfoItem}>
                  <Text style={styles.patientInfoLabel}>Telepon</Text>
                  <Text style={styles.patientInfoValue}>{patient.phone}</Text>
                </View>
              )}
            </View>
          </View>
        )}
        
        {/* Analysis Results - Menambahkan elemen dekoratif */}
        <View style={styles.section}>
          <View style={styles.decorativeLine} />
          <Text style={styles.sectionTitle}>Hasil Analisis</Text>
          
          {/* Elemen dekoratif */}
          {decorativeElements}
          
          <View style={styles.analysisResultContainer}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Tingkat Keparahan:</Text>
              <View style={styles.resultValue}>
                <View style={getSeverityStyle(severity)}>
                  <Text>{severity}</Text>
                </View>
              </View>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Tingkat Kepercayaan:</Text>
              <View style={styles.resultValue}>
                <Text>{formatPercentage(confidence)}</Text>
                <View style={styles.confidenceBarContainer}>
                  <View style={getConfidenceBarStyle(confidence)} />
                </View>
              </View>
            </View>
          </View>
        </View>
        
        {/* Retina Image - Meningkatkan tampilan container gambar */}
        {result.image && typeof result.image === 'string' && (
          <View style={styles.section}>
            <View style={styles.decorativeLine} />
            <Text style={styles.sectionTitle}>Gambar Retina</Text>
            <View style={styles.imageContainer}>
              <Image src={result.image} style={styles.image} />
              <Text style={styles.imageCaption}>Gambar Retina yang Dianalisis</Text>
            </View>
          </View>
        )}
        
        {/* Recommendation - Menambahkan elemen dekoratif */}
        <View style={styles.section}>
          <View style={styles.decorativeLine} />
          <Text style={styles.sectionTitle}>Rekomendasi</Text>
          
          {/* Elemen dekoratif */}
          <View style={{
            position: 'absolute',
            right: 15,
            top: 15,
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
          }} />
          
          <Text style={styles.recommendationText}>
            {getRecommendation(severity)}
          </Text>
        </View>
        
        {/* Disclaimer - Meningkatkan tampilan disclaimer */}
        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerText}>
            <Text style={{ fontWeight: 'bold' }}>Disclaimer:</Text> Hasil analisis ini merupakan bantuan diagnostik berbasis AI dan tidak menggantikan diagnosis dari dokter.
            Selalu konsultasikan dengan tenaga medis profesional untuk diagnosis dan penanganan yang tepat.
            {isSimulation && ' Laporan ini dibuat dalam MODE SIMULASI dan tidak boleh digunakan untuk tujuan klinis.'}
          </Text>
        </View>
        
        {/* Footer - Meningkatkan tampilan footer */}
        <View style={styles.footer}>
          {/* Simulating gradient with multiple rectangles - Optimasi dengan lebih banyak rectangle untuk gradient yang lebih halus */}
          {Array(30).fill().map((_, i) => (
            <View 
              key={i}
              style={{
                position: 'absolute',
                left: `${i * 3.33}%`,
                top: 0,
                bottom: 0,
                width: '3.33%',
                backgroundColor: i < 15 ? `rgba(59, 130, 246, ${1 - i * 0.02})` : `rgba(79, 70, 229, ${0.7 + (i - 15) * 0.02})`,
              }}
            />
          ))}
          <Text style={styles.footerText}>RetinaScan © {new Date().getFullYear()} | AI-Powered Retinopathy Detection</Text>
        </View>
      </Page>
    </Document>
  );
};

export default RetinaScanPdf; 