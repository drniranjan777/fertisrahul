import Joi from 'joi';

export const adminLoginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email({ tlds: { allow: false } }).max(160).required(),
  password: Joi.string().min(6).max(128).required(),
});
