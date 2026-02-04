# 🎯 FreshDeals - Visual Architecture Guide

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER LAYER (Browser)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         FreshDeals PWA (Vue 3 + Vuetify)                │   │
│  │  ┌─────────────┬──────────────┬──────────────┐           │   │
│  │  │  Home Page  │ Categories   │ Admin Panel  │           │   │
│  │  └─────────────┴──────────────┴──────────────┘           │   │
│  │  Service Worker (Offline, Caching, Notifications)        │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────┬──────────────────────────────────────────────────┬─────┘
         │ HTTP/REST API                                  │
         │                                                │
┌────────▼────────────────────────────────────────────────▼─────┐
│               API LAYER (Backend Server)                      │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  Express.js Server (Node.js)                         │    │
│  │  ┌─────────────┬──────────────┬──────────────┐       │    │
│  │  │ Public APIs │ Admin APIs   │ Health Check │       │    │
│  │  │ (Deals)     │ (CRUD Ops)   │ (Monitoring) │       │    │
│  │  └─────────────┴──────────────┴──────────────┘       │    │
│  │  Middleware: Auth, Error Handler, CORS               │    │
│  │  Services: FCM, Affiliate Links, Analytics            │    │
│  │  Cron Jobs: Price Cache, Deal Sync                    │    │
│  └──────────────────────────────────────────────────────┘    │
└────────┬──────────────────────────────────────────────────────┘
         │ Firestore SDK                                       
         │                                                     
┌────────▼──────────────────────────────────────────────────────┐
│        FIREBASE BACKEND (Google Cloud)                        │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  Firestore Database                                  │    │
│  │  ├─ Products Collection                              │    │
│  │  ├─ Deals Collection                                 │    │
│  │  ├─ Coupons Collection                               │    │
│  │  ├─ Settings Collection                              │    │
│  │  └─ Price History Collection                         │    │
│  │                                                       │    │
│  │  Firebase Auth (OAuth, Email/Password)               │    │
│  │  Firebase Cloud Messaging (Push Notifications)       │    │
│  │  Cloud Functions (Optional - Scheduled tasks)        │    │
│  │  Firebase Hosting (Production Frontend)              │    │
│  └──────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────────┘
```

---

## 📱 Data Flow

### User Views Today's Deals

```
┌─────────┐
│ Browser │
└────┬────┘
     │ GET /api/deals/today
     │
     ▼
┌──────────────────┐
│ Express Backend  │
└────┬─────────────┘
     │ Query Firestore
     │
     ▼
┌──────────────────┐
│    Firestore     │
│  (deals table)   │
└────┬─────────────┘
     │ Return deals
     │
     ▼
┌──────────────────┐
│ Express Backend  │
│ (format JSON)    │
└────┬─────────────┘
     │ [200] deals array
     │
     ▼
┌─────────┐
│ Browser │
│ Render  │
└─────────┘
```

### Admin Creates Deal

```
┌─────────────────────┐
│ Admin Panel (Vue)   │
│ Fill deal form      │
└────┬────────────────┘
     │ POST /api/admin/deals
     │ Header: X-Admin-Secret
     │
     ▼
┌──────────────────┐
│ Express Backend  │
│ Verify Secret Key│
└────┬─────────────┘
     │ Valid ✓
     │
     ▼
┌──────────────────┐
│ Admin Controller │
│ Validate input   │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│   Firestore      │
│  Create deal     │
└────┬─────────────┘
     │ Success
     │
     ▼
┌──────────────────┐
│ Express Backend  │
│ Return deal ID   │
└────┬─────────────┘
     │ [201] Created
     │
     ▼
┌─────────────────┐
│ Admin Panel     │
│ Show success    │
└─────────────────┘
```

---

## 🗂️ File Organization

### Frontend Structure

```
src/
├── pages/               ← Route pages (5)
│  ├── TodayDealsPage.vue
│  ├── CategoryDealsPage.vue
│  ├── ProductDetailPage.vue
│  ├── AdminDashboard.vue
│  └── NotFoundPage.vue
│
├── components/          ← Reusable components
│  ├── Header.vue        ← Navigation & language
│  ├── Footer.vue        ← Footer links
│  ├── DealCard.vue      ← Deal display
│  ├── PWAInstallPrompt.vue
│  └── admin/             ← Admin sub-components
│     ├── AdminProductPanel.vue
│     ├── AdminDealPanel.vue
│     ├── AdminCouponPanel.vue
│     └── AdminSettingsPanel.vue
│
├── stores/              ← State management
│  ├── dealsStore.js     ← Deals state & API calls
│  └── i18nStore.js      ← Language state
│
├── services/            ← API clients
│  ├── adminService.js   ← Admin API
│  └── notificationService.js
│
├── i18n/                ← Translations
│  ├── index.js
│  └── locales/
│     ├── en.json        ← English (100+ strings)
│     └── te.json        ← Telugu (100+ strings)
│
├── plugins/             ← Vue plugins
│  └── vuetify.js        ← Material Design config
│
├── router/              ← Routing
│  └── index.js          ← Routes (5 pages)
│
├── App.vue              ← Root component
├── main.js              ← App entry
└── main.css             ← Global styles
```

### Backend Structure

```
src/
├── index.js             ← Server entry point
│
├── config/              ← Configuration
│  ├── firebase.js       ← Firebase init
│  └── constants.js      ← App constants
│
├── models/              ← Firestore models (5)
│  ├── Product.js        ← Products CRUD
│  ├── Deal.js           ← Deals CRUD
│  ├── PlatformPrice.js  ← Price tracking
│  ├── Coupon.js         ← Coupon CRUD
│  └── AffiliateSettings.js
│
├── controllers/         ← Business logic
│  ├── dealsController.js ← Public endpoints
│  └── adminController.js ← Admin endpoints
│
├── routes/              ← API routes
│  ├── deals.js          ← Public routes (5 endpoints)
│  └── admin.js          ← Admin routes (6 endpoints)
│
├── services/            ← External services
│  ├── pushNotificationService.js ← FCM
│  └── affiliateService.js       ← Affiliate links
│
├── middleware/          ← Express middleware
│  ├── auth.js           ← Admin auth
│  └── errorHandler.js   ← Error handling
│
└── jobs/                ← Scheduled tasks
   ├── priceCacheJob.js  ← Price history (24h)
   └── dealSyncJob.js    ← Deal expiry sync (6h)
```

---

## 🔄 Component Flow

### Homepage (TodayDealsPage.vue)

```
┌─────────────────────────────────────────┐
│      TodayDealsPage.vue                 │
│  ├─ Header.vue                          │
│  │  ├─ Language Selector                │
│  │  ├─ Notification Toggle              │
│  │  └─ Admin Link                       │
│  ├─ Main Content                        │
│  │  ├─ useDealsStore (Pinia)            │
│  │  ├─ fetchTodayDeals()                │
│  │  └─ v-for: DealCard x N              │
│  │     ├─ DealCard.vue                  │
│  │     │  ├─ Affiliate Link             │
│  │     │  ├─ Price Info                 │
│  │     │  └─ Track Click                │
│  │     └─ DealCard.vue (repeat)         │
│  └─ Footer.vue                          │
└─────────────────────────────────────────┘
```

### Admin Panel (AdminDashboard.vue)

```
┌──────────────────────────────────────────────┐
│         AdminDashboard.vue                   │
│  ├─ Tabs                                     │
│  │  ├─ Products Tab                          │
│  │  │  └─ AdminProductPanel.vue              │
│  │  │     ├─ Add Product Button              │
│  │  │     ├─ Product Form Dialog             │
│  │  │     └─ Save/Cancel                     │
│  │  ├─ Deals Tab                             │
│  │  │  └─ AdminDealPanel.vue                 │
│  │  ├─ Coupons Tab                           │
│  │  │  └─ AdminCouponPanel.vue               │
│  │  └─ Settings Tab                          │
│  │     └─ AdminSettingsPanel.vue             │
│  │        ├─ Amazon Settings                 │
│  │        └─ Flipkart Settings               │
│  └─ adminService (API calls)                 │
└──────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

### Firestore Collections

```
firestore/
├── products/
│  ├── productId1/
│  │  ├─ name: "iPhone 15 Pro"
│  │  ├─ category: "electronics"
│  │  ├─ tags: ["phone", "apple"]
│  │  ├─ imageUrl: "https://..."
│  │  ├─ isVisible: true
│  │  └─ platformPrices/ (subcollection)
│  │     ├── amazon/
│  │     │  ├─ price: 84999
│  │     │  ├─ platform: "amazon"
│  │     │  └─ lastUpdated: timestamp
│  │     └── flipkart/
│  │        ├─ price: 85499
│  │        ├─ platform: "flipkart"
│  │        └─ lastUpdated: timestamp
│  └── productId2/
│
├── deals/
│  ├── dealId1/
│  │  ├─ productId: "productId1"
│  │  ├─ title: "iPhone Deal"
│  │  ├─ dealPrice: 84999
│  │  ├─ originalPrice: 99999
│  │  ├─ discount: 15
│  │  ├─ platform: "amazon"
│  │  ├─ affiliateLink: "https://amazon.in/..."
│  │  ├─ expiryDate: timestamp
│  │  ├─ status: "active"
│  │  ├─ clicks: 123
│  │  └─ createdAt: timestamp
│  └── dealId2/
│
├── coupons/
│  ├── couponId1/
│  │  ├─ code: "SAVE20"
│  │  ├─ discount: 20
│  │  ├─ discountType: "percentage"
│  │  ├─ expiryDate: timestamp
│  │  ├─ maxUses: 100
│  │  ├─ currentUses: 45
│  │  └─ isActive: true
│  └── couponId2/
│
├── price_history/
│  ├─ productId: "productId1"
│  ├─ platform: "amazon"
│  ├─ price: 84999
│  ├─ timestamp: "2024-02-01T10:00:00Z"
│  └─ (repeats for each price snapshot)
│
├── settings/
│  └── affiliate/
│     ├─ amazon:
│     │  ├─ isEnabled: true
│     │  ├─ associateTag: "yourname-20"
│     │  └─ (credentials hidden)
│     ├─ flipkart:
│     │  ├─ isEnabled: true
│     │  └─ (credentials hidden)
│     └─ cuelinks:
│        ├─ isEnabled: true
│        └─ (credentials hidden)
│
└── users/ (Phase-2)
   └─ userId1/
      ├─ email: "user@example.com"
      ├─ language: "en"
      ├─ notificationsEnabled: true
      ├─ fcmToken: "token..."
      └─ createdAt: timestamp
```

---

## 🔐 Authentication Flow

### Admin Authentication

```
Client Request
     │
     ▼
┌──────────────────────┐
│ Add Header           │
│ X-Admin-Secret: key  │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Express Backend      │
│ Check middleware     │
└──────┬───────────────┘
       │
       ▼
    ┌──────────────────┐
    │ Key matches      │
    │ env variable?    │
    └──────┬───────────┘
           │
      Yes  │  No
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌────────┐   ┌─────────┐
│ Allow  │   │ Deny    │
│ [200]  │   │ [403]   │
└────────┘   └─────────┘
```

---

## 🔌 API Request/Response

### Example: Create Deal

**Request:**
```
POST /api/admin/deals HTTP/1.1
Host: localhost:5000
X-Admin-Secret: your-secret-key
Content-Type: application/json

{
  "productId": "123e4567...",
  "title": "iPhone 15 Pro Deal",
  "dealPrice": 84999,
  "platform": "amazon",
  "affiliateLink": "https://amazon.in/...",
  "expiryDate": "2024-02-15T23:59:59Z"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "987f6543..."
  }
}
```

**Response (400 - Error):**
```json
{
  "error": "productId, title, platform, and affiliateLink are required"
}
```

---

## 📊 State Management (Pinia)

### dealsStore

```
dealsStore (Pinia)
├─ State
│  ├─ todayDeals: [] ← List of deals
│  ├─ loading: false  ← Loading state
│  └─ error: null     ← Error message
│
└─ Actions
   ├─ fetchTodayDeals() ← GET /api/deals/today
   ├─ getDealsByCategory()
   ├─ getProductComparison()
   ├─ trackDealClick()
   └─ getDealDetails()
```

### i18nStore

```
i18nStore (Pinia)
├─ State
│  └─ locale: "en" ← Current language
│
└─ Actions
   └─ setLocale(lang) ← Switch language
```

---

## 🚀 Deployment Architecture

### Firebase Deployment

```
Development                Production
     │                        │
     ├─ Local Backend     ┌────┴──────────┐
     │  (localhost:5000)  │                │
     │                    ▼                ▼
     │               Cloud Run        Storage
     │            (Backend Server)    (Assets)
     │
     ├─ Local Frontend   
     │  (localhost:3000)
     │
     └─ Firestore        ▼
        (Dev mode)   Firebase Hosting
                     (Frontend)
```

---

## 📈 Performance Optimization

### Caching Strategy

```
Request
   │
   ▼
Service Worker
   │
   ├─ Asset? → Cache First
   │  └─ Check Cache
   │     ├─ Found? → Return cached
   │     └─ Miss?  → Fetch & cache
   │
   └─ API? → Network First
      ├─ Try Network
      │  ├─ Success? → Return & cache
      │  └─ Fail?    → Return cached
      └─ No Network?
         └─ Return cached
```

---

## 🎯 Feature Matrix

| Feature | Frontend | Backend | Database |
|---------|----------|---------|----------|
| Browse Deals | ✅ | ✅ | ✅ |
| Filter by Category | ✅ | ✅ | - |
| Price Comparison | ✅ | ✅ | ✅ |
| Language Toggle | ✅ | - | - |
| PWA Install | ✅ | - | - |
| Push Notifications | ✅ | ✅ | ✅ |
| Admin CRUD | ✅ | ✅ | ✅ |
| Affiliate Links | ✅ | ✅ | ✅ |
| Click Tracking | ✅ | ✅ | ✅ |
| Offline Mode | ✅ | - | - |

---

This visual guide helps understand how all components work together!
