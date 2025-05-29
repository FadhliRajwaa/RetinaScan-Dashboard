import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const FilterPanel = ({ 
  isOpen, 
  onClose, 
  onApplyFilters,
  initialFilters = {}
}) => {
  const { theme } = useTheme();
  const [filters, setFilters] = useState({
    dateRange: initialFilters.dateRange || 'all',
    customDateStart: initialFilters.customDateStart || '',
    customDateEnd: initialFilters.customDateEnd || '',
    severityLevels: initialFilters.severityLevels || ['0', '1', '2', '3', '4'],
    ageGroups: initialFilters.ageGroups || ['0-10', '11-20', '21-30', '31-40', '41-50', '51-60', '61+'],
    genders: initialFilters.genders || ['Laki-laki', 'Perempuan'],
    confidenceThreshold: initialFilters.confidenceThreshold || 0,
    sortBy: initialFilters.sortBy || 'date',
    sortOrder: initialFilters.sortOrder || 'desc'
  });

  // Efek untuk reset filter saat panel dibuka
  useEffect(() => {
    if (isOpen) {
      setFilters({
        dateRange: initialFilters.dateRange || 'all',
        customDateStart: initialFilters.customDateStart || '',
        customDateEnd: initialFilters.customDateEnd || '',
        severityLevels: initialFilters.severityLevels || ['0', '1', '2', '3', '4'],
        ageGroups: initialFilters.ageGroups || ['0-10', '11-20', '21-30', '31-40', '41-50', '51-60', '61+'],
        genders: initialFilters.genders || ['Laki-laki', 'Perempuan'],
        confidenceThreshold: initialFilters.confidenceThreshold || 0,
        sortBy: initialFilters.sortBy || 'date',
        sortOrder: initialFilters.sortOrder || 'desc'
      });
    }
  }, [isOpen, initialFilters]);

  // Handler untuk mengubah filter
  const handleFilterChange = useCallback((filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  }, []);

  // Handler untuk toggle checkbox dalam array
  const handleArrayFilterToggle = useCallback((filterName, value) => {
    setFilters(prev => {
      const currentArray = prev[filterName] || [];
      
      if (currentArray.includes(value)) {
        // Hapus item jika sudah ada
        return {
          ...prev,
          [filterName]: currentArray.filter(item => item !== value)
        };
      } else {
        // Tambahkan item jika belum ada
        return {
          ...prev,
          [filterName]: [...currentArray, value]
        };
      }
    });
  }, []);

  // Handler untuk reset filter
  const handleResetFilters = useCallback(() => {
    setFilters({
      dateRange: 'all',
      customDateStart: '',
      customDateEnd: '',
      severityLevels: ['0', '1', '2', '3', '4'],
      ageGroups: ['0-10', '11-20', '21-30', '31-40', '41-50', '51-60', '61+'],
      genders: ['Laki-laki', 'Perempuan'],
      confidenceThreshold: 0,
      sortBy: 'date',
      sortOrder: 'desc'
    });
  }, []);

  // Handler untuk apply filter
  const handleApplyFilters = useCallback(() => {
    onApplyFilters(filters);
    onClose();
  }, [filters, onApplyFilters, onClose]);

  // Severity level options
  const severityOptions = [
    { value: '0', label: 'Tidak ada', color: '#10B981' },
    { value: '1', label: 'Ringan', color: '#06D6A0' },
    { value: '2', label: 'Sedang', color: '#FBBF24' },
    { value: '3', label: 'Berat', color: '#F59E0B' },
    { value: '4', label: 'Sangat Berat', color: '#EF4444' }
  ];

  // Age group options
  const ageGroupOptions = [
    { value: '0-10', label: '0-10 tahun' },
    { value: '11-20', label: '11-20 tahun' },
    { value: '21-30', label: '21-30 tahun' },
    { value: '31-40', label: '31-40 tahun' },
    { value: '41-50', label: '41-50 tahun' },
    { value: '51-60', label: '51-60 tahun' },
    { value: '61+', label: '61+ tahun' }
  ];

  // Gender options
  const genderOptions = [
    { value: 'Laki-laki', label: 'Laki-laki' },
    { value: 'Perempuan', label: 'Perempuan' }
  ];

  // Date range options
  const dateRangeOptions = [
    { value: 'all', label: 'Semua Waktu' },
    { value: 'today', label: 'Hari Ini' },
    { value: 'yesterday', label: 'Kemarin' },
    { value: 'week', label: 'Minggu Ini' },
    { value: 'month', label: 'Bulan Ini' },
    { value: 'quarter', label: '3 Bulan Terakhir' },
    { value: 'year', label: 'Tahun Ini' },
    { value: 'custom', label: 'Kustom' }
  ];

  // Sort options
  const sortOptions = [
    { value: 'date', label: 'Tanggal' },
    { value: 'severity', label: 'Tingkat Keparahan' },
    { value: 'confidence', label: 'Tingkat Kepercayaan' },
    { value: 'age', label: 'Umur' }
  ];

  // Panel animation variants
  const panelVariants = {
    hidden: { 
      opacity: 0, 
      x: '100%',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  };

  // Overlay animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />
          
          {/* Filter panel */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={panelVariants}
            className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 overflow-y-auto"
            style={{
              maxWidth: '100%',
              borderTopLeftRadius: '16px',
              borderBottomLeftRadius: '16px'
            }}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Filter Data</h2>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Filter content */}
            <div className="p-6 space-y-6">
              {/* Date Range Filter */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">Rentang Waktu</h3>
                <div className="space-y-2">
                  <select
                    value={filters.dateRange}
                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {dateRangeOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  
                  {/* Custom date range */}
                  {filters.dateRange === 'custom' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid grid-cols-2 gap-2 mt-2"
                    >
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Dari</label>
                        <input
                          type="date"
                          value={filters.customDateStart}
                          onChange={(e) => handleFilterChange('customDateStart', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Sampai</label>
                        <input
                          type="date"
                          value={filters.customDateEnd}
                          onChange={(e) => handleFilterChange('customDateEnd', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
              
              {/* Severity Filter */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">Tingkat Keparahan</h3>
                <div className="grid grid-cols-1 gap-2">
                  {severityOptions.map(option => (
                    <div key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`severity-${option.value}`}
                        checked={filters.severityLevels.includes(option.value)}
                        onChange={() => handleArrayFilterToggle('severityLevels', option.value)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label 
                        htmlFor={`severity-${option.value}`}
                        className="ml-2 flex items-center"
                      >
                        <span 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: option.color }}
                        ></span>
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Age Group Filter */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">Kelompok Umur</h3>
                <div className="grid grid-cols-2 gap-2">
                  {ageGroupOptions.map(option => (
                    <div key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`age-${option.value}`}
                        checked={filters.ageGroups.includes(option.value)}
                        onChange={() => handleArrayFilterToggle('ageGroups', option.value)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label 
                        htmlFor={`age-${option.value}`}
                        className="ml-2 text-sm text-gray-700"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Gender Filter */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">Gender</h3>
                <div className="flex space-x-4">
                  {genderOptions.map(option => (
                    <div key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`gender-${option.value}`}
                        checked={filters.genders.includes(option.value)}
                        onChange={() => handleArrayFilterToggle('genders', option.value)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label 
                        htmlFor={`gender-${option.value}`}
                        className="ml-2 text-sm text-gray-700"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Confidence Threshold */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <h3 className="text-sm font-medium text-gray-700">Tingkat Kepercayaan Minimum</h3>
                  <span className="text-sm font-medium text-blue-600">{filters.confidenceThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={filters.confidenceThreshold}
                  onChange={(e) => handleFilterChange('confidenceThreshold', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${theme.primary}, ${theme.primary} ${filters.confidenceThreshold}%, #e5e7eb ${filters.confidenceThreshold}%, #e5e7eb)`,
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
              
              {/* Sort Options */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">Pengurutan</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Urutkan Berdasarkan</label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Urutan</label>
                    <select
                      value={filters.sortOrder}
                      onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="asc">Naik (A-Z)</option>
                      <option value="desc">Turun (Z-A)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer with buttons */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex justify-between">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={handleApplyFilters}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-md hover:from-blue-600 hover:to-indigo-700 transition-colors"
              >
                Terapkan Filter
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FilterPanel; 