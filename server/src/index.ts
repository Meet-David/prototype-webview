import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { WebSocketManager } from './utils/WebSocketManager';
import { createGroupRouter } from './routes/groupRoutes';
import path from 'path';
import ngrok from 'ngrok';
import inquirer from 'inquirer';

interface ServerConfig {
  port: number;
}

async function getServerConfig(): Promise<ServerConfig> {
  // If running in production (ngrok) mode, use default port
  if (process.env.NODE_ENV === 'production') {
    return { port: 3000 };
  }

  // Interactive CLI mode for development
  const answers = await inquirer.prompt([
    {
      type: 'number',
      name: 'port',
      message: 'Which port would you like to use?',
      default: 3000,
    }
  ]);

  return answers;
}

async function startServer() {
  const config = await getServerConfig();
  const isProduction = process.env.NODE_ENV === 'production';

  const app = express();
  const server = createServer(app);

  // Initialize WebSocket Manager
  const wsManager = new WebSocketManager(server);

  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Only serve static files in production
  if (isProduction) {
    console.log('📦 Running in production mode - serving static files');
    app.use(express.static(path.join(__dirname, 'public')));
  }

  // Routes
  app.get('/health', (req: express.Request, res: express.Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Group management routes
  app.use('/api/groups', createGroupRouter(wsManager));

  // Serve index.html for all other routes in production (SPA support)
  if (isProduction) {
    app.get('*', (req: express.Request, res: express.Response) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
  }

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  // Start server and ngrok
  server.listen(config.port, async () => {
    console.log(`🚀 Server running on port ${config.port}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    if (isProduction) {
      try {
        console.log('🔄 Starting ngrok tunnel...');
        
        // Configure ngrok with auth token
        if (!process.env.NGROK_AUTH_TOKEN) {
          throw new Error('NGROK_AUTH_TOKEN environment variable is required');
        }
        
        await ngrok.authtoken(process.env.NGROK_AUTH_TOKEN);
        
        // Start ngrok tunnel
        const url = await ngrok.connect({
          addr: config.port,
          proto: 'http'
        });
        
        console.log(`🌍 Public URL: ${url}`);

        // Handle cleanup
        process.on('SIGTERM', async () => {
          await ngrok.disconnect();
          await ngrok.kill();
        });

      } catch (err) {
        console.error('⚠️ Ngrok error:', err);
        console.log('💡 Make sure to:');
        console.log('1. Install ngrok globally: npm install -g ngrok');
        console.log('2. Provide a valid NGROK_AUTH_TOKEN environment variable');
        process.exit(1);
      }
    } else {
      console.log('🔧 Running in development mode - use frontend dev server for UI');
    }
  });
}

startServer().catch(console.error); 