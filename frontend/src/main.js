import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import vuetify from './plugins/vuetify';
import router from './router';
import i18nMessages from './i18n';
import App from './App.vue';
import './main.css';

// Global fetch interceptor to debug ALL requests
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('🌐 FETCH CALLED:', args[0]);
  return originalFetch.apply(this, args);
};

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('language') || 'en',
  fallbackLocale: 'en',
  messages: i18nMessages,
});

const app = createApp(App);

app.use(createPinia());
app.use(i18n);
app.use(router);
app.use(vuetify);

app.mount('#app');
