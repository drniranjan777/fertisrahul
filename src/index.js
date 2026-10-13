import { config } from './config/index.js';
import { validateEnv } from './config/validateEnv.js';
import { logger } from './services/logger.service.js';
import { initDatabase } from './services/database.service.js';
import app from './app.js';

try {
  validateEnv();
  await initDatabase();

  app.listen(config.app.port, () => {
    logger.info(`Fertis API running on port ${config.app.port} [${config.app.env}]`);
    logger.info(`Health:    http://localhost:${config.app.port}/health`);
    logger.info(`Admin API: http://localhost:${config.app.port}/api/v1/admin`);
    logger.info(`Frontend:  http://localhost:${config.app.port}/api/v1/frontend`);
  });
} catch (err) {
  logger.error(`Bootstrap failed: ${err.stack || err.message}`);
  process.exit(1);
}
