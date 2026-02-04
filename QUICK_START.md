# 🚀 FreshDeals - Quick Start Checklist

## Phase 1: Firebase Setup (15 mins)

### Step 1: Create Firebase Project
- [ ] Go to https://console.firebase.google.com
- [ ] Click "Create a project" → Name it `freshdeals`
- [ ] Accept terms and create

### Step 2: Enable Services
- [ ] Go to "Build" → "Firestore Database"
- [ ] Click "Create Database"
- [ ] Choose "Production Mode"
- [ ] Select region: `asia-south1` (India)
- [ ] Click "Create"

### Step 3: Setup Cloud Messaging
- [ ] Go to "Build" → "Cloud Messaging"
- [ ] Copy "Web Push Certificate" (VAPID Key)

### Step 4: Get Credentials
- [ ] Go to "Project Settings" (gear icon)
- [ ] Tab "Service Accounts"
- [ ] Under Firebase Admin SDK → "Generate new private key"
- [ ] Save as `backend/serviceAccountKey.json`
- [ ] **DO NOT COMMIT THIS FILE** (add to .gitignore)

### Step 5: Get Web App Credentials
- [ ] Still in "Project Settings"
- [ ] Tab "Your apps"
- [ ] Click "Web" → "Register app"
- [ ] Copy the entire config

---

## Phase 2: Configure Application (10 mins)

### Step 6: Frontend Configuration
- [ ] Edit `frontend/.env`
- [ ] Paste Firebase credentials from Step 5:

```
VITE_FIREBASE_API_KEY=paste_here
VITE_FIREBASE_AUTH_DOMAIN=paste_here
VITE_FIREBASE_PROJECT_ID=paste_here
VITE_FIREBASE_STORAGE_BUCKET=paste_here
VITE_FIREBASE_MESSAGING_SENDER_ID=paste_here
VITE_FIREBASE_APP_ID=paste_here
VITE_FIREBASE_MEASUREMENT_ID=paste_here
VITE_FIREBASE_VAPID_KEY=paste_VAPID_from_step3
```

### Step 7: Update Service Worker
- [ ] Edit `frontend/public/firebase-messaging-sw.js`
- [ ] Replace placeholder credentials with your actual values

### Step 8: Backend Configuration
- [ ] `serviceAccountKey.json` already placed (Step 4)
- [ ] Create `backend/.env`:

```
NODE_ENV=development
PORT=5000
FIREBASE_PROJECT_ID=your_project_id
```

---

## Phase 3: Deploy Firestore Rules (5 mins)

### Step 9: Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### Step 10: Deploy Rules
```bash
cd d:/Aslam/freshdeals
firebase use --add
# Select your project

firebase deploy --only firestore:rules
```

---

## Phase 4: Run Application (5 mins)

### Step 11: Start Backend
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

### Step 12: Start Frontend (New Terminal)
```bash
cd frontend
npm install
npm run dev
```

Expected output:
```
➜  Local:   http://localhost:3000/
```

### Step 13: Open in Browser
- [ ] Open http://localhost:3000
- [ ] You should see an empty page (no data yet)

---

## Phase 5: Add Sample Data (10 mins)

### Step 14: Create Sample Product
1. Go to Firebase Console → Firestore
2. Click "+" → "Create collection"
3. Collection name: `products`
4. Click "Auto-ID" to create first document
5. Add fields:

```json
{
  "name": "Samsung Galaxy S24",
  "category": "electronics",
  "description": "Latest flagship smartphone",
  "imageUrl": "https://images.samsung.com/...",
  "status": "ACTIVE"
}
```

### Step 15: Create Sample Deal
1. Create collection: `deals`
2. Add document with fields:

```json
{
  "productId": "doc-id-from-step-14",
  "title": "Samsung Galaxy S24 at 40% OFF",
  "description": "Premium flagship at best price",
  "platform": "Amazon",
  "affiliateLink": "https://amazon.in/ref=...",
  "dealPrice": 50000,
  "originalPrice": 84000,
  "discount": 40,
  "status": "ACTIVE",
  "isVisible": true,
  "clicks": 0,
  "createdAt": "2026-02-01T00:00:00Z"
}
```

### Step 16: Add Platform Prices
1. In Firestore, navigate to: `products/[product-doc-id]`
2. Click "+" → Create subcollection
3. Subcollection: `platformPrices`
4. Add documents:

```json
{
  "platform": "Amazon",
  "price": 50000,
  "url": "https://amazon.in/ref=..."
}
```

Repeat for Flipkart, MakeMyTrip, etc.

---

## Phase 6: Test Application (5 mins)

### Step 17: Verify Frontend
- [ ] Refresh http://localhost:3000
- [ ] You should see the deal you created
- [ ] Click "View Deal" → should track click in Firestore
- [ ] Check DevTools → Application → Service Workers → Active

### Step 18: Test Notifications
- [ ] On http://localhost:3000, check console
- [ ] Look for `📱 FCM Token:` message
- [ ] Copy the token

### Step 19: Send Test Notification
```bash
curl -X POST http://localhost:5000/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "fcmToken": "YOUR_TOKEN_HERE",
    "title": "Test Alert",
    "body": "FreshDeals is working!",
    "link": "/"
  }'
```

- [ ] You should see a notification pop up

---

## Phase 7: Admin Dashboard (Optional - Phase 2)

### Step 20: Add Admin User (Firebase Console)
1. Go to Authentication
2. Click "Add user"
3. Email: `admin@freshdeals.com`
4. Password: Strong password
5. Copy User UID

### Step 21: Create Admin Record
1. Go to Firestore → `users` collection
2. Create document with UID from above
3. Add field: `role: "admin"`

### Step 22: Access Admin Panel
- [ ] Go to http://localhost:3000/admin
- [ ] Login with admin email/password
- [ ] Create products, deals, coupons
- [ ] Send push notifications
- [ ] View analytics

---

## ✅ Completion Checklist

- [ ] Firebase project created
- [ ] Firestore enabled + rules deployed
- [ ] Frontend .env configured
- [ ] Backend serviceAccountKey.json placed
- [ ] Backend running (port 5000)
- [ ] Frontend running (port 3000)
- [ ] Sample product + deal created
- [ ] Sample deal visible on frontend
- [ ] Click tracking working
- [ ] FCM token generated
- [ ] Test notification received
- [ ] Admin user created
- [ ] Admin dashboard accessible

---

## 🎯 You're Ready!

If all checkboxes are ✅, you have a working FreshDeals installation!

### Next Steps:
1. Add more products and deals
2. Deploy backend to Cloud Run
3. Deploy frontend to Firebase Hosting
4. Enable Google AdSense
5. Publicize and start earning!

---

## 🆘 Troubleshooting

### Frontend shows empty deals?
```
1. Check Firestore has `deals` collection with data
2. Open DevTools → Console → Look for Firebase errors
3. Check .env file has correct credentials
4. Check Firestore security rules allow read
```

### Notifications not showing?
```
1. Check DevTools → Application → Service Workers active
2. Verify FCM token in LocalStorage
3. Check browser notification permission is "Allow"
4. Check backend can reach Firebase
```

### Backend not running?
```
1. Check Node.js version: node -v (should be 16+)
2. Check serviceAccountKey.json exists in backend/
3. Check .env has FIREBASE_PROJECT_ID
4. Run: npm install in backend/
```

### Data not updating in real-time?
```
1. Check Firestore listener is active (console logs)
2. Try refreshing page
3. Check Firestore rules allow write to analytics
```

---

**Time to Complete:** ~60 minutes for complete setup
**Support:** Check console logs for detailed error messages
