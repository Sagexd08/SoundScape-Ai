const express = require('express');
const router = express.Router();
const axios = require('axios');
const multer = require('multer');
const { Readable } = require('stream');
const { authenticateJWT } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Audio processor service URL
const AUDIO_PROCESSOR_URL = process.env.AUDIO_PROCESSOR_URL || 'http://audio-processor:8000';

// Process audio file
router.post('/process', authenticateJWT, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Create form data
    const formData = new FormData();
    const fileBlob = new Blob([req.file.buffer], { type: req.file.mimetype });
    formData.append('file', fileBlob, req.file.originalname);
    
    // Add other form fields
    formData.append('analyze', req.body.analyze || 'true');
    formData.append('transcribe', req.body.transcribe || 'false');
    
    // Call the audio processor service
    const response = await axios.post(`${AUDIO_PROCESSOR_URL}/process`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error processing audio:', error.message);
    return res.status(500).json({ 
      error: 'Error processing audio',
      details: error.response?.data || error.message
    });
  }
});

// Generate audio
router.post('/generate', authenticateJWT, async (req, res) => {
  try {
    const { prompt, options } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    // Call the audio processor service
    const response = await axios.post(
      `${AUDIO_PROCESSOR_URL}/generate`, 
      { prompt, options },
      { responseType: 'arraybuffer' }
    );
    
    // Send the audio back to the client
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Disposition', 'attachment; filename="generated_audio.wav"');
    
    const stream = new Readable();
    stream.push(Buffer.from(response.data));
    stream.push(null);
    
    stream.pipe(res);
  } catch (error) {
    console.error('Error generating audio:', error.message);
    return res.status(500).json({ 
      error: 'Error generating audio',
      details: error.response?.data || error.message
    });
  }
});

// Health check
router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${AUDIO_PROCESSOR_URL}/health`);
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Audio processor health check failed:', error.message);
    return res.status(500).json({ 
      error: 'Audio processor service unavailable',
      details: error.message
    });
  }
});

module.exports = router;