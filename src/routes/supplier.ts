import { Router } from 'express';
import { authenticate, authorizeRole } from '../middleware/auth';
import {
  getSupplierProfile,
  updateSupplierProfile,
  getSupplierProducts,
  getSupplierStats,
} from '../controllers/supplierController';

const router = Router();

router.use(authenticate);
router.use(authorizeRole(['supplier']));

router.get('/profile', getSupplierProfile);
router.put('/profile', updateSupplierProfile);
router.get('/products', getSupplierProducts);
router.get('/stats', getSupplierStats);

export default router;
