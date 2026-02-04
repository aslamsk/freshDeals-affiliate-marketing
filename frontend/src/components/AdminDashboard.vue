<template>
  <div class="admin-container">
    <!-- Header -->
    <v-app-bar elevation="4" class="admin-header">
      <v-app-bar-title>
        <v-icon color="orange">mdi-shield-admin</v-icon>
        FreshDeals Admin Panel
      </v-app-bar-title>
      
      <v-spacer />
      
      <v-btn
        icon
        @click="refreshStats"
        :loading="loadingStats"
      >
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
      
      <v-btn icon to="/admin/settings" title="Settings">
        <v-icon>mdi-cog</v-icon>
      </v-btn>
      
      <v-btn icon to="/" title="Back to Home">
        <v-icon>mdi-home</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Main Content -->
    <v-container fluid class="pa-6">
      <!-- Dashboard Stats -->
      <div class="stats-grid">
        <v-card class="stat-card" elevation="2">
          <v-card-text>
            <div class="stat-label">Total Products</div>
            <div class="stat-value">{{ stats.totalProducts }}</div>
            <v-btn
              small
              text
              color="primary"
              to="/admin/products"
            >
              Manage →
            </v-btn>
          </v-card-text>
        </v-card>

        <v-card class="stat-card" elevation="2">
          <v-card-text>
            <div class="stat-label">Platform Links</div>
            <div class="stat-value">{{ stats.totalPlatforms }}</div>
            <v-btn
              small
              text
              color="primary"
              to="/admin/platforms"
            >
              View →
            </v-btn>
          </v-card-text>
        </v-card>

        <v-card class="stat-card" elevation="2">
          <v-card-text>
            <div class="stat-label">Active Deals</div>
            <div class="stat-value">{{ stats.activeDeals }}</div>
            <v-btn
              small
              text
              color="primary"
              to="/admin/deals"
            >
              Manage →
            </v-btn>
          </v-card-text>
        </v-card>

        <v-card class="stat-card" elevation="2">
          <v-card-text>
            <div class="stat-label">Active Coupons</div>
            <div class="stat-value">{{ stats.activeCoupons }}</div>
            <v-btn
              small
              text
              color="primary"
              to="/admin/coupons"
            >
              Manage →
            </v-btn>
          </v-card-text>
        </v-card>
      </div>

      <!-- Navigation Tabs -->
      <v-tabs
        v-model="activeTab"
        class="mt-6"
        bg-color="transparent"
      >
        <v-tab value="0">
          <v-icon left small>mdi-box-multiple</v-icon>
          Products
        </v-tab>
        <v-tab value="1">
          <v-icon left small>mdi-link-multiple</v-icon>
          Platforms
        </v-tab>
        <v-tab value="2">
          <v-icon left small>mdi-tag-multiple</v-icon>
          Deals
        </v-tab>
        <v-tab value="3">
          <v-icon left small>mdi-ticket-multiple</v-icon>
          Coupons
        </v-tab>
        <v-tab value="4">
          <v-icon left small>mdi-bell-ring</v-icon>
          Notifications
        </v-tab>
        <v-tab value="5">
          <v-icon left small>mdi-chart-line</v-icon>
          Analytics
        </v-tab>
      </v-tabs>

      <v-window v-model="activeTab" class="mt-6">
        <!-- Products Tab -->
        <v-window-item value="0">
          <AdminProductManager />
        </v-window-item>

        <!-- Platforms Tab -->
        <v-window-item value="1">
          <AdminPlatformManager />
        </v-window-item>

        <!-- Deals Tab -->
        <v-window-item value="2">
          <AdminDealManager />
        </v-window-item>

        <!-- Coupons Tab -->
        <v-window-item value="3">
          <AdminCouponManager />
        </v-window-item>

        <!-- Notifications Tab -->
        <v-window-item value="4">
          <AdminNotificationManager />
        </v-window-item>

        <!-- Analytics Tab -->
        <v-window-item value="5">
          <AdminAnalyticsViewer />
        </v-window-item>
      </v-window>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import firebaseAdminService from '../services/firebaseAdminService.js';
import AdminProductManager from './admin/AdminProductManager.vue';
import AdminPlatformManager from './admin/AdminPlatformManager.vue';
import AdminDealManager from './admin/AdminDealManager.vue';
import AdminCouponManager from './admin/AdminCouponManager.vue';
import AdminNotificationManager from './admin/AdminNotificationManager.vue';
import AdminAnalyticsViewer from './admin/AdminAnalyticsViewer.vue';

const activeTab = ref('0');
const loadingStats = ref(false);

const stats = ref({
  totalProducts: 0,
  totalPlatforms: 0,
  activeDeals: 0,
  activeCoupons: 0,
  timestamp: new Date(),
});

const refreshStats = async () => {
  loadingStats.value = true;
  try {
    const products = await firebaseAdminService.getAllProducts();
    const platforms = await firebaseAdminService.getPlatformLinks('');
    const deals = await firebaseAdminService.getAllDeals();
    const coupons = await firebaseAdminService.getAllCoupons();

    stats.value = {
      totalProducts: products.filter(p => p.isActive).length,
      totalPlatforms: platforms.filter(p => p.isActive).length,
      activeDeals: deals.filter(d => d.isActive && d.status === 'ACTIVE').length,
      activeCoupons: coupons.filter(c => c.isActive).length,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Error refreshing stats:', error);
  } finally {
    loadingStats.value = false;
  }
};

onMounted(() => {
  refreshStats();
  // Refresh every 30 seconds
  setInterval(refreshStats, 30000);
});
</script>

<style scoped>
.admin-container {
  background: linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%);
  min-height: 100vh;
}

.admin-header {
  background: linear-gradient(90deg, #FF6B35 0%, #e55a24 100%);
  color: white !important;
}

.admin-header :deep(.v-app-bar-title) {
  color: white !important;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-left: 4px solid #FF6B35;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1) !important;
}

.stat-label {
  font-size: 12px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #FF6B35;
  margin-bottom: 12px;
}

.v-tabs {
  border-bottom: 2px solid #e0e0e0;
}
</style>
