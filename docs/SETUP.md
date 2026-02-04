# FreshDeals Platform - Complete Setup Guide

> **Production-Ready Affiliate Deal Aggregation PWA**

## 📋 Project Overview

FreshDeals is a progressive web application that aggregates today's best deals and offers from multiple affiliate platforms with affiliate-safe, monetization-focused best practices.

### Core Features (Phase-1)

**User Features:**
- ✅ Today's Deals discovery page
- ✅ Category-based deal browsing
- ✅ Product detail page with price comparison
- ✅ Multi-language support (English + Telugu)
- ✅ PWA installation prompt
- ✅ Push notifications opt-in
- ✅ Affiliate link tracking

**Admin Features:**
- ✅ Product management
- ✅ Deal management
- ✅ Coupon management
- ✅ Platform price management
- ✅ Affiliate settings configuration
- ✅ Push notification management

---

## 🔧 Tech Stack (LOCKED)

### Frontend
- **Vue 3** - Progressive JavaScript framework
- **Vuetify** - Material Design component library
- **Vite** - Next-gen build tool
- **Vue Router** - Client-side routing
- **Vue I18n** - Internationalization (English + Telugu)
- **Pinia** - State management
- **PWA** - Progressive Web App support
- **Capacitor** - Mobile app wrapper (Android-ready)

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Minimal web framework
- **Firebase** - Backend services
  - Firestore - NoSQL database
  - Firebase Auth - Authentication
  - Firebase Cloud Messaging (FCM) - Push notifications
  - Firebase Hosting - Deployment
- **Node-cron** - Scheduled jobs
- **REST APIs** - Stateless communication

---

## 📁 Project Structure

```
freshdeals/
├── backend/
│   ├── src/
│   │   ├── index.js                 # Express app entry point
│   │   ├── config/
│   │   │   ├── firebase.js          # Firebase initialization
│   │   │   └── constants.js         # App constants
│   │   ├── models/
│   │   │   ├── Product.js           # Product model
│   │   │   ├── Deal.js              # Deal model
│   │   │   ├── PlatformPrice.js     # Price tracking
│   │   │   ├── Coupon.js            # Coupon model
│   │   │   └── AffiliateSettings.js # Affiliate config
│   │   ├── controllers/
│   │   │   ├── dealsController.js   # User API handlers
│   │   │   └── adminController.js   # Admin API handlers
│   │   ├── routes/
│   │   │   ├── deals.js             # Public deals routes
│   │   │   └── admin.js             # Admin routes
│   │   ├── services/
│   │   │   ├── pushNotificationService.js
│   │   │   └── affiliateService.js
│   │   ├── middleware/
│   │   │   ├── auth.js              # Authentication
│   │   │   └── errorHandler.js      # Error handling
│   │   └── jobs/
│   │       ├── priceCacheJob.js     # Price history
│   │       └── dealSyncJob.js       # Deal expiry sync
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.vue
│   │   ├── main.js                  # Vue app entry
│   │   ├── router/
│   │   │   └── index.js             # Route definitions
│   │   ├── stores/
│   │   │   ├── dealsStore.js        # Deals state
│   │   │   └── i18nStore.js         # Language state
│   │   ├── services/
│   │   │   ├── adminService.js      # Admin API client
│   │   │   └── notificationService.js
│   │   ├── components/
│   │   │   ├── Header.vue
│   │   │   ├── Footer.vue
│   │   │   ├── DealCard.vue
│   │   │   ├── PWAInstallPrompt.vue
│   │   │   └── admin/
│   │   │       ├── AdminProductPanel.vue
│   │   │       ├── AdminDealPanel.vue
│   │   │       ├── AdminCouponPanel.vue
│   │   │       └── AdminSettingsPanel.vue
│   │   ├── pages/
│   │   │   ├── TodayDealsPage.vue
│   │   │   ├── CategoryDealsPage.vue
│   │   │   ├── ProductDetailPage.vue
│   │   │   ├── AdminDashboard.vue
│   │   │   └── NotFoundPage.vue
│   │   ├── i18n/
│   │   │   ├── index.js
│   │   │   └── locales/
│   │   │       ├── en.json
│   │   │       └── te.json
│   │   ├── plugins/
│   │   │   └── vuetify.js
│   │   └── utils/
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json            # PWA manifest
│   │   └── service-worker.js        # Service worker
│   ├── vite.config.js
│   ├── tsconfig.json
│   └── package.json
│
└── docs/
    └── SETUP.md (this file)
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v16+ (LTS recommended)
- **npm** or **yarn** package manager
- **Firebase Project** (Free tier works for MVP)
- **Git** for version control

### 1️⃣ Firebase Setup

#### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (e.g., "FreshDeals")
3. Enable the following services:
   - Firestore Database (Start in test mode for development)
   - Authentication (Email/Password + Anonymous)
   - Cloud Messaging (FCM)
   - Cloud Functions (optional, for serverless jobs)

#### Get Service Account Credentials

1. Go to **Project Settings** → **Service Accounts**
2. Click **Generate New Private Key**
3. Save the JSON file securely
4. Extract these values for `.env`:
   ```
   FIREBASE_PROJECT_ID=<project_id>
   FIREBASE_PRIVATE_KEY=<private_key>
   FIREBASE_CLIENT_EMAIL=<client_email>
   FIREBASE_DATABASE_URL=<database_url>
   ```

### 2️⃣ Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Fill in Firebase credentials and settings
# Edit .env with your values

# Start development server
npm run dev

# Or start production
npm start
```

**Backend runs on:** `http://localhost:5000`

**Health check:** `GET http://localhost:5000/health`

### 3️⃣ Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000" > .env.local
echo "VITE_ADMIN_SECRET=your_admin_secret_key" >> .env.local

# Start development server
npm run dev

# Or build for production
npm run build
```

**Frontend runs on:** `http://localhost:3000`

---

## 🔌 API Documentation

### Public Endpoints (No Auth Required)

#### Get Today's Deals
```
GET /api/deals/today?limit=20
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Deal Title",
      "dealPrice": 999,
      "originalPrice": 1499,
      "discount": 33,
      "platform": "amazon",
      "affiliateLink": "https://...",
      "clicks": 0,
      "expiryDate": "2024-02-15T00:00:00Z"
    }
  ]
}
```

#### Get Deals by Category
```
GET /api/deals/category?category=electronics&limit=20
```

#### Get Product with Price Comparison
```
GET /api/deals/product/:productId/comparison
```

Response:
```json
{
  "success": true,
  "data": {
    "product": { /* product details */ },
    "prices": [
      { "platform": "amazon", "price": 999, "inStock": true },
      { "platform": "flipkart", "price": 1049, "inStock": true }
    ],
    "deals": [ /* array of deals */ ],
    "lowestPrice": 999
  }
}
```

#### Track Deal Click
```
POST /api/deals/:dealId/track-click
```

### Admin Endpoints (Requires Secret Key)

**Authentication:** All admin endpoints require `X-Admin-Secret` header

#### Create Product
```
POST /api/admin/products
X-Admin-Secret: your_admin_secret_key

{
  "name": "Product Name",
  "description": "Description",
  "imageUrl": "https://...",
  "category": "electronics",
  "tags": ["tag1", "tag2"],
  "isVisible": true
}
```

#### Create Deal
```
POST /api/admin/deals
X-Admin-Secret: your_admin_secret_key

{
  "productId": "uuid",
  "title": "Amazing Deal",
  "description": "Limited time offer",
  "discount": 33,
  "originalPrice": 1499,
  "dealPrice": 999,
  "platform": "amazon",
  "affiliateLink": "https://...",
  "expiryDate": "2024-02-15T23:59:59Z"
}
```

#### Create Coupon
```
POST /api/admin/coupons
X-Admin-Secret: your_admin_secret_key

{
  "code": "SAVE20",
  "description": "Save 20% on electronics",
  "discount": 20,
  "discountType": "percentage",
  "applicablePlatforms": ["amazon", "flipkart"],
  "expiryDate": "2024-03-01T23:59:59Z"
}
```

#### Update Affiliate Settings
```
PUT /api/admin/affiliate-settings
X-Admin-Secret: your_admin_secret_key

{
  "platform": "amazon",
  "settings": {
    "isEnabled": true,
    "associateTag": "your-associate-tag-20",
    "accessKey": "your-access-key",
    "secretKey": "your-secret-key"
  }
}
```

---

## 🌐 Internationalization (i18n)

### Supported Languages

- **English** (en) - Default
- **Telugu** (te) - Regional language

### Translation Files

Located in `frontend/src/i18n/locales/`:
- `en.json` - English translations
- `te.json` - Telugu translations

### Adding Translations

1. Add key-value pairs to both `en.json` and `te.json`
2. Use in Vue components with `{{ $t('key') }}`

Example:
```vue
<template>
  <h1>{{ $t('home.title') }}</h1>
</template>
```

### Language Switching

```vue
<script setup>
import { useI18nStore } from '@/stores/i18nStore'

const i18nStore = useI18nStore()

const changeLanguage = (lang) => {
  i18nStore.setLocale(lang) // 'en' or 'te'
}
</script>
```

---

## 📱 PWA Features

### Installation

Users can install FreshDeals on their devices:
- **Desktop:** Chrome/Edge → "Install app" button
- **Mobile:** Browser menu → "Install app" option
- **Android:** Using Capacitor (coming soon)

### Service Worker

- Offline support with caching strategy
- Network-first for API calls, cache-first for assets
- Push notification handling
- Background sync (future)

### Manifest

Located in `frontend/public/manifest.json`:
- App name, icons, colors
- Shortcuts to key pages
- Install prompts

### Push Notifications

1. User allows notifications in browser
2. Browser sends FCM token to backend
3. Backend stores token in Firestore
4. Admin sends notifications via Firebase Cloud Messaging
5. Service Worker displays notifications to user

---

## 🏷️ Affiliate Integration

### Supported Platforms

#### 1. **Amazon**
- **Type:** PA API v5 (Product Advertising API)
- **Setup:**
  - Create Amazon Associate account
  - Get Associate Tag (e.g., `yourname-20`)
  - Generate PA API credentials
  - Store in affiliate settings

- **Link Format:**
  ```
  https://www.amazon.in/dp/{ASIN}?tag={ASSOCIATE_TAG}
  ```

#### 2. **Flipkart**
- **Type:** Affiliate Deep Linking
- **Setup:**
  - Register at Flipkart Affiliate Program
  - Get Affiliate ID
  - Use deep links with tracking

- **Link Format:**
  ```
  https://flipkart.raffs.raffsaffiliates.com/c/{PRODUCT_ID}
  ```

#### 3. **Cuelinks**
- **Type:** URL-based Deep Linking (CPA Network)
- **Setup:**
  - Register at Cuelinks
  - Get API key
  - Generate tracking links

#### 4. **vCommission**
- **Type:** Affiliate Network (CPA/CPL)
- **Setup:** Similar to Cuelinks
- **Status:** Optional in Phase-1

### Affiliate Compliance Rules

✅ **ALLOWED:**
- Neutral price comparison tables
- Platform-wise "View Deal" buttons
- Affiliate link tracking for analytics
- Admin-controlled content
- SEO-friendly pages

❌ **NOT ALLOWED:**
- HTML scraping (violates Terms of Service)
- Price manipulation or fake discounts
- Misleading claims ("Best deal" / "Cheapest price")
- Auto-clicking or fraud
- Undisclosed affiliate links

---

## 💾 Database Schema (Firestore)

### Collections

#### `products`
```json
{
  "id": "uuid",
  "name": "iPhone 15 Pro",
  "description": "256GB, Black",
  "imageUrl": "https://...",
  "category": "electronics",
  "tags": ["phone", "premium"],
  "isVisible": true,
  "createdAt": "2024-02-01T10:00:00Z",
  "updatedAt": "2024-02-01T10:00:00Z",
  "platformPrices": { "subcollection": "..." }
}
```

#### `deals`
```json
{
  "id": "uuid",
  "productId": "uuid",
  "title": "iPhone 15 Pro at Best Price",
  "description": "Limited time offer",
  "discount": 15,
  "originalPrice": 99999,
  "dealPrice": 84999,
  "platform": "amazon",
  "affiliateLink": "https://amazon.in/...",
  "expiryDate": "2024-02-15T23:59:59Z",
  "status": "active",
  "isVisible": true,
  "clicks": 125,
  "createdAt": "2024-02-01T10:00:00Z",
  "updatedAt": "2024-02-01T10:00:00Z"
}
```

#### `coupons`
```json
{
  "id": "uuid",
  "code": "SAVE20",
  "description": "Save 20% on electronics",
  "discount": 20,
  "discountType": "percentage",
  "applicablePlatforms": ["amazon", "flipkart"],
  "expiryDate": "2024-03-01T23:59:59Z",
  "maxUses": 100,
  "currentUses": 45,
  "isActive": true,
  "createdAt": "2024-02-01T10:00:00Z",
  "updatedAt": "2024-02-01T10:00:00Z"
}
```

#### `settings`
```json
{
  "affiliate": {
    "amazon": {
      "isEnabled": true,
      "associateTag": "yourname-20",
      "accessKey": "...",
      "secretKey": "...",
      "updatedAt": "2024-02-01T10:00:00Z"
    },
    "flipkart": { /* ... */ }
  }
}
```

#### `price_history`
```json
{
  "productId": "uuid",
  "platform": "amazon",
  "price": 84999,
  "timestamp": "2024-02-01T10:00:00Z"
}
```

#### `users`
```json
{
  "uid": "firebase-uid",
  "email": "user@example.com",
  "language": "en",
  "notificationsEnabled": true,
  "fcmToken": "token...",
  "createdAt": "2024-02-01T10:00:00Z"
}
```

---

## 🔐 Security & Authentication

### Admin Authentication

**Method:** Secret Key Header

```javascript
// All admin requests
headers: {
  'X-Admin-Secret': process.env.ADMIN_SECRET_KEY,
}
```

**For Production:** Upgrade to Firebase Auth with custom claims

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read access
    match /products/{document=**} {
      allow read: if true;
    }
    
    match /deals/{document=**} {
      allow read: if true;
    }
    
    // Admin write access only
    match /admin/{document=**} {
      allow write: if request.auth.token.admin == true;
    }
  }
}
```

---

## 📊 Monitoring & Analytics

### Tracked Metrics

- Deal clicks by product, platform, date
- User engagement (page views, session duration)
- Conversion funnel (views → clicks → conversions)
- Top performing categories and deals
- Notification CTR (click-through rate)

### Implementation

All analytics are stored in Firestore for Firebase Analytics integration.

---

## 📦 Deployment

### Backend Deployment

#### Option 1: Firebase Cloud Run
```bash
# Deploy backend to Cloud Run
firebase deploy --only functions
```

#### Option 2: Heroku/Render/Railway
```bash
# Prepare production build
npm run build

# Deploy to your platform
git push heroku main
```

#### Option 3: Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "src/index.js"]
```

### Frontend Deployment

#### Firebase Hosting
```bash
# Build frontend
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

#### Alternative: Vercel
```bash
# Deploy to Vercel (automatic from Git)
vercel deploy
```

---

## 🛠️ Environment Variables

### Backend (.env)

```env
# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-@iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com

# Server
PORT=5000
NODE_ENV=development

# Affiliate Platforms
AMAZON_ASSOCIATE_TAG=yourname-20
AMAZON_ACCESS_KEY=your-access-key
AMAZON_SECRET_KEY=your-secret-key
FLIPKART_AFFILIATE_ID=your-affiliate-id
FLIPKART_API_TOKEN=your-api-token
CUELINKS_API_KEY=your-api-key

# Admin
ADMIN_SECRET_KEY=your-super-secret-admin-key

# Cron Jobs
ENABLE_PRICE_CACHE_JOB=true
PRICE_CACHE_INTERVAL=0 0 * * *
ENABLE_DEAL_SYNC_JOB=true
DEAL_SYNC_INTERVAL=0 */6 * * *
```

### Frontend (.env.local)

```env
VITE_API_URL=https://api.freshdeals.com
VITE_ADMIN_SECRET=your-admin-secret-key
```

---

## 🐛 Troubleshooting

### Backend Issues

**Problem:** Firebase connection error
```
Error: FIREBASE_PRIVATE_KEY is not set
```

**Solution:**
- Check `.env` file has all required variables
- Ensure private key has correct line breaks (`\n`)

**Problem:** Port already in use
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### Frontend Issues

**Problem:** CORS errors
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
- Ensure backend CORS is enabled
- Check `proxy` in `vite.config.js`

**Problem:** Service Worker not updating

**Solution:**
- Clear browser cache: Ctrl+Shift+Delete
- Hard refresh: Ctrl+Shift+R

---

## 📝 Best Practices

### Code Organization
- Keep models and controllers separated
- Use consistent naming conventions
- Document public functions with JSDoc

### Database
- Index frequently queried fields
- Use subcollections for related data
- Archive old data periodically

### Performance
- Implement pagination for lists
- Cache API responses in frontend
- Use Service Worker for offline support

### Security
- Rotate admin secret keys regularly
- Never commit `.env` files
- Use HTTPS in production
- Validate all inputs on backend

---

## 📚 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Vue 3 Guide](https://vuejs.org/guide/introduction.html)
- [Vuetify Documentation](https://vuetifyjs.com/)
- [Express.js Guide](https://expressjs.com/)
- [PWA Best Practices](https://web.dev/progressive-web-apps/)

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review code comments
3. Check Firebase console for errors
4. Review browser console (frontend) or server logs (backend)

---

## 🎯 Next Phase Features

- Firebase Authentication (OAuth)
- User wishlists and saved deals
- Advanced filtering and sorting
- Deal notifications by category
- Mobile app (Capacitor)
- Analytics dashboard
- A/B testing framework
- Social sharing integration
- User reviews and ratings

---

**Last Updated:** February 1, 2024
**Version:** 1.0.0 (Phase-1)
