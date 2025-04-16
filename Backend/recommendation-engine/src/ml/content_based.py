import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional, Tuple
import logging
from sklearn.metrics.pairwise import cosine_similarity
import tensorflow as tf
from sentence_transformers import SentenceTransformer
import asyncio
import time

from ..models.audio_features import AudioFeatures
from ..services.database import MongoDBService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ContentBasedRecommender:
    """
    Content-based recommendation system that uses audio features to find similar tracks
    """
    
    def __init__(self):
        """Initialize the content-based recommender with services and models"""
        self.db = MongoDBService()
        
        # Load text embedding model for processing descriptions and tags
        try:
            self.text_model = SentenceTransformer('all-MiniLM-L6-v2')
            logger.info("Text embedding model loaded successfully")
        except Exception as e:
            logger.error(f"Error loading text embedding model: {e}")
            self.text_model = None
        
        # Feature weights for similarity calculation
        self.feature_weights = {
            'mfccs': 0.4,         # Timbre and tone quality
            'chroma': 0.2,         # Harmonic content
            'tempo': 0.15,         # Speed of the track
            'spectral_features': 0.15,  # Spectral characteristics
            'text_features': 0.1   # Tags and descriptions
        }
        
        # Cache for similarity matrices to improve performance
        self.similarity_cache = {}
        self.cache_timestamp = time.time()
        self.cache_ttl = 3600  # 1 hour
        
        logger.info("Content-based recommender initialized")
    
    async def get_similar_tracks(self, audio_features: AudioFeatures, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get tracks similar to the provided audio features
        
        Args:
            audio_features: The audio features to compare against
            limit: Maximum number of similar tracks to return
            
        Returns:
            List of similar tracks with similarity scores
        """
        try:
            # Fetch all audio features from the database
            # In a production environment, this should be optimized with pre-computed embeddings
            all_features = await self.db.get_all_audio_features(limit=1000)
            
            if not all_features:
                logger.warning("No audio features found in database")
                return []
            
            # Calculate similarities
            similarities = []
            for track_features in all_features:
                # Skip the same track
                if track_features.get('audio_id') == audio_features.audio_id:
                    continue
                
                # Calculate similarity
                similarity_score = self._calculate_similarity(audio_features, track_features)
                
                similarities.append({
                    'audio_id': track_features.get('audio_id'),
                    'score': similarity_score
                })
            
            # Sort by similarity score (descending)
            sorted_similarities = sorted(similarities, key=lambda x: x['score'], reverse=True)
            
            # Return top matches
            return sorted_similarities[:limit]
        
        except Exception as e:
            logger.error(f"Error getting similar tracks: {e}")
            return []
    
    def _calculate_similarity(self, source_features: AudioFeatures, target_features: Dict[str, Any]) -> float:
        """
        Calculate weighted similarity between two sets of audio features
        
        Args:
            source_features: Source AudioFeatures object
            target_features: Target features dictionary from database
            
        Returns:
            A similarity score between 0 and 1
        """
        try:
            # Convert target features to comparable format
            target = AudioFeatures(
                audio_id=target_features.get('audio_id'),
                mfccs=target_features.get('mfccs', []),
                chroma=target_features.get('chroma', []),
                tempo=target_features.get('tempo', 0),
                spectral_centroid=target_features.get('spectral_centroid', 0),
                spectral_bandwidth=target_features.get('spectral_bandwidth', 0),
                spectral_rolloff=target_features.get('spectral_rolloff', 0)
            )
            
            # Calculate feature-specific similarities
            similarities = {}
            
            # MFCCs similarity (timbre)
            if source_features.mfccs and target.mfccs:
                mfcc_sim = self._cosine_similarity(source_features.mfccs, target.mfccs)
                similarities['mfccs'] = mfcc_sim
            else:
                similarities['mfccs'] = 0
            
            # Chroma similarity (harmony)
            if source_features.chroma and target.chroma:
                chroma_sim = self._cosine_similarity(source_features.chroma, target.chroma)
                similarities['chroma'] = chroma_sim
            else:
                similarities['chroma'] = 0
            
            # Tempo similarity
            if source_features.tempo and target.tempo:
                tempo_diff = abs(source_features.tempo - target.tempo)
                tempo_max = max(source_features.tempo, target.tempo)
                tempo_sim = 1.0 - (tempo_diff / tempo_max) if tempo_max > 0 else 0
                similarities['tempo'] = tempo_sim
            else:
                similarities['tempo'] = 0
            
            # Spectral features similarity
            spectral_features_source = [
                source_features.spectral_centroid,
                source_features.spectral_bandwidth,
                source_features.spectral_rolloff
            ]
            
            spectral_features_target = [
                target.spectral_centroid,
                target.spectral_bandwidth,
                target.spectral_rolloff
            ]
            
            if all(spectral_features_source) and all(spectral_features_target):
                spectral_sim = self._cosine_similarity(spectral_features_source, spectral_features_target)
                similarities['spectral_features'] = spectral_sim
            else:
                similarities['spectral_features'] = 0
            
            # Text features similarity (if available)
            similarities['text_features'] = 0
            source_tags = target_features.get('tags', [])
            target_tags = target_features.get('tags', [])
            
            if source_tags and target_tags and self.text_model:
                source_embed = self.text_model.encode(' '.join(source_tags))
                target_embed = self.text_model.encode(' '.join(target_tags))
                text_sim = self._cosine_similarity(source_embed, target_embed)
                similarities['text_features'] = text_sim
            
            # Calculate weighted similarity
            weighted_similarity = sum(
                similarities[feature] * weight
                for feature, weight in self.feature_weights.items()
            )
            
            return weighted_similarity
        
        except Exception as e:
            logger.error(f"Error calculating similarity: {e}")
            return 0.0
    
    def _cosine_similarity(self, a, b) -> float:
        """
        Calculate cosine similarity between two vectors
        
        Args:
            a: First vector
            b: Second vector
            
        Returns:
            Cosine similarity (0-1)
        """
        a = np.array(a).reshape(1, -1)
        b = np.array(b).reshape(1, -1)
        
        # Handle zero vectors
        if np.all(a == 0) or np.all(b == 0):
            return 0.0
        
        return cosine_similarity(a, b)[0][0]
    
    async def get_recommendations_by_tags(self, tags: List[str], limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get recommendations based on tags/genres
        
        Args:
            tags: List of tags or genres to match
            limit: Maximum number of recommendations to return
            
        Returns:
            List of recommended tracks
        """
        if not tags or not self.text_model:
            return []
        
        try:
            # Encode tags
            tags_embedding = self.text_model.encode(' '.join(tags))
            
            # Get all tracks with their tags
            tracks = await self.db.get_tracks_with_tags()
            
            similarities = []
            for track in tracks:
                track_tags = track.get('tags', [])
                if not track_tags:
                    continue
                
                # Encode track tags
                track_embedding = self.text_model.encode(' '.join(track_tags))
                
                # Calculate similarity
                similarity = self._cosine_similarity(tags_embedding, track_embedding)
                
                similarities.append({
                    'audio_id': track.get('audio_id'),
                    'score': similarity
                })
            
            # Sort by similarity score (descending)
            sorted_similarities = sorted(similarities, key=lambda x: x['score'], reverse=True)
            
            # Return top matches
            return sorted_similarities[:limit]
        
        except Exception as e:
            logger.error(f"Error getting recommendations by tags: {e}")
            return []