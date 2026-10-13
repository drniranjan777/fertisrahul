import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ quiet: true });

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const toInt = (value, fallback) => parseInt(value, 10) || fallback;

export const config = {
  app: {
    port: toInt(process.env.APP_PORT, 5200),
    env: process.env.NODE_ENV || 'development',
    seedOnStartup: process.env.SEED_ON_STARTUP == 'true',
    corsOrigin: process.env.CORS_ORIGIN || '*',
    trustProxy: process.env.TRUST_PROXY == 'true',
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRE_IN || '7d',
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: toInt(process.env.DB_PORT, 5432),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME,
    testName: process.env.DB_NAME_TEST,
  },
  seedAdmin: {
    name: process.env.ADMIN_NAME || 'Fertis Admin',
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  },
  loginRateLimit: {
    windowMinutes: toInt(process.env.LOGIN_RATE_LIMIT_WINDOW_MINUTES, 15),
    max: toInt(process.env.LOGIN_RATE_LIMIT_MAX, 10),
  },
  uploads: {
    dir: process.env.UPLOAD_DIR || path.join(backendRoot, 'uploads'),
  },
};
