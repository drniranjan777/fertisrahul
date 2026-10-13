import { Router } from 'express';
import frontendRoutes from './frontend/index.js';
import adminRoutes from './admin/index.js';

const router = Router();

// Strict separation: frontend and admin APIs never share route files
router.use('/frontend', frontendRoutes);
router.use('/admin', adminRoutes);

export default router;
