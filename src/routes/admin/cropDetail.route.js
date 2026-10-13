import { Router } from 'express';
import * as cropDetailController from '../../controllers/admin/cropDetail.controller.js';
import { adminAuth, parseDataField, validate } from '../../middlewares/index.js';
import { uploadFiles } from '../../services/upload.service.js';
import {
  createCropDetailSchema,
  cropDetailIdParamSchema,
  listCropDetailsSchema,
  updateCropDetailSchema,
} from '../../validations/admin/cropDetail.validator.js';

const router = Router();
const validId = validate(cropDetailIdParamSchema, 'params');
const files = uploadFiles('crops', ['image']);

// adminAuth runs first, so requests without a valid token never write files.
router.use(adminAuth);

router.get('/', validate(listCropDetailsSchema, 'query'), cropDetailController.list);
router.get('/:id', validId, cropDetailController.getById);
router.post('/', files, parseDataField, validate(createCropDetailSchema), cropDetailController.create);
router.put('/:id', validId, files, parseDataField, validate(updateCropDetailSchema), cropDetailController.update);
router.delete('/:id', validId, cropDetailController.remove);

export default router;
