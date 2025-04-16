'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX 
} from 'lucide-react';
import { getSignedUrl } from '@/lib/supabase';
import Image from 'next/image';

interface AudioPlayerProps {
  audioFile: {
    id: string;
    title: string;
    storage_path: string;
    waveform_path?: string | null;
    is_public: boolean;
    duration?: number | null;
  };
  onNext?: () => void;
  onPrevious?: () => void;
}

export function AudioPlayer({ audioFile, onNext, onPrevious }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Load audio URL
  useEffect(() => {
    const loadAudio = async () => {
      try {
        // Get signed URL for private files, or public URL for public files
        let url: string;
        
        if (audioFile.is_public) {
          url = `https://mxvcweenflmanyknwccr.supabase.co/storage/v1/object/public/audio-files/${audioFile.storage_path}`;
        } else {
          url = await getSignedUrl(audioFile.storage_path);
        }
        
        setAudioUrl(url);
        setError(null);
      } catch (err) {
        setError('Failed to load audio file');
        console.error('Error loading audio:', err);
      }
    };
    
    loadAudio();
    
    // Reset state when audio file changes
    setCurrentTime(0);
    setIsPlaying(false);
    
    return () => {
      // Cleanup
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [audioFile]);
  
  // Handle play/pause
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.error('Error playing audio:', err);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);
  
  // Handle volume change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);
  
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };
  
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };
  
  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    
    // Auto play next if provided
    if (onNext) {
      onNext();
    }
  };
  
  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      const newTime = value[0];
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };
  
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  return (
    <div className="w-full p-4 rounded-lg border bg-white shadow-sm">
      {error ? (
        <div className="text-center text-red-500 py-4">{error}</div>
      ) : (
        <>
          <div className="mb-4">
            <h3 className="text-lg font-medium truncate">{audioFile.title}</h3>
          </div>
          
          {audioFile.waveform_path && (
            <div className="relative w-full h-24 mb-4 bg-gray-50 rounded overflow-hidden">
              <Image
                src={`https://mxvcweenflmanyknwccr.supabase.co/storage/v1/object/public/waveform-images/${audioFile.waveform_path}`}
                alt="Audio waveform"
                fill
                style={{ objectFit: 'cover' }}
              />
              {/* Playback position indicator */}
              <div 
                className="absolute top-0 bottom-0 bg-primary/10 pointer-events-none"
                style={{ 
                  width: `${(currentTime / duration) * 100}%`, 
                  left: 0 
                }}
              ></div>
            </div>
          )}
          
          {/* Audio element */}
          <audio
            ref={audioRef}
            src={audioUrl || undefined}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            preload="metadata"
          />
          
          {/* Time slider */}
          <div className="mb-4">
            <Slider
              value={[currentTime]}
              min={0}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              disabled={!audioUrl}
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
          
          {/* Playback controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                size="icon"
                variant="ghost"
                onClick={onPrevious}
                disabled={!onPrevious}
              >
                <SkipBack className="h-5 w-5" />
              </Button>
              
              <Button
                size="icon"
                variant="default"
                className="h-10 w-10 rounded-full"
                onClick={togglePlay}
                disabled={!audioUrl}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5" />
                )}
              </Button>
              
              <Button
                size="icon"
                variant="ghost"
                onClick={onNext}
                disabled={!onNext}
              >
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Volume control */}
            <div className="flex items-center space-x-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={toggleMute}
                className="text-gray-500"
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
              
              <Slider
                className="w-24"
                value={[volume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={(value) => setVolume(value[0])}
                disabled={isMuted}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}