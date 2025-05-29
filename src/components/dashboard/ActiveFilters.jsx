import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ActiveFilters = ({ filters, onRemoveFilter, onClearAllFilters }) => {
  // Mengubah objek filters menjadi array untuk ditampilkan
  const activeFilters = useMemo(() => {
    if (!filters) return [];
    
    const result = [];
    
    // Date Range
    if (filters.dateRange && filters.dateRange !== 'all') {
      let dateRangeLabel = '';
      
      switch (filters.dateRange) {
        case 'today':
          dateRangeLabel = 'Hari Ini';
          break;
        case 'yesterday':
          dateRangeLabel = 'Kemarin';
          break;
        case 'week':
          dateRangeLabel = 'Minggu Ini';
          break;
        case 'month':
          dateRangeLabel = 'Bulan Ini';
          break;
        case 'quarter':
          dateRangeLabel = '3 Bulan Terakhir';
          break;
        case 'year':
          dateRangeLabel = 'Tahun Ini';
          break;
        case 'custom':
          if (filters.customDateStart && filters.customDateEnd) {
            dateRangeLabel = `${filters.customDateStart} s/d ${filters.customDateEnd}`;
          } else if (filters.customDateStart) {
            dateRangeLabel = `Sejak ${filters.customDateStart}`;
          } else if (filters.customDateEnd) {
            dateRangeLabel = `Sampai ${filters.customDateEnd}`;
          } else {
            dateRangeLabel = 'Kustom';
          }
          break;
        default:
          dateRangeLabel = filters.dateRange;
      }
      
      result.push({
        type: 'dateRange',
        label: `Periode: ${dateRangeLabel}`,
        value: filters.dateRange
      });
    }
    
    // Severity Levels
    if (filters.severityLevels && Array.isArray(filters.severityLevels)) {
      if (filters.severityLevels.length > 0 && filters.severityLevels.length < 5) {
        const severityMapping = {
          '0': 'Tidak ada',
          '1': 'Ringan',
          '2': 'Sedang',
          '3': 'Berat',
          '4': 'Sangat Berat'
        };
        
        const severityLabels = filters.severityLevels.map(level => severityMapping[level] || level);
        
        result.push({
          type: 'severityLevels',
          label: `Keparahan: ${severityLabels.join(', ')}`,
          value: filters.severityLevels.join(',')
        });
      }
    }
    
    // Age Groups
    if (filters.ageGroups && Array.isArray(filters.ageGroups)) {
      const allAgeGroups = ['0-10', '11-20', '21-30', '31-40', '41-50', '51-60', '61+'];
      
      if (filters.ageGroups.length > 0 && filters.ageGroups.length < allAgeGroups.length) {
        result.push({
          type: 'ageGroups',
          label: `Umur: ${filters.ageGroups.join(', ')}`,
          value: filters.ageGroups.join(',')
        });
      }
    }
    
    // Genders
    if (filters.genders && Array.isArray(filters.genders)) {
      const allGenders = ['Laki-laki', 'Perempuan'];
      
      if (filters.genders.length > 0 && filters.genders.length < allGenders.length) {
        result.push({
          type: 'genders',
          label: `Gender: ${filters.genders.join(', ')}`,
          value: filters.genders.join(',')
        });
      }
    }
    
    // Confidence Threshold
    if (filters.confidenceThreshold && filters.confidenceThreshold > 0) {
      result.push({
        type: 'confidenceThreshold',
        label: `Kepercayaan: ≥ ${filters.confidenceThreshold}%`,
        value: filters.confidenceThreshold
      });
    }
    
    // Sort
    if (filters.sortBy && filters.sortBy !== 'date') {
      let sortLabel = '';
      switch (filters.sortBy) {
        case 'severity':
          sortLabel = 'Tingkat Keparahan';
          break;
        case 'confidence':
          sortLabel = 'Tingkat Kepercayaan';
          break;
        case 'age':
          sortLabel = 'Umur';
          break;
        default:
          sortLabel = filters.sortBy;
      }
      
      const orderLabel = filters.sortOrder === 'asc' ? 'Naik' : 'Turun';
      
      result.push({
        type: 'sort',
        label: `Urut: ${sortLabel} (${orderLabel})`,
        value: `${filters.sortBy}-${filters.sortOrder}`
      });
    }
    
    return result;
  }, [filters]);
  
  // Jika tidak ada filter aktif, return null
  if (!activeFilters || activeFilters.length === 0) {
    return null;
  }
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-wrap gap-2 my-4"
    >
      <AnimatePresence>
        {activeFilters.map((filter) => (
          <motion.div
            key={`${filter.type}-${filter.value}`}
            variants={itemVariants}
            exit="exit"
            layout
            className="flex items-center bg-blue-50 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
          >
            <span>{filter.label}</span>
            <button
              onClick={() => onRemoveFilter(filter.type, filter.value)}
              className="ml-2 focus:outline-none"
              aria-label={`Hapus filter ${filter.label}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 hover:text-blue-700" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
      
      {activeFilters.length > 1 && (
        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClearAllFilters}
          className="flex items-center bg-gray-100 text-gray-700 text-sm font-medium px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
        >
          <span>Hapus Semua</span>
        </motion.button>
      )}
    </motion.div>
  );
};

export default ActiveFilters; 