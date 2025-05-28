import React, { useState, useEffect } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import CountUp from 'react-countup';

const StatCard = ({ icon: Icon, title, value, color, delay = 0, formatter = (val) => val, subtitle = null }) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(false);
  
  // Setup for 3D tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  const springConfig = { stiffness: 150, damping: 20 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);
  
  // Handle mouse movement on card for 3D effect
  const handleMouseMove = (e) => {
    // Get position of mouse relative to card
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Calculate distance from center of card in pixels
    const centerX = rect.left + width / 2;
    const centerY = rect.top + height / 2;
    
    // Get cursor position
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Update motion values
    x.set(mouseX);
    y.set(mouseY);
  };
  
  // Reset card position when mouse leaves
  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  useEffect(() => {
    setIsInView(true);
  }, []);
  
  return (
    <motion.div 
      className="relative overflow-hidden rounded-xl bg-white group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      style={{ 
        boxShadow: isHovered ? theme.mediumShadow : theme.smallShadow,
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformPerspective: 1200,
        transformStyle: "preserve-3d",
        borderLeft: `4px solid ${color}`,
        willChange: 'transform, box-shadow',
        transform: 'translateZ(0)'
      }}
    >
      {/* Highlight effect */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ 
          background: `linear-gradient(135deg, ${color}05, ${color}15)`,
        }}
      />
      
      {/* Content */}
      <div className="p-5 relative z-10 flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <div 
            className="rounded-lg p-2 inline-flex" 
            style={{ 
              backgroundColor: `${color}20`,
              color: color
            }}
          >
            <Icon className="w-5 h-5" />
          </div>
          <motion.div 
            className="text-xs font-medium py-1 px-2 rounded-full"
            animate={{ 
              backgroundColor: isHovered ? `${color}20` : 'transparent',
              color: isHovered ? color : '#64748b'
            }}
          >
            24h
          </motion.div>
        </div>
        
        <h3 className="text-sm text-gray-500 mb-1">{title}</h3>
        
        <div className="text-2xl font-bold text-gray-800 mb-1">
          {isInView ? (
            <CountUp 
              end={value} 
              duration={2}
              separator="."
              decimals={0}
              formattingFn={formatter}
            />
          ) : (
            formatter(0)
          )}
        </div>
        
        {subtitle && (
          <div className="text-xs text-gray-500">{subtitle}</div>
        )}
        
        {/* Sparkline chart placeholder (bisa ditambahkan chart sesungguhnya nanti) */}
        <div className="h-10 mt-2">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 20">
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: delay + 0.5 }}
              d="M0,10 Q20,5 30,15 T60,5 T100,10"
              fill="none"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="0 1"
            />
          </svg>
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard; 