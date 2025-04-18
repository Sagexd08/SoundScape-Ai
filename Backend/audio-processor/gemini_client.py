import requests
import logging
from typing import Dict, Any, List, Optional
import json
import sys
import os
import base64
import numpy as np
import wave
from io import BytesIO

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

    def generate_audio(self, prompt: str, options: Optional[Dict[str, Any]] = None) -> bytes:
        """
        Generate audio based on a text prompt

        Args:
            prompt: Text description for audio generation
            options: Additional options for generation

        Returns:
            Binary audio data
        """
        logger.info(f"Generating audio with Gemini model: {prompt}")

        # Since Gemini doesn't directly support audio generation yet,
        # we'll use a text-to-audio approach by generating a detailed description
        # and then converting it to audio parameters for synthesis

        # Default options for audio generation
        default_options = {
            "temperature": 0.7,
            "maxOutputTokens": 1024,
            "topP": 0.8,
            "topK": 40
        }

        # Merge default options with provided options
        generation_options = {**default_options}
        if options:
            for key, value in options.items():
                if key in ["temperature", "maxOutputTokens", "topP", "topK"]:
                    generation_options[key] = value

        # Create an enhanced prompt for detailed audio description
        enhanced_prompt = f"""
        Create a detailed audio generation specification based on this description: "{prompt}"

        Include specific details about:
        - Sound sources and instruments
        - Frequency characteristics
        - Temporal evolution
        - Spatial positioning
        - Mood and emotional qualities
        - Rhythmic elements
        """

        try:
            # Generate the detailed audio description
            response = self.generate_text(enhanced_prompt, generation_options)

            # Extract the generated text
            generated_text = ""
            if "candidates" in response and len(response["candidates"]) > 0:
                if "content" in response["candidates"][0] and "parts" in response["candidates"][0]["content"]:
                    for part in response["candidates"][0]["content"]["parts"]:
                        if "text" in part:
                            generated_text += part["text"]

            if not generated_text:
                logger.error("Failed to generate audio description")
                raise Exception("Failed to generate audio description")

            logger.info(f"Generated audio description: {generated_text[:100]}...")

            # In a real implementation, this would use the description to synthesize audio
            # For now, we'll generate a simple audio file based on the options

            # Create a simple WAV file with parameters based on the options
            sample_rate = 44100
            duration = options.get("duration", 30) if options else 30

            # Generate a simple sine wave with varying frequency
            t = np.linspace(0, duration, int(sample_rate * duration), endpoint=False)

            # Base frequency and modulation
            base_freq = 440  # A4 note

            # Use different parameters based on the mood if specified
            mood = options.get("mood", "relaxed") if options else "relaxed"

            if mood == "relaxed" or mood == "peaceful":
                frequencies = [base_freq, base_freq * 1.5, base_freq * 2]
                amplitudes = [0.5, 0.3, 0.2]
                mod_freq = 0.1
            elif mood == "energetic" or mood == "happy":
                frequencies = [base_freq * 1.2, base_freq * 1.8, base_freq * 2.5]
                amplitudes = [0.4, 0.4, 0.2]
                mod_freq = 0.3
            elif mood == "melancholic" or mood == "sad":
                frequencies = [base_freq * 0.8, base_freq * 1.2, base_freq * 1.6]
                amplitudes = [0.6, 0.3, 0.1]
                mod_freq = 0.05
            else:
                frequencies = [base_freq, base_freq * 1.5, base_freq * 2]
                amplitudes = [0.5, 0.3, 0.2]
                mod_freq = 0.1

            # Generate the audio signal
            audio_signal = np.zeros_like(t)
            for freq, amp in zip(frequencies, amplitudes):
                audio_signal += amp * np.sin(2 * np.pi * freq * t + 0.3 * np.sin(2 * np.pi * mod_freq * t))

            # Normalize
            audio_signal = audio_signal / np.max(np.abs(audio_signal))

            # Convert to 16-bit PCM
            audio_signal = (audio_signal * 32767).astype(np.int16)

            # Create a BytesIO object to hold the WAV file
            buffer = BytesIO()

            # Write the WAV file
            with wave.open(buffer, 'wb') as wf:
                wf.setnchannels(1)
                wf.setsampwidth(2)  # 2 bytes for 16-bit audio
                wf.setframerate(sample_rate)
                wf.writeframes(audio_signal.tobytes())

            # Get the WAV data
            buffer.seek(0)
            wav_data = buffer.read()

            logger.info(f"Generated audio data size: {len(wav_data)} bytes")
            return wav_data

        except Exception as e:
            logger.error(f"Error generating audio with Gemini: {str(e)}")
            raise

# Create a singleton instance
gemini_client = GeminiClient()
