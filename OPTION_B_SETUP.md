# 🎯 FreshDeals - Option B Setup Guide

## Lightweight Backend Architecture

This guide sets up FreshDeals with **lightweight backend** (cron jobs only) and **Firebase direct operations** from frontend.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Vue 3)                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Admin Operations                                  │  │
│  │ • Create/Update/Delete Products                  │  │
│  │ • Create/Update/Delete Deals                     │  │
│  │ • Manage Coupons                                 │  │
│  │ • Track Analytics                               │  │
│  └─────────────────────── ────────────────────────┘  │
│                          │                             │
│                    Firebase SDK                        │
│                   (Direct Writes)                      │
│                          ↓                             │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ↓                  ↓                  ↓
   ┌─────────┐      ┌────────────┐      ┌─────────┐
   │ Frontend│      │  Firebase  │      │ Backend │
   │  Reads  │      │ (Database) │      │(Cron)   │
   │ Deals   │      │            │      │         │
   └─────────┘      └────────────┘      └─────────┘
        ↑                                      ↓
        └──────── Scheduled Jobs ─────────────┘
                 (Price Cache, Deal Sync)
```

---

## ⚡ Quick Start

### 1. Configure Firebase

**Step 1: Create Firebase Project**
- Go to [Firebase Console](https://console.firebase.google.com)
- Click "Create Project" → "FreshDeals"
- Enable Firestore, Authentication, and Cloud Messaging

**Step 2: Get Firebase Credentials**
- Project Settings → Service Accounts → Generate New Private Key
- Copy your Web app config

**Step 3: Add to Frontend**
```bash
# Copy environment template
cp frontend/.env.example frontend/.env

# Edit frontend/.env and add your Firebase config:
VITE_FIREBASE_API_KEY=your_key_here
VITE_FIREBASE_AUTH_DOMAIN=freshdeals-dev.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=freshdeals-dev
VITE_FIREBASE_STORAGE_BUCKET=freshdeals-dev.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

**Step 4: Apply Firestore Security Rules**
- Firestore → Rules → Replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow create, update, delete: if request.auth != null;
    }
  }
}
```

### 2. Start Services

**Terminal 1 - Backend (Cron Jobs Only)**
```bash
cd backend
npm install
npm run dev
```

Output:
```
[SERVER] FreshDeals Backend (Lightweight) running on port 5000
[MODE] Cron jobs only - Admin operations via Firebase
```

**Terminal 2 - Frontend**
```bash
cd frontend
npm install
npm run dev
```

Then open **http://localhost:3000** 🎉

---

## 📝 Admin Panel Usage

### How to Access Admin Features

1. Open http://localhost:3000
2. Click "⚙️ Admin" (top right)
3. Operations happen **directly via Firebase**
4. No authentication needed (development mode)

### Example: Create a Product

**Frontend Admin Panel:**
```
Product Form
├── Name: "iPhone 15 Pro"
├── Category: "Electronics"
├── Description: "Latest Apple device"
└── Submit → Directly writes to Firestore
```

**Behind the scenes:**
```javascript
// firebaseAdminService.js
await createProduct({
  name: "iPhone 15 Pro",
  category: "Electronics",
  // ... → Firestore
})
```

---

## 🔒 Production Security

### Enable Admin Authentication

**Step 1: Enable Firebase Auth**
- Firebase Console → Authentication → Enable Email/Password

**Step 2: Setup Custom Claims**
```javascript
// Cloud Functions (admin script)
admin.auth().setCustomUserClaims(uid, { admin: true });
```

**Step 3: Update Security Rules**
```
match /products/{document=**} {
  allow create, update, delete: if request.auth.token.admin == true;
}
```

### After Setup:
- Only authenticated admins can modify data
- Public can still read deals
- Frontend enforces permissions

---

## 📊 What Backend Does Now

### Cron Job 1: Price Cache (Daily at Midnight)
```
┌─────────────────┐
│ Every 24 hours  │
└────────┬────────┘
         ↓
    ┌──────────────────┐
    │ Read all prices  │
    │ Save to history  │
    │ Enable trends    │
    └──────────────────┘
```

### Cron Job 2: Deal Sync (Every 6 Hours)
```
┌─────────────────┐
│ Every 6 hours   │
└────────┬────────┘
         ↓
    ┌──────────────────┐
    │ Check expirations│
    │ Mark as expired  │
    │ Keep DB clean    │
    └──────────────────┘
```

---

## 🧪 Testing

### Test Admin Operations

```bash
# Create a product
POST http://localhost:3000/admin
Body: { name: "Test", category: "Electronics" }

# Should appear in Firestore immediately
# No backend required for CRUD
```

### Test Cron Jobs

```bash
# Check backend logs
cd backend && npm run dev

# Should see every 6 hours:
# "[CRON] Running deal sync job..."
```

---

## 📈 Deployment

### Deploy Frontend (Admin Panel)
```bash
# Vercel / Netlify
npm run build
# Connect your GitHub repo
```

### Deploy Backend (Cron Only)
```bash
# Firebase Cloud Run
firebase deploy --only functions

# OR Heroku
git push heroku main
```

### Result:
- **Frontend:** Deployed on Vercel/Netlify
- **Backend:** Runs on Firebase/Heroku (handles cron jobs)
- **Database:** Firestore handles everything
- **Admin:** Works via Firebase (no separate admin API)

---

## ✅ Checklist

- [ ] Firebase project created
- [ ] Firestore database enabled
- [ ] Firebase credentials added to `frontend/.env`
- [ ] Backend started (`npm run dev` in backend)
- [ ] Frontend started (`npm run dev` in frontend)
- [ ] Can access http://localhost:3000
- [ ] Admin panel working
- [ ] Products/Deals creating successfully
- [ ] No backend logs showing errors

---

## 🎯 Benefits of Option B

| Feature | Benefit |
|---------|---------|
| Firebase Direct Writes | Faster admin operations, no network latency |
| Lightweight Backend | Cheaper hosting (only cron, not serving APIs) |
| Automatic Scaling | Firebase handles all DB scaling |
| Simpler Deployment | No admin API to maintain |
| Better Security | No secret key exposure in frontend |
| Real-time Updates | Firestore listeners work everywhere |

---

## 🆘 Troubleshooting

### "Firebase not configured"
```
Solution: Check frontend/.env has all 6 config values
```

### "Admin operations not working"
```
Solution: Check Firestore Security Rules allow writes
```

### "Cron jobs not running"
```
Solution: Check backend is running on port 5000
Logs should show "[CRON] Running..."
```

### "Can't read deals in frontend"
```
Solution: Frontend has fallback to backend demo data
Check both are running
```

---

## 📚 What's Running Where

| Service | Port | Purpose |
|---------|------|---------|
| Frontend | 3000 | Vue app + admin panel |
| Backend | 5000 | Cron jobs + demo fallback |
| Firebase | Cloud | Database + auth + messaging |

---

## 🚀 Next Steps

1. ✅ **Get Firebase credentials** (5 min)
2. ✅ **Setup frontend .env** (2 min)
3. ✅ **Apply Firestore rules** (2 min)
4. ✅ **Start both servers** (1 min)
5. ✅ **Test admin panel** (5 min)
6. ✅ **Add sample data** (10 min)
7. ✅ **Deploy** (when ready)

**Total Setup Time: ~15 minutes** ⏱️

---

## 📖 Documentation

- [Firebase Console](https://console.firebase.google.com)
- [Firestore Rules](FIRESTORE_RULES.txt)
- [Frontend .env Example](frontend/.env.example)
- [Admin Service](frontend/src/services/firebaseAdminService.js)

---

**Questions?** Check SETUP.md for complete reference guide.

**Ready to deploy?** See SETUP.md → Production Deployment section.
