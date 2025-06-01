// Tema bersama untuk frontend dan dashboard
export const globalTheme = {
  // Warna utama dengan palet yang lebih modern
  primary: '#4F46E5', // Indigo-600 (lebih modern dari blue-600)
  secondary: '#0EA5E9', // Sky-500 (lebih cerah dan modern)
  accent: '#8B5CF6', // Violet-500 (tetap dipertahankan)
  success: '#10B981', // Green-500
  warning: '#F59E0B', // Amber-500
  danger: '#EF4444', // Red-500
  info: '#06B6D4', // Cyan-500
  
  // Background colors
  background: '#F9FAFB', // gray-50
  backgroundAlt: '#F3F4F6', // gray-100
  backgroundDark: '#111827', // gray-900
  
  // Text colors
  text: '#1F2937', // gray-800
  textLight: '#6B7280', // gray-500
  textDark: '#111827', // gray-900
  textWhite: '#FFFFFF', // white
  
  // Gradients - lebih modern dengan blend yang lebih halus
  primaryGradient: 'linear-gradient(135deg, #4F46E5, #6366F1)',
  secondaryGradient: 'linear-gradient(135deg, #0EA5E9, #38BDF8)',
  accentGradient: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
  successGradient: 'linear-gradient(135deg, #10B981, #34D399)',
  warningGradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
  dangerGradient: 'linear-gradient(135deg, #EF4444, #F87171)',
  infoGradient: 'linear-gradient(135deg, #06B6D4, #22D3EE)',
  
  // Gradients dengan lebih banyak variasi
  coolGradient: 'linear-gradient(135deg, #4F46E5, #06B6D4)',
  warmGradient: 'linear-gradient(135deg, #F59E0B, #EF4444)',
  purpleBlueGradient: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
  sunsetGradient: 'linear-gradient(135deg, #F97316, #EC4899)',
  mintGradient: 'linear-gradient(135deg, #10B981, #06B6D4)',
  
  // Shadows dengan lebih banyak kedalaman
  smallShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  mediumShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  largeShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  hoverShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  
  // Border Radius
  borderRadiusSm: '0.375rem',
  borderRadiusMd: '0.5rem',
  borderRadiusLg: '0.75rem',
  borderRadiusXl: '1rem',
  borderRadius2xl: '1.5rem',
  borderRadiusFull: '9999px',
  
  // Animations
  transitionFast: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  transitionNormal: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
  transitionSlow: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  
  // Glass Effect - lebih modern dengan blur yang lebih besar
  glassEffect: {
    background: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
  },
  
  // Dark Glass Effect - lebih modern dengan blur yang lebih besar
  darkGlassEffect: {
    background: 'rgba(17, 24, 39, 0.7)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.25)'
  },
  
  // Glassmorphism variations
  lightGlass: {
    background: 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)'
  },
  coloredGlass: (color = 'rgba(79, 70, 229, 0.2)') => ({
    background: color,
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)'
  })
};

// Animations untuk Framer Motion yang bisa digunakan di kedua aplikasi
export const animations = {
  // Fade in dari bawah (untuk elemen individu) - dengan spring yang lebih smooth
  fadeInUp: {
    hidden: { y: 20, opacity: 0 },
    visible: (delay = 0) => ({
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 200,
        delay,
        duration: 0.4
      }
    })
  },
  
  // Fade in dari atas - dengan spring yang lebih smooth
  fadeInDown: {
    hidden: { y: -20, opacity: 0 },
    visible: (delay = 0) => ({
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 200,
        delay,
        duration: 0.4
      }
    })
  },
  
  // Fade in dari kiri - dengan spring yang lebih smooth
  fadeInLeft: {
    hidden: { x: -20, opacity: 0 },
    visible: (delay = 0) => ({
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 200,
        delay,
        duration: 0.4
      }
    })
  },
  
  // Fade in dari kanan - dengan spring yang lebih smooth
  fadeInRight: {
    hidden: { x: 20, opacity: 0 },
    visible: (delay = 0) => ({
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 200,
        delay,
        duration: 0.4
      }
    })
  },
  
  // Scale in dengan efek bounce yang halus
  scaleIn: {
    hidden: { scale: 0.9, opacity: 0 },
    visible: (delay = 0) => ({
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 200,
        delay,
        duration: 0.4
      }
    })
  },
  
  // Container untuk elemen staggered - dengan staggering yang lebih halus
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.1,
        type: 'spring'
      }
    }
  },
  
  // Item untuk container staggered - dengan spring yang lebih smooth
  item: {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 200
      }
    }
  },
  
  // Card animations - dengan hover yang lebih menarik
  card: {
    initial: { scale: 0.97, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 200 } },
    hover: { 
      scale: 1.02, 
      y: -5, 
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
      transition: { type: 'spring', damping: 25, stiffness: 200 }
    },
    tap: { scale: 0.98, transition: { type: 'spring', damping: 20, stiffness: 300 } }
  },
  
  // Button animations - dengan hover yang lebih menarik
  button: {
    hover: { 
      scale: 1.04, 
      y: -2,
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      transition: { type: 'spring', damping: 15, stiffness: 300 } 
    },
    tap: { 
      scale: 0.96, 
      transition: { type: 'spring', damping: 15, stiffness: 300 } 
    }
  },
  
  // Page transition - dengan fade yang lebih halus
  page: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } }
  },
  
  // Modal animations - dengan spring yang lebih smooth
  modal: {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: 'spring',
        damping: 30,
        stiffness: 400,
        duration: 0.3
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      y: 10,
      transition: { duration: 0.2, ease: 'easeIn' }
    }
  },
  
  // Dropdown animations - dengan height animation yang lebih smooth
  dropdown: {
    hidden: { opacity: 0, height: 0, overflow: 'hidden' },
    visible: { 
      opacity: 1, 
      height: 'auto', 
      transition: { 
        height: { type: 'spring', damping: 30, stiffness: 400, duration: 0.3 },
        opacity: { duration: 0.2, ease: 'easeOut' }
      } 
    },
    exit: { 
      opacity: 0, 
      height: 0, 
      transition: { 
        height: { type: 'spring', damping: 30, stiffness: 400, duration: 0.3 },
        opacity: { duration: 0.2, ease: 'easeIn' }
      } 
    }
  },
  
  // Toast notification animation - dengan slide yang lebih smooth
  toast: {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { 
        type: 'spring',
        damping: 25,
        stiffness: 200,
        duration: 0.3 
      } 
    },
    exit: { 
      opacity: 0, 
      x: 50, 
      transition: { 
        type: 'spring',
        damping: 25,
        stiffness: 200,
        duration: 0.2 
      } 
    }
  },
  
  // Hover scale efek untuk elemen interaktif
  hoverScale: {
    scale: 1.05,
    transition: { type: 'spring', damping: 15, stiffness: 300 }
  },
  
  // Hover lift efek untuk kartu
  hoverLift: {
    y: -5,
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
    transition: { type: 'spring', damping: 25, stiffness: 200 }
  },
  
  // Pulse animation untuk highlight
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 2,
      ease: 'easeInOut',
      times: [0, 0.5, 1],
      repeat: Infinity,
      repeatType: 'reverse'
    }
  }
}; 