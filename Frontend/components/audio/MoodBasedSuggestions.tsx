'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Volume2, VolumeX, Download, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface SuggestedAudio {
  id: string;
  title: string;
  artist: string;
  mood: string;
  duration: number;
  url: string;
  coverImage?: string;
}

interface MoodBasedSuggestionsProps {
  mood: string;
  onClose?: () => void;
}

// Mock data for suggested audio based on mood
const getMoodSuggestions = (mood: string): SuggestedAudio[] => {
  const suggestions: Record<string, SuggestedAudio[]> = {
    relaxing: [
      {
        id: '1',
        title: 'Calm Waters',
        artist: 'Ambient Dreams',
        mood: 'relaxing',
        duration: 183,
        url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1bab.mp3?filename=relaxing-145038.mp3',
        coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=200&auto=format&fit=crop'
      },
      {
        id: '2',
        title: 'Gentle Rain',
        artist: 'Nature Sounds',
        mood: 'relaxing',
        duration: 240,
        url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_270f8b3d56.mp3?filename=relaxing-145803.mp3',
        coverImage: 'https://images.unsplash.com/photo-1501691223387-dd0500403074?q=80&w=200&auto=format&fit=crop'
      }
    ],
    energetic: [
      {
        id: '3',
        title: 'Power Up',
        artist: 'Workout Mix',
        mood: 'energetic',
        duration: 195,
        url: 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_946f4e8dc8.mp3?filename=energetic-indie-rock-jump-149636.mp3',
        coverImage: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?q=80&w=200&auto=format&fit=crop'
      },
      {
        id: '4',
        title: 'Morning Rush',
        artist: 'Beats & Rhythm',
        mood: 'energetic',
        duration: 210,
        url: 'https://cdn.pixabay.com/download/audio/2022/01/20/audio_d0c19c3ce0.mp3?filename=energetic-rock-trailer-150300.mp3',
        coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200&auto=format&fit=crop'
      }
    ],
    focused: [
      {
        id: '5',
        title: 'Deep Focus',
        artist: 'Study Session',
        mood: 'focused',
        duration: 225,
        url: 'https://cdn.pixabay.com/download/audio/2022/04/27/audio_c8a901a418.mp3?filename=lofi-study-112191.mp3',
        coverImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=200&auto=format&fit=crop'
      },
      {
        id: '6',
        title: 'Concentration',
        artist: 'Mind Waves',
        mood: 'focused',
        duration: 198,
        url: 'https://cdn.pixabay.com/download/audio/2022/03/09/audio_c8d43425ca.mp3?filename=ambient-piano-logo-145504.mp3',
        coverImage: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=200&auto=format&fit=crop'
      }
    ],
    peaceful: [
      {
        id: '7',
        title: 'Tranquil Forest',
        artist: 'Nature Harmony',
        mood: 'peaceful',
        duration: 215,
        url: 'https://cdn.pixabay.com/download/audio/2022/01/26/audio_d0c5ed8d9a.mp3?filename=forest-with-small-river-birds-and-nature-field-recording-6735.mp3',
        coverImage: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=200&auto=format&fit=crop'
      },
      {
        id: '8',
        title: 'Meditation Space',
        artist: 'Zen Masters',
        mood: 'peaceful',
        duration: 230,
        url: 'https://cdn.pixabay.com/download/audio/2022/04/13/audio_2957fb7fcf.mp3?filename=meditation-amp-relaxation-music-22165.mp3',
        coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=200&auto=format&fit=crop'
      }
    ],
    uplifting: [
      {
        id: '9',
        title: 'Positive Vibes',
        artist: 'Happy Tunes',
        mood: 'uplifting',
        duration: 190,
        url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1bab.mp3?filename=uplifting-piano-112624.mp3',
        coverImage: 'https://images.unsplash.com/photo-1464692805480-a69dfaafdb0d?q=80&w=200&auto=format&fit=crop'
      },
      {
        id: '10',
        title: 'New Beginnings',
        artist: 'Inspiration',
        mood: 'uplifting',
        duration: 205,
        url: 'https://cdn.pixabay.com/download/audio/2022/01/27/audio_d0c6a694b7.mp3?filename=uplifting-corporate-141170.mp3',
        coverImage: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=200&auto=format&fit=crop'
      }
    ],
    melancholic: [
      {
        id: '11',
        title: 'Rainy Day',
        artist: 'Melancholy',
        mood: 'melancholic',
        duration: 220,
        url: 'https://cdn.pixabay.com/download/audio/2022/04/20/audio_1b1b9e8e0f.mp3?filename=sad-piano-theme-19799.mp3',
        coverImage: 'https://images.unsplash.com/photo-1501999635878-71cb5379c2d8?q=80&w=200&auto=format&fit=crop'
      },
      {
        id: '12',
        title: 'Memories',
        artist: 'Nostalgic Sounds',
        mood: 'melancholic',
        duration: 235,
        url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8e9d8d4a9.mp3?filename=sad-atmospheric-piano-147702.mp3',
        coverImage: 'https://images.unsplash.com/photo-1459478309853-2c33a60058e7?q=80&w=200&auto=format&fit=crop'
      }
    ],
    custom: [
      {
        id: '13',
        title: 'Custom Blend',
        artist: 'AI Composer',
        mood: 'custom',
        duration: 210,
        url: 'https://cdn.pixabay.com/download/audio/2022/03/18/audio_c8e9d8d4a9.mp3?filename=ambient-piano-logo-148495.mp3',
        coverImage: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=200&auto=format&fit=crop'
      },
      {
        id: '14',
        title: 'Personalized Mix',
        artist: 'Your Sound',
        mood: 'custom',
        duration: 225,
        url: 'https://cdn.pixabay.com/download/audio/2022/04/27/audio_c8a901a418.mp3?filename=lofi-study-112191.mp3',
        coverImage: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=200&auto=format&fit=crop'
      }
    ]
  };

  return suggestions[mood.toLowerCase()] || suggestions.relaxing;
};

// Format time in MM:SS
const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export default function MoodBasedSuggestions({ mood, onClose }: MoodBasedSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SuggestedAudio[]>([]);
  const [currentTrack, setCurrentTrack] = useState<SuggestedAudio | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load suggestions based on mood
  useEffect(() => {
    const moodSuggestions = getMoodSuggestions(mood);
    setSuggestions(moodSuggestions);
    
    // Auto-select the first track
    if (moodSuggestions.length > 0 && !currentTrack) {
      setCurrentTrack(moodSuggestions[0]);
    }
  }, [mood]);

  // Update progress bar
  useEffect(() => {
    if (isPlaying) {
      progressIntervalRef.current = setInterval(() => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      }, 1000);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying]);

  // Handle track change
  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.src = currentTrack.url;
      audioRef.current.volume = volume / 100;
      
      // Set up event listeners
      audioRef.current.onloadedmetadata = () => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration);
        }
      };
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        
        // Auto play next track
        const currentIndex = suggestions.findIndex(s => s.id === currentTrack.id);
        if (currentIndex < suggestions.length - 1) {
          setCurrentTrack(suggestions[currentIndex + 1]);
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.play().catch(err => {
                console.error('Error playing audio:', err);
              });
              setIsPlaying(true);
            }
          }, 500);
        }
      };
      
      // Auto-play if was playing before
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.error('Error playing audio:', err);
          setIsPlaying(false);
        });
      }
    }
  }, [currentTrack]);

  // Handle progress change
  const handleProgressChange = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => {
          console.error('Error playing audio:', err);
          toast.error('Could not play audio. Please try again.');
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  // Handle download
  const handleDownload = () => {
    if (currentTrack) {
      const a = document.createElement('a');
      a.href = currentTrack.url;
      a.download = `${currentTrack.title}-${currentTrack.artist}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success('Audio downloaded successfully!');
    }
  };

  return (
    <div className="space-y-4">
      {/* Current track player */}
      {currentTrack && (
        <Card className="bg-gray-800/50 border-gray-700 overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col">
              {/* Cover image */}
              {currentTrack.coverImage && (
                <div className="relative w-full aspect-video">
                  <img 
                    src={currentTrack.coverImage} 
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
                  
                  {/* Play/pause overlay button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={togglePlayPause}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-16 w-16 rounded-full bg-black/50 hover:bg-black/70 text-white"
                  >
                    {isPlaying ? (
                      <Pause className="h-8 w-8" />
                    ) : (
                      <Play className="h-8 w-8 ml-1" />
                    )}
                  </Button>
                </div>
              )}
              
              {/* Track info and controls */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-white">{currentTrack.title}</h3>
                    <p className="text-sm text-gray-400">{currentTrack.artist}</p>
                  </div>
                  <Badge variant="outline" className="bg-purple-900/30 text-purple-300 border-purple-700">
                    {currentTrack.mood}
                  </Badge>
                </div>
                
                {/* Audio element */}
                <audio
                  ref={audioRef}
                  src={currentTrack.url}
                  preload="metadata"
                />
                
                {/* Progress bar */}
                <div className="space-y-1 mb-3">
                  <Slider
                    value={[currentTime]}
                    min={0}
                    max={duration || currentTrack.duration}
                    step={0.1}
                    onValueChange={handleProgressChange}
                    className="cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration || currentTrack.duration)}</span>
                  </div>
                </div>
                
                {/* Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleMute}
                      className="h-8 w-8 text-gray-400 hover:text-white"
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    <Slider
                      value={[volume]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={handleVolumeChange}
                      className="w-20"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleDownload}
                      className="h-8 w-8 text-gray-400 hover:text-white"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-white"
                      asChild
                    >
                      <a href={currentTrack.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Suggested tracks list */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-300">Suggested Tracks for {mood} Mood</h3>
        <div className="grid grid-cols-1 gap-2">
          {suggestions.map((track) => (
            <Card 
              key={track.id}
              className={`bg-gray-800/30 border-gray-700 hover:bg-gray-800/50 transition-colors cursor-pointer ${
                currentTrack?.id === track.id ? 'border-purple-500 bg-purple-900/20' : ''
              }`}
              onClick={() => {
                setCurrentTrack(track);
                setIsPlaying(true);
              }}
            >
              <CardContent className="p-3">
                <div className="flex items-center space-x-3">
                  {track.coverImage ? (
                    <div className="h-12 w-12 rounded overflow-hidden flex-shrink-0">
                      <img 
                        src={track.coverImage} 
                        alt={track.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <Play className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  
                  <div className="flex-grow min-w-0">
                    <h4 className="font-medium text-sm text-white truncate">{track.title}</h4>
                    <p className="text-xs text-gray-400 truncate">{track.artist}</p>
                  </div>
                  
                  <div className="flex-shrink-0 text-xs text-gray-500">
                    {formatTime(track.duration)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Back button */}
      {onClose && (
        <div className="flex justify-end mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white border-gray-700"
          >
            Back to Mood Selection
          </Button>
        </div>
      )}
    </div>
  );
}
