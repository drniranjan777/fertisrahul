import Joi from 'joi';

export const homeBannerQuerySchema = Joi.object({
  state: Joi.string().trim().lowercase().max(140).allow(''),
});
