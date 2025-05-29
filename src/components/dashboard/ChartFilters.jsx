import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import FilterButton from './FilterButton';
import FilterPanel from './FilterPanel';
import ActiveFilters from './ActiveFilters';

const ChartFilters = ({ onFiltersChange, initialFilters = {} }) => {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
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
  
  // Hitung jumlah filter aktif
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    
    // Date Range
    if (filters.dateRange && filters.dateRange !== 'all') {
      count++;
    }
    
    // Severity Levels
    if (filters.severityLevels && filters.severityLevels.length < 5 && filters.severityLevels.length > 0) {
      count++;
    }
    
    // Age Groups
    if (filters.ageGroups && filters.ageGroups.length < 7 && filters.ageGroups.length > 0) {
      count++;
    }
    
    // Genders
    if (filters.genders && filters.genders.length < 2 && filters.genders.length > 0) {
      count++;
    }
    
    // Confidence Threshold
    if (filters.confidenceThreshold && filters.confidenceThreshold > 0) {
      count++;
    }
    
    // Sort
    if (filters.sortBy && filters.sortBy !== 'date') {
      count++;
    }
    
    return count;
  }, [filters]);
  
  // Handler untuk membuka/menutup panel filter
  const toggleFilterPanel = useCallback(() => {
    setIsFilterPanelOpen(prev => !prev);
  }, []);
  
  // Handler untuk menerapkan filter
  const handleApplyFilters = useCallback((newFilters) => {
    setFilters(newFilters);
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  }, [onFiltersChange]);
  
  // Handler untuk menghapus filter
  const handleRemoveFilter = useCallback((filterType, filterValue) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      switch (filterType) {
        case 'dateRange':
          newFilters.dateRange = 'all';
          newFilters.customDateStart = '';
          newFilters.customDateEnd = '';
          break;
        case 'severityLevels':
          newFilters.severityLevels = ['0', '1', '2', '3', '4'];
          break;
        case 'ageGroups':
          newFilters.ageGroups = ['0-10', '11-20', '21-30', '31-40', '41-50', '51-60', '61+'];
          break;
        case 'genders':
          newFilters.genders = ['Laki-laki', 'Perempuan'];
          break;
        case 'confidenceThreshold':
          newFilters.confidenceThreshold = 0;
          break;
        case 'sort':
          newFilters.sortBy = 'date';
          newFilters.sortOrder = 'desc';
          break;
        default:
          break;
      }
      
      if (onFiltersChange) {
        onFiltersChange(newFilters);
      }
      
      return newFilters;
    });
  }, [onFiltersChange]);
  
  // Handler untuk menghapus semua filter
  const handleClearAllFilters = useCallback(() => {
    const defaultFilters = {
      dateRange: 'all',
      customDateStart: '',
      customDateEnd: '',
      severityLevels: ['0', '1', '2', '3', '4'],
      ageGroups: ['0-10', '11-20', '21-30', '31-40', '41-50', '51-60', '61+'],
      genders: ['Laki-laki', 'Perempuan'],
      confidenceThreshold: 0,
      sortBy: 'date',
      sortOrder: 'desc'
    };
    
    setFilters(defaultFilters);
    
    if (onFiltersChange) {
      onFiltersChange(defaultFilters);
    }
  }, [onFiltersChange]);
  
  // Efek untuk menerapkan filter saat komponen dimount
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(filters);
    }
  }, []);

  return (
    <div className="chart-filters">
      {/* Button untuk membuka panel filter */}
      <div className="flex justify-end">
        <FilterButton 
          onClick={toggleFilterPanel} 
          activeFiltersCount={activeFiltersCount} 
        />
      </div>
      
      {/* Panel filter */}
      <FilterPanel 
        isOpen={isFilterPanelOpen} 
        onClose={() => setIsFilterPanelOpen(false)} 
        onApplyFilters={handleApplyFilters}
        initialFilters={filters}
      />
      
      {/* Tampilkan filter yang aktif */}
      <ActiveFilters 
        filters={filters} 
        onRemoveFilter={handleRemoveFilter} 
        onClearAllFilters={handleClearAllFilters} 
      />
    </div>
  );
};

export default ChartFilters;