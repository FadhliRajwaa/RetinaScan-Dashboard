import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getToken = () => localStorage.getItem('token');

export const uploadImage = async (formData) => {
  const response = await axios.post(`${API_URL}/api/analysis/upload`, formData, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getHistory = async () => {
  const response = await axios.get(`${API_URL}/api/analysis/history`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  
  // Normalisasi data untuk konsistensi
  if (Array.isArray(response.data)) {
    response.data.forEach(analysis => {
      // Pastikan severity konsisten
      if (!analysis.severity && analysis.frontendSeverity) {
        analysis.severity = analysis.frontendSeverity;
      } else if (!analysis.severity && analysis.class) {
        const severityMapping = {
          'No DR': 'Tidak ada',
          'Mild': 'Ringan',
          'Moderate': 'Sedang',
          'Severe': 'Berat',
          'Proliferative DR': 'Sangat Berat'
        };
        analysis.severity = severityMapping[analysis.class] || analysis.class;
      }
      
      // Pastikan severityLevel konsisten
      if (!analysis.severityLevel && analysis.frontendSeverityLevel !== undefined) {
        analysis.severityLevel = analysis.frontendSeverityLevel;
      } else if (!analysis.severityLevel && analysis.severity_level !== undefined) {
        analysis.severityLevel = analysis.severity_level;
      } else if (analysis.severity) {
        const severityLevelMapping = {
          'Tidak ada': 0,
          'Ringan': 1,
          'Sedang': 2,
          'Berat': 3,
          'Sangat Berat': 4
        };
        analysis.severityLevel = severityLevelMapping[analysis.severity] || 0;
      }
      
      // Pastikan notes/recommendation konsisten
      if (!analysis.notes && analysis.recommendation) {
        analysis.notes = analysis.recommendation;
      } else if (!analysis.recommendation && analysis.notes) {
        analysis.recommendation = analysis.notes;
      } else if (!analysis.notes && !analysis.recommendation && analysis.severity) {
        const recommendationMapping = {
          'Tidak ada': 'Lakukan pemeriksaan rutin setiap tahun.',
          'Ringan': 'Kontrol gula darah dan tekanan darah. Pemeriksaan ulang dalam 9-12 bulan.',
          'Sedang': 'Konsultasi dengan dokter spesialis mata. Pemeriksaan ulang dalam 6 bulan.',
          'Berat': 'Rujukan segera ke dokter spesialis mata. Pemeriksaan ulang dalam 2-3 bulan.',
          'Sangat Berat': 'Rujukan segera ke dokter spesialis mata untuk evaluasi dan kemungkinan tindakan laser atau operasi.'
        };
        analysis.notes = recommendationMapping[analysis.severity] || 'Konsultasikan dengan dokter mata.';
        analysis.recommendation = analysis.notes;
      }
    });
  }
  
  return response.data;
};

export const getLatestAnalysis = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/analysis/latest`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    // Pastikan data memiliki format yang diharapkan
    if (response.data) {
      // Pastikan severity ada, jika tidak gunakan fallback
      if (!response.data.severity && response.data.frontendSeverity) {
        response.data.severity = response.data.frontendSeverity;
      } else if (!response.data.severity && response.data.class) {
        // Handle format dari Flask API
        const severityMapping = {
          'No DR': 'Tidak ada',
          'Mild': 'Ringan',
          'Moderate': 'Sedang',
          'Severe': 'Berat',
          'Proliferative DR': 'Sangat Berat'
        };
        response.data.severity = severityMapping[response.data.class] || response.data.class;
      }
      
      // Pastikan severityLevel ada, jika tidak gunakan fallback
      if (!response.data.severityLevel && response.data.frontendSeverityLevel !== undefined) {
        response.data.severityLevel = response.data.frontendSeverityLevel;
      } else if (!response.data.severityLevel && response.data.severity_level !== undefined) {
        response.data.severityLevel = response.data.severity_level;
      } else if (response.data.severity) {
        // Tentukan severityLevel berdasarkan severity jika tidak ada
        const severityLevelMapping = {
          'Tidak ada': 0,
          'Ringan': 1,
          'Sedang': 2,
          'Berat': 3,
          'Sangat Berat': 4
        };
        response.data.severityLevel = severityLevelMapping[response.data.severity] || 0;
      }
      
      // Pastikan recommendation ada
      if (!response.data.recommendation && response.data.notes) {
        response.data.recommendation = response.data.notes;
      }
      
      // Tambahkan rekomendasi jika tidak ada
      if (!response.data.recommendation && !response.data.notes) {
        // Menggunakan rekomendasi yang sama persis dengan yang didefinisikan di flask_service/app.py
        const recommendationMapping = {
          'Tidak ada': 'Lakukan pemeriksaan rutin setiap tahun.',
          'Ringan': 'Kontrol gula darah dan tekanan darah. Pemeriksaan ulang dalam 9-12 bulan.',
          'Sedang': 'Konsultasi dengan dokter spesialis mata. Pemeriksaan ulang dalam 6 bulan.',
          'Berat': 'Rujukan segera ke dokter spesialis mata. Pemeriksaan ulang dalam 2-3 bulan.',
          'Sangat Berat': 'Rujukan segera ke dokter spesialis mata untuk evaluasi dan kemungkinan tindakan laser atau operasi.'
        };
        response.data.recommendation = recommendationMapping[response.data.severity] || 'Konsultasikan dengan dokter mata.';
        // Simpan juga ke notes untuk konsistensi
        response.data.notes = response.data.recommendation;
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching latest analysis:', error);
    
    // Tidak lagi menyediakan data simulasi sebagai fallback
    console.error('Flask API tidak tersedia. Pastikan Flask API berjalan dan dapat diakses.');
    
    // Lempar error untuk ditangani di komponen, bukan menggunakan data simulasi
    throw new Error('Flask API tidak tersedia. Pastikan Flask API berjalan dengan benar dan model ML dimuat. Jalankan "npm run test:flask" di terminal untuk menguji koneksi.');
  }
};

export const getReport = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/analysis/report`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching report:', error);
    throw new Error('Gagal mendapatkan laporan. Pastikan Flask API berjalan dengan benar.');
  }
};

export const deleteAnalysis = async (analysisId) => {
  try {
    const response = await axios.delete(`${API_URL}/api/analysis/${analysisId}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting analysis:', error);
    throw error;
  }
};

// Fungsi helper untuk menghasilkan detail berdasarkan tingkat keparahan
function getDetailsFromSeverity(severity) {
  switch (severity) {
    case 'Ringan':
      return 'Analisis menunjukkan tanda-tanda awal retinopati diabetik non-proliferatif ringan. Terdapat beberapa mikroaneurisma yang menunjukkan kebocoran kapiler retina di beberapa area. Perubahan ini adalah gejala awal dari kerusakan pembuluh darah yang disebabkan oleh tingkat gula darah yang tinggi. Pada tahap ini, perubahan biasanya belum memengaruhi penglihatan secara signifikan.';
    case 'Sedang':
      return 'Analisis menunjukkan tanda-tanda retinopati diabetik non-proliferatif sedang. Terdapat perdarahan intraretinal dan eksudat keras yang menunjukkan penurunan fungsi barrier darah-retina. Cotton wool spots juga terdeteksi, yang menandakan adanya iskemia retina. Perubahan ini dapat mulai memengaruhi ketajaman penglihatan dan memerlukan perhatian medis.';
    case 'Berat':
      return 'Analisis menunjukkan tanda-tanda retinopati diabetik non-proliferatif berat. Terdapat banyak perdarahan retina, eksudat keras, dan cotton wool spots yang menandakan iskemia retina yang signifikan. Anomali vaskular seperti kaliber vena yang tidak teratur dan abnormalitas mikrovaskuler intraretinal (IRMA) juga terdeteksi. Kondisi ini berisiko tinggi berkembang menjadi retinopati proliferatif dan membutuhkan penanganan segera.';
    case 'Sangat Berat':
    case 'Proliferative DR':
      return 'Analisis menunjukkan tanda-tanda retinopati diabetik proliferatif. Terdapat pembentukan pembuluh darah baru (neovaskularisasi) yang abnormal pada retina dan/atau diskus optikus. Kondisi ini dapat menyebabkan perdarahan vitreus, ablasio retina traksi, dan glaukoma neovaskular yang dapat mengakibatkan kebutaan permanen jika tidak ditangani segera. Tindakan laser atau pembedahan mungkin diperlukan untuk mencegah kehilangan penglihatan yang lebih lanjut.';
    case 'Tidak ada':
    case 'Normal':
    case 'No DR':
      return 'Analisis tidak menunjukkan tanda-tanda retinopati diabetik yang signifikan. Retina tampak normal tanpa adanya anomali vaskular.';
    default:
      return 'Analisis tidak menunjukkan tanda-tanda retinopati diabetik yang signifikan. Retina tampak normal tanpa adanya anomali vaskular.';
  }
}

// Fungsi helper untuk menghasilkan rekomendasi berdasarkan tingkat keparahan
// Menggunakan rekomendasi yang sama persis dengan yang didefinisikan di flask_service/app.py
function getRecommendationsFromSeverity(severity) {
  switch (severity) {
    case 'Ringan':
      return 'Kontrol gula darah dan tekanan darah. Pemeriksaan ulang dalam 9-12 bulan.';
    case 'Sedang':
      return 'Konsultasi dengan dokter spesialis mata. Pemeriksaan ulang dalam 6 bulan.';
    case 'Berat':
      return 'Rujukan segera ke dokter spesialis mata. Pemeriksaan ulang dalam 2-3 bulan.';
    case 'Sangat Berat':
      return 'Rujukan segera ke dokter spesialis mata untuk evaluasi dan kemungkinan tindakan laser atau operasi.';
    case 'Tidak ada':
    case 'Normal':
      return 'Lakukan pemeriksaan rutin setiap tahun.';
    default:
      return 'Lakukan pemeriksaan rutin dengan dokter mata setiap tahun. Jaga gula darah tetap terkontrol. Lakukan gaya hidup sehat dengan diet seimbang dan olahraga teratur. Hindari merokok dan batasi konsumsi alkohol.';
  }
}

// Fungsi helper untuk menghasilkan tanda klinis berdasarkan tingkat keparahan
function getClinicalSignsFromSeverity(severity) {
  switch (severity) {
    case 'Ringan':
      return [
        'Mikroaneurisma (1-5)',
        'Perdarahan intraretinal minimal',
        'Tidak ada eksudat keras',
        'Tidak ada cotton wool spots'
      ];
    case 'Sedang':
      return [
        'Mikroaneurisma multipel (>5)',
        'Perdarahan intraretinal di satu hingga tiga kuadran',
        'Eksudat keras',
        'Cotton wool spots (1-3)',
        'Dilatasi vena ringan'
      ];
    case 'Berat':
      return [
        'Perdarahan intraretinal pada empat kuadran',
        'Eksudat keras multipel',
        'Cotton wool spots multipel (>3)',
        'Abnormalitas mikrovaskuler intraretinal (IRMA)',
        'Vena kalikut',
        'Iskemia retina yang luas'
      ];
    case 'Sangat Berat':
    case 'Proliferative DR':
      return [
        'Neovaskularisasi pada diskus optikus (NVD)',
        'Neovaskularisasi di tempat lain (NVE)',
        'Perdarahan preretinal atau vitreus',
        'Fibrosis epiretinal',
        'Traksi retina',
        'Risiko ablasio retina',
        'Glaukoma neovaskular'
      ];
    case 'Tidak ada':
    case 'Normal':
    case 'No DR':
      return ['Tidak ditemukan tanda-tanda retinopati'];
    default:
      return ['Tidak ditemukan tanda-tanda retinopati'];
  }
}

// Fungsi untuk mendapatkan data dashboard
export const getDashboardData = async () => {
  try {
    const token = localStorage.getItem('token');
    console.log('Attempting to fetch dashboard data from API...');
    
    // Menggunakan endpoint yang benar: /api/analysis/dashboard/stats
    const response = await axios.get(`${API_URL}/api/analysis/dashboard/stats`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Dashboard data API response:', response.status);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    if (error.response) {
      console.error('Error response:', error.response.status, error.response.data);
    }
    throw error;
  }
};

// Fungsi untuk mendapatkan info Flask API
export const getFlaskApiInfo = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/analysis/flask-info`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching Flask API info:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Fungsi untuk menguji koneksi Flask API
export const testFlaskConnection = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/analysis/test-flask-connection`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error testing Flask connection:', error);
    return {
      success: false,
      error: error.message
    };
  }
};