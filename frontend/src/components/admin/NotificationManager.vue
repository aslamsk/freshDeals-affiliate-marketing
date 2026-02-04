<template>
  <div>
    <h2>{{ $t('admin.notifications') }}</h2>

    <v-card class="mb-6">
      <v-card-title>{{ $t('admin.sendNotification') }}</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="sendNotification">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.title"
                :label="$t('admin.notificationTitle')"
                placeholder="e.g., Great Deal Alert!"
                required
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.body"
                :label="$t('admin.notificationBody')"
                placeholder="e.g., New premium deals available now"
                required
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.link"
                :label="$t('admin.notificationLink')"
                placeholder="e.g., /deals or /category/electronics"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="form.audience"
                :items="audienceOptions"
                :label="$t('admin.audience')"
                required
              />
            </v-col>
          </v-row>

          <v-row v-if="form.audience === 'topic'">
            <v-col cols="12">
              <v-text-field
                v-model="form.topic"
                :label="$t('admin.topic')"
                placeholder="e.g., electronics, deals_hot"
                hint="Leave empty to broadcast to all subscribers"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-btn
                color="primary"
                type="submit"
                :loading="sending"
              >
                {{ $t('admin.sendNotification') }}
              </v-btn>
              <v-btn
                variant="text"
                class="ml-2"
                @click="resetForm"
              >
                {{ $t('common.clear') }}
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Status Messages -->
    <v-alert
      v-if="successMessage"
      type="success"
      dismissible
      class="mb-4"
    >
      {{ successMessage }}
    </v-alert>

    <v-alert
      v-if="errorMessage"
      type="error"
      dismissible
      class="mb-4"
    >
      {{ errorMessage }}
    </v-alert>

    <!-- Notification History -->
    <v-card>
      <v-card-title>{{ $t('admin.notificationHistory') }}</v-card-title>
      <v-card-text v-if="history.length > 0">
        <v-timeline layout="dense">
          <v-timeline-item
            v-for="(item, idx) in history"
            :key="idx"
            size="x-small"
          >
            <div>
              <div class="font-weight-bold">{{ item.title }}</div>
              <p class="text-caption mb-1">{{ item.body }}</p>
              <p class="text-caption">
                <v-icon size="small">mdi-clock</v-icon>
                {{ formatDate(item.timestamp) }}
              </p>
            </div>
          </v-timeline-item>
        </v-timeline>
      </v-card-text>
      <v-card-text v-else>
        <p class="text-center text-grey">{{ $t('admin.noNotifications') }}</p>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import firebaseAdminService from '../services/firebaseAdminService';

const { t } = useI18n();

const form = ref({
  title: '',
  body: '',
  link: '',
  audience: 'topic',
  topic: 'all_deals',
});

const sending = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const history = ref([]);

const audienceOptions = [
  { title: 'Broadcast to Topic', value: 'topic' },
  { title: 'All Users', value: 'all' },
  { title: 'Selected Users', value: 'selected' },
];

const sendNotification = async () => {
  if (!form.value.title || !form.value.body) {
    errorMessage.value = t('admin.fillAllFields');
    return;
  }

  sending.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    // Call backend API to send notification
    const response = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      },
      body: JSON.stringify({
        title: form.value.title,
        body: form.value.body,
        link: form.value.link,
        audience: form.value.audience,
        topic: form.value.topic || 'all_deals',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send notification');
    }

    const data = await response.json();
    
    // Add to history
    history.value.unshift({
      title: form.value.title,
      body: form.value.body,
      timestamp: new Date(),
    });

    successMessage.value = `Notification sent successfully to ${data.recipientCount || 'users'}`;
    resetForm();
  } catch (error) {
    console.error('Error sending notification:', error);
    errorMessage.value = error.message || 'Error sending notification';
  } finally {
    sending.value = false;
  }
};

const resetForm = () => {
  form.value = {
    title: '',
    body: '',
    link: '',
    audience: 'topic',
    topic: 'all_deals',
  };
};

const formatDate = (date) => {
  return new Date(date).toLocaleString();
};
</script>

<style scoped>
.font-weight-bold {
  font-weight: 600;
}
</style>
