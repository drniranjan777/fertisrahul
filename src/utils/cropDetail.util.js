import { CROP_STAGES, CROP_STAGE_KEYS } from '../config/cropStages.js';

export const bySortOrder = (a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name);
export const byMethod = (a, b) => bySortOrder(a.method, b.method);
export const byStage = (a, b) =>
  CROP_STAGE_KEYS.indexOf(a.stage) - CROP_STAGE_KEYS.indexOf(b.stage) || a.position - b.position || a.id - b.id;

const cropFields = ({ id, name, slug, is_active }) => ({ id, name, slug, is_active });

export const toAdminCropDetailRow = (detail) => {
  const { id, crop, image, description, types, schedules } = detail.toJSON();
  return {
    id,
    crop: cropFields(crop),
    image,
    description,
    types: [...types].sort(bySortOrder).map((type) => ({ id: type.id, name: type.name })),
    methods: [...schedules].sort(byMethod).map(({ method }) => ({ id: method.id, name: method.name })),
  };
};

const publicCard = ({ crop, image, description, types }) => ({
  name: crop.name,
  slug: crop.slug,
  image,
  description,
  types: [...types].sort(bySortOrder).map(({ name, slug }) => ({ name, slug })),
});

export const toPublicCropCard = (detail) => publicCard(detail.toJSON());

// The label replaces the product name; an inactive product keeps its name but loses its link.
const publicRow = ({ time, label, product, applications, dose, quantity }) => ({
  time,
  product: { name: label || product.name, slug: product.is_active ? product.slug : null },
  applications,
  dose,
  quantity,
});

// Every schedule lists all 6 stages, so the website can show "updated soon" for the empty ones.
export const toPublicCropDetail = (detail) => {
  const data = detail.toJSON();
  return {
    ...publicCard(data),
    stages: CROP_STAGES,
    schedules: data.schedules
      .filter((schedule) => schedule.method.is_active)
      .sort(byMethod)
      .map(({ method, rows }) => {
        const sorted = [...rows].sort(byStage);
        return {
          method: { name: method.name, slug: method.slug },
          stages: CROP_STAGES.map(({ key, name }) => ({
            key,
            name,
            rows: sorted.filter((row) => row.stage == key).map(publicRow),
          })),
        };
      }),
  };
};

export const toAdminCropDetail = (detail) => {
  const { crop, types, schedules, ...fields } = detail.toJSON();
  return {
    ...fields,
    crop: cropFields(crop),
    type_ids: [...types].sort(bySortOrder).map((type) => type.id),
    schedules: [...schedules].sort(byMethod).map(({ application_id, method, rows }) => ({
      application_id,
      method: { id: method.id, name: method.name, is_active: method.is_active },
      rows: [...rows]
        .sort(byStage)
        .map(({ stage, time, product_id, label, applications, dose, quantity }) => ({
          stage,
          time,
          product_id,
          label,
          applications,
          dose,
          quantity,
        })),
    })),
  };
};
