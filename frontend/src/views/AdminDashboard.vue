<template>
  <div class="admin-dashboard">
    <!-- Header banner -->
    <div class="header-banner">
      <div class="container">
        <div class="header-content">
          <div>
            <h1>Admin Dashboard</h1>
            <p class="subtitle">Welcome back, {{ currentAdminName }}</p>
          </div>
          <div class="header-actions">
            <v-btn
              @click="syncAffiliateData"
              color="success"
              :loading="isSyncing"
            >
              <v-icon left>mdi-sync</v-icon>
              Sync Affiliate Data
            </v-btn>
            <v-btn
              @click="logout"
              variant="text"
            >
              <v-icon left>mdi-logout</v-icon>
              Logout
            </v-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="container main-content">
      <!-- Stats row -->
      <v-row class="mb-6">
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card">
            <v-card-text>
              <div class="stat-label">Active Deals</div>
              <div class="stat-value">{{ stats.activeDeals }}</div>
              <div class="stat-change positive">
                <v-icon size="16">mdi-trending-up</v-icon>
                +{{ stats.newDealsThisMonth }} this month
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card">
            <v-card-text>
              <div class="stat-label">Total Clicks</div>
              <div class="stat-value">{{ stats.totalClicks }}</div>
              <div class="stat-change positive">
                <v-icon size="16">mdi-trending-up</v-icon>
                {{ stats.clicksChange }}% vs last month
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card">
            <v-card-text>
              <div class="stat-label">Conversions</div>
              <div class="stat-value">{{ stats.totalConversions }}</div>
              <div class="stat-change positive">
                <v-icon size="16">mdi-trending-up</v-icon>
                {{ stats.conversionRate }}% conversion rate
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card">
            <v-card-text>
              <div class="stat-label">Total Earnings</div>
              <div class="stat-value">₹{{ formatPrice(stats.totalEarnings) }}</div>
              <div class="stat-change positive">
                <v-icon size="16">mdi-trending-up</v-icon>
                +{{ stats.earningsChange }}% vs last month
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Tabs -->
      <v-tabs v-model="activeTab" class="mb-6">
        <v-tab value="overview">
          <v-icon left>mdi-home-dashboard</v-icon>
          Overview
        </v-tab>
        <v-tab value="deals">
          <v-icon left>mdi-list-box</v-icon>
          Deals Management
        </v-tab>
        <v-tab value="analytics">
          <v-icon left>mdi-chart-line</v-icon>
          Analytics
        </v-tab>
        <v-tab value="affiliates">
          <v-icon left>mdi-link-variant</v-icon>
          Affiliate Networks
        </v-tab>
        <v-tab value="settings">
          <v-icon left>mdi-cog</v-icon>
          Settings
        </v-tab>
      </v-tabs>

      <!-- Tab content -->
      <v-tabs-window v-model="activeTab">
        <!-- Overview tab -->
        <v-tab-window-item value="overview">
          <v-row>
            <!-- Recent deals -->
            <v-col cols="12" md="8">
              <v-card>
                <v-card-title>
                  <v-icon left>mdi-fire</v-icon>
                  Top Performing Deals
                </v-card-title>
                <v-card-text>
                  <v-list>
                    <v-list-item
                      v-for="deal in topDeals"
                      :key="deal.id"
                      class="mb-2"
                    >
                      <template #prepend>
                        <v-avatar>
                          <img :src="deal.image" />
                        </v-avatar>
                      </template>
                      <v-list-item-title>{{ deal.title }}</v-list-item-title>
                      <template #append>
                        <div class="text-right">
                          <div class="text-caption">
                            <strong>{{ deal.clicks }}</strong> clicks
                          </div>
                          <div class="text-caption">
                            <strong class="text-success">{{ deal.conversions }}</strong> conversions
                          </div>
                        </div>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Sync status -->
            <v-col cols="12" md="4">
              <v-card class="mb-4">
                <v-card-title>Affiliate Networks</v-card-title>
                <v-card-text>
                  <div
                    v-for="network in affiliateNetworks"
                    :key="network.id"
                    class="mb-4"
                  >
                    <div class="d-flex justify-space-between align-center">
                      <span class="font-weight-medium">{{ network.name }}</span>
                      <v-chip
                        :color="network.status === 'connected' ? 'success' : 'warning'"
                        text-color="white"
                        size="small"
                      >
                        {{ network.status }}
                      </v-chip>
                    </div>
                    <div class="text-caption text-grey">
                      Last synced: {{ network.lastSync }}
                    </div>
                  </div>
                </v-card-text>
              </v-card>

              <v-card>
                <v-card-title>Quick Actions</v-card-title>
                <v-card-text>
                  <v-btn
                    @click="activeTab = 'deals'"
                    block
                    variant="outlined"
                    class="mb-2"
                  >
                    <v-icon left>mdi-plus</v-icon>
                    New Deal
                  </v-btn>
                  <v-btn
                    @click="syncAffiliateData"
                    block
                    variant="outlined"
                    :loading="isSyncing"
                  >
                    <v-icon left>mdi-sync</v-icon>
                    Sync Now
                  </v-btn>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-tab-window-item>

        <!-- Deals tab -->
        <v-tab-window-item value="deals">
          <admin-deal-manager />
        </v-tab-window-item>

        <!-- Analytics tab -->
        <v-tab-window-item value="analytics">
          <v-card>
            <v-card-text class="text-center py-12">
              <v-icon size="48" color="grey">mdi-chart-line</v-icon>
              <p class="mt-4 text-grey">
                Advanced analytics coming soon...
              </p>
            </v-card-text>
          </v-card>
        </v-tab-window-item>

        <!-- Affiliates tab -->
        <v-tab-window-item value="affiliates">
          <v-card>
            <v-card-title>Affiliate Networks</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-card class="mb-4">
                    <v-card-title>Amazon Associates</v-card-title>
                    <v-card-text>
                      <div class="mb-4">
                        <div class="text-caption text-grey">Status</div>
                        <v-chip color="success" text-color="white" size="small">
                          Connected
                        </v-chip>
                      </div>
                      <v-text-field
                        label="Associate Tag"
                        hint="Your Amazon Associate tag"
                        variant="outlined"
                        density="compact"
                      />
                    </v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" md="6">
                  <v-card class="mb-4">
                    <v-card-title>Flipkart Affiliate</v-card-title>
                    <v-card-text>
                      <div class="mb-4">
                        <div class="text-caption text-grey">Status</div>
                        <v-chip color="warning" text-color="white" size="small">
                          Not Connected
                        </v-chip>
                      </div>
                      <v-btn block color="primary" variant="outlined">
                        Connect Account
                      </v-btn>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-tab-window-item>

        <!-- Settings tab -->
        <v-tab-window-item value="settings">
          <v-card>
            <v-card-title>Admin Settings</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    label="Admin Name"
                    :value="currentAdminName"
                    variant="outlined"
                    disabled
                  />
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    label="Email"
                    type="email"
                    variant="outlined"
                    disabled
                  />
                </v-col>
                <v-col cols="12">
                  <v-select
                    label="Theme"
                    :items="['Light', 'Dark', 'Auto']"
                    variant="outlined"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-tab-window-item>
      </v-tabs-window>
    </div>

    <!-- Sync status notification -->
    <v-snackbar
      v-model="showSyncSuccess"
      location="bottom-right"
      color="success"
      timeout="3000"
    >
      Affiliate data synced successfully!
    </v-snackbar>

    <v-snackbar
      v-model="showSyncError"
      location="bottom-right"
      color="error"
      timeout="4000"
    >
      {{ syncErrorMessage }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
// Using mock auth for development - switch to adminAuthService when Firebase is configured
import adminAuthService from '@/services/adminAuthService';
import affiliateNetworkService from '@/services/affiliateNetworkService';
// Use the REAL AdminDealManager from components/admin that connects to Firestore
import AdminDealManager from '@/components/admin/AdminDealManager.vue';

const router = useRouter();

// State - default to 'deals' tab to show deal manager immediately
const activeTab = ref('deals');
const isSyncing = ref(false);
const currentAdminName = ref('Admin');
const showSyncSuccess = ref(false);
const showSyncError = ref(false);
const syncErrorMessage = ref('');

// Stats
const stats = ref({
  activeDeals: 24,
  newDealsThisMonth: 8,
  totalClicks: 2450,
  clicksChange: 15,
  totalConversions: 156,
  conversionRate: 6.4,
  totalEarnings: 45320,
  earningsChange: 22
});

// Mock data
const topDeals = ref([
  {
    id: 1,
    title: 'Samsung 55" 4K TV',
    image: 'https://via.placeholder.com/50',
    clicks: 342,
    conversions: 28
  },
  {
    id: 2,
    title: 'Sony Headphones Pro',
    image: 'https://via.placeholder.com/50',
    clicks: 298,
    conversions: 24
  },
  {
    id: 3,
    title: 'MacBook Air M1',
    image: 'https://via.placeholder.com/50',
    clicks: 256,
    conversions: 18
  }
]);

const affiliateNetworks = ref([
  {
    id: 'amazon',
    name: 'Amazon Associates',
    status: 'connected',
    lastSync: '2 hours ago'
  },
  {
    id: 'flipkart',
    name: 'Flipkart Affiliate',
    status: 'connected',
    lastSync: '5 hours ago'
  },
  {
    id: 'myntra',
    name: 'Myntra Affiliate',
    status: 'disconnected',
    lastSync: 'Never'
  }
]);

/**
 * Format price with Indian number system
 */
function formatPrice(price) {
  if (!price) return '0';
  return new Intl.NumberFormat('en-IN').format(price);
}

/**
 * Sync affiliate data from all networks
 */
async function syncAffiliateData() {
  isSyncing.value = true;
  try {
    const result = await affiliateNetworkService.affiliateManager.syncAllAccounts('current_admin_id');
    console.log('✅ Sync completed:', result);
    showSyncSuccess.value = true;
  } catch (error) {
    console.error('❌ Sync failed:', error);
    syncErrorMessage.value = error.message || 'Failed to sync affiliate data';
    showSyncError.value = true;
  } finally {
    isSyncing.value = false;
  }
}

/**
 * Logout
 */
async function logout() {
  try {
    await adminAuthService.adminLogout('current_admin_id');
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  } catch (error) {
    console.error('❌ Logout failed:', error);
  }
}

/**
 * Check authentication on mount
 */
onMounted(async () => {
  try {
    const currentAdmin = await adminAuthService.getCurrentAdmin();
    if (currentAdmin) {
      currentAdminName.value = currentAdmin.name;
    } else {
      router.push('/admin/login');
    }
  } catch (error) {
    console.error('❌ Auth check failed:', error);
    router.push('/admin/login');
  }
});
</script>

<style scoped>
.admin-dashboard {
  background: #f5f5f5;
  min-height: 100vh;
}

.header-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 32px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.header-banner h1 {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.main-content {
  padding: 32px 20px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.stat-label {
  color: rgba(0, 0, 0, 0.6);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.stat-change {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-change.positive {
  color: #4caf50;
}

:deep(.v-tab) {
  text-transform: none;
  font-weight: 500;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
  }

  .header-actions button {
    width: 100%;
  }
}
</style>
