import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getToken = () => localStorage.getItem('token');

export const uploadImage = async (formData) => {
  // Ambil file gambar dari formData
  const imageFile = formData.get('image');
  
  // Tambahkan flag untuk menandai bahwa kita ingin menyimpan gambar dalam format base64
  formData.append('saveAsBase64', 'true');
  
  // Jika file gambar ada dan belum ada imageData, konversi ke base64 dan tambahkan ke formData
  if (imageFile && !formData.get('imageData')) {
    try {
      const base64Image = await fileToBase64(imageFile);
      // Tambahkan base64 image ke formData
      formData.append('imageData', base64Image);
      console.log('Image berhasill dikonversi ke base64');
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
    
    // Tambahkan data yang mungkin hilang
    if (!response.data.analysis._id && response.data.analysis.id) {
      response.data.analysis._id = response.data.analysis.id;
    }
    
    if (!response.data.analysis.id && response.data.analysis._id) {
      response.data.analysis.id = response.data.analysis._id;
    }
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
    
    // Normalisasi data untuk memastikan semua field tersedia
    const normalizedData = response.data.map(analysis => {
      // Pastikan ada id yang konsisten
      if (!analysis._id && analysis.id) {
        analysis._id = analysis.id;
      }
      
      if (!analysis.id && analysis._id) {
        analysis.id = analysis._id;
      }
      
      // Pastikan semua field penting tersedia, jika tidak gunakan nilai default
      if (!analysis.severity) {
        console.warn('Data history tidak memiliki field severity', analysis.id);
        analysis.severity = 'Tidak diketahui';
      }
      
      if (analysis.severityLevel === undefined || analysis.severityLevel === null) {
        console.warn('Data history tidak memiliki field severityLevel', analysis.id);
        
        // Tentukan severityLevel berdasarkan severity
        const severityLevelMapping = {
          'Tidak ada': 0,
          'No DR': 0,
          'Ringan': 1, 
          'Mild': 1,
          'Sedang': 2,
          'Moderate': 2,
          'Berat': 3,
          'Severe': 3,
          'Sangat Berat': 4,
          'Proliferative DR': 4
        };
        
        analysis.severityLevel = severityLevelMapping[analysis.severity] || 0;
      }
      
      // Pastikan confidence ada dan dalam format yang benar
      if (analysis.confidence === undefined || analysis.confidence === null) {
        analysis.confidence = 0;
      } else if (analysis.confidence > 1) {
        // Jika confidence > 1, mungkin sudah dalam persentase (e.g., 78 bukan 0.78)
        analysis.confidence = analysis.confidence / 100;
      }
      
      // Pastikan recommendation/notes konsisten
      if (!analysis.notes && analysis.recommendation) {
        analysis.notes = analysis.recommendation;
      } else if (!analysis.recommendation && analysis.notes) {
        analysis.recommendation = analysis.notes;
      }
      
      // Pastikan originalFilename ada
      if (!analysis.originalFilename && analysis.imageDetails && analysis.imageDetails.originalname) {
        analysis.originalFilename = analysis.imageDetails.originalname;
      }
      
      // Pastikan createdAt ada
      if (!analysis.createdAt) {
        analysis.createdAt = analysis.timestamp || new Date().toISOString();
      }
      
      return analysis;
    });
    
    return normalizedData;
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
      
      // Normalisasi data
      const analysis = response.data;
      
      // Pastikan ada id yang konsisten
      if (!analysis._id && analysis.id) {
        analysis._id = analysis.id;
      }
      
      if (!analysis.id && analysis._id) {
        analysis.id = analysis._id;
      }
      
      // Pastikan ada id yang konsisten untuk analysisId
      if (!analysis._id && analysis.analysisId) {
        analysis._id = analysis.analysisId;
        analysis.id = analysis.analysisId;
      }
      
      // Pastikan recommendation/notes konsisten
      if (!analysis.recommendation && analysis.notes) {
        analysis.recommendation = analysis.notes;
      } else if (!analysis.notes && analysis.recommendation) {
        analysis.notes = analysis.recommendation;
      }
      
      // Pastikan confidence ada dan dalam format yang benar
      if (analysis.confidence === undefined || analysis.confidence === null) {
        analysis.confidence = 0;
      } else if (analysis.confidence > 1) {
        // Jika confidence > 1, mungkin sudah dalam persentase (e.g., 78 bukan 0.78)
        analysis.confidence = analysis.confidence / 100;
      }
      
      // Pastikan imageData ada jika ada imageUrl
      if (!analysis.imageData && analysis.imageUrl) {
        if (analysis.imageUrl.startsWith('data:')) {
          analysis.imageData = analysis.imageUrl;
        }
      }
      
      return analysis;
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
    // Pastikan analysisId valid
    if (!analysisId) {
      throw new Error('ID analisis tidak valid');
    }
    
    // Coba gunakan endpoint utama
    try {
      const response = await axios.delete(`${API_URL}/api/analysis/${analysisId}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      console.log('Analisis berhasil dihapus:', response.data);
      return response.data;
    } catch (mainError) {
      console.error('Error dengan endpoint utama:', mainError);
      
      // Jika endpoint utama gagal, coba endpoint alternatif
      if (mainError.response && mainError.response.status === 404) {
        console.log('Mencoba endpoint alternatif...');
        
        // Coba dengan format ID yang berbeda jika ID mengandung karakter tertentu
        let formattedId = analysisId;
        
        // Coba dengan endpoint alternatif
        const alternativeResponse = await axios.delete(`https://retinascan-backend-eszo.onrender.com/api/analysis/${formattedId}`, {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        });
        
        console.log('Analisis berhasil dihapus dengan endpoint alternatif:', alternativeResponse.data);
        return alternativeResponse.data;
      }
      
      // Jika bukan error 404 atau endpoint alternatif juga gagal, lempar error
      throw mainError;
    }
  } catch (error) {
    console.error('Error deleting analysis:', error);
    
    // Log informasi error yang lebih detail
    if (error.response) {
      console.error('Server error response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    
    throw error;
  }
};

// Fungsi helper untuk detail berdasarkan severity
function _getDetailsFromSeverity(severity) {
  const details = {
    'Tidak ada': 'Tidak ada tanda-tanda retinopati diabetik.',
    'No DR': 'Tidak ada tanda-tanda retinopati diabetik.',
    'Ringan': 'Terdapat microaneurysm dan perdarahan kecil pada retina.',
    'Mild': 'Terdapat microaneurysm dan perdarahan kecil pada retina.',
    'Sedang': 'Perdarahan lebih banyak, cotton wool spots, dan pembengkakan retina.',
    'Moderate': 'Perdarahan lebih banyak, cotton wool spots, dan pembengkakan retina.',
    'Berat': 'Perdarahan luas, pembuluh darah abnormal, dan iskemia retina.',
    'Severe': 'Perdarahan luas, pembuluh darah abnormal, dan iskemia retina.',
    'Sangat Berat': 'Pembentukan pembuluh darah baru yang abnormal dan jaringan parut.',
    'Proliferative DR': 'Pembentukan pembuluh darah baru yang abnormal dan jaringan parut.'
  };
  
  return details[severity] || 'Detail tidak tersedia untuk tingkat keparahan ini.';
}

// Fungsi helper untuk rekomendasi berdasarkan severity
function _getRecommendationsFromSeverity(severity) {
  const recommendations = {
    'Tidak ada': 'Lakukan pemeriksaan rutin setiap tahun.',
    'No DR': 'Lakukan pemeriksaan rutin setiap tahun.',
    'Ringan': 'Kontrol gula darah dan tekanan darah. Pemeriksaan ulang dalam 9-12 bulan.',
    'Mild': 'Kontrol gula darah dan tekanan darah. Pemeriksaan ulang dalam 9-12 bulan.',
    'Sedang': 'Konsultasi dengan dokter spesialis mata. Pemeriksaan ulang dalam 6 bulan.',
    'Moderate': 'Konsultasi dengan dokter spesialis mata. Pemeriksaan ulang dalam 6 bulan.',
    'Berat': 'Rujukan segera ke dokter spesialis mata. Pemeriksaan ulang dalam 2-3 bulan.',
    'Severe': 'Rujukan segera ke dokter spesialis mata. Pemeriksaan ulang dalam 2-3 bulan.',
    'Sangat Berat': 'Rujukan segera ke dokter spesialis mata untuk evaluasi dan kemungkinan tindakan laser atau operasi.',
    'Proliferative DR': 'Rujukan segera ke dokter spesialis mata untuk evaluasi dan kemungkinan tindakan laser atau operasi.'
  };
  
  return recommendations[severity] || 'Konsultasikan dengan dokter mata untuk rekomendasi lebih lanjut.';
}

// Fungsi helper untuk tanda klinis berdasarkan severity
function _getClinicalSignsFromSeverity(severity) {
  const clinicalSigns = {
    'Tidak ada': [
      'Tidak ada tanda-tanda retinopati diabetik yang terdeteksi.',
      'Pembuluh darah retina normal.',
      'Tidak ada perdarahan atau eksudat.'
    ],
    'No DR': [
      'Tidak ada tanda-tanda retinopati diabetik yang terdeteksi.',
      'Pembuluh darah retina normal.',
      'Tidak ada perdarahan atau eksudat.'
    ],
    'Ringan': [
      'Microaneurysm (pembengkakan kecil pada pembuluh darah retina).',
      'Perdarahan kecil pada retina.',
      'Mungkin tidak menimbulkan gejala pada pasien.'
    ],
    'Mild': [
      'Microaneurysm (pembengkakan kecil pada pembuluh darah retina).',
      'Perdarahan kecil pada retina.',
      'Mungkin tidak menimbulkan gejala pada pasien.'
    ],
    'Sedang': [
      'Perdarahan retina yang lebih luas.',
      'Cotton wool spots (area putih pada retina).',
      'Pembengkakan retina (edema).',
      'Mungkin mulai mempengaruhi penglihatan.'
    ],
    'Moderate': [
      'Perdarahan retina yang lebih luas.',
      'Cotton wool spots (area putih pada retina).',
      'Pembengkakan retina (edema).',
      'Mungkin mulai mempengaruhi penglihatan.'
    ],
    'Berat': [
      'Perdarahan retina yang luas.',
      'Banyak cotton wool spots.',
      'Abnormalitas pada pembuluh darah retina.',
      'Iskemia retina (kekurangan aliran darah).',
      'Gangguan penglihatan yang signifikan.'
    ],
    'Severe': [
      'Perdarahan retina yang luas.',
      'Banyak cotton wool spots.',
      'Abnormalitas pada pembuluh darah retina.',
      'Iskemia retina (kekurangan aliran darah).',
      'Gangguan penglihatan yang signifikan.'
    ],
    'Sangat Berat': [
      'Pembentukan pembuluh darah baru yang abnormal (neovaskularisasi).',
      'Perdarahan ke dalam vitreous (cairan di dalam mata).',
      'Jaringan parut pada retina.',
      'Risiko tinggi ablasio retina.',
      'Gangguan penglihatan berat hingga kebutaan.'
    ],
    'Proliferative DR': [
      'Pembentukan pembuluh darah baru yang abnormal (neovaskularisasi).',
      'Perdarahan ke dalam vitreous (cairan di dalam mata).',
      'Jaringan parut pada retina.',
      'Risiko tinggi ablasio retina.',
      'Gangguan penglihatan berat hingga kebutaan.'
    ]
  };
  
  return clinicalSigns[severity] || ['Tanda klinis tidak tersedia untuk tingkat keparahan ini.'];
}

// Fungsi untuk mendapatkan data dashboard
export const getDashboardData = async () => {
  try {
    const token = localStorage.getItem('token');
    console.log('Attempting to fetch dashboard data from API...');
    
    // Start time untuk perhitungan latency
    const startTime = performance.now();
    
    // Menggunakan endpoint yang benar: /api/analysis/dashboard/stats
    const response = await axios.get(`${API_URL}/api/analysis/dashboard/stats`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      // Menambahkan timeout untuk menghindari request menggantung terlalu lama
      timeout: 10000
    });
    
    // Hitung latency request
    const latency = Math.round(performance.now() - startTime);
    
    // Log status respon dan latency
    console.log(`Dashboard data API response: ${response.status} (${latency}ms)`);
    
    // Validasi data yang diterima
    if (!response.data) {
      console.warn('Dashboard API returned empty data');
      return null;
    }
    
    // Log struktur data untuk debugging
    console.log('Dashboard data structure:', {
      hasSeverityDistribution: !!response.data.severityDistribution,
      hasMonthlyTrend: !!response.data.monthlyTrend,
      hasAgeGroups: !!response.data.ageGroups,
      hasGenderDistribution: !!response.data.genderDistribution,
      hasConfidenceLevels: !!response.data.confidenceLevels,
      patientsCount: response.data.patients?.length || 0,
      analysesCount: response.data.analyses?.length || 0
    });
    
    // Normalisasi data severityDistribution untuk memastikan 5 kategori
    if (response.data.severityDistribution) {
      console.log('Raw severityDistribution:', response.data.severityDistribution);
      
      // Pastikan array severityDistribution memiliki tepat 5 elemen
      if (response.data.severityDistribution.length !== 5) {
        console.warn(`severityDistribution length mismatch: expected 5, got ${response.data.severityDistribution.length}`);
        
        // Jika kurang dari 5, tambahkan elemen yang hilang dengan nilai 0
        const normalizedDistribution = [...response.data.severityDistribution];
        while (normalizedDistribution.length < 5) {
          normalizedDistribution.push(0);
          console.warn(`Added missing severity category at index ${normalizedDistribution.length - 1}`);
        }
        
        // Jika lebih dari 5, potong kelebihan
        if (normalizedDistribution.length > 5) {
          console.warn(`Trimming excess severity categories from ${normalizedDistribution.length} to 5`);
          normalizedDistribution.length = 5;
        }
        
        // Update data yang akan dikembalikan
        response.data.severityDistribution = normalizedDistribution;
        console.log('Normalized severityDistribution:', normalizedDistribution);
      }
      
      // Validasi setiap nilai dalam array untuk memastikan tidak ada nilai NaN atau undefined
      response.data.severityDistribution = response.data.severityDistribution.map((value, index) => {
        if (isNaN(value) || value === undefined || value === null) {
          console.warn(`Invalid value at severityDistribution[${index}]: ${value}, replacing with 0`);
          return 0;
        }
        return value;
      });
    } else {
      // Jika tidak ada severityDistribution sama sekali, buat array default
      console.warn('severityDistribution missing, creating default distribution');
      response.data.severityDistribution = [20, 20, 20, 20, 20]; // Distribusi default yang seimbang
    }
    
    // Normalisasi data pasien untuk memastikan gender dan umur valid
    if (response.data.patients && Array.isArray(response.data.patients)) {
      console.log('Normalizing patient data...');
      
      response.data.patients = response.data.patients.map(patient => {
        // Clone pasien untuk menghindari mutasi objek asli
        const normalizedPatient = { ...patient };
        
        // Normalisasi gender
        if (normalizedPatient.gender) {
          const genderLower = normalizedPatient.gender.toLowerCase().trim();
          if (genderLower === 'laki-laki' || genderLower === 'male' || genderLower === 'l' || genderLower === 'm') {
            normalizedPatient.gender = 'Laki-laki';
          } else if (genderLower === 'perempuan' || genderLower === 'female' || genderLower === 'p' || genderLower === 'f') {
            normalizedPatient.gender = 'Perempuan';
          }
        }
        
        // Normalisasi umur - pastikan nilainya numerik
        if (normalizedPatient.age !== undefined && normalizedPatient.age !== null) {
          const ageNum = parseInt(normalizedPatient.age, 10);
          if (!isNaN(ageNum)) {
            normalizedPatient.age = ageNum;
          } else {
            // Jika bukan angka valid, hapus
            console.warn(`Invalid age value: ${normalizedPatient.age}, removing from patient data`);
            delete normalizedPatient.age;
          }
        }
        
        return normalizedPatient;
      });
    }
    
    // Pastikan genderDistribution valid
    if (response.data.genderDistribution) {
      console.log('Raw genderDistribution:', response.data.genderDistribution);
      
      // Pastikan array genderDistribution memiliki tepat 2 elemen (Laki-laki, Perempuan)
      if (response.data.genderDistribution.length !== 2) {
        console.warn(`genderDistribution length mismatch: expected 2, got ${response.data.genderDistribution.length}`);
        
        // Normalisasi menjadi 2 elemen
        const normalizedGender = response.data.genderDistribution.slice(0, 2);
        while (normalizedGender.length < 2) {
          normalizedGender.push(0);
        }
        
        response.data.genderDistribution = normalizedGender;
      }
      
      // Validasi nilai dalam array
      response.data.genderDistribution = response.data.genderDistribution.map((value, index) => {
        if (isNaN(value) || value === undefined || value === null) {
          return index === 0 ? 50 : 50; // Default 50/50
        }
        return value;
      });
      
      // Pastikan total adalah 100%
      const total = response.data.genderDistribution.reduce((sum, val) => sum + val, 0);
      if (total !== 100) {
        const ratio = 100 / (total || 1);
        response.data.genderDistribution = response.data.genderDistribution.map(value => Math.round(value * ratio));
        console.log('Normalized genderDistribution to 100%:', response.data.genderDistribution);
      }
    } else {
      // Jika tidak ada genderDistribution sama sekali, buat array default
      response.data.genderDistribution = [50, 50]; // Default 50/50
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    
    // Log informasi error yang lebih detail
    if (error.response) {
      // Server merespons dengan kode status error
      console.error('Server error response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      // Request dibuat tapi tidak ada respons dari server
      console.error('No response received:', {
        request: error.request,
        message: 'The request was made but no response was received. Server might be down or unreachable.'
      });
    } else {
      // Error saat setup request
      console.error('Request setup error:', {
        message: error.message,
        config: error.config
      });
    }
    
    if (error.code === 'ECONNABORTED') {
      console.error('Request timed out. Server might be slow or unreachable.');
    }
    
    // Re-throw error untuk handling di komponen
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

// Fungsi untuk mengambil riwayat analisis berdasarkan ID pasien
export const getPatientHistory = async (patientId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token tidak ditemukan');
    }

    const response = await axios.get(`${API_URL}/api/analysis/history/patient/${patientId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.data;
  } catch (error) {
    console.error('Error getting patient history:', error);
    throw error;
  }
};

// Fungsi untuk menyimpan hasil analisis ke database
export const saveAnalysisResult = async (analysisData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token tidak ditemukan');
    }
    
    console.log('Saving analysis result to database:', analysisData);
    
    // Validasi patientId - pastikan data memiliki ID pasien yang valid
    let patientId = null;
    
    // Coba dapatkan patientId dari berbagai kemungkinan struktur data
    if (analysisData.patientId) {
      // Jika patientId langsung ada sebagai properti
      if (typeof analysisData.patientId === 'object' && analysisData.patientId._id) {
        // Jika patientId adalah object dengan _id
        patientId = analysisData.patientId._id;
      } else if (typeof analysisData.patientId === 'string') {
        // Jika patientId sudah berupa string
        patientId = analysisData.patientId;
      }
    } else if (analysisData.patient && typeof analysisData.patient === 'object' && analysisData.patient._id) {
      // Jika patientId ada di dalam objek patient sebagai _id
      patientId = analysisData.patient._id;
    } else if (analysisData.patient && typeof analysisData.patient === 'string') {
      // Jika patient adalah string ID langsung
      patientId = analysisData.patient;
    }
    
    // Log patientId untuk debugging
    console.log('PatientId extracted:', patientId);
    
    // Validasi final untuk patientId
    if (!patientId) {
      const errorMsg = 'ID Pasien tidak valid atau tidak ditemukan dalam data analisis';
      console.error(errorMsg, {
        availableData: {
          hasPatientId: !!analysisData.patientId,
          hasPatient: !!analysisData.patient,
          patientType: analysisData.patient ? typeof analysisData.patient : 'undefined',
          patientIdType: analysisData.patientId ? typeof analysisData.patientId : 'undefined'
        }
      });
      throw new Error(errorMsg);
    }
    
    // Pastikan data memiliki format yang benar
    const formattedData = {
      ...analysisData,
      // Pastikan ID tersedia dalam format yang benar
      _id: analysisData._id || analysisData.id || analysisData.analysisId,
      // Gunakan patientId yang sudah divalidasi
      patientId: patientId
    };
    
    // Siapkan FormData untuk endpoint upload
    const formData = new FormData();
    
    // Tambahkan data penting ke FormData (pastikan patientId berupa string)
    formData.append('patientId', patientId);
    
    // Log patientId yang dikirim ke server
    console.log('Sending patientId to server:', patientId);
    
    // Jika ada imageData (base64), tambahkan
    if (formattedData.imageData) {
      formData.append('imageData', formattedData.imageData);
    } else if (formattedData.image && typeof formattedData.image === 'string' && formattedData.image.startsWith('data:')) {
      formData.append('imageData', formattedData.image);
    } else {
      console.warn('Tidak ada imageData yang valid untuk dikirim ke server');
    }
    
    // Tambahkan data lain yang mungkin dibutuhkan
    if (formattedData.severity) formData.append('severity', formattedData.severity);
    if (formattedData.severityLevel !== undefined) formData.append('severityLevel', formattedData.severityLevel);
    if (formattedData.confidence) formData.append('confidence', formattedData.confidence);
    if (formattedData.recommendation) formData.append('recommendation', formattedData.recommendation);
    if (formattedData.notes) formData.append('notes', formattedData.notes);
    
    // PENTING: Selalu tandai bahwa ini adalah penyimpanan manual, bukan upload baru
    // Ini akan mencegah pembuatan duplikat analisis di server
    formData.append('isManualSave', 'true');
    
    // Tambahkan log khusus untuk memastikan flag isManualSave dikirim
    console.log('isManualSave flag set to true untuk mencegah duplikasi analisis');
    
    // Dump semua data FormData untuk debugging
    console.log('FormData entries:');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + (pair[0] === 'imageData' ? '[image data]' : pair[1]));
    }
    
    // Gunakan endpoint /api/analysis/upload yang sudah ada
    const response = await axios.post(`${API_URL}/api/analysis/upload`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('Analysis result saved successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error saving analysis result:', error);
    throw error;
  }
};