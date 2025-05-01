'use client';

import { useState, useRef, useEffect } from 'react';
import { MusicTrack } from '@/lib/music-library';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface TrackPreviewProps {
  track: MusicTrack;
  onClose: () => void;
}

export default function TrackPreview({ track, onClose }: TrackPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    // Create audio element
    const audio = new Audio(track.previewUrl);
    audioRef.current = audio;
    
    // Set up event listeners
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    
    // Clean up
    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [track]);
  
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);
  
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const percentage = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(percentage);
    }
  };
  
  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };
  
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const handleProgressChange = (value: number[]) => {
    if (audioRef.current) {
      const newTime = (value[0] / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setProgress(value[0]);
    }
  };
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getCurrentTime = () => {
    return audioRef.current ? formatTime(audioRef.current.currentTime) : '0:00';
  };
  
  const getDuration = () => {
    return audioRef.current ? formatTime(audioRef.current.duration) : '0:00';
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  return (
    <div className="bg-gray-900/90 backdrop-blur-md p-4 rounded-lg border border-gray-800">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-medium text-white">{track.title}</h3>
          <p className="text-sm text-gray-400">{track.artist}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
          Close
        </Button>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
            onClick={togglePlayPause}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          
          <div className="flex-1 space-y-1">
            <Slider
              value={[progress]} 
              max={100}
              step={0.1}
              onValueChange={handleProgressChange}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{getCurrentTime()}</span>
              <span>{getDuration()}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={toggleMute} className="text-gray-400 hover:text-white">
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
            <Slider 
              value={[volume]} 
              max={100}
              onValueChange={(val) => setVolume(val[0])}
              className="w-20 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}