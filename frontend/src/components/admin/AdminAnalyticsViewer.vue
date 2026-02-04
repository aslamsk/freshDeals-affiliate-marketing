<template>
  <div class="analytics-viewer">
    <!-- Header with Date Range Selector -->
    <v-row class="mb-4 align-center">
      <v-col cols="12" md="8">
        <h2 class="text-h4">💰 Earnings Analytics Dashboard</h2>
        <p class="text-subtitle-2 text-grey">Track your affiliate performance and earnings</p>
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="dateRange"
          :items="dateRangeOptions"
          label="Date Range"
          variant="outlined"
          density="compact"
          @update:model-value="loadAnalytics"
        ></v-select>
      </v-col>
    </v-row>

    <!-- Key Metrics Cards -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="3">
        <v-card color="primary" dark elevation="4">
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-overline">Total Earnings</div>
                <div class="text-h4 font-weight-bold">₹{{ formatNumber(totalEarnings) }}</div>
                <div class="text-caption">{{ estimatedEarnings ? 'Estimated' : 'Actual' }}</div>
              </div>
              <v-icon size="48" class="opacity-50">mdi-cash-multiple</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card color="success" dark elevation="4">
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-overline">Total Clicks</div>
                <div class="text-h4 font-weight-bold">{{ formatNumber(totalClicks) }}</div>
                <div class="text-caption">All time</div>
              </div>
              <v-icon size="48" class="opacity-50">mdi-cursor-default-click</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card color="info" dark elevation="4">
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-overline">Conversions</div>
                <div class="text-h4 font-weight-bold">{{ totalConversions }}</div>
                <div class="text-caption">Estimated sales</div>
              </div>
              <v-icon size="48" class="opacity-50">mdi-shopping</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card color="warning" dark elevation="4">
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-overline">Conversion Rate</div>
                <div class="text-h4 font-weight-bold">{{ conversionRate }}%</div>
                <div class="text-caption">Click to sale</div>
              </div>
              <v-icon size="48" class="opacity-50">mdi-percent</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Earnings by Platform & Category -->
    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-card elevation="2">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-store</v-icon>
            Earnings by Platform
          </v-card-title>
          <v-card-text>
            <div v-if="earningsByPlatform.length === 0" class="text-center py-8 text-grey">
              No platform data yet
            </div>
            <v-list v-else>
              <v-list-item
                v-for="platform in earningsByPlatform"
                :key="platform.name"
              >
                <template v-slot:prepend>
                  <v-avatar :color="platform.color" size="40">
                    <v-icon color="white">{{ platform.icon }}</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title class="font-weight-bold">
                  {{ platform.name }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ platform.clicks }} clicks • {{ platform.conversions }} sales
                </v-list-item-subtitle>
                <template v-slot:append>
                  <div class="text-right">
                    <div class="text-h6 text-success">₹{{ formatNumber(platform.earnings) }}</div>
                    <div class="text-caption">{{ platform.percentage }}%</div>
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card elevation="2">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-tag-multiple</v-icon>
            Earnings by Category
          </v-card-title>
          <v-card-text>
            <div v-if="earningsByCategory.length === 0" class="text-center py-8 text-grey">
              No category data yet
            </div>
            <v-list v-else>
              <v-list-item
                v-for="category in earningsByCategory"
                :key="category.name"
              >
                <template v-slot:prepend>
                  <v-avatar :color="category.color" size="40">
                    <v-icon color="white">{{ category.icon }}</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title class="font-weight-bold">
                  {{ category.name }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ category.clicks }} clicks • {{ category.conversions }} sales
                </v-list-item-subtitle>
                <template v-slot:append>
                  <div class="text-right">
                    <div class="text-h6 text-success">₹{{ formatNumber(category.earnings) }}</div>
                    <div class="text-caption">{{ category.percentage }}%</div>
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Top Performing Deals -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title class="d-flex align-center justify-space-between">
            <div>
              <v-icon class="mr-2">mdi-trophy</v-icon>
              Top Performing Deals
            </div>
            <v-chip color="primary" variant="outlined" size="small">
              Top 10
            </v-chip>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="topDealsHeaders"
              :items="topDeals"
              :loading="loading"
              :items-per-page="10"
              class="elevation-0"
            >
              <template v-slot:item.title="{ item }">
                <div class="d-flex align-center">
                  <v-avatar size="40" class="mr-3">
                    <v-img :src="item.imageUrl || item.image" />
                  </v-avatar>
                  <div>
                    <div class="font-weight-bold">{{ item.title || item.title_en }}</div>
                    <div class="text-caption text-grey">{{ item.platform }}</div>
                  </div>
                </div>
              </template>
              <template v-slot:item.price="{ item }">
                <div>
                  <div class="font-weight-bold">₹{{ formatNumber(item.dealPrice || item.price || 0) }}</div>
                  <div class="text-caption text-grey text-decoration-line-through">
                    ₹{{ formatNumber(item.originalPrice || 0) }}
                  </div>
                </div>
              </template>
              <template v-slot:item.discount="{ item }">
                <v-chip color="success" size="small">
                  {{ item.discount || 0 }}% off
                </v-chip>
              </template>
              <template v-slot:item.clicks="{ item }">
                <v-chip color="info" size="small">
                  {{ item.clicks || 0 }}
                </v-chip>
              </template>
              <template v-slot:item.conversions="{ item }">
                <v-chip color="warning" size="small">
                  {{ item.conversions || 0 }}
                </v-chip>
              </template>
              <template v-slot:item.earnings="{ item }">
                <div class="text-success font-weight-bold">
                  ₹{{ formatNumber(item.earnings || 0) }}
                </div>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Activity & Commission Calculator -->
    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-card elevation="2">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-history</v-icon>
            Recent Activity
          </v-card-title>
          <v-card-text>
            <v-timeline density="compact" align="start">
              <v-timeline-item
                v-for="(activity, index) in recentActivity"
                :key="index"
                :dot-color="activity.color"
                size="small"
              >
                <div class="d-flex align-center justify-space-between">
                  <div>
                    <div class="font-weight-bold">{{ activity.title }}</div>
                    <div class="text-caption text-grey">{{ activity.subtitle }}</div>
                  </div>
                  <div class="text-caption text-grey">{{ activity.time }}</div>
                </div>
              </v-timeline-item>
            </v-timeline>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card elevation="2" color="blue-grey-lighten-5">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-calculator</v-icon>
            Commission Calculator
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model.number="calculator.price"
              label="Product Price (₹)"
              type="number"
              variant="outlined"
              density="compact"
              class="mb-3"
            ></v-text-field>
            <v-text-field
              v-model.number="calculator.rate"
              label="Commission Rate (%)"
              type="number"
              variant="outlined"
              density="compact"
              class="mb-3"
            ></v-text-field>
            <v-text-field
              v-model.number="calculator.sales"
              label="Number of Sales"
              type="number"
              variant="outlined"
              density="compact"
              class="mb-3"
            ></v-text-field>
            <v-divider class="my-3"></v-divider>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-overline">Earnings per Sale</div>
                <div class="text-h5 text-success">₹{{ calculatedCommission }}</div>
              </div>
              <v-icon size="32" color="success">mdi-arrow-right</v-icon>
              <div>
                <div class="text-overline">Total Earnings</div>
                <div class="text-h4 text-primary font-weight-bold">₹{{ totalCalculated }}</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Refresh Button -->
    <v-row>
      <v-col cols="12" class="text-center">
        <v-btn
          color="primary"
          variant="outlined"
          @click="loadAnalytics"
          :loading="loading"
        >
          <v-icon class="mr-2">mdi-refresh</v-icon>
          Refresh Data
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import firebaseAdminService from '../../services/firebaseAdminService.js';

const loading = ref(false);
const dateRange = ref('all');
const dateRangeOptions = [
  { title: 'All Time', value: 'all' },
  { title: 'Today', value: 'today' },
  { title: 'Last 7 Days', value: '7days' },
  { title: 'Last 30 Days', value: '30days' },
  { title: 'This Month', value: 'month' },
];

// Analytics Data
const totalEarnings = ref(0);
const totalClicks = ref(0);
const totalConversions = ref(0);
const estimatedEarnings = ref(true);
const topDeals = ref([]);
const earningsByPlatform = ref([]);
const earningsByCategory = ref([]);
const recentActivity = ref([]);

// Calculator
const calculator = ref({
  price: 10000,
  rate: 5,
  sales: 10,
});

// Computed
const conversionRate = computed(() => {
  if (totalClicks.value === 0) return '0.00';
  return ((totalConversions.value / totalClicks.value) * 100).toFixed(2);
});

const calculatedCommission = computed(() => {
  return formatNumber((calculator.value.price * calculator.value.rate) / 100);
});

const totalCalculated = computed(() => {
  const commission = (calculator.value.price * calculator.value.rate) / 100;
  return formatNumber(commission * calculator.value.sales);
});

// Table headers
const topDealsHeaders = [
  { title: 'Deal', value: 'title', sortable: false },
  { title: 'Price', value: 'price', align: 'right' },
  { title: 'Discount', value: 'discount', align: 'center' },
  { title: 'Clicks', value: 'clicks', align: 'center' },
  { title: 'Sales', value: 'conversions', align: 'center' },
  { title: 'Earnings', value: 'earnings', align: 'right' },
];

// Helper function to format numbers
const formatNumber = (num) => {
  if (!num) return '0';
  return new Intl.NumberFormat('en-IN').format(Math.round(num));
};

// Calculate estimated conversions and earnings
const calculateEstimatedData = (deals) => {
  // Realistic conversion rate: 1-2%
  const avgConversionRate = 0.015; // 1.5%
  
  // Commission rates by category
  const commissionRates = {
    electronics: 0.05, // 5%
    fashion: 0.07, // 7%
    home: 0.06, // 6%
    beauty: 0.08, // 8%
    food: 0.05, // 5%
    sports: 0.05, // 5%
    default: 0.05, // 5%
  };

  let clicks = 0;
  let conversions = 0;
  let earnings = 0;

  const platformData = {};
  const categoryData = {};

  deals.forEach(deal => {
    const dealClicks = deal.clicks || 0;
    const dealConversions = Math.round(dealClicks * avgConversionRate);
    const dealPrice = deal.dealPrice || deal.price || 0;
    const category = deal.category || 'default';
    const platform = deal.platform || 'amazon';
    const commissionRate = commissionRates[category] || commissionRates.default;
    const dealEarnings = dealConversions * dealPrice * commissionRate;

    clicks += dealClicks;
    conversions += dealConversions;
    earnings += dealEarnings;

    // Update deal with calculated data
    deal.conversions = dealConversions;
    deal.earnings = dealEarnings;

    // Platform data
    if (!platformData[platform]) {
      platformData[platform] = {
        clicks: 0,
        conversions: 0,
        earnings: 0,
      };
    }
    platformData[platform].clicks += dealClicks;
    platformData[platform].conversions += dealConversions;
    platformData[platform].earnings += dealEarnings;

    // Category data
    if (!categoryData[category]) {
      categoryData[category] = {
        clicks: 0,
        conversions: 0,
        earnings: 0,
      };
    }
    categoryData[category].clicks += dealClicks;
    categoryData[category].conversions += dealConversions;
    categoryData[category].earnings += dealEarnings;
  });

  return { clicks, conversions, earnings, platformData, categoryData };
};

// Platform icons and colors
const getPlatformConfig = (name) => {
  const configs = {
    amazon: { icon: 'mdi-amazon', color: 'orange' },
    flipkart: { icon: 'mdi-shopping', color: 'blue' },
    myntra: { icon: 'mdi-hanger', color: 'pink' },
    ajio: { icon: 'mdi-shopping-outline', color: 'purple' },
    meesho: { icon: 'mdi-store', color: 'teal' },
    tatacliq: { icon: 'mdi-store-outline', color: 'indigo' },
  };
  return configs[name.toLowerCase()] || { icon: 'mdi-store', color: 'grey' };
};

// Category icons and colors
const getCategoryConfig = (name) => {
  const configs = {
    electronics: { icon: 'mdi-laptop', color: 'blue' },
    fashion: { icon: 'mdi-tshirt-crew', color: 'pink' },
    home: { icon: 'mdi-home', color: 'green' },
    beauty: { icon: 'mdi-spa', color: 'purple' },
    food: { icon: 'mdi-food-apple', color: 'orange' },
    sports: { icon: 'mdi-dumbbell', color: 'red' },
  };
  return configs[name] || { icon: 'mdi-tag', color: 'grey' };
};

const loadAnalytics = async () => {
  loading.value = true;
  try {
    // Fetch deals
    const deals = await firebaseAdminService.getAllDeals();
    
    // Calculate analytics
    const analytics = calculateEstimatedData(deals);
    
    totalClicks.value = analytics.clicks;
    totalConversions.value = analytics.conversions;
    totalEarnings.value = analytics.earnings;

    // Sort deals by earnings
    topDeals.value = deals
      .filter(d => d.clicks > 0)
      .sort((a, b) => (b.earnings || 0) - (a.earnings || 0))
      .slice(0, 10);

    // Process platform data
    earningsByPlatform.value = Object.entries(analytics.platformData)
      .map(([name, data]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        ...data,
        percentage: ((data.earnings / analytics.earnings) * 100).toFixed(1),
        ...getPlatformConfig(name),
      }))
      .sort((a, b) => b.earnings - a.earnings);

    // Process category data
    earningsByCategory.value = Object.entries(analytics.categoryData)
      .map(([name, data]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        ...data,
        percentage: ((data.earnings / analytics.earnings) * 100).toFixed(1),
        ...getCategoryConfig(name),
      }))
      .sort((a, b) => b.earnings - a.earnings);

    // Generate recent activity
    recentActivity.value = [
      { title: 'Analytics Updated', subtitle: 'Dashboard refreshed successfully', time: 'Just now', color: 'success' },
      { title: `${analytics.clicks} Total Clicks`, subtitle: 'Across all deals', time: 'Today', color: 'info' },
      { title: `${analytics.conversions} Estimated Sales`, subtitle: 'Based on 1.5% conversion rate', time: 'Today', color: 'warning' },
      { title: `₹${formatNumber(analytics.earnings)} Estimated Earnings`, subtitle: 'Total commission', time: 'Today', color: 'primary' },
      { title: 'Top Platform: ' + (earningsByPlatform.value[0]?.name || 'N/A'), subtitle: 'Highest earnings', time: 'All time', color: 'orange' },
    ];

  } catch (error) {
    console.error('Error loading analytics:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadAnalytics();
});
</script>

<style scoped>
.analytics-viewer { 
  width: 100%; 
  padding: 16px;
}

.opacity-50 {
  opacity: 0.5;
}

.text-decoration-line-through {
  text-decoration: line-through;
}
</style>
