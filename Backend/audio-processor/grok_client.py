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
        self.api_key = api_key_manager.get_api_key('grok')
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
        
        payload = {
            "prompt": prompt
        }
        
        if options:
            payload.update(options)
        
        try:
            response = requests.post(
                endpoint,
                headers=self.headers,
                json=payload
            )
            response.raise_for_status()
            return response.content
        except requests.exceptions.RequestException as e:
            logger.error(f"Error calling Grok API: {e}")
            if hasattr(e, 'response') and e.response is not None:
                logger.error(f"Response content: {e.response.text}")
            raise
    
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