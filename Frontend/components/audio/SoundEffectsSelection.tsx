'use client';

import React, { useState } from 'react';
import { SoundEffect, filterSoundEffects } from '@/lib/sound-effects-library';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Clock, Tag } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SoundEffectsSelectionProps {
  category?: string;
  tags?: string[];
  mood?: string;
  onSelectSoundEffect: (sound: SoundEffect) => void;
}

export default function SoundEffectsSelection({ 
  category, 
  tags, 
  mood, 
  onSelectSoundEffect 
}: SoundEffectsSelectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(category);
  const [selectedTags, setSelectedTags] = useState<string[]>(tags || []);
  const [selectedMood, setSelectedMood] = useState<string | undefined>(mood);
  
  // Get filtered sound effects based on current selections
  const soundEffects = filterSoundEffects(selectedCategory, selectedTags.length > 0 ? selectedTags : undefined, selectedMood);
  
  // Available categories, tags, and moods for filtering
  const categories = ['Nature', 'Urban', 'Ambient', 'ASMR'];
  const allTags = [
    'Forest', 'Ocean', 'Rain', 'Water', 'Night',
    'Cafe', 'City', 'Office', 'Indoors',
    'Focus', 'Sleep', 'Meditation',
    'Cozy', 'Fire'
  ];
  const moods = ['Relaxing', 'Focused', 'Energetic', 'Peaceful', 'Dramatic'];
  
  // Toggle category selection
  const toggleCategory = (cat: string) => {
    setSelectedCategory(selectedCategory === cat ? undefined : cat);
  };
  
  // Toggle tag selection
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  // Toggle mood selection
  const toggleMood = (m: string) => {
    setSelectedMood(selectedMood === m ? undefined : m);
  };
  
  // Format duration from seconds to MM:SS or HH:MM:SS
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Dynamic icon component
  const DynamicIcon = ({ name }: { name: string }) => {
    // @ts-ignore - Dynamically accessing icons
    const IconComponent = Icons[name] || Icons.Music;
    return <IconComponent className="h-full w-full" />;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-2">Environment</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                size="sm"
                className={`${selectedCategory === cat ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-800/50 hover:bg-gray-800 border-gray-700'}`}
                onClick={() => toggleCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-2">Elements</h3>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <Button
                key={tag}
                variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                size="sm"
                className={`${selectedTags.includes(tag) ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-800/50 hover:bg-gray-800 border-gray-700'}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-2">Mood</h3>
          <div className="flex flex-wrap gap-2">
            {moods.map(m => (
              <Button
                key={m}
                variant={selectedMood === m ? 'default' : 'outline'}
                size="sm"
                className={`${selectedMood === m ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-800/50 hover:bg-gray-800 border-gray-700'}`}
                onClick={() => toggleMood(m)}
              >
                {m}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Sound Effects list */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-400">
          {soundEffects.length} {soundEffects.length === 1 ? 'sound' : 'sounds'} available
        </h3>
        
        {soundEffects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {soundEffects.map(sound => (
              <Card 
                key={sound.id} 
                className="bg-gray-900/70 backdrop-blur-sm border-gray-800 hover:border-indigo-500/50 transition-all duration-300 overflow-hidden"
              >
                <CardContent className="p-0">
                  <div className="flex">
                    {/* Icon */}
                    <div className="relative w-24 h-24 flex-shrink-0 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 flex items-center justify-center text-indigo-300">
                      <div className="w-12 h-12">
                        <DynamicIcon name={sound.iconName} />
                      </div>
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-full bg-black/50 text-white"
                          onClick={() => onSelectSoundEffect(sound)}
                        >
                          <Play className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Sound info */}
                    <div className="p-3 flex-1 overflow-hidden">
                      <div className="flex items-start justify-between">
                        <div className="truncate">
                          <h4 className="font-medium text-white truncate">{sound.title}</h4>
                          <p className="text-sm text-gray-400 truncate">{sound.category}</p>
                        </div>
                        <div className="flex items-center text-xs text-gray-500 ml-2 flex-shrink-0">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDuration(sound.duration)}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        {sound.tags.slice(0, 3).map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs bg-gray-800/50 text-gray-300 border-gray-700">
                            {tag}
                          </Badge>
                        ))}
                        {sound.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs bg-gray-800/50 text-gray-300 border-gray-700">
                            +{sound.tags.length - 3}
                          </Badge>
                        )}
                        {sound.mood && (
                          <Badge className="text-xs bg-indigo-900/50 text-indigo-300 border-indigo-800/50 ml-auto">
                            {sound.mood}
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
            <Icons.AudioLines className="h-10 w-10 text-gray-600 mb-2" />
            <p className="text-gray-400">No sound effects match your filters</p>
            <Button 
              variant="link" 
              className="mt-2 text-indigo-400"
              onClick={() => {
                setSelectedCategory(undefined);
                setSelectedTags([]);
                setSelectedMood(undefined);
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
