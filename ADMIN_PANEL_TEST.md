# Admin Panel Test URLs

The FreshDeals Admin Panel is now live! Here are the key endpoints:

## Access Points

### Main URL
- **Frontend**: http://localhost:3000/

### Admin Panel Routes  
- **Admin Dashboard**: http://localhost:3000/#/admin
- **Products Manager**: Tab in admin panel
- **Platform Manager**: Tab in admin panel
- **Deals Manager**: Tab in admin panel
- **Coupons Manager**: Tab in admin panel
- **Notifications Manager**: Tab in admin panel
- **Analytics Viewer**: Tab in admin panel

## Testing the Admin Panel

1. **Navigate to Admin Panel**:
   - Open http://localhost:3000/#/admin in browser
   - Note: You must have Firebase admin token set to access

2. **Test Product Creation**:
   - Click "Add Product" button
   - Fill form: title_en, title_te, image URL, category, checkbox options
   - Click "Save"
   - Product appears in data table

3. **Test Platform Linking**:
   - In Product Manager, click "View Platforms" button
   - Select platform (Amazon, Flipkart, etc.)
   - Fill platform-specific fields (ASIN, SKU, or URL)
   - Click "Add Link"
   - Link appears in existing links table

4. **Test Deal Creation**:
   - Click "Deals" tab
   - Click "Create Deal" button
   - Select product, enter prices, discount, status
   - Click "Save"

5. **Test Analytics**:
   - Click "Analytics" tab
   - View recent events and top clicked products
   - Auto-refreshes every 60 seconds

## Database Collections Created

- **products**: Base product information
- **platformLinks**: Links to affiliate platforms per product
- **deals**: Promotional deals
- **coupons**: Discount codes
- **push_notifications**: Push notification records
- **push_logs**: Logs of sent notifications
- **analytics_events**: User interaction events

## Dashboard Stats

The dashboard shows real-time counts:
- **Total Products**: Count of all products
- **Platform Links**: Count of platform links across products
- **Active Deals**: Count of deals with status='ACTIVE'
- **Active Coupons**: Count of coupons with isActive=true

## Security

⚠️ **Admin-Only Access**:
- Routes protected by Firestore rules
- Custom claim `admin: true` required
- Firestore rules enforce writes to admin users only

## Notes

✅ **Build**: Success (655 modules)
✅ **Dev Server**: Running on port 3000
✅ **Components**: All 8 admin components created
✅ **Services**: firebaseAdminService fully implemented
✅ **Security Rules**: Updated and ready to deploy

⏳ **Pending**:
- Firebase security rules deployment (via Firebase CLI)
- Admin claim setup for test users
- Cloud Functions for API price sync

## Common Issues & Solutions

### Issue: "Cannot access /admin"
- **Solution**: Check if Firebase admin token is properly set
- Set admin claim via Firebase Console → Authentication → Custom Claims

### Issue: "Firestore operation not allowed"
- **Solution**: Deploy updated firestore.rules
- Command: `firebase deploy --only firestore:rules`

### Issue: Component not found errors
- **Solution**: Ensure all component files exist in src/components/admin/
- Run: `npm run build` to verify all imports resolve

---

**Status**: ✅ Ready for Testing
**Last Updated**: 2024
**Dev Server**: http://localhost:3000/
