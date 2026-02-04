# FreshDeals - Firebase Setup Guide

## ✅ Prerequisites
- Firebase project created at https://console.firebase.google.com
- Node.js 16+ installed
- Frontend repo cloned locally

---

## 📝 STEP 1: Create Firebase Project

### 1.1 Go to Firebase Console
1. Visit https://console.firebase.google.com
2. Click "Create a project"
3. Project name: `freshdeals` (or your choice)
4. Accept terms and create

### 1.2 Enable Services
In Firebase Console → Project Settings:

#### Enable Firestore
1. Go to "Build" → "Firestore Database"
2. Click "Create Database"
3. Start in **Production Mode** (security rules will protect it)
4. Choose region: `asia-south1` (Mumbai) for India-based users
5. Click "Create"

#### Enable Cloud Messaging (FCM)
1. Go to "Build" → "Cloud Messaging"
2. Tab "Web configuration" should show
3. Copy the **Web Push certificate** (you'll need it later)

---

## 🔑 STEP 2: Get Firebase Credentials

### 2.1 Project Settings
1. Go to "Project Settings" (gear icon, top-right)
2. Click tab "Service Accounts"
3. Under "Firebase Admin SDK":
   - Language: Node.js
   - Click "Generate new private key"
   - Save as `backend/serviceAccountKey.json` (keep SECRET!)

### 2.2 Web App Credentials
1. Still in "Project Settings"
2. Click tab "Your apps"
3. Click "Web" icon to create Web app
4. Register app name: `freshdeals-web`
5. Copy the config that looks like:

```javascript
{
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
  measurementId: "..."
}
```

---

## 🔒 STEP 3: Configure Frontend

### 3.1 Add Firebase Credentials to .env

Edit `frontend/.env`:

```
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
VITE_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID
VITE_FIREBASE_VAPID_KEY=YOUR_WEB_PUSH_CERTIFICATE
```

**Paste values** from Step 2.2 and add VAPID Key from Step 1.2

### 3.2 Update Service Worker

Edit `frontend/public/firebase-messaging-sw.js`:

Find this section and replace with your credentials:

```javascript
firebase.initializeApp({
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
});
```

---

## ⚙️ STEP 4: Configure Backend

### 4.1 Add Service Account Key

1. Place `serviceAccountKey.json` in `backend/` directory
2. Backend will use it to authenticate with Firebase Admin SDK

### 4.2 Backend .env

Edit `backend/.env`:

```
NODE_ENV=development
PORT=5000
FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
```

---

## 🔐 STEP 5: Deploy Security Rules

### 5.1 Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
firebase use --add
```

Select your Firebase project when prompted.

### 5.2 Deploy Firestore Rules

```bash
cd d:/Aslam/freshdeals
firebase deploy --only firestore:rules
```

This deploys rules from `firestore.rules` file.

The rules enforce:
- **Public Read**: Anyone can read deals, products, coupons
- **Frontend Write**: Only click tracking (increment clicks)
- **Admin Write**: Only backend/admin can create/update/delete
- **Analytics**: Frontend can write events, admin reads

---

## 📊 STEP 6: Create Initial Data

### 6.1 Using Firebase Console

1. Go to Firestore → Collections
2. Create collection: `products`
3. Add sample product:

```json
{
  "id": "prod_001",
  "name": "Samsung Galaxy S24",
  "category": "electronics",
  "description": "Latest flagship smartphone",
  "imageUrl": "https://example.com/image.jpg",
  "status": "ACTIVE"
}
```

### 6.2 Add Sample Deal

1. Create collection: `deals`
2. Add document:

```json
{
  "productId": "prod_001",
  "title": "Samsung Galaxy S24 at 40% OFF",
  "description": "Premium flagship at best price",
  "platform": "Amazon",
  "affiliateLink": "https://amazon.in/ref=...",
  "dealPrice": 50000,
  "originalPrice": 84000,
  "discount": 40,
  "imageUrl": "https://example.com/image.jpg",
  "status": "ACTIVE",
  "isVisible": true,
  "clicks": 0,
  "createdAt": "2026-02-01T00:00:00Z"
}
```

### 6.3 Add Platform Prices

1. Create subcollection under product: `products/prod_001/platformPrices`
2. Add documents:

```json
[
  {
    "platform": "Amazon",
    "price": 50000,
    "url": "https://amazon.in/ref=...",
    "lastUpdated": "2026-02-01T00:00:00Z"
  },
  {
    "platform": "Flipkart",
    "price": 52000,
    "url": "https://flipkart.com/ref=...",
    "lastUpdated": "2026-02-01T00:00:00Z"
  }
]
```

---

## 🚀 STEP 7: Run Application

### 7.1 Start Backend (Cron Jobs)

```bash
cd backend
npm install
npm run dev
```

Expected output:
```
[SERVER] FreshDeals Backend (Lightweight) running on port 5000
[MODE] Cron jobs only - Admin operations via Firebase
```

### 7.2 Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Expected output:
```
VITE v5.x.x  ready in XXX ms
➜  Local:   http://localhost:3000/
```

### 7.3 Test in Browser

1. Open http://localhost:3000
2. You should see deals loaded from Firestore
3. Click "View Deal" - click tracking should work
4. Open DevTools → Application → Service Workers
5. Verify service worker is registered

---

## 📱 STEP 8: Test Push Notifications

### 8.1 Request Permission

1. In app, look for notification permission prompt
2. Click "Allow"
3. Open DevTools → Application → Storage → Local Storage
4. Check for `fcmToken` key (should have a long token)

### 8.2 Send Test Notification

From admin panel or backend API:

```bash
curl -X POST http://localhost:5000/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "fcmToken": "YOUR_TOKEN_HERE",
    "title": "Test Notification",
    "body": "This is a test from FreshDeals",
    "link": "/deals"
  }'
```

You should see notification pop up!

---

## 🎯 STEP 9: Security Checklist

- [ ] Firestore rules deployed (public read, admin write)
- [ ] Service account key in `backend/serviceAccountKey.json` (NOT committed)
- [ ] Frontend .env credentials are valid
- [ ] Service worker registered (DevTools → Application)
- [ ] FCM token being generated
- [ ] Only admin can create/update products and deals

---

## 📚 Collection Structure

```
firestore/
├── products/
│   ├── prod_001
│   │   ├── name, category, description, imageUrl, status
│   │   └── platformPrices/
│   │       ├── amazon: { price, url, lastUpdated }
│   │       └── flipkart: { price, url, lastUpdated }
│   └── prod_002
│
├── deals/
│   ├── deal_001: { productId, title, description, platform, dealPrice, status, isVisible, clicks, ...}
│   └── deal_002
│
├── coupons/
│   ├── coupon_001: { code, discount, isActive, maxUses, usedCount, ...}
│   └── coupon_002
│
├── prices/
│   └── [Backend cron job writes here]
│
├── priceHistory/
│   └── [Analytics data]
│
├── settings/
│   └── { affiliateIds, platformConfig, ... }
│
├── users/
│   ├── user_001: { fcmToken, preferences, subscribedCategories, ... }
│   └── user_002
│
└── analytics/
    └── { dealClicks, dealViews, notifications, conversions }
```

---

## 🐛 Troubleshooting

### Frontend shows empty deals?
- Check if Firestore has data
- Check browser console for Firebase errors
- Verify .env credentials are correct
- Check Firestore security rules

### Notifications not showing?
- Verify FCM token in localStorage
- Check if service worker is registered
- Verify notification permission is "granted"
- Check browser console for FCM errors

### Backend cron jobs not running?
- Check backend console logs
- Verify Firebase service account key is valid
- Check Firestore has `deals` collection

---

## 📖 Next Steps

1. ✅ Complete setup above
2. Add more sample products and deals
3. Deploy to Firebase Hosting
4. Deploy backend to Cloud Run or similar
5. Set up Google AdSense for revenue
6. Monitor analytics in Firestore

---

**Questions?** Check the console logs - they have detailed debug info!
