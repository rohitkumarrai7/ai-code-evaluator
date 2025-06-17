// backend/src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import evaluationRoutes from './routes/evaluation.js'; // Corrected import path and added .js
import { PrismaClient } from '@prisma/client'; // Import PrismaClient for connection check

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001; // Default to 3001 if PORT not set in .env
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Initialize Prisma Client for database connection checking
const prisma = new PrismaClient();

// --- Middleware Setup ---
// Enable CORS for specified origin
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true // Allow cookies/authorization headers to be sent
}));

// Parse JSON request bodies with a limit
app.use(express.json({ limit: '10mb' }));
// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- API Routes ---
// All routes from evaluationRoutes will be prefixed with /api
app.use('/api', evaluationRoutes);

// --- Health check endpoint ---
app.get('/health', async (req, res) => {
  try {
    // Attempt a lightweight database query to check connectivity
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'OK',
      database: 'Connected',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (dbError) {
    console.error('Health check: Database connection failed:', dbError);
    res.status(500).json({
      status: 'ERROR',
      database: 'Disconnected',
      error: 'Database connection failed',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  }
});

// --- Error handling middleware ---
// This must be the last middleware added before the 404 handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled backend error:', err); // Log the full error for debugging

  // If headers have already been sent, delegate to Express's default error handler
  if (res.headersSent) {
    return next(err);
  }

  // Send a generic 500 internal server error response
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error.',
    // In development, you might send the stack trace for easier debugging
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// --- 404 Not Found handler ---
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found. Please check the URL and HTTP method.'
  });
});

// --- Start server ---
const startServer = async () => {
  try {
    // Connect to the database before starting the server
    await prisma.$connect();
    console.log('✅ Database connected successfully!');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Fatal error: Could not connect to database or start server.', error);
    process.exit(1); // Exit the process if we can't connect to DB or start server
  }
};

startServer(); // Call the async function to start the server

// --- Graceful Shutdown ---
// Disconnect Prisma client when the application is shutting down
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});