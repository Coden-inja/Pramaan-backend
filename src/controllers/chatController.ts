import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Message } from '../models/Message';
import { User } from '../models/User';
import { Product } from '../models/Product';

// Send a message
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { receiverId, productId, content } = req.body;
    const senderId = req.user?.userId;

    if (!senderId) {
      return res.status(401).json({ message: 'Unauthorized sender' });
    }

    if (!receiverId || !productId || !content) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    // Get sender info
    const senderUser = await User.findById(senderId);
    if (!senderUser) {
      return res.status(404).json({ message: 'Sender user not found' });
    }

    const message = new Message({
      senderId,
      receiverId,
      productId,
      content,
      senderName: senderUser.name,
      senderRole: senderUser.role,
    });

    await message.save();
    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

// Get chat history for a specific conversation thread
export const getChatHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { otherUserId, productId } = req.query;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!otherUserId || !productId) {
      return res.status(400).json({ message: 'Missing parameters otherUserId or productId' });
    }

    // Find all messages between userId and otherUserId for this specific product
    const messages = await Message.find({
      productId,
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ message: 'Failed to fetch chat history' });
  }
};

// Get conversation lists for the active user (artisan or customer)
export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Find all messages where the user is either sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .sort({ createdAt: -1 })
      .populate('productId', 'title')
      .populate('senderId', 'name email role')
      .populate('receiverId', 'name email role');

    // Group by unique combination of (otherUser, product) to list threads
    const threads: any[] = [];
    const seenKeys = new Set<string>();

    for (const msg of messages) {
      const senderObj = msg.senderId as any;
      const receiverObj = msg.receiverId as any;
      if (!senderObj || !receiverObj || !msg.productId) continue;

      const isSender = senderObj._id.toString() === userId.toString();
      const otherUser = isSender ? receiverObj : senderObj;
      const product = msg.productId;

      const key = `${otherUser._id}-${product._id}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        threads.push({
          otherUser,
          product,
          lastMessage: msg.content,
          updatedAt: msg.createdAt,
        });
      }
    }

    res.status(200).json(threads);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Failed to fetch conversations' });
  }
};
