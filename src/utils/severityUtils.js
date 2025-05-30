// Fungsi untuk mendapatkan warna teks berdasarkan severity
export const getSeverityTextColor = (severity) => {
  // Periksa apakah severity ada dan bukan undefined
  if (!severity) return 'text-gray-600';
  
  const level = severity.toLowerCase();
  if (level === 'tidak ada' || level === 'normal' || level === 'no dr') return 'text-blue-600';
  if (level === 'ringan' || level === 'mild') return 'text-green-600';
  if (level === 'sedang' || level === 'moderate') return 'text-yellow-600';
  if (level === 'berat' || level === 'severe') return 'text-orange-600';
  return 'text-red-600';
};

// Fungsi untuk mendapatkan warna background berdasarkan severity
export const getSeverityBgColor = (severity) => {
  // Periksa apakah severity ada dan bukan undefined
  if (!severity) return 'bg-gray-100 text-gray-800';
  
  const level = severity.toLowerCase();
  if (level === 'tidak ada' || level === 'normal' || level === 'no dr') return 'bg-blue-100 text-blue-800';
  if (level === 'ringan' || level === 'mild') return 'bg-green-100 text-green-800';
  if (level === 'sedang' || level === 'moderate') return 'bg-yellow-100 text-yellow-800';
  if (level === 'berat' || level === 'severe') return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
};

// Fungsi untuk mendapatkan label berdasarkan severity
export const getSeverityLabel = (severity) => {
  // Periksa apakah severity ada dan bukan undefined
  if (!severity) return 'Tidak Diketahui';
  
  const level = severity.toLowerCase();
  if (level === 'tidak ada' || level === 'normal' || level === 'no dr') return 'Normal';
  if (level === 'ringan' || level === 'mild') return 'Perlu Perhatian';
  if (level === 'sedang' || level === 'moderate') return 'Perlu Konsultasi';
  if (level === 'berat' || level === 'severe') return 'Perlu Penanganan';
  return 'Darurat';
};

// Fungsi untuk mendapatkan warna badge untuk komponen History
export const getSeverityBadge = (severity) => {
  if (!severity) {
    return 'bg-gray-100 text-gray-800';
  }
  
  const severityLower = severity.toLowerCase();
  
  // Mapping untuk warna badge berdasarkan severity
  const badgeStyles = {
    'tidak ada': 'bg-blue-100 text-blue-800',
    'no dr': 'bg-blue-100 text-blue-800',
    'normal': 'bg-blue-100 text-blue-800',
    'ringan': 'bg-green-100 text-green-800',
    'mild': 'bg-green-100 text-green-800',
    'rendah': 'bg-green-100 text-green-800',
    'sedang': 'bg-yellow-100 text-yellow-800',
    'moderate': 'bg-yellow-100 text-yellow-800',
    'berat': 'bg-orange-100 text-orange-800',
    'severe': 'bg-orange-100 text-orange-800',
    'parah': 'bg-orange-100 text-orange-800',
    'sangat berat': 'bg-red-100 text-red-800',
    'proliferative dr': 'bg-red-100 text-red-800'
  };
  
  // Cek apakah severity ada di mapping
  if (badgeStyles[severityLower]) {
    return badgeStyles[severityLower];
  }
  
  // Fallback berdasarkan severityLevel jika ada
  if (typeof severity === 'number' || !isNaN(parseInt(severity))) {
    const level = typeof severity === 'number' ? severity : parseInt(severity);
    const levelBadges = [
      'bg-blue-100 text-blue-800',   // Level 0 - Tidak ada
      'bg-green-100 text-green-800', // Level 1 - Ringan
      'bg-yellow-100 text-yellow-800', // Level 2 - Sedang
      'bg-orange-100 text-orange-800', // Level 3 - Berat
      'bg-red-100 text-red-800'      // Level 4 - Sangat Berat
    ];
    
    return levelBadges[level] || 'bg-gray-100 text-gray-800';
  }
  
  // Default fallback
  return 'bg-gray-100 text-gray-800';
};

// Fungsi normalisasi gender
export const normalizeGender = (gender) => {
  if (!gender) return 'Tidak Diketahui';
  
  const genderLower = gender.toLowerCase().trim();
  if (genderLower === 'laki-laki' || genderLower === 'male' || genderLower === 'l' || genderLower === 'm') {
    return 'Laki-laki';
  } else if (genderLower === 'perempuan' || genderLower === 'female' || genderLower === 'p' || genderLower === 'f') {
    return 'Perempuan';
  }
  
  return gender;
};

// Fungsi normalisasi umur
export const normalizeAge = (age) => {
  if (age === undefined || age === null) return null;
  
  // Konversi ke angka dan validasi
  const ageNum = parseInt(age, 10);
  if (isNaN(ageNum)) return null;
  
  return ageNum;
};

// Fungsi untuk mendapatkan teks info pasien (gender, umur)
export const getPatientInfo = (patient) => {
  if (!patient) return 'Data Tidak Tersedia';
  
  const gender = normalizeGender(patient.gender);
  
  let ageText = '';
  const age = normalizeAge(patient.age);
  if (age !== null) {
    ageText = `${age} tahun`;
  }
  
  // Jika salah satu tidak tersedia, tampilkan yang tersedia saja
  if (gender === 'Tidak Diketahui' && !ageText) {
    return 'Data Tidak Tersedia';
  } else if (gender === 'Tidak Diketahui') {
    return ageText;
  } else if (!ageText) {
    return gender;
  }
  
  // Jika keduanya tersedia
  return `${gender}, ${ageText}`;
};

// Fungsi untuk normalisasi data pasien
export const normalizePatientData = (patient) => {
  if (!patient) return null;
  
  // Clone pasien untuk menghindari mutasi objek asli
  const normalizedPatient = { ...patient };
  
  // Normalisasi gender
  normalizedPatient.gender = normalizeGender(patient.gender);
  
  // Normalisasi umur
  const age = normalizeAge(patient.age);
  if (age !== null) {
    normalizedPatient.age = age;
  }
  
  // Pastikan nama lengkap tersedia
  if (!normalizedPatient.fullName && normalizedPatient.name) {
    normalizedPatient.fullName = normalizedPatient.name;
  }
  
  return normalizedPatient;
}; 