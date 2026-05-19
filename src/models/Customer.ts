import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICustomer extends Document {
  userId: Types.ObjectId;
  location?: string;
  state?: string;
  preferences: {
    categories: string[];
    priceRange: {
      min: number;
      max: number;
    };
  };
  savedAddresses: Array<{
    street: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
  }>;
  ordersCount: number;
  totalSpent: number;
  rating: number;
  blockchainAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location: {
      type: String,
      default: null,
    },
    state: {
      type: String,
      default: null,
    },
    preferences: {
      categories: [String],
      priceRange: {
        min: {
          type: Number,
          default: 0,
        },
        max: {
          type: Number,
          default: Infinity,
        },
      },
    },
    savedAddresses: [
      {
        street: String,
        city: String,
        state: String,
        pincode: String,
        isDefault: Boolean,
      },
    ],
    ordersCount: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    blockchainAddress: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export const Customer = mongoose.model<ICustomer>('Customer', customerSchema);
