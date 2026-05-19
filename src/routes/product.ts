import { Router } from 'express';
import { authenticate, authorizeRole } from '../middleware/auth';
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  mintGITag,
} from '../controllers/productController';

const router = Router();

// Public routes
router.get('/', getAllProducts);
router.get('/:productId', getProductById);

// Supplier routes
router.post('/', authenticate, authorizeRole(['supplier']), createProduct);
router.put('/:productId', authenticate, authorizeRole(['supplier']), updateProduct);
router.delete('/:productId', authenticate, authorizeRole(['supplier']), deleteProduct);
router.post('/:productId/mint-gi-tag', authenticate, authorizeRole(['supplier']), mintGITag);

export default router;
