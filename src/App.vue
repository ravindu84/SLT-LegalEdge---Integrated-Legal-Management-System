<template>
  <!-- Biometric Lock Screen -->
  <div v-if="!isUnlocked" class="fullscreen text-center flex flex-center slt-lock-screen">
    <div class="q-pa-xl" style="max-width: 400px">
      <q-icon name="admin_panel_settings" size="72px" color="primary" class="q-mb-md" />
      <div class="text-h5 text-weight-bold text-primary q-mb-sm">SLT LegalEdge Secure Access</div>
      <div class="text-subtitle2 text-grey-8 q-mb-xl">
        Classified legal environment. Biometric authentication is required to access case files.
      </div>
      <q-btn
        unelevated
        color="primary"
        size="lg"
        icon="fingerprint"
        label="Unlock App"
        class="full-width q-mb-md"
        @click="checkBiometric"
        v-if="authFailed"
      />
      <q-spinner-dots v-else color="primary" size="40px" />
    </div>
  </div>

  <router-view v-else />
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useAuthStore } from 'src/stores/authStore'
import { useSyncStore } from 'src/stores/syncStore'
import { SecurityService } from 'src/services/SecurityService'
import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'

const authStore = useAuthStore()
const syncStore = useSyncStore()
const isUnlocked = ref(false)
const authFailed = ref(false)

async function checkBiometric() {
  if (!Capacitor.isNativePlatform()) {
    isUnlocked.value = true
    return
  }
  
  // App is on mobile -> Trigger Face ID / Fingerprint / Passcode
  const success = await SecurityService.performBiometricAuth()
  if (success) {
    isUnlocked.value = true
    authFailed.value = false
  } else {
    isUnlocked.value = false
    authFailed.value = true
  }
}

onMounted(async () => {
  // 1. Wait for Auth Store to initialize
  await authStore.init()

  // 2. Only check biometrics if the user is already logged in
  if (authStore.isLoggedIn) {
    if (Capacitor.isNativePlatform()) {
      await checkBiometric()
    } else {
      isUnlocked.value = true
    }
  } else {
    // Not logged in -> Let them reach the Login Page
    isUnlocked.value = true
  }
  
  // Set up background sync listener
  syncStore.initializeNetworkListener()

  // App resume hook (re-verify biometrics if app was in background AND user is logged in)
  if (Capacitor.isNativePlatform()) {
    App.addListener('appStateChange', async ({ isActive }) => {
      if (isActive && !isUnlocked.value && authStore.isLoggedIn) {
        await checkBiometric()
      } else if (!isActive && authStore.isLoggedIn) {
        // Lock app when sending to background (only if logged in)
        isUnlocked.value = false
      }
    })
  }
})

// Watch for manual login/logout events to lock or unlock the screen
watch(
  () => authStore.isLoggedIn,
  async (newVal, oldVal) => {
    if (newVal && !oldVal && Capacitor.isNativePlatform()) {
      // User just logged in -> immediately lock and ask for fingerprint
      isUnlocked.value = false
      await checkBiometric()
    } else if (!newVal) {
      // User logged out -> ensure the unlock screen goes away so Login Page is visible
      isUnlocked.value = true
    }
  }
)
</script>

<style scoped>
.slt-lock-screen {
  background: white;
}
:global(body.body--dark) .slt-lock-screen {
  background: #0f172a;
}
</style>
