<template>
  <div class="text-center py-8">
    <v-icon size="120" color="danger" class="mb-4">mdi-alert-circle</v-icon>
    <h1 class="mb-2">404 - Page Not Found</h1>
    <p class="text-subtitle-1 mb-4">The page you're looking for doesn't exist.</p>
    <v-btn color="primary" to="/">
      {{ $t('common.home') }}
    </v-btn>
  </div>
</template>

<script setup>
</script>
