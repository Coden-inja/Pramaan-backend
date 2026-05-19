import { Router } from 'express';
import { authenticate, authorizeRole } from '../middleware/auth';
import {
  getCustomerProfile,
  updateCustomerProfile,
  addShippingAddress,
  getCustomerStats,
} from '../controllers/customerController';

const router = Router();

router.use(authenticate);
router.use(authorizeRole(['customer']));

router.get('/profile', getCustomerProfile);
router.put('/profile', updateCustomerProfile);
router.post('/address', addShippingAddress);
router.get('/stats', getCustomerStats);

export default router;
