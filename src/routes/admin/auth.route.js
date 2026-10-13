import { Router } from 'express';
import * as authController from '../../controllers/admin/auth.controller.js';
import { adminAuth, loginRateLimit, validate } from '../../middlewares/index.js';
import { adminLoginSchema } from '../../validations/admin/auth.validator.js';

const router = Router();

router.post('/login', loginRateLimit, validate(adminLoginSchema), authController.login);
router.get('/me', adminAuth, authController.me);

export default router;
