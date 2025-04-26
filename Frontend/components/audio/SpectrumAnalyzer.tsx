'use client';

import { useRef, useEffect } from 'react';

interface SpectrumAnalyzerProps {
  audioData: number[];
  color: string;
  barCount?: number;
  height?: number;
  showPeaks?: boolean;
}

export default function SpectrumAnalyzer({
  audioData,
  color,
  barCount = 32,
  height = 100,
  showPeaks = false
}: SpectrumAnalyzerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const peakLevelsRef = useRef<number[]>(Array(barCount).fill(0));
  const peakDecayRef = useRef<number[]>(Array(barCount).fill(0));

  // Draw spectrum on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Resize data to match bar count
    const resizedData = resizeArray(audioData, barCount);

    // Calculate bar width
    const barWidth = canvas.width / barCount;
    const barMargin = Math.max(1, barWidth * 0.2);
    const actualBarWidth = barWidth - barMargin;

    // Draw bars
    ctx.fillStyle = color;
    
    resizedData.forEach((value, index) => {
      // Calculate bar height
      const barHeight = value * height;
      
      // Draw bar
      ctx.fillRect(
        index * barWidth + barMargin / 2,
        canvas.height - barHeight,
        actualBarWidth,
        barHeight
      );
      
      // Update peak levels
      if (showPeaks) {
        if (value > peakLevelsRef.current[index]) {
          peakLevelsRef.current[index] = value;
          peakDecayRef.current[index] = 0;
        } else {
          peakDecayRef.current[index] += 0.01;
          peakLevelsRef.current[index] = Math.max(
            value,
            peakLevelsRef.current[index] - peakDecayRef.current[index]
          );
        }
        
        // Draw peak
        const peakHeight = 2;
        ctx.fillRect(
          index * barWidth + barMargin / 2,
          canvas.height - peakLevelsRef.current[index] * height - peakHeight,
          actualBarWidth,
          peakHeight
        );
      }
    });
  }, [audioData, color, barCount, height, showPeaks]);

  // Resize array to target length
  const resizeArray = (array: number[], targetLength: number): number[] => {
    if (array.length === targetLength) return array;
    
    const result = new Array(targetLength).fill(0);
    
    for (let i = 0; i < targetLength; i++) {
      const sourceIndex = Math.floor(i * array.length / targetLength);
      result[i] = array[sourceIndex];
    }
    
    return result;
  };

  return (
    <canvas
      ref={canvasRef}
      width={500}
      height={height}
      className="w-full h-full"
    />
  );
}
