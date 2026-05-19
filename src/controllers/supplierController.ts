import { Response } from 'express';
import { Supplier } from '../models/Supplier';
import { Product } from '../models/Product';
import { AuthRequest } from '../middleware/auth';

// Get supplier profile
export const getSupplierProfile = async (req: AuthRequest, res: Response) => {
  try {
    const supplier = await Supplier.findOne({ userId: req.user?.userId }).populate('userId', 'name email phone');
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier profile not found' });
    }
    res.status(200).json(supplier);
  } catch (error) {
    console.error('Error fetching supplier profile:', error);
    res.status(500).json({ message: 'Failed to fetch supplier profile' });
  }
};

// Update supplier profile
export const updateSupplierProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { businessName, location, region, state, latitude, longitude, craftType, bio, certification, bankDetails } = req.body;

    const supplier = await Supplier.findOneAndUpdate(
      { userId: req.user?.userId },
      {
        businessName,
        location,
        region,
        state,
        latitude,
        longitude,
        craftType,
        bio,
        certification,
        bankDetails,
      },
      { new: true }
    );

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      supplier,
    });
  } catch (error) {
    console.error('Error updating supplier profile:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

// Get supplier's products
export const getSupplierProducts = async (req: AuthRequest, res: Response) => {
  try {
    const supplier = await Supplier.findOne({ userId: req.user?.userId });
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    const products = await Product.find({ supplierId: supplier._id });
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

// Get supplier stats/dashboard
export const getSupplierStats = async (req: AuthRequest, res: Response) => {
  try {
    const supplier = await Supplier.findOne({ userId: req.user?.userId });
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    const totalProducts = await Product.countDocuments({ supplierId: supplier._id });
    const listedProducts = await Product.countDocuments({ supplierId: supplier._id, status: 'listed' });
    const soldProducts = await Product.countDocuments({ supplierId: supplier._id, status: 'sold' });

    res.status(200).json({
      totalProducts,
      listedProducts,
      soldProducts,
      rating: supplier.rating,
      ratedBy: supplier.ratedBy,
      businessName: supplier.businessName,
      craftType: supplier.craftType,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};
