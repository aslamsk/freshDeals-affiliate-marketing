<template>
  <v-card elevation="2" class="admin-users">
    <v-card-title class="d-flex align-center justify-space-between">
      <div class="d-flex align-center gap-2">
        <v-icon color="primary">mdi-account-multiple</v-icon>
        <span class="text-h6">Admins & Users</span>
      </div>
      <div class="d-flex align-center gap-2">
        <v-btn variant="text" color="primary" @click="loadAdmins" :loading="loading">
          <v-icon start>mdi-refresh</v-icon>
          Refresh
        </v-btn>
        <v-btn color="primary" variant="elevated" @click="showCreate = true" :disabled="!isSuperAdmin">
          <v-icon start>mdi-account-plus</v-icon>
          Create Admin
        </v-btn>
      </div>
    </v-card-title>

    <v-card-text>
      <v-alert
        v-if="!isSuperAdmin"
        type="info"
        variant="tonal"
        class="mb-4"
      >
        Only super admins can create new admins.
      </v-alert>

      <v-table>
        <thead>
          <tr>
            <th class="text-left">Profile</th>
            <th class="text-left">Username</th>
            <th class="text-left">Email</th>
            <th class="text-left">Mobile</th>
            <th class="text-left">Role</th>
            <th class="text-left">Password</th>
            <th class="text-left">Status</th>
            <th class="text-left">Created</th>
            <th class="text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="admin in admins" :key="admin.uid || admin.id">
            <td>
              <div class="d-flex align-center gap-2">
                <v-avatar size="32" color="primary" v-if="!admin.photoURL">
                  <span class="text-white text-caption">{{ initials(admin.profileName || admin.username || admin.email) }}</span>
                </v-avatar>
                <v-avatar size="32" v-else>
                  <v-img :src="admin.photoURL" cover />
                </v-avatar>
                <div class="text-body-2">{{ admin.profileName || admin.username || '—' }}</div>
              </div>
            </td>
            <td>{{ admin.username || '—' }}</td>
            <td>{{ admin.email || '—' }}</td>
            <td>{{ admin.mobile || '—' }}</td>
            <td>
              <v-chip size="small" color="primary" variant="tonal">
                {{ formatRole(admin.role) }}
              </v-chip>
            </td>
            <td>{{ admin.passwordSet ? 'Set' : 'Not Set' }}</td>
            <td>
              <v-chip size="small" :color="admin.status === 'active' ? 'success' : 'error'" variant="tonal">
                {{ admin.status || 'inactive' }}
              </v-chip>
            </td>
            <td>{{ formatDate(admin.createdAt) }}</td>
            <td>
              <v-btn
                size="x-small"
                variant="text"
                color="primary"
                :disabled="!isSuperAdmin"
                @click="openEdit(admin)"
              >
                <v-icon start size="16">mdi-pencil</v-icon>
                Edit
              </v-btn>
            </td>
          </tr>
          <tr v-if="admins.length === 0 && !loading">
            <td colspan="9" class="text-center text-grey py-6">No admins found.</td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
  </v-card>

  <!-- Create Admin Dialog -->
  <v-dialog v-model="showCreate" max-width="640">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon color="primary" class="mr-2">mdi-account-plus</v-icon>
        Create Admin
      </v-card-title>
      <v-card-text>
        <v-form ref="formRef" v-model="formValid">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.email" label="Email" type="email" :rules="emailRules" required />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.password" label="Password" type="password" :rules="passwordRules" required />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.username" label="Username" :rules="requiredRules" required />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.profileName" label="Profile Name" :rules="requiredRules" required />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.mobile" label="Mobile Number" />
            </v-col>
            <v-col cols="12" md="6">
              <v-file-input
                v-model="form.photoFile"
                label="Profile Photo (optional)"
                accept="image/*"
                prepend-icon="mdi-image"
                show-size
                clearable
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="form.role"
                :items="roles"
                label="Role"
                :rules="requiredRules"
                required
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="form.status"
                :items="statuses"
                label="Status"
                :rules="requiredRules"
                required
              />
            </v-col>
          </v-row>
        </v-form>
        <v-alert type="info" variant="tonal" class="mt-2">
          Password is stored only in Firebase Authentication (not in Firestore).
        </v-alert>
        <v-alert v-if="errorMessage" type="error" variant="tonal" class="mt-3">
          {{ errorMessage }}
        </v-alert>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="showCreate = false">Cancel</v-btn>
        <v-btn color="primary" variant="elevated" :loading="saving" :disabled="!formValid" @click="submitCreate">
          Create
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Edit Admin Dialog -->
  <v-dialog v-model="showEdit" max-width="640">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon color="primary" class="mr-2">mdi-pencil</v-icon>
        Update Admin
      </v-card-title>
      <v-card-text>
        <v-form ref="editFormRef" v-model="editFormValid">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field v-model="editForm.email" label="Email" disabled />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="editForm.username" label="Username" :rules="requiredRules" required />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="editForm.profileName" label="Profile Name" :rules="requiredRules" required />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="editForm.mobile" label="Mobile Number" />
            </v-col>
            <v-col cols="12" md="6">
              <v-file-input
                v-model="editForm.photoFile"
                label="Profile Photo (optional)"
                accept="image/*"
                prepend-icon="mdi-image"
                show-size
                clearable
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="editForm.role"
                :items="roles"
                label="Role"
                :rules="requiredRules"
                required
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="editForm.status"
                :items="statuses"
                label="Status"
                :rules="requiredRules"
                required
              />
            </v-col>
          </v-row>
        </v-form>
        <v-alert type="info" variant="tonal" class="mt-2">
          Email and password changes require backend/admin SDK for security.
        </v-alert>
        <v-alert v-if="editErrorMessage" type="error" variant="tonal" class="mt-3">
          {{ editErrorMessage }}
        </v-alert>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="showEdit = false">Cancel</v-btn>
        <v-btn color="primary" variant="elevated" :loading="savingEdit" :disabled="!editFormValid" @click="submitEdit">
          Update
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import adminAuthService from '@/services/adminAuthService';
import adminUserService from '@/services/adminUserService';

const admins = ref([]);
const loading = ref(false);
const saving = ref(false);
const savingEdit = ref(false);
const showCreate = ref(false);
const showEdit = ref(false);
const errorMessage = ref('');
const editErrorMessage = ref('');
const formValid = ref(false);
const editFormValid = ref(false);
const formRef = ref(null);
const editFormRef = ref(null);
const currentAdmin = ref(null);
const editingAdminId = ref('');

const roles = ['super_admin', 'admin', 'manager', 'editor', 'viewer'];
const statuses = ['active', 'inactive'];

const form = ref({
  email: '',
  password: '',
  username: '',
  profileName: '',
  mobile: '',
  photoFile: null,
  role: 'admin',
  status: 'active'
});

const editForm = ref({
  email: '',
  username: '',
  profileName: '',
  mobile: '',
  photoURL: '',
  photoFile: null,
  role: 'admin',
  status: 'active'
});

const requiredRules = [v => !!v || 'Required'];
const emailRules = [
  v => !!v || 'Email is required',
  v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Email must be valid'
];
const passwordRules = [
  v => !!v || 'Password is required',
  v => v.length >= 6 || 'Minimum 6 characters'
];

const isSuperAdmin = computed(() => currentAdmin.value?.role === 'super_admin');

const loadAdmins = async () => {
  loading.value = true;
  try {
    admins.value = await adminUserService.listAdmins();
  } catch (error) {
    console.error('Failed to load admins:', error);
  } finally {
    loading.value = false;
  }
};

const submitCreate = async () => {
  errorMessage.value = '';
  const validation = await formRef.value?.validate?.();
  if (validation && validation.valid === false) return;
  saving.value = true;
  try {
    await adminUserService.createAdmin({ ...form.value });
    showCreate.value = false;
    await loadAdmins();
    form.value = {
      email: '',
      password: '',
      username: '',
      profileName: '',
      mobile: '',
      photoFile: null,
      role: 'admin',
      status: 'active'
    };
  } catch (error) {
    errorMessage.value = error?.message || 'Failed to create admin';
  } finally {
    saving.value = false;
  }
};

const openEdit = (admin) => {
  editingAdminId.value = admin.uid || admin.id;
  editForm.value = {
    email: admin.email || '',
    username: admin.username || '',
    profileName: admin.profileName || admin.name || '',
    mobile: admin.mobile || '',
    photoURL: admin.photoURL || '',
    photoFile: null,
    role: admin.role || 'admin',
    status: admin.status || 'active'
  };
  editErrorMessage.value = '';
  showEdit.value = true;
};

const submitEdit = async () => {
  editErrorMessage.value = '';
  const validation = await editFormRef.value?.validate?.();
  if (validation && validation.valid === false) return;
  savingEdit.value = true;
  try {
    await adminUserService.updateAdmin(editingAdminId.value, { ...editForm.value });
    showEdit.value = false;
    await loadAdmins();
  } catch (error) {
    editErrorMessage.value = error?.message || 'Failed to update admin';
  } finally {
    savingEdit.value = false;
  }
};

const initials = (name) => {
  if (!name) return 'A';
  return name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
};

const formatRole = (role) => (role || 'viewer').replace('_', ' ');

const formatDate = (value) => {
  if (!value) return '—';
  if (value?.toDate) return value.toDate().toLocaleString();
  if (value?.seconds) return new Date(value.seconds * 1000).toLocaleString();
  return new Date(value).toLocaleString();
};

onMounted(async () => {
  currentAdmin.value = await adminAuthService.getCurrentAdmin();
  await loadAdmins();
});
</script>

<style scoped>
.admin-users :deep(table) {
  width: 100%;
}
</style>
