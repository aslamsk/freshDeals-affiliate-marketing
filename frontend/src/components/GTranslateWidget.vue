<template>
  <div class="gtranslate_wrapper"></div>
</template>

<script setup>
import { onMounted } from 'vue';

const scriptId = 'gtranslate-widget-script';

const loadGTranslate = () => {
  if (document.getElementById(scriptId)) {
    return;
  }

  window.gtranslateSettings = {
    default_language: 'en',
    wrapper_selector: '.gtranslate_wrapper',
    flag_size: 16,
    switcher_horizontal_position: 'right',
    switcher_vertical_position: 'top',
    flag_style: '3d',
  };

  const script = document.createElement('script');
  script.id = scriptId;
  script.src = 'https://cdn.gtranslate.net/widgets/latest/dwf.js';
  script.defer = true;
  document.head.appendChild(script);
};

onMounted(() => {
  loadGTranslate();
});
</script>

<style scoped>
.gtranslate_wrapper :deep(select) {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: inherit;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 12px;
}
.gt_switcher_wrapper{
  top: 15px !important;
}
</style>
