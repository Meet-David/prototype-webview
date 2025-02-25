#!/bin/bash

# Define port
export PORT=3000

# Ask for WebSocket URL
echo "Enter your WebSocket URL (e.g., ws://your-domain.com or wss://your-domain.com):"
read -r WS_URL

# Print URL for confirmation
echo "🔌 WebSocket URL: $WS_URL"

# Build server
echo "Building server..."
npm run build

# Build frontend with the WebSocket URL
echo "Building frontend with WebSocket URL..."
cd ../frontend
export VITE_WS_URL="$WS_URL"
npm run build

# Copy dist to server
echo "Copying dist to server..."
rm -rf ../server/dist/public
mkdir -p ../server/dist/public
cp -r dist/* ../server/dist/public/

# Start server in production mode
cd ../server
echo "Starting server..."
export NODE_ENV=production
node dist/index.js 