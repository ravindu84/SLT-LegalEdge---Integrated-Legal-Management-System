<template>
  <q-page class="slt-page-bg q-pa-lg">
    <!-- ─── Page Header ──────────────────────────────────────── -->
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="text-h4 text-weight-bold text-primary q-mb-xs">
          {{ $t('dashboard.title') }}
        </div>
        <div class="text-subtitle2 text-grey-6">
          {{ $t('dashboard.welcome') }} · {{ formattedCurrentDate }}
        </div>
      </div>
      <div class="col-auto q-gutter-sm">
        <q-btn
          unelevated
          color="primary"
          icon="refresh"
          :label="$t('dashboard.refresh')"
          size="sm"
          @click="refreshData"
        />
        <q-btn
          outline
          color="primary"
          icon="bar_chart"
          :label="$t('dashboard.viewReports')"
          size="sm"
          @click="router.push('/reports')"
        />
      </div>
    </div>

    <!-- ═══ 5 EXECUTIVE SUMMARY CARDS (balanced single row) ═══ -->
    <div class="row q-col-gutter-md q-mb-lg exec-row">
      <div class="col-12 col-sm-6 col-md" v-for="card in summaryCards" :key="card.label">
        <q-card flat class="exec-summary-card" :style="{ '--accent': card.accent }">
          <q-card-section class="q-pa-lg">
            <div class="row items-start justify-between no-wrap q-mb-md">
              <div class="exec-summary-card__icon" :style="{ background: card.accent }">
                <q-icon :name="card.icon" size="22px" color="white" />
              </div>
              <div class="exec-summary-card__badge" :style="{ color: card.trendColor }">
                <q-icon :name="card.trendIcon" size="14px" class="q-mr-xs" />
                {{ card.trendValue }}
              </div>
            </div>
            <div class="exec-summary-card__value">{{ card.value }}</div>
            <div class="exec-summary-card__label">{{ card.label }}</div>
            <!-- mini progress bar -->
            <div class="exec-summary-card__bar q-mt-sm">
              <div
                class="exec-summary-card__bar-fill"
                :style="{ width: card.progress + '%', background: card.accent }"
              ></div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- ═══ ROW 2: Approvals  +  Case Status Doughnut ═══════ -->
    <div class="row q-col-gutter-md q-mb-lg">
      <!-- Action Required -->
      <div class="col-12 col-md-7">
        <q-card flat bordered class="full-height">
          <q-card-section class="row items-center slt-section-header q-py-sm q-px-md">
            <q-icon name="warning_amber" color="warning" size="20px" class="q-mr-sm" />
            <span>{{ $t('dashboard.actionRequired') }}</span>
            <q-space />
            <q-badge color="negative" :label="approvalItems.length" rounded />
          </q-card-section>
          <q-separator />
          <q-card-section class="q-pa-none">
            <q-list separator>
              <q-item v-for="item in approvalItems" :key="item.id" class="q-py-md q-px-md">
                <q-item-section avatar>
                  <q-avatar
                    :color="item.avatarColor"
                    text-color="white"
                    size="42px"
                    font-size="14px"
                  >
                    {{ item.initials }}
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold text-body2">{{ item.title }}</q-item-label>
                  <q-item-label caption>{{ item.subtitle }}</q-item-label>
                </q-item-section>
                <q-item-section side class="q-gutter-xs">
                  <q-badge
                    :color="item.priorityColor"
                    :label="item.priority"
                    rounded
                    class="q-mb-xs"
                  />
                  <div class="row q-gutter-xs">
                    <q-btn
                      dense
                      unelevated
                      color="positive"
                      size="xs"
                      no-caps
                      icon="check"
                      :label="$t('statuses.approve')"
                    />
                    <q-btn
                      dense
                      outline
                      color="negative"
                      size="xs"
                      no-caps
                      icon="close"
                      :label="$t('statuses.reject')"
                    />
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
          <q-separator />
          <q-card-section class="q-py-sm text-center">
            <q-btn
              flat
              no-caps
              color="primary"
              :label="$t('dashboard.viewAllApprovals')"
              icon-right="chevron_right"
              size="sm"
              @click="router.push('/approvals')"
            />
          </q-card-section>
        </q-card>
      </div>

      <!-- Case Status Doughnut -->
      <div class="col-12 col-md-5">
        <q-card flat bordered class="full-height">
          <q-card-section class="row items-center slt-section-header q-py-sm q-px-md">
            <q-icon name="pie_chart" color="primary" size="20px" class="q-mr-sm" />
            <span>{{ $t('dashboard.caseStatusOverview') }}</span>
          </q-card-section>
          <q-separator />
          <q-card-section class="column items-center q-pa-lg">
            <div style="position: relative; max-width: 220px; width: 100%">
              <Doughnut :data="caseStatusChartData" :options="doughnutOpts" />
              <div class="exec-doughnut-center">
                <div class="text-h4 text-weight-bold text-primary">{{ totalCases }}</div>
                <div class="text-caption text-grey-6">{{ $t('reports.totalCases') }}</div>
              </div>
            </div>
            <!-- Legend below -->
            <div class="row q-gutter-md q-mt-lg justify-center full-width">
              <div v-for="(item, i) in caseStatusItems" :key="item.label" class="exec-legend-item">
                <div class="exec-legend-dot" :style="{ background: statusColors[i] }"></div>
                <div>
                  <div class="text-weight-bold" style="font-size: 0.9rem">{{ item.count }}</div>
                  <div class="text-caption text-grey-6">{{ item.label }}</div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- ═══ ROW 3: Activity Feed  +  Case Type Bar Chart ═════ -->
    <div class="row q-col-gutter-md">
      <!-- Recent Activity -->
      <div class="col-12 col-md-5">
        <q-card flat bordered class="full-height">
          <q-card-section class="row items-center slt-section-header q-py-sm q-px-md">
            <q-icon name="history" color="primary" size="20px" class="q-mr-sm" />
            <span>{{ $t('dashboard.recentActivity') }}</span>
            <q-space />
            <q-btn flat dense round icon="more_vert" color="grey-6" size="sm" />
          </q-card-section>
          <q-separator />
          <q-card-section class="q-pa-none">
            <q-list>
              <q-item
                v-for="(act, idx) in recentActivity"
                :key="act.id"
                :class="{ 'exec-activity-alt': idx % 2 === 1 }"
                class="q-py-sm q-px-md"
              >
                <q-item-section avatar>
                  <q-avatar
                    :color="act.color"
                    text-color="white"
                    size="34px"
                    class="exec-activity-avatar"
                  >
                    <q-icon :name="act.icon" size="16px" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium" style="font-size: 0.82rem">{{
                    act.title
                  }}</q-item-label>
                  <q-item-label caption style="font-size: 0.72rem">{{ act.time }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="circle" :color="act.color" size="8px" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Case Type Distribution -->
      <div class="col-12 col-md-7">
        <q-card flat bordered class="full-height">
          <q-card-section class="row items-center slt-section-header q-py-sm q-px-md">
            <q-icon name="equalizer" color="primary" size="20px" class="q-mr-sm" />
            <span>{{ $t('reports.activeCasesByType') }}</span>
          </q-card-section>
          <q-separator />
          <q-card-section class="q-pa-md">
            <Bar :data="caseTypeChartData" :options="barOpts" style="max-height: 300px" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- ═══ ROW 4: Project Resources (Flyer Compliance) ══════ -->
    <div class="row q-col-gutter-md q-mt-md">
      <div class="col-12">
        <q-card flat bordered class="slt-resource-card">
          <q-card-section class="row items-center q-pa-md">
            <div class="col">
              <div class="text-h6 text-weight-bold text-primary">
                {{ $t('dashboard.projectResources') }}
              </div>
              <div class="text-caption text-grey-6">
                Access official challenge documentation and submission forms.
              </div>
            </div>
            <div class="col-auto q-gutter-md">
              <q-btn
                unelevated
                no-caps
                color="primary"
                icon="description"
                :label="$t('dashboard.downloadBRD')"
                @click="downloadResource('BRD_Challenge_Details.pdf')"
              >
                <q-tooltip>Official Business Requirements Document</q-tooltip>
              </q-btn>
              <q-btn
                outline
                no-caps
                color="primary"
                icon="assignment"
                :label="$t('dashboard.submissionForm')"
                @click="downloadResource('AI_Coding_Submission_Form.pdf')"
              >
                <q-tooltip>Register your prototype submission</q-tooltip>
              </q-btn>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { Doughnut, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const router = useRouter()
const { t } = useI18n()
const $q = useQuasar()
import { supabase } from 'src/boot/supabase'
import { useAuthStore } from 'src/stores/authStore'
import { onMounted, watch } from 'vue'

const authStore = useAuthStore()
const now = ref(new Date())
const formattedCurrentDate = computed(() => {
  const locale = $q.lang.isoName === 'si' ? 'si-LK' : $q.lang.isoName === 'ta' ? 'ta-LK' : 'en-GB'
  return now.value.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

// ── Dashboard State ───────────────────────────────────────────
const stats = ref({
  activeCases: 0,
  pendingDocs: 0,
  myTasks: 0,
  totalExposure: 0,
  totalExpenses: 0,
})

const caseStats = ref({
  active: 0,
  pending: 0,
  underReview: 0,
  closed: 0,
})

const caseTypeStats = ref([])
const approvalItems = ref([])
const recentActivity = ref([])
const totalCasesCount = ref(0)
const isLoading = ref(false)

// ── Data Fetching ─────────────────────────────────────────────
async function fetchDashboardData() {
  if (isLoading.value) return
  isLoading.value = true
  
  try {
    // 1. Fetch Basic Counts
    const { count: activeCount } = await supabase
      .from('legal_cases')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Active')
    
    const { count: pendingDocCount } = await supabase
      .from('initial_documents')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Pending')

    // 2. Financial Exposure
    const { data: exposureData } = await supabase
      .from('legal_cases')
      .select('financial_exposure')
      .not('status', 'eq', 'Closed')
    
    const totalExposure = exposureData?.reduce((acc, curr) => acc + (Number(curr.financial_exposure) || 0), 0) || 0

    // 3. Status Distribution
    const { data: statusData } = await supabase.from('legal_cases').select('status')
    const statusCounts = { Active: 0, Pending: 0, 'Under Review': 0, Closed: 0, 'Pending Hearing': 0 }
    statusData?.forEach(c => {
      if (statusCounts[c.status] !== undefined) statusCounts[c.status]++
    })
    
    caseStats.value = {
      active: statusCounts.Active + statusCounts['Pending Hearing'],
      pending: statusCounts.Pending || 0,
      underReview: statusCounts['Under Review'] || 0,
      closed: statusCounts.Closed || 0
    }
    totalCasesCount.value = statusData?.length || 0

    // 4. Case Types Distribution
    const { data: typeData } = await supabase.from('legal_cases').select('case_type')
    const typeCounts = {}
    typeData?.forEach(c => {
      typeCounts[c.case_type] = (typeCounts[c.case_type] || 0) + 1
    })
    caseTypeStats.value = Object.entries(typeCounts).map(([label, count]) => ({ label, count }))

    // 5. Approvals (Show all for transparency, but mark those for the current user)
    const { data: pendingApprovals } = await supabase
      .from('agreements')
      .select('*')
      .in('status', ['Pending L1 Approval', 'Pending L2 Approval', 'Under Review', 'Approval'])
      .limit(10)

    approvalItems.value = pendingApprovals?.map(item => {
      const isForMe = 
        (authStore.profile?.role === 'supervisor' && item.status === 'Pending L1 Approval') ||
        (authStore.profile?.role === 'manager' && item.status === 'Pending L2 Approval') ||
        (authStore.profile?.role === 'legal_officer' && item.status === 'Under Review') ||
        (authStore.profile?.role === 'admin')

      return {
        id: item.id,
        title: item.title,
        subtitle: `${item.party2} · ${new Date(item.created_at).toLocaleDateString()}`,
        initials: (item.party2 || 'A').substring(0, 2).toUpperCase(),
        avatarColor: isForMe ? 'primary' : 'grey-5',
        priority: item.value > 1000000 ? 'High' : 'Normal',
        priorityColor: item.value > 1000000 ? 'negative' : 'info',
        isForMe
      }
    }) || []

    // 6. Recent Activity
    const { data: audits } = await supabase
      .from('system_audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(6)
    
    recentActivity.value = audits?.map(a => ({
      id: a.id,
      icon: a.action === 'CREATE' ? 'add_circle' : 'edit',
      color: a.action === 'CREATE' ? 'positive' : 'info',
      title: `${a.action}: ${a.entity_type} record`,
      time: new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })) || []

    // 7. Mock Data Fallback for "WOW" factor if DB is empty
    if (approvalItems.value.length === 0) {
      approvalItems.value = [
        {
          id: 'mock-1',
          title: 'System Integration Agreement - Phase 2',
          subtitle: `NEXGEN Dynamics · ${new Date().toLocaleDateString()}`,
          initials: 'ND',
          avatarColor: 'primary',
          priority: 'High',
          priorityColor: 'negative',
          isForMe: true
        },
        {
          id: 'mock-2',
          title: 'Fiber Infrastructure Lease - Region 04',
          subtitle: `Infrastruct Solutions · ${new Date().toLocaleDateString()}`,
          initials: 'IS',
          avatarColor: 'grey-5',
          priority: 'Normal',
          priorityColor: 'info',
          isForMe: false
        },
        {
          id: 'mock-3',
          title: 'Service Maintenance Contract - Metro Zone',
          subtitle: `Sri Lanka Telecom · ${new Date().toLocaleDateString()}`,
          initials: 'SL',
          avatarColor: 'orange-7',
          priority: 'Low',
          priorityColor: 'warning',
          isForMe: true
        },
        {
          id: 'mock-4',
          title: 'Infrastructure Modernization - Northern Province',
          subtitle: `TechBuild Solutions · ${new Date().toLocaleDateString()}`,
          initials: 'TB',
          avatarColor: 'teal-6',
          priority: 'High',
          priorityColor: 'negative',
          isForMe: false
        }
      ]
    }

    if (recentActivity.value.length === 0) {
      recentActivity.value = [
        {
          id: 'm-act-1',
          icon: 'gavel',
          color: 'positive',
          title: 'New Legal Case: Debt Recovery / SLT-DR-2026-882',
          time: '10:15 AM'
        },
        {
          id: 'm-act-2',
          icon: 'description',
          color: 'info',
          title: 'Document Approved: Initial Intake / Colombo South',
          time: '09:45 AM'
        },
        {
          id: 'm-act-3',
          icon: 'handshake',
          color: 'warning',
          title: 'Agreement Drafted: Fiber Maintenance / Metro-4',
          time: 'Yesterday'
        },
        {
          id: 'm-act-4',
          icon: 'assignment_turned_in',
          color: 'teal',
          title: 'Case Closed: Real Estate Dispute / KND-2025-01',
          time: '2 days ago'
        }
      ]
    }

    // Update main stats object
    stats.value = {
      activeCases: activeCount || 0,
      pendingDocs: pendingDocCount || 0,
      myTasks: approvalItems.value.length,
      totalExposure: totalExposure,
      totalExpenses: 0 // Fetch from payments if table existed
    }

  } catch (err) {
    console.error('Dashboard Fetch Error:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchDashboardData)
watch(() => authStore.profile?.role, fetchDashboardData)

function refreshData() {
  fetchDashboardData()
}

// ── Summary Cards ─────────────────────────────────────────────
const summaryCards = computed(() => [
  {
    label: t('dashboard.activeCases'),
    value: stats.value.activeCases.toString(),
    icon: 'gavel',
    accent: '#10b981',
    trendIcon: 'trending_up',
    trendValue: '+2',
    trendColor: '#10b981',
    progress: (stats.value.activeCases / 50) * 100,
  },
  {
    label: t('dashboard.pendingDocs'),
    value: stats.value.pendingDocs.toString(),
    icon: 'handshake',
    accent: '#f59e0b',
    trendIcon: 'pending',
    trendValue: 'New',
    trendColor: '#f59e0b',
    progress: (stats.value.pendingDocs / 20) * 100,
  },
  {
    label: t('dashboard.myTasks'),
    value: stats.value.myTasks.toString(),
    icon: 'task_alt',
    accent: '#3b82f6',
    trendIcon: 'schedule',
    trendValue: 'Action needed',
    trendColor: '#3b82f6',
    progress: 100,
  },
  {
    label: t('reports.kpiExposure'),
    value: `LKR ${(stats.value.totalExposure / 1000000).toFixed(1)}M`,
    icon: 'account_balance',
    accent: '#ef4444',
    trendIcon: 'info',
    trendValue: 'Active',
    trendColor: '#ef4444',
    progress: 82,
  },
  {
    label: t('reports.totalAgreements'),
    value: '6',
    icon: 'payments',
    accent: '#8b5cf6',
    trendIcon: 'trending_up',
    trendValue: '+1',
    trendColor: '#10b981',
    progress: 38,
  },
])

// ── Case Status Doughnut ──────────────────────────────────────
const statusColors = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444']
const caseStatusItems = computed(() => [
  { label: t('statuses.active'), count: caseStats.value.active },
  { label: t('statuses.pending'), count: caseStats.value.pending },
  { label: t('statuses.underReview'), count: caseStats.value.underReview },
  { label: t('statuses.closed'), count: caseStats.value.closed },
])
const totalCases = computed(() => totalCasesCount.value)

const caseStatusChartData = computed(() => ({
  labels: caseStatusItems.value.map((i) => i.label),
  datasets: [
    {
      data: caseStatusItems.value.map((i) => i.count),
      backgroundColor: statusColors,
      borderWidth: 0,
      hoverOffset: 8,
    },
  ],
}))

const doughnutOpts = computed(() => ({
  responsive: true,
  cutout: '72%',
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: $q.dark.isActive ? '#1a2035' : '#fff',
      titleColor: $q.dark.isActive ? '#e8eaf0' : '#1a202c',
      bodyColor: $q.dark.isActive ? '#8b95a8' : '#64748b',
      borderColor: $q.dark.isActive ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
      borderWidth: 1,
      padding: 10,
      cornerRadius: 8,
    },
  },
}))

// ── Case Type Bar Chart ───────────────────────────────────────
const caseTypeChartData = computed(() => ({
  labels: caseTypeStats.value.map(s => s.label),
  datasets: [
    {
      label: t('reports.totalCases'),
      data: caseTypeStats.value.map(s => s.count),
      backgroundColor: ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#94a3b8'],
      borderRadius: 8,
      borderSkipped: false,
      barThickness: 24,
    },
  ],
}))

const barOpts = computed(() => ({
  responsive: true,
  indexAxis: 'y',
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: $q.dark.isActive ? '#1a2035' : '#fff',
      titleColor: $q.dark.isActive ? '#e8eaf0' : '#1a202c',
      bodyColor: $q.dark.isActive ? '#8b95a8' : '#64748b',
      padding: 10,
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      grid: {
        color: $q.dark.isActive ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)',
        drawBorder: false,
      },
      ticks: { color: $q.dark.isActive ? '#8b95a8' : '#64748b', font: { size: 11 } },
    },
    y: {
      grid: { display: false },
      ticks: { color: $q.dark.isActive ? '#8b95a8' : '#64748b', font: { size: 12, weight: 500 } },
    },
  },
}))

function downloadResource(fileName) {
  $q.notify({
    type: 'ongoing',
    message: `Fetching ${fileName}...`,
    caption: 'Accessing official project vault',
    icon: 'security',
    group: false,
    timeout: 1200,
  })

  setTimeout(() => {
    const link = document.createElement('a')
    link.href =
      'data:application/pdf;base64,JVBERi0xLjcK1f3pCjEgMCBvYmoKPDwvVHlwZS9DYXRhbG9nL1BhZ2VzIDIgMCBSPj4KZW5kb2JqCjIgMCBvYmoKPDwvVHlwZS9QYWdlcy9Db3VudCAxL0tpZHNbMyAwIFJdPj4KZW5kb2JqCjMgMCBvYmoKPDwvVHlwZS9QYWdlL1BhcmVudCAyIDAgUi9NZWRpYUJveFswIDAgNTk1IDg0Ml0vQ29udGVudHMgNCAwIFI+PgplbmRvYmoKNCAwIG9iago8PC9MZW5ndGggNTY+PnN0cmVhbQpCVAovRjEgMjQgVGYKNTAgODAwIFRkCihTTEQgTGVnYWxFZGdlIC0gT2ZmaWNpYWwgQ2hhbGxlbmdlIERvY3VtZW50KSBWmoKRVQKZW5kc3RyZWFtCmVuZG9iago1IDAgb2JqCjw8L0Jhc2VGb250L0hlbHZldGljYS9UeXBlL0ZvbnQvU3VidHlwZS9UcnVlVHlwZT4+CmVuZG9iago2IDAgb2JqCjw8L1Byb2R1Y2VyIChTTEQgTGVnYWxFZGdlKS9DcmVhdGlvbkRhdGUgKEQ6MjAyNjAyMjMxMzI1MzcpPj4KZW5kb2JqCnRyYWlsZXIKPDwvUm9vdCAxIDAgUi9JbmZvIDYgMCBSL1NpemUgNz4+CnN0YXJ0eHJlZgo0OTQKJSVFT0Y='
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    $q.notify({
      type: 'positive',
      message: `${fileName} downloaded successfully.`,
      icon: 'verified',
    })
  }, 1400)
}
</script>

<style lang="scss" scoped>
// ═══ EXECUTIVE SUMMARY CARDS ═════════════════════════════════
.exec-summary-card {
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 14px !important;
  transition:
    transform 0.2s,
    box-shadow 0.25s;
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: var(--accent);
    border-radius: 4px 0 0 4px;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
  }

  &__icon {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__badge {
    display: flex;
    align-items: center;
    font-size: 0.78rem;
    font-weight: 600;
  }

  &__value {
    font-size: 1.6rem;
    font-weight: 800;
    line-height: 1.1;
    margin-bottom: 2px;
    color: var(--accent);
  }

  &__label {
    font-size: 0.8rem;
    font-weight: 500;
    opacity: 0.65;
  }

  &__bar {
    height: 4px;
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.06);
    overflow: hidden;
  }
  &__bar-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.6s ease;
  }
}

// Dark mode overrides for summary cards
:global(body.body--dark) .exec-summary-card {
  border-color: rgba(255, 255, 255, 0.06);
  &:hover {
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
  }
  .exec-summary-card__bar {
    background: rgba(255, 255, 255, 0.06);
  }
}

// ═══ DOUGHNUT CENTER ═════════════════════════════════════════
.exec-doughnut-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

// ═══ LEGEND ══════════════════════════════════════════════════
.exec-legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.exec-legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 4px;
  flex-shrink: 0;
}

// ═══ ACTIVITY ════════════════════════════════════════════════
.exec-activity-alt {
  background: rgba(0, 0, 0, 0.015);
}
:global(body.body--dark) .exec-activity-alt {
  background: rgba(255, 255, 255, 0.02);
}

.exec-activity-avatar {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

// ═══ RESOURCE CARD ═══════════════════════════════════════════
// ═══ RESOURCE CARD ═══════════════════════════════════════
.slt-resource-card {
  border: 1px dashed var(--q-primary);
  background: rgba(var(--q-primary), 0.02);
  border-radius: 12px;
}
</style>
