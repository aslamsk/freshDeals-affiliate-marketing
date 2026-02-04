/**
 * SHARED FIREBASE CONFIGURATION
 * This is used by all services to ensure single app instance
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'freshdeals-dev.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'freshdeals-dev',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'freshdeals-dev.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abc123',
};

// Initialize Firebase - single instance for entire app
let app, db;
try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log('✅ Firebase initialized successfully with project:', firebaseConfig.projectId);
} catch (error) {
  console.warn('⚠️ Firebase initialization issue:', error.message);
}

// Export for use in all services
export { app, db, firebaseConfig };
