import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { ApiResponse } from './utils/ApiResponse.js';

import authRoutes from './routes/authRoutes.js';
import linkRoutes from './routes/linkRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import bioRoutes from './routes/bioRoutes.js';
import { handleRedirect } from './controllers/redirectController.js';
import { redirectRateLimiter } from './middlewares/rateLimiters.js';

const app: Application = express();

// Global Middlewares
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Public Short Link Redirect Endpoint
app.get('/r/:shortCode', redirectRateLimiter, handleRedirect);

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/links', linkRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/bio', bioRoutes);

// Health Check Endpoint
app.get('/api/v1/health', (_req, res) => {
  res.status(200).json(
    new ApiResponse(200, {
      status: 'UP',
      appName: 'Linkora Engine',
      timestamp: new Date().toISOString(),
    }, 'Linkora API is running smoothly')
  );
});

// Centralized Error Handling
app.use(errorHandler);

export default app;
