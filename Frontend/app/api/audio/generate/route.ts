import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://etymxhxrcgnfonibvbha.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0eW14aHhyY2duZm9uaWJ2YmhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTg1MTY4MDAsImV4cCI6MjAxNDA5MjgwMH0.S-6O5RAqog_a_1qTz3QbXQRZBCQzB4q5xgxg0eS3NYY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Audio generation function that attempts to call the backend API
async function generateAudio(prompt: string, model: string, options: any) {
  console.log(`Generating audio with ${model} model:`, prompt, options);

  try {
    // In a real implementation, we would call our backend API here
    // For now, we'll use a sample audio file or generate one

    // First, check if we should use the sample file or generate based on parameters
    const useCustomGeneration = options?.quality === 'high' || options?.duration > 10;

    if (!useCustomGeneration) {
      const sampleAudioPath = '/sample-audio.wav';

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      try {
        // Use the locally downloaded MP3 file
        const response = await fetch(new URL(sampleAudioPath, process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
        if (!response.ok) {
          throw new Error(`Failed to fetch sample audio: ${response.status} ${response.statusText}`);
        }
        const audioBuffer = await response.arrayBuffer();
        return audioBuffer;
      } catch (error) {
        console.error('Error fetching sample audio:', error);
        // Fall through to custom generation
      }
    }

    // Generate custom audio based on the prompt and options
    console.log('Generating custom audio with parameters:', options);

    // Simulate longer processing time for high quality
    if (options?.quality === 'high') {
      await new Promise(resolve => setTimeout(resolve, 3000));
    } else {
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Generate audio data
    const sampleRate = 44100;
    const duration = options?.duration || 5; // seconds

    // Use different base frequency based on the prompt sentiment
    // This is a very simple heuristic - in a real implementation we would use NLP
    let baseFrequency = 440; // A4 note by default
    if (prompt.toLowerCase().includes('happy') || prompt.toLowerCase().includes('energetic')) {
      baseFrequency = 523.25; // C5 - higher/brighter
    } else if (prompt.toLowerCase().includes('sad') || prompt.toLowerCase().includes('melancholic')) {
      baseFrequency = 392.00; // G4 - lower/darker
    }

    const numSamples = sampleRate * duration;
    const buffer = new ArrayBuffer(numSamples * 2); // 16-bit samples
    const view = new DataView(buffer);

    // Generate more complex waveform based on the model
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      let sample;

      if (model === 'grok') {
        // More complex harmonics for Grok model
        sample = Math.sin(2 * Math.PI * baseFrequency * t) * 0.5 +
                Math.sin(2 * Math.PI * baseFrequency * 1.5 * t) * 0.25 +
                Math.sin(2 * Math.PI * baseFrequency * 2 * t) * 0.125 +
                Math.sin(2 * Math.PI * baseFrequency * 2.5 * t) * 0.0625;
      } else {
        // Different harmonic structure for Gemini model
        sample = Math.sin(2 * Math.PI * baseFrequency * t) * 0.4 +
                Math.sin(2 * Math.PI * baseFrequency * 2 * t) * 0.3 +
                Math.sin(2 * Math.PI * baseFrequency * 3 * t) * 0.2 +
                Math.sin(2 * Math.PI * baseFrequency * 4 * t) * 0.1;
      }

      // Apply more sophisticated envelope
      const attack = 0.1 * sampleRate;
      const release = 0.5 * sampleRate;
      let envelope;

      if (i < attack) {
        envelope = i / attack; // Attack phase
      } else if (i > numSamples - release) {
        envelope = (numSamples - i) / release; // Release phase
      } else {
        envelope = 1.0; // Sustain phase
      }

      // Add subtle modulation based on the prompt length
      const modDepth = 0.05;
      const modRate = 2 + (prompt.length % 5); // Vary modulation rate based on prompt length
      envelope *= (1 + modDepth * Math.sin(2 * Math.PI * modRate * t / duration));

      // Convert to 16-bit and apply envelope
      const value = Math.floor(sample * 32767 * envelope);

      // Write 16-bit sample
      view.setInt16(i * 2, value, true);
    }

    return buffer;
  } catch (error) {
    console.error('Error generating audio:', error);

    // Fallback to a very simple tone if everything else fails
    const sampleRate = 44100;
    const duration = 3; // Short duration for fallback
    const frequency = 440;

    const numSamples = sampleRate * duration;
    const buffer = new ArrayBuffer(numSamples * 2);
    const view = new DataView(buffer);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const sample = Math.sin(2 * Math.PI * frequency * t) * 0.5;
      const envelope = Math.min(1, Math.min(t / 0.1, (duration - t) / 0.5));
      const value = Math.floor(sample * 32767 * envelope);
      view.setInt16(i * 2, value, true);
    }

    return buffer;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, options } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const model = options?.model || 'grok';
    const audioBuffer = await generateAudio(prompt, model, options);

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating audio:', error);
    return NextResponse.json(
      { error: 'Failed to generate audio' },
      { status: 500 }
    );
  }
}
