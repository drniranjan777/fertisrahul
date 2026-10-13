import { Router } from 'express';
import * as homeBannerController from '../../controllers/admin/homeBanner.controller.js';
import { adminAuth, validate } from '../../middlewares/index.js';
import { homeBannerSchema } from '../../validations/admin/homeBanner.validator.js';

const router = Router();

router.use(adminAuth);

router.get('/', homeBannerController.get);
router.put('/', validate(homeBannerSchema), homeBannerController.save);

export default router;
