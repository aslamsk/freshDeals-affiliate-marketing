<template>
  <v-card>
    <v-card-title>{{ $t('admin.deals') }}</v-card-title>
    <v-card-text>
      <v-btn color="primary" class="mb-4" @click="showForm = true">
        {{ $t('admin.addDeal') }}
      </v-btn>

      <!-- Deal Form Dialog -->
      <v-dialog v-model="showForm" max-width="500px">
        <v-card>
          <v-card-title>
            {{ editingId ? $t('admin.editDeal') : $t('admin.addDeal') }}
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="form.title"
              label="Title"
              class="mb-2"
            ></v-text-field>
            <v-select
              v-model="form.platform"
              :items="platforms"
              label="Platform"
              class="mb-2"
            ></v-select>
            <v-text-field
              v-model.number="form.dealPrice"
              label="Deal Price"
              type="number"
              class="mb-2"
            ></v-text-field>
            <v-text-field
              v-model="form.affiliateLink"
              label="Affiliate Link"
              class="mb-2"
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="showForm = false">{{ $t('admin.cancel') }}</v-btn>
            <v-btn color="primary" @click="saveDeal">{{ $t('admin.save') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <p class="text-caption text-disabled">Admin panel implementation requires auth setup</p>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from 'vue';

const showForm = ref(false);
const editingId = ref(null);
const form = ref({
  title: '',
  platform: '',
  dealPrice: 0,
  affiliateLink: '',
});

const platforms = ['amazon', 'flipkart', 'cuelinks'];

const saveDeal = () => {
  console.log('Save deal:', form.value);
  showForm.value = false;
};
</script>
