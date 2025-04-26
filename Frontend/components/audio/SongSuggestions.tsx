'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Music, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MusicTrack } from '@/lib/music-library';
import YouTubePlayer from '@/components/music/YouTubePlayer';

interface SongSuggestion {
  title: string;
  artist: string;
  genre: string;
  youtubeUrl?: string;
}

interface SongSuggestionsProps {
  suggestions: SongSuggestion[];
  environment: string;
}

export default function SongSuggestions({ suggestions, environment }: SongSuggestionsProps) {
  const [selectedSong, setSelectedSong] = useState<MusicTrack | null>(null);

  // Convert suggestion to MusicTrack format for YouTubePlayer
  const convertToMusicTrack = (suggestion: SongSuggestion): MusicTrack => {
    return {
      id: `suggestion-${suggestion.title.toLowerCase().replace(/\s+/g, '-')}`,
      title: suggestion.title,
      artist: suggestion.artist,
      genre: suggestion.genre,
      instruments: [],
      youtubeUrl: suggestion.youtubeUrl || getDefaultYouTubeUrl(suggestion.genre),
      thumbnailUrl: '',
      duration: 180, // Default 3 minutes
      description: `Suggested for ${environment} environment`
    };
  };

  // Get a default YouTube URL based on genre if none is provided
  const getDefaultYouTubeUrl = (genre: string): string => {
    const defaultUrls: Record<string, string> = {
      'Ambient': 'https://www.youtube.com/embed/5qap5aO4i9A', // Lofi hip hop
      'Classical': 'https://www.youtube.com/embed/XULUBg_ZcAU', // Classical music
      'Jazz': 'https://www.youtube.com/embed/DSGyEsJ17cI', // Jazz
      'Electronic': 'https://www.youtube.com/embed/tKi9Z-f6qX4', // Electronic
      'Lo-fi': 'https://www.youtube.com/embed/5qap5aO4i9A', // Lofi hip hop
      'New Age': 'https://www.youtube.com/embed/66VnOdk6oto', // New age
      'Orchestral': 'https://www.youtube.com/embed/e3RRU25dpPg', // Orchestral
      'Cinematic': 'https://www.youtube.com/embed/XYAghEq5Lfw', // Cinematic
      'Acoustic': 'https://www.youtube.com/embed/jTLpqYB61zM', // Acoustic
      'Jazz Fusion': 'https://www.youtube.com/embed/9q6pSEeHFLo', // Jazz fusion
    };

    return defaultUrls[genre] || 'https://www.youtube.com/embed/5qap5aO4i9A';
  };

  // Play the selected song
  const playSong = (suggestion: SongSuggestion) => {
    setSelectedSong(convertToMusicTrack(suggestion));
  };

  return (
    <div className="space-y-4">
      {selectedSong ? (
        <div className="space-y-4">
          <YouTubePlayer track={selectedSong} />
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedSong(null)}
              className="text-gray-400 hover:text-white"
            >
              Back to suggestions
            </Button>
          </div>
        </div>
      ) : (
        <>
          <h3 className="text-sm font-medium text-indigo-400 mb-2">
            Suggested Songs for {environment.charAt(0).toUpperCase() + environment.slice(1)} Environment
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {suggestions.map((suggestion, index) => (
              <Card
                key={index}
                className="bg-gray-800/50 hover:bg-gray-800/70 border-gray-700 transition-colors"
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-lg flex items-center justify-center text-indigo-300 flex-shrink-0">
                        <Music className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{suggestion.title}</h4>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-400">{suggestion.artist}</p>
                          <Badge className="bg-indigo-900/50 text-indigo-300 border-indigo-800/50 text-xs">
                            {suggestion.genre}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-indigo-900/50 text-white hover:bg-indigo-800"
                      onClick={() => playSong(suggestion)}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
