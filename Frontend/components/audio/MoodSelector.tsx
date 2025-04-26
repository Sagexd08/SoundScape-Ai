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
      description: 'Calm and peaceful sounds to reduce stress and anxiety',
      color: 'from-blue-500 to-cyan-400',
      icon: '🧘‍♂️'
    },
    {
      name: 'Energetic',
      description: 'Upbeat and motivating sounds to increase energy and focus',
      color: 'from-red-500 to-orange-400',
      icon: '⚡'
    },
    {
      name: 'Focused',
      description: 'Concentration-enhancing sounds with minimal distractions',
      color: 'from-indigo-600 to-blue-500',
      icon: '🧠'
    },
    {
      name: 'Peaceful',
      description: 'Tranquil sounds that create a sense of harmony and balance',
      color: 'from-green-500 to-emerald-400',
      icon: '🌿'
    },
    {
      name: 'Uplifting',
      description: 'Positive and inspiring sounds that elevate mood and spirit',
      color: 'from-yellow-500 to-amber-400',
      icon: '🌞'
    },
    {
      name: 'Melancholic',
      description: 'Reflective and emotional sounds that evoke thoughtfulness',
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
      <Card className="w-full max-w-lg bg-gray-900/95 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              Mood Selector
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Select a mood to customize your audio experience or create a custom mood
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {moods.map((mood) => (
              <Button
                key={mood.name}
                onClick={() => handleMoodSelect(mood.name)}
                className={`h-auto py-4 flex flex-col items-center justify-center gap-2 bg-gradient-to-br ${mood.color} hover:opacity-90 transition-opacity`}
              >
                <span className="text-2xl mb-1">{mood.icon}</span>
                <span className="font-medium">{mood.name}</span>
                <span className="text-xs text-white/80 text-center px-2">
                  {mood.description}
                </span>
              </Button>
            ))}
          </div>
          
          <div className="pt-4 border-t border-gray-800">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Create Custom Mood</h3>
            <Textarea
              placeholder="Describe how you're feeling or the mood you want to create (e.g., 'I'm feeling nostalgic and want music that reminds me of childhood')..."
              className="min-h-[80px] bg-gray-950/80 border-gray-800 mb-3"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
            />
            <Button
              onClick={handleGenerateCustomPrompt}
              disabled={isGenerating || !customPrompt.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {isGenerating ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Custom Mood
                </>
              )}
            </Button>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2 border-t border-gray-800 pt-4">
          <p className="text-xs text-gray-500">
            The mood selector uses AI to understand your emotional state and generate audio that enhances or complements it.
            For custom moods, our AI analyzes your description and creates a tailored audio experience.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
