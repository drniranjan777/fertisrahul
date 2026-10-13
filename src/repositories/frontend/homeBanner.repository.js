import { Op } from 'sequelize';
import { models } from '../../models/index.js';

const SHOWN = ['duration', 'poster', 'sources'];
const playable = { is_active: true, sources: { [Op.ne]: null } };

export const findBanner = () => models.HomeBanner.findOne({ order: [['id', 'ASC']] });

// The state's own video, when the state is active and its video can be played.
export const findStateVideo = async (slug) => {
  const state = await models.State.findOne({ where: { slug, is_active: true }, attributes: ['id'] });
  if (!state) return null;
  const link = await models.BannerVideoState.findOne({ where: { state_id: state.id }, attributes: ['banner_video_id'] });
  if (!link) return null;
  return models.BannerVideo.findOne({ where: { id: link.banner_video_id, ...playable }, attributes: SHOWN });
};

export const findDefaultVideo = () =>
  models.BannerVideo.findOne({ where: { is_default: true, ...playable }, attributes: SHOWN });
