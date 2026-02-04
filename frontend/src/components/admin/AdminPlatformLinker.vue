<template>
  <div class="platform-linker">
    <!-- Platform Selection -->
    <div class="mb-4">
      <v-row>
        <v-col cols="12" sm="6">
          <v-select
            v-model="selectedPlatform"
            :items="availablePlatforms"
            label="Select Platform"
            item-title="label"
            item-value="value"
            @update:modelValue="resetPlatformForm"
          />
        </v-col>
        <v-col cols="12" sm="6">
          <v-btn
            color="primary"
            @click="addPlatformLink"
            :disabled="!selectedPlatform"
            block
          >
            Add {{ selectedPlatform }}
          </v-btn>
        </v-col>
      </v-row>
    </div>

    <!-- Platform Form -->
    <v-card v-if="selectedPlatform" class="mb-4" elevation="2">
      <v-card-title>Link {{ selectedPlatform }}</v-card-title>
      <v-card-text>
        <!-- For Amazon: ASIN -->
        <v-text-field
          v-if="selectedPlatform === 'amazon'"
          v-model="platformForm.externalId"
          label="ASIN"
          hint="Amazon Standard Identification Number"
          class="mb-3"
        />

        <!-- For Flipkart: SKU or URL -->
        <v-text-field
          v-if="selectedPlatform === 'flipkart'"
          v-model="platformForm.externalId"
          label="Product SKU (optional)"
          class="mb-3"
        />

        <!-- Product URL -->
        <v-text-field
          v-model="platformForm.productUrl"
          label="Product URL"
          type="url"
          required
          class="mb-3"
        />

        <!-- Affiliate URL -->
        <v-text-field
          v-model="platformForm.affiliateUrl"
          label="Affiliate URL"
          type="url"
          hint="URL with your affiliate link"
          required
          class="mb-3"
        />

        <!-- Price -->
        <v-text-field
          v-model.number="platformForm.price"
          label="Current Price (₹)"
          type="number"
          required
          class="mb-3"
        />

        <!-- API Sync Option (for Amazon/Flipkart) -->
        <v-checkbox
          v-if="selectedPlatform === 'amazon' || selectedPlatform === 'flipkart'"
          v-model="enableApiSync"
          label="Enable automatic price sync via API"
        />

        <!-- Active Status -->
        <v-checkbox
          v-model="platformForm.isActive"
          label="Active"
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="selectedPlatform = null">Cancel</v-btn>
        <v-btn color="success" @click="savePlatformLink" :loading="saving">
          Save Link
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Existing Platform Links -->
    <div v-if="platformLinks.length > 0">
      <h4 class="mb-3">Linked Platforms</h4>
      
      <v-table>
        <thead>
          <tr class="bg-grey-lighten-4">
            <th>Platform</th>
            <th>Product URL</th>
            <th>Price</th>
            <th>Last Synced</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="link in platformLinks" :key="link.id">
            <td>
              <v-chip size="small" :color="getPlatformColor(link.platform)">
                {{ link.platform.toUpperCase() }}
              </v-chip>
            </td>
            <td>
              <a :href="link.productUrl" target="_blank" class="text-truncate">
                View →
              </a>
            </td>
            <td>₹{{ link.price }}</td>
            <td>{{ formatDate(link.lastSyncedAt) }}</td>
            <td>
              <v-chip
                :color="link.isActive ? 'success' : 'error'"
                size="small"
              >
                {{ link.isActive ? 'Active' : 'Inactive' }}
              </v-chip>
            </td>
            <td>
              <v-btn
                size="small"
                icon
                color="primary"
                @click="editPlatformLink(link)"
              >
                <v-icon small>mdi-pencil</v-icon>
              </v-btn>
              
              <v-btn
                v-if="(link.platform === 'amazon' || link.platform === 'flipkart') && link.externalId"
                size="small"
                icon
                color="info"
                @click="syncPlatformPrice(link)"
                :loading="syncingLinks.includes(link.id)"
                title="Sync Price"
              >
                <v-icon small>mdi-sync</v-icon>
              </v-btn>

              <v-btn
                size="small"
                icon
                color="error"
                @click="deletePlatformLink(link.id)"
              >
                <v-icon small>mdi-trash-can</v-icon>
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-6">
      <v-icon class="mb-2" size="large" color="grey">mdi-link-off</v-icon>
      <p class="text-grey">No platforms linked yet. Add one to get started!</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import firebaseAdminService from '../../services/firebaseAdminService.js';

const props = defineProps({
  productId: String,
  product: Object,
});

const selectedPlatform = ref(null);
const platformLinks = ref([]);
const saving = ref(false);
const syncingLinks = ref([]);
const enableApiSync = ref(false);

const availablePlatforms = [
  { label: 'Amazon', value: 'amazon' },
  { label: 'Flipkart', value: 'flipkart' },
  { label: 'Myntra', value: 'myntra' },
  { label: 'Meesho', value: 'meesho' },
  { label: 'AJIO', value: 'ajio' },
  { label: 'TataCliq', value: 'tatacliq' },
  { label: 'Other', value: 'generic' },
];

const platformForm = ref({
  externalId: '',
  productUrl: '',
  affiliateUrl: '',
  price: 0,
  isActive: true,
});

const resetPlatformForm = () => {
  platformForm.value = {
    externalId: '',
    productUrl: '',
    affiliateUrl: '',
    price: 0,
    isActive: true,
  };
  enableApiSync.value = false;
};

const loadPlatformLinks = async () => {
  try {
    platformLinks.value = await firebaseAdminService.getPlatformLinksForProduct(props.productId);
  } catch (error) {
    console.error('Error loading platform links:', error);
  }
};

const savePlatformLink = async () => {
  if (!platformForm.value.productUrl || !platformForm.value.affiliateUrl || !platformForm.value.price) {
    alert('Please fill in all required fields');
    return;
  }

  saving.value = true;
  try {
    const linkData = {
      productId: props.productId,
      platform: selectedPlatform.value,
      externalId: platformForm.value.externalId || null,
      productUrl: platformForm.value.productUrl,
      affiliateUrl: platformForm.value.affiliateUrl,
      price: platformForm.value.price,
      isActive: platformForm.value.isActive,
      enableApiSync: enableApiSync.value,
    };

    await firebaseAdminService.addPlatformLink(linkData);
    
    selectedPlatform.value = null;
    resetPlatformForm();
    await loadPlatformLinks();
  } catch (error) {
    console.error('Error saving platform link:', error);
    alert('Error saving platform link');
  } finally {
    saving.value = false;
  }
};

const editPlatformLink = (link) => {
  selectedPlatform.value = link.platform;
  platformForm.value = { ...link };
  enableApiSync.value = link.enableApiSync || false;
};

const deletePlatformLink = async (linkId) => {
  if (!confirm('Delete this platform link?')) {
    return;
  }

  try {
    await firebaseAdminService.deletePlatformLink(linkId);
    await loadPlatformLinks();
  } catch (error) {
    console.error('Error deleting platform link:', error);
    alert('Error deleting platform link');
  }
};

const syncPlatformPrice = async (link) => {
  syncingLinks.value.push(link.id);
  try {
    // This would call the backend cron API or trigger a cloud function
    console.log('Syncing price for:', link.platform, link.externalId);
    // await apiSyncService.syncPrice(link.platform, link.externalId);
    alert('Price sync initiated (feature coming soon)');
    await loadPlatformLinks();
  } catch (error) {
    console.error('Error syncing price:', error);
    alert('Error syncing price');
  } finally {
    syncingLinks.value = syncingLinks.value.filter(id => id !== link.id);
  }
};

const getPlatformColor = (platform) => {
  const colors = {
    amazon: 'orange',
    flipkart: 'blue',
    myntra: 'pink',
    meesho: 'purple',
    ajio: 'indigo',
    tatacliq: 'cyan',
    generic: 'grey',
  };
  return colors[platform] || 'grey';
};

const formatDate = (date) => {
  if (!date) return 'Never';
  if (date.toDate) return date.toDate().toLocaleDateString();
  return new Date(date).toLocaleDateString();
};

onMounted(() => {
  loadPlatformLinks();
});
</script>

<style scoped>
.platform-linker {
  width: 100%;
}

.bg-grey-lighten-4 {
  background-color: #f5f5f5;
}

.text-truncate {
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  text-decoration: none;
  color: #1976d2;
}

.text-truncate:hover {
  text-decoration: underline;
}

v-table {
  width: 100%;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

th {
  font-weight: 600;
  background-color: #f5f5f5;
}

tr:hover {
  background-color: #fafafa;
}
</style>
