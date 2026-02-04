import { createApp } from 'vue';
import { pinia } from './stores/pinia';
import vuetify from './plugins/vuetify';
import router from './router';
import App from './App.vue';
import './main.css';
import { registerSW } from 'virtual:pwa-register';
import { t } from './utils/translate';

// Global fetch interceptor to debug ALL requests
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('🌐 FETCH CALLED:', args[0]);
  return originalFetch.apply(this, args);
};

const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(vuetify);
app.config.globalProperties.$t = t;

app.mount('#app');

// PWA update handling
if (import.meta.env.DEV) {
  // Ensure dev never serves stale assets from a previously registered SW
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    });
  }
} else {
  const UPDATE_KEY = 'pwa_update_applied';
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        if (registration.active?.scriptURL?.endsWith('/service-worker.js')) {
          registration.unregister();
        }
      });
    });
  }
  const updateSW = registerSW({
    immediate: false,
    onNeedRefresh() {
      // Apply update only once per session to avoid refresh loops
      if (sessionStorage.getItem(UPDATE_KEY)) return;
      sessionStorage.setItem(UPDATE_KEY, '1');
      updateSW(true);
    },
    onOfflineReady() {
      console.log('App is ready to work offline.');
    },
  });
}
