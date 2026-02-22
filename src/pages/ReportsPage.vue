<template>
  <q-page class="q-pa-md slt-page-bg">
    <!-- ─── Page Header ──────────────────────────────────────────── -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-weight-bold text-primary">
          <q-icon name="bar_chart" size="28px" class="q-mr-sm" />
          Reports &amp; Analytics
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
        <q-btn outline color="primary" icon="file_download" label="Export PDF" size="sm" no-caps />
      </div>
    </div>

    <!-- ─── TOP KPI STRIP ────────────────────────────────────────── -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-6 col-sm-3" v-for="kpi in topKpis" :key="kpi.label">
        <q-card flat bordered class="slt-kpi-card">
          <q-card-section class="q-pa-md">
            <div class="row items-center no-wrap">
              <q-avatar :color="kpi.bg" size="48px">
                <q-icon :name="kpi.icon" :color="kpi.color" size="24px" />
              </q-avatar>
              <div class="q-ml-md">
                <div class="text-h5 text-weight-bold" :class="`text-${kpi.color}`">
                  {{ kpi.value }}
                </div>
                <div class="text-caption text-grey-6" style="max-width: 120px; line-height: 1.2">
                  {{ kpi.label }}
                </div>
              </div>
            </div>
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

    <!-- ─── ROW 1: Cases by Type  +  Cases by Status ────────────── -->
    <div class="row q-col-gutter-md q-mb-md">
      <!-- ── Section 1A: Active Cases by Type ── -->
      <div class="col-12 col-md-7">
        <q-card flat bordered class="full-height">
          <q-card-section class="slt-section-header">
            <q-icon name="gavel" color="primary" size="20px" class="q-mr-sm" />
            Active Cases by Type &amp; Status
          </q-card-section>
          <q-separator />
          <q-card-section class="q-pa-md">
            <div v-for="row in casesByType" :key="row.type" class="q-mb-md">
              <div class="row items-center q-mb-xs">
                <div class="col text-body2 text-weight-medium text-grey-9">{{ row.type }}</div>
                <div class="col-auto text-caption text-grey-5">{{ row.total }} cases</div>
              </div>
              <!-- Multi-segment progress bar -->
              <div
                class="slt-segbar row no-wrap"
                style="height: 14px; border-radius: 7px; overflow: hidden"
              >
                <div
                  v-for="seg in row.segs"
                  :key="seg.label"
                  :style="{ width: pct(seg.count, row.total) + '%', background: seg.color }"
                  class="slt-seg"
                />
              </div>
              <!-- Legend -->
              <div class="row q-gutter-sm q-mt-xs">
                <div v-for="seg in row.segs" :key="seg.label" class="row items-center">
                  <div class="slt-legend-dot" :style="{ background: seg.color }" />
                  <span class="text-caption text-grey-7 q-ml-xs"
                    >{{ seg.label }} ({{ seg.count }})</span
                  >
                </div>
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

            <!-- Case-level breakdown table -->
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
                <tr v-for="r in financialRows" :key="r.caseNo">
                  <td class="text-weight-medium text-primary">{{ r.caseNo }}</td>
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
                <div class="text-weight-bold text-grey-9">LKR {{ fmt(a.value) }}</div>
                <q-badge rounded :color="a.statusColor" :label="a.status" class="q-mt-xs" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- ── Section 4: Case Aging & Workload ── -->
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

            <!-- Lawyer workload table -->
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
                <tr v-for="l in lawyerWorkload" :key="l.name">
                  <td class="text-weight-medium">{{ l.name }}</td>
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
              <q-item v-for="h in upcomingHearings" :key="h.caseNo" class="q-pa-xs">
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

    <!-- ─── ROW 4: Monthly Case Filing Trend (bar chart substitute) ─ -->
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section class="slt-section-header">
            <q-icon name="show_chart" color="primary" size="20px" class="q-mr-sm" />
            Monthly Case Filing Trend — 2025/2026
          </q-card-section>
          <q-separator />
          <q-card-section class="q-pa-md">
            <!-- CSS bar chart -->
            <div
              class="row items-end q-gutter-xs slt-bar-chart"
              style="height: 160px; align-items: flex-end"
            >
              <div
                v-for="m in monthlyTrend"
                :key="m.month"
                class="col column items-center slt-bar-col"
              >
                <div class="text-caption text-weight-bold text-primary q-mb-xs">{{ m.filed }}</div>
                <div
                  class="slt-bar"
                  :style="{
                    height: (m.filed / maxMonthly) * 100 + '%',
                    background:
                      m.month.startsWith('Jan') || m.month.startsWith('Feb')
                        ? 'linear-gradient(180deg, #003F87, #1976D2)'
                        : 'linear-gradient(180deg, #2288cc, #90CAF9)',
                  }"
                >
                  <!-- closed overlay -->
                  <div
                    v-if="m.closed > 0"
                    class="slt-bar-closed"
                    :style="{ height: (m.closed / m.filed) * 100 + '%' }"
                  />
                </div>
                <div class="text-caption text-grey-6 q-mt-xs slt-month-label">{{ m.month }}</div>
              </div>
            </div>

            <!-- Legend -->
            <div class="row q-gutter-md q-mt-sm">
              <div class="row items-center">
                <div class="slt-legend-dot" style="background: #2288cc" />
                <span class="text-caption text-grey-7 q-ml-xs">Cases Filed</span>
              </div>
              <div class="row items-center">
                <div class="slt-legend-dot" style="background: rgba(0, 63, 135, 0.25)" />
                <span class="text-caption text-grey-7 q-ml-xs">Of which Closed</span>
              </div>
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
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  PERIOD SELECTOR (UI only — data stubbed)
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const period = ref('This Year')

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
//  SECTION 1 — ACTIVE CASES BY TYPE
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const casesByType = [
  {
    type: 'Money Recovery',
    total: 9,
    segs: [
      { label: 'Active', count: 5, color: '#21ba45' },
      { label: 'Pending Hearing', count: 3, color: '#f2c037' },
      { label: 'Under Review', count: 1, color: '#31ccec' },
    ],
  },
  {
    type: 'Land Case',
    total: 7,
    segs: [
      { label: 'Active', count: 3, color: '#21ba45' },
      { label: 'Pending Hearing', count: 2, color: '#f2c037' },
      { label: 'Under Review', count: 1, color: '#31ccec' },
      { label: 'Closed', count: 1, color: '#9e9e9e' },
    ],
  },
  {
    type: 'Damages',
    total: 4,
    segs: [
      { label: 'Active', count: 2, color: '#21ba45' },
      { label: 'Pending Hearing', count: 2, color: '#f2c037' },
    ],
  },
  {
    type: 'Appeals',
    total: 3,
    segs: [
      { label: 'Active', count: 1, color: '#21ba45' },
      { label: 'Closed', count: 2, color: '#9e9e9e' },
    ],
  },
  {
    type: 'Employee Disputes',
    total: 3,
    segs: [
      { label: 'Active', count: 2, color: '#21ba45' },
      { label: 'Under Review', count: 1, color: '#31ccec' },
    ],
  },
  {
    type: 'Other / Regulatory',
    total: 2,
    segs: [
      { label: 'Active', count: 1, color: '#21ba45' },
      { label: 'Under Review', count: 1, color: '#31ccec' },
    ],
  },
]

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
//  SECTION 5 — MONTHLY TREND
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

const maxMonthly = computed(() => Math.max(...monthlyTrend.map((m) => m.filed)))

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
  background: #f0f4f9;
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
  background: #f8f9fb;
  border: 1px solid #e0e7ef;
  border-radius: 8px;
  padding: 12px;
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
.slt-seg {
  transition: width 0.3s ease;
  min-width: 2px;
}

// ── Legend dot ────────────────────────────────────────────────
.slt-legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

// ── Markup table ─────────────────────────────────────────────
.slt-mu-table {
  :deep(thead tr th) {
    background: #eef2f8;
    color: #003f87;
    font-weight: 700;
    font-size: 0.72rem;
    text-transform: uppercase;
    padding: 8px 12px;
  }
  :deep(tbody tr td) {
    padding: 6px 12px;
  }
  :deep(tbody tr:hover td) {
    background: #f5f8ff;
  }
}

// ── Bar chart ─────────────────────────────────────────────────
.slt-bar-chart {
  border-bottom: 2px solid #e0e7ef;
  padding: 0 8px;
}
.slt-bar-col {
  position: relative;
  justify-content: flex-end;
  min-width: 0;
}
.slt-bar {
  width: 75%;
  min-height: 4px;
  border-radius: 4px 4px 0 0;
  position: relative;
  overflow: hidden;
  transition: height 0.4s ease;
}
.slt-bar-closed {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 63, 135, 0.25);
}
.slt-month-label {
  font-size: 0.65rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
</style>
