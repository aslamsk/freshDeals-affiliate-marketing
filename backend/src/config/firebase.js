import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

let db, auth, messaging;

try {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  };

  // Validate Firebase credentials
  if (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail) {
    throw new Error('Missing Firebase credentials');
  }

  // Initialize Firebase Admin SDK
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });

  db = admin.firestore();
  auth = admin.auth();
  messaging = admin.messaging();
  
  console.log('✅ Firebase Admin SDK initialized successfully');
} catch (error) {
  console.warn('⚠️ Firebase initialization failed:', error.message);
  console.log('📝 Using development mode without Firebase.');
  console.log('💡 To enable Firebase, add your service account credentials to .env');
  
  // Mock implementations for development without Firebase
  db = null;
  auth = null;
  messaging = null;
}

export { db, auth, messaging };
export default admin;
