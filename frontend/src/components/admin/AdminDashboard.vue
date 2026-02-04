<template>
  <div class="admin-dashboard">
    <!-- Beautiful Header Banner -->
    <div class="header-banner">
      <div class="container">
        <div class="header-content">
          <div>
            <h1>
              <v-icon color="white" size="36">mdi-shield-crown</v-icon>
              FreshDeals Admin Panel
            </h1>
            <p class="subtitle">Manage your products, deals, coupons & more</p>
          </div>
          <div class="header-actions">
            <v-btn
              @click="loadStats"
              color="white"
              variant="outlined"
              :loading="loadingStats"
            >
              <v-icon left>mdi-refresh</v-icon>
              Refresh Stats
            </v-btn>
            <v-btn
              to="/"
              color="white"
              variant="text"
            >
              <v-icon left>mdi-home</v-icon>
              Back to Site
            </v-btn>
            <v-btn
              @click="logout"
              color="white"
              variant="text"
            >
              <v-icon left>mdi-logout</v-icon>
              Logout
            </v-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container main-content">
      <!-- Stats Row -->
      <v-row class="mb-6">
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" elevation="3">
            <v-card-text>
              <div class="stat-icon">
                <v-icon size="32" color="primary">mdi-package-variant</v-icon>
              </div>
              <div class="stat-label">Total Products</div>
              <div class="stat-value">{{ stats.totalProducts }}</div>
              <div class="stat-subtext text-success">
                <v-icon size="14">mdi-check-circle</v-icon>
                {{ stats.activeProducts }} active
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" elevation="3">
            <v-card-text>
              <div class="stat-icon">
                <v-icon size="32" color="info">mdi-link-variant</v-icon>
              </div>
              <div class="stat-label">Platform Links</div>
              <div class="stat-value">{{ stats.platformCount }}</div>
              <div class="stat-subtext text-grey">
                across all products
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" elevation="3">
            <v-card-text>
              <div class="stat-icon">
                <v-icon size="32" color="success">mdi-tag-multiple</v-icon>
              </div>
              <div class="stat-label">Active Deals</div>
              <div class="stat-value">{{ stats.activeDeals }}</div>
              <div class="stat-subtext text-grey">
                of {{ stats.totalDeals }} total
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" elevation="3">
            <v-card-text>
              <div class="stat-icon">
                <v-icon size="32" color="warning">mdi-ticket-percent</v-icon>
              </div>
              <div class="stat-label">Active Coupons</div>
              <div class="stat-value">{{ stats.activeCoupons }}</div>
              <div class="stat-subtext text-grey">
                of {{ stats.totalCoupons }} total
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Navigation Tabs -->
      <v-card class="tabs-card" elevation="2">
        <v-tabs
          v-model="activeTab"
          bg-color="white"
          color="primary"
          slider-color="primary"
          show-arrows
          mobile-breakpoint="960"
          align-tabs="start"
          class="admin-tabs"
        >
          <v-tab value="products">
            <v-icon left>mdi-package-variant</v-icon>
            Products
          </v-tab>
          <v-tab value="platforms">
            <v-icon left>mdi-link-variant</v-icon>
            Platforms
          </v-tab>
          <v-tab value="deals">
            <v-icon left>mdi-tag-multiple</v-icon>
            Deals
          </v-tab>
          <v-tab value="coupons">
            <v-icon left>mdi-ticket-percent</v-icon>
            Coupons
          </v-tab>
          <v-tab value="saas">
            <v-icon left>mdi-application</v-icon>
            SaaS Affiliates
          </v-tab>
          <v-tab value="notifications">
            <v-icon left>mdi-bell-ring</v-icon>
            Notifications
          </v-tab>
          <v-tab value="users">
            <v-icon left>mdi-account-multiple</v-icon>
            Admins
          </v-tab>
          <v-tab value="analytics">
            <v-icon left>mdi-chart-line</v-icon>
            Analytics
          </v-tab>
        </v-tabs>

        <!-- Tab Content -->
        <v-window v-model="activeTab" class="pa-4">
          <v-window-item value="products">
            <admin-product-manager />
          </v-window-item>

          <v-window-item value="platforms">
            <admin-platform-manager />
          </v-window-item>

          <v-window-item value="deals">
            <admin-deal-manager />
          </v-window-item>

          <v-window-item value="coupons">
            <admin-coupon-manager />
          </v-window-item>

          <v-window-item value="saas">
            <admin-saas-manager />
          </v-window-item>

          <v-window-item value="notifications">
            <admin-notification-manager />
          </v-window-item>

          <v-window-item value="users">
            <admin-user-manager />
          </v-window-item>

          <v-window-item value="analytics">
            <admin-analytics-viewer />
          </v-window-item>
        </v-window>
      </v-card>
    </div>

    <!-- Success notification -->
    <v-snackbar v-model="showSuccess" color="success" location="bottom-right" timeout="3000">
      {{ successMessage }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import adminAuthService from '../../services/adminAuthService';
import firebaseAdminService from '../../services/firebaseAdminService.js';
import AdminProductManager from './AdminProductManager.vue';
import AdminPlatformManager from './AdminPlatformManager.vue';
import AdminDealManager from './AdminDealManager.vue';
import AdminCouponManager from './AdminCouponManager.vue';
import AdminSaaSManager from './AdminSaaSManager.vue';
import AdminNotificationManager from './AdminNotificationManager.vue';
import AdminAnalyticsViewer from './AdminAnalyticsViewer.vue';
import AdminUserManager from './AdminUserManager.vue';

const router = useRouter();
const activeTab = ref('products');
const loadingStats = ref(false);
const showSuccess = ref(false);
const successMessage = ref('');

const stats = ref({
  totalProducts: 0,
  activeProducts: 0,
  totalDeals: 0,
  activeDeals: 0,
  totalCoupons: 0,
  activeCoupons: 0,
  platformCount: 0,
});

const loadStats = async () => {
  loadingStats.value = true;
  try {
    stats.value = await firebaseAdminService.getDashboardStats();
    console.log('📊 Stats loaded:', stats.value);
  } catch (error) {
    console.error('Error loading stats:', error);
  } finally {
    loadingStats.value = false;
  }
};

const logout = () => {
  adminAuthService.adminLogout().finally(() => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('freshdeals_admin');
    router.push('/admin/login');
  });
};

onMounted(() => {
  loadStats();
  // Auto-refresh every 30 seconds
  setInterval(loadStats, 30000);
});
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background: rgb(var(--v-theme-background));
  color: rgb(var(--v-theme-on-surface));
}

/* Beautiful Purple Gradient Header */
.header-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 32px 0;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.header-banner h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.subtitle {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.main-content {
  padding: 32px 20px;
}

/* Stats Cards */
.stat-card {
  background: rgb(var(--v-theme-surface));
  border-radius: 12px;
  transition: all 0.3s ease;
  overflow: hidden;
  border-left: 4px solid #667eea;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12) !important;
}

.stat-icon {
  margin-bottom: 12px;
}

.stat-label {
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.stat-subtext {
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Tabs Card */
.tabs-card {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.v-tab) {
  text-transform: none;
  font-weight: 500;
  font-size: 14px;
  letter-spacing: 0;
}

:deep(.v-tabs) {
  border-bottom: 1px solid #e0e0e0;
}

.admin-tabs {
  overflow-x: auto;
}

.admin-tabs :deep(.v-tab) {
  padding: 12px 16px;
  min-width: 120px;
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .v-btn {
    flex: 1;
  }

  .header-banner h1 {
    font-size: 22px;
  }

  .stat-value {
    font-size: 28px;
  }

  .admin-tabs :deep(.v-tab) {
    padding: 10px 12px;
    min-width: 100px;
  }
}
</style>
