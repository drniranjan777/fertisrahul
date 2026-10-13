import { rateLimit } from 'express-rate-limit';
import { config } from '../config/index.js';

export const loginRateLimit = rateLimit({
  windowMs: config.loginRateLimit.windowMinutes * 60 * 1000,
  limit: config.loginRateLimit.max,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again later.', error: null },
});
