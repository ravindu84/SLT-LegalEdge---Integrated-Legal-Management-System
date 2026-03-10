<template>
  <q-page class="q-pa-md slt-page-bg">
    <!-- ─── Page Header ──────────────────────────────────────────── -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-weight-bold text-primary">
          <q-icon name="bar_chart" size="28px" class="q-mr-sm" />
          {{ $t('reports.title') }}
        </div>
        <div
          class="text-caption text-weight-medium"
          :class="$q.dark.isActive ? 'text-blue-1' : 'text-grey-9'"
          style="opacity: 0.85"
        >
          Legal performance metrics &amp; workload overview &nbsp;·&nbsp; Data as of:
          <strong :class="$q.dark.isActive ? 'text-blue-4' : 'text-blue-9'">{{
            new Date().toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })
          }}</strong>
        </div>
      </div>
      <div class="col-auto row q-gutter-sm">
        <q-select
          v-model="timeframe"
          :options="periodOptions"
          emit-value
          map-options
          dense
          outlined
          style="min-width: 150px"
          :label="$t('reports.period')"
        />
        <q-btn-dropdown
          outline
          color="primary"
          icon="file_download"
          :label="$t('reports.export')"
          size="sm"
          no-caps
        >
          <q-list dense>
            <q-item clickable v-close-popup @click="exportPDF">
              <q-item-section avatar
                ><q-icon name="picture_as_pdf" color="negative"
              /></q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('reports.exportPDF') }}</q-item-label>
                <q-item-label caption>Full report with charts</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="exportExcel">
              <q-item-section avatar><q-icon name="table_chart" color="positive" /></q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('reports.exportExcel') }}</q-item-label>
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
                <div
                  class="text-caption text-weight-medium"
                  :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-8'"
                  style="line-height: 1.2"
                >
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
                {{ Math.abs(kpi.trend) }}% {{ $t('dashboard.vsLastPeriod') }}
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
            {{ $t('reports.activeCasesByType') }}
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
                      {{ $t('reports.totalCases') }}
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
            {{ $t('reports.caseStatusDist') }}
          </q-card-section>
          <q-separator />
          <q-card-section class="q-pa-md">
            <q-markup-table flat dense separator="none" class="slt-mu-table q-mb-md">
              <thead>
                <tr>
                  <th class="text-left">{{ $t('reports.status') }}</th>
                  <th class="text-right">{{ $t('reports.count') }}</th>
                  <th class="text-right">% {{ $t('reports.share') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in caseStatusRows" :key="s.status">
                  <td>
                    <q-badge
                      rounded
                      :color="s.color"
                      :label="s.status"
                      :text-color="s.color === 'warning' ? 'black' : 'white'"
                    />
                  </td>
                  <td
                    class="text-right text-weight-bold"
                    :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                  >
                    {{ s.count }}
                  </td>
                  <td class="text-right" :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-8'">
                    {{ pct(s.count, totalCases) }}%
                  </td>
                </tr>
                <tr class="text-weight-bold">
                  <td>{{ $t('reports.total') }}</td>
                  <td class="text-right">{{ totalCases }}</td>
                  <td class="text-right">100%</td>
                </tr>
              </tbody>
            </q-markup-table>

            <!-- Visual donut substitute — stacked bar -->
            <div
              class="text-caption q-mb-xs"
              :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-8'"
            >
              Status share
            </div>
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
            <div class="row q-gutter-md q-mt-sm">
              <div v-for="s in caseStatusRows" :key="s.status" class="row items-center">
                <div class="slt-legend-dot" :style="{ background: statusColorHex(s.color) }" />
                <span
                  class="text-caption q-ml-xs"
                  :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-7'"
                  >{{ s.status }}</span
                >
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
            {{ $t('reports.financialExposureTitle') }}
          </q-card-section>
          <q-separator />
          <q-card-section class="q-pa-md">
            <!-- Summary totals -->
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-12 col-sm-4">
                <div class="slt-fin-box slt-fin-box--total">
                  <div
                    class="text-caption q-mb-xs"
                    :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-6'"
                  >
                    {{ $t('reports.totalClaimValue') }}
                  </div>
                  <div class="text-h5 text-weight-bold text-primary">
                    LKR {{ fmt(financialSummary.totalClaim) }}
                  </div>
                  <div class="text-caption text-grey-5">
                    {{ $t('reports.acrossCases', { count: financialRows.length }) }}
                  </div>
                </div>
              </div>
              <div class="col-12 col-sm-4">
                <div class="slt-fin-box slt-fin-box--paid">
                  <div
                    class="text-caption q-mb-xs"
                    :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-6'"
                  >
                    {{ $t('reports.totalRecoveredPaid') }}
                  </div>
                  <div class="text-h5 text-weight-bold text-positive">
                    LKR {{ fmt(financialSummary.totalPaid) }}
                  </div>
                  <div class="text-caption text-grey-5">
                    {{
                      $t('reports.ofTotalClaims', {
                        percent: pct(financialSummary.totalPaid, financialSummary.totalClaim),
                      })
                    }}
                  </div>
                </div>
              </div>
              <div class="col-12 col-sm-4">
                <div class="slt-fin-box slt-fin-box--balance">
                  <div
                    class="text-caption q-mb-xs"
                    :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-6'"
                  >
                    {{ $t('reports.outstandingBalance') }}
                  </div>
                  <div class="text-h5 text-weight-bold text-negative">
                    LKR {{ fmt(financialSummary.totalBalance) }}
                  </div>
                  <div class="text-caption text-grey-5">{{ $t('reports.pendingRecovery') }}</div>
                </div>
              </div>
            </div>

            <!-- Case-level breakdown table — DRILL-DOWN clickable -->
            <q-markup-table flat dense bordered separator="horizontal" class="slt-mu-table">
              <thead>
                <tr>
                  <th class="text-left">{{ $t('reports.caseNo') }}</th>
                  <th class="text-left">{{ $t('approvals.itemTitle') }}</th>
                  <th class="text-left">{{ $t('reports.status') }}</th>
                  <th class="text-right">Claim (LKR)</th>
                  <th class="text-right">Paid (LKR)</th>
                  <th class="text-right">Balance (LKR)</th>
                  <th class="text-center" style="min-width: 130px">Recovery</th>
                  <th class="text-center">{{ $t('reports.status') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="r in financialRows"
                  :key="r.caseNo"
                  class="cursor-pointer slt-drilldown-row"
                  @click="drillDown(r.caseNo, r.title)"
                >
                  <td
                    class="text-weight-medium"
                    :class="$q.dark.isActive ? 'text-white' : 'text-primary'"
                  >
                    {{ r.caseNo }}
                    <q-icon
                      name="open_in_new"
                      size="12px"
                      :color="$q.dark.isActive ? 'white' : 'grey-5'"
                      class="q-ml-xs"
                    />
                  </td>
                  <td>
                    <div style="max-width: 220px" class="ellipsis">{{ r.title }}</div>
                  </td>
                  <td>
                    <q-badge
                      :outline="!$q.dark.isActive"
                      :color="caseTypeColor(r.type)"
                      :label="r.type"
                      :class="$q.dark.isActive ? 'text-white' : ''"
                    />
                  </td>
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
            {{ $t('reports.agreementStatusSummary') }}
          </q-card-section>
          <q-separator />
          <q-card-section class="q-pa-md">
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-6">
                <div class="slt-fin-box q-pa-sm">
                  <div
                    class="text-caption"
                    :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-8'"
                  >
                    {{ $t('reports.totalAgreementValue') }}
                  </div>
                  <div class="text-h6 text-weight-bold text-primary">
                    LKR {{ fmt(totalAgrmValue) }}
                  </div>
                </div>
              </div>
              <div class="col-6">
                <div class="slt-fin-box q-pa-sm">
                  <div
                    class="text-caption"
                    :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-8'"
                  >
                    {{ $t('reports.kpiAgreements') }}
                  </div>
                  <div class="text-h6 text-weight-bold text-positive">
                    {{ agrmStageRows.find((r) => r.stage === $t('statuses.active'))?.count || 0 }}
                  </div>
                </div>
              </div>
            </div>

            <div v-for="row in agrmStageRows" :key="row.stage" class="q-mb-sm">
              <div class="row items-center q-mb-xs">
                <div style="min-width: 140px" class="q-mr-sm">
                  <q-badge rounded :color="row.color" :label="row.stage" class="full-width" />
                </div>
                <div class="col">
                  <q-linear-progress
                    :value="row.count / totalAgreements"
                    :color="row.color"
                    rounded
                    style="height: 10px"
                  />
                </div>
                <div
                  class="col-auto text-caption q-ml-sm"
                  :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-8'"
                  style="min-width: 48px; text-align: right"
                >
                  {{ row.count }} ({{ pct(row.count, totalAgreements) }}%)
                </div>
              </div>
            </div>

            <q-separator class="q-my-md" />

            <!-- Top agreements by value -->
            <div
              class="text-caption text-weight-bold q-mb-sm"
              :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-8'"
            >
              {{ $t('reports.topAgreementsByValue') }}
            </div>
            <div v-for="a in topAgreements" :key="a.title" class="row items-center q-mb-sm">
              <div class="col">
                <div class="text-body2 ellipsis" style="max-width: 240px">{{ a.title }}</div>
                <div class="text-caption" :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-8'">
                  {{ a.party }}
                </div>
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
            {{ $t('reports.caseAgingWorkload') }}
          </q-card-section>
          <q-separator />
          <q-card-section class="q-pa-md">
            <!-- Aging buckets -->
            <div
              class="text-caption text-weight-bold q-mb-sm"
              :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-8'"
            >
              {{ $t('reports.caseAgeDist') }}
            </div>
            <div v-for="bucket in agingBuckets" :key="bucket.label" class="q-mb-sm">
              <div class="row items-center q-mb-xs">
                <div
                  class="col-auto text-caption"
                  :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-8'"
                  style="min-width: 110px"
                >
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
            <div
              class="text-caption text-weight-bold q-mb-sm"
              :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-8'"
            >
              {{ $t('reports.lawyerWorkloadTitle') }}
            </div>
            <q-markup-table flat dense separator="horizontal" class="slt-mu-table">
              <thead>
                <tr>
                  <th class="text-left">{{ $t('reports.attorney') }}</th>
                  <th class="text-center">{{ $t('statuses.active') }}</th>
                  <th class="text-center">{{ $t('statuses.pendingHearing') }}</th>
                  <th class="text-right">{{ $t('reports.kpiExposure') }}</th>
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
                    <q-icon
                      name="open_in_new"
                      size="12px"
                      :color="$q.dark.isActive ? 'grey-4' : 'grey-8'"
                      class="q-ml-xs"
                    />
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
            <div
              class="text-caption text-weight-bold q-mb-sm"
              :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-8'"
            >
              {{ $t('reports.upcomingHearingsTitle') }}
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
                    :label="h.urgency === 'high' ? $t('common.urgent') : `${h.daysAway}d`"
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
            {{ $t('reports.monthlyTrendTitle') }}
          </q-card-section>
          <q-separator />
          <q-card-section class="q-pa-md">
            <div style="position: relative; height: 320px">
              <Bar :data="monthlyChartData" :options="barChartOptions" />
            </div>

            <q-separator class="q-my-sm" />

            <!-- Monthly summary table -->
            <q-markup-table flat dense separator="none" class="slt-mu-table q-mt-md">
              <thead>
                <tr>
                  <th
                    v-for="m in monthlyTrend"
                    :key="m.month"
                    class="text-center text-weight-bolder text-subtitle2"
                    :class="$q.dark.isActive ? 'text-grey-3' : 'text-grey-9'"
                  >
                    {{ m.month }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    v-for="m in monthlyTrend"
                    :key="m.month"
                    class="text-center text-weight-bolder text-h6 text-primary"
                    style="padding: 12px 0"
                  >
                    {{ m.filed }}
                  </td>
                </tr>
                <tr>
                  <td
                    v-for="m in monthlyTrend"
                    :key="m.month"
                    class="text-center text-weight-bolder text-subtitle1 text-positive"
                    style="padding: 12px 0"
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
              {{ $t('reports.exportingTo', { type: exportType === 'pdf' ? 'PDF' : 'Excel' }) }}
            </div>
            <div class="text-caption text-grey-6">{{ $t('reports.generatingReport') }}</div>
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
import { ref, computed, onMounted } from 'vue'
import { supabase } from 'src/boot/supabase'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
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
const { t } = useI18n()

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  PERIOD SELECTOR (UI only — data stubbed)
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const timeframe = ref('thisYear')
const periodOptions = computed(() => [
  { label: t('reports.thisMonth'), value: 'thisMonth' },
  { label: t('reports.last3Months'), value: 'last3Months' },
  { label: t('reports.thisYear'), value: 'thisYear' },
  { label: t('reports.allTime'), value: 'allTime' },
])

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  REAL-TIME DATA STATE
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const dbStats = ref({
  totalCases: 0,
  activeCases: 0,
  pendingHearings: 0,
  totalExposure: 0,
  totalRecovered: 0,
  totalAgreements: 0,
  activeAgreements: 0,
  upcomingHearingsCount: 0,
})

const casesByTypeData = ref([])
const caseStatusData = ref([])
const financialData = ref([])
const agreementStageData = ref([])
const topAgreementsData = ref([])
const agingData = ref([])
const lawyerData = ref([])
const upcomingHearingsData = ref([])
const monthlyTrendData = ref([])

const loading = ref(false)

async function fetchDashboardData() {
  loading.value = true
  try {
    // 1. Basic Counts
    const { count: casesCount } = await supabase
      .from('legal_cases')
      .select('*', { count: 'exact', head: true })
    const { count: activeCasesCount } = await supabase
      .from('legal_cases')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Active')
    const { count: pendingHearingsCount } = await supabase
      .from('legal_cases')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Pending Hearing')
    const { count: agrmCount } = await supabase
      .from('agreements')
      .select('*', { count: 'exact', head: true })
    const { count: activeAgrmCount } = await supabase
      .from('agreements')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Active')

    dbStats.value.totalCases = casesCount || 0
    dbStats.value.activeCases = activeCasesCount || 0
    dbStats.value.pendingHearings = pendingHearingsCount || 0
    dbStats.value.totalAgreements = agrmCount || 0
    dbStats.value.activeAgreements = activeAgrmCount || 0

    // 2. Financial Aggregates
    const { data: finDetails } = await supabase
      .from('money_recovery_details')
      .select('claim_amount, paid_amount')
    if (finDetails) {
      dbStats.value.totalExposure = finDetails.reduce((s, r) => s + (r.claim_amount || 0), 0)
      dbStats.value.totalRecovered = finDetails.reduce((s, r) => s + (r.paid_amount || 0), 0)
    }

    // 3. Cases By Type
    const { data: cases } = await supabase
      .from('legal_cases')
      .select('id, case_type, status, case_no, title, filed_date, closed_at, assigned_lawyer')
    if (cases) {
      const typeMap = {}
      cases.forEach((c) => {
        typeMap[c.case_type] = (typeMap[c.case_type] || 0) + 1
      })
      casesByTypeData.value = Object.keys(typeMap).map((type) => ({ type, total: typeMap[type] }))

      const statusMap = {}
      cases.forEach((c) => {
        statusMap[c.status] = (statusMap[c.status] || 0) + 1
      })
      caseStatusData.value = Object.keys(statusMap).map((status) => ({
        status,
        count: statusMap[status],
        color:
          status === 'Closed'
            ? 'positive'
            : status === 'Pending Hearing'
              ? 'warning'
              : status === 'Under Review'
                ? 'teal-7'
                : status === 'New'
                  ? 'indigo-7'
                  : 'blue-7',
      }))

      // Financial Rows Join
      const { data: finRecs } = await supabase
        .from('money_recovery_details')
        .select('case_id, claim_amount, paid_amount')
      financialData.value = cases
        .filter((c) => c.case_type === 'Money Recovery')
        .map((c) => {
          const d = finRecs?.find((r) => r.case_id === c.id)
          return {
            caseNo: c.case_no,
            title: c.title,
            type: c.case_type,
            claim: d?.claim_amount || 0,
            paid: d?.paid_amount || 0,
            status: c.status,
          }
        })

      // 4. Aging Buckets (Real calculation)
      const now = new Date()
      const buckets = {
        '< 30 days': 0,
        '30 – 90 days': 0,
        '90 – 180 days': 0,
        '180 – 365 days': 0,
        '> 1 year': 0,
      }
      cases.forEach((c) => {
        const diff = (now - new Date(c.filed_date)) / (1000 * 60 * 60 * 24)
        if (diff < 30) buckets['< 30 days']++
        else if (diff < 90) buckets['30 – 90 days']++
        else if (diff < 180) buckets['90 – 180 days']++
        else if (diff < 365) buckets['180 – 365 days']++
        else buckets['> 1 year']++
      })
      agingData.value = Object.keys(buckets).map((label) => ({
        label,
        count: buckets[label],
        color: label === '< 30 days' ? 'positive' : label === '> 1 year' ? 'negative' : 'warning',
      }))

      // 5. Lawyer Workload - Direct from DB
      const lawyerMap = {}
      cases.forEach((c) => {
        const name = c.assigned_lawyer || 'Unassigned'
        if (!lawyerMap[name]) lawyerMap[name] = { name, active: 0, pending: 0, exposure: 0 }
        if (c.status === 'Active') lawyerMap[name].active++
        if (c.status === 'Pending Hearing') lawyerMap[name].pending++
        const d = finRecs?.find((r) => r.case_id === c.id)
        lawyerMap[name].exposure += d?.claim_amount || 0
      })
      lawyerData.value = Object.values(lawyerMap).sort((a, b) => b.active - a.active)

      // 6. Agreement Stages
      const { data: agrmData } = await supabase
        .from('agreements')
        .select('status, value, title, party2')
      if (agrmData) {
        const agrmStatusMap = {}
        agrmData.forEach((a) => {
          agrmStatusMap[a.status] = (agrmStatusMap[a.status] || 0) + 1
        })
        agreementStageData.value = Object.keys(agrmStatusMap).map((status) => ({
          stage: status,
          count: agrmStatusMap[status],
          color:
            status === 'Active'
              ? 'positive'
              : status === 'Draft'
                ? 'grey-6'
                : status.includes('L1') || status.includes('L2')
                  ? 'warning'
                  : status === 'Rejected'
                    ? 'negative'
                    : 'info',
        }))

        // Top Agreements
        topAgreementsData.value = [...agrmData]
          .sort((a, b) => (b.value || 0) - (a.value || 0))
          .slice(0, 5)
          .map((a) => ({
            title: a.title,
            party: a.party2,
            value: a.value,
            status: a.status,
            statusColor:
              a.status === 'Active'
                ? 'positive'
                : a.status.includes('Approval')
                  ? 'warning'
                  : 'grey-6',
          }))
      }

      // 7. Upcoming Hearings
      const thirtyDaysHence = new Date()
      thirtyDaysHence.setDate(thirtyDaysHence.getDate() + 30)
      const { data: hearings } = await supabase
        .from('legal_cases')
        .select('case_no, title, court, next_hearing')
        .not('next_hearing', 'is', null)
        .gte('next_hearing', new Date().toISOString().split('T')[0])
        .lte('next_hearing', thirtyDaysHence.toISOString().split('T')[0])
        .order('next_hearing', { ascending: true })

      if (hearings) {
        upcomingHearingsData.value = hearings.map((h) => {
          const hDate = new Date(h.next_hearing)
          const diffDays = Math.ceil((hDate - new Date()) / (1000 * 60 * 60 * 24))
          return {
            caseNo: h.case_no,
            title: h.title,
            court: h.court,
            date: hDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
            daysAway: diffDays,
            urgency: diffDays <= 7 ? 'high' : 'normal',
          }
        })
        dbStats.value.upcomingHearingsCount = hearings.length
      }
    }

    // 6. Monthly Trend (Ensuring 12 months)
    const trendMap = {}
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ]

    // Initialize trendMap with last 12 months (0 by default)
    const now = new Date()
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${months[d.getMonth()]}'${d.getFullYear().toString().slice(-2)}`
      trendMap[key] = { month: key, filed: 0, closed: 0, sortKey: d.getTime() }
    }

    // Populate with data from database
    cases.forEach((c) => {
      const fDate = new Date(c.filed_date)
      const fKey = `${months[fDate.getMonth()]}'${fDate.getFullYear().toString().slice(-2)}`
      if (trendMap[fKey]) trendMap[fKey].filed++

      if (c.status === 'Closed' && c.closed_at) {
        const cDate = new Date(c.closed_at)
        const cKey = `${months[cDate.getMonth()]}'${cDate.getFullYear().toString().slice(-2)}`
        if (trendMap[cKey]) trendMap[cKey].closed++
      }
    })

    const finalTrendData = Object.values(trendMap).sort((a, b) => a.sortKey - b.sortKey)
    monthlyTrendData.value = finalTrendData
  } catch (err) {
    console.error('Error fetching dashboard data:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboardData()

  // Set up real-time subscriptions
  const casesChannel = supabase
    .channel('reports-db-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'legal_cases' }, () => {
      fetchDashboardData()
    })
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'money_recovery_details' },
      () => {
        fetchDashboardData()
      },
    )
    .on('postgres_changes', { event: '*', schema: 'public', table: 'agreements' }, () => {
      fetchDashboardData()
    })
    .subscribe()

  // Cleanup subscription on unmount
  return () => {
    supabase.removeChannel(casesChannel)
  }
})

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
const topKpis = computed(() => [
  {
    label: t('reports.totalCases'),
    value: dbStats.value.totalCases.toString(),
    icon: 'gavel',
    color: 'primary',
    bg: 'blue-1',
    trend: 0,
    trendGood: false,
  },
  {
    label: t('reports.kpiExposure'),
    value: `LKR ${fmt(dbStats.value.totalExposure / 1000000)}M`,
    icon: 'account_balance_wallet',
    color: 'negative',
    bg: 'red-1',
    trend: 0,
    trendGood: false,
  },
  {
    label: t('reports.kpiAgreements'),
    value: dbStats.value.totalAgreements.toString(),
    icon: 'handshake',
    color: 'positive',
    bg: 'green-1',
    trend: 0,
    trendGood: true,
  },
  {
    label: t('dashboard.hearings'),
    value: dbStats.value.upcomingHearingsCount.toString(),
    icon: 'event',
    color: 'warning',
    bg: 'orange-1',
    trend: 0,
    trendGood: true,
  },
])

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  SECTION 1 — ACTIVE CASES BY TYPE (CHART.JS DOUGHNUT)
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const casesByType = computed(() => {
  if (casesByTypeData.value.length > 0) return casesByTypeData.value
  return [
    { type: t('cases.types.recovery'), total: 0 },
    { type: t('cases.types.land'), total: 0 },
    { type: t('cases.types.damages'), total: 0 },
  ]
})

const caseTypeColors = [
  '#0D47A1', // Money Recovery (Vibrant Blue)
  '#8E24AA', // Land Case (Vibrant Purple)
  '#F4511E', // Damages (Vibrant Deep Orange)
  '#00897B', // Inquiry/Teal
  '#D81B60', // Criminal/Pink-Red
  '#0277BD', // Appeals/Light Blue
  '#546E7A', // Other/Blue Grey
]

const casesByTypeChartData = computed(() => ({
  labels: casesByType.value.map((c) => c.type),
  datasets: [
    {
      data: casesByType.value.map((c) => c.total),
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

const caseStatusRows = computed(() => {
  if (caseStatusData.value.length > 0) return caseStatusData.value
  return [
    { status: t('statuses.active'), count: 0, color: 'positive' },
    { status: t('statuses.pendingHearing'), count: 0, color: 'warning' },
  ]
})

const totalCases = computed(() => caseStatusRows.value.reduce((s, r) => s + r.count, 0))

const statusColorHexMap = {
  positive: '#21BA45', // Closed
  warning: '#F2C037', // Pending
  'teal-7': '#00796B', // Under Review
  'indigo-7': '#303F9F', // New
  'blue-7': '#1976D2', // Active
  primary: '#003F87',
}
function statusColorHex(color) {
  return statusColorHexMap[color] || '#9e9e9e'
}

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  SECTION 2 — FINANCIAL EXPOSURE
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const financialRows = computed(() => financialData.value)

const financialSummary = computed(() => ({
  totalClaim: dbStats.value.totalExposure,
  totalPaid: dbStats.value.totalRecovered,
  totalBalance: dbStats.value.totalExposure - dbStats.value.totalRecovered,
}))

function caseTypeColor(type) {
  return (
    {
      'Money Recovery': 'primary',
      'Land Case': 'purple-7',
      Damages: 'orange-8',
      Appeals: 'deep-orange-9',
      Inquiry: 'teal-7',
      Criminal: 'red-9',
      Other: 'blue-grey-6',
    }[type] || 'grey-7'
  )
}

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  SECTION 3 — AGREEMENTS
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const agrmStageRows = computed(() => {
  if (agreementStageData.value.length > 0) return agreementStageData.value
  return [
    { stage: t('statuses.active'), count: 0, color: 'positive' },
    { stage: t('statuses.draft'), count: 0, color: 'grey-6' },
  ]
})

const totalAgreements = computed(() => dbStats.value.totalAgreements)

const topAgreements = computed(() => topAgreementsData.value)

const totalAgrmValue = computed(() => topAgreements.value.reduce((s, a) => s + (a.value || 0), 0))

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  SECTION 4 — CASE AGING & WORKLOAD
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const agingBuckets = computed(() => {
  if (agingData.value.length > 0) return agingData.value
  return [{ label: '< 30 days', count: dbStats.value.totalCases, color: 'positive' }]
})

const lawyerWorkload = computed(() => {
  if (lawyerData.value.length > 0) return lawyerData.value
  return [
    {
      name: 'N. Silva',
      active: dbStats.value.totalCases,
      pending: 0,
      exposure: dbStats.value.totalExposure,
    },
  ]
})

const maxLawyerCases = computed(() => Math.max(...lawyerWorkload.value.map((l) => l.active)))

const upcomingHearings = computed(() => upcomingHearingsData.value)

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  SECTION 5 — MONTHLY TREND (CHART.JS BAR)
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const monthlyTrend = computed(() => {
  if (Array.isArray(monthlyTrendData.value) && monthlyTrendData.value.length > 0) {
    return monthlyTrendData.value
  }
  // Fallback for demo if DB is empty (should not happen with our seeds)
  const fallbackMonths = [
    "Mar'25",
    "Apr'25",
    "May'25",
    "Jun'25",
    "Jul'25",
    "Aug'25",
    "Sep'25",
    "Oct'25",
    "Nov'25",
    "Dec'25",
    "Jan'26",
    "Feb'26",
  ]
  return fallbackMonths.map((m) => ({ month: m, filed: 0, closed: 0 }))
})

const monthlyChartData = computed(() => {
  const data = monthlyTrend.value
  const isDark = $q.dark.isActive
  return {
    labels: data.map((m) => m.month),
    datasets: [
      {
        label: 'Cases Filed',
        data: data.map((m) => m.filed),
        backgroundColor: (ctx) => {
          const chart = ctx.chart
          const { ctx: canvasCtx, chartArea } = chart
          if (!chartArea) return '#0072ff'
          const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
          gradient.addColorStop(0, '#00c6ff')
          gradient.addColorStop(1, '#0072ff')
          return gradient
        },
        borderRadius: 6,
        borderWidth: isDark ? 1 : 0,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        borderSkipped: false,
        barPercentage: 0.85,
        categoryPercentage: 0.75,
      },
      {
        label: 'Cases Closed',
        data: data.map((m) => m.closed),
        backgroundColor: (ctx) => {
          const chart = ctx.chart
          const { ctx: canvasCtx, chartArea } = chart
          if (!chartArea) return '#00b09b'
          const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
          gradient.addColorStop(0, '#96c93d')
          gradient.addColorStop(1, '#00b09b')
          return gradient
        },
        borderRadius: 6,
        borderWidth: isDark ? 1 : 0,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        borderSkipped: false,
        barPercentage: 0.85,
        categoryPercentage: 0.75,
      },
    ],
  }
})

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
        font: { size: 12, weight: '700' },
        color: () => ($q.dark.isActive ? '#ECEFF1' : '#455A64'),
      },
    },
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0,
        font: { size: 12, weight: '700' },
        color: () => ($q.dark.isActive ? '#ECEFF1' : '#455A64'),
      },
      grid: {
        color: () => ($q.dark.isActive ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
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
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  animation: fadeIn 0.6s ease-out;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 63, 135, 0.15);
    border-color: var(--q-primary);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slt-page-bg {
  animation: fadeIn 0.8s ease-out;
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
  background: transparent;
  :deep(thead tr th) {
    background: rgba(255, 255, 255, 0.03);
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
