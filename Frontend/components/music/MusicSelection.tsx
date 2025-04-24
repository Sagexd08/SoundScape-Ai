'use client';

import React, { useState } from 'react';
import { MusicTrack, filterMusic } from '@/lib/music-library';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, Play, Clock } from 'lucide-react';
import Image from 'next/image';

interface MusicSelectionProps {
  genre?: string;
  instruments?: string[];
  onSelectTrack: (track: MusicTrack) => void;
}

export default function MusicSelection({ genre, instruments, onSelectTrack }: MusicSelectionProps) {
  const [selectedGenre, setSelectedGenre] = useState<string | undefined>(genre);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>(instruments || []);
  
  // Get filtered tracks based on current selections
  const tracks = filterMusic(selectedGenre, selectedInstruments.length > 0 ? selectedInstruments : undefined);
  
  // Available genres and instruments for filtering
  const genres = ['Classical', 'Ambient', 'Electronic', 'Jazz'];
  const allInstruments = ['Piano', 'Guitar', 'Strings', 'Synth', 'Saxophone', 'Trumpet', 'Orchestra'];
  
  // Toggle genre selection
  const toggleGenre = (genre: string) => {
    setSelectedGenre(selectedGenre === genre ? undefined : genre);
  };
  
  // Toggle instrument selection
  const toggleInstrument = (instrument: string) => {
    if (selectedInstruments.includes(instrument)) {
      setSelectedInstruments(selectedInstruments.filter(i => i !== instrument));
    } else {
      setSelectedInstruments([...selectedInstruments, instrument]);
    }
  };
  
  // Format duration from seconds to MM:SS
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-2">Genre</h3>
          <div className="flex flex-wrap gap-2">
            {genres.map(genre => (
              <Button
                key={genre}
                variant={selectedGenre === genre ? 'default' : 'outline'}
                size="sm"
                className={`${selectedGenre === genre ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-800/50 hover:bg-gray-800 border-gray-700'}`}
                onClick={() => toggleGenre(genre)}
              >
                {genre}
              </Button>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-2">Instruments</h3>
          <div className="flex flex-wrap gap-2">
            {allInstruments.map(instrument => (
              <Button
                key={instrument}
                variant={selectedInstruments.includes(instrument) ? 'default' : 'outline'}
                size="sm"
                className={`${selectedInstruments.includes(instrument) ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-800/50 hover:bg-gray-800 border-gray-700'}`}
                onClick={() => toggleInstrument(instrument)}
              >
                {instrument}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Track list */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-400">
          {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'} available
        </h3>
        
        {tracks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tracks.map(track => (
              <Card 
                key={track.id} 
                className="bg-gray-900/70 backdrop-blur-sm border-gray-800 hover:border-indigo-500/50 transition-all duration-300 overflow-hidden"
              >
                <CardContent className="p-0">
                  <div className="flex">
                    {/* Thumbnail */}
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <Image
                        src={track.thumbnailUrl}
                        alt={track.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-full bg-black/50 text-white"
                          onClick={() => onSelectTrack(track)}
                        >
                          <Play className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Track info */}
                    <div className="p-3 flex-1 overflow-hidden">
                      <div className="flex items-start justify-between">
                        <div className="truncate">
                          <h4 className="font-medium text-white truncate">{track.title}</h4>
                          <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                        </div>
                        <div className="flex items-center text-xs text-gray-500 ml-2 flex-shrink-0">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDuration(track.duration)}
                        </div>
                      </div>
                      
                      <div className="flex items-center mt-2">
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-indigo-900/50 text-indigo-300">
                          {track.genre}
                        </span>
                        <div className="ml-2 flex-1 truncate">
                          {track.instruments.map((instrument, i) => (
                            <span key={i} className="text-xs px-1.5 py-0.5 rounded-full bg-gray-800 text-gray-300 ml-1">
                              {instrument}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 bg-gray-900/50 rounded-lg border border-gray-800">
            <Music className="h-10 w-10 text-gray-600 mb-2" />
            <p className="text-gray-400">No tracks match your filters</p>
            <Button 
              variant="link" 
              className="mt-2 text-indigo-400"
              onClick={() => {
                setSelectedGenre(undefined);
                setSelectedInstruments([]);
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
