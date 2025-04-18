'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Wand2, Music, Loader2, Save, Play, Pause, Volume2, VolumeX, 
  Clock, Metronome, Guitar, Smile, Disc, Download
} from 'lucide-react';
import { post } from '@/lib/fetch-wrapper';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

// Available genres
const genres = [
  "ambient", "electronic", "classical", "jazz", "rock", "pop", "hip-hop",
  "folk", "country", "blues", "r&b", "soul", "funk", "reggae", "world",
  "experimental", "cinematic", "orchestral", "chillout", "lofi"
];

// Available moods
const moods = [
  "relaxed", "energetic", "happy", "sad", "melancholic", "peaceful",
  "tense", "mysterious", "romantic", "epic", "playful", "dark",
  "uplifting", "dramatic", "nostalgic", "ethereal", "intense"
];

// Available instruments
const instruments = [
  "piano", "guitar", "violin", "cello", "flute", "clarinet", "saxophone",
  "trumpet", "drums", "bass", "synth", "pad", "strings", "choir", "harp",
  "bells", "marimba", "organ", "electric guitar", "acoustic guitar"
];

export default function MusicGenerator() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMusicUrl, setGeneratedMusicUrl] = useState<string | null>(null);
  const [waveformUrl, setWaveformUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedModel, setSelectedModel] = useState('grok'); // 'grok' or 'gemini'
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Music parameters
  const [selectedGenre, setSelectedGenre] = useState<string | undefined>(undefined);
  const [selectedMood, setSelectedMood] = useState<string | undefined>(undefined);
  const [tempo, setTempo] = useState(90);
  const [musicDuration, setMusicDuration] = useState(60);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [saveToLibrary, setSaveToLibrary] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
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
  
  // Format time in MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }
    
    try {
      setIsGenerating(true);
      setGeneratedMusicUrl(null);
      setWaveformUrl(null);
      
      const response = await post('/api/music/generate', {
        prompt,
        model: selectedModel,
        genre: selectedGenre,
        mood: selectedMood,
        tempo: tempo,
        instruments: selectedInstruments.length > 0 ? selectedInstruments : undefined,
        duration: musicDuration,
        save_to_library: saveToLibrary
      }, { responseType: 'blob' });
      
      // Get metadata from response headers
      const metadataHeader = response.headers.get('X-Music-Metadata');
      let metadata = {};
      
      if (metadataHeader) {
        try {
          metadata = JSON.parse(metadataHeader);
          console.log('Music metadata:', metadata);
          
          // If there's a waveform image, set it
          if (metadata.waveform_url) {
            setWaveformUrl(metadata.waveform_url);
          }
        } catch (error) {
          console.error('Error parsing metadata:', error);
        }
      }
      
      // Create a URL for the blob
      const musicUrl = URL.createObjectURL(response);
      setGeneratedMusicUrl(musicUrl);
      
      toast.success('Music generated successfully!');
      
      // Auto-play the generated music
      if (audioRef.current) {
        audioRef.current.src = musicUrl;
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
        
        audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error generating music:', error);
      toast.error('Failed to generate music. Please try again.');
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
  
  const handleProgressChange = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };
  
  const handleInstrumentToggle = (instrument: string) => {
    setSelectedInstruments(prev => 
      prev.includes(instrument)
        ? prev.filter(i => i !== instrument)
        : [...prev, instrument]
    );
  };
  
  const handleDownload = () => {
    if (generatedMusicUrl) {
      const a = document.createElement('a');
      a.href = generatedMusicUrl;
      a.download = `generated_music_${Date.now()}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };
  
  return (
    <Card className="w-full bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5 text-indigo-400" />
          AI Music Generator
        </CardTitle>
        <CardDescription>
          Create custom music using AI with detailed control over genre, mood, and instruments
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
              Grok specializes in creating music with complex structures and realistic instrument sounds.
            </p>
          </TabsContent>
          
          <TabsContent value="gemini" className="mt-4">
            <p className="text-sm text-gray-400 mb-4">
              Gemini excels at creating unique and experimental musical compositions with innovative sounds.
            </p>
          </TabsContent>
        </Tabs>
        
        <div className="space-y-2">
          <Label htmlFor="prompt">Describe the music you want to generate</Label>
          <Textarea
            id="prompt"
            placeholder="e.g., A peaceful piano melody with gentle strings that builds to an emotional climax"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px] bg-gray-950 border-gray-800"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Disc className="h-4 w-4 text-indigo-400" />
                Genre
              </Label>
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger className="bg-gray-950 border-gray-800">
                  <SelectValue placeholder="Select a genre" />
                </SelectTrigger>
                <SelectContent className="bg-gray-950 border-gray-800">
                  {genres.map(genre => (
                    <SelectItem key={genre} value={genre}>
                      {genre.charAt(0).toUpperCase() + genre.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Smile className="h-4 w-4 text-indigo-400" />
                Mood
              </Label>
              <Select value={selectedMood} onValueChange={setSelectedMood}>
                <SelectTrigger className="bg-gray-950 border-gray-800">
                  <SelectValue placeholder="Select a mood" />
                </SelectTrigger>
                <SelectContent className="bg-gray-950 border-gray-800">
                  {moods.map(mood => (
                    <SelectItem key={mood} value={mood}>
                      {mood.charAt(0).toUpperCase() + mood.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tempo" className="flex items-center gap-2">
                <Metronome className="h-4 w-4 text-indigo-400" />
                Tempo: {tempo} BPM
              </Label>
              <Slider
                id="tempo"
                min={40}
                max={200}
                step={1}
                value={[tempo]}
                onValueChange={(value) => setTempo(value[0])}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="duration" className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-400" />
                Duration: {musicDuration} seconds
              </Label>
              <Slider
                id="duration"
                min={30}
                max={180}
                step={10}
                value={[musicDuration]}
                onValueChange={(value) => setMusicDuration(value[0])}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Guitar className="h-4 w-4 text-indigo-400" />
                Instruments
              </Label>
              <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto p-2 bg-gray-950 border border-gray-800 rounded-md">
                {instruments.map(instrument => (
                  <div key={instrument} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`instrument-${instrument}`} 
                      checked={selectedInstruments.includes(instrument)}
                      onCheckedChange={() => handleInstrumentToggle(instrument)}
                    />
                    <label 
                      htmlFor={`instrument-${instrument}`}
                      className="text-sm text-gray-300 cursor-pointer"
                    >
                      {instrument.charAt(0).toUpperCase() + instrument.slice(1)}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 pt-2">
          <Switch
            id="save-library"
            checked={saveToLibrary}
            onCheckedChange={setSaveToLibrary}
          />
          <Label htmlFor="save-library">Save to my library</Label>
        </div>
        
        {generatedMusicUrl && (
          <div className="mt-4 p-4 bg-gray-950 rounded-lg border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium flex items-center">
                <Music className="h-4 w-4 mr-2 text-indigo-400" />
                Generated Music
              </h4>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
            
            {waveformUrl && (
              <div className="mb-4 bg-gray-900 rounded-md overflow-hidden">
                <img 
                  src={waveformUrl} 
                  alt="Audio waveform" 
                  className="w-full h-24 object-cover"
                />
              </div>
            )}
            
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
          onClick={handleGenerate} 
          disabled={isGenerating || !prompt.trim()} 
          className="w-full bg-indigo-600 hover:bg-indigo-700"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating Music...
            </>
          ) : (
            <>
              <Music className="h-4 w-4 mr-2" />
              Generate Music
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
