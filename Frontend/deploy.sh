#!/bin/bash
# Deployment script for Next.js application

echo "Starting deployment process..."

# Clean up any previous build artifacts
echo "Cleaning up previous builds..."
rm -rf .next
rm -rf node_modules

# Install dependencies with fixed versions
echo "Installing dependencies..."
npm install --legacy-peer-deps

# Build the application
echo "Building the application..."
npm run build

# Run tests if they exist
if [ -f "package.json" ] && grep -q "\"test\":" "package.json"; then
  echo "Running tests..."
  npm test
fi

# Deploy to Vercel if Vercel CLI is installed
if command -v vercel &> /dev/null; then
  echo "Deploying to Vercel..."
  vercel --prod
else
  echo "Vercel CLI not found. You can deploy manually using one of these methods:"
  echo "1. Run: 'npx vercel --prod' to deploy to Vercel"
  echo "2. Push to your repository to trigger CI/CD if configured"
  echo "3. Run: 'npm run start' to start a local production server"
fi

echo "Deployment process completed!"