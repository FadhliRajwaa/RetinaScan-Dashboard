import React, { useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

const AnimatedBackground = ({ 
  variant = 'default', 
  className = '',
  particleCount = 50,
  speed = 1,
  interactive = true 
}) => {
  const canvasRef = useRef(null);
  const { theme } = useTheme();
  
  // Variasi warna berdasarkan theme dan variant
  const getColors = () => {
    const variants = {
      default: [theme.primary, theme.secondary, theme.accent],
      primary: ['#4F46E5', '#818CF8', '#6366F1'],
      secondary: ['#0EA5E9', '#38BDF8', '#7DD3FC'],
      accent: ['#8B5CF6', '#A78BFA', '#C4B5FD'],
      success: ['#10B981', '#34D399', '#6EE7B7'],
      warning: ['#F59E0B', '#FBBF24', '#FCD34D'],
      danger: ['#EF4444', '#F87171', '#FCA5A5'],
      light: ['#E5E7EB', '#F3F4F6', '#F9FAFB'],
      dark: ['#1F2937', '#374151', '#4B5563'],
      gradient: ['#4F46E5', '#8B5CF6', '#EC4899']
    };
    
    return variants[variant] || variants.default;
  };
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    let mouseX = 0;
    let mouseY = 0;
    let isMouseOver = false;
    
    // Set canvas dimensions
    const setCanvasDimensions = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    
    // Handle window resize
    const handleResize = () => {
      setCanvasDimensions();
      initParticles();
    };
    
    // Handle mouse events for interactive effect
    const handleMouseMove = (e) => {
      if (!interactive) return;
      
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      isMouseOver = true;
    };
    
    const handleMouseLeave = () => {
      isMouseOver = false;
    };
    
    // Create particle class
    class Particle {
      constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 0.5 + Math.random() * 0.5;
        this.originalRadius = radius;
        this.targetRadius = radius;
        this.originalAlpha = this.alpha;
        this.targetAlpha = this.alpha;
      }
      
      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      
      update() {
        // Move particle
        this.x += this.velocity.x * speed;
        this.y += this.velocity.y * speed;
        
        // Animate radius and alpha to target values
        this.radius += (this.targetRadius - this.radius) * 0.1;
        this.alpha += (this.targetAlpha - this.alpha) * 0.1;
        
        // Check boundaries and wrap around
        if (this.x < -this.radius) this.x = canvas.width + this.radius;
        if (this.x > canvas.width + this.radius) this.x = -this.radius;
        if (this.y < -this.radius) this.y = canvas.height + this.radius;
        if (this.y > canvas.height + this.radius) this.y = -this.radius;
        
        // Interactive effect - react to mouse position
        if (interactive && isMouseOver) {
          const dx = this.x - mouseX;
          const dy = this.y - mouseY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxDistance = 150;
          
          if (distance < maxDistance) {
            // Calculate how close the particle is to the mouse (0 to 1)
            const proximity = 1 - distance / maxDistance;
            
            // Push particles away from mouse
            const angle = Math.atan2(dy, dx);
            const force = proximity * 2;
            
            this.x += Math.cos(angle) * force;
            this.y += Math.sin(angle) * force;
            
            // Make particles grow and become more opaque near mouse
            this.targetRadius = this.originalRadius * (1 + proximity);
            this.targetAlpha = Math.min(1, this.originalAlpha + proximity * 0.5);
          } else {
            // Reset to original values when far from mouse
            this.targetRadius = this.originalRadius;
            this.targetAlpha = this.originalAlpha;
          }
        } else {
          // Reset when mouse is not over canvas
          this.targetRadius = this.originalRadius;
          this.targetAlpha = this.originalAlpha;
        }
        
        this.draw();
      }
    }
    
    // Create connections between particles
    const drawConnections = () => {
      const connectionDistance = 100;
      const connectionOpacity = 0.15;
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < connectionDistance) {
            // Calculate opacity based on distance
            const opacity = connectionOpacity * (1 - distance / connectionDistance);
            
            // Draw line
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = variant === 'light' ? '#64748b' : '#e5e7eb';
            ctx.lineWidth = 0.5;
            ctx.stroke();
            ctx.restore();
          }
        }
      }
    };
    
    // Initialize particles
    const initParticles = () => {
      particles = [];
      const colors = getColors();
      
      for (let i = 0; i < particleCount; i++) {
        const radius = Math.random() * 3 + 1;
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Random velocity
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.5 + 0.1;
        const velocity = {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed
        };
        
        particles.push(new Particle(x, y, radius, color, velocity));
      }
    };
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      particles.forEach(particle => particle.update());
      
      // Draw connections between particles
      drawConnections();
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    // Initialize
    setCanvasDimensions();
    initParticles();
    animate();
    
    // Add event listeners
    window.addEventListener('resize', handleResize);
    if (interactive) {
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseleave', handleMouseLeave);
    }
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [variant, particleCount, speed, interactive, theme]);
  
  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ zIndex: 0 }}
    />
  );
};

export default AnimatedBackground; 