import { useCallback } from 'react';
import { Particles } from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import { useTheme } from '../../context/ThemeContext';

const ParticleBackground = ({ variant = 'default', className = '', particleDensity = 30 }) => {
  const { theme } = useTheme();
  
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  // Konfigurasi untuk variasi partikel
  const getParticlesConfig = () => {
    // Variasi warna sesuai dengan tema
    const colors = {
      default: {
        particles: [theme.primary, theme.accent, theme.secondary],
        links: theme.primary
      },
      primary: {
        particles: ['#4F46E5', '#818CF8', '#6366F1'],
        links: '#4F46E5'
      },
      accent: {
        particles: ['#8B5CF6', '#A78BFA', '#7C3AED'],
        links: '#8B5CF6'
      },
      light: {
        particles: ['#E5E7EB', '#F9FAFB', '#F3F4F6'],
        links: '#9CA3AF'
      },
      dark: {
        particles: ['#1F2937', '#374151', '#4B5563'],
        links: '#6B7280'
      }
    };
    
    // Pilih warna berdasarkan variant
    const colorSet = colors[variant] || colors.default;

    return {
      fpsLimit: 60,
      fullScreen: false,
      particles: {
        number: {
          value: particleDensity,
          density: {
            enable: true,
            value_area: 800
          }
        },
        color: {
          value: colorSet.particles
        },
        shape: {
          type: "circle"
        },
        opacity: {
          value: 0.5,
          random: true,
          anim: {
            enable: true,
            speed: 1,
            opacity_min: 0.1,
            sync: false
          }
        },
        size: {
          value: 3,
          random: true,
          anim: {
            enable: true,
            speed: 2,
            size_min: 0.1,
            sync: false
          }
        },
        move: {
          enable: true,
          speed: 1,
          direction: "none",
          random: true,
          straight: false,
          out_mode: "out",
          bounce: false,
        },
        line_linked: {
          enable: true,
          distance: 150,
          color: {
            value: colorSet.links
          },
          opacity: 0.2,
          width: 1
        }
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onHover: {
            enable: true,
            mode: "grab"
          },
          onClick: {
            enable: true,
            mode: "push"
          },
          resize: true
        },
        modes: {
          grab: {
            distance: 140,
            line_linked: {
              opacity: 0.5
            }
          },
          push: {
            particles_nb: 3
          }
        }
      },
      detectRetina: true
    };
  };

  return (
    <Particles
      id={`tsparticles-${variant}`}
      className={`absolute inset-0 -z-10 ${className}`}
      init={particlesInit}
      options={getParticlesConfig()}
    />
  );
};

export default ParticleBackground; 