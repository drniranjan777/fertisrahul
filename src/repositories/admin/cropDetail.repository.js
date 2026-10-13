import { Op } from 'sequelize';
import { sequelize } from '../../config/database.js';
import { models } from '../../models/index.js';
import { escapeLike, getPagination, toPaged } from '../../utils/index.js';

// Crop details follow the order of their crop in the Crop master.
const CROP_ORDER = [
  ['crop', 'sort_order', 'ASC'],
  ['crop', 'name', 'ASC'],
  ['id', 'ASC'],
];

const cropInclude = () => ({ model: models.Crop, as: 'crop', attributes: ['id', 'name', 'slug', 'is_active'] });
const typesInclude = () => ({
  model: models.CropType,
  as: 'types',
  attributes: ['id', 'name', 'sort_order'],
  through: { attributes: [] },
});
const methodInclude = () => ({ model: models.Application, as: 'method', attributes: ['id', 'name', 'sort_order', 'is_active'] });

const findListRows = async (ids) => {
  const details = await models.CropDetail.findAll({
    where: { id: ids },
    include: [
      cropInclude(),
      typesInclude(),
      { model: models.CropSchedule, as: 'schedules', attributes: ['id'], include: [methodInclude()] },
    ],
  });
  return ids.map((id) => details.find((detail) => detail.id == id));
};

export const findAll = async ({ page, limit, search, crop_type_id }) => {
  const where = {};
  if (crop_type_id) {
    const links = await models.CropDetailType.findAll({ where: { crop_type_id }, attributes: ['crop_detail_id'], raw: true });
    where.id = { [Op.in]: links.map((link) => link.crop_detail_id) };
  }
  const cropWhere = {};
  if (search) {
    const term = `%${escapeLike(search)}%`;
    cropWhere[Op.or] = [{ name: { [Op.iLike]: term } }, { slug: { [Op.iLike]: term } }];
  }

  // Page the ids first, so the type and schedule joins don't skew the count or the paging.
  const paging = getPagination({ page, limit });
  const { count, rows } = await models.CropDetail.findAndCountAll({
    where,
    attributes: ['id'],
    include: [{ model: models.Crop, as: 'crop', attributes: [], where: cropWhere }],
    order: CROP_ORDER,
    limit: paging.limit,
    offset: paging.offset,
    raw: true,
  });
  return toPaged({ count, rows: await findListRows(rows.map((row) => row.id)) }, paging);
};

export const findById = (id) =>
  models.CropDetail.findByPk(id, {
    include: [
      cropInclude(),
      typesInclude(),
      {
        model: models.CropSchedule,
        as: 'schedules',
        include: [methodInclude(), { model: models.CropScheduleRow, as: 'rows' }],
      },
    ],
  });

export const findByCropId = (crop_id) => models.CropDetail.findOne({ where: { crop_id } });

export const allExist = async (modelName, ids) => (await models[modelName].count({ where: { id: ids } })) == ids.length;

// A missing list leaves it unchanged; a list (even empty) replaces it.
const setLists = async (cropDetailId, { type_ids, schedules }, transaction) => {
  if (type_ids !== undefined) {
    await models.CropDetailType.destroy({ where: { crop_detail_id: cropDetailId }, transaction });
    await models.CropDetailType.bulkCreate(
      type_ids.map((crop_type_id) => ({ crop_detail_id: cropDetailId, crop_type_id })),
      { transaction }
    );
  }
  if (schedules === undefined) return;

  // Deleting a schedule deletes its rows through the foreign key.
  await models.CropSchedule.destroy({ where: { crop_detail_id: cropDetailId }, transaction });
  for (const { application_id, rows } of schedules) {
    const schedule = await models.CropSchedule.create({ crop_detail_id: cropDetailId, application_id }, { transaction });
    const positions = {};
    await models.CropScheduleRow.bulkCreate(
      rows.map((row) => {
        positions[row.stage] = (positions[row.stage] ?? -1) + 1;
        return { ...row, crop_schedule_id: schedule.id, position: positions[row.stage] };
      }),
      { transaction }
    );
  }
};

export const create = (payload, lists) =>
  sequelize.transaction(async (transaction) => {
    const detail = await models.CropDetail.create(payload, { transaction });
    await setLists(detail.id, lists, transaction);
    return detail.id;
  });

export const update = (detail, payload, lists) =>
  sequelize.transaction(async (transaction) => {
    await detail.update(payload, { transaction });
    await setLists(detail.id, lists, transaction);
  });

// Types, schedules and rows go with it through their foreign keys.
export const remove = (detail) => detail.destroy();
