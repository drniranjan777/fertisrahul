import { sequelize } from '../config/database.js';
import { initModels } from '../models/index.js';
import { logger } from '../services/logger.service.js';
import { runSeeders } from './index.js';

try {
  await sequelize.authenticate();
  initModels(sequelize);
  await sequelize.sync();
  await runSeeders();
  await sequelize.close();
  // The winston file transport keeps the process alive otherwise.
  process.exit(0);
} catch (err) {
  logger.error(err.stack || err.message);
  process.exit(1);
}
