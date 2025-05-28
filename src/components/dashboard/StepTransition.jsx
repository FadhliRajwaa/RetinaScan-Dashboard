import { motion } from 'framer-motion';
import { FiUploadCloud, FiActivity, FiFileText, FiArrowRight } from 'react-icons/fi';

/**
 * Komponen yang menampilkan animasi transisi antar langkah proses
 * @param {Object} props - Properties komponen
 * @param {number} props.fromStep - Langkah asal (1, 2, atau 3)
 * @param {number} props.toStep - Langkah tujuan (1, 2, atau 3)
 * @param {boolean} props.isVisible - Status visibilitas animasi
 * @param {Function} props.onAnimationComplete - Callback setelah animasi selesai
 */
function StepTransition({ fromStep, toStep, isVisible, onAnimationComplete }) {
  // Mendefinisikan ikon dan warna untuk setiap langkah
  const stepConfig = {
    1: {
      icon: <FiUploadCloud className="w-6 h-6" />,
      text: 'Unggah Citra',
      color: '#3B82F6', // Blue
      bgColor: 'rgba(59, 130, 246, 0.1)',
    },
    2: {
      icon: <FiActivity className="w-6 h-6" />,
      text: 'Analisis AI',
      color: '#4F46E5', // Indigo
      bgColor: 'rgba(79, 70, 229, 0.1)',
    },
    3: {
      icon: <FiFileText className="w-6 h-6" />,
      text: 'Hasil Analisis',
      color: '#10B981', // Green
      bgColor: 'rgba(16, 185, 129, 0.1)',
    }
  };

  // Animasi untuk container
  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.1,
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3,
        when: "afterChildren",
      }
    }
  };

  // Animasi untuk step icon
  const iconVariants = {
    hidden: (custom) => ({
      x: custom === 'from' ? -50 : 50,
      opacity: 0,
      scale: 0.8,
    }),
    visible: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }
    },
    exit: (custom) => ({
      x: custom === 'from' ? -50 : 50,
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.2,
      }
    })
  };

  // Animasi untuk arrow
  const arrowVariants = {
    hidden: {
      opacity: 0,
      pathLength: 0,
    },
    visible: {
      opacity: 1,
      pathLength: 1,
      transition: {
        duration: 0.5,
        ease: "easeInOut",
      }
    },
    exit: {
      opacity: 0,
      pathLength: 0,
      transition: {
        duration: 0.2,
      }
    }
  };

  // Animasi untuk particles
  const particleVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: (custom) => ({
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      x: custom.x,
      y: custom.y,
      transition: {
        duration: custom.duration,
        delay: custom.delay,
        repeat: custom.repeat ? Infinity : 0,
        repeatDelay: custom.repeatDelay || 0,
      }
    })
  };

  // Membuat array particle untuk efek visual
  const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    custom: {
      x: (Math.random() - 0.5) * 100,
      y: (Math.random() - 0.5) * 100,
      duration: 0.8 + Math.random() * 0.7,
      delay: Math.random() * 0.5,
      repeat: i % 3 === 0, // Beberapa particle akan berulang
      repeatDelay: 1 + Math.random() * 2
    }
  }));

  return (
    <motion.div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm ${isVisible ? 'pointer-events-auto' : 'pointer-events-none'}`}
      variants={containerVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      exit="exit"
      onAnimationComplete={() => {
        if (!isVisible && onAnimationComplete) {
          onAnimationComplete();
        }
      }}
    >
      <motion.div 
        className="bg-white bg-opacity-90 rounded-2xl p-8 shadow-2xl flex flex-col items-center justify-center max-w-md w-full"
        style={{
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ 
          scale: isVisible ? 1 : 0.9, 
          opacity: isVisible ? 1 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 25,
        }}
      >
        <div className="flex items-center justify-center w-full mb-6 relative">
          {/* From Step */}
          <motion.div
            className="flex flex-col items-center"
            variants={iconVariants}
            custom="from"
          >
            <motion.div 
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ 
                background: stepConfig[fromStep].bgColor,
                color: stepConfig[fromStep].color,
                boxShadow: `0 0 0 2px ${stepConfig[fromStep].color}40`
              }}
              whileHover={{ scale: 1.05 }}
            >
              {stepConfig[fromStep].icon}
            </motion.div>
            <motion.p 
              className="mt-2 text-sm font-medium"
              style={{ color: stepConfig[fromStep].color }}
            >
              {stepConfig[fromStep].text}
            </motion.p>
          </motion.div>

          {/* Arrow */}
          <motion.div 
            className="mx-6 text-gray-400"
            initial={{ opacity: 0, x: -10 }}
            animate={{ 
              opacity: isVisible ? 1 : 0, 
              x: isVisible ? 0 : -10,
              transition: {
                delay: 0.2,
              }
            }}
          >
            <FiArrowRight className="w-6 h-6" />
            <motion.div
              className="h-0.5 w-12 bg-gradient-to-r from-transparent via-gray-300 to-transparent mt-1"
              initial={{ scaleX: 0 }}
              animate={{ 
                scaleX: isVisible ? 1 : 0,
                transition: {
                  delay: 0.3,
                  duration: 0.5,
                }
              }}
            />
          </motion.div>

          {/* To Step */}
          <motion.div
            className="flex flex-col items-center"
            variants={iconVariants}
            custom="to"
          >
            <motion.div 
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ 
                background: stepConfig[toStep].bgColor,
                color: stepConfig[toStep].color,
                boxShadow: `0 0 0 2px ${stepConfig[toStep].color}40`
              }}
              whileHover={{ scale: 1.05 }}
              animate={{
                boxShadow: isVisible 
                  ? [
                      `0 0 0 2px ${stepConfig[toStep].color}40`,
                      `0 0 0 4px ${stepConfig[toStep].color}30`,
                      `0 0 0 2px ${stepConfig[toStep].color}40`
                    ]
                  : `0 0 0 2px ${stepConfig[toStep].color}40`,
              }}
              transition={{
                boxShadow: {
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse"
                }
              }}
            >
              {stepConfig[toStep].icon}
            </motion.div>
            <motion.p 
              className="mt-2 text-sm font-medium"
              style={{ color: stepConfig[toStep].color }}
            >
              {stepConfig[toStep].text}
            </motion.p>
          </motion.div>

          {/* Particles */}
          {isVisible && particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-2 h-2 rounded-full"
              style={{ 
                background: `radial-gradient(circle, ${stepConfig[toStep].color} 0%, transparent 70%)`,
                top: '50%',
                left: '50%',
              }}
              variants={particleVariants}
              initial="hidden"
              animate="visible"
              custom={particle.custom}
            />
          ))}
        </div>

        <motion.div 
          className="text-center text-gray-600 text-sm"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: isVisible ? 1 : 0,
            transition: { delay: 0.4 }
          }}
        >
          {toStep === 2 ? (
            <p>Memproses gambar untuk analisis AI...</p>
          ) : toStep === 3 ? (
            <p>Menyiapkan hasil analisis...</p>
          ) : (
            <p>Kembali ke unggah gambar...</p>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default StepTransition; 