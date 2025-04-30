'use client';

import React, { ReactNode, useEffect, useState, useMemo } from 'react';
import { ClientOnly } from '@/components/client-only';

interface BackgroundLayoutProps {
  children: ReactNode;
}

// Create a client-only component for the animated background
function AnimatedBackground() {
  // Always declare hooks in the same order
  const [isInitialized, setIsInitialized] = useState(false);

  // Use useMemo to ensure consistent hook count
  const memoizedValue = useMemo(() => ({ value: 'consistent' }), []);

  // Generate stars once on component mount
  const stars = useMemo(() => {
    return Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      width: Math.random() * 3 + 1,
      height: Math.random() * 3 + 1,
      top: Math.random() * 100,
      left: Math.random() * 100,
      opacity: Math.random() * 0.7 + 0.3,
      duration: Math.random() * 5 + 5,
      delay: Math.random() * 5
    }));
  }, []);

  // Generate floating particles once on component mount
  const particles = useMemo(() => [
    {
      id: 1,
      className: "absolute w-2 h-2 rounded-full bg-indigo-400/60",
      top: '15%',
      left: '25%',
      boxShadow: '0 0 15px 4px rgba(99, 102, 241, 0.4)',
      animation: 'float 18s ease-in-out infinite'
    },
    {
      id: 2,
      className: "absolute w-2.5 h-2.5 rounded-full bg-purple-400/60",
      top: '60%',
      left: '70%',
      boxShadow: '0 0 15px 4px rgba(168, 85, 247, 0.4)',
      animation: 'float 22s ease-in-out infinite 3s'
    },
    {
      id: 3,
      className: "absolute w-2 h-2 rounded-full bg-blue-400/60",
      top: '35%',
      left: '55%',
      boxShadow: '0 0 15px 4px rgba(59, 130, 246, 0.4)',
      animation: 'float 16s ease-in-out infinite 2s'
    },
    {
      id: 4,
      className: "absolute w-1.5 h-1.5 rounded-full bg-pink-400/60",
      top: '75%',
      left: '30%',
      boxShadow: '0 0 15px 4px rgba(236, 72, 153, 0.4)',
      animation: 'float 20s ease-in-out infinite 4s'
    },
    {
      id: 5,
      className: "absolute w-1.5 h-1.5 rounded-full bg-cyan-400/60",
      top: '25%',
      left: '80%',
      boxShadow: '0 0 15px 4px rgba(34, 211, 238, 0.4)',
      animation: 'float 24s ease-in-out infinite 1s'
    }
  ], []);

  // Set initialization state
  useEffect(() => {
    setIsInitialized(true);

    return () => {
      setIsInitialized(false);
    };
  }, []);

  // Extra effect to ensure consistent hook count
  useEffect(() => {
    // Empty effect for consistency
  }, [memoizedValue]);

  return (
    <>
      {/* Enhanced background elements */}
      <div className="absolute inset-0 z-0">
        {/* Deep space gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-indigo-950/40 to-black"></div>

        {/* Vibrant stars pattern */}
        <div className="absolute inset-0">
          {stars.map((star) => (
            <div
              key={star.id}
              className="absolute rounded-full bg-white"
              style={{
                width: star.width + 'px',
                height: star.height + 'px',
                top: star.top + '%',
                left: star.left + '%',
                opacity: star.opacity,
                animation: `twinkle ${star.duration}s ease-in-out infinite ${star.delay}s`
              }}
            />
          ))}
        </div>

        {/* Enhanced grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(99, 102, 241, 0.1) 1px, transparent 1px),
                           linear-gradient(to bottom, rgba(139, 92, 246, 0.1) 1px, transparent 1px)`,
            backgroundSize: '120px 120px'
          }}
        />

        {/* Enhanced noise texture */}
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-15 mix-blend-overlay"></div>

        {/* Vibrant nebula-like effects */}
        <div className="absolute w-full h-full overflow-hidden">
          {/* Large nebula glow */}
          <div className="absolute top-[5%] -left-[5%] w-[80%] h-[70%] rounded-full bg-indigo-600/15 filter blur-[120px]" style={{ animation: 'pulse 8s ease-in-out infinite alternate' }}></div>
          <div className="absolute bottom-[0%] -right-[10%] w-[70%] h-[60%] rounded-full bg-purple-600/15 filter blur-[120px]" style={{ animation: 'pulse 12s ease-in-out infinite alternate-reverse' }}></div>
          <div className="absolute top-[30%] right-[5%] w-[50%] h-[50%] rounded-full bg-blue-600/10 filter blur-[100px]" style={{ animation: 'pulse 10s ease-in-out infinite alternate' }}></div>
          <div className="absolute bottom-[20%] left-[10%] w-[40%] h-[40%] rounded-full bg-pink-600/10 filter blur-[80px]" style={{ animation: 'pulse 14s ease-in-out infinite alternate-reverse' }}></div>
        </div>

        {/* Enhanced animated gradient overlay */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(79, 70, 229, 0.2), rgba(0, 0, 0, 0.4))',
            backgroundSize: '150% 150%',
            animation: 'gradientShift 12s ease-in-out infinite alternate'
          }}
        ></div>
      </div>

      {/* Enhanced decorative elements */}
      <div className="absolute top-[10%] left-[5%] w-80 h-80 rounded-full bg-indigo-600/10 filter blur-[80px]" style={{ animation: 'pulse 15s ease-in-out infinite alternate' }}></div>
      <div className="absolute bottom-[5%] right-[3%] w-96 h-96 rounded-full bg-purple-600/10 filter blur-[100px]" style={{ animation: 'pulse 18s ease-in-out infinite alternate-reverse' }}></div>
      <div className="absolute top-1/4 right-1/5 w-64 h-64 rounded-full bg-blue-600/10 filter blur-[70px]" style={{ animation: 'pulse 12s ease-in-out infinite alternate' }}></div>
      <div className="absolute bottom-1/3 left-1/4 w-72 h-72 rounded-full bg-pink-600/10 filter blur-[90px]" style={{ animation: 'pulse 20s ease-in-out infinite alternate-reverse' }}></div>

      {/* Enhanced floating particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={particle.className}
          style={{
            top: particle.top,
            left: particle.left,
            boxShadow: particle.boxShadow,
            animation: particle.animation
          }}
        ></div>
      ))}
    </>
  );
}

export default function ModernBackgroundLayout({ children }: BackgroundLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-indigo-950 to-purple-950 text-white relative overflow-hidden">
      {/* Static background for server-side rendering */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-black via-indigo-950/40 to-black">
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-15 mix-blend-overlay"></div>
      </div>

      {/* Animated background only on client-side */}
      <ClientOnly>
        <AnimatedBackground />
      </ClientOnly>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
