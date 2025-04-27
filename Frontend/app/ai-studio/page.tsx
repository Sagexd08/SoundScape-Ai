'use client';

import { useState, useRef, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wand2, FileAudio, Sparkles, Music, AlertCircle, Play, Pause, Volume2, VolumeX, Loader2, Download, Camera, Zap, Shield, Headphones, MonitorSmartphone, Mic } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';
import ModernBackgroundLayout from '@/components/layouts/ModernBackgroundLayout';
import { useAuth } from '@/components/auth/auth-provider';
import MusicSelection from '@/components/music/MusicSelection';
import YouTubePlayer from '@/components/music/YouTubePlayer';
import SoundEffectsSelection from '@/components/audio/SoundEffectsSelection';
import SoundEffectPlayer from '@/components/audio/SoundEffectPlayer';
import CameraEnvironmentScanner from '@/components/audio/CameraEnvironmentScanner';
import MoodSelector from '@/components/audio/MoodSelector';
import RealTimeAdapter from '@/components/audio/RealTimeAdapter';
import SongSuggestions from '@/components/audio/SongSuggestions';
import MoodBasedSuggestions from '@/components/audio/MoodBasedSuggestions';
import ScreenpipeIntegration from '@/components/screenpipe/ScreenpipeIntegration';
import { MusicTrack, getRandomTrack } from '@/lib/music-library';
import { SoundEffect, getRandomSoundEffect } from '@/lib/sound-effects-library';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { AnimatedLoader } from '@/components/ui/animated-loader';
import { ModelSelector } from '@/components/ai/ModelSelector';

// Import AI utilities
import { generateAudio } from '@/lib/openai';
import { aiService, generateAudioPrompt, AIModelType } from '@/lib/ai-integration';

// Simplified AI Studio page with functional audio demo
export default function AIStudioPage() {
  const [activeTab, setActiveTab] = useState('generate');
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Check authentication
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="animate-pulse text-xl">Loading...</div>
      </div>
    );
  }

  // Only render the page if user is authenticated
  if (!user) {
    return null;
  }

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
        toast.info(`Generating AI-enhanced prompt using ${selectedAIModel === 'both' ? 'Grok and Gemini' : selectedAIModel === 'grok' ? 'Grok' : 'Gemini'}...`);

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

  // Sound effects state
  const [soundPrompt, setSoundPrompt] = useState('');
  const [selectedSoundEnvironment, setSelectedSoundEnvironment] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedSoundMood, setSelectedSoundMood] = useState<string | null>(null);
  const [isGeneratingSound, setIsGeneratingSound] = useState(false);
  const [selectedSoundEffect, setSelectedSoundEffect] = useState<SoundEffect | null>(null);

  // Audio analysis state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<{
    mood: string;
    tempo: string;
    instruments: string[];
    genre: string;
    quality: string;
    features: { name: string; value: number }[];
  } | null>(null);

  // New feature states
  const [showEnvironmentScanner, setShowEnvironmentScanner] = useState(false);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [showRealTimeAdapter, setShowRealTimeAdapter] = useState(false);
  const [selectedMoodForSuggestions, setSelectedMoodForSuggestions] = useState<string | null>(null);
  const [showMoodSuggestions, setShowMoodSuggestions] = useState(false);

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

  // Handle sound effect generation
  const handleGenerateSoundEffect = async () => {
    if (!soundPrompt.trim() && !selectedSoundEnvironment && selectedTags.length === 0 && !selectedSoundMood) {
      toast.error('Please enter a prompt or select environment options');
      return;
    }

    setIsGeneratingSound(true);

    try {
      toast.info('Finding the perfect sound environment for you...');

      // Get category, tags and mood from state
      const category = selectedSoundEnvironment || undefined;
      const tags = selectedTags.length > 0 ? selectedTags : undefined;
      const mood = selectedSoundMood || undefined;

      // Simulate API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Get a random sound effect that matches the criteria
      const sound = getRandomSoundEffect(
        category as string | undefined,
        tags as string[] | undefined,
        mood as string | undefined
      );

      // Set the selected sound effect
      setSelectedSoundEffect(sound);

      // Set audio title for display
      setAudioTitle(sound.title);

      toast.success('Sound environment found successfully!');
    } catch (error) {
      console.error('Error in sound effect generation:', error);
      toast.error('Failed to find sound environment. Please try again.');
    } finally {
      setIsGeneratingSound(false);
    }
  };

  // State for song suggestions
  const [environmentSongSuggestions, setEnvironmentSongSuggestions] = useState<Array<{
    title: string;
    artist: string;
    genre: string;
    youtubeUrl?: string;
  }> | null>(null);

  // Handle environment detection from camera or image
  const handleEnvironmentDetected = (
    environment: string,
    additionalData?: {
      description?: string;
      mood?: string;
      songSuggestions?: Array<{title: string, artist: string, genre: string}>;
    }
  ) => {
    setSelectedEnvironment(environment);
    toast.success(`Environment set to: ${environment}`);

    // If we have a description from Gemini, use it as the prompt
    if (additionalData?.description) {
      setPrompt(additionalData.description);

      // If we have a mood, set it
      if (additionalData.mood) {
        setSelectedMood(additionalData.mood);
      }

      // If we have song suggestions, save them
      if (additionalData.songSuggestions && additionalData.songSuggestions.length > 0) {
        setEnvironmentSongSuggestions(additionalData.songSuggestions);
        toast.success(`Found ${additionalData.songSuggestions.length} song suggestions for this environment`);
      }
    } else {
      // Generate a prompt based on the detected environment
      const environmentPrompts: Record<string, string> = {
        forest: "Peaceful forest with birds chirping and leaves rustling in the breeze",
        ocean: "Calming ocean waves crashing on the shore with seagulls in the distance",
        city: "Bustling city streets with traffic, conversations, and urban energy",
        cafe: "Cozy cafe ambiance with quiet chatter, clinking cups, and soft music",
        mountains: "Serene mountain atmosphere with wind through pines and distant echoes",
        rain: "Gentle rainfall on a roof with occasional thunder in the distance"
      };

      const generatedPrompt = environmentPrompts[environment] || `${environment} sounds and atmosphere`;
      setPrompt(generatedPrompt);

      // Generate default song suggestions if none were provided
      const defaultSuggestions: Record<string, Array<{title: string, artist: string, genre: string}>> = {
        forest: [
          { title: "Forest Dreams", artist: "Nature Sounds", genre: "Ambient" },
          { title: "Woodland Whispers", artist: "Eco Ensemble", genre: "New Age" }
        ],
        ocean: [
          { title: "Ocean Waves", artist: "Coastal Sounds", genre: "Ambient" },
          { title: "Seaside Serenity", artist: "Marine Melodies", genre: "New Age" }
        ],
        city: [
          { title: "Urban Pulse", artist: "City Beats", genre: "Electronic" },
          { title: "Metropolitan", artist: "Street Rhythm", genre: "Jazz Fusion" }
        ],
        cafe: [
          { title: "Coffee Shop Jazz", artist: "Cafe Collective", genre: "Jazz" },
          { title: "Morning Brew", artist: "Acoustic Ensemble", genre: "Acoustic" }
        ],
        mountains: [
          { title: "Alpine Ascent", artist: "Peak Performers", genre: "Orchestral" },
          { title: "Summit", artist: "Mountain Melody", genre: "Cinematic" }
        ],
        rain: [
          { title: "Rainfall", artist: "Storm Sounds", genre: "Ambient" },
          { title: "Gentle Downpour", artist: "Weather Tones", genre: "Lo-fi" }
        ]
      };

      setEnvironmentSongSuggestions(defaultSuggestions[environment] || []);
    }
  };

  // Handle mood selection
  const handleMoodSelected = (mood: string, customPrompt?: string) => {
    setSelectedMood(mood);

    if (customPrompt) {
      setPrompt(customPrompt);
      toast.success(`Custom mood prompt set: "${customPrompt}"`);
    } else {
      // Generate a prompt based on the selected mood
      const moodPrompts: Record<string, string> = {
        relaxing: "Calming and peaceful sounds that help reduce stress and anxiety",
        energetic: "Upbeat and motivating sounds that increase energy and focus",
        focused: "Concentration-enhancing sounds with minimal distractions",
        peaceful: "Tranquil sounds that create a sense of harmony and balance",
        uplifting: "Positive and inspiring sounds that elevate mood and spirit",
        melancholic: "Reflective and emotional sounds that evoke thoughtfulness"
      };

      const generatedPrompt = moodPrompts[mood] || `${mood} sounds and atmosphere`;
      setPrompt(generatedPrompt);
      toast.success(`Mood set to: ${mood}`);
    }
  };



  // State for card loading animations
  const [isCardsLoading, setIsCardsLoading] = useState(true);

  // State for AI model selection
  const [selectedAIModel, setSelectedAIModel] = useState<AIModelType>('both');

  // Handle AI model change
  const handleAIModelChange = (model: AIModelType) => {
    setSelectedAIModel(model);
    console.log(`AI model changed to: ${model}`);
  };

  // Additional initialization if needed
  useEffect(() => {
    // Simulate loading delay for cards
    const timer = setTimeout(() => {
      setIsCardsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ModernBackgroundLayout>
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 pb-16">
          {/* Environment Scanner Modal */}
          {showEnvironmentScanner && (
            <CameraEnvironmentScanner
              onEnvironmentDetected={handleEnvironmentDetected}
              onClose={() => setShowEnvironmentScanner(false)}
            />
          )}

          {/* Mood Selector Modal */}
          {showMoodSelector && (
            <MoodSelector
              onMoodSelected={handleMoodSelected}
              onClose={() => setShowMoodSelector(false)}
            />
          )}

          {/* Real-Time Adapter Modal */}
          {showRealTimeAdapter && (
            <RealTimeAdapter
              onClose={() => setShowRealTimeAdapter(false)}
            />
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-12 text-center relative"
          >
            <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-40 h-40 rounded-full bg-indigo-600/20 filter blur-[80px] animate-pulse-slow"></div>
            <div className="absolute -top-10 left-1/3 transform -translate-x-1/2 w-32 h-32 rounded-full bg-purple-600/20 filter blur-[60px] animate-pulse-slower"></div>
            <div className="absolute -top-15 right-1/3 transform translate-x-1/2 w-36 h-36 rounded-full bg-blue-600/20 filter blur-[70px] animate-pulse-slow"></div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              className="text-4xl md:text-5xl font-extrabold mb-6 relative z-10"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 animate-gradient bg-[length:200%_auto]">
                AI Audio Studio
              </span>
              <div className="w-40 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
              className="text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed mb-8"
            >
              Create and analyze audio using state-of-the-art AI models from Grok and Gemini.
              Generate custom soundscapes or gain insights from your audio files.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
              className="max-w-md mx-auto mb-8"
            >
              <div className="flex items-center gap-3 mb-3 justify-center">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                <h3 className="text-lg font-semibold text-gray-200">Select AI Model</h3>
              </div>
              <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-4">
                <ModelSelector onModelChange={handleAIModelChange} />
              </div>
            </motion.div>
          </motion.div>

          {/* Enhanced Quick Feature Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
            className="flex flex-wrap justify-center gap-6 mb-12 max-w-4xl mx-auto"
          >
            <motion.div
              whileHover={{ y: -5, scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="outline"
                className="bg-gradient-to-br from-blue-900/60 to-indigo-900/60 border-blue-700/70 hover:border-blue-500/80 transition-all duration-300 shadow-lg shadow-blue-900/20 hover:shadow-blue-600/30 py-6 px-8 rounded-xl min-w-[180px] h-auto"
                onClick={() => {
                  const featureSection = document.getElementById('feature-environment');
                  if (featureSection) {
                    featureSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <div className="flex flex-col items-center">
                  <div className="bg-blue-500/20 p-2 rounded-lg mb-3">
                    <Camera className="h-5 w-5 text-blue-400" />
                  </div>
                  <span className="font-medium text-sm whitespace-nowrap">Environment Audio</span>
                </div>
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ y: -5, scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="outline"
                className="bg-gradient-to-br from-purple-900/60 to-pink-900/60 border-purple-700/70 hover:border-purple-500/80 transition-all duration-300 shadow-lg shadow-purple-900/20 hover:shadow-purple-600/30 py-6 px-8 rounded-xl min-w-[180px] h-auto"
                onClick={() => {
                  const featureSection = document.getElementById('feature-mood');
                  if (featureSection) {
                    featureSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <div className="flex flex-col items-center">
                  <div className="bg-purple-500/20 p-2 rounded-lg mb-3">
                    <Sparkles className="h-5 w-5 text-purple-400" />
                  </div>
                  <span className="font-medium text-sm whitespace-nowrap">Mood Customization</span>
                </div>
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ y: -5, scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="outline"
                className="bg-gradient-to-br from-green-900/60 to-teal-900/60 border-green-700/70 hover:border-green-500/80 transition-all duration-300 shadow-lg shadow-green-900/20 hover:shadow-green-600/30 py-6 px-8 rounded-xl min-w-[180px] h-auto"
                onClick={() => {
                  const featureSection = document.getElementById('feature-realtime');
                  if (featureSection) {
                    featureSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <div className="flex flex-col items-center">
                  <div className="bg-green-500/20 p-2 rounded-lg mb-3">
                    <Zap className="h-5 w-5 text-green-400" />
                  </div>
                  <span className="font-medium text-sm whitespace-nowrap">Real-Time Adaptation</span>
                </div>
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ y: -5, scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="outline"
                className="bg-gradient-to-br from-cyan-900/60 to-blue-900/60 border-cyan-700/70 hover:border-cyan-500/80 transition-all duration-300 shadow-lg shadow-cyan-900/20 hover:shadow-cyan-600/30 py-6 px-8 rounded-xl min-w-[180px] h-auto"
                onClick={() => {
                  const featureSection = document.getElementById('feature-screenpipe');
                  if (featureSection) {
                    featureSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <div className="flex flex-col items-center">
                  <div className="bg-cyan-500/20 p-2 rounded-lg mb-3">
                    <MonitorSmartphone className="h-5 w-5 text-cyan-400" />
                  </div>
                  <span className="font-medium text-sm whitespace-nowrap">ScreenPipe Bridge</span>
                </div>
              </Button>
            </motion.div>
          </motion.div>

          <Alert className="mb-8 border-blue-500 bg-blue-500/10">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            <AlertTitle>AI Integration Active: {selectedAIModel === 'both' ? 'Grok & Gemini' : selectedAIModel === 'grok' ? 'Grok' : 'Gemini'}</AlertTitle>
            <AlertDescription>
              The AI Studio uses OpenAI's Text-to-Speech API with prompts generated by {selectedAIModel === 'both' ? 'both Grok and Gemini' : selectedAIModel === 'grok' ? 'Grok' : 'Gemini'}. Enter a prompt or select an environment type and mood, then click "Generate Audio". If no API key is provided, sample audio files will be used instead.
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
                <TabsList className="grid w-full max-w-3xl grid-cols-4">
                  <TabsTrigger value="generate" className="flex items-center justify-center gap-2 px-4 py-3 rounded-md data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                    <Wand2 className="h-4 w-4" />
                    <span>Generate Audio</span>
                  </TabsTrigger>
                  <TabsTrigger value="music" className="flex items-center justify-center gap-2 px-4 py-3 rounded-md data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                    <Music className="h-4 w-4" />
                    <span>Generate Music</span>
                  </TabsTrigger>
                  <TabsTrigger value="analyze" className="flex items-center justify-center gap-2 px-4 py-3 rounded-md data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                    <FileAudio className="h-4 w-4" />
                    <span>Analyze</span>
                  </TabsTrigger>
                  <TabsTrigger value="screenpipe" className="flex items-center justify-center gap-2 px-4 py-3 rounded-md data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                    <MonitorSmartphone className="h-4 w-4" />
                    <span>ScreenPipe</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="generate" className="mt-0">
                <Card className="w-full bg-gray-900/90 backdrop-blur-lg border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wand2 className="h-5 w-5 text-indigo-400" />
                      AI Sound Environment Library
                    </CardTitle>
                    <CardDescription>
                      Browse and play high-quality sound environments based on your preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedSoundEffect ? (
                      <div className="space-y-4">
                        <SoundEffectPlayer
                          sound={selectedSoundEffect}
                          onClose={() => setSelectedSoundEffect(null)}
                        />

                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedSoundEffect(null)}
                            className="text-gray-400 hover:text-white"
                          >
                            Browse more sounds
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <Textarea
                          placeholder="Describe the sound environment you want (e.g., 'Peaceful forest with birds and gentle rain')..."
                          className="min-h-[80px] bg-gray-950/80 border-gray-800 mb-4"
                          value={soundPrompt}
                          onChange={(e) => setSoundPrompt(e.target.value)}
                        />

                        <SoundEffectsSelection
                          category={selectedSoundEnvironment || undefined}
                          tags={selectedTags}
                          mood={selectedSoundMood || undefined}
                          onSelectSoundEffect={(sound) => {
                            setSelectedSoundEffect(sound);
                            setAudioTitle(sound.title);
                          }}
                        />

                        <div className="flex justify-center pt-4">
                          <Button
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-6 py-6 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
                            onClick={handleGenerateSoundEffect}
                            disabled={isGeneratingSound}
                          >
                            {isGeneratingSound ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Finding perfect sound...
                              </>
                            ) : (
                              <>
                                <Wand2 className="h-4 w-4 mr-2" />
                                Find Sound For Me
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
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
                      AI Audio Analyzer (Powered by {selectedAIModel === 'both' ? 'Grok & Gemini' : selectedAIModel === 'grok' ? 'Grok' : 'Gemini'})
                    </CardTitle>
                    <CardDescription>
                      Analyze audio files to extract insights and features using {selectedAIModel === 'both' ? 'both Grok and Gemini AI models' : selectedAIModel === 'grok' ? 'Grok\'s advanced audio understanding' : 'Gemini\'s powerful audio analysis'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!uploadedFile ? (
                      <div
                        className={`border-2 border-dashed border-gray-800 rounded-lg p-6 text-center mb-4 cursor-pointer hover:border-indigo-600 transition-colors duration-300 relative`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.currentTarget.classList.add('border-indigo-500');
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.currentTarget.classList.remove('border-indigo-500');
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.currentTarget.classList.remove('border-indigo-500');

                          const files = e.dataTransfer.files;
                          if (files.length > 0) {
                            const file = files[0];

                            // Check file type
                            const validTypes = ['.mp3', '.wav', '.flac', '.aac', '.ogg'];
                            const fileType = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
                            if (!validTypes.includes(fileType)) {
                              toast.error('Invalid file type. Please upload an audio file.');
                              return;
                            }

                            // Check file size (max 10MB)
                            if (file.size > 10 * 1024 * 1024) {
                              toast.error('File size exceeds 10MB limit');
                              return;
                            }

                            // Set the uploaded file in state
                            setUploadedFile(file);
                            toast.success(`File "${file.name}" uploaded successfully`);

                            // Reset any previous analysis
                            setAnalysisResults(null);
                          }
                        }}
                      >
                        <input
                          type="file"
                          id="audio-file-input"
                          className="hidden"
                          accept=".mp3,.wav,.flac,.aac,.ogg"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              // Check file size (max 10MB)
                              if (file.size > 10 * 1024 * 1024) {
                                toast.error('File size exceeds 10MB limit');
                                return;
                              }

                              // Set the uploaded file in state
                              setUploadedFile(file);
                              toast.success(`File "${file.name}" uploaded successfully`);

                              // Reset any previous analysis
                              setAnalysisResults(null);
                            }
                          }}
                        />
                        <label htmlFor="audio-file-input" className="block cursor-pointer">
                          <FileAudio className="h-10 w-10 text-gray-500 mx-auto mb-2" />
                          <p className="text-gray-300 mb-2">Drag and drop an audio file or click to browse</p>
                          <p className="text-sm text-gray-500 mb-4">
                            Supports MP3, WAV, FLAC, AAC, OGG (max 10MB)
                          </p>
                          <Button variant="outline" type="button">
                            Select File
                          </Button>
                        </label>
                      </div>
                    ) : (
                      <div className="mb-4">
                        <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <FileAudio className="h-5 w-5 text-indigo-400 mr-2" />
                              <span className="font-medium text-white">{uploadedFile.name}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setUploadedFile(null);
                                setAnalysisResults(null);
                              }}
                            >
                              Change
                            </Button>
                          </div>

                          <div className="w-full bg-gray-700/50 rounded-lg overflow-hidden relative">
                            {/* Audio player */}
                            <audio
                              controls
                              className="w-full h-12 opacity-0 absolute inset-0 z-10"
                              src={uploadedFile ? URL.createObjectURL(uploadedFile) : ''}
                            />

                            {/* Visual waveform overlay */}
                            <div className="absolute inset-0 flex items-center justify-center gap-0.5 pointer-events-none">
                              {Array.from({ length: 40 }).map((_, i) => (
                                <div
                                  key={i}
                                  className="w-1 bg-indigo-500/70"
                                  style={{
                                    height: `${Math.random() * 70 + 30}%`,
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        {analysisResults && (
                          <div className="bg-indigo-900/20 rounded-lg p-4 mb-4 border border-indigo-800/30">
                            <h3 className="text-lg font-medium mb-3 text-indigo-300">Analysis Results</h3>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <p className="text-sm text-gray-400 mb-1">Mood</p>
                                <p className="font-medium">{analysisResults.mood}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-400 mb-1">Genre</p>
                                <p className="font-medium">{analysisResults.genre}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-400 mb-1">Tempo</p>
                                <p className="font-medium">{analysisResults.tempo}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-400 mb-1">Quality</p>
                                <p className="font-medium">{analysisResults.quality}</p>
                              </div>
                            </div>

                            <div className="mb-4">
                              <p className="text-sm text-gray-400 mb-2">Instruments Detected</p>
                              <div className="flex flex-wrap gap-2">
                                {analysisResults.instruments.map((instrument, i) => (
                                  <span key={i} className="px-2 py-1 bg-indigo-900/40 rounded-full text-xs">
                                    {instrument}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div>
                              <p className="text-sm text-gray-400 mb-2">Audio Features</p>
                              <div className="space-y-2">
                                {analysisResults.features.map((feature, i) => (
                                  <div key={i}>
                                    <div className="flex justify-between text-xs mb-1">
                                      <span>{feature.name}</span>
                                      <span>{Math.round(feature.value * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-700/50 h-1.5 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-indigo-500"
                                        style={{ width: `${feature.value * 100}%` }}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <Alert className="mb-4 border-blue-500 bg-blue-500/10">
                      <AlertCircle className="h-4 w-4 text-blue-500" />
                      <AlertTitle>Grok AI Integration</AlertTitle>
                      <AlertDescription>
                        Our audio analyzer uses Grok's advanced audio understanding capabilities to provide detailed insights about your audio files, including mood, instruments, tempo, and more.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => {
                        if (!uploadedFile) {
                          toast.error('Please upload an audio file first');
                          return;
                        }

                        // Set analyzing state to show loading
                        setIsAnalyzing(true);
                        toast.info('Analyzing audio with Grok AI...');

                        // Simulate analysis with a timeout (would be an API call in production)
                        setTimeout(() => {
                          // Generate mock analysis results
                          const mockResults = {
                            mood: ['Energetic', 'Calm', 'Melancholic', 'Upbeat', 'Dramatic'][Math.floor(Math.random() * 5)],
                            tempo: ['Slow (60-80 BPM)', 'Moderate (90-120 BPM)', 'Fast (130-160 BPM)', 'Very Fast (160+ BPM)'][Math.floor(Math.random() * 4)],
                            instruments: [
                              'Piano', 'Guitar', 'Drums', 'Synthesizer', 'Bass', 'Strings', 'Vocals'
                            ].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4) + 2),
                            genre: ['Pop', 'Rock', 'Electronic', 'Classical', 'Jazz', 'Hip-Hop', 'Ambient'][Math.floor(Math.random() * 7)],
                            quality: ['Excellent', 'Good', 'Average', 'Poor'][Math.floor(Math.random() * 4)],
                            features: [
                              { name: 'Danceability', value: Math.random() },
                              { name: 'Energy', value: Math.random() },
                              { name: 'Acousticness', value: Math.random() },
                              { name: 'Instrumentalness', value: Math.random() },
                              { name: 'Liveness', value: Math.random() },
                              { name: 'Speechiness', value: Math.random() }
                            ]
                          };

                          // Update state with results
                          setAnalysisResults(mockResults);
                          setIsAnalyzing(false);
                          toast.success('Analysis complete!');
                        }, 1500); // Simulate a 1.5 second analysis time
                      }}
                      disabled={isAnalyzing || !uploadedFile}
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <FileAudio className="h-4 w-4 mr-2" />
                          Analyze with Grok AI
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="screenpipe" className="mt-0">
                <ScreenpipeIntegration
                  onContentAnalyzed={(data) => {
                    if (data.environment) {
                      handleEnvironmentDetected(
                        data.environment,
                        {
                          description: data.description,
                          mood: data.mood,
                          songSuggestions: data.songSuggestions
                        }
                      );
                    }
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>

          <div className="mt-16 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                className="bg-gradient-to-br from-gray-900 to-gray-950 border border-indigo-800/30 rounded-xl p-8 shadow-lg min-h-[280px]"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="bg-indigo-500/20 p-3 rounded-lg border border-indigo-500/20 shadow-md">
                    <Wand2 className="h-6 w-6 text-indigo-400" />
                  </div>
                  <h3 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-400">OpenAI Audio API</h3>
                </div>
                <p className="text-gray-300 mb-5 text-base leading-relaxed">
                  Our platform uses OpenAI's advanced audio generation capabilities to create realistic
                  environmental sounds and custom audio experiences.
                </p>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-3 bg-indigo-900/10 p-2.5 rounded-lg border border-indigo-800/20 transition-all duration-300 hover:bg-indigo-800/20 group">
                    <Sparkles className="h-5 w-5 text-indigo-400 mt-0.5 shrink-0 group-hover:text-indigo-300 transition-colors duration-300" />
                    <span className="text-base group-hover:text-white transition-colors duration-300">Ultra-fast audio processing</span>
                  </li>
                  <li className="flex items-start gap-3 bg-indigo-900/10 p-2.5 rounded-lg border border-indigo-800/20 transition-all duration-300 hover:bg-indigo-800/20 group">
                    <Sparkles className="h-5 w-5 text-indigo-400 mt-0.5 shrink-0 group-hover:text-indigo-300 transition-colors duration-300" />
                    <span className="text-base group-hover:text-white transition-colors duration-300">Detailed acoustic feature extraction</span>
                  </li>
                  <li className="flex items-start gap-3 bg-indigo-900/10 p-2.5 rounded-lg border border-indigo-800/20 transition-all duration-300 hover:bg-indigo-800/20 group">
                    <Sparkles className="h-5 w-5 text-indigo-400 mt-0.5 shrink-0 group-hover:text-indigo-300 transition-colors duration-300" />
                    <span className="text-base group-hover:text-white transition-colors duration-300">Realistic environmental sound generation</span>
                  </li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
                className="bg-gradient-to-br from-gray-900 to-gray-950 border border-purple-800/30 rounded-xl p-8 shadow-lg min-h-[280px]"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="bg-purple-500/20 p-3 rounded-lg border border-purple-500/20 shadow-md">
                    <FileAudio className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">Eleven Labs Voice AI</h3>
                </div>
                <p className="text-gray-300 mb-5 text-base leading-relaxed">
                  We integrate with Eleven Labs' state-of-the-art voice technology for natural-sounding
                  narration and custom voice generation in your audio environments.
                </p>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-3 bg-purple-900/10 p-2.5 rounded-lg border border-purple-800/20 transition-all duration-300 hover:bg-purple-800/20 group">
                    <Sparkles className="h-5 w-5 text-purple-400 mt-0.5 shrink-0 group-hover:text-purple-300 transition-colors duration-300" />
                    <span className="text-base group-hover:text-white transition-colors duration-300">Lifelike voice synthesis</span>
                  </li>
                  <li className="flex items-start gap-3 bg-purple-900/10 p-2.5 rounded-lg border border-purple-800/20 transition-all duration-300 hover:bg-purple-800/20 group">
                    <Sparkles className="h-5 w-5 text-purple-400 mt-0.5 shrink-0 group-hover:text-purple-300 transition-colors duration-300" />
                    <span className="text-base group-hover:text-white transition-colors duration-300">Multilingual capabilities</span>
                  </li>
                  <li className="flex items-start gap-3 bg-purple-900/10 p-2.5 rounded-lg border border-purple-800/20 transition-all duration-300 hover:bg-purple-800/20 group">
                    <Sparkles className="h-5 w-5 text-purple-400 mt-0.5 shrink-0 group-hover:text-purple-300 transition-colors duration-300" />
                    <span className="text-base group-hover:text-white transition-colors duration-300">Emotional tone control and customization</span>
                  </li>
                </ul>
              </motion.div>
            </div>

            {/* New Feature Cards Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="mt-16 mb-12 text-center relative"
            >
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-48 h-48 rounded-full bg-indigo-600/15 filter blur-[80px] animate-pulse-slow"></div>

              <motion.h2
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                className="text-3xl md:text-4xl font-extrabold mb-6 relative z-10"
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-gradient bg-[length:200%_auto] tracking-tight">
                  Advanced Audio Features
                </span>
                <div className="w-48 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mt-6 rounded-full shadow-lg shadow-indigo-500/20"></div>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
                className="text-gray-300 max-w-2xl mx-auto mb-12 text-lg leading-relaxed tracking-wide"
              >
                Experience our cutting-edge audio technology with these powerful features
              </motion.p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-8 auto-rows-fr max-w-6xl mx-auto">
              {/* Environment-Based Audio */}
              <motion.div
                id="feature-environment"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                className="feature-card from-blue-900/50 to-indigo-900/50 flex flex-col h-full min-h-[600px] relative overflow-hidden"
              >
                {isCardsLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm rounded-xl z-10">
                    <AnimatedLoader
                      variant="card"
                      text="Loading Environment Audio..."
                      iconType="audio"
                      className="w-64"
                    />
                  </div>
                )}
                <div className="bg-gradient-to-br from-blue-500/30 to-indigo-500/30 p-4 rounded-lg w-16 h-16 flex items-center justify-center mb-5 border border-blue-500/30 shadow-lg shadow-blue-500/20 relative group">
                  <div className="absolute inset-0 bg-blue-500/10 rounded-lg filter blur-sm group-hover:blur-md transition-all duration-300"></div>
                  <Camera className="h-8 w-8 text-blue-400 group-hover:text-blue-300 transition-all duration-300 relative z-10" />
                </div>
                <h3 className="text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 animate-gradient">Environment-Based Audio</h3>
                <p className="text-gray-300 mb-6 text-base leading-relaxed tracking-wide">
                  Generate immersive soundscapes based on different environments like forests, oceans, cities, and cafes.
                </p>

                {/* Environment Selection */}
                <div className="bg-black/20 rounded-lg p-4 mb-5 border border-blue-800/30">
                  <h3 className="text-sm font-medium text-blue-300 mb-3">Popular Environments</h3>
                  <div className="grid grid-cols-3 gap-2 mb-0">
                    {['Forest', 'Ocean', 'City', 'Cafe', 'Mountains', 'Rain'].map((env) => (
                      <Button
                        key={env}
                        variant="outline"
                        size="sm"
                        className="h-auto py-1.5 px-2 border-blue-800/30 hover:bg-blue-800/30 transition-all text-xs truncate"
                        onClick={() => {
                          handleEnvironmentDetected(env.toLowerCase());
                          toast.success(`Environment set to: ${env}`);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        {env}
                      </Button>
                    ))}
                  </div>
                </div>

                <ul className="space-y-3 text-gray-300 text-sm mb-5 min-h-[100px]">
                  <li className="feature-card-list-item animate-shimmer bg-blue-900/20 border-blue-800/30 hover:bg-blue-800/30 hover:border-blue-700/40">
                    <div className="bg-blue-500/20 p-1.5 rounded-full">
                      <Sparkles className="h-4 w-4 text-blue-400 feature-card-list-item-icon" />
                    </div>
                    <span className="feature-card-list-item-text font-medium">Camera environment detection</span>
                  </li>
                  <li className="feature-card-list-item animate-shimmer bg-blue-900/20 border-blue-800/30 hover:bg-blue-800/30 hover:border-blue-700/40">
                    <div className="bg-blue-500/20 p-1.5 rounded-full">
                      <Sparkles className="h-4 w-4 text-blue-400 feature-card-list-item-icon" />
                    </div>
                    <span className="feature-card-list-item-text font-medium">Gemini AI image analysis</span>
                  </li>
                  <li className="feature-card-list-item animate-shimmer bg-blue-900/20 border-blue-800/30 hover:bg-blue-800/30 hover:border-blue-700/40">
                    <div className="bg-blue-500/20 p-1.5 rounded-full">
                      <Sparkles className="h-4 w-4 text-blue-400 feature-card-list-item-icon" />
                    </div>
                    <span className="feature-card-list-item-text font-medium">Audio playback with controls</span>
                  </li>
                </ul>
                <div className="mt-auto">
                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 font-bold text-sm py-5 shadow-xl transform hover:scale-[1.03] transition-all duration-200 uppercase tracking-wider border-t border-blue-500/30 whitespace-normal h-auto"
                    onClick={() => {
                      setShowEnvironmentScanner(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <Camera className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span className="text-center">Scan Environment</span>
                  </Button>
                </div>
              </motion.div>

              {/* Mood-Based Customization */}
              <motion.div
                id="feature-mood"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
                className="feature-card from-purple-900/50 to-pink-900/50 flex flex-col h-full min-h-[600px] relative overflow-hidden"
              >
                {isCardsLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm rounded-xl z-10">
                    <AnimatedLoader
                      variant="card"
                      text="Loading Mood Customization..."
                      iconType="sparkles"
                      className="w-64"
                    />
                  </div>
                )}
                <div className="bg-gradient-to-br from-purple-500/30 to-pink-500/30 p-4 rounded-lg w-16 h-16 flex items-center justify-center mb-5 border border-purple-500/30 shadow-lg shadow-purple-500/20 relative group">
                  <div className="absolute inset-0 bg-purple-500/10 rounded-lg filter blur-sm group-hover:blur-md transition-all duration-300"></div>
                  <Sparkles className="h-8 w-8 text-purple-400 group-hover:text-purple-300 transition-all duration-300 relative z-10" />
                </div>
                <h3 className="text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 animate-gradient">Mood-Based Customization</h3>
                <p className="text-gray-300 mb-6 text-base leading-relaxed tracking-wide">
                  Tailor audio to match your emotional state, whether relaxing, energetic, focused, or peaceful.
                </p>

                {/* Mood Selection */}
                <div className="bg-black/20 rounded-lg p-4 mb-5 border border-purple-800/30">
                  <h3 className="text-sm font-medium text-purple-300 mb-3">Select a Mood</h3>
                  <div className="grid grid-cols-3 gap-2 mb-0">
                    {['Relaxing', 'Energetic', 'Focused'].map((mood) => (
                      <Button
                        key={mood}
                        variant="outline"
                        size="sm"
                        className="h-auto py-1.5 px-2 border-purple-800/30 hover:bg-purple-800/30 transition-all text-xs truncate"
                        onClick={() => {
                          setSelectedMoodForSuggestions(mood.toLowerCase());
                          setShowMoodSuggestions(true);
                          toast.success(`Mood set to: ${mood}`);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        {mood}
                      </Button>
                    ))}
                  </div>
                </div>

                <ul className="space-y-3 text-gray-300 text-sm mb-5 min-h-[100px]">
                  <li className="feature-card-list-item animate-shimmer bg-purple-900/20 border-purple-800/30 hover:bg-purple-800/30 hover:border-purple-700/40">
                    <div className="bg-purple-500/20 p-1.5 rounded-full">
                      <Sparkles className="h-4 w-4 text-purple-400 feature-card-list-item-icon" />
                    </div>
                    <span className="feature-card-list-item-text font-medium">Mood-based audio generation</span>
                  </li>
                  <li className="feature-card-list-item animate-shimmer bg-purple-900/20 border-purple-800/30 hover:bg-purple-800/30 hover:border-purple-700/40">
                    <div className="bg-purple-500/20 p-1.5 rounded-full">
                      <Sparkles className="h-4 w-4 text-purple-400 feature-card-list-item-icon" />
                    </div>
                    <span className="feature-card-list-item-text font-medium">Suggested tracks for each mood</span>
                  </li>
                  <li className="feature-card-list-item animate-shimmer bg-purple-900/20 border-purple-800/30 hover:bg-purple-800/30 hover:border-purple-700/40">
                    <div className="bg-purple-500/20 p-1.5 rounded-full">
                      <Sparkles className="h-4 w-4 text-purple-400 feature-card-list-item-icon" />
                    </div>
                    <span className="feature-card-list-item-text font-medium">AI-enhanced emotional audio</span>
                  </li>
                </ul>
                <div className="mt-auto">
                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-bold text-sm py-5 shadow-xl transform hover:scale-[1.03] transition-all duration-200 uppercase tracking-wider border-t border-purple-500/30 whitespace-normal h-auto"
                    onClick={() => {
                      setShowMoodSelector(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <Sparkles className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span className="text-center">Advanced Mood Selection</span>
                  </Button>
                </div>
              </motion.div>

              {/* Real-Time Adaptation */}
              <motion.div
                id="feature-realtime"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
                className="feature-card from-green-900/50 to-teal-900/50 flex flex-col h-full min-h-[600px] relative overflow-hidden"
              >
                {isCardsLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm rounded-xl z-10">
                    <AnimatedLoader
                      variant="card"
                      text="Loading Real-Time Adaptation..."
                      iconType="zap"
                      className="w-64"
                    />
                  </div>
                )}
                <div className="bg-gradient-to-br from-green-500/30 to-teal-500/30 p-4 rounded-lg w-16 h-16 flex items-center justify-center mb-5 border border-green-500/30 shadow-lg shadow-green-500/20 relative group">
                  <div className="absolute inset-0 bg-green-500/10 rounded-lg filter blur-sm group-hover:blur-md transition-all duration-300"></div>
                  <Zap className="h-8 w-8 text-green-400 group-hover:text-green-300 transition-all duration-300 relative z-10" />
                </div>
                <h3 className="text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-400 animate-gradient">Real-Time Adaptation</h3>
                <p className="text-gray-300 mb-6 text-base leading-relaxed tracking-wide">
                  Experience audio environments that adapt to your surroundings and context in real-time.
                </p>

                {/* ANC and ENC Features */}
                <div className="bg-black/20 rounded-lg p-4 mb-5 border border-green-800/30">
                  <h3 className="text-sm font-medium text-green-300 mb-3 flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Noise Control Features
                  </h3>

                  <div className="grid grid-cols-2 gap-3 mb-0">
                    <div className="bg-green-900/20 rounded-lg p-3 border border-green-800/30 hover:bg-green-800/20 transition-all duration-300">
                      <div className="flex items-center mb-2">
                        <Headphones className="h-4 w-4 text-green-400 mr-2 feature-card-list-item-icon" />
                        <span className="text-sm font-medium text-white">ANC</span>
                      </div>
                      <p className="text-xs text-gray-300 feature-card-list-item-text">
                        Active Noise Cancellation
                      </p>
                    </div>

                    <div className="bg-green-900/20 rounded-lg p-3 border border-green-800/30 hover:bg-green-800/20 transition-all duration-300">
                      <div className="flex items-center mb-2">
                        <Volume2 className="h-4 w-4 text-green-400 mr-2 feature-card-list-item-icon" />
                        <span className="text-sm font-medium text-white">ENC</span>
                      </div>
                      <p className="text-xs text-gray-300 feature-card-list-item-text">
                        Environmental Noise Control
                      </p>
                    </div>
                  </div>
                </div>

                <ul className="space-y-3 text-gray-300 text-sm mb-5 min-h-[100px]">
                  <li className="feature-card-list-item animate-shimmer bg-green-900/20 border-green-800/30 hover:bg-green-800/30 hover:border-green-700/40">
                    <div className="bg-green-500/20 p-1.5 rounded-full">
                      <Sparkles className="h-4 w-4 text-green-400 feature-card-list-item-icon" />
                    </div>
                    <span className="feature-card-list-item-text font-medium">Continuous environment analysis</span>
                  </li>
                  <li className="feature-card-list-item animate-shimmer bg-green-900/20 border-green-800/30 hover:bg-green-800/30 hover:border-green-700/40">
                    <div className="bg-green-500/20 p-1.5 rounded-full">
                      <Sparkles className="h-4 w-4 text-green-400 feature-card-list-item-icon" />
                    </div>
                    <span className="feature-card-list-item-text font-medium">Dynamic audio transitions</span>
                  </li>
                  <li className="feature-card-list-item animate-shimmer bg-green-900/20 border-green-800/30 hover:bg-green-800/30 hover:border-green-700/40">
                    <div className="bg-green-500/20 p-1.5 rounded-full">
                      <Sparkles className="h-4 w-4 text-green-400 feature-card-list-item-icon" />
                    </div>
                    <span className="feature-card-list-item-text font-medium">Adaptive noise masking</span>
                  </li>
                </ul>
                <div className="mt-auto">
                  <Button
                    className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 font-bold text-sm py-5 shadow-xl transform hover:scale-[1.03] transition-all duration-200 uppercase tracking-wider border-t border-green-500/30 whitespace-normal h-auto"
                    onClick={() => {
                      setShowRealTimeAdapter(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <Zap className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span className="text-center">Activate Real-Time</span>
                  </Button>
                </div>
              </motion.div>

              {/* Screenpipe Integration */}
              <motion.div
                id="feature-screenpipe"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.5 }}
                className="feature-card from-cyan-900/50 to-blue-900/50 flex flex-col h-full min-h-[600px] relative overflow-hidden"
              >
                {isCardsLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm rounded-xl z-10">
                    <AnimatedLoader
                      variant="card"
                      text="Loading ScreenPipe Bridge..."
                      iconType="headphones"
                      className="w-64"
                    />
                  </div>
                )}
                <div className="bg-gradient-to-br from-cyan-500/30 to-blue-500/30 p-4 rounded-lg w-16 h-16 flex items-center justify-center mb-5 border border-cyan-500/30 shadow-lg shadow-cyan-500/20 relative group">
                  <div className="absolute inset-0 bg-cyan-500/10 rounded-lg filter blur-sm group-hover:blur-md transition-all duration-300"></div>
                  <MonitorSmartphone className="h-8 w-8 text-cyan-400 group-hover:text-cyan-300 transition-all duration-300 relative z-10" />
                </div>
                <h3 className="text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 animate-gradient">ScreenPipe Bridge</h3>
                <p className="text-gray-300 mb-6 text-base leading-relaxed tracking-wide">
                  Creates a direct channel between your screen analysis and dynamic soundscape generator.
                </p>

                {/* Features */}
                <div className="bg-black/20 rounded-lg p-4 mb-5 border border-cyan-800/30">
                  <h3 className="text-sm font-medium text-cyan-300 mb-3">Key Features</h3>
                  <div className="space-y-3">
                    <div className="feature-card-list-item bg-cyan-900/20 border-cyan-800/20 hover:bg-cyan-800/20 p-2">
                      <div className="bg-cyan-500/20 p-1 rounded-full">
                        <Camera className="h-4 w-4 text-cyan-400 feature-card-list-item-icon" />
                      </div>
                      <span className="feature-card-list-item-text text-sm">24/7 Screen Recording</span>
                    </div>
                    <div className="feature-card-list-item bg-cyan-900/20 border-cyan-800/20 hover:bg-cyan-800/20 p-2">
                      <div className="bg-cyan-500/20 p-1 rounded-full">
                        <Mic className="h-4 w-4 text-cyan-400 feature-card-list-item-icon" />
                      </div>
                      <span className="feature-card-list-item-text text-sm">Ambient Audio Capture</span>
                    </div>
                  </div>
                </div>

                <ul className="space-y-3 text-gray-300 text-sm mb-5 min-h-[100px]">
                  <li className="feature-card-list-item animate-shimmer bg-cyan-900/20 border-cyan-800/30 hover:bg-cyan-800/30 hover:border-cyan-700/40">
                    <div className="bg-cyan-500/20 p-1.5 rounded-full">
                      <Sparkles className="h-4 w-4 text-cyan-400 feature-card-list-item-icon" />
                    </div>
                    <span className="feature-card-list-item-text font-medium">100% local processing</span>
                  </li>
                  <li className="feature-card-list-item animate-shimmer bg-cyan-900/20 border-cyan-800/30 hover:bg-cyan-800/30 hover:border-cyan-700/40">
                    <div className="bg-cyan-500/20 p-1.5 rounded-full">
                      <Sparkles className="h-4 w-4 text-cyan-400 feature-card-list-item-icon" />
                    </div>
                    <span className="feature-card-list-item-text font-medium">Privacy-first design</span>
                  </li>
                  <li className="feature-card-list-item animate-shimmer bg-cyan-900/20 border-cyan-800/30 hover:bg-cyan-800/30 hover:border-cyan-700/40">
                    <div className="bg-cyan-500/20 p-1.5 rounded-full">
                      <Sparkles className="h-4 w-4 text-cyan-400 feature-card-list-item-icon" />
                    </div>
                    <span className="feature-card-list-item-text font-medium">Context-aware AI</span>
                  </li>
                </ul>
                <div className="mt-auto">
                  <Button
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 font-bold text-sm py-5 shadow-xl transform hover:scale-[1.03] transition-all duration-200 uppercase tracking-wider border-t border-cyan-500/30 whitespace-normal h-auto"
                    onClick={() => {
                      // Add a new tab for Screenpipe
                      setActiveTab('screenpipe');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <MonitorSmartphone className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span className="text-center">Activate ScreenPipe</span>
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </ModernBackgroundLayout>
  );
}
