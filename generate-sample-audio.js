const fs = require('fs');
const path = require('path');

// Create a simple WAV file with a sine wave
function generateWavFile() {
  const sampleRate = 44100;
  const duration = 10; // seconds
  const frequency = 440; // Hz (A4 note)
  
  const numSamples = sampleRate * duration;
  const dataSize = numSamples * 2; // 16-bit samples
  const fileSize = 36 + dataSize;
  
  // Create a buffer for the WAV file
  const buffer = Buffer.alloc(44 + dataSize);
  
  // WAV header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(fileSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // fmt chunk size
  buffer.writeUInt16LE(1, 20); // audio format (PCM)
  buffer.writeUInt16LE(1, 22); // num channels (mono)
  buffer.writeUInt32LE(sampleRate, 24); // sample rate
  buffer.writeUInt32LE(sampleRate * 2, 28); // byte rate
  buffer.writeUInt16LE(2, 32); // block align
  buffer.writeUInt16LE(16, 34); // bits per sample
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  
  // Write audio data
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Create a simple sine wave with some harmonics for a more interesting sound
    const sample = Math.sin(2 * Math.PI * frequency * t) * 0.5 + 
                  Math.sin(2 * Math.PI * frequency * 2 * t) * 0.25 +
                  Math.sin(2 * Math.PI * frequency * 3 * t) * 0.125;
    
    // Apply envelope
    const envelope = Math.min(1, Math.min(t / 0.1, (duration - t) / 0.5));
    const value = Math.floor(sample * 32767 * envelope);
    
    // Write 16-bit sample
    buffer.writeInt16LE(value, 44 + i * 2);
  }
  
  // Write the file
  const outputPath = path.join(__dirname, 'Frontend', 'public', 'sample-audio.wav');
  fs.writeFileSync(outputPath, buffer);
  console.log(`WAV file generated at: ${outputPath}`);
}

// Generate the WAV file
generateWavFile();
