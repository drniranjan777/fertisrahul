import { models } from '../../models/index.js';

// There is only ever one banner row.
export const find = () => models.HomeBanner.findOne({ order: [['id', 'ASC']] });

export const save = async (payload) => {
  const banner = await find();
  return banner ? banner.update(payload) : models.HomeBanner.create(payload);
};
