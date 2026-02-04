/**
 * MOCK AUTHENTICATION SERVICE
 * For development/testing when Firebase Auth is not configured
 * This is a temporary service to allow testing without Firebase Auth setup
 */

// Mock admin user
const MOCK_ADMIN = {
  uid: 'mock_admin_123',
  email: 'admin@freshdeals.com',
  name: 'Admin User',
  role: 'super_admin',
  status: 'active',
  createdAt: new Date().toISOString(),
  permissions: [
    'create_deals',
    'update_deals',
    'delete_deals',
    'view_analytics',
    'manage_affiliates',
    'manage_roles'
  ]
};

const MOCK_PASSWORD = 'password123';

/**
 * Mock Admin Login
 */
export const adminLogin = async (email, password) => {
  return new Promise((resolve, reject) => {
    // Simulate network delay
    setTimeout(() => {
      if (email === MOCK_ADMIN.email && password === MOCK_PASSWORD) {
        // Store in localStorage
        localStorage.setItem('admin_token', `mock_token_${Date.now()}`);
        localStorage.setItem('admin_user', JSON.stringify(MOCK_ADMIN));

        console.log('✅ Mock login successful');
        resolve({
          success: true,
          admin: MOCK_ADMIN,
          token: `mock_token_${Date.now()}`
        });
      } else {
        console.error('❌ Mock login failed: Invalid credentials');
        reject(new Error('Invalid email or password'));
      }
    }, 800);
  });
};

/**
 * Mock Admin Logout
 */
export const adminLogout = async (adminId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      console.log('✅ Mock logout successful');
      resolve(true);
    }, 500);
  });
};

/**
 * Get Current Admin
 */
export const getCurrentAdmin = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const token = localStorage.getItem('admin_token');
      const userJson = localStorage.getItem('admin_user');

      if (token && userJson) {
        const user = JSON.parse(userJson);
        console.log('✅ Current admin:', user.name);
        resolve(user);
      } else {
        resolve(null);
      }
    }, 300);
  });
};

/**
 * Check Permission
 */
export const hasPermission = async (adminId, permission) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const userJson = localStorage.getItem('admin_user');
      if (userJson) {
        const user = JSON.parse(userJson);
        const hasIt = user.permissions.includes(permission);
        console.log(`✅ Permission check: ${permission} = ${hasIt}`);
        resolve(hasIt);
      } else {
        resolve(false);
      }
    }, 200);
  });
};

/**
 * Log Admin Activity
 */
export const logAdminActivity = async (adminId, action, data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`📝 Activity logged: ${action}`, data);
      resolve(true);
    }, 100);
  });
};

/**
 * Create Admin Account
 */
export const createAdminAccount = async (currentAdminId, adminData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const userJson = localStorage.getItem('admin_user');
      if (userJson) {
        const user = JSON.parse(userJson);
        if (user.role === 'super_admin') {
          console.log('✅ Mock admin account created:', adminData.email);
          resolve(true);
        } else {
          reject(new Error('Only super admins can create accounts'));
        }
      } else {
        reject(new Error('Not authenticated'));
      }
    }, 500);
  });
};

export default {
  adminLogin,
  adminLogout,
  getCurrentAdmin,
  hasPermission,
  logAdminActivity,
  createAdminAccount
};
