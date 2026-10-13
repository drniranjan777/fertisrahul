import Joi from 'joi';

const id = Joi.number().integer().positive();
const ids = Joi.array().items(id).unique().max(50);
const text = (max) => Joi.string().trim().max(max);

const fields = {
  name: text(150).min(2),
  slug: text(160).allow('', null),
  tagline: text(200).min(2),
  description: text(1000).min(2),
  category_id: id,
  brand_id: id,
  application_ids: ids,
  crop_ids: ids,
  recommended_crop_ids: ids,
  headline: text(200).allow('', null),
  // HTML from the admin editor; the controller cleans it.
  body: Joi.string().max(20000).allow('', null),
  benefits: Joi.array().items(text(300)).max(20),
  application: Joi.array()
    .items(Joi.object({ stage: text(100).allow('', null), recommendation: text(500).required() }))
    .max(20),
  sort_order: Joi.number().integer().min(0).max(100000),
  is_active: Joi.boolean(),
};

export const productIdParamSchema = Joi.object({
  id: id.required(),
});

export const listProductsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().trim().max(150).allow(''),
  category_id: id,
  brand_id: id,
  is_active: Joi.boolean(),
});

export const createProductSchema = Joi.object({
  ...fields,
  name: fields.name.required(),
  tagline: fields.tagline.required(),
  description: fields.description.required(),
  category_id: fields.category_id.required(),
  brand_id: fields.brand_id.required(),
  application_ids: fields.application_ids.default([]),
  crop_ids: fields.crop_ids.default([]),
  recommended_crop_ids: fields.recommended_crop_ids.default([]),
  body: fields.body.default(''),
  benefits: fields.benefits.default([]),
  application: fields.application.default([]),
  sort_order: fields.sort_order.default(0),
  is_active: fields.is_active.default(true),
});

// No .min(1): an update may only replace a file.
export const updateProductSchema = Joi.object({
  ...fields,
  remove_pdf: Joi.boolean(),
});
