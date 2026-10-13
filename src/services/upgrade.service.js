import { paragraphsToHtml } from '../utils/richText.util.js';
import { logger } from './logger.service.js';

// Runs before sync: alter cannot turn the old JSONB paragraph list into HTML.
export const upgradeProductBody = async (sequelize) => {
  const [[column]] = await sequelize.query(
    "SELECT data_type FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'products' AND column_name = 'body'"
  );
  if (column?.data_type != 'jsonb') return false;

  await sequelize.transaction(async (transaction) => {
    const [rows] = await sequelize.query('SELECT id, body FROM products', { transaction });
    await sequelize.query("ALTER TABLE products ADD COLUMN body_html TEXT NOT NULL DEFAULT ''", { transaction });
    for (const row of rows) {
      await sequelize.query('UPDATE products SET body_html = :html WHERE id = :id', {
        replacements: { html: paragraphsToHtml(row.body), id: row.id },
        transaction,
      });
    }
    await sequelize.query('ALTER TABLE products DROP COLUMN body', { transaction });
    await sequelize.query('ALTER TABLE products RENAME COLUMN body_html TO body', { transaction });
  });

  logger.info('Converted product paragraphs to HTML.');
  return true;
};
