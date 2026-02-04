<template>
  <div class="admin-login-container">
    <!-- Gradient background -->
    <div class="gradient-bg"></div>

    <!-- Login card -->
    <v-card class="login-card" elevation="8">
      <!-- Logo/Header -->
      <div class="login-header">
        <div class="logo-circle">
          <v-icon size="40" color="white">mdi-shield-check</v-icon>
        </div>
        <h1>Admin Panel</h1>
        <p class="subtitle">FreshDeals Management System</p>
      </div>

      <!-- Form -->
      <v-form @submit.prevent="handleLogin" class="login-form">
        <!-- Email field -->
        <v-text-field
          v-model="email"
          label="Email Address"
          type="email"
          prepend-icon="mdi-email"
          :rules="emailRules"
          class="mb-4"
          variant="outlined"
          @keydown.enter="handleLogin"
        />

        <!-- Password field -->
        <v-text-field
          v-model="password"
          label="Password"
          :type="showPassword ? 'text' : 'password'"
          prepend-icon="mdi-lock"
          :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          :rules="passwordRules"
          class="mb-6"
          variant="outlined"
          @click:append-icon="showPassword = !showPassword"
          @keydown.enter="handleLogin"
        />

        <!-- Error message -->
        <v-alert
          v-if="errorMessage"
          type="error"
          class="mb-4"
          dismissible
          @click:close="errorMessage = ''"
        >
          {{ errorMessage }}
        </v-alert>

        <!-- Login button -->
        <v-btn
          type="submit"
          size="large"
          block
          class="login-btn mb-4"
          :loading="isLoading"
          :disabled="!email || !password || isLoading"
        >
          <v-icon left>mdi-login</v-icon>
          Sign In
        </v-btn>

        <!-- Forgot password link -->
        <div class="text-center">
          <router-link to="/admin/forgot-password" class="text-subtitle-2">
            Forgot Password?
          </router-link>
        </div>
      </v-form>

      <!-- Footer -->
      <div class="login-footer">
        <p class="text-caption text-grey">
          Secure Login • Role-Based Access • Activity Logged
        </p>
      </div>
    </v-card>

    <!-- Demo credentials hint (development only) -->
    <v-card v-if="isDevelopment" class="demo-hint mt-6">
      <v-card-text>
        <v-icon color="info" small>mdi-information</v-icon>
        <span class="ml-2 text-caption">
          Default: admin.freshdeals@gmail.com / Temp$8282
        </span>
        <v-btn
          class="ml-2"
          size="x-small"
          variant="text"
          color="primary"
          :loading="isBootstrapping"
          @click="bootstrapSuperAdmin"
        >
          Create Super Admin
        </v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
// Using mock auth for development - switch to adminAuthService when Firebase is configured
import adminAuthService from '@/services/adminAuthService';

const router = useRouter();

// Form state
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');
const isDevelopment = ref(import.meta.env.DEV);
const isBootstrapping = ref(false);

// Validation rules
const emailRules = [
  v => !!v || 'Email is required',
  v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Email must be valid'
];

const passwordRules = [
  v => !!v || 'Password is required',
  v => v.length >= 6 || 'Password must be at least 6 characters'
];

/**
 * Handle login submission
 */
const handleLogin = async () => {
  // Validate
  if (!email.value || !password.value) {
    errorMessage.value = 'Please fill in all fields';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    // Call authentication service
    const result = await adminAuthService.adminLogin(email.value, password.value);

    if (result.success) {
      console.log('✅ Admin login successful:', result.admin.profileName || result.admin.name || result.admin.email);
      await router.push('/admin/dashboard');
    } else {
      errorMessage.value = result.error || 'Login failed. Please try again.';
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    
    // Provide user-friendly error message
    if (error.code === 'auth/user-not-found') {
      errorMessage.value = 'Email not found. Please check and try again.';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage.value = 'Incorrect password. Please try again.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage.value = 'Invalid email format.';
    } else if (error.message.includes('not an admin')) {
      errorMessage.value = 'This account does not have admin privileges.';
    } else {
      errorMessage.value = 'Login failed. Please try again or contact support.';
    }
  } finally {
    isLoading.value = false;
  }
};

/**
 * Check if already logged in
 */
onMounted(async () => {
  try {
    await adminAuthService.ensureSuperAdminExists();
  } catch (error) {
    console.warn('Super admin bootstrap skipped:', error?.message || error);
  }
  try {
    const currentAdmin = await adminAuthService.getCurrentAdmin();
    if (currentAdmin) {
      // Already logged in, redirect to dashboard
      router.push('/admin/dashboard');
    }
  } catch (error) {
    // Not logged in, stay on login page
    console.log('Not logged in, showing login page');
  }
});

const bootstrapSuperAdmin = async () => {
  errorMessage.value = '';
  isBootstrapping.value = true;
  try {
    await adminAuthService.ensureSuperAdminExists();
  } catch (error) {
    errorMessage.value = error?.message || 'Failed to create super admin';
  } finally {
    isBootstrapping.value = false;
  }
};
</script>

<style scoped>
.admin-login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

/* Gradient background */
.gradient-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  z-index: -1;
}

/* Login card */
.login-card {
  width: 100%;
  max-width: 420px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

/* Header */
.login-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 20px;
  text-align: center;
}

.logo-circle {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  backdrop-filter: blur(10px);
}

.login-header h1 {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

/* Form */
.login-form {
  padding: 30px 24px;
}

.login-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Footer */
.login-footer {
  background: #f5f5f5;
  padding: 16px;
  text-align: center;
  border-top: 1px solid #e0e0e0;
}

/* Demo hint */
.demo-hint {
  max-width: 420px;
  background: #e3f2fd;
  border-left: 4px solid #1976d2;
}

/* Responsive */
@media (max-width: 600px) {
  .login-card {
    max-width: 100%;
  }

  .login-header {
    padding: 30px 16px;
  }

  .login-header h1 {
    font-size: 24px;
  }

  .login-form {
    padding: 24px 16px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .login-footer {
    background: #424242;
    border-top-color: #616161;
  }
}

/* Text link styling */
a {
  color: #667eea;
  text-decoration: none;
  transition: color 0.3s ease;
}

a:hover {
  color: #764ba2;
  text-decoration: underline;
}
</style>
