import { createVuetify } from 'vuetify';
import 'vuetify/styles';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { md3 } from 'vuetify/blueprints';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import '@mdi/font/css/materialdesignicons.css';

export default createVuetify({
  blueprint: md3,
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    sets: {
      mdi,
    },
    aliases,
  },
  theme: {
    defaultTheme: typeof window !== 'undefined' && localStorage.getItem('theme') === 'dark' ? 'dark' : 'light',
    themes: {
      light: {
        colors: {
          primary: '#FF6B35',
          secondary: '#004E89',
          accent: '#F77F00',
          danger: '#D62828',
          success: '#06A77D',
          warning: '#FFD60A',
          dark: '#1A1A1A',
          light: '#F5F5F5',
          background: '#F5F5F5',
          surface: '#FFFFFF',
          'on-surface': '#1A1A1A'
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: '#FF6B35',
          secondary: '#4DA3FF',
          accent: '#FF9F1C',
          danger: '#FF6B6B',
          success: '#2EC4B6',
          warning: '#FFD166',
          dark: '#0F1115',
          light: '#1B1F2A',
          background: '#0F1115',
          surface: '#1B1F2A',
          'on-surface': '#E6E6E6'
        }
      }
    },
  },
});
