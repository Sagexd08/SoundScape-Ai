'use client';

import React from 'react';
import Navbar from '@/components/navbar';

export default function SimpleProfilePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold">Profile Page</h1>
        <p className="mt-4">This is a simplified profile page for testing.</p>
      </div>
    </div>
  );
}
