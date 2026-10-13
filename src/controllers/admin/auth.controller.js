import bcrypt from 'bcryptjs';
import * as adminRepo from '../../repositories/admin/admin.repository.js';
import { signToken } from '../../services/jwt.service.js';
import { successResponse, errorResponse, HTTP_STATUS, ADMIN_STATUS } from '../../utils/index.js';

const INVALID_CREDENTIALS = 'Invalid email or password';

export const login = async (req, res) => {
  const { email, password } = req.body;
  const admin = await adminRepo.findByEmailWithPassword(email);
  const matched = admin ? await bcrypt.compare(password, admin.password) : false;

  if (!matched) {
    return errorResponse(res, INVALID_CREDENTIALS, null, HTTP_STATUS.UNAUTHORIZED);
  }
  if (admin.status != ADMIN_STATUS.ACTIVE) {
    return errorResponse(res, 'Admin account is inactive', null, HTTP_STATUS.FORBIDDEN);
  }

  await adminRepo.markLoggedIn(admin.id);
  const token = signToken({ id: admin.id, email: admin.email });
  const profile = await adminRepo.findById(admin.id);

  return successResponse(res, 'Login successful', { token, admin: profile });
};

export const me = (req, res) => successResponse(res, 'Profile fetched', req.admin);
