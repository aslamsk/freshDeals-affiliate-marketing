<template>
  <div>
    <v-container class="py-8">
      <v-row class="mb-4">
        <v-col cols="12">
          <h1>{{ $t('categories.' + category) }}</h1>
        </v-col>
      </v-row>

      <!-- Loading -->
      <v-row v-if="loading">
        <v-col cols="12">
          <div class="text-center">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
          </div>
        </v-col>
      </v-row>

      <!-- Deals Grid -->
      <v-row v-else>
        <v-col
          v-for="deal in deals"
          :key="deal.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <DealCard :deal="deal" />
        </v-col>
      </v-row>

      <!-- No Results -->
      <v-row v-if="!loading && deals.length === 0">
        <v-col cols="12">
          <div class="text-center py-8">
            <v-icon size="64" color="primary" class="mb-2">mdi-inbox-multiple</v-icon>
            <p>{{ $t('common.noResults') }}</p>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useDealsStore } from '../stores/dealsStore';
import DealCard from '../components/DealCard.vue';

const route = useRoute();
const dealsStore = useDealsStore();
const category = ref(route.params.category);
const deals = ref([]);
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  deals.value = await dealsStore.getDealsByCategory(category.value, 20);
  loading.value = false;
});
</script>
