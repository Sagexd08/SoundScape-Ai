# Exit on error
$ErrorActionPreference = "Stop"

Write-Host "Setting up Node.js environment..." -ForegroundColor Green
$env:NODE_OPTIONS = "--max_old_space_size=4096"

Write-Host "Installing dependencies with legacy-peer-deps..." -ForegroundColor Green
npm install --legacy-peer-deps

Write-Host "Installing Frontend dependencies with legacy-peer-deps..." -ForegroundColor Green
Set-Location -Path Frontend
npm install --legacy-peer-deps

Write-Host "Building the application..." -ForegroundColor Green
npm run build

Write-Host "Build completed successfully!" -ForegroundColor Green
