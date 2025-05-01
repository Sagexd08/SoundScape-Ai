'use client';

import React, { useState } from 'react';
import { MusicTrack, getAllTracks } from '@/lib/music-library';
import MusicSelection from '@/components/music/MusicSelection';
import MusicSearch from '@/components/music/MusicSearch';
import TrackPreview from '@/components/music/TrackPreview';
import { Button } from '@/components/ui/button';
import { Music } from 'lucide-react';

export default function MusicPage() {
  const allTracks = getAllTracks();
  const [filteredTracks, setFilteredTracks] = useState<MusicTrack[]>(allTracks);
  const [selectedTrack, setSelectedTrack] = useState<MusicTrack | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  const handleTrackSelect = (track: MusicTrack) => {
    setSelectedTrack(track);
    setShowPreview(true);
  };
  
  const closePreview = () => {
    setShowPreview(false);
  };
  
  const handleSearchResults = (results: MusicTrack[]) => {
    setFilteredTracks(results);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Music Library</h1>
        <p className="text-gray-400">Discover and select tracks for your project</p>
      </div>
      
      <div className="mb-6">
        <MusicSearch 
          allTracks={allTracks} 
          onSearchResults={handleSearchResults} 
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MusicSelection 
            onSelectTrack={handleTrackSelect} 
          />
        </div>
        
        <div className="lg:col-span-1">
          {showPreview && selectedTrack ? (
            <TrackPreview 
              track={selectedTrack} 
              onClose={closePreview} 
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-10 bg-gray-900/50 rounded-lg border border-gray-800 h-full">
              <Music className="h-16 w-16 text-gray-600 mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">Track Preview</h3>
              <p className="text-gray-400 text-center mb-4">
                Select a track from the library to preview it here
              </p>
              <Button 
                variant="outline" 
                className="bg-gray-800/50 text-gray-300 border-gray-700"
                disabled
              >
                No track selected
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}