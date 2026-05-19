import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISupplier extends Document {
  userId: Types.ObjectId;
  businessName: string;
  location: string;
  region: string;
  state: string;
  latitude: number;
  longitude: number;
  craftType: string;
  bio: string;
  certification?: string;
  productsCount: number;
  rating: number;
  ratedBy: number;
  bankDetails: {
    accountHolder: string;
    accountNumber: string;
    bankName: string;
    ifscCode: string;
  };
  blockchainAddress?: string;
  giTags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const supplierSchema = new Schema<ISupplier>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    businessName: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    region: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    craftType: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      required: true,
    },
    certification: {
      type: String,
      default: null,
    },
    productsCount: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 5,
      min: 0,
      max: 5,
    },
    ratedBy: {
      type: Number,
      default: 0,
    },
    bankDetails: {
      accountHolder: String,
      accountNumber: String,
      bankName: String,
      ifscCode: String,
    },
    blockchainAddress: {
      type: String,
      default: null,
    },
    giTags: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

export const Supplier = mongoose.model<ISupplier>('Supplier', supplierSchema);
