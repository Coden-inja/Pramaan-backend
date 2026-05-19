# Pramaan Backend - Complete Setup Guide

## Project Structure

```
pramaan-backend/
├── src/
│   ├── config/
│   │   ├── database.ts         # MongoDB connection
│   │   └── constants.ts         # App constants & blockchain events
│   ├── models/
│   │   ├── User.ts              # Base user model (supplier/customer)
│   │   ├── Supplier.ts          # Supplier/Artisan profile
│   │   ├── Customer.ts          # Customer profile
│   │   ├── Product.ts           # Product with blockchain tracking
│   │   └── Order.ts             # Orders with blockchain integration
│   ├── controllers/
│   │   ├── authController.ts    # Auth logic (register/login/profile)
│   │   ├── supplierController.ts # Supplier profile & dashboard
│   │   ├── customerController.ts # Customer profile & preferences
│   │   ├── productController.ts  # Product CRUD, GI tag minting
│   │   └── orderController.ts    # Order management, payment
│   ├── routes/
│   │   ├── auth.ts              # Auth endpoints
│   │   ├── supplier.ts          # Supplier endpoints
│   │   ├── customer.ts          # Customer endpoints
│   │   ├── product.ts           # Product endpoints
│   │   └── order.ts             # Order endpoints
│   ├── middleware/
│   │   └── auth.ts              # JWT authentication & role authorization
│   ├── services/
│   │   └── BLOCKCHAIN_INTEGRATION.md # Blockchain integration guide
│   └── server.ts                # Express app setup
├── .env                         # Environment variables
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies
└── tsconfig.json                # TypeScript config
```

## Features Implemented

### 1. **Authentication System**
- ✅ JWT-based authentication
- ✅ Separate registration for Suppliers and Customers
- ✅ Password hashing with bcrypt
- ✅ Role-based access control
- ✅ Protected endpoints with middleware

### 2. **Supplier/Artisan Module**
- ✅ Business profile management
- ✅ GI tag storage
- ✅ Banking details for payments
- ✅ Product management (create, list, update, delete)
- ✅ Blockchain address for payments
- ✅ Rating and review system

### 3. **Customer Module**
- ✅ Profile management
- ✅ Multiple shipping addresses
- ✅ Preference tracking (categories, price range)
- ✅ Order history
- ✅ Rating system

### 4. **Product Management**
- ✅ Full product lifecycle
- ✅ Status tracking (draft → listed → sold)
- ✅ Inventory management
- ✅ GI tag minting (simulated blockchain link)
- ✅ Product images and craft details
- ✅ Timeline tracking for verification

### 5. **Order Processing**
- ✅ Order creation with inventory check
- ✅ Payment confirmation workflow
- ✅ Supplier order management
- ✅ Order tracking with timeline
- ✅ Shipping address and tracking

### 6. **Blockchain Integration Points** (Documented)
- GI Tag Minting on Polygon
- Ownership Transfer on Purchase
- Supply Chain Audit Trail
- Fair Wage Verification
- Carbon Credit System

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account
- npm or yarn

### Installation

1. **Install Dependencies**
```bash
cd Pramaan-backend
npm install
```

2. **Configure Environment Variables**
Create `.env` file:
```
MONGODB_URI=mongodb+srv://yogesh:admin@yoyoyo.gz4qa8u.mongodb.net/?appName=Yoyoyo
JWT_SECRET=your-secret-key-change-in-production
PORT=5000
FRONTEND_URL=http://localhost:3000
```

3. **Start Development Server**
```bash
npm run dev
```

Server will run on `http://localhost:5000`

4. **Build for Production**
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
```
POST   /api/auth/register           # Register supplier or customer
POST   /api/auth/login              # Login
POST   /api/auth/logout             # Logout
GET    /api/auth/profile            # Get authenticated user profile
```

### Supplier Routes (Protected)
```
GET    /api/supplier/profile        # Get supplier profile
PUT    /api/supplier/profile        # Update supplier profile
GET    /api/supplier/products       # Get supplier's products
GET    /api/supplier/stats          # Get dashboard stats
```

### Customer Routes (Protected)
```
GET    /api/customer/profile        # Get customer profile
PUT    /api/customer/profile        # Update customer profile
POST   /api/customer/address        # Add shipping address
GET    /api/customer/stats          # Get dashboard stats
```

### Product Routes
```
POST   /api/products                # Create product (Supplier only)
GET    /api/products                # Get all products (public)
GET    /api/products/:id            # Get product details (public)
PUT    /api/products/:id            # Update product (Supplier only)
DELETE /api/products/:id            # Delete product (Supplier only)
POST   /api/products/:id/mint-gi-tag # Mint GI tag (Supplier only, blockchain)
```

### Order Routes
```
POST   /api/orders                  # Create order (Customer)
GET    /api/orders/customer/orders  # Get customer's orders
GET    /api/orders/:id              # Get order details
POST   /api/orders/:id/confirm-payment # Confirm payment (Customer)
GET    /api/orders/supplier/orders  # Get supplier's orders
PUT    /api/orders/:id/status       # Update order status (Supplier)
```

## Example API Usage

### Register as Supplier
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ananya Devi",
    "email": "ananya@example.com",
    "password": "password123",
    "phone": "9876543210",
    "role": "supplier",
    "businessName": "Bishnupur Silks",
    "location": "Bishnupur, West Bengal",
    "region": "Bishnupur",
    "state": "West Bengal",
    "latitude": 23.0745,
    "longitude": 87.3158,
    "craftType": "Baluchari Silk Weaving",
    "bio": "Third-generation master weaver"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ananya@example.com",
    "password": "password123"
  }'
```

### Create Product
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Baluchari Saree",
    "description": "Hand-woven traditional saree",
    "category": "Textiles",
    "materials": ["Pure Mulberry Silk"],
    "timeTaken": "4 weeks",
    "price": 18500,
    "images": ["url1", "url2"],
    "craftDetails": {
      "technique": "Hand-weaving",
      "region": "Bishnupur",
      "heritage": "400 years old"
    }
  }'
```

### Place Order
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "productId": "product_id",
    "quantity": 1,
    "paymentMethod": "card",
    "shippingAddress": {
      "street": "123 Main St",
      "city": "Delhi",
      "state": "Delhi",
      "pincode": "110001",
      "country": "India"
    }
  }'
```

## Data Models

### User
- `role`: supplier | customer
- `email`, `password`: Authentication
- `phone`, `name`: Basic info
- `avatar`: Profile picture
- `isVerified`: Account status

### Supplier
- `businessName`, `craftType`, `bio`: Business info
- `location`, `region`, `state`: Geographic data
- `rating`, `ratedBy`: Reputation
- `bankDetails`: Payment info
- `blockchainAddress`: Wallet for crypto payments
- `giTags`: Array of GI tags owned

### Product
- `supplierId`: Reference to supplier
- `status`: draft → listed → sold → verified
- `price`, `discountedPrice`
- `giTag`, `giNumber`: Authenticity markers
- `blockchainHash`, `blockNumber`, `transactionHash`: Blockchain proof
- `timeline`: Audit trail of events
- `inventory`: Available and reserved quantity

### Order
- `customerId`, `supplierId`, `productId`: References
- `status`: pending → confirmed → shipped → delivered
- `payment`: method, status, transactionId
- `blockchainTransactionId`: For blockchain payments
- `timeline`: Order event history

## Role-Based Access Control

### Supplier Permissions
- Create and manage products
- View their own orders
- Update order status
- Mint GI tags
- Update profile
- View dashboard

### Customer Permissions
- Browse products
- Create orders
- Confirm payments
- Update profile
- View order history
- Add shipping addresses

## Blockchain Integration

See `src/services/BLOCKCHAIN_INTEGRATION.md` for:
- Polygon network setup
- Smart contract deployment
- GI tag NFT minting
- Ownership transfer on purchase
- Payment processing with stablecoins
- Supply chain audit trail
- Fair wage verification

Quick integration points:
1. **Product Minting**: Call smart contract when GI tag created
2. **Order Fulfillment**: Record on blockchain when delivered
3. **Payment Processing**: Support USDC/USDT for direct supplier payment
4. **Verification**: Query blockchain for authenticity

## Security Best Practices

✅ Implemented:
- Password hashing with bcrypt
- JWT token authentication
- Role-based authorization
- Input validation with express-validator
- CORS configuration
- Environment variable management

⚠️ To Do:
- Rate limiting
- HTTPS enforcement
- Request logging
- Security headers
- Input sanitization
- Database encryption

## Next Steps

1. **Connect Frontend**: Update Next.js frontend with API endpoints
2. **Deploy Backend**: Use Railway, Render, or Vercel
3. **Blockchain Setup**: Deploy smart contracts to Polygon
4. **Payment Gateway**: Integrate Stripe/Razorpay for traditional payments
5. **Testing**: Write unit and integration tests
6. **Monitoring**: Setup error tracking and analytics

## Support

For blockchain integration details, refer to `src/services/BLOCKCHAIN_INTEGRATION.md`

For issues or questions, check MongoDB connection and JWT secret configuration.
