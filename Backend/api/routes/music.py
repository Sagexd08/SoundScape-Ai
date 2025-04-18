from fastapi import APIRouter, HTTPException, Depends, Query, Body, File, UploadFile, Form
from fastapi.responses import StreamingResponse, JSONResponse
from typing import List, Optional, Dict, Any
from io import BytesIO
import logging
import json

from audio_processor.music_processor import music_processor

router = APIRouter(prefix="/music", tags=["music"])
logger = logging.getLogger(__name__)

@router.post("/generate")
async def generate_music(
    prompt: str = Body(..., description="Text description of the music to generate"),
    model: str = Body("grok", description="AI model to use (grok or gemini)"),
    genre: Optional[str] = Body(None, description="Music genre"),
    mood: Optional[str] = Body(None, description="Emotional mood"),
    tempo: Optional[int] = Body(None, description="Tempo in BPM"),
    instruments: Optional[List[str]] = Body(None, description="List of instruments to include"),
    duration: Optional[int] = Body(None, description="Duration in seconds"),
    save_to_library: bool = Body(True, description="Whether to save to user's library")
):
    """
    Generate music based on a text prompt and additional parameters
    """
    try:
        # Validate model
        if model.lower() not in ["grok", "gemini"]:
            raise HTTPException(status_code=400, detail="Invalid model. Must be 'grok' or 'gemini'")
        
        # Generate music
        result = await music_processor.generate_music(
            prompt=prompt,
            model=model,
            genre=genre,
            mood=mood,
            tempo=tempo,
            instruments=instruments,
            duration=duration,
            save_to_library=save_to_library
        )
        
        # Extract audio data from result
        audio_data = result.pop("audio_data", None)
        if not audio_data:
            raise HTTPException(status_code=500, detail="Failed to generate audio")
        
        # Return audio data as streaming response with metadata in headers
        return StreamingResponse(
            BytesIO(audio_data),
            media_type="audio/wav",
            headers={
                "X-Music-Metadata": json.dumps(result)
            }
        )
    
    except Exception as e:
        logger.error(f"Error generating music: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating music: {str(e)}")

@router.get("/genres")
async def get_available_genres():
    """
    Get a list of available music genres
    """
    genres = [
        "ambient", "electronic", "classical", "jazz", "rock", "pop", "hip-hop",
        "folk", "country", "blues", "r&b", "soul", "funk", "reggae", "world",
        "experimental", "cinematic", "orchestral", "chillout", "lofi"
    ]
    
    return {"genres": genres}

@router.get("/moods")
async def get_available_moods():
    """
    Get a list of available emotional moods
    """
    moods = [
        "relaxed", "energetic", "happy", "sad", "melancholic", "peaceful",
        "tense", "mysterious", "romantic", "epic", "playful", "dark",
        "uplifting", "dramatic", "nostalgic", "ethereal", "intense"
    ]
    
    return {"moods": moods}

@router.get("/instruments")
async def get_available_instruments():
    """
    Get a list of available instruments
    """
    instruments = [
        "piano", "guitar", "violin", "cello", "flute", "clarinet", "saxophone",
        "trumpet", "drums", "bass", "synth", "pad", "strings", "choir", "harp",
        "bells", "marimba", "organ", "electric guitar", "acoustic guitar"
    ]
    
    return {"instruments": instruments}
