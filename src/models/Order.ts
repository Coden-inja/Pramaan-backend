import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IOrder extends Document {
  customerId: Types.ObjectId;
  supplierId: Types.ObjectId;
  productId: Types.ObjectId;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  trackingNumber?: string;
  blockchainTransactionId?: string;
  payment: {
    method: 'card' | 'upi' | 'net-banking' | 'crypto';
    status: 'pending' | 'completed' | 'failed';
    transactionId: string;
  };
  timeline: Array<{
    date: Date;
    status: string;
    description: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: {
        type: String,
        default: 'India',
      },
    },
    trackingNumber: String,
    blockchainTransactionId: String,
    payment: {
      method: {
        type: String,
        enum: ['card', 'upi', 'net-banking', 'crypto'],
        required: true,
      },
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
      },
      transactionId: String,
    },
    timeline: [
      {
        date: Date,
        status: String,
        description: String,
      },
    ],
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>('Order', orderSchema);
