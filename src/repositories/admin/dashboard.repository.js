import { MASTERS } from '../../config/masters.js';
import { models } from '../../models/index.js';

const countByStatus = async (modelName) => {
  const rows = await models[modelName].count({ group: ['is_active'] });
  const active = Number(rows.find((row) => row.is_active)?.count ?? 0);
  const inactive = Number(rows.find((row) => !row.is_active)?.count ?? 0);
  return { total: active + inactive, active, inactive };
};

// A crop detail is live on the website while its crop is active.
const countCropDetails = async () => {
  const total = await models.CropDetail.count();
  const active = await models.CropDetail.count({
    include: [{ model: models.Crop, as: 'crop', attributes: [], where: { is_active: true } }],
  });
  return { total, active, inactive: total - active };
};

export const getCounts = async () => {
  const sections = [['products', 'Product'], ...MASTERS.map(({ path, model }) => [path, model])];
  const counts = await Promise.all(sections.map(([, modelName]) => countByStatus(modelName)));
  return {
    ...Object.fromEntries(sections.map(([key], index) => [key, counts[index]])),
    'crop-details': await countCropDetails(),
  };
};
