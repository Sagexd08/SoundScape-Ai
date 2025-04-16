# SoundScape-AI Backend Deployment Script

Write-Host "Starting SoundScape-AI Backend Deployment..." -ForegroundColor Green

# Load environment variables
if (Test-Path .env) {
    Write-Host "Loading environment variables from .env file..." -ForegroundColor Cyan
    Get-Content .env | ForEach-Object {
        if ($_ -match "^\s*([^#][^=]+)=(.*)$") {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
            Write-Host "Set $key environment variable" -ForegroundColor Gray
        }
    }
}

# Build Docker containers
Write-Host "Building Docker containers..." -ForegroundColor Cyan
docker-compose build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error building Docker containers. Exiting." -ForegroundColor Red
    exit 1
}

# Start Docker containers
Write-Host "Starting Docker containers..." -ForegroundColor Cyan
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error starting Docker containers. Exiting." -ForegroundColor Red
    exit 1
}

# Check if containers are running
Write-Host "Checking container status..." -ForegroundColor Cyan
docker-compose ps

Write-Host "SoundScape-AI Backend deployment completed successfully!" -ForegroundColor Green
Write-Host "API Gateway is accessible at: http://localhost:8000" -ForegroundColor Yellow
Write-Host "API Documentation is available at: http://localhost:8000/api/docs" -ForegroundColor Yellow
