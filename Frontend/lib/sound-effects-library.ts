// Sound Effects Library with categorized audio environments

export interface SoundEffect {
  id: string;
  title: string;
  category: string;
  tags: string[];
  youtubeUrl: string;
  spotifyUrl?: string;
  iconName: string; // Name of the Lucide icon to use
  duration: number; // in seconds
  description?: string;
  mood?: string;
}

// Nature Sound Effects
const natureSounds: SoundEffect[] = [
  {
    id: 'nature-1',
    title: 'Forest Ambience',
    category: 'Nature',
    tags: ['Forest', 'Birds', 'Wind', 'Relaxing'],
    youtubeUrl: 'https://www.youtube.com/embed/xNN7iTA57jM',
    spotifyUrl: 'https://open.spotify.com/track/5IfFEGpq7GXE0Q6PQNV6oJ',
    iconName: 'Trees',
    duration: 3600,
    description: 'Peaceful forest sounds with birds chirping and gentle wind through leaves',
    mood: 'Relaxing'
  },
  {
    id: 'nature-2',
    title: 'Ocean Waves',
    category: 'Nature',
    tags: ['Ocean', 'Waves', 'Beach', 'Water'],
    youtubeUrl: 'https://www.youtube.com/embed/WHPEKLQID4U',
    spotifyUrl: 'https://open.spotify.com/track/3CepTOU9Y7FezTbT6RgfX6',
    iconName: 'Waves',
    duration: 3600,
    description: 'Gentle ocean waves breaking on a sandy beach',
    mood: 'Peaceful'
  },
  {
    id: 'nature-3',
    title: 'Thunderstorm',
    category: 'Nature',
    tags: ['Rain', 'Thunder', 'Storm'],
    youtubeUrl: 'https://www.youtube.com/embed/yIQd2Ya0Ziw',
    spotifyUrl: 'https://open.spotify.com/track/1hKdDCpiI9mqz1jVHRKG0E',
    iconName: 'Cloud-Rain',
    duration: 3600,
    description: 'Powerful thunderstorm with heavy rain and distant thunder',
    mood: 'Dramatic'
  },
  {
    id: 'nature-4',
    title: 'Gentle Stream',
    category: 'Nature',
    tags: ['Water', 'Stream', 'River', 'Relaxing'],
    youtubeUrl: 'https://www.youtube.com/embed/IvjMgVS6kng',
    spotifyUrl: 'https://open.spotify.com/track/5IfFEGpq7GXE0Q6PQNV6oJ',
    iconName: 'Droplets',
    duration: 3600,
    description: 'Soothing sounds of a gentle stream flowing over rocks',
    mood: 'Relaxing'
  },
  {
    id: 'nature-5',
    title: 'Crickets at Night',
    category: 'Nature',
    tags: ['Night', 'Insects', 'Crickets', 'Evening'],
    youtubeUrl: 'https://www.youtube.com/embed/eKmRkS1os7k',
    spotifyUrl: 'https://open.spotify.com/track/5IfFEGpq7GXE0Q6PQNV6oJ',
    iconName: 'Moon',
    duration: 3600,
    description: 'Peaceful evening ambience with cricket chirping',
    mood: 'Peaceful'
  }
];

// Urban Sound Effects
const urbanSounds: SoundEffect[] = [
  {
    id: 'urban-1',
    title: 'Cafe Ambience',
    category: 'Urban',
    tags: ['Cafe', 'Coffee Shop', 'Chatter', 'Indoors'],
    youtubeUrl: 'https://www.youtube.com/embed/BOdLmxy06H0',
    spotifyUrl: 'https://open.spotify.com/track/1FqHmAkfVj50jtxGwlQJdI',
    iconName: 'Coffee',
    duration: 3600,
    description: 'Busy cafe with quiet conversations, clinking cups, and background music',
    mood: 'Focused'
  },
  {
    id: 'urban-2',
    title: 'City Streets',
    category: 'Urban',
    tags: ['City', 'Traffic', 'People', 'Busy'],
    youtubeUrl: 'https://www.youtube.com/embed/8XKmgD5gBRA',
    spotifyUrl: 'https://open.spotify.com/track/1FqHmAkfVj50jtxGwlQJdI',
    iconName: 'Building',
    duration: 3600,
    description: 'Bustling city streets with traffic, pedestrians, and urban energy',
    mood: 'Energetic'
  },
  {
    id: 'urban-3',
    title: 'Subway Train',
    category: 'Urban',
    tags: ['Subway', 'Train', 'Transport', 'Underground'],
    youtubeUrl: 'https://www.youtube.com/embed/qWZL5RnfgtI',
    spotifyUrl: 'https://open.spotify.com/track/1FqHmAkfVj50jtxGwlQJdI',
    iconName: 'Train',
    duration: 3600,
    description: 'Rhythmic sounds of a subway train with station announcements',
    mood: 'Focused'
  },
  {
    id: 'urban-4',
    title: 'Office Ambience',
    category: 'Urban',
    tags: ['Office', 'Typing', 'Work', 'Indoors'],
    youtubeUrl: 'https://www.youtube.com/embed/Kd4FcGvL6GE',
    spotifyUrl: 'https://open.spotify.com/track/1FqHmAkfVj50jtxGwlQJdI',
    iconName: 'Briefcase',
    duration: 3600,
    description: 'Productive office environment with typing, quiet conversations, and office equipment',
    mood: 'Focused'
  }
];

// Ambient Sound Effects
const ambientSounds: SoundEffect[] = [
  {
    id: 'ambient-1',
    title: 'White Noise',
    category: 'Ambient',
    tags: ['White Noise', 'Focus', 'Sleep', 'Study'],
    youtubeUrl: 'https://www.youtube.com/embed/nMfPqeZjc2c',
    spotifyUrl: 'https://open.spotify.com/track/5UYkYVXoqFqf3i2Yfgpn2W',
    iconName: 'Waves',
    duration: 3600,
    description: 'Pure white noise for concentration and masking distractions',
    mood: 'Focused'
  },
  {
    id: 'ambient-2',
    title: 'Spaceship Hum',
    category: 'Ambient',
    tags: ['Space', 'Sci-Fi', 'Hum', 'Engine'],
    youtubeUrl: 'https://www.youtube.com/embed/gpvznAiKblU',
    spotifyUrl: 'https://open.spotify.com/track/5UYkYVXoqFqf3i2Yfgpn2W',
    iconName: 'Rocket',
    duration: 3600,
    description: 'Steady hum of a spaceship engine for sci-fi ambience',
    mood: 'Focused'
  },
  {
    id: 'ambient-3',
    title: 'Fireplace Crackling',
    category: 'Ambient',
    tags: ['Fire', 'Cozy', 'Warm', 'Winter'],
    youtubeUrl: 'https://www.youtube.com/embed/L_LUpnjgPso',
    spotifyUrl: 'https://open.spotify.com/track/5UYkYVXoqFqf3i2Yfgpn2W',
    iconName: 'Flame',
    duration: 3600,
    description: 'Cozy crackling fireplace sounds for a warm atmosphere',
    mood: 'Relaxing'
  },
  {
    id: 'ambient-4',
    title: 'Binaural Beats',
    category: 'Ambient',
    tags: ['Meditation', 'Focus', 'Binaural', 'Brainwave'],
    youtubeUrl: 'https://www.youtube.com/embed/66tq9xji0xA',
    spotifyUrl: 'https://open.spotify.com/track/5UYkYVXoqFqf3i2Yfgpn2W',
    iconName: 'Brain',
    duration: 3600,
    description: 'Alpha wave binaural beats for focus and concentration',
    mood: 'Focused'
  }
];

// ASMR Sound Effects
const asmrSounds: SoundEffect[] = [
  {
    id: 'asmr-1',
    title: 'Keyboard Typing',
    category: 'ASMR',
    tags: ['Keyboard', 'Typing', 'Mechanical', 'Clicks'],
    youtubeUrl: 'https://www.youtube.com/embed/aT4IlIlMYWw',
    spotifyUrl: 'https://open.spotify.com/track/5UYkYVXoqFqf3i2Yfgpn2W',
    iconName: 'Keyboard',
    duration: 3600,
    description: 'Satisfying mechanical keyboard typing sounds',
    mood: 'Focused'
  },
  {
    id: 'asmr-2',
    title: 'Page Turning',
    category: 'ASMR',
    tags: ['Book', 'Pages', 'Reading', 'Paper'],
    youtubeUrl: 'https://www.youtube.com/embed/IIF8S8WRVEs',
    spotifyUrl: 'https://open.spotify.com/track/5UYkYVXoqFqf3i2Yfgpn2W',
    iconName: 'Book-Open',
    duration: 3600,
    description: 'Gentle sounds of pages turning in a book',
    mood: 'Relaxing'
  },
  {
    id: 'asmr-3',
    title: 'Rain on Window',
    category: 'ASMR',
    tags: ['Rain', 'Window', 'Cozy', 'Indoors'],
    youtubeUrl: 'https://www.youtube.com/embed/mPZkdNFkNps',
    spotifyUrl: 'https://open.spotify.com/track/5UYkYVXoqFqf3i2Yfgpn2W',
    iconName: 'Droplets',
    duration: 3600,
    description: 'Soothing sound of rain drops hitting a window',
    mood: 'Relaxing'
  }
];

// Combine all sound effect collections
export const soundEffectsLibrary: SoundEffect[] = [
  ...natureSounds,
  ...urbanSounds,
  ...ambientSounds,
  ...asmrSounds
];

// Function to filter sound effects by category, tags, and mood
export function filterSoundEffects(category?: string, tags?: string[], mood?: string): SoundEffect[] {
  let filteredSounds = [...soundEffectsLibrary];
  
  // Filter by category if provided
  if (category) {
    filteredSounds = filteredSounds.filter(sound => 
      sound.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  // Filter by tags if provided
  if (tags && tags.length > 0) {
    filteredSounds = filteredSounds.filter(sound => 
      tags.some(tag => 
        sound.tags.some(soundTag => soundTag.toLowerCase() === tag.toLowerCase())
      )
    );
  }
  
  // Filter by mood if provided
  if (mood) {
    filteredSounds = filteredSounds.filter(sound => 
      sound.mood?.toLowerCase() === mood.toLowerCase()
    );
  }
  
  return filteredSounds;
}

// Function to get a random sound effect from filtered results
export function getRandomSoundEffect(category?: string, tags?: string[], mood?: string): SoundEffect {
  const filteredSounds = filterSoundEffects(category, tags, mood);
  
  if (filteredSounds.length === 0) {
    // Return a random sound from the entire library if no matches
    return soundEffectsLibrary[Math.floor(Math.random() * soundEffectsLibrary.length)];
  }
  
  return filteredSounds[Math.floor(Math.random() * filteredSounds.length)];
}

// Function to search for sound effects by keyword
export function searchSoundEffects(keyword: string): SoundEffect[] {
  const searchTerm = keyword.toLowerCase();
  
  return soundEffectsLibrary.filter(sound => 
    sound.title.toLowerCase().includes(searchTerm) ||
    sound.category.toLowerCase().includes(searchTerm) ||
    sound.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
    (sound.description && sound.description.toLowerCase().includes(searchTerm)) ||
    (sound.mood && sound.mood.toLowerCase().includes(searchTerm))
  );
}

// Function to get sound effects by specific tag
export function getSoundEffectsByTag(tag: string): SoundEffect[] {
  return soundEffectsLibrary.filter(sound => 
    sound.tags.some(t => t.toLowerCase() === tag.toLowerCase())
  );
}

// Function to format duration from seconds to MM:SS or HH:MM:SS
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
