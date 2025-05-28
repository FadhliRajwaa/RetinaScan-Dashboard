// Tema bersama untuk frontend dan dashboard
export const globalTheme = {
  primary: '#4F46E5', // Indigo-600 (Lebih modern)
  secondary: '#0EA5E9', // Sky-500
  accent: '#8B5CF6', // Violet-500
  success: '#10B981', // Green-500
  warning: '#F59E0B', // Amber-500
  danger: '#EF4444', // Red-500
  info: '#06B6D4', // Cyan-500
  background: '#F9FAFB', // gray-50
  darkBackground: '#1E293B', // slate-800
  text: '#1F2937', // gray-800
  lightText: '#F3F4F6', // gray-100
  
  // Gradients - Lebih banyak variasi dan lebih hidup
  primaryGradient: 'linear-gradient(135deg, #4F46E5, #818CF8)',
  secondaryGradient: 'linear-gradient(135deg, #0EA5E9, #38BDF8)',
  accentGradient: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
  blueGradient: 'linear-gradient(135deg, #2563EB, #60A5FA)',
  purpleGradient: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
  successGradient: 'linear-gradient(135deg, #10B981, #34D399)', 
  warningGradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
  dangerGradient: 'linear-gradient(135deg, #EF4444, #F87171)',
  coolGradient: 'linear-gradient(135deg, #06B6D4, #67E8F9)',
  warmGradient: 'linear-gradient(135deg, #F97316, #FB923C)',
  darkGradient: 'linear-gradient(135deg, #1E293B, #334155)',
  lightGradient: 'linear-gradient(135deg, #F9FAFB, #F3F4F6)',
  
  // Shadows - Lebih halus dan modern
  smallShadow: '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
  mediumShadow: '0 8px 16px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.04)',
  largeShadow: '0 16px 24px rgba(0, 0, 0, 0.08), 0 6px 12px rgba(0, 0, 0, 0.04)',
  glow: '0 0 15px rgba(79, 70, 229, 0.5)',
  neonGlow: '0 0 20px rgba(139, 92, 246, 0.6), 0 0 40px rgba(139, 92, 246, 0.3)',
  softGlow: '0 0 30px rgba(255, 255, 255, 0.6)',
  
  // Border Radius - Lebih konsisten dengan design system
  borderRadiusSm: '0.375rem',
  borderRadiusMd: '0.5rem',
  borderRadiusLg: '0.75rem',
  borderRadiusXl: '1rem',
  borderRadius2xl: '1.5rem',
  borderRadius3xl: '2rem',
  borderRadiusFull: '9999px',
  
  // Animations - Lebih responsif
  transitionFast: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
  transitionNormal: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
  transitionSlow: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  transitionBounce: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
  transitionEaseOut: 'all 0.3s cubic-bezier(0, 0, 0.2, 1)',
  
  // Glass Effect - Modern dan halus
  glassEffect: {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(12px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
  },
  
  // Dark Glass Effect - Lebih sophisticated
  darkGlassEffect: {
    background: 'rgba(30, 41, 59, 0.7)',
    backdropFilter: 'blur(12px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  },
  
  // Colored Glass Effects
  primaryGlassEffect: {
    background: 'rgba(79, 70, 229, 0.1)',
    backdropFilter: 'blur(12px) saturate(180%)',
    border: '1px solid rgba(79, 70, 229, 0.2)',
    boxShadow: '0 4px 6px rgba(79, 70, 229, 0.05)'
  },
  accentGlassEffect: {
    background: 'rgba(139, 92, 246, 0.1)',
    backdropFilter: 'blur(12px) saturate(180%)',
    border: '1px solid rgba(139, 92, 246, 0.2)',
    boxShadow: '0 4px 6px rgba(139, 92, 246, 0.05)'
  },
  
  // Card Styles
  cardStyle: {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(8px) saturate(180%)',
    borderRadius: '1rem',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  
  // Button Styles
  buttonStyle: {
    background: 'linear-gradient(135deg, #4F46E5, #818CF8)',
    borderRadius: '0.5rem',
    color: '#ffffff',
    boxShadow: '0 4px 6px rgba(79, 70, 229, 0.3)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'translateY(0)',
    hover: {
      boxShadow: '0 6px 10px rgba(79, 70, 229, 0.4)',
      transform: 'translateY(-2px)'
    },
    active: {
      boxShadow: '0 2px 4px rgba(79, 70, 229, 0.3)',
      transform: 'translateY(1px)'
    }
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
  
  // Card animations - Lebih dinamis
  card: {
    initial: { scale: 0.96, opacity: 0, y: 10 },
    animate: { scale: 1, opacity: 1, y: 0 },
    hover: { scale: 1.03, y: -5, boxShadow: '0 15px 25px -5px rgba(0, 0, 0, 0.1)' },
    tap: { scale: 0.98 }
  },
  
  // Button animations - Lebih responsif
  button: {
    hover: { scale: 1.05, y: -2, transition: { duration: 0.2 } },
    tap: { scale: 0.95, y: 1, transition: { duration: 0.1 } }
  },
  
  // Page transition - Lebih halus
  page: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  },
  
  // Modal animations - Lebih dinamis
  modal: {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
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
      y: 10,
      transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
    }
  },
  
  // Dropdown animations - Lebih halus
  dropdown: {
    hidden: { opacity: 0, height: 0, scale: 0.95, transformOrigin: 'top', overflow: 'hidden' },
    visible: { 
      opacity: 1, 
      height: 'auto', 
      scale: 1,
      transition: { 
        height: { duration: 0.3 }, 
        opacity: { duration: 0.2, delay: 0.1 },
        scale: { duration: 0.2, delay: 0.05 }
      } 
    },
    exit: { 
      opacity: 0, 
      height: 0, 
      scale: 0.95,
      transition: { 
        height: { duration: 0.2 }, 
        opacity: { duration: 0.1 },
        scale: { duration: 0.2 }
      } 
    }
  },
  
  // Toast notification animation - Lebih smooth
  toast: {
    hidden: { opacity: 0, x: 50, scale: 0.9 },
    visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
    exit: { opacity: 0, x: 50, scale: 0.9, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } }
  },
  
  // Floating animation - Untuk elemen yang melayang
  float: {
    initial: { y: 0 },
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut'
      }
    }
  },
  
  // Pulse animation - Untuk highlight
  pulse: {
    initial: { scale: 1, opacity: 1 },
    animate: {
      scale: [1, 1.05, 1],
      opacity: [1, 0.8, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  },
  
  // Bounce animation
  bounce: {
    initial: { y: 0 },
    animate: {
      y: [0, -15, 0],
      transition: {
        duration: 0.6,
        repeat: 1,
        repeatType: 'reverse',
        ease: [0.34, 1.56, 0.64, 1]
      }
    }
  },
  
  // Staggered reveal for lists
  staggerList: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.3
      }
    }
  },
  
  // Staggered list item
  staggerItem: {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 300
      }
    }
  }
}; 