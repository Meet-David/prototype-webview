#!/bin/bash

# Function to get stored token
get_stored_token() {
  if [ -f ~/.meetdavid_ngrok_token ]; then
    cat ~/.meetdavid_ngrok_token
  fi
}

# Function to save token
save_token() {
  echo "$1" > ~/.meetdavid_ngrok_token
}

# Get stored token if exists
stored_token=$(get_stored_token)

# Ask for ngrok token
if [ -n "$stored_token" ]; then
  read -p "Enter ngrok auth token (press enter to use stored token): " token
  if [ -z "$token" ]; then
    token=$stored_token
  else
    save_token "$token"
  fi
else
  read -p "Enter ngrok auth token: " token
  save_token "$token"
fi

if [ -z "$token" ]; then
  echo "Error: Ngrok auth token is required"
  exit 1
fi

# Build frontend
echo "Building frontend..."
cd ../frontend
npm run build

# Copy dist to server
echo "Copying dist to server..."
rm -rf ../server/dist/public
mkdir -p ../server/dist/public
cp -r dist/* ../server/dist/public/

# Build and start server with ngrok
cd ../server
echo "Building server..."
npm run build

echo "Starting server with ngrok..."
export NODE_ENV=production
export NGROK_AUTH_TOKEN="$token"
node dist/index.js 