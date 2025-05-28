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