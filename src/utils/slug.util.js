import slugify from 'slugify';

export const makeSlug = (value) => slugify(String(value ?? ''), { lower: true, strict: true, trim: true });
