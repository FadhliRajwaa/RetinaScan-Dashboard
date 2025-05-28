import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getToken = () => localStorage.getItem('token');

export const uploadImage = async (formData) => {
  // Ambil file gambar dari formData
  const imageFile = formData.get('image');
  
  // Tambahkan flag untuk menandai bahwa kita ingin menyimpan gambar dalam format base64
  formData.append('saveAsBase64', 'true');
  
  // Jika file gambar ada, konversi ke base64 dan tambahkan ke formData
  if (imageFile) {
    try {
      const base64Image = await fileToBase64(imageFile);
      // Tambahkan base64 image ke formData
      formData.append('imageData', base64Image);
      console.log('Image berhasil dikonversi ke base64');
    } catch (error) {
      console.error('Error converting image to base64:', error);
    }
  }
  
  const response = await axios.post(`${API_URL}/api/analysis/upload`, formData, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  
  // Pastikan respons berisi semua data yang diperlukan
  if (response.data && response.data.analysis) {
    console.log('Berhasil upload dan mendapatkan data analisis lengkap');
  }
  
  return response.data;
};

// Helper function untuk mengkonversi file ke base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

export const getHistory = async () => {
  const response = await axios.get(`${API_URL}/api/analysis/history`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  
  // Pastikan data sudah ada dan valid
  if (Array.isArray(response.data)) {
    console.log(`Berhasil mengambil ${response.data.length} data history dari server`);
    
    // Data sudah dinormalisasi oleh backend, hanya perlu memeriksa apakah ada field yang hilang
    response.data.forEach(analysis => {
      // Pastikan semua field penting tersedia, jika tidak gunakan nilai default
      if (!analysis.severity) {
        console.warn('Data history tidak memiliki field severity', analysis.id);
      }
      
      if (analysis.severityLevel === undefined || analysis.severityLevel === null) {
        console.warn('Data history tidak memiliki field severityLevel', analysis.id);
      }
      
      if (!analysis.notes && analysis.recommendation) {
        analysis.notes = analysis.recommendation;
      } else if (!analysis.recommendation && analysis.notes) {
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
    
    // Pastikan data valid
    if (response.data) {
      console.log('Berhasil mengambil data analisis terbaru', response.data);
      
      // Data sudah dinormalisasi oleh backend, hanya perlu memeriksa apakah ada field yang hilang
      if (!response.data.recommendation && response.data.notes) {
        response.data.recommendation = response.data.notes;
      } else if (!response.data.notes && response.data.recommendation) {
        response.data.notes = response.data.recommendation;
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching latest analysis:', error);
    
    console.error('Flask API tidak tersedia. Pastikan Flask API berjalan dan dapat diakses.');
    
    // Lempar error untuk ditangani di komponen
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