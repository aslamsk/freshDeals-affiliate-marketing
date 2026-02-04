<template>
  <v-card class="deal-card" :elevation="isMobile ? 1 : 2" hover :rounded="isMobile ? 'md' : 'lg'">
    <div class="image-wrapper position-relative">
      <v-img
        :src="deal.imageUrl || deal.image || '/placeholder.png'"
        :height="isMobile ? 100 : 200"
        cover
        class="deal-image"
      >
        <template v-slot:placeholder>
          <v-row class="fill-height ma-0" align="center" justify="center">
            <v-progress-circular indeterminate color="primary" :size="isMobile ? 20 : 40"></v-progress-circular>
          </v-row>
        </template>
      </v-img>
      
      <!-- Discount Badge -->
      <v-chip
        v-if="deal.discount"
        color="error"
        class="discount-badge"
        size="x-small"
        label
      >
        {{ deal.discount }}%
      </v-chip>
      
      <!-- Share Button -->
      <v-btn
        icon
        size="x-small"
        color="white"
        class="share-btn"
        variant="elevated"
        @click.stop="shareDeal"
      >
        <v-icon size="14">mdi-share-variant</v-icon>
      </v-btn>
    </div>

    <v-card-text :class="isMobile ? 'pa-2' : 'pa-4'">
      <!-- Title -->
      <h3 :class="['deal-title', 'font-weight-medium', isMobile ? 'text-caption mb-1' : 'text-body-2 mb-2']">
        {{ deal.title || deal.title_en || deal.title_te || 'Deal' }}
      </h3>

      <!-- Price Section -->
      <div class="price-section">
        <div class="d-flex align-center gap-1 flex-wrap">
          <span :class="['font-weight-bold', 'text-primary', isMobile ? 'text-body-2' : 'text-body-1']">
            ₹{{ formatPrice(deal.dealPrice || deal.price || 0) }}
          </span>
          <del v-if="deal.originalPrice && !isMobile" class="text-caption text-grey">
            ₹{{ formatPrice(deal.originalPrice) }}
          </del>
        </div>
      </div>
    </v-card-text>

    <v-card-actions :class="isMobile ? 'pa-2 pt-0' : 'pa-3 pt-0'">
      <v-btn
        color="primary"
        block
        :size="isMobile ? 'x-small' : 'small'"
        variant="elevated"
        rounded="lg"
        :href="deal.affiliateLink || deal.dealUrl || deal.productUrl || '#'"
        target="_blank"
        rel="noopener noreferrer"
        @click="trackClick"
      >
        <v-icon start :size="isMobile ? 12 : 16">mdi-cart</v-icon>
        {{ isMobile ? 'Get' : 'Get Deal' }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { defineProps, computed } from 'vue';
import { useDisplay } from 'vuetify';
import { useDealsStore } from '../stores/dealsStore';

const props = defineProps({
  deal: {
    type: Object,
    required: true,
  },
});

const { mobile } = useDisplay();
const isMobile = computed(() => mobile.value);

const dealsStore = useDealsStore();

// Computed properties
const dealTitle = computed(() => props.deal.title || props.deal.title_en || props.deal.title_te || 'Deal');
const dealPrice = computed(() => props.deal.dealPrice || props.deal.price || 0);
const dealLink = computed(() => props.deal.affiliateLink || props.deal.dealUrl || props.deal.productUrl || '#');

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN').format(price);
};

const trackClick = () => {
  dealsStore.trackDealClick(props.deal.id);
};

// Share deal with Web Share API (SSR safe)
const shareDeal = async () => {
  // SSR guard - check if window exists
  if (typeof window === 'undefined') return;
  
  const shareData = {
    title: dealTitle.value,
    text: `Check out this deal: ${dealTitle.value} at ₹${formatPrice(dealPrice.value)}${props.deal.discount ? ` (${props.deal.discount}% OFF)` : ''}`,
    url: dealLink.value !== '#' ? dealLink.value : window.location.href
  };
  
  try {
    // Check if Web Share API is available
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      await navigator.share(shareData);
    } else {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
      console.log('Link copied to clipboard!');
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error('Error sharing:', err);
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
.deal-card {
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.deal-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1) !important;
}

.image-wrapper {
  position: relative;
  overflow: hidden;
}

.deal-image {
  transition: transform 0.3s ease;
}

.deal-card:hover .deal-image {
  transform: scale(1.05);
}

.discount-badge {
  position: absolute;
  top: 6px;
  left: 6px;
  font-weight: 700;
  font-size: 10px !important;
  z-index: 2;
}

.share-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  opacity: 0.9;
  z-index: 2;
}

.share-btn:hover {
  opacity: 1;
}

.deal-title {
  line-height: 1.25 !important;
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

del {
  opacity: 0.6;
}

.position-relative {
  position: relative;
}

.v-card-text {
  flex-grow: 1;
  padding-bottom: 0 !important;
}

/* Mobile Responsive */
@media (max-width: 600px) {
  .deal-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08) !important;
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
  
  .deal-title {
    font-size: 0.75rem !important;
    min-height: 2em;
    line-height: 1.2 !important;
  }
}
</style>
