<template>
  <q-card class="summarizer-card shadow-5">
    <q-card-section class="bg-primary text-white row items-center">
      <q-icon name="auto_stories" size="sm" class="q-mr-sm" />
      <div class="text-h6">AI Document Summarizer</div>
      <q-space />
      <q-chip color="white" text-color="primary" size="sm" icon="bolt">Beta</q-chip>
    </q-card-section>

    <q-card-section class="q-pa-md">
      <div class="text-caption q-mb-md text-grey-7">
        Paste the content of a legal document below to get a smart summary (Risks, Dates, and
        Financials).
      </div>

      <q-input
        v-model="content"
        type="textarea"
        outlined
        label="Document Content"
        placeholder="Paste document text here..."
        :rows="8"
        bg-color="grey-1"
        :disable="loading"
      />

      <div class="row justify-end q-mt-md">
        <q-btn
          color="primary"
          icon="auto_awesome"
          label="Summarize with AI"
          :loading="loading"
          @click="generateSummary"
          class="summerize-btn"
        />
      </div>
    </q-card-section>

    <q-separator v-if="summary" />

    <q-transition appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
      <q-card-section v-if="summary" class="bg-blue-1 q-pa-md result-section">
        <div class="row items-center q-mb-sm">
          <q-icon name="fact_check" color="primary" size="xs" class="q-mr-xs" />
          <div class="text-subtitle2 text-weight-bold color-primary">AI Insights Summary</div>
        </div>
        <div class="summary-text" v-html="formattedSummary" />

        <div class="row q-mt-md">
          <q-btn
            flat
            dense
            color="primary"
            label="Copy Summary"
            icon="content_copy"
            size="sm"
            @click="copyToClipboard"
          />
          <q-space />
          <q-btn flat dense color="grey-7" label="Clear" icon="clear" size="sm" @click="clear" />
        </div>
      </q-card-section>
    </q-transition>
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { supabase } from 'src/boot/supabase'
import { useI18n } from 'vue-i18n'

const $q = useQuasar()
const { locale } = useI18n()

const content = ref('')
const summary = ref('')
const loading = ref(false)

const formattedSummary = computed(() => {
  if (!summary.value) return ''
  return summary.value
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
    .replace(/^- (.*)/gm, '• $1')
})

async function generateSummary() {
  if (!content.value.trim()) {
    $q.notify({
      message: 'Please provide some content to summarize.',
      color: 'warning',
      icon: 'warning',
    })
    return
  }

  loading.value = true
  summary.value = ''

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-copilot`

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        mode: 'summarize',
        content: content.value,
        language: locale.value,
      }),
    })

    const data = await response.json()

    if (data.error) throw new Error(data.error)

    summary.value = data.text || data.response
  } catch (error) {
    console.error('Summarizer Error:', error)
    $q.notify({
      message: 'Failed to generate summary. ' + error.message,
      color: 'negative',
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

function copyToClipboard() {
  navigator.clipboard.writeText(summary.value)
  $q.notify({
    message: 'Summary copied to clipboard',
    color: 'positive',
    icon: 'check',
    timeout: 1500,
  })
}

function clear() {
  content.value = ''
  summary.value = ''
}
</script>

<style lang="scss" scoped>
.summarizer-card {
  border-radius: 12px;
  overflow: hidden;
  max-width: 800px;
  margin: 0 auto;
}

.summerize-btn {
  border-radius: 8px;
  padding: 8px 24px;
}

.result-section {
  border-left: 4px solid var(--q-primary);
}

.summary-text {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #2c3e50;

  :deep(strong) {
    color: var(--q-primary);
  }
}
</style>
