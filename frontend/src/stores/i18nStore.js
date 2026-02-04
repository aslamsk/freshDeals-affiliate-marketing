import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

export const useI18nStore = defineStore('i18n', () => {
  const locale = ref(localStorage.getItem('language') || 'en');
  const i18n = useI18n();

  const setLocale = (newLocale) => {
    locale.value = newLocale;
    i18n.locale.value = newLocale;
    localStorage.setItem('language', newLocale);
  };

  const currentLanguage = computed(() => {
    return locale.value === 'en' ? 'English' : 'తెలుగు';
  });

  return { locale, setLocale, currentLanguage };
});
