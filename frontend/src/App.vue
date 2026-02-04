<template>
  <v-app>
    <Header />
    <v-main>
      <router-view :key="$route.path" />
    </v-main>
    <Footer style="position: relative !important;" />
    <PWAInstallPrompt />
    <DevTools />
  </v-app>
</template>

<script setup>
import { onMounted } from 'vue';
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
import PWAInstallPrompt from './components/PWAInstallPrompt.vue';
import DevTools from './components/DevTools.vue';
import { setupFCM } from './services/notificationService';

onMounted(async () => {
  // Setup service worker and PWA
  await setupFCM();

  // Register service worker for offline support
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').catch((err) => {
      console.error('Service Worker registration failed:', err);
    });
  }
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
