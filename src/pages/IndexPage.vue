<template>
  <q-page class="slt-dashboard q-pa-md">
    <!-- ─── Page Header ──────────────────────────────────────── -->
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="text-h5 text-weight-bold text-primary">Dashboard</div>
        <div class="text-caption text-grey-6">Welcome back, Admin · {{ currentDate }}</div>
      </div>
      <div class="col-auto">
        <q-btn
          unelevated
          color="primary"
          icon="refresh"
          label="Refresh"
          class="q-mr-sm"
          size="sm"
          @click="refreshData"
        />
        <q-btn
          outline
          color="primary"
          icon="bar_chart"
          label="View Reports"
          size="sm"
          @click="router.push('/reports')"
        />
      </div>
    </div>

    <!-- ─── Summary Widgets ──────────────────────────────────── -->
    <div class="row q-col-gutter-md q-mb-lg">
      <!-- Widget 1: Active Legal Cases -->
      <div class="col-12 col-sm-6 col-md-4">
        <q-card class="slt-widget slt-widget--blue" flat bordered>
          <q-card-section class="row items-center no-wrap">
            <div class="slt-widget-icon-wrap bg-blue-1">
              <q-icon name="gavel" size="32px" color="primary" />
            </div>
            <div class="q-ml-md col">
              <div class="text-h4 text-weight-bold text-primary">{{ stats.activeCases }}</div>
              <div class="text-subtitle2 text-grey-7">Active Legal Cases</div>
              <div class="row items-center q-mt-xs">
                <q-icon name="trending_up" color="positive" size="16px" />
                <span class="text-caption text-positive q-ml-xs">+4 this month</span>
              </div>
            </div>
            <q-circular-progress
              :value="72"
              size="48px"
              :thickness="0.22"
              color="primary"
              track-color="blue-1"
              class="q-ml-auto"
            >
              <span class="text-caption text-primary text-weight-bold">72%</span>
            </q-circular-progress>
          </q-card-section>
          <q-separator />
          <q-card-section class="q-py-sm">
            <span class="text-caption text-grey-6">14 active · 6 pending hearing</span>
          </q-card-section>
        </q-card>
      </div>

      <!-- Widget 2: Pending Initial Documents -->
      <div class="col-12 col-sm-6 col-md-4">
        <q-card class="slt-widget slt-widget--orange" flat bordered>
          <q-card-section class="row items-center no-wrap">
            <div class="slt-widget-icon-wrap bg-orange-1">
              <q-icon name="description" size="32px" color="orange-8" />
            </div>
            <div class="q-ml-md col">
              <div class="text-h4 text-weight-bold text-orange-9">{{ stats.pendingDocs }}</div>
              <div class="text-subtitle2 text-grey-7">Pending Initial Docs</div>
              <div class="row items-center q-mt-xs">
                <q-icon name="schedule" color="warning" size="16px" />
                <span class="text-caption text-warning q-ml-xs">5 require attention</span>
              </div>
            </div>
            <q-circular-progress
              :value="45"
              size="48px"
              :thickness="0.22"
              color="orange-8"
              track-color="orange-1"
              class="q-ml-auto"
            >
              <span class="text-caption text-orange-9 text-weight-bold">45%</span>
            </q-circular-progress>
          </q-card-section>
          <q-separator />
          <q-card-section class="q-py-sm">
            <span class="text-caption text-grey-6">9 pending · 3 awaiting supervisor</span>
          </q-card-section>
        </q-card>
      </div>

      <!-- Widget 3: Agreements Awaiting Approval -->
      <div class="col-12 col-sm-6 col-md-4">
        <q-card class="slt-widget slt-widget--green" flat bordered>
          <q-card-section class="row items-center no-wrap">
            <div class="slt-widget-icon-wrap bg-green-1">
              <q-icon name="handshake" size="32px" color="green-8" />
            </div>
            <div class="q-ml-md col">
              <div class="text-h4 text-weight-bold text-green-9">
                {{ stats.agreementsAwaiting }}
              </div>
              <div class="text-subtitle2 text-grey-7">Agreements Awaiting Approval</div>
              <div class="row items-center q-mt-xs">
                <q-icon name="hourglass_empty" color="teal-6" size="16px" />
                <span class="text-caption text-teal-6 q-ml-xs">2 at final level</span>
              </div>
            </div>
            <q-circular-progress
              :value="60"
              size="48px"
              :thickness="0.22"
              color="green-8"
              track-color="green-1"
              class="q-ml-auto"
            >
              <span class="text-caption text-green-9 text-weight-bold">60%</span>
            </q-circular-progress>
          </q-card-section>
          <q-separator />
          <q-card-section class="q-py-sm">
            <span class="text-caption text-grey-6">7 in review · 2 near expiry</span>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- ─── Workflow Status Strip ────────────────────────────── -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section class="q-pb-xs">
            <div class="text-subtitle1 text-weight-bold text-primary">
              Approval Workflow Overview
            </div>
          </q-card-section>
          <q-card-section class="row q-col-gutter-sm q-pt-xs">
            <div v-for="stage in workflowStages" :key="stage.label" class="col-6 col-sm-3">
              <div class="slt-stage-card rounded-borders q-pa-sm text-center">
                <q-icon :name="stage.icon" :color="stage.color" size="24px" />
                <div class="text-h5 text-weight-bold q-mt-xs" :class="`text-${stage.color}`">
                  {{ stage.count }}
                </div>
                <div class="text-caption text-grey-7">{{ stage.label }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- ─── Recent Case Activities Table ────────────────────── -->
    <div class="row q-col-gutter-md">
      <div class="col-12 col-lg-8">
        <q-card flat bordered>
          <q-card-section class="row items-center q-pb-none">
            <div class="text-subtitle1 text-weight-bold text-primary col">
              Recent Case Activities
            </div>
            <q-input
              v-model="tableFilter"
              dense
              outlined
              placeholder="Search..."
              class="col-auto"
              style="min-width: 200px"
            >
              <template #prepend><q-icon name="search" /></template>
            </q-input>
          </q-card-section>

          <q-table
            :rows="recentActivities"
            :columns="columns"
            :filter="tableFilter"
            row-key="id"
            flat
            bordered
            :pagination="{ rowsPerPage: 6 }"
            class="slt-table q-mt-sm"
          >
            <!-- Case ID with icon -->
            <template #body-cell-caseId="props">
              <q-td :props="props">
                <span class="text-weight-bold text-primary">#{{ props.value }}</span>
              </q-td>
            </template>

            <!-- Status badge -->
            <template #body-cell-status="props">
              <q-td :props="props">
                <q-badge :color="statusColor(props.value)" :label="props.value" rounded />
              </q-td>
            </template>

            <!-- Type badge -->
            <template #body-cell-type="props">
              <q-td :props="props">
                <q-chip
                  :icon="props.value === 'Money Recovery' ? 'payments' : 'landscape'"
                  :color="props.value === 'Money Recovery' ? 'blue-1' : 'green-1'"
                  :text-color="props.value === 'Money Recovery' ? 'primary' : 'green-8'"
                  dense
                  size="sm"
                >
                  {{ props.value }}
                </q-chip>
              </q-td>
            </template>
          </q-table>
        </q-card>
      </div>

      <!-- Right panel: quick action + upcoming -->
      <div class="col-12 col-lg-4">
        <!-- Quick Actions -->
        <q-card flat bordered class="q-mb-md">
          <q-card-section class="q-pb-sm">
            <div class="text-subtitle1 text-weight-bold text-primary">Quick Actions</div>
          </q-card-section>
          <q-list separator>
            <q-item
              v-for="action in quickActions"
              :key="action.label"
              clickable
              v-ripple
              class="q-py-sm"
              @click="router.push(action.route)"
            >
              <q-item-section avatar>
                <q-avatar :color="action.color" text-color="white" size="36px" icon-size="18px">
                  <q-icon :name="action.icon" size="18px" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">{{ action.label }}</q-item-label>
                <q-item-label caption>{{ action.caption }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" color="grey-5" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>

        <!-- Upcoming Hearings -->
        <q-card flat bordered>
          <q-card-section class="q-pb-sm">
            <div class="text-subtitle1 text-weight-bold text-primary">Upcoming Hearings</div>
          </q-card-section>
          <q-list>
            <q-item
              v-for="hearing in upcomingHearings"
              :key="hearing.caseRef"
              class="q-py-xs"
              clickable
              @click="router.push('/cases')"
            >
              <q-item-section avatar>
                <q-icon name="event" :color="hearing.urgent ? 'negative' : 'primary'" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium text-body2">{{
                  hearing.title
                }}</q-item-label>
                <q-item-label caption>{{ hearing.date }} · {{ hearing.court }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge v-if="hearing.urgent" color="negative" label="Urgent" rounded />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// ── Computed current date display ─────────────────────────────
const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

// ── Summary stats (replace with Pinia store later) ────────────
const stats = ref({
  activeCases: 14,
  pendingDocs: 9,
  agreementsAwaiting: 7,
})

// ── Workflow pipeline ─────────────────────────────────────────
const workflowStages = [
  { label: 'Draft', icon: 'edit_note', color: 'grey-7', count: 12 },
  { label: 'In Review', icon: 'rate_review', color: 'warning', count: 8 },
  { label: 'Approval', icon: 'pending_actions', color: 'info', count: 5 },
  { label: 'Active', icon: 'check_circle', color: 'positive', count: 21 },
]

// ── Table ─────────────────────────────────────────────────────
const tableFilter = ref('')

const columns = [
  { name: 'caseId', label: 'Case ID', field: 'caseId', align: 'left', sortable: true },
  { name: 'title', label: 'Case Title', field: 'title', align: 'left', sortable: true },
  { name: 'type', label: 'Type', field: 'type', align: 'center', sortable: true },
  { name: 'status', label: 'Status', field: 'status', align: 'center', sortable: true },
  { name: 'assignedTo', label: 'Assigned To', field: 'assignedTo', align: 'left', sortable: false },
  { name: 'lastUpdated', label: 'Updated', field: 'lastUpdated', align: 'right', sortable: true },
]

const recentActivities = [
  {
    id: 1,
    caseId: 'LC-2024-001',
    title: 'SLT vs. Perera Construction',
    type: 'Money Recovery',
    status: 'Active',
    assignedTo: 'K. Fernando',
    lastUpdated: '2026-02-21',
  },
  {
    id: 2,
    caseId: 'LC-2024-002',
    title: 'Land Acquisition – Kandy Zone',
    type: 'Land Case',
    status: 'Pending Hearing',
    assignedTo: 'N. Silva',
    lastUpdated: '2026-02-20',
  },
  {
    id: 3,
    caseId: 'LC-2024-003',
    title: 'Network Dispute – Galle',
    type: 'Money Recovery',
    status: 'Active',
    assignedTo: 'P. Jayawardena',
    lastUpdated: '2026-02-19',
  },
  {
    id: 4,
    caseId: 'LC-2024-004',
    title: 'Easement Right – Colombo 5',
    type: 'Land Case',
    status: 'Under Review',
    assignedTo: 'A. Bandara',
    lastUpdated: '2026-02-18',
  },
  {
    id: 5,
    caseId: 'LC-2024-005',
    title: 'Contractor Liability Claim',
    type: 'Money Recovery',
    status: 'Closed',
    assignedTo: 'S. Dissanayake',
    lastUpdated: '2026-02-15',
  },
  {
    id: 6,
    caseId: 'LC-2024-006',
    title: 'Tower Site Dispute – Kurunegala',
    type: 'Land Case',
    status: 'Pending Hearing',
    assignedTo: 'T. Gunathilaka',
    lastUpdated: '2026-02-14',
  },
  {
    id: 7,
    caseId: 'LC-2024-007',
    title: 'Equipment Damage Recovery',
    type: 'Money Recovery',
    status: 'Active',
    assignedTo: 'K. Fernando',
    lastUpdated: '2026-02-12',
  },
]

function statusColor(status) {
  const map = {
    Active: 'positive',
    'Pending Hearing': 'warning',
    'Under Review': 'info',
    Closed: 'grey-6',
    Draft: 'grey-5',
  }
  return map[status] || 'primary'
}

// ── Quick Actions ─────────────────────────────────────────────
const quickActions = [
  {
    label: 'New Initial Document',
    caption: 'Start case intake process',
    icon: 'add_circle',
    color: 'primary',
    route: '/initial-docs',
  },
  {
    label: 'Upload Agreement',
    caption: 'Add new contract or MOU',
    icon: 'upload_file',
    color: 'teal',
    route: '/agreements',
  },
  {
    label: 'Pending Approvals',
    caption: '3 items need your approval',
    icon: 'verified',
    color: 'negative',
    route: '/approvals',
  },
  {
    label: 'Generate Report',
    caption: 'Monthly legal summary',
    icon: 'summarize',
    color: 'purple',
    route: '/reports',
  },
]

// ── Upcoming Hearings ─────────────────────────────────────────
const upcomingHearings = [
  {
    caseRef: 'LC-2024-002',
    title: 'Land Acquisition – Kandy Zone',
    date: '24 Feb 2026',
    court: 'District Court Kandy',
    urgent: true,
  },
  {
    caseRef: 'LC-2024-006',
    title: 'Tower Site Dispute',
    date: '28 Feb 2026',
    court: 'High Court Kurunegala',
    urgent: false,
  },
  {
    caseRef: 'LC-2024-003',
    title: 'Network Dispute – Galle',
    date: '05 Mar 2026',
    court: 'Magistrate Court Galle',
    urgent: false,
  },
]

// ── Refresh handler ───────────────────────────────────────────
function refreshData() {
  // Wire to Pinia store API calls in later iterations
}
</script>

<style lang="scss" scoped>
.slt-dashboard {
  background: #f0f4f9;
  min-height: 100vh;
}

// ── Summary Widgets ───────────────────────────────────────────
.slt-widget {
  border-radius: 12px !important;
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;

  &:hover {
    box-shadow: 0 6px 24px rgba(0, 63, 135, 0.12) !important;
    transform: translateY(-2px);
  }

  &--blue {
    border-top: 4px solid #003f87 !important;
  }
  &--orange {
    border-top: 4px solid #f7941d !important;
  }
  &--green {
    border-top: 4px solid #2e7d32 !important;
  }
}

.slt-widget-icon-wrap {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

// ── Workflow Stage Cards ──────────────────────────────────────
.slt-stage-card {
  background: #f8f9fb;
  border: 1px solid #e0e7ef;
  transition: background 0.15s ease;

  &:hover {
    background: #eaf0fb;
  }
}

// ── Table ─────────────────────────────────────────────────────
.slt-table {
  :deep(.q-table__top),
  :deep(.q-table__bottom) {
    background: #f8f9fb;
  }

  :deep(thead tr th) {
    background: #eef2f8;
    color: #003f87;
    font-weight: 700;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  :deep(tbody tr:hover) {
    background: #f0f5ff !important;
  }
}
</style>
