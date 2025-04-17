#!/bin/bash

# Exit on error
set -e

echo "Setting up Node.js environment..."
export NODE_OPTIONS="--max_old_space_size=4096"

echo "Installing dependencies with legacy-peer-deps..."
npm install --legacy-peer-deps

echo "Installing Frontend dependencies with legacy-peer-deps..."
cd Frontend
npm install --legacy-peer-deps

echo "Building the application..."
npm run build

echo "Build completed successfully!"
