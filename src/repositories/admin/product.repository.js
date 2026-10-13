import { Op, col, fn, where } from 'sequelize';
import { sequelize } from '../../config/database.js';
import { models } from '../../models/index.js';
import { escapeLike, getPagination, toPaged } from '../../utils/index.js';

const ORDER = [
  ['sort_order', 'ASC'],
  ['name', 'ASC'],
  ['id', 'ASC'],
];

const masterIncludes = () => [
  { model: models.Category, as: 'category', attributes: ['id', 'name'] },
  { model: models.Brand, as: 'brand', attributes: ['id', 'name'] },
];

export const findAll = async ({ page, limit, search, category_id, brand_id, is_active }) => {
  const filters = {};
  if (search) {
    const term = `%${escapeLike(search)}%`;
    filters[Op.or] = [{ name: { [Op.iLike]: term } }, { slug: { [Op.iLike]: term } }];
  }
  if (category_id) filters.category_id = category_id;
  if (brand_id) filters.brand_id = brand_id;
  if (is_active !== undefined) filters.is_active = is_active;

  const paging = getPagination({ page, limit });
  const result = await models.Product.findAndCountAll({
    where: filters,
    attributes: ['id', 'name', 'slug', 'tagline', 'image', 'sort_order', 'is_active'],
    include: masterIncludes(),
    order: ORDER,
    limit: paging.limit,
    offset: paging.offset,
  });
  return toPaged(result, paging);
};

export const findById = (id) =>
  models.Product.findByPk(id, {
    include: [
      ...masterIncludes(),
      { model: models.Application, as: 'applications', attributes: ['id'], through: { attributes: [] } },
      { model: models.Crop, as: 'crops', attributes: ['id'], through: { attributes: [] } },
      { model: models.Crop, as: 'recommended_crops', attributes: ['id'], through: { attributes: ['position'] } },
    ],
  });

export const findBySlug = (slug) => models.Product.findOne({ where: { slug } });

export const findByName = (name) =>
  models.Product.findOne({ where: where(fn('lower', col('name')), name.toLowerCase()) });

export const allExist = async (modelName, ids) => (await models[modelName].count({ where: { id: ids } })) == ids.length;

// A missing list leaves that link unchanged; a list (even empty) replaces it.
const setLinks = async (productId, { application_ids, crop_ids, recommended_crop_ids }, transaction) => {
  const replace = async (Model, key, ids, withPosition = false) => {
    if (ids === undefined) return;
    await Model.destroy({ where: { product_id: productId }, transaction });
    await Model.bulkCreate(
      ids.map((id, index) => ({ product_id: productId, [key]: id, ...(withPosition && { position: index }) })),
      { transaction }
    );
  };

  await replace(models.ProductApplication, 'application_id', application_ids);
  await replace(models.ProductCrop, 'crop_id', crop_ids);
  await replace(models.ProductRecommendedCrop, 'crop_id', recommended_crop_ids, true);
};

export const create = (payload, links) =>
  sequelize.transaction(async (transaction) => {
    const product = await models.Product.create(payload, { transaction });
    await setLinks(product.id, links, transaction);
    return product.id;
  });

export const update = (product, payload, links) =>
  sequelize.transaction(async (transaction) => {
    await product.update(payload, { transaction });
    await setLinks(product.id, links, transaction);
  });

export const countCropDetailsUsing = async (productId) => {
  const rows = await models.CropScheduleRow.findAll({
    where: { product_id: productId },
    attributes: [],
    include: [{ model: models.CropSchedule, attributes: ['crop_detail_id'] }],
    raw: true,
  });
  return new Set(rows.map((row) => row['CropSchedule.crop_detail_id'])).size;
};

export const remove = (product) => product.destroy();
