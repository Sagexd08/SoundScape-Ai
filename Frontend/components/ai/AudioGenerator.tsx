'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Wand2, Music, Loader2, Save, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { post } from '@/lib/fetch-wrapper';
import { toast } from 'sonner';

export default function AudioGenerator() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedModel, setSelectedModel] = useState('grok'); // 'grok' or 'gemini'
  const [advancedOptions, setAdvancedOptions] = useState({
    duration: 10, // seconds
    saveToLibrary: true,
    quality: 'high', // 'low', 'medium', 'high'
  });
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }
    
    try {
      setIsGenerating(true);
      setGeneratedAudioUrl(null);
      
      const response = await post('/api/audio/generate', {
        prompt,
        options: {
          model: selectedModel,
          duration: advancedOptions.duration,
          quality: advancedOptions.quality,
          save_to_library: advancedOptions.saveToLibrary,
        }
      }, { responseType: 'blob' });
      
      // Create a URL for the blob
      const audioUrl = URL.createObjectURL(response);
      setGeneratedAudioUrl(audioUrl);
      
      toast.success('Audio generated successfully!');
      
      // Auto-play the generated audio
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.volume = volume / 100;
        audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error generating audio:', error);
      toast.error('Failed to generate audio. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };
  
  const handleSaveToLibrary = async () => {
    if (!generatedAudioUrl) return;
    
    try {
      await post('/api/audio/save', {
        audio_url: generatedAudioUrl,
        title: prompt.substring(0, 50),
        description: prompt,
      });
      
      toast.success('Audio saved to your library!');
    } catch (error) {
      console.error('Error saving audio:', error);
      toast.error('Failed to save audio. Please try again.');
    }
  };
  
  return (
    <Card className="w-full bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-indigo-400" />
          AI Audio Generator
        </CardTitle>
        <CardDescription>
          Create custom audio environments using AI
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Tabs defaultValue="grok" onValueChange={(value) => setSelectedModel(value)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="grok">Grok AI</TabsTrigger>
            <TabsTrigger value="gemini">Gemini AI</TabsTrigger>
          </TabsList>
          
          <TabsContent value="grok" className="mt-4">
            <p className="text-sm text-gray-400 mb-4">
              Grok specializes in creating realistic environmental sounds and ambient audio.
            </p>
          </TabsContent>
          
          <TabsContent value="gemini" className="mt-4">
            <p className="text-sm text-gray-400 mb-4">
              Gemini excels at creating music-like compositions and complex audio scenes.
            </p>
          </TabsContent>
        </Tabs>
        
        <div className="space-y-2">
          <Label htmlFor="prompt">Describe the audio you want to generate</Label>
          <Textarea
            id="prompt"
            placeholder="e.g., A peaceful forest with birds chirping and a gentle stream flowing"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px] bg-gray-950 border-gray-800"
          />
        </div>
        
        <div className="space-y-4 pt-2">
          <div className="flex justify-between items-center">
            <Label>Advanced Options</Label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (seconds): {advancedOptions.duration}</Label>
              <Slider
                id="duration"
                min={5}
                max={30}
                step={1}
                value={[advancedOptions.duration]}
                onValueChange={(value) => setAdvancedOptions({...advancedOptions, duration: value[0]})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quality">Quality</Label>
              <select
                id="quality"
                className="w-full bg-gray-950 border border-gray-800 rounded-md p-2"
                value={advancedOptions.quality}
                onChange={(e) => setAdvancedOptions({...advancedOptions, quality: e.target.value as 'low' | 'medium' | 'high'})}
              >
                <option value="low">Low (Faster)</option>
                <option value="medium">Medium</option>
                <option value="high">High (Slower)</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="save-library"
              checked={advancedOptions.saveToLibrary}
              onCheckedChange={(checked) => setAdvancedOptions({...advancedOptions, saveToLibrary: checked})}
            />
            <Label htmlFor="save-library">Save to my library</Label>
          </div>
        </div>
        
        {generatedAudioUrl && (
          <div className="mt-4 p-4 bg-gray-950 rounded-lg border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium flex items-center">
                <Music className="h-4 w-4 mr-2 text-indigo-400" />
                Generated Audio
              </h4>
              <Button variant="outline" size="sm" onClick={handleSaveToLibrary}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlayPause}
                className="h-10 w-10 rounded-full"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="h-8 w-8 rounded-full"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              
              <div className="flex-1">
                <Slider
                  value={[volume]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={handleVolumeChange}
                />
              </div>
            </div>
            
            <audio ref={audioRef} className="hidden" controls />
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating || !prompt.trim()} 
          className="w-full bg-indigo-600 hover:bg-indigo-700"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Generate Audio
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
