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
  browserLocalPersistence
} from 'firebase/auth';
import { 
  doc, 
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from './firebaseConfig';

// Initialize Auth
const auth = getAuth();

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

    return {
      uid: user.uid,
      email: user.email,
      ...adminData
    };
  } catch (error) {
    console.error('❌ Admin login failed:', error.message);
    throw new Error(error.message || 'Login failed');
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
      'super_admin': ['all'],
      'admin': ['deals', 'products', 'analytics', 'coupons'],
      'manager': ['deals', 'products', 'analytics'],
      'editor': ['deals', 'products'],
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

export default {
  adminLogin,
  adminLogout,
  getCurrentAdmin,
  hasPermission,
  logAdminActivity,
  createAdminAccount
};
