# Rural Market Intelligence Platform

An AI-powered rural agricultural market platform where farmers, buyers, and vendors can register, buy and sell agricultural products, while using market analytics and Gemini AI to make better decisions.

## Architecture

```text
React (Vite)
  ↓
Express REST API
  ├── MongoDB (market data, users, listings, requests)
  └── Gemini AI (backend-only)
```

## Prerequisites

- Node.js
- npm
- MongoDB running locally
- Optional: Google Gemini API key for AI features

## Project Structure

```text
rural-market-intelligence/
├── client/     # React frontend
└── server/     # Express backend
```

## Backend Setup

```shell
cd server
npm install
cp .env.example .env
```

Configure `.env`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/rural_market_intelligence
PORT=5000
JWT_SECRET=change_this_to_a_long_random_secret
GEMINI_API_KEY=your_gemini_api_key_here
```

Optional:

```env
GEMINI_MODEL=gemini-3.6-flash
```

Seed sample users, listings, requests, and market data:

```shell
npm run seed
npm run dev
```

Backend URL: http://localhost:5000

## Frontend Setup

```shell
cd client
npm install
npm run dev
```

Frontend URL: http://localhost:5173

## Demo Accounts

After seeding, all demo passwords are `password123`:

| Role | Email |
|------|-------|
| Farmer | farmer1@example.com |
| Farmer | farmer2@example.com |
| Farmer | farmer3@example.com |
| Buyer | buyer1@example.com |
| Buyer | buyer2@example.com |
| Vendor | vendor1@example.com |

## Features

### Existing market intelligence

- Market data CRUD
- Filters by product/location/category
- Dashboard summary
- Product analytics, price trends, demand levels
- Market insights

### Multi-user marketplace

- Register/login with roles: `FARMER`, `BUYER`, `VENDOR`
- Create and manage product listings
- Browse/search marketplace
- Send purchase requests
- Accept/reject/complete requests
- Role-aware dashboard

### Gemini AI

- Ask market questions through `/api/ai/ask`
- Backend supplies real MongoDB market data and marketplace listings
- Selling advice and stock recommendations
- AI stays unavailable gracefully if `GEMINI_API_KEY` is missing

## API Routes

### Auth

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/api/auth/register` | No |
| POST | `/api/auth/login` | No |
| GET | `/api/auth/me` | Yes |
| PUT | `/api/auth/me` | Yes |

### Market data

| Method | Endpoint |
|--------|----------|
| GET/POST | `/api/market-data` |
| GET/PUT/DELETE | `/api/market-data/:id` |

### Analytics

| Method | Endpoint |
|--------|----------|
| GET | `/api/analytics/summary` |
| GET | `/api/analytics/products` |
| GET | `/api/analytics/product/:product` |

### Listings

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/listings` | No |
| GET | `/api/listings/mine` | Yes |
| GET | `/api/listings/:id` | No |
| POST | `/api/listings` | Yes (farmer/vendor) |
| PUT | `/api/listings/:id` | Yes (owner) |
| DELETE | `/api/listings/:id` | Yes (owner, cancels) |

### Purchase requests

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/api/purchase-requests` | Yes |
| GET | `/api/purchase-requests/my` | Yes |
| GET | `/api/purchase-requests/selling` | Yes |
| PUT | `/api/purchase-requests/:id/status` | Yes |

### AI

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/api/ai/ask` | Optional |
| POST | `/api/ai/sell-advice` | Yes |
| POST | `/api/ai/stock-advice` | Yes |

## Security Notes

- Passwords are hashed with bcrypt
- JWT is used for protected routes
- `passwordHash` is never returned by the API
- `GEMINI_API_KEY` stays on the server only
- `.env` is ignored by Git

## Intentionally Not Included

- Online payments
- Real-time chat
- Docker / cloud deployment
- Microservices
