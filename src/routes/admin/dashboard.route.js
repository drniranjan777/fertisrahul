import { Router } from 'express';
import * as dashboardController from '../../controllers/admin/dashboard.controller.js';
import { adminAuth } from '../../middlewares/index.js';

const router = Router();

router.get('/', adminAuth, dashboardController.stats);

export default router;
