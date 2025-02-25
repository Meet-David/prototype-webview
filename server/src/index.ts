import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { WebSocketManager } from './utils/WebSocketManager';
import { createGroupRouter } from './routes/groupRoutes';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const port = process.env.PORT || 3000;

// Initialize WebSocket Manager
const wsManager = new WebSocketManager(server);

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('dev')); // Request logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.get('/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Group management routes
app.use('/api/groups', createGroupRouter(wsManager));

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
}); 