'use client';

import React, { ReactNode, useEffect, useState } from 'react';

interface BackgroundLayoutProps {
  children: ReactNode;
}

export default function ModernBackgroundLayout({ children }: BackgroundLayoutProps) {
  const [mounted, setMounted] = useState(false);

  // Only run animations after component is mounted to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-indigo-950 text-white relative overflow-hidden">
      {/* Enhanced background elements */}
      <div className="absolute inset-0 z-0">
        {/* Deep space gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-indigo-950/30 to-black"></div>

        {/* Subtle stars pattern */}
        <div className="absolute inset-0">
          {mounted && Array.from({ length: 100 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 2 + 1 + 'px',
                height: Math.random() * 2 + 1 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                opacity: Math.random() * 0.5 + 0.3,
                animation: `twinkle ${Math.random() * 5 + 5}s ease-in-out infinite ${Math.random() * 5}s`
              }}
            />
          ))}
        </div>

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '150px 150px'
          }}
        />

        {/* Subtle noise texture */}
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10 mix-blend-soft-light"></div>

        {/* Nebula-like effects */}
        <div className="absolute w-full h-full overflow-hidden">
          {/* Large nebula glow */}
          <div className="absolute top-[10%] -left-[10%] w-[70%] h-[60%] rounded-full bg-indigo-900/10 filter blur-[100px]"></div>
          <div className="absolute bottom-[5%] -right-[5%] w-[50%] h-[50%] rounded-full bg-purple-900/10 filter blur-[100px]"></div>
          <div className="absolute top-[40%] right-[10%] w-[40%] h-[40%] rounded-full bg-blue-900/5 filter blur-[80px]"></div>
        </div>

        {/* Animated gradient overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(30, 27, 75, 0.1), rgba(0, 0, 0, 0.4))',
            backgroundSize: '120% 120%',
            animation: mounted ? 'gradientShift 15s ease-in-out infinite alternate' : 'none'
          }}
        ></div>
      </div>

      {/* Enhanced decorative elements */}
      <div className="absolute top-[15%] left-[8%] w-64 h-64 rounded-full bg-indigo-600/5 filter blur-[80px]"></div>
      <div className="absolute bottom-[10%] right-[5%] w-80 h-80 rounded-full bg-purple-600/5 filter blur-[100px]"></div>
      <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-blue-600/5 filter blur-[60px]"></div>

      {/* Subtle floating particles */}
      {mounted && (
        <>
          <div
            className="absolute w-1 h-1 rounded-full bg-indigo-400/40"
            style={{
              top: '20%',
              left: '30%',
              boxShadow: '0 0 10px 2px rgba(99, 102, 241, 0.3)',
              animation: 'float 20s ease-in-out infinite'
            }}
          ></div>
          <div
            className="absolute w-1.5 h-1.5 rounded-full bg-purple-400/40"
            style={{
              top: '65%',
              left: '75%',
              boxShadow: '0 0 10px 2px rgba(168, 85, 247, 0.3)',
              animation: 'float 25s ease-in-out infinite 5s'
            }}
          ></div>
          <div
            className="absolute w-1 h-1 rounded-full bg-blue-400/40"
            style={{
              top: '40%',
              left: '60%',
              boxShadow: '0 0 10px 2px rgba(59, 130, 246, 0.3)',
              animation: 'float 18s ease-in-out infinite 3s'
            }}
          ></div>
        </>
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
