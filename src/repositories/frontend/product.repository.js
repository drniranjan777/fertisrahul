import { Op } from 'sequelize';
import { models } from '../../models/index.js';
import { getPagination, toPaged, toSlugs } from '../../utils/index.js';

const CARD = ['id', 'name', 'slug', 'tagline', 'image'];
const ORDER = [
  ['sort_order', 'ASC'],
  ['name', 'ASC'],
  ['id', 'ASC'],
];

const masterIncludes = () => [
  { model: models.Category, as: 'category', attributes: ['name', 'slug'] },
  { model: models.Brand, as: 'brand', attributes: ['name', 'slug'] },
];

const idsBySlug = async (modelName, slugs) =>
  (await models[modelName].findAll({ where: { slug: slugs }, attributes: ['id'], raw: true })).map((row) => row.id);

const productIdsLinkedTo = async (linkModel, field, ids) =>
  (await models[linkModel].findAll({ where: { [field]: ids }, attributes: ['product_id'], raw: true })).map(
    (row) => row.product_id
  );

// Ticked values in one group match any of them; groups combine with AND, like the website filters.
export const findActive = async ({ category, brands, applications, crops, page, limit }) => {
  const where = { is_active: true };
  if (category) where.category_id = { [Op.in]: await idsBySlug('Category', [category]) };

  const brandSlugs = toSlugs(brands);
  if (brandSlugs.length) where.brand_id = { [Op.in]: await idsBySlug('Brand', brandSlugs) };

  const linked = [];
  const applicationSlugs = toSlugs(applications);
  if (applicationSlugs.length) {
    const ids = await idsBySlug('Application', applicationSlugs);
    linked.push(await productIdsLinkedTo('ProductApplication', 'application_id', ids));
  }
  const cropSlugs = toSlugs(crops);
  if (cropSlugs.length) {
    const ids = await idsBySlug('Crop', cropSlugs);
    linked.push(await productIdsLinkedTo('ProductCrop', 'crop_id', ids));
  }
  if (linked.length) where.id = { [Op.in]: linked.reduce((acc, ids) => acc.filter((id) => ids.includes(id))) };

  const paging = getPagination({ page, limit });
  const result = await models.Product.findAndCountAll({
    where,
    attributes: CARD,
    include: masterIncludes(),
    order: ORDER,
    limit: paging.limit,
    offset: paging.offset,
  });
  return toPaged(result, paging);
};

const activeLink = (model, as, throughAttributes = []) => ({
  model,
  as,
  attributes: ['name', 'slug', 'sort_order'],
  where: { is_active: true },
  required: false,
  through: { attributes: throughAttributes },
});

export const findActiveBySlug = (slug) =>
  models.Product.findOne({
    where: { slug, is_active: true },
    include: [
      ...masterIncludes(),
      activeLink(models.Application, 'applications'),
      activeLink(models.Crop, 'crops'),
      activeLink(models.Crop, 'recommended_crops', ['position']),
    ],
  });

export const findOthers = (productId, limit = 4) =>
  models.Product.findAll({
    where: { is_active: true, id: { [Op.ne]: productId } },
    attributes: CARD,
    order: ORDER,
    limit,
  });
