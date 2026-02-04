# FreshDeals - Quick Start Guide

## 🚀 Start Here (5 Minutes)

### 1. Prerequisites Check
```bash
# Check Node.js version (need v16+)
node --version

# Check npm version (need v7+)
npm --version
```

### 2. Clone Project
```bash
cd d:/Aslam/freshdeals
```

### 3. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file with Firebase credentials
# (Ask for credentials from Firebase console)
cp .env.example .env
# Edit .env with your values

# Start backend
npm run dev
```

✅ Backend runs on: `http://localhost:5000`

### 4. Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000" > .env.local
echo "VITE_ADMIN_SECRET=dev-secret-key" >> .env.local

# Start frontend
npm run dev
```

✅ Frontend runs on: `http://localhost:3000`

### 5. Open in Browser
- Go to `http://localhost:3000`
- You should see FreshDeals homepage
- Today's deals will show after backend data is added

---

## 🎮 Testing the Platform

### View Today's Deals
1. Visit `http://localhost:3000`
2. See list of deals (if any exist in database)

### Add a Deal (Admin)

Using cURL:
```bash
curl -X POST "http://localhost:5000/api/admin/deals" \
  -H "X-Admin-Secret: dev-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "test-product-1",
    "title": "Amazing Deal on iPhone",
    "dealPrice": 50000,
    "originalPrice": 60000,
    "platform": "amazon",
    "affiliateLink": "https://amazon.in/dp/TEST123",
    "expiryDate": "2025-12-31T23:59:59Z"
  }'
```

### View Deal on Frontend
1. Refresh `http://localhost:3000`
2. New deal should appear
3. Click "View Deal" → tracks click and opens affiliate link

### Change Language
1. Click translation icon in header
2. Select "తెలుగు" for Telugu
3. UI switches to Telugu

---

## 📂 File Structure Quick Tour

```
📁 backend/
  ├─ src/
  │  ├─ index.js ..................... Server entry point
  │  ├─ models/ ...................... Database models
  │  ├─ routes/ ...................... API endpoints
  │  └─ config/ ...................... Firebase config
  └─ .env.example .................... Environment variables

📁 frontend/
  ├─ src/
  │  ├─ main.js ...................... Vue entry point
  │  ├─ App.vue ...................... Root component
  │  ├─ pages/ ....................... Page components
  │  ├─ components/ .................. Reusable components
  │  └─ stores/ ...................... State management
  └─ public/ ........................ Static files (PWA)

📁 docs/
  ├─ SETUP.md ....................... Full setup guide
  ├─ API.md ......................... API documentation
  ├─ SECURITY.md .................... Security guide
  └─ QUICK_START.md ................. This file!
```

---

## 🐛 Common Issues & Fixes

### Backend won't start

**Error:** `Error: connect ECONNREFUSED localhost:5000`

**Fix:**
```bash
# Kill existing process
lsof -ti:5000 | xargs kill -9

# Clear node_modules and reinstall
rm -rf node_modules
npm install
npm run dev
```

### Frontend can't reach backend

**Error:** `Failed to fetch /api/deals/today`

**Fix:**
- Check backend is running: `curl http://localhost:5000/health`
- Check `.env.local` has correct `VITE_API_URL`
- Restart frontend: `npm run dev`

### Firebase credentials error

**Error:** `FIREBASE_PROJECT_ID is not set`

**Fix:**
- Go to [Firebase Console](https://console.firebase.google.com)
- Download service account JSON
- Copy values to `.env` in backend
- Restart backend

### Port already in use

**Error:** `Error: listen EADDRINUSE :::3000`

**Fix:**
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9

# Or use different port
VITE_PORT=3000 npm run dev
```

---

## 📝 Common Tasks

### Add a Product

```bash
curl -X POST "http://localhost:5000/api/admin/products" \
  -H "X-Admin-Secret: dev-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15 Pro",
    "description": "256GB, Black",
    "category": "electronics",
    "tags": ["phone", "apple"]
  }'
```

### Add a Coupon

```bash
curl -X POST "http://localhost:5000/api/admin/coupons" \
  -H "X-Admin-Secret: dev-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "SAVE20",
    "discount": 20,
    "discountType": "percentage",
    "expiryDate": "2025-12-31T23:59:59Z"
  }'
```

### View Admin Dashboard

1. Visit `http://localhost:3000/admin`
2. See admin panels for Products, Deals, Coupons, Settings

---

## 🔗 Useful Links

- 📖 [Full Documentation](./SETUP.md)
- 🔌 [API Reference](./API.md)
- 🔐 [Security Guide](./SECURITY.md)
- 🌐 [Vue 3 Docs](https://vuejs.org)
- 🎨 [Vuetify Components](https://vuetifyjs.com)
- ⚡ [Firebase Docs](https://firebase.google.com/docs)

---

## 💡 Tips & Tricks

### Hot Reload Development
- Frontend auto-reloads on code changes
- Backend auto-reloads with `nodemon`
- Just save and refresh browser

### Debug Frontend
- Open DevTools: `F12`
- Vue DevTools extension: [Download](https://devtools.vuejs.org)
- Check Network tab for API calls

### Debug Backend
- Check terminal logs (request/response details)
- Use `console.log()` for debugging
- Check Firebase console for database changes

### Performance Testing
- Frontend lighthouse: DevTools → Lighthouse
- Backend response time: DevTools → Network tab
- Check PWA: DevTools → Application → Manifest

---

## 🎯 Next Steps

1. **Add Sample Data**
   - Create 10-20 products via API
   - Add deals for each product
   - Test category filtering

2. **Connect Firebase**
   - Setup real Firebase project
   - Update `.env` with credentials
   - Test data persistence

3. **Customize Styling**
   - Edit `src/main.css` for custom theme
   - Modify Vuetify colors in `src/plugins/vuetify.js`
   - Add custom components

4. **Deploy**
   - Backend: Firebase Cloud Run or Heroku
   - Frontend: Firebase Hosting or Vercel
   - See [SETUP.md](./SETUP.md#-deployment) for details

---

## ⚡ Performance Tips

- **Frontend:** Vite automatically optimizes (ultra-fast)
- **Backend:** Use `.lean()` queries to reduce payload
- **Database:** Create Firestore indexes for frequently queried fields
- **Caching:** Service Worker caches assets automatically

---

**Need Help?** Check [SETUP.md](./SETUP.md) for detailed documentation.

Happy coding! 🚀
