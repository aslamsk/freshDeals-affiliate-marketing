# FreshDeals - Production Ready Architecture

## 🎯 System Overview

**FreshDeals** is a Firebase-first, affiliate deals & price comparison platform with:
- PWA for desktop + mobile (Capacitor)
- Zero traditional backend API calls from frontend
- Cron-based price synchronization
- Push notifications for user engagement
- Read-only frontend → Admin-write backend

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (Vue 3 + PWA)                 │
│  ├─ TodayDealsPage    (Deals listing)                      │
│  ├─ CategoryDealsPage (Category filtering)                 │
│  ├─ ProductDetailPage (Price comparison)                   │
│  └─ AdminDashboard   (Admin CRUD operations)               │
└────────────┬──────────────────────────────────────────────┘
             │
             ├─────────────────────────────────────┐
             │                                      │
             ▼                                      ▼
    ┌──────────────────┐              ┌──────────────────┐
    │  Firebase SDK    │              │ FCM (Cloud       │
    │  - Firestore     │              │  Messaging)      │
    │  - Real-time     │              │                  │
    │  - Auth          │              └──────────────────┘
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────────────────────────────┐
    │        FIRESTORE (Database)              │
    │  ├─ products/                            │
    │  ├─ deals/                               │
    │  ├─ coupons/                             │
    │  ├─ prices/                              │
    │  ├─ priceHistory/                        │
    │  ├─ settings/                            │
    │  ├─ users/ (FCM tokens)                  │
    │  ├─ analytics/ (Events)                  │
    │  └─ notifications/                       │
    └──────────────────────────────────────────┘
             ▲
             │
             │ (Writes via Admin SDK)
             │
    ┌────────┴──────────────────────────────┐
    │    BACKEND (Node.js - Cron Only)      │
    │  ├─ Price Cache Job (Daily 00:00)    │
    │  ├─ Deal Sync Job (Every 6h)         │
    │  ├─ Health Check (/health)           │
    │  └─ FCM Notification Sender           │
    └───────────────────────────────────────┘
```

---

## 📊 Data Flow

### User Reading Data (Public)
```
User Browser 
  ↓
Firebase SDK (Firestore read)
  ↓
Firestore (Security Rules allow read)
  ↓
Data displayed in UI
```

### Admin Writing Data
```
Admin Dashboard
  ↓
firebaseAdminService.js
  ↓
Firebase Admin SDK (Server-side)
  ↓
Firestore (Security Rules allow write from admin)
  ↓
Data persisted
```

### Cron Jobs Updating Data
```
Backend Cron Job (node-cron)
  ↓
Firebase Admin SDK (via service account)
  ↓
Firestore (writes prices, deals)
  ↓
Frontend Real-time Listener
  ↓
UI auto-updates via Pinia store
```

### Push Notifications
```
Admin Panel → Send Notification
  ↓
Backend FCM Service
  ↓
Firebase Cloud Messaging
  ↓
User Device
  ↓
Service Worker → Show Notification
```

---

## 📁 Project Structure

```
freshdeals/
├── frontend/                       # Vue 3 + Vite + PWA
│   ├── src/
│   │   ├── pages/                 # Route components
│   │   │   ├── TodayDealsPage.vue
│   │   │   ├── CategoryDealsPage.vue
│   │   │   ├── ProductDetailPage.vue
│   │   │   └── AdminDashboard.vue
│   │   ├── components/
│   │   │   ├── DealCard.vue
│   │   │   ├── admin/
│   │   │   │   ├── ProductForm.vue
│   │   │   │   ├── DealForm.vue
│   │   │   │   └── NotificationManager.vue
│   │   │   └── ...
│   │   ├── services/               # Business logic
│   │   │   ├── firebaseDealsService.js      # Deal queries
│   │   │   ├── firebaseAdminService.js      # Admin CRUD
│   │   │   ├── adminService.js              # Admin wrapper
│   │   │   ├── fcmService.js                # Push notifications
│   │   │   └── analyticsService.js          # Event tracking
│   │   ├── stores/                 # Pinia state management
│   │   │   ├── dealsStore.js       # Deals state
│   │   │   └── i18nStore.js        # Localization
│   │   ├── router/                 # Vue Router config
│   │   ├── i18n/                   # Translations
│   │   ├── plugins/
│   │   │   └── vuetify.js
│   │   ├── App.vue
│   │   └── main.js
│   ├── public/
│   │   ├── manifest.json           # PWA manifest
│   │   ├── firebase-messaging-sw.js # Service worker
│   │   └── index.html
│   ├── .env                        # Firebase credentials
│   ├── .env.example
│   ├── vite.config.js
│   └── package.json
│
├── backend/                        # Node.js (Cron Only)
│   ├── src/
│   │   ├── jobs/
│   │   │   ├── priceCacheJob.js    # Daily price sync
│   │   │   └── dealSyncJob.js      # 6-hourly deal sync
│   │   ├── services/
│   │   │   ├── messagingService.js # FCM sender
│   │   │   └── firebaseService.js  # Firebase init
│   │   ├── middleware/
│   │   │   └── errorHandler.js
│   │   ├── index.js                # Express server
│   │   └── .env
│   ├── serviceAccountKey.json      # Firebase credentials
│   ├── package.json
│   └── README.md
│
├── FIREBASE_SETUP.md               # 🔴 START HERE
├── firestore.rules                 # Firestore Security Rules
└── README.md
```

---

## 🔒 Security Model

### Firestore Security Rules

**Collections & Permissions:**

| Collection | Public Read | Frontend Write | Admin Write |
|-----------|------------|----------------|------------|
| products | ✅ Yes | ❌ No | ✅ Yes |
| deals | ✅ Yes | ⚠️ Clicks only | ✅ Yes |
| coupons | ✅ Yes | ❌ No | ✅ Yes |
| prices | ❌ No | ❌ No | ✅ Yes |
| priceHistory | ❌ No | ❌ No | ✅ Yes |
| settings | ❌ No | ❌ No | ✅ Yes |
| users | 🔒 Own only | 🔒 Own only | ✅ Yes |
| analytics | ✅ Write events | ✅ Yes | ✅ Admin reads |
| notifications | ✅ User reads | ❌ No | ✅ Yes |

**Authentication:**
- Frontend: Anonymous auth (no login required)
- Admin: Email/password auth + custom claims `admin: true`
- Backend: Service Account (Firebase Admin SDK)

---

## 🎮 Key Services

### Frontend Services

#### 1. **firebaseDealsService.js**
```javascript
export const getTodayDeals(limit)           // Get active visible deals
export const getDealsByCategory(category)   // Filter deals by category
export const getProductComparison(productId) // Get product + prices + deals
export const getDealDetails(dealId)         // Get single deal with related data
export const trackDealClick(dealId)         // Increment click counter
export const listenToTodayDeals(callback)   // Real-time listener
```

#### 2. **firebaseAdminService.js**
```javascript
export const createProduct(data)            // Create new product
export const updateProduct(productId, data) // Update product
export const deleteProduct(productId)       // Delete product
export const createDeal(data)               // Create new deal
export const updateDeal(dealId, data)       // Update deal
export const deleteDeal(dealId)             // Delete deal
export const createCoupon(data)             // Create coupon
export const updateCoupon(couponId, data)   // Update coupon
export const deleteCoupon(couponId)         // Delete coupon
export const updatePlatformPrice(productId, platform, data)
export const updateAffiliateSettings(settings)
```

#### 3. **fcmService.js** (Push Notifications)
```javascript
export const requestNotificationPermission()     // Ask user permission
export const listenToNotifications(callback)     // Handle incoming messages
export const getFCMToken()                       // Get user's FCM token
export const clearFCMToken()                     // On logout
```

#### 4. **analyticsService.js** (Event Tracking)
```javascript
export const trackDealClick(dealId, productId, platform)
export const trackDealView(dealId)
export const trackCategoryView(category)
export const trackNotificationReceived(title, body)
export const trackNotificationClick(title, link)
export const trackSearch(query)
export const trackLanguageChange(from, to)
export const trackPWAInstall()
export const trackPlatformConversion(platform)
export const trackAdImpression(adUnit, adType)
export const trackAdClick(adUnit, adType)
```

### Backend Services

#### 1. **priceCacheJob.js** (Daily 00:00)
- Fetches affiliate APIs (Amazon, Flipkart, etc.)
- Updates `products/{productId}/platformPrices` in Firestore
- Logs price history in `priceHistory/` collection
- Triggers real-time listeners in frontend

#### 2. **dealSyncJob.js** (Every 6 hours)
- Checks for new deals from affiliate networks
- Updates `deals/` collection status + visibility
- Sends push notification if hot deal found
- Increments analytics counters

#### 3. **messagingService.js** (FCM Sender)
```javascript
export const sendNotificationToUser(fcmToken, title, body, data)
export const sendNotificationToUsers(fcmTokens, title, body, data)
export const sendNotificationToTopic(topic, title, body, data)
export const subscribeToTopic(fcmTokens, topic)
export const unsubscribeFromTopic(fcmTokens, topic)
```

---

## 🚀 Running the Application

### Start Backend (Cron Server)
```bash
cd backend
npm install
npm run dev
```

**Output:**
```
[SERVER] FreshDeals Backend (Lightweight) running on port 5000
[MODE] Cron jobs only - Admin operations via Firebase
[JOBS] Price cache: 0 0 * * * (Daily at midnight)
[JOBS] Deal sync: 0 */6 * * * (Every 6 hours)
```

### Start Frontend (PWA)
```bash
cd frontend
npm install
npm run dev
```

**Output:**
```
VITE v5.x.x  ready in 234ms

➜  Local:   http://localhost:3000/
```

### Start Admin Dashboard
1. Same frontend, visit `/admin` route
2. Log in with admin account (Firebase Email/Password)
3. Create/edit products, deals, coupons
4. Send push notifications
5. View analytics

---

## 📈 Cost Analysis

| Component | Cost | Notes |
|-----------|------|-------|
| Firestore | ~$0.06/100k reads + storage | Scales with usage |
| Firebase Hosting | Free (up to 1GB) | Great for PWA |
| Cloud Messaging (FCM) | Free | Unlimited notifications |
| Backend (Cloud Run) | $0.00002/request | Optional, minimal usage |
| Custom Domain | ~$10/year | Optional |
| Google AdSense | 0-100% revenue share | Depends on clicks |
| **Total/Month** | **$0-50** | Highly profitable |

**Revenue Streams:**
1. **Affiliate Commissions** (Primary) - 5-15% per purchase
2. **Google AdSense** (Secondary) - CPM rates
3. **Sponsored Deals** - Brands paying for visibility

---

## 🔄 Real-Time Updates

Frontend uses Firestore real-time listeners:

```javascript
// In dealsStore.js
const unsubscribe = onSnapshot(query, (snapshot) => {
  // Deals update automatically when backend cron job writes
  todayDeals.value = deals;
});
```

**When cron job updates prices:**
1. Backend writes to Firestore
2. Real-time listener fires
3. Pinia store updates
4. Vue re-renders automatically
5. User sees updated deals WITHOUT page refresh

---

## 📱 PWA Features

✅ **Already Configured:**
- Service worker (offline capability)
- Web manifest (installable)
- Icons (192x192, 512x512)
- Theme colors
- Splash screens (for Capacitor)

✅ **Mobile Ready:**
- Responsive Vuetify components
- Touch-optimized buttons
- Fast load times (Vite optimized)
- Installable to home screen

✅ **Capacitor (Android/iOS):**
```bash
npx cap add android
npx cap add ios
npx cap build android
npx cap build ios
```

---

## 📋 Deployment Checklist

- [ ] Firebase project created + configured
- [ ] Firestore Security Rules deployed
- [ ] Service account key in backend
- [ ] Frontend .env with Firebase credentials
- [ ] Service worker registered
- [ ] Backend running (cron jobs active)
- [ ] Sample data in Firestore
- [ ] Push notifications tested
- [ ] Admin panel tested
- [ ] Analytics tracking verified
- [ ] Firebase Hosting deployment
- [ ] Backend deployed (Cloud Run)
- [ ] Custom domain configured
- [ ] Google AdSense enabled
- [ ] Monitoring + alerts set up

---

## 🎓 Key Design Decisions

### ✅ Why Firebase?
- **No backend infrastructure** needed initially
- **Real-time updates** with listeners
- **Scalable** (handles millions of requests)
- **Cost-effective** (pay-as-you-go)
- **Security rules** instead of code

### ✅ Why Cron Jobs for Backend?
- **Controlled price updates** (not scraping)
- **Compliance** with affiliate terms
- **Consistent** data across platform
- **Cost-effective** (runs infrequently)
- **Decoupled** from frontend

### ✅ Why PWA + Capacitor?
- **Single codebase** for web + mobile
- **No app store** needed (but can publish)
- **Fast updates** (no version management)
- **Offline support** (service worker)
- **Push notifications** (native-like)

### ✅ Why No Traditional API?
- **Reduced complexity** (less code)
- **Lower costs** (Firebase scales)
- **Better security** (rules vs middleware)
- **Real-time** (listeners vs polling)
- **Admin-controlled** (not user-driven)

---

## 📚 Next Steps

1. ✅ Complete [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
2. Add Google Analytics
3. Implement AdSense ads
4. Build affiliate dashboard
5. Deploy to Firebase Hosting
6. Deploy backend to Cloud Run
7. Monitor performance + costs
8. Scale to iOS via Capacitor

---

## 🔗 Useful Links

- **Firebase Console:** https://console.firebase.google.com
- **Firebase Docs:** https://firebase.google.com/docs
- **Vue 3 Docs:** https://vuejs.org
- **Vuetify Components:** https://vuetifyjs.com
- **Firestore Rules:** https://firebase.google.com/docs/firestore/security/start
- **Capacitor:** https://capacitorjs.com

---

**Status:** ✅ Production Ready (Requires Firebase Setup)
