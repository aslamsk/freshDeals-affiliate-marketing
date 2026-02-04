<template>
  <div class="notification-manager">
    <div class="manager-header mb-4">
      <h3>Push Notification Manager</h3>
      <v-btn color="success" prepend-icon="mdi-plus" @click="showDialog = true">
        Send Notification
      </v-btn>
    </div>

    <v-data-table
      :headers="headers"
      :items="notifications"
      :loading="loading"
      class="elevation-1"
    >
      <template v-slot:item.status="{ item }">
        <v-chip :color="item.status === 'sent' ? 'success' : 'warning'" small>
          {{ item.status }}
        </v-chip>
      </template>
    </v-data-table>

    <!-- Send Dialog -->
    <v-dialog v-model="showDialog" max-width="600px">
      <v-card>
        <v-card-title>Send Push Notification</v-card-title>
        <v-card-text class="mt-4">
          <v-text-field v-model="form.title_en" label="Title (English)" class="mb-3" />
          <v-text-field v-model="form.title_te" label="Title (Telugu)" class="mb-3" />
          <v-textarea v-model="form.body_en" label="Body (English)" rows="3" class="mb-3" />
          <v-textarea v-model="form.body_te" label="Body (Telugu)" rows="3" class="mb-3" />
          <v-select v-model="form.target" :items="['homepage', 'deals', 'products']" label="Target Page" class="mb-3" />
          <v-text-field v-model="form.targetId" label="Target ID (optional)" class="mb-3" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="showDialog = false">Cancel</v-btn>
          <v-btn color="success" @click="sendNotification" :loading="sending">Send Now</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import firebaseAdminService from '../../services/firebaseAdminService.js';

const notifications = ref([]);
const loading = ref(false);
const sending = ref(false);
const showDialog = ref(false);

const headers = [
  { title: 'Title', value: 'title_en' },
  { title: 'Target', value: 'target' },
  { title: 'Status', value: 'status' },
  { title: 'Sent At', value: 'createdAt' },
];

const form = ref({
  title_en: '',
  title_te: '',
  body_en: '',
  body_te: '',
  target: 'homepage',
  targetId: '',
});

const loadNotifications = async () => {
  loading.value = true;
  try {
    const logs = await firebaseAdminService.getPushLogs();
    notifications.value = logs.slice(0, 20);
  } catch (error) {
    console.error('Error loading notifications:', error);
  } finally {
    loading.value = false;
  }
};

const sendNotification = async () => {
  if (!form.value.title_en) {
    alert('Please fill in the title');
    return;
  }

  sending.value = true;
  try {
    await firebaseAdminService.sendPushNotification(form.value);
    showDialog.value = false;
    form.value = { title_en: '', title_te: '', body_en: '', body_te: '', target: 'homepage', targetId: '' };
    alert('Notification scheduled successfully!');
    await loadNotifications();
  } catch (error) {
    alert('Error sending notification: ' + error.message);
  } finally {
    sending.value = false;
  }
};

onMounted(() => {
  loadNotifications();
});
</script>

<style scoped>
.notification-manager { width: 100%; }
.manager-header { display: flex; justify-content: space-between; align-items: center; }
</style>
