import { NextRequest, NextResponse } from 'next/server';

// Mock audio generation function - in a real app, this would call the Grok or Gemini API
async function generateAudio(prompt: string, model: string, options: any) {
  console.log(`Generating audio with ${model} model:`, prompt, options);

  // In a real implementation, this would call the actual API
  // For demo purposes, we'll return the sample audio file
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

    // Fallback to generating a simple audio buffer if the file can't be loaded
    const sampleRate = 44100;
    const duration = options?.duration || 5; // seconds
    const frequency = 440; // Hz (A4 note)

    const numSamples = sampleRate * duration;
    const buffer = new ArrayBuffer(numSamples * 2); // 16-bit samples
    const view = new DataView(buffer);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      // Create a simple sine wave with some harmonics for a more interesting sound
      const sample = Math.sin(2 * Math.PI * frequency * t) * 0.5 +
                    Math.sin(2 * Math.PI * frequency * 2 * t) * 0.25 +
                    Math.sin(2 * Math.PI * frequency * 3 * t) * 0.125;

      // Convert to 16-bit and apply envelope
      const envelope = Math.min(1, Math.min(t / 0.1, (duration - t) / 0.5)); // Simple attack/release envelope
      const value = Math.floor(sample * 32767 * envelope);

      // Write 16-bit sample
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
