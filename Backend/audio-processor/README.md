# SoundScape AI Audio Processor

This service processes audio using the Grok AI API for analysis, transcription, and generation.

## Security Note

The service uses API keys which should be handled securely:

1. **DO NOT commit API keys to the repository**
2. **Use environment variables in production**

## Setup

### Environment Variables

For production, set the following environment variable:

```
SOUNDSCAPE_GROK_API_KEY=your_api_key_here
```

Alternatively, you can store the API key in the `config/secrets.json` file for development, but ensure this file is git-ignored.

### Installation

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Run the service:

```bash
uvicorn api:app --host 0.0.0.0 --port 8000
```

### Using Docker

Build the Docker image:

```bash
docker build -t soundscape-audio-processor .
```

Run the container:

```bash
docker run -p 8000:8000 -e SOUNDSCAPE_GROK_API_KEY=your_api_key_here soundscape-audio-processor
```

## API Endpoints

- `POST /process` - Process an audio file
  - Required: `file` (audio file)
  - Optional: `analyze` (boolean), `transcribe` (boolean)

- `POST /generate` - Generate audio from text
  - Required: `prompt` (text description)
  - Optional: `options` (JSON object with additional parameters)

- `GET /health` - Health check endpoint

## Example Usage

### Process Audio

```bash
curl -X POST "http://localhost:8000/process" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/your/audio.wav" \
  -F "analyze=true" \
  -F "transcribe=true"
```

### Generate Audio

```bash
curl -X POST "http://localhost:8000/generate" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A gentle rainstorm with thunder in the distance"}'
```