<template>
  <div class="dev-tools-container">
    <!-- Development Tools Button -->
    <v-fab
      v-if="isAdminLoggedIn"
      icon="mdi-tools"
      location="bottom right"
      :offset="16"
      @click="showDevMenu = !showDevMenu"
      class="dev-fab"
    />

    <!-- Dev Menu -->
    <v-card
      v-if="showDevMenu && isAdminLoggedIn"
      class="dev-menu"
      elevation="24"
    >
      <v-card-title class="bg-orange">
        <span class="text-white">🔧 Development Tools</span>
      </v-card-title>
      
      <v-card-text>
        <v-btn
          block
          color="success"
          class="mb-2"
          @click="runSeedFirestore"
          :loading="seeding"
        >
          <v-icon left>mdi-database-plus</v-icon>
          Seed Firestore (STEP-1)
        </v-btn>

        <v-btn
          block
          color="info"
          class="mb-2"
          @click="testClickTracking"
          :loading="testing"
        >
          <v-icon left>mdi-cursor-default-click</v-icon>
          Test Click Tracking (STEP-2)
        </v-btn>

        <v-btn
          block
          color="warning"
          class="mb-2"
          @click="testPushNotification"
          :loading="pushTesting"
        >
          <v-icon left>mdi-bell-ring</v-icon>
          Test Push Notification (STEP-3)
        </v-btn>

        <v-divider class="my-3" />

        <v-textarea
          v-model="devLog"
          label="Dev Log"
          rows="6"
          readonly
          class="mt-3"
          density="compact"
        />

        <v-btn
          text
          small
          @click="devLog = ''"
          class="mt-2"
        >
          Clear Log
        </v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { seedFirestore } from '../utils/seedFirestore';
import firebaseDealsService from '../services/firebaseDealsService';
import adminAuthService from '../services/adminAuthService';

const isAdminLoggedIn = ref(false);
const showDevMenu = ref(false);
const seeding = ref(false);
const testing = ref(false);
const pushTesting = ref(false);
const devLog = ref('');

const addLog = (message) => {
  const timestamp = new Date().toLocaleTimeString();
  devLog.value += `[${timestamp}] ${message}\n`;
  // Auto-scroll
  setTimeout(() => {
    const textarea = document.querySelector('.dev-tools-container textarea');
    if (textarea) {
      textarea.scrollTop = textarea.scrollHeight;
    }
  }, 10);
};

const runSeedFirestore = async () => {
  seeding.value = true;
  addLog('🚀 Starting Firestore seeding...');
  
  try {
    const result = await seedFirestore();
    if (result) {
      addLog('✅ Firestore seeding completed successfully!');
      addLog('📊 Refresh the page to see data on UI');
    } else {
      addLog('❌ Firestore seeding failed');
    }
  } catch (error) {
    addLog(`❌ Error: ${error.message}`);
  } finally {
    seeding.value = false;
  }
};

const testClickTracking = async () => {
  testing.value = true;
  addLog('📍 Testing click tracking...');
  
  try {
    // Get first deal
    const deals = await firebaseDealsService.getTodayDeals(1);
    
    if (!deals || deals.length === 0) {
      addLog('❌ No deals found. Seed data first!');
      testing.value = false;
      return;
    }

    const deal = deals[0];
    addLog(`✅ Found deal: ${deal.title_en} (${deal.id})`);
    
    // Track the click
    addLog(`📍 Tracking click for deal ID: ${deal.id}`);
    await firebaseDealsService.trackDealClick(deal.id);
    
    addLog('✅ Click tracked successfully!');
    addLog(`🔗 Affiliate URL: ${deal.affiliateUrl || 'Not set'}`);
    addLog('✅ Check Firestore → clicks collection for entry');

  } catch (error) {
    addLog(`❌ Error: ${error.message}`);
  } finally {
    testing.value = false;
  }
};

const testPushNotification = async () => {
  pushTesting.value = true;
  addLog('🔔 Testing push notification setup...');
  
  try {
    // Check if service worker exists
    if (!navigator.serviceWorker.controller) {
      addLog('⚠️ Service Worker not active yet');
    } else {
      addLog('✅ Service Worker is active');
    }

    // Check notification permission
    const permission = Notification.permission;
    addLog(`📋 Notification permission: ${permission}`);

    if (permission === 'default') {
      addLog('❌ Permission not granted. User must click "Allow" first');
    } else if (permission === 'granted') {
      addLog('✅ Notifications are allowed');
      addLog('📲 To send test push:');
      addLog('   1. Open Firebase Admin Panel');
      addLog('   2. Send message to this device');
      addLog('   3. Watch for notification here');
    }

    // Check Firebase Messaging
    try {
      const { messaging } = await import('../services/fcmService');
      addLog('✅ FCM Service loaded');
      addLog('ℹ️ Waiting for push messages...');
    } catch (e) {
      addLog('⚠️ FCM Service not available');
    }

  } catch (error) {
    addLog(`❌ Error: ${error.message}`);
  } finally {
    pushTesting.value = false;
  }
};

const refreshAdminState = async () => {
  try {
    const admin = await adminAuthService.getCurrentAdmin();
    isAdminLoggedIn.value = !!admin;
  } catch {
    isAdminLoggedIn.value = false;
  }
};

const handleStorage = (event) => {
  if (event.key === 'admin_token' || event.key === 'admin_user') {
    refreshAdminState();
  }
};

onMounted(() => {
  refreshAdminState();
  window.addEventListener('storage', handleStorage);
  addLog('Dev tools available after admin login.');
});

onUnmounted(() => {
  window.removeEventListener('storage', handleStorage);
});</script>

<style scoped>
.dev-tools-container {
  position: relative;
}

.dev-fab {
  z-index: 99;
}

.dev-menu {
  /* position: fixed; */
  bottom: 80px;
  right: 16px;
  width: 350px;
  max-height: 80vh;
  z-index: 100;
  overflow-y: auto;
}

.bg-orange {
  background-color: #ff6b35 !important;
}

.text-white {
  color: white !important;
}

@media (max-width: 600px) {
  .dev-menu {
    width: calc(100vw - 32px);
    right: 16px;
    left: 16px;
    bottom: 70px;
  }
}
</style>

