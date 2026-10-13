import { Router } from 'express';
import * as productController from '../../controllers/admin/product.controller.js';
import { adminAuth, parseDataField, validate } from '../../middlewares/index.js';
import { uploadFiles } from '../../services/upload.service.js';
import {
  createProductSchema,
  listProductsSchema,
  productIdParamSchema,
  updateProductSchema,
} from '../../validations/admin/product.validator.js';

const router = Router();
const validId = validate(productIdParamSchema, 'params');
const files = uploadFiles('products', ['image', 'pdf']);

// adminAuth runs first, so requests without a valid token never write files.
router.use(adminAuth);

router.get('/', validate(listProductsSchema, 'query'), productController.list);
router.get('/:id', validId, productController.getById);
router.post('/', files, parseDataField, validate(createProductSchema), productController.create);
router.put('/:id', validId, files, parseDataField, validate(updateProductSchema), productController.update);
router.delete('/:id', validId, productController.remove);

export default router;
