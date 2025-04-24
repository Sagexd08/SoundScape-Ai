'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Headphones } from 'lucide-react';

interface HeadphonesModelProps {
  className?: string;
}

export default function HeadphonesModel({ className = '' }: HeadphonesModelProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Simplified component with no complex animations
  useEffect(() => {
    // Set initial visibility
    setIsVisible(true);
  }, []);

  return (
    <div className={`relative w-full h-64 md:h-80 ${className}`}>
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Simplified Headphones Icon with Animation */}
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
          {/* Headphones Icon with Glow */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl" />
            <Headphones className="h-24 w-24 md:h-32 md:w-32 text-indigo-400" />
          </div>

          {/* Sound waves */}
          <motion.div
            className="absolute top-1/2 left-1/2 w-full h-full rounded-full border-2 border-indigo-500/30"
            animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{
              transform: 'translate(-50%, -50%)',
            }}
          />

          <motion.div
            className="absolute top-1/2 left-1/2 w-[120%] h-[120%] rounded-full border-2 border-purple-500/20"
            animate={{ scale: [1.2, 1.7, 1.2], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            style={{
              transform: 'translate(-50%, -50%)',
            }}
          />
        </motion.div>

        {/* Static glowing orbs */}
        <div className="absolute w-4 h-4 rounded-full bg-indigo-500/30 blur-md"
             style={{ top: '30%', left: '35%' }} />

        <div className="absolute w-3 h-3 rounded-full bg-purple-500/30 blur-md"
             style={{ bottom: '35%', right: '30%' }} />
      </div>
    </div>
  );
}
