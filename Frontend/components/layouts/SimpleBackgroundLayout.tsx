'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface BackgroundLayoutProps {
  children: ReactNode;
}

export default function SimpleBackgroundLayout({ children }: BackgroundLayoutProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Set initial window size
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    });

    // Track mouse position for parallax effect
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      });
    };

    // Update window size on resize
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Calculate parallax values based on mouse position
  const calcParallaxX = (depth = 1) => {
    const x = (mousePosition.x - windowSize.width / 2) / depth;
    return x * 0.01; // Adjust sensitivity
  };

  const calcParallaxY = (depth = 1) => {
    const y = (mousePosition.y - windowSize.height / 2) / depth;
    return y * 0.01; // Adjust sensitivity
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-indigo-950 text-white relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-gray-900/40 to-black">
        {/* Add noise texture for visual interest */}
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-soft-light"></div>

        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-indigo-500/10"
              style={{
                width: Math.random() * 200 + 50,
                height: Math.random() * 200 + 50,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                filter: 'blur(40px)',
              }}
              animate={{
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
              }}
              transition={{
                duration: Math.random() * 20 + 10,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Parallax floating elements */}
        <motion.div
          className="absolute w-64 h-64 rounded-full bg-purple-600/5 filter blur-3xl"
          style={{
            top: '20%',
            left: '10%',
          }}
          animate={{
            x: calcParallaxX(10),
            y: calcParallaxY(10),
          }}
        />

        <motion.div
          className="absolute w-96 h-96 rounded-full bg-indigo-600/5 filter blur-3xl"
          style={{
            bottom: '10%',
            right: '15%',
          }}
          animate={{
            x: calcParallaxX(15),
            y: calcParallaxY(15),
          }}
        />

        <motion.div
          className="absolute w-72 h-72 rounded-full bg-blue-600/5 filter blur-3xl"
          style={{
            top: '40%',
            right: '25%',
          }}
          animate={{
            x: calcParallaxX(20),
            y: calcParallaxY(20),
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
