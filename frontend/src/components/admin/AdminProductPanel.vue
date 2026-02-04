<template>
  <v-card>
    <v-card-title>{{ $t('admin.products') }}</v-card-title>
    <v-card-text>
      <v-btn color="primary" class="mb-4" @click="showForm = true">
        {{ $t('admin.addProduct') }}
      </v-btn>

      <!-- Product Form Dialog -->
      <v-dialog v-model="showForm" max-width="500px">
        <v-card>
          <v-card-title>
            {{ editingId ? $t('admin.editProduct') : $t('admin.addProduct') }}
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="form.name"
              :label="$t('product.details')"
              class="mb-2"
            ></v-text-field>
            <v-text-field
              v-model="form.description"
              :label="$t('product.description')"
              class="mb-2"
            ></v-text-field>
            <v-select
              v-model="form.category"
              :items="categories"
              :label="$t('home.categories')"
              class="mb-2"
            ></v-select>
            <v-checkbox
              v-model="form.isVisible"
              :label="$t('deal.deal')"
            ></v-checkbox>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="showForm = false">{{ $t('admin.cancel') }}</v-btn>
            <v-btn color="primary" @click="saveProduct">{{ $t('admin.save') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <p class="text-caption text-disabled">Admin panel implementation requires auth setup</p>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const showForm = ref(false);
const editingId = ref(null);
const form = ref({
  name: '',
  description: '',
  category: '',
  isVisible: true,
});

const categories = [
  'electronics',
  'fashion',
  'home_appliances',
  'books',
  'beauty',
  'groceries',
  'sports',
  'toys',
  'others',
];

const saveProduct = () => {
  console.log('Save product:', form.value);
  showForm.value = false;
};
</script>
