<template>
  <div class="filter-container">
    <!-- Filter Button -->
    <v-btn
      @click="filterDrawer = !filterDrawer"
      :class="{ 'filter-active': hasActiveFilters }"
      color="primary"
      variant="elevated"
      prepend-icon="mdi-filter-variant"
      size="large"
    >
      {{ $t('common.filters') }}
      <v-badge v-if="activeFilterCount > 0" :content="activeFilterCount" color="error" floating></v-badge>
    </v-btn>

    <!-- Filter Drawer -->
    <v-navigation-drawer
      v-model="filterDrawer"
      location="end"
      temporary
      width="350"
      class="filter-drawer"
    >
      <v-card flat class="fill-height d-flex flex-column">
        <v-card-title class="d-flex justify-space-between align-center bg-primary text-white pa-4">
          <div class="d-flex align-center">
            <v-icon class="mr-2">mdi-filter-variant</v-icon>
            <span class="text-h6">{{ $t('common.filters') }}</span>
          </div>
          <v-btn icon size="small" @click="filterDrawer = false" variant="text" color="white">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pt-4 flex-grow-1 overflow-y-auto">
          <!-- Price Range Filter -->
          <div class="filter-section mb-6">
            <div class="d-flex align-center mb-3">
              <v-icon color="primary" size="20" class="mr-2">mdi-currency-inr</v-icon>
              <h3 class="text-subtitle-1 font-weight-bold">{{ $t('filters.priceRange') }}</h3>
            </div>
            <v-range-slider
              v-model="filters.priceRange"
              min="0"
              max="100000"
              step="500"
              @update:model-value="applyFilters"
              color="primary"
              thumb-label="always"
              class="mt-4"
            ></v-range-slider>
            <v-chip color="primary" variant="outlined" class="mt-2">
              ₹{{ formatNumber(filters.priceRange[0]) }} - ₹{{ formatNumber(filters.priceRange[1]) }}
            </v-chip>
          </div>

          <v-divider class="my-4"></v-divider>

          <!-- Category Filter -->
          <div class="filter-section mb-6">
            <div class="d-flex align-center mb-3">
              <v-icon color="primary" size="20" class="mr-2">mdi-tag-multiple</v-icon>
              <h3 class="text-subtitle-1 font-weight-bold">{{ $t('filters.category') }}</h3>
            </div>
            <v-chip-group
              v-model="filters.categories"
              column
              multiple
              @update:model-value="applyFilters"
            >
              <v-chip
                v-for="cat in categories"
                :key="cat"
                :value="cat"
                filter
                variant="outlined"
                color="primary"
              >
                {{ $t(`categories.${cat}`, cat) }}
              </v-chip>
            </v-chip-group>
          </div>

          <v-divider class="my-4"></v-divider>

          <!-- Platform Filter -->
          <div class="filter-section mb-6">
            <div class="d-flex align-center mb-3">
              <v-icon color="primary" size="20" class="mr-2">mdi-store</v-icon>
              <h3 class="text-subtitle-1 font-weight-bold">{{ $t('filters.platform') }}</h3>
              <v-chip size="x-small" color="grey" variant="tonal" class="ml-2">{{ platforms.length }}</v-chip>
            </div>
            <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-2" />
            <v-chip-group
              v-model="filters.platforms"
              column
              multiple
              @update:model-value="applyFilters"
            >
              <v-chip
                v-for="platform in platforms"
                :key="platform"
                :value="platform"
                filter
                variant="outlined"
                color="primary"
              >
                {{ platform }}
              </v-chip>
            </v-chip-group>
          </div>

          <v-divider class="my-4"></v-divider>

          <!-- Discount Filter -->
          <div class="filter-section mb-6">
            <div class="d-flex align-center mb-3">
              <v-icon color="primary" size="20" class="mr-2">mdi-sale</v-icon>
              <h3 class="text-subtitle-1 font-weight-bold">{{ $t('filters.discount') }}</h3>
            </div>
            <v-radio-group v-model="filters.minDiscount" @update:model-value="applyFilters">
              <v-radio label="20% or more" value="20" color="primary"></v-radio>
              <v-radio label="40% or more" value="40" color="primary"></v-radio>
              <v-radio label="60% or more" value="60" color="primary"></v-radio>
            </v-radio-group>
          </div>

          <v-divider class="my-4"></v-divider>

          <!-- Sort Options -->
          <div class="filter-section mb-6">
            <div class="d-flex align-center mb-3">
              <v-icon color="primary" size="20" class="mr-2">mdi-sort</v-icon>
              <h3 class="text-subtitle-1 font-weight-bold">{{ $t('filters.sortBy') }}</h3>
            </div>
            <v-select
              v-model="filters.sortBy"
              :items="sortOptions"
              @update:model-value="applyFilters"
              density="comfortable"
              variant="outlined"
              color="primary"
            ></v-select>
          </div>
        </v-card-text>

        <!-- Action Buttons -->
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-btn
            block
            variant="elevated"
            color="error"
            size="large"
            @click="clearFilters"
            v-if="hasActiveFilters"
            prepend-icon="mdi-close-circle"
          >
            {{ $t('filters.clear') }}
          </v-btn>
          <v-btn
            block
            variant="elevated"
            color="success"
            size="large"
            @click="filterDrawer = false"
            prepend-icon="mdi-check"
          >
            Apply Filters
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-navigation-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

const emit = defineEmits(['filters-changed']);

const filterDrawer = ref(false);
const categories = ref(['electronics', 'fashion', 'home', 'beauty', 'food', 'sports']);
const platforms = ref(['Amazon', 'Flipkart', 'Myntra', 'Meesho', 'AJIO', 'Tata CLiQ']);
const loading = ref(false);

const filters = ref({
  priceRange: [0, 100000],
  categories: [],
  platforms: [],
  minDiscount: null,
  sortBy: 'newest',
});

const sortOptions = ref([
  { title: 'Newest First', value: 'newest' },
  { title: 'Price: Low to High', value: 'price-asc' },
  { title: 'Price: High to Low', value: 'price-desc' },
  { title: 'Highest Discount', value: 'discount-desc' },
  { title: 'Most Popular', value: 'popular' },
]);

const hasActiveFilters = computed(() => {
  return (
    filters.value.categories.length > 0 ||
    filters.value.platforms.length > 0 ||
    filters.value.minDiscount ||
    filters.value.sortBy !== 'newest' ||
    filters.value.priceRange[0] !== 0 ||
    filters.value.priceRange[1] !== 100000
  );
});

const activeFilterCount = computed(() => {
  let count = 0;
  if (filters.value.categories.length > 0) count++;
  if (filters.value.platforms.length > 0) count++;
  if (filters.value.minDiscount) count++;
  if (filters.value.sortBy !== 'newest') count++;
  if (filters.value.priceRange[0] !== 0 || filters.value.priceRange[1] !== 100000) count++;
  return count;
});

const applyFilters = () => {
  emit('filters-changed', { ...filters.value });
};

const clearFilters = () => {
  filters.value = {
    priceRange: [0, 100000],
    categories: [],
    platforms: [],
    minDiscount: null,
    sortBy: 'newest',
  };
  applyFilters();
};

const formatNumber = (num) => {
  return new Intl.NumberFormat('en-IN').format(num);
};

const loadPlatforms = async () => {
  try {
    const allPlatformNames = new Set();
    
    // Add default platforms
    const defaultPlatforms = ['Amazon', 'Flipkart', 'Myntra', 'Meesho', 'AJIO', 'Tata CLiQ', 'Nykaa', 'Snapdeal'];
    defaultPlatforms.forEach(p => allPlatformNames.add(p));
    
    // Load custom platforms from Firestore
    try {
      const customPlatformsSnap = await getDocs(collection(db, 'custom_platforms'));
      customPlatformsSnap.docs.forEach(doc => {
        const name = doc.data().name;
        if (name) allPlatformNames.add(name);
      });
    } catch (e) {
      console.warn('Could not load custom_platforms:', e);
    }
    
    // Load platforms from products
    try {
      const productsSnap = await getDocs(collection(db, 'products'));
      productsSnap.docs.forEach(doc => {
        const data = doc.data();
        const platform = data.dealPlatform || data.platform;
        if (platform) {
          // Format platform name nicely
          const formatted = formatPlatformName(platform);
          allPlatformNames.add(formatted);
        }
      });
    } catch (e) {
      console.warn('Could not load products for platforms:', e);
    }
    
    // Load platforms from deals
    try {
      const dealsSnap = await getDocs(collection(db, 'deals'));
      dealsSnap.docs.forEach(doc => {
        const data = doc.data();
        const platform = data.platform || data.dealPlatform;
        if (platform) {
          const formatted = formatPlatformName(platform);
          allPlatformNames.add(formatted);
        }
      });
    } catch (e) {
      console.warn('Could not load deals for platforms:', e);
    }
    
    platforms.value = Array.from(allPlatformNames).sort();
    console.log('✅ Loaded platforms:', platforms.value);
  } catch (error) {
    console.error('Error loading platforms:', error);
  }
};

// Helper to format platform names consistently
const formatPlatformName = (name) => {
  if (!name) return '';
  // Replace underscores with spaces
  let formatted = name.replace(/_/g, ' ');
  // Capitalize each word
  formatted = formatted.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
  return formatted;
};

const loadCategories = async () => {
  try {
    const allCategories = new Set([...categories.value]);
    
    // Load categories from products
    try {
      const productsSnap = await getDocs(collection(db, 'products'));
      productsSnap.docs.forEach(doc => {
        const category = doc.data().category;
        if (category) {
          allCategories.add(category.toLowerCase());
        }
      });
    } catch (e) {
      console.warn('Could not load product categories:', e);
    }
    
    // Load categories from deals
    try {
      const dealsSnap = await getDocs(collection(db, 'deals'));
      dealsSnap.docs.forEach(doc => {
        const category = doc.data().category;
        if (category) {
          allCategories.add(category.toLowerCase());
        }
      });
    } catch (e) {
      console.warn('Could not load deal categories:', e);
    }
    
    categories.value = Array.from(allCategories).sort();
    console.log('✅ Loaded categories:', categories.value);
  } catch (error) {
    console.error('Error loading categories:', error);
  }
};

onMounted(async () => {
  loading.value = true;
  await Promise.all([loadPlatforms(), loadCategories()]);
  loading.value = false;
  applyFilters();
});
</script>

<style scoped>
.filter-container {
  display: flex;
  align-items: center;
}

.filter-active {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.filter-drawer {
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.1);
}

.filter-section {
  padding: 8px 0;
}
</style>
