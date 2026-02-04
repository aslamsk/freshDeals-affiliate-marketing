# FreshDeals - Security & Compliance Guide

## 🔐 Security Best Practices

### 1. Affiliate Link Security

#### URL Validation
- Always validate affiliate links before storing
- Use HTTPS only
- Check for URL encoding/decoding attacks

```javascript
// Example validation
const isValidAffiliateLink = (url) => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'https:' && 
           ['amazon.in', 'flipkart.com'].some(domain => 
             parsedUrl.hostname.includes(domain)
           );
  } catch (e) {
    return false;
  }
};
```

#### Disclosure
- Always display affiliate disclaimer
- Add "affiliate link" badge to deal cards
- Include privacy policy link in footer

### 2. Admin Secret Management

#### Best Practices
- ✅ Generate strong random keys (32+ characters)
- ✅ Rotate keys monthly
- ✅ Store in environment variables only
- ✅ Never commit to Git
- ✅ Use different keys for dev/staging/prod

#### Implementation
```javascript
// Generate strong admin key
const crypto = require('crypto');
const adminSecret = crypto.randomBytes(32).toString('hex');
console.log(`ADMIN_SECRET_KEY=${adminSecret}`);
```

### 3. Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read access for deals and products
    match /products/{productId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /deals/{dealId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Price history - admin only
    match /price_history/{priceId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
    
    // Settings - admin only
    match /settings/{settingId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
    
    // Analytics - admin only
    match /analytics/{analyticId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
    
    // Helper function
    function isAdmin() {
      return request.auth.token.admin == true;
    }
  }
}
```

### 4. API Security

#### Rate Limiting (Phase-2)
```javascript
// Example with express-rate-limit
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

#### CORS Configuration
```javascript
import cors from 'cors';

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Admin-Secret'],
};

app.use(cors(corsOptions));
```

#### Input Validation
```javascript
// Sanitize input
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim()
    .substring(0, 1000); // Limit length
};
```

### 5. Authentication (Phase-2)

#### Firebase Authentication
```javascript
// Enable Firebase Auth with OAuth
import { initializeAuth, connectAuthEmulator } from 'firebase/auth';

export const auth = initializeAuth(app);

if (location.hostname === 'localhost') {
  connectAuthEmulator(auth, 'http://localhost:9099');
}
```

---

## 📋 Affiliate Compliance

### 1. Amazon Associates Program

#### Requirements
- ✅ FTC Disclosure (disclose affiliate relationship)
- ✅ Valid Associate Tag (e.g., `yourname-20`)
- ✅ No price manipulation
- ✅ No deep linking to search results
- ✅ Comply with Product Advertising API ToS

#### Violations to Avoid
- ❌ Scraping product data
- ❌ Misleading claims ("Cheapest price", "Best deal")
- ❌ Cookie stuffing
- ❌ Redirecting via masked links
- ❌ Incentivizing clicks

#### Disclosure Example
```html
<div class="affiliate-notice">
  ⓘ FreshDeals is an Amazon Associate. 
  As an Amazon Associate, we earn from qualifying purchases.
  <a href="/privacy">Privacy Policy</a>
</div>
```

### 2. Flipkart Affiliate Program

#### Requirements
- ✅ Approved membership status
- ✅ Valid Affiliate ID
- ✅ No prohibited claims
- ✅ Monthly traffic minimum

#### Prohibited Content
- ❌ Adult content
- ❌ Illegal activity promotion
- ❌ Spam/malware distribution
- ❌ Price comparison without consent

### 3. Cuelinks / vCommission

#### Requirements
- ✅ Valid API credentials
- ✅ Tracked link usage only
- ✅ No clickjacking
- ✅ Compliance with partner policies

---

## 🎯 FTC Compliance (USA) & ASCI Code (India)

### Disclaimer Placement

**Required:**
- Clear, conspicuous disclosure
- Before the affiliate link
- Not hidden in fine print

**Example:**
```vue
<template>
  <div class="deal-card">
    <v-banner icon="mdi-information" color="info" class="mb-2">
      {{ $t('product.affirmativeDisclamer') }}
    </v-banner>
    <a :href="deal.affiliateLink" target="_blank">
      {{ $t('common.viewDeal') }}
    </a>
  </div>
</template>
```

### Privacy Policy

**Must Include:**
- What data you collect
- How you use affiliate links
- Google AdSense policies (if used)
- Contact information

**Template:** `/docs/PRIVACY_POLICY.md`

### Terms of Service

**Must Include:**
- Affiliate relationship disclosure
- Limitation of liability
- Modification rights
- Dispute resolution

---

## 📊 Monitoring & Audit

### Track These Metrics

1. **Click Fraud Detection**
   - Same IP multiple clicks
   - Suspicious user agents
   - Abnormal click patterns

2. **Link Performance**
   - Valid destination URLs
   - 404 error tracking
   - Redirect chains

3. **Compliance Audit**
   - Affiliate link count
   - Disclaimer frequency
   - Policy updates

### Audit Query (Firestore)

```javascript
// Check deals for proper affiliate links
const auditAffiliateLinks = async () => {
  const deals = await db.collection('deals').get();
  
  const invalid = deals.docs.filter(doc => {
    const deal = doc.data();
    return !isValidAffiliateLink(deal.affiliateLink);
  });
  
  console.log(`Found ${invalid.length} invalid affiliate links`);
};
```

---

## 🚨 Incident Response

### If Amazon/Flipkart Flags Your Account

1. **Immediate Actions:**
   - Stop new deal creation
   - Review recent changes
   - Check affiliate link format

2. **Investigation:**
   - Query analytics for abnormal activity
   - Review user complaints
   - Audit all affiliate links

3. **Resolution:**
   - Document all changes
   - Request appeal with evidence
   - Implement additional safeguards

### Escalation Contacts

- **Amazon:** Amazon Affiliate Support (via console)
- **Flipkart:** Flipkart Affiliate Manager
- **Legal:** Consult affiliate-law specialist if needed

---

## 🔄 Policy Updates

### When to Revise

- ✅ Platform policy changes
- ✅ New affiliate programs added
- ✅ Legal requirement changes
- ✅ Quarterly security audit

### Version Control

```markdown
## Changelog

### 2024-02-01 (v1.0.0)
- Initial release
- Amazon, Flipkart, Cuelinks integration
- FTC compliance measures

### 2024-03-01 (v1.1.0)
- Added vCommission support
- Enhanced disclaimer UI
- Improved fraud detection
```

---

## ✅ Compliance Checklist

- [ ] All affiliate links include proper disclosure
- [ ] Privacy policy is accessible
- [ ] Terms of Service defines affiliate relationship
- [ ] Affiliate settings stored securely
- [ ] Admin secret key rotated monthly
- [ ] No price manipulation detected
- [ ] No misleading claims in deal titles
- [ ] Firestore security rules implemented
- [ ] API rate limiting configured
- [ ] Input validation on all endpoints
- [ ] Monthly audit of affiliate links
- [ ] User data handled per GDPR/privacy laws

---

**Last Updated:** February 1, 2024
**Compliance Level:** Affiliate Program Safe ✅
