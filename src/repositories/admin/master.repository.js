import { Op, col, fn, where } from 'sequelize';
import { models } from '../../models/index.js';
import { escapeLike, getPagination, toPaged } from '../../utils/index.js';

// Models are looked up per call because they are only registered once initModels runs.
export const createMasterRepository = ({ model: modelName, usedBy = [] }) => {
  const model = () => models[modelName];

  return {
    findAll: async ({ page, limit, search, is_active }) => {
      const filters = {};
      if (search) {
        const term = `%${escapeLike(search)}%`;
        filters[Op.or] = [{ name: { [Op.iLike]: term } }, { slug: { [Op.iLike]: term } }];
      }
      if (is_active !== undefined) filters.is_active = is_active;

      const paging = getPagination({ page, limit });
      const result = await model().findAndCountAll({
        where: filters,
        order: [
          ['sort_order', 'ASC'],
          ['name', 'ASC'],
          ['id', 'ASC'],
        ],
        limit: paging.limit,
        offset: paging.offset,
      });
      return toPaged(result, paging);
    },

    findById: (id) => model().findByPk(id),

    findBySlug: (slug) => model().findOne({ where: { slug } }),

    findByName: (name) =>
      model().findOne({ where: where(fn('lower', col('name')), name.toLowerCase()) }),

    create: (payload) => model().create(payload),

    update: (record, payload) => record.update(payload),

    remove: (record) => record.destroy(),

    // How many distinct products, crop details, ... use the row, in usedBy order: [{ noun, count }].
    countUsers: async (id) => {
      const owners = new Map();
      for (const { model: usingModel, field, owner, noun } of usedBy) {
        const rows = await models[usingModel].findAll({ where: { [field]: id }, attributes: [owner], raw: true });
        if (!owners.has(noun)) owners.set(noun, new Set());
        rows.forEach((row) => owners.get(noun).add(row[owner]));
      }
      return [...owners].map(([noun, ids]) => ({ noun, count: ids.size })).filter(({ count }) => count);
    },
  };
};
