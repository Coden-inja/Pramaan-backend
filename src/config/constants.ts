export const ROLES = {
  SUPPLIER: 'supplier',
  CUSTOMER: 'customer',
} as const;

export const PRODUCT_STATUS = {
  DRAFT: 'draft',
  LISTED: 'listed',
  SOLD: 'sold',
  VERIFIED: 'verified',
  IN_TRANSIT: 'in-transit',
  DELIVERED: 'delivered',
} as const;

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const JWT_EXPIRY = '7d';
export const BCRYPT_ROUNDS = 10;

// Blockchain integration points
export const BLOCKCHAIN_EVENTS = {
  PRODUCT_MINTED: 'ProductMinted',
  PRODUCT_VERIFIED: 'ProductVerified',
  OWNERSHIP_TRANSFERRED: 'OwnershipTransferred',
  ORDER_FULFILLED: 'OrderFulfilled',
} as const;
