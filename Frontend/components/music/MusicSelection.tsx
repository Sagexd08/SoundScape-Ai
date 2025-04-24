'use client';

import React, { useState } from 'react';
import { MusicTrack, filterMusic } from '@/lib/music-library';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, Play, Clock, Piano, Guitar, Violin, Drumstick, Mic2, Radio, Headphones } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
                    {/* Icon */}
                    <div className="relative w-24 h-24 flex-shrink-0 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 flex items-center justify-center text-indigo-300">
                      <div className="w-12 h-12">
                        {track.genre === 'Classical' && <Piano className="h-full w-full" />}
                        {track.genre === 'Jazz' && <Drumstick className="h-full w-full" />}
                        {track.genre === 'Electronic' && <Radio className="h-full w-full" />}
                        {track.genre === 'Ambient' && <Headphones className="h-full w-full" />}
                        {!['Classical', 'Jazz', 'Electronic', 'Ambient'].includes(track.genre) && <Music className="h-full w-full" />}
                      </div>
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

                      <div className="flex flex-wrap gap-1 mt-2">
                        <Badge className="text-xs bg-indigo-900/50 text-indigo-300 border-indigo-800/50">
                          {track.genre}
                        </Badge>
                        {track.instruments.slice(0, 3).map((instrument, i) => (
                          <Badge key={i} variant="outline" className="text-xs bg-gray-800/50 text-gray-300 border-gray-700">
                            {instrument}
                          </Badge>
                        ))}
                        {track.instruments.length > 3 && (
                          <Badge variant="outline" className="text-xs bg-gray-800/50 text-gray-300 border-gray-700">
                            +{track.instruments.length - 3}
                          </Badge>
                        )}
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
