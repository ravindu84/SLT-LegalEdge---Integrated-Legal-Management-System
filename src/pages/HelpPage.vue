<template>
  <q-page class="q-pa-md slt-page-bg">
    <!-- ─── Page Header ──────────────────────────────────────────── -->
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="text-h5 text-weight-bold text-primary">
          <q-icon name="help_outline" size="28px" class="q-mr-sm" />
          {{ $t('help.title') }}
        </div>
        <div class="text-caption text-grey-6">
          {{ $t('help.subtitle') }}
        </div>
      </div>
    </div>

    <!-- ─── Quick Start Cards ──────────────────────────────────── -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div v-for="qs in quickStart" :key="qs.titleKey" class="col-12 col-sm-6 col-md-3">
        <q-card
          flat
          bordered
          class="help-quick-card full-height cursor-pointer"
          @click="scrollToSection(qs.section)"
        >
          <q-card-section class="column items-center text-center q-pa-lg">
            <q-avatar :color="qs.bg" size="56px" class="q-mb-md">
              <q-icon :name="qs.icon" :color="qs.color" size="28px" />
            </q-avatar>
            <div class="text-subtitle1 text-weight-bold" :class="`text-${qs.color}`">
              {{ $t(qs.titleKey) }}
            </div>
            <div class="text-caption text-grey-6 q-mt-xs">{{ $t(qs.descKey) }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- ─── Search ─────────────────────────────────────────────── -->
    <q-card flat bordered class="q-mb-lg">
      <q-card-section class="q-py-sm">
        <q-input
          v-model="searchQuery"
          dense
          outlined
          clearable
          :placeholder="$t('help.searchPlaceholder')"
        >
          <template #prepend><q-icon name="search" /></template>
        </q-input>
      </q-card-section>
    </q-card>

    <!-- ─── Help Sections ──────────────────────────────────────── -->
    <div class="q-gutter-md">
      <!-- SECTION: Initial Documents -->
      <q-card flat bordered :id="'section-initial-docs'" v-show="matchesSearch('initial')">
        <q-card-section>
          <div class="row items-center q-mb-md">
            <q-avatar color="blue-1" size="40px" class="q-mr-md">
              <q-icon name="description" color="primary" size="22px" />
            </q-avatar>
            <div>
              <div class="text-h6 text-weight-bold text-primary">
                {{ $t('help.sections.initialDocsTitle') }}
              </div>
              <div class="text-caption text-grey-6">
                {{ $t('help.sections.initialDocsSubtitle') }}
              </div>
            </div>
          </div>

          <q-list separator>
            <q-expansion-item
              v-for="i in 4"
              :key="'idoc-' + i"
              :label="$t('help.initialDocsFaq.q' + i)"
              icon="help"
              header-class="text-weight-medium text-grey-9"
              expand-icon-class="text-primary"
            >
              <q-card flat>
                <q-card-section class="text-body2 text-grey-8 q-pt-none">
                  <div v-html="$t('help.initialDocsFaq.a' + i)"></div>
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- SECTION: Legal Cases -->
      <q-card flat bordered :id="'section-legal-cases'" v-show="matchesSearch('legal cases')">
        <q-card-section>
          <div class="row items-center q-mb-md">
            <q-avatar color="teal-1" size="40px" class="q-mr-md">
              <q-icon name="gavel" color="teal" size="22px" />
            </q-avatar>
            <div>
              <div class="text-h6 text-weight-bold text-teal">
                {{ $t('help.sections.legalCasesTitle') }}
              </div>
              <div class="text-caption text-grey-6">
                {{ $t('help.sections.legalCasesSubtitle') }}
              </div>
            </div>
          </div>

          <q-list separator>
            <q-expansion-item
              v-for="i in 5"
              :key="'lc-' + i"
              :label="$t('help.legalCasesFaq.q' + i)"
              icon="help"
              header-class="text-weight-medium text-grey-9"
              expand-icon-class="text-teal"
            >
              <q-card flat>
                <q-card-section class="text-body2 text-grey-8 q-pt-none">
                  <div v-html="$t('help.legalCasesFaq.a' + i)"></div>
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- SECTION: Agreements -->
      <q-card flat bordered :id="'section-agreements'" v-show="matchesSearch('agreements')">
        <q-card-section>
          <div class="row items-center q-mb-md">
            <q-avatar color="orange-1" size="40px" class="q-mr-md">
              <q-icon name="handshake" color="orange-8" size="22px" />
            </q-avatar>
            <div>
              <div class="text-h6 text-weight-bold text-orange-8">
                {{ $t('help.sections.agreementsTitle') }}
              </div>
              <div class="text-caption text-grey-6">
                {{ $t('help.sections.agreementsSubtitle') }}
              </div>
            </div>
          </div>

          <q-list separator>
            <q-expansion-item
              v-for="i in 4"
              :key="'agrm-' + i"
              :label="$t('help.agreementsFaq.q' + i)"
              icon="help"
              header-class="text-weight-medium text-grey-9"
              expand-icon-class="text-orange-8"
            >
              <q-card flat>
                <q-card-section class="text-body2 text-grey-8 q-pt-none">
                  <div v-html="$t('help.agreementsFaq.a' + i)"></div>
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- SECTION: Approvals -->
      <q-card flat bordered :id="'section-approvals'" v-show="matchesSearch('approvals')">
        <q-card-section>
          <div class="row items-center q-mb-md">
            <q-avatar color="purple-1" size="40px" class="q-mr-md">
              <q-icon name="verified" color="purple" size="22px" />
            </q-avatar>
            <div>
              <div class="text-h6 text-weight-bold text-purple">
                {{ $t('help.sections.approvalsTitle') }}
              </div>
              <div class="text-caption text-grey-6">
                {{ $t('help.sections.approvalsSubtitle') }}
              </div>
            </div>
          </div>

          <q-list separator>
            <q-expansion-item
              v-for="i in 3"
              :key="'appr-' + i"
              :label="$t('help.approvalsFaq.q' + i)"
              icon="help"
              header-class="text-weight-medium text-grey-9"
              expand-icon-class="text-purple"
            >
              <q-card flat>
                <q-card-section class="text-body2 text-grey-8 q-pt-none">
                  <div v-html="$t('help.approvalsFaq.a' + i)"></div>
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- SECTION: History & Reports -->
      <q-card flat bordered :id="'section-history'" v-show="matchesSearch('history')">
        <q-card-section>
          <div class="row items-center q-mb-md">
            <q-avatar color="blue-grey-1" size="40px" class="q-mr-md">
              <q-icon name="history" color="blue-grey" size="22px" />
            </q-avatar>
            <div>
              <div class="text-h6 text-weight-bold text-blue-grey">
                {{ $t('help.sections.historyTitle') }}
              </div>
              <div class="text-caption text-grey-6">{{ $t('help.sections.historySubtitle') }}</div>
            </div>
          </div>

          <q-list separator>
            <q-expansion-item
              v-for="i in 3"
              :key="'hist-' + i"
              :label="$t('help.historyFaq.q' + i)"
              icon="help"
              header-class="text-weight-medium text-grey-9"
              expand-icon-class="text-blue-grey"
            >
              <q-card flat>
                <q-card-section class="text-body2 text-grey-8 q-pt-none">
                  <div v-html="$t('help.historyFaq.a' + i)"></div>
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- SECTION: Workflow Diagram -->
      <q-card flat bordered v-show="matchesSearch('workflow')">
        <q-card-section>
          <div class="row items-center q-mb-md">
            <q-avatar color="cyan-1" size="40px" class="q-mr-md">
              <q-icon name="account_tree" color="cyan-8" size="22px" />
            </q-avatar>
            <div>
              <div class="text-h6 text-weight-bold text-cyan-8">
                {{ $t('help.sections.workflowTitle') }}
              </div>
              <div class="text-caption text-grey-6">{{ $t('help.sections.workflowSubtitle') }}</div>
            </div>
          </div>

          <!-- Visual Workflow -->
          <div class="row items-center justify-center q-gutter-md q-py-lg workflow-container">
            <div v-for="(step, idx) in workflowSteps" :key="idx" class="row items-center no-wrap">
              <div class="column items-center workflow-step">
                <q-avatar :color="step.bg" size="48px">
                  <q-icon :name="step.icon" :color="step.color" size="24px" />
                </q-avatar>
                <div
                  class="text-caption text-weight-bold q-mt-xs text-center"
                  :class="`text-${step.color}`"
                >
                  {{ $t(step.labelKey) }}
                </div>
                <div
                  class="text-caption text-grey-5 text-center"
                  style="font-size: 0.65rem; max-width: 90px"
                >
                  {{ $t(step.descKey) }}
                </div>
              </div>
              <q-icon
                v-if="idx < workflowSteps.length - 1"
                name="arrow_forward"
                size="24px"
                color="grey-4"
                class="q-mx-sm"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- SECTION: Key Terms / Glossary -->
      <q-card flat bordered v-show="matchesSearch('glossary terms SLA MOU NDA')">
        <q-card-section>
          <div class="row items-center q-mb-md">
            <q-avatar color="indigo-1" size="40px" class="q-mr-md">
              <q-icon name="menu_book" color="indigo" size="22px" />
            </q-avatar>
            <div>
              <div class="text-h6 text-weight-bold text-indigo">
                {{ $t('help.sections.glossaryTitle') }}
              </div>
              <div class="text-caption text-grey-6">
                {{ $t('help.sections.glossarySubtitle') }}
              </div>
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div v-for="term in glossaryTerms" :key="term.abbr" class="col-12 col-md-4">
              <q-card flat bordered class="full-height glossary-card">
                <q-card-section>
                  <div class="row items-center q-mb-sm">
                    <q-badge
                      :color="term.badgeColor"
                      rounded
                      class="q-pa-sm text-weight-bold"
                      style="font-size: 0.85rem"
                    >
                      {{ term.abbr }}
                    </q-badge>
                    <span class="text-subtitle2 text-weight-bold q-ml-sm text-grey-8">
                      {{ term.fullForm }}
                    </span>
                  </div>
                  <div class="text-body2 text-grey-7" v-html="$t(term.descKey)"></div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- SECTION: Contact Support -->
      <q-card flat bordered class="q-mb-xl" v-show="matchesSearch('support contact')">
        <q-card-section>
          <div class="row items-center q-mb-md">
            <q-avatar color="red-1" size="40px" class="q-mr-md">
              <q-icon name="support_agent" color="red" size="22px" />
            </q-avatar>
            <div>
              <div class="text-h6 text-weight-bold text-red">
                {{ $t('help.sections.contactTitle') }}
              </div>
              <div class="text-caption text-grey-6">{{ $t('help.sections.contactSubtitle') }}</div>
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-4">
              <q-card flat bordered class="q-pa-md text-center">
                <q-icon name="email" size="32px" color="primary" />
                <div class="text-weight-bold q-mt-sm">{{ $t('help.contact.emailTitle') }}</div>
                <div class="text-caption text-grey-6">{{ $t('help.contact.emailValue') }}</div>
              </q-card>
            </div>
            <div class="col-12 col-sm-4">
              <q-card flat bordered class="q-pa-md text-center">
                <q-icon name="phone" size="32px" color="positive" />
                <div class="text-weight-bold q-mt-sm">{{ $t('help.contact.phoneTitle') }}</div>
                <div class="text-caption text-grey-6">{{ $t('help.contact.phoneValue') }}</div>
              </q-card>
            </div>
            <div class="col-12 col-sm-4">
              <q-card flat bordered class="q-pa-md text-center">
                <q-icon name="chat" size="32px" color="info" />
                <div class="text-weight-bold q-mt-sm">{{ $t('help.contact.chatTitle') }}</div>
                <div class="text-caption text-grey-6">{{ $t('help.contact.chatValue') }}</div>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const searchQuery = ref('')

function matchesSearch(sectionKeywords) {
  if (!searchQuery.value?.trim()) return true
  const q = searchQuery.value.toLowerCase()
  return sectionKeywords.toLowerCase().includes(q)
}

function scrollToSection(sectionId) {
  const el = document.getElementById(sectionId)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// ── Quick Start Cards ─────────────────────────────────────────
const quickStart = [
  {
    titleKey: 'help.qs.initialDocsTitle',
    descKey: 'help.qs.initialDocsDesc',
    icon: 'description',
    color: 'primary',
    bg: 'blue-1',
    section: 'section-initial-docs',
  },
  {
    titleKey: 'help.qs.legalCasesTitle',
    descKey: 'help.qs.legalCasesDesc',
    icon: 'gavel',
    color: 'teal',
    bg: 'teal-1',
    section: 'section-legal-cases',
  },
  {
    titleKey: 'help.qs.agreementsTitle',
    descKey: 'help.qs.agreementsDesc',
    icon: 'handshake',
    color: 'orange-8',
    bg: 'orange-1',
    section: 'section-agreements',
  },
  {
    titleKey: 'help.qs.approvalsTitle',
    descKey: 'help.qs.approvalsDesc',
    icon: 'verified',
    color: 'purple',
    bg: 'purple-1',
    section: 'section-approvals',
  },
]

// ── Workflow Steps ────────────────────────────────────────────
const workflowSteps = [
  {
    labelKey: 'help.workflow.submit',
    descKey: 'help.workflow.submitDesc',
    icon: 'upload_file',
    color: 'primary',
    bg: 'blue-1',
  },
  {
    labelKey: 'help.workflow.review',
    descKey: 'help.workflow.reviewDesc',
    icon: 'rate_review',
    color: 'orange-8',
    bg: 'orange-1',
  },
  {
    labelKey: 'help.workflow.approve',
    descKey: 'help.workflow.approveDesc',
    icon: 'verified',
    color: 'purple',
    bg: 'purple-1',
  },
  {
    labelKey: 'help.workflow.caseCreated',
    descKey: 'help.workflow.caseCreatedDesc',
    icon: 'gavel',
    color: 'teal',
    bg: 'teal-1',
  },
  {
    labelKey: 'help.workflow.proceedings',
    descKey: 'help.workflow.proceedingsDesc',
    icon: 'event_note',
    color: 'info',
    bg: 'light-blue-1',
  },
  {
    labelKey: 'help.workflow.closed',
    descKey: 'help.workflow.closedDesc',
    icon: 'check_circle',
    color: 'positive',
    bg: 'green-1',
  },
  {
    labelKey: 'help.workflow.history',
    descKey: 'help.workflow.historyDesc',
    icon: 'history',
    color: 'blue-grey',
    bg: 'blue-grey-1',
  },
]

// ── Glossary Terms ────────────────────────────────────────────
const glossaryTerms = [
  {
    abbr: 'SLA',
    fullForm: 'Service Level Agreement',
    descKey: 'help.glossary.slaDesc',
    badgeColor: 'primary',
  },
  {
    abbr: 'MOU',
    fullForm: 'Memorandum of Understanding',
    descKey: 'help.glossary.mouDesc',
    badgeColor: 'teal',
  },
  {
    abbr: 'NDA',
    fullForm: 'Non-Disclosure Agreement',
    descKey: 'help.glossary.ndaDesc',
    badgeColor: 'deep-orange',
  },
]
</script>

<style lang="scss" scoped>
.help-quick-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  border-radius: 12px;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
}

.workflow-container {
  overflow-x: auto;
}

.workflow-step {
  min-width: 80px;
}

.glossary-card {
  border-radius: 12px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  }
}
</style>
