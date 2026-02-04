<template>
  <v-dialog v-model="showDialog" persistent>
    <v-card>
      <v-card-title>
        {{ $t('pwa.installPrompt') }}
      </v-card-title>
      <v-card-text>
        {{ $t('pwa.installMessage') }}
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="dismiss">
          {{ $t('pwa.dismiss') }}
        </v-btn>
        <v-btn color="primary" @click="install">
          {{ $t('pwa.install') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const showDialog = ref(false);
let deferredPrompt = null;

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showDialog.value = true;
  });
});

const install = async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    deferredPrompt = null;
    showDialog.value = false;
  }
};

const dismiss = () => {
  showDialog.value = false;
};
</script>
