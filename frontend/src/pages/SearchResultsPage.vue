<template>
  <div>
    <v-container class="py-8">
      <!-- Search Header -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-card class="pa-4">
            <v-row align="center" class="g-2">
              <v-col cols="12" md="6">
                <h1 class="text-h5">{{ $t('search.results') }}</h1>
                <p class="text-subtitle-2 text-grey">
                  {{ resultCount }} {{ $t('common.resultsFound') }} for "{{ searchQuery }}"
                </p>
              </v-col>
              <v-col cols="12" md="6" class="d-flex justify-end align-center gap-2">
                <FilterPanel @filters-changed="handleFiltersChanged" />
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

      <!-- Loading State -->
      <v-row v-if="loading" class="mt-4">
        <v-col cols="12">
          <div class="text-center">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
          </div>
        </v-col>
      </v-row>

      <!-- Results Grid -->
      <v-row v-else-if="filteredResults.length > 0" class="mt-4">
        <!-- Deals Results -->
        <v-col cols="12" v-if="dealsResults.length > 0">
          <h2 class="text-h6 mb-3">{{ $t('search.deals') }} ({{ dealsResults.length }})</h2>
        </v-col>
        <v-col
          v-for="deal in dealsResults"
          :key="'deal-' + deal.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <DealCard :deal="deal" />
        </v-col>

        <!-- Products Results -->
        <v-col cols="12" v-if="productsResults.length > 0">
          <h2 class="text-h6 mb-3">{{ $t('search.products') }} ({{ productsResults.length }})</h2>
        </v-col>
        <v-col
          v-for="product in productsResults"
          :key="'product-' + product.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <v-card class="ma-2 h-100 d-flex flex-column">
            <v-img :src="product.image || '/placeholder.png'" height="200" cover></v-img>
            <v-card-title class="text-h6">
              {{ product.title_en || product.title_te || 'Product' }}
            </v-card-title>
            <v-card-text class="flex-grow-1">
              <p class="text-caption mb-2" v-if="product.description">
                {{ product.description.substring(0, 100) }}...
              </p>
              <v-chip color="success" text-color="white" small>
                {{ product.category || 'category' }}
              </v-chip>
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" block :to="`/product/${product.id}`">
                {{ $t('common.viewDeal') }} →
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <!-- No Results -->
      <v-row v-else class="mt-4">
        <v-col cols="12">
          <div class="text-center py-8">
            <v-icon size="64" color="primary" class="mb-2">mdi-inbox-multiple</v-icon>
            <p class="text-h6">{{ $t('common.noResults') }}</p>
            <p class="text-subtitle-2 text-grey">{{ $t('search.tryDifferent') }}</p>

            <!-- Suggestions -->
            <div class="mt-6">
              <p class="text-subtitle-2 font-weight-medium mb-3">{{ $t('search.suggestedCategories') }}</p>
              <v-row justify="center">
                <v-col cols="auto" v-for="cat in ['electronics', 'fashion', 'home']" :key="cat">
                  <v-btn
                    :to="`/category/${cat}`"
                    variant="outlined"
                    color="primary"
                  >
                    {{ $t(`categories.${cat}`, cat) }}
                  </v-btn>
                </v-col>
              </v-row>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Pagination -->
      <v-row v-if="filteredResults.length > 0 && totalPages > 1" class="mt-6 justify-center">
        <v-col cols="auto">
          <v-pagination
            v-model="currentPage"
            :length="totalPages"
            @update:model-value="goToPage"
            color="primary"
          ></v-pagination>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import firebaseDealsService from '../services/firebaseDealsService';
import DealCard from '../components/DealCard.vue';
import FilterPanel from '../components/FilterPanel.vue';

const route = useRoute();
const router = useRouter();

const searchQuery = ref('');
const allResults = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const resultsPerPage = 12;
const activeFilters = ref({
  priceRange: [0, 10000],
  categories: [],
  platforms: [],
  minDiscount: null,
  sortBy: 'newest',
});

const dealsResults = computed(() => {
  return filteredResults.value.filter(r => r.type === 'deal').map(r => r.data);
});

const productsResults = computed(() => {
  return filteredResults.value.filter(r => r.type === 'product').map(r => r.data);
});

const filteredResults = computed(() => {
  let results = [...allResults.value];

  // Apply price filter
  results = results.filter(r => {
    const price = r.data.dealPrice || r.data.price || 0;
    return price >= activeFilters.value.priceRange[0] && price <= activeFilters.value.priceRange[1];
  });

  // Apply category filter
  if (activeFilters.value.categories.length > 0) {
    results = results.filter(r => {
      const category = r.data.category || r.data.platforms?.[0] || '';
      return activeFilters.value.categories.includes(category);
    });
  }

  // Apply platform filter
  if (activeFilters.value.platforms.length > 0) {
    results = results.filter(r => {
      const platform = r.data.platform || r.data.platforms?.[0] || '';
      return activeFilters.value.platforms.includes(platform);
    });
  }

  // Apply discount filter
  if (activeFilters.value.minDiscount) {
    const minDiscount = parseInt(activeFilters.value.minDiscount);
    results = results.filter(r => {
      const discount = r.data.discount || 0;
      return discount >= minDiscount;
    });
  }

  // Apply sorting
  switch (activeFilters.value.sortBy) {
    case 'price-asc':
      results.sort((a, b) => (a.data.dealPrice || 0) - (b.data.dealPrice || 0));
      break;
    case 'price-desc':
      results.sort((a, b) => (b.data.dealPrice || 0) - (a.data.dealPrice || 0));
      break;
    case 'discount-desc':
      results.sort((a, b) => (b.data.discount || 0) - (a.data.discount || 0));
      break;
    case 'popular':
      results.sort((a, b) => (b.data.clicks || 0) - (a.data.clicks || 0));
      break;
    case 'newest':
    default:
      results.sort((a, b) => {
        const timeA = a.data.createdAt?.toMillis?.() || 0;
        const timeB = b.data.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      });
  }

  return results;
});

const paginatedResults = computed(() => {
  const start = (currentPage.value - 1) * resultsPerPage;
  const end = start + resultsPerPage;
  return filteredResults.value.slice(start, end);
});

const resultCount = computed(() => filteredResults.value.length);
const totalPages = computed(() => Math.ceil(filteredResults.value.length / resultsPerPage));

const handleFiltersChanged = (filters) => {
  activeFilters.value = filters;
  currentPage.value = 1;
};

const goToPage = (page) => {
  currentPage.value = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const performSearch = async () => {
  loading.value = true;
  try {
    const query = searchQuery.value.trim();
    if (!query) {
      allResults.value = [];
      return;
    }

    const [deals, products] = await Promise.all([
      firebaseDealsService.searchDeals(query),
      firebaseDealsService.searchProducts(query),
    ]);

    allResults.value = [
      ...deals.map(deal => ({ type: 'deal', data: deal })),
      ...products.map(product => ({ type: 'product', data: product })),
    ];

    currentPage.value = 1;
  } catch (error) {
    console.error('Search error:', error);
    allResults.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  searchQuery.value = route.query.q || '';
  if (searchQuery.value) {
    performSearch();
  }
});

watch(() => route.query.q, (newQuery) => {
  searchQuery.value = newQuery || '';
  if (searchQuery.value) {
    performSearch();
  }
});
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}

.h-100 {
  height: 100%;
}

.d-flex {
  display: flex;
}

.flex-column {
  flex-direction: column;
}

.flex-grow-1 {
  flex-grow: 1;
}
</style>
