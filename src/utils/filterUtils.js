/**
 * Utilitas untuk memfilter data berdasarkan filter yang diterapkan
 */

/**
 * Memfilter array pasien berdasarkan filter yang diterapkan
 * @param {Array} patients - Array pasien yang akan difilter
 * @param {Object} filters - Objek filter yang diterapkan
 * @returns {Array} - Array pasien yang sudah difilter
 */
export const filterPatients = (patients, filters) => {
  if (!patients || !Array.isArray(patients)) {
    return [];
  }

  if (!filters) {
    return patients;
  }

  return patients.filter(patient => {
    // Filter berdasarkan tanggal
    if (filters.dateRange && filters.dateRange !== 'all') {
      const patientDate = new Date(patient.createdAt || patient.timestamp || 0);
      const now = new Date();
      let startDate = null;
      let endDate = null;

      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          endDate = new Date(now.setHours(23, 59, 59, 999));
          break;
        case 'yesterday':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 1);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(startDate);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'week':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - startDate.getDay());
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now);
          break;
        case 'quarter':
          startDate = new Date(now);
          startDate.setMonth(startDate.getMonth() - 3);
          endDate = new Date(now);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now);
          break;
        case 'custom':
          if (filters.customDateStart) {
            startDate = new Date(filters.customDateStart);
            startDate.setHours(0, 0, 0, 0);
          }
          if (filters.customDateEnd) {
            endDate = new Date(filters.customDateEnd);
            endDate.setHours(23, 59, 59, 999);
          }
          break;
        default:
          break;
      }

      if (startDate && patientDate < startDate) {
        return false;
      }

      if (endDate && patientDate > endDate) {
        return false;
      }
    }

    // Filter berdasarkan umur
    if (filters.ageGroups && Array.isArray(filters.ageGroups) && filters.ageGroups.length > 0) {
      if (!patient.age) {
        return false;
      }

      const age = parseInt(patient.age);
      if (isNaN(age)) {
        return false;
      }

      let isInAgeGroup = false;
      for (const ageGroup of filters.ageGroups) {
        if (ageGroup === '61+' && age >= 61) {
          isInAgeGroup = true;
          break;
        }

        const [min, max] = ageGroup.split('-').map(Number);
        if (age >= min && age <= max) {
          isInAgeGroup = true;
          break;
        }
      }

      if (!isInAgeGroup) {
        return false;
      }
    }

    // Filter berdasarkan gender
    if (filters.genders && Array.isArray(filters.genders) && filters.genders.length > 0) {
      if (!patient.gender) {
        return false;
      }

      const gender = patient.gender.toLowerCase();
      const isMale = gender === 'laki-laki' || gender === 'pria' || gender === 'l' || gender === 'male';
      const isFemale = gender === 'perempuan' || gender === 'wanita' || gender === 'p' || gender === 'female';

      if (
        (filters.genders.includes('Laki-laki') && !isMale) &&
        (filters.genders.includes('Perempuan') && !isFemale)
      ) {
        return false;
      }

      if (filters.genders.includes('Laki-laki') && !isMale && !filters.genders.includes('Perempuan')) {
        return false;
      }

      if (filters.genders.includes('Perempuan') && !isFemale && !filters.genders.includes('Laki-laki')) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Memfilter array analisis berdasarkan filter yang diterapkan
 * @param {Array} analyses - Array analisis yang akan difilter
 * @param {Object} filters - Objek filter yang diterapkan
 * @returns {Array} - Array analisis yang sudah difilter
 */
export const filterAnalyses = (analyses, filters) => {
  if (!analyses || !Array.isArray(analyses)) {
    return [];
  }

  if (!filters) {
    return analyses;
  }

  return analyses.filter(analysis => {
    // Filter berdasarkan tanggal
    if (filters.dateRange && filters.dateRange !== 'all') {
      const analysisDate = new Date(analysis.createdAt || analysis.timestamp || 0);
      const now = new Date();
      let startDate = null;
      let endDate = null;

      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          endDate = new Date(now.setHours(23, 59, 59, 999));
          break;
        case 'yesterday':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 1);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(startDate);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'week':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - startDate.getDay());
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now);
          break;
        case 'quarter':
          startDate = new Date(now);
          startDate.setMonth(startDate.getMonth() - 3);
          endDate = new Date(now);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now);
          break;
        case 'custom':
          if (filters.customDateStart) {
            startDate = new Date(filters.customDateStart);
            startDate.setHours(0, 0, 0, 0);
          }
          if (filters.customDateEnd) {
            endDate = new Date(filters.customDateEnd);
            endDate.setHours(23, 59, 59, 999);
          }
          break;
        default:
          break;
      }

      if (startDate && analysisDate < startDate) {
        return false;
      }

      if (endDate && analysisDate > endDate) {
        return false;
      }
    }

    // Filter berdasarkan tingkat keparahan
    if (filters.severityLevels && Array.isArray(filters.severityLevels) && filters.severityLevels.length > 0) {
      if (!analysis.results || !analysis.results.classification) {
        return false;
      }

      const classification = analysis.results.classification;
      
      // Mapping dari kelas bahasa Inggris ke Indonesia
      const severityMapping = {
        'No DR': '0',
        'Mild': '1',
        'Moderate': '2',
        'Severe': '3',
        'Proliferative DR': '4',
        'Tidak ada': '0',
        'Ringan': '1',
        'Sedang': '2',
        'Berat': '3',
        'Sangat Berat': '4'
      };
      
      let severityLevel = severityMapping[classification];
      
      if (!severityLevel) {
        return false;
      }
      
      if (!filters.severityLevels.includes(severityLevel)) {
        return false;
      }
    }

    // Filter berdasarkan tingkat kepercayaan
    if (filters.confidenceThreshold && filters.confidenceThreshold > 0) {
      if (!analysis.results || typeof analysis.results.confidence === 'undefined') {
        return false;
      }

      const confidence = Math.round(analysis.results.confidence * 100);
      if (confidence < filters.confidenceThreshold) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Mengurutkan array analisis berdasarkan filter yang diterapkan
 * @param {Array} analyses - Array analisis yang akan diurutkan
 * @param {Object} filters - Objek filter yang diterapkan
 * @returns {Array} - Array analisis yang sudah diurutkan
 */
export const sortAnalyses = (analyses, filters) => {
  if (!analyses || !Array.isArray(analyses)) {
    return [];
  }

  if (!filters || !filters.sortBy) {
    return analyses;
  }

  const sortedAnalyses = [...analyses];

  // Mapping dari kelas bahasa Inggris ke nilai numerik untuk pengurutan
  const severityMapping = {
    'No DR': 0,
    'Mild': 1,
    'Moderate': 2,
    'Severe': 3,
    'Proliferative DR': 4,
    'Tidak ada': 0,
    'Ringan': 1,
    'Sedang': 2,
    'Berat': 3,
    'Sangat Berat': 4
  };

  sortedAnalyses.sort((a, b) => {
    let valueA, valueB;

    switch (filters.sortBy) {
      case 'date':
        valueA = new Date(a.createdAt || a.timestamp || 0).getTime();
        valueB = new Date(b.createdAt || b.timestamp || 0).getTime();
        break;
      case 'severity':
        valueA = severityMapping[a.results?.classification] || 0;
        valueB = severityMapping[b.results?.classification] || 0;
        break;
      case 'confidence':
        valueA = a.results?.confidence || 0;
        valueB = b.results?.confidence || 0;
        break;
      case 'age':
        valueA = parseInt(a.patient?.age) || 0;
        valueB = parseInt(b.patient?.age) || 0;
        break;
      default:
        valueA = 0;
        valueB = 0;
    }

    if (filters.sortOrder === 'asc') {
      return valueA - valueB;
    } else {
      return valueB - valueA;
    }
  });

  return sortedAnalyses;
};

/**
 * Mengurutkan array pasien berdasarkan filter yang diterapkan
 * @param {Array} patients - Array pasien yang akan diurutkan
 * @param {Object} filters - Objek filter yang diterapkan
 * @returns {Array} - Array pasien yang sudah diurutkan
 */
export const sortPatients = (patients, filters) => {
  if (!patients || !Array.isArray(patients)) {
    return [];
  }

  if (!filters || !filters.sortBy) {
    return patients;
  }

  const sortedPatients = [...patients];

  sortedPatients.sort((a, b) => {
    let valueA, valueB;

    switch (filters.sortBy) {
      case 'date':
        valueA = new Date(a.createdAt || a.timestamp || 0).getTime();
        valueB = new Date(b.createdAt || b.timestamp || 0).getTime();
        break;
      case 'age':
        valueA = parseInt(a.age) || 0;
        valueB = parseInt(b.age) || 0;
        break;
      default:
        valueA = 0;
        valueB = 0;
    }

    if (filters.sortOrder === 'asc') {
      return valueA - valueB;
    } else {
      return valueB - valueA;
    }
  });

  return sortedPatients;
}; 