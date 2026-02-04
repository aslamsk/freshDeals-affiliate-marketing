<template>
  <v-card class="product-card" hover :rounded="isMobile ? 'md' : 'lg'" :elevation="isMobile ? 1 : 2">
    <!-- Image Section -->
    <div class="image-container">
      <v-img
        :src="product.image || '/placeholder.png'"
        :height="imageHeight"
        cover
        class="product-image"
      >
        <template v-slot:placeholder>
          <div class="d-flex align-center justify-center fill-height">
            <v-progress-circular indeterminate color="primary" :size="isMobile ? 20 : 40" />
          </div>
        </template>
      </v-img>
      
      <!-- Discount Badge -->
      <v-chip
        v-if="discountPercent > 0"
        color="error"
        class="discount-badge"
        size="x-small"
        label
      >
        {{ discountPercent }}%
      </v-chip>
      
      <!-- Share Button -->
      <v-btn
        icon
        size="x-small"
        color="white"
        class="share-btn"
        variant="elevated"
        @click.stop="shareProduct"
      >
        <v-icon size="14">mdi-share-variant</v-icon>
      </v-btn>
    </div>

    <!-- Content Section -->
    <v-card-text :class="isMobile ? 'pa-2' : 'pa-4'">
      <!-- Title -->
      <h3 :class="['product-title', 'font-weight-medium', isMobile ? 'text-caption mb-1' : 'text-body-2 mb-2']">
        {{ displayTitle }}
      </h3>
      
      <!-- Price Section -->
      <div class="price-section">
        <div class="d-flex align-center gap-1 flex-wrap">
          <span :class="['current-price', 'font-weight-bold', 'text-primary', isMobile ? 'text-body-2' : 'text-body-1']">
            ₹{{ formatPrice(currentPrice) }}
          </span>
          <span v-if="originalPrice > currentPrice && !isMobile" class="original-price text-caption text-grey text-decoration-line-through">
            ₹{{ formatPrice(originalPrice) }}
          </span>
        </div>
      </div>
    </v-card-text>

    <!-- Actions -->
    <v-card-actions :class="isMobile ? 'pa-2 pt-0' : 'pa-3 pt-0'">
      <v-btn
        color="primary"
        variant="elevated"
        block
        :size="isMobile ? 'x-small' : 'small'"
        rounded="lg"
        :href="productLink"
        target="_blank"
        rel="noopener noreferrer"
        @click="trackClick"
      >
        <v-icon start :size="isMobile ? 12 : 16">mdi-cart</v-icon>
        {{ isMobile ? 'Buy' : 'Buy Now' }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';
import { useDisplay } from 'vuetify';

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

// Responsive display
const { mobile } = useDisplay();
const isMobile = computed(() => mobile.value);

// Dynamic image height based on screen size
const imageHeight = computed(() => isMobile.value ? 120 : 200);

// Computed properties
const displayTitle = computed(() => {
  return props.product.title_en || props.product.title_te || props.product.title || 'Product';
});

const truncatedDescription = computed(() => {
  const desc = props.product.description || props.product.title_en || '';
  return desc.length > 80 ? desc.substring(0, 80) + '...' : desc;
});

const platformName = computed(() => {
  const platform = props.product.dealPlatform || props.product.platform || '';
  return platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : '';
});

const currentPrice = computed(() => {
  return props.product.dealPrice || props.product.price || props.product.originalPrice || 0;
});

const originalPrice = computed(() => {
  return props.product.originalPrice || props.product.price || 0;
});

const savings = computed(() => {
  if (originalPrice.value > currentPrice.value) {
    return originalPrice.value - currentPrice.value;
  }
  return 0;
});

const discountPercent = computed(() => {
  if (props.product.discount) {
    return props.product.discount;
  }
  if (originalPrice.value > 0 && currentPrice.value < originalPrice.value) {
    return Math.round(((originalPrice.value - currentPrice.value) / originalPrice.value) * 100);
  }
  return 0;
});

const productLink = computed(() => {
  return props.product.affiliateLink || props.product.productUrl || props.product.dealUrl || '#';
});

// Methods
const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN').format(price);
};

const trackClick = () => {
  // Track product click analytics
  console.log('Product clicked:', props.product.id);
};

// Share product with Web Share API (SSR safe)
const shareProduct = async () => {
  // SSR guard - check if window exists
  if (typeof window === 'undefined') return;
  
  const shareData = {
    title: displayTitle.value,
    text: `Check out this deal: ${displayTitle.value} at ₹${formatPrice(currentPrice.value)}${discountPercent.value > 0 ? ` (${discountPercent.value}% OFF)` : ''}`,
    url: productLink.value !== '#' ? productLink.value : window.location.href
  };
  
  try {
    // Check if Web Share API is available
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      await navigator.share(shareData);
    } else {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
      // You could emit an event here to show a snackbar
      console.log('Link copied to clipboard!');
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error('Error sharing:', err);
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
      } catch (clipErr) {
        console.error('Failed to copy:', clipErr);
      }
    }
  }
};
</script>

<style scoped>
.product-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1) !important;
}

.image-container {
  position: relative;
  overflow: hidden;
}

.product-image {
  transition: transform 0.4s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.discount-badge {
  position: absolute;
  top: 6px;
  left: 6px;
  font-weight: 700;
  font-size: 10px !important;
}

.share-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  opacity: 0.9;
}

.share-btn:hover {
  opacity: 1;
}

.product-title {
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.2em;
}

.price-section {
  min-height: auto;
}

.current-price {
  color: #1976d2;
}

.v-card-text {
  flex-grow: 1;
  padding-bottom: 0 !important;
}

/* Mobile Responsive Adjustments */
@media (max-width: 600px) {
  .product-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08) !important;
  }
  
  .product-title {
    font-size: 0.75rem !important;
    min-height: 2em;
    line-height: 1.2;
  }
  
  .discount-badge {
    top: 4px;
    left: 4px;
    font-size: 9px !important;
  }
  
  .share-btn {
    top: 4px;
    right: 4px;
  }
}
</style>
