/**
 * ADMIN AUTH GUARD
 * Protects admin routes and checks permissions
 */

import adminAuthService from '@/services/adminAuthService';

/**
 * Admin auth guard - redirects to login if not authenticated
 */
export const adminAuthGuard = async (to, from, next) => {
  try {
    const currentAdmin = await adminAuthService.getCurrentAdmin();

    if (!currentAdmin) {
      // Not authenticated, redirect to login
      next('/admin/login');
      return;
    }

    // Check if route requires specific permission
    const requiredPermission = to.meta?.requiredPermission;
    if (requiredPermission) {
      const hasPermission = await adminAuthService.hasPermission(
        currentAdmin.uid,
        requiredPermission
      );

      if (!hasPermission) {
        // Doesn't have permission, redirect to dashboard
        console.warn(`❌ Permission denied: ${requiredPermission}`);
        next('/admin/dashboard');
        return;
      }
    }

    // All checks passed
    next();
  } catch (error) {
    console.error('❌ Auth guard error:', error);
    next('/admin/login');
  }
};

/**
 * Prevent already-logged-in users from accessing login page
 */
export const preventAuthenticatedGuard = async (to, from, next) => {
  try {
    const currentAdmin = await adminAuthService.getCurrentAdmin();

    if (currentAdmin) {
      // Already logged in, redirect to dashboard
      next('/admin/dashboard');
      return;
    }

    // Not logged in, allow access to login page
    next();
  } catch (error) {
    // Not logged in, allow access to login page
    next();
  }
};

export default {
  adminAuthGuard,
  preventAuthenticatedGuard
};
