import { verifyToken } from '../services/jwt.service.js';
import * as adminRepo from '../repositories/admin/admin.repository.js';
import { errorResponse, HTTP_STATUS, ADMIN_STATUS } from '../utils/index.js';

export const adminAuth = async (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return errorResponse(res, 'Access token required', null, HTTP_STATUS.UNAUTHORIZED);
  }

  let decoded;
  try {
    decoded = verifyToken(header.slice('Bearer '.length));
  } catch {
    return errorResponse(res, 'Invalid or expired token', null, HTTP_STATUS.UNAUTHORIZED);
  }

  const admin = await adminRepo.findById(decoded.id);
  if (!admin || admin.status != ADMIN_STATUS.ACTIVE) {
    return errorResponse(res, 'Admin not found or inactive', null, HTTP_STATUS.UNAUTHORIZED);
  }

  req.admin = admin;
  next();
};
