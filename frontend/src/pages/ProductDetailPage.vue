<template>
  <div>
    <v-container class="py-8">
      <!-- Loading -->
      <v-row v-if="loading">
        <v-col cols="12">
          <div class="text-center py-12">
            <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
            <p class="text-h6 mt-4 text-grey">Loading product details...</p>
          </div>
        </v-col>
      </v-row>

      <!-- Product Details -->
      <div v-else-if="comparison">
        <!-- Breadcrumbs -->
        <v-breadcrumbs :items="breadcrumbs" class="px-0">
          <template v-slot:divider>
            <v-icon>mdi-chevron-right</v-icon>
          </template>
        </v-breadcrumbs>

        <v-row class="mb-6">
          <v-col cols="12" md="6">
            <v-card elevation="3" class="product-image-card">
              <v-img
                :src="comparison.product.imageUrl || comparison.product.image || '/placeholder.png'"
                height="400"
                cover
                class="product-image"
              >
                <template v-slot:placeholder>
                  <v-row class="fill-height ma-0" align="center" justify="center">
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                  </v-row>
                </template>
              </v-img>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <div class="product-info">
              <h1 class="text-h3 font-weight-bold mb-3">
                {{ comparison.product.title_en || comparison.product.title_te || comparison.product.name || 'Product' }}
              </h1>
              <p class="text-h6 text-grey mb-4">{{ comparison.product.description || '' }}</p>
              
              <div class="d-flex flex-wrap gap-2 mb-4">
                <v-chip
                  v-for="tag in (comparison.product.platforms || [comparison.product.category]).filter(Boolean)"
                  :key="tag"
                  color="primary"
                  variant="outlined"
                  size="small"
                >
                  {{ tag }}
                </v-chip>
              </div>

              <v-divider class="my-4"></v-divider>

              <!-- Price Highlight -->
              <v-card color="success" dark elevation="0" class="pa-4 mb-4" v-if="comparison.lowestPrice">
                <div class="d-flex align-center justify-space-between">
                  <div>
                    <div class="text-overline">{{ $t('product.lowestPrice') }}</div>
                    <div class="text-h3 font-weight-bold">₹{{ formatPrice(comparison.lowestPrice) }}</div>
                  </div>
                  <v-icon size="64" style="opacity: 0.3">mdi-tag-heart</v-icon>
                </div>
              </v-card>

              <div class="d-flex gap-2">
                <v-btn color="primary" size="x-large" variant="elevated" prepend-icon="mdi-cart" 
                  :href="comparison.prices[0]?.affiliateUrl || '#'" target="_blank" @click="trackPlatformClick(comparison.prices[0]?.platform)">
                  Buy Now
                </v-btn>
                <v-btn size="x-large" variant="outlined" prepend-icon="mdi-share-variant">
                  Share
                </v-btn>
              </div>
            </div>
          </v-col>
        </v-row>

        <!-- Price Comparison Table -->
        <v-row class="mb-6">
          <v-col cols="12">
            <v-card elevation="3">
              <v-card-title class="d-flex align-center bg-primary text-white pa-4">
                <v-icon class="mr-2">mdi-compare</v-icon>
                <span class="text-h5">{{ $t('product.priceComparison') }}</span>
              </v-card-title>
              <v-card-text class="pa-0">
                <v-table hover>
                  <thead>
                    <tr>
                      <th class="text-left font-weight-bold">{{ $t('product.platform') }}</th>
                      <th class="text-left font-weight-bold">{{ $t('product.price') }}</th>
                      <th class="text-center font-weight-bold">{{ $t('product.inStock') }}</th>
                      <th class="text-center font-weight-bold">{{ $t('common.action') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="price in comparison.prices" :key="price.platform" class="price-row">
                      <td class="text-h6">
                        <v-chip color="primary" variant="flat" size="small">
                          {{ price.platform }}
                        </v-chip>
                      </td>
                      <td class="text-h5 font-weight-bold text-primary">₹{{ formatPrice(price.price) }}</td>
                      <td class="text-center">
                        <v-chip :color="price.inStock ? 'success' : 'error'" size="small" variant="flat">
                          <v-icon :icon="price.inStock ? 'mdi-check-circle' : 'mdi-close-circle'" start></v-icon>
                          {{ price.inStock ? 'In Stock' : 'Out of Stock' }}
                        </v-chip>
                      </td>
                      <td class="text-center">
                        <v-btn
                          color="primary"
                          size="large"
                          variant="elevated"
                          :href="price.affiliateUrl || price.productUrl || '#'"
                          target="_blank"
                          rel="noopener noreferrer"
                          @click="trackPlatformClick(price.platform)"
                          prepend-icon="mdi-cart"
                        >
                          {{ $t('common.buyNow') }}
                        </v-btn>
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Related Deals -->
        <v-row class="mt-8">
          <v-col cols="12">
            <div class="d-flex align-center mb-4">
              <v-icon color="primary" size="32" class="mr-3">mdi-fire</v-icon>
              <h3 class="text-h4 font-weight-bold">{{ $t('deal.relatedDeals') }}</h3>
            </div>
          </v-col>
          <v-col
            v-for="deal in comparison.deals"
            :key="deal.id"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <DealCard :deal="deal" />
          </v-col>
        </v-row>
      </div>

      <!-- Not Found -->
      <v-row v-else>
        <v-col cols="12">
          <v-card class="text-center py-12" elevation="0" color="grey-lighten-4">
            <v-icon size="80" color="error" class="mb-4">mdi-alert-circle</v-icon>
            <h3 class="text-h5 mb-2">Product Not Found</h3>
            <p class="text-body-1 text-grey mb-4">{{ $t('common.noResults') }}</p>
            <v-btn color="primary" variant="elevated" to="/" prepend-icon="mdi-home">
              Back to Home
            </v-btn>
          </v-card>
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
const comparison = ref(null);
const loading = ref(false);

const breadcrumbs = [
  { title: 'Home', to: '/', disabled: false },
  { title: 'Products', disabled: true },
  { title: 'Details', disabled: true },
];

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN').format(price);
};

const trackPlatformClick = (platform) => {
  // Track which platform button was clicked for analytics
  console.log(`User clicked Buy Now on ${platform}`);
  // You can add more tracking here if needed
};

onMounted(async () => {
  loading.value = true;
  comparison.value = await dealsStore.getProductComparison(route.params.productId);
  loading.value = false;
});
</script>

<style scoped>
.product-image-card {
  border-radius: 12px !important;
  overflow: hidden;
}

.product-image {
  border-radius: 12px;
}

.product-info {
  height: 100%;
}

.price-row:hover {
  background-color: rgba(0, 0, 0, 0.02);
}
</style>
