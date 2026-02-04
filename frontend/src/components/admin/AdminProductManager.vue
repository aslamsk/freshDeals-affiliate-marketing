<template>
  <div class="product-manager">
    <!-- Header Section -->
    <div class="manager-header mb-6">
      <div>
        <h3 class="text-h5 font-weight-bold">Product Management</h3>
        <p class="text-grey-darken-1 text-body-2 mt-1">Add products manually or import from affiliate platforms</p>
      </div>
      <div class="d-flex gap-3">
        <v-btn
          color="deep-purple"
          variant="outlined"
          prepend-icon="mdi-cloud-download"
          @click="showImportDialog = true"
        >
          Import from API
        </v-btn>
        <v-btn
          color="success"
          prepend-icon="mdi-plus"
          @click="openManualDialog"
        >
          Add Manually
        </v-btn>
      </div>
    </div>

    <!-- Stats Cards -->
    <v-row class="mb-6">
      <v-col cols="12" md="3">
        <v-card class="stat-card pa-4" rounded="lg">
          <div class="d-flex align-center">
            <v-avatar color="blue-lighten-4" size="48" class="mr-3">
              <v-icon color="blue-darken-2">mdi-package-variant</v-icon>
            </v-avatar>
            <div>
              <p class="text-h5 font-weight-bold mb-0">{{ products.length }}</p>
              <p class="text-caption text-grey">Total Products</p>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="stat-card pa-4" rounded="lg">
          <div class="d-flex align-center">
            <v-avatar color="green-lighten-4" size="48" class="mr-3">
              <v-icon color="green-darken-2">mdi-check-circle</v-icon>
            </v-avatar>
            <div>
              <p class="text-h5 font-weight-bold mb-0">{{ activeProducts }}</p>
              <p class="text-caption text-grey">Active</p>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="stat-card pa-4" rounded="lg">
          <div class="d-flex align-center">
            <v-avatar color="purple-lighten-4" size="48" class="mr-3">
              <v-icon color="purple-darken-2">mdi-cloud</v-icon>
            </v-avatar>
            <div>
              <p class="text-h5 font-weight-bold mb-0">{{ importedProducts }}</p>
              <p class="text-caption text-grey">API Imported</p>
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
              <p class="text-h5 font-weight-bold mb-0">{{ uniquePlatforms }}</p>
              <p class="text-caption text-grey">Platforms</p>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filter Tabs -->
    <v-tabs v-model="activeTab" color="deep-purple" class="mb-4">
      <v-tab value="all">All Products</v-tab>
      <v-tab value="manual">Manual</v-tab>
      <v-tab value="imported">API Imported</v-tab>
    </v-tabs>

    <!-- Products Table -->
    <v-card rounded="lg" elevation="2">
      <v-data-table
        :headers="headers"
        :items="filteredProducts"
        :loading="loading"
        :search="searchQuery"
        class="product-table"
        :items-per-page="10"
      >
        <template v-slot:top>
          <v-toolbar flat color="white" class="px-4">
            <v-text-field
              v-model="searchQuery"
              prepend-inner-icon="mdi-magnify"
              label="Search products..."
              single-line
              hide-details
              variant="outlined"
              density="compact"
              style="max-width: 300px;"
            />
            <v-spacer />
            <v-select
              v-model="filterPlatform"
              :items="platformFilterOptions"
              item-title="title"
              item-value="value"
              label="Platform"
              variant="outlined"
              density="compact"
              hide-details
              style="max-width: 180px;"
            >
              <template #item="{ item, props }">
                <v-list-item v-bind="props">
                  <template #prepend v-if="item.raw.value !== 'all'">
                    <v-icon size="small" :color="item.raw.isCustom ? 'purple' : 'primary'">
                      {{ item.raw.isCustom ? 'mdi-star-circle' : 'mdi-store' }}
                    </v-icon>
                  </template>
                </v-list-item>
              </template>
            </v-select>
          </v-toolbar>
        </template>

        <!-- Product with Image -->
        <template v-slot:item.title_en="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar size="50" rounded="lg" class="mr-3">
              <v-img v-if="item.image" :src="item.image" cover />
              <v-icon v-else color="grey">mdi-image</v-icon>
            </v-avatar>
            <div>
              <p class="font-weight-medium mb-0">{{ item.title_en }}</p>
              <p class="text-caption text-grey">{{ item.category }}</p>
            </div>
          </div>
        </template>

        <!-- Platform -->
        <template v-slot:item.dealPlatform="{ item }">
          <v-chip 
            :color="getPlatformColor(item.dealPlatform)" 
            size="small"
            variant="flat"
          >
            {{ item.dealPlatform || 'N/A' }}
          </v-chip>
        </template>

        <!-- Source -->
        <template v-slot:item.source="{ item }">
          <v-chip 
            :color="item.source === 'api' ? 'deep-purple' : 'grey'" 
            size="small"
            variant="outlined"
          >
            <v-icon start size="14">
              {{ item.source === 'api' ? 'mdi-cloud' : 'mdi-pencil' }}
            </v-icon>
            {{ item.source === 'api' ? 'API' : 'Manual' }}
          </v-chip>
        </template>

        <!-- Status -->
        <template v-slot:item.isActive="{ item }">
          <v-switch
            v-model="item.isActive"
            color="success"
            hide-details
            density="compact"
            @change="toggleProductStatus(item)"
          />
        </template>

        <!-- Actions -->
        <template v-slot:item.actions="{ item }">
          <v-btn size="small" icon variant="text" color="primary" @click="editProduct(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn size="small" icon variant="text" color="warning" @click="viewPlatforms(item)">
            <v-icon>mdi-link-variant</v-icon>
          </v-btn>
          <v-btn size="small" icon variant="text" color="error" @click="deleteProduct(item.id)">
            <v-icon>mdi-trash-can</v-icon>
          </v-btn>
        </template>

        <template v-slot:no-data>
          <div class="py-8 text-center">
            <v-icon size="64" color="grey-lighten-2">mdi-package-variant-closed</v-icon>
            <p class="mt-4 text-grey">No products found</p>
            <div class="d-flex justify-center gap-3 mt-4">
              <v-btn color="deep-purple" variant="outlined" @click="showImportDialog = true">
                Import from API
              </v-btn>
              <v-btn color="success" @click="openManualDialog">
                Add Manually
              </v-btn>
            </div>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- ============================================ -->
    <!-- MANUAL ADD/EDIT PRODUCT DIALOG -->
    <!-- ============================================ -->
    <v-dialog v-model="showCreateDialog" max-width="800px">
      <v-card rounded="lg">
        <v-card-title class="bg-deep-purple text-white pa-4">
          <v-icon class="mr-2">{{ editingProduct ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
          {{ editingProduct ? 'Edit Product' : 'Add Product Manually' }}
        </v-card-title>

        <v-card-text class="pt-6">
          <v-row>
            <!-- Basic Info -->
            <v-col cols="12">
              <p class="text-subtitle-2 font-weight-bold mb-2">
                <v-icon size="18" class="mr-1">mdi-information</v-icon>
                Basic Information
              </p>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.title_en"
                label="Product Title (English) *"
                variant="outlined"
                prepend-inner-icon="mdi-format-title"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.title_te"
                label="Product Title (Telugu)"
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
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.image"
                label="Image URL *"
                variant="outlined"
                prepend-inner-icon="mdi-image"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="form.category"
                :items="categories"
                label="Category *"
                variant="outlined"
                prepend-inner-icon="mdi-shape"
              />
            </v-col>

            <!-- Platform Selection -->
            <v-col cols="12">
              <v-divider class="my-2" />
              <p class="text-subtitle-2 font-weight-bold mb-2 mt-4">
                <v-icon size="18" class="mr-1">mdi-store</v-icon>
                Platform & Pricing
              </p>
            </v-col>
            <v-col cols="12" md="6">
              <v-combobox
                v-model="form.dealPlatform"
                :items="platformSelectOptions"
                item-title="title"
                item-value="value"
                label="Platform *"
                variant="outlined"
                prepend-inner-icon="mdi-store"
                hint="Select existing or type new platform name"
                persistent-hint
                :return-object="false"
              >
                <template #item="{ item, props }">
                  <v-list-item v-bind="props">
                    <template #prepend>
                      <v-icon 
                        :color="item.raw.value && item.raw.value.includes('custom') ? 'purple' : 'primary'" 
                        size="small"
                      >
                        {{ item.raw.title?.includes('✦') ? 'mdi-star-circle' : 'mdi-store' }}
                      </v-icon>
                    </template>
                  </v-list-item>
                </template>
              </v-combobox>
              
              <!-- New Platform Alert -->
              <v-alert 
                v-if="isNewPlatform" 
                type="info" 
                density="compact"
                variant="tonal"
                class="mt-2"
              >
                <v-icon size="small" class="mr-1">mdi-plus-circle</v-icon>
                "<strong>{{ form.dealPlatform }}</strong>" will be added as a new custom platform
              </v-alert>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.affiliateLink"
                label="Affiliate/Product Link"
                variant="outlined"
                prepend-inner-icon="mdi-link"
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

            <!-- Options -->
            <v-col cols="12">
              <v-divider class="my-2" />
              <p class="text-subtitle-2 font-weight-bold mb-2 mt-4">
                <v-icon size="18" class="mr-1">mdi-cog</v-icon>
                Options
              </p>
            </v-col>
            <v-col cols="12" md="6">
              <v-checkbox
                v-model="form.compareEnabled"
                label="Enable Price Comparison"
                color="deep-purple"
                hide-details
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-checkbox
                v-model="form.isActive"
                label="Active"
                color="success"
                hide-details
              />
            </v-col>

            <!-- Add Custom Platform inline -->
            <v-col cols="12" v-if="isNewPlatform">
              <v-alert type="info" variant="tonal" class="mb-0">
                <div class="d-flex align-center">
                  <v-icon class="mr-2">mdi-information</v-icon>
                  <span>
                    New platform "<strong>{{ form.dealPlatform }}</strong>" will be saved to your platform list.
                  </span>
                </div>
              </v-alert>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="showCreateDialog = false">Cancel</v-btn>
          <v-btn color="success" variant="flat" @click="saveProduct" :loading="saving">
            <v-icon start>mdi-check</v-icon>
            Save Product
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ============================================ -->
    <!-- API IMPORT DIALOG -->
    <!-- ============================================ -->
    <v-dialog v-model="showImportDialog" max-width="900px">
      <v-card rounded="lg">
        <v-card-title class="bg-deep-purple text-white pa-4">
          <v-icon class="mr-2">mdi-cloud-download</v-icon>
          Import Products from API
        </v-card-title>
        
        <v-card-text class="pt-6">
          <!-- Platform Selection -->
          <v-row class="mb-4">
            <v-col cols="12" md="4">
              <v-select
                v-model="importPlatform"
                :items="apiPlatforms"
                item-title="name"
                item-value="id"
                label="Select Platform"
                variant="outlined"
                prepend-inner-icon="mdi-store"
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template v-slot:prepend>
                      <v-avatar :color="item.raw.color" size="32">
                        <v-icon color="white" size="18">{{ item.raw.icon }}</v-icon>
                      </v-avatar>
                    </template>
                    <v-list-item-subtitle>{{ item.raw.type }}</v-list-item-subtitle>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>
            <v-col cols="12" md="5">
              <v-text-field
                v-model="importSearchQuery"
                label="Search products..."
                variant="outlined"
                prepend-inner-icon="mdi-magnify"
                @keyup.enter="searchAPIProducts"
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-btn 
                color="deep-purple" 
                block 
                height="56"
                @click="searchAPIProducts"
                :loading="searchingAPI"
                :disabled="!importPlatform"
              >
                <v-icon start>mdi-magnify</v-icon>
                Search
              </v-btn>
            </v-col>
          </v-row>

          <!-- API Connection Status -->
          <v-alert 
            v-if="importPlatform && !isPlatformConnected(importPlatform)"
            type="warning" 
            variant="tonal" 
            class="mb-4"
          >
            <div class="d-flex align-center justify-space-between">
              <span>This platform is not connected yet. Connect to import products.</span>
              <v-btn color="warning" variant="flat" size="small" @click="goToConnectPlatform">
                Connect Now
              </v-btn>
            </div>
          </v-alert>

          <!-- API Results -->
          <div v-if="searchingAPI" class="text-center py-8">
            <v-progress-circular indeterminate color="deep-purple" size="48" />
            <p class="mt-4 text-grey">Searching products...</p>
          </div>

          <div v-else-if="apiProducts.length === 0" class="text-center py-8">
            <v-icon size="64" color="grey-lighten-2">mdi-package-variant</v-icon>
            <p class="mt-4 text-grey">Select a platform and search to find products</p>
          </div>

          <div v-else>
            <div class="d-flex justify-space-between align-center mb-4">
              <span>Found {{ apiProducts.length }} products</span>
              <v-btn 
                color="success" 
                size="small"
                @click="importSelectedProducts"
                :disabled="selectedApiProducts.length === 0"
                :loading="importingProducts"
              >
                Import Selected ({{ selectedApiProducts.length }})
              </v-btn>
            </div>

            <v-list class="api-product-list" max-height="400" style="overflow-y: auto;">
              <v-list-item
                v-for="product in apiProducts"
                :key="product.id"
                class="product-item mb-2"
                rounded="lg"
              >
                <template v-slot:prepend>
                  <v-checkbox
                    v-model="selectedApiProducts"
                    :value="product"
                    color="deep-purple"
                    hide-details
                  />
                  <v-avatar size="60" rounded="lg" class="ml-2">
                    <v-img v-if="product.imageUrl" :src="product.imageUrl" />
                    <v-icon v-else>mdi-package</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title class="font-weight-medium">
                  {{ product.title }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  <span class="text-success font-weight-bold">₹{{ product.price }}</span>
                  <span v-if="product.originalPrice" class="text-grey text-decoration-line-through ml-2">
                    ₹{{ product.originalPrice }}
                  </span>
                  <v-chip size="x-small" class="ml-2" color="success" v-if="product.discount">
                    {{ product.discount }}% OFF
                  </v-chip>
                </v-list-item-subtitle>
                <template v-slot:append>
                  <v-btn 
                    size="small" 
                    color="success" 
                    variant="flat"
                    @click="importSingleProduct(product)"
                    :loading="product.importing"
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

    <!-- ============================================ -->
    <!-- MANAGE CUSTOM PLATFORMS DIALOG -->
    <!-- ============================================ -->
    <v-dialog v-model="showPlatformManagerDialog" max-width="600px">
      <v-card rounded="lg">
        <v-card-title class="bg-orange text-white pa-4">
          <v-icon class="mr-2">mdi-store-cog</v-icon>
          Manage Custom Platforms
        </v-card-title>
        
        <v-card-text class="pt-6">
          <!-- Add New Platform -->
          <div class="mb-4">
            <p class="text-subtitle-2 font-weight-bold mb-2">Add New Platform</p>
            <v-row>
              <v-col cols="12" md="5">
                <v-text-field
                  v-model="newPlatformForm.name"
                  label="Platform Name"
                  variant="outlined"
                  density="compact"
                  placeholder="e.g., NewStartup"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="newPlatformForm.type"
                  :items="['e-commerce', 'affiliate', 'marketplace', 'direct', 'other']"
                  label="Type"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-btn 
                  color="success" 
                  block 
                  @click="addCustomPlatform"
                  :disabled="!newPlatformForm.name"
                >
                  <v-icon start>mdi-plus</v-icon>
                  Add
                </v-btn>
              </v-col>
            </v-row>
          </div>

          <v-divider class="mb-4" />

          <!-- Existing Custom Platforms -->
          <p class="text-subtitle-2 font-weight-bold mb-2">Your Custom Platforms</p>
          <v-list v-if="customPlatforms.length > 0">
            <v-list-item
              v-for="platform in customPlatforms"
              :key="platform.id"
              class="mb-2"
              rounded="lg"
              border
            >
              <template v-slot:prepend>
                <v-avatar :color="platform.color || 'grey'" size="36">
                  <v-icon color="white" size="18">mdi-store</v-icon>
                </v-avatar>
              </template>
              <v-list-item-title>{{ platform.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ platform.type }}</v-list-item-subtitle>
              <template v-slot:append>
                <v-btn 
                  icon 
                  variant="text" 
                  color="error" 
                  size="small"
                  @click="deleteCustomPlatform(platform.id)"
                >
                  <v-icon>mdi-trash-can</v-icon>
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
          <div v-else class="text-center py-4">
            <v-icon color="grey-lighten-2" size="48">mdi-store-off</v-icon>
            <p class="text-grey mt-2">No custom platforms added yet</p>
          </div>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="showPlatformManagerDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Platforms Dialog (existing) -->
    <v-dialog v-model="showPlatformsDialog" max-width="800px">
      <v-card rounded="lg">
        <v-card-title class="bg-deep-purple text-white pa-4">
          <v-icon class="mr-2">mdi-link-variant</v-icon>
          Platform Links: {{ selectedProduct?.title_en }}
        </v-card-title>

        <v-card-text class="mt-4">
          <AdminPlatformLinker
            v-if="selectedProduct"
            :product-id="selectedProduct.id"
            :product="selectedProduct"
            :all-platforms="allPlatforms"
          />
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="showPlatformsDialog = false">Close</v-btn>
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
import { amazonService, flipkartService, AFFILIATE_PLATFORMS } from '../../services/affiliatePlatformsService.js';
import { db } from '../../services/firebaseConfig.js';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import AdminPlatformLinker from './AdminPlatformLinker.vue';

// State
const loading = ref(false);
const saving = ref(false);
const showCreateDialog = ref(false);
const showImportDialog = ref(false);
const showPlatformsDialog = ref(false);
const showPlatformManagerDialog = ref(false);
const editingProduct = ref(null);
const selectedProduct = ref(null);
const searchQuery = ref('');
const filterPlatform = ref('all');
const activeTab = ref('all');

// Products
const products = ref([]);

// API Import
const importPlatform = ref('');
const importSearchQuery = ref('');
const searchingAPI = ref(false);
const importingProducts = ref(false);
const apiProducts = ref([]);
const selectedApiProducts = ref([]);

// Custom Platforms
const customPlatforms = ref([]);
const newPlatformForm = ref({
  name: '',
  type: 'e-commerce',
  color: '#666666'
});

// Snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
});

// Predefined platforms
const predefinedPlatforms = [
  'amazon', 'flipkart', 'myntra', 'meesho', 'ajio', 
  'tatacliq', 'nykaa', 'snapdeal', 'shopclues', 'paytm'
];

// API-enabled platforms for import
const apiPlatforms = [
  { id: 'amazon', name: 'Amazon', type: 'Direct Affiliate', color: '#FF9900', icon: 'mdi-amazon' },
  { id: 'flipkart', name: 'Flipkart', type: 'Direct Affiliate', color: '#2874F0', icon: 'mdi-shopping' },
  { id: 'vcommission', name: 'vCommission', type: 'Affiliate Network', color: '#E91E63', icon: 'mdi-web' },
  { id: 'cuelinks', name: 'Cuelinks', type: 'Affiliate Network', color: '#4CAF50', icon: 'mdi-link-variant' },
];

const categories = [
  'electronics', 'accessories', 'audio', 'computing', 'mobile',
  'wearables', 'gaming', 'lifestyle', 'home', 'fashion',
  'beauty', 'grocery', 'sports', 'books', 'toys', 'other'
];

const headers = [
  { title: 'Product', value: 'title_en' },
  { title: 'Platform', value: 'dealPlatform', width: '120px' },
  { title: 'Source', value: 'source', width: '100px' },
  { title: 'Active', value: 'isActive', width: '80px' },
  { title: 'Actions', value: 'actions', sortable: false, width: '140px' },
];

const form = ref({
  title_en: '',
  title_te: '',
  description: '',
  image: '',
  category: '',
  compareEnabled: true,
  isActive: true,
  dealPrice: 0,
  originalPrice: 0,
  discount: 0,
  dealPlatform: 'amazon',
  affiliateLink: '',
  source: 'manual'
});

// Computed
const activeProducts = computed(() => products.value.filter(p => p.isActive).length);
const importedProducts = computed(() => products.value.filter(p => p.source === 'api').length);
const uniquePlatforms = computed(() => {
  const platforms = products.value.map(p => p.dealPlatform).filter(Boolean);
  return new Set(platforms).size;
});

// Combine predefined + custom platforms with proper display names
const allPlatformsWithDetails = computed(() => {
  const predefined = predefinedPlatforms.map(p => ({
    id: p,
    name: p.charAt(0).toUpperCase() + p.slice(1), // Capitalize
    isCustom: false
  }));
  
  const custom = customPlatforms.value.map(p => ({
    id: p.name.toLowerCase().replace(/\s+/g, '_'),
    name: p.name,
    isCustom: true,
    color: p.color
  }));
  
  return [...predefined, ...custom];
});

const allPlatforms = computed(() => {
  return allPlatformsWithDetails.value.map(p => p.id);
});

// Platform options for the combobox (with display names)
const platformSelectOptions = computed(() => {
  return allPlatformsWithDetails.value.map(p => ({
    title: p.name + (p.isCustom ? ' ✦' : ''),
    value: p.id
  }));
});

// Platform filter options for the table filter
const platformFilterOptions = computed(() => {
  const options = [{ title: 'All Platforms', value: 'all', isCustom: false }];
  allPlatformsWithDetails.value.forEach(p => {
    options.push({
      title: p.name + (p.isCustom ? ' ✦' : ''),
      value: p.id,
      isCustom: p.isCustom
    });
  });
  return options;
});

const allPlatformOptions = computed(() => {
  return ['all', ...allPlatforms.value];
});

const isNewPlatform = computed(() => {
  if (!form.value.dealPlatform) return false;
  const platformLower = form.value.dealPlatform.toLowerCase();
  return !allPlatforms.value.includes(platformLower);
});

const filteredProducts = computed(() => {
  let result = products.value;
  
  // Filter by tab
  if (activeTab.value === 'manual') {
    result = result.filter(p => p.source !== 'api');
  } else if (activeTab.value === 'imported') {
    result = result.filter(p => p.source === 'api');
  }
  
  // Filter by platform
  if (filterPlatform.value && filterPlatform.value !== 'all') {
    result = result.filter(p => p.dealPlatform === filterPlatform.value);
  }
  
  return result;
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
    tatacliq: 'cyan',
    nykaa: 'pink-darken-2',
    snapdeal: 'red',
    shopclues: 'green',
    paytm: 'blue-darken-2'
  };
  return colors[platform?.toLowerCase()] || 'grey';
};

const calculateDiscount = () => {
  if (form.value.originalPrice > 0 && form.value.dealPrice > 0) {
    form.value.discount = Math.round(
      ((form.value.originalPrice - form.value.dealPrice) / form.value.originalPrice) * 100
    );
  }
};

const openManualDialog = () => {
  resetForm();
  showCreateDialog.value = true;
};

const resetForm = () => {
  form.value = {
    title_en: '',
    title_te: '',
    description: '',
    image: '',
    category: '',
    compareEnabled: true,
    isActive: true,
    dealPrice: 0,
    originalPrice: 0,
    discount: 0,
    dealPlatform: 'amazon',
    affiliateLink: '',
    source: 'manual'
  };
  editingProduct.value = null;
};

const loadProducts = async () => {
  loading.value = true;
  try {
    products.value = await firebaseAdminService.getAllProducts();
  } catch (error) {
    console.error('Error loading products:', error);
    showNotification('Error loading products', 'error');
  } finally {
    loading.value = false;
  }
};

const loadCustomPlatforms = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'custom_platforms'));
    customPlatforms.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error loading custom platforms:', error);
  }
};

const addCustomPlatform = async () => {
  if (!newPlatformForm.value.name) return;
  
  try {
    const platformData = {
      name: newPlatformForm.value.name,
      type: newPlatformForm.value.type,
      color: '#' + Math.floor(Math.random()*16777215).toString(16),
      createdAt: new Date().toISOString()
    };
    
    await addDoc(collection(db, 'custom_platforms'), platformData);
    showNotification(`Platform "${newPlatformForm.value.name}" added!`);
    newPlatformForm.value = { name: '', type: 'e-commerce', color: '#666666' };
    await loadCustomPlatforms();
  } catch (error) {
    showNotification('Error adding platform', 'error');
  }
};

const deleteCustomPlatform = async (platformId) => {
  if (confirm('Delete this custom platform?')) {
    try {
      await deleteDoc(doc(db, 'custom_platforms', platformId));
      showNotification('Platform deleted');
      await loadCustomPlatforms();
    } catch (error) {
      showNotification('Error deleting platform', 'error');
    }
  }
};

const editProduct = (product) => {
  editingProduct.value = product.id;
  form.value = { ...product };
  showCreateDialog.value = true;
};

const toggleProductStatus = async (product) => {
  try {
    await firebaseAdminService.updateProduct(product.id, { isActive: product.isActive });
    showNotification(`Product ${product.isActive ? 'activated' : 'deactivated'}`);
  } catch (error) {
    showNotification('Error updating status', 'error');
  }
};

const saveProduct = async () => {
  if (!form.value.title_en || !form.value.image || !form.value.category) {
    showNotification('Please fill in all required fields', 'warning');
    return;
  }

  saving.value = true;
  try {
    // If it's a new platform, save it
    if (isNewPlatform.value) {
      await addDoc(collection(db, 'custom_platforms'), {
        name: form.value.dealPlatform,
        type: 'custom',
        color: '#' + Math.floor(Math.random()*16777215).toString(16),
        createdAt: new Date().toISOString()
      });
      await loadCustomPlatforms();
    }

    const productData = {
      ...form.value,
      dealPlatform: form.value.dealPlatform?.toLowerCase() || 'amazon',
      updatedAt: new Date().toISOString()
    };

    if (editingProduct.value) {
      await firebaseAdminService.updateProduct(editingProduct.value, productData);
      showNotification('Product updated successfully!');
    } else {
      productData.createdAt = new Date().toISOString();
      const createdProduct = await firebaseAdminService.createProduct(productData);
      
      // Auto-create a deal
      await firebaseAdminService.createDeal({
        productId: createdProduct.id,
        title_en: form.value.title_en,
        title_te: form.value.title_te,
        title: form.value.title_en,
        description: form.value.description || form.value.title_en,
        status: 'ACTIVE',
        isVisible: true,
        platform: form.value.dealPlatform?.toLowerCase() || 'amazon',
        dealPrice: Number(form.value.dealPrice) || 0,
        originalPrice: Number(form.value.originalPrice) || 0,
        discount: Number(form.value.discount) || 0,
        imageUrl: form.value.image,
        affiliateLink: form.value.affiliateLink || '#',
        source: form.value.source
      });
      
      showNotification('Product created successfully!');
    }
    
    showCreateDialog.value = false;
    resetForm();
    await loadProducts();
  } catch (error) {
    console.error('Error saving product:', error);
    showNotification('Error saving product: ' + error.message, 'error');
  } finally {
    saving.value = false;
  }
};

const deleteProduct = async (productId) => {
  if (!confirm('Are you sure you want to delete this product?')) return;

  try {
    await firebaseAdminService.deleteProduct(productId);
    showNotification('Product deleted');
    await loadProducts();
  } catch (error) {
    showNotification('Error deleting product', 'error');
  }
};

const viewPlatforms = (product) => {
  selectedProduct.value = product;
  showPlatformsDialog.value = true;
};

// API Import Functions
const isPlatformConnected = (platformId) => {
  // Check if platform credentials exist
  // For now, return true to allow testing
  return true;
};

const goToConnectPlatform = () => {
  showImportDialog.value = false;
  // Navigate to Platforms tab
};

const searchAPIProducts = async () => {
  if (!importPlatform.value) {
    showNotification('Please select a platform', 'warning');
    return;
  }

  searchingAPI.value = true;
  apiProducts.value = [];
  selectedApiProducts.value = [];

  try {
    let results = [];
    
    switch (importPlatform.value) {
      case 'amazon':
        results = await amazonService.searchProducts(importSearchQuery.value || 'electronics');
        break;
      case 'flipkart':
        results = await flipkartService.searchProducts(importSearchQuery.value || 'electronics');
        break;
      default:
        // Mock data for other platforms
        results = generateMockProducts(importPlatform.value, importSearchQuery.value);
    }
    
    apiProducts.value = results;
    
    if (results.length === 0) {
      showNotification('No products found', 'info');
    }
  } catch (error) {
    console.error('API search error:', error);
    showNotification('Error searching products', 'error');
  } finally {
    searchingAPI.value = false;
  }
};

const generateMockProducts = (platform, query) => {
  // Generate sample products for platforms without real API
  const products = [];
  for (let i = 1; i <= 5; i++) {
    products.push({
      id: `${platform}_${Date.now()}_${i}`,
      title: `${query || 'Product'} from ${platform} #${i}`,
      price: Math.floor(Math.random() * 5000) + 500,
      originalPrice: Math.floor(Math.random() * 8000) + 1000,
      discount: Math.floor(Math.random() * 50) + 10,
      imageUrl: `https://via.placeholder.com/200x200?text=${platform}+Product`,
      platform: platform,
      affiliateLink: `https://${platform}.com/product/${i}`
    });
  }
  return products;
};

const importSingleProduct = async (apiProduct) => {
  apiProduct.importing = true;
  
  try {
    const productData = {
      title_en: apiProduct.title,
      title_te: apiProduct.title,
      description: apiProduct.description || '',
      image: apiProduct.imageUrl || apiProduct.image,
      category: apiProduct.category || 'electronics',
      dealPlatform: importPlatform.value,
      dealPrice: apiProduct.price,
      originalPrice: apiProduct.originalPrice || apiProduct.price,
      discount: apiProduct.discount || 0,
      affiliateLink: apiProduct.affiliateLink || apiProduct.url || '',
      compareEnabled: true,
      isActive: true,
      source: 'api',
      importedFrom: importPlatform.value,
      importedAt: new Date().toISOString()
    };

    await firebaseAdminService.createProduct(productData);
    showNotification(`Imported: ${apiProduct.title}`);
    await loadProducts();
  } catch (error) {
    showNotification('Error importing product', 'error');
  } finally {
    apiProduct.importing = false;
  }
};

const importSelectedProducts = async () => {
  importingProducts.value = true;
  let imported = 0;
  
  for (const product of selectedApiProducts.value) {
    try {
      await importSingleProduct(product);
      imported++;
    } catch (e) {
      console.error('Failed to import:', product, e);
    }
  }
  
  selectedApiProducts.value = [];
  importingProducts.value = false;
  showNotification(`Imported ${imported} products successfully!`);
};

onMounted(() => {
  loadProducts();
  loadCustomPlatforms();
});
</script>

<style scoped>
.product-manager {
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

.product-table {
  border-radius: 12px;
}

.product-item {
  border: 1px solid #e0e0e0;
  background: #fafafa;
}

.product-item:hover {
  background: #f0f0f0;
}

.api-product-list {
  background: transparent !important;
}

.gap-3 {
  gap: 12px;
}

.bg-deep-purple {
  background: linear-gradient(135deg, #7c4dff 0%, #651fff 100%) !important;
}

.bg-orange {
  background: linear-gradient(135deg, #FF9800 0%, #FF6B35 100%) !important;
}

.text-white {
  color: white !important;
}
</style>
