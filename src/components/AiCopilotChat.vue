<template>
  <!-- Floating AI Chat FAB Button -->
  <q-btn
    v-if="!chatOpen"
    fab
    icon="smart_toy"
    color="primary"
    class="ai-fab"
    @click="chatOpen = true"
  >
    <q-tooltip>{{ $t('aiCopilot.title') }}</q-tooltip>
    <div class="ai-fab-pulse" />
  </q-btn>

  <!-- Chat Panel -->
  <transition name="chat-slide">
    <div v-if="chatOpen" class="ai-chat-panel shadow-10">
      <!-- Header -->
      <div class="ai-chat-header row items-center no-wrap q-px-md q-py-sm">
        <q-avatar size="36px" color="white" text-color="primary" class="q-mr-sm">
          <q-icon name="smart_toy" size="22px" />
        </q-avatar>
        <div class="col">
          <div class="text-subtitle1 text-weight-bold text-white">
            {{ $t('aiCopilot.title') }}
          </div>
          <div class="text-caption" style="color: rgba(255, 255, 255, 0.7); font-size: 0.65rem">
            {{ $t('aiCopilot.subtitle') }}
          </div>
        </div>
        <q-btn flat round dense icon="remove" color="white" size="sm" @click="chatOpen = false" />
      </div>

      <!-- Messages Area -->
      <div ref="messagesContainer" class="ai-chat-messages">
        <div
          v-for="(msg, idx) in messages"
          :key="idx"
          class="ai-msg-row"
          :class="msg.role === 'user' ? 'ai-msg-user' : 'ai-msg-bot'"
        >
          <q-avatar
            v-if="msg.role === 'bot'"
            size="28px"
            color="primary"
            text-color="white"
            class="q-mr-xs ai-bot-avatar"
          >
            <q-icon name="smart_toy" size="16px" />
          </q-avatar>
          <div class="ai-msg-bubble" v-html="formatMessage(msg.text)" />
        </div>

        <!-- Typing indicator -->
        <div v-if="isTyping" class="ai-msg-row ai-msg-bot">
          <q-avatar size="28px" color="primary" text-color="white" class="q-mr-xs ai-bot-avatar">
            <q-icon name="smart_toy" size="16px" />
          </q-avatar>
          <div class="ai-msg-bubble ai-typing">
            <span class="ai-dot" /><span class="ai-dot" /><span class="ai-dot" />
          </div>
        </div>
      </div>

      <!-- Quick Suggestions -->
      <div v-if="messages.length <= 1" class="ai-suggestions q-px-md q-pb-xs">
        <q-chip
          v-for="(s, i) in suggestions"
          :key="i"
          clickable
          outline
          color="primary"
          size="sm"
          class="q-mr-xs q-mb-xs"
          @click="sendMessage(s.text)"
        >
          <q-icon :name="s.icon" size="14px" class="q-mr-xs" />
          {{ s.label }}
        </q-chip>
      </div>

      <!-- Input Area -->
      <div class="ai-chat-input row items-center no-wrap q-px-sm q-py-xs">
        <q-input
          v-model="userInput"
          dense
          outlined
          rounded
          :placeholder="$t('aiCopilot.placeholder')"
          class="col"
          bg-color="grey-1"
          @keyup.enter="sendMessage(userInput)"
        >
          <template #append>
            <q-btn
              flat
              round
              dense
              icon="send"
              color="primary"
              :disable="!userInput.trim() || isTyping"
              @click="sendMessage(userInput)"
            />
          </template>
        </q-input>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, nextTick, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { supabase } from 'src/boot/supabase'

const { t, locale } = useI18n()

const chatOpen = ref(false)
const userInput = ref('')
const isTyping = ref(false)
const messagesContainer = ref(null)

// Messages array
const messages = ref([
  {
    role: 'bot',
    text: '', // will be set by computed welcome
  },
])

// Set welcome message reactively
messages.value[0].text = computed(() => t('aiCopilot.welcome')).value

// Quick suggestion chips
const suggestions = computed(() => [
  {
    icon: 'description',
    label: t('aiCopilot.suggestions.pendingDocs'),
    text: 'How many documents are pending approval?',
  },
  {
    icon: 'gavel',
    label: t('aiCopilot.suggestions.openCases'),
    text: 'Show me all open legal cases',
  },
  {
    icon: 'event_busy',
    label: t('aiCopilot.suggestions.expiringAgreements'),
    text: 'What agreements are expiring soon?',
  },
  {
    icon: 'analytics',
    label: t('aiCopilot.suggestions.systemOverview'),
    text: 'Give me a system overview',
  },
])

// Format markdown-like text to HTML
function formatMessage(text) {
  if (!text) return ''
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/^- (.*)/gm, '• $1')
    .replace(/^(\d+)\. (.*)/gm, '$1. $2')
    .replace(/\n/g, '<br>')
    .replace(
      /> (.*)/g,
      '<blockquote style="border-left:3px solid #1976d2;padding-left:8px;margin:4px 0;color:#666">$1</blockquote>',
    )
}

// Scroll to bottom of messages
async function scrollToBottom() {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// Comprehensive mock dictionary for demo mode
const mockResponses = {
  // Direct matches (Suggestion Chips)
  'How many documents are pending approval?':
    'There are currently **12 documents** pending primary approval and **5** under senior legal review.',
  'Show me all open legal cases':
    'I found **28 open cases**. The most urgent is *SLT vs. Vendor X* regarding contract breach.',
  'What agreements are expiring soon?':
    'The *Fiber Optic Supply Agreement* expires in **14 days**. Three other MOUs are due next month.',
  'Give me a system overview':
    'The SLT LegalEdge system is currently tracking **145 active files**, with an average processing time of **4.2 days** per document.',

  // Common multi-turn phrases
  hi: 'Hello! I am LegalEdge AI. How can I assist you with your legal documents today?',
  hello: 'Hello! I am LegalEdge AI. How can I assist you with your legal documents today?',
  thanks: "You're very welcome! Is there anything else I can help you with in the system?",
  'thank you': "You're welcome! Happy to help. Let me know if you need anything else.",
  great: "Excellent! I'm here if you need more analysis or summaries.",
  ok: "Perfect. I'm standing by for your next request.",
  bye: 'Goodbye! Have a productive day managing your legal cases.',
}

// Keyword-based local matcher for demo stability
function getLocalMockResponse(input) {
  const text = input.toLowerCase()

  // Exact matches first
  if (mockResponses[input]) return mockResponses[input]
  if (mockResponses[text]) return mockResponses[text]

  // Keyword matching
  if (text.includes('status'))
    return 'Most documents are in the **Pending** or **Under Review** phase. You can check the dashboard for a full breakdown.'
  if (text.includes('case'))
    return 'I can see several active cases. Would you like me to summarize one from the **Initial Documents** page?'
  if (text.includes('summary') || text.includes('summarize'))
    return 'I can certainly help with that! Just click the **magic wand icon** next to any document in the list to get an instant AI summary.'
  if (text.includes('help'))
    return 'I can help you navigate cases, summarize facts, or check agreement statuses. What would you like to do?'

  return null
}

// Send message to AI Edge Function
async function sendMessage(text) {
  if (!text?.trim() || isTyping.value) return

  const userMsg = text.trim()
  userInput.value = ''

  // Add user message
  messages.value.push({ role: 'user', text: userMsg })
  await scrollToBottom()

  // Show typing indicator
  isTyping.value = true
  await scrollToBottom()

  try {
    // Check if we can handle this locally (Simulation Mode)
    const localResponse = getLocalMockResponse(userMsg)
    if (localResponse) {
      await new Promise((resolve) => setTimeout(resolve, 800)) // Realism delay
      messages.value.push({ role: 'bot', text: localResponse })
      return
    }

    // Call Edge Function with 5-second timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('REQUEST_TIMEOUT')), 5000),
    )

    const invokePromise = supabase.functions.invoke('ai-copilot', {
      body: { message: userMsg, mode: 'chat', language: locale.value },
    })

    const { data: responseData, error: invokeError } = await Promise.race([
      invokePromise,
      timeoutPromise,
    ])

    if (invokeError) {
      // For any error in demo mode, show the friendly "Demo Mode" fallback
      messages.value.push({
        role: 'bot',
        text: `👋 **LegalEdge AI is in Demo Mode.**\n\nYou asked: "${userMsg}".\n\nI'm ready to analyze this! however, I need a valid **GEMINI_API_KEY** in my project settings to provide real-time logic. \n\nIn the meantime, you can try asking about **status**, **cases**, or click the suggestion chips!`,
      })
    } else if (responseData?.error) {
      messages.value.push({ role: 'bot', text: `⚠️ ${responseData.error}` })
    } else {
      messages.value.push({
        role: 'bot',
        text:
          responseData.text || responseData.response || "I'm sorry, I couldn't get a clear answer.",
      })
    }
  } catch (error) {
    console.error('AI Chat Error:', error)
    // Friendly error handler for demo
    messages.value.push({
      role: 'bot',
      text: "🕒 **Demo Mode Note:**\n\nI'm having trouble reaching my high-intelligence server right now. Try a standard question or check the configuration instructions in the implementation plan!",
    })
  } finally {
    isTyping.value = false
    await scrollToBottom()
  }
}
</script>

<style lang="scss" scoped>
// ── FAB Button ────────────────────────────────────────────────
.ai-fab {
  position: fixed !important;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  box-shadow: 0 6px 20px rgba(25, 118, 210, 0.4);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 8px 28px rgba(25, 118, 210, 0.5);
  }
}

.ai-fab-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(25, 118, 210, 0.3);
  animation: fabPulse 2s ease-in-out infinite;
  pointer-events: none;
}

@keyframes fabPulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.4);
    opacity: 0;
  }
}

// ── Chat Panel ────────────────────────────────────────────────
.ai-chat-panel {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 380px;
  max-height: 560px;
  border-radius: 16px;
  overflow: hidden;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.08);

  @media (max-width: 480px) {
    width: calc(100vw - 16px);
    right: 8px;
    bottom: 8px;
    max-height: calc(100vh - 80px);
  }
}

// ── Header ────────────────────────────────────────────────────
.ai-chat-header {
  background: linear-gradient(135deg, #1565c0 0%, #0d47a1 100%);
  min-height: 56px;
}

// ── Messages ──────────────────────────────────────────────────
.ai-chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  max-height: 360px;
  min-height: 200px;
  background: #f8f9fa;
}

.ai-msg-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;

  &.ai-msg-user {
    justify-content: flex-end;
  }
}

.ai-msg-bubble {
  max-width: 85%;
  padding: 8px 12px;
  border-radius: 14px;
  font-size: 0.82rem;
  line-height: 1.45;
  word-wrap: break-word;

  .ai-msg-user & {
    background: linear-gradient(135deg, #1976d2, #1565c0);
    color: #fff;
    border-bottom-right-radius: 4px;
  }

  .ai-msg-bot & {
    background: #fff;
    color: #333;
    border: 1px solid #e8e8e8;
    border-bottom-left-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  }

  :deep(strong) {
    font-weight: 700;
  }
  :deep(code) {
    background: rgba(0, 0, 0, 0.06);
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 0.78rem;
  }
}

.ai-bot-avatar {
  flex-shrink: 0;
  margin-top: 2px;
}

// ── Typing Indicator ──────────────────────────────────────────
.ai-typing {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 16px !important;
}

.ai-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #90caf9;
  animation: dotBounce 1.4s ease-in-out infinite;

  &:nth-child(2) {
    animation-delay: 0.2s;
  }
  &:nth-child(3) {
    animation-delay: 0.4s;
  }
}

@keyframes dotBounce {
  0%,
  80%,
  100% {
    transform: scale(0.6);
    opacity: 0.4;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

// ── Suggestions ───────────────────────────────────────────────
.ai-suggestions {
  background: #fff;
  border-top: 1px solid #f0f0f0;
  padding-top: 8px;
}

// ── Input Area ────────────────────────────────────────────────
.ai-chat-input {
  background: #fff;
  border-top: 1px solid #eee;
}

// ── Transition ────────────────────────────────────────────────
.chat-slide-enter-active,
.chat-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.chat-slide-enter-from,
.chat-slide-leave-to {
  transform: translateY(20px) scale(0.95);
  opacity: 0;
}
</style>
