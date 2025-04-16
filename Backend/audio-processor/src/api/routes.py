from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict, Any
import uuid
import os
import json
import asyncio
from datetime import datetime

from ..processors.audio_analyzer import AudioAnalyzer
from ..processors.audio_converter import AudioConverter
from ..processors.waveform_generator import WaveformGenerator
from ..services.storage_service import StorageService
from ..services.auth_service import get_current_user, User
from ..services.db_service import AudioDatabase

app = FastAPI(
    title="SoundScape-AI Audio Processor",
    description="Advanced audio processing service for SoundScape-AI platform",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
audio_analyzer = AudioAnalyzer()
audio_converter = AudioConverter()
waveform_generator = WaveformGenerator()
storage_service = StorageService()
db = AudioDatabase()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/analyze")
async def analyze_audio(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    store_results: bool = Query(True, description="Whether to store analysis results in database")
):
    """
    Analyze audio file and extract features
    
    - Extracts audio features using signal processing
    - Generates emotion and genre predictions using ML models
    - Optionally stores results in database
    """
    if not file.filename.lower().endswith(('.mp3', '.wav', '.flac', '.aac', '.ogg')):
        raise HTTPException(status_code=400, detail="Unsupported file format")
    
    try:
        # Read file
        contents = await file.read()
        
        # Generate unique ID for this analysis
        analysis_id = str(uuid.uuid4())
        
        # Process file
        analysis_result = audio_analyzer.process_file(contents)
        
        # Add metadata
        analysis_result["file_name"] = file.filename
        analysis_result["user_id"] = user.id
        analysis_result["analysis_id"] = analysis_id
        analysis_result["created_at"] = datetime.now().isoformat()
        
        # Store in database if requested
        if store_results:
            background_tasks.add_task(db.store_analysis, analysis_id, user.id, analysis_result)
        
        return {
            "analysis_id": analysis_id,
            "results": analysis_result
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/convert")
async def convert_audio(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    target_format: str = Query(..., description="Target format (mp3, wav, flac, ogg)"),
    bitrate: Optional[int] = Query(None, description="Bitrate in kbps (for lossy formats)"),
    sample_rate: Optional[int] = Query(None, description="Sample rate in Hz")
):
    """
    Convert audio file to different format
    
    - Supports conversion between common audio formats
    - Can specify bitrate and sample rate
    - Returns a URL to download the converted file
    """
    if not file.filename.lower().endswith(('.mp3', '.wav', '.flac', '.aac', '.ogg')):
        raise HTTPException(status_code=400, detail="Unsupported file format")
    
    if target_format not in ['mp3', 'wav', 'flac', 'ogg']:
        raise HTTPException(status_code=400, detail="Unsupported target format")
    
    try:
        # Read file
        contents = await file.read()
        
        # Convert file
        converted_data = await audio_converter.convert(
            contents, 
            source_format=os.path.splitext(file.filename)[1][1:],
            target_format=target_format,
            bitrate=bitrate,
            sample_rate=sample_rate
        )
        
        # Generate filename
        filename_base = os.path.splitext(file.filename)[0]
        new_filename = f"{filename_base}_{datetime.now().strftime('%Y%m%d%H%M%S')}.{target_format}"
        
        # Upload to storage
        file_url = await storage_service.upload_file(
            file_data=converted_data,
            filename=f"conversions/{user.id}/{new_filename}",
            content_type=f"audio/{target_format}"
        )
        
        return {
            "original_filename": file.filename,
            "converted_filename": new_filename,
            "download_url": file_url,
            "format": target_format,
            "size_bytes": len(converted_data)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Conversion failed: {str(e)}")

@app.post("/waveform")
async def generate_waveform(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    width: int = Query(1800, description="Width of the waveform image"),
    height: int = Query(280, description="Height of the waveform image"),
    color: str = Query("#1E88E5", description="Waveform color (hex code)"),
    background: str = Query("transparent", description="Background color")
):
    """
    Generate waveform visualization from audio file
    
    - Creates visual representation of audio amplitude over time
    - Customizable width, height, and colors
    - Returns URL to the generated image
    """
    if not file.filename.lower().endswith(('.mp3', '.wav', '.flac', '.aac', '.ogg')):
        raise HTTPException(status_code=400, detail="Unsupported file format")
    
    try:
        # Read file
        contents = await file.read()
        
        # Generate waveform
        waveform_image = await waveform_generator.generate(
            audio_data=contents,
            width=width,
            height=height,
            color=color,
            background=background
        )
        
        # Generate filename
        filename_base = os.path.splitext(file.filename)[0]
        image_filename = f"{filename_base}_waveform_{datetime.now().strftime('%Y%m%d%H%M%S')}.png"
        
        # Upload to storage
        image_url = await storage_service.upload_file(
            file_data=waveform_image,
            filename=f"waveforms/{user.id}/{image_filename}",
            content_type="image/png"
        )
        
        # Generate waveform data for JSON response
        waveform_data = await waveform_generator.generate_data_points(
            audio_data=contents,
            num_points=width
        )
        
        return {
            "waveform_image_url": image_url,
            "waveform_data": waveform_data[:100],  # Return first 100 points as preview
            "waveform_data_url": f"/api/audio/waveform-data/{os.path.basename(image_url)}",
            "width": width,
            "height": height
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Waveform generation failed: {str(e)}")

@app.post("/compare")
async def compare_audio(
    file1: UploadFile = File(...),
    file2: UploadFile = File(...),
    user: User = Depends(get_current_user)
):
    """
    Compare two audio files and calculate similarity scores
    
    - Compares tempo, timbre, and harmonic content
    - Returns similarity scores between 0.0 and 1.0
    - Higher scores indicate greater similarity
    """
    try:
        # Read files
        contents1 = await file1.read()
        contents2 = await file2.read()
        
        # Process files to get audio time series
        audio1 = await audio_converter.to_mono_pcm(contents1)
        audio2 = await audio_converter.to_mono_pcm(contents2)
        
        # Compare tracks
        comparison_results = audio_analyzer.compare_tracks(audio1, audio2)
        
        return {
            "file1": file1.filename,
            "file2": file2.filename,
            "comparison_results": comparison_results
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comparison failed: {str(e)}")

@app.get("/analysis/{analysis_id}")
async def get_analysis(
    analysis_id: str,
    user: User = Depends(get_current_user)
):
    """Get stored analysis results by ID"""
    try:
        analysis = await db.get_analysis(analysis_id)
        
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        # Check if user owns this analysis or has admin access
        if analysis.get("user_id") != user.id and user.role != "admin":
            raise HTTPException(status_code=403, detail="Not authorized to access this analysis")
        
        return analysis
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve analysis: {str(e)}")

@app.get("/user-analyses")
async def get_user_analyses(
    user: User = Depends(get_current_user),
    skip: int = Query(0, description="Number of records to skip for pagination"),
    limit: int = Query(10, description="Maximum number of records to return")
):
    """Get all analyses for current user"""
    try:
        analyses = await db.get_user_analyses(user.id, skip, limit)
        count = await db.count_user_analyses(user.id)
        
        return {
            "total": count,
            "skip": skip,
            "limit": limit,
            "analyses": analyses
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve analyses: {str(e)}")

@app.delete("/analysis/{analysis_id}")
async def delete_analysis(
    analysis_id: str,
    user: User = Depends(get_current_user)
):
    """Delete stored analysis by ID"""
    try:
        analysis = await db.get_analysis(analysis_id)
        
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        # Check if user owns this analysis or has admin access
        if analysis.get("user_id") != user.id and user.role != "admin":
            raise HTTPException(status_code=403, detail="Not authorized to delete this analysis")
        
        await db.delete_analysis(analysis_id)
        
        return {"message": "Analysis deleted successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete analysis: {str(e)}")

@app.websocket("/stream")
async def websocket_endpoint(websocket):
    """
    Real-time audio streaming and analysis endpoint
    
    Allows clients to stream audio data for real-time analysis
    """
    await websocket.accept()
    
    try:
        # Initialize buffer for incoming audio data
        audio_buffer = bytearray()
        
        while True:
            # Receive chunk of audio data
            data = await websocket.receive_bytes()
            
            # Add to buffer
            audio_buffer.extend(data)
            
            # Process if buffer is large enough
            if len(audio_buffer) > 4096:  # Process in ~4KB chunks
                # Extract features from buffer
                chunk = bytes(audio_buffer[:4096])
                audio_buffer = audio_buffer[4096:]
                
                # Process chunk
                try:
                    # This would be a simplified version of the analysis
                    # that works with streaming audio chunks
                    features = await asyncio.to_thread(
                        audio_analyzer.process_streaming_chunk, 
                        chunk
                    )
                    
                    # Send processed data back to client
                    await websocket.send_json(features)
                except Exception as e:
                    await websocket.send_json({"error": str(e)})
    
    except Exception as e:
        await websocket.close(code=1001, reason=f"Error: {str(e)}")