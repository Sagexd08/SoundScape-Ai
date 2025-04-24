'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface WaveformSceneProps {
  className?: string;
}

export default function WaveformScene({ className = '' }: WaveformSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isVisible, setIsVisible] = useState(false);
  
  // Number of bars in the waveform
  const barCount = 32;
  
  // Generate random heights for the waveform bars
  const generateHeights = () => {
    return Array.from({ length: barCount }, () => Math.random() * 0.8 + 0.2);
  };
  
  const [barHeights, setBarHeights] = useState(generateHeights());
  
  // Update bar heights periodically to create animation
  useEffect(() => {
    const interval = setInterval(() => {
      setBarHeights(generateHeights());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Track mouse position for parallax effect
  useEffect(() => {
    if (!containerRef.current) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      setMousePosition({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height
      });
    };
    
    const updateDimensions = () => {
      if (!containerRef.current) return;
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight
      });
    };
    
    const handleVisibility = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const isInViewport = 
        rect.top >= -rect.height &&
        rect.left >= -rect.width &&
        rect.bottom <= window.innerHeight + rect.height &&
        rect.right <= window.innerWidth + rect.width;
      
      setIsVisible(isInViewport);
    };
    
    updateDimensions();
    handleVisibility();
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', updateDimensions);
    window.addEventListener('scroll', handleVisibility);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('scroll', handleVisibility);
    };
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-64 md:h-96 perspective-1000 ${className}`}
    >
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: `rotateX(${(mousePosition.y - 0.5) * 10}deg) rotateY(${(mousePosition.x - 0.5) * 10}deg)`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s ease-out'
        }}
      >
        {/* 3D Waveform */}
        <div className="flex items-end justify-center gap-1 md:gap-2 h-32 md:h-48">
          {barHeights.map((height, index) => (
            <motion.div
              key={index}
              initial={{ height: '10%', opacity: 0 }}
              animate={{ 
                height: isVisible ? `${height * 100}%` : '10%',
                opacity: isVisible ? 1 : 0
              }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.03,
                ease: "easeOut"
              }}
              className="w-1 md:w-2 bg-gradient-to-t from-indigo-600 to-purple-500 rounded-t-full"
              style={{
                transformStyle: 'preserve-3d',
                transform: `translateZ(${index % 2 === 0 ? 20 : 0}px)`,
                boxShadow: '0 0 10px rgba(99, 102, 241, 0.5)'
              }}
            />
          ))}
        </div>
        
        {/* Circular platform */}
        <div 
          className="absolute w-64 h-64 md:w-96 md:h-96 rounded-full bg-gradient-to-r from-indigo-900/20 to-purple-900/20 -z-10"
          style={{
            transform: 'translateZ(-50px) rotateX(90deg)',
            boxShadow: 'inset 0 0 50px rgba(99, 102, 241, 0.3)'
          }}
        />
        
        {/* Glowing orbs */}
        <motion.div
          className="absolute w-4 h-4 rounded-full bg-indigo-500 blur-sm"
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -30, 40, 0],
            z: [0, 30, -20, 0],
            opacity: [0.7, 0.9, 0.7, 0.7]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            transform: 'translateZ(30px)',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.8)'
          }}
        />
        
        <motion.div
          className="absolute w-3 h-3 rounded-full bg-purple-500 blur-sm"
          animate={{
            x: [0, -40, 20, 0],
            y: [0, 20, -40, 0],
            z: [0, -20, 40, 0],
            opacity: [0.7, 0.9, 0.7, 0.7]
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            transform: 'translateZ(20px)',
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.8)'
          }}
        />
      </div>
    </div>
  );
}
