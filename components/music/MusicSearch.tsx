'use client';

import React, { useState, useEffect } from 'react';
import { MusicTrack } from '@/lib/music-library';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface MusicSearchProps {
  allTracks: MusicTrack[];
  onSearchResults: (results: MusicTrack[]) => void;
}

export default function MusicSearch({ allTracks, onSearchResults }: MusicSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Search when the term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      // If search is cleared, return all tracks
      onSearchResults(allTracks);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const results = allTracks.filter(track => 
      track.title.toLowerCase().includes(term) || 
      track.artist.toLowerCase().includes(term) ||
      track.genre.toLowerCase().includes(term) ||
      track.instruments.some(instrument => instrument.toLowerCase().includes(term))
    );
    
    onSearchResults(results);
  }, [searchTerm, allTracks, onSearchResults]);
  
  const clearSearch = () => {
    setSearchTerm('');
  };
  
  return (
    <div className="relative">
      <div className="flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, artist, genre or instrument..."
            className="pl-10 pr-10 bg-gray-900/70 border-gray-800 focus:border-indigo-500 text-white"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 text-gray-500 hover:text-white"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}