'use client';

import { ReactNode } from 'react';

interface BackgroundLayoutProps {
  children: ReactNode;
}

export default function BackgroundLayout({ children }: BackgroundLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-indigo-950 text-white relative">
      {/* Static gradient background instead of Three.js */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-gray-900/40 to-black">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-soft-light"></div>
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
