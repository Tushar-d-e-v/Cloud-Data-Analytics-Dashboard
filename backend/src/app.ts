import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';

// Routes
import authRoutes from './routes/auth.routes';
import datasetRoutes from './routes/dataset.routes';
import analyticsRoutes from './routes/analytics.routes';
import reportRoutes from './routes/report.routes';

// Middleware
import errorMiddleware from './middlewares/error.middleware';

const app: Application = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/datasets', datasetRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportRoutes);

// Error handling middleware (must be last)
app.use(errorMiddleware);

export default app;