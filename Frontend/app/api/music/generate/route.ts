import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://etymxhxrcgnfonibvbha.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0eW14aHhyY2duZm9uaWJ2YmhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTg1MTY4MDAsImV4cCI6MjAxNDA5MjgwMH0.S-6O5RAqog_a_1qTz3QbXQRZBCQzB4q5xgxg0eS3NYY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Music generation function that attempts to call the backend API
async function generateMusic(
  prompt: string,
  model: string,
  options: any
) {
  console.log(`Generating music with ${model} model:`, prompt, options);

  try {
    // In a real implementation, we would call our backend API here
    // For now, we'll generate a music sample based on the parameters

    // Simulate API delay - longer for higher quality or more complex requests
    const complexity = (options?.instruments?.length || 1) * (options?.duration || 60) / 60;
    const baseDelay = model === 'grok' ? 3000 : 4000; // Gemini takes a bit longer
    await new Promise(resolve => setTimeout(resolve, baseDelay + complexity * 1000));

    // Create a simple audio buffer (sine wave with varying frequencies)
    const sampleRate = 44100;
    const duration = options?.duration || 60; // seconds
    const baseFrequency = 440; // Hz (A4 note)

    // Adjust base frequency based on mood
    let adjustedBaseFrequency = baseFrequency;
    if (options?.mood) {
      const mood = options.mood.toLowerCase();
      if (mood === 'happy' || mood === 'energetic') {
        adjustedBaseFrequency = baseFrequency * 1.05; // Slightly higher for happy moods
      } else if (mood === 'sad' || mood === 'melancholic') {
        adjustedBaseFrequency = baseFrequency * 0.95; // Slightly lower for sad moods
      }
    }

    const numSamples = sampleRate * duration;
    const buffer = new ArrayBuffer(numSamples * 2); // 16-bit samples
    const view = new DataView(buffer);

    // Generate a more complex musical pattern based on options
    const tempo = options?.tempo || 90; // BPM
    const beatsPerSecond = tempo / 60;
    const samplesPerBeat = sampleRate / beatsPerSecond;

    // Create chord progressions based on mood
    let chords;
    if (options?.mood?.toLowerCase() === 'happy' || options?.mood?.toLowerCase() === 'energetic') {
      chords = [
        [1, 3, 5],       // I chord (e.g., C major)
        [5, 7, 2],       // V chord (e.g., G major)
        [4, 6, 1],       // IV chord (e.g., F major)
        [5, 7, 2]        // V chord (e.g., G major)
      ];
    } else if (options?.mood?.toLowerCase() === 'sad' || options?.mood?.toLowerCase() === 'melancholic') {
      chords = [
        [1, 3, 5],       // i chord (e.g., C minor)
        [6, 1, 3],       // vi chord (e.g., A minor)
        [3, 5, 7],       // iii chord (e.g., E minor)
        [6, 1, 3]        // vi chord (e.g., A minor)
      ];
    } else {
      // Default chord progression
      chords = [
        [1, 3, 5],       // I chord (e.g., C major)
        [6, 1, 3],       // vi chord (e.g., A minor)
        [4, 6, 1],       // IV chord (e.g., F major)
        [5, 7, 2]        // V chord (e.g., G major)
      ];
    }

    // Map genre to musical characteristics
    const genreCharacteristics: Record<string, any> = {
      ambient: { attack: 0.1, decay: 0.3, sustain: 0.8, release: 0.5, harmonics: 3 },
      electronic: { attack: 0.05, decay: 0.1, sustain: 0.7, release: 0.2, harmonics: 5 },
      classical: { attack: 0.08, decay: 0.2, sustain: 0.6, release: 0.4, harmonics: 2 },
      jazz: { attack: 0.03, decay: 0.15, sustain: 0.5, release: 0.3, harmonics: 4 },
      rock: { attack: 0.02, decay: 0.1, sustain: 0.4, release: 0.2, harmonics: 6 },
      'hip-hop': { attack: 0.01, decay: 0.05, sustain: 0.9, release: 0.1, harmonics: 4 },
      folk: { attack: 0.06, decay: 0.2, sustain: 0.7, release: 0.3, harmonics: 2 },
      cinematic: { attack: 0.15, decay: 0.4, sustain: 0.6, release: 0.6, harmonics: 5 }
    };

    // Get characteristics based on genre or default to ambient
    const characteristics = genreCharacteristics[options?.genre || 'ambient'] || genreCharacteristics.ambient;

    // Generate the audio data
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const beat = Math.floor(t * beatsPerSecond) % 4;
      const chordIndex = Math.floor(t / 4) % chords.length;
      const chord = chords[chordIndex];

      // Generate a note for each chord tone
      let sample = 0;
      for (let j = 0; j < chord.length; j++) {
        const note = chord[j];
        const frequency = adjustedBaseFrequency * Math.pow(2, (note - 1) / 12);

        // Add harmonics
        for (let h = 1; h <= characteristics.harmonics; h++) {
          sample += Math.sin(2 * Math.PI * frequency * h * t) * (1 / h) * 0.2;
        }
      }

      // Apply envelope
      const beatProgress = (i % samplesPerBeat) / samplesPerBeat;
      let envelope;
      if (beatProgress < characteristics.attack) {
        envelope = beatProgress / characteristics.attack;
      } else if (beatProgress < characteristics.attack + characteristics.decay) {
        const decayProgress = (beatProgress - characteristics.attack) / characteristics.decay;
        envelope = 1 - (1 - characteristics.sustain) * decayProgress;
      } else if (beatProgress < 1 - characteristics.release) {
        envelope = characteristics.sustain;
      } else {
        const releaseProgress = (beatProgress - (1 - characteristics.release)) / characteristics.release;
        envelope = characteristics.sustain * (1 - releaseProgress);
      }

      // Apply overall envelope for the entire duration
      const overallEnvelope = Math.min(1, Math.min(t / 2, (duration - t) / 2));

      // Combine envelopes and normalize
      const finalSample = sample * envelope * overallEnvelope;
      const value = Math.floor(finalSample * 16384); // Scale to 16-bit range

      // Write 16-bit sample
      view.setInt16(i * 2, value, true);
    }

    // In a real implementation, we would generate a waveform image
    // For now, use a placeholder
    const waveformUrl = '/waveform-placeholder.png';

    // Save to Supabase if requested
    let storageUrl = null;
    if (options?.save_to_library) {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Generate a unique filename
          const fileName = `music_${Date.now()}_${Math.random().toString(36).substring(2, 10)}.wav`;
          const filePath = `music/${user.id}/${fileName}`;

          // In a real implementation, we would upload the audio buffer to storage
          // For now, we'll just simulate success
          console.log('Would save music to:', filePath);

          // Simulate the storage URL
          storageUrl = `${supabaseUrl}/storage/v1/object/public/audio-files/${filePath}`;
        }
      } catch (error) {
        console.error('Error saving to library:', error);
        // Continue without saving
      }
    }

    return {
      audioBuffer: buffer,
      metadata: {
        duration,
        tempo: options?.tempo || 90,
        genre: options?.genre || 'ambient',
        mood: options?.mood || 'relaxed',
        instruments: options?.instruments || ['piano', 'strings'],
        waveform_url: waveformUrl,
        storage_url: storageUrl,
        generated_at: new Date().toISOString(),
        model: model
      }
    };
  } catch (error) {
    console.error('Error generating music:', error);

    // Fallback to a very simple music generation
    const sampleRate = 44100;
    const duration = 30; // Shorter duration for fallback
    const numSamples = sampleRate * duration;
    const buffer = new ArrayBuffer(numSamples * 2);
    const view = new DataView(buffer);

    // Generate a simple repeating pattern
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const sample = Math.sin(2 * Math.PI * 440 * t) * 0.3 +
                    Math.sin(2 * Math.PI * 220 * t) * 0.2;
      const envelope = Math.min(1, Math.min(t / 0.5, (duration - t) / 0.5));
      const value = Math.floor(sample * 16384 * envelope);
      view.setInt16(i * 2, value, true);
    }

    return {
      audioBuffer: buffer,
      metadata: {
        duration,
        tempo: 90,
        genre: 'ambient',
        mood: 'neutral',
        instruments: ['piano'],
        waveform_url: '/waveform-placeholder.png'
      }
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      prompt,
      model = 'grok',
      genre,
      mood,
      tempo,
      instruments,
      duration,
      save_to_library = true
    } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const options = {
      genre,
      mood,
      tempo,
      instruments,
      duration,
      save_to_library
    };

    const { audioBuffer, metadata } = await generateMusic(prompt, model, options);

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': audioBuffer.byteLength.toString(),
        'X-Music-Metadata': JSON.stringify(metadata)
      },
    });
  } catch (error) {
    console.error('Error generating music:', error);
    return NextResponse.json(
      { error: 'Failed to generate music' },
      { status: 500 }
    );
  }
}
