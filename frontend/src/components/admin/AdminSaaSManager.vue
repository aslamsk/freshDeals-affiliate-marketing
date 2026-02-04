<template>
  <div class="saas-manager">
    <!-- Header Section -->
    <div class="manager-header mb-6">
      <div>
        <h3 class="text-h5 font-weight-bold">SaaS Affiliate Programs</h3>
        <p class="text-grey-darken-1 text-body-2 mt-1">Manage your high-value SaaS affiliate partnerships</p>
      </div>
      <v-btn 
        color="success" 
        prepend-icon="mdi-plus" 
        @click="showAddDialog = true"
      >
        Add SaaS Link
      </v-btn>
    </div>

    <!-- Stats Cards -->
    <v-row class="mb-6">
      <v-col cols="12" md="3">
        <v-card class="stat-card pa-4" rounded="lg">
          <div class="d-flex align-center">
            <v-avatar color="green-lighten-4" size="48" class="mr-3">
              <v-icon color="green-darken-2">mdi-link-variant</v-icon>
            </v-avatar>
            <div>
              <p class="text-h5 font-weight-bold mb-0">{{ totalLinks }}</p>
              <p class="text-caption text-grey">Total Links</p>
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
              <p class="text-h5 font-weight-bold mb-0">{{ activeLinks }}</p>
              <p class="text-caption text-grey">Active</p>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="stat-card pa-4" rounded="lg">
          <div class="d-flex align-center">
            <v-avatar color="orange-lighten-4" size="48" class="mr-3">
              <v-icon color="orange-darken-2">mdi-cursor-default-click</v-icon>
            </v-avatar>
            <div>
              <p class="text-h5 font-weight-bold mb-0">{{ totalClicks }}</p>
              <p class="text-caption text-grey">Total Clicks</p>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="stat-card pa-4" rounded="lg">
          <div class="d-flex align-center">
            <v-avatar color="purple-lighten-4" size="48" class="mr-3">
              <v-icon color="purple-darken-2">mdi-currency-inr</v-icon>
            </v-avatar>
            <div>
              <p class="text-h5 font-weight-bold mb-0">₹{{ estimatedEarnings }}</p>
              <p class="text-caption text-grey">Est. Earnings</p>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- SaaS Programs Grid -->
    <h4 class="text-h6 mb-4">Available SaaS Programs</h4>
    <v-row class="mb-6">
      <v-col 
        v-for="program in saasPrograms" 
        :key="program.id" 
        cols="12" 
        md="4"
      >
        <v-card 
          class="saas-card pa-4" 
          rounded="lg"
          :style="{ borderTop: `4px solid ${program.color}` }"
        >
          <div class="d-flex align-center mb-3">
            <v-avatar :color="program.color" size="48" class="mr-3">
              <v-icon color="white">{{ program.icon }}</v-icon>
            </v-avatar>
            <div>
              <h5 class="font-weight-bold">{{ program.name }}</h5>
              <p class="text-caption text-grey mb-0">{{ program.category }}</p>
            </div>
          </div>
          
          <v-chip color="success" size="small" class="mb-3">
            {{ program.commission }}
          </v-chip>
          
          <p class="text-body-2 text-grey-darken-1 mb-4">
            {{ program.description }}
          </p>

          <div class="d-flex gap-2">
            <v-btn 
              :color="program.color" 
              variant="flat"
              size="small"
              @click="addProgramLink(program)"
            >
              <v-icon start>mdi-plus</v-icon>
              Add Link
            </v-btn>
            <v-btn 
              variant="outlined"
              size="small"
              @click="openProgramSite(program.signupUrl)"
            >
              <v-icon start>mdi-open-in-new</v-icon>
              Join
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Your SaaS Links Table -->
    <h4 class="text-h6 mb-4">Your SaaS Affiliate Links</h4>
    <v-card rounded="lg" elevation="2">
      <v-data-table
        :headers="headers"
        :items="saasLinks"
        :loading="loading"
        class="saas-table"
      >
        <template v-slot:item.program="{ item }">
          <div class="d-flex align-center">
            <v-avatar 
              :color="getProgramColor(item.programId)" 
              size="32" 
              class="mr-2"
            >
              <v-icon color="white" size="18">{{ getProgramIcon(item.programId) }}</v-icon>
            </v-avatar>
            <span class="font-weight-medium">{{ item.programName }}</span>
          </div>
        </template>

        <template v-slot:item.affiliateLink="{ item }">
          <div class="d-flex align-center">
            <span class="text-truncate" style="max-width: 200px;">
              {{ item.affiliateLink }}
            </span>
            <v-btn 
              icon 
              variant="text" 
              size="x-small" 
              @click="copyLink(item.affiliateLink)"
            >
              <v-icon size="16">mdi-content-copy</v-icon>
            </v-btn>
          </div>
        </template>

        <template v-slot:item.clicks="{ item }">
          <v-chip size="small" color="blue-lighten-4">
            {{ item.clicks || 0 }} clicks
          </v-chip>
        </template>

        <template v-slot:item.status="{ item }">
          <v-switch
            v-model="item.isActive"
            color="success"
            hide-details
            density="compact"
            @change="toggleLinkStatus(item)"
          />
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn size="small" icon variant="text" color="primary" @click="editLink(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn 
            size="small" 
            icon 
            variant="text" 
            color="info" 
            @click="viewAnalytics(item)"
          >
            <v-icon>mdi-chart-line</v-icon>
          </v-btn>
          <v-btn size="small" icon variant="text" color="error" @click="deleteLink(item.id)">
            <v-icon>mdi-trash-can</v-icon>
          </v-btn>
        </template>

        <template v-slot:no-data>
          <div class="py-8 text-center">
            <v-icon size="64" color="grey-lighten-2">mdi-link-off</v-icon>
            <p class="mt-4 text-grey">No SaaS affiliate links yet</p>
            <v-btn color="deep-purple" variant="text" @click="showAddDialog = true">
              Add your first link
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Add/Edit Link Dialog -->
    <v-dialog v-model="showAddDialog" max-width="600px">
      <v-card rounded="lg">
        <v-card-title class="bg-deep-purple text-white pa-4">
          <v-icon class="mr-2">{{ editingLink ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
          {{ editingLink ? 'Edit SaaS Link' : 'Add SaaS Affiliate Link' }}
        </v-card-title>
        <v-card-text class="pt-6">
          <v-row>
            <v-col cols="12">
              <v-select
                v-model="form.programId"
                :items="saasPrograms"
                item-title="name"
                item-value="id"
                label="Select SaaS Program"
                variant="outlined"
                prepend-inner-icon="mdi-application"
                @update:model-value="onProgramSelect"
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template v-slot:prepend>
                      <v-avatar :color="item.raw.color" size="32">
                        <v-icon color="white" size="18">{{ item.raw.icon }}</v-icon>
                      </v-avatar>
                    </template>
                    <v-list-item-subtitle>{{ item.raw.commission }}</v-list-item-subtitle>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="form.affiliateLink"
                label="Your Affiliate Link"
                variant="outlined"
                prepend-inner-icon="mdi-link"
                placeholder="https://..."
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="form.affiliateId"
                label="Affiliate ID / Tracking Code"
                variant="outlined"
                prepend-inner-icon="mdi-identifier"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="form.customLabel"
                label="Custom Label (for your reference)"
                variant="outlined"
                prepend-inner-icon="mdi-tag"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="form.notes"
                label="Notes"
                variant="outlined"
                rows="2"
              />
            </v-col>
            <v-col cols="12">
              <v-checkbox
                v-model="form.isActive"
                label="Active"
                color="success"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="closeDialog">Cancel</v-btn>
          <v-btn color="success" variant="flat" @click="saveLink" :loading="saving">
            <v-icon start>mdi-check</v-icon>
            Save Link
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Analytics Dialog -->
    <v-dialog v-model="showAnalyticsDialog" max-width="600px">
      <v-card rounded="lg">
        <v-card-title class="bg-blue text-white pa-4">
          <v-icon class="mr-2">mdi-chart-line</v-icon>
          Link Analytics
        </v-card-title>
        <v-card-text class="pt-6">
          <div v-if="selectedLink">
            <h5 class="font-weight-bold mb-4">{{ selectedLink.programName }}</h5>
            
            <v-row>
              <v-col cols="6">
                <v-card color="blue-lighten-5" flat class="pa-4 text-center">
                  <p class="text-h4 font-weight-bold text-blue-darken-2">{{ selectedLink.clicks || 0 }}</p>
                  <p class="text-caption">Total Clicks</p>
                </v-card>
              </v-col>
              <v-col cols="6">
                <v-card color="green-lighten-5" flat class="pa-4 text-center">
                  <p class="text-h4 font-weight-bold text-green-darken-2">{{ selectedLink.conversions || 0 }}</p>
                  <p class="text-caption">Conversions</p>
                </v-card>
              </v-col>
              <v-col cols="6">
                <v-card color="orange-lighten-5" flat class="pa-4 text-center">
                  <p class="text-h4 font-weight-bold text-orange-darken-2">
                    {{ selectedLink.conversions && selectedLink.clicks ? ((selectedLink.conversions / selectedLink.clicks) * 100).toFixed(1) : 0 }}%
                  </p>
                  <p class="text-caption">Conversion Rate</p>
                </v-card>
              </v-col>
              <v-col cols="6">
                <v-card color="purple-lighten-5" flat class="pa-4 text-center">
                  <p class="text-h4 font-weight-bold text-purple-darken-2">₹{{ selectedLink.earnings || 0 }}</p>
                  <p class="text-caption">Earnings</p>
                </v-card>
              </v-col>
            </v-row>

            <v-divider class="my-4" />
            
            <p class="text-caption text-grey">
              <v-icon size="14" class="mr-1">mdi-information</v-icon>
              Analytics are updated every 24 hours. Visit the program dashboard for real-time data.
            </p>
          </div>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="showAnalyticsDialog = false">Close</v-btn>
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
import { saasAffiliateService, AFFILIATE_PLATFORMS } from '../../services/affiliatePlatformsService.js';
import { db } from '../../services/firebaseConfig.js';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

// SaaS Programs Configuration
const saasPrograms = ref([
  {
    id: 'hostinger',
    name: 'Hostinger',
    category: 'Web Hosting',
    commission: '60% per sale',
    color: '#673de6',
    icon: 'mdi-server',
    description: 'Premium web hosting with excellent conversion rates. Great for beginners and WordPress users.',
    signupUrl: 'https://www.hostinger.com/affiliates'
  },
  {
    id: 'shopify',
    name: 'Shopify',
    category: 'E-commerce',
    commission: '$150 per referral',
    color: '#95bf47',
    icon: 'mdi-shopping',
    description: 'Leading e-commerce platform. High ticket affiliate program with long cookie duration.',
    signupUrl: 'https://www.shopify.com/affiliates'
  },
  {
    id: 'bluehost',
    name: 'Bluehost',
    category: 'Web Hosting',
    commission: '$65-$130 per sale',
    color: '#003d79',
    icon: 'mdi-web',
    description: 'WordPress recommended hosting. Great for bloggers and small businesses.',
    signupUrl: 'https://www.bluehost.com/affiliates'
  },
  {
    id: 'canva',
    name: 'Canva Pro',
    category: 'Design Tools',
    commission: 'Up to $36 per sale',
    color: '#00c4cc',
    icon: 'mdi-palette',
    description: 'Popular design tool with high conversion. Perfect for creative audiences.',
    signupUrl: 'https://www.canva.com/affiliates/'
  },
  {
    id: 'semrush',
    name: 'SEMrush',
    category: 'SEO Tools',
    commission: '$200 per sale + 40% recurring',
    color: '#ff642d',
    icon: 'mdi-chart-timeline-variant',
    description: 'Premium SEO and marketing toolkit. High-value recurring commissions.',
    signupUrl: 'https://www.semrush.com/kb/781-affiliate-program'
  },
  {
    id: 'notion',
    name: 'Notion',
    category: 'Productivity',
    commission: '50% recurring',
    color: '#000000',
    icon: 'mdi-note-text',
    description: 'All-in-one workspace. Growing user base with recurring commissions.',
    signupUrl: 'https://www.notion.so/affiliates'
  }
]);

const saasLinks = ref([]);
const loading = ref(false);
const saving = ref(false);
const showAddDialog = ref(false);
const showAnalyticsDialog = ref(false);
const editingLink = ref(null);
const selectedLink = ref(null);

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
});

const form = ref({
  programId: '',
  programName: '',
  affiliateLink: '',
  affiliateId: '',
  customLabel: '',
  notes: '',
  isActive: true
});

const headers = [
  { title: 'Program', value: 'program', width: '200px' },
  { title: 'Affiliate Link', value: 'affiliateLink' },
  { title: 'Label', value: 'customLabel', width: '150px' },
  { title: 'Performance', value: 'clicks', width: '120px' },
  { title: 'Active', value: 'status', width: '80px' },
  { title: 'Actions', value: 'actions', sortable: false, width: '140px' }
];

// Computed
const totalLinks = computed(() => saasLinks.value.length);
const activeLinks = computed(() => saasLinks.value.filter(l => l.isActive).length);
const totalClicks = computed(() => saasLinks.value.reduce((sum, l) => sum + (l.clicks || 0), 0));
const estimatedEarnings = computed(() => saasLinks.value.reduce((sum, l) => sum + (l.earnings || 0), 0));

// Methods
const showNotification = (message, color = 'success') => {
  snackbar.value = { show: true, message, color };
};

const getProgramColor = (programId) => {
  const program = saasPrograms.value.find(p => p.id === programId);
  return program?.color || '#666';
};

const getProgramIcon = (programId) => {
  const program = saasPrograms.value.find(p => p.id === programId);
  return program?.icon || 'mdi-application';
};

const copyLink = (link) => {
  navigator.clipboard.writeText(link);
  showNotification('Link copied to clipboard!');
};

const openProgramSite = (url) => {
  window.open(url, '_blank');
};

const onProgramSelect = (programId) => {
  const program = saasPrograms.value.find(p => p.id === programId);
  if (program) {
    form.value.programName = program.name;
  }
};

const addProgramLink = (program) => {
  form.value = {
    programId: program.id,
    programName: program.name,
    affiliateLink: '',
    affiliateId: '',
    customLabel: '',
    notes: '',
    isActive: true
  };
  editingLink.value = null;
  showAddDialog.value = true;
};

const editLink = (link) => {
  editingLink.value = link.id;
  form.value = { ...link };
  showAddDialog.value = true;
};

const viewAnalytics = (link) => {
  selectedLink.value = link;
  showAnalyticsDialog.value = true;
};

const closeDialog = () => {
  showAddDialog.value = false;
  editingLink.value = null;
  form.value = {
    programId: '',
    programName: '',
    affiliateLink: '',
    affiliateId: '',
    customLabel: '',
    notes: '',
    isActive: true
  };
};

const loadSaaSLinks = async () => {
  loading.value = true;
  try {
    const querySnapshot = await getDocs(collection(db, 'saas_affiliate_links'));
    saasLinks.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error loading SaaS links:', error);
    showNotification('Error loading links', 'error');
  } finally {
    loading.value = false;
  }
};

const saveLink = async () => {
  if (!form.value.programId || !form.value.affiliateLink) {
    showNotification('Please select a program and enter your affiliate link', 'warning');
    return;
  }

  saving.value = true;
  try {
    const linkData = {
      ...form.value,
      updatedAt: new Date().toISOString()
    };

    if (editingLink.value) {
      const linkRef = doc(db, 'saas_affiliate_links', editingLink.value);
      await updateDoc(linkRef, linkData);
      showNotification('Link updated successfully!');
    } else {
      linkData.createdAt = new Date().toISOString();
      linkData.clicks = 0;
      linkData.conversions = 0;
      linkData.earnings = 0;
      await addDoc(collection(db, 'saas_affiliate_links'), linkData);
      showNotification('Link added successfully!');
    }

    closeDialog();
    await loadSaaSLinks();
  } catch (error) {
    console.error('Error saving link:', error);
    showNotification('Error saving link', 'error');
  } finally {
    saving.value = false;
  }
};

const toggleLinkStatus = async (link) => {
  try {
    const linkRef = doc(db, 'saas_affiliate_links', link.id);
    await updateDoc(linkRef, { isActive: link.isActive });
    showNotification(`Link ${link.isActive ? 'activated' : 'deactivated'}`);
  } catch (error) {
    showNotification('Error updating status', 'error');
  }
};

const deleteLink = async (linkId) => {
  if (confirm('Delete this affiliate link?')) {
    try {
      await deleteDoc(doc(db, 'saas_affiliate_links', linkId));
      showNotification('Link deleted');
      await loadSaaSLinks();
    } catch (error) {
      showNotification('Error deleting link', 'error');
    }
  }
};

onMounted(() => {
  loadSaaSLinks();
});
</script>

<style scoped>
.saas-manager {
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

.saas-card {
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%;
}

.saas-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.15) !important;
}

.saas-table {
  border-radius: 12px;
}

.gap-2 {
  gap: 8px;
}
</style>
