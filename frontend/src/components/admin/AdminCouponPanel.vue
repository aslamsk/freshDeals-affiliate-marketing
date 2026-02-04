<template>
  <v-card>
    <v-card-title>{{ $t('admin.coupons') }}</v-card-title>
    <v-card-text>
      <v-btn color="primary" class="mb-4" @click="showForm = true">
        {{ $t('admin.addCoupon') }}
      </v-btn>

      <!-- Coupon Form Dialog -->
      <v-dialog v-model="showForm" max-width="500px">
        <v-card>
          <v-card-title>
            {{ editingId ? $t('admin.editCoupon') : $t('admin.addCoupon') }}
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="form.code"
              label="Coupon Code"
              class="mb-2"
            ></v-text-field>
            <v-text-field
              v-model.number="form.discount"
              label="Discount"
              type="number"
              class="mb-2"
            ></v-text-field>
            <v-select
              v-model="form.discountType"
              :items="['percentage', 'fixed']"
              label="Discount Type"
              class="mb-2"
            ></v-select>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="showForm = false">{{ $t('admin.cancel') }}</v-btn>
            <v-btn color="primary" @click="saveCoupon">{{ $t('admin.save') }}</v-btn>
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
  code: '',
  discount: 0,
  discountType: 'percentage',
});

const saveCoupon = () => {
  console.log('Save coupon:', form.value);
  showForm.value = false;
};
</script>
