# Rural Market Intelligence Platform

A rural agricultural marketplace that helps farmers, buyers, and vendors make informed decisions using market data, price comparisons, and AI-powered insights.

## Problem Statement

Rural farmers often lack access to real-time market information and struggle to find the best markets to sell their produce. This platform provides market intelligence, price comparison, and a peer-to-peer marketplace to bridge that gap.

## Solution

- **Market Intelligence**: Historical market prices, product analytics, and demand trends
- **Where Should I Sell?**: Compare market prices across locations and calculate net returns after transportation costs
- **Marketplace**: Direct farmer-to-buyer-to-vendor commerce with purchase requests and order management
- **Notifications**: Real-time alerts for purchase requests and order status changes
- **AI Insights**: Ask market questions and get selling/stocking advice (optional Gemini integration)

## Technology Stack

- **Frontend**: React 18 + Vite + React Router
- **Backend**: Node.js + Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcrypt
- **AI**: Google Gemini API (optional)
- **Styling**: Plain CSS

## Prerequisites

- Node.js (v18+)
- npm
- MongoDB running locally
- Optional: Google Gemini API key for AI features

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-repo/rural-market-intelligence.git
cd rural-market-intelligence
```

### 2. Backend Setup

```bash
cd server
npm install
cp .env.example .env
```

Configure `server/.env`:

```env
# Required
MONGODB_URI=mongodb://127.0.0.1:27017/rural_market_intelligence
PORT=5000
JWT_SECRET=your_long_random_secret_here

# Optional - AI Features (leave as placeholder if not using)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash

# Optional - Email Features
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@ruralmarketintel.com

# Frontend URL
CLIENT_URL=http://localhost:5173
```

**Important**: Never commit `.env` files. `.env` is already in `.gitignore`.

Seed the initial data:

```bash
npm run seed
```

This seeds 56 market data records. To add additional market data (Basmati Rice, etc.):

```bash
node seedAdditionalMarketData.js
```

Start the backend:

```bash
npm run dev          # Development (with hot-reload via nodemon)
# or
npm start            # Production
```

Backend runs at: **http://localhost:5000**

### 3. Frontend Setup

```bash
cd ../client
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

## Project Structure

```text
rural-market-intelligence/
├── client/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components (Dashboard, Login, etc.)
│   │   ├── context/        # React context (Auth, Notifications)
│   │   ├── services/       # API client
│   │   └── App.jsx
│   └── package.json
├── server/
│   ├── models/             # MongoDB schemas
│   ├── controllers/        # Request handlers
│   ├── routes/             # API routes
│   ├── middleware/         # Auth, error handling
│   ├── services/           # Business logic
│   ├── config/             # Distance matrix, transport rate
│   ├── seed.js             # Initial data seeding
│   ├── seedAdditionalMarketData.js
│   ├── server.js           # Express app entry
│   └── package.json
├── .gitignore              # Git ignore rules
└── README.md
```

## Demo Accounts

The initial seed creates demo users. Passwords: `password123`

| Role | Email |
|------|-------|
| Farmer | farmer1@example.com |
| Farmer | farmer2@example.com |
| Farmer | farmer3@example.com |
| Buyer | buyer1@example.com |
| Buyer | buyer2@example.com |
| Vendor | vendor1@example.com |

## User Roles & Permissions

### FARMER
- Create product listings
- Browse marketplace
- Send purchase requests to buyers/vendors
- Receive purchase requests from buyers/vendors
- **Special Feature**: "Where Should I Sell?" - Compare markets and calculate net returns
- View notifications
- Manage own listings and requests

### BUYER
- Browse marketplace
- Send purchase requests to farmers/vendors
- Receive notifications
- Cannot create listings or sell

### VENDOR
- Create product listings
- Browse marketplace
- Send and receive purchase requests
- Can buy from farmers
- View notifications
- Manage own listings and requests

### ADMIN
- Full platform access
- Create/edit/delete market data
- View all users and their details
- View platform statistics
- Manage user roles (via password reset utilities)

## Features

### 1. Authentication & Authorization

- Register with role selection (Farmer, Buyer, Vendor, Admin)
- Login with JWT-based authentication
- Password hashing with bcrypt
- Protected routes by role
- Password reset functionality

### 2. Market Intelligence

- **Historical Market Data**: 112 seeded records across 4 locations (Udupi, Kundapura, Mangalore, Karkala)
- **Product Analytics**: Price trends, demand levels by product
- **Dashboard Summary**: Quick overview of market status and key metrics
- **Products Supported**: Rice, Basmati Rice, Tomato, Onion, Potato, Banana, Pulses, Coconut

### 3. Where Should I Sell? (Farmer Feature)

A decision-support tool to help farmers find the best market for their produce.

**How it works**:
1. Farmer selects from their **own active product listings**
2. Unit is auto-populated from the listing
3. Farmer enters quantity to sell and confirms their location
4. System retrieves market prices for that product from all locations
5. For each market, the system calculates:
   - **Gross Value** = Market Price × Quantity
   - **Distance** = Distance from seller's location (from distance matrix)
   - **Transportation Cost** = Distance × ₹15/km
   - **Net Return** = Gross Value − Transportation Cost
6. Results display all markets sorted by net return (highest first)
7. **Recommended Market** is highlighted (highest net return)

**Markets Covered**: Udupi, Kundapura, Mangalore, Karkala (where data available)

**Basmati Rice**: Has market price data across all 4 locations with historical daily records

**Notes**:
- All calculations are deterministic and backend-driven
- Prices and distances are seeded demo data, not live market feeds
- Transportation cost uses a configured rate of ₹15/km
- Comparison is read-only (no orders placed directly from comparison)

### 4. Marketplace

- **Create Listings**: Farmers and Vendors can list products with price, quantity, unit, location, and availability dates
- **Browse Marketplace**: All users can view all active listings with seller information
- **Search/Filter**: Filter by product, location, category, price range
- **Purchase Requests**: Send offers to buy products from other sellers
- **Request Workflow**: Accept/Reject/Cancel with status tracking
- **Quantity Management**: Automatically marks listing as SOLD when quantity reaches zero
- **My Listings**: Farmers/Vendors can view and manage their own listings
- **My Requests**: Track purchase requests sent and received

### 5. Notifications

- **Purchase Request Alerts**: Notifications when purchase requests are sent/received
- **Status Updates**: Order status changes (accepted, rejected, completed)
- **Unread Count**: Badge shows unread notifications
- **Mark as Read**: Mark individual or all notifications as read
- **Notification Page**: View full notification history with pagination
- **Role Isolation**: Users only see their own notifications

### 6. Admin Dashboard

- **User Management**: View all users with role and location info
- **Platform Statistics**: Total users, listings, market data records
- **Market Data Admin**: Create/edit/delete market data records (ADMIN only)
- **Protected Routes**: Admin routes require authentication and ADMIN role

### 7. AI Insights (Optional - Requires Gemini API Key)

If `GEMINI_API_KEY` is configured:

- **Ask Market Questions**: `/api/ai/ask` - Ask any question about the market or marketplace
- **Selling Advice**: `/api/ai/sell-advice` - Get recommendations on what/when/where to sell
- **Stock Recommendations**: `/api/ai/stock-advice` - Get suggestions on what to stock
- **Graceful Fallback**: If Gemini is not configured, endpoints return useful data without AI text

Market and marketplace data is passed to Gemini for context-aware responses.

## API Routes

All API requests use JSON and should include `Content-Type: application/json` header for POST/PUT requests.

### Authentication

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth/register` | No | Register new user with role |
| POST | `/api/auth/login` | No | Login and receive JWT token |
| GET | `/api/auth/me` | Yes | Get current user profile |
| PUT | `/api/auth/me` | Yes | Update user profile |
| POST | `/api/auth/forgot-password` | No | Request password reset |
| POST | `/api/auth/reset-password` | No | Reset password with token |

### Market Data

| Method | Endpoint | Auth | Role | Purpose |
|--------|----------|------|------|---------|
| GET | `/api/market-data` | No | - | Get all market data with optional filters |
| GET | `/api/market-data/:id` | No | - | Get specific market data record |
| POST | `/api/market-data` | Yes | ADMIN | Create new market data record |
| PUT | `/api/market-data/:id` | Yes | ADMIN | Update market data record |
| DELETE | `/api/market-data/:id` | Yes | ADMIN | Delete market data record |

### Analytics

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/analytics/summary` | Optional | Dashboard summary with stats |
| GET | `/api/analytics/products` | No | Get list of all distinct products |
| GET | `/api/analytics/product/:product` | No | Get analytics for specific product |

### Market Comparison (Where Should I Sell?)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/market-comparison/compare` | No | Compare markets for a product |

**Request body**:
```json
{
  "product": "Basmati Rice",
  "quantity": 2000,
  "unit": "kg",
  "location": "Udupi"
}
```

**Response** (on success):
```json
{
  "success": true,
  "input": { "product", "quantity", "unit", "sellerLocation" },
  "comparisonData": [
    {
      "marketLocation": "Mangalore",
      "marketPrice": 73,
      "distance": 110,
      "transportationCost": 1650,
      "grossValue": 146000,
      "netReturn": 144350,
      "isRecommended": true
    }
  ],
  "recommendedMarket": {
    "location": "Mangalore",
    "netReturn": 144350,
    "reasoning": "This market provides the highest estimated net return of ₹144350"
  },
  "disclaimer": "Based on recorded platform data..."
}
```

### Product Listings

| Method | Endpoint | Auth | Role | Purpose |
|--------|----------|------|------|---------|
| GET | `/api/listings` | No | - | Get all active listings (browsable marketplace) |
| GET | `/api/listings/mine` | Yes | Farmer/Vendor | Get your own listings |
| GET | `/api/listings/:id` | No | - | Get specific listing details |
| POST | `/api/listings` | Yes | Farmer/Vendor | Create new product listing |
| PUT | `/api/listings/:id` | Yes | Owner | Update your listing |
| DELETE | `/api/listings/:id` | Yes | Owner | Cancel your listing |

### Purchase Requests

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/purchase-requests` | Yes | Send purchase request to a seller |
| GET | `/api/purchase-requests/my` | Yes | Get your sent purchase requests |
| GET | `/api/purchase-requests/selling` | Yes | Get purchase requests from buyers |
| PUT | `/api/purchase-requests/:id/status` | Yes | Accept/Reject/Complete request |

### Notifications

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/notifications` | Yes | Get user's notifications (paginated) |
| GET | `/api/notifications/unread-count` | Yes | Get count of unread notifications |
| PUT | `/api/notifications/:id/read` | Yes | Mark single notification as read |
| PATCH | `/api/notifications/read-all` | Yes | Mark all notifications as read |

### AI (Optional)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/ai/ask` | Optional | Ask market/marketplace questions |
| POST | `/api/ai/sell-advice` | Yes | Get personalized selling advice |
| POST | `/api/ai/stock-advice` | Yes | Get stocking recommendations |

Returns graceful error if Gemini is not configured.

### Admin

| Method | Endpoint | Auth | Role | Purpose |
|--------|----------|------|------|---------|
| GET | `/api/admin/users` | Yes | ADMIN | Get all users |
| GET | `/api/admin/users/:userId` | Yes | ADMIN | Get specific user details |
| GET | `/api/admin/stats` | Yes | ADMIN | Get platform statistics |

## Demo Workflow

### Farmer: Market Comparison & Selling

1. Register as **Farmer** with email `farmer1@example.com` and password `password123`
2. Create a product listing (e.g., "Basmati Rice", 2000 kg, ₹100/kg, available now)
3. Go to **Where Should I Sell?** feature
4. System auto-loads your "Basmati Rice" listing with unit "kg" pre-filled
5. Enter quantity: 2000 kg
6. Confirm your location: Udupi
7. Click **Compare Markets**
8. See comparison across Mangalore, Kundapura, Karkala with:
   - Market prices
   - Distance from Udupi
   - Transportation costs (distance × ₹15/km)
   - Gross value (price × quantity)
   - **Net return** (gross value - transport cost)
9. Recommendation: Sell at **Mangalore** for highest net return of ₹144,350

### Buyer: Purchase Request Workflow

1. Register as **Buyer**
2. Browse **Marketplace**
3. Find a product listing (e.g., Farmer's Basmati Rice)
4. Click **Send Purchase Request**
5. Offer quantity, negotiated price
6. Seller receives notification
7. Seller accepts/rejects via **My Requests**
8. On acceptance, buyer receives confirmation notification

### Vendor: Multi-role Usage

1. Register as **Vendor**
2. Create listings (both buying and selling)
3. Send/receive purchase requests
4. Use marketplace like a Farmer or Buyer

### Admin: Dashboard & Data Management

1. Register as **Admin** (or use `createAdminUser.js` utility)
2. Access **Admin Dashboard**
3. View all users with roles and locations
4. View platform statistics (total listings, requests, market data records)
5. Create/edit/delete market data (protected routes)

## Security Notes

- **Passwords**: Hashed with bcrypt (10 rounds), never returned by API
- **Authentication**: JWT-based. Token stored in localStorage on client
- **Protected Routes**: Backend validates JWT and user role for every request
- **Sensitive Data**: API keys (`GEMINI_API_KEY`, email passwords) stay on server only
- **Environment Variables**: `.env` is in `.gitignore` and never committed
- **Role-Based Access Control**: Admin endpoints, marketplace creation, and data modification are role-protected

## Environment Variables Reference

| Variable | Required | Purpose |
|----------|----------|---------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `PORT` | Yes | Express server port |
| `JWT_SECRET` | Yes | Secret for JWT signing (must be long and random) |
| `GEMINI_API_KEY` | No | Google Gemini API key for AI features |
| `GEMINI_MODEL` | No | Gemini model name (default: `gemini-1.5-flash`) |
| `EMAIL_HOST` | No | SMTP server for email notifications |
| `EMAIL_PORT` | No | SMTP port |
| `EMAIL_SECURE` | No | Use TLS (true/false) |
| `EMAIL_USER` | No | Email account for sending |
| `EMAIL_PASSWORD` | No | Email account password (app-specific for Gmail) |
| `EMAIL_FROM` | No | From address for emails |
| `CLIENT_URL` | No | Frontend URL for links in emails |

**Important**: Never put real secrets in your code. Use environment variables. `.env` files are Git-ignored.

## Intentionally Not Included

- Real-time chat or messaging
- Online payments/wallet integration
- Live market price feeds (using seeded historical data instead)
- Google Maps / live routing (using configured distance matrix)
- Docker/containerization
- CI/CD pipelines
- Microservices architecture
- Mobile app

## Known Limitations

- Market data is seeded demo data, not live feeds
- Distance matrix is manually configured, not calculated from coordinates
- Transportation rate is fixed at ₹15/km
- No image uploads for listings
- No email notifications (email setup is optional)
- Gemini AI is optional and gracefully degraded if not configured
