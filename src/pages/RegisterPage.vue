<template>
  <div
    class="slt-login-root row no-wrap full-height"
    :class="$q.dark.isActive ? 'bg-dark' : 'bg-grey-2'"
  >
    <!-- ─── LEFT PANEL — Branding ─────────────────────────────── -->
    <div class="slt-login-brand col-12 col-md-5 column items-center justify-center q-pa-xl">
      <div class="slt-logo-ring column items-center justify-center q-mb-xl">
        <q-icon name="gavel" size="56px" color="white" />
      </div>

      <div class="text-white text-h4 text-weight-bold q-mb-xs">SLT LegalEdge</div>
      <div class="text-white text-body1 opacity-70 q-mb-xl text-center">
        Integrated Legal Management System
      </div>

      <!-- Why Register -->
      <div class="column q-gutter-sm" style="max-width: 320px; width: 100%">
        <div class="slt-feature-pill" v-for="f in benefits" :key="f.text">
          <q-icon :name="f.icon" size="18px" class="q-mr-sm" />
          {{ f.text }}
        </div>
      </div>

      <div class="text-white text-caption opacity-40 q-mt-auto q-pt-xl">
        SLT Mobitel PLC · Legal Department · v1.0.0
      </div>
    </div>

    <!-- ─── RIGHT PANEL — Register Form ───────────────────────── -->
    <div
      class="col-12 col-md-7 column items-center justify-center q-pa-xl slt-login-form-panel"
      :class="$q.dark.isActive ? 'bg-dark' : 'bg-grey-2'"
    >
      <q-card
        flat
        class="slt-login-card q-pa-xl"
        :class="$q.dark.isActive ? 'bg-grey-10 text-white' : 'bg-white'"
      >
        <!-- Success State -->
        <div v-if="registered" class="text-center q-py-xl">
          <q-icon name="mark_email_read" size="80px" color="positive" class="q-mb-lg" />
          <div class="text-h5 text-weight-bold text-positive q-mb-sm">Registration Successful!</div>
          <div class="text-body1 q-mb-lg" :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-7'">
            A confirmation email has been sent to<br />
            <strong>{{ form.email }}</strong>
          </div>
          <div class="text-body2 q-mb-xl" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-6'">
            Please check your inbox and verify your email address to activate your account.
          </div>
          <q-btn
            unelevated
            no-caps
            color="primary"
            icon="login"
            label="Go to Login"
            class="slt-login-btn q-px-xl q-py-sm"
            @click="$router.push('/login')"
          />
        </div>

        <!-- Registration Form -->
        <template v-else>
          <!-- Header -->
          <div class="text-center q-mb-lg">
            <div
              class="text-h5 text-weight-bold"
              :class="$q.dark.isActive ? 'text-blue-2' : 'text-primary'"
            >
              Create Account
            </div>
            <div
              class="text-body2 q-mt-xs"
              :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-6'"
            >
              Register to access the Legal Management System
            </div>
          </div>

          <!-- Error Banner -->
          <q-banner v-if="errorMsg" rounded dense class="bg-negative text-white q-mb-md">
            <template #avatar>
              <q-icon name="error" color="white" />
            </template>
            {{ errorMsg }}
          </q-banner>

          <q-form ref="formRef" greedy @submit.prevent="handleRegister">
            <!-- Full Name -->
            <q-input
              v-model="form.fullName"
              outlined
              dense
              label="Full Name *"
              class="q-mb-md"
              :rules="[(v) => !!v || 'Full name is required']"
              hint=" "
            >
              <template #prepend>
                <q-icon name="person" color="primary" />
              </template>
            </q-input>

            <!-- Email -->
            <q-input
              v-model="form.email"
              outlined
              dense
              label="Email Address *"
              type="email"
              class="q-mb-md"
              :rules="[
                (v) => !!v || 'Email is required',
                (v) => /.+@.+\..+/.test(v) || 'Enter a valid email',
              ]"
              hint=" "
            >
              <template #prepend>
                <q-icon name="alternate_email" color="primary" />
              </template>
            </q-input>

            <!-- Password Row -->
            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.password"
                  outlined
                  dense
                  :type="showPwd ? 'text' : 'password'"
                  label="Password *"
                  :rules="[
                    (v) => !!v || 'Password is required',
                    (v) => v.length >= 6 || 'Minimum 6 characters',
                  ]"
                  hint=" "
                >
                  <template #prepend>
                    <q-icon name="lock" color="primary" />
                  </template>
                  <template #append>
                    <q-icon
                      :name="showPwd ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      color="grey-6"
                      @click="showPwd = !showPwd"
                    />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.confirmPassword"
                  outlined
                  dense
                  :type="showPwd ? 'text' : 'password'"
                  label="Confirm Password *"
                  :rules="[
                    (v) => !!v || 'Please confirm your password',
                    (v) => v === form.password || 'Passwords do not match',
                  ]"
                  hint=" "
                >
                  <template #prepend>
                    <q-icon name="lock_outline" color="primary" />
                  </template>
                </q-input>
              </div>
            </div>

            <!-- Department + Designation Row -->
            <div class="row q-col-gutter-sm q-mb-lg">
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="form.department"
                  outlined
                  dense
                  label="Department"
                  :options="departments"
                  emit-value
                  map-options
                  hint=" "
                >
                  <template #prepend>
                    <q-icon name="business" color="primary" />
                  </template>
                </q-select>
              </div>
              <div class="col-12 col-sm-6">
                <q-input v-model="form.designation" outlined dense label="Designation" hint=" ">
                  <template #prepend>
                    <q-icon name="badge" color="primary" />
                  </template>
                </q-input>
              </div>
            </div>

            <!-- Submit -->
            <q-btn
              type="submit"
              unelevated
              no-caps
              color="primary"
              label="Create Account"
              icon="person_add"
              class="full-width q-py-sm slt-login-btn"
              :loading="loading"
              size="md"
            />
          </q-form>

          <!-- Login Link -->
          <div class="text-center q-mt-lg">
            <span :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-6'">
              Already have an account?
            </span>
            <q-btn
              flat
              no-caps
              dense
              label="Sign In"
              color="primary"
              size="sm"
              class="q-ml-xs text-weight-bold"
              @click="$router.push('/login')"
            />
          </div>
        </template>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/authStore'

const $q = useQuasar()
const authStore = useAuthStore()

const form = ref({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  department: 'Legal',
  designation: '',
})
const showPwd = ref(false)
const loading = ref(false)
const registered = ref(false)
const formRef = ref(null)
const errorMsg = ref('')

const departments = [
  'Legal',
  'Finance',
  'HR',
  'IT',
  'Engineering',
  'Operations',
  'Marketing',
  'Procurement',
  'Administration',
]

// ── REGISTER HANDLER ────────────────────────────────────────────
async function handleRegister() {
  errorMsg.value = ''
  const valid = await formRef.value?.validate()
  if (!valid) return

  loading.value = true
  try {
    await authStore.register(form.value.email, form.value.password, {
      fullName: form.value.fullName,
      department: form.value.department,
      designation: form.value.designation,
    })

    registered.value = true

    $q.notify({
      type: 'positive',
      icon: 'check_circle',
      message: 'Account created successfully! Please check your email.',
      timeout: 4000,
    })
  } catch (err) {
    console.error('Registration failed:', err)
    if (err.message?.includes('already registered')) {
      errorMsg.value = 'This email is already registered. Try signing in instead.'
    } else if (err.message?.includes('weak_password')) {
      errorMsg.value = 'Password is too weak. Use at least 6 characters.'
    } else {
      errorMsg.value = err.message || 'Registration failed. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

// ── BENEFITS LIST ──────────────────────────────────────────────
const benefits = [
  { icon: 'shield', text: 'Secure & Encrypted Platform' },
  { icon: 'gavel', text: 'Manage Legal Cases Efficiently' },
  { icon: 'handshake', text: 'Streamlined Agreement Approvals' },
  { icon: 'notifications_active', text: 'Automated Alerts & Notifications' },
  { icon: 'analytics', text: 'Real-Time Analytics & Reports' },
  { icon: 'groups', text: 'Multi-User Role-Based Access' },
]
</script>

<style lang="scss" scoped>
// ── Root ─────────────────────────────────────────────────────
.slt-login-root {
  min-height: 100vh;
}

// ── Brand panel (left) ───────────────────────────────────────
.slt-login-brand {
  background: linear-gradient(160deg, #001933 0%, #002f6c 45%, #003f87 75%, #0055a5 100%);
  position: relative;
  overflow: hidden;

  &::before,
  &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.04);
  }
  &::before {
    width: 360px;
    height: 360px;
    top: -80px;
    right: -100px;
  }
  &::after {
    width: 260px;
    height: 260px;
    bottom: -60px;
    left: -80px;
  }
}

.slt-logo-ring {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  border: 2px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 0 48px rgba(0, 100, 200, 0.35);
}

.slt-feature-pill {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.85);
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 0.82rem;
  backdrop-filter: blur(4px);
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.16);
  }
}

.slt-login-card {
  width: 100%;
  max-width: 520px;
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0, 63, 135, 0.12);
}

:global(body.body--dark) .slt-login-card {
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.slt-login-btn {
  background: linear-gradient(135deg, #002f6c, #003f87) !important;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.3px;
  transition:
    opacity 0.2s,
    transform 0.15s;

  &:hover {
    opacity: 0.92;
    transform: translateY(-1px);
  }
}
</style>
