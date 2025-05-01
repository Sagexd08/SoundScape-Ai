'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MusicTrack, formatDuration } from '@/lib/music-library';
import { Music, ExternalLink, Volume2, VolumeX, Piano, Guitar, Drumstick, Mic2, Radio, Headphones, Tag, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

interface YouTubePlayerProps {
  track: MusicTrack;
  onClose?: () => void;
}

export default function YouTubePlayer({ track, onClose }: YouTubePlayerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);

  // Extract YouTube video ID from URL
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeId(track.youtubeUrl);

  // Handle iframe load event
  const handleIframeLoad = () => {
    setIsLoaded(true);
  };

  // Toggle mute state
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  // Update iframe volume when volume state changes
  useEffect(() => {
    const iframe = document.getElementById('youtube-player') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      try {
        // This is a simplified approach - in a real app, you'd use the YouTube Player API
        // to control volume more effectively
        const message = isMuted
          ? JSON.stringify({ event: 'command', func: 'mute' })
          : JSON.stringify({ event: 'command', func: 'unMute' });

        iframe.contentWindow.postMessage(message, '*');
      } catch (error) {
        console.error('Error controlling YouTube player:', error);
      }
    }
  }, [isMuted, volume]);

  return (
    <Card className="w-full bg-gray-900/90 backdrop-blur-lg border border-gray-800 overflow-hidden">
      <CardContent className="p-0">
        <div className="relative">
          {/* Loading overlay */}
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-10">
              <div className="flex flex-col items-center">
                <Music className="h-8 w-8 text-indigo-400 animate-pulse mb-2" />
                <p className="text-gray-300">Loading music...</p>
              </div>
            </div>
          )}

          {/* YouTube iframe */}
          <div className="aspect-video w-full">
            <iframe
              id="youtube-player"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
              onLoad={handleIframeLoad}
            ></iframe>
          </div>
        </div>

        {/* Track info and controls */}
        <div className="p-4">
          <div className="flex items-start gap-4 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-lg flex items-center justify-center text-indigo-300 flex-shrink-0">
              {track.genre === 'Classical' && <Piano className="h-8 w-8" />}
              {track.genre === 'Jazz' && <Drumstick className="h-8 w-8" />}
              {track.genre === 'Electronic' && <Radio className="h-8 w-8" />}
              {track.genre === 'Ambient' && <Headphones className="h-8 w-8" />}
              {!['Classical', 'Jazz', 'Electronic', 'Ambient'].includes(track.genre) && <Music className="h-8 w-8" />}
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">{track.title}</h3>
              <p className="text-gray-400">{track.artist}</p>
              <div className="flex items-center mt-1">
                <Badge className="mr-2 bg-indigo-900/50 text-indigo-300 border-indigo-800/50">
                  {track.genre}
                </Badge>
                <span className="text-xs text-gray-500">{formatDuration(track.duration)}</span>
              </div>
            </div>

            <div className="flex items-center">
              {/* Volume control */}
              <div className="flex items-center mr-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="h-8 w-8 rounded-full"
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
                  disabled={isMuted}
                />
              </div>

              {/* External links and download */}
              <div className="flex items-center gap-2">
                {track.spotifyUrl && (
                  <a
                    href={track.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300"
                    title="Open in Spotify"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                  </a>
                )}

                <a
                  href={track.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-500 hover:text-red-400"
                  title="Open in YouTube"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>

                <a
                  href={`https://www.y2mate.com/youtube/${getYouTubeId(track.youtubeUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-400"
                  title="Download track (via Y2Mate)"
                >
                  <Download className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {track.description && (
            <p className="text-sm text-gray-400 mb-3">{track.description}</p>
          )}

          <div className="flex flex-wrap gap-1 mt-2">
            <Tag className="h-3.5 w-3.5 text-gray-500 mr-1" />
            {track.instruments.map((instrument, i) => (
              <Badge key={i} variant="outline" className="text-xs bg-gray-800/50 text-gray-300 border-gray-700">
                {instrument}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
