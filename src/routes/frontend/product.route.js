import { Router } from 'express';
import * as productController from '../../controllers/frontend/product.controller.js';
import { validate } from '../../middlewares/index.js';
import { listPublicProductsSchema, productSlugParamSchema } from '../../validations/frontend/product.validator.js';

const router = Router();

router.get('/', validate(listPublicProductsSchema, 'query'), productController.list);
router.get('/:slug', validate(productSlugParamSchema, 'params'), productController.getBySlug);

export default router;
