import { Router } from 'express';
import { authenticate, authorizeRole } from '../middleware/auth';
import {
  createOrder,
  getCustomerOrders,
  getOrderById,
  updateOrderStatus,
  getSupplierOrders,
  confirmPayment,
} from '../controllers/orderController';

const router = Router();

// Customer routes
router.post('/', authenticate, authorizeRole(['customer']), createOrder);
router.get('/customer/orders', authenticate, authorizeRole(['customer']), getCustomerOrders);
router.get('/:orderId', authenticate, getOrderById);
router.post('/:orderId/confirm-payment', authenticate, authorizeRole(['customer']), confirmPayment);

// Supplier routes
router.get('/supplier/orders', authenticate, authorizeRole(['supplier']), getSupplierOrders);
router.put('/:orderId/status', authenticate, authorizeRole(['supplier']), updateOrderStatus);

export default router;
