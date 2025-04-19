// OpenAI API integration for audio generation
import OpenAI from 'openai';
import { toast } from 'sonner';

// Initialize OpenAI client with environment variable
// IMPORTANT: Never hardcode API keys in your code
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for client-side usage in demo
});

// Audio generation using OpenAI's Text-to-Speech API
export async function generateAudio(prompt: string, voice: string = 'alloy') {
  try {
    // Validate inputs
    if (!prompt || prompt.trim() === '') {
      throw new Error('Prompt is required');
    }
    
    // Check if API key is available
    if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      console.warn('OpenAI API key not found. Using demo mode.');
      return getDemoAudioUrl(prompt);
    }
    
    // Generate audio using OpenAI's TTS API
    const response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: voice,
      input: prompt,
    });
    
    // Convert the response to a blob URL that can be played in the browser
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    
    return url;
  } catch (error) {
    console.error('Error generating audio:', error);
    toast.error('Failed to generate audio. Using demo audio instead.');
    return getDemoAudioUrl(prompt);
  }
}

// Generate a prompt for audio creation based on environment and mood
export function generateAudioPrompt(environment: string, mood: string) {
  // Base prompts for different environments
  const environmentPrompts: Record<string, string> = {
    forest: 'Create a forest soundscape with rustling leaves, distant bird calls, and gentle wind through the trees.',
    ocean: 'Create an ocean soundscape with rhythmic waves, distant seagulls, and the gentle sound of water lapping against the shore.',
    city: 'Create a city soundscape with distant traffic, occasional car horns, and the ambient hum of urban life.',
    cafe: 'Create a cafe soundscape with quiet conversations, the occasional clink of cups, and soft background music.'
  };
  
  // Mood modifiers
  const moodModifiers: Record<string, string> = {
    relaxing: 'Make it peaceful and calming, with a slow tempo and gentle sounds.',
    energetic: 'Make it vibrant and uplifting, with more dynamic sounds and a faster pace.',
    focused: 'Make it minimal and non-distracting, perfect for concentration and deep work.',
    peaceful: 'Make it serene and tranquil, with harmonious sounds that blend together smoothly.'
  };
  
  // Get the base prompt for the selected environment
  const basePrompt = environmentPrompts[environment] || 'Create an ambient soundscape with natural elements.';
  
  // Add mood modifier if available
  const moodModifier = mood ? moodModifiers[mood] : '';
  
  // Combine the prompts
  return `${basePrompt} ${moodModifier}`;
}

// Fallback function to get demo audio URLs when API is not available
function getDemoAudioUrl(prompt: string): string {
  // Demo audio files (royalty-free from Pixabay)
  const demoAudio = {
    forest: 'https://cdn.pixabay.com/download/audio/2021/09/06/audio_8a49069f5c.mp3?filename=forest-with-small-river-birds-and-nature-field-recording-6735.mp3',
    ocean: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_12b0c7443c.mp3?filename=ocean-waves-112802.mp3',
    city: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d1a8d6dc0f.mp3?filename=city-ambience-9272.mp3',
    cafe: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_1e1a0c5f92.mp3?filename=coffee-shop-ambience-6953.mp3',
    ambient: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3?filename=ambient-piano-amp-strings-10711.mp3'
  };
  
  // Determine which demo audio to use based on the prompt
  if (prompt.toLowerCase().includes('forest')) return demoAudio.forest;
  if (prompt.toLowerCase().includes('ocean') || prompt.toLowerCase().includes('sea') || prompt.toLowerCase().includes('wave')) return demoAudio.ocean;
  if (prompt.toLowerCase().includes('city') || prompt.toLowerCase().includes('urban')) return demoAudio.city;
  if (prompt.toLowerCase().includes('cafe') || prompt.toLowerCase().includes('coffee')) return demoAudio.cafe;
  
  // Default to ambient if no match
  return demoAudio.ambient;
}
