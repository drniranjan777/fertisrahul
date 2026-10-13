import * as dashboardRepo from '../../repositories/admin/dashboard.repository.js';
import { successResponse } from '../../utils/index.js';

export const stats = async (req, res) => successResponse(res, 'Dashboard fetched', await dashboardRepo.getCounts());
