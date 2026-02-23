<template>
  <q-page class="q-pa-md slt-page-bg">
    <!-- ─── Page Header ──────────────────────────────────────────── -->
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="text-h5 text-weight-bold text-primary">
          <q-icon name="settings" size="28px" class="q-mr-sm" />
          {{ $t('settings.pageTitle') }}
        </div>
        <div class="text-caption text-grey-6">
          {{ $t('settings.pageSubtitle') }}
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <!-- ─── LEFT COLUMN — Profile & Security ───────────────────── -->
      <div class="col-12 col-md-7">
        <!-- ═════════════ SECTION 1: USER PROFILE ═════════════ -->
        <q-card flat bordered class="q-mb-lg slt-settings-card">
          <q-card-section class="slt-section-header">
            <q-icon name="person" color="primary" size="20px" class="q-mr-sm" />
            {{ $t('settings.userProfile') }}
          </q-card-section>
          <q-separator />

          <q-card-section class="q-pa-lg">
            <!-- Avatar row -->
            <div class="row items-center q-mb-lg">
              <q-avatar size="88px" class="slt-avatar-ring">
                <div class="slt-avatar-inner text-white text-h4 text-weight-bold">
                  {{ initials }}
                </div>
              </q-avatar>
              <div class="q-ml-lg">
                <div class="text-h6 text-weight-bold text-grey-9">{{ profile.fullName }}</div>
                <div class="text-body2 text-grey-6">{{ profile.role }}</div>
                <div class="row q-gutter-sm q-mt-sm">
                  <q-btn
                    outline
                    dense
                    no-caps
                    color="primary"
                    icon="upload"
                    :label="$t('settings.changePhoto')"
                    size="sm"
                    @click="changePhoto"
                  />
                  <q-btn
                    flat
                    dense
                    no-caps
                    color="grey-7"
                    icon="delete_outline"
                    :label="$t('settings.removePhoto')"
                    size="sm"
                    @click="removePhoto"
                  />
                </div>
              </div>
            </div>

            <!-- Form fields -->
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="profile.fullName"
                  outlined
                  dense
                  :label="$t('settings.fullName')"
                  :rules="[(v) => !!v || 'Name is required']"
                >
                  <template #prepend><q-icon name="badge" color="grey-6" /></template>
                </q-input>
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="profile.email"
                  outlined
                  dense
                  :label="$t('settings.email')"
                  type="email"
                  :rules="[(v) => !!v || 'Email is required']"
                >
                  <template #prepend><q-icon name="email" color="grey-6" /></template>
                </q-input>
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="profile.department"
                  outlined
                  dense
                  :label="$t('settings.department')"
                  readonly
                >
                  <template #prepend><q-icon name="business" color="grey-6" /></template>
                </q-input>
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="profile.role"
                  outlined
                  dense
                  :label="$t('settings.role')"
                  readonly
                >
                  <template #prepend
                    ><q-icon name="admin_panel_settings" color="grey-6"
                  /></template>
                </q-input>
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="profile.employeeId"
                  outlined
                  dense
                  :label="$t('settings.employeeId')"
                  readonly
                >
                  <template #prepend><q-icon name="fingerprint" color="grey-6" /></template>
                </q-input>
              </div>
              <div class="col-12 col-sm-6">
                <q-input v-model="profile.phone" outlined dense :label="$t('settings.phone')">
                  <template #prepend><q-icon name="phone" color="grey-6" /></template>
                </q-input>
              </div>
            </div>

            <div class="row justify-end q-mt-lg">
              <q-btn
                unelevated
                no-caps
                color="primary"
                icon="save"
                :label="$t('settings.saveProfile')"
                :loading="savingProfile"
                @click="saveProfile"
              />
            </div>
          </q-card-section>
        </q-card>

        <!-- ═════════════ SECTION 2: SECURITY ═════════════ -->
        <q-card flat bordered class="slt-settings-card">
          <q-card-section class="slt-section-header">
            <q-icon name="lock" color="primary" size="20px" class="q-mr-sm" />
            {{ $t('settings.security') }}
          </q-card-section>
          <q-separator />

          <q-card-section class="q-pa-lg">
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-input
                  v-model="passwordForm.currentPassword"
                  outlined
                  dense
                  :label="$t('settings.currentPassword')"
                  :type="showCurrentPw ? 'text' : 'password'"
                  :rules="[(v) => !!v || 'Current password is required']"
                >
                  <template #prepend><q-icon name="lock_outline" color="grey-6" /></template>
                  <template #append>
                    <q-icon
                      :name="showCurrentPw ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      color="grey-5"
                      @click="showCurrentPw = !showCurrentPw"
                    />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="passwordForm.newPassword"
                  outlined
                  dense
                  :label="$t('settings.newPassword')"
                  :type="showNewPw ? 'text' : 'password'"
                  :rules="[
                    (v) => !!v || 'New password is required',
                    (v) => (v && v.length >= 8) || 'Minimum 8 characters',
                  ]"
                >
                  <template #prepend><q-icon name="lock" color="grey-6" /></template>
                  <template #append>
                    <q-icon
                      :name="showNewPw ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      color="grey-5"
                      @click="showNewPw = !showNewPw"
                    />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="passwordForm.confirmPassword"
                  outlined
                  dense
                  :label="$t('settings.confirmPassword')"
                  :type="showConfirmPw ? 'text' : 'password'"
                  :rules="[
                    (v) => !!v || 'Please confirm your password',
                    (v) => v === passwordForm.newPassword || 'Passwords do not match',
                  ]"
                >
                  <template #prepend><q-icon name="lock_clock" color="grey-6" /></template>
                  <template #append>
                    <q-icon
                      :name="showConfirmPw ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      color="grey-5"
                      @click="showConfirmPw = !showConfirmPw"
                    />
                  </template>
                </q-input>
              </div>
            </div>

            <!-- Password strength indicator -->
            <div v-if="passwordForm.newPassword" class="q-mt-sm">
              <div class="row items-center q-mb-xs">
                <div class="text-caption text-grey-6 q-mr-sm">
                  {{ $t('settings.strengthWeak').split('')[0] === 'W' ? 'Strength' : '' }}:
                </div>
                <q-badge rounded :color="passwordStrength.color" :label="passwordStrength.label" />
              </div>
              <q-linear-progress
                :value="passwordStrength.score / 4"
                :color="passwordStrength.color"
                rounded
                size="6px"
              />
            </div>

            <q-separator class="q-my-lg" />

            <div class="row items-center justify-between">
              <div class="text-caption text-grey-5">
                <q-icon name="info" size="14px" class="q-mr-xs" />
                {{ $t('settings.passwordHint') }}
              </div>
              <q-btn
                unelevated
                no-caps
                color="negative"
                icon="lock_reset"
                :label="$t('settings.updatePassword')"
                :loading="updatingPassword"
                @click="updatePassword"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- ─── RIGHT COLUMN — Preferences ─────────────────────────── -->
      <div class="col-12 col-md-5">
        <!-- ═════════════ SECTION 3: APP PREFERENCES ═════════════ -->
        <q-card flat bordered class="q-mb-lg slt-settings-card">
          <q-card-section class="slt-section-header">
            <q-icon name="tune" color="primary" size="20px" class="q-mr-sm" />
            {{ $t('settings.appPreferences') }}
          </q-card-section>
          <q-separator />

          <q-list separator>
            <!-- Theme Toggle -->
            <q-item>
              <q-item-section avatar>
                <q-avatar :color="$q.dark.isActive ? 'blue-grey-9' : 'amber-2'" size="42px">
                  <q-icon
                    :name="$q.dark.isActive ? 'dark_mode' : 'light_mode'"
                    :color="$q.dark.isActive ? 'amber-4' : 'orange-8'"
                    size="22px"
                  />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold text-grey-9">{{
                  $t('settings.themeMode')
                }}</q-item-label>
                <q-item-label caption>
                  {{ $q.dark.isActive ? $t('settings.darkActive') : $t('settings.lightActive') }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle
                  :model-value="$q.dark.isActive"
                  color="primary"
                  checked-icon="dark_mode"
                  unchecked-icon="light_mode"
                  @update:model-value="toggleDarkMode"
                />
              </q-item-section>
            </q-item>

            <!-- Language Selection -->
            <q-item>
              <q-item-section avatar>
                <q-avatar color="blue-1" size="42px">
                  <q-icon name="translate" color="primary" size="22px" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold text-grey-9">{{
                  $t('settings.language')
                }}</q-item-label>
                <q-item-label caption>{{ $t('settings.languageCaption') }}</q-item-label>
              </q-item-section>
              <q-item-section side style="min-width: 180px">
                <q-select
                  v-model="selectedLanguage"
                  :options="languageOptions"
                  dense
                  outlined
                  emit-value
                  map-options
                  option-value="value"
                  option-label="label"
                  @update:model-value="onLanguageChange"
                />
              </q-item-section>
            </q-item>

            <!-- Date Format -->
            <q-item>
              <q-item-section avatar>
                <q-avatar color="green-1" size="42px">
                  <q-icon name="calendar_today" color="positive" size="22px" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold text-grey-9">{{
                  $t('settings.dateFormat')
                }}</q-item-label>
                <q-item-label caption>{{ $t('settings.dateFormatCaption') }}</q-item-label>
              </q-item-section>
              <q-item-section side style="min-width: 180px">
                <q-select
                  v-model="dateFormat"
                  :options="['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']"
                  dense
                  outlined
                />
              </q-item-section>
            </q-item>

            <!-- Timezone -->
            <q-item>
              <q-item-section avatar>
                <q-avatar color="purple-1" size="42px">
                  <q-icon name="schedule" color="purple-7" size="22px" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold text-grey-9">{{
                  $t('settings.timezone')
                }}</q-item-label>
                <q-item-label caption>{{ $t('settings.timezoneCaption') }}</q-item-label>
              </q-item-section>
              <q-item-section side style="min-width: 180px">
                <q-select
                  v-model="timezone"
                  :options="['Asia/Colombo (UTC+5:30)', 'UTC', 'Asia/Kolkata (UTC+5:30)']"
                  dense
                  outlined
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>

        <!-- ═════════════ SECTION 4: NOTIFICATION PREFERENCES ═════════════ -->
        <q-card flat bordered class="q-mb-lg slt-settings-card">
          <q-card-section class="slt-section-header">
            <q-icon name="notifications_active" color="primary" size="20px" class="q-mr-sm" />
            {{ $t('settings.notifications') }}
          </q-card-section>
          <q-separator />

          <q-list separator>
            <q-item v-for="notif in notificationSettings" :key="notif.key" tag="label">
              <q-item-section avatar>
                <q-avatar :color="notif.bg" size="42px">
                  <q-icon :name="notif.icon" :color="notif.iconColor" size="22px" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold text-grey-9">{{ notif.label }}</q-item-label>
                <q-item-label caption>{{ notif.description }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle v-model="notif.enabled" color="positive" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>

        <!-- ═════════════ SECTION 5: ABOUT / SYSTEM ═════════════ -->
        <q-card flat bordered class="slt-settings-card">
          <q-card-section class="slt-section-header">
            <q-icon name="info" color="primary" size="20px" class="q-mr-sm" />
            {{ $t('settings.systemInfo') }}
          </q-card-section>
          <q-separator />

          <q-card-section class="q-pa-md">
            <q-list dense>
              <q-item v-for="info in systemInfo" :key="info.label">
                <q-item-section>
                  <q-item-label caption>{{ info.label }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-body2 text-weight-medium text-grey-8">
                    {{ info.value }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'

const $q = useQuasar()
const { t, locale } = useI18n()

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  SECTION 1 — USER PROFILE
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const profile = reactive({
  fullName: 'Ravindu Chinthana',
  email: 'ravindu.c@slt.com.lk',
  department: 'Legal Division',
  role: 'Legal Manager',
  employeeId: 'SLT-014539',
  phone: '+94 11 2 021 021',
})

const initials = computed(() => {
  const parts = profile.fullName.trim().split(/\s+/)
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : (parts[0]?.[0] || '?').toUpperCase()
})

const savingProfile = ref(false)

async function saveProfile() {
  savingProfile.value = true
  await new Promise((r) => setTimeout(r, 800))
  savingProfile.value = false
  $q.notify({
    type: 'positive',
    icon: 'check_circle',
    message: t('settings.profileSaved'),
    caption: `Changes saved for ${profile.fullName}`,
    timeout: 3000,
  })
}

function changePhoto() {
  $q.notify({
    type: 'info',
    icon: 'upload',
    message: 'Photo upload dialog',
    caption: 'File picker will open here in production',
    timeout: 2000,
  })
}

function removePhoto() {
  $q.notify({
    type: 'warning',
    icon: 'delete_outline',
    message: 'Profile photo removed',
    timeout: 2000,
  })
}

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  SECTION 2 — SECURITY
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const showCurrentPw = ref(false)
const showNewPw = ref(false)
const showConfirmPw = ref(false)
const updatingPassword = ref(false)

const passwordStrength = computed(() => {
  const pw = passwordForm.newPassword
  if (!pw) return { score: 0, label: '', color: 'grey-4' }
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++

  const levels = [
    { score: 1, label: t('settings.strengthWeak'), color: 'negative' },
    { score: 2, label: t('settings.strengthFair'), color: 'warning' },
    { score: 3, label: t('settings.strengthGood'), color: 'info' },
    { score: 4, label: t('settings.strengthStrong'), color: 'positive' },
  ]
  const level = levels[Math.max(0, score - 1)] || levels[0]
  return { score, ...level }
})

async function updatePassword() {
  if (!passwordForm.currentPassword || !passwordForm.newPassword) {
    $q.notify({ type: 'negative', message: 'Please fill in all password fields.' })
    return
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    $q.notify({ type: 'negative', message: 'Passwords do not match.' })
    return
  }
  if (passwordForm.newPassword.length < 8) {
    $q.notify({ type: 'negative', message: 'Password must be at least 8 characters.' })
    return
  }

  updatingPassword.value = true
  await new Promise((r) => setTimeout(r, 1000))
  updatingPassword.value = false

  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''

  $q.notify({
    type: 'positive',
    icon: 'lock',
    message: t('settings.passwordChanged'),
    caption: 'You may need to re-login on other devices.',
    timeout: 4000,
  })
}

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  SECTION 3 — APP PREFERENCES
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──

// — Dark mode toggle (wired to Quasar API)
function toggleDarkMode(val) {
  $q.dark.set(val)
  $q.notify({
    icon: val ? 'dark_mode' : 'light_mode',
    message: val ? t('settings.darkEnabled') : t('settings.lightEnabled'),
    color: val ? 'blue-grey-9' : 'amber-8',
    textColor: 'white',
    timeout: 1500,
  })
}

// — Language selector
const languageOptions = [
  { label: 'English', value: 'en-US' },
  { label: 'සිංහල (Sinhala)', value: 'si' },
  { label: 'தமிழ் (Tamil)', value: 'ta' },
]

const selectedLanguage = ref(locale.value)

function onLanguageChange(val) {
  locale.value = val
  const selected = languageOptions.find((l) => l.value === val)
  $q.notify({
    type: 'positive',
    icon: 'translate',
    message: t('settings.languageChanged', { lang: selected?.label || val }),
    timeout: 3000,
  })
}

// — Date format & timezone
const dateFormat = ref('DD/MM/YYYY')
const timezone = ref('Asia/Colombo (UTC+5:30)')

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  SECTION 4 — NOTIFICATION PREFERENCES
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const notificationSettings = computed(() => [
  {
    key: 'email',
    label: t('settings.emailNotif'),
    description: t('settings.emailNotifDesc'),
    icon: 'email',
    iconColor: 'primary',
    bg: 'blue-1',
    enabled: true,
  },
  {
    key: 'push',
    label: t('settings.pushNotif'),
    description: t('settings.pushNotifDesc'),
    icon: 'campaign',
    iconColor: 'orange-8',
    bg: 'orange-1',
    enabled: true,
  },
  {
    key: 'hearing',
    label: t('settings.hearingReminder'),
    description: t('settings.hearingReminderDesc'),
    icon: 'event',
    iconColor: 'negative',
    bg: 'red-1',
    enabled: true,
  },
  {
    key: 'expiry',
    label: t('settings.expiryAlert'),
    description: t('settings.expiryAlertDesc'),
    icon: 'event_busy',
    iconColor: 'purple-7',
    bg: 'purple-1',
    enabled: false,
  },
])

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  SECTION 5 — SYSTEM INFO
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const systemInfo = [
  { label: 'Application', value: 'SLT LegalEdge v1.0.0' },
  { label: 'Framework', value: 'Vue 3 + Quasar 2.18' },
  { label: 'Build', value: '2026.02.22-stable' },
  { label: 'Environment', value: 'Production' },
  { label: 'Last Login', value: '22 Feb 2026, 09:14 AM' },
  { label: 'Session Expires', value: '23 Feb 2026, 09:14 AM' },
]
</script>

<style lang="scss" scoped>
.slt-page-bg {
  min-height: 100vh;
}

.slt-settings-card {
  border-radius: 12px;
  overflow: hidden;
  transition: box-shadow 0.2s ease;
  &:hover {
    box-shadow: 0 4px 20px rgba(0, 63, 135, 0.08);
  }
}

.slt-section-header {
  display: flex;
  align-items: center;
  font-weight: 700;
  font-size: 0.85rem;
  color: #003f87;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: #eef2f8;
  padding: 12px 16px;
}

// ── Avatar ring effect ───────────────────────────────────────
.slt-avatar-ring {
  background: linear-gradient(135deg, #003f87, #1976d2, #42a5f5);
  padding: 3px;
}
.slt-avatar-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #003f87, #0d47a1);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
