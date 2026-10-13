import { Router } from 'express';
import * as homeBannerController from '../../controllers/frontend/homeBanner.controller.js';
import { validate } from '../../middlewares/index.js';
import { homeBannerQuerySchema } from '../../validations/frontend/homeBanner.validator.js';

const router = Router();

router.get('/', validate(homeBannerQuerySchema, 'query'), homeBannerController.get);

export default router;
