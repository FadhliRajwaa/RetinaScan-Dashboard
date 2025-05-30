/**
 * fallbackData.js
 * 
 * File ini berisi data fallback yang realistis untuk digunakan
 * ketika koneksi ke backend gagal atau data tidak tersedia.
 */

// Data fallback untuk distribusi tingkat keparahan retinopati
export const severityDistributionData = [
  40, // Tidak ada
  25, // Ringan
  20, // Sedang
  10, // Berat
  5   // Sangat Berat
];

// Data fallback untuk tren bulanan analisis
export const monthlyTrendData = {
  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  data: [12, 19, 15, 28, 22, 35, 42, 38, 25, 30, 36, 29]
};

// Data fallback untuk distribusi kelompok umur
export const ageGroupsData = {
  categories: ['0-10', '11-20', '21-30', '31-40', '41-50', '51-60', '61+'],
  data: [5, 8, 12, 20, 25, 18, 12]
};

// Data fallback untuk distribusi gender
export const genderDistributionData = [
  52, // Laki-laki
  48  // Perempuan
];

// Data fallback untuk tingkat kepercayaan AI
export const confidenceLevelsData = {
  average: 87,
  highest: 98,
  lowest: 75
};

// Data fallback untuk pasien
export const patientsData = [
  { id: 'p1', name: 'Ahmad Rizky', age: 45, gender: 'Laki-laki', severity: 'Sedang' },
  { id: 'p2', name: 'Siti Aminah', age: 62, gender: 'Perempuan', severity: 'Berat' },
  { id: 'p3', name: 'Budi Santoso', age: 38, gender: 'Laki-laki', severity: 'Ringan' },
  { id: 'p4', name: 'Dewi Putri', age: 55, gender: 'Perempuan', severity: 'Tidak ada' },
  { id: 'p5', name: 'Farhan Akbar', age: 41, gender: 'Laki-laki', severity: 'Sangat Berat' },
  { id: 'p6', name: 'Anisa Rahmawati', age: 33, gender: 'Perempuan', severity: 'Ringan' },
  { id: 'p7', name: 'Dodi Pratama', age: 48, gender: 'Laki-laki', severity: 'Sedang' },
  { id: 'p8', name: 'Maya Indah', age: 29, gender: 'Perempuan', severity: 'Tidak ada' },
  { id: 'p9', name: 'Rudi Hermawan', age: 52, gender: 'Laki-laki', severity: 'Berat' },
  { id: 'p10', name: 'Lia Kusuma', age: 36, gender: 'Perempuan', severity: 'Ringan' }
];

// Data fallback untuk analisis
export const analysesData = [
  {
    id: 'a1',
    patientId: { id: 'p1', name: 'Ahmad Rizky', age: 45, gender: 'Laki-laki' },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    results: { classification: 'Moderate', confidence: 0.89 }
  },
  {
    id: 'a2',
    patientId: { id: 'p2', name: 'Siti Aminah', age: 62, gender: 'Perempuan' },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    results: { classification: 'Severe', confidence: 0.93 }
  },
  {
    id: 'a3',
    patientId: { id: 'p3', name: 'Budi Santoso', age: 38, gender: 'Laki-laki' },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    results: { classification: 'Mild', confidence: 0.85 }
  },
  {
    id: 'a4',
    patientId: { id: 'p4', name: 'Dewi Putri', age: 55, gender: 'Perempuan' },
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    results: { classification: 'No DR', confidence: 0.97 }
  },
  {
    id: 'a5',
    patientId: { id: 'p5', name: 'Farhan Akbar', age: 41, gender: 'Laki-laki' },
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    results: { classification: 'Proliferative DR', confidence: 0.91 }
  }
];

// Gabungkan semua data fallback menjadi satu objek
export const completeDashboardFallbackData = {
  severityDistribution: severityDistributionData,
  monthlyTrend: monthlyTrendData,
  ageGroups: ageGroupsData,
  genderDistribution: genderDistributionData,
  confidenceLevels: confidenceLevelsData,
  patients: patientsData,
  analyses: analysesData
};

// Fungsi untuk mendapatkan data fallback yang berbeda setiap kali untuk simulasi data dinamis
export const getRandomizedFallbackData = () => {
  // Fungsi helper untuk memberikan variasi acak pada data
  const randomizeArray = (array, variation = 0.2) => {
    return array.map(value => {
      const randomFactor = 1 + (Math.random() * variation * 2 - variation);
      return Math.round(value * randomFactor);
    });
  };

  // Buat salinan data dan tambahkan variasi
  const severityDistribution = randomizeArray(severityDistributionData);
  const monthlyTrendWithVariation = {
    categories: monthlyTrendData.categories,
    data: randomizeArray(monthlyTrendData.data)
  };
  const ageGroupsWithVariation = {
    categories: ageGroupsData.categories,
    data: randomizeArray(ageGroupsData.data)
  };
  const genderDistribution = randomizeArray(genderDistributionData, 0.05);

  // Pastikan total genderDistribution = 100%
  const genderTotal = genderDistribution.reduce((a, b) => a + b, 0);
  genderDistribution[0] = Math.round((genderDistribution[0] / genderTotal) * 100);
  genderDistribution[1] = 100 - genderDistribution[0];

  // Tingkat kepercayaan AI dengan variasi
  const confidenceLevels = {
    average: Math.min(98, Math.max(75, confidenceLevelsData.average + Math.floor(Math.random() * 7) - 3)),
    highest: Math.min(99, confidenceLevelsData.highest + Math.floor(Math.random() * 3) - 1),
    lowest: Math.max(70, confidenceLevelsData.lowest + Math.floor(Math.random() * 5) - 2)
  };

  return {
    severityDistribution,
    monthlyTrend: monthlyTrendWithVariation,
    ageGroups: ageGroupsWithVariation,
    genderDistribution,
    confidenceLevels,
    patients: patientsData,
    analyses: analysesData.slice(0, Math.floor(Math.random() * 3) + 3) // Tampilkan 3-5 analisis secara acak
  };
};

export default completeDashboardFallbackData; 