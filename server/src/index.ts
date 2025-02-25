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

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

async function startServer() {
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

  // Start server
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    if (!isProduction) {
      console.log('🔧 Running in development mode - use frontend dev server for UI');
    }
  });
}

startServer().catch(console.error); 