<template>
  <q-card flat bordered class="full-height">
    <q-card-section class="row items-center slt-section-header q-py-sm q-px-md">
      <q-icon name="smartphone" color="primary" size="20px" class="q-mr-sm" />
      <span class="text-weight-bold">{{ $t('dashboard.mobileApp', 'Mobile Native App') }}</span>
      <q-space />
      <q-badge color="positive" label="NEW" rounded />
    </q-card-section>
    <q-separator />
    <q-card-section class="row items-center q-pa-md">
      <div class="col-auto q-mr-md" style="background: white; padding: 10px; border-radius: 8px;">
        <qrcode-vue :value="appLink" :size="100" level="H" foreground="#002f6c" />
      </div>
      <div class="col">
        <div class="text-subtitle1 text-weight-bold text-primary q-mb-xs">
          SLT LegalEdge Mobile
        </div>
        <div class="text-caption text-grey-7 q-mb-sm">
          Access case files offline, authenticate securely with Biometrics, and stay synced in courtrooms.
        </div>
        <q-btn
          outline
          no-caps
          color="primary"
          icon="download"
          label="Download APK"
          size="sm"
          @click="downloadApk"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'
import QrcodeVue from 'qrcode.vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const appLink = ref(window.location.origin + '/download/app-release.apk')

function downloadApk() {
  $q.notify({
    type: 'ongoing',
    message: 'Downloading LegalEdge Native App...',
    timeout: 1500,
  })
  setTimeout(() => {
    // Mock download action for preview
    const link = document.createElement('a')
    link.href = 'data:application/vnd.android.package-archive;base64,'
    link.download = 'SLT-LegalEdge-v1.0.apk'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    $q.notify({
      type: 'positive',
      message: 'APK downloaded successfully.',
      icon: 'check_circle',
    })
  }, 1600)
}
</script>

<style scoped>
.slt-section-header {
  background: rgba(0, 0, 0, 0.02);
}
:global(body.body--dark) .slt-section-header {
  background: rgba(255, 255, 255, 0.03);
}
</style>
