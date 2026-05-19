import { Response } from 'express';
import { Customer } from '../models/Customer';
import { AuthRequest } from '../middleware/auth';

// Get customer profile
export const getCustomerProfile = async (req: AuthRequest, res: Response) => {
  try {
    const customer = await Customer.findOne({ userId: req.user?.userId }).populate('userId', 'name email phone');
    if (!customer) {
      return res.status(404).json({ message: 'Customer profile not found' });
    }
    res.status(200).json(customer);
  } catch (error) {
    console.error('Error fetching customer profile:', error);
    res.status(500).json({ message: 'Failed to fetch customer profile' });
  }
};

// Update customer profile
export const updateCustomerProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { location, state, preferences } = req.body;

    const customer = await Customer.findOneAndUpdate(
      { userId: req.user?.userId },
      {
        location,
        state,
        preferences,
      },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      customer,
    });
  } catch (error) {
    console.error('Error updating customer profile:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

// Add shipping address
export const addShippingAddress = async (req: AuthRequest, res: Response) => {
  try {
    const { street, city, state, pincode, isDefault } = req.body;

    const customer = await Customer.findOneAndUpdate(
      { userId: req.user?.userId },
      {
        $push: {
          savedAddresses: { street, city, state, pincode, isDefault: isDefault || false },
        },
      },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.status(201).json({
      message: 'Address added successfully',
      customer,
    });
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({ message: 'Failed to add address' });
  }
};

// Get customer stats
export const getCustomerStats = async (req: AuthRequest, res: Response) => {
  try {
    const customer = await Customer.findOne({ userId: req.user?.userId });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.status(200).json({
      ordersCount: customer.ordersCount,
      totalSpent: customer.totalSpent,
      rating: customer.rating,
      addressesCount: customer.savedAddresses.length,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};
