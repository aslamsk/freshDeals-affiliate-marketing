/**
 * Firestore Data Seeding Script
 * Run this ONCE to populate Firestore with sample data
 * 
 * Usage:
 * 1. In browser console (http://localhost:3000):
 *    import { seedFirestore } from './utils/seedFirestore.js'
 *    seedFirestore()
 * 
 * OR use in a Node script
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  doc,
  serverTimestamp,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let db;

const initDB = () => {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log('✅ Firebase initialized for seeding');
    return true;
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    return false;
  }
};

/**
 * STEP 1A: Seed Products (5 docs)
 */
const seedProducts = async () => {
  console.log('📦 Seeding Products...');
  
  const products = [
    {
      title_en: 'Wireless Headphones Pro',
      title_te: 'వైర్లెస్ హెడ్‌ఫోన్ల ప్రో',
      description_en: 'High-quality wireless headphones with noise cancellation',
      description_te: 'శబ్దం రద్దు చేసే వైర్లెస్ హెడ్‌ఫోన్లు',
      image: 'https://dummyimage.com/600x600/FF6B35/ffffff?text=Headphones',
      category: 'electronics',
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      title_en: 'Smart Watch Ultra',
      title_te: 'స్మార్ట్ వాచ్ అల్ట్రా',
      description_en: 'Latest smartwatch with health tracking',
      description_te: 'ఆరోగ్య ట్రాకింగ్ ఉన్న తాజా స్మార్ట్ వాచ్',
      image: 'https://dummyimage.com/600x600/FF6B35/ffffff?text=SmartWatch',
      category: 'electronics',
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      title_en: 'USB-C Fast Charger',
      title_te: 'USB-C వేగవంతమైన చార్జర్',
      description_en: '65W USB-C fast charging adapter',
      description_te: '65W USB-C వేగవంతమైన చార్జింగ్ అడాప్టర్',
      image: 'https://dummyimage.com/600x600/FF6B35/ffffff?text=Charger',
      category: 'accessories',
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      title_en: 'Mobile Phone Stand',
      title_te: 'మొబైల్ ఫోన్ స్టాండ్',
      description_en: 'Adjustable phone stand for desk',
      description_te: 'డెస్క్ కోసం సర్దుబాటు చేయదగిన ఫోన్ స్టాండ్',
      image: 'https://dummyimage.com/600x600/FF6B35/ffffff?text=PhoneStand',
      category: 'accessories',
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      title_en: 'Portable Speaker',
      title_te: 'పోర్టబుల్ స్పీకర్',
      description_en: 'Waterproof Bluetooth speaker',
      description_te: 'జలనిరోధక బ్లూటూత్ స్పీకర్',
      image: 'https://dummyimage.com/600x600/FF6B35/ffffff?text=Speaker',
      category: 'audio',
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  ];

  const productIds = [];
  
  for (const product of products) {
    try {
      const docRef = await addDoc(collection(db, 'products'), product);
      productIds.push(docRef.id);
      console.log(`✅ Product added: ${product.title_en} (ID: ${docRef.id})`);
    } catch (error) {
      console.error(`❌ Error adding product ${product.title_en}:`, error);
    }
  }

  return productIds;
};

/**
 * STEP 1B: Seed Prices (10+ docs - 2 platforms per product)
 */
const seedPrices = async (productIds) => {
  console.log('💰 Seeding Prices...');

  const platforms = ['amazon', 'flipkart'];
  const basePrice = 1999;

  for (let i = 0; i < productIds.length; i++) {
    const productId = productIds[i];
    
    for (const platform of platforms) {
      const price = basePrice + (i * 500) + (Math.random() * 200);
      
      try {
        const priceDoc = {
          productId,
          platform,
          price: Math.round(price),
          affiliateUrl: `https://affiliate.example.com/${platform}/${productId}?ref=freshdeals`,
          lastSyncedAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, 'prices'), priceDoc);
        console.log(`✅ Price added: ${productId} on ${platform} = ₹${Math.round(price)}`);
      } catch (error) {
        console.error(`❌ Error adding price for ${productId} on ${platform}:`, error);
      }
    }
  }
};

/**
 * STEP 1C: Seed Deals (5 docs)
 */
const seedDeals = async (productIds) => {
  console.log('🎁 Seeding Deals...');

  const deals = [
    {
      productId: productIds[0],
      title_en: 'Headphones - 40% OFF Today!',
      title_te: 'హెడ్‌ఫోన్లు - ఈ రోజు 40% ఆఫ్!',
      description_en: 'Limited time offer on wireless headphones',
      description_te: 'వైర్లెస్ హెడ్‌ఫోన్లపై సమయ-సीমిత ఆఫర్',
      dealPrice: 1199,
      originalPrice: 1999,
      discount: 40,
      platform: 'amazon',
      type: 'today',
      priority: 1,
      expiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isActive: true,
      status: 'ACTIVE',
      isVisible: true,
      clicks: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      productId: productIds[1],
      title_en: 'SmartWatch - Flat ₹500 OFF',
      title_te: 'స్మార్ట్ వాచ్ - ₹500 చదికి ఆఫ్',
      description_en: 'Extra discount on smartwatch',
      description_te: 'స్మార్ట్ వాచ్‌పై అదనపు ఛాయం',
      dealPrice: 9999,
      originalPrice: 10499,
      discount: 5,
      platform: 'flipkart',
      type: 'today',
      priority: 2,
      expiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isActive: true,
      status: 'ACTIVE',
      isVisible: true,
      clicks: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      productId: productIds[2],
      title_en: 'Fast Charger - Best Price Ever',
      title_te: 'వేగవంతమైన చార్జర్ - ఎవరికీ ఉత్తమ ధర',
      description_en: 'USB-C charger at incredible price',
      description_te: 'USB-C చార్జర్ అব్భరణీయ ధరకు',
      dealPrice: 899,
      originalPrice: 1499,
      discount: 40,
      platform: 'amazon',
      type: 'today',
      priority: 1,
      expiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isActive: true,
      status: 'ACTIVE',
      isVisible: true,
      clicks: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      productId: productIds[3],
      title_en: 'Phone Stand - Free Shipping',
      title_te: 'ఫోన్ స్టాండ్ - ఉచిత షిప్పింగ్',
      description_en: 'Phone stand with free delivery',
      description_te: 'ఫోన్ స్టాండ్ ఉచిత డెలివరీతో',
      dealPrice: 299,
      originalPrice: 599,
      discount: 50,
      platform: 'flipkart',
      type: 'today',
      priority: 2,
      expiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isActive: true,
      status: 'ACTIVE',
      isVisible: true,
      clicks: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      productId: productIds[4],
      title_en: 'Portable Speaker - 35% OFF',
      title_te: 'పోర్టబుల్ స్పీకర్ - 35% ఆఫ్',
      description_en: 'Waterproof speaker at discount',
      description_te: 'డిస్కౌంట్‌కు జలనిరోధక స్పీకర్',
      dealPrice: 1299,
      originalPrice: 1999,
      discount: 35,
      platform: 'amazon',
      type: 'today',
      priority: 1,
      expiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isActive: true,
      status: 'ACTIVE',
      isVisible: true,
      clicks: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  ];

  for (const deal of deals) {
    try {
      const docRef = await addDoc(collection(db, 'deals'), deal);
      console.log(`✅ Deal added: ${deal.title_en} (ID: ${docRef.id})`);
    } catch (error) {
      console.error(`❌ Error adding deal ${deal.title_en}:`, error);
    }
  }
};

/**
 * STEP 1D: Seed Coupons (1-2 docs)
 */
const seedCoupons = async () => {
  console.log('🎟️ Seeding Coupons...');

  const coupons = [
    {
      title_en: 'Extra 10% OFF',
      title_te: 'అదనంగా 10% తగ్గింపు',
      code: 'FRESH10',
      description_en: 'Use code FRESH10 for extra discount',
      description_te: 'అదనపు ఛాయం కోసం FRESH10 కోడ్‌ని ఉపయోగించండి',
      platform: 'amazon',
      discount: 10,
      minOrderValue: 500,
      expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      title_en: 'Flat ₹200 OFF',
      title_te: '₹200 చదికి ఆఫ్',
      code: 'DEAL200',
      description_en: 'Get ₹200 cashback on purchases',
      description_te: 'కొనుగోళ్లపై ₹200 క్యాష్‌బ్యాక్ పొందండి',
      platform: 'flipkart',
      discount: 200,
      minOrderValue: 1000,
      expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  ];

  for (const coupon of coupons) {
    try {
      const docRef = await addDoc(collection(db, 'coupons'), coupon);
      console.log(`✅ Coupon added: ${coupon.code} - ${coupon.title_en}`);
    } catch (error) {
      console.error(`❌ Error adding coupon ${coupon.code}:`, error);
    }
  }
};

/**
 * Main Seed Function
 */
export const seedFirestore = async () => {
  console.log('🚀 Starting Firestore Data Seeding...\n');

  if (!initDB()) {
    console.error('❌ Cannot initialize Firestore');
    return false;
  }

  try {
    // Step 1A: Seed products
    const productIds = await seedProducts();
    if (productIds.length === 0) {
      console.error('❌ No products seeded');
      return false;
    }

    // Step 1B: Seed prices
    await seedPrices(productIds);

    // Step 1C: Seed deals
    await seedDeals(productIds);

    // Step 1D: Seed coupons
    await seedCoupons();

    console.log('\n✅ ✅ ✅ FIRESTORE DATA SEEDING COMPLETE! ✅ ✅ ✅');
    console.log('📊 Summary:');
    console.log(`   - 5 Products added`);
    console.log(`   - 10 Prices added (2 per product)`);
    console.log(`   - 5 Deals added`);
    console.log(`   - 2 Coupons added`);
    console.log('\n🔄 Refresh the page to see data on UI!');

    return true;
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    return false;
  }
};

export default seedFirestore;
