import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProduct extends Document {
  supplierId: Types.ObjectId;
  title: string;
  description: string;
  category: string;
  materials: string[];
  timeTaken: string;
  price: number;
  discountedPrice?: number;
  images: string[];
  status: 'draft' | 'listed' | 'sold' | 'verified' | 'in-transit' | 'delivered';
  giTag?: string;
  giNumber?: string;
  blockchainHash?: string;
  blockNumber?: string;
  transactionHash?: string;
  craftDetails: {
    technique: string;
    region: string;
    heritage: string;
  };
  inventory: {
    available: number;
    reserved: number;
  };
  carbonSaved: string;
  fairWagePercent: number;
  timeline: Array<{
    date: Date;
    event: string;
    description: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    materials: [String],
    timeTaken: String,
    price: {
      type: Number,
      required: true,
    },
    discountedPrice: Number,
    images: [String],
    status: {
      type: String,
      enum: ['draft', 'listed', 'sold', 'verified', 'in-transit', 'delivered'],
      default: 'draft',
    },
    giTag: String,
    giNumber: String,
    blockchainHash: String,
    blockNumber: String,
    transactionHash: String,
    craftDetails: {
      technique: String,
      region: String,
      heritage: String,
    },
    inventory: {
      available: {
        type: Number,
        default: 1,
      },
      reserved: {
        type: Number,
        default: 0,
      },
    },
    carbonSaved: {
      type: String,
      default: '0 kg',
    },
    fairWagePercent: {
      type: Number,
      default: 100,
    },
    timeline: [
      {
        date: Date,
        event: String,
        description: String,
      },
    ],
  },
  { timestamps: true }
);

export const Product = mongoose.model<IProduct>('Product', productSchema);
