'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface WaveformSceneProps {
  className?: string;
}

export default function WaveformScene({ className = '' }: WaveformSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Number of bars in the waveform
  const barCount = 24; // Reduced number of bars

  // Generate random heights for the waveform bars
  const generateHeights = () => {
    return Array.from({ length: barCount }, () => Math.random() * 0.8 + 0.2);
  };

  const [barHeights, setBarHeights] = useState(generateHeights());

  // Update bar heights periodically to create animation
  useEffect(() => {
    // Set initial visibility
    setIsVisible(true);

    const interval = setInterval(() => {
      setBarHeights(generateHeights());
    }, 1500); // Slower animation

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-64 md:h-80 ${className}`}
    >
      <div className="absolute inset-0 flex items-center justify-center">
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
                duration: 0.8,
                delay: index * 0.02,
                ease: "easeOut"
              }}
              className="w-1.5 md:w-2.5 bg-gradient-to-t from-indigo-600 to-purple-500 rounded-t-full"
              style={{
                boxShadow: '0 0 8px rgba(99, 102, 241, 0.5)'
              }}
            />
          ))}
        </div>

        {/* Circular platform - simplified */}
        <div className="absolute w-64 h-64 md:w-96 md:h-96 rounded-full bg-gradient-to-r from-indigo-900/10 to-purple-900/10 -z-10" />

        {/* Static glowing orbs instead of animated ones */}
        <div className="absolute w-4 h-4 rounded-full bg-indigo-500/50 blur-sm"
             style={{ top: '30%', left: '30%' }} />

        <div className="absolute w-3 h-3 rounded-full bg-purple-500/50 blur-sm"
             style={{ bottom: '40%', right: '35%' }} />
      </div>
    </div>
  );
}
