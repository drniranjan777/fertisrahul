import { models } from '../../models/index.js';

export const findActive = (modelName) =>
  models[modelName].findAll({
    where: { is_active: true },
    attributes: ['id', 'name', 'slug'],
    order: [
      ['sort_order', 'ASC'],
      ['name', 'ASC'],
      ['id', 'ASC'],
    ],
  });
