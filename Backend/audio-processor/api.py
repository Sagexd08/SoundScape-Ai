from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Depends, BackgroundTasks
from fastapi.responses import StreamingResponse, JSONResponse
from typing import Optional, Dict, Any, List
import logging
import json
import io
import os
from pydantic import BaseModel

from processor import audio_processor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="SoundScape AI Audio Processor API")

class AudioGenerationRequest(BaseModel):
    prompt: str
    options: Optional[Dict[str, Any]] = None

@app.post("/process", response_class=JSONResponse)
async def process_audio(
    file: UploadFile = File(...),
    analyze: bool = Form(True),
    transcribe: bool = Form(False)
):
    """
    Process an uploaded audio file with various analysis options
    """
    try:
        # Read the uploaded file
        audio_data = await file.read()
        
        # Process the audio
        results = audio_processor.process_file(
            audio_data,
            analyze=analyze,
            transcribe=transcribe
        )
        
        return JSONResponse(content=results)
    except Exception as e:
        logger.error(f"Error processing audio: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing audio: {str(e)}")

@app.post("/generate", response_class=StreamingResponse)
async def generate_audio(request: AudioGenerationRequest):
    """
    Generate audio based on a text prompt
    """
    try:
        audio_data = audio_processor.generate_audio(
            request.prompt, 
            request.options
        )
        
        # Return the audio data as a streaming response
        return StreamingResponse(
            io.BytesIO(audio_data),
            media_type="audio/wav"
        )
    except Exception as e:
        logger.error(f"Error generating audio: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating audio: {str(e)}")

@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy", "service": "audio-processor"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)