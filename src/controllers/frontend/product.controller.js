import * as productRepo from '../../repositories/frontend/product.repository.js';
import { successResponse, errorResponse, HTTP_STATUS } from '../../utils/index.js';
import { toPublicProduct } from '../../utils/product.util.js';

export const list = async (req, res) =>
  successResponse(res, 'Products fetched', await productRepo.findActive(req.query));

export const getBySlug = async (req, res) => {
  const product = await productRepo.findActiveBySlug(req.params.slug);
  if (!product) return errorResponse(res, 'Product not found', null, HTTP_STATUS.NOT_FOUND);

  const others = await productRepo.findOthers(product.id);
  return successResponse(res, 'Product fetched', toPublicProduct(product, others));
};
