<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <v-container>
        <v-row align="center">
          <v-col cols="12" md="7">
            <div class="hero-content">
              <v-chip color="white" variant="flat" class="mb-4 px-4" size="small">
                <v-icon start size="14" color="success">mdi-circle</v-icon>
                Live Deals Updated
              </v-chip>
              <h1 class="hero-title">
                {{ $t('home.title') }} 🎉
              </h1>
              <p class="hero-subtitle">
                {{ $t('home.description') }}
              </p>
              <div class="hero-stats mt-6">
                <div class="stat-item">
                  <v-icon color="white" class="mb-1">mdi-fire</v-icon>
                  <div class="stat-value">{{ deals.length }}</div>
                  <div class="stat-label">Hot Deals</div>
                </div>
                <div class="stat-item">
                  <v-icon color="white" class="mb-1">mdi-package-variant</v-icon>
                  <div class="stat-value">{{ products.length }}</div>
                  <div class="stat-label">Products</div>
                </div>
                <div class="stat-item">
                  <v-icon color="white" class="mb-1">mdi-store</v-icon>
                  <div class="stat-value">{{ uniquePlatforms }}</div>
                  <div class="stat-label">Platforms</div>
                </div>
              </div>
            </div>
          </v-col>
          <v-col cols="12" md="5" class="d-none d-md-flex justify-center">
            <div class="hero-illustration">
              <v-icon size="180" color="white" style="opacity: 0.2">mdi-sale</v-icon>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <v-container class="main-content py-8">
      <!-- Category Browser -->
      <CategoryBrowser 
        class="mb-6" 
        :selected-category="selectedCategory"
        @category-selected="handleCategorySelect"
      />

      <!-- Filter Bar -->
      <v-card class="filter-bar mb-6" elevation="1" rounded="xl">
        <v-card-text class="pa-4">
          <v-row align="center" no-gutters>
            <!-- Search -->
            <v-col cols="12" md="6" class="mb-3 mb-md-0">
              <v-text-field
                v-model="searchQuery"
                placeholder="Search deals & products..."
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                hide-details
                clearable
                rounded="lg"
              />
            </v-col>
            
            <v-spacer />
            
            <!-- Filter & Sort -->
            <v-col cols="12" md="5" class="d-flex align-center justify-md-end gap-3">
              <!-- Active Category Indicator -->
              <v-chip
                v-if="selectedCategory"
                color="primary"
                variant="elevated"
                closable
                @click:close="selectedCategory = ''"
              >
                <v-icon start size="16">mdi-tag</v-icon>
                {{ formatCategoryName(selectedCategory) }}
              </v-chip>
              
              <FilterPanel @filters-changed="handleFiltersChanged" />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <v-progress-circular indeterminate color="primary" size="64" width="5" />
        <p class="text-h6 mt-4 text-grey-darken-1">Loading amazing deals...</p>
      </div>

      <template v-else>
        <!-- HOT DEALS SECTION -->
        <section v-if="filteredDeals.length > 0" class="deals-section mb-10">
          <div class="section-header mb-4">
            <div class="d-flex align-center">
              <div class="section-icon deals-icon">
                <v-icon color="white" size="24">mdi-fire</v-icon>
              </div>
              <div class="ml-3">
                <h2 class="section-title">🔥 Hot Deals</h2>
                <p class="section-subtitle">{{ filteredDeals.length }} exclusive deals available now</p>
              </div>
            </div>
            <v-btn 
              v-if="filteredDeals.length > 8"
              variant="text" 
              color="primary"
              append-icon="mdi-arrow-right"
            >
              View All Deals
            </v-btn>
          </div>
          
          <v-row>
            <v-col
              v-for="deal in displayedDeals"
              :key="'deal-' + deal.id"
              cols="6"
              sm="6"
              md="4"
              lg="3"
            >
              <DealCard :deal="deal" />
            </v-col>
          </v-row>
          
          <!-- Show More Deals Button -->
          <div v-if="filteredDeals.length > dealsToShow" class="text-center mt-6">
            <v-btn
              color="primary"
              variant="outlined"
              size="large"
              rounded="lg"
              @click="dealsToShow += 8"
            >
              <v-icon start>mdi-plus</v-icon>
              Show More Deals ({{ filteredDeals.length - dealsToShow }} remaining)
            </v-btn>
          </div>
        </section>

        <!-- PRODUCTS SECTION -->
        <section v-if="filteredProducts.length > 0" class="products-section">
          <div class="section-header mb-4">
            <div class="d-flex align-center">
              <div class="section-icon products-icon">
                <v-icon color="white" size="24">mdi-star</v-icon>
              </div>
              <div class="ml-3">
                <h2 class="section-title">⭐ Popular Products</h2>
                <p class="section-subtitle">{{ filteredProducts.length }} products from top platforms</p>
              </div>
            </div>
          </div>
          
          <v-row>
            <v-col
              v-for="product in displayedProducts"
              :key="'product-' + product.id"
              cols="6"
              sm="6"
              md="4"
              lg="3"
            >
              <ProductCard :product="product" />
            </v-col>
          </v-row>
          
          <!-- Show More Products Button -->
          <div v-if="filteredProducts.length > productsToShow" class="text-center mt-6">
            <v-btn
              color="secondary"
              variant="outlined"
              size="large"
              rounded="lg"
              @click="productsToShow += 8"
            >
              <v-icon start>mdi-plus</v-icon>
              Show More Products ({{ filteredProducts.length - productsToShow }} remaining)
            </v-btn>
          </div>
        </section>

        <!-- No Results State -->
        <v-card 
          v-if="filteredDeals.length === 0 && filteredProducts.length === 0" 
          class="text-center py-12" 
          elevation="0" 
          color="grey-lighten-4"
          rounded="xl"
        >
          <v-icon size="80" color="grey-lighten-1" class="mb-4">mdi-inbox-outline</v-icon>
          <h3 class="text-h5 mb-2 text-grey-darken-1">{{ $t('common.noResults') }}</h3>
          <p class="text-body-1 text-grey mb-4">
            {{ searchQuery || selectedCategory ? 'Try adjusting your filters' : 'Check back soon for new deals!' }}
          </p>
          <v-btn 
            v-if="searchQuery || selectedCategory || hasActiveFilters"
            color="primary" 
            variant="elevated"
            @click="clearAllFilters"
          >
            <v-icon start>mdi-refresh</v-icon>
            Clear Filters
          </v-btn>
        </v-card>
      </template>

      <!-- Error State -->
      <v-alert 
        v-if="error" 
        type="error" 
        variant="tonal" 
        prominent 
        class="mt-6"
        rounded="xl"
      >
        <v-alert-title>Error Loading Data</v-alert-title>
        {{ error }}
        <template #append>
          <v-btn variant="outlined" color="error" @click="refreshData">
            <v-icon start>mdi-refresh</v-icon>
            Retry
          </v-btn>
        </template>
      </v-alert>
    </v-container>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import firebaseDealsService from '../services/firebaseDealsService';
import DealCard from '../components/DealCard.vue';
import ProductCard from '../components/ProductCard.vue';
import FilterPanel from '../components/FilterPanel.vue';
import CategoryBrowser from '../components/CategoryBrowser.vue';

// Data
const deals = ref([]);
const products = ref([]);
const loading = ref(true);
const error = ref(null);

// Filters
const searchQuery = ref('');
const selectedCategory = ref('');
const activeFilters = ref({
  priceRange: [0, 100000],
  categories: [],
  platforms: [],
  minDiscount: null,
  sortBy: 'newest',
});

// Pagination
const dealsToShow = ref(8);
const productsToShow = ref(8);

// Computed
const uniquePlatforms = computed(() => {
  const dealPlatforms = deals.value.map(d => d.platform || d.dealPlatform).filter(Boolean);
  const productPlatforms = products.value.map(p => p.dealPlatform || p.platform).filter(Boolean);
  return new Set([...dealPlatforms, ...productPlatforms]).size;
});

// Helper to format category name
const formatCategoryName = (category) => {
  if (!category) return '';
  return category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' ');
};

const hasActiveFilters = computed(() => {
  return (
    activeFilters.value.categories.length > 0 ||
    activeFilters.value.platforms.length > 0 ||
    activeFilters.value.minDiscount ||
    activeFilters.value.sortBy !== 'newest' ||
    activeFilters.value.priceRange[0] !== 0 ||
    activeFilters.value.priceRange[1] !== 100000
  );
});

// Filter and sort deals
const filteredDeals = computed(() => {
  let result = [...deals.value];

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(d => 
      (d.title || d.title_en || '').toLowerCase().includes(query) ||
      (d.description || '').toLowerCase().includes(query) ||
      (d.platform || '').toLowerCase().includes(query)
    );
  }

  // Category filter (from quick filter or category browser)
  if (selectedCategory.value) {
    result = result.filter(d => 
      d.category?.toLowerCase() === selectedCategory.value.toLowerCase()
    );
  }

  // Categories from filter panel
  if (activeFilters.value.categories.length > 0) {
    result = result.filter(d => 
      activeFilters.value.categories.includes(d.category?.toLowerCase())
    );
  }

  // Price filter
  result = result.filter(d => {
    const price = d.dealPrice || d.price || 0;
    return price >= activeFilters.value.priceRange[0] && price <= activeFilters.value.priceRange[1];
  });

  // Platform filter
  if (activeFilters.value.platforms.length > 0) {
    result = result.filter(d => {
      const dealPlatform = normalizePlatform(d.platform || d.dealPlatform || '');
      return activeFilters.value.platforms.some(p => 
        normalizePlatform(p) === dealPlatform
      );
    });
  }

  // Discount filter
  if (activeFilters.value.minDiscount) {
    const minDiscount = parseInt(activeFilters.value.minDiscount);
    result = result.filter(d => (d.discount || 0) >= minDiscount);
  }

  // Sorting
  result = sortItems(result, activeFilters.value.sortBy);

  return result;
});

// Filter and sort products
const filteredProducts = computed(() => {
  let result = [...products.value];

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(p => 
      (p.title_en || p.title_te || p.title || '').toLowerCase().includes(query) ||
      (p.description || '').toLowerCase().includes(query) ||
      (p.dealPlatform || '').toLowerCase().includes(query)
    );
  }

  // Category filter
  if (selectedCategory.value) {
    result = result.filter(p => 
      p.category?.toLowerCase() === selectedCategory.value.toLowerCase()
    );
  }

  // Categories from filter panel
  if (activeFilters.value.categories.length > 0) {
    result = result.filter(p => 
      activeFilters.value.categories.includes(p.category?.toLowerCase())
    );
  }

  // Price filter
  result = result.filter(p => {
    const price = p.dealPrice || p.price || p.originalPrice || 0;
    return price >= activeFilters.value.priceRange[0] && price <= activeFilters.value.priceRange[1];
  });

  // Platform filter
  if (activeFilters.value.platforms.length > 0) {
    result = result.filter(p => {
      const productPlatform = normalizePlatform(p.dealPlatform || p.platform || '');
      return activeFilters.value.platforms.some(plat => 
        normalizePlatform(plat) === productPlatform
      );
    });
  }

  // Discount filter
  if (activeFilters.value.minDiscount) {
    const minDiscount = parseInt(activeFilters.value.minDiscount);
    result = result.filter(p => (p.discount || 0) >= minDiscount);
  }

  // Sorting
  result = sortItems(result, activeFilters.value.sortBy);

  return result;
});

// Displayed items (with pagination)
const displayedDeals = computed(() => filteredDeals.value.slice(0, dealsToShow.value));
const displayedProducts = computed(() => filteredProducts.value.slice(0, productsToShow.value));

// Helper to normalize platform names for comparison
const normalizePlatform = (name) => {
  if (!name) return '';
  // Remove underscores, convert to lowercase, remove spaces
  return name.toLowerCase().replace(/_/g, '').replace(/\s+/g, '');
};

// Helper function for sorting
const sortItems = (items, sortBy) => {
  const sorted = [...items];
  switch (sortBy) {
    case 'price-asc':
      return sorted.sort((a, b) => (a.dealPrice || a.price || 0) - (b.dealPrice || b.price || 0));
    case 'price-desc':
      return sorted.sort((a, b) => (b.dealPrice || b.price || 0) - (a.dealPrice || a.price || 0));
    case 'discount-desc':
      return sorted.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    case 'popular':
      return sorted.sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
    case 'newest':
    default:
      return sorted.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || a.createdAt?.seconds * 1000 || 0;
        const timeB = b.createdAt?.toMillis?.() || b.createdAt?.seconds * 1000 || 0;
        return timeB - timeA;
      });
  }
};

// Event handlers
const handleFiltersChanged = (filters) => {
  activeFilters.value = filters;
  dealsToShow.value = 8;
  productsToShow.value = 8;
};

const handleCategorySelect = (category) => {
  selectedCategory.value = category === selectedCategory.value ? '' : category;
  dealsToShow.value = 8;
  productsToShow.value = 8;
};

const clearAllFilters = () => {
  searchQuery.value = '';
  selectedCategory.value = '';
  activeFilters.value = {
    priceRange: [0, 100000],
    categories: [],
    platforms: [],
    minDiscount: null,
    sortBy: 'newest',
  };
  dealsToShow.value = 8;
  productsToShow.value = 8;
};

const refreshData = async () => {
  await fetchAllData();
};

// Fetch all data
const fetchAllData = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // Fetch deals and products in parallel
    const [dealsData, productsData] = await Promise.all([
      firebaseDealsService.getTodayDeals(100),
      firebaseDealsService.getAllProductsPublic(100)
    ]);
    
    deals.value = dealsData || [];
    products.value = productsData || [];
    
    console.log('✅ Loaded:', deals.value.length, 'deals,', products.value.length, 'products');
  } catch (err) {
    console.error('❌ Error loading data:', err);
    error.value = err.message || 'Failed to load data';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchAllData();
});
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: rgb(var(--v-theme-background));
  color: rgb(var(--v-theme-on-surface));
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 60px 0;
  margin-top: -24px;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 16px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.hero-subtitle {
  font-size: 1.25rem;
  opacity: 0.9;
  max-width: 500px;
}

.hero-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.8;
}

.hero-illustration {
  position: relative;
}

/* Main Content */
.main-content {
  margin-top: -40px;
  position: relative;
  z-index: 2;
}

/* Filter Bar */
.filter-bar {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(0,0,0,0.05);
}

/* Section Styles */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.section-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.deals-icon {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
}

.products-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
}

.section-subtitle {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
  margin: 0;
}

/* Responsive */
@media (max-width: 960px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-section {
    padding: 40px 0;
  }
  
  .hero-stats {
    gap: 24px;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
}

@media (max-width: 600px) {
  .hero-title {
    font-size: 1.75rem;
  }
  
  .hero-stats {
    gap: 16px;
  }
  
  .stat-value {
    font-size: 1.25rem;
  }
  
  .section-title {
    font-size: 1.25rem;
  }
}
</style>
