import Joi from 'joi';
import { CROP_STAGE_KEYS } from '../../config/cropStages.js';

const id = Joi.number().integer().positive();
const text = (max) => Joi.string().trim().max(max);
const optionalText = (max) => text(max).allow('', null);

const row = Joi.object({
  stage: Joi.string()
    .valid(...CROP_STAGE_KEYS)
    .required(),
  time: text(100).required(),
  product_id: id.required(),
  label: optionalText(150),
  applications: optionalText(20),
  dose: optionalText(100),
  quantity: text(100).required(),
});

const schedule = Joi.object({
  application_id: id.required(),
  rows: Joi.array().items(row).max(100).default([]),
});

const fields = {
  crop_id: id,
  description: text(300).min(2),
  type_ids: Joi.array().items(id).unique().max(20),
  schedules: Joi.array().items(schedule).unique('application_id').max(20),
};

export const cropDetailIdParamSchema = Joi.object({
  id: id.required(),
});

export const listCropDetailsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().trim().max(120).allow(''),
  crop_type_id: id,
});

export const createCropDetailSchema = Joi.object({
  ...fields,
  crop_id: fields.crop_id.required(),
  description: fields.description.required(),
  type_ids: fields.type_ids.default([]),
  schedules: fields.schedules.default([]),
});

// No .min(1): an update may only replace the photo.
export const updateCropDetailSchema = Joi.object(fields);
