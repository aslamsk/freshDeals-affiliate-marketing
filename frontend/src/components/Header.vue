<template>
  <v-app-bar app color="primary" dark elevation="4" :height="isMobile ? 56 : 72">
    <!-- Mobile Menu Button - Always visible on mobile -->
    <template v-if="isMobile">
      <v-btn icon variant="text" @click="drawer = !drawer" class="mr-1">
        <v-icon color="white" size="24">mdi-menu</v-icon>
      </v-btn>
    </template>
    <template v-else>
      <v-app-bar-nav-icon @click="drawer = !drawer" class="d-md-none" />
    </template>

    <!-- Logo & Brand -->
    <v-toolbar-title class="ml-0 d-flex align-center">
      <router-link to="/" class="text-white text-decoration-none d-flex align-center">
        <v-avatar color="white" :size="isMobile ? 28 : 40" class="mr-2">
          <v-icon color="primary" :size="isMobile ? 16 : 28">mdi-tag-multiple</v-icon>
        </v-avatar>
        <span v-if="isMobile" class="text-body-2 font-weight-bold">FreshDeals</span>
        <div v-else class="d-none d-sm-block">
          <div class="text-h6 font-weight-bold">{{ $t('common.appName') }}</div>
          <div class="text-caption" style="margin-top: -4px; opacity: 0.9">Best Deals Daily</div>
        </div>
      </router-link>
    </v-toolbar-title>

    <!-- Desktop Navigation -->
    <v-tabs v-if="!isMobile" class="d-none d-md-flex ml-6" density="compact" color="white">
      <v-tab to="/" exact>
        <v-icon start size="small">mdi-home</v-icon>
        {{ $t('common.home') }}
      </v-tab>
      <v-tab :to="'/category/electronics'">
        <v-icon start size="small">mdi-cellphone-link</v-icon>
        Electronics
      </v-tab>
      <v-tab :to="'/category/fashion'">
        <v-icon start size="small">mdi-tshirt-crew</v-icon>
        Fashion
      </v-tab>
    </v-tabs>

    <v-spacer></v-spacer>

    <!-- Search Bar (Desktop & Tablet) -->
    <SearchBar v-if="!isMobile" class="search-bar d-none d-sm-block" />
    
    <!-- Mobile Search Button -->
    <v-btn v-if="isMobile" icon variant="text" @click="showMobileSearch = !showMobileSearch" size="small">
      <v-icon color="white">mdi-magnify</v-icon>
    </v-btn>

    <v-spacer v-if="!isMobile" class="d-none d-sm-block"></v-spacer>

    <!-- Action Buttons -->
    <div class="d-flex align-center">
      <!-- GTranslate Widget -->
      <GTranslateWidget class="gtranslate-header d-none d-sm-flex" />

      <!-- Notifications Icon - Hidden on mobile -->
      <v-btn v-if="!isMobile" icon @click="toggleNotifications" size="small">
        <v-badge :content="unreadCount" :model-value="unreadCount > 0" color="error" offset-x="-2" offset-y="2">
          <v-icon>{{ notificationsEnabled ? 'mdi-bell' : 'mdi-bell-off' }}</v-icon>
        </v-badge>
      </v-btn>

      <!-- Theme Toggle (Desktop only) -->
      <v-btn v-if="!isMobile" icon @click="toggleTheme" size="small" :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'">
        <v-icon>{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
      </v-btn>

      <!-- Admin Link - Hidden on mobile -->
      <v-btn v-if="!isMobile && isAdminLoggedIn" icon :to="adminLink" size="small">
        <v-icon>mdi-cog</v-icon>
      </v-btn>
    </div>
  </v-app-bar>

  <!-- Mobile Search Overlay -->
  <v-slide-y-transition>
    <v-sheet v-if="showMobileSearch" class="mobile-search-overlay pa-3" color="primary" elevation="4">
      <div class="d-flex align-center gap-2">
        <v-text-field
          v-model="mobileSearchQuery"
          placeholder="Search deals..."
          variant="solo"
          density="compact"
          hide-details
          autofocus
          prepend-inner-icon="mdi-magnify"
          @keyup.enter="performMobileSearch"
          rounded="lg"
          class="flex-grow-1"
        />
        <v-btn icon @click="showMobileSearch = false" color="white" variant="text" size="small">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
    </v-sheet>
  </v-slide-y-transition>

  <!-- Navigation Drawer (Mobile) -->
  <v-navigation-drawer v-model="drawer" app temporary>
    <v-list density="comfortable">
      <v-list-item>
        <div class="d-flex align-center pa-2">
          <v-avatar color="primary" size="48" class="mr-3">
            <v-icon color="white" size="28">mdi-tag-multiple</v-icon>
          </v-avatar>
          <div>
            <div class="text-h6 font-weight-bold">{{ $t('common.appName') }}</div>
            <div class="text-caption text-grey">Best Deals Daily</div>
          </div>
        </div>
      </v-list-item>
      <v-divider class="my-2"></v-divider>
      
      <v-list-subheader>NAVIGATION</v-list-subheader>
      <v-list-item to="/" @click="drawer = false" prepend-icon="mdi-home" rounded="lg">
        <v-list-item-title>{{ $t('common.home') }}</v-list-item-title>
      </v-list-item>
      
      <v-divider class="my-2"></v-divider>
      <v-list-subheader>CATEGORIES</v-list-subheader>
      
      <v-list-item :to="'/category/electronics'" @click="drawer = false" prepend-icon="mdi-cellphone-link" rounded="lg">
        <v-list-item-title>Electronics</v-list-item-title>
      </v-list-item>
      <v-list-item :to="'/category/fashion'" @click="drawer = false" prepend-icon="mdi-tshirt-crew" rounded="lg">
        <v-list-item-title>Fashion</v-list-item-title>
      </v-list-item>
      <v-list-item :to="'/category/home'" @click="drawer = false" prepend-icon="mdi-sofa" rounded="lg">
        <v-list-item-title>Home & Living</v-list-item-title>
      </v-list-item>
      <v-list-item :to="'/category/beauty'" @click="drawer = false" prepend-icon="mdi-lipstick" rounded="lg">
        <v-list-item-title>Beauty</v-list-item-title>
      </v-list-item>
      <v-list-item :to="'/category/food'" @click="drawer = false" prepend-icon="mdi-silverware-fork-knife" rounded="lg">
        <v-list-item-title>Food & Grocery</v-list-item-title>
      </v-list-item>
      <v-list-item :to="'/category/sports'" @click="drawer = false" prepend-icon="mdi-basketball" rounded="lg">
        <v-list-item-title>Sports</v-list-item-title>
      </v-list-item>
      
      <v-divider class="my-2"></v-divider>
      <v-list-subheader>SETTINGS</v-list-subheader>
      
      <v-list-item @click="toggleNotifications" prepend-icon="mdi-bell" rounded="lg">
        <v-list-item-title>Notifications</v-list-item-title>
        <template v-slot:append>
          <v-switch v-model="notificationsEnabled" hide-details density="compact" color="primary" />
        </template>
      </v-list-item>

      <v-list-item rounded="lg">
        <GTranslateWidget class="gtranslate-header-mobile" />
      </v-list-item>

      <v-list-item @click="toggleTheme" prepend-icon="mdi-theme-light-dark" rounded="lg">
        <v-list-item-title>Theme</v-list-item-title>
        <template v-slot:append>
          <v-switch :model-value="isDark" hide-details density="compact" color="primary" />
        </template>
      </v-list-item>
      
      <v-list-item v-if="isAdminLoggedIn" :to="adminLink" @click="drawer = false" prepend-icon="mdi-cog" rounded="lg">
        <v-list-item-title>{{ $t('admin.dashboard') }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDisplay, useTheme } from 'vuetify';
import { requestNotificationPermission } from '../services/notificationService';
import adminAuthService from '../services/adminAuthService';
import SearchBar from './SearchBar.vue';
import GTranslateWidget from './GTranslateWidget.vue';

const router = useRouter();
const { mobile } = useDisplay();
const theme = useTheme();

const drawer = ref(false);
const showMobileSearch = ref(false);
const mobileSearchQuery = ref('');
const notificationsEnabled = ref(false);
const unreadCount = ref(0);
const isAdminLoggedIn = ref(false);

const isMobile = computed(() => mobile.value);
const adminLink = computed(() => (isAdminLoggedIn.value ? '/admin/dashboard' : '/admin/login'));
const isDark = computed(() => theme.global.name.value === 'dark');

const toggleNotifications = async () => {
  const allowed = await requestNotificationPermission();
  notificationsEnabled.value = allowed;
};

const toggleTheme = () => {
  const next = isDark.value ? 'light' : 'dark';
  theme.global.name.value = next;
  localStorage.setItem('theme', next);
};

const performMobileSearch = () => {
  if (mobileSearchQuery.value.trim()) {
    router.push({ path: '/search', query: { q: mobileSearchQuery.value } });
    showMobileSearch.value = false;
    mobileSearchQuery.value = '';
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
});

onUnmounted(() => {
  window.removeEventListener('storage', handleStorage);
});
</script>

<style scoped>
.text-decoration-none {
  text-decoration: none;
}

.search-bar {
  flex: 1;
  max-width: 400px;
}

.mobile-search-overlay {
  position: fixed;
  top: 56px;
  left: 0;
  right: 0;
  z-index: 1000;
}

.gtranslate-header :deep(.gtranslate_wrapper) {
  display: inline-flex;
  align-items: center;
}

.gtranslate-header-mobile :deep(.gtranslate_wrapper) {
  display: inline-flex;
  align-items: center;
}

@media (max-width: 600px) {
  .search-bar {
    max-width: 100%;
    margin: 0 8px;
  }
}
</style>
