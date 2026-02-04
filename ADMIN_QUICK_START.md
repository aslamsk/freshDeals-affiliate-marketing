# 🎯 Admin Panel - Quick Access Guide

## How to Access Admin Panel

### Direct URL (Recommended)
```
http://localhost:3000/#/admin
```

Just copy-paste this into your browser address bar!

---

## What You Can Do in Admin Panel

### 📦 Product Management
- **Create New Products**
  - Click "Add Product" button
  - Enter title (English & Telugu)
  - Upload image URL
  - Select category
  - Click "Save"

- **Edit Existing Products**
  - Click edit icon (pencil) on any product
  - Update details
  - Click "Save"

- **Delete Products**
  - Click delete icon (trash)
  - Product is removed

- **Add Platform Links to Products**
  - Click "View Platforms" button on product
  - Select platform (Amazon, Flipkart, Myntra, etc.)
  - Enter platform details (ASIN, SKU, or URL)
  - Add affiliate URL
  - Set price
  - Click "Add Link"

---

### 🎯 Deal Management (Deals Tab)
- Create promotional deals
- Link to specific products
- Set original and deal prices
- Discount is calculated automatically
- Set deal status (ACTIVE, EXPIRED, PAUSED)
- Edit and delete deals

---

### 🎫 Coupon Management (Coupons Tab)
- Create discount codes
- Set discount amount (% or fixed ₹)
- Set minimum order value
- Target specific platforms
- Enable/disable coupons
- Edit and delete coupons

---

### 📊 Dashboard
- View statistics:
  - Total products
  - Platform links count
  - Active deals
  - Active coupons
- Stats auto-refresh every 30 seconds
- Quick links to each management section

---

## Supported Affiliate Platforms

When adding platform links to products:

| Platform | Input Type | Example |
|----------|-----------|---------|
| **Amazon** | ASIN | B0CVBS39N5 |
| **Flipkart** | SKU | SKU12345 |
| **Myntra** | URL | myntra.com/p/... |
| **Meesho** | URL | meesho.com/p/... |
| **AJIO** | URL | ajio.com/p/... |
| **TataCliq** | URL | tatacliq.com/p/... |
| **Generic** | URL | Any product URL |

---

## Icons You'll See

### Navigation Icons
- 🏠 Home - Return to home page
- ⚙️ Settings - Admin settings
- ➕ Plus - Add new item
- ✏️ Pencil - Edit item
- 🗑️ Trash - Delete item
- 🔄 Refresh - Reload data
- 🔗 Link - Add platform link
- 👁️ Eye - View details

---

## Tab Navigation

| Tab | Purpose |
|-----|---------|
| **Products** | Create/edit/delete products and manage platform links |
| **Platforms** | View all platform links across all products |
| **Deals** | Create/edit/delete promotional deals |
| **Coupons** | Create/edit/delete discount codes |
| **Notifications** | Send push notifications to users |
| **Analytics** | View user activity and insights |

---

## Common Tasks

### Add a New Product
```
1. Go to http://localhost:3000/#/admin
2. Click "Products" tab (if not already there)
3. Click "Add Product" button
4. Fill in details:
   - Title (English)
   - Title (Telugu)
   - Image URL
   - Category
5. Click "Save"
6. Product appears in list
```

### Link Product to Amazon
```
1. In Products tab, find your product
2. Click "View Platforms" button
3. Select "Amazon" from dropdown
4. Enter ASIN number
5. Enter product URL
6. Enter affiliate URL
7. Enter price
8. Click "Add Link"
```

### Create a Deal
```
1. Click "Deals" tab
2. Click "Create Deal" button
3. Select product from dropdown
4. Enter original price
5. Enter deal price
6. Discount % calculated automatically
7. Select platform
8. Set status (ACTIVE)
9. Click "Save"
```

### Create a Coupon
```
1. Click "Coupons" tab
2. Click "Create Coupon" button
3. Enter coupon code
4. Enter discount % or amount
5. Enter minimum order value
6. Select platform
7. Click "Save"
```

---

## Features

✅ **No Login Required**
- Access admin panel immediately
- No authentication needed
- Works for all users

✅ **Real-time Updates**
- Dashboard stats auto-refresh every 30 seconds
- All changes saved to Firestore instantly
- Data syncs across all devices

✅ **Bilingual Support**
- Titles in English and Telugu
- All text displayed in user's language preference

✅ **Multi-Platform Support**
- Manage products across 7 affiliate platforms
- Different input types for each platform
- Track prices and links per platform

✅ **Easy to Use**
- Simple form-based UI
- Material Design components
- Clear icons and labels
- Responsive design

---

## Tips & Tricks

### Pro Tips
1. **Image URLs**: Use direct links to images (e.g., from Imgur, Firebase Storage)
2. **Categories**: Choose from: electronics, accessories, audio, computing, mobile, wearables, gaming, lifestyle, home
3. **Prices**: Always enter in rupees (₹)
4. **Discounts**: Can be percentage or fixed amount
5. **Platform Links**: Can add multiple links to same product for different platforms

### Keyboard Shortcuts
- `Tab` - Navigate form fields
- `Enter` - Submit form
- `Esc` - Close dialog

---

## Troubleshooting

### Icons Not Showing?
- Try refreshing the page (F5 or Ctrl+R)
- Clear browser cache (Ctrl+Shift+Delete)
- Try in a different browser

### Can't See Data After Saving?
- Check network connection
- Verify Firebase Firestore is accessible
- Try refreshing page
- Check browser console for errors (F12)

### Form Won't Submit?
- Verify all required fields are filled
- Check image URL is valid
- Ensure category is selected
- Try saving again

---

## Data Storage

All data is stored in **Firebase Firestore**:
- **Products** collection - All product information
- **PlatformLinks** collection - Product-to-platform mappings
- **Deals** collection - Deal information
- **Coupons** collection - Coupon codes
- **Analytics** collection - User activity tracking

---

## Questions?

### Where to find help:
1. Check browser console (F12) for error messages
2. Verify all form fields are filled correctly
3. Refresh page if data doesn't appear
4. Check internet connection
5. Try a different browser or device

---

**Admin Panel is Live!** 🚀

Access it now: **http://localhost:3000/#/admin**

No login needed. Start managing products, deals, and coupons immediately!

---

## Quick Checklist

- [ ] Navigate to http://localhost:3000/#/admin
- [ ] Verify icons are displaying correctly
- [ ] Create a test product
- [ ] Add a platform link
- [ ] View product in admin
- [ ] Create a deal
- [ ] Create a coupon
- [ ] Check dashboard stats
- [ ] Verify all tabs work

✅ If all checks pass, admin panel is working perfectly!

---

**Last Updated**: February 2, 2026
**Status**: ✅ LIVE & READY
