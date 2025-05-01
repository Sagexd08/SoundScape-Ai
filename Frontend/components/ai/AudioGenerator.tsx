'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Wand2, Music, Loader2, Save, Play, Pause, Volume2, VolumeX, Sparkles, Clock, Download, Settings, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { post } from '@/lib/fetch-wrapper';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Sample presets for quick generation
const AUDIO_PRESETS = [
  { name: 'Forest Ambience', prompt: 'A peaceful forest with birds chirping and a gentle stream flowing', model: 'grok' },
  { name: 'Ocean Waves', prompt: 'Calm ocean waves crashing on a sandy beach with seagulls in the distance', model: 'grok' },
  { name: 'Rainy Day', prompt: 'Heavy rain falling on a roof with occasional thunder in the background', model: 'grok' },
  { name: 'Sci-Fi Atmosphere', prompt: 'Futuristic spaceship interior with subtle beeps and mechanical hums', model: 'gemini' },
  { name: 'Meditation', prompt: 'Peaceful meditation music with gentle bells and soft synthesizer pads', model: 'gemini' },
];

export default function AudioGenerator() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedModel, setSelectedModel] = useState('grok'); // 'grok' or 'gemini'
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationHistory, setGenerationHistory] = useState<Array<{id: string, prompt: string, model: string, timestamp: Date}>>([]);
  const [advancedOptions, setAdvancedOptions] = useState({
    duration: 10, // seconds
    saveToLibrary: true,
    quality: 'high', // 'low', 'medium', 'high'
    useEnhancedModel: false,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Update progress bar during audio playback
  useEffect(() => {
    if (!audioRef.current) return;

    const updateTime = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      if (audioRef.current) {
        setDuration(audioRef.current.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audioRef.current.addEventListener('timeupdate', updateTime);
    audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioRef.current.addEventListener('ended', handleEnded);

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', updateTime);
        audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audioRef.current.removeEventListener('ended', handleEnded);
      }
    };
  }, [generatedAudioUrl]);

  // Simulate generation progress
  useEffect(() => {
    if (isGenerating) {
      setGenerationProgress(0);
      const interval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return prev;
          }
          return prev + 5;
        });
      }, 500);

      return () => clearInterval(interval);
    } else if (generationProgress > 0 && generationProgress < 100) {
      setGenerationProgress(100);
    }
  }, [isGenerating]);

  const applyPreset = (preset: typeof AUDIO_PRESETS[0]) => {
    setPrompt(preset.prompt);
    setSelectedModel(preset.model);
    toast.info(`Preset applied: ${preset.name}`);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    try {
      setIsGenerating(true);
      setGeneratedAudioUrl(null);

      // Start progress animation
      setGenerationProgress(5);

      // Reset any previous errors
      setGenerationError(null);

      // Generate the audio
      const audioBlob = await post('/api/audio/generate', {
        prompt,
        options: {
          model: selectedModel,
          duration: advancedOptions.duration,
          quality: advancedOptions.quality,
          save_to_library: advancedOptions.saveToLibrary,
          enhanced_model: advancedOptions.useEnhancedModel,
        }
      }, { responseType: 'blob' });

      // Add to generation history
      const newHistoryItem = {
        id: Date.now().toString(),
        prompt: prompt,
        model: selectedModel,
        timestamp: new Date()
      };

      setGenerationHistory(prev => [newHistoryItem, ...prev.slice(0, 4)]);

      // Complete progress
      setGenerationProgress(100);

      // Create a URL for the blob
      const audioUrl = URL.createObjectURL(audioBlob);
      setGeneratedAudioUrl(audioUrl);

      toast.success('Audio generated successfully!');

      // Auto-play the generated audio
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.volume = volume / 100;
        audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error: any) {
      console.error('Error generating audio:', error);
      const errorMessage = error.message || 'Failed to generate audio';
      setGenerationError(errorMessage);
      toast.error(`${errorMessage}. Please try again or use a different model.`);
      setGenerationProgress(0);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedAudioUrl) return;

    const a = document.createElement('a');
    a.href = generatedAudioUrl;
    a.download = `soundscape-${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    toast.success('Audio downloaded successfully!');
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
            <TabsTrigger value="grok" className="flex items-center gap-1">
              <Sparkles className="h-4 w-4" />
              <span>Grok AI</span>
            </TabsTrigger>
            <TabsTrigger value="gemini" className="flex items-center gap-1">
              <Music className="h-4 w-4" />
              <span>Gemini AI</span>
            </TabsTrigger>
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

        {/* Quick Presets */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            Quick Presets
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {AUDIO_PRESETS.map((preset, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs justify-start truncate border-gray-800 hover:border-indigo-600 hover:bg-gray-800"
                onClick={() => applyPreset(preset)}
                disabled={isGenerating}
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="prompt" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-indigo-400" />
            Describe the audio you want to generate
          </Label>
          <Textarea
            id="prompt"
            placeholder="e.g., A peaceful forest with birds chirping and a gentle stream flowing"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px] bg-gray-950 border-gray-800"
            disabled={isGenerating}
          />
        </div>

        <div className="pt-2">
          <Button
            variant="outline"
            className="w-full flex justify-between items-center border-gray-800 hover:bg-gray-800/50"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          >
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-indigo-400" />
              Advanced Options
            </div>
            <Badge variant="outline" className="ml-2 text-xs">{showAdvancedOptions ? 'Hide' : 'Show'}</Badge>
          </Button>

          <AnimatePresence>
            {showAdvancedOptions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 pt-4 overflow-hidden"
              >

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration" className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-400" />
                Duration (seconds): {advancedOptions.duration}
              </Label>
              <Slider
                id="duration"
                min={5}
                max={30}
                step={1}
                value={[advancedOptions.duration]}
                onValueChange={(value) => setAdvancedOptions({...advancedOptions, duration: value[0]})}
                disabled={isGenerating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quality" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                Quality
              </Label>
              <select
                id="quality"
                className="w-full bg-gray-950 border border-gray-800 rounded-md p-2"
                value={advancedOptions.quality}
                onChange={(e) => setAdvancedOptions({...advancedOptions, quality: e.target.value as 'low' | 'medium' | 'high'})}
                disabled={isGenerating}
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
              disabled={isGenerating}
            />
            <Label htmlFor="save-library">Save to my library</Label>
          </div>
          <div className="flex items-center space-x-2 mt-4">
            <Switch
              id="enhanced-model"
              checked={advancedOptions.useEnhancedModel}
              onCheckedChange={(checked) => setAdvancedOptions({...advancedOptions, useEnhancedModel: checked})}
              disabled={isGenerating}
            />
            <div className="flex items-center">
              <Label htmlFor="enhanced-model">Use enhanced model</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 ml-1 text-gray-500 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-[200px] text-xs">Enhanced models produce higher quality audio but may take longer to generate</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

        {/* Generation Progress */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2 p-4 border border-indigo-900/50 bg-indigo-950/20 rounded-md"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                <Label className="text-sm text-indigo-400">Generating audio with {selectedModel === 'grok' ? 'Grok AI' : 'Gemini AI'}...</Label>
              </div>
              <span className="text-xs text-gray-400">{generationProgress}%</span>
            </div>
            <Progress value={generationProgress} className="h-1 bg-indigo-950" indicatorClassName="bg-indigo-500" />
            <p className="text-xs text-gray-400 mt-1">This may take up to {advancedOptions.quality === 'high' ? '30' : advancedOptions.quality === 'medium' ? '20' : '10'} seconds</p>
          </motion.div>
        )}

        {/* Error Message */}
        {generationError && !isGenerating && (
          <Alert variant="destructive" className="mt-4 bg-red-950/20 border-red-900/50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Generation Failed</AlertTitle>
            <AlertDescription className="text-sm">
              {generationError}
              <div className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-red-800 hover:bg-red-900/20"
                  onClick={() => setGenerationError(null)}
                >
                  Dismiss
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {generatedAudioUrl && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 p-4 bg-gray-900/50 backdrop-blur-sm rounded-lg border border-indigo-900/30 shadow-lg shadow-indigo-900/5"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium flex items-center">
                <Music className="h-4 w-4 mr-2 text-indigo-400" />
                Generated Audio
              </h4>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" size="sm" onClick={handleSaveToLibrary}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>

            {/* Playback progress */}
            <div className="mb-2">
              <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-400">
                  {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}
                </span>
                <span className="text-xs text-gray-400">
                  {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlayPause}
                className="h-10 w-10 rounded-full bg-indigo-600/30 hover:bg-indigo-600/50 text-white shadow-md"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
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
          </motion.div>
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
              Generating{generationProgress < 100 ? '...' : ' Complete'}
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Generate Audio with {selectedModel === 'grok' ? 'Grok AI' : 'Gemini AI'}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
