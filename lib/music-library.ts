export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  instruments: string[];
  duration: number; // in seconds
  coverImage?: string;
  previewUrl?: string;
  fullTrackUrl?: string;
  mood?: string[];
  tempo?: 'slow' | 'medium' | 'fast';
  year?: number;
}

// Sample music tracks database
const musicTracks: MusicTrack[] = [
  {
    id: '1',
    title: 'Moonlight Sonata',
    artist: 'Ludwig van Beethoven',
    genre: 'Classical',
    instruments: ['Piano'],
    duration: 360,
    previewUrl: '/audio/moonlight-sonata-preview.mp3',
    mood: ['calm', 'melancholic'],
    tempo: 'slow',
    year: 1801
  },
  {
    id: '2',
    title: 'Ambient Dreams',
    artist: 'Echo Waves',
    genre: 'Ambient',
    instruments: ['Synth', 'Piano'],
    duration: 285,
    previewUrl: '/audio/ambient-dreams-preview.mp3',
    mood: ['peaceful', 'atmospheric'],
    tempo: 'slow'
  },
  {
    id: '3',
    title: 'Electronic Pulse',
    artist: 'Digital Horizon',
    genre: 'Electronic',
    instruments: ['Synth', 'Drums'],
    duration: 240,
    previewUrl: '/audio/electronic-pulse-preview.mp3',
    mood: ['energetic', 'upbeat'],
    tempo: 'fast'
  },
  {
    id: '4',
    title: 'Jazz Improvisation',
    artist: 'Blue Note Quartet',
    genre: 'Jazz',
    instruments: ['Saxophone', 'Piano', 'Bass', 'Drums'],
    duration: 420,
    previewUrl: '/audio/jazz-improv-preview.mp3',
    mood: ['lively', 'expressive'],
    tempo: 'medium'
  },
  {
    id: '5',
    title: 'Symphony No. 9',
    artist: 'Vienna Philharmonic',
    genre: 'Classical',
    instruments: ['Orchestra', 'Strings', 'Brass', 'Woodwinds'],
    duration: 540,
    previewUrl: '/audio/symphony-9-preview.mp3',
    mood: ['powerful', 'dramatic'],
    tempo: 'medium',
    year: 1824
  },
  // Add more tracks as needed
];

// Get all music tracks
export function getAllTracks(): MusicTrack[] {
  return musicTracks;
}

// Filter music by genre and/or instruments
export function filterMusic(genre?: string, instruments?: string[]): MusicTrack[] {
  let result = [...musicTracks];
  
  if (genre) {
    result = result.filter(track => track.genre === genre);
  }
  
  if (instruments && instruments.length > 0) {
    result = result.filter(track => 
      instruments.some(instrument => track.instruments.includes(instrument))
    );
  }
  
  return result;
}

// Search music by query
export function searchMusic(query: string): MusicTrack[] {
  if (!query.trim()) return musicTracks;
  
  const searchTerm = query.toLowerCase();
  return musicTracks.filter(track => 
    track.title.toLowerCase().includes(searchTerm) ||
    track.artist.toLowerCase().includes(searchTerm) ||
    track.genre.toLowerCase().includes(searchTerm) ||
    track.instruments.some(i => i.toLowerCase().includes(searchTerm)) ||
    (track.mood && track.mood.some(m => m.toLowerCase().includes(searchTerm)))
  );
}

// Get track by ID
export function getTrackById(id: string): MusicTrack | undefined {
  return musicTracks.find(track => track.id === id);
}

// Get tracks by mood
export function getTracksByMood(mood: string): MusicTrack[] {
  return musicTracks.filter(track => 
    track.mood && track.mood.includes(mood.toLowerCase())
  );
}

// Get tracks by tempo
export function getTracksByTempo(tempo: 'slow' | 'medium' | 'fast'): MusicTrack[] {
  return musicTracks.filter(track => track.tempo === tempo);
}

// Get unique genres
export function getUniqueGenres(): string[] {
  return [...new Set(musicTracks.map(track => track.genre))];
}

// Get unique instruments
export function getUniqueInstruments(): string[] {
  const instruments = musicTracks.flatMap(track => track.instruments);
  return [...new Set(instruments)];
}

// Get unique moods
export function getUniqueMoods(): string[] {
  const moods = musicTracks.flatMap(track => track.mood || []);
  return [...new Set(moods)];
}