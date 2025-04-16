import numpy as np
import tensorflow as tf
import librosa
import torch
from torch import nn
import torch.nn.functional as F
from transformers import AutoFeatureExtractor, AutoModelForAudioClassification
import joblib
import json
import os
from typing import Dict, List, Tuple, Any, Optional
import logging
from dataclasses import dataclass
from concurrent.futures import ThreadPoolExecutor
import io
import time
import asyncio
from scipy import signal
import hashlib
import redis
import pickle

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class AudioFeatureConfig:
    sample_rate: int = 22050
    n_fft: int = 2048
    hop_length: int = 512
    n_mels: int = 128
    n_mfcc: int = 20
    segment_duration: float = 5.0  # seconds
    overlap: float = 2.5  # seconds
    use_gpu: bool = torch.cuda.is_available()
    batch_size: int = 16
    model_path: str = "./models"
    cache_features: bool = True
    cache_ttl: int = 3600  # 1 hour
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

class AudioFeaturePipeline:
    """
    Advanced audio processing pipeline with ML model integration for feature extraction,
    music classification, emotion detection, and audio fingerprinting
    """
    
    def __init__(self, config: AudioFeatureConfig = None):
        """Initialize the audio feature pipeline with configuration"""
        self.config = config or AudioFeatureConfig()
        
        # Initialize device for PyTorch models
        self.device = torch.device("cuda" if self.config.use_gpu else "cpu")
        logger.info(f"Using device: {self.device}")
        
        # Load models
        self._load_models()
        
        # Initialize feature cache with Redis
        try:
            self.redis_client = redis.Redis.from_url(self.config.redis_url)
            self.redis_client.ping()
            self.cache_available = True
            logger.info("Redis cache connected")
        except:
            logger.warning("Redis cache not available, using memory cache")
            self.redis_client = None
            self.cache_available = False
            self.memory_cache = {}
        
        # Initialize thread pool for parallel processing
        self.executor = ThreadPoolExecutor(max_workers=4)
        
        logger.info("Audio feature pipeline initialized")
    
    def _load_models(self):
        """Load ML models for audio processing"""
        try:
            # Load genre classification model (using Hugging Face)
            model_name = "abreg/mms-tts-genre"
            self.genre_extractor = AutoFeatureExtractor.from_pretrained(model_name)
            self.genre_model = AutoModelForAudioClassification.from_pretrained(model_name)
            self.genre_model.to(self.device)
            
            # Load emotion recognition model
            emotion_model_path = os.path.join(self.config.model_path, "emotion_model.pt")
            if os.path.exists(emotion_model_path):
                self.emotion_model = torch.load(emotion_model_path, map_location=self.device)
                self.emotion_model.eval()
            else:
                logger.warning(f"Emotion model not found at {emotion_model_path}")
                self.emotion_model = None
            
            # Load audio fingerprinting model
            fingerprint_model_path = os.path.join(self.config.model_path, "fingerprint_model.pt")
            if os.path.exists(fingerprint_model_path):
                self.fingerprint_model = torch.load(fingerprint_model_path, map_location=self.device)
                self.fingerprint_model.eval()
            else:
                logger.warning(f"Fingerprint model not found at {fingerprint_model_path}")
                self.fingerprint_model = None
            
            # Load audio embedding model (for similarity search)
            embedding_model_path = os.path.join(self.config.model_path, "embedding_model.pt")
            if os.path.exists(embedding_model_path):
                self.embedding_model = torch.load(embedding_model_path, map_location=self.device)
                self.embedding_model.eval()
            else:
                logger.warning(f"Embedding model not found at {embedding_model_path}")
                self.embedding_model = None
            
            # Load pre-trained scaler for feature normalization
            scaler_path = os.path.join(self.config.model_path, "feature_scaler.joblib")
            if os.path.exists(scaler_path):
                self.feature_scaler = joblib.load(scaler_path)
            else:
                logger.warning(f"Feature scaler not found at {scaler_path}")
                self.feature_scaler = None
            
            logger.info("Models loaded successfully")
        
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            # Fall back to basic processing if models fail to load
            self.genre_model = None
            self.emotion_model = None
            self.fingerprint_model = None
            self.embedding_model = None
            self.feature_scaler = None
    
    async def process_audio(self, audio_data: bytes, extract_all: bool = True) -> Dict[str, Any]:
        """
        Process audio data and extract features
        
        Args:
            audio_data: Raw audio file bytes
            extract_all: Whether to extract all features or just basic ones
            
        Returns:
            Dictionary containing extracted features
        """
        start_time = time.time()
        
        # Generate a unique ID for this audio
        audio_hash = hashlib.md5(audio_data).hexdigest()
        
        # Check cache first
        cached_features = await self._get_from_cache(audio_hash)
        if cached_features:
            logger.info(f"Returning cached features for {audio_hash} ({time.time() - start_time:.2f}s)")
            return cached_features
        
        try:
            # Load audio with librosa
            y, sr = await asyncio.to_thread(
                librosa.load, 
                io.BytesIO(audio_data), 
                sr=self.config.sample_rate
            )
            
            # Extract basic features (always done)
            basic_features = await self._extract_basic_features(y, sr)
            
            result = {
                "audio_id": audio_hash,
                "duration": basic_features["duration"],
                "sample_rate": sr,
                **basic_features
            }
            
            # If extract_all, run advanced feature extraction
            if extract_all:
                # These operations can run in parallel
                feature_tasks = [
                    self._extract_advanced_features(y, sr),
                    self._classify_genre(y, sr),
                    self._detect_emotion(y, sr),
                    self._generate_fingerprint(y, sr),
                    self._generate_embedding(y, sr)
                ]
                
                # Wait for all tasks to complete
                advanced_results = await asyncio.gather(*feature_tasks, return_exceptions=True)
                
                # Process results, skipping any that had exceptions
                for res in advanced_results:
                    if not isinstance(res, Exception) and res:
                        result.update(res)
            
            # Calculate processing time
            processing_time = time.time() - start_time
            result["processing_time"] = processing_time
            
            # Cache the results
            await self._save_to_cache(audio_hash, result)
            
            logger.info(f"Processed audio in {processing_time:.2f}s")
            return result
        
        except Exception as e:
            logger.error(f"Error processing audio: {str(e)}")
            return {
                "audio_id": audio_hash,
                "error": str(e),
                "processing_time": time.time() - start_time
            }
    
    async def _extract_basic_features(self, y: np.ndarray, sr: int) -> Dict[str, Any]:
        """Extract basic audio features using librosa"""
        try:
            # Run CPU-bound operations in thread pool
            def extract():
                # Duration
                duration = librosa.get_duration(y=y, sr=sr)
                
                # RMS energy
                rms = np.mean(librosa.feature.rms(y=y))
                
                # Zero crossing rate
                zcr = np.mean(librosa.feature.zero_crossing_rate(y=y))
                
                # Spectral features
                spectral_centroid = np.mean(librosa.feature.spectral_centroid(y=y, sr=sr))
                spectral_bandwidth = np.mean(librosa.feature.spectral_bandwidth(y=y, sr=sr))
                spectral_rolloff = np.mean(librosa.feature.spectral_rolloff(y=y, sr=sr))
                
                # Tempo and beats
                tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
                
                # MFCC features
                mfccs = np.mean(librosa.feature.mfcc(
                    y=y, 
                    sr=sr, 
                    n_mfcc=self.config.n_mfcc
                ), axis=1)
                
                # Chroma features
                chroma = np.mean(librosa.feature.chroma_stft(y=y, sr=sr), axis=1)
                
                return {
                    "duration": float(duration),
                    "rms_energy": float(rms),
                    "zero_crossing_rate": float(zcr),
                    "spectral_centroid": float(spectral_centroid),
                    "spectral_bandwidth": float(spectral_bandwidth),
                    "spectral_rolloff": float(spectral_rolloff),
                    "tempo": float(tempo),
                    "mfccs": mfccs.tolist(),
                    "chroma_features": chroma.tolist()
                }
            
            return await asyncio.to_thread(extract)
        
        except Exception as e:
            logger.error(f"Error extracting basic features: {str(e)}")
            return {
                "duration": 0,
                "error_basic_features": str(e)
            }
    
    async def _extract_advanced_features(self, y: np.ndarray, sr: int) -> Dict[str, Any]:
        """Extract advanced audio features"""
        try:
            def extract():
                # Harmonic-percussive source separation
                y_harmonic, y_percussive = librosa.effects.hpss(y)
                
                # Harmonic features
                harmonic_rms = np.mean(librosa.feature.rms(y=y_harmonic))
                
                # Percussive features
                percussive_rms = np.mean(librosa.feature.rms(y=y_percussive))
                
                # Onset detection
                onset_env = librosa.onset.onset_strength(y=y, sr=sr)
                onsets = librosa.onset.onset_detect(
                    onset_envelope=onset_env, 
                    sr=sr, 
                    units='time'
                )
                
                # Pitch and harmonics
                pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
                pitch_mean = np.mean(pitches[pitches > 0]) if np.any(pitches > 0) else 0
                
                # Spectral contrast
                contrast = np.mean(librosa.feature.spectral_contrast(y=y, sr=sr), axis=1)
                
                # Tonnetz features (tonal centroid features)
                tonnetz = np.mean(librosa.feature.tonnetz(
                    y=librosa.effects.harmonic(y), 
                    sr=sr
                ), axis=1)
                
                # Rhythm features
                oenv = librosa.onset.onset_strength(y=y, sr=sr)
                tempo_hist = librosa.feature.tempogram(
                    onset_envelope=oenv, 
                    sr=sr
                )
                tempo_hist_mean = np.mean(tempo_hist, axis=1)
                
                return {
                    "advanced_features": {
                        "harmonic_rms": float(harmonic_rms),
                        "percussive_rms": float(percussive_rms),
                        "onset_count": len(onsets),
                        "onset_rate": len(onsets) / (len(y) / sr) if len(y) > 0 else 0,
                        "pitch_mean": float(pitch_mean),
                        "spectral_contrast": contrast.tolist(),
                        "tonnetz": tonnetz.tolist(),
                        "tempo_histogram": tempo_hist_mean.tolist()
                    }
                }
            
            return await asyncio.to_thread(extract)
        
        except Exception as e:
            logger.error(f"Error extracting advanced features: {str(e)}")
            return {
                "advanced_features": {
                    "error": str(e)
                }
            }
    
    async def _classify_genre(self, y: np.ndarray, sr: int) -> Dict[str, Any]:
        """Classify music genre using pre-trained model"""
        if self.genre_model is None or self.genre_extractor is None:
            return {"genre_prediction": {"error": "Genre model not available"}}
        
        try:
            # Prepare audio for the model
            def process():
                # Convert audio to the format expected by the model
                inputs = self.genre_extractor(
                    y, 
                    sampling_rate=sr, 
                    return_tensors="pt", 
                    padding=True
                )
                inputs = {k: v.to(self.device) for k, v in inputs.items()}
                
                # Get predictions
                with torch.no_grad():
                    outputs = self.genre_model(**inputs)
                    logits = outputs.logits
                    predictions = F.softmax(logits, dim=-1)
                
                # Get predicted genre and confidence
                probs = predictions[0].cpu().numpy()
                genres = self.genre_model.config.id2label
                
                # Return all genre probabilities
                genre_probs = {genres[i]: float(probs[i]) for i in range(len(genres))}
                
                # Get top 3 genres
                top_indices = np.argsort(probs)[-3:][::-1]
                top_genres = [genres[i] for i in top_indices]
                top_probs = [float(probs[i]) for i in top_indices]
                
                return {
                    "genre_prediction": {
                        "top_genres": [
                            {"genre": genre, "confidence": prob} 
                            for genre, prob in zip(top_genres, top_probs)
                        ],
                        "all_genres": genre_probs
                    }
                }
            
            return await asyncio.to_thread(process)
        
        except Exception as e:
            logger.error(f"Error classifying genre: {str(e)}")
            return {"genre_prediction": {"error": str(e)}}
    
    async def _detect_emotion(self, y: np.ndarray, sr: int) -> Dict[str, Any]:
        """Detect emotion in audio using pre-trained model"""
        if self.emotion_model is None:
            return {"emotion_prediction": {"error": "Emotion model not available"}}
        
        try:
            def process():
                # Extract mel spectrogram for the emotion model
                mel_spec = librosa.feature.melspectrogram(
                    y=y, 
                    sr=sr, 
                    n_mels=self.config.n_mels,
                    n_fft=self.config.n_fft,
                    hop_length=self.config.hop_length
                )
                mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)
                
                # Normalize
                mel_spec_db = (mel_spec_db - np.mean(mel_spec_db)) / (np.std(mel_spec_db) + 1e-8)
                
                # Convert to tensor and add batch dimension
                mel_tensor = torch.from_numpy(mel_spec_db).float().unsqueeze(0).unsqueeze(0)
                mel_tensor = mel_tensor.to(self.device)
                
                # Get predictions
                with torch.no_grad():
                    outputs = self.emotion_model(mel_tensor)
                    predictions = F.softmax(outputs, dim=1)
                
                # Define emotion labels
                emotion_labels = ["angry", "happy", "relaxed", "sad", "fearful", "surprised"]
                
                # Convert predictions to dictionary
                probs = predictions[0].cpu().numpy()
                emotion_probs = {emotion: float(prob) for emotion, prob in zip(emotion_labels, probs)}
                
                # Get top emotion
                top_emotion = emotion_labels[np.argmax(probs)]
                top_confidence = float(np.max(probs))
                
                return {
                    "emotion_prediction": {
                        "dominant_emotion": {
                            "emotion": top_emotion,
                            "confidence": top_confidence
                        },
                        "emotions": emotion_probs
                    }
                }
            
            return await asyncio.to_thread(process)
        
        except Exception as e:
            logger.error(f"Error detecting emotion: {str(e)}")
            return {"emotion_prediction": {"error": str(e)}}
    
    async def _generate_fingerprint(self, y: np.ndarray, sr: int) -> Dict[str, Any]:
        """Generate audio fingerprint for song identification"""
        if self.fingerprint_model is None:
            # Fallback to basic fingerprinting if model isn't available
            return await self._generate_basic_fingerprint(y, sr)
        
        try:
            def process():
                # Prepare audio data
                mel_spec = librosa.feature.melspectrogram(
                    y=y, 
                    sr=sr, 
                    n_mels=128,
                    n_fft=2048,
                    hop_length=512
                )
                mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)
                
                # Normalize
                mel_spec_db = (mel_spec_db - np.mean(mel_spec_db)) / (np.std(mel_spec_db) + 1e-8)
                
                # Convert to tensor and add batch dimension
                mel_tensor = torch.from_numpy(mel_spec_db).float().unsqueeze(0).unsqueeze(0)
                mel_tensor = mel_tensor.to(self.device)
                
                # Generate fingerprint
                with torch.no_grad():
                    fingerprint = self.fingerprint_model(mel_tensor)
                    fingerprint = fingerprint.cpu().numpy().flatten()
                
                # Convert to list for JSON serialization
                return {
                    "audio_fingerprint": {
                        "vector": fingerprint.tolist(),
                        "method": "neural_network"
                    }
                }
            
            return await asyncio.to_thread(process)
        
        except Exception as e:
            logger.error(f"Error generating fingerprint: {str(e)}")
            # Fall back to basic fingerprinting on error
            return await self._generate_basic_fingerprint(y, sr)
    
    async def _generate_basic_fingerprint(self, y: np.ndarray, sr: int) -> Dict[str, Any]:
        """Generate basic audio fingerprint using peak finding algorithm"""
        try:
            def process():
                # Extract spectrogram
                spec = np.abs(librosa.stft(y))
                
                # Find peaks in the spectrogram
                peaks = []
                for i in range(1, spec.shape[0]-1):
                    for j in range(1, spec.shape[1]-1):
                        if (spec[i, j] > spec[i-1, j] and 
                            spec[i, j] > spec[i+1, j] and 
                            spec[i, j] > spec[i, j-1] and 
                            spec[i, j] > spec[i, j+1] and
                            spec[i, j] > 0.5):  # Threshold to filter weak peaks
                            peaks.append((i, j, float(spec[i, j])))
                
                # Sort by magnitude and take top peaks
                peaks.sort(key=lambda x: x[2], reverse=True)
                top_peaks = peaks[:250]  # Use top 250 peaks
                
                # Create fingerprint from peak frequencies and times
                fingerprint = [(int(p[0]), int(p[1])) for p in top_peaks]
                
                return {
                    "audio_fingerprint": {
                        "peaks": fingerprint,
                        "method": "peak_finding"
                    }
                }
            
            return await asyncio.to_thread(process)
        
        except Exception as e:
            logger.error(f"Error generating basic fingerprint: {str(e)}")
            return {"audio_fingerprint": {"error": str(e)}}
    
    async def _generate_embedding(self, y: np.ndarray, sr: int) -> Dict[str, Any]:
        """Generate audio embedding vector for similarity search"""
        if self.embedding_model is None:
            return {"audio_embedding": {"error": "Embedding model not available"}}
        
        try:
            def process():
                # Extract mel spectrogram
                mel_spec = librosa.feature.melspectrogram(
                    y=y, 
                    sr=sr, 
                    n_mels=128,
                    n_fft=2048,
                    hop_length=512
                )
                mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)
                
                # Normalize
                mel_spec_db = (mel_spec_db - np.mean(mel_spec_db)) / (np.std(mel_spec_db) + 1e-8)
                
                # Convert to tensor and add batch dimension
                mel_tensor = torch.from_numpy(mel_spec_db).float().unsqueeze(0).unsqueeze(0)
                mel_tensor = mel_tensor.to(self.device)
                
                # Generate embedding
                with torch.no_grad():
                    embedding = self.embedding_model(mel_tensor)
                    embedding = embedding.cpu().numpy().flatten()
                
                # Convert to list for JSON serialization
                return {
                    "audio_embedding": {
                        "vector": embedding.tolist(),
                        "dimension": len(embedding)
                    }
                }
            
            return await asyncio.to_thread(process)
        
        except Exception as e:
            logger.error(f"Error generating embedding: {str(e)}")
            return {"audio_embedding": {"error": str(e)}}
    
    async def _get_from_cache(self, audio_hash: str) -> Optional[Dict[str, Any]]:
        """Get cached features from Redis or memory"""
        if not self.config.cache_features:
            return None
        
        cache_key = f"audiofeatures:{audio_hash}"
        
        if self.cache_available:
            try:
                cached_data = self.redis_client.get(cache_key)
                if cached_data:
                    return pickle.loads(cached_data)
            except Exception as e:
                logger.error(f"Redis cache error: {str(e)}")
        elif hasattr(self, 'memory_cache'):
            return self.memory_cache.get(cache_key)
        
        return None
    
    async def _save_to_cache(self, audio_hash: str, features: Dict[str, Any]) -> None:
        """Save features to Redis or memory cache"""
        if not self.config.cache_features:
            return
        
        cache_key = f"audiofeatures:{audio_hash}"
        
        if self.cache_available:
            try:
                self.redis_client.setex(
                    cache_key,
                    self.config.cache_ttl,
                    pickle.dumps(features)
                )
            except Exception as e:
                logger.error(f"Redis cache error: {str(e)}")
        elif hasattr(self, 'memory_cache'):
            self.memory_cache[cache_key] = features
    
    async def compare_audio(self, audio_data1: bytes, audio_data2: bytes) -> Dict[str, Any]:
        """
        Compare two audio files and calculate similarity scores
        
        Args:
            audio_data1: First audio file bytes
            audio_data2: Second audio file bytes
            
        Returns:
            Dictionary with similarity metrics
        """
        try:
            # Process both audio files
            features1 = await self.process_audio(audio_data1)
            features2 = await self.process_audio(audio_data2)
            
            # Check for errors
            if "error" in features1 or "error" in features2:
                return {
                    "error": "Error processing one or both audio files",
                    "details": {
                        "file1": features1.get("error", "No error"),
                        "file2": features2.get("error", "No error")
                    }
                }
            
            # Calculate similarities
            similarities = {}
            
            # Basic feature similarity
            if "mfccs" in features1 and "mfccs" in features2:
                mfcc_sim = self._cosine_similarity(
                    features1["mfccs"], 
                    features2["mfccs"]
                )
                similarities["timbre_similarity"] = float(mfcc_sim)
            
            if "chroma_features" in features1 and "chroma_features" in features2:
                chroma_sim = self._cosine_similarity(
                    features1["chroma_features"], 
                    features2["chroma_features"]
                )
                similarities["tonal_similarity"] = float(chroma_sim)
            
            # Tempo similarity
            if "tempo" in features1 and "tempo" in features2:
                tempo_diff = abs(features1["tempo"] - features2["tempo"])
                tempo_max = max(features1["tempo"], features2["tempo"])
                tempo_sim = 1.0 - (tempo_diff / tempo_max if tempo_max > 0 else 0)
                similarities["tempo_similarity"] = float(tempo_sim)
            
            # Embedding similarity (if available)
            if ("audio_embedding" in features1 and 
                "audio_embedding" in features2 and
                "vector" in features1["audio_embedding"] and
                "vector" in features2["audio_embedding"]):
                
                emb_sim = self._cosine_similarity(
                    features1["audio_embedding"]["vector"],
                    features2["audio_embedding"]["vector"]
                )
                similarities["embedding_similarity"] = float(emb_sim)
            
            # Fingerprint similarity
            if ("audio_fingerprint" in features1 and 
                "audio_fingerprint" in features2):
                
                if ("vector" in features1["audio_fingerprint"] and
                    "vector" in features2["audio_fingerprint"]):
                    # Neural network fingerprints
                    fp_sim = self._cosine_similarity(
                        features1["audio_fingerprint"]["vector"],
                        features2["audio_fingerprint"]["vector"]
                    )
                    similarities["fingerprint_similarity"] = float(fp_sim)
                
                elif ("peaks" in features1["audio_fingerprint"] and
                      "peaks" in features2["audio_fingerprint"]):
                    # Peak fingerprints
                    peak_sim = self._jaccard_similarity(
                        features1["audio_fingerprint"]["peaks"],
                        features2["audio_fingerprint"]["peaks"]
                    )
                    similarities["fingerprint_similarity"] = float(peak_sim)
            
            # Calculate overall similarity (weighted average)
            weights = {
                "timbre_similarity": 0.25,
                "tonal_similarity": 0.2,
                "tempo_similarity": 0.15,
                "embedding_similarity": 0.3,
                "fingerprint_similarity": 0.1
            }
            
            # Only use available similarities
            total_weight = 0
            overall_sim = 0
            
            for key, weight in weights.items():
                if key in similarities:
                    overall_sim += similarities[key] * weight
                    total_weight += weight
            
            if total_weight > 0:
                overall_sim = overall_sim / total_weight
            else:
                overall_sim = 0
            
            similarities["overall_similarity"] = float(overall_sim)
            
            # Add interpretation
            if overall_sim > 0.9:
                match_type = "identical or nearly identical tracks"
            elif overall_sim > 0.75:
                match_type = "same song, possibly different recording"
            elif overall_sim > 0.6:
                match_type = "very similar songs"
            elif overall_sim > 0.4:
                match_type = "somewhat similar songs"
            else:
                match_type = "different songs"
            
            return {
                "comparison_result": {
                    "similarities": similarities,
                    "match_type": match_type
                }
            }
        
        except Exception as e:
            logger.error(f"Error comparing audio: {str(e)}")
            return {"error": str(e)}
    
    def _cosine_similarity(self, a, b) -> float:
        """
        Calculate cosine similarity between two vectors
        
        Args:
            a: First vector
            b: Second vector
            
        Returns:
            Cosine similarity (0-1)
        """
        a = np.array(a)
        b = np.array(b)
        
        # Handle zero vectors
        if np.all(a == 0) or np.all(b == 0):
            return 0.0
        
        return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))
    
    def _jaccard_similarity(self, set1, set2) -> float:
        """
        Calculate Jaccard similarity between two sets
        
        Args:
            set1: First set
            set2: Second set
            
        Returns:
            Jaccard similarity (0-1)
        """
        # Convert to sets
        set1 = set(tuple(x) for x in set1)
        set2 = set(tuple(x) for x in set2)
        
        if not set1 or not set2:
            return 0.0
        
        intersection = len(set1.intersection(set2))
        union = len(set1.union(set2))
        
        return float(intersection / union if union > 0 else 0)