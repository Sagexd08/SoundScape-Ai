import os
import logging
import tempfile
import wave
import numpy as np
import uuid
import matplotlib.pyplot as plt
from io import BytesIO
from typing import Dict, Any, Optional, BinaryIO, Union

from grok_client import grok_client
from supabase_storage import supabase_storage

logger = logging.getLogger(__name__)

class AudioProcessor:
    """
    Service for processing audio files using the Grok AI API
    with Supabase storage integration
    """
    def __init__(self):
        self.grok_client = grok_client
        self.storage = supabase_storage
        
    def process_file(self, audio_file: Union[str, BinaryIO, bytes], 
                    analyze: bool = True, 
                    transcribe: bool = False,
                    save_to_supabase: bool = True,
                    filename: Optional[str] = None) -> Dict[str, Any]:
        """
        Process an audio file through the Grok API
        
        Args:
            audio_file: Path to audio file, file-like object, or bytes
            analyze: Whether to perform audio analysis
            transcribe: Whether to perform speech transcription
            save_to_supabase: Whether to save the file to Supabase storage
            filename: Custom filename (default is a UUID)
            
        Returns:
            Dictionary containing the processing results
        """
        # Load the audio data
        audio_data = self._load_audio_data(audio_file)
        
        results = {}
        
        # Generate a unique filename if not provided
        if not filename:
            file_uuid = str(uuid.uuid4())
            filename = f"{file_uuid}.wav"
        
        # Save to Supabase if requested
        if save_to_supabase:
            try:
                upload_result = self.storage.upload_audio(audio_data, filename)
                results['storage'] = upload_result
                
                # Generate and save waveform image
                waveform_image = self.generate_waveform_image(audio_data)
                waveform_filename = f"{os.path.splitext(filename)[0]}_waveform.png"
                waveform_result = self.storage.upload_waveform(waveform_image, waveform_filename)
                results['waveform'] = waveform_result
            except Exception as e:
                logger.error(f"Error saving to Supabase: {e}")
                results['storage_error'] = str(e)
        
        # Analyze the audio if requested
        if analyze:
            try:
                analysis_results = self.grok_client.analyze_audio(audio_data)
                results['analysis'] = analysis_results
            except Exception as e:
                logger.error(f"Error during audio analysis: {e}")
                results['analysis'] = {'error': str(e)}
        
        # Transcribe the audio if requested
        if transcribe:
            try:
                transcription_results = self.grok_client.transcribe_audio(audio_data)
                results['transcription'] = transcription_results
            except Exception as e:
                logger.error(f"Error during audio transcription: {e}")
                results['transcription'] = {'error': str(e)}
        
        return results
    
    def generate_audio(self, prompt: str, options: Optional[Dict[str, Any]] = None,
                     save_to_supabase: bool = True, filename: Optional[str] = None) -> Dict[str, Any]:
        """
        Generate audio based on a text prompt and optionally save to Supabase
        
        Args:
            prompt: Text description for audio generation
            options: Additional options for generation
            save_to_supabase: Whether to save the file to Supabase storage
            filename: Custom filename (default is a UUID)
            
        Returns:
            Dictionary with generated audio data and storage info
        """
        try:
            # Generate the audio
            audio_data = self.grok_client.generate_audio(prompt, options)
            
            results = {
                'size': len(audio_data)
            }
            
            # Save to Supabase if requested
            if save_to_supabase:
                # Generate a unique filename if not provided
                if not filename:
                    file_uuid = str(uuid.uuid4())
                    filename = f"generated_{file_uuid}.wav"
                
                upload_result = self.storage.upload_audio(audio_data, filename)
                results['storage'] = upload_result
                
                # Generate and save waveform image
                waveform_image = self.generate_waveform_image(audio_data)
                waveform_filename = f"{os.path.splitext(filename)[0]}_waveform.png"
                waveform_result = self.storage.upload_waveform(waveform_image, waveform_filename)
                results['waveform'] = waveform_result
            
            # Include the raw audio data in the results
            results['audio_data'] = audio_data
            
            return results
        except Exception as e:
            logger.error(f"Error during audio generation: {e}")
            raise
    
    def _load_audio_data(self, audio_source: Union[str, BinaryIO, bytes]) -> bytes:
        """
        Load audio data from various sources
        
        Args:
            audio_source: Path to audio file, file-like object, or bytes
            
        Returns:
            Audio data as bytes
        """
        # If already bytes, return as is
        if isinstance(audio_source, bytes):
            return audio_source
        
        # If string, treat as file path
        if isinstance(audio_source, str):
            with open(audio_source, 'rb') as f:
                return f.read()
        
        # Otherwise, assume file-like object
        return audio_source.read()

    def generate_waveform_image(self, audio_data: bytes) -> bytes:
        """
        Generate a waveform visualization image from audio data
        
        Args:
            audio_data: Binary audio data
            
        Returns:
            PNG image data as bytes
        """
        try:
            # Create a temporary file to read the wave data
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=True) as temp_file:
                temp_file.write(audio_data)
                temp_file.flush()
                
                with wave.open(temp_file.name, 'rb') as wav_file:
                    # Get basic audio information
                    n_channels = wav_file.getnchannels()
                    sample_width = wav_file.getsampwidth()
                    frame_rate = wav_file.getframerate()
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
                    
                    # Generate the waveform plot
                    plt.figure(figsize=(10, 3))
                    plt.plot(np.linspace(0, n_frames / frame_rate, num=len(audio_array)), audio_array, color='#3498db')
                    plt.axis('off')
                    plt.tight_layout(pad=0)
                    
                    # Save the plot to a bytes buffer
                    buf = BytesIO()
                    plt.savefig(buf, format='png', dpi=100, bbox_inches='tight', pad_inches=0)
                    plt.close()
                    buf.seek(0)
                    
                    return buf.read()
        except Exception as e:
            logger.error(f"Error generating waveform image: {e}")
            # Return a placeholder image if waveform generation fails
            return self._generate_placeholder_image()
    
    def _generate_placeholder_image(self) -> bytes:
        """
        Generate a placeholder image when waveform generation fails
        
        Returns:
            PNG image data as bytes
        """
        plt.figure(figsize=(10, 3))
        plt.text(0.5, 0.5, 'Waveform unavailable', horizontalalignment='center', verticalalignment='center')
        plt.axis('off')
        
        buf = BytesIO()
        plt.savefig(buf, format='png', dpi=100)
        plt.close()
        buf.seek(0)
        
        return buf.read()
    
    def convert_audio_format(self, audio_data: bytes, target_format: str = 'wav',
                            sample_rate: int = 44100, channels: int = 2) -> bytes:
        """
        Convert audio data to the specified format
        
        Args:
            audio_data: Input audio data
            target_format: Target audio format (e.g., 'wav', 'mp3')
            sample_rate: Target sample rate
            channels: Number of audio channels
            
        Returns:
            Converted audio data
        """
        # This is a placeholder implementation
        # In a real implementation, you would use a library like pydub or ffmpeg
        # For now, we'll just return the original data assuming it's already in the right format
        logger.warning("Audio format conversion not fully implemented. Returning original data.")
        return audio_data

# Create a singleton instance
audio_processor = AudioProcessor()
