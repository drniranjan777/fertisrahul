import { config } from './config/index.js';
import { validateEnv } from './config/validateEnv.js';
import { logger } from './services/logger.service.js';
import { initDatabase } from './services/database.service.js';
import { requeuePending } from './services/videoQueue.service.js';
import app from './app.js';

try {
  validateEnv();
  await initDatabase();
  const queued = await requeuePending();
  if (queued) logger.info(`Converting ${queued} banner video(s) left waiting`);

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
