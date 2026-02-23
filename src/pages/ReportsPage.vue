<template>
  <q-page class="q-pa-md slt-page-bg">
    <!-- ─── Page Header ──────────────────────────────────────────── -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-weight-bold text-primary">
          <q-icon name="bar_chart" size="28px" class="q-mr-sm" />
          {{ $t('reports.title') }}
        </div>
        <div class="text-caption text-grey-6">
          Legal performance metrics &amp; workload overview &nbsp;·&nbsp; Data as of:
          <strong>22 February 2026</strong>
        </div>
      </div>
      <div class="col-auto row q-gutter-sm">
        <q-select
          v-model="period"
          :options="['This Month', 'Last 3 Months', 'This Year', 'All Time']"
          dense
          outlined
          style="min-width: 150px"
          label="Period"
        />
        <q-btn-dropdown
          outline
          color="primary"
          icon="file_download"
          label="Export"
          size="sm"
          no-caps
        >
          <q-list dense>
            <q-item clickable v-close-popup @click="exportPDF">
              <q-item-section avatar
                ><q-icon name="picture_as_pdf" color="negative"
              /></q-item-section>
              <q-item-section>
                <q-item-label>Export to PDF</q-item-label>
                <q-item-label caption>Full report with charts</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="exportExcel">
              <q-item-section avatar><q-icon name="table_chart" color="positive" /></q-item-section>
              <q-item-section>
                <q-item-label>Export to Excel</q-item-label>
                <q-item-label caption>Data tables & financials</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </div>

    <!-- ─── TOP KPI STRIP ────────────────────────────────────────── -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-6 col-sm-3" v-for="kpi in topKpis" :key="kpi.label">
        <q-card flat bordered class="slt-kpi-card" style="height: 100%">
          <q-card-section
            class="q-pa-md"
            style="height: 100%; display: flex; flex-direction: column"
          >
            <div class="row items-center no-wrap">
              <q-avatar :color="kpi.bg" size="48px">
                <q-icon :name="kpi.icon" :color="kpi.color" size="24px" />
              </q-avatar>
              <div class="q-ml-md">
                <div class="text-h5 text-weight-bold" :class="`text-${kpi.color}`">
                  {{ kpi.value }}
                </div>
                <div class="text-caption text-grey-6" style="line-height: 1.2">
                  {{ kpi.label }}
                </div>
              </div>
            </div>
            <q-space />
            <div class="row items-center q-mt-sm" v-if="kpi.trend !== undefined">
              <q-icon
                :name="kpi.trend >= 0 ? 'trending_up' : 'trending_down'"
                :color="
                  kpi.trendGood
                    ? kpi.trend >= 0
                      ? 'positive'
                      : 'negative'
                    : kpi.trend >= 0
                      ? 'negative'
                      : 'positive'
                "
                size="16px"
              />
              <span
                class="text-caption q-ml-xs"
                :class="
                  kpi.trendGood
                    ? kpi.trend >= 0
                      ? 'text-positive'
                      : 'text-negative'
                    : kpi.trend >= 0
                      ? 'text-negative'
                      : 'text-positive'
                "
              >
                {{ Math.abs(kpi.trend) }}% vs last period
              </span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- ─── ROW 1: Cases Doughnut  +  Cases by Status ────────────── -->
    <div class="row q-col-gutter-md q-mb-md">
      <!-- ── Section 1A: Active Cases by Type — CHART.JS Doughnut ── -->
      <div class="col-12 col-md-7">
        <q-card flat bordered class="full-height">
          <q-card-section class="slt-section-header">
            <q-icon name="gavel" color="primary" size="20px" class="q-mr-sm" />
            Active Cases by Type
          </q-card-section>
          <q-separator />
          <q-card-section class="q-pa-md">
            <div class="row items-center q-col-gutter-lg">
              <!-- Doughnut chart -->
              <div class="col-12 col-sm-6">
                <div style="position: relative; max-width: 280px; margin: 0 auto">
                  <Doughnut :data="casesByTypeChartData" :options="doughnutOptions" />
                  <!-- Center label -->
                  <div class="slt-doughnut-center">
                    <div class="text-h4 text-weight-bold text-primary">{{ totalCases }}</div>
                    <div
                      class="text-caption"
                      :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-5'"
                    >
                      Total Cases
                    </div>
                  </div>
                </div>
              </div>
              <!-- Legend + counts -->
              <div class="col-12 col-sm-6">
                <q-list dense separator>
                  <q-item v-for="(row, i) in casesByType" :key="row.type" class="q-py-sm">
                    <q-item-section avatar>
                      <div
                        class="slt-legend-dot"
                        :style="{ background: caseTypeColors[i] }"
                        style="width: 14px; height: 14px"
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label
                        class="text-body2"
                        :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                        >{{ row.type }}</q-item-label
                      >
                    </q-item-section>
                    <q-item-section side>
                      <q-badge rounded :label="row.total" color="primary" />
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- ── Section 1B: Case Status Distribution ── -->
      <div class="col-12 col-md-5">
        <q-card flat bordered class="full-height">
          <q-card-section class="slt-section-header">
            <q-icon name="pie_chart" color="primary" size="20px" class="q-mr-sm" />
            Case Status Distribution
          </q-card-section>
          <q-separator />
          <q-card-section class="q-pa-md">
            <q-markup-table flat dense separator="none" class="slt-mu-table q-mb-md">
              <thead>
                <tr>
                  <th class="text-left">Status</th>
                  <th class="text-right">Count</th>
                  <th class="text-right">% Share</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in caseStatusRows" :key="s.status">
                  <td>
                    <q-badge rounded :color="s.color" :label="s.status" />
                  </td>
                  <td class="text-right text-weight-bold">{{ s.count }}</td>
                  <td class="text-right text-grey-6">{{ pct(s.count, totalCases) }}%</td>
                </tr>
                <tr class="text-weight-bold">
                  <td>Total</td>
                  <td class="text-right">{{ totalCases }}</td>
                  <td class="text-right">100%</td>
                </tr>
              </tbody>
            </q-markup-table>

            <!-- Visual donut substitute — stacked bar -->
            <div class="text-caption text-grey-5 q-mb-xs">Status share</div>
            <div
              class="slt-segbar row no-wrap"
              style="height: 18px; border-radius: 9px; overflow: hidden"
            >
              <div
                v-for="s in caseStatusRows"
                :key="s.status"
                :style="{
                  width: pct(s.count, totalCases) + '%',
                  background: statusColorHex(s.color),
                }"
              />
            </div>
            <div class="row q-gutter-sm q-mt-xs">
              <div v-for="s in caseStatusRows" :key="s.status" class="row items-center">
                <div class="slt-legend-dot" :style="{ background: statusColorHex(s.color) }" />
                <span class="text-caption text-grey-7 q-ml-xs">{{ s.status }}</span>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- ─── ROW 2: Financial Exposure Overview ───────────────────── -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section class="slt-section-header">
            <q-icon name="account_balance_wallet" color="primary" size="20px" class="q-mr-sm" />
            Financial Exposure Overview — Active Legal Cases
          </q-card-section>
          <q-separator />
          <q-card-section class="q-pa-md">
            <!-- Summary totals -->
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-12 col-sm-4">
                <div class="slt-fin-box slt-fin-box--total">
                  <div class="text-caption text-grey-6 q-mb-xs">Total Claim Value</div>
                  <div class="text-h5 text-weight-bold text-primary">
                    LKR {{ fmt(financialSummary.totalClaim) }}
                  </div>
                  <div class="text-caption text-grey-5">
                    Across {{ financialRows.length }} cases
                  </div>
                </div>
              </div>
              <div class="col-12 col-sm-4">
                <div class="slt-fin-box slt-fin-box--paid">
                  <div class="text-caption text-grey-6 q-mb-xs">Total Recovered / Paid</div>
                  <div class="text-h5 text-weight-bold text-positive">
                    LKR {{ fmt(financialSummary.totalPaid) }}
                  </div>
                  <div class="text-caption text-grey-5">
                    {{ pct(financialSummary.totalPaid, financialSummary.totalClaim) }}% of total
                    claims
                  </div>
                </div>
              </div>
              <div class="col-12 col-sm-4">
                <div class="slt-fin-box slt-fin-box--balance">
                  <div class="text-caption text-grey-6 q-mb-xs">Outstanding Balance</div>
                  <div class="text-h5 text-weight-bold text-negative">
                    LKR {{ fmt(financialSummary.totalBalance) }}
                  </div>
                  <div class="text-caption text-grey-5">Pending recovery</div>
                </div>
              </div>
            </div>

            <!-- Case-level breakdown table — DRILL-DOWN clickable -->
            <q-markup-table flat dense bordered separator="horizontal" class="slt-mu-table">
              <thead>
                <tr>
                  <th class="text-left">Case No.</th>
                  <th class="text-left">Title</th>
                  <th class="text-left">Type</th>
                  <th class="text-right">Claim (LKR)</th>
                  <th class="text-right">Paid (LKR)</th>
                  <th class="text-right">Balance (LKR)</th>
                  <th class="text-center" style="min-width: 130px">Recovery</th>
                  <th class="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="r in financialRows"
                  :key="r.caseNo"
                  class="cursor-pointer slt-drilldown-row"
                  @click="drillDown(r.caseNo, r.title)"
                >
                  <td class="text-weight-medium text-primary">
                    {{ r.caseNo }}
                    <q-icon name="open_in_new" size="12px" color="grey-5" class="q-ml-xs" />
                  </td>
                  <td>
                    <div style="max-width: 220px" class="ellipsis">{{ r.title }}</div>
                  </td>
                  <td><q-badge outline :color="caseTypeColor(r.type)" :label="r.type" /></td>
                  <td class="text-right">{{ fmt(r.claim) }}</td>
                  <td class="text-right text-positive text-weight-medium">{{ fmt(r.paid) }}</td>
                  <td class="text-right text-negative text-weight-bold">
                    {{ fmt(r.claim - r.paid) }}
                  </td>
                  <td class="text-center">
                    <div class="row items-center q-gutter-xs no-wrap">
                      <q-linear-progress
                        :value="r.paid / r.claim"
                        :color="
                          r.paid / r.claim >= 0.8
                            ? 'positive'
                            : r.paid / r.claim >= 0.4
                              ? 'warning'
                              : 'negative'
                        "
                        rounded
                        style="flex: 1; height: 8px"
                      />
                      <span
                        class="text-caption text-weight-bold"
                        style="min-width: 36px; text-align: right"
                      >
                        {{ pct(r.paid, r.claim) }}%
                      </span>
                    </div>
                  </td>
                  <td class="text-center">
                    <q-badge
                      rounded
                      :color="r.status === 'Active' ? 'positive' : 'grey-6'"
                      :label="r.status"
                    />
                  </td>
                </tr>
              </tbody>
            </q-markup-table>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- ─── ROW 3: Agreements  +  Case Aging ─────────────────────── -->
    <div class="row q-col-gutter-md q-mb-md">
      <!-- ── Section 3: Agreement Approval Status Summary ── -->
      <div class="col-12 col-md-6">
        <q-card flat bordered class="full-height">
          <q-card-section class="slt-section-header">
            <q-icon name="handshake" color="primary" size="20px" class="q-mr-sm" />
            Agreement Approval Status Summary
          </q-card-section>
          <q-separator />
          <q-card-section class="q-pa-md">
            <!-- Total value KPI -->
            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-6">
                <div class="slt-fin-box q-pa-sm">
                  <div class="text-caption text-grey-5">Total Agreement Value</div>
                  <div class="text-h6 text-weight-bold text-primary">
                    LKR {{ fmt(totalAgrmValue) }}
                  </div>
                </div>
              </div>
              <div class="col-6">
                <div class="slt-fin-box q-pa-sm">
                  <div class="text-caption text-grey-5">Active Agreements</div>
                  <div class="text-h6 text-weight-bold text-positive">
                    {{ agrmStageRows.find((r) => r.stage === 'Active')?.count || 0 }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Stage pipeline bars -->
            <div v-for="row in agrmStageRows" :key="row.stage" class="q-mb-sm">
              <div class="row items-center q-mb-xs">
                <q-badge rounded :color="row.color" :label="row.stage" class="q-mr-sm" />
                <div class="col">
                  <q-linear-progress
                    :value="row.count / totalAgreements"
                    :color="row.color"
                    rounded
                    style="height: 10px"
                  />
                </div>
                <div
                  class="col-auto text-caption text-grey-6 q-ml-sm"
                  style="min-width: 48px; text-align: right"
                >
                  {{ row.count }} ({{ pct(row.count, totalAgreements) }}%)
                </div>
              </div>
            </div>

            <q-separator class="q-my-md" />

            <!-- Top agreements by value -->
            <div class="text-caption text-weight-bold text-grey-6 q-mb-sm">
              TOP AGREEMENTS BY VALUE
            </div>
            <div v-for="a in topAgreements" :key="a.title" class="row items-center q-mb-sm">
              <div class="col">
                <div class="text-body2 ellipsis" style="max-width: 240px">{{ a.title }}</div>
                <div class="text-caption text-grey-5">{{ a.party }}</div>
              </div>
              <div class="col-auto text-right">
                <div
                  class="text-weight-bold"
                  :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                >
                  LKR {{ fmt(a.value) }}
                </div>
                <q-badge rounded :color="a.statusColor" :label="a.status" class="q-mt-xs" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- ── Section 4: Case Aging & Workload — DRILL-DOWN rows ── -->
      <div class="col-12 col-md-6">
        <q-card flat bordered class="full-height">
          <q-card-section class="slt-section-header">
            <q-icon name="timer" color="primary" size="20px" class="q-mr-sm" />
            Case Aging &amp; Workload Report
          </q-card-section>
          <q-separator />
          <q-card-section class="q-pa-md">
            <!-- Aging buckets -->
            <div class="text-caption text-weight-bold text-grey-6 q-mb-sm">
              CASE AGE DISTRIBUTION
            </div>
            <div v-for="bucket in agingBuckets" :key="bucket.label" class="q-mb-sm">
              <div class="row items-center q-mb-xs">
                <div class="col-auto text-caption text-grey-7" style="min-width: 110px">
                  {{ bucket.label }}
                </div>
                <div class="col">
                  <q-linear-progress
                    :value="bucket.count / totalCases"
                    :color="bucket.color"
                    rounded
                    style="height: 12px"
                  />
                </div>
                <div
                  class="col-auto text-caption text-weight-bold q-ml-sm"
                  :class="`text-${bucket.color}`"
                  style="min-width: 28px; text-align: right"
                >
                  {{ bucket.count }}
                </div>
              </div>
            </div>

            <q-separator class="q-my-md" />

            <!-- Lawyer workload table — DRILL-DOWN clickable -->
            <div class="text-caption text-weight-bold text-grey-6 q-mb-sm">LAWYER WORKLOAD</div>
            <q-markup-table flat dense separator="horizontal" class="slt-mu-table">
              <thead>
                <tr>
                  <th class="text-left">Attorney</th>
                  <th class="text-center">Active</th>
                  <th class="text-center">Pending Hrg.</th>
                  <th class="text-right">Exposure (LKR)</th>
                  <th class="text-center">Load</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="l in lawyerWorkload"
                  :key="l.name"
                  class="cursor-pointer slt-drilldown-row"
                  @click="drillDownLawyer(l.name)"
                >
                  <td class="text-weight-medium">
                    {{ l.name }}
                    <q-icon name="open_in_new" size="12px" color="grey-5" class="q-ml-xs" />
                  </td>
                  <td class="text-center">{{ l.active }}</td>
                  <td class="text-center">{{ l.pending }}</td>
                  <td class="text-right">{{ fmt(l.exposure) }}</td>
                  <td class="text-center" style="min-width: 80px">
                    <q-linear-progress
                      :value="l.active / maxLawyerCases"
                      :color="l.active >= 4 ? 'negative' : l.active >= 2 ? 'warning' : 'positive'"
                      rounded
                      style="height: 8px"
                    />
                  </td>
                </tr>
              </tbody>
            </q-markup-table>

            <q-separator class="q-my-md" />

            <!-- Upcoming hearings in next 30 days -->
            <div class="text-caption text-weight-bold text-grey-6 q-mb-sm">
              UPCOMING HEARINGS (30 DAYS)
            </div>
            <q-list dense>
              <q-item
                v-for="h in upcomingHearings"
                :key="h.caseNo"
                class="q-pa-xs cursor-pointer slt-drilldown-row"
                clickable
                @click="drillDown(h.caseNo, h.title)"
              >
                <q-item-section avatar>
                  <q-avatar size="32px" :color="h.urgency === 'high' ? 'red-1' : 'blue-1'">
                    <q-icon
                      name="event"
                      :color="h.urgency === 'high' ? 'negative' : 'primary'"
                      size="16px"
                    />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-body2 ellipsis" style="max-width: 260px">
                    {{ h.title }}
                  </q-item-label>
                  <q-item-label caption>{{ h.court }} · {{ h.date }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge
                    rounded
                    :color="h.urgency === 'high' ? 'negative' : 'info'"
                    :label="h.urgency === 'high' ? 'URGENT' : `${h.daysAway}d`"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- ─── ROW 4: Monthly Case Filing Trend — CHART.JS Bar ──────── -->
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section class="slt-section-header">
            <q-icon name="show_chart" color="primary" size="20px" class="q-mr-sm" />
            Monthly Case Filing Trend — 2025/2026
          </q-card-section>
          <q-separator />
          <q-card-section class="q-pa-md">
            <div style="position: relative; height: 320px">
              <Bar :data="monthlyChartData" :options="barChartOptions" />
            </div>

            <q-separator class="q-my-sm" />

            <!-- Monthly summary table -->
            <q-markup-table flat dense separator="none" class="slt-mu-table">
              <thead>
                <tr>
                  <th v-for="m in monthlyTrend" :key="m.month" class="text-center text-caption">
                    {{ m.month }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    v-for="m in monthlyTrend"
                    :key="m.month"
                    class="text-center text-weight-bold text-primary"
                  >
                    {{ m.filed }}
                  </td>
                </tr>
                <tr>
                  <td
                    v-for="m in monthlyTrend"
                    :key="m.month"
                    class="text-center text-caption text-grey-5"
                  >
                    ✓ {{ m.closed }}
                  </td>
                </tr>
              </tbody>
            </q-markup-table>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- ─── Export progress dialog ───────────────────────────────── -->
    <q-dialog v-model="exportDialog" persistent>
      <q-card style="min-width: 340px">
        <q-card-section class="row items-center q-pb-sm">
          <q-avatar
            :icon="exportType === 'pdf' ? 'picture_as_pdf' : 'table_chart'"
            :color="exportType === 'pdf' ? 'red-1' : 'green-1'"
            :text-color="exportType === 'pdf' ? 'negative' : 'positive'"
          />
          <div class="q-ml-md">
            <div class="text-subtitle1 text-weight-bold">
              Exporting to {{ exportType === 'pdf' ? 'PDF' : 'Excel' }}…
            </div>
            <div class="text-caption text-grey-6">Generating report file</div>
          </div>
        </q-card-section>
        <q-card-section>
          <q-linear-progress
            :value="exportProgress"
            rounded
            color="primary"
            size="8px"
            class="q-mb-sm"
          />
          <div class="text-caption text-grey-5 text-center">
            {{ exportStage }}
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
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
  Filler,
} from 'chart.js'

// Register Chart.js components
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Filler)

const router = useRouter()
const $q = useQuasar()

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  PERIOD SELECTOR (UI only — data stubbed)
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const period = ref('This Year')

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  EXPORT FUNCTIONALITY
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const exportDialog = ref(false)
const exportType = ref('pdf')
const exportProgress = ref(0)
const exportStage = ref('')

const exportStages = {
  pdf: [
    'Collecting chart data…',
    'Rendering report pages…',
    'Embedding financial tables…',
    'Generating PDF…',
    'Finalizing download…',
  ],
  excel: [
    'Preparing data sheets…',
    'Writing case financials…',
    'Formatting agreement tables…',
    'Building workbook…',
    'Finalizing download…',
  ],
}

async function runExport(type) {
  exportType.value = type
  exportProgress.value = 0
  exportStage.value = exportStages[type][0]
  exportDialog.value = true

  const stages = exportStages[type]
  for (let i = 0; i < stages.length; i++) {
    exportStage.value = stages[i]
    exportProgress.value = (i + 1) / stages.length
    await new Promise((r) => setTimeout(r, 600))
  }

  exportDialog.value = false

  const fileName =
    type === 'pdf' ? 'SLT_LegalEdge_Report_Feb2026.pdf' : 'SLT_LegalEdge_Data_Feb2026.xlsx'

  $q.notify({
    type: 'positive',
    icon: type === 'pdf' ? 'picture_as_pdf' : 'table_chart',
    message: `${fileName} downloaded successfully!`,
    caption: 'Check your Downloads folder',
    timeout: 4000,
    actions: [{ label: 'Open', color: 'white', handler: () => {} }],
  })
}

function exportPDF() {
  runExport('pdf')
}
function exportExcel() {
  runExport('excel')
}

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  DRILL-DOWN NAVIGATION
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
function drillDown(caseNo, title) {
  $q.notify({
    type: 'info',
    icon: 'open_in_new',
    message: `Opening ${caseNo}`,
    caption: title,
    timeout: 1500,
  })
  router.push('/cases')
}

function drillDownLawyer(name) {
  $q.notify({
    type: 'info',
    icon: 'person',
    message: `Viewing workload for ${name}`,
    caption: 'Navigating to filtered case list…',
    timeout: 1500,
  })
  router.push('/cases')
}

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  TOP KPI STRIP
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const topKpis = [
  {
    label: 'Total Active Cases',
    value: '24',
    icon: 'gavel',
    color: 'primary',
    bg: 'blue-1',
    trend: 12,
    trendGood: false,
  },
  {
    label: 'Total Financial Exposure',
    value: 'LKR 287M',
    icon: 'account_balance_wallet',
    color: 'negative',
    bg: 'red-1',
    trend: 8,
    trendGood: false,
  },
  {
    label: 'Agreements Active',
    value: '11',
    icon: 'handshake',
    color: 'positive',
    bg: 'green-1',
    trend: 22,
    trendGood: true,
  },
  {
    label: 'Hearings This Month',
    value: '7',
    icon: 'event',
    color: 'warning',
    bg: 'orange-1',
    trend: -15,
    trendGood: true,
  },
]

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  SECTION 1 — ACTIVE CASES BY TYPE (CHART.JS DOUGHNUT)
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const casesByType = [
  { type: 'Money Recovery', total: 9 },
  { type: 'Land Case', total: 7 },
  { type: 'Damages', total: 4 },
  { type: 'Appeals', total: 3 },
  { type: 'Employee Disputes', total: 3 },
  { type: 'Other / Regulatory', total: 2 },
]

const caseTypeColors = [
  '#003F87', // Money Recovery — primary blue
  '#7B1FA2', // Land Case — purple
  '#F57C00', // Damages — deep orange
  '#00838F', // Appeals — teal
  '#C62828', // Employee Disputes — deep red
  '#546E7A', // Other — blue-grey
]

const casesByTypeChartData = computed(() => ({
  labels: casesByType.map((c) => c.type),
  datasets: [
    {
      data: casesByType.map((c) => c.total),
      backgroundColor: caseTypeColors,
      borderColor: '#fff',
      borderWidth: 3,
      hoverOffset: 8,
    },
  ],
}))

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: true,
  cutout: '65%',
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#002f6c',
      titleFont: { size: 13, weight: 'bold' },
      bodyFont: { size: 12 },
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        label: (ctx) => {
          const total = ctx.dataset.data.reduce((s, v) => s + v, 0)
          const pctVal = Math.round((ctx.parsed / total) * 100)
          return ` ${ctx.label}: ${ctx.parsed} cases (${pctVal}%)`
        },
      },
    },
  },
  animation: {
    animateRotate: true,
    duration: 1200,
  },
}

const caseStatusRows = [
  { status: 'Active', count: 14, color: 'positive' },
  { status: 'Pending Hearing', count: 7, color: 'warning' },
  { status: 'Under Review', count: 4, color: 'info' },
  { status: 'Closed', count: 3, color: 'grey-6' },
]

const totalCases = computed(() => caseStatusRows.reduce((s, r) => s + r.count, 0))

const statusColorHexMap = {
  positive: '#21ba45',
  warning: '#f2c037',
  info: '#31ccec',
  'grey-6': '#9e9e9e',
  negative: '#c10015',
  primary: '#003F87',
}
function statusColorHex(color) {
  return statusColorHexMap[color] || '#9e9e9e'
}

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  SECTION 2 — FINANCIAL EXPOSURE
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const financialRows = [
  {
    caseNo: 'LC-2026-001',
    title: 'Recovery – Netwin Pvt Ltd',
    type: 'Money Recovery',
    claim: 4500000,
    paid: 1200000,
    status: 'Active',
  },
  {
    caseNo: 'LC-2026-005',
    title: 'Leased Circuit Dues – DataNet LK',
    type: 'Money Recovery',
    claim: 8200000,
    paid: 6500000,
    status: 'Active',
  },
  {
    caseNo: 'LC-2026-006',
    title: 'Recovery – CloudHost Solutions',
    type: 'Money Recovery',
    claim: 3100000,
    paid: 0,
    status: 'Active',
  },
  {
    caseNo: 'LC-2026-007',
    title: 'Unpaid Govt Agency Dues – SLBFE',
    type: 'Money Recovery',
    claim: 12400000,
    paid: 10000000,
    status: 'Active',
  },
  {
    caseNo: 'LC-2026-008',
    title: 'National Carrier Billing – AirLink',
    type: 'Money Recovery',
    claim: 6700000,
    paid: 2100000,
    status: 'Pending Hearing',
  },
  {
    caseNo: 'LC-2026-002',
    title: 'Land Dispute – Kandy Exchange Site',
    type: 'Land Case',
    claim: 12000000,
    paid: 0,
    status: 'Pending Hearing',
  },
  {
    caseNo: 'LC-2026-004',
    title: 'Easement – Colombo 5 Tower Site',
    type: 'Land Case',
    claim: 3200000,
    paid: 0,
    status: 'Under Review',
  },
  {
    caseNo: 'LC-2026-003',
    title: 'Fiber Damage – Gamage Constructions',
    type: 'Damages',
    claim: 870000,
    paid: 0,
    status: 'Active',
  },
]

const financialSummary = computed(() => ({
  totalClaim: financialRows.reduce((s, r) => s + r.claim, 0),
  totalPaid: financialRows.reduce((s, r) => s + r.paid, 0),
  totalBalance: financialRows.reduce((s, r) => s + (r.claim - r.paid), 0),
}))

function caseTypeColor(type) {
  return (
    {
      'Money Recovery': 'primary',
      'Land Case': 'purple-7',
      Damages: 'orange-8',
      Appeals: 'grey-7',
    }[type] || 'grey-6'
  )
}

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  SECTION 3 — AGREEMENTS
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const agrmStageRows = [
  { stage: 'Active', count: 3, color: 'positive' },
  { stage: 'Pending L2 Approval', count: 2, color: 'orange-8' },
  { stage: 'Pending L1 Approval', count: 2, color: 'warning' },
  { stage: 'Under Review', count: 1, color: 'info' },
  { stage: 'Draft', count: 1, color: 'grey-6' },
  { stage: 'Rejected', count: 1, color: 'negative' },
  { stage: 'Terminated', count: 1, color: 'grey-7' },
]

const totalAgreements = computed(() => agrmStageRows.reduce((s, r) => s + r.count, 0))

const topAgreements = [
  {
    title: 'Oracle Licensing Agreement',
    party: 'Oracle Corp Lanka',
    value: 34000000,
    status: 'Pending L1',
    statusColor: 'warning',
  },
  {
    title: 'Network Maintenance SLA',
    party: 'TechServ Solutions',
    value: 18500000,
    status: 'Active',
    statusColor: 'positive',
  },
  {
    title: 'Cybersecurity Managed Services',
    party: 'SecureCo Lanka',
    value: 9500000,
    status: 'Pending L1',
    statusColor: 'warning',
  },
  {
    title: 'Tower Site Maintenance',
    party: 'Techno Build Eng.',
    value: 7800000,
    status: 'Rejected',
    statusColor: 'negative',
  },
  {
    title: 'Data Centre Co-location MOU',
    party: 'Virtusa Corporation',
    value: 6200000,
    status: 'Pending L2',
    statusColor: 'orange-8',
  },
]

const totalAgrmValue = computed(() => topAgreements.reduce((s, a) => s + a.value, 0))

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  SECTION 4 — CASE AGING & WORKLOAD
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const agingBuckets = [
  { label: '< 30 days', count: 5, color: 'positive' },
  { label: '30 – 90 days', count: 8, color: 'info' },
  { label: '90 – 180 days', count: 6, color: 'warning' },
  { label: '180 – 365 days', count: 4, color: 'orange-8' },
  { label: '> 1 year', count: 5, color: 'negative' },
]

const lawyerWorkload = [
  { name: 'K. Fernando', active: 5, pending: 3, exposure: 42000000 },
  { name: 'N. Silva', active: 4, pending: 2, exposure: 31500000 },
  { name: 'P. Jayawardena', active: 3, pending: 1, exposure: 8700000 },
  { name: 'S. Dissanayake', active: 3, pending: 2, exposure: 12400000 },
  { name: 'A. Bandara, PC', active: 2, pending: 1, exposure: 18700000 },
]

const maxLawyerCases = computed(() => Math.max(...lawyerWorkload.map((l) => l.active)))

const upcomingHearings = [
  {
    caseNo: 'LC-2026-002',
    title: 'Land Dispute – Kandy Exchange',
    court: 'Kandy DC',
    date: '2026-02-28',
    daysAway: 6,
    urgency: 'high',
  },
  {
    caseNo: 'LC-2026-001',
    title: 'Recovery – Netwin Pvt Ltd',
    court: 'Colombo DC',
    date: '2026-03-10',
    daysAway: 16,
    urgency: 'normal',
  },
  {
    caseNo: 'LC-2026-003',
    title: 'Fiber Damage – Gamage Constructions',
    court: 'Galle MC',
    date: '2026-03-22',
    daysAway: 28,
    urgency: 'normal',
  },
  {
    caseNo: 'LC-2026-005',
    title: 'Leased Circuit Recovery – DataNet LK',
    court: 'Colombo MC',
    date: '2026-03-15',
    daysAway: 21,
    urgency: 'normal',
  },
  {
    caseNo: 'LC-2026-008',
    title: 'National Carrier Billing – AirLink',
    court: 'Colombo DC',
    date: '2026-03-05',
    daysAway: 11,
    urgency: 'normal',
  },
]

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  SECTION 5 — MONTHLY TREND (CHART.JS BAR)
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const monthlyTrend = [
  { month: "Mar'25", filed: 3, closed: 1 },
  { month: "Apr'25", filed: 2, closed: 0 },
  { month: "May'25", filed: 4, closed: 2 },
  { month: "Jun'25", filed: 3, closed: 1 },
  { month: "Jul'25", filed: 5, closed: 2 },
  { month: "Aug'25", filed: 4, closed: 1 },
  { month: "Sep'25", filed: 6, closed: 3 },
  { month: "Oct'25", filed: 4, closed: 2 },
  { month: "Nov'25", filed: 5, closed: 2 },
  { month: "Dec'25", filed: 3, closed: 2 },
  { month: "Jan'26", filed: 6, closed: 1 },
  { month: "Feb'26", filed: 4, closed: 0 },
]

const monthlyChartData = computed(() => ({
  labels: monthlyTrend.map((m) => m.month),
  datasets: [
    {
      label: 'Cases Filed',
      data: monthlyTrend.map((m) => m.filed),
      backgroundColor: (ctx) => {
        const chart = ctx.chart
        const { ctx: canvasCtx, chartArea } = chart
        if (!chartArea) return '#1976D2'
        const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
        gradient.addColorStop(0, '#003F87')
        gradient.addColorStop(1, '#42A5F5')
        return gradient
      },
      borderRadius: 6,
      borderSkipped: false,
      barPercentage: 0.6,
      categoryPercentage: 0.7,
    },
    {
      label: 'Cases Closed',
      data: monthlyTrend.map((m) => m.closed),
      backgroundColor: 'rgba(33, 186, 69, 0.7)',
      borderRadius: 6,
      borderSkipped: false,
      barPercentage: 0.6,
      categoryPercentage: 0.7,
    },
  ],
}))

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'top',
      align: 'end',
      labels: {
        usePointStyle: true,
        pointStyle: 'rectRounded',
        padding: 20,
        font: { size: 12, weight: '600' },
        color: '#546E7A',
      },
    },
    tooltip: {
      backgroundColor: '#002f6c',
      titleFont: { size: 13, weight: 'bold' },
      bodyFont: { size: 12 },
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        title: (items) => `📅 ${items[0].label}`,
        afterBody: (items) => {
          const filed = items[0]?.parsed.y || 0
          const closed = items[1]?.parsed.y || 0
          const rate = filed > 0 ? Math.round((closed / filed) * 100) : 0
          return `\nResolution rate: ${rate}%`
        },
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        font: { size: 11, weight: '600' },
        color: '#78909C',
      },
    },
    y: {
      beginAtZero: true,
      max: 8,
      ticks: {
        stepSize: 2,
        font: { size: 11 },
        color: '#B0BEC5',
      },
      grid: {
        color: 'rgba(0,0,0,0.04)',
        drawBorder: false,
      },
    },
  },
  animation: {
    duration: 1000,
    easing: 'easeOutQuart',
  },
}

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  HELPERS
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
function pct(num, denom) {
  if (!denom) return 0
  return Math.round((num / denom) * 100)
}

function fmt(val) {
  return Number(val || 0).toLocaleString('en-LK')
}
</script>

<style lang="scss" scoped>
.slt-page-bg {
  min-height: 100vh;
}

// ── Section headers ───────────────────────────────────────────
.slt-section-header {
  display: flex;
  align-items: center;
  font-weight: 700;
  font-size: 0.85rem;
  color: #003f87;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: #eef2f8;
  padding: 10px 16px;
}

// ── KPI cards ─────────────────────────────────────────────────
.slt-kpi-card {
  border-radius: 10px;
  transition: box-shadow 0.15s;
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 63, 135, 0.12);
  }
}

// ── Financial summary boxes ───────────────────────────────────
.slt-fin-box {
  background: transparent;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 12px;

  body.body--dark & {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }

  body.body--light & {
    background: #f8f9fb;
    border-color: #e0e7ef;
  }

  &--total {
    border-left: 4px solid #003f87;
  }
  &--paid {
    border-left: 4px solid #21ba45;
  }
  &--balance {
    border-left: 4px solid #c10015;
  }
}

// ── Multi-segment bar ─────────────────────────────────────────
.slt-segbar {
  gap: 2px;
}

// ── Legend dot ────────────────────────────────────────────────
.slt-legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

// ── Doughnut center label ─────────────────────────────────────
.slt-doughnut-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
}

// ── Drill-down rows ──────────────────────────────────────────
.slt-drilldown-row {
  transition: background 0.15s ease;
  &:hover {
    background: rgba(var(--q-primary), 0.1) !important;
  }
}

// ── Markup table ─────────────────────────────────────────────
.slt-mu-table {
  :deep(thead tr th) {
    background: var(--q-dark-page);
    color: var(--q-primary);
    font-weight: 700;
    font-size: 0.72rem;
    text-transform: uppercase;
    padding: 8px 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  body.body--light & {
    :deep(thead tr th) {
      background: #eef2f8;
      color: #003f87;
    }
  }

  :deep(tbody tr td) {
    padding: 6px 12px;
  }

  :deep(tbody tr:hover td) {
    background: rgba(var(--q-primary), 0.05) !important;
  }
}
</style>
