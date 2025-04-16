"""
Supabase Storage Integration for Audio Processor

This module provides utilities for storing and retrieving audio files
using Supabase storage.
"""

import os
import logging
import requests
import json
from typing import Dict, Any, BinaryIO, Optional, Union
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger(__name__)

class SupabaseStorage:
    """Client for interacting with Supabase Storage"""
    
    def __init__(self):
        self.supabase_url = os.environ.get('SUPABASE_URL')
        self.supabase_key = os.environ.get('SUPABASE_API_KEY')
        self.audio_bucket = 'audio-files'
        self.waveform_bucket = 'waveform-images'
        
        if not self.supabase_url or not self.supabase_key:
            logger.error("Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_API_KEY environment variables.")
            raise ValueError("Missing Supabase credentials")
        
        logger.info(f"Initialized Supabase Storage client with URL: {self.supabase_url}")
        
        # Set up the base URL for storage API
        self.storage_url = f"{self.supabase_url}/storage/v1"
        
        # Default headers for all requests
        self.headers = {
            "apikey": self.supabase_key,
            "Authorization": f"Bearer {self.supabase_key}"
        }
    
    def ensure_buckets_exist(self):
        """
        Check if required buckets exist and create them if they don't
        """
        required_buckets = [
            {"name": self.audio_bucket, "public": False},
            {"name": self.waveform_bucket, "public": True}
        ]
        
        try:
            # Get existing buckets
            response = requests.get(
                f"{self.storage_url}/bucket",
                headers=self.headers
            )
            response.raise_for_status()
            
            existing_buckets = response.json()
            existing_bucket_names = [bucket.get("name") for bucket in existing_buckets]
            
            # Create any missing buckets
            for bucket in required_buckets:
                if bucket["name"] not in existing_bucket_names:
                    logger.info(f"Creating bucket: {bucket['name']}")
                    self._create_bucket(bucket["name"], bucket["public"])
            
            return True
        except requests.exceptions.RequestException as e:
            logger.error(f"Error checking/creating buckets: {e}")
            if hasattr(e, 'response') and e.response is not None:
                logger.error(f"Response content: {e.response.text}")
            return False
    
    def _create_bucket(self, name, is_public=False):
        """
        Create a new storage bucket
        """
        payload = {
            "name": name,
            "public": is_public
        }
        
        response = requests.post(
            f"{self.storage_url}/bucket",
            headers=self.headers,
            json=payload
        )
        response.raise_for_status()
        return response.json()
    
    def upload_audio(self, file_data: bytes, filename: str, content_type: str = 'audio/wav') -> Dict[str, Any]:
        """
        Upload an audio file to Supabase Storage
        
        Args:
            file_data: The binary audio data
            filename: The desired filename
            content_type: The MIME type of the audio
            
        Returns:
            Dict containing upload information
        """
        # Ensure buckets exist
        self.ensure_buckets_exist()
        
        url = f"{self.storage_url}/object/{self.audio_bucket}/{filename}"
        
        headers = {**self.headers, "Content-Type": content_type}
        
        try:
            response = requests.post(
                url,
                headers=headers,
                data=file_data
            )
            response.raise_for_status()
            
            result = response.json()
            logger.info(f"Successfully uploaded audio file: {filename}")
            
            # Return upload info with public URL
            return {
                "key": result.get("Key"),
                "filename": filename,
                "size": len(file_data),
                "content_type": content_type,
                "public_url": f"{self.supabase_url}/storage/v1/object/public/{self.audio_bucket}/{filename}"
            }
        
        except requests.exceptions.RequestException as e:
            logger.error(f"Error uploading audio file to Supabase: {e}")
            if hasattr(e, 'response') and e.response is not None:
                logger.error(f"Response content: {e.response.text}")
            raise
    
    def upload_waveform(self, image_data: bytes, filename: str) -> Dict[str, Any]:
        """
        Upload a waveform image to Supabase Storage
        
        Args:
            image_data: The binary image data
            filename: The desired filename
            
        Returns:
            Dict containing upload information
        """
        # Ensure buckets exist
        self.ensure_buckets_exist()
        
        url = f"{self.storage_url}/object/{self.waveform_bucket}/{filename}"
        
        headers = {**self.headers, "Content-Type": "image/png"}
        
        try:
            response = requests.post(
                url,
                headers=headers,
                data=image_data
            )
            response.raise_for_status()
            
            result = response.json()
            logger.info(f"Successfully uploaded waveform image: {filename}")
            
            # Return upload info with public URL
            return {
                "key": result.get("Key"),
                "filename": filename,
                "size": len(image_data),
                "public_url": f"{self.supabase_url}/storage/v1/object/public/{self.waveform_bucket}/{filename}"
            }
        
        except requests.exceptions.RequestException as e:
            logger.error(f"Error uploading waveform image to Supabase: {e}")
            if hasattr(e, 'response') and e.response is not None:
                logger.error(f"Response content: {e.response.text}")
            raise
    
    def get_audio_file(self, filename: str) -> bytes:
        """
        Get an audio file from Supabase Storage
        
        Args:
            filename: The filename to retrieve
            
        Returns:
            Binary audio data
        """
        url = f"{self.storage_url}/object/{self.audio_bucket}/{filename}"
        
        try:
            response = requests.get(
                url,
                headers=self.headers
            )
            response.raise_for_status()
            return response.content
        
        except requests.exceptions.RequestException as e:
            logger.error(f"Error retrieving audio file from Supabase: {e}")
            if hasattr(e, 'response') and e.response is not None:
                logger.error(f"Response content: {e.response.text}")
            raise
    
    def delete_audio_file(self, filename: str) -> bool:
        """
        Delete an audio file from Supabase Storage
        
        Args:
            filename: The filename to delete
            
        Returns:
            True if successful
        """
        url = f"{self.storage_url}/object/{self.audio_bucket}/{filename}"
        
        try:
            response = requests.delete(
                url,
                headers=self.headers
            )
            response.raise_for_status()
            logger.info(f"Successfully deleted audio file: {filename}")
            return True
        
        except requests.exceptions.RequestException as e:
            logger.error(f"Error deleting audio file from Supabase: {e}")
            if hasattr(e, 'response') and e.response is not None:
                logger.error(f"Response content: {e.response.text}")
            return False
    
    def create_signed_url(self, filename: str, expiry_seconds: int = 3600) -> str:
        """
        Create a signed URL for accessing a private audio file
        
        Args:
            filename: The filename to access
            expiry_seconds: The time in seconds until the link expires
            
        Returns:
            Signed URL string
        """
        url = f"{self.storage_url}/object/sign/{self.audio_bucket}/{filename}"
        
        params = {
            "expiresIn": expiry_seconds
        }
        
        try:
            response = requests.post(
                url,
                headers=self.headers,
                json=params
            )
            response.raise_for_status()
            result = response.json()
            return result.get("signedURL")
        
        except requests.exceptions.RequestException as e:
            logger.error(f"Error creating signed URL for Supabase: {e}")
            if hasattr(e, 'response') and e.response is not None:
                logger.error(f"Response content: {e.response.text}")
            raise

# Create a singleton instance
supabase_storage = SupabaseStorage()
