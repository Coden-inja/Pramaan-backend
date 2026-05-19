# Pramaan System Architecture & API Documentation

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRAMAAN PLATFORM                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐              ┌──────────────┐                 │
│  │   Frontend   │              │  Admin Panel │                 │
│  │  (Next.js)   │              │  (Future)    │                 │
│  └──────┬───────┘              └──────┬───────┘                 │
│         │                             │                          │
│         │    REST API Calls           │                          │
│         └─────────────┬───────────────┘                          │
│                       │                                          │
│              ┌────────▼─────────┐                               │
│              │   Express.js     │                               │
│              │   Backend API    │                               │
│              │   (Node.js)      │                               │
│              └────────┬─────────┘                               │
│                       │                                          │
│         ┌─────────────┼─────────────┐                           │
│         │             │             │                           │
│    ┌────▼────┐   ┌────▼────┐  ┌────▼────────┐                  │
│    │ MongoDB  │   │ Polygon │  │   IPFS      │                  │
│    │   Atlas  │   │ Network │  │  (Future)   │                  │
│    └──────────┘   └─────────┘  └─────────────┘                  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Database Schema (MongoDB)

### Collections

#### 1. **users** (Base authentication)
```json
{
  "_id": ObjectId,
  "role": "supplier" | "customer",
  "email": "user@example.com",
  "password": "hashed",
  "phone": "9876543210",
  "name": "Name",
  "avatar": "url",
  "isVerified": false,
  "createdAt": Date,
  "updatedAt": Date
}
```

#### 2. **suppliers** (Artisan profiles)
```json
{
  "_id": ObjectId,
  "userId": ObjectId,
  "businessName": "Bishnupur Silks",
  "location": "Bishnupur, WB",
  "region": "Bishnupur",
  "state": "West Bengal",
  "latitude": 23.0745,
  "longitude": 87.3158,
  "craftType": "Baluchari Silk Weaving",
  "bio": "Third-generation master weaver",
  "certification": "GI Certified",
  "productsCount": 24,
  "rating": 4.8,
  "ratedBy": 125,
  "bankDetails": {
    "accountHolder": "Name",
    "accountNumber": "123456789",
    "bankName": "Bank Name",
    "ifscCode": "IFSC123"
  },
  "blockchainAddress": "0x...",
  "giTags": ["Bishnupur Silk", "Handwoven"],
  "createdAt": Date,
  "updatedAt": Date
}
```

#### 3. **customers** (Buyer profiles)
```json
{
  "_id": ObjectId,
  "userId": ObjectId,
  "location": "Delhi",
  "state": "Delhi",
  "preferences": {
    "categories": ["Textiles", "Handicrafts"],
    "priceRange": {
      "min": 0,
      "max": 50000
    }
  },
  "savedAddresses": [
    {
      "street": "123 Main St",
      "city": "Delhi",
      "state": "Delhi",
      "pincode": "110001",
      "isDefault": true
    }
  ],
  "ordersCount": 5,
  "totalSpent": 75000,
  "rating": 4.5,
  "blockchainAddress": "0x...",
  "createdAt": Date,
  "updatedAt": Date
}
```

#### 4. **products** (GI-tagged products)
```json
{
  "_id": ObjectId,
  "supplierId": ObjectId,
  "title": "Baluchari Silk Saree",
  "description": "Hand-woven traditional saree",
  "category": "Textiles",
  "materials": ["Pure Mulberry Silk", "Gold Zari"],
  "timeTaken": "4 weeks",
  "price": 18500,
  "discountedPrice": null,
  "images": ["url1", "url2", "url3"],
  "status": "listed",
  "giTag": "Bishnupur Silk",
  "giNumber": "GI-2024-001",
  "blockchainHash": "0x...",
  "blockNumber": 48221,
  "transactionHash": "0x...",
  "craftDetails": {
    "technique": "Hand-weaving",
    "region": "Bishnupur",
    "heritage": "Ramayana motifs"
  },
  "inventory": {
    "available": 1,
    "reserved": 0
  },
  "carbonSaved": "5 kg",
  "fairWagePercent": 100,
  "timeline": [
    {
      "date": Date,
      "event": "Created",
      "description": "Product created"
    }
  ],
  "createdAt": Date,
  "updatedAt": Date
}
```

#### 5. **orders** (Purchase transactions)
```json
{
  "_id": ObjectId,
  "customerId": ObjectId,
  "supplierId": ObjectId,
  "productId": ObjectId,
  "quantity": 1,
  "totalPrice": 18500,
  "status": "confirmed",
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Delhi",
    "state": "Delhi",
    "pincode": "110001",
    "country": "India"
  },
  "trackingNumber": "TRACK123",
  "blockchainTransactionId": "0x...",
  "payment": {
    "method": "card",
    "status": "completed",
    "transactionId": "TXN_1234567890"
  },
  "timeline": [
    {
      "date": Date,
      "status": "pending",
      "description": "Order created"
    }
  ],
  "createdAt": Date,
  "updatedAt": Date
}
```

## Complete API Endpoints

### Authentication Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new supplier/customer |
| POST | `/api/auth/login` | No | Login and get JWT token |
| POST | `/api/auth/logout` | Yes | Logout (client removes token) |
| GET | `/api/auth/profile` | Yes | Get authenticated user profile |

### Supplier Endpoints

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/supplier/profile` | Yes | Supplier | Get supplier profile |
| PUT | `/api/supplier/profile` | Yes | Supplier | Update supplier profile |
| GET | `/api/supplier/products` | Yes | Supplier | Get my products |
| GET | `/api/supplier/stats` | Yes | Supplier | Get dashboard stats |

### Customer Endpoints

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/customer/profile` | Yes | Customer | Get customer profile |
| PUT | `/api/customer/profile` | Yes | Customer | Update customer profile |
| POST | `/api/customer/address` | Yes | Customer | Add shipping address |
| GET | `/api/customer/stats` | Yes | Customer | Get customer stats |

### Product Endpoints

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/products` | Yes | Supplier | Create product |
| GET | `/api/products` | No | - | Get all products (paginated) |
| GET | `/api/products/:id` | No | - | Get product details |
| PUT | `/api/products/:id` | Yes | Supplier | Update product |
| DELETE | `/api/products/:id` | Yes | Supplier | Delete product |
| POST | `/api/products/:id/mint-gi-tag` | Yes | Supplier | Mint GI tag (blockchain) |

**Query Parameters for GET /api/products:**
- `category`: Filter by category
- `search`: Search in title
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter
- `skip`: Pagination offset
- `limit`: Items per page

### Order Endpoints

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/orders` | Yes | Customer | Create order |
| GET | `/api/orders/customer/orders` | Yes | Customer | Get my orders |
| GET | `/api/orders/:id` | Yes | Both | Get order details |
| POST | `/api/orders/:id/confirm-payment` | Yes | Customer | Confirm payment |
| GET | `/api/orders/supplier/orders` | Yes | Supplier | Get received orders |
| PUT | `/api/orders/:id/status` | Yes | Supplier | Update order status |

## Request/Response Examples

### Register as Supplier

**Request:**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "Ananya Devi",
  "email": "ananya@bishnupur.com",
  "password": "securePassword123",
  "phone": "9876543210",
  "role": "supplier",
  "businessName": "Bishnupur Silk House",
  "location": "Bishnupur, West Bengal",
  "region": "Bishnupur",
  "state": "West Bengal",
  "latitude": 23.0745,
  "longitude": 87.3158,
  "craftType": "Baluchari Silk Weaving",
  "bio": "Third-generation master weaver preserving Ramayana motifs"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Ananya Devi",
    "email": "ananya@bishnupur.com",
    "role": "supplier"
  }
}
```

### Login

**Request:**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "ananya@bishnupur.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Ananya Devi",
    "email": "ananya@bishnupur.com",
    "role": "supplier"
  }
}
```

### Create Product

**Request:**
```bash
POST /api/products
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "title": "Baluchari Silk Saree - Ramayana Panels",
  "description": "Hand-woven with pure silk and gold zari, featuring mythological Ramayana panels",
  "category": "Textiles",
  "materials": ["Pure Mulberry Silk", "Gold Zari", "Natural Dyes"],
  "timeTaken": "4 weeks",
  "price": 18500,
  "images": [
    "https://example.com/saree1.jpg",
    "https://example.com/saree2.jpg"
  ],
  "craftDetails": {
    "technique": "Hand-weaving on traditional loom",
    "region": "Bishnupur, West Bengal",
    "heritage": "Ramayana and Mahabharata motifs, 400+ years old"
  }
}
```

**Response (201 Created):**
```json
{
  "message": "Product created successfully",
  "product": {
    "_id": "507f1f77bcf86cd799439012",
    "supplierId": "507f1f77bcf86cd799439011",
    "title": "Baluchari Silk Saree - Ramayana Panels",
    "description": "Hand-woven with pure silk and gold zari...",
    "price": 18500,
    "status": "draft",
    "inventory": {
      "available": 1,
      "reserved": 0
    },
    "timeline": [
      {
        "date": "2024-05-19T10:30:00Z",
        "event": "Product Created",
        "description": "Product created by supplier"
      }
    ],
    "createdAt": "2024-05-19T10:30:00Z",
    "updatedAt": "2024-05-19T10:30:00Z"
  }
}
```

### Mint GI Tag (Blockchain Integration)

**Request:**
```bash
POST /api/products/507f1f77bcf86cd799439012/mint-gi-tag
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "giTag": "Bishnupur Silk",
  "giNumber": "GI-2024-001"
}
```

**Response (200 OK):**
```json
{
  "message": "GI Tag minted successfully",
  "product": {
    "_id": "507f1f77bcf86cd799439012",
    "status": "verified",
    "giTag": "Bishnupur Silk",
    "giNumber": "GI-2024-001",
    "blockchainHash": "0xabcdef1234567890",
    "blockNumber": 48221,
    "transactionHash": "0xfedcba0987654321",
    "timeline": [
      {
        "date": "2024-05-19T11:45:00Z",
        "event": "GI Tag Minted",
        "description": "Product minted with GI tag Bishnupur Silk"
      }
    ]
  },
  "blockchainData": {
    "hash": "0xabcdef1234567890",
    "blockNumber": 48221,
    "txHash": "0xfedcba0987654321",
    "timestamp": "2024-05-19T11:45:00Z"
  }
}
```

### Create Order

**Request:**
```bash
POST /api/orders
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "productId": "507f1f77bcf86cd799439012",
  "quantity": 1,
  "paymentMethod": "card",
  "shippingAddress": {
    "street": "123 MG Road",
    "city": "Bangalore",
    "state": "Karnataka",
    "pincode": "560034",
    "country": "India"
  }
}
```

**Response (201 Created):**
```json
{
  "message": "Order created successfully",
  "order": {
    "_id": "507f1f77bcf86cd799439013",
    "customerId": "507f1f77bcf86cd799439014",
    "supplierId": "507f1f77bcf86cd799439011",
    "productId": "507f1f77bcf86cd799439012",
    "quantity": 1,
    "totalPrice": 18500,
    "status": "pending",
    "payment": {
      "method": "card",
      "status": "pending",
      "transactionId": "TXN_1716186600000"
    },
    "shippingAddress": {
      "street": "123 MG Road",
      "city": "Bangalore",
      "state": "Karnataka",
      "pincode": "560034",
      "country": "India"
    },
    "timeline": [
      {
        "date": "2024-05-19T12:30:00Z",
        "status": "pending",
        "description": "Order created"
      }
    ],
    "createdAt": "2024-05-19T12:30:00Z",
    "updatedAt": "2024-05-19T12:30:00Z"
  }
}
```

### Confirm Payment

**Request:**
```bash
POST /api/orders/507f1f77bcf86cd799439013/confirm-payment
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "transactionId": "RAZORPAY_1716186600000"
}
```

**Response (200 OK):**
```json
{
  "message": "Payment confirmed",
  "order": {
    "_id": "507f1f77bcf86cd799439013",
    "status": "confirmed",
    "payment": {
      "method": "card",
      "status": "completed",
      "transactionId": "RAZORPAY_1716186600000"
    },
    "timeline": [
      {
        "date": "2024-05-19T12:35:00Z",
        "status": "confirmed",
        "description": "Payment confirmed"
      }
    ]
  }
}
```

## Error Response Format

**All errors follow this format (400, 401, 403, 404, 500):**
```json
{
  "message": "Error description",
  "errors": [
    {
      "msg": "Validation error",
      "param": "email"
    }
  ]
}
```

## Authentication Header

All protected endpoints require:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

Token is valid for 7 days. After expiry, user must login again to get a new token.

## Rate Limiting (To Be Implemented)

- 100 requests per minute per IP (general)
- 10 requests per minute per IP (authentication endpoints)
- 5 requests per minute per user (payment endpoints)

## CORS Configuration

Allowed origins:
- `http://localhost:3000` (development)
- `http://localhost:3001` (development)
- `https://yourdomain.com` (production)

## Pagination

For list endpoints:
- Default limit: 20 items
- Max limit: 100 items
- Use `skip` and `limit` query parameters

Example: `/api/products?skip=20&limit=10`

## Environment Setup for Testing

Use provided `.env.example` - copy to `.env` and fill with actual values.

## Webhooks (Future)

Future versions will support webhooks for:
- Order status updates
- Payment confirmations
- Product verification
- Review notifications

Subscribe at: `POST /api/webhooks/subscribe`
