# SoundScape-AI Backend Development Script

Write-Host "Starting SoundScape-AI Backend in Development Mode..." -ForegroundColor Green

# Load environment variables
if (Test-Path .env.development) {
    Write-Host "Loading environment variables from .env.development file..." -ForegroundColor Cyan
    Get-Content .env.development | ForEach-Object {
        if ($_ -match "^\s*([^#][^=]+)=(.*)$") {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
            Write-Host "Set $key environment variable" -ForegroundColor Gray
        }
    }
}

# Check if MongoDB is running
try {
    Write-Host "Checking if MongoDB is running..." -ForegroundColor Cyan
    $mongoStatus = Test-NetConnection -ComputerName localhost -Port 27017 -InformationLevel Quiet
    if ($mongoStatus) {
        Write-Host "MongoDB is running." -ForegroundColor Green
    } else {
        Write-Host "MongoDB is not running. Please start MongoDB before continuing." -ForegroundColor Yellow
        Write-Host "You can download MongoDB from: https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
        $continue = Read-Host "Do you want to continue anyway? (y/n)"
        if ($continue -ne "y") {
            exit 1
        }
    }
} catch {
    Write-Host "Could not check MongoDB status. Continuing anyway..." -ForegroundColor Yellow
}

# Create a directory for logs
if (-not (Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" | Out-Null
}

# Function to start a service
function Start-Service {
    param (
        [string]$ServiceName,
        [string]$Command,
        [string]$WorkingDirectory
    )
    
    Write-Host "Starting $ServiceName..." -ForegroundColor Cyan
    
    $logFile = "logs\$ServiceName.log"
    
    # Start the service in a new PowerShell window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$WorkingDirectory'; $Command | Tee-Object -FilePath '$logFile'"
}

# Start API Gateway
Start-Service -ServiceName "api-gateway" -Command "cd api-gateway && npm install && npm run dev" -WorkingDirectory $PWD

# Start Auth Service
Start-Service -ServiceName "auth-service" -Command "cd auth-service && npm install && npm run dev" -WorkingDirectory $PWD

# Start User Service
Start-Service -ServiceName "user-service" -Command "cd user-service && npm install && npm run dev" -WorkingDirectory $PWD

# Start Audio Processor
Start-Service -ServiceName "audio-processor" -Command "cd audio-processor && pip install -r requirements.txt && uvicorn api:app --host 0.0.0.0 --port 8000" -WorkingDirectory $PWD

# Start Recommendation Engine
Start-Service -ServiceName "recommendation-engine" -Command "cd recommendation-engine && pip install -r requirements.txt && uvicorn api:app --host 0.0.0.0 --port 5000" -WorkingDirectory $PWD

# Start Storage Service
Start-Service -ServiceName "storage-service" -Command "cd storage-service && npm install && npm run dev" -WorkingDirectory $PWD

Write-Host "SoundScape-AI Backend services are starting in development mode!" -ForegroundColor Green
Write-Host "API Gateway will be accessible at: http://localhost:3000" -ForegroundColor Yellow
Write-Host "Check the logs directory for service logs." -ForegroundColor Yellow
