import { Response } from 'express';
import { Product } from '../models/Product';
import { Supplier } from '../models/Supplier';
import { Order } from '../models/Order';
import { AuthRequest } from '../middleware/auth';

// Create product (Supplier only)
export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category, materials, timeTaken, price, images, craftDetails } = req.body;

    const supplier = await Supplier.findOne({ userId: req.user?.userId });
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    const product = new Product({
      supplierId: supplier._id,
      title,
      description,
      category,
      materials,
      timeTaken,
      price,
      images,
      craftDetails,
      status: 'draft',
      timeline: [
        {
          date: new Date(),
          event: 'Product Created',
          description: 'Product created by supplier',
        },
      ],
    });

    await product.save();

    res.status(201).json({
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Failed to create product' });
  }
};

// Get all products (public)
export const getAllProducts = async (req: AuthRequest, res: Response) => {
  try {
    const { category, search, minPrice, maxPrice, status } = req.query;

    let query: any = { status: 'listed' };

    if (category) query.category = category;
    if (search) query.title = { $regex: search, $options: 'i' };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = minPrice;
      if (maxPrice) query.price.$lte = maxPrice;
    }

    const products = await Product.find(query).populate('supplierId', 'businessName craftType rating location');

    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

// Get product by ID
export const getProductById = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId).populate('supplierId', 'businessName craftType rating location bio');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
};

// Update product (Supplier only)
export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const { title, description, price, status, images, craftDetails } = req.body;

    const supplier = await Supplier.findOne({ userId: req.user?.userId });
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    const product = await Product.findById(productId);
    if (!product || product.supplierId.toString() !== supplier._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    Object.assign(product, { title, description, price, status, images, craftDetails });

    product.timeline.push({
      date: new Date(),
      event: 'Product Updated',
      description: 'Product details updated',
    });

    await product.save();

    res.status(200).json({
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
};

// Delete product (Supplier only)
export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;

    const supplier = await Supplier.findOne({ userId: req.user?.userId });
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    const product = await Product.findById(productId);
    if (!product || product.supplierId.toString() !== supplier._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Product.findByIdAndDelete(productId);

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
};

// Mint GI Tag (Supplier - blockchain integration point)
export const mintGITag = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const { giTag, giNumber } = req.body;

    const supplier = await Supplier.findOne({ userId: req.user?.userId });
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    const product = await Product.findById(productId);
    if (!product || product.supplierId.toString() !== supplier._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // TODO: Call blockchain service to mint GI tag
    // For now, simulate with placeholder
    const blockchainResponse = await simulateBlockchainMint(product);

    product.status = 'verified';
    product.giTag = giTag;
    product.giNumber = giNumber;
    product.blockchainHash = blockchainResponse.hash;
    product.blockNumber = blockchainResponse.blockNumber.toString();
    product.transactionHash = blockchainResponse.txHash;

    product.timeline.push({
      date: new Date(),
      event: 'GI Tag Minted',
      description: `Product minted with GI tag ${giTag}`,
    });

    await product.save();

    res.status(200).json({
      message: 'GI Tag minted successfully',
      product,
      blockchainData: blockchainResponse,
    });
  } catch (error) {
    console.error('Error minting GI tag:', error);
    res.status(500).json({ message: 'Failed to mint GI tag' });
  }
};

// Simulate blockchain minting (replace with real blockchain call)
const simulateBlockchainMint = async (product: any) => {
  return {
    hash: `0x${Math.random().toString(16).substr(2, 64)}`,
    blockNumber: Math.floor(Math.random() * 100000),
    txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
    timestamp: new Date().toISOString(),
  };
};
