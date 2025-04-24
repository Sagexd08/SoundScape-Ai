// Music Library with YouTube and Spotify links for different genres and instruments

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  instruments: string[];
  youtubeUrl: string;
  spotifyUrl?: string;
  thumbnailUrl: string;
  duration: number; // in seconds
  description?: string;
}

// Classical Music Collection
const classicalMusic: MusicTrack[] = [
  {
    id: 'classical-1',
    title: 'Moonlight Sonata',
    artist: 'Ludwig van Beethoven',
    genre: 'Classical',
    instruments: ['Piano'],
    youtubeUrl: 'https://www.youtube.com/embed/4Tr0otuiQuU',
    spotifyUrl: 'https://open.spotify.com/track/3eHjBSa9iyYKSGZhRXFwSP',
    thumbnailUrl: 'https://img.youtube.com/vi/4Tr0otuiQuU/hqdefault.jpg',
    duration: 386,
    description: 'Piano Sonata No. 14 in C-sharp minor, Op. 27, No. 2'
  },
  {
    id: 'classical-2',
    title: 'Clair de Lune',
    artist: 'Claude Debussy',
    genre: 'Classical',
    instruments: ['Piano'],
    youtubeUrl: 'https://www.youtube.com/embed/WNcsUNKlAKw',
    spotifyUrl: 'https://open.spotify.com/track/5eTkJl3tIK2URc6nxm7iB3',
    thumbnailUrl: 'https://img.youtube.com/vi/WNcsUNKlAKw/hqdefault.jpg',
    duration: 302,
    description: 'Suite bergamasque, L. 75'
  },
  {
    id: 'classical-3',
    title: 'Nocturne in E-flat major',
    artist: 'Frédéric Chopin',
    genre: 'Classical',
    instruments: ['Piano'],
    youtubeUrl: 'https://www.youtube.com/embed/9E6b3swbnWg',
    spotifyUrl: 'https://open.spotify.com/track/2tTDKMImOBJUWYwxZVEfK9',
    thumbnailUrl: 'https://img.youtube.com/vi/9E6b3swbnWg/hqdefault.jpg',
    duration: 273,
    description: 'Op. 9, No. 2'
  },
  {
    id: 'classical-4',
    title: 'The Four Seasons - Spring',
    artist: 'Antonio Vivaldi',
    genre: 'Classical',
    instruments: ['Violin', 'Strings'],
    youtubeUrl: 'https://www.youtube.com/embed/mFWQgxXsYYo',
    spotifyUrl: 'https://open.spotify.com/track/3c1EgMgUq06TPK0OJxAZZD',
    thumbnailUrl: 'https://img.youtube.com/vi/mFWQgxXsYYo/hqdefault.jpg',
    duration: 621,
    description: 'Concerto No. 1 in E major, Op. 8, RV 269'
  },
  {
    id: 'classical-5',
    title: 'Symphony No. 5',
    artist: 'Ludwig van Beethoven',
    genre: 'Classical',
    instruments: ['Orchestra'],
    youtubeUrl: 'https://www.youtube.com/embed/fOk8Tm815lE',
    spotifyUrl: 'https://open.spotify.com/track/1mYGy3a0YBNvktRUKGFubd',
    thumbnailUrl: 'https://img.youtube.com/vi/fOk8Tm815lE/hqdefault.jpg',
    duration: 435,
    description: 'Symphony No. 5 in C minor, Op. 67'
  }
];

// Ambient Music Collection
const ambientMusic: MusicTrack[] = [
  {
    id: 'ambient-1',
    title: 'Weightless',
    artist: 'Marconi Union',
    genre: 'Ambient',
    instruments: ['Synth', 'Piano'],
    youtubeUrl: 'https://www.youtube.com/embed/UfcAVejslrU',
    spotifyUrl: 'https://open.spotify.com/track/1ZqrSX3SG14W4a7uGZYRbV',
    thumbnailUrl: 'https://img.youtube.com/vi/UfcAVejslrU/hqdefault.jpg',
    duration: 480,
    description: 'Scientifically engineered to reduce anxiety'
  },
  {
    id: 'ambient-2',
    title: 'Ambient 1: Music for Airports',
    artist: 'Brian Eno',
    genre: 'Ambient',
    instruments: ['Synth', 'Piano'],
    youtubeUrl: 'https://www.youtube.com/embed/vNwYtllyt3Q',
    spotifyUrl: 'https://open.spotify.com/track/7wvwrZPGgNxwwF9iFwA3Bt',
    thumbnailUrl: 'https://img.youtube.com/vi/vNwYtllyt3Q/hqdefault.jpg',
    duration: 1020,
    description: 'Pioneering ambient music album'
  },
  {
    id: 'ambient-3',
    title: 'Structures from Silence',
    artist: 'Steve Roach',
    genre: 'Ambient',
    instruments: ['Synth'],
    youtubeUrl: 'https://www.youtube.com/embed/QaW5K85UDR0',
    spotifyUrl: 'https://open.spotify.com/track/3d0TJ5pWMq1JHTLHQDrPiD',
    thumbnailUrl: 'https://img.youtube.com/vi/QaW5K85UDR0/hqdefault.jpg',
    duration: 900,
    description: 'Meditative ambient masterpiece'
  }
];

// Electronic Music Collection
const electronicMusic: MusicTrack[] = [
  {
    id: 'electronic-1',
    title: 'Strobe',
    artist: 'Deadmau5',
    genre: 'Electronic',
    instruments: ['Synth'],
    youtubeUrl: 'https://www.youtube.com/embed/tKi9Z-f6qX4',
    spotifyUrl: 'https://open.spotify.com/track/7gHs73wELdeycvS48JfIos',
    thumbnailUrl: 'https://img.youtube.com/vi/tKi9Z-f6qX4/hqdefault.jpg',
    duration: 603,
    description: 'Progressive house classic'
  },
  {
    id: 'electronic-2',
    title: 'Flim',
    artist: 'Aphex Twin',
    genre: 'Electronic',
    instruments: ['Synth', 'Piano'],
    youtubeUrl: 'https://www.youtube.com/embed/RhHkUg-QCwk',
    spotifyUrl: 'https://open.spotify.com/track/1hxIiJHJLQr9YBu0TYqvFk',
    thumbnailUrl: 'https://img.youtube.com/vi/RhHkUg-QCwk/hqdefault.jpg',
    duration: 179,
    description: 'From the album Come to Daddy'
  },
  {
    id: 'electronic-3',
    title: 'Oxygène (Part IV)',
    artist: 'Jean-Michel Jarre',
    genre: 'Electronic',
    instruments: ['Synth'],
    youtubeUrl: 'https://www.youtube.com/embed/kSIMVnPA994',
    spotifyUrl: 'https://open.spotify.com/track/2lmcuXNkjYOoQeXvwqvvFT',
    thumbnailUrl: 'https://img.youtube.com/vi/kSIMVnPA994/hqdefault.jpg',
    duration: 248,
    description: 'Electronic music pioneer'
  }
];

// Jazz Music Collection
const jazzMusic: MusicTrack[] = [
  {
    id: 'jazz-1',
    title: 'Take Five',
    artist: 'Dave Brubeck',
    genre: 'Jazz',
    instruments: ['Piano', 'Saxophone'],
    youtubeUrl: 'https://www.youtube.com/embed/vmDDOFXSgAs',
    spotifyUrl: 'https://open.spotify.com/track/5UbLKRXu8z5aLuFIEVR38i',
    thumbnailUrl: 'https://img.youtube.com/vi/vmDDOFXSgAs/hqdefault.jpg',
    duration: 325,
    description: 'From the album Time Out'
  },
  {
    id: 'jazz-2',
    title: 'So What',
    artist: 'Miles Davis',
    genre: 'Jazz',
    instruments: ['Trumpet', 'Piano'],
    youtubeUrl: 'https://www.youtube.com/embed/zqNTltOGh5c',
    spotifyUrl: 'https://open.spotify.com/track/4vLYewWIvqHfUiHzYXnhYm',
    thumbnailUrl: 'https://img.youtube.com/vi/zqNTltOGh5c/hqdefault.jpg',
    duration: 547,
    description: 'From the album Kind of Blue'
  },
  {
    id: 'jazz-3',
    title: 'Autumn Leaves',
    artist: 'Bill Evans Trio',
    genre: 'Jazz',
    instruments: ['Piano'],
    youtubeUrl: 'https://www.youtube.com/embed/r-Z8KuwI7Gc',
    spotifyUrl: 'https://open.spotify.com/track/2YKVBhCNR5ykQPXkxnLHCD',
    thumbnailUrl: 'https://img.youtube.com/vi/r-Z8KuwI7Gc/hqdefault.jpg',
    duration: 379,
    description: 'Jazz standard performed by the legendary Bill Evans Trio'
  }
];

// Combine all music collections
export const musicLibrary: MusicTrack[] = [
  ...classicalMusic,
  ...ambientMusic,
  ...electronicMusic,
  ...jazzMusic
];

// Function to filter music by genre and instruments
export function filterMusic(genre?: string, instruments?: string[]): MusicTrack[] {
  let filteredMusic = [...musicLibrary];
  
  // Filter by genre if provided
  if (genre) {
    filteredMusic = filteredMusic.filter(track => 
      track.genre.toLowerCase() === genre.toLowerCase()
    );
  }
  
  // Filter by instruments if provided
  if (instruments && instruments.length > 0) {
    filteredMusic = filteredMusic.filter(track => 
      instruments.some(instrument => 
        track.instruments.includes(instrument)
      )
    );
  }
  
  return filteredMusic;
}

// Function to get a random track from filtered results
export function getRandomTrack(genre?: string, instruments?: string[]): MusicTrack {
  const filteredTracks = filterMusic(genre, instruments);
  
  if (filteredTracks.length === 0) {
    // Return a random track from the entire library if no matches
    return musicLibrary[Math.floor(Math.random() * musicLibrary.length)];
  }
  
  return filteredTracks[Math.floor(Math.random() * filteredTracks.length)];
}

// Function to search for tracks by keyword
export function searchTracks(keyword: string): MusicTrack[] {
  const searchTerm = keyword.toLowerCase();
  
  return musicLibrary.filter(track => 
    track.title.toLowerCase().includes(searchTerm) ||
    track.artist.toLowerCase().includes(searchTerm) ||
    track.genre.toLowerCase().includes(searchTerm) ||
    track.instruments.some(instrument => instrument.toLowerCase().includes(searchTerm)) ||
    (track.description && track.description.toLowerCase().includes(searchTerm))
  );
}

// Function to get tracks by specific instrument
export function getTracksByInstrument(instrument: string): MusicTrack[] {
  return musicLibrary.filter(track => 
    track.instruments.some(inst => inst.toLowerCase() === instrument.toLowerCase())
  );
}

// Function to format duration from seconds to MM:SS
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
