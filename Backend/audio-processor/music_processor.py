import os
import logging
import tempfile
import wave
import numpy as np
import uuid
import matplotlib.pyplot as plt
from io import BytesIO
from typing import Dict, Any, Optional, BinaryIO, Union, List

from grok_client import grok_client
from gemini_client import gemini_client

logger = logging.getLogger(__name__)

class MusicProcessor:
    """
    Service for generating music using the Grok and Gemini AI APIs
    with Supabase storage integration
    """
    def __init__(self):
        self.grok_client = grok_client
        self.gemini_client = gemini_client
    
    async def generate_music(self, 
                           prompt: str, 
                           model: str = "grok",
                           genre: Optional[str] = None,
                           mood: Optional[str] = None,
                           tempo: Optional[int] = None,
                           instruments: Optional[List[str]] = None,
                           duration: Optional[int] = None,
                           save_to_library: bool = True,
                           filename: Optional[str] = None) -> Dict[str, Any]:
        """
        Generate music based on a text prompt and additional parameters
        
        Args:
            prompt: Text description of the music to generate
            model: AI model to use ("grok" or "gemini")
            genre: Music genre (e.g., "ambient", "electronic", "classical")
            mood: Emotional mood (e.g., "relaxed", "energetic", "melancholic")
            tempo: Beats per minute
            instruments: List of instruments to include
            duration: Duration in seconds
            save_to_library: Whether to save the generated music to the user's library
            filename: Optional filename for the saved music
            
        Returns:
            Dictionary with generated music data and metadata
        """
        try:
            logger.info(f"Generating music with {model} model: {prompt}")
            
            # Prepare options based on provided parameters
            options = {}
            if genre:
                options["genre"] = genre
            if mood:
                options["mood"] = mood
            if tempo:
                options["tempo"] = tempo
            if instruments:
                options["instruments"] = instruments
            if duration:
                options["duration"] = duration
            
            # Generate music using the appropriate model
            if model.lower() == "grok":
                audio_data = self.grok_client.generate_music(prompt, options)
            else:
                # For Gemini, we'd use a different approach
                # This is a placeholder as Gemini might have a different API
                audio_data = self.gemini_client.generate_audio(prompt, options)
            
            # Create response with metadata
            response = {
                "size": len(audio_data),
                "format": "wav",
                "duration": duration or 60,  # Default to 60 seconds if not specified
                "model": model,
                "prompt": prompt,
                "parameters": {
                    "genre": genre,
                    "mood": mood,
                    "tempo": tempo,
                    "instruments": instruments
                }
            }
            
            # Generate a unique filename if not provided
            if save_to_library:
                if not filename:
                    file_uuid = str(uuid.uuid4())
                    sanitized_prompt = prompt.replace(" ", "_")[:30]  # Use part of prompt in filename
                    filename = f"{sanitized_prompt}_{file_uuid}.wav"
                
                # In a real implementation, this would save to Supabase or another storage service
                # For now, we'll just include the filename in the response
                response["filename"] = filename
                
                # Generate and save waveform visualization
                waveform_image = self.generate_waveform_image(audio_data)
                waveform_filename = f"{os.path.splitext(filename)[0]}_waveform.png"
                response["waveform_filename"] = waveform_filename
            
            # Include the audio data in the response
            response["audio_data"] = audio_data
            
            return response
            
        except Exception as e:
            logger.error(f"Error generating music: {str(e)}")
            raise
    
    def generate_waveform_image(self, audio_data: bytes) -> bytes:
        """
        Generate a waveform visualization image from audio data
        
        Args:
            audio_data: Binary audio data
            
        Returns:
            PNG image data as bytes
        """
        try:
            # Create a temporary file to write the audio data
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                temp_file.write(audio_data)
                temp_file_path = temp_file.name
            
            # Read the audio file
            with wave.open(temp_file_path, 'rb') as wav_file:
                # Get audio parameters
                n_channels = wav_file.getnchannels()
                sample_width = wav_file.getsampwidth()
                framerate = wav_file.getframerate()
                n_frames = wav_file.getnframes()
                
                # Read all frames
                frames = wav_file.readframes(n_frames)
            
            # Convert to numpy array
            if sample_width == 1:
                dtype = np.uint8
            elif sample_width == 2:
                dtype = np.int16
            else:
                dtype = np.int32
                
            audio_array = np.frombuffer(frames, dtype=dtype)
            
            # If stereo, take the average of both channels
            if n_channels == 2:
                audio_array = audio_array.reshape(-1, 2).mean(axis=1)
            
            # Normalize
            audio_array = audio_array / np.max(np.abs(audio_array))
            
            # Create the plot
            plt.figure(figsize=(10, 3))
            plt.plot(np.linspace(0, len(audio_array) / framerate, len(audio_array)), audio_array, color='#4f46e5')
            plt.axis('off')
            plt.tight_layout()
            
            # Save to BytesIO
            buf = BytesIO()
            plt.savefig(buf, format='png', dpi=100, bbox_inches='tight', pad_inches=0)
            plt.close()
            buf.seek(0)
            
            # Clean up the temporary file
            os.unlink(temp_file_path)
            
            return buf.getvalue()
            
        except Exception as e:
            logger.error(f"Error generating waveform image: {str(e)}")
            # Return a placeholder image or raise an exception
            raise

# Create a singleton instance
music_processor = MusicProcessor()
