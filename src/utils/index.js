export { successResponse, errorResponse } from './response.util.js';
export { makeSlug } from './slug.util.js';
export { getPagination, toPaged, escapeLike, toSlugs } from './query.util.js';

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER: 500,
};

export const ADMIN_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};
