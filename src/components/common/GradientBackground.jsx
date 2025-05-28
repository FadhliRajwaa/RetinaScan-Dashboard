import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const GradientBackground = ({ 
  variant = 'default', 
  className = '',
  intensity = 0.5,
  speed = 15,
  animated = true,
  blur = 60,
  opacity = 0.5
}) => {
  const { theme } = useTheme();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Get gradient colors based on variant
  const getGradientColors = () => {
    const variants = {
      default: [theme.primary, theme.accent],
      primary: ['#4F46E5', '#818CF8'],
      secondary: ['#0EA5E9', '#38BDF8'],
      accent: ['#8B5CF6', '#A78BFA'],
      success: ['#10B981', '#34D399'],
      warning: ['#F59E0B', '#FBBF24'],
      danger: ['#EF4444', '#F87171'],
      rainbow: ['#FF0080', '#7928CA', '#FF4D4D', '#0070F3'],
      sunset: ['#FF416C', '#FF4B2B'],
      ocean: ['#12C2E9', '#C471ED', '#F64F59'],
      purple: ['#8E2DE2', '#4A00E0'],
      golden: ['#F5AF19', '#F12711']
    };
    
    return variants[variant] || variants.default;
  };
  
  // Get gradient type based on variant
  const getGradientType = () => {
    const types = {
      rainbow: 'conic',
      ocean: 'conic',
      default: 'radial',
      primary: 'radial',
      secondary: 'radial',
      accent: 'radial'
    };
    
    return types[variant] || 'radial';
  };
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Only update if animated is true
      if (!animated) return;
      
      // Normalize mouse position to percentage of screen
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      
      setMousePosition({ x, y });
    };
    
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    // Initial dimensions
    handleResize();
    
    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [animated]);
  
  // Build gradient style
  const getGradientStyle = () => {
    const colors = getGradientColors();
    const gradientType = getGradientType();
    
    // For positioning the gradient based on mouse movement
    const x = animated ? `${mousePosition.x * 100}%` : '50%';
    const y = animated ? `${mousePosition.y * 100}%` : '50%';
    
    // Build different gradient types
    if (gradientType === 'conic') {
      return {
        background: `conic-gradient(from ${animated ? mousePosition.x * 360 : 0}deg at ${x} ${y}, ${colors.join(', ')})`,
        filter: `blur(${blur}px)`,
        opacity
      };
    } else if (gradientType === 'linear') {
      return {
        background: `linear-gradient(${animated ? mousePosition.x * 360 : 135}deg, ${colors.join(', ')})`,
        filter: `blur(${blur}px)`,
        opacity
      };
    } else {
      // Default radial gradient
      return {
        background: `radial-gradient(circle at ${x} ${y}, ${colors.join(', ')})`,
        filter: `blur(${blur}px)`,
        opacity
      };
    }
  };
  
  return (
    <motion.div
      className={`absolute inset-0 ${className}`}
      style={{
        ...getGradientStyle(),
        zIndex: 0
      }}
      animate={animated ? {
        background: getGradientStyle().background
      } : {}}
      transition={{ duration: speed, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
    />
  );
};

export default GradientBackground; 