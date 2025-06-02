/**
 * Utilitas untuk menangani kompatibilitas browser dan performa
 * untuk fitur-fitur modern yang digunakan dalam aplikasi RetinaScan
 */

/**
 * Memeriksa apakah browser mendukung backdrop-filter
 * @returns {boolean} true jika browser mendukung backdrop-filter
 */
export const supportsBackdropFilter = () => {
  if (typeof window === 'undefined') return false;
  
  // Periksa dukungan untuk backdrop-filter atau -webkit-backdrop-filter
  return (
    'backdropFilter' in document.documentElement.style ||
    '-webkit-backdrop-filter' in document.documentElement.style
  );
};

/**
 * Memeriksa apakah pengguna memiliki preferensi reduced motion
 * @returns {boolean} true jika pengguna memiliki preferensi reduced motion
 */
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Mendapatkan fallback style untuk glassmorphism jika backdrop-filter tidak didukung
 * @param {Object} originalStyle - Style glassmorphism asli
 * @returns {Object} Style yang dimodifikasi berdasarkan dukungan browser
 */
export const getGlassmorphismStyle = (originalStyle) => {
  if (!supportsBackdropFilter()) {
    // Fallback style jika backdrop-filter tidak didukung
    return {
      ...originalStyle,
      backdropFilter: undefined,
      WebkitBackdropFilter: undefined,
      background: 'rgba(255, 255, 255, 0.95)', // Lebih solid sebagai fallback
    };
  }
  return originalStyle;
};

/**
 * Mendapatkan animasi variants berdasarkan preferensi reduced motion
 * @param {Object} fullMotionVariants - Variants untuk animasi penuh
 * @param {Object} reducedMotionVariants - Variants untuk animasi terbatas
 * @returns {Object} Variants yang sesuai dengan preferensi pengguna
 */
export const getAccessibleAnimationVariants = (fullMotionVariants, reducedMotionVariants) => {
  return prefersReducedMotion() ? reducedMotionVariants : fullMotionVariants;
};

/**
 * Mendapatkan font fallback untuk PDF jika Google Fonts tidak tersedia
 * @returns {Object} Konfigurasi font dengan fallback
 */
export const getPdfFontConfig = () => {
  return {
    Poppins: {
      normal: 'https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrJJfecg.woff2',
      bold: 'https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLCz7Z1xlFQ.woff2',
      fallback: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
      }
    },
    Nunito: {
      normal: 'https://fonts.gstatic.com/s/nunito/v25/XRXV3I6Li01BKofINeaB.woff2',
      bold: 'https://fonts.gstatic.com/s/nunito/v25/XRXW3I6Li01BKofA6sKUYevI.woff2',
      fallback: {
        normal: 'Times-Roman',
        bold: 'Times-Bold',
      }
    }
  };
};

/**
 * Mendapatkan konfigurasi animasi yang dioptimalkan untuk performa
 * @returns {Object} Konfigurasi animasi yang dioptimalkan
 */
export const getOptimizedAnimationConfig = () => {
  return {
    // Gunakan hardware acceleration untuk animasi
    transformTemplate: (props) => `translateZ(0) ${props}`,
    // Batasi jumlah animasi bersamaan pada perangkat dengan performa rendah
    maxAnimations: window.matchMedia('(max-width: 768px)').matches ? 5 : 20,
    // Kurangi kualitas animasi pada perangkat dengan performa rendah
    reducedQuality: window.matchMedia('(max-width: 768px)').matches,
  };
};

/**
 * Mendapatkan konfigurasi PDF yang dioptimalkan
 * @returns {Object} Konfigurasi PDF yang dioptimalkan
 */
export const getOptimizedPdfConfig = () => {
  return {
    // Gunakan font yang sudah di-cache jika tersedia
    useCachedFonts: true,
    // Kompres gambar untuk mengurangi ukuran PDF
    compressImages: true,
    // Kualitas gambar (0-1)
    imageQuality: 0.8,
  };
}; 