import { Router } from 'express';
import { MASTERS } from '../../config/masters.js';
import authRoutes from './auth.route.js';
import cropDetailRoutes from './cropDetail.route.js';
import dashboardRoutes from './dashboard.route.js';
import { createMasterRouter } from './master.route.js';
import productRoutes from './product.route.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Admin API is running', scope: 'admin' });
});

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/products', productRoutes);
router.use('/crop-details', cropDetailRoutes);
MASTERS.forEach((master) => router.use(`/${master.path}`, createMasterRouter(master)));

export default router;
