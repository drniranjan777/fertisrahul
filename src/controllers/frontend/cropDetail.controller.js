import * as cropDetailRepo from '../../repositories/frontend/cropDetail.repository.js';
import { successResponse, errorResponse, HTTP_STATUS } from '../../utils/index.js';
import { toPublicCropCard, toPublicCropDetail } from '../../utils/cropDetail.util.js';

export const list = async (req, res) => {
  const page = await cropDetailRepo.findGallery(req.query);
  return successResponse(res, 'Crop details fetched', { ...page, rows: page.rows.map(toPublicCropCard) });
};

export const getBySlug = async (req, res) => {
  const detail = await cropDetailRepo.findByCropSlug(req.params.slug);
  if (!detail) return errorResponse(res, 'Crop not found', null, HTTP_STATUS.NOT_FOUND);
  return successResponse(res, 'Crop detail fetched', toPublicCropDetail(detail));
};
