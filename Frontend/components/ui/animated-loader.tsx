'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Music, Wand2, Sparkles, Headphones, Zap } from 'lucide-react';

interface AnimatedLoaderProps {
  text?: string;
  variant?: 'default' | 'fullscreen' | 'inline' | 'card';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  iconType?: 'music' | 'wand' | 'sparkles' | 'headphones' | 'zap' | 'audio';
}

export function AnimatedLoader({
  text = 'Loading...',
  variant = 'default',
  size = 'md',
  className,
  iconType = 'audio',
}: AnimatedLoaderProps) {
  const [audioBarHeights, setAudioBarHeights] = useState<number[]>([]);
  
  // Generate random heights for audio bars
  useEffect(() => {
    const generateHeights = () => {
      return Array.from({ length: 5 }, () => Math.random() * 100);
    };
    
    setAudioBarHeights(generateHeights());
    
    // Animate the bars
    const interval = setInterval(() => {
      setAudioBarHeights(generateHeights());
    }, 300);
    
    return () => clearInterval(interval);
  }, []);
  
  // Size classes
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };
  
  // Container classes based on variant
  const containerClasses = {
    default: 'flex items-center gap-3',
    fullscreen: 'fixed inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md z-50',
    inline: 'inline-flex items-center gap-2',
    card: 'flex flex-col items-center justify-center p-6 rounded-xl bg-gradient-to-br from-gray-900/90 to-gray-900/70 border border-gray-800/50 shadow-xl backdrop-blur-sm',
  };
  
  // Icon based on type
  const IconComponent = () => {
    if (iconType === 'audio') {
      // Audio wave animation
      return (
        <div className="flex items-end h-8 gap-[2px]">
          {audioBarHeights.map((height, index) => (
            <motion.div
              key={index}
              className="w-1 bg-gradient-to-t from-indigo-600 to-purple-600 rounded-full"
              initial={{ height: 4 }}
              animate={{ height: Math.max(4, (height / 100) * 32) }}
              transition={{ duration: 0.2 }}
            />
          ))}
        </div>
      );
    }
    
    // Icon animations for other types
    const icons = {
      music: Music,
      wand: Wand2,
      sparkles: Sparkles,
      headphones: Headphones,
      zap: Zap,
    };
    
    const Icon = icons[iconType];
    
    return (
      <div className="relative">
        <motion.div
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ 
            scale: [0.8, 1.2, 0.8],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
          className="absolute inset-0 bg-indigo-500/20 rounded-full blur-md"
        />
        <motion.div
          animate={{ 
            rotate: 360,
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            ease: "linear" 
          }}
        >
          <Icon className={cn(sizeClasses[size], "text-indigo-400")} />
        </motion.div>
      </div>
    );
  };
  
  // Render based on variant
  if (variant === 'fullscreen') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(containerClasses[variant], className)}
        >
          <div className="relative mb-8">
            <motion.div
              initial={{ scale: 1 }}
              animate={{ 
                scale: [1, 1.2, 1],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
              className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl"
              style={{ width: '100%', height: '100%' }}
            />
            <IconComponent />
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <h3 className="text-xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              {text}
            </h3>
            <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden mt-4">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ 
                  duration: 2.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }
  
  if (variant === 'card') {
    return (
      <div className={cn(containerClasses[variant], className)}>
        <div className="mb-4">
          <IconComponent />
        </div>
        <p className="text-gray-300 font-medium">{text}</p>
        <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden mt-4">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
        </div>
      </div>
    );
  }
  
  // Default and inline variants
  return (
    <div className={cn(containerClasses[variant], className)}>
      <IconComponent />
      <span className={cn(
        "text-gray-300",
        size === 'sm' && "text-xs",
        size === 'md' && "text-sm",
        size === 'lg' && "text-base"
      )}>
        {text}
      </span>
    </div>
  );
}

// Export a page loading component for easy use
export function PageLoading({ text = "Loading SoundScape..." }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <AnimatedLoader 
        variant="card" 
        size="lg" 
        text={text} 
        iconType="audio" 
        className="w-80"
      />
    </div>
  );
}

// Export a fullscreen loading overlay
export function FullscreenLoading({ text = "Loading..." }) {
  return <AnimatedLoader variant="fullscreen" size="lg" text={text} iconType="audio" />;
}
