import { errorResponse, HTTP_STATUS } from '../utils/index.js';

// Multipart saves carry the JSON fields in one "data" part next to the files.
export const parseDataField = (req, res, next) => {
  if (!req.is('multipart/form-data')) return next();
  try {
    req.body = req.body?.data ? JSON.parse(req.body.data) : {};
  } catch {
    return errorResponse(res, 'The data field must be valid JSON', null, HTTP_STATUS.BAD_REQUEST);
  }
  next();
};
