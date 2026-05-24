import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { ethers } from 'ethers';
import { User } from '../models/User';
import { Supplier } from '../models/Supplier';
import { Customer } from '../models/Customer';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRY = '7d';

export const register = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().isString().withMessage('Phone must be a string'),
  body('role').isIn(['supplier', 'customer']).withMessage('Role must be supplier or customer'),
  body('businessName').if((value, { req }) => req.body.role === 'supplier').notEmpty().withMessage('Business name required for suppliers'),
  body('location').if((value, { req }) => req.body.role === 'supplier').notEmpty().withMessage('Location required for suppliers'),
  body('craftType').if((value, { req }) => req.body.role === 'supplier').notEmpty().withMessage('Craft type required for suppliers'),
  body('bio').optional().isString().withMessage('Bio must be a string'),

  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, password, phone, role, businessName, location, region, state, latitude, longitude, craftType, bio } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Create user
      const user = new User({
        name,
        email,
        password,
        phone: phone || '',
        role,
      });

      await user.save();

      // Create role-specific profile
      if (role === 'supplier') {
        const wallet = ethers.Wallet.createRandom();
        const supplier = new Supplier({
          userId: user._id,
          businessName,
          location,
          region,
          state,
          latitude,
          longitude,
          craftType,
          bio,
          blockchainAddress: wallet.address,
        });
        await supplier.save();
      } else if (role === 'customer') {
        const wallet = ethers.Wallet.createRandom();
        const customer = new Customer({
          userId: user._id,
          blockchainAddress: wallet.address,
        });
        await customer.save();
      }

      // Generate token
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Registration failed' });
    }
  },
];

export const login = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),

  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
      );

      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  },
];

export const logout = (req: AuthRequest, res: Response) => {
  // JWT is stateless, logout on client side by removing token
  res.status(200).json({ message: 'Logged out successfully' });
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.userId).select('-password');
    
    let profile: any = { user };

    if (req.user?.role === 'supplier') {
      const supplier = await Supplier.findOne({ userId: req.user.userId }).populate('userId', 'name email phone');
      profile.supplier = supplier;
    } else if (req.user?.role === 'customer') {
      const customer = await Customer.findOne({ userId: req.user.userId }).populate('userId', 'name email phone');
      profile.customer = customer;
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};
