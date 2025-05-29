import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const BackgroundDecorations = () => {
  const { theme } = useTheme();
  
  // Generate random circles
  const generateCircles = (count = 5) => {
    const circles = [];
    
    for (let i = 0; i < count; i++) {
      const size = Math.floor(Math.random() * 200) + 50; // 50px to 250px
      const x = Math.floor(Math.random() * 100); // 0% to 100%
      const y = Math.floor(Math.random() * 100); // 0% to 100%
      const delay = Math.random() * 2; // 0s to 2s
      const duration = Math.floor(Math.random() * 20) + 10; // 10s to 30s
      
      circles.push({
        id: `circle-${i}`,
        size,
        x,
        y,
        delay,
        duration,
        color: i % 3 === 0 ? theme.primary : i % 3 === 1 ? theme.secondary : theme.accent
      });
    }
    
    return circles;
  };
  
  const circles = generateCircles(7);
  
  // Clean up any previous styles
  useEffect(() => {
    return () => {
      document.querySelectorAll('.bg-decoration').forEach(el => el.remove());
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {circles.map((circle) => (
        <motion.div
          key={circle.id}
          className="absolute rounded-full bg-decoration"
          initial={{ 
            left: `${circle.x}%`, 
            top: `${circle.y}%`,
            opacity: 0.05
          }}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.08, 0.05]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: circle.duration,
            delay: circle.delay,
            ease: "easeInOut"
          }}
          style={{
            width: circle.size,
            height: circle.size,
            backgroundColor: circle.color,
            filter: 'blur(50px)'
          }}
        />
      ))}
      
      {/* Gradient overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: theme.isDark 
            ? 'radial-gradient(circle at 50% 50%, rgba(30, 41, 59, 0) 0%, rgba(30, 41, 59, 0.8) 100%)' 
            : 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%)',
          mixBlendMode: 'overlay'
        }}
      />
    </div>
  );
};

export default BackgroundDecorations; 