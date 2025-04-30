'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Headphones } from 'lucide-react';
import { ClientOnly } from '@/components/client-only';

interface HeadphonesModelProps {
  className?: string;
}

// Separate the animated content into its own component
function AnimatedHeadphones() {
  // Always declare the same hooks in the same order
  const [isVisible, setIsVisible] = useState(false);
  const [pulseState, setPulseState] = useState(0);

  // Use useMemo to ensure consistent hook count
  const memoizedValue = useMemo(() => ({ value: 'consistent' }), []);

  // Set visibility after mount
  useEffect(() => {
    setIsVisible(true);

    // Pulse animation for beat effect
    const pulseInterval = setInterval(() => {
      setPulseState(prev => (prev + 1) % 3);
    }, 1200);

    // Consistent cleanup
    return () => {
      clearInterval(pulseInterval);
      setIsVisible(false);
    };
  }, []);

  // Extra effect to ensure consistent hook count
  useEffect(() => {
    // Empty effect for consistency
  }, [memoizedValue]);

  // Generate audio wave points for the circular waves
  const wavePoints = useMemo(() => {
    // Create points for a wavy circle
    const generateWavePoints = (radius: number, complexity: number) => {
      const points = [];
      const segments = 36;

      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const waveFactor = Math.sin(angle * complexity) * 0.1 + 0.9;
        const x = Math.cos(angle) * radius * waveFactor;
        const y = Math.sin(angle) * radius * waveFactor;
        points.push(`${x},${y}`);
      }

      return points.join(' ');
    };

    return {
      inner: generateWavePoints(50, 3),
      outer: generateWavePoints(60, 4)
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        scale: isVisible ? 1 : 0.8,
        y: [0, -10, 0]
      }}
      transition={{
        opacity: { duration: 0.5 },
        scale: { duration: 0.5 },
        y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
      }}
      className="relative"
    >
      {/* Enhanced Headphones Icon with Glow */}
      <div className="relative">
        {/* Pulsing background glow */}
        <motion.div
          className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl"
          animate={{
            scale: pulseState === 0 ? 1.2 : 1,
            opacity: pulseState === 0 ? 0.8 : 0.5
          }}
          transition={{ duration: 0.4 }}
        />

        {/* Secondary glow for depth */}
        <div className="absolute inset-0 rounded-full bg-purple-500/15 blur-2xl transform scale-125" />

        {/* Headphones with enhanced styling */}
        <div className="relative">
          <Headphones className="h-24 w-24 md:h-32 md:w-32 text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />

          {/* Highlight effect */}
          <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-white/10 rounded-full blur-md transform rotate-45" />
        </div>
      </div>

      {/* Enhanced Sound waves with wavy borders */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-full h-full"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.1, 0.3, 0.1],
          rotate: 360
        }}
        transition={{
          scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 20, repeat: Infinity, ease: "linear" }
        }}
        style={{
          transform: 'translate(-50%, -50%)',
        }}
      >
        <svg width="100%" height="100%" viewBox="-60 -60 120 120" xmlns="http://www.w3.org/2000/svg">
          <polygon
            points={wavePoints.inner}
            fill="none"
            stroke="rgba(99, 102, 241, 0.3)"
            strokeWidth="1.5"
          />
        </svg>
      </motion.div>

      <motion.div
        className="absolute top-1/2 left-1/2 w-[120%] h-[120%]"
        animate={{
          scale: [1.2, 1.7, 1.2],
          opacity: [0.1, 0.3, 0.1],
          rotate: -360
        }}
        transition={{
          scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 25, repeat: Infinity, ease: "linear" }
        }}
        style={{
          transform: 'translate(-50%, -50%)',
        }}
      >
        <svg width="100%" height="100%" viewBox="-60 -60 120 120" xmlns="http://www.w3.org/2000/svg">
          <polygon
            points={wavePoints.outer}
            fill="none"
            stroke="rgba(168, 85, 247, 0.25)"
            strokeWidth="1.5"
          />
        </svg>
      </motion.div>

      {/* Music beat indicators */}
      <motion.div
        className="absolute top-[15%] right-[15%] w-2 h-2 rounded-full bg-fuchsia-400"
        animate={{
          opacity: pulseState === 1 ? 1 : 0.3,
          scale: pulseState === 1 ? 1.5 : 1
        }}
        transition={{ duration: 0.2 }}
      />

      <motion.div
        className="absolute bottom-[15%] left-[15%] w-2 h-2 rounded-full bg-indigo-400"
        animate={{
          opacity: pulseState === 2 ? 1 : 0.3,
          scale: pulseState === 2 ? 1.5 : 1
        }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  );
}

// Static fallback component with no animations
function StaticHeadphones() {
  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl" />
        <Headphones className="h-24 w-24 md:h-32 md:w-32 text-indigo-400" />
      </div>
    </div>
  );
}

export default function HeadphonesModel({ className = '' }: HeadphonesModelProps) {
  return (
    <div className={`relative w-full h-64 md:h-80 ${className}`}>
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Use ClientOnly to safely render animations only on the client */}
        <ClientOnly fallback={<StaticHeadphones />}>
          <AnimatedHeadphones />
        </ClientOnly>

        {/* Static glowing orbs - these don't need animations */}
        <div className="absolute w-4 h-4 rounded-full bg-indigo-500/30 blur-md"
             style={{ top: '30%', left: '35%' }} />

        <div className="absolute w-3 h-3 rounded-full bg-purple-500/30 blur-md"
             style={{ bottom: '35%', right: '30%' }} />
      </div>
    </div>
  );
}
