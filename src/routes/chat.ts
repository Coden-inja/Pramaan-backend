import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  sendMessage,
  getChatHistory,
  getConversations,
} from '../controllers/chatController';

const router = Router();

router.post('/send', authenticate, sendMessage);
router.get('/history', authenticate, getChatHistory);
router.get('/conversations', authenticate, getConversations);

export default router;
