import Joi from 'joi';

const name = Joi.string().trim().min(2).max(120);
const slug = Joi.string().trim().max(140).allow('', null);
const sortOrder = Joi.number().integer().min(0).max(100000);

export const masterIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export const listMastersSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().trim().max(120).allow(''),
  is_active: Joi.boolean(),
});

export const createMasterSchema = Joi.object({
  name: name.required(),
  slug,
  sort_order: sortOrder.default(0),
  is_active: Joi.boolean().default(true),
});

export const updateMasterSchema = Joi.object({
  name,
  slug,
  sort_order: sortOrder,
  is_active: Joi.boolean(),
}).min(1);
