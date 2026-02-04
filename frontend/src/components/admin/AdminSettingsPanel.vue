<template>
  <v-card>
    <v-card-title>{{ $t('admin.settings') }}</v-card-title>
    <v-card-text>
      <v-card class="mb-4">
        <v-card-title class="text-h6">{{ $t('admin.affiliateSettings') }}</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-card outlined>
                <v-card-title class="text-subtitle-1">Amazon</v-card-title>
                <v-card-text>
                  <v-text-field
                    v-model="amazonSettings.associateTag"
                    label="Associate Tag"
                    dense
                    class="mb-2"
                  ></v-text-field>
                  <v-checkbox
                    v-model="amazonSettings.isEnabled"
                    label="Enabled"
                  ></v-checkbox>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="6">
              <v-card outlined>
                <v-card-title class="text-subtitle-1">Flipkart</v-card-title>
                <v-card-text>
                  <v-text-field
                    v-model="flipkartSettings.affiliateId"
                    label="Affiliate ID"
                    dense
                    class="mb-2"
                  ></v-text-field>
                  <v-checkbox
                    v-model="flipkartSettings.isEnabled"
                    label="Enabled"
                  ></v-checkbox>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          <v-btn color="primary" class="mt-4" @click="saveSettings">
            {{ $t('admin.save') }}
          </v-btn>
        </v-card-text>
      </v-card>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from 'vue';

const amazonSettings = ref({
  associateTag: '',
  isEnabled: true,
});

const flipkartSettings = ref({
  affiliateId: '',
  isEnabled: true,
});

const saveSettings = () => {
  console.log('Save settings:', {
    amazon: amazonSettings.value,
    flipkart: flipkartSettings.value,
  });
};
</script>
