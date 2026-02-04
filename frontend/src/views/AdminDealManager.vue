<template>
  <div class="admin-deal-manager">
    <!-- Header -->
    <div class="manager-header">
      <h1>Deal Management</h1>
      <p class="subtitle">Create, edit, and manage all your deals</p>
    </div>

    <!-- Tabs -->
    <v-tabs v-model="activeTab" class="mb-6">
      <v-tab value="list">
        <v-icon left>mdi-list-box</v-icon>
        All Deals
      </v-tab>
      <v-tab value="create">
        <v-icon left>mdi-plus-circle</v-icon>
        New Deal
      </v-tab>
      <v-tab value="analytics">
        <v-icon left>mdi-chart-line</v-icon>
        Analytics
      </v-tab>
    </v-tabs>

    <!-- TAB 1: List of deals -->
    <v-tab-windows v-model="activeTab">
      <v-window-item value="list">
        <!-- Filters -->
        <v-card class="mb-4">
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6" md="3">
                <v-text-field
                  v-model="filters.search"
                  label="Search deals..."
                  prepend-icon="mdi-magnify"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-select
                  v-model="filters.status"
                  :items="statusOptions"
                  label="Status"
                  prepend-icon="mdi-filter"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-select
                  v-model="filters.category"
                  :items="categories"
                  label="Category"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-btn
                  @click="fetchDeals"
                  color="primary"
                  block
                >
                  <v-icon left>mdi-refresh</v-icon>
                  Refresh
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Deals table -->
        <v-card>
          <v-data-table
            :headers="tableHeaders"
            :items="deals"
            :loading="isLoading"
            :items-per-page="10"
            class="elevation-0"
          >
            <!-- Title column -->
            <template #[`item.title`]="{ item }">
              <div class="text-truncate" style="max-width: 200px">
                {{ item.title }}
              </div>
            </template>

            <!-- Price column -->
            <template #[`item.prices`]="{ item }">
              <div class="font-weight-bold">₹{{ formatPrice(item.dealPrice) }}</div>
              <div class="text-caption text-grey">
                <s>₹{{ formatPrice(item.originalPrice) }}</s>
              </div>
            </template>

            <!-- Status column -->
            <template #[`item.status`]="{ item }">
              <v-chip
                :color="getStatusColor(item.status)"
                text-color="white"
                size="small"
              >
                {{ item.status }}
              </v-chip>
            </template>

            <!-- Metrics column -->
            <template #[`item.metrics`]="{ item }">
              <div class="text-caption">
                <div>
                  <v-icon size="14" color="primary">mdi-eye</v-icon>
                  {{ item.clicks || 0 }} clicks
                </div>
                <div>
                  <v-icon size="14" color="success">mdi-checkbox-marked-circle</v-icon>
                  {{ item.conversions || 0 }} conversions
                </div>
              </div>
            </template>

            <!-- Actions column -->
            <template #[`item.actions`]="{ item }">
              <v-menu>
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon
                    size="small"
                    variant="plain"
                  >
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>

                <v-list>
                  <v-list-item
                    @click="editDeal(item)"
                    prepend-icon="mdi-pencil"
                  >
                    <v-list-item-title>Edit</v-list-item-title>
                  </v-list-item>

                  <v-list-item
                    @click="viewAnalytics(item)"
                    prepend-icon="mdi-chart-line"
                  >
                    <v-list-item-title>Analytics</v-list-item-title>
                  </v-list-item>

                  <v-divider class="my-2" />

                  <v-list-item
                    @click="deleteDeal(item)"
                    prepend-icon="mdi-delete"
                    class="text-error"
                  >
                    <v-list-item-title>Delete</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </template>

            <!-- Empty state -->
            <template #no-data>
              <div class="text-center py-8">
                <v-icon size="48" color="grey">mdi-inbox</v-icon>
                <p class="mt-4 text-grey">No deals found</p>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-window-item>

      <!-- TAB 2: Create new deal -->
      <v-window-item value="create">
        <v-card>
          <v-card-text>
            <v-form @submit.prevent="handleCreateDeal" ref="dealForm">
              <v-row>
                <!-- Title -->
                <v-col cols="12">
                  <v-text-field
                    v-model="newDeal.title"
                    label="Deal Title"
                    hint="e.g., 50% Off Samsung Laptop"
                    :rules="[v => !!v || 'Title is required', v => v.length >= 3 || 'Title must be at least 3 characters']"
                    variant="outlined"
                  />
                </v-col>

                <!-- Description -->
                <v-col cols="12">
                  <v-textarea
                    v-model="newDeal.description"
                    label="Description"
                    hint="Brief description of the deal"
                    rows="3"
                    variant="outlined"
                  />
                </v-col>

                <!-- Image URL -->
                <v-col cols="12">
                  <v-text-field
                    v-model="newDeal.image"
                    label="Image URL"
                    type="url"
                    variant="outlined"
                  />
                  <div v-if="newDeal.image" class="mt-4">
                    <img :src="newDeal.image" class="rounded" style="max-width: 200px; max-height: 200px" />
                  </div>
                </v-col>

                <!-- Pricing row -->
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="newDeal.originalPrice"
                    label="Original Price (₹)"
                    type="number"
                    :rules="[v => !!v || 'Original price is required']"
                    variant="outlined"
                  />
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="newDeal.dealPrice"
                    label="Deal Price (₹)"
                    type="number"
                    :rules="[v => !!v || 'Deal price is required', v => v < newDeal.originalPrice || 'Deal price must be less than original']"
                    variant="outlined"
                  />
                  <div class="text-caption text-success mt-2" v-if="calculateDiscount() > 0">
                    Discount: {{ calculateDiscount() }}% OFF
                  </div>
                </v-col>

                <!-- Category and Platform row -->
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="newDeal.category"
                    :items="categories"
                    label="Category"
                    :rules="[v => !!v || 'Category is required']"
                    variant="outlined"
                  />
                </v-col>

                <v-col cols="12" sm="6">
                  <v-select
                    v-model="newDeal.platform"
                    :items="platforms"
                    label="Platform"
                    :rules="[v => !!v || 'Platform is required']"
                    variant="outlined"
                  />
                </v-col>

                <!-- Tags -->
                <v-col cols="12">
                  <v-combobox
                    v-model="newDeal.tags"
                    label="Tags"
                    hint="Press Enter to add tags"
                    chips
                    multiple
                    variant="outlined"
                  />
                </v-col>

                <!-- Affiliate URL -->
                <v-col cols="12">
                  <v-text-field
                    v-model="newDeal.affiliateUrl"
                    label="Affiliate URL"
                    type="url"
                    :rules="[v => !!v || 'Affiliate URL is required', v => isValidUrl(v) || 'Invalid URL format']"
                    variant="outlined"
                  />
                </v-col>

                <!-- Affiliate settings row -->
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="newDeal.affiliateNetwork"
                    :items="affiliateNetworks"
                    label="Affiliate Network"
                    variant="outlined"
                  />
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="newDeal.affiliateCommissionRate"
                    label="Commission Rate (%)"
                    type="number"
                    min="0"
                    max="100"
                    variant="outlined"
                  />
                </v-col>

                <!-- Expiry date -->
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="newDeal.expiresAt"
                    label="Expiry Date"
                    type="date"
                    variant="outlined"
                  />
                </v-col>

                <!-- Visibility toggle -->
                <v-col cols="12" sm="6">
                  <v-switch
                    v-model="newDeal.isVisibleOnHomepage"
                    label="Show on Homepage"
                    class="mt-4"
                  />
                </v-col>

                <!-- Buttons -->
                <v-col cols="12">
                  <v-row>
                    <v-col cols="12" sm="6">
                      <v-btn
                        @click="clearForm"
                        variant="outlined"
                        color="grey"
                        block
                      >
                        Clear
                      </v-btn>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-btn
                        type="submit"
                        color="primary"
                        block
                        :loading="isCreating"
                      >
                        <v-icon left>mdi-plus</v-icon>
                        Create Deal
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-window-item>

      <!-- TAB 3: Analytics -->
      <v-window-item value="analytics">
        <v-row>
          <!-- Summary cards -->
          <v-col cols="12" sm="6" md="3">
            <v-card class="text-center">
              <v-card-text>
                <div class="text-grey text-caption">Total Deals</div>
                <div class="text-h4 font-weight-bold">{{ deals.length }}</div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-card class="text-center">
              <v-card-text>
                <div class="text-grey text-caption">Total Clicks</div>
                <div class="text-h4 font-weight-bold text-primary">
                  {{ totalClicks }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-card class="text-center">
              <v-card-text>
                <div class="text-grey text-caption">Total Conversions</div>
                <div class="text-h4 font-weight-bold text-success">
                  {{ totalConversions }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-card class="text-center">
              <v-card-text>
                <div class="text-grey text-caption">Total Earnings</div>
                <div class="text-h4 font-weight-bold text-warning">
                  ₹{{ formatPrice(totalEarnings) }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>
    </v-tab-windows>

    <!-- Delete confirmation dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title>Delete Deal?</v-card-title>
        <v-card-text>
          Are you sure you want to delete "{{ dealToDelete?.title }}"?
          This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            @click="deleteDialog = false"
            variant="plain"
          >
            Cancel
          </v-btn>
          <v-btn
            @click="confirmDelete"
            color="error"
            :loading="isDeleting"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success notification -->
    <v-snackbar
      v-model="showSuccess"
      location="bottom-right"
      color="success"
      timeout="3000"
    >
      {{ successMessage }}
    </v-snackbar>

    <!-- Error notification -->
    <v-snackbar
      v-model="showError"
      location="bottom-right"
      color="error"
      timeout="4000"
    >
      {{ errorMessage }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
// Using mock deals for development - switch to dealManagementService when Firestore is configured
import dealManagementService from '@/services/dealManagementService';
import affiliateNetworkService from '@/services/affiliateNetworkService';

// State
const activeTab = ref('list');
const deals = ref([]);
const isLoading = ref(false);
const isCreating = ref(false);
const isDeleting = ref(false);

// Filters
const filters = ref({
  search: '',
  status: 'ACTIVE',
  category: ''
});

// Form
const newDeal = ref(getEmptyDeal());
const dealToDelete = ref(null);
const deleteDialog = ref(false);

// Notifications
const showSuccess = ref(false);
const showError = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

// Data options
const statusOptions = [
  { title: 'All', value: 'all' },
  { title: 'Active', value: 'ACTIVE' },
  { title: 'Archived', value: 'ARCHIVED' },
  { title: 'Expired', value: 'EXPIRED' }
];

const categories = [
  'Electronics',
  'Fashion',
  'Home',
  'Beauty',
  'Sports',
  'Books',
  'Food'
];

const platforms = [
  'Amazon',
  'Flipkart',
  'Myntra',
  'Ajio',
  'SnapDeal',
  'Other'
];

const affiliateNetworks = [
  'Amazon Associates',
  'Flipkart Affiliate',
  'Myntra Affiliate',
  'CPA',
  'Other'
];

const tableHeaders = [
  { title: 'Title', key: 'title', sortable: true },
  { title: 'Price', key: 'prices' },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Metrics', key: 'metrics' },
  { title: 'Actions', key: 'actions', sortable: false }
];

/**
 * Get empty deal object
 */
function getEmptyDeal() {
  return {
    title: '',
    description: '',
    image: '',
    originalPrice: '',
    dealPrice: '',
    category: '',
    platform: '',
    tags: [],
    affiliateUrl: '',
    affiliateNetwork: '',
    affiliateCommissionRate: 5,
    expiresAt: '',
    isVisibleOnHomepage: false
  };
}

/**
 * Format price with Indian number system
 */
function formatPrice(price) {
  if (!price) return '0';
  return new Intl.NumberFormat('en-IN').format(price);
}

/**
 * Validate URL
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Calculate discount percentage
 */
function calculateDiscount() {
  if (!newDeal.value.originalPrice || !newDeal.value.dealPrice) return 0;
  return Math.round(
    ((newDeal.value.originalPrice - newDeal.value.dealPrice) / 
    newDeal.value.originalPrice) * 100
  );
}

/**
 * Get status color
 */
function getStatusColor(status) {
  const colors = {
    active: 'success',
    archived: 'grey',
    expired: 'error',
    deleted: 'error'
  };
  return colors[status] || 'grey';
}

/**
 * Clear form
 */
function clearForm() {
  newDeal.value = getEmptyDeal();
}

/**
 * Fetch all deals
 */
async function fetchDeals() {
  isLoading.value = true;
  try {
    const result = await dealManagementService.getDealsWithFilters({
      status: filters.value.status,
      category: filters.value.category,
      search: filters.value.search
    });
    deals.value = result;
  } catch (error) {
    console.error('❌ Failed to fetch deals:', error);
    showErrorNotification('Failed to load deals');
  } finally {
    isLoading.value = false;
  }
}

/**
 * Handle create deal
 */
async function handleCreateDeal() {
  isCreating.value = true;
  try {
    const deal = await dealManagementService.createDeal(newDeal.value, 'current_admin_id');
    console.log('✅ Deal created:', deal);
    
    showSuccessNotification('Deal created successfully!');
    clearForm();
    
    // Refresh deals list
    await fetchDeals();
    activeTab.value = 'list';
  } catch (error) {
    console.error('❌ Failed to create deal:', error);
    showErrorNotification(error.message || 'Failed to create deal');
  } finally {
    isCreating.value = false;
  }
}

/**
 * Edit deal
 */
function editDeal(deal) {
  console.log('Edit deal:', deal);
  // TODO: Open edit dialog
}

/**
 * View analytics for deal
 */
function viewAnalytics(deal) {
  console.log('View analytics:', deal);
  // TODO: Open analytics modal
}

/**
 * Delete deal
 */
function deleteDeal(deal) {
  dealToDelete.value = deal;
  deleteDialog.value = true;
}

/**
 * Confirm delete
 */
async function confirmDelete() {
  if (!dealToDelete.value) return;

  isDeleting.value = true;
  try {
    await dealManagementService.deleteDeal(
      dealToDelete.value.id,
      'current_admin_id',
      'Admin deletion'
    );
    
    showSuccessNotification('Deal deleted successfully');
    deleteDialog.value = false;
    await fetchDeals();
  } catch (error) {
    console.error('❌ Failed to delete deal:', error);
    showErrorNotification('Failed to delete deal');
  } finally {
    isDeleting.value = false;
  }
}

/**
 * Show success notification
 */
function showSuccessNotification(message) {
  successMessage.value = message;
  showSuccess.value = true;
}

/**
 * Show error notification
 */
function showErrorNotification(message) {
  errorMessage.value = message;
  showError.value = true;
}

/**
 * Computed properties
 */
const totalClicks = computed(() => {
  return deals.value.reduce((sum, deal) => sum + (deal.clicks || 0), 0);
});

const totalConversions = computed(() => {
  return deals.value.reduce((sum, deal) => sum + (deal.conversions || 0), 0);
});

const totalEarnings = computed(() => {
  return deals.value.reduce((sum, deal) => sum + (deal.earnings || 0), 0);
});

/**
 * Load deals on mount
 */
onMounted(async () => {
  await fetchDeals();
});
</script>

<style scoped>
.admin-deal-manager {
  padding: 24px;
}

.manager-header {
  margin-bottom: 32px;
}

.manager-header h1 {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 8px;
}

.subtitle {
  color: rgba(0, 0, 0, 0.6);
  font-size: 16px;
  margin: 0;
}

:deep(.v-data-table) {
  background: white;
  border-radius: 8px;
}

:deep(.v-tab) {
  text-transform: none;
  font-weight: 500;
}
</style>
