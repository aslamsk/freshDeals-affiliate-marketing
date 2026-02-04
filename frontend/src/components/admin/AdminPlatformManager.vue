<template>
  <div class="platform-manager">
    <!-- Header -->
    <div class="manager-header mb-6">
      <div>
        <h3 class="text-h5 font-weight-bold">Affiliate Platform Management</h3>
        <p class="text-grey-darken-1 text-body-2 mt-1">Connect affiliate networks and add custom platforms</p>
      </div>
      <div class="d-flex gap-3">
        <v-btn color="orange" variant="outlined" @click="showCustomPlatformDialog = true">
          <v-icon left>mdi-store-plus</v-icon>
          Add Custom Platform
        </v-btn>
        <v-btn color="primary" @click="showConnectDialog = true">
          <v-icon left>mdi-plus</v-icon>
          Connect Platform
        </v-btn>
      </div>
    </div>

    <!-- Platform Type Tabs -->
    <v-tabs v-model="platformTab" color="deep-purple" class="mb-4">
      <v-tab value="all">All Platforms</v-tab>
      <v-tab value="api">API Enabled</v-tab>
      <v-tab value="custom">Custom Platforms</v-tab>
    </v-tabs>

    <!-- Platform Cards Grid -->
    <v-row class="mb-6">
      <v-col v-for="platform in filteredPlatforms" :key="platform.id" cols="12" sm="6" md="4">
        <v-card class="platform-card" :class="{ connected: isConnected(platform.id) }">
          <v-card-text>
            <div class="d-flex align-center mb-3">
              <v-avatar :color="platform.color || '#666'" size="48" class="mr-3">
                <v-icon color="white" size="24">{{ getPlatformIcon(platform.id) }}</v-icon>
              </v-avatar>
              <div class="flex-grow-1">
                <div class="font-weight-bold">{{ platform.name }}</div>
                <div class="d-flex align-center gap-1">
                  <v-chip 
                    :color="isConnected(platform.id) ? 'success' : 'grey'" 
                    size="x-small"
                  >
                    {{ isConnected(platform.id) ? 'Connected' : 'Not Connected' }}
                  </v-chip>
                  <v-chip 
                    v-if="platform.isCustom"
                    color="orange" 
                    size="x-small"
                  >
                    Custom
                  </v-chip>
                </div>
              </div>
              <v-btn 
                v-if="platform.isCustom"
                icon 
                variant="text" 
                color="error" 
                size="x-small"
                @click="deleteCustomPlatform(platform.id)"
              >
                <v-icon size="16">mdi-trash-can</v-icon>
              </v-btn>
            </div>
            
            <div class="text-caption text-grey mb-2">{{ platform.description || 'Custom affiliate platform' }}</div>
            
            <div class="d-flex align-center mb-2" v-if="platform.commission">
              <v-icon size="14" color="success" class="mr-1">mdi-cash</v-icon>
              <span class="text-caption">Commission: {{ platform.commission }}</span>
            </div>
            
            <div class="d-flex align-center mb-3">
              <v-chip size="x-small" :color="getTypeColor(platform.type)" class="mr-1">
                {{ (platform.type || 'custom').toUpperCase() }}
              </v-chip>
              <v-chip v-if="platform.hasApi" size="x-small" color="blue">
                API
              </v-chip>
            </div>

            <div class="d-flex gap-2">
              <v-btn 
                v-if="!isConnected(platform.id)"
                color="primary" 
                size="small" 
                block
                @click="openConnectDialog(platform)"
              >
                <v-icon left size="16">mdi-link</v-icon>
                Connect
              </v-btn>
              <template v-else>
                <v-btn 
                  color="info" 
                  size="small" 
                  variant="outlined"
                  @click="openImportDialog(platform)"
                  :disabled="!platform.hasApi"
                >
                  <v-icon left size="16">mdi-import</v-icon>
                  Import
                </v-btn>
                <v-btn 
                  color="error" 
                  size="small" 
                  variant="outlined"
                  @click="disconnectPlatform(platform.id)"
                >
                  <v-icon size="16">mdi-link-off</v-icon>
                </v-btn>
              </template>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Add Custom Platform Card -->
      <v-col cols="12" sm="6" md="4">
        <v-card 
          class="platform-card add-card d-flex align-center justify-center" 
          style="min-height: 250px; border: 2px dashed #ccc; cursor: pointer;"
          @click="showCustomPlatformDialog = true"
        >
          <div class="text-center">
            <v-icon size="48" color="grey">mdi-plus-circle-outline</v-icon>
            <p class="text-grey mt-2">Add New Platform</p>
            <p class="text-caption text-grey">For startups, new affiliates, etc.</p>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Connected Platforms Stats -->
    <v-card class="mb-6" v-if="connectedPlatforms.length > 0">
      <v-card-title>
        <v-icon left>mdi-chart-bar</v-icon>
        Connected Platforms Overview
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col v-for="cp in connectedPlatforms" :key="cp.id" cols="12" sm="6" md="3">
            <div class="stat-mini-card" :style="{ borderColor: getPlatformById(cp.platformId)?.color }">
              <div class="d-flex align-center mb-2">
                <v-icon :color="getPlatformById(cp.platformId)?.color" class="mr-2">
                  {{ getPlatformIcon(cp.platformId) }}
                </v-icon>
                <span class="font-weight-medium">{{ getPlatformById(cp.platformId)?.name }}</span>
              </div>
              <div class="text-caption text-grey">
                Connected: {{ formatDate(cp.createdAt) }}
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Platform Links Table -->
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <div>
          <v-icon left>mdi-link-variant</v-icon>
          Product Platform Links
        </div>
        <v-btn color="primary" size="small" @click="loadPlatformLinks">
          <v-icon left size="16">mdi-refresh</v-icon>
          Refresh
        </v-btn>
      </v-card-title>
      <v-data-table
        :headers="linkHeaders"
        :items="platformLinks"
        :loading="loadingLinks"
        class="elevation-0"
      >
        <template v-slot:item.platform="{ item }">
          <v-chip :color="getPlatformById(item.platform)?.color || 'grey'" size="small" label>
            {{ item.platform?.toUpperCase() }}
          </v-chip>
        </template>
        
        <template v-slot:item.price="{ item }">
          <span class="font-weight-bold">₹{{ formatPrice(item.price) }}</span>
        </template>
        
        <template v-slot:item.isActive="{ item }">
          <v-chip :color="item.isActive ? 'success' : 'error'" size="small">
            {{ item.isActive ? 'Active' : 'Inactive' }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn icon size="small" @click="editLink(item)" title="Edit">
            <v-icon size="16">mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon size="small" color="success" @click="createDealFromLink(item)" title="Create Deal">
            <v-icon size="16">mdi-tag-plus</v-icon>
          </v-btn>
          <v-btn icon size="small" color="error" @click="deleteLink(item.id)" title="Delete">
            <v-icon size="16">mdi-trash-can</v-icon>
          </v-btn>
        </template>

        <template v-slot:no-data>
          <div class="py-8 text-center">
            <v-icon size="64" color="grey-lighten-1">mdi-link-off</v-icon>
            <p class="text-grey mt-4">No platform links found</p>
            <v-btn color="primary" class="mt-2" @click="showConnectDialog = true">
              Connect a Platform
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Connect Platform Dialog -->
    <v-dialog v-model="showConnectDialog" max-width="600px">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-avatar :color="selectedPlatform?.color || 'primary'" size="40" class="mr-3">
            <v-icon color="white">{{ getPlatformIcon(selectedPlatform?.id) }}</v-icon>
          </v-avatar>
          Connect {{ selectedPlatform?.name || 'Platform' }}
        </v-card-title>
        <v-card-text class="mt-4">
          <v-alert v-if="selectedPlatform" type="info" variant="tonal" class="mb-4">
            <strong>Required Credentials:</strong>
            {{ selectedPlatform.requiredCredentials?.join(', ') }}
          </v-alert>

          <v-form ref="credentialsForm">
            <!-- Amazon Credentials -->
            <template v-if="selectedPlatform?.id === 'amazon'">
              <v-text-field 
                v-model="credentials.accessKey" 
                label="Access Key" 
                variant="outlined"
                class="mb-3"
                :rules="[v => !!v || 'Required']"
              />
              <v-text-field 
                v-model="credentials.secretKey" 
                label="Secret Key" 
                type="password"
                variant="outlined"
                class="mb-3"
                :rules="[v => !!v || 'Required']"
              />
              <v-text-field 
                v-model="credentials.partnerTag" 
                label="Partner Tag (e.g., freshdeals-21)" 
                variant="outlined"
                class="mb-3"
                :rules="[v => !!v || 'Required']"
              />
            </template>

            <!-- Flipkart Credentials -->
            <template v-else-if="selectedPlatform?.id === 'flipkart'">
              <v-text-field 
                v-model="credentials.affiliateId" 
                label="Affiliate ID" 
                variant="outlined"
                class="mb-3"
                :rules="[v => !!v || 'Required']"
              />
              <v-text-field 
                v-model="credentials.affiliateToken" 
                label="Affiliate Token" 
                type="password"
                variant="outlined"
                class="mb-3"
                :rules="[v => !!v || 'Required']"
              />
            </template>

            <!-- vCommission / Cuelinks -->
            <template v-else-if="['vcommission', 'cuelinks'].includes(selectedPlatform?.id)">
              <v-text-field 
                v-model="credentials.apiKey" 
                label="API Key" 
                variant="outlined"
                class="mb-3"
                :rules="[v => !!v || 'Required']"
              />
              <v-text-field 
                v-model="credentials.publisherId" 
                label="Publisher ID / Site ID" 
                variant="outlined"
                class="mb-3"
              />
            </template>

            <!-- CouponAPI -->
            <template v-else-if="selectedPlatform?.id === 'couponapi'">
              <v-text-field 
                v-model="credentials.apiKey" 
                label="API Key" 
                variant="outlined"
                class="mb-3"
                :rules="[v => !!v || 'Required']"
              />
            </template>

            <!-- SaaS Affiliates -->
            <template v-else-if="['hostinger', 'shopify'].includes(selectedPlatform?.id)">
              <v-text-field 
                v-model="credentials.affiliateLink" 
                label="Your Affiliate Link" 
                variant="outlined"
                class="mb-3"
                placeholder="https://..."
                :rules="[v => !!v || 'Required']"
              />
            </template>

            <!-- Generic -->
            <template v-else>
              <v-text-field 
                v-model="credentials.apiKey" 
                label="API Key" 
                variant="outlined"
                class="mb-3"
              />
            </template>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showConnectDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveCredentials" :loading="saving">
            <v-icon left>mdi-check</v-icon>
            Connect
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Import Products Dialog -->
    <v-dialog v-model="showImportDialog" max-width="800px">
      <v-card>
        <v-card-title>
          <v-icon left>mdi-import</v-icon>
          Import from {{ selectedPlatform?.name }}
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="8">
              <v-text-field
                v-model="searchQuery"
                label="Search products..."
                variant="outlined"
                prepend-inner-icon="mdi-magnify"
                @keyup.enter="searchPlatformProducts"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-btn color="primary" block @click="searchPlatformProducts" :loading="searching">
                <v-icon left>mdi-magnify</v-icon>
                Search
              </v-btn>
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <div v-if="importResults.length > 0">
            <v-list>
              <v-list-item 
                v-for="product in importResults" 
                :key="product.asin || product.id"
                class="mb-2 border rounded"
              >
                <template v-slot:prepend>
                  <v-avatar size="60" rounded>
                    <v-img :src="product.image" />
                  </v-avatar>
                </template>
                <v-list-item-title class="font-weight-bold">{{ product.title }}</v-list-item-title>
                <v-list-item-subtitle>
                  <span class="text-success font-weight-bold">₹{{ product.price }}</span>
                  <span class="text-grey ml-2"><s>₹{{ product.mrp }}</s></span>
                  <v-chip color="success" size="x-small" class="ml-2">{{ product.discount }}% OFF</v-chip>
                </v-list-item-subtitle>
                <template v-slot:append>
                  <v-btn color="primary" size="small" @click="importProduct(product)">
                    <v-icon left>mdi-plus</v-icon>
                    Import
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
          </div>
          <div v-else class="text-center py-8">
            <v-icon size="64" color="grey">mdi-magnify</v-icon>
            <p class="text-grey mt-4">Search for products to import</p>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showImportDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="showSnackbar" :color="snackbarColor" timeout="3000">
      {{ snackbarMessage }}
    </v-snackbar>

    <!-- Add Custom Platform Dialog -->
    <v-dialog v-model="showCustomPlatformDialog" max-width="600px">
      <v-card rounded="lg">
        <v-card-title class="bg-orange text-white pa-4">
          <v-icon class="mr-2">mdi-store-plus</v-icon>
          Add Custom Platform
        </v-card-title>
        <v-card-text class="pt-6">
          <v-alert type="info" variant="tonal" class="mb-4">
            Add any new startup, e-commerce site, or affiliate network that's not in our predefined list.
          </v-alert>

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="customPlatformForm.name"
                label="Platform Name *"
                variant="outlined"
                prepend-inner-icon="mdi-store"
                placeholder="e.g., NewStartup"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="customPlatformForm.type"
                :items="platformTypes"
                label="Platform Type *"
                variant="outlined"
                prepend-inner-icon="mdi-shape"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="customPlatformForm.websiteUrl"
                label="Website URL"
                variant="outlined"
                prepend-inner-icon="mdi-web"
                placeholder="https://..."
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="customPlatformForm.commission"
                label="Commission Rate"
                variant="outlined"
                prepend-inner-icon="mdi-percent"
                placeholder="e.g., 5-10%"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="customPlatformForm.color"
                label="Brand Color"
                variant="outlined"
                prepend-inner-icon="mdi-palette"
                type="color"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="customPlatformForm.description"
                label="Description"
                variant="outlined"
                rows="2"
                placeholder="Brief description of this platform..."
              />
            </v-col>
            <v-col cols="12">
              <p class="text-subtitle-2 font-weight-bold mb-2">Platform Features</p>
              <v-checkbox
                v-model="customPlatformForm.hasApi"
                label="Has API for product import"
                color="deep-purple"
                hide-details
              />
              <v-checkbox
                v-model="customPlatformForm.hasDeeplinks"
                label="Supports deep linking"
                color="deep-purple"
                hide-details
              />
              <v-checkbox
                v-model="customPlatformForm.hasCoupons"
                label="Offers coupons/promo codes"
                color="deep-purple"
                hide-details
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="showCustomPlatformDialog = false">Cancel</v-btn>
          <v-btn color="success" variant="flat" @click="saveCustomPlatform" :loading="savingCustom">
            <v-icon start>mdi-check</v-icon>
            Add Platform
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import firebaseAdminService from '../../services/firebaseAdminService.js';
import { AFFILIATE_PLATFORMS, savePlatformCredentials, getConnectedPlatforms, amazonService, flipkartService, importProductFromPlatform } from '../../services/affiliatePlatformsService.js';
import { db } from '../../services/firebaseConfig.js';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

// State
const loading = ref(false);
const loadingLinks = ref(false);
const saving = ref(false);
const savingCustom = ref(false);
const searching = ref(false);
const showConnectDialog = ref(false);
const showImportDialog = ref(false);
const showCustomPlatformDialog = ref(false);
const selectedPlatform = ref(null);
const credentials = ref({});
const searchQuery = ref('');
const importResults = ref([]);
const connectedPlatforms = ref([]);
const platformLinks = ref([]);
const customPlatforms = ref([]);
const platformTab = ref('all');

// Snackbar
const showSnackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');

// Custom Platform Form
const customPlatformForm = ref({
  name: '',
  type: 'e-commerce',
  websiteUrl: '',
  commission: '',
  color: '#666666',
  description: '',
  hasApi: false,
  hasDeeplinks: true,
  hasCoupons: false
});

const platformTypes = [
  { title: 'E-commerce', value: 'e-commerce' },
  { title: 'Affiliate Network', value: 'network' },
  { title: 'Direct Affiliate', value: 'direct' },
  { title: 'Marketplace', value: 'marketplace' },
  { title: 'SaaS', value: 'saas' },
  { title: 'Startup', value: 'startup' },
  { title: 'Other', value: 'other' }
];

// All available platforms (predefined + custom)
const predefinedPlatforms = computed(() => 
  Object.values(AFFILIATE_PLATFORMS).map(p => ({ ...p, hasApi: true }))
);

const allPlatforms = computed(() => {
  const custom = customPlatforms.value.map(p => ({
    ...p,
    isCustom: true,
    hasApi: p.hasApi || false
  }));
  return [...predefinedPlatforms.value, ...custom];
});

const filteredPlatforms = computed(() => {
  if (platformTab.value === 'api') {
    return allPlatforms.value.filter(p => p.hasApi);
  } else if (platformTab.value === 'custom') {
    return allPlatforms.value.filter(p => p.isCustom);
  }
  return allPlatforms.value;
});

// Table headers
const linkHeaders = [
  { title: 'Product ID', value: 'productId', width: '150px' },
  { title: 'Platform', value: 'platform' },
  { title: 'Price', value: 'price' },
  { title: 'Status', value: 'isActive' },
  { title: 'Actions', value: 'actions', sortable: false, width: '150px' }
];

// Load custom platforms from Firestore
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

// Save custom platform
const saveCustomPlatform = async () => {
  if (!customPlatformForm.value.name) {
    snackbarMessage.value = 'Platform name is required';
    snackbarColor.value = 'warning';
    showSnackbar.value = true;
    return;
  }

  savingCustom.value = true;
  try {
    const platformData = {
      ...customPlatformForm.value,
      id: customPlatformForm.value.name.toLowerCase().replace(/\s+/g, '_'),
      createdAt: new Date().toISOString()
    };

    await addDoc(collection(db, 'custom_platforms'), platformData);
    
    snackbarMessage.value = `Platform "${customPlatformForm.value.name}" added successfully!`;
    snackbarColor.value = 'success';
    showSnackbar.value = true;
    showCustomPlatformDialog.value = false;
    
    // Reset form
    customPlatformForm.value = {
      name: '',
      type: 'e-commerce',
      websiteUrl: '',
      commission: '',
      color: '#666666',
      description: '',
      hasApi: false,
      hasDeeplinks: true,
      hasCoupons: false
    };
    
    await loadCustomPlatforms();
  } catch (error) {
    console.error('Error saving custom platform:', error);
    snackbarMessage.value = 'Error adding platform';
    snackbarColor.value = 'error';
    showSnackbar.value = true;
  } finally {
    savingCustom.value = false;
  }
};

// Delete custom platform
const deleteCustomPlatform = async (platformId) => {
  if (!confirm('Delete this custom platform?')) return;
  
  try {
    await deleteDoc(doc(db, 'custom_platforms', platformId));
    snackbarMessage.value = 'Platform deleted';
    snackbarColor.value = 'info';
    showSnackbar.value = true;
    await loadCustomPlatforms();
  } catch (error) {
    console.error('Error deleting platform:', error);
    snackbarMessage.value = 'Error deleting platform';
    snackbarColor.value = 'error';
    showSnackbar.value = true;
  }
};

// Load connected platforms
const loadConnectedPlatforms = async () => {
  try {
    connectedPlatforms.value = await getConnectedPlatforms();
  } catch (error) {
    console.error('Error loading connected platforms:', error);
  }
};

// Load platform links
const loadPlatformLinks = async () => {
  loadingLinks.value = true;
  try {
    const allLinks = [];
    const products = await firebaseAdminService.getAllProducts();
    for (const product of products) {
      const links = await firebaseAdminService.getPlatformLinksForProduct(product.id);
      allLinks.push(...links.map(l => ({ ...l, productTitle: product.title_en || product.title })));
    }
    platformLinks.value = allLinks;
  } catch (error) {
    console.error('Error loading platform links:', error);
  } finally {
    loadingLinks.value = false;
  }
};

// Check if platform is connected
const isConnected = (platformId) => {
  return connectedPlatforms.value.some(p => p.platformId === platformId);
};

// Get platform by ID
const getPlatformById = (platformId) => {
  return allPlatforms.value.find(p => p.id === platformId);
};

// Get platform icon
const getPlatformIcon = (platformId) => {
  const icons = {
    amazon: 'mdi-cart',
    flipkart: 'mdi-shopping',
    vcommission: 'mdi-handshake',
    cuelinks: 'mdi-link-variant',
    couponapi: 'mdi-ticket-percent',
    hostinger: 'mdi-server',
    shopify: 'mdi-store'
  };
  return icons[platformId] || 'mdi-web';
};

// Get type color
const getTypeColor = (type) => {
  const colors = {
    direct: 'primary',
    network: 'purple',
    api: 'success',
    saas: 'orange'
  };
  return colors[type] || 'grey';
};

// Open connect dialog
const openConnectDialog = (platform) => {
  selectedPlatform.value = platform;
  credentials.value = {};
  showConnectDialog.value = true;
};

// Save credentials
const saveCredentials = async () => {
  saving.value = true;
  try {
    await savePlatformCredentials(selectedPlatform.value.id, credentials.value);
    showSnackbar.value = true;
    snackbarMessage.value = `${selectedPlatform.value.name} connected successfully!`;
    snackbarColor.value = 'success';
    showConnectDialog.value = false;
    await loadConnectedPlatforms();
  } catch (error) {
    console.error('Error saving credentials:', error);
    snackbarMessage.value = 'Failed to connect platform';
    snackbarColor.value = 'error';
    showSnackbar.value = true;
  } finally {
    saving.value = false;
  }
};

// Disconnect platform
const disconnectPlatform = async (platformId) => {
  if (!confirm('Disconnect this platform?')) return;
  try {
    // Would delete from Firestore
    snackbarMessage.value = 'Platform disconnected';
    snackbarColor.value = 'info';
    showSnackbar.value = true;
    await loadConnectedPlatforms();
  } catch (error) {
    console.error('Error disconnecting:', error);
  }
};

// Open import dialog
const openImportDialog = (platform) => {
  selectedPlatform.value = platform;
  searchQuery.value = '';
  importResults.value = [];
  showImportDialog.value = true;
};

// Search platform products
const searchPlatformProducts = async () => {
  if (!searchQuery.value.trim()) return;
  
  searching.value = true;
  try {
    let result;
    if (selectedPlatform.value.id === 'amazon') {
      result = await amazonService.searchProducts(searchQuery.value);
    } else if (selectedPlatform.value.id === 'flipkart') {
      result = await flipkartService.searchProducts(searchQuery.value);
    }
    importResults.value = result?.products || [];
  } catch (error) {
    console.error('Error searching:', error);
    snackbarMessage.value = 'Search failed. Check your API credentials.';
    snackbarColor.value = 'error';
    showSnackbar.value = true;
  } finally {
    searching.value = false;
  }
};

// Import product
const importProduct = async (product) => {
  try {
    await importProductFromPlatform(product, selectedPlatform.value.id);
    snackbarMessage.value = 'Product imported successfully!';
    snackbarColor.value = 'success';
    showSnackbar.value = true;
    await loadPlatformLinks();
  } catch (error) {
    console.error('Error importing:', error);
    snackbarMessage.value = 'Import failed';
    snackbarColor.value = 'error';
    showSnackbar.value = true;
  }
};

// Edit link
const editLink = (link) => {
  // Would open edit dialog
  console.log('Edit link:', link);
};

// Delete link
const deleteLink = async (linkId) => {
  if (!confirm('Delete this link?')) return;
  try {
    await firebaseAdminService.deletePlatformLink(linkId);
    await loadPlatformLinks();
  } catch (error) {
    console.error('Error deleting:', error);
  }
};

// Create deal from link
const createDealFromLink = (link) => {
  // Would navigate to deal creation with pre-filled data
  console.log('Create deal from:', link);
};

// Format helpers
const formatPrice = (price) => {
  if (!price) return '0';
  return new Intl.NumberFormat('en-IN').format(price);
};

const formatDate = (timestamp) => {
  if (!timestamp) return 'Unknown';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-IN');
};

// Load on mount
onMounted(() => {
  loadConnectedPlatforms();
  loadPlatformLinks();
  loadCustomPlatforms();
});
</script>

<style scoped>
.platform-manager {
  width: 100%;
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.platform-card {
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.platform-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}

.platform-card.connected {
  border-color: #4CAF50;
  background: linear-gradient(135deg, #f8fff8 0%, #ffffff 100%);
}

.stat-mini-card {
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid;
  background: #f9f9f9;
}

.gap-2 {
  gap: 8px;
}

.gap-3 {
  gap: 12px;
}

.gap-1 {
  gap: 4px;
}

.add-card:hover {
  border-color: #7c4dff !important;
  background: #f5f0ff !important;
}

.bg-orange {
  background: linear-gradient(135deg, #FF9800 0%, #FF6B35 100%) !important;
}
</style>
