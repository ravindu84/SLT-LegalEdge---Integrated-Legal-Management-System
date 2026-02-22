<template>
  <q-page class="q-pa-md slt-page-bg">
    <!-- ─── Page Header ──────────────────────────────────────────── -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-weight-bold text-primary">
          <q-icon name="person" size="28px" class="q-mr-sm" />
          My Profile
        </div>
        <div class="text-caption text-grey-6">Manage your account and preferences</div>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <!-- ─── Left Column: Profile Card ────────────────────────── -->
      <div class="col-12 col-md-4">
        <!-- Profile Card -->
        <q-card flat bordered class="q-mb-md">
          <q-card-section class="slt-profile-header column items-center q-py-lg">
            <q-avatar size="90px" color="primary" text-color="white" font-size="36px">
              {{ auth.userInitials }}
            </q-avatar>
            <div class="text-h6 text-white text-weight-bold q-mt-md">{{ auth.displayName }}</div>
            <q-badge rounded :color="roleColor" :label="auth.userRole" class="q-mt-xs" />
          </q-card-section>

          <q-separator />

          <q-list dense class="q-pa-sm">
            <q-item>
              <q-item-section avatar><q-icon name="email" color="primary" /></q-item-section>
              <q-item-section>
                <q-item-label caption>Email</q-item-label>
                <q-item-label class="text-grey-9">{{ auth.user.email }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar><q-icon name="phone" color="primary" /></q-item-section>
              <q-item-section>
                <q-item-label caption>Phone</q-item-label>
                <q-item-label class="text-grey-9">{{ auth.user.phone }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar><q-icon name="business" color="primary" /></q-item-section>
              <q-item-section>
                <q-item-label caption>Department</q-item-label>
                <q-item-label class="text-grey-9">{{ auth.user.department }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar
                ><q-icon name="calendar_today" color="primary"
              /></q-item-section>
              <q-item-section>
                <q-item-label caption>Joined</q-item-label>
                <q-item-label class="text-grey-9">{{ auth.user.joinedDate }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>

        <!-- Quick Stats -->
        <q-card flat bordered>
          <q-card-section class="q-pb-sm">
            <div class="text-subtitle2 text-weight-bold text-primary">My Workload</div>
          </q-card-section>
          <q-separator />
          <q-list dense separator>
            <q-item v-for="stat in workloadStats" :key="stat.label">
              <q-item-section avatar>
                <q-avatar :color="stat.bg" size="32px">
                  <q-icon :name="stat.icon" :color="stat.color" size="16px" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-grey-8">{{ stat.label }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge rounded :color="stat.color" :label="stat.count" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>

      <!-- ─── Right Column: Activity & Preferences ────────────── -->
      <div class="col-12 col-md-8">
        <!-- Recent Activity -->
        <q-card flat bordered class="q-mb-md">
          <q-card-section class="q-pb-sm">
            <div class="text-subtitle1 text-weight-bold text-primary">
              <q-icon name="history" class="q-mr-sm" />
              Recent Activity
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section class="q-pa-none">
            <q-timeline color="primary" class="q-px-md q-py-sm">
              <q-timeline-entry
                v-for="entry in activityLog"
                :key="entry.id"
                :icon="entry.icon"
                :color="entry.color"
                :subtitle="entry.time"
              >
                <template #title>
                  <span class="text-weight-bold text-grey-9" style="font-size: 0.85rem">{{
                    entry.title
                  }}</span>
                </template>
                <div class="text-caption text-grey-6">{{ entry.description }}</div>
              </q-timeline-entry>
            </q-timeline>
          </q-card-section>
        </q-card>

        <!-- Preferences -->
        <q-card flat bordered class="q-mb-md">
          <q-card-section class="q-pb-sm">
            <div class="text-subtitle1 text-weight-bold text-primary">
              <q-icon name="tune" class="q-mr-sm" />
              Preferences
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="prefs.language"
                  :options="['English', 'සිංහල', 'தமிழ்']"
                  outlined
                  dense
                  label="Language"
                >
                  <template #prepend><q-icon name="language" color="primary" /></template>
                </q-select>
              </div>
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="prefs.dateFormat"
                  :options="['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']"
                  outlined
                  dense
                  label="Date Format"
                >
                  <template #prepend><q-icon name="today" color="primary" /></template>
                </q-select>
              </div>
              <div class="col-12">
                <q-toggle
                  v-model="prefs.emailNotif"
                  color="primary"
                  label="Email notifications for approvals & hearing reminders"
                />
              </div>
              <div class="col-12">
                <q-toggle
                  v-model="prefs.desktopNotif"
                  color="primary"
                  label="Desktop push notifications"
                />
              </div>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-actions align="right" class="q-pa-md">
            <q-btn
              unelevated
              no-caps
              color="primary"
              icon="save"
              label="Save Preferences"
              @click="savePrefs"
            />
          </q-card-actions>
        </q-card>

        <!-- Change Password -->
        <q-card flat bordered>
          <q-card-section class="q-pb-sm">
            <div class="text-subtitle1 text-weight-bold text-primary">
              <q-icon name="lock" class="q-mr-sm" />
              Change Password
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <div class="row q-col-gutter-md" style="max-width: 500px">
              <div class="col-12">
                <q-input
                  v-model="pwdForm.current"
                  outlined
                  dense
                  label="Current Password"
                  type="password"
                >
                  <template #prepend><q-icon name="key" color="grey-6" /></template>
                </q-input>
              </div>
              <div class="col-12">
                <q-input
                  v-model="pwdForm.newPwd"
                  outlined
                  dense
                  label="New Password"
                  type="password"
                >
                  <template #prepend><q-icon name="lock_reset" color="grey-6" /></template>
                </q-input>
              </div>
              <div class="col-12">
                <q-input
                  v-model="pwdForm.confirm"
                  outlined
                  dense
                  label="Confirm New Password"
                  type="password"
                >
                  <template #prepend><q-icon name="lock" color="grey-6" /></template>
                </q-input>
              </div>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-actions align="right" class="q-pa-md">
            <q-btn
              unelevated
              no-caps
              color="primary"
              icon="lock_reset"
              label="Update Password"
              @click="updatePassword"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/authStore'

const auth = useAuthStore()
const $q = useQuasar()

// ── Role color ────────────────────────────────────────────────────
const roleColor = computed(() => {
  const map = {
    Admin: 'deep-purple-7',
    Executive: 'positive',
    Manager: 'primary',
    'Legal Officer': 'info',
  }
  return map[auth.userRole] || 'grey-6'
})

// ── Workload stats ────────────────────────────────────────────────
const workloadStats = [
  { label: 'Assigned Cases', count: '5', icon: 'gavel', color: 'primary', bg: 'blue-1' },
  { label: 'Pending Approvals', count: '3', icon: 'verified', color: 'warning', bg: 'orange-1' },
  { label: 'Active Agreements', count: '4', icon: 'handshake', color: 'positive', bg: 'green-1' },
  { label: 'Documents to Review', count: '2', icon: 'description', color: 'info', bg: 'cyan-1' },
]

// ── Activity log ──────────────────────────────────────────────────
const activityLog = [
  {
    id: 1,
    icon: 'gavel',
    color: 'primary',
    title: 'Reviewed Case LC-2024-003',
    description: 'Updated case notes for Network Dispute – Galle',
    time: 'Today, 2:30 PM',
  },
  {
    id: 2,
    icon: 'verified',
    color: 'positive',
    title: 'Approved Agreement AGR-2024-005',
    description: 'Tower Lease Agreement — Colombo Region approved at L1',
    time: 'Today, 11:15 AM',
  },
  {
    id: 3,
    icon: 'description',
    color: 'warning',
    title: 'Submitted Initial Document ID-2024-018',
    description: 'New supplier contract document submitted for review',
    time: 'Yesterday, 4:45 PM',
  },
  {
    id: 4,
    icon: 'event',
    color: 'negative',
    title: 'Attended Hearing – LC-2024-001',
    description: 'SLT vs. Perera Construction at Commercial High Court',
    time: 'Yesterday, 10:00 AM',
  },
  {
    id: 5,
    icon: 'upload_file',
    color: 'info',
    title: 'Uploaded Supporting Documents',
    description: 'Added 3 exhibits to Land Acquisition – Kandy Zone',
    time: '20 Feb 2026',
  },
  {
    id: 6,
    icon: 'cancel',
    color: 'grey-6',
    title: 'Rejected Agreement AGR-2024-011',
    description: 'Vendor agreement returned — missing schedule of rates',
    time: '19 Feb 2026',
  },
]

// ── Preferences ───────────────────────────────────────────────────
const prefs = ref({
  language: 'English',
  dateFormat: 'DD/MM/YYYY',
  emailNotif: true,
  desktopNotif: false,
})

function savePrefs() {
  $q.notify({ type: 'positive', icon: 'save', message: 'Preferences saved.', timeout: 2000 })
}

// ── Password ──────────────────────────────────────────────────────
const pwdForm = ref({ current: '', newPwd: '', confirm: '' })

function updatePassword() {
  if (!pwdForm.value.current || !pwdForm.value.newPwd) {
    $q.notify({
      type: 'warning',
      icon: 'warning',
      message: 'Please fill all password fields.',
      timeout: 2500,
    })
    return
  }
  if (pwdForm.value.newPwd !== pwdForm.value.confirm) {
    $q.notify({
      type: 'negative',
      icon: 'error',
      message: 'Passwords do not match.',
      timeout: 2500,
    })
    return
  }
  pwdForm.value = { current: '', newPwd: '', confirm: '' }
  $q.notify({
    type: 'positive',
    icon: 'lock',
    message: 'Password updated successfully.',
    timeout: 2000,
  })
}
</script>

<style lang="scss" scoped>
.slt-page-bg {
  background: #f0f4f9;
  min-height: 100vh;
}

.slt-profile-header {
  background: linear-gradient(135deg, #002f6c 0%, #003f87 60%, #0055a5 100%);
  border-radius: 10px 10px 0 0;
}
</style>
