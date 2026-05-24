import { Response } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { Customer } from '../models/Customer';
import { Supplier } from '../models/Supplier';
import { AuthRequest } from '../middleware/auth';
import { web3Service } from '../services/web3Service';

// Create order (Customer)
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, quantity, shippingAddress, paymentMethod } = req.body;

    // Get customer
    const customer = await Customer.findOne({ userId: req.user?.userId });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Get product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check inventory
    if (product.inventory.available < quantity) {
      return res.status(400).json({ message: 'Insufficient inventory' });
    }

    const totalPrice = product.price * quantity;

    // Create order
    const order = new Order({
      customerId: customer._id,
      supplierId: product.supplierId,
      productId: product._id,
      quantity,
      totalPrice,
      shippingAddress,
      payment: {
        method: paymentMethod || 'card',
        status: 'pending',
        transactionId: `TXN_${Date.now()}`,
      },
      timeline: [
        {
          date: new Date(),
          status: 'pending',
          description: 'Order created',
        },
      ],
    });

    await order.save();

    // Update inventory
    product.inventory.available -= quantity;
    product.inventory.reserved += quantity;
    await product.save();

    // Update customer stats
    await Customer.findByIdAndUpdate(
      customer._id,
      {
        $inc: { ordersCount: 1 },
      }
    );

    res.status(201).json({
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
};

// Get customer orders
export const getCustomerOrders = async (req: AuthRequest, res: Response) => {
  try {
    const customer = await Customer.findOne({ userId: req.user?.userId });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const orders = await Order.find({ customerId: customer._id })
      .populate('productId', 'title price images')
      .populate('supplierId', 'businessName location');

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

// Get order by ID
export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('productId')
      .populate('supplierId')
      .populate('customerId');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify ownership
    const customer = await Customer.findOne({ userId: req.user?.userId });
    if (order.customerId.toString() !== customer?._id.toString() && req.user?.role === 'customer') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
};

// Update order status (Supplier)
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify supplier ownership
    const supplier = await Supplier.findOne({ userId: req.user?.userId });
    if (order.supplierId.toString() !== supplier?._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    order.status = status;
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    order.timeline.push({
      date: new Date(),
      status: status,
      description: `Order status updated to ${status}`,
    });

    await order.save();

    res.status(200).json({
      message: 'Order updated successfully',
      order,
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Failed to update order' });
  }
};

// Get supplier orders
export const getSupplierOrders = async (req: AuthRequest, res: Response) => {
  try {
    const supplier = await Supplier.findOne({ userId: req.user?.userId });
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    const orders = await Order.find({ supplierId: supplier._id })
      .populate('productId', 'title')
      .populate('customerId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

// Confirm payment (Customer - simulated checkout with real Web2.5 transfer)
export const confirmPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { transactionId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify customer
    const customer = await Customer.findOne({ userId: req.user?.userId });
    if (order.customerId.toString() !== customer?._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    order.payment.status = 'completed';
    order.payment.transactionId = transactionId;
    order.status = 'confirmed';

    order.timeline.push({
      date: new Date(),
      status: 'confirmed',
      description: 'Payment confirmed and processing',
    });

    // 1. Fetch product
    const product = await Product.findById(order.productId);
    if (product) {
      // 2. Perform on-chain transfer if the product is certified on the blockchain
      if (product.tokenId && customer?.blockchainAddress) {
        try {
          const supplier = await Supplier.findById(order.supplierId);
          if (supplier?.blockchainAddress) {
            console.log(`⏳ Triggering on-chain transfer for Token #${product.tokenId} to buyer...`);
            const txHash = await web3Service.transferProductOwnership(
              product.tokenId,
              supplier.blockchainAddress,
              customer.blockchainAddress
            );
            
            // Log on-chain transaction hash
            order.payment.transactionId = txHash;
            order.timeline.push({
              date: new Date(),
              status: 'confirmed',
              description: `Digital Certificate (NFT Token #${product.tokenId}) transferred securely on-chain. TX: ${txHash}`,
            });
            
            product.status = 'sold';
            await product.save();
          }
        } catch (web3Error: any) {
          console.error('⚠️ On-chain transfer failed, but updating payment status:', web3Error);
        }
      }
    }

    await order.save();

    // Update customer stats
    await Customer.findByIdAndUpdate(
      customer._id,
      {
        $inc: { totalSpent: order.totalPrice },
      }
    );

    res.status(200).json({
      message: 'Payment confirmed successfully, digital ownership transferred!',
      order,
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ message: 'Failed to confirm payment' });
  }
};
