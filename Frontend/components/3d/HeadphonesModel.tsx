'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface HeadphonesModelProps {
  className?: string;
}

export default function HeadphonesModel({ className = '' }: HeadphonesModelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [rotation, setRotation] = useState(0);
  
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
    
    // Rotate the headphones slowly
    const rotationInterval = setInterval(() => {
      setRotation(prev => (prev + 0.5) % 360);
    }, 50);
    
    handleVisibility();
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleVisibility);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleVisibility);
      clearInterval(rotationInterval);
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
          transform: `rotateX(${(mousePosition.y - 0.5) * 15}deg) rotateY(${(mousePosition.x - 0.5) * 15}deg)`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s ease-out'
        }}
      >
        {/* 3D Headphones Model */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: isVisible ? 1 : 0,
            scale: isVisible ? 1 : 0.8,
            rotateY: rotation
          }}
          transition={{ 
            opacity: { duration: 0.5 },
            scale: { duration: 0.5 }
          }}
          className="relative w-48 h-48 md:w-64 md:h-64"
          style={{
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Headband */}
          <div 
            className="absolute top-0 left-1/2 w-40 h-8 md:w-56 md:h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
            style={{
              transform: 'translateX(-50%) translateZ(20px) rotateX(5deg)',
              boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)'
            }}
          />
          
          {/* Left Ear Cup */}
          <div 
            className="absolute top-1/2 left-0 w-16 h-20 md:w-20 md:h-24 bg-gradient-to-br from-indigo-700 to-purple-800 rounded-full"
            style={{
              transform: 'translateY(-50%) translateZ(10px) rotateY(-10deg)',
              boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.5), 0 0 15px rgba(99, 102, 241, 0.5)'
            }}
          >
            <div 
              className="absolute inset-2 rounded-full bg-gray-900"
              style={{
                transform: 'translateZ(2px)',
                boxShadow: 'inset 0 0 5px rgba(255, 255, 255, 0.2)'
              }}
            />
          </div>
          
          {/* Right Ear Cup */}
          <div 
            className="absolute top-1/2 right-0 w-16 h-20 md:w-20 md:h-24 bg-gradient-to-br from-indigo-700 to-purple-800 rounded-full"
            style={{
              transform: 'translateY(-50%) translateZ(10px) rotateY(10deg)',
              boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.5), 0 0 15px rgba(99, 102, 241, 0.5)'
            }}
          >
            <div 
              className="absolute inset-2 rounded-full bg-gray-900"
              style={{
                transform: 'translateZ(2px)',
                boxShadow: 'inset 0 0 5px rgba(255, 255, 255, 0.2)'
              }}
            />
          </div>
          
          {/* Left Arm */}
          <div 
            className="absolute top-4 left-8 w-2 h-16 md:h-20 bg-gradient-to-b from-indigo-600 to-indigo-800 rounded-full"
            style={{
              transform: 'translateZ(15px) rotateX(-10deg)',
              boxShadow: '0 0 5px rgba(99, 102, 241, 0.5)'
            }}
          />
          
          {/* Right Arm */}
          <div 
            className="absolute top-4 right-8 w-2 h-16 md:h-20 bg-gradient-to-b from-indigo-600 to-indigo-800 rounded-full"
            style={{
              transform: 'translateZ(15px) rotateX(-10deg)',
              boxShadow: '0 0 5px rgba(99, 102, 241, 0.5)'
            }}
          />
          
          {/* Sound waves */}
          <motion.div
            className="absolute top-1/2 left-1/2 w-full h-full rounded-full border-2 border-indigo-500/30"
            animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.5, 0.1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{
              transform: 'translate(-50%, -50%) translateZ(-10px)',
            }}
          />
          
          <motion.div
            className="absolute top-1/2 left-1/2 w-full h-full rounded-full border-2 border-purple-500/30"
            animate={{ scale: [1.2, 1.7, 1.2], opacity: [0.1, 0.5, 0.1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            style={{
              transform: 'translate(-50%, -50%) translateZ(-15px)',
            }}
          />
        </motion.div>
        
        {/* Circular platform */}
        <div 
          className="absolute w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-r from-indigo-900/20 to-purple-900/20 -z-10"
          style={{
            transform: 'translateZ(-30px) rotateX(90deg)',
            boxShadow: 'inset 0 0 30px rgba(99, 102, 241, 0.3)'
          }}
        />
        
        {/* Glowing particles */}
        {Array.from({ length: 5 }).map((_, index) => (
          <motion.div
            key={index}
            className="absolute w-2 h-2 rounded-full bg-indigo-500/70 blur-sm"
            initial={{ 
              x: Math.random() * 100 - 50,
              y: Math.random() * 100 - 50,
              z: Math.random() * 50 - 25,
              opacity: 0
            }}
            animate={{
              x: [null, Math.random() * 100 - 50],
              y: [null, Math.random() * 100 - 50],
              z: [null, Math.random() * 50 - 25],
              opacity: [0, 0.8, 0]
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.5
            }}
            style={{
              boxShadow: '0 0 10px rgba(99, 102, 241, 0.8)'
            }}
          />
        ))}
      </div>
    </div>
  );
}
