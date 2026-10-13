import { Router } from 'express';
import * as cropDetailController from '../../controllers/frontend/cropDetail.controller.js';
import { validate } from '../../middlewares/index.js';
import { cropSlugParamSchema, listPublicCropDetailsSchema } from '../../validations/frontend/cropDetail.validator.js';

const router = Router();

router.get('/', validate(listPublicCropDetailsSchema, 'query'), cropDetailController.list);
router.get('/:slug', validate(cropSlugParamSchema, 'params'), cropDetailController.getBySlug);

export default router;
