import { Response } from 'express';
import { Product } from '../models/Product';
import { Supplier } from '../models/Supplier';
import { Order } from '../models/Order';
import { AuthRequest } from '../middleware/auth';
import { web3Service } from '../services/web3Service';

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

    let query: any = { status: status || 'verified' };

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

    const product = await Product.findById(productId).populate({
      path: 'supplierId',
      populate: {
        path: 'userId',
        select: 'name email role'
      }
    });

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

    if (!supplier.blockchainAddress) {
      return res.status(400).json({ message: 'Supplier does not have a blockchain wallet address set!' });
    }

    // 1. Construct standard ERC721 metadata JSON
    const metadata = {
      name: product.title,
      description: product.description,
      image: product.images && product.images.length > 0 ? product.images[0] : '',
      attributes: [
        { trait_type: 'GI Tag', value: giTag },
        { trait_type: 'GI Number', value: giNumber },
        { trait_type: 'Category', value: product.category },
        { trait_type: 'Materials', value: product.materials.join(', ') },
        { trait_type: 'Time Taken', value: product.timeTaken },
        { trait_type: 'Artisan Business', value: supplier.businessName },
        { trait_type: 'Region', value: supplier.region },
        { trait_type: 'State', value: supplier.state }
      ]
    };

    // 2. Upload metadata to decentralized IPFS via Pinata
    const metadataURI = await web3Service.pinJSONToIPFS(metadata);

    // 3. Mint the NFT on Polygon Amoy Testnet directly to the artisan's address
    const blockchainResponse = await web3Service.mintGITag(
      productId,
      supplier.blockchainAddress,
      giTag,
      metadataURI
    );

    // 4. Update MongoDB record with official on-chain receipt details
    product.status = 'verified';
    product.giTag = giTag;
    product.giNumber = giNumber;
    product.blockchainHash = blockchainResponse.blockchainHash;
    product.blockNumber = blockchainResponse.blockNumber.toString();
    product.transactionHash = blockchainResponse.transactionHash;
    product.tokenId = blockchainResponse.tokenId;

    product.timeline.push({
      date: new Date(),
      event: 'GI Tag Minted',
      description: `Product certified securely on-chain. Token ID: #${blockchainResponse.tokenId}. IPFS CID: ${metadataURI}`,
    });

    await product.save();

    res.status(200).json({
      message: 'GI Tag certified on-chain successfully!',
      product,
      blockchainData: blockchainResponse,
    });
  } catch (error: any) {
    console.error('Error minting GI tag:', error);
    res.status(500).json({ message: error.message || 'Failed to mint GI tag on-chain' });
  }
};
