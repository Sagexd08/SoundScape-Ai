'use client';

import { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { aiService } from '@/lib/ai-integration';

interface MoodSelectorProps {
  onMoodSelected: (mood: string, customPrompt?: string) => void;
  onClose: () => void;
}

export default function MoodSelector({
  onMoodSelected,
  onClose
}: MoodSelectorProps) {
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Predefined moods with descriptions and colors
  const moods = [
    {
      name: 'Relaxing',
      description: 'Calm sounds to reduce stress',
      color: 'from-blue-500 to-cyan-400',
      icon: '🧘‍♂️'
    },
    {
      name: 'Energetic',
      description: 'Upbeat sounds for energy & focus',
      color: 'from-red-500 to-orange-400',
      icon: '⚡'
    },
    {
      name: 'Focused',
      description: 'Sounds for concentration',
      color: 'from-indigo-600 to-blue-500',
      icon: '🧠'
    },
    {
      name: 'Peaceful',
      description: 'Tranquil sounds for harmony',
      color: 'from-green-500 to-emerald-400',
      icon: '🌿'
    },
    {
      name: 'Uplifting',
      description: 'Positive sounds to elevate mood',
      color: 'from-yellow-500 to-amber-400',
      icon: '🌞'
    },
    {
      name: 'Melancholic',
      description: 'Emotional sounds for reflection',
      color: 'from-purple-500 to-violet-400',
      icon: '🌧️'
    }
  ];

  // Handle mood selection
  const handleMoodSelect = (mood: string) => {
    onMoodSelected(mood.toLowerCase());
    toast.success(`Mood set to: ${mood}`);
    onClose();
  };

  // Generate custom mood prompt with AI
  const handleGenerateCustomPrompt = async () => {
    if (!customPrompt.trim()) {
      toast.error('Please enter a description of your mood');
      return;
    }

    setIsGenerating(true);

    try {
      toast.info('Generating custom mood prompt with AI...');

      // Call AI service to generate a custom prompt
      const enhancedPrompt = await aiService.generateMoodPrompt(customPrompt);

      // Pass the custom prompt to the parent component
      onMoodSelected('custom', enhancedPrompt);
      toast.success('Custom mood prompt generated successfully!');
      onClose();
    } catch (error) {
      console.error('Error generating custom prompt:', error);
      toast.error('Failed to generate custom prompt. Using your input directly.');

      // Fallback to using the user's input directly
      onMoodSelected('custom', customPrompt);
      onClose();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md bg-gray-900/95 border-gray-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              Mood Selector
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-white h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-sm">
            Select a mood to customize your audio experience
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 py-3">
          <div className="grid grid-cols-2 gap-2">
            {moods.map((mood) => (
              <div key={mood.name} className="relative group">
                <Button
                  onClick={() => handleMoodSelect(mood.name)}
                  className={`w-full h-auto py-2 flex flex-col items-center justify-center gap-1 bg-gradient-to-br ${mood.color} hover:opacity-90 transition-opacity`}
                >
                  <span className="text-lg">{mood.icon}</span>
                  <span className="font-medium text-sm">{mood.name}</span>
                  <div className="h-8 overflow-hidden text-center w-full px-1">
                    <p className="text-xs text-white/80 line-clamp-2 text-center">
                      {mood.description}
                    </p>
                  </div>
                </Button>

                {/* Back button that appears on hover */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="absolute top-1 left-1 h-6 w-6 p-1 bg-black/40 backdrop-blur-sm text-white/70 hover:text-white hover:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </Button>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-gray-800">
            <h3 className="text-xs font-medium text-gray-300 mb-2">Create Custom Mood</h3>
            <Textarea
              placeholder="Describe how you're feeling (e.g., 'I'm feeling nostalgic')..."
              className="min-h-[60px] bg-gray-950/80 border-gray-800 mb-2 text-sm"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
            />
            <Button
              onClick={handleGenerateCustomPrompt}
              disabled={isGenerating || !customPrompt.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-sm py-1 h-auto"
            >
              {isGenerating ? (
                <>
                  <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3 mr-1" />
                  Generate Custom Mood
                </>
              )}
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-1 border-t border-gray-800 pt-3 pb-3">
          <p className="text-xs text-gray-500">
            AI-powered mood selector creates audio that enhances your emotional state.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
