import { Op, col, fn, where } from 'sequelize';
import { sequelize } from '../../config/database.js';
import { models } from '../../models/index.js';

const statesInclude = () => ({
  model: models.State,
  as: 'states',
  attributes: ['id', 'name', 'slug', 'sort_order'],
  through: { attributes: [] },
});

export const findAll = () =>
  models.BannerVideo.findAll({
    include: [statesInclude()],
    order: [
      ['sort_order', 'ASC'],
      ['name', 'ASC'],
      ['id', 'ASC'],
    ],
  });

export const findById = (id) => models.BannerVideo.findByPk(id, { include: [statesInclude()] });

export const findByName = (name) =>
  models.BannerVideo.findOne({ where: where(fn('lower', col('name')), name.toLowerCase()) });

export const stateIdsOf = async (id) =>
  (await models.BannerVideoState.findAll({ where: { banner_video_id: id }, attributes: ['state_id'], raw: true })).map(
    (row) => row.state_id
  );

export const countStates = (ids) => models.State.count({ where: { id: ids } });

// [{ state: 'Telangana', video: 'Telugu paddy' }] for the states another video already uses.
export const findStateClashes = async (stateIds, currentId = null) => {
  if (!stateIds.length) return [];
  const rows = await models.BannerVideoState.findAll({
    where: { state_id: stateIds, ...(currentId ? { banner_video_id: { [Op.ne]: currentId } } : {}) },
    raw: true,
  });
  if (!rows.length) return [];
  const [stateRows, videoRows] = await Promise.all([
    models.State.findAll({ where: { id: rows.map((row) => row.state_id) }, attributes: ['id', 'name'], raw: true }),
    models.BannerVideo.findAll({
      where: { id: rows.map((row) => row.banner_video_id) },
      attributes: ['id', 'name'],
      raw: true,
    }),
  ]);
  const nameOf = (list, id) => list.find((row) => row.id == id).name;
  return stateIds
    .map((stateId) => rows.find((row) => row.state_id == stateId))
    .filter(Boolean)
    .map((row) => ({ state: nameOf(stateRows, row.state_id), video: nameOf(videoRows, row.banner_video_id) }));
};

const setStates = async (videoId, stateIds, transaction) => {
  if (stateIds === undefined) return;
  await models.BannerVideoState.destroy({ where: { banner_video_id: videoId }, transaction });
  await models.BannerVideoState.bulkCreate(
    stateIds.map((state_id) => ({ banner_video_id: videoId, state_id })),
    { transaction }
  );
};

// There is only one default, so a new default takes over from the old one.
const takeDefault = (videoId, payload, transaction) =>
  payload.is_default
    ? models.BannerVideo.update(
        { is_default: false },
        { where: { is_default: true, id: { [Op.ne]: videoId } }, transaction }
      )
    : null;

export const create = (payload, stateIds) =>
  sequelize.transaction(async (transaction) => {
    const video = await models.BannerVideo.create(payload, { transaction });
    await takeDefault(video.id, payload, transaction);
    await setStates(video.id, stateIds, transaction);
    return video.id;
  });

export const update = (video, payload, stateIds) =>
  sequelize.transaction(async (transaction) => {
    await video.update(payload, { transaction });
    await takeDefault(video.id, payload, transaction);
    await setStates(video.id, stateIds, transaction);
  });

// Its states go with it through the foreign key.
export const remove = (video) => video.destroy();
