import Joi from 'joi';

const optional = (max) => Joi.string().trim().max(max).allow('', null);

const link = (label) =>
  Joi.string()
    .trim()
    .max(255)
    .pattern(/^(\/[^\s]*|https?:\/\/[^\s/]+[^\s]*)$/i)
    .label(label)
    .messages({ 'string.pattern.base': `${label} must be a site path like /solutions or a full http(s):// link` });

// A full save of the banner text; optional fields left out or empty are cleared.
export const homeBannerSchema = Joi.object({
  title_line1: Joi.string().trim().max(60).required().label('Line 1'),
  title_line2: optional(60).label('Line 2'),
  title_line3: optional(60).label('Line 3'),
  highlight: optional(60).label('Highlight'),
  primary_label: Joi.string().trim().max(40).required().label('Primary label'),
  primary_link: link('Primary link').required(),
  secondary_label: optional(40).label('Second button label'),
  secondary_link: link('Second button link').allow('', null),
});
