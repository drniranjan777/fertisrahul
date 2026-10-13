import { models } from '../../models/index.js';
import { getPagination, toPaged, toSlugs } from '../../utils/index.js';

const CROP_ORDER = [
  ['crop', 'sort_order', 'ASC'],
  ['crop', 'name', 'ASC'],
  ['id', 'ASC'],
];

const CARD = ['id', 'image', 'description'];

const activeTypes = () => ({
  model: models.CropType,
  as: 'types',
  attributes: ['name', 'slug', 'sort_order'],
  where: { is_active: true },
  required: false,
  through: { attributes: [] },
});

// The gallery shows active crops with at least one active type; `type` narrows it to one tab.
const galleryIds = async (type) => {
  const types = await models.CropType.findAll({
    where: { is_active: true, ...(type && { slug: type }) },
    attributes: ['id'],
    raw: true,
  });
  const links = await models.CropDetailType.findAll({
    where: { crop_type_id: types.map((row) => row.id) },
    attributes: ['crop_detail_id'],
    raw: true,
  });
  return [...new Set(links.map((link) => link.crop_detail_id))];
};

export const findGallery = async ({ type, crops, page, limit }) => {
  const cropWhere = { is_active: true };
  const cropSlugs = toSlugs(crops);
  if (cropSlugs.length) cropWhere.slug = cropSlugs;

  // Page the ids first, so the type joins don't skew the count or the paging.
  const paging = getPagination({ page, limit });
  const { count, rows } = await models.CropDetail.findAndCountAll({
    where: { id: await galleryIds(type) },
    attributes: ['id'],
    include: [{ model: models.Crop, as: 'crop', attributes: [], where: cropWhere }],
    order: CROP_ORDER,
    limit: paging.limit,
    offset: paging.offset,
    raw: true,
  });

  const ids = rows.map((row) => row.id);
  const details = await models.CropDetail.findAll({
    where: { id: ids },
    attributes: CARD,
    include: [{ model: models.Crop, as: 'crop', attributes: ['name', 'slug'] }, activeTypes()],
  });
  return toPaged({ count, rows: ids.map((id) => details.find((detail) => detail.id == id)) }, paging);
};

export const findByCropSlug = (slug) =>
  models.CropDetail.findOne({
    attributes: CARD,
    include: [
      { model: models.Crop, as: 'crop', attributes: ['name', 'slug'], where: { slug, is_active: true } },
      activeTypes(),
      {
        model: models.CropSchedule,
        as: 'schedules',
        attributes: ['id'],
        include: [
          { model: models.Application, as: 'method', attributes: ['name', 'slug', 'sort_order', 'is_active'] },
          {
            model: models.CropScheduleRow,
            as: 'rows',
            include: [{ model: models.Product, as: 'product', attributes: ['name', 'slug', 'is_active'] }],
          },
        ],
      },
    ],
  });
