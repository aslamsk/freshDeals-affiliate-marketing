<template>
  <div class="deal-manager">
    <!-- Header Section -->
    <div class="manager-header mb-6">
      <div>
        <h3 class="text-h5 font-weight-bold">Deal Management</h3>
        <p class="text-grey-darken-1 text-body-2 mt-1">Create and manage deals from your products and affiliate platforms</p>
      </div>
      <div class="d-flex gap-3">
        <v-btn
          color="deep-purple"
          variant="outlined"
          prepend-icon="mdi-import"
          @click="showImportProductDialog = true"
        >
          Create from Product
        </v-btn>
        <v-btn
          color="success"
          prepend-icon="mdi-plus"
          @click="openCreateDialog"
        >
          Create Deal
        </v-btn>
      </div>
    </div>

    <!-- Stats Cards -->
    <v-row class="mb-6">
      <v-col cols="12" md="3">
        <v-card class="stat-card pa-4" rounded="lg">
          <div class="d-flex align-center">
            <v-avatar color="green-lighten-4" size="48" class="mr-3">
              <v-icon color="green-darken-2">mdi-tag-multiple</v-icon>
            </v-avatar>
            <div>
              <p class="text-h5 font-weight-bold mb-0">{{ totalDeals }}</p>
              <p class="text-caption text-grey">Total Deals</p>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="stat-card pa-4" rounded="lg">
          <div class="d-flex align-center">
            <v-avatar color="blue-lighten-4" size="48" class="mr-3">
              <v-icon color="blue-darken-2">mdi-check-circle</v-icon>
            </v-avatar>
            <div>
              <p class="text-h5 font-weight-bold mb-0">{{ activeDeals }}</p>
              <p class="text-caption text-grey">Active</p>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="stat-card pa-4" rounded="lg">
          <div class="d-flex align-center">
            <v-avatar color="orange-lighten-4" size="48" class="mr-3">
              <v-icon color="orange-darken-2">mdi-percent</v-icon>
            </v-avatar>
            <div>
              <p class="text-h5 font-weight-bold mb-0">{{ avgDiscount }}%</p>
              <p class="text-caption text-grey">Avg Discount</p>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="stat-card pa-4" rounded="lg">
          <div class="d-flex align-center">
            <v-avatar color="purple-lighten-4" size="48" class="mr-3">
              <v-icon color="purple-darken-2">mdi-link-variant</v-icon>
            </v-avatar>
            <div>
              <p class="text-h5 font-weight-bold mb-0">{{ affiliateDeals }}</p>
              <p class="text-caption text-grey">Affiliate Deals</p>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filter Tabs -->
    <v-tabs v-model="activeTab" color="deep-purple" class="mb-4">
      <v-tab value="all">All Deals</v-tab>
      <v-tab value="active">Active</v-tab>
      <v-tab value="expired">Expired</v-tab>
      <v-tab value="paused">Paused</v-tab>
    </v-tabs>

    <!-- Deals Table -->
    <v-card rounded="lg" elevation="2">
      <v-data-table
        :headers="headers"
        :items="filteredDeals"
        :loading="loading"
        :search="searchQuery"
        class="deal-table"
      >
        <template v-slot:top>
          <v-toolbar flat color="white" class="px-4">
            <v-text-field
              v-model="searchQuery"
              prepend-inner-icon="mdi-magnify"
              label="Search deals..."
              single-line
              hide-details
              variant="outlined"
              density="compact"
              style="max-width: 300px;"
            />
            <v-spacer />
            <v-select
              v-model="filterPlatform"
              :items="platformOptions"
              label="Platform"
              variant="outlined"
              density="compact"
              hide-details
              style="max-width: 150px;"
            />
          </v-toolbar>
        </template>

        <template v-slot:item.title_en="{ item }">
          <div class="d-flex align-center">
            <v-avatar 
              size="40" 
              rounded="lg" 
              class="mr-3"
              :color="item.imageUrl ? 'transparent' : 'grey-lighten-3'"
            >
              <v-img v-if="item.imageUrl" :src="item.imageUrl" cover />
              <v-icon v-else color="grey">mdi-image</v-icon>
            </v-avatar>
            <div>
              <p class="font-weight-medium mb-0">{{ item.title_en }}</p>
              <p class="text-caption text-grey" v-if="item.source">
                <v-icon size="12" class="mr-1">mdi-link</v-icon>
                {{ item.source }}
              </p>
            </div>
          </div>
        </template>

        <template v-slot:item.discount="{ item }">
          <v-chip 
            :color="getDiscountColor(item.discount)" 
            size="small" 
            variant="flat"
            class="font-weight-bold"
          >
            {{ item.discount }}% OFF
          </v-chip>
        </template>

        <template v-slot:item.prices="{ item }">
          <div>
            <span class="text-success font-weight-bold">₹{{ item.dealPrice }}</span>
            <span class="text-grey text-decoration-line-through ml-2">₹{{ item.originalPrice }}</span>
          </div>
        </template>

        <template v-slot:item.platform="{ item }">
          <v-chip 
            :color="getPlatformColor(item.platform)" 
            size="small" 
            variant="flat"
          >
            <v-icon start size="14">{{ getPlatformIcon(item.platform) }}</v-icon>
            {{ item.platform }}
          </v-chip>
        </template>

        <template v-slot:item.status="{ item }">
          <v-chip 
            :color="getStatusColor(item.status)" 
            size="small"
            variant="flat"
          >
            {{ item.status }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn size="small" icon variant="text" color="primary" @click="editDeal(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn 
            size="small" 
            icon 
            variant="text" 
            color="info" 
            @click="copyAffiliateLink(item.affiliateLink)"
            :disabled="!item.affiliateLink"
          >
            <v-icon>mdi-link</v-icon>
          </v-btn>
          <v-btn size="small" icon variant="text" color="error" @click="deleteDeal(item.id)">
            <v-icon>mdi-trash-can</v-icon>
          </v-btn>
        </template>

        <template v-slot:no-data>
          <div class="py-8 text-center">
            <v-icon size="64" color="grey-lighten-2">mdi-tag-off-outline</v-icon>
            <p class="mt-4 text-grey">No deals found</p>
            <v-btn color="deep-purple" variant="text" @click="openCreateDialog">
              Create your first deal
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Create/Edit Deal Dialog -->
    <v-dialog v-model="showDialog" max-width="700px">
      <v-card rounded="lg">
        <v-card-title class="bg-deep-purple text-white pa-4">
          <v-icon class="mr-2">{{ editingDeal ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
          {{ editingDeal ? 'Edit Deal' : 'Create Deal' }}
        </v-card-title>
        <v-card-text class="pt-6">
          <v-row>
            <v-col cols="12">
              <v-autocomplete
                v-model="form.productId"
                :items="products"
                item-title="title_en"
                item-value="id"
                label="Select Product (Optional)"
                variant="outlined"
                prepend-inner-icon="mdi-package-variant"
                clearable
                @update:model-value="onProductSelect"
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template v-slot:prepend>
                      <v-avatar size="40" rounded="lg">
                        <v-img v-if="item.raw.imageUrl" :src="item.raw.imageUrl" />
                        <v-icon v-else>mdi-package</v-icon>
                      </v-avatar>
                    </template>
                    <v-list-item-subtitle>
                      {{ item.raw.platform }} | ₹{{ item.raw.price }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </template>
              </v-autocomplete>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field 
                v-model="form.title_en" 
                label="Title (English)" 
                variant="outlined"
                prepend-inner-icon="mdi-format-title"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field 
                v-model="form.title_te" 
                label="Title (Telugu)" 
                variant="outlined"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="form.description"
                label="Description"
                variant="outlined"
                rows="2"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field 
                v-model.number="form.originalPrice" 
                label="Original Price ₹" 
                type="number" 
                variant="outlined"
                @update:model-value="calculateDiscount"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field 
                v-model.number="form.dealPrice" 
                label="Deal Price ₹" 
                type="number" 
                variant="outlined"
                @update:model-value="calculateDiscount"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field 
                v-model.number="form.discount" 
                label="Discount %" 
                type="number" 
                variant="outlined"
                readonly
                bg-color="grey-lighten-4"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select 
                v-model="form.platform" 
                :items="['amazon', 'flipkart', 'myntra', 'meesho', 'ajio', 'nykaa']" 
                label="Platform" 
                variant="outlined"
                prepend-inner-icon="mdi-store"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select 
                v-model="form.status" 
                :items="['ACTIVE', 'EXPIRED', 'PAUSED']" 
                label="Status"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field 
                v-model="form.affiliateLink" 
                label="Affiliate Link" 
                variant="outlined"
                prepend-inner-icon="mdi-link"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field 
                v-model="form.imageUrl" 
                label="Image URL" 
                variant="outlined"
                prepend-inner-icon="mdi-image"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field 
                v-model="form.startDate" 
                label="Start Date" 
                type="date"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field 
                v-model="form.endDate" 
                label="End Date" 
                type="date"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12">
              <v-checkbox 
                v-model="form.isVisible" 
                label="Visible on App" 
                color="success"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="showDialog = false">Cancel</v-btn>
          <v-btn color="success" variant="flat" @click="saveDeal" :loading="saving">
            <v-icon start>mdi-check</v-icon>
            Save Deal
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Import Product Dialog -->
    <v-dialog v-model="showImportProductDialog" max-width="800px">
      <v-card rounded="lg">
        <v-card-title class="bg-deep-purple text-white pa-4">
          <v-icon class="mr-2">mdi-import</v-icon>
          Create Deal from Product
        </v-card-title>
        <v-card-text class="pt-6">
          <!-- Search Products -->
          <v-row class="mb-4">
            <v-col cols="12" md="8">
              <v-text-field
                v-model="productSearch"
                label="Search products..."
                variant="outlined"
                prepend-inner-icon="mdi-magnify"
                @keyup.enter="searchProducts"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-btn 
                color="deep-purple" 
                block 
                height="56"
                @click="searchProducts"
              >
                Search
              </v-btn>
            </v-col>
          </v-row>

          <!-- Products List -->
          <div v-if="products.length === 0" class="text-center py-8">
            <v-icon size="64" color="grey-lighten-2">mdi-package-variant</v-icon>
            <p class="mt-4 text-grey">No products found. Import products from affiliate platforms first.</p>
          </div>

          <v-list v-else class="product-list" max-height="400" style="overflow-y: auto;">
            <v-list-item
              v-for="product in filteredProducts"
              :key="product.id"
              class="product-item mb-2"
              rounded="lg"
            >
              <template v-slot:prepend>
                <v-avatar size="60" rounded="lg">
                  <v-img v-if="product.imageUrl" :src="product.imageUrl" />
                  <v-icon v-else>mdi-package</v-icon>
                </v-avatar>
              </template>
              <v-list-item-title class="font-weight-medium">
                {{ product.title_en || product.title }}
              </v-list-item-title>
              <v-list-item-subtitle>
                <v-chip size="x-small" :color="getPlatformColor(product.platform)" class="mr-2">
                  {{ product.platform }}
                </v-chip>
                <span class="font-weight-bold text-success">₹{{ product.price }}</span>
                <span v-if="product.source" class="text-caption ml-2">
                  ({{ product.source }})
                </span>
              </v-list-item-subtitle>
              <template v-slot:append>
                <v-btn 
                  color="success" 
                  variant="flat"
                  size="small"
                  @click="createDealFromProduct(product)"
                >
                  <v-icon start>mdi-tag-plus</v-icon>
                  Create Deal
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="showImportProductDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">Close</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import firebaseAdminService from '../../services/firebaseAdminService.js';

const deals = ref([]);
const products = ref([]);
const loading = ref(false);
const saving = ref(false);
const showDialog = ref(false);
const showImportProductDialog = ref(false);
const editingDeal = ref(null);
const searchQuery = ref('');
const productSearch = ref('');
const filterPlatform = ref('all');
const activeTab = ref('all');

const platformOptions = ['all', 'amazon', 'flipkart', 'myntra', 'meesho', 'ajio', 'nykaa'];

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
});

const headers = [
  { title: 'Deal', value: 'title_en', width: '250px' },
  { title: 'Discount', value: 'discount', width: '100px' },
  { title: 'Price', value: 'prices', width: '150px' },
  { title: 'Platform', value: 'platform', width: '120px' },
  { title: 'Status', value: 'status', width: '100px' },
  { title: 'Actions', value: 'actions', sortable: false, width: '140px' },
];

const form = ref({
  title_en: '',
  title_te: '',
  description: '',
  productId: '',
  dealPrice: 0,
  originalPrice: 0,
  discount: 0,
  platform: 'amazon',
  status: 'ACTIVE',
  affiliateLink: '',
  imageUrl: '',
  isVisible: true,
  startDate: '',
  endDate: '',
  source: ''
});

// Computed
const totalDeals = computed(() => deals.value.length);
const activeDeals = computed(() => deals.value.filter(d => d.status === 'ACTIVE').length);
const avgDiscount = computed(() => {
  if (deals.value.length === 0) return 0;
  const sum = deals.value.reduce((acc, d) => acc + (d.discount || 0), 0);
  return Math.round(sum / deals.value.length);
});
const affiliateDeals = computed(() => deals.value.filter(d => d.affiliateLink).length);

const filteredDeals = computed(() => {
  let result = deals.value;
  
  // Filter by tab
  if (activeTab.value === 'active') {
    result = result.filter(d => d.status === 'ACTIVE');
  } else if (activeTab.value === 'expired') {
    result = result.filter(d => d.status === 'EXPIRED');
  } else if (activeTab.value === 'paused') {
    result = result.filter(d => d.status === 'PAUSED');
  }
  
  // Filter by platform
  if (filterPlatform.value && filterPlatform.value !== 'all') {
    result = result.filter(d => d.platform === filterPlatform.value);
  }
  
  return result;
});

const filteredProducts = computed(() => {
  if (!productSearch.value) return products.value;
  const search = productSearch.value.toLowerCase();
  return products.value.filter(p => 
    (p.title_en?.toLowerCase() || '').includes(search) ||
    (p.title?.toLowerCase() || '').includes(search) ||
    (p.platform?.toLowerCase() || '').includes(search)
  );
});

// Methods
const showNotification = (message, color = 'success') => {
  snackbar.value = { show: true, message, color };
};

const getPlatformColor = (platform) => {
  const colors = {
    amazon: 'orange',
    flipkart: 'blue',
    myntra: 'pink',
    meesho: 'purple',
    ajio: 'indigo',
    nykaa: 'pink-darken-2'
  };
  return colors[platform?.toLowerCase()] || 'grey';
};

const getPlatformIcon = (platform) => {
  const icons = {
    amazon: 'mdi-amazon',
    flipkart: 'mdi-shopping',
    myntra: 'mdi-hanger',
    meesho: 'mdi-store',
    ajio: 'mdi-tshirt-crew',
    nykaa: 'mdi-lipstick'
  };
  return icons[platform?.toLowerCase()] || 'mdi-store';
};

const getStatusColor = (status) => {
  const colors = {
    ACTIVE: 'success',
    EXPIRED: 'error',
    PAUSED: 'warning'
  };
  return colors[status] || 'grey';
};

const getDiscountColor = (discount) => {
  if (discount >= 50) return 'success';
  if (discount >= 30) return 'orange';
  return 'grey';
};

const calculateDiscount = () => {
  if (form.value.originalPrice > 0 && form.value.dealPrice > 0) {
    form.value.discount = Math.round(
      ((form.value.originalPrice - form.value.dealPrice) / form.value.originalPrice) * 100
    );
  }
};

const copyAffiliateLink = (link) => {
  if (link) {
    navigator.clipboard.writeText(link);
    showNotification('Affiliate link copied!');
  }
};

const openCreateDialog = () => {
  resetForm();
  showDialog.value = true;
};

const resetForm = () => {
  editingDeal.value = null;
  form.value = {
    title_en: '',
    title_te: '',
    description: '',
    productId: '',
    dealPrice: 0,
    originalPrice: 0,
    discount: 0,
    platform: 'amazon',
    status: 'ACTIVE',
    affiliateLink: '',
    imageUrl: '',
    isVisible: true,
    startDate: '',
    endDate: '',
    source: ''
  };
};

const onProductSelect = (productId) => {
  if (productId) {
    const product = products.value.find(p => p.id === productId);
    if (product) {
      form.value.title_en = product.title_en || product.title || '';
      form.value.title_te = product.title_te || '';
      form.value.description = product.description || '';
      form.value.originalPrice = product.price || 0;
      form.value.platform = product.platform || 'amazon';
      form.value.affiliateLink = product.affiliateLink || '';
      form.value.imageUrl = product.imageUrl || '';
      form.value.source = product.source || '';
    }
  }
};

const createDealFromProduct = (product) => {
  form.value = {
    title_en: product.title_en || product.title || '',
    title_te: product.title_te || '',
    description: product.description || '',
    productId: product.id,
    originalPrice: product.price || 0,
    dealPrice: Math.round((product.price || 0) * 0.8), // Default 20% off
    discount: 20,
    platform: product.platform || 'amazon',
    status: 'ACTIVE',
    affiliateLink: product.affiliateLink || '',
    imageUrl: product.imageUrl || '',
    isVisible: true,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    source: product.source || 'imported'
  };
  calculateDiscount();
  showImportProductDialog.value = false;
  showDialog.value = true;
};

const searchProducts = () => {
  // Product search is handled by computed property
};

const loadDeals = async () => {
  loading.value = true;
  try {
    deals.value = await firebaseAdminService.getAllDeals();
    products.value = await firebaseAdminService.getAllProducts();
  } catch (error) {
    console.error('Error loading deals:', error);
    showNotification('Error loading deals', 'error');
  } finally {
    loading.value = false;
  }
};

const saveDeal = async () => {
  saving.value = true;
  try {
    const dealData = {
      ...form.value,
      title: form.value.title_en,
      createdAt: editingDeal.value ? form.value.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (editingDeal.value) {
      await firebaseAdminService.updateDeal(editingDeal.value, dealData);
      showNotification('Deal updated successfully!');
    } else {
      await firebaseAdminService.createDeal(dealData);
      showNotification('Deal created successfully!');
    }
    showDialog.value = false;
    resetForm();
    await loadDeals();
  } catch (error) {
    showNotification('Error saving deal: ' + error.message, 'error');
  } finally {
    saving.value = false;
  }
};

const editDeal = (deal) => {
  editingDeal.value = deal.id;
  form.value = { ...deal };
  showDialog.value = true;
};

const deleteDeal = async (dealId) => {
  if (confirm('Delete this deal?')) {
    try {
      await firebaseAdminService.deleteDeal(dealId);
      showNotification('Deal deleted');
      await loadDeals();
    } catch (error) {
      showNotification('Error deleting deal', 'error');
    }
  }
};

onMounted(() => {
  loadDeals();
});
</script>

<style scoped>
.deal-manager {
  width: 100%;
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.stat-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important;
}

.deal-table {
  border-radius: 12px;
}

.product-item {
  border: 1px solid #e0e0e0;
  background: #fafafa;
}

.product-item:hover {
  background: #f0f0f0;
}

.product-list {
  background: transparent !important;
}

.gap-3 {
  gap: 12px;
}
</style>
