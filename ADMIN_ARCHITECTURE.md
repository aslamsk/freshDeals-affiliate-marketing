# Admin Panel Architecture & Component Map

## Component Hierarchy

```
AdminDashboard (Root Component)
│
├─ Stats Section
│  ├─ Total Products Card
│  ├─ Platform Links Card
│  ├─ Active Deals Card
│  └─ Active Coupons Card
│
├─ Tab Navigation
│  └─ v-tabs with 6 tabs
│
└─ Window Content (v-window)
   ├─ AdminProductManager
   │  ├─ Products Data Table
   │  └─ ProductCreateDialog
   │     └─ AdminPlatformLinker (nested)
   │        ├─ Platform Selector
   │        ├─ Platform-Specific Forms
   │        └─ Existing Links Table
   │
   ├─ AdminPlatformManager
   │  └─ All Platform Links Table
   │
   ├─ AdminDealManager
   │  ├─ Deals Data Table
   │  └─ DealCreateDialog
   │
   ├─ AdminCouponManager
   │  ├─ Coupons Data Table
   │  └─ CouponCreateDialog
   │
   ├─ AdminNotificationManager
   │  ├─ Push Logs Table
   │  └─ SendNotificationDialog
   │
   └─ AdminAnalyticsViewer
      ├─ Recent Events Table
      └─ Top Products List
```

## Service Layer Architecture

```
firebaseAdminService.js
│
├─ Product Operations
│  ├─ createProduct()
│  ├─ updateProduct()
│  ├─ deleteProduct()
│  └─ getAllProducts()
│
├─ Platform Link Operations
│  ├─ createPlatformLink()
│  ├─ updatePlatformLink()
│  ├─ deletePlatformLink()
│  └─ getPlatformLinksForProduct()
│
├─ Deal Operations
│  ├─ createDeal()
│  ├─ updateDeal()
│  ├─ deleteDeal()
│  └─ getAllDeals()
│
├─ Coupon Operations
│  ├─ createCoupon()
│  ├─ updateCoupon()
│  ├─ deleteCoupon()
│  └─ getAllCoupons()
│
├─ Push Notification Operations
│  ├─ sendPushNotification()
│  └─ getPushLogs()
│
├─ Analytics Operations
│  ├─ getAnalyticsEvents()
│  ├─ trackDealClick()
│  └─ getDashboardStats()
│
├─ Settings Operations
│  ├─ updateAffiliateSettings()
│  └─ getAffiliateSettings()
│
└─ Platform Price Operations
   └─ updatePlatformPrice()
```

## Data Flow Diagram

### Product Creation Flow
```
User Input
    │
    ▼
ProductManager Component
    │
    ├─ Form Validation
    │
    ▼
firebaseAdminService.createProduct()
    │
    ├─ Generate UUID
    ├─ Add Timestamps
    │
    ▼
Firebase Firestore
    │
    └─ products collection
        │
        ├─ Write Firestore Rule Check
        │  └─ admin == true ?
        │
        ├─ ✅ Success
        │  ├─ Log to console
        │  ├─ Close dialog
        │  ├─ Refresh list
        │  └─ Update dashboard
        │
        └─ ❌ Failure
           └─ Show error message
```

### Platform Linking Flow
```
User Input (Admin)
    │
    ├─ Platform Selection
    ├─ Platform-Specific Data
    │  ├─ Amazon: ASIN
    │  ├─ Flipkart: SKU
    │  └─ Others: URL
    │
    ▼
PlatformLinker Component
    │
    ├─ Validate Fields
    │
    ▼
firebaseAdminService.createPlatformLink()
    │
    ├─ Generate UUID
    ├─ Add Timestamps
    │
    ▼
Firebase Firestore
    │
    └─ platformLinks collection
        │
        ├─ Write Firestore Rule Check
        │  └─ admin == true ?
        │
        ├─ ✅ Success
        │  ├─ Add to existing links table
        │  ├─ Show success toast
        │  └─ Update platform manager count
        │
        └─ ❌ Failure
           └─ Show error message
```

### Analytics Collection Flow
```
Frontend User Actions
    │
    ├─ Click Deal Link
    ├─ View Product
    ├─ Search
    │
    ▼
Analytics Event Created
    │
    ├─ Event Type
    ├─ Timestamp
    ├─ User ID (if signed in)
    │
    ▼
Firebase Firestore
    │
    └─ analytics_events collection
        │
        ├─ Public CREATE allowed
        ├─ No WRITE/UPDATE allowed
        │
        ▼
Admin Can READ
    │
    └─ AdminAnalyticsViewer
       ├─ Recent Events
       └─ Top Products
```

## Database Schema

### Products Collection
```json
{
  "id": "uuid-v4",
  "title_en": "Samsung Galaxy S23",
  "title_te": "సామ్సంగ్ గెలాక్సీ S23",
  "image": "https://example.com/image.jpg",
  "category": "mobile",
  "compareEnabled": true,
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Platform Links Collection
```json
{
  "id": "uuid-v4",
  "productId": "product-uuid",
  "platform": "amazon",
  "externalId": "B0CVBS39N5",
  "productUrl": "https://amazon.in/dp/B0CVBS39N5",
  "affiliateUrl": "https://affiliate.amazon.in/dp/B0CVBS39N5",
  "price": 45999,
  "enableApiSync": true,
  "isActive": true,
  "lastSyncedAt": "2024-01-15T10:30:00Z",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Deals Collection
```json
{
  "id": "uuid-v4",
  "title_en": "Flash Sale - 30% Off",
  "title_te": "ఫ్లాష్ సేల్ - 30% తగ్గింపు",
  "productId": "product-uuid",
  "dealPrice": 32199,
  "originalPrice": 45999,
  "discount": 30,
  "platform": "amazon",
  "status": "ACTIVE",
  "clicks": 125,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Coupons Collection
```json
{
  "id": "uuid-v4",
  "code": "SAVE20",
  "title_en": "Save 20% on Electronics",
  "title_te": "ఎలక్ట్రానిక్‌లపై 20% సేవ్ చేయండి",
  "discount": 20,
  "minOrderValue": 2000,
  "platform": "amazon",
  "isActive": true,
  "currentUses": 45,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Push Notifications Collection
```json
{
  "id": "uuid-v4",
  "title_en": "New Deal Alert",
  "title_te": "నూ డీల్ అలర్ట్",
  "body_en": "Check out our flash sale today!",
  "body_te": "ఈ రోజు మన ఫ్లాష్ సేల్‌ను చూడండి!",
  "target": "deals",
  "targetId": "deal-uuid",
  "status": "sent",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

## Component States & Props

### AdminProductManager Props
```javascript
// No props - self-contained

// Local State
{
  products: Array<Product>,
  loading: Boolean,
  saving: Boolean,
  showCreateDialog: Boolean,
  editingProduct: Product | null,
  form: {
    title_en: String,
    title_te: String,
    image: String,
    category: String,
    compareEnabled: Boolean,
    isActive: Boolean,
  }
}
```

### AdminPlatformLinker Props
```javascript
{
  productId: String,        // Parent product ID
  modelValue: Boolean       // Dialog visibility (v-model)
}

// Local State
{
  platforms: Array<String>,
  selectedPlatform: String,
  existingLinks: Array<Link>,
  loading: Boolean,
  saving: Boolean,
  form: {
    externalId: String,     // ASIN, SKU, or URL
    productUrl: String,
    affiliateUrl: String,
    price: Number,
    enableApiSync: Boolean,
    isActive: Boolean,
  }
}
```

## Firestore Rules Structure

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ===== PRODUCTS RULES =====
    match /products/{productId} {
      allow read: if true;                    // Public read
      allow write: if isAdmin();              // Admin write
    }
    
    // ===== PLATFORM LINKS RULES =====
    match /platformLinks/{linkId} {
      allow read: if true;                    // Public read
      allow write: if isAdmin();              // Admin write
    }
    
    // ===== DEALS RULES =====
    match /deals/{dealId} {
      allow read: if true;                    // Public read
      allow write: if isAdmin();              // Admin write
      allow update: if isClickUpdate();       // Frontend click tracking
    }
    
    // ===== COUPONS RULES =====
    match /coupons/{couponId} {
      allow read: if true;                    // Public read
      allow write: if isAdmin();              // Admin write
    }
    
    // ===== CUSTOM FUNCTIONS =====
    function isAdmin() {
      return request.auth.token.admin == true;
    }
    
    function isClickUpdate() {
      return request.resource.data.clicks == resource.data.clicks + 1 &&
             request.resource.data.diff(resource.data).affectedKeys()
             .hasOnly(['clicks', 'lastClicked']);
    }
  }
}
```

## Component Communication Flow

```
Router
    │
    ▼
AdminDashboard
    │
    ├─ Load Stats (mounted)
    │  └─ getDashboardStats()
    │
    ├─ Auto-refresh (setInterval)
    │  └─ getDashboardStats() every 30s
    │
    └─ Emit Tab Change
       │
       ├─ adminProductManager
       │  ├─ Load products on mount
       │  ├─ Listen to create/update/delete
       │  └─ Refresh list after each operation
       │
       ├─ adminDealManager
       │  ├─ Load deals on mount
       │  ├─ Auto-fetch product dropdown
       │  └─ Refresh on operations
       │
       └─ adminAnalyticsViewer
          ├─ Load events on mount
          ├─ Auto-refresh every 60s
          └─ Update top products list
```

## Error Handling Flow

```
Component Action (e.g., Save Product)
    │
    ▼
Try Service Method
    │
    ├─ Success Path
    │  ├─ Log ✅ message
    │  ├─ Close dialog
    │  ├─ Refresh data
    │  ├─ Show success toast (implicit)
    │  └─ Return
    │
    └─ Error Path
       ├─ Log ❌ message
       ├─ Alert user with error.message
       ├─ Keep dialog open
       └─ Return
```

## Deployment Architecture

```
Dev Environment
    │
    ├─ npm run dev
    └─ localhost:3000

Build Process
    │
    ├─ npm run build
    ├─ Vite transforms 655 modules
    ├─ PWA generates service worker
    ├─ dist/ folder created
    │
    ▼
Production Deployment
    │
    ├─ firebase deploy
    ├─ Upload dist/ to Cloud Hosting
    ├─ Deploy firestore.rules
    ├─ Deploy cloud functions (optional)
    │
    ▼
Live Admin Panel
    │
    └─ https://freshdeals.web.app/#/admin
```

---

## Quick Reference

### Supported Categories
electronics, accessories, audio, computing, mobile, wearables, gaming, lifestyle, home

### Supported Platforms
amazon, flipkart, myntra, meesho, ajio, tatacliq, generic

### Deal Statuses
ACTIVE, EXPIRED, PAUSED

### Platform Colors
- Amazon: Orange
- Flipkart: Blue
- Myntra: Pink
- Meesho: Purple
- AJIO: Indigo
- TataCliq: Cyan
- Generic: Grey

### Service Methods Count
- Product: 4 methods
- Deal: 4 methods
- Coupon: 4 methods
- Platform Link: 4 methods
- Batch: 3 methods
- Analytics: 2 methods
- Notifications: 2 methods
- Dashboard: 1 method

**Total: 24 Service Methods**

---

**Created**: 2024
**Last Updated**: 2024
**Status**: ✅ Complete
