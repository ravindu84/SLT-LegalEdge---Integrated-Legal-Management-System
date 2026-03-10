<template>
  <div
    class="slt-login-root row no-wrap full-height"
    :class="$q.dark.isActive ? 'bg-dark' : 'bg-grey-2'"
  >
    <!-- ─── LEFT PANEL — Branding ─────────────────────────────── -->
    <div class="slt-login-brand col-12 col-md-5 column items-center justify-center q-pa-xl">
      <!-- Logo -->
      <div class="q-mb-lg">
        <img src="~assets/logo-3d.png" style="width: 280px" />
      </div>

      <div class="text-white text-body1 opacity-70 q-mb-xl text-center">
        Integrated Legal Management System
      </div>

      <!-- BRD feature pills -->
      <div class="column q-gutter-sm" style="max-width: 320px; width: 100%">
        <div class="slt-feature-pill" v-for="f in features" :key="f.text">
          <q-icon :name="f.icon" size="18px" class="q-mr-sm" />
          {{ f.text }}
        </div>
      </div>

      <div class="text-white text-caption opacity-40 q-mt-auto q-pt-xl text-center">
        SLT Mobitel PLC · Legal Department · v1.0.0<br />
        <span class="text-weight-bold" style="letter-spacing: 1px">NEXGEN CREATORS</span>
      </div>
    </div>

    <!-- ─── RIGHT PANEL — Login Form ──────────────────────────── -->
    <div
      class="col-12 col-md-7 column items-center justify-center q-pa-xl slt-login-form-panel"
      :class="$q.dark.isActive ? 'bg-dark' : 'bg-grey-2'"
    >
      <q-card
        flat
        class="slt-login-card q-pa-xl"
        :class="$q.dark.isActive ? 'bg-grey-10 text-white' : 'bg-white'"
      >
        <!-- Header -->
        <div class="text-center q-mb-xl">
          <div
            class="text-h5 text-weight-bold"
            :class="$q.dark.isActive ? 'text-blue-2' : 'text-primary'"
          >
            Welcome back
          </div>
          <div class="text-body2 q-mt-xs" :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-6'">
            Sign in to access the Legal Management System
          </div>
        </div>

        <!-- Error Banner -->
        <q-banner v-if="errorMsg" rounded dense class="bg-negative text-white q-mb-md">
          <template #avatar>
            <q-icon name="error" color="white" />
          </template>
          {{ errorMsg }}
        </q-banner>

        <!-- Form -->
        <q-form ref="formRef" greedy @submit.prevent="handleLogin">
          <!-- Email -->
          <q-input
            v-model="form.email"
            outlined
            dense
            label="Email Address"
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

          <!-- Password -->
          <q-input
            v-model="form.password"
            outlined
            dense
            :type="showPwd ? 'text' : 'password'"
            label="Password"
            class="q-mb-sm"
            :rules="[(v) => !!v || 'Password is required']"
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

          <!-- Remember + Forgot -->
          <div class="row items-center justify-between q-mb-xl">
            <q-checkbox v-model="rememberMe" label="Remember me" size="sm" color="primary" />
            <q-btn flat no-caps dense label="Forgot password?" color="primary" size="sm" />
          </div>

          <!-- Submit -->
          <q-btn
            type="submit"
            unelevated
            no-caps
            color="primary"
            label="Sign In"
            icon="login"
            class="full-width q-py-sm slt-login-btn"
            :loading="loading"
            size="md"
          />
        </q-form>

        <!-- Register Link -->
        <div class="text-center q-mt-lg">
          <span :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-6'">
            Don't have an account?
          </span>
          <q-btn
            flat
            no-caps
            dense
            label="Create Account"
            color="primary"
            size="sm"
            class="q-ml-xs text-weight-bold"
            @click="$router.push('/register')"
          />
        </div>

        <!-- Footer note -->
        <div class="text-center text-caption text-grey-5 q-mt-xl">
          For access issues, contact the IT Helpdesk at<br />
          <strong>ext. 2888</strong> or <strong>itsupport@slt.com.lk</strong>
        </div>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/authStore'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: '',
})
const showPwd = ref(false)
const rememberMe = ref(true)
const loading = ref(false)
const formRef = ref(null)
const errorMsg = ref('')

// ── LOGIN HANDLER ──────────────────────────────────────────────
async function handleLogin() {
  errorMsg.value = ''
  const valid = await formRef.value?.validate()
  if (!valid) return

  loading.value = true
  try {
    await authStore.login(form.value.email, form.value.password)

    $q.notify({
      type: 'positive',
      icon: 'check_circle',
      message: `Welcome back, ${authStore.displayName}!`,
      timeout: 2500,
    })

    router.push('/')
  } catch (err) {
    console.error('Login failed:', err)
    if (err.message?.includes('Invalid login credentials')) {
      errorMsg.value = 'Invalid email or password. Please try again.'
    } else if (err.message?.includes('Email not confirmed')) {
      errorMsg.value = 'Please verify your email address before signing in.'
    } else {
      errorMsg.value = err.message || 'Login failed. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

// ── FEATURE LIST ───────────────────────────────────────────────
const features = [
  { icon: 'gavel', text: 'End-to-end Legal Case Management' },
  { icon: 'handshake', text: 'Agreement Approval Workflows' },
  { icon: 'task_alt', text: 'Multi-Level Approval Inbox' },
  { icon: 'bar_chart', text: 'Real-Time Reporting & Dashboards' },
  { icon: 'verified_user', text: 'Role-Based Access Control' },
  { icon: 'history', text: 'Complete Audit Trail' },
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

  // decorative circles
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

// ── Logo ring ────────────────────────────────────────────────
.slt-logo-ring {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  border: 2px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 0 48px rgba(0, 100, 200, 0.35);
}

// ── Feature pills ─────────────────────────────────────────────
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

// ── Form panel (right) ───────────────────────────────────────

.slt-login-card {
  width: 100%;
  max-width: 460px;
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0, 63, 135, 0.12);
}

:global(body.body--dark) .slt-login-card {
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

// ── Login button ─────────────────────────────────────────────
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
