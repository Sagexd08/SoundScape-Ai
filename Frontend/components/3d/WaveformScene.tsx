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
  const [rotationAngle, setRotationAngle] = useState(0);
  const [pulseState, setPulseState] = useState(0);

  // Use useMemo to ensure consistent hook count
  const memoizedValue = useMemo(() => ({ value: 'consistent' }), []);

  // Number of bars in the waveform - memoized to prevent recalculation
  const barCount = useMemo(() => 40, []); // Increased for more detail

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

  // Generate 3D floating particles
  const particles = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 2,
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
      z: Math.random() * 20 - 10,
      color: i % 3 === 0 ? 'indigo' : i % 3 === 1 ? 'purple' : 'fuchsia',
      animationDelay: i * 0.5,
      animationDuration: Math.random() * 8 + 8
    }));
  }, []);

  // State for bar heights
  const [barHeights, setBarHeights] = useState(generateHeights());

  // Update bar heights periodically to create animation
  useEffect(() => {
    // Set initial visibility
    setIsVisible(true);

    // More natural animation timing
    const interval = setInterval(() => {
      setBarHeights(generateHeights());
      setPulseState(prev => (prev + 1) % 3);
    }, 800); // Faster animation for more realistic audio visualization

    // Slow rotation for 3D effect
    const rotationInterval = setInterval(() => {
      setRotationAngle(prev => (prev + 1) % 360);
    }, 100);

    return () => {
      clearInterval(interval);
      clearInterval(rotationInterval);
      setIsVisible(false);
    };
  }, [generateHeights]);

  // Extra effect to ensure consistent hook count
  useEffect(() => {
    // Empty effect for consistency
  }, [memoizedValue]);

  return (
    <div className="flex items-center justify-center h-32 md:h-48 relative">
      {/* 3D perspective container */}
      <div
        className="relative w-full h-full flex items-end justify-center"
        style={{
          perspective: '1000px',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Circular platform with 3D effect */}
        <motion.div
          className="absolute bottom-0 w-64 h-4 rounded-full bg-gradient-to-r from-indigo-900/30 via-purple-900/30 to-fuchsia-900/30"
          style={{
            transform: `rotateX(60deg) rotateZ(${rotationAngle * 0.1}deg)`,
            transformStyle: 'preserve-3d',
            boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
          }}
          animate={{
            scale: pulseState === 0 ? [1, 1.05, 1] : 1
          }}
          transition={{ duration: 2 }}
        />

        {/* 3D floating particles */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className={`absolute rounded-full bg-${particle.color}-500/40 blur-sm`}
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              transform: `translate3d(${particle.x}px, ${particle.y}px, ${particle.z}px)`,
              transformStyle: 'preserve-3d'
            }}
            animate={{
              y: [particle.y, particle.y - 20, particle.y],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: particle.animationDuration,
              delay: particle.animationDelay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Reflection effect surface */}
        <div className="absolute bottom-0 w-full h-12 bg-gradient-to-t from-indigo-900/20 to-transparent rounded-full blur-sm"></div>

        {/* Audio bars container with 3D rotation */}
        <div
          className="flex items-end justify-center gap-[1px] xs:gap-[2px] md:gap-1 h-32 md:h-48 relative"
          style={{
            transform: `rotateX(5deg) rotateY(${Math.sin(rotationAngle * 0.01) * 5}deg)`,
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Audio bars */}
          {barHeights.map((height, index) => (
            <motion.div
              key={index}
              initial={{ height: '10%', opacity: 0 }}
              animate={{
                height: isVisible ? `${height * 100}%` : '10%',
                opacity: isVisible ? 1 : 0,
                // Add subtle side-to-side movement for more dynamic feel
                x: index % 3 === 0 ? [0, 1, 0, -1, 0] : index % 3 === 1 ? [0, -1, 0, 1, 0] : [0]
              }}
              transition={{
                height: { duration: 0.4, delay: index * 0.01 },
                opacity: { duration: 0.4, delay: index * 0.01 },
                x: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
              className={`w-[2px] xs:w-1 md:w-1.5 bg-gradient-to-t from-indigo-600 via-purple-500 to-fuchsia-400 rounded-t-full relative`}
              style={{
                boxShadow: '0 0 8px rgba(99, 102, 241, 0.5)',
                transformStyle: 'preserve-3d',
                transform: `translateZ(${index % 2 === 0 ? 5 : 0}px)`
              }}
            >
              {/* Glow effect at the top of each bar */}
              <div className="absolute -top-1 left-0 right-0 h-2 bg-white/30 rounded-full blur-sm"></div>

              {/* Pulse effect for some bars */}
              {index % 5 === 0 && (
                <motion.div
                  className="absolute -top-1 left-0 right-0 h-2 bg-fuchsia-400/50 rounded-full blur-md"
                  animate={{
                    opacity: pulseState === index % 3 ? [0.3, 1, 0.3] : 0.3
                  }}
                  transition={{ duration: 1 }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Static fallback component with no animations
function StaticWaveform() {
  // Create a static array of bars with varying heights that mimics a realistic audio pattern
  const staticBars = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => {
      // Create a sine wave pattern as base for more realistic appearance
      const sineBase = Math.sin((i / 40) * Math.PI * 4) * 0.3 + 0.5;
      // Add slight variation for natural look
      const variation = (i % 3) * 0.1;
      // Combine with emphasis on middle frequencies (more realistic for music)
      const middleEmphasis = Math.sin((i / 40) * Math.PI) * 0.2;

      return Math.max(0.1, Math.min(1, sineBase + variation + middleEmphasis));
    });
  }, []);

  // Generate static 3D floating particles
  const staticParticles = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 2,
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
      z: Math.random() * 20 - 10,
      color: i % 3 === 0 ? 'indigo' : i % 3 === 1 ? 'purple' : 'fuchsia',
      opacity: Math.random() * 0.3 + 0.2
    }));
  }, []);

  return (
    <div className="flex items-center justify-center h-32 md:h-48 relative">
      {/* 3D perspective container */}
      <div
        className="relative w-full h-full flex items-end justify-center"
        style={{
          perspective: '1000px',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Circular platform with 3D effect */}
        <div
          className="absolute bottom-0 w-64 h-4 rounded-full bg-gradient-to-r from-indigo-900/30 via-purple-900/30 to-fuchsia-900/30"
          style={{
            transform: 'rotateX(60deg)',
            transformStyle: 'preserve-3d',
            boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
          }}
        />

        {/* Static 3D floating particles */}
        {staticParticles.map((particle) => (
          <div
            key={particle.id}
            className={`absolute rounded-full bg-${particle.color}-500/40 blur-sm`}
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              transform: `translate3d(${particle.x}px, ${particle.y}px, ${particle.z}px)`,
              transformStyle: 'preserve-3d',
              opacity: particle.opacity
            }}
          />
        ))}

        {/* Reflection effect surface */}
        <div className="absolute bottom-0 w-full h-12 bg-gradient-to-t from-indigo-900/20 to-transparent rounded-full blur-sm"></div>

        {/* Audio bars container with 3D rotation */}
        <div
          className="flex items-end justify-center gap-[1px] xs:gap-[2px] md:gap-1 h-32 md:h-48 relative"
          style={{
            transform: 'rotateX(5deg)',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Static audio bars */}
          {staticBars.map((height, index) => (
            <div
              key={index}
              className={`w-[2px] xs:w-1 md:w-1.5 bg-gradient-to-t from-indigo-600 via-purple-500 to-fuchsia-400 rounded-t-full relative`}
              style={{
                height: `${height * 100}%`,
                opacity: 0.7,
                boxShadow: '0 0 8px rgba(99, 102, 241, 0.5)',
                transformStyle: 'preserve-3d',
                transform: `translateZ(${index % 2 === 0 ? 5 : 0}px)`
              }}
            >
              {/* Glow effect at the top of each bar */}
              <div className="absolute -top-1 left-0 right-0 h-2 bg-white/30 rounded-full blur-sm"></div>

              {/* Static pulse effect for some bars */}
              {index % 5 === 0 && (
                <div
                  className="absolute -top-1 left-0 right-0 h-2 bg-fuchsia-400/30 rounded-full blur-md"
                />
              )}
            </div>
          ))}
        </div>
      </div>
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
      {/* Enhanced 3D background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/5 via-purple-900/5 to-fuchsia-900/5 rounded-xl overflow-hidden">
        {/* Animated gradient overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 via-transparent to-purple-900/10"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            backgroundSize: '200% 200%'
          }}
        />
      </div>

      {/* Enhanced 3D grid pattern */}
      <div
        className="absolute inset-0 opacity-10 rounded-xl overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(99, 102, 241, 0.1) 1px, transparent 1px),
                           linear-gradient(to bottom, rgba(139, 92, 246, 0.1) 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
          perspective: '1000px',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Animated grid movement for 3D effect */}
        <motion.div
          className="absolute inset-0"
          animate={{
            rotateX: [0, 2, 0, -2, 0],
            rotateY: [0, -2, 0, 2, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            transformStyle: 'preserve-3d'
          }}
        />
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        {/* Use ClientOnly to safely render animations only on the client */}
        <ClientOnly fallback={<StaticWaveform />}>
          <AnimatedWaveform />
        </ClientOnly>

        {/* Enhanced 3D circular platform with gradient and glow */}
        <motion.div
          className="absolute w-64 h-64 md:w-96 md:h-96 rounded-full bg-gradient-to-r from-indigo-900/10 via-purple-900/10 to-fuchsia-900/10 -z-10"
          animate={{
            rotateZ: [0, 360]
          }}
          transition={{
            duration: 120,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Inner glow effect */}
          <motion.div
            className="absolute inset-0 rounded-full bg-indigo-500/5 blur-2xl transform scale-75"
            animate={{
              scale: [0.75, 0.8, 0.75],
              opacity: [0.5, 0.7, 0.5]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Additional orbital rings */}
          <motion.div
            className="absolute inset-0 rounded-full border border-indigo-500/10"
            style={{
              transform: 'scale(1.2) rotateX(70deg)',
              transformStyle: 'preserve-3d'
            }}
            animate={{
              rotateZ: [0, -360]
            }}
            transition={{
              duration: 60,
              repeat: Infinity,
              ease: "linear"
            }}
          />

          <motion.div
            className="absolute inset-0 rounded-full border border-purple-500/10"
            style={{
              transform: 'scale(1.4) rotateX(70deg)',
              transformStyle: 'preserve-3d'
            }}
            animate={{
              rotateZ: [0, 360]
            }}
            transition={{
              duration: 80,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </motion.div>

        {/* Enhanced animated glowing orbs */}
        <motion.div
          className="absolute w-4 h-4 rounded-full bg-indigo-500/50 blur-sm"
          style={{ top: '30%', left: '30%' }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.2, 1],
            x: [0, 10, 0, -10, 0],
            y: [0, -5, 0, 5, 0]
          }}
          transition={{
            opacity: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            x: { duration: 10, repeat: Infinity, ease: "easeInOut" },
            y: { duration: 8, repeat: Infinity, ease: "easeInOut" }
          }}
        />

        <motion.div
          className="absolute w-3 h-3 rounded-full bg-purple-500/50 blur-sm"
          style={{ bottom: '40%', right: '35%' }}
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.3, 1],
            x: [0, -8, 0, 8, 0],
            y: [0, 6, 0, -6, 0]
          }}
          transition={{
            opacity: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 },
            scale: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 },
            x: { duration: 12, repeat: Infinity, ease: "easeInOut" },
            y: { duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }
          }}
        />

        {/* Additional 3D ambient particles */}
        <motion.div
          className="absolute w-2 h-2 rounded-full bg-fuchsia-500/40 blur-sm"
          style={{
            top: '20%',
            right: '25%',
            transformStyle: 'preserve-3d',
            transform: 'translateZ(20px)'
          }}
          animate={{
            opacity: [0.2, 0.4, 0.2],
            y: [0, -5, 0],
            scale: [1, 1.2, 1],
            rotateZ: [0, 180, 360]
          }}
          transition={{
            opacity: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
            y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            rotateZ: { duration: 20, repeat: Infinity, ease: "linear" }
          }}
        />

        <motion.div
          className="absolute w-2 h-2 rounded-full bg-blue-500/40 blur-sm"
          style={{
            bottom: '25%',
            left: '20%',
            transformStyle: 'preserve-3d',
            transform: 'translateZ(10px)'
          }}
          animate={{
            opacity: [0.2, 0.4, 0.2],
            y: [0, 5, 0],
            scale: [1, 1.3, 1],
            rotateZ: [0, -180, -360]
          }}
          transition={{
            opacity: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.5 },
            y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.5 },
            scale: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 },
            rotateZ: { duration: 25, repeat: Infinity, ease: "linear" }
          }}
        />

        {/* New floating 3D elements */}
        <motion.div
          className="absolute w-6 h-6 rounded-full border border-indigo-500/20"
          style={{
            transformStyle: 'preserve-3d',
            transform: 'translateZ(30px)'
          }}
          animate={{
            rotateX: [0, 180, 360],
            rotateY: [0, 180, 360],
            scale: [0.8, 1, 0.8]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        <motion.div
          className="absolute w-8 h-8 rounded-full border border-purple-500/20"
          style={{
            transformStyle: 'preserve-3d',
            transform: 'translateZ(-20px)'
          }}
          animate={{
            rotateX: [0, -180, -360],
            rotateY: [0, -180, -360],
            scale: [1, 0.8, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
            delay: 2
          }}
        />
      </div>
    </div>
  );
}
