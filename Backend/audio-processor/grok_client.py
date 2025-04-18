import requests
import logging
from typing import Dict, Any, List, Optional
import json
import sys
import os

# Add the parent directory to sys.path to import from config
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from config.api_key_manager import api_key_manager

logger = logging.getLogger(__name__)

class GrokClient:
    """
    Client for interacting with the Grok API for audio analysis and processing
    """
    def __init__(self):
        self.api_key = "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"  # Using the provided API key
        self.api_base_url = "https://api.grok.ai/v1"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    def analyze_audio(self, audio_data: bytes, options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Analyze audio data using Grok AI

        Args:
            audio_data: Binary audio data
            options: Additional options for the analysis

        Returns:
            JSON response from the Grok API
        """
        endpoint = f"{self.api_base_url}/audio/analyze"

        files = {
            'file': ('audio.wav', audio_data, 'audio/wav')
        }

        params = {}
        if options:
            params.update(options)

        try:
            response = requests.post(
                endpoint,
                headers={"Authorization": f"Bearer {self.api_key}"},  # Content-Type is set automatically by requests for multipart
                files=files,
                params=params
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error calling Grok API: {e}")
            if hasattr(e, 'response') and e.response is not None:
                logger.error(f"Response content: {e.response.text}")
            raise

    def generate_audio(self, prompt: str, options: Optional[Dict[str, Any]] = None) -> bytes:
        """
        Generate audio based on a text prompt

        Args:
            prompt: Text description for audio generation
            options: Additional options for generation

        Returns:
            Binary audio data
        """
        endpoint = f"{self.api_base_url}/audio/generate"

        # Default options for audio generation
        default_options = {
            "duration": 30,  # Default duration in seconds
            "format": "wav",  # Output format
            "quality": "high",  # Audio quality
            "genre": "ambient",  # Default genre
            "tempo": 90,  # Default tempo (BPM)
            "instruments": ["piano", "strings", "synth"],  # Default instruments
            "mood": "relaxed"  # Default mood
        }

        # Merge default options with provided options
        payload = {
            "prompt": prompt,
            **default_options
        }

        if options:
            payload.update(options)

        logger.info(f"Generating audio with prompt: {prompt}")
        logger.info(f"Options: {payload}")

        try:
            response = requests.post(
                endpoint,
                headers=self.headers,
                json=payload
            )
            response.raise_for_status()
            logger.info(f"Successfully generated audio, size: {len(response.content)} bytes")
            return response.content
        except requests.exceptions.RequestException as e:
            logger.error(f"Error calling Grok API: {e}")
            if hasattr(e, 'response') and e.response is not None:
                logger.error(f"Response content: {e.response.text}")
            raise

    def generate_music(self, prompt: str, options: Optional[Dict[str, Any]] = None) -> bytes:
        """
        Generate music based on a text prompt with more music-specific options

        Args:
            prompt: Text description for music generation
            options: Additional options for generation

        Returns:
            Binary audio data
        """
        # Default music-specific options
        music_options = {
            "type": "music",
            "duration": 60,  # Longer duration for music
            "format": "wav",
            "quality": "high",
            "genre": "ambient",  # Default genre
            "tempo": 90,  # Default tempo (BPM)
            "key": "C major",  # Musical key
            "instruments": ["piano", "strings", "synth", "guitar", "drums"],
            "structure": "intro,verse,chorus,verse,chorus,outro",  # Song structure
            "mood": "relaxed"
        }

        # Update with any provided options
        if options:
            music_options.update(options)

        # Call the general audio generation method with music-specific options
        return self.generate_audio(prompt, music_options)

    def transcribe_audio(self, audio_data: bytes, options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Transcribe speech from audio data

        Args:
            audio_data: Binary audio data
            options: Additional options for transcription

        Returns:
            Transcription results
        """
        endpoint = f"{self.api_base_url}/audio/transcribe"

        files = {
            'file': ('audio.wav', audio_data, 'audio/wav')
        }

        params = {}
        if options:
            params.update(options)

        try:
            response = requests.post(
                endpoint,
                headers={"Authorization": f"Bearer {self.api_key}"},
                files=files,
                params=params
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error calling Grok API: {e}")
            if hasattr(e, 'response') and e.response is not None:
                logger.error(f"Response content: {e.response.text}")
            raise

# Create a singleton instance
grok_client = GrokClient()