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
import { onMounted, ref } from 'vue'
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
  // Initial Authorization Check
  await checkBiometric()
  
  // Set up background sync listener
  syncStore.initializeNetworkListener()
  
  // Auth Store Init
  authStore.init()

  // App resume hook (re-verify biometrics if app was in background)
  if (Capacitor.isNativePlatform()) {
    App.addListener('appStateChange', async ({ isActive }) => {
      if (isActive && !isUnlocked.value) {
        await checkBiometric()
      } else if (!isActive) {
        // Lock app when sending to background
        isUnlocked.value = false
      }
    })
  }
})
</script>

<style scoped>
.slt-lock-screen {
  background: white;
}
:global(body.body--dark) .slt-lock-screen {
  background: #0f172a;
}
</style>
