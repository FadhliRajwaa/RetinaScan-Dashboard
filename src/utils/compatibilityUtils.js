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
      medium: 'https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLEj6V1s.ttf',
      light: 'https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLDz8V1s.ttf',
      fallback: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        medium: 'Helvetica',
        light: 'Helvetica',
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
 * @param {Object} options - Opsi tambahan untuk konfigurasi
 * @returns {Object} Konfigurasi animasi yang dioptimalkan
 */
export const getOptimizedAnimationConfig = (options = {}) => {
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
  const isLowPowerMode = typeof window !== 'undefined' && window.navigator.hardwareConcurrency < 4;
  
  return {
    // Gunakan hardware acceleration untuk animasi
    transformTemplate: (props) => `translateZ(0) ${props}`,
    // Batasi jumlah animasi bersamaan pada perangkat dengan performa rendah
    maxAnimations: isMobile ? 5 : 20,
    // Kurangi kualitas animasi pada perangkat dengan performa rendah
    reducedQuality: isMobile || isLowPowerMode,
    // Nonaktifkan animasi jika pengguna memiliki preferensi reduced motion
    disabled: prefersReducedMotion() && options.respectReducedMotion !== false,
    // Opsi tambahan
    ...options,
  };
};

/**
 * Mendapatkan konfigurasi PDF yang dioptimalkan
 * @param {Object} options - Opsi tambahan untuk konfigurasi
 * @returns {Object} Konfigurasi PDF yang dioptimalkan
 */
export const getOptimizedPdfConfig = (options = {}) => {
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
  
  return {
    // Gunakan font yang sudah di-cache jika tersedia
    useCachedFonts: true,
    // Kompres gambar untuk mengurangi ukuran PDF
    compressImages: true,
    // Kualitas gambar (0-1), lebih rendah untuk perangkat mobile
    imageQuality: isMobile ? 0.7 : 0.85,
    // Opsi tambahan
    ...options,
  };
};

/**
 * Mendapatkan class responsif berdasarkan ukuran layar
 * @param {Object} options - Opsi untuk class responsif
 * @returns {string} Class CSS yang sesuai dengan ukuran layar
 */
export const getResponsiveClasses = (options = {}) => {
  const {
    base = '',
    sm = '',
    md = '',
    lg = '',
    xl = '',
    '2xl': xxl = '',
  } = options;
  
  return `${base} ${sm ? `sm:${sm}` : ''} ${md ? `md:${md}` : ''} ${lg ? `lg:${lg}` : ''} ${xl ? `xl:${xl}` : ''} ${xxl ? `2xl:${xxl}` : ''}`.trim();
};

/**
 * Mendapatkan style untuk print media
 * @returns {Object} Style untuk print media
 */
export const getPrintStyles = () => {
  return {
    '@media print': {
      '@page': {
        size: 'A4',
        margin: '2cm',
      },
      'body': {
        margin: 0,
        padding: 0,
        backgroundColor: '#ffffff',
      },
      '.no-print': {
        display: 'none !important',
      },
      '.print-only': {
        display: 'block !important',
      },
      // Pastikan gambar tidak terpotong
      'img': {
        maxWidth: '100%',
        pageBreakInside: 'avoid',
      },
      // Hindari pemisahan elemen penting
      'h1, h2, h3, h4, h5, h6, img, table': {
        pageBreakInside: 'avoid',
        pageBreakAfter: 'avoid',
      },
      // Tambahkan URL setelah link
      'a[href^="http"]:after': {
        content: '(" " attr(href) "")' ,
        fontSize: '0.8em',
        fontWeight: 'normal',
      },
    },
  };
};

/**
 * Mendapatkan style untuk tema gelap (dark mode)
 * @param {Object} lightStyles - Style untuk tema terang
 * @returns {Object} Style yang dimodifikasi untuk tema gelap
 */
export const getDarkModeStyles = (lightStyles) => {
  if (typeof window === 'undefined') return lightStyles;
  
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (!prefersDarkMode) return lightStyles;
  
  // Transformasi warna untuk dark mode
  const transformColor = (color) => {
    // Implementasi sederhana, bisa diganti dengan fungsi yang lebih kompleks
    if (color.includes('rgba(255, 255, 255,')) {
      return color.replace('rgba(255, 255, 255,', 'rgba(30, 30, 30,');
    }
    if (color === '#FFFFFF' || color === '#ffffff') {
      return '#121212';
    }
    if (color === '#F9FAFB') {
      return '#1F2937';
    }
    if (color === '#F3F4F6') {
      return '#374151';
    }
    return color;
  };
  
  // Ubah style untuk dark mode
  const darkStyles = { ...lightStyles };
  
  if (darkStyles.background) {
    darkStyles.background = transformColor(darkStyles.background);
  }
  
  if (darkStyles.backgroundColor) {
    darkStyles.backgroundColor = transformColor(darkStyles.backgroundColor);
  }
  
  if (darkStyles.color) {
    // Ubah warna teks menjadi lebih terang
    darkStyles.color = '#E5E7EB';
  }
  
  if (darkStyles.borderColor) {
    darkStyles.borderColor = '#4B5563';
  }
  
  return darkStyles;
}; 