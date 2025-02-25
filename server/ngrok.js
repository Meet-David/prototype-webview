const ngrok = require('ngrok');
const fs = require('fs');
const path = require('path');
const os = require('os');

const TOKEN_FILE = path.join(os.homedir(), '.meetdavid_ngrok_token');

async function getStoredToken() {
  try {
    return fs.readFileSync(TOKEN_FILE, 'utf8');
  } catch {
    return null;
  }
}

async function saveToken(token) {
  fs.writeFileSync(TOKEN_FILE, token);
}

async function setupNgrok(port) {
  try {
    // Use environment variable first, then stored token
    let authToken = process.env.NGROK_AUTH_TOKEN || null;
    
    if (!authToken) {
      authToken = await getStoredToken();
      if (!authToken) {
        throw new Error('NGROK_AUTH_TOKEN not found in environment or stored file');
      }
    }

    // Save token for future use
    await saveToken(authToken);

    // Configure ngrok and wait for it to be ready
    await ngrok.authtoken(authToken);
    
    // Kill any existing ngrok processes
    await ngrok.kill();

    // Start ngrok tunnel
    console.log('Starting ngrok at', port);
    const url = await ngrok.connect({
      addr: port,
      proto: 'http'
    });
    
    // Convert to WebSocket URL
    const wsUrl = url.replace('http', 'ws');
    
    console.log('🔌 Ngrok WebSocket URL:', wsUrl);
    return { httpUrl: url, wsUrl };
  } catch (error) {
    // Kill ngrok on error
    await ngrok.kill();
    throw error;
  }
}

// If this file is run directly
if (require.main === module) {
  setupNgrok(3000)
    .then(({ httpUrl, wsUrl }) => {
      console.log('Ngrok is running and ready to use');
      console.log('HTTP URL:', httpUrl);
      console.log('WebSocket URL:', wsUrl);
      // Keep the process alive
      console.log('Ngrok tunnel is active. Press Ctrl+C to stop.');
    })
    .catch(err => {
      console.error('Ngrok Error:', err.message);
      process.exit(1);
    });
}

module.exports = { setupNgrok }; 