# 💻 FreshDeals Quick Start & Code Examples

## 🚀 5-Minute Quick Start

### 1. Start Development Server
```bash
cd d:\Aslam\freshdeals
npm install
npm run dev
```

### 2. Access the Platform
- **Public Site:** http://localhost:5173/
- **Admin Login:** http://localhost:5173/admin/login
- **Admin Dashboard:** http://localhost:5173/admin/dashboard

### 3. Test Admin Features
```
Email: admin@freshdeals.com
Password: password123
```

---

## 📚 Code Examples

### Example 1: Create a Deal (Frontend)

```javascript
// In AdminDealManager.vue component

import { dealManagementService } from '@/services/dealManagementService';

async function handleCreateDeal() {
  const dealData = {
    title: "50% Off Samsung Smart TV",
    description: "Huge discount on latest Samsung 55-inch 4K TV",
    image: "https://images.example.com/tv.jpg",
    originalPrice: 50000,
    dealPrice: 25000,
    category: "Electronics",
    platform: "Amazon",
    tags: ["TV", "Electronics", "Hot Deal"],
    affiliateUrl: "https://amazon.in/Samsung-TV?tag=freshdeals-21",
    affiliateNetwork: "Amazon Associates",
    affiliateCommissionRate: 5,
    expiresAt: "2024-02-28",
    isVisibleOnHomepage: true
  };

  try {
    const deal = await dealManagementService.createDeal(
      dealData, 
      'admin_user_id'  // Current admin ID
    );
    
    console.log('✅ Deal created:', deal);
    // Deal now has:
    // - Discount automatically calculated: 50%
    // - Slug generated: "50-off-samsung-smart-tv"
    // - Timestamps: createdAt, updatedAt
    // - Metrics initialized: clicks=0, conversions=0, earnings=0
    // - Audit logged: createdBy, createdAt
  } catch (error) {
    console.error('❌ Failed to create deal:', error);
  }
}
```

### Example 2: Track a Deal Click (Frontend)

```javascript
// In DealCard.vue or any deal display component

import { dealManagementService } from '@/services/dealManagementService';

async function handleDealClick(dealId) {
  try {
    await dealManagementService.trackDealClick(dealId, {
      userAgent: navigator.userAgent,
      source: 'homepage',  // Where user clicked from
      referrer: document.referrer
    });
    
    // Now navigate to affiliate URL
    window.open(deal.affiliateUrl, '_blank');
  } catch (error) {
    console.error('❌ Failed to track click:', error);
    // Still navigate even if tracking fails
    window.open(deal.affiliateUrl, '_blank');
  }
}
```

### Example 3: Admin Login Flow

```javascript
// In AdminLoginPage.vue

import { adminAuthService } from '@/services/adminAuthService';
import { useRouter } from 'vue-router';

const router = useRouter();
const email = ref('');
const password = ref('');

async function handleLogin() {
  try {
    // Step 1: Authenticate with Firebase
    // Step 2: Verify admin role in Firestore
    // Step 3: Check admin status is 'active'
    const result = await adminAuthService.adminLogin(
      email.value,
      password.value
    );

    if (result.success) {
      console.log('✅ Login successful');
      console.log('Admin name:', result.admin.name);
      console.log('Admin role:', result.admin.role);
      
      // Token automatically stored in localStorage
      localStorage.setItem('admin_token', result.token);
      
      // Activity logged automatically
      // Firestore: admin_activity_logs/[log_id]
      // {
      //   adminId: result.admin.uid,
      //   action: 'login',
      //   timestamp: now(),
      //   ipAddress: '[captured server-side]'
      // }
      
      // Redirect to dashboard
      router.push('/admin/dashboard');
    }
  } catch (error) {
    console.error('❌ Login failed:', error);
  }
}
```

### Example 4: Query Deals with Filters

```javascript
// In AdminDealManager.vue

import { dealManagementService } from '@/services/dealManagementService';

async function fetchDeals() {
  try {
    const deals = await dealManagementService.getDealsWithFilters({
      status: 'active',           // Only active deals
      category: 'Electronics',    // Filter by category
      platform: 'Amazon',         // Filter by platform
      search: 'Samsung',          // Search in title/description
      limit: 20,                  // Pagination
      offset: 0,                  // Start from 0
      orderBy: 'createdAt',       // Sort by created date
      direction: 'desc'           // Newest first
    });

    console.log('Found deals:', deals.length);
    // deals = [
    //   {
    //     id: 'deal_123',
    //     title: 'Samsung Smart TV',
    //     dealPrice: 25000,
    //     originalPrice: 50000,
    //     discount: 50,
    //     clicks: 145,
    //     conversions: 12,
    //     earnings: 2500,
    //     ...
    //   },
    //   ...
    // ]
  } catch (error) {
    console.error('❌ Failed to fetch deals:', error);
  }
}
```

### Example 5: Sync Conversions from Affiliate

```javascript
// Called when receiving conversion data from affiliate network

import { dealManagementService } from '@/services/dealManagementService';

async function handleConversionCallback(dealId, conversionData) {
  try {
    await dealManagementService.syncConversionsFromAffiliate(
      dealId,
      {
        count: 3,              // 3 conversions
        earnings: 1500,        // ₹1,500 total
        source: 'amazon_api'   // Where data came from
      }
    );

    console.log('✅ Conversions synced');
    // Deal now has updated:
    // - conversions += 3
    // - earnings += 1500
    // - Logged in conversion_syncs collection
  } catch (error) {
    console.error('❌ Failed to sync conversions:', error);
  }
}
```

### Example 6: Get Deal Analytics

```javascript
// In analytics view or dashboard

import { dealManagementService } from '@/services/dealManagementService';

async function loadDealAnalytics(dealId) {
  try {
    const analytics = await dealManagementService.getDealAnalytics(dealId);
    
    console.log('Analytics for deal:', analytics);
    // Returns:
    // {
    //   dealId: 'deal_123',
    //   clicks: 145,
    //   conversions: 12,
    //   conversionRate: 8.28,    // (12/145) * 100
    //   earnings: 2500,
    //   earningsPerClick: 17.24, // 2500/145
    //   lastViewedAt: timestamp,
    //   avgTimeOnPage: 45,       // seconds
    //   bounceRate: 35           // percentage
    // }

    // Display metrics
    console.log(`Conversion Rate: ${analytics.conversionRate}%`);
    console.log(`Earnings per Click: ₹${analytics.earningsPerClick}`);
  } catch (error) {
    console.error('❌ Failed to get analytics:', error);
  }
}
```

### Example 7: Check Admin Permissions

```javascript
// In any admin component that needs permission check

import { adminAuthService } from '@/services/adminAuthService';

async function canDeleteDeal() {
  const adminId = 'current_admin_id';
  
  const hasPermission = await adminAuthService.hasPermission(
    adminId,
    'delete_deals'  // Required permission
  );

  if (hasPermission) {
    // Show delete button
    canShowDeleteButton.value = true;
  } else {
    // Hide delete button or show "no permission" message
    canShowDeleteButton.value = false;
  }
}

// Permission hierarchy:
// super_admin:  ALL permissions
// admin:        create_deals, update_deals, delete_deals, manage_affiliates, view_analytics
// manager:      create_deals, update_deals, view_analytics
// editor:       create_deals, update_deals
// viewer:       view_analytics (read-only)
```

### Example 8: Validate Affiliate URL

```javascript
// When user enters affiliate URL in form

import { affiliateManager } from '@/services/affiliateNetworkService';

function validateAffiliateUrl(url) {
  // Check if URL is valid for any affiliate network
  const isValid = affiliateManager.validateAffiliateUrl(url);
  
  if (!isValid) {
    console.error('❌ Invalid affiliate URL format');
    return false;
  }

  // Extract network from URL
  const network = affiliateManager.extractNetwork(url);
  console.log('Network detected:', network);
  // Returns: 'amazon_associates', 'flipkart_affiliate', 'myntra_affiliate', or 'unknown'

  return true;
}

// Valid URL examples:
// Amazon: https://amazon.in/product?tag=freshdeals-21
// Flipkart: https://flipkart.com/product?affid=freshdeals
// Myntra: https://myntra.com/product?aff=freshdeals
```

### Example 9: Soft Delete a Deal

```javascript
// Delete deal but keep in database for audit trail

import { dealManagementService } from '@/services/dealManagementService';

async function deleteDealWithReason(dealId) {
  try {
    const result = await dealManagementService.deleteDeal(
      dealId,
      'admin_user_id',
      'Duplicate deal - found better source'  // Reason for deletion
    );

    console.log('✅ Deal soft deleted');
    // In Firestore, deal now has:
    // {
    //   ...all original fields...
    //   status: 'deleted',
    //   deletedBy: 'admin_user_id',
    //   deletedAt: timestamp,
    //   deletionReason: 'Duplicate deal - found better source'
    // }

    // Original data preserved for:
    // - Audit trail
    // - Recovery if needed
    // - Analytics (historical data)
    // - Compliance requirements
  } catch (error) {
    console.error('❌ Failed to delete deal:', error);
  }
}
```

### Example 10: Sync All Affiliate Networks

```javascript
// Daily/Hourly background sync job

import { affiliateManager } from '@/services/affiliateNetworkService';

async function syncAllAffiliates() {
  try {
    const results = await affiliateManager.syncAllAccounts('admin_user_id');

    console.log('Sync Results:', {
      successful: results.successful,      // 2
      failed: results.failed,              // 0
      totalEarnings: results.totalEarnings // ₹45,320
    });

    // Detailed error info if some failed
    results.errors.forEach(error => {
      console.error(
        `❌ ${error.provider} failed:`,
        error.error
      );
    });

    // Logged in Firestore: bulk_syncs/[sync_id]
    // {
    //   adminId: 'admin_user_id',
    //   results: {...},
    //   timestamp: now()
    // }
  } catch (error) {
    console.error('❌ Bulk sync failed:', error);
  }
}
```

---

## 🔐 Security Examples

### Example 1: Route Protection with Auth Guard

```javascript
// In router/index.js (already configured)

const routes = [
  {
    path: '/admin/dashboard',
    name: 'admin-dashboard',
    component: AdminDashboard,
    beforeEnter: adminAuthGuard  // Protected route
  },
  {
    path: '/admin/deals',
    name: 'admin-deals',
    component: AdminDealManager,
    meta: { requiredPermission: 'create_deals' },  // Needs specific permission
    beforeEnter: adminAuthGuard
  }
];

// What happens:
// 1. User tries to access /admin/dashboard
// 2. adminAuthGuard runs BEFORE component loads
// 3. Checks if user is authenticated
// 4. Checks required permissions
// 5. Allows access or redirects to /admin/login
```

### Example 2: Input Validation

```javascript
// In dealManagementService.js (already implemented)

const validateDealData = (dealData) => {
  const errors = [];

  // Title validation
  if (!dealData.title || dealData.title.length < 3) {
    errors.push('Title must be at least 3 characters');
  }

  // Price validation
  if (!dealData.originalPrice || dealData.originalPrice <= 0) {
    errors.push('Original price must be greater than 0');
  }
  if (!dealData.dealPrice || dealData.dealPrice >= dealData.originalPrice) {
    errors.push('Deal price must be less than original price');
  }

  // URL validation
  if (!isValidUrl(dealData.affiliateUrl)) {
    errors.push('Invalid affiliate URL format');
  }

  if (errors.length > 0) {
    throw new Error(errors.join('; '));
  }

  return true;
};

// Usage:
try {
  validateDealData(userInput);
  // Process deal...
} catch (error) {
  console.error('Validation failed:', error.message);
  // Show error to user
}
```

---

## 📊 Database Queries Reference

### Get All Active Deals

```javascript
// Firestore Query
db.collection('deals')
  .where('status', '==', 'active')
  .where('expiresAt', '>', new Date())
  .orderBy('createdAt', 'desc')
  .limit(50)
  .get()
```

### Get Deals by Category

```javascript
db.collection('deals')
  .where('category', '==', 'Electronics')
  .where('status', '==', 'active')
  .orderBy('clicks', 'desc')
  .get()
```

### Get Admin Activity Log

```javascript
db.collection('admin_activity_logs')
  .where('adminId', '==', 'user_123')
  .orderBy('timestamp', 'desc')
  .limit(100)
  .get()
```

### Get All Conversions for Deal

```javascript
db.collection('conversion_syncs')
  .where('dealId', '==', 'deal_123')
  .orderBy('syncedAt', 'desc')
  .get()
```

---

## 🧪 Testing Examples

### Test Admin Login

```javascript
// In your test file
import { adminAuthService } from '@/services/adminAuthService';

describe('Admin Authentication', () => {
  test('should login with valid credentials', async () => {
    const result = await adminAuthService.adminLogin(
      'admin@freshdeals.com',
      'password123'
    );
    
    expect(result.success).toBe(true);
    expect(result.admin.role).toBeDefined();
    expect(localStorage.getItem('admin_token')).toBeTruthy();
  });

  test('should reject invalid password', async () => {
    try {
      await adminAuthService.adminLogin(
        'admin@freshdeals.com',
        'wrongpassword'
      );
      fail('Should have thrown error');
    } catch (error) {
      expect(error.code).toBe('auth/wrong-password');
    }
  });
});
```

### Test Deal Creation

```javascript
import { dealManagementService } from '@/services/dealManagementService';

describe('Deal Management', () => {
  test('should create deal with valid data', async () => {
    const deal = await dealManagementService.createDeal(
      {
        title: 'Test Deal',
        originalPrice: 1000,
        dealPrice: 500,
        category: 'Electronics',
        platform: 'Amazon',
        affiliateUrl: 'https://amazon.in/test?tag=fresh',
        affiliateNetwork: 'Amazon Associates'
      },
      'admin_123'
    );
    
    expect(deal.id).toBeDefined();
    expect(deal.discount).toBe(50);
    expect(deal.slug).toBe('test-deal');
  });

  test('should reject invalid prices', async () => {
    try {
      await dealManagementService.createDeal(
        {
          title: 'Test',
          originalPrice: 1000,
          dealPrice: 2000,  // More than original!
          category: 'Electronics',
          platform: 'Amazon',
          affiliateUrl: 'https://amazon.in/test?tag=fresh'
        },
        'admin_123'
      );
      fail('Should have thrown error');
    } catch (error) {
      expect(error.message).toContain('Deal price must be less');
    }
  });
});
```

---

## 🚀 Deployment Checklist

Before deploying to production:

```
Security:
  ☐ Firebase Firestore rules properly configured
  ☐ Auth is required for all admin routes
  ☐ API keys not exposed in code
  ☐ HTTPS enabled
  ☐ Sensitive data encrypted in Firestore

Performance:
  ☐ Lazy loading enabled for components
  ☐ Images optimized and compressed
  ☐ Bundle size < 500KB (uncompressed)
  ☐ Firestore indexes created
  ☐ CDN configured for static assets

Data:
  ☐ Database backup configured
  ☐ Disaster recovery plan documented
  ☐ Data retention policy set
  ☐ GDPR compliance checked

Testing:
  ☐ All admin functions tested
  ☐ All affiliate networks tested
  ☐ Mobile responsiveness verified
  ☐ Error handling tested
  ☐ Load testing done

Documentation:
  ☐ Setup guide updated
  ☐ API documentation complete
  ☐ Admin manual created
  ☐ Troubleshooting guide written
  ☐ Emergency procedures documented
```

---

## 📞 Support Commands

```bash
# Check dev server status
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests (if configured)
npm run test

# Lint code
npm run lint

# Format code
npm run format
```

---

**Ready to Build?** Start with Phase 4 - Affiliate Network API Integration 🚀
