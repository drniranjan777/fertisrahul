import Joi from 'joi';

const slugList = Joi.string().trim().max(1000).allow('');

export const listPublicProductsSchema = Joi.object({
  category: Joi.string().trim().max(160).allow(''),
  brands: slugList,
  applications: slugList,
  crops: slugList,
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(48).default(12),
});

export const productSlugParamSchema = Joi.object({
  slug: Joi.string().trim().max(160).required(),
});
