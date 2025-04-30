'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ClientOnly } from '@/components/client-only';

interface WaveformSceneProps {
  className?: string;
}

// Separate animated component to ensure consistent hook usage
function AnimatedWaveform() {
  // Always declare hooks in the same order
  const [isVisible, setIsVisible] = useState(false);

  // Use useMemo to ensure consistent hook count
  const memoizedValue = useMemo(() => ({ value: 'consistent' }), []);

  // Number of bars in the waveform - memoized to prevent recalculation
  const barCount = useMemo(() => 32, []); // Increased for more detail

  // Generate realistic audio-like waveform pattern
  const generateHeights = useMemo(() => {
    return () => {
      // Create a more realistic audio pattern with peaks and valleys
      const basePattern = Array.from({ length: barCount }, (_, i) => {
        // Create a sine wave pattern as base
        const sineBase = Math.sin((i / barCount) * Math.PI * 4) * 0.3 + 0.5;
        // Add randomness for natural look
        const randomFactor = Math.random() * 0.4;
        // Combine with emphasis on middle frequencies (more realistic for music)
        const middleEmphasis = Math.sin((i / barCount) * Math.PI) * 0.2;

        return Math.max(0.1, Math.min(1, sineBase + randomFactor + middleEmphasis));
      });

      return basePattern;
    };
  }, [barCount]);

  // State for bar heights
  const [barHeights, setBarHeights] = useState(generateHeights());

  // Update bar heights periodically to create animation
  useEffect(() => {
    // Set initial visibility
    setIsVisible(true);

    // More natural animation timing
    const interval = setInterval(() => {
      setBarHeights(generateHeights());
    }, 800); // Faster animation for more realistic audio visualization

    return () => {
      clearInterval(interval);
      setIsVisible(false);
    };
  }, [generateHeights]);

  // Extra effect to ensure consistent hook count
  useEffect(() => {
    // Empty effect for consistency
  }, [memoizedValue]);

  return (
    <div className="flex items-end justify-center gap-[2px] md:gap-1 h-32 md:h-48 relative">
      {/* Reflection effect surface */}
      <div className="absolute bottom-0 w-full h-12 bg-gradient-to-t from-indigo-900/20 to-transparent rounded-full blur-sm"></div>

      {/* Audio bars */}
      {barHeights.map((height, index) => (
        <motion.div
          key={index}
          initial={{ height: '10%', opacity: 0 }}
          animate={{
            height: isVisible ? `${height * 100}%` : '10%',
            opacity: isVisible ? 1 : 0
          }}
          transition={{
            duration: 0.4,
            delay: index * 0.01, // Faster sequence for more realistic feel
            ease: "easeOut"
          }}
          className="w-1 md:w-2 bg-gradient-to-t from-indigo-600 via-purple-500 to-fuchsia-400 rounded-t-full relative"
          style={{
            boxShadow: '0 0 8px rgba(99, 102, 241, 0.5)'
          }}
        >
          {/* Glow effect at the top of each bar */}
          <div className="absolute -top-1 left-0 right-0 h-2 bg-white/30 rounded-full blur-sm"></div>
        </motion.div>
      ))}
    </div>
  );
}

// Static fallback component with no animations
function StaticWaveform() {
  // Create a static array of bars with varying heights that mimics a realistic audio pattern
  const staticBars = useMemo(() => {
    return Array.from({ length: 32 }, (_, i) => {
      // Create a sine wave pattern as base for more realistic appearance
      const sineBase = Math.sin((i / 32) * Math.PI * 4) * 0.3 + 0.5;
      // Add slight variation for natural look
      const variation = (i % 3) * 0.1;
      // Combine with emphasis on middle frequencies (more realistic for music)
      const middleEmphasis = Math.sin((i / 32) * Math.PI) * 0.2;

      return Math.max(0.1, Math.min(1, sineBase + variation + middleEmphasis));
    });
  }, []);

  return (
    <div className="flex items-end justify-center gap-[2px] md:gap-1 h-32 md:h-48 relative">
      {/* Reflection effect surface */}
      <div className="absolute bottom-0 w-full h-12 bg-gradient-to-t from-indigo-900/20 to-transparent rounded-full blur-sm"></div>

      {/* Static audio bars */}
      {staticBars.map((height, index) => (
        <div
          key={index}
          className="w-1 md:w-2 bg-gradient-to-t from-indigo-600 via-purple-500 to-fuchsia-400 rounded-t-full relative"
          style={{
            height: `${height * 100}%`,
            opacity: 0.7,
            boxShadow: '0 0 8px rgba(99, 102, 241, 0.5)'
          }}
        >
          {/* Glow effect at the top of each bar */}
          <div className="absolute -top-1 left-0 right-0 h-2 bg-white/30 rounded-full blur-sm"></div>
        </div>
      ))}
    </div>
  );
}

export default function WaveformScene({ className = '' }: WaveformSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-64 md:h-80 ${className}`}
    >
      {/* Enhanced background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/5 via-purple-900/5 to-fuchsia-900/5 rounded-xl" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-10 rounded-xl overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(99, 102, 241, 0.1) 1px, transparent 1px),
                           linear-gradient(to bottom, rgba(139, 92, 246, 0.1) 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center">
        {/* Use ClientOnly to safely render animations only on the client */}
        <ClientOnly fallback={<StaticWaveform />}>
          <AnimatedWaveform />
        </ClientOnly>

        {/* Enhanced circular platform with gradient and glow */}
        <div className="absolute w-64 h-64 md:w-96 md:h-96 rounded-full bg-gradient-to-r from-indigo-900/10 via-purple-900/10 to-fuchsia-900/10 -z-10">
          {/* Inner glow effect */}
          <div className="absolute inset-0 rounded-full bg-indigo-500/5 blur-2xl transform scale-75" />
        </div>

        {/* Animated glowing orbs */}
        <motion.div
          className="absolute w-4 h-4 rounded-full bg-indigo-500/50 blur-sm"
          style={{ top: '30%', left: '30%' }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <motion.div
          className="absolute w-3 h-3 rounded-full bg-purple-500/50 blur-sm"
          style={{ bottom: '40%', right: '35%' }}
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.3, 1]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />

        {/* Additional ambient particles */}
        <motion.div
          className="absolute w-2 h-2 rounded-full bg-fuchsia-500/40 blur-sm"
          style={{ top: '20%', right: '25%' }}
          animate={{
            opacity: [0.2, 0.4, 0.2],
            y: [0, -5, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />

        <motion.div
          className="absolute w-2 h-2 rounded-full bg-blue-500/40 blur-sm"
          style={{ bottom: '25%', left: '20%' }}
          animate={{
            opacity: [0.2, 0.4, 0.2],
            y: [0, 5, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
        />
      </div>
    </div>
  );
}
