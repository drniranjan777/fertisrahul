import Joi from 'joi';

const id = Joi.number().integer().positive();

const fields = {
  name: Joi.string().trim().min(2).max(100),
  is_default: Joi.boolean(),
  is_active: Joi.boolean(),
  sort_order: Joi.number().integer().min(0),
  state_ids: Joi.array().items(id).unique().max(50),
};

export const bannerVideoIdParamSchema = Joi.object({
  id: id.required(),
});

export const createBannerVideoSchema = Joi.object({
  ...fields,
  name: fields.name.required(),
  is_default: fields.is_default.default(false),
  is_active: fields.is_active.default(true),
  sort_order: fields.sort_order.default(0),
  state_ids: fields.state_ids.default([]),
});

// No .min(1): an update may only replace the video or poster.
export const updateBannerVideoSchema = Joi.object(fields);
