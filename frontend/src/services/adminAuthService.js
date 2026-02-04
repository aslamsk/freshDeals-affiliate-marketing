/**
 * PROFESSIONAL AUTHENTICATION SERVICE
 * Handles admin authentication, roles, and permissions
 */

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  getDoc,
  setDoc,
  collection,
  query,
  getDocs,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { db, firebaseConfig, getFirebaseApp } from './firebaseConfig';

// Initialize Auth
const auth = getAuth(getFirebaseApp());

const DEFAULT_SUPER_ADMIN = {
  email: 'admin.freshdeals@gmail.com',
  password: 'Temp$8282',
  username: 'admin',
  profileName: 'Super Admin',
  role: 'super_admin',
  status: 'active'
};

const getSecondaryApp = () => {
  const existing = getApps().find((appInstance) => appInstance.name === 'admin-bootstrap');
  if (existing) return existing;
  return initializeApp(firebaseConfig, 'admin-bootstrap');
};

// Set persistence
setPersistence(auth, browserLocalPersistence).catch(err => {
  console.error('Persistence error:', err);
});

/**
 * Admin Login - Professional implementation
 */
export const adminLogin = async (email, password) => {
  try {
    // Sign in with email and password
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Verify admin role in Firestore
    const adminRef = doc(db, 'admins', user.uid);
    const adminSnap = await getDoc(adminRef);

    if (!adminSnap.exists()) {
      await signOut(auth);
      throw new Error('User is not an admin');
    }

    const adminData = adminSnap.data();

    // Check if admin is active
    if (adminData.status !== 'active') {
      await signOut(auth);
      throw new Error('Admin account is inactive');
    }

    // Log admin login activity
    await logAdminActivity(user.uid, 'LOGIN', {
      email: user.email,
      timestamp: new Date().toISOString(),
      ipAddress: 'tracking-ready'
    });

    const token = await user.getIdToken();
    const admin = {
      uid: user.uid,
      email: user.email,
      ...adminData
    };

    // Cache for quick access
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(admin));

    return {
      success: true,
      admin,
      token
    };
  } catch (error) {
    console.error('❌ Admin login failed:', error.message);
    return {
      success: false,
      error: error.message || 'Login failed'
    };
  }
};

/**
 * Admin Logout
 */
export const adminLogout = async (adminId) => {
  try {
    // Log logout activity
    await logAdminActivity(adminId, 'LOGOUT', {
      timestamp: new Date().toISOString()
    });

    await signOut(auth);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    return true;
  } catch (error) {
    console.error('❌ Logout failed:', error);
    throw error;
  }
};

/**
 * Get Current Admin Session
 */
export const getCurrentAdmin = async () => {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const adminRef = doc(db, 'admins', user.uid);
          const adminSnap = await getDoc(adminRef);
          if (adminSnap.exists()) {
            resolve({
              uid: user.uid,
              email: user.email,
              ...adminSnap.data()
            });
          } else {
            resolve(null);
          }
        } catch (error) {
          reject(error);
        }
      } else {
        resolve(null);
      }
    });
  });
};

/**
 * Check if user has permission
 */
export const hasPermission = async (adminId, permission) => {
  try {
    const adminRef = doc(db, 'admins', adminId);
    const adminSnap = await getDoc(adminRef);
    
    if (!adminSnap.exists()) return false;
    
    const adminData = adminSnap.data();
    const role = adminData.role || 'viewer'; // Default role
    
    // Define permissions by role
    const permissions = {
      'super_admin': ['all', 'admin_management'],
      'admin': ['deals', 'products', 'analytics', 'coupons', 'create_deals', 'update_deals', 'delete_deals'],
      'manager': ['deals', 'products', 'analytics', 'create_deals', 'update_deals'],
      'editor': ['deals', 'products', 'create_deals', 'update_deals'],
      'viewer': ['analytics']
    };
    
    const rolePermissions = permissions[role] || [];
    return rolePermissions.includes('all') || rolePermissions.includes(permission);
  } catch (error) {
    console.error('Permission check failed:', error);
    return false;
  }
};

/**
 * Log admin activity for audit trail
 */
export const logAdminActivity = async (adminId, action, data) => {
  try {
    const activityLog = {
      adminId,
      action,
      data,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString()
    };
    
    await setDoc(
      doc(db, 'admin_activity_logs', `${adminId}_${Date.now()}`),
      activityLog
    );
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

/**
 * Create admin account (super admin only)
 */
export const createAdminAccount = async (currentAdminId, adminData) => {
  try {
    // Check if current user is super admin
    const hasPermission = await hasPermission(currentAdminId, 'admin_management');
    if (!hasPermission) {
      throw new Error('Only super admins can create admin accounts');
    }

    // Create admin record in Firestore
    const adminRef = doc(db, 'admins', adminData.uid);
    await setDoc(adminRef, {
      uid: adminData.uid,
      email: adminData.email,
      name: adminData.name,
      role: adminData.role || 'editor',
      status: 'active',
      createdBy: currentAdminId,
      createdAt: new Date().toISOString(),
      permissions: adminData.permissions || []
    });

    await logAdminActivity(currentAdminId, 'CREATE_ADMIN', {
      newAdminEmail: adminData.email,
      role: adminData.role
    });

    return true;
  } catch (error) {
    console.error('Failed to create admin account:', error);
    throw error;
  }
};

/**
 * Bootstrap default super admin (one-time)
 */
export const ensureSuperAdminExists = async () => {
  const adminsSnap = await getDocs(query(collection(db, 'admins'), limit(1)));
  if (!adminsSnap.empty) return true;

  const secondaryApp = getSecondaryApp();
  const secondaryAuth = getAuth(secondaryApp);
  const secondaryDb = db;

  const userCredential = await createUserWithEmailAndPassword(
    secondaryAuth,
    DEFAULT_SUPER_ADMIN.email,
    DEFAULT_SUPER_ADMIN.password
  );

  await updateProfile(userCredential.user, {
    displayName: DEFAULT_SUPER_ADMIN.profileName
  });

  await setDoc(doc(secondaryDb, 'admins', userCredential.user.uid), {
    uid: userCredential.user.uid,
    email: DEFAULT_SUPER_ADMIN.email,
    username: DEFAULT_SUPER_ADMIN.username,
    profileName: DEFAULT_SUPER_ADMIN.profileName,
    mobile: '',
    photoURL: userCredential.user.photoURL || '',
    role: DEFAULT_SUPER_ADMIN.role,
    status: DEFAULT_SUPER_ADMIN.status,
    createdBy: 'system',
    createdAt: serverTimestamp(),
    passwordSet: true
  });

  await signOut(secondaryAuth);
  return true;
};

export default {
  adminLogin,
  adminLogout,
  getCurrentAdmin,
  hasPermission,
  logAdminActivity,
  createAdminAccount,
  ensureSuperAdminExists
};
