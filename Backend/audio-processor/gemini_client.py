import requests
import logging
from typing import Dict, Any, List, Optional
import json
import sys
import os
import base64

# Add the parent directory to sys.path to import from config
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from config.api_key_manager import api_key_manager

logger = logging.getLogger(__name__)

class GeminiClient:
    """
    Client for interacting with the Google Gemini API for AI-powered audio and text processing
    """
    def __init__(self):
        self.api_key = "AIzaSyBUS_G7RP-5QBHxGW3RFFSt3Snbs983okQ"  # Using the provided API key
        self.api_base_url = "https://generativelanguage.googleapis.com/v1"
        self.model = "gemini-1.5-pro"
        
    def generate_text(self, prompt: str, options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Generate text using Gemini API
        
        Args:
            prompt: Text prompt for generation
            options: Additional options for generation
            
        Returns:
            JSON response from the Gemini API
        """
        endpoint = f"{self.api_base_url}/models/{self.model}:generateContent?key={self.api_key}"
        
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": prompt
                        }
                    ]
                }
            ]
        }
        
        # Add any additional options
        if options:
            for key, value in options.items():
                payload[key] = value
        
        try:
            response = requests.post(
                endpoint,
                json=payload
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error calling Gemini API: {e}")
            if hasattr(e, 'response') and e.response is not None:
                logger.error(f"Response content: {e.response.text}")
            raise
    
    def analyze_audio(self, audio_data: bytes, prompt: str = "Analyze this audio", options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Analyze audio data using Gemini multimodal capabilities
        
        Args:
            audio_data: Binary audio data
            prompt: Text prompt for analysis
            options: Additional options for analysis
            
        Returns:
            JSON response from the Gemini API
        """
        endpoint = f"{self.api_base_url}/models/{self.model}:generateContent?key={self.api_key}"
        
        # Convert audio to base64
        audio_b64 = base64.b64encode(audio_data).decode('utf-8')
        
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": prompt
                        },
                        {
                            "inline_data": {
                                "mime_type": "audio/wav",
                                "data": audio_b64
                            }
                        }
                    ]
                }
            ]
        }
        
        # Add any additional options
        if options:
            for key, value in options.items():
                payload[key] = value
        
        try:
            response = requests.post(
                endpoint,
                json=payload
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error calling Gemini API for audio analysis: {e}")
            if hasattr(e, 'response') and e.response is not None:
                logger.error(f"Response content: {e.response.text}")
            raise
    
    def generate_audio_description(self, audio_data: bytes, options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Generate a detailed description of audio content
        
        Args:
            audio_data: Binary audio data
            options: Additional options for generation
            
        Returns:
            Description of the audio content
        """
        prompt = """
        Please analyze this audio file and provide a detailed description including:
        1. Instruments or sounds detected
        2. Mood and emotional qualities
        3. Tempo and rhythm characteristics
        4. Genre classification if applicable
        5. Any other notable audio features
        """
        
        return self.analyze_audio(audio_data, prompt, options)
    
    def suggest_audio_enhancements(self, audio_data: bytes, options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Suggest enhancements for audio quality
        
        Args:
            audio_data: Binary audio data
            options: Additional options
            
        Returns:
            Suggestions for audio enhancement
        """
        prompt = """
        Please analyze this audio file and suggest specific enhancements for:
        1. Overall audio quality
        2. Balance of frequencies
        3. Clarity and definition
        4. Spatial characteristics
        5. Any specific issues that should be addressed
        """
        
        return self.analyze_audio(audio_data, prompt, options)

# Create a singleton instance
gemini_client = GeminiClient()
