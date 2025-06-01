// Tema bersama untuk frontend dan dashboard
export const globalTheme = {
  // Tema dasar yang digunakan oleh kedua mode
  primary: '#3B82F6', // Blue-600
  secondary: '#10B981', // Green-500
  accent: '#8B5CF6', // Violet-500
  
  // Mode terang (default)
  light: {
    primary: '#3B82F6', // Blue-600
    secondary: '#10B981', // Green-500
    accent: '#8B5CF6', // Violet-500
    accentAlt: '#EC4899', // Pink-500
    tertiary: '#F59E0B', // Amber-500
    quaternary: '#6366F1', // Indigo-500
    background: '#F9FAFB', // gray-50
    backgroundAlt: '#F3F4F6', // gray-100
    backgroundCard: '#FFFFFF', // white
    text: '#1F2937', // gray-800
    textSecondary: '#6B7280', // gray-500
    border: '#E5E7EB', // gray-200
    
    // Gradients
    primaryGradient: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
    accentGradient: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
    blueGradient: 'linear-gradient(135deg, #2563EB, #3B82F6)',
    purpleGradient: 'linear-gradient(135deg, #7C3AED, #8B5CF6)',
    successGradient: 'linear-gradient(135deg, #10B981, #34D399)', 
    warningGradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
    dangerGradient: 'linear-gradient(135deg, #EF4444, #F87171)',
    modernGradient: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
    
    // Modern gradients
    coolGradient: 'linear-gradient(135deg, #60A5FA, #6366F1, #8B5CF6)',
    sunsetGradient: 'linear-gradient(135deg, #F59E0B, #EC4899, #8B5CF6)',
    oceanGradient: 'linear-gradient(135deg, #0EA5E9, #10B981, #2DD4BF)',
    roseGradient: 'linear-gradient(135deg, #EC4899, #F43F5E, #FB7185)',
    
    // Shadows
    smallShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    mediumShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    largeShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    
    // Glass Effect
    glassEffect: {
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.18)',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    },
    
    // Neumorphism Effect
    neumorphismEffect: {
      boxShadow: '10px 10px 20px #d9dade, -10px -10px 20px #ffffff',
      background: '#f0f2f5',
      borderRadius: '16px',
    },
    
    // Component-specific colors
    card: {
      background: '#FFFFFF',
      border: '#E5E7EB',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      hoverShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
    button: {
      primary: '#3B82F6',
      primaryHover: '#2563EB',
      secondary: '#10B981',
      secondaryHover: '#059669',
      accent: '#8B5CF6',
      accentHover: '#7C3AED',
    },
  },
  
  // Mode gelap
  dark: {
    primary: '#3B82F6', // Blue-600 - tetap sama untuk konsistensi
    secondary: '#10B981', // Green-500 - tetap sama untuk konsistensi
    accent: '#8B5CF6', // Violet-500 - tetap sama untuk konsistensi
    accentAlt: '#EC4899', // Pink-500
    tertiary: '#F59E0B', // Amber-500
    quaternary: '#6366F1', // Indigo-500
    background: '#111827', // gray-900
    backgroundAlt: '#1F2937', // gray-800
    backgroundCard: '#374151', // gray-700
    text: '#F9FAFB', // gray-50
    textSecondary: '#D1D5DB', // gray-300
    border: '#4B5563', // gray-600
    
    // Gradients
    primaryGradient: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
    accentGradient: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
    blueGradient: 'linear-gradient(135deg, #2563EB, #3B82F6)',
    purpleGradient: 'linear-gradient(135deg, #7C3AED, #8B5CF6)',
    successGradient: 'linear-gradient(135deg, #10B981, #34D399)', 
    warningGradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
    dangerGradient: 'linear-gradient(135deg, #EF4444, #F87171)',
    modernGradient: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
    
    // Modern gradients
    coolGradient: 'linear-gradient(135deg, #60A5FA, #6366F1, #8B5CF6)',
    sunsetGradient: 'linear-gradient(135deg, #F59E0B, #EC4899, #8B5CF6)',
    oceanGradient: 'linear-gradient(135deg, #0EA5E9, #10B981, #2DD4BF)',
    roseGradient: 'linear-gradient(135deg, #EC4899, #F43F5E, #FB7185)',
    
    // Shadows
    smallShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
    mediumShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
    largeShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
    
    // Glass Effect
    glassEffect: {
      background: 'rgba(31, 41, 55, 0.7)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
    },
    
    // Neumorphism Effect (dark version)
    neumorphismEffect: {
      boxShadow: '10px 10px 20px #0d131f, -10px -10px 20px #151d2f',
      background: '#111827',
      borderRadius: '16px',
    },
    
    // Component-specific colors
    card: {
      background: '#374151', // gray-700
      border: '#4B5563', // gray-600
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
      hoverShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
    },
    button: {
      primary: '#3B82F6',
      primaryHover: '#60A5FA',
      secondary: '#10B981',
      secondaryHover: '#34D399',
      accent: '#8B5CF6',
      accentHover: '#A78BFA',
    },
  },
  
  // Border Radius
  borderRadiusSm: '0.375rem',
  borderRadiusMd: '0.5rem',
  borderRadiusLg: '0.75rem',
  borderRadiusXl: '1rem',
  borderRadius2xl: '1.5rem',
  borderRadiusFull: '9999px',
  
  // Animations
  transitionFast: 'all 0.2s ease',
  transitionNormal: 'all 0.3s ease', 
  transitionSlow: 'all 0.5s ease',
  
  // Dark Glass Effect
  darkGlassEffect: {
    background: 'rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  }
};

// Animations untuk Framer Motion yang bisa digunakan di kedua aplikasi
export const animations = {
  // Fade in dari bawah (untuk elemen individu)
  fadeInUp: {
    hidden: { y: 20, opacity: 0 },
    visible: (delay = 0) => ({
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 15,
        stiffness: 100,
        delay,
        duration: 0.5
      }
    })
  },
  
  // Fade in dari atas
  fadeInDown: {
    hidden: { y: -20, opacity: 0 },
    visible: (delay = 0) => ({
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 15,
        stiffness: 100,
        delay,
        duration: 0.5
      }
    })
  },
  
  // Fade in dari kiri
  fadeInLeft: {
    hidden: { x: -20, opacity: 0 },
    visible: (delay = 0) => ({
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 15,
        stiffness: 100,
        delay,
        duration: 0.5
      }
    })
  },
  
  // Fade in dari kanan
  fadeInRight: {
    hidden: { x: 20, opacity: 0 },
    visible: (delay = 0) => ({
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 15,
        stiffness: 100,
        delay,
        duration: 0.5
      }
    })
  },
  
  // Container untuk elemen staggered
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  },
  
  // Item untuk container staggered
  item: {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 15,
        stiffness: 100
      }
    }
  },
  
  // Card animations
  card: {
    initial: { scale: 0.97, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    hover: { scale: 1.02, y: -3, boxShadow: '0 10px 15px -5px rgba(0, 0, 0, 0.1)' },
    tap: { scale: 0.98 }
  },
  
  // Button animations
  button: {
    hover: { scale: 1.03, transition: { duration: 0.15 } },
    tap: { scale: 0.97, transition: { duration: 0.1 } }
  },
  
  // Page transition
  page: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 }
  },
  
  // Modal animations
  modal: {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      y: 20,
      transition: { duration: 0.2 }
    }
  },
  
  // Dropdown animations
  dropdown: {
    hidden: { opacity: 0, height: 0, overflow: 'hidden' },
    visible: { opacity: 1, height: 'auto', transition: { duration: 0.3 } },
    exit: { opacity: 0, height: 0, transition: { duration: 0.2 } }
  },
  
  // Toast notification animation
  toast: {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: 50, transition: { duration: 0.2 } }
  },
  
  // Smooth hover animation
  smoothHover: {
    scale: 1.02,
    y: -3,
    boxShadow: '0 10px 15px -5px rgba(0, 0, 0, 0.1)',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20
    }
  },
  
  // Smooth tap animation
  smoothTap: {
    scale: 0.98,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 30
    }
  },
  
  // Pulse animation
  pulse: {
    scale: [1, 1.03, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  
  // Bounce animation
  bounce: {
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut"
    }
  },
  
  // Rotate animation
  rotate: {
    rotate: [0, 360],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "linear"
    }
  },
  
  // Shimmer effect for loading states
  shimmer: {
    x: [-100, 100],
    background: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.3)', 'rgba(255,255,255,0)'],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}; 