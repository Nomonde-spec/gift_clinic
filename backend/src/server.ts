import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from './config';
import apiRouter from './routes';
import { notFoundHandler, errorHandler } from './middleware/error.middleware';

const app = express();

// Security & CORS Configuration
const allowedOrigins = [
  config.frontendUrl,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Dev flexible CORS fallback
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint (Render requirement)
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Clinic Queue API is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// Root API Routes
app.use('/api', apiRouter);

// Centralized 404 and Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server if not running inside test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`[Clinic Server] Running on port ${config.port} in ${config.nodeEnv} mode`);
    console.log(`[Clinic Server] Health check available at: http://localhost:${config.port}/api/health`);
  });
}

export default app;
