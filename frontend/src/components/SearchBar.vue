<template>
  <div class="search-container">
    <v-text-field
      v-model="searchQuery"
      :placeholder="$t('common.search')"
      prepend-inner-icon="mdi-magnify"
      variant="solo"
      density="comfortable"
      rounded
      clearable
      hide-details
      @update:model-value="handleSearch"
      @keydown.enter="performSearch"
      class="search-field"
    >
      <template v-slot:append-inner>
        <v-btn
          icon
          size="small"
          @click="performSearch"
          color="primary"
          variant="flat"
          v-if="searchQuery"
        >
          <v-icon size="20">mdi-arrow-right</v-icon>
        </v-btn>
      </template>
    </v-text-field>

    <!-- Search Suggestions Dropdown -->
    <v-card
      v-if="showSuggestions && suggestions.length > 0"
      class="suggestions-card elevation-8"
      rounded="lg"
    >
      <v-list density="comfortable">
        <v-list-subheader class="text-caption font-weight-bold">SUGGESTIONS</v-list-subheader>
        <v-list-item
          v-for="suggestion in suggestions"
          :key="suggestion.id"
          @click="selectSuggestion(suggestion)"
          class="suggestion-item"
        >
          <template v-slot:prepend>
            <v-avatar :color="suggestion.type === 'Deal' ? 'primary' : 'success'" size="32">
              <v-icon size="18" color="white">{{ suggestion.icon }}</v-icon>
            </v-avatar>
          </template>
          <v-list-item-title class="text-subtitle-2 font-weight-medium">
            {{ suggestion.title }}
          </v-list-item-title>
          <template v-slot:append>
            <v-chip size="x-small" :color="suggestion.type === 'Deal' ? 'primary' : 'success'" variant="flat">
              {{ suggestion.type }}
            </v-chip>
          </template>
        </v-list-item>
      </v-list>
    </v-card>
    
    <v-card
      v-else-if="showSuggestions && searchQuery && !loading && suggestions.length === 0"
      class="suggestions-card elevation-8"
      rounded="lg"
    >
      <v-list density="comfortable">
        <v-list-item>
          <div class="text-center py-2">
            <v-icon color="grey" size="32" class="mb-2">mdi-magnify-close</v-icon>
            <p class="text-caption text-grey">{{ $t('common.noResults') }}</p>
          </div>
        </v-list-item>
      </v-list>
    </v-card>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import firebaseDealsService from '../services/firebaseDealsService';

const router = useRouter();
const searchQuery = ref('');
const suggestions = ref([]);
const showSuggestions = ref(false);
const loading = ref(false);

const handleSearch = async (query) => {
  if (!query || query.trim().length < 2) {
    suggestions.value = [];
    showSuggestions.value = false;
    return;
  }

  loading.value = true;
  try {
    const [deals, products] = await Promise.all([
      firebaseDealsService.searchDeals(query),
      firebaseDealsService.searchProducts(query),
    ]);

    suggestions.value = [
      ...deals.slice(0, 3).map(deal => ({
        id: deal.id,
        title: deal.title || deal.title_en || deal.title_te,
        type: 'Deal',
        icon: 'mdi-tag',
        deal,
      })),
      ...products.slice(0, 2).map(product => ({
        id: product.id,
        title: product.title_en || product.title_te,
        type: 'Product',
        icon: 'mdi-package',
        product,
      })),
    ];
    showSuggestions.value = suggestions.value.length > 0;
  } catch (error) {
    console.error('Search error:', error);
    suggestions.value = [];
  } finally {
    loading.value = false;
  }
};

const selectSuggestion = (suggestion) => {
  showSuggestions.value = false;
  if (suggestion.deal) {
    searchQuery.value = '';
    router.push(`/search?q=${encodeURIComponent(suggestion.title)}&type=deal&id=${suggestion.id}`);
  } else if (suggestion.product) {
    router.push(`/product/${suggestion.id}`);
  }
};

const performSearch = () => {
  if (!searchQuery.value.trim()) return;
  showSuggestions.value = false;
  router.push(`/search?q=${encodeURIComponent(searchQuery.value)}`);
};
</script>

<style scoped>
.search-container {
  flex: 1;
  max-width: 600px;
  position: relative;
}

.search-field {
  margin: 0;
}

.search-field :deep(.v-field) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.search-field :deep(.v-field:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.search-field :deep(.v-field--focused) {
  box-shadow: 0 4px 16px rgba(255, 107, 53, 0.3);
}

.suggestions-card {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 1000;
  max-height: 400px;
  overflow-y: auto;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.suggestion-item {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.suggestion-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

@media (max-width: 600px) {
  .search-container {
    max-width: 100%;
  }
}
</style>
