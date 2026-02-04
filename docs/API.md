# FreshDeals - API Reference

## Base URLs

- **Development Backend:** `http://localhost:5000`
- **Development Frontend:** `http://localhost:3000`

---

## Public APIs (No Authentication Required)

### 🎁 Deals Endpoints

#### 1. Get Today's Deals
```http
GET /api/deals/today?limit=20
```

**Query Parameters:**
- `limit` (optional, default: 20) - Number of deals to return

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "productId": "123e4567-e89b-12d3-a456-426614174001",
      "title": "iPhone 15 Pro - Best Price",
      "description": "Limited time offer on Apple iPhone",
      "discount": 15,
      "originalPrice": 99999,
      "dealPrice": 84999,
      "platform": "amazon",
      "affiliateLink": "https://amazon.in/dp/B0BLQNQ7QK?tag=yourname-20",
      "expiryDate": "2024-02-15T23:59:59Z",
      "status": "active",
      "isVisible": true,
      "clicks": 245,
      "createdAt": "2024-02-01T10:00:00Z",
      "updatedAt": "2024-02-01T10:00:00Z"
    }
  ]
}
```

---

#### 2. Get Deals by Category
```http
GET /api/deals/category?category=electronics&limit=20
```

**Query Parameters:**
- `category` (required) - Category name
- `limit` (optional, default: 20) - Number of deals to return

**Valid Categories:**
- `electronics`
- `fashion`
- `home_appliances`
- `books`
- `beauty`
- `groceries`
- `sports`
- `toys`
- `others`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [ /* array of deals */ ]
}
```

---

#### 3. Get Deal Details
```http
GET /api/deals/:dealId/details
```

**Path Parameters:**
- `dealId` - Deal ID (UUID)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "deal": { /* deal object */ },
    "product": { /* product object */ },
    "prices": [ /* array of platform prices */ ]
  }
}
```

**Error Response:** `404 Not Found`
```json
{
  "error": "Deal not found"
}
```

---

#### 4. Track Deal Click
```http
POST /api/deals/:dealId/track-click
```

**Path Parameters:**
- `dealId` - Deal ID (UUID)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Click tracked"
}
```

---

#### 5. Get Product with Price Comparison
```http
GET /api/deals/product/:productId/comparison
```

**Path Parameters:**
- `productId` - Product ID (UUID)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "product": {
      "id": "123e4567-e89b-12d3-a456-426614174001",
      "name": "iPhone 15 Pro",
      "description": "256GB, Black",
      "imageUrl": "https://...",
      "category": "electronics",
      "tags": ["phone", "apple", "premium"],
      "isVisible": true,
      "createdAt": "2024-02-01T10:00:00Z",
      "updatedAt": "2024-02-01T10:00:00Z"
    },
    "prices": [
      {
        "platform": "amazon",
        "price": 84999,
        "currency": "INR",
        "inStock": true,
        "lastUpdated": "2024-02-01T10:00:00Z"
      },
      {
        "platform": "flipkart",
        "price": 85499,
        "currency": "INR",
        "inStock": true,
        "lastUpdated": "2024-02-01T10:00:00Z"
      }
    ],
    "deals": [ /* array of deals for this product */ ],
    "lowestPrice": 84999
  }
}
```

---

## Admin APIs (Requires X-Admin-Secret Header)

**Authentication Header:**
```
X-Admin-Secret: your_admin_secret_key
```

### 📦 Product Management

#### 1. Create Product
```http
POST /api/admin/products
X-Admin-Secret: your_admin_secret_key
Content-Type: application/json

{
  "name": "iPhone 15 Pro",
  "description": "256GB, Black, Space black color",
  "imageUrl": "https://example.com/image.jpg",
  "category": "electronics",
  "tags": ["phone", "apple", "premium"],
  "isVisible": true
}
```

**Required Fields:**
- `name`
- `category`

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000"
  }
}
```

**Error Response:** `400 Bad Request`
```json
{
  "error": "Name and category are required"
}
```

---

#### 2. Update Product
```http
PUT /api/admin/products/:productId
X-Admin-Secret: your_admin_secret_key
Content-Type: application/json

{
  "name": "iPhone 15 Pro",
  "description": "Updated description",
  "isVisible": true
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Product updated"
}
```

---

### 🎁 Deal Management

#### 1. Create Deal
```http
POST /api/admin/deals
X-Admin-Secret: your_admin_secret_key
Content-Type: application/json

{
  "productId": "123e4567-e89b-12d3-a456-426614174001",
  "title": "iPhone 15 Pro at Best Price",
  "description": "Limited time offer",
  "discount": 15,
  "originalPrice": 99999,
  "dealPrice": 84999,
  "platform": "amazon",
  "affiliateLink": "https://amazon.in/dp/B0BLQNQ7QK?tag=yourname-20",
  "expiryDate": "2024-02-15T23:59:59Z",
  "status": "active"
}
```

**Required Fields:**
- `productId`
- `title`
- `platform`
- `affiliateLink`

**Valid Platforms:**
- `amazon`
- `flipkart`
- `cuelinks`
- `vcommission`

**Valid Status Values:**
- `active`
- `expired`
- `coming_soon`
- `archived`

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174002"
  }
}
```

---

#### 2. Update Deal
```http
PUT /api/admin/deals/:dealId
X-Admin-Secret: your_admin_secret_key
Content-Type: application/json

{
  "title": "Updated title",
  "dealPrice": 79999,
  "status": "active"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Deal updated"
}
```

---

#### 3. Delete Deal
```http
DELETE /api/admin/deals/:dealId
X-Admin-Secret: your_admin_secret_key
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Deal deleted"
}
```

---

### 🎟️ Coupon Management

#### 1. Create Coupon
```http
POST /api/admin/coupons
X-Admin-Secret: your_admin_secret_key
Content-Type: application/json

{
  "code": "SAVE20",
  "description": "Save 20% on all electronics",
  "discount": 20,
  "discountType": "percentage",
  "applicablePlatforms": ["amazon", "flipkart"],
  "expiryDate": "2024-03-01T23:59:59Z",
  "maxUses": 100
}
```

**Required Fields:**
- `code`
- `discount`
- `discountType`
- `expiryDate`

**Discount Types:**
- `percentage` - Percentage discount (e.g., 20%)
- `fixed` - Fixed amount discount (e.g., ₹500)

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174003"
  }
}
```

---

#### 2. Update Coupon
```http
PUT /api/admin/coupons/:couponId
X-Admin-Secret: your_admin_secret_key
Content-Type: application/json

{
  "discount": 25,
  "maxUses": 150
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Coupon updated"
}
```

---

#### 3. Delete Coupon
```http
DELETE /api/admin/coupons/:couponId
X-Admin-Secret: your_admin_secret_key
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Coupon deleted"
}
```

---

### ⚙️ Affiliate Settings

#### 1. Get Affiliate Settings
```http
GET /api/admin/affiliate-settings
X-Admin-Secret: your_admin_secret_key
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "amazon": {
      "isEnabled": true,
      "associateTag": "yourname-20",
      "accessKey": "...",
      "secretKey": "...",
      "updatedAt": "2024-02-01T10:00:00Z"
    },
    "flipkart": {
      "isEnabled": true,
      "affiliateId": "...",
      "apiToken": "...",
      "updatedAt": "2024-02-01T10:00:00Z"
    },
    "cuelinks": {
      "isEnabled": true,
      "apiKey": "...",
      "updatedAt": "2024-02-01T10:00:00Z"
    }
  }
}
```

---

#### 2. Update Affiliate Settings
```http
PUT /api/admin/affiliate-settings
X-Admin-Secret: your_admin_secret_key
Content-Type: application/json

{
  "platform": "amazon",
  "settings": {
    "isEnabled": true,
    "associateTag": "yourname-20",
    "accessKey": "YOUR_ACCESS_KEY",
    "secretKey": "YOUR_SECRET_KEY"
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Affiliate settings updated"
}
```

---

### 💰 Platform Prices

#### 1. Update Platform Price
```http
POST /api/admin/platform-prices
X-Admin-Secret: your_admin_secret_key
Content-Type: application/json

{
  "productId": "123e4567-e89b-12d3-a456-426614174001",
  "platform": "amazon",
  "price": 84999,
  "currency": "INR",
  "inStock": true,
  "url": "https://amazon.in/dp/B0BLQNQ7QK"
}
```

**Required Fields:**
- `productId`
- `platform`
- `price`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174004"
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "error": "No token provided"
}
```

### 403 Forbidden
```json
{
  "error": "Invalid admin secret"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error"
}
```

---

## Rate Limiting

Currently not implemented. Will be added in Phase-2.

---

## Testing with cURL

### Get Today's Deals
```bash
curl -X GET "http://localhost:5000/api/deals/today?limit=5"
```

### Create Deal (Admin)
```bash
curl -X POST "http://localhost:5000/api/admin/deals" \
  -H "X-Admin-Secret: your_admin_secret_key" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "123e4567-e89b-12d3-a456-426614174001",
    "title": "Test Deal",
    "platform": "amazon",
    "affiliateLink": "https://amazon.in/...",
    "dealPrice": 999,
    "expiryDate": "2024-02-15T23:59:59Z"
  }'
```

---

## Testing with Postman

1. Import the collection from `docs/FreshDeals.postman_collection.json`
2. Set environment variables for `base_url` and `admin_secret`
3. Run requests from the collection

---

**Last Updated:** February 1, 2024
**Version:** 1.0.0
