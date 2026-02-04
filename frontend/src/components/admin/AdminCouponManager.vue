<template>
  <div class="coupon-manager">
    <!-- Header Section -->
    <div class="manager-header mb-6">
      <div>
        <h3 class="text-h5 font-weight-bold">Coupon Management</h3>
        <p class="text-grey-darken-1 text-body-2 mt-1">Manage coupons and import from CouponAPI</p>
      </div>
      <div class="d-flex gap-3">
        <v-btn 
          color="deep-purple" 
          variant="outlined"
          prepend-icon="mdi-cloud-download" 
          @click="showImportDialog = true"
        >
          Import from CouponAPI
        </v-btn>
        <v-btn 
          color="success" 
          prepend-icon="mdi-plus" 
          @click="showDialog = true"
        >
          Create Coupon
        </v-btn>
      </div>
    </div>

    <!-- Stats Cards -->
    <v-row class="mb-6">
      <v-col cols="12" md="3">
        <v-card class="stat-card pa-4" rounded="lg">
          <div class="d-flex align-center">
            <v-avatar color="green-lighten-4" size="48" class="mr-3">
              <v-icon color="green-darken-2">mdi-ticket-percent</v-icon>
            </v-avatar>
            <div>
              <p class="text-h5 font-weight-bold mb-0">{{ totalCoupons }}</p>
              <p class="text-caption text-grey">Total Coupons</p>
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
              <p class="text-h5 font-weight-bold mb-0">{{ activeCoupons }}</p>
              <p class="text-caption text-grey">Active</p>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="stat-card pa-4" rounded="lg">
          <div class="d-flex align-center">
            <v-avatar color="purple-lighten-4" size="48" class="mr-3">
              <v-icon color="purple-darken-2">mdi-cloud-sync</v-icon>
            </v-avatar>
            <div>
              <p class="text-h5 font-weight-bold mb-0">{{ importedCoupons }}</p>
              <p class="text-caption text-grey">Imported</p>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="stat-card pa-4" rounded="lg">
          <div class="d-flex align-center">
            <v-avatar color="orange-lighten-4" size="48" class="mr-3">
              <v-icon color="orange-darken-2">mdi-store</v-icon>
            </v-avatar>
            <div>
              <p class="text-h5 font-weight-bold mb-0">{{ uniqueStores }}</p>
              <p class="text-caption text-grey">Stores</p>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tabs for different coupon sources -->
    <v-tabs v-model="activeTab" color="deep-purple" class="mb-4">
      <v-tab value="all">All Coupons</v-tab>
      <v-tab value="manual">Manual</v-tab>
      <v-tab value="imported">Imported (CouponAPI)</v-tab>
    </v-tabs>

    <!-- Coupon Table -->
    <v-card rounded="lg" elevation="2">
      <v-data-table
        :headers="headers"
        :items="filteredCoupons"
        :loading="loading"
        :search="searchQuery"
        class="coupon-table"
      >
        <template v-slot:top>
          <v-toolbar flat color="white" class="px-4">
            <v-text-field
              v-model="searchQuery"
              prepend-inner-icon="mdi-magnify"
              label="Search coupons..."
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
              class="mr-3"
            />
          </v-toolbar>
        </template>

        <template v-slot:item.code="{ item }">
          <v-chip color="grey-lighten-3" variant="flat" class="font-weight-bold">
            {{ item.code }}
          </v-chip>
        </template>

        <template v-slot:item.discount="{ item }">
          <span class="text-success font-weight-bold">
            <span v-if="item.discountType === 'flat'">₹{{ item.discount }}</span>
            <span v-else>{{ item.discount }}%</span>
          </span>
        </template>

        <template v-slot:item.platform="{ item }">
          <v-chip 
            :color="getPlatformColor(item.platform)" 
            size="small" 
            variant="flat"
          >
            {{ item.platform || 'All' }}
          </v-chip>
        </template>

        <template v-slot:item.source="{ item }">
          <v-chip 
            :color="item.source === 'couponapi' ? 'deep-purple' : 'grey'" 
            size="small"
            variant="outlined"
          >
            <v-icon start size="14">
              {{ item.source === 'couponapi' ? 'mdi-cloud' : 'mdi-pencil' }}
            </v-icon>
            {{ item.source === 'couponapi' ? 'API' : 'Manual' }}
          </v-chip>
        </template>

        <template v-slot:item.expiryDate="{ item }">
          <span v-if="item.expiryDate" :class="isExpired(item.expiryDate) ? 'text-red' : ''">
            {{ formatDate(item.expiryDate) }}
          </span>
          <span v-else class="text-grey">No expiry</span>
        </template>

        <template v-slot:item.isActive="{ item }">
          <v-switch
            v-model="item.isActive"
            color="success"
            hide-details
            density="compact"
            @change="toggleCouponStatus(item)"
          />
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn size="small" icon variant="text" color="primary" @click="editCoupon(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn size="small" icon variant="text" color="info" @click="copyCouponCode(item.code)">
            <v-icon>mdi-content-copy</v-icon>
          </v-btn>
          <v-btn size="small" icon variant="text" color="error" @click="deleteCoupon(item.id)">
            <v-icon>mdi-trash-can</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Create/Edit Coupon Dialog -->
    <v-dialog v-model="showDialog" max-width="600px">
      <v-card rounded="lg">
        <v-card-title class="bg-deep-purple text-white pa-4">
          <v-icon class="mr-2">{{ editingCoupon ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
          {{ editingCoupon ? 'Edit Coupon' : 'Create Coupon' }}
        </v-card-title>
        <v-card-text class="pt-6">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field 
                v-model="form.code" 
                label="Coupon Code" 
                variant="outlined"
                prepend-inner-icon="mdi-ticket"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select 
                v-model="form.platform" 
                :items="['amazon', 'flipkart', 'myntra', 'swiggy', 'zomato', 'all']" 
                label="Platform" 
                variant="outlined"
                prepend-inner-icon="mdi-store"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field 
                v-model="form.title_en" 
                label="Title (English)" 
                variant="outlined"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field 
                v-model="form.title_te" 
                label="Title (Telugu)" 
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="form.discountType"
                :items="[{title: 'Percentage', value: 'percent'}, {title: 'Flat ₹', value: 'flat'}]"
                label="Discount Type"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field 
                v-model.number="form.discount" 
                :label="form.discountType === 'flat' ? 'Discount (₹)' : 'Discount (%)'" 
                type="number" 
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field 
                v-model.number="form.minOrderValue" 
                label="Min Order ₹" 
                type="number" 
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field 
                v-model="form.expiryDate" 
                label="Expiry Date" 
                type="date"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field 
                v-model="form.affiliateLink" 
                label="Affiliate Link (optional)" 
                variant="outlined"
                prepend-inner-icon="mdi-link"
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
            <v-col cols="12">
              <v-checkbox v-model="form.isActive" label="Active" color="success" />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="showDialog = false">Cancel</v-btn>
          <v-btn color="success" variant="flat" @click="saveCoupon" :loading="saving">
            <v-icon start>mdi-check</v-icon>
            Save Coupon
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Import from CouponAPI Dialog -->
    <v-dialog v-model="showImportDialog" max-width="900px">
      <v-card rounded="lg">
        <v-card-title class="bg-deep-purple text-white pa-4">
          <v-icon class="mr-2">mdi-cloud-download</v-icon>
          Import Coupons from CouponAPI
        </v-card-title>
        <v-card-text class="pt-6">
          <!-- Search/Filter Section -->
          <v-row class="mb-4">
            <v-col cols="12" md="4">
              <v-select
                v-model="importFilter.store"
                :items="availableStores"
                label="Select Store"
                variant="outlined"
                prepend-inner-icon="mdi-store"
                clearable
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="importFilter.category"
                :items="['Electronics', 'Fashion', 'Food', 'Travel', 'Groceries', 'All']"
                label="Category"
                variant="outlined"
                clearable
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-btn 
                color="deep-purple" 
                block 
                height="56"
                @click="fetchCouponsFromAPI"
                :loading="fetchingCoupons"
              >
                <v-icon start>mdi-magnify</v-icon>
                Fetch Coupons
              </v-btn>
            </v-col>
          </v-row>

          <!-- Quick Fetch Buttons -->
          <div class="mb-4">
            <span class="text-caption text-grey mr-2">Quick Fetch:</span>
            <v-btn 
              v-for="store in quickStores" 
              :key="store"
              size="small" 
              variant="outlined" 
              class="mr-2 mb-2"
              @click="quickFetchStore(store)"
            >
              {{ store }}
            </v-btn>
          </div>

          <!-- API Coupons List -->
          <v-divider class="mb-4" />
          
          <div v-if="fetchingCoupons" class="text-center py-8">
            <v-progress-circular indeterminate color="deep-purple" size="48" />
            <p class="mt-4 text-grey">Fetching coupons from API...</p>
          </div>

          <div v-else-if="apiCoupons.length === 0" class="text-center py-8">
            <v-icon size="64" color="grey-lighten-2">mdi-ticket-outline</v-icon>
            <p class="mt-4 text-grey">Select a store and click "Fetch Coupons" to load available coupons</p>
          </div>

          <div v-else>
            <div class="d-flex justify-space-between align-center mb-4">
              <span class="text-body-2">Found {{ apiCoupons.length }} coupons</span>
              <v-btn 
                color="success" 
                size="small"
                @click="importSelectedCoupons"
                :disabled="selectedApiCoupons.length === 0"
              >
                Import Selected ({{ selectedApiCoupons.length }})
              </v-btn>
            </div>

            <v-list class="api-coupon-list" max-height="400" style="overflow-y: auto;">
              <v-list-item
                v-for="coupon in apiCoupons"
                :key="coupon.id"
                class="coupon-item mb-2"
                rounded="lg"
              >
                <template v-slot:prepend>
                  <v-checkbox
                    v-model="selectedApiCoupons"
                    :value="coupon"
                    color="deep-purple"
                    hide-details
                  />
                </template>
                <v-list-item-title class="font-weight-medium">
                  {{ coupon.title }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  <v-chip size="x-small" color="success" class="mr-2">
                    {{ coupon.discount }}
                  </v-chip>
                  <span class="text-caption">{{ coupon.store }}</span>
                  <span v-if="coupon.code" class="ml-2">
                    Code: <strong>{{ coupon.code }}</strong>
                  </span>
                </v-list-item-subtitle>
                <template v-slot:append>
                  <v-btn 
                    size="small" 
                    color="deep-purple" 
                    variant="text"
                    @click="importSingleCoupon(coupon)"
                  >
                    Import
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
          </div>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="showImportDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar for notifications -->
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
import { couponApiService } from '../../services/affiliatePlatformsService.js';

const coupons = ref([]);
const loading = ref(false);
const saving = ref(false);
const showDialog = ref(false);
const showImportDialog = ref(false);
const editingCoupon = ref(null);
const searchQuery = ref('');
const filterPlatform = ref('all');
const activeTab = ref('all');

// Import related
const fetchingCoupons = ref(false);
const apiCoupons = ref([]);
const selectedApiCoupons = ref([]);
const importFilter = ref({
  store: null,
  category: null
});

// Snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
});

// Quick stores for one-click fetch
const quickStores = ['Amazon', 'Flipkart', 'Myntra', 'Swiggy', 'Zomato', 'Ajio'];

// Available stores from API
const availableStores = ref([
  'Amazon', 'Flipkart', 'Myntra', 'Ajio', 'Nykaa', 'Swiggy', 'Zomato',
  'MakeMyTrip', 'Uber', 'BigBasket', 'Dominos', 'McDonalds', 'Paytm'
]);

const platformOptions = ['all', 'amazon', 'flipkart', 'myntra', 'swiggy', 'zomato'];

const headers = [
  { title: 'Code', value: 'code', width: '120px' },
  { title: 'Title', value: 'title_en' },
  { title: 'Discount', value: 'discount', width: '100px' },
  { title: 'Platform', value: 'platform', width: '120px' },
  { title: 'Source', value: 'source', width: '100px' },
  { title: 'Expiry', value: 'expiryDate', width: '120px' },
  { title: 'Active', value: 'isActive', width: '80px' },
  { title: 'Actions', value: 'actions', sortable: false, width: '140px' },
];

const form = ref({
  code: '',
  title_en: '',
  title_te: '',
  discount: 0,
  discountType: 'percent',
  minOrderValue: 0,
  platform: 'all',
  isActive: true,
  expiryDate: '',
  affiliateLink: '',
  description: '',
  source: 'manual'
});

// Computed properties
const totalCoupons = computed(() => coupons.value.length);
const activeCoupons = computed(() => coupons.value.filter(c => c.isActive).length);
const importedCoupons = computed(() => coupons.value.filter(c => c.source === 'couponapi').length);
const uniqueStores = computed(() => {
  const platforms = coupons.value.map(c => c.platform).filter(p => p && p !== 'all');
  return new Set(platforms).size;
});

const filteredCoupons = computed(() => {
  let result = coupons.value;
  
  // Filter by tab
  if (activeTab.value === 'manual') {
    result = result.filter(c => c.source !== 'couponapi');
  } else if (activeTab.value === 'imported') {
    result = result.filter(c => c.source === 'couponapi');
  }
  
  // Filter by platform
  if (filterPlatform.value && filterPlatform.value !== 'all') {
    result = result.filter(c => c.platform === filterPlatform.value);
  }
  
  return result;
});

// Methods
const getPlatformColor = (platform) => {
  const colors = {
    amazon: 'orange',
    flipkart: 'blue',
    myntra: 'pink',
    swiggy: 'orange-darken-2',
    zomato: 'red',
    ajio: 'purple',
    all: 'grey'
  };
  return colors[platform?.toLowerCase()] || 'grey';
};

const isExpired = (date) => {
  if (!date) return false;
  return new Date(date) < new Date();
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const showNotification = (message, color = 'success') => {
  snackbar.value = { show: true, message, color };
};

const copyCouponCode = (code) => {
  navigator.clipboard.writeText(code);
  showNotification('Coupon code copied!');
};

const loadCoupons = async () => {
  loading.value = true;
  try {
    coupons.value = await firebaseAdminService.getAllCoupons();
  } catch (error) {
    console.error('Error loading coupons:', error);
    showNotification('Error loading coupons', 'error');
  } finally {
    loading.value = false;
  }
};

const saveCoupon = async () => {
  saving.value = true;
  try {
    if (editingCoupon.value) {
      await firebaseAdminService.updateCoupon(editingCoupon.value, form.value);
      showNotification('Coupon updated successfully!');
    } else {
      await firebaseAdminService.createCoupon(form.value);
      showNotification('Coupon created successfully!');
    }
    showDialog.value = false;
    resetForm();
    await loadCoupons();
  } catch (error) {
    showNotification('Error saving coupon: ' + error.message, 'error');
  } finally {
    saving.value = false;
  }
};

const resetForm = () => {
  editingCoupon.value = null;
  form.value = {
    code: '',
    title_en: '',
    title_te: '',
    discount: 0,
    discountType: 'percent',
    minOrderValue: 0,
    platform: 'all',
    isActive: true,
    expiryDate: '',
    affiliateLink: '',
    description: '',
    source: 'manual'
  };
};

const editCoupon = (coupon) => {
  editingCoupon.value = coupon.id;
  form.value = { ...coupon };
  showDialog.value = true;
};

const toggleCouponStatus = async (coupon) => {
  try {
    await firebaseAdminService.updateCoupon(coupon.id, { isActive: coupon.isActive });
    showNotification(`Coupon ${coupon.isActive ? 'activated' : 'deactivated'}`);
  } catch (error) {
    showNotification('Error updating status', 'error');
  }
};

const deleteCoupon = async (couponId) => {
  if (confirm('Delete this coupon?')) {
    try {
      await firebaseAdminService.deleteCoupon(couponId);
      showNotification('Coupon deleted');
      await loadCoupons();
    } catch (error) {
      showNotification('Error deleting coupon', 'error');
    }
  }
};

// CouponAPI Integration
const fetchCouponsFromAPI = async () => {
  fetchingCoupons.value = true;
  apiCoupons.value = [];
  selectedApiCoupons.value = [];
  
  try {
    let result;
    if (importFilter.value.store) {
      result = await couponApiService.getCouponsByStore(importFilter.value.store);
    } else {
      result = await couponApiService.getAllCoupons(importFilter.value.category || 'all');
    }
    apiCoupons.value = result;
    
    if (result.length === 0) {
      showNotification('No coupons found for this filter', 'warning');
    }
  } catch (error) {
    console.error('Error fetching from CouponAPI:', error);
    showNotification('Error fetching coupons from API', 'error');
  } finally {
    fetchingCoupons.value = false;
  }
};

const quickFetchStore = (store) => {
  importFilter.value.store = store;
  fetchCouponsFromAPI();
};

const importSingleCoupon = async (apiCoupon) => {
  try {
    const couponData = {
      code: apiCoupon.code || `${apiCoupon.store.toUpperCase()}${Date.now()}`,
      title_en: apiCoupon.title,
      title_te: apiCoupon.title, // Can be translated later
      discount: parseDiscount(apiCoupon.discount),
      discountType: apiCoupon.discount?.includes('₹') ? 'flat' : 'percent',
      minOrderValue: apiCoupon.minOrderValue || 0,
      platform: apiCoupon.store?.toLowerCase() || 'all',
      isActive: true,
      expiryDate: apiCoupon.expiryDate || '',
      affiliateLink: apiCoupon.link || '',
      description: apiCoupon.description || '',
      source: 'couponapi',
      importedAt: new Date().toISOString()
    };
    
    await firebaseAdminService.createCoupon(couponData);
    showNotification(`Imported: ${apiCoupon.title}`);
    await loadCoupons();
  } catch (error) {
    showNotification('Error importing coupon', 'error');
  }
};

const importSelectedCoupons = async () => {
  let imported = 0;
  for (const coupon of selectedApiCoupons.value) {
    try {
      await importSingleCoupon(coupon);
      imported++;
    } catch (e) {
      console.error('Failed to import:', coupon, e);
    }
  }
  selectedApiCoupons.value = [];
  showNotification(`Imported ${imported} coupons successfully!`);
};

const parseDiscount = (discountStr) => {
  if (!discountStr) return 0;
  const match = discountStr.match(/\d+/);
  return match ? parseInt(match[0]) : 0;
};

onMounted(() => {
  loadCoupons();
});
</script>

<style scoped>
.coupon-manager {
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

.coupon-table {
  border-radius: 12px;
}

.coupon-item {
  border: 1px solid #e0e0e0;
  background: #fafafa;
}

.coupon-item:hover {
  background: #f0f0f0;
}

.api-coupon-list {
  background: transparent !important;
}

.gap-3 {
  gap: 12px;
}
</style>
