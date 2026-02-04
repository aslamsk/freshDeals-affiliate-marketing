<template>
  <div>
    <v-container fluid class="admin-header py-6 mb-4">
      <v-container>
        <v-row align="center">
          <v-col cols="12" md="8">
            <div class="d-flex align-center">
              <v-avatar color="white" size="48" class="mr-3">
                <v-icon color="primary" size="32">mdi-shield-crown</v-icon>
              </v-avatar>
              <div>
                <h1 class="text-h4 font-weight-bold">{{ $t('admin.dashboard') }}</h1>
                <p class="text-subtitle-1" style="opacity: 0.9">Admin Panel - Manage Products, Deals, Analytics & More</p>
              </div>
            </div>
          </v-col>
          <v-col cols="12" md="4" class="text-right">
            <v-chip color="white" size="large" class="mr-2">
              <v-icon start color="success">mdi-circle</v-icon>
              Online
            </v-chip>
            <v-btn color="white" variant="outlined" prepend-icon="mdi-home" to="/">
              Back to Site
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-container>

    <v-container class="py-4">
      <!-- Admin Tabs -->
      <v-tabs v-model="activeTab" class="mb-6" bg-color="white" color="primary" slider-color="primary">
        <v-tab value="products" prepend-icon="mdi-package-variant">
          {{ $t('admin.products') }}
        </v-tab>
        <v-tab value="deals" prepend-icon="mdi-tag-multiple">
          {{ $t('admin.deals') }}
        </v-tab>
        <v-tab value="analytics" prepend-icon="mdi-chart-line">
          Analytics
        </v-tab>
        <v-tab value="coupons" prepend-icon="mdi-ticket-percent">
          {{ $t('admin.coupons') }}
        </v-tab>
        <v-tab value="settings" prepend-icon="mdi-cog">
          {{ $t('admin.settings') }}
        </v-tab>
      </v-tabs>

      <v-window v-model="activeTab">
        <!-- Products Tab -->
        <v-window-item value="products">
          <AdminProductPanel />
        </v-window-item>

        <!-- Deals Tab -->
        <v-window-item value="deals">
          <AdminDealPanel />
        </v-window-item>

        <!-- Analytics Tab -->
        <v-window-item value="analytics">
          <AdminAnalyticsViewer />
        </v-window-item>

        <!-- Coupons Tab -->
        <v-window-item value="coupons">
          <AdminCouponPanel />
        </v-window-item>

        <!-- Settings Tab -->
        <v-window-item value="settings">
          <AdminSettingsPanel />
        </v-window-item>
      </v-window>
    </v-container>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AdminProductPanel from '../components/admin/AdminProductPanel.vue';
import AdminDealPanel from '../components/admin/AdminDealPanel.vue';
import AdminAnalyticsViewer from '../components/admin/AdminAnalyticsViewer.vue';
import AdminCouponPanel from '../components/admin/AdminCouponPanel.vue';
import AdminSettingsPanel from '../components/admin/AdminSettingsPanel.vue';

const activeTab = ref('products');
</script>

<style scoped>
.admin-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin-top: -24px;
}
</style>
