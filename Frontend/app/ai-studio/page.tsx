'use client';

import { useState, useRef, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wand2, FileAudio, Sparkles, Music, AlertCircle, Play, Pause, Volume2, VolumeX, Loader2, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/navbar';
import ModernBackgroundLayout from '@/components/layouts/ModernBackgroundLayout';
import MusicSelection from '@/components/music/MusicSelection';
import YouTubePlayer from '@/components/music/YouTubePlayer';
import { MusicTrack, getRandomTrack } from '@/lib/music-library';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

// Import AI utilities
import { generateAudio } from '@/lib/openai';
import { aiService, generateAudioPrompt } from '@/lib/ai-integration';

// Simplified AI Studio page with functional audio demo
export default function AIStudioPage() {
  const [activeTab, setActiveTab] = useState('generate');

  // Audio generator state
  const [prompt, setPrompt] = useState('');
  const [selectedEnvironment, setSelectedEnvironment] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioTitle, setAudioTitle] = useState('');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Format time in MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Update progress bar
  useEffect(() => {
    if (isPlaying) {
      progressIntervalRef.current = setInterval(() => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      }, 1000);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying]);

  // Handle progress change
  const handleProgressChange = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  // Handle audio generation
  const handleGenerateAudio = async () => {
    if (!prompt.trim() && !selectedEnvironment) {
      toast.error('Please enter a prompt or select an environment');
      return;
    }

    setIsGenerating(true);

    try {
      // Generate a prompt if user didn't provide one
      let finalPrompt = prompt.trim();
      let title = '';

      if (!finalPrompt && selectedEnvironment) {
        // Use our AI integration to generate an enhanced prompt
        toast.info('Generating AI-enhanced prompt using Grok and Gemini...');

        try {
          // Generate a prompt based on selected environment and mood using both Grok and Gemini
          finalPrompt = await aiService.generateEnhancedAudioPrompt({
            environment: selectedEnvironment,
            mood: selectedMood || 'relaxing'
          });

          toast.success('AI-enhanced prompt generated successfully!');
        } catch (error) {
          console.error('Error generating enhanced prompt:', error);
          // Fallback to basic prompt generation
          finalPrompt = generateAudioPrompt(
            selectedEnvironment,
            selectedMood || 'relaxing'
          );
          toast.error('Using basic prompt generation due to AI service error');
        }

        title = `${selectedEnvironment.charAt(0).toUpperCase() + selectedEnvironment.slice(1)} Environment`;
        if (selectedMood) {
          title += ` - ${selectedMood.charAt(0).toUpperCase() + selectedMood.slice(1)} Mood`;
        }
      } else {
        title = `Custom: ${finalPrompt.substring(0, 30)}${finalPrompt.length > 30 ? '...' : ''}`;
      }

      // Generate audio using OpenAI
      const audioUrl = await generateAudio(finalPrompt);

      setAudioTitle(title);
      setGeneratedAudioUrl(audioUrl);
      toast.success('Audio generated successfully!');

      // Auto-play the generated audio
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.volume = volume / 100;

        // Set up event listeners
        audioRef.current.onloadedmetadata = () => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
          }
        };

        audioRef.current.onended = () => {
          setIsPlaying(false);
        };

        audioRef.current.play().catch(err => {
          console.error('Error playing audio:', err);
          toast.error('Could not autoplay audio. Please click play manually.');
        });
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error in audio generation:', error);
      toast.error('Failed to generate audio. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => {
          console.error('Error playing audio:', err);
          toast.error('Could not play audio. Please try again.');
        });
      }
      setIsPlaying(!isPlaying);
    }
  };
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  // Handle environment selection
  const handleEnvironmentSelect = (env: string) => {
    setSelectedEnvironment(env === selectedEnvironment ? null : env);
  };

  // Handle mood selection
  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood === selectedMood ? null : mood);
  };

  // Music generation state
  const [musicPrompt, setMusicPrompt] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [isMusicGenerating, setIsMusicGenerating] = useState(false);
  const [selectedMusicTrack, setSelectedMusicTrack] = useState<MusicTrack | null>(null);

  // Handle genre selection
  const handleGenreSelect = (genre: string) => {
    setSelectedGenre(genre === selectedGenre ? null : genre);
  };

  // Handle instrument selection
  const handleInstrumentSelect = (instrument: string) => {
    if (selectedInstruments.includes(instrument)) {
      setSelectedInstruments(selectedInstruments.filter(i => i !== instrument));
    } else {
      setSelectedInstruments([...selectedInstruments, instrument]);
    }
  };

  // Handle music generation
  const handleGenerateMusic = async () => {
    if (!musicPrompt.trim() && !selectedGenre) {
      toast.error('Please enter a prompt or select a genre');
      return;
    }

    setIsMusicGenerating(true);

    try {
      toast.info('Finding the perfect music for you...');

      // Get genre and instruments from state
      const genre = selectedGenre || undefined;
      const instruments = selectedInstruments.length > 0 ? selectedInstruments : undefined;

      // Simulate API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Get a random track that matches the criteria
      const track = getRandomTrack(
        genre as string | undefined,
        instruments as string[] | undefined
      );

      // Set the selected track
      setSelectedMusicTrack(track);

      // Set audio title for display
      let title = track.title;
      if (track.artist) {
        title += ` - ${track.artist}`;
      }
      setAudioTitle(title);

      toast.success('Music found successfully!');
    } catch (error) {
      console.error('Error in music generation:', error);
      toast.error('Failed to find music. Please try again.');
    } finally {
      setIsMusicGenerating(false);
    }
  };



  // Additional initialization if needed
  useEffect(() => {
    // Any initialization logic can go here
  }, []);

  return (
    <ModernBackgroundLayout>
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-8 text-center"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              AI Audio Studio
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Create and analyze audio using state-of-the-art AI models from Grok and Gemini.
              Generate custom soundscapes or gain insights from your audio files.
            </p>
          </motion.div>

          <Alert className="mb-8 border-blue-500 bg-blue-500/10">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            <AlertTitle>OpenAI Integration Active</AlertTitle>
            <AlertDescription>
              The AI Studio uses OpenAI's Text-to-Speech API to generate custom audio. Enter a prompt or select an environment type and mood, then click "Generate Audio". If no API key is provided, sample audio files will be used instead.
            </AlertDescription>
          </Alert>

          <div className="max-w-4xl mx-auto">
            <Tabs
              defaultValue="generate"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="flex justify-center mb-6">
                <TabsList className="grid w-full max-w-md grid-cols-3">
                  <TabsTrigger value="generate" className="flex items-center gap-2">
                    <Wand2 className="h-4 w-4" />
                    <span>Generate Audio</span>
                  </TabsTrigger>
                  <TabsTrigger value="music" className="flex items-center gap-2">
                    <Music className="h-4 w-4" />
                    <span>Generate Music</span>
                  </TabsTrigger>
                  <TabsTrigger value="analyze" className="flex items-center gap-2">
                    <FileAudio className="h-4 w-4" />
                    <span>Analyze</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="generate" className="mt-0">
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
                  <CardContent>
                    <Textarea
                      placeholder="Describe the audio environment you want to generate..."
                      className="min-h-[100px] bg-gray-950 border-gray-800 mb-4"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-4 bg-gray-950 rounded-lg border border-gray-800">
                        <h4 className="font-medium mb-2">Environment Type</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant={selectedEnvironment === 'forest' ? 'default' : 'outline'}
                            size="sm"
                            className={`justify-start ${selectedEnvironment === 'forest' ? 'bg-indigo-600' : ''}`}
                            onClick={() => handleEnvironmentSelect('forest')}
                          >
                            Forest
                          </Button>
                          <Button
                            variant={selectedEnvironment === 'ocean' ? 'default' : 'outline'}
                            size="sm"
                            className={`justify-start ${selectedEnvironment === 'ocean' ? 'bg-indigo-600' : ''}`}
                            onClick={() => handleEnvironmentSelect('ocean')}
                          >
                            Ocean
                          </Button>
                          <Button
                            variant={selectedEnvironment === 'city' ? 'default' : 'outline'}
                            size="sm"
                            className={`justify-start ${selectedEnvironment === 'city' ? 'bg-indigo-600' : ''}`}
                            onClick={() => handleEnvironmentSelect('city')}
                          >
                            City
                          </Button>
                          <Button
                            variant={selectedEnvironment === 'cafe' ? 'default' : 'outline'}
                            size="sm"
                            className={`justify-start ${selectedEnvironment === 'cafe' ? 'bg-indigo-600' : ''}`}
                            onClick={() => handleEnvironmentSelect('cafe')}
                          >
                            Cafe
                          </Button>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-950 rounded-lg border border-gray-800">
                        <h4 className="font-medium mb-2">Mood</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant={selectedMood === 'relaxing' ? 'default' : 'outline'}
                            size="sm"
                            className={`justify-start ${selectedMood === 'relaxing' ? 'bg-indigo-600' : ''}`}
                            onClick={() => handleMoodSelect('relaxing')}
                          >
                            Relaxing
                          </Button>
                          <Button
                            variant={selectedMood === 'energetic' ? 'default' : 'outline'}
                            size="sm"
                            className={`justify-start ${selectedMood === 'energetic' ? 'bg-indigo-600' : ''}`}
                            onClick={() => handleMoodSelect('energetic')}
                          >
                            Energetic
                          </Button>
                          <Button
                            variant={selectedMood === 'focused' ? 'default' : 'outline'}
                            size="sm"
                            className={`justify-start ${selectedMood === 'focused' ? 'bg-indigo-600' : ''}`}
                            onClick={() => handleMoodSelect('focused')}
                          >
                            Focused
                          </Button>
                          <Button
                            variant={selectedMood === 'peaceful' ? 'default' : 'outline'}
                            size="sm"
                            className={`justify-start ${selectedMood === 'peaceful' ? 'bg-indigo-600' : ''}`}
                            onClick={() => handleMoodSelect('peaceful')}
                          >
                            Peaceful
                          </Button>
                        </div>
                      </div>
                    </div>

                    {generatedAudioUrl && (
                      <div className="mt-6 p-4 bg-gray-950 rounded-lg border border-gray-800">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium flex items-center">
                            <Music className="h-4 w-4 mr-2 text-indigo-400" />
                            {audioTitle}
                          </h4>
                        </div>

                        <div className="flex items-center space-x-4 mb-2">
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
                              value={[currentTime]}
                              min={0}
                              max={duration || 100}
                              step={0.1}
                              onValueChange={handleProgressChange}
                              className="mb-1"
                            />
                            <div className="flex justify-between text-xs text-gray-400">
                              <span>{formatTime(currentTime)}</span>
                              <span>{formatTime(duration)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Volume2 className="h-4 w-4 text-gray-500" />
                          <Slider
                            value={[volume]}
                            min={0}
                            max={100}
                            step={1}
                            onValueChange={handleVolumeChange}
                            className="w-24"
                          />
                        </div>

                        <audio ref={audioRef} className="hidden" controls />
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full bg-indigo-600 hover:bg-indigo-700"
                      onClick={handleGenerateAudio}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating Audio...
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
              </TabsContent>

              <TabsContent value="music" className="mt-0">
                <Card className="w-full bg-gray-900/90 backdrop-blur-lg border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Music className="h-5 w-5 text-indigo-400" />
                      AI Music Library
                    </CardTitle>
                    <CardDescription>
                      Browse and play high-quality music based on your preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedMusicTrack ? (
                      <div className="space-y-4">
                        <YouTubePlayer
                          track={selectedMusicTrack}
                          onClose={() => setSelectedMusicTrack(null)}
                        />

                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedMusicTrack(null)}
                            className="text-gray-400 hover:text-white"
                          >
                            Browse more music
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <Textarea
                          placeholder="Describe the music you want (e.g., 'Classical piano music for relaxation')..."
                          className="min-h-[80px] bg-gray-950/80 border-gray-800 mb-4"
                          value={musicPrompt}
                          onChange={(e) => setMusicPrompt(e.target.value)}
                        />

                        <MusicSelection
                          genre={selectedGenre || undefined}
                          instruments={selectedInstruments}
                          onSelectTrack={(track) => {
                            setSelectedMusicTrack(track);
                            setAudioTitle(`${track.title} - ${track.artist}`);
                          }}
                        />

                        <div className="flex justify-center pt-4">
                          <Button
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-6 py-6 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
                            onClick={handleGenerateMusic}
                            disabled={isMusicGenerating}
                          >
                            {isMusicGenerating ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Finding perfect music...
                              </>
                            ) : (
                              <>
                                <Music className="h-4 w-4 mr-2" />
                                Find Music For Me
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analyze" className="mt-0">
                <Card className="w-full bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileAudio className="h-5 w-5 text-indigo-400" />
                      AI Audio Analyzer (Powered by Grok)
                    </CardTitle>
                    <CardDescription>
                      Analyze audio files to extract insights and features using Grok's advanced audio understanding
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed border-gray-800 rounded-lg p-6 text-center mb-4">
                      <FileAudio className="h-10 w-10 text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-300 mb-2">Drag and drop an audio file or click to browse</p>
                      <p className="text-sm text-gray-500 mb-4">
                        Supports MP3, WAV, FLAC, AAC, OGG (max 10MB)
                      </p>
                      <Button variant="outline">
                        Select File
                      </Button>
                    </div>

                    <Alert className="mb-4 border-blue-500 bg-blue-500/10">
                      <AlertCircle className="h-4 w-4 text-blue-500" />
                      <AlertTitle>Grok AI Integration</AlertTitle>
                      <AlertDescription>
                        Our audio analyzer uses Grok's advanced audio understanding capabilities to provide detailed insights about your audio files, including mood, instruments, tempo, and more.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700" disabled>
                      <FileAudio className="h-4 w-4 mr-2" />
                      Analyze with Grok AI
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="mt-16 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-indigo-500/20 p-2 rounded-lg">
                    <Wand2 className="h-5 w-5 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-medium">OpenAI Audio API</h3>
                </div>
                <p className="text-gray-400 mb-4">
                  Our platform uses OpenAI's advanced audio generation capabilities to create realistic
                  environmental sounds and custom audio experiences.
                </p>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-400 mt-1 shrink-0" />
                    <span>Ultra-fast audio processing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-400 mt-1 shrink-0" />
                    <span>Detailed acoustic feature extraction</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-400 mt-1 shrink-0" />
                    <span>Realistic environmental sound generation</span>
                  </li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-purple-500/20 p-2 rounded-lg">
                    <FileAudio className="h-5 w-5 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-medium">Eleven Labs Voice AI</h3>
                </div>
                <p className="text-gray-400 mb-4">
                  We integrate with Eleven Labs' state-of-the-art voice technology for natural-sounding
                  narration and custom voice generation in your audio environments.
                </p>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-purple-400 mt-1 shrink-0" />
                    <span>Lifelike voice synthesis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-purple-400 mt-1 shrink-0" />
                    <span>Multilingual capabilities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-purple-400 mt-1 shrink-0" />
                    <span>Emotional tone control and customization</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </ModernBackgroundLayout>
  );
}
