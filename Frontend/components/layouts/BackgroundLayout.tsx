'use client';

import { ReactNode } from 'react';
import HeroBackground from '@/components/three/HeroBackground';

interface BackgroundLayoutProps {
  children: ReactNode;
}

export default function BackgroundLayout({ children }: BackgroundLayoutProps) {
  return (
    <div className="min-h-screen bg-black text-white relative">
      <div className="absolute inset-0 z-0">
        <HeroBackground />
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
