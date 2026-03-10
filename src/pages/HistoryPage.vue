<template>
  <q-page class="q-pa-md slt-page-bg">
    <!-- ─── Page Header ──────────────────────────────────────────── -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-weight-bold text-primary">
          <q-icon name="history" size="28px" class="q-mr-sm" />
          {{ $t('history.title') }}
        </div>
        <div class="text-caption text-grey-6">
          {{ $t('history.subtitle') }}
        </div>
      </div>
      <div class="col-auto">
        <q-btn outline color="primary" icon="file_download" label="Export" size="sm" no-caps />
      </div>
    </div>

    <!-- ─── KPI Cards ──────────────────────────────────────────── -->
    <div class="row q-col-gutter-sm q-mb-md">
      <div v-for="kpi in kpiStats" :key="kpi.label" class="col-6 col-sm-3">
        <q-card flat bordered class="slt-kpi-card">
          <q-card-section class="q-pa-sm row items-center no-wrap">
            <q-avatar :color="kpi.bg" size="40px" class="q-mr-sm">
              <q-icon :name="kpi.icon" :color="kpi.color" size="22px" />
            </q-avatar>
            <div>
              <div class="text-h6 text-weight-bold" :class="`text-${kpi.color}`">
                {{ kpi.count }}
              </div>
              <div class="text-caption text-grey-6">{{ kpi.label }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- ─── Tabs ───────────────────────────────────────────────── -->
    <q-card flat bordered class="q-mb-md">
      <q-tabs
        v-model="activeTab"
        dense
        class="slt-tabs"
        active-color="primary"
        indicator-color="primary"
        align="left"
      >
        <q-tab name="cases" no-caps>
          <div class="row items-center q-gutter-xs">
            <q-icon name="gavel" size="18px" />
            <span>Closed Cases</span>
            <q-badge v-if="closedCases.length" color="blue-grey" rounded>
              {{ closedCases.length }}
            </q-badge>
          </div>
        </q-tab>
        <q-tab name="agreements" no-caps>
          <div class="row items-center q-gutter-xs">
            <q-icon name="handshake" size="18px" />
            <span>Expired / Terminated Agreements</span>
            <q-badge v-if="expiredAgreements.length" color="orange" rounded>
              {{ expiredAgreements.length }}
            </q-badge>
          </div>
        </q-tab>
        <q-tab name="documents" no-caps>
          <div class="row items-center q-gutter-xs">
            <q-icon name="description" size="18px" />
            <span>Processed Documents</span>
            <q-badge v-if="processedDocs.length" color="teal" rounded>
              {{ processedDocs.length }}
            </q-badge>
          </div>
        </q-tab>
      </q-tabs>
    </q-card>

    <!-- ─── Filters ────────────────────────────────────────────── -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="row q-col-gutter-sm items-center q-py-sm">
        <div class="col-12 col-sm-4">
          <q-input v-model="filter" dense outlined clearable placeholder="Search records…">
            <template #prepend><q-icon name="search" /></template>
          </q-input>
        </div>
        <div class="col-6 col-sm-3">
          <q-input v-model="dateFrom" dense outlined type="date" stack-label label="From Date" />
        </div>
        <div class="col-6 col-sm-3">
          <q-input v-model="dateTo" dense outlined type="date" stack-label label="To Date" />
        </div>
        <div class="col-auto">
          <q-btn flat icon="restart_alt" color="grey-7" dense @click="resetFilters">
            <q-tooltip>Reset</q-tooltip>
          </q-btn>
        </div>
      </q-card-section>
    </q-card>

    <!-- ─── Tab Panels ─────────────────────────────────────────── -->
    <q-card flat bordered>
      <q-tab-panels v-model="activeTab" animated>
        <!-- ═══ CLOSED CASES ═══ -->
        <q-tab-panel name="cases" class="q-pa-none">
          <q-table
            :rows="filteredCases"
            :columns="caseCols"
            row-key="id"
            :filter="filter"
            :loading="loading"
            :pagination="{ rowsPerPage: 10 }"
            flat
            class="slt-table"
            no-data-label="No closed cases found"
          >
            <template #body-cell-case_no="props">
              <q-td :props="props">
                <span class="text-weight-bold text-primary">#{{ props.value }}</span>
              </q-td>
            </template>

            <template #body-cell-case_type="props">
              <q-td :props="props" class="text-center">
                <q-chip dense size="sm" :color="typeColor(props.value)" text-color="white">
                  {{ props.value }}
                </q-chip>
              </q-td>
            </template>

            <template #body-cell-status="props">
              <q-td :props="props" class="text-center">
                <q-badge rounded color="blue-grey" :label="props.value" />
              </q-td>
            </template>

            <template #body-cell-financial_exposure="props">
              <q-td :props="props" class="text-right">
                <span v-if="props.value" class="text-weight-medium"
                  >LKR {{ fmt(props.value) }}</span
                >
                <span v-else class="text-grey-4">—</span>
              </q-td>
            </template>

            <template #body-cell-closed_at="props">
              <q-td :props="props" class="text-center">
                <span v-if="props.value">{{ formatDate(props.value) }}</span>
                <span v-else class="text-grey-4">—</span>
              </q-td>
            </template>

            <template #body-cell-actions="props">
              <q-td :props="props" class="text-center">
                <div class="row justify-center q-gutter-xs no-wrap">
                  <q-btn
                    flat
                    round
                    dense
                    icon="visibility"
                    color="primary"
                    size="sm"
                    @click="viewCase(props.row)"
                  >
                    <q-tooltip>View Details</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    dense
                    icon="lock_open"
                    color="positive"
                    size="sm"
                    @click="reopenCase(props.row)"
                  >
                    <q-tooltip>Reopen Case</q-tooltip>
                  </q-btn>
                </div>
              </q-td>
            </template>

            <template #no-data="{ message }">
              <div class="full-width column flex-center text-grey-5 q-py-xl">
                <q-icon name="history" size="56px" />
                <div class="q-mt-sm">{{ message }}</div>
              </div>
            </template>
          </q-table>
        </q-tab-panel>

        <!-- ═══ EXPIRED AGREEMENTS ═══ -->
        <q-tab-panel name="agreements" class="q-pa-none">
          <q-table
            :rows="filteredAgreements"
            :columns="agrmCols"
            row-key="id"
            :filter="filter"
            :loading="loading"
            :pagination="{ rowsPerPage: 10 }"
            flat
            class="slt-table"
            no-data-label="No expired or terminated agreements found"
          >
            <template #body-cell-agreement_type="props">
              <q-td :props="props" class="text-center">
                <q-chip dense size="sm" color="orange" text-color="white">
                  {{ props.value }}
                </q-chip>
              </q-td>
            </template>

            <template #body-cell-status="props">
              <q-td :props="props" class="text-center">
                <q-badge
                  rounded
                  :color="props.value === 'Expired' ? 'negative' : 'blue-grey'"
                  :label="props.value"
                />
              </q-td>
            </template>

            <template #body-cell-value="props">
              <q-td :props="props" class="text-right">
                <span v-if="props.value" class="text-weight-medium"
                  >LKR {{ fmt(props.value) }}</span
                >
                <span v-else class="text-grey-4">—</span>
              </q-td>
            </template>

            <template #body-cell-actions="props">
              <q-td :props="props" class="text-center">
                <q-btn
                  flat
                  round
                  dense
                  icon="visibility"
                  color="primary"
                  size="sm"
                  @click="viewAgreement(props.row)"
                >
                  <q-tooltip>View Details</q-tooltip>
                </q-btn>
              </q-td>
            </template>

            <template #no-data="{ message }">
              <div class="full-width column flex-center text-grey-5 q-py-xl">
                <q-icon name="handshake" size="56px" />
                <div class="q-mt-sm">{{ message }}</div>
              </div>
            </template>
          </q-table>
        </q-tab-panel>

        <!-- ═══ PROCESSED DOCUMENTS ═══ -->
        <q-tab-panel name="documents" class="q-pa-none">
          <q-table
            :rows="filteredDocs"
            :columns="docCols"
            row-key="id"
            :filter="filter"
            :loading="loading"
            :pagination="{ rowsPerPage: 10 }"
            flat
            class="slt-table"
            no-data-label="No processed documents found"
          >
            <template #body-cell-status="props">
              <q-td :props="props" class="text-center">
                <q-badge
                  rounded
                  :color="props.value === 'Approved' ? 'positive' : 'negative'"
                  :label="props.value"
                />
              </q-td>
            </template>

            <template #body-cell-financial_exposure="props">
              <q-td :props="props" class="text-right">
                <span v-if="props.value" class="text-weight-medium"
                  >LKR {{ fmt(props.value) }}</span
                >
                <span v-else class="text-grey-4">—</span>
              </q-td>
            </template>

            <template #body-cell-actions="props">
              <q-td :props="props" class="text-center">
                <q-btn
                  flat
                  round
                  dense
                  icon="visibility"
                  color="primary"
                  size="sm"
                  @click="viewDoc(props.row)"
                >
                  <q-tooltip>View Details</q-tooltip>
                </q-btn>
              </q-td>
            </template>

            <template #no-data="{ message }">
              <div class="full-width column flex-center text-grey-5 q-py-xl">
                <q-icon name="description" size="56px" />
                <div class="q-mt-sm">{{ message }}</div>
              </div>
            </template>
          </q-table>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <!-- ═══ CASE DETAIL DIALOG ═══ -->
    <q-dialog v-model="showCaseDialog">
      <q-card v-if="selectedCase" style="width: 650px; max-width: 95vw">
        <q-bar class="slt-dialog-bar text-white">
          <q-icon name="gavel" />
          <div class="text-weight-bold q-ml-sm">
            Case #{{ selectedCase.case_no }} — {{ selectedCase.title }}
          </div>
          <q-space />
          <q-badge color="blue-grey" :label="selectedCase.status" rounded class="q-mr-md" />
          <q-btn dense flat icon="close" @click="showCaseDialog = false" />
        </q-bar>
        <q-card-section class="q-pa-md">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <div class="row items-start q-py-xs border-bottom">
                <div
                  class="col-5 row items-center text-weight-bold"
                  :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
                >
                  <q-icon name="tag" size="13px" class="q-mr-xs" />Case Number
                </div>
                <div
                  class="col-7 text-body2 text-weight-bold"
                  :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                >
                  {{ selectedCase.case_no }}
                </div>
              </div>
              <div class="row items-start q-py-xs border-bottom">
                <div
                  class="col-5 row items-center text-weight-bold"
                  :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
                >
                  <q-icon name="category" size="13px" class="q-mr-xs" />Case Type
                </div>
                <div
                  class="col-7 text-body2 text-weight-bold"
                  :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                >
                  {{ selectedCase.case_type }}
                </div>
              </div>
              <div class="row items-start q-py-xs border-bottom">
                <div
                  class="col-5 row items-center text-weight-bold"
                  :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
                >
                  <q-icon name="person" size="13px" class="q-mr-xs" />Plaintiff
                </div>
                <div
                  class="col-7 text-body2 text-weight-bold"
                  :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                >
                  {{ selectedCase.plaintiff }}
                </div>
              </div>
              <div class="row items-start q-py-xs border-bottom">
                <div
                  class="col-5 row items-center text-weight-bold"
                  :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
                >
                  <q-icon name="person_off" size="13px" class="q-mr-xs" />Defendant
                </div>
                <div
                  class="col-7 text-body2 text-weight-bold"
                  :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                >
                  {{ selectedCase.defendant }}
                </div>
              </div>
              <div class="row items-start q-py-xs border-bottom">
                <div
                  class="col-5 row items-center text-weight-bold"
                  :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
                >
                  <q-icon name="badge" size="13px" class="q-mr-xs" />Legal Officer
                </div>
                <div
                  class="col-7 text-body2 text-weight-bold"
                  :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                >
                  {{ selectedCase.legal_officer || '—' }}
                </div>
              </div>
            </div>
            <div class="col-12 col-sm-6">
              <div class="row items-start q-py-xs border-bottom">
                <div
                  class="col-5 row items-center text-weight-bold"
                  :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
                >
                  <q-icon name="account_balance" size="13px" class="q-mr-xs" />Court
                </div>
                <div
                  class="col-7 text-body2 text-weight-bold"
                  :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                >
                  {{ selectedCase.court }}
                </div>
              </div>
              <div class="row items-start q-py-xs border-bottom">
                <div
                  class="col-5 row items-center text-weight-bold"
                  :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
                >
                  <q-icon name="payments" size="13px" class="q-mr-xs" />Financial Exposure
                </div>
                <div
                  class="col-7 text-body2 text-weight-bold"
                  :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                >
                  {{
                    selectedCase.financial_exposure
                      ? `LKR ${fmt(selectedCase.financial_exposure)}`
                      : '—'
                  }}
                </div>
              </div>
              <div class="row items-start q-py-xs border-bottom">
                <div
                  class="col-5 row items-center text-weight-bold"
                  :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
                >
                  <q-icon name="event" size="13px" class="q-mr-xs" />Filed Date
                </div>
                <div
                  class="col-7 text-body2 text-weight-bold"
                  :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                >
                  {{ formatDate(selectedCase.filed_date) }}
                </div>
              </div>
              <div class="row items-start q-py-xs border-bottom">
                <div
                  class="col-5 row items-center text-weight-bold"
                  :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
                >
                  <q-icon name="event_busy" size="13px" class="q-mr-xs" />Closed Date
                </div>
                <div
                  class="col-7 text-body2 text-weight-bold"
                  :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                >
                  {{ formatDate(selectedCase.closed_at) }}
                </div>
              </div>
            </div>
            <div class="col-12" v-if="selectedCase.closure_remarks">
              <div
                class="text-caption text-weight-bold q-mb-xs"
                :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
              >
                Closure Remarks
              </div>
              <p
                class="text-body2 text-weight-medium q-mb-none"
                :class="$q.dark.isActive ? 'text-grey-3' : 'text-grey-8'"
              >
                {{ selectedCase.closure_remarks }}
              </p>
            </div>
            <div class="col-12" v-if="selectedCase.summary_of_facts">
              <div
                class="text-caption text-weight-bold q-mb-xs"
                :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
              >
                Summary of Facts
              </div>
              <p
                class="text-body2 text-weight-medium q-mb-none"
                :class="$q.dark.isActive ? 'text-grey-3' : 'text-grey-8'"
              >
                {{ selectedCase.summary_of_facts }}
              </p>
            </div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            unelevated
            no-caps
            color="positive"
            icon="lock_open"
            label="Reopen Case"
            @click="handleReopen(selectedCase)"
          />

          <q-btn flat no-caps label="Close" color="grey-7" @click="showCaseDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ═══ AGREEMENT DETAIL DIALOG ═══ -->
    <q-dialog v-model="showAgrmDialog">
      <q-card v-if="selectedAgrm" style="width: 650px; max-width: 95vw">
        <q-bar class="slt-dialog-bar text-white">
          <q-icon name="handshake" />
          <div class="text-weight-bold q-ml-sm">{{ selectedAgrm.title }}</div>
          <q-space />
          <q-badge
            :color="selectedAgrm.status === 'Expired' ? 'negative' : 'blue-grey'"
            :label="selectedAgrm.status"
            rounded
            class="q-mr-md"
          />
          <q-btn dense flat icon="close" @click="showAgrmDialog = false" />
        </q-bar>
        <q-card-section class="q-pa-md">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <div class="row items-start q-py-xs border-bottom">
                <div
                  class="col-5 row items-center text-weight-bold"
                  :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
                >
                  <q-icon name="tag" size="13px" class="q-mr-xs" />Reference
                </div>
                <div
                  class="col-7 text-body2 text-weight-bold"
                  :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                >
                  {{ selectedAgrm.reference_no }}
                </div>
              </div>
              <div class="row items-start q-py-xs border-bottom">
                <div
                  class="col-5 row items-center text-weight-bold"
                  :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
                >
                  <q-icon name="category" size="13px" class="q-mr-xs" />Type
                </div>
                <div
                  class="col-7 text-body2 text-weight-bold"
                  :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                >
                  {{ selectedAgrm.agreement_type }}
                </div>
              </div>
              <div class="row items-start q-py-xs border-bottom">
                <div
                  class="col-5 row items-center text-weight-bold"
                  :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
                >
                  <q-icon name="person" size="13px" class="q-mr-xs" />Party 1
                </div>
                <div
                  class="col-7 text-body2 text-weight-bold"
                  :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                >
                  {{ selectedAgrm.party1 }}
                </div>
              </div>
              <div class="row items-start q-py-xs border-bottom">
                <div
                  class="col-5 row items-center text-weight-bold"
                  :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
                >
                  <q-icon name="people" size="13px" class="q-mr-xs" />Party 2
                </div>
                <div
                  class="col-7 text-body2 text-weight-bold"
                  :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                >
                  {{ selectedAgrm.party2 }}
                </div>
              </div>
            </div>
            <div class="col-12 col-sm-6">
              <div class="row items-start q-py-xs border-bottom">
                <div
                  class="col-5 row items-center text-weight-bold"
                  :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
                >
                  <q-icon name="payments" size="13px" class="q-mr-xs" />Value
                </div>
                <div
                  class="col-7 text-body2 text-weight-bold"
                  :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                >
                  {{ selectedAgrm.value ? `LKR ${fmt(selectedAgrm.value)}` : '—' }}
                </div>
              </div>
              <div class="row items-start q-py-xs border-bottom">
                <div
                  class="col-5 row items-center text-weight-bold"
                  :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
                >
                  <q-icon name="event" size="13px" class="q-mr-xs" />Start Date
                </div>
                <div
                  class="col-7 text-body2 text-weight-bold"
                  :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                >
                  {{ formatDate(selectedAgrm.start_date) }}
                </div>
              </div>
              <div class="row items-start q-py-xs border-bottom">
                <div
                  class="col-5 row items-center text-weight-bold"
                  :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
                >
                  <q-icon name="event_busy" size="13px" class="q-mr-xs" />Expiry Date
                </div>
                <div
                  class="col-7 text-body2 text-weight-bold"
                  :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                >
                  {{ formatDate(selectedAgrm.expiry_date) }}
                </div>
              </div>
              <div class="row items-start q-py-xs border-bottom">
                <div
                  class="col-5 row items-center text-weight-bold"
                  :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
                >
                  <q-icon name="info" size="13px" class="q-mr-xs" />Status
                </div>
                <div
                  class="col-7 text-body2 text-weight-bold"
                  :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                >
                  {{ selectedAgrm.status }}
                </div>
              </div>
            </div>
            <div class="col-12" v-if="selectedAgrm.description">
              <div
                class="text-caption text-weight-bold q-mb-xs"
                :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
              >
                Description
              </div>
              <p
                class="text-body2 text-weight-medium q-mb-none"
                :class="$q.dark.isActive ? 'text-grey-3' : 'text-grey-8'"
              >
                {{ selectedAgrm.description }}
              </p>
            </div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat no-caps label="Close" color="grey-7" @click="showAgrmDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ═══ DOCUMENT DETAIL DIALOG ═══ -->
    <q-dialog v-model="showDocDialog">
      <q-card v-if="selectedDoc" style="width: 650px; max-width: 95vw">
        <q-bar class="slt-dialog-bar text-white">
          <q-icon name="description" />
          <div class="text-weight-bold q-ml-sm">{{ selectedDoc.title }}</div>
          <q-space />
          <q-badge
            :color="selectedDoc.status === 'Approved' ? 'positive' : 'negative'"
            :label="selectedDoc.status"
            rounded
            class="q-mr-md"
          />
          <q-btn dense flat icon="close" @click="showDocDialog = false" />
        </q-bar>
        <q-card-section class="q-pa-md">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <div class="row items-start q-py-xs border-bottom">
                <div
                  class="col-5 row items-center text-weight-bold"
                  :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
                >
                  <q-icon name="tag" size="13px" class="q-mr-xs" />Reference
                </div>
                <div
                  class="col-7 text-body2 text-weight-bold"
                  :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                >
                  {{ selectedDoc.reference_number }}
                </div>
              </div>
              <div class="row items-start q-py-xs border-bottom">
                <div
                  class="col-5 row items-center text-weight-bold"
                  :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
                >
                  <q-icon name="category" size="13px" class="q-mr-xs" />Type
                </div>
                <div
                  class="col-7 text-body2 text-weight-bold"
                  :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                >
                  {{ selectedDoc.document_type }}
                </div>
              </div>
              <div class="row items-start q-py-xs border-bottom">
                <div
                  class="col-5 row items-center text-weight-bold"
                  :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
                >
                  <q-icon name="people" size="13px" class="q-mr-xs" />Parties
                </div>
                <div
                  class="col-7 text-body2 text-weight-bold"
                  :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                >
                  {{ selectedDoc.parties_involved }}
                </div>
              </div>
            </div>
            <div class="col-12 col-sm-6">
              <div class="row items-start q-py-xs border-bottom">
                <div
                  class="col-5 row items-center text-weight-bold"
                  :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
                >
                  <q-icon name="payments" size="13px" class="q-mr-xs" />Exposure
                </div>
                <div
                  class="col-7 text-body2 text-weight-bold"
                  :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                >
                  {{
                    selectedDoc.financial_exposure
                      ? `LKR ${fmt(selectedDoc.financial_exposure)}`
                      : '—'
                  }}
                </div>
              </div>
              <div class="row items-start q-py-xs border-bottom">
                <div
                  class="col-5 row items-center text-weight-bold"
                  :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
                >
                  <q-icon name="account_balance" size="13px" class="q-mr-xs" />Court
                </div>
                <div
                  class="col-7 text-body2 text-weight-bold"
                  :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                >
                  {{ selectedDoc.court_name }}
                </div>
              </div>
              <div class="row items-start q-py-xs border-bottom">
                <div
                  class="col-5 row items-center text-weight-bold"
                  :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
                >
                  <q-icon name="info" size="13px" class="q-mr-xs" />Status
                </div>
                <div
                  class="col-7 text-body2 text-weight-bold"
                  :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                >
                  {{ selectedDoc.status }}
                </div>
              </div>
            </div>
            <div class="col-12" v-if="selectedDoc.summary_of_facts">
              <div
                class="text-caption text-weight-bold q-mb-xs"
                :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
              >
                Summary of Facts
              </div>
              <p
                class="text-body2 text-weight-medium q-mb-none"
                :class="$q.dark.isActive ? 'text-grey-3' : 'text-grey-8'"
              >
                {{ selectedDoc.summary_of_facts }}
              </p>
            </div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat no-caps label="Close" color="grey-7" @click="showDocDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { supabase } from 'src/boot/supabase'

const $q = useQuasar()

// ── State ─────────────────────────────────────────────────────
const loading = ref(false)
const filter = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const activeTab = ref('cases')

const closedCases = ref([])
const expiredAgreements = ref([])
const processedDocs = ref([])

const showCaseDialog = ref(false)
const showAgrmDialog = ref(false)
const showDocDialog = ref(false)
const selectedCase = ref(null)
const selectedAgrm = ref(null)
const selectedDoc = ref(null)

// ── KPI Stats ─────────────────────────────────────────────────
const kpiStats = computed(() => [
  {
    label: 'Closed Cases',
    count: closedCases.value.length,
    icon: 'gavel',
    color: 'blue-grey',
    bg: $q.dark.isActive ? 'blue-grey-9' : 'blue-grey-1',
  },
  {
    label: 'Expired Agreements',
    count: expiredAgreements.value.length,
    icon: 'handshake',
    color: 'orange',
    bg: $q.dark.isActive ? 'orange-9' : 'orange-1',
  },
  {
    label: 'Approved Docs',
    count: processedDocs.value.filter((d) => d.status === 'Approved').length,
    icon: 'check_circle',
    color: 'positive',
    bg: $q.dark.isActive ? 'green-9' : 'green-1',
  },
  {
    label: 'Rejected Docs',
    count: processedDocs.value.filter((d) => d.status === 'Rejected').length,
    icon: 'cancel',
    color: 'negative',
    bg: $q.dark.isActive ? 'red-9' : 'red-1',
  },
])

// ── Table Columns ─────────────────────────────────────────────
const caseCols = [
  { name: 'case_no', label: 'Case No', field: 'case_no', align: 'left', sortable: true },
  { name: 'title', label: 'Case Title', field: 'title', align: 'left', sortable: true },
  { name: 'case_type', label: 'Type', field: 'case_type', align: 'center', sortable: true },
  { name: 'plaintiff', label: 'Plaintiff', field: 'plaintiff', align: 'left' },
  { name: 'court', label: 'Court', field: 'court', align: 'left' },
  {
    name: 'financial_exposure',
    label: 'Exposure',
    field: 'financial_exposure',
    align: 'right',
    sortable: true,
  },
  { name: 'closed_at', label: 'Closed Date', field: 'closed_at', align: 'center', sortable: true },
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' },
]

const agrmCols = [
  { name: 'reference_no', label: 'Ref No', field: 'reference_no', align: 'left', sortable: true },
  { name: 'title', label: 'Agreement Title', field: 'title', align: 'left', sortable: true },
  {
    name: 'agreement_type',
    label: 'Type',
    field: 'agreement_type',
    align: 'center',
    sortable: true,
  },
  { name: 'party2', label: 'Counterparty', field: 'party2', align: 'left' },
  { name: 'value', label: 'Value', field: 'value', align: 'right', sortable: true },
  {
    name: 'expiry_date',
    label: 'Expiry Date',
    field: 'expiry_date',
    align: 'center',
    sortable: true,
  },
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' },
]

const docCols = [
  {
    name: 'reference_number',
    label: 'Ref No',
    field: 'reference_number',
    align: 'left',
    sortable: true,
  },
  { name: 'title', label: 'Document Title', field: 'title', align: 'left', sortable: true },
  { name: 'document_type', label: 'Type', field: 'document_type', align: 'center', sortable: true },
  { name: 'parties_involved', label: 'Parties', field: 'parties_involved', align: 'left' },
  {
    name: 'financial_exposure',
    label: 'Exposure',
    field: 'financial_exposure',
    align: 'right',
    sortable: true,
  },
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' },
]

// ── Helpers ───────────────────────────────────────────────────
const fmt = (n) => Number(n || 0).toLocaleString('en-LK')

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function typeColor(type) {
  const map = {
    'Money Recovery': 'primary',
    'Land Case': 'teal',
    Damages: 'deep-orange',
    Appeals: 'purple',
    Criminal: 'negative',
    Other: 'grey-7',
  }
  return map[type] || 'grey-7'
}

function resetFilters() {
  filter.value = ''
  dateFrom.value = ''
  dateTo.value = ''
}

// ── Filtered data (with date range) ──────────────────────────
const filteredCases = computed(() => {
  let data = closedCases.value
  if (dateFrom.value) data = data.filter((r) => r.closed_at >= dateFrom.value)
  if (dateTo.value) data = data.filter((r) => r.closed_at <= dateTo.value + 'T23:59:59')
  return data
})

const filteredAgreements = computed(() => {
  let data = expiredAgreements.value
  if (dateFrom.value) data = data.filter((r) => r.expiry_date >= dateFrom.value)
  if (dateTo.value) data = data.filter((r) => r.expiry_date <= dateTo.value)
  return data
})

const filteredDocs = computed(() => {
  let data = processedDocs.value
  if (dateFrom.value) data = data.filter((r) => r.created_at >= dateFrom.value)
  if (dateTo.value) data = data.filter((r) => r.created_at <= dateTo.value + 'T23:59:59')
  return data
})

// ── Dialog Handlers ──────────────────────────────────────────
function viewCase(row) {
  selectedCase.value = row
  showCaseDialog.value = true
}

function viewAgreement(row) {
  selectedAgrm.value = row
  showAgrmDialog.value = true
}

function viewDoc(row) {
  selectedDoc.value = row
  showDocDialog.value = true
}

async function reopenCase(row) {
  try {
    const { error } = await supabase
      .from('legal_cases')
      .update({ status: 'Active', closed_at: null, closure_remarks: null })
      .eq('id', row.id)

    if (error) throw error

    closedCases.value = closedCases.value.filter((c) => c.id !== row.id)

    $q.notify({
      type: 'positive',
      message: `Case #${row.case_no} has been reopened successfully`,
      icon: 'lock_open',
    })
  } catch (err) {
    console.error('Reopen error:', err)
    $q.notify({ type: 'negative', message: 'Failed to reopen case' })
  }
}

function handleReopen(caseItem) {
  reopenCase(caseItem)
  showCaseDialog.value = false
}

// ── Data Fetching ────────────────────────────────────────────
async function fetchClosedCases() {
  const { data, error } = await supabase
    .from('legal_cases')
    .select('*')
    .eq('status', 'Closed')
    .order('closed_at', { ascending: false })

  if (error) {
    console.error('Error fetching closed cases:', error)
    return
  }
  closedCases.value = data || []
}

async function fetchExpiredAgreements() {
  const { data, error } = await supabase
    .from('agreements')
    .select('*')
    .in('status', ['Expired', 'Terminated'])
    .order('expiry_date', { ascending: false })

  if (error) {
    console.error('Error fetching expired agreements:', error)
    return
  }
  expiredAgreements.value = data || []
}

async function fetchProcessedDocs() {
  const { data, error } = await supabase
    .from('initial_documents')
    .select('*')
    .in('status', ['Approved', 'Rejected'])
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching processed docs:', error)
    return
  }
  processedDocs.value = data || []
}

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([fetchClosedCases(), fetchExpiredAgreements(), fetchProcessedDocs()])
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.border-bottom {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
:deep(.q-dark) .border-bottom {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.slt-kpi-card {
  transition: all 0.3s ease;
}
.slt-kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
