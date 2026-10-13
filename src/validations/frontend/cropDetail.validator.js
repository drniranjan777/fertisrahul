import Joi from 'joi';

export const listPublicCropDetailsSchema = Joi.object({
  type: Joi.string().trim().max(140).allow(''),
  crops: Joi.string().trim().max(1000).allow(''),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(48).default(9),
});

export const cropSlugParamSchema = Joi.object({
  slug: Joi.string().trim().max(140).required(),
});
