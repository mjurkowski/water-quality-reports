import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import { config } from './config/app';
import { errorHandler } from './middleware/errorHandler';
import router from './routes';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Serve uploaded files
app.use('/uploads', express.static(config.uploadDir));

// API routes
app.use('/api', router);

// Serve frontend static files (production)
if (config.nodeEnv === 'production') {
  const websitePath = path.join(__dirname, '../../website/dist');
  const adminPath = path.join(__dirname, '../../admin/dist');

  // Serve website on main domain
  app.use(express.static(websitePath));

  // Serve admin on /admin path
  app.use('/admin', express.static(adminPath));

  // SPA fallback for website
  app.get('*', (req, res) => {
    if (req.path.startsWith('/admin')) {
      res.sendFile(path.join(adminPath, 'index.html'));
    } else {
      res.sendFile(path.join(websitePath, 'index.html'));
    }
  });
}

// Error handling (must be last)
app.use(errorHandler);

export default app;
