import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

export const uploadImage = async (formData) => {
  const response = await axios.post(`${API_URL}/analysis/upload`, formData, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getHistory = async () => {
  const response = await axios.get(`${API_URL}/analysis/history`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return response.data;
};

export const getLatestAnalysis = async () => {
  // Endpoint ini belum ada, gunakan mock data yang lebih lengkap
  // Dalam implementasi nyata, data ini akan diambil dari hasil analisis ML
  
  // Pilih secara acak salah satu tingkat keparahan untuk simulasi
  const severities = ['Ringan', 'Sedang', 'Berat'];
  const randomIndex = Math.floor(Math.random() * severities.length);
  const severity = severities[randomIndex];
  
  // Atur tingkat kepercayaan berdasarkan keparahan
  let confidence;
  switch (severity) {
    case 'Ringan':
      confidence = 0.75 + Math.random() * 0.2; // 0.75-0.95
      break;
    case 'Sedang':
      confidence = 0.70 + Math.random() * 0.15; // 0.70-0.85
      break;
    case 'Berat':
      confidence = 0.85 + Math.random() * 0.15; // 0.85-1.0
      break;
    default:
      confidence = 0.8;
  }
  
  // Tambahkan tanda-tanda klinis yang terdeteksi berdasarkan tingkat keparahan
  let clinicalSigns = [];
  if (severity === 'Ringan') {
    clinicalSigns = ['Mikroaneurisma', 'Pendarahan intraretinal ringan'];
  } else if (severity === 'Sedang') {
    clinicalSigns = ['Mikroaneurisma multipel', 'Pendarahan intraretinal', 'Eksudat keras', 'Cotton wool spots'];
  } else if (severity === 'Berat') {
    clinicalSigns = ['Pendarahan intraretinal luas', 'Eksudat keras multipel', 'Cotton wool spots multipel', 'Anomali vaskular'];
  }
  
  return {
    severity,
    confidence: parseFloat(confidence.toFixed(2)),
    clinicalSigns,
    analysisDate: new Date().toISOString(),
    riskFactor: severity === 'Ringan' ? 'Rendah' : severity === 'Sedang' ? 'Menengah' : 'Tinggi',
  };
};

export const getReport = async () => {
  // Endpoint ini belum ada, gunakan mock yang lebih detail
  const severity = ['Ringan', 'Sedang', 'Berat'][Math.floor(Math.random() * 3)];
  
  return {
    date: new Date().toISOString(),
    severity,
    confidence: parseFloat((0.7 + Math.random() * 0.25).toFixed(2)),
    details: getDetailsFromSeverity(severity),
    recommendations: getRecommendationsFromSeverity(severity),
    clinicalSigns: getClinicalSignsFromSeverity(severity),
    patientRisk: severity === 'Ringan' ? 'Rendah' : severity === 'Sedang' ? 'Menengah' : 'Tinggi',
    followUpTime: severity === 'Ringan' ? '12 bulan' : severity === 'Sedang' ? '6 bulan' : '1 bulan',
  };
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
    default:
      return 'Analisis tidak menunjukkan tanda-tanda retinopati diabetik yang signifikan. Retina tampak normal tanpa adanya anomali vaskular.';
  }
}

// Fungsi helper untuk menghasilkan rekomendasi berdasarkan tingkat keparahan
function getRecommendationsFromSeverity(severity) {
  switch (severity) {
    case 'Ringan':
      return 'Konsultasi dengan dokter mata dalam 6-12 bulan. Kontrol gula darah secara ketat dengan target HbA1c < 7%. Pantau tekanan darah dan kolesterol. Lakukan pemeriksaan fundus secara berkala. Perhatikan perubahan penglihatan seperti penglihatan kabur atau bintik-bintik.';
    case 'Sedang':
      return 'Konsultasi dengan dokter mata dalam 3-6 bulan. Kontrol gula darah secara ketat. Pertimbangkan pemeriksaan OCT untuk mengevaluasi ketebalan makula. Perhatikan perubahan penglihatan dan segera konsultasi jika ada perubahan. Evaluasi dan manajemen faktor risiko kardiovaskular seperti hipertensi dan dislipidemia.';
    case 'Berat':
      return 'Konsultasi dengan dokter mata spesialis retina segera (dalam 1 bulan). Kontrol gula darah secara ketat. Persiapkan kemungkinan tindakan laser panretinal photocoagulation (PRP) untuk mencegah neovaskularisasi. Evaluasi untuk kemungkinan edema makula diabetik yang memerlukan pengobatan. Manajemen agresif terhadap faktor risiko sistemik seperti tekanan darah dan profil lipid.';
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
    default:
      return ['Tidak ditemukan tanda-tanda retinopati'];
  }
}

// Fungsi untuk mendapatkan data dashboard
export const getDashboardData = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:5000/api/dashboard/stats', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};