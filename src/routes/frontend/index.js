import { Router } from 'express';
import { MASTERS } from '../../config/masters.js';
import { listActive } from '../../controllers/frontend/master.controller.js';
import cropDetailRoutes from './cropDetail.route.js';
import productRoutes from './product.route.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Frontend API is running', scope: 'frontend' });
});

MASTERS.forEach((master) => router.get(`/${master.path}`, listActive(master)));
router.use('/products', productRoutes);
router.use('/crop-details', cropDetailRoutes);

export default router;
