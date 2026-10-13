import { Router } from 'express';
import * as bannerVideoController from '../../controllers/admin/bannerVideo.controller.js';
import { adminAuth, parseDataField, validate } from '../../middlewares/index.js';
import { BANNER_FOLDER } from '../../services/videoQueue.service.js';
import { uploadFiles } from '../../services/upload.service.js';
import {
  bannerVideoIdParamSchema,
  createBannerVideoSchema,
  updateBannerVideoSchema,
} from '../../validations/admin/bannerVideo.validator.js';

const router = Router();
const validId = validate(bannerVideoIdParamSchema, 'params');
const files = uploadFiles(BANNER_FOLDER, ['video', 'poster']);

// adminAuth runs first, so requests without a valid token never write files.
router.use(adminAuth);

router.get('/', bannerVideoController.list);
router.get('/:id', validId, bannerVideoController.getById);
router.post('/', files, parseDataField, validate(createBannerVideoSchema), bannerVideoController.create);
router.put('/:id', validId, files, parseDataField, validate(updateBannerVideoSchema), bannerVideoController.update);
router.delete('/:id', validId, bannerVideoController.remove);

export default router;
