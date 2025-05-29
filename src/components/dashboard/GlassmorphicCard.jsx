import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const GlassmorphicCard = ({ 
  children, 
  title, 
  icon,
  className = '', 
  headerClassName = '',
  bodyClassName = '',
  accentColor,
  hoverEffect = true,
  onClick = null
}) => {
  const { theme } = useTheme();
  
  // Generate gradient based on theme
  const generateGradient = () => {
    if (theme.isDark) {
      return `linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)`;
    }
    return `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)`;
  };
  
  // Border color based on theme
  const getBorderColor = () => {
    if (theme.isDark) {
      return 'rgba(255, 255, 255, 0.1)';
    }
    return 'rgba(0, 0, 0, 0.05)';
  };
  
  // Shadow based on theme
  const getShadow = () => {
    if (theme.isDark) {
      return '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)';
    }
    return '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
  };

  // Card style
  const cardStyle = {
    background: generateGradient(),
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderRadius: '16px',
    border: `1px solid ${getBorderColor()}`,
    boxShadow: getShadow(),
    color: theme.isDark ? theme.textColor : '#334155',
    overflow: 'hidden'
  };

  // Hover animation
  const hoverAnimation = hoverEffect ? {
    whileHover: { 
      y: -5,
      boxShadow: theme.isDark 
        ? '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)'
        : '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1)'
    },
    transition: { 
      type: 'spring', 
      stiffness: 300, 
      damping: 20 
    }
  } : {};
  
  // Header style with accent color
  const headerStyle = {
    borderBottom: `1px solid ${getBorderColor()}`,
    background: accentColor 
      ? `linear-gradient(90deg, ${accentColor}20 0%, transparent 100%)`
      : 'transparent'
  };
  
  // Accent line style
  const accentLineStyle = {
    width: '4px',
    height: '24px',
    background: accentColor || theme.primary,
    borderRadius: '2px',
    marginRight: '12px'
  };

  return (
    <motion.div
      className={`glassmorphic-card ${className}`}
      style={cardStyle}
      {...hoverAnimation}
      onClick={onClick}
    >
      {title && (
        <div 
          className={`flex items-center p-4 ${headerClassName}`}
          style={headerStyle}
        >
          <div style={accentLineStyle}></div>
          {icon && (
            <div className="mr-3 text-gray-500">
              {icon}
            </div>
          )}
          <h3 className="font-semibold text-lg">{title}</h3>
        </div>
      )}
      <div className={`p-4 ${bodyClassName}`}>
        {children}
      </div>
    </motion.div>
  );
};

export default GlassmorphicCard; 