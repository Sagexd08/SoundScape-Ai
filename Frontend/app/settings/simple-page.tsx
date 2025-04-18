'use client';

import React from 'react';
import Navbar from '@/components/navbar';

export default function SimpleSettingsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold">Settings Page</h1>
        <p className="mt-4">This is a simplified settings page for testing.</p>
      </div>
    </div>
  );
}
