import { sequelize } from '../config/database.js';
import { config } from '../config/index.js';
import { initModels } from '../models/index.js';
import { runSeeders } from '../seeders/index.js';
import { logger } from './logger.service.js';
import { upgradeProductBody } from './upgrade.service.js';

export const initDatabase = async () => {
  await sequelize.authenticate();
  logger.info('Database connection established.');

  initModels(sequelize);
  await upgradeProductBody(sequelize);

  // alter only in development; elsewhere sync only creates missing tables
  await sequelize.sync({ alter: config.app.env == 'development' });
  logger.info('Database synced.');

  if (config.app.seedOnStartup) {
    await runSeeders();
  }
};
