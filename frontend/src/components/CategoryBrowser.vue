<template>
  <v-card class="category-browser" elevation="0" rounded="xl">
    <v-card-text class="pa-4 pa-md-6">
      <!-- Header -->
      <div class="d-flex align-center justify-space-between mb-4">
        <div class="d-flex align-center">
          <div class="header-icon mr-3">
            <v-icon color="white" size="20">mdi-shape</v-icon>
          </div>
          <div>
            <h2 class="text-h6 font-weight-bold category-title">Shop by Category</h2>
            <p class="text-caption category-subtitle">Browse deals by your favorite categories</p>
          </div>
        </div>
        <v-btn
          v-if="selectedCategory"
          variant="text"
          color="primary"
          size="small"
          @click="clearSelection"
        >
          <v-icon start size="16">mdi-close</v-icon>
          Clear Filter
        </v-btn>
      </div>

      <!-- Categories Grid -->
      <div class="categories-scroll">
        <div class="categories-container">
          <!-- All Category -->
          <div
            class="category-item"
            :class="{ 'category-selected': !selectedCategory }"
            @click="selectCategory('')"
          >
            <div class="category-icon-wrapper all-icon">
              <v-icon size="28" color="white">mdi-view-grid</v-icon>
            </div>
            <span class="category-name">All</span>
            <v-chip size="x-small" color="grey" variant="tonal" class="count-chip">
              {{ totalCount }}
            </v-chip>
          </div>

          <!-- Category Items -->
          <div
            v-for="category in categoryList"
            :key="category.id"
            class="category-item"
            :class="{ 'category-selected': selectedCategory === category.id }"
            @click="selectCategory(category.id)"
          >
            <div class="category-icon-wrapper" :style="{ background: category.gradient }">
              <v-icon size="28" color="white">{{ category.icon }}</v-icon>
            </div>
            <span class="category-name">{{ category.name }}</span>
            <v-chip size="x-small" :color="category.chipColor" variant="tonal" class="count-chip">
              {{ category.count }}
            </v-chip>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

const props = defineProps({
  selectedCategory: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['category-selected']);

const selectCategory = (categoryId) => {
  emit('category-selected', categoryId);
};

const clearSelection = () => {
  emit('category-selected', '');
};

const categoryList = ref([
  {
    id: 'electronics',
    name: 'Electronics',
    icon: 'mdi-cellphone-link',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    chipColor: 'purple',
    count: 0,
  },
  {
    id: 'fashion',
    name: 'Fashion',
    icon: 'mdi-tshirt-crew',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    chipColor: 'pink',
    count: 0,
  },
  {
    id: 'home',
    name: 'Home',
    icon: 'mdi-sofa',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    chipColor: 'orange',
    count: 0,
  },
  {
    id: 'beauty',
    name: 'Beauty',
    icon: 'mdi-lipstick',
    gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    chipColor: 'purple',
    count: 0,
  },
  {
    id: 'food',
    name: 'Food',
    icon: 'mdi-silverware-fork-knife',
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    chipColor: 'green',
    count: 0,
  },
  {
    id: 'sports',
    name: 'Sports',
    icon: 'mdi-basketball',
    gradient: 'linear-gradient(135deg, #ff6a00 0%, #ee0979 100%)',
    chipColor: 'red',
    count: 0,
  },
]);

const totalCount = computed(() => {
  return categoryList.value.reduce((sum, cat) => sum + cat.count, 0);
});

const loadCategoryCounts = async () => {
  try {
    // Count products per category
    const productsSnap = await getDocs(collection(db, 'products'));
    const categoryCounts = {};
    
    productsSnap.docs.forEach(doc => {
      const category = doc.data().category?.toLowerCase();
      if (category) {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      }
    });
    
    // Count deals per category
    const dealsSnap = await getDocs(collection(db, 'deals'));
    dealsSnap.docs.forEach(doc => {
      const category = doc.data().category?.toLowerCase();
      if (category) {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      }
    });
    
    // Update category counts
    categoryList.value.forEach(cat => {
      cat.count = categoryCounts[cat.id] || 0;
    });
    
    console.log('✅ Category counts loaded:', categoryCounts);
  } catch (error) {
    console.error('Error loading category counts:', error);
  }
};

onMounted(() => {
  loadCategoryCounts();
});
</script>

<style scoped>
.category-browser {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(0, 0, 0, 0.05);
  color: rgb(var(--v-theme-on-surface));
}

.category-title {
  color: rgb(var(--v-theme-on-surface));
}

.category-subtitle {
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.header-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.categories-scroll {
  overflow-x: auto;
  margin: 0 -8px;
  padding: 8px;
  scrollbar-width: thin;
}

.categories-scroll::-webkit-scrollbar {
  height: 6px;
}

.categories-scroll::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.categories-container {
  display: flex;
  gap: 16px;
  min-width: max-content;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  background: linear-gradient(180deg, rgba(var(--v-theme-surface), 0.98) 0%, rgba(var(--v-theme-surface), 0.92) 100%);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  min-width: 100px;
  position: relative;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
}

.v-theme--dark .category-item {
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.45);
  border-color: rgba(255, 255, 255, 0.06);
}

.category-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.v-theme--dark .category-item:hover {
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.55);
}

.category-selected {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.12);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.category-selected::after {
  content: '';
  position: absolute;
  top: -2px;
  right: -2px;
  width: 20px;
  height: 20px;
  background: #667eea;
  border-radius: 0 14px 0 10px;
}

.category-selected::before {
  content: '✓';
  position: absolute;
  top: 0;
  right: 3px;
  font-size: 10px;
  color: white;
  z-index: 1;
}

.category-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.all-icon {
  background: linear-gradient(135deg, #485563 0%, #29323c 100%);
}

.category-item:hover .category-icon-wrapper {
  transform: scale(1.1) rotate(5deg);
}

.category-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  text-align: center;
}

.count-chip {
  font-weight: 600;
}

/* Responsive */
@media (max-width: 600px) {
  .category-item {
    min-width: 85px;
    padding: 12px 16px;
  }
  
  .category-icon-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 12px;
  }
  
  .category-icon-wrapper .v-icon {
    font-size: 24px !important;
  }
  
  .category-name {
    font-size: 0.75rem;
  }
}
</style>
