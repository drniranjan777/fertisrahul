import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import apiRouter from './routes/index.js';
import { config } from './config/index.js';
import { logger } from './services/logger.service.js';
import { errorResponse, HTTP_STATUS } from './utils/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const adminBuildPath = path.join(__dirname, '../admin');
const adminIndexHtml = path.join(adminBuildPath, 'index.html');

const app = express();

if (config.app.trustProxy) app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  })
);
app.use(compression());
app.use(
  cors({
    origin: config.app.corsOrigin == '*' ? '*' : config.app.corsOrigin.split(',').map((o) => o.trim()),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

if (config.app.env != 'test') {
  app.use(morgan('combined', { stream: { write: (msg) => logger.http(msg.trim()) } }));
}

app.get('/health', (req, res) =>
  res.json({ success: true, message: 'Fertis API is running', timestamp: new Date() })
);

app.use('/uploads', express.static(config.uploads.dir));
app.use('/api/v1', apiRouter);

// Admin SPA (Vite build output in backend/admin)
if (fs.existsSync(adminIndexHtml)) {
  app.use(express.static(adminBuildPath));
  app.use((req, res, next) => {
    if (req.method != 'GET' || req.path.startsWith('/api') || path.extname(req.path)) return next();
    res.sendFile(adminIndexHtml);
  });
}

app.use((req, res) => errorResponse(res, `Route ${req.originalUrl} not found`, null, HTTP_STATUS.NOT_FOUND));

app.use((err, req, res, next) => {
  if (err.name == 'MulterError') return errorResponse(res, err.message, null, HTTP_STATUS.BAD_REQUEST);
  // 23001 is Postgres's ON DELETE RESTRICT violation, which Sequelize reports as a plain DatabaseError.
  if (err.name == 'SequelizeForeignKeyConstraintError' || err.parent?.code == '23001') {
    return errorResponse(res, 'This record is in use and cannot be deleted', null, HTTP_STATUS.CONFLICT);
  }
  if (err.name == 'SequelizeUniqueConstraintError') {
    return errorResponse(res, 'A record with this value already exists', null, HTTP_STATUS.CONFLICT);
  }

  logger.error(err.stack || err.message);
  const statusCode = err.statusCode || err.status || HTTP_STATUS.INTERNAL_SERVER;
  const message = statusCode < HTTP_STATUS.INTERNAL_SERVER ? err.message : 'Internal server error';
  return errorResponse(res, message, config.app.env == 'development' ? err.stack : null, statusCode);
});

export default app;
