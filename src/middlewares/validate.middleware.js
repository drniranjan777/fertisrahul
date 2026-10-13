import { errorResponse, HTTP_STATUS } from '../utils/index.js';

const VALIDATE_OPTS = { abortEarly: false, convert: true, stripUnknown: true };

export const validate = (schema, source = 'body') => (req, res, next) => {
  // Express 5 leaves req.body undefined when no body is sent.
  const { error, value } = schema.validate(req[source] ?? {}, VALIDATE_OPTS);
  if (error) {
    const details = error.details.map((d) => d.message);
    return errorResponse(res, 'Validation failed', details, HTTP_STATUS.BAD_REQUEST);
  }

  // Express 5 exposes req.query as a getter, so it can't be assigned directly.
  if (source == 'query') {
    Object.defineProperty(req, 'query', { value, writable: true, configurable: true, enumerable: true });
  } else {
    req[source] = value;
  }
  next();
};
