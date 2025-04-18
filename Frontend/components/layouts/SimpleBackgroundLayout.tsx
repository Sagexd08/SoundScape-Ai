'use client';

import React, { ReactNode } from 'react';

interface BackgroundLayoutProps {
  children: ReactNode;
}

export default function SimpleBackgroundLayout({ children }: BackgroundLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-indigo-950 text-white relative">
      {/* Static gradient background for Vercel compatibility */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-gray-900/40 to-black">
        {/* No image dependency for better compatibility */}
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
