import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { md3 } from 'vuetify/blueprints';
import { h } from 'vue';
import {
  mdiTranslate,
  mdiBell,
  mdiBellOff,
  mdiCog,
  mdiTools,
  mdiPencil,
  mdiTrashCan,
  mdiPlus,
  mdiLink,
  mdiTagMultiple,
  mdiTicket,
  mdiChartLine,
  mdiBellRing,
  mdiDatabasePlus,
  mdiCursorDefaultClick,
  mdiInboxMultiple,
} from '@mdi/js';

const customIconSet = {
  'mdi-translate': mdiTranslate,
  'mdi-bell': mdiBell,
  'mdi-bell-off': mdiBellOff,
  'mdi-cog': mdiCog,
  'mdi-tools': mdiTools,
  'mdi-pencil': mdiPencil,
  'mdi-trash-can': mdiTrashCan,
  'mdi-plus': mdiPlus,
  'mdi-link': mdiLink,
  'mdi-tag-multiple': mdiTagMultiple,
  'mdi-ticket': mdiTicket,
  'mdi-chart-line': mdiChartLine,
  'mdi-bell-ring': mdiBellRing,
  'mdi-database-plus': mdiDatabasePlus,
  'mdi-cursor-default-click': mdiCursorDefaultClick,
  'mdi-inbox-multiple': mdiInboxMultiple,
};

const mdiSvgNameToComponent = {
  component: ({ icon }) => {
    const iconPath = customIconSet[icon];
    return h('svg', {
      class: 'v-icon__svg',
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 24 24',
      role: 'img',
      'aria-hidden': true,
      style: {
        width: '1em',
        height: '1em',
      },
    }, [
      h('path', {
        d: iconPath || '',
      }),
    ]);
  },
};

export default createVuetify({
  blueprint: md3,
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    sets: {
      mdi: mdiSvgNameToComponent,
    },
  },
  theme: {
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
        },
      },
    },
  },
});
