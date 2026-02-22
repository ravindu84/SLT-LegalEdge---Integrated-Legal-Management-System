<template>
  <q-page class="q-pa-md slt-page-bg">
    <!-- ─── Page Header ──────────────────────────────────────────── -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-weight-bold text-primary">
          <q-icon name="gavel" size="28px" class="q-mr-sm" />
          {{ $t('cases.title') }}
        </div>
        <div class="text-caption text-grey-6">
          {{ $t('cases.subtitle') }}
        </div>
      </div>
      <div class="col-auto row q-gutter-sm">
        <q-btn outline color="primary" icon="file_download" label="Export" size="sm" no-caps />
      </div>
    </div>

    <!-- ─── KPI Strip ────────────────────────────────────────────── -->
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

    <!-- ─── Toolbar ──────────────────────────────────────────────── -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="row q-col-gutter-sm items-center q-py-sm">
        <div class="col-12 col-sm-4">
          <q-input v-model="filter" dense outlined clearable placeholder="Search cases…">
            <template #prepend><q-icon name="search" /></template>
          </q-input>
        </div>
        <div class="col-6 col-sm-3">
          <q-select
            v-model="filterStatus"
            :options="['All', 'Active', 'Pending Hearing', 'Under Review', 'Closed']"
            dense
            outlined
            label="Status"
            emit-value
            map-options
          />
        </div>
        <div class="col-6 col-sm-3">
          <q-select
            v-model="filterType"
            :options="[
              'All',
              'Money Recovery',
              'Land Case',
              'Damages',
              'Appeals',
              'Criminal',
              'Other',
            ]"
            dense
            outlined
            label="Case Type"
            emit-value
            map-options
          />
        </div>
        <div class="col-auto">
          <q-btn flat icon="restart_alt" color="grey-7" dense @click="resetFilters">
            <q-tooltip>Reset</q-tooltip>
          </q-btn>
        </div>
      </q-card-section>
    </q-card>

    <!-- ─── Main Table ───────────────────────────────────────────── -->
    <q-card flat bordered>
      <q-table
        :rows="filteredCases"
        :columns="columns"
        row-key="id"
        :filter="filter"
        :loading="loading"
        :pagination="{ rowsPerPage: 8 }"
        flat
        class="slt-table"
        no-data-label="No cases found"
      >
        <!-- Case Number -->
        <template #body-cell-caseNo="props">
          <q-td :props="props">
            <span class="text-weight-bold text-primary">#{{ props.value }}</span>
          </q-td>
        </template>

        <!-- Type chip -->
        <template #body-cell-caseType="props">
          <q-td :props="props" class="text-center">
            <q-chip
              dense
              size="sm"
              :icon="typeIcon(props.value)"
              :color="typeColor(props.value)"
              text-color="white"
            >
              {{ props.value }}
            </q-chip>
          </q-td>
        </template>

        <!-- Status badge -->
        <template #body-cell-status="props">
          <q-td :props="props" class="text-center">
            <q-badge
              rounded
              :color="statusColor(props.value)"
              :label="props.value"
              class="text-weight-medium"
            />
          </q-td>
        </template>

        <!-- Financial Exposure -->
        <template #body-cell-financialExposure="props">
          <q-td :props="props" class="text-right">
            <span v-if="props.value" class="text-weight-medium">LKR {{ fmt(props.value) }}</span>
            <span v-else class="text-grey-4">—</span>
          </q-td>
        </template>

        <!-- Next Hearing -->
        <template #body-cell-nextHearing="props">
          <q-td :props="props" class="text-center">
            <span v-if="props.value">
              <q-icon
                name="event"
                size="14px"
                class="q-mr-xs"
                :color="isUrgent(props.value) ? 'negative' : 'grey-6'"
              />
              <span :class="isUrgent(props.value) ? 'text-negative text-weight-bold' : ''">
                {{ props.value }}
              </span>
            </span>
            <span v-else class="text-grey-4">—</span>
          </q-td>
        </template>

        <!-- Actions -->
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
                @click="openDetails(props.row)"
              >
                <q-tooltip>View Details</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                icon="edit"
                color="grey-7"
                size="sm"
                :disable="props.row.status === 'Closed'"
                @click="openDetails(props.row, true)"
              >
                <q-tooltip>Edit Case</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                icon="add_circle"
                color="teal"
                size="sm"
                :disable="props.row.status === 'Closed'"
                @click="quickAddHearing(props.row)"
              >
                <q-tooltip>Add Hearing</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                :icon="props.row.status === 'Closed' ? 'lock_open' : 'lock'"
                :color="props.row.status === 'Closed' ? 'positive' : 'grey-7'"
                size="sm"
                @click="toggleClose(props.row)"
              >
                <q-tooltip>{{
                  props.row.status === 'Closed' ? 'Reopen Case' : 'Close Case'
                }}</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>

        <template #no-data="{ message }">
          <div class="full-width column flex-center text-grey-5 q-py-xl">
            <q-icon name="gavel" size="56px" />
            <div class="q-mt-sm">{{ message }}</div>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- ═══════════════════════════════════════════════════════════
         CASE DETAIL DIALOG
    ════════════════════════════════════════════════════════════ -->
    <q-dialog v-model="showDetailDialog" persistent maximized-mobile>
      <q-card v-if="activeCase" class="slt-detail-card">
        <!-- Dialog header -->
        <q-bar class="slt-dialog-bar text-white">
          <q-icon :name="typeIcon(activeCase.caseType)" />
          <div class="text-weight-bold q-ml-sm">
            Case #{{ activeCase.caseNo }} — {{ activeCase.title }}
          </div>
          <q-space />
          <q-badge
            :color="statusColor(activeCase.status)"
            :label="activeCase.status"
            rounded
            class="q-mr-md"
          />
          <q-btn dense flat icon="close" @click="showDetailDialog = false">
            <q-tooltip>Close</q-tooltip>
          </q-btn>
        </q-bar>

        <!-- Tabbed body -->
        <q-tabs
          v-model="detailTab"
          align="left"
          dense
          indicator-color="accent"
          active-color="primary"
          class="slt-tabs bg-blue-1"
        >
          <q-tab name="overview" icon="info" label="Overview" />
          <q-tab
            name="type_fields"
            :icon="typeIcon(activeCase.caseType)"
            :label="
              activeCase.caseType === 'Money Recovery'
                ? 'Financial Details'
                : activeCase.caseType === 'Land Case'
                  ? 'Land Details'
                  : 'Case Details'
            "
          />
          <q-tab name="proceedings" icon="event_note" label="Proceedings" />
          <q-tab name="documents" icon="folder_open" label="Documents" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="detailTab" animated class="slt-panels">
          <!-- ╔══════════════════════════════ OVERVIEW TAB ══════╗ -->
          <q-tab-panel name="overview" class="q-pa-md">
            <div class="row q-col-gutter-md">
              <!-- Left column -->
              <div class="col-12 col-md-6">
                <div class="slt-field-group">
                  <div class="slt-section-label">Case Information</div>

                  <InfoRow label="Case Number" :value="activeCase.caseNo" icon="tag" />
                  <InfoRow label="Case Title" :value="activeCase.title" icon="title" />
                  <InfoRow label="Case Type" :value="activeCase.caseType" icon="category" />
                  <InfoRow label="Nature of Case" :value="activeCase.natureOfCase" icon="gavel" />
                  <InfoRow
                    label="Date of Occurrence"
                    :value="activeCase.dateOfOccurrence"
                    icon="event"
                  />
                  <InfoRow label="Filed Date" :value="activeCase.filedDate" icon="task_alt" />
                  <InfoRow label="Status" :value="activeCase.status" icon="info" />
                </div>
              </div>

              <!-- Right column -->
              <div class="col-12 col-md-6">
                <div class="slt-field-group">
                  <div class="slt-section-label">Parties & Assignment</div>
                  <InfoRow label="Plaintiff" :value="activeCase.plaintiff" icon="person" />
                  <InfoRow label="Defendant" :value="activeCase.defendant" icon="person_off" />
                  <InfoRow label="Court" :value="activeCase.court" icon="account_balance" />
                  <InfoRow
                    label="Assigned Lawyer"
                    :value="activeCase.assignedLawyer"
                    icon="badge"
                  />
                  <InfoRow
                    label="Financial Exposure"
                    :value="
                      activeCase.financialExposure
                        ? `LKR ${fmt(activeCase.financialExposure)}`
                        : '—'
                    "
                    icon="payments"
                  />
                  <InfoRow
                    label="Next Hearing"
                    :value="activeCase.nextHearing || '—'"
                    icon="calendar_today"
                  />
                </div>

                <!-- Summary of facts -->
                <div class="slt-field-group q-mt-md">
                  <div class="slt-section-label">Summary of Facts</div>
                  <p class="text-body2 text-grey-8 q-mb-none q-pt-xs">
                    {{ activeCase.summaryOfFacts }}
                  </p>
                </div>
              </div>
            </div>
          </q-tab-panel>

          <!-- ╔══════════════════════ TYPE-SPECIFIC FIELDS TAB ══╗ -->
          <q-tab-panel name="type_fields" class="q-pa-md">
            <!-- ── MONEY RECOVERY ─────────────────────────────── -->
            <template v-if="activeCase.caseType === 'Money Recovery'">
              <div class="slt-section-label q-mb-md">Financial Recovery Details</div>

              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-4">
                  <q-input
                    v-model.number="activeCase.poly.claimAmount"
                    outlined
                    label="Claim Amount (LKR)"
                    type="number"
                    min="0"
                    :disable="!editMode"
                    :hint="editMode ? 'Total amount being claimed' : ''"
                    @update:model-value="recalcBalance"
                  >
                    <template #prepend><span class="text-caption text-grey-6">LKR</span></template>
                  </q-input>
                </div>
                <div class="col-12 col-sm-4">
                  <q-input
                    v-model.number="activeCase.poly.paidAmount"
                    outlined
                    label="Amount Paid (LKR)"
                    type="number"
                    min="0"
                    :disable="!editMode"
                    :hint="editMode ? 'Payments received so far' : ''"
                    @update:model-value="recalcBalance"
                  >
                    <template #prepend><span class="text-caption text-grey-6">LKR</span></template>
                  </q-input>
                </div>
                <div class="col-12 col-sm-4">
                  <q-input
                    :model-value="`LKR ${fmt(balance)}`"
                    outlined
                    label="Outstanding Balance"
                    readonly
                    :class="balance > 0 ? 'slt-balance-positive' : 'slt-balance-clear'"
                    hint="Auto-calculated (Claim − Paid)"
                  >
                    <template #prepend>
                      <q-icon
                        :name="balance > 0 ? 'arrow_upward' : 'check_circle'"
                        :color="balance > 0 ? 'negative' : 'positive'"
                      />
                    </template>
                  </q-input>
                </div>
              </div>

              <!-- Recovery progress bar -->
              <div class="q-mt-lg q-px-sm">
                <div class="row items-center q-mb-xs">
                  <span class="text-caption text-grey-6">Recovery Progress</span>
                  <q-space />
                  <span
                    class="text-caption text-weight-bold"
                    :class="recoveryPct >= 100 ? 'text-positive' : 'text-primary'"
                  >
                    {{ recoveryPct }}%
                  </span>
                </div>
                <q-linear-progress
                  :value="recoveryPct / 100"
                  size="14px"
                  rounded
                  :color="recoveryPct >= 100 ? 'positive' : recoveryPct > 50 ? 'info' : 'warning'"
                  track-color="grey-3"
                >
                  <div class="absolute-full flex flex-center">
                    <q-badge
                      color="transparent"
                      text-color="dark"
                      :label="`LKR ${fmt(activeCase.poly.paidAmount || 0)} recovered of LKR ${fmt(activeCase.poly.claimAmount || 0)}`"
                    />
                  </div>
                </q-linear-progress>
              </div>

              <!-- Payment schedule placeholder -->
              <div class="slt-section-label q-mt-xl q-mb-sm">Payment Schedule</div>
              <q-table
                :rows="activeCase.poly.payments || []"
                :columns="paymentCols"
                flat
                bordered
                dense
                row-key="id"
                no-data-label="No payment records added"
                class="slt-inner-table"
              >
                <template #top-right v-if="editMode">
                  <q-btn
                    flat
                    dense
                    icon="add"
                    color="primary"
                    label="Add Payment"
                    size="sm"
                    no-caps
                    @click="addPaymentRow"
                  />
                </template>
                <template #body-cell-amount="props">
                  <q-td :props="props" class="text-right text-weight-medium">
                    LKR {{ fmt(props.value) }}
                  </q-td>
                </template>
              </q-table>
            </template>

            <!-- ── LAND CASE ───────────────────────────────────── -->
            <template v-else-if="activeCase.caseType === 'Land Case'">
              <div class="slt-section-label q-mb-md">Land Title & Survey Details</div>

              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-4">
                  <q-input
                    v-model="activeCase.poly.deedNumber"
                    outlined
                    label="Deed Number *"
                    :disable="!editMode"
                  />
                </div>
                <div class="col-12 col-sm-4">
                  <q-input
                    v-model="activeCase.poly.planNumber"
                    outlined
                    label="Survey Plan Number *"
                    :disable="!editMode"
                  />
                </div>
                <div class="col-12 col-sm-4">
                  <q-input
                    v-model="activeCase.poly.landName"
                    outlined
                    label="Land Name / Description *"
                    :disable="!editMode"
                  />
                </div>
                <div class="col-12 col-sm-4">
                  <q-input
                    v-model="activeCase.poly.extent"
                    outlined
                    label="Extent (Perches)"
                    :disable="!editMode"
                  />
                </div>
                <div class="col-12 col-sm-4">
                  <q-input
                    v-model="activeCase.poly.district"
                    outlined
                    label="District"
                    :disable="!editMode"
                  />
                </div>
                <div class="col-12 col-sm-4">
                  <q-input
                    v-model="activeCase.poly.gramaNiladari"
                    outlined
                    label="Grama Niladari Division"
                    :disable="!editMode"
                  />
                </div>
                <div class="col-12">
                  <q-input
                    v-model="activeCase.poly.encumbrances"
                    outlined
                    label="Encumbrances / Caveats"
                    type="textarea"
                    rows="2"
                    :disable="!editMode"
                  />
                </div>
              </div>

              <!-- Land boundary map placeholder -->
              <div class="slt-map-placeholder q-mt-md row items-center justify-center">
                <div class="column items-center text-grey-5">
                  <q-icon name="map" size="40px" />
                  <div class="text-caption q-mt-xs">Land boundary map preview (integrate GIS)</div>
                </div>
              </div>
            </template>

            <!-- ── OTHER TYPES ─────────────────────────────────── -->
            <template v-else>
              <div class="slt-section-label q-mb-md">Case-Specific Details</div>
              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <q-input
                    v-model="activeCase.poly.additionalDetails"
                    outlined
                    label="Additional Case Details"
                    type="textarea"
                    rows="5"
                    :disable="!editMode"
                    hint="Provide any type-specific information relevant to this case"
                  />
                </div>
              </div>
            </template>
          </q-tab-panel>

          <!-- ╔════════════════════════════ PROCEEDINGS TAB ═══════╗ -->
          <q-tab-panel name="proceedings" class="q-pa-md">
            <div class="row items-center q-mb-md">
              <div class="slt-section-label col q-mb-none">Case Proceedings &amp; Hearing Log</div>
              <q-btn
                unelevated
                color="primary"
                icon="add"
                label="Add Hearing"
                size="sm"
                no-caps
                @click="showHearingForm = !showHearingForm"
              />
            </div>

            <!-- Add Hearing inline form -->
            <q-slide-transition>
              <q-card v-if="showHearingForm" flat bordered class="q-mb-md bg-blue-1">
                <q-card-section>
                  <div class="text-subtitle2 text-primary q-mb-sm">New Hearing Entry</div>
                  <div class="row q-col-gutter-sm">
                    <div class="col-12 col-sm-3">
                      <q-input
                        v-model="newHearing.date"
                        outlined
                        dense
                        label="Hearing Date *"
                        type="date"
                        stack-label
                      />
                    </div>
                    <div class="col-12 col-sm-3">
                      <q-select
                        v-model="newHearing.outcome"
                        outlined
                        dense
                        label="Outcome"
                        :options="[
                          'Adjourned',
                          'Settled',
                          'Judgment',
                          'Dismissed',
                          'Evidence Submitted',
                          'Other',
                        ]"
                        emit-value
                        map-options
                      />
                    </div>
                    <div class="col-12 col-sm-4">
                      <q-input
                        v-model="newHearing.nextDate"
                        outlined
                        dense
                        label="Next Hearing Date"
                        type="date"
                        stack-label
                      />
                    </div>
                    <div class="col-12">
                      <q-input
                        v-model="newHearing.notes"
                        outlined
                        dense
                        label="Notes / Remarks *"
                        type="textarea"
                        rows="2"
                      />
                    </div>
                  </div>
                </q-card-section>
                <q-card-actions align="right" class="q-pa-md q-pt-none">
                  <q-btn
                    flat
                    no-caps
                    label="Cancel"
                    color="grey-7"
                    @click="showHearingForm = false"
                  />
                  <q-btn
                    unelevated
                    no-caps
                    color="primary"
                    icon="save"
                    label="Save Hearing"
                    @click="saveHearing"
                  />
                </q-card-actions>
              </q-card>
            </q-slide-transition>

            <!-- Timeline -->
            <q-timeline color="primary" layout="comfortable" v-if="activeCase.proceedings.length">
              <q-timeline-entry
                v-for="(proc, idx) in [...activeCase.proceedings].reverse()"
                :key="idx"
                :color="outcomeColor(proc.outcome)"
                :icon="outcomeIcon(proc.outcome)"
                :subtitle="proc.date"
              >
                <template #title>
                  <span class="text-weight-bold">{{ proc.outcome }}</span>
                  <q-badge
                    v-if="proc.nextDate"
                    color="blue-2"
                    text-color="primary"
                    :label="`Next: ${proc.nextDate}`"
                    class="q-ml-sm slt-next-date-badge"
                  />
                </template>
                <div class="text-body2 text-grey-8">{{ proc.notes }}</div>
                <div class="text-caption text-grey-5 q-mt-xs">
                  Recorded by {{ proc.recordedBy }} · {{ proc.recordedAt }}
                </div>
              </q-timeline-entry>
            </q-timeline>

            <!-- Empty state -->
            <div v-else class="column flex-center text-grey-5 q-py-xl">
              <q-icon name="event_busy" size="48px" />
              <div class="q-mt-sm text-body2">
                No hearing records yet. Add the first proceeding above.
              </div>
            </div>
          </q-tab-panel>

          <!-- ╔═══════════════════════════ DOCUMENTS TAB ══════════╗ -->
          <q-tab-panel name="documents" class="q-pa-md">
            <div class="row items-center q-mb-md">
              <div class="slt-section-label col q-mb-none">Attached Documents</div>
              <q-btn unelevated color="primary" icon="upload" label="Upload" size="sm" no-caps />
            </div>

            <q-list bordered separator class="rounded-borders">
              <q-item v-for="doc in activeCase.attachedDocs" :key="doc.name" clickable v-ripple>
                <q-item-section avatar>
                  <q-icon :name="docIcon(doc.type)" :color="docColor(doc.type)" size="24px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ doc.name }}</q-item-label>
                  <q-item-label caption
                    >{{ doc.type.toUpperCase() }} · {{ doc.size }} · {{ doc.date }}</q-item-label
                  >
                </q-item-section>
                <q-item-section side>
                  <div class="row q-gutter-xs">
                    <q-btn flat round dense icon="visibility" color="primary" size="sm">
                      <q-tooltip>Preview</q-tooltip>
                    </q-btn>
                    <q-btn flat round dense icon="download" color="grey-7" size="sm">
                      <q-tooltip>Download</q-tooltip>
                    </q-btn>
                  </div>
                </q-item-section>
              </q-item>
              <q-item v-if="!activeCase.attachedDocs.length">
                <q-item-section class="text-grey-5 text-center q-py-lg"
                  >No documents uploaded yet.</q-item-section
                >
              </q-item>
            </q-list>
          </q-tab-panel>
        </q-tab-panels>

        <q-separator />

        <!-- Dialog footer actions -->
        <q-card-actions align="right" class="q-pa-md">
          <div class="row q-gutter-sm">
            <q-btn flat no-caps label="Close" color="grey-7" @click="showDetailDialog = false" />
            <q-btn
              v-if="!editMode"
              unelevated
              no-caps
              color="secondary"
              icon="edit"
              label="Edit Case"
              @click="editMode = true"
            />
            <q-btn
              v-if="editMode"
              flat
              no-caps
              color="grey-7"
              icon="close"
              label="Cancel Edit"
              @click="cancelEdit"
            />
            <q-btn
              v-if="editMode"
              unelevated
              no-caps
              color="primary"
              icon="save"
              label="Save Changes"
              :loading="saving"
              @click="saveCase"
            />
          </div>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ═══════════════════════════════════════════════════════════
         QUICK ADD HEARING DIALOG (from table row button)
    ════════════════════════════════════════════════════════════ -->
    <q-dialog v-model="showQuickHearingDialog">
      <q-card style="width: 480px; max-width: 95vw">
        <q-bar class="slt-dialog-bar text-white">
          <q-icon name="event_note" />
          <div class="text-weight-bold q-ml-sm">Add Hearing — #{{ quickHearingCase?.caseNo }}</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>
        <q-card-section>
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6">
              <q-input
                v-model="newHearing.date"
                outlined
                dense
                label="Hearing Date *"
                type="date"
                stack-label
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-select
                v-model="newHearing.outcome"
                outlined
                dense
                label="Outcome *"
                :options="[
                  'Adjourned',
                  'Settled',
                  'Judgment',
                  'Dismissed',
                  'Evidence Submitted',
                  'Other',
                ]"
                emit-value
                map-options
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                v-model="newHearing.nextDate"
                outlined
                dense
                label="Next Hearing Date"
                type="date"
                stack-label
              />
            </div>
            <div class="col-12">
              <q-input
                v-model="newHearing.notes"
                outlined
                dense
                label="Notes *"
                type="textarea"
                rows="3"
              />
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat no-caps label="Cancel" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            no-caps
            color="primary"
            icon="save"
            label="Save Hearing"
            @click="saveQuickHearing"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  INLINE HELPER COMPONENT
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const InfoRow = {
  props: { label: String, value: String, icon: String },
  template: `
    <div class="row items-start q-py-xs slt-info-row">
      <div class="col-5 row items-center text-caption text-grey-5">
        <q-icon :name="icon" size="14px" class="q-mr-xs" />{{ label }}
      </div>
      <div class="col-7 text-body2 text-weight-medium text-grey-9">{{ value || '—' }}</div>
    </div>
  `,
}

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  MOCK DATA
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const cases = ref([
  {
    id: 1,
    caseNo: 'LC-2026-001',
    title: 'Recovery of Outstanding Payments – Netwin Pvt Ltd',
    caseType: 'Money Recovery',
    plaintiff: 'SLT Mobitel PLC',
    defendant: 'Netwin Pvt Ltd',
    natureOfCase: 'Unpaid dues for leased circuit charges spanning 18 months.',
    dateOfOccurrence: '2025-06-01',
    filedDate: '2026-01-20',
    financialExposure: 4500000,
    court: 'Colombo District Court',
    assignedLawyer: 'K. Fernando, Attorney-at-Law',
    status: 'Active',
    nextHearing: '2026-03-10',
    summaryOfFacts:
      'SLT Mobitel initiated recovery proceedings against Netwin Pvt Ltd for outstanding leased-circuit charges amounting to LKR 4.5M over 18 months of non-payment.',
    poly: {
      claimAmount: 4500000,
      paidAmount: 1200000,
      payments: [
        { id: 1, date: '2026-01-05', amount: 700000, method: 'Bank Transfer', ref: 'BTR-00112' },
        { id: 2, date: '2026-02-01', amount: 500000, method: 'Cheque', ref: 'CHQ-44521' },
      ],
    },
    proceedings: [
      {
        date: '2026-01-25',
        outcome: 'Evidence Submitted',
        nextDate: '2026-03-10',
        notes:
          'SLT submitted invoices, payment history, and lease agreements as documentary evidence.',
        recordedBy: 'K. Fernando',
        recordedAt: '2026-01-25',
      },
      {
        date: '2025-12-12',
        outcome: 'Adjourned',
        nextDate: '2026-01-25',
        notes:
          'Case adjourned due to defendant requesting additional time to file statement of defence.',
        recordedBy: 'K. Fernando',
        recordedAt: '2025-12-12',
      },
    ],
    attachedDocs: [
      { name: 'Lease Agreement – Netwin.pdf', type: 'pdf', size: '1.2 MB', date: '2026-01-20' },
      { name: 'Invoice Bundle Jan-Dec 2025.pdf', type: 'pdf', size: '3.4 MB', date: '2026-01-20' },
    ],
  },
  {
    id: 2,
    caseNo: 'LC-2026-002',
    title: 'Land Acquisition Dispute – Kandy Exchange Site',
    caseType: 'Land Case',
    plaintiff: 'SLT Mobitel PLC',
    defendant: 'Kandy Municipal Council',
    natureOfCase: 'Encroachment on SLT registered land parcel during urban development.',
    dateOfOccurrence: '2025-09-12',
    filedDate: '2026-01-28',
    financialExposure: 12000000,
    court: 'Kandy District Court',
    assignedLawyer: 'N. Silva, Attorney-at-Law',
    status: 'Pending Hearing',
    nextHearing: '2026-02-28',
    summaryOfFacts:
      'Portion of the Kandy Exchange land registered under SLT was encroached upon during a KMC urban development project without prior notice or compensation.',
    poly: {
      deedNumber: 'D/KDY/1987/00442',
      planNumber: 'SP/KDY/1987/112',
      landName: 'Kandy Exchange Premises, Peradeniya Road',
      extent: '120 Perches',
      district: 'Kandy',
      gramaNiladari: 'Kandy West 412',
      encumbrances: 'None on record',
    },
    proceedings: [
      {
        date: '2026-02-05',
        outcome: 'Adjourned',
        nextDate: '2026-02-28',
        notes: 'Judge adjourned to allow defendant to produce original survey plans.',
        recordedBy: 'N. Silva',
        recordedAt: '2026-02-05',
      },
    ],
    attachedDocs: [
      { name: 'Deed of Title – KDY-442.pdf', type: 'pdf', size: '890 KB', date: '2026-01-28' },
      { name: 'Survey Plan SP-112.jpg', type: 'jpg', size: '2.1 MB', date: '2026-01-28' },
    ],
  },
  {
    id: 3,
    caseNo: 'LC-2026-003',
    title: 'Damages Claim – Fiber Cut by Gamage Constructions',
    caseType: 'Damages',
    plaintiff: 'SLT Mobitel PLC',
    defendant: 'Gamage Constructions Ltd',
    natureOfCase: 'Negligent excavation causing optical fiber backbone damage.',
    dateOfOccurrence: '2025-11-03',
    filedDate: '2026-02-05',
    financialExposure: 870000,
    court: 'Galle Magistrate Court',
    assignedLawyer: 'P. Jayawardena, Attorney-at-Law',
    status: 'Active',
    nextHearing: '2026-03-22',
    summaryOfFacts:
      'During road widening works on the Southern Expressway service road, Gamage Constructions negligently cut 600m of SLT backbone fiber cable, causing a 14-hour service outage.',
    poly: {
      additionalDetails:
        'Estimated repair cost LKR 870,000. Service loss claim pending engineering assessment.',
    },
    proceedings: [],
    attachedDocs: [
      { name: 'Incident Report – Nov 2025.pdf', type: 'pdf', size: '560 KB', date: '2026-02-05' },
    ],
  },
  {
    id: 4,
    caseNo: 'LC-2026-004',
    title: 'Easement Right Dispute – Colombo 5 Tower Site',
    caseType: 'Land Case',
    plaintiff: 'SLT Mobitel PLC',
    defendant: 'Sulaiman Holdings (Pvt) Ltd',
    natureOfCase: 'Denial of registered easement right for cable routing.',
    dateOfOccurrence: '2025-10-18',
    filedDate: '2026-02-10',
    financialExposure: 3200000,
    court: 'Colombo High Court',
    assignedLawyer: 'A. Bandara, PC',
    status: 'Under Review',
    nextHearing: null,
    summaryOfFacts:
      'Sulaiman Holdings blocked SLT access to a registered easement route for overhead cable infrastructure, forcing a costly rerouting.',
    poly: {
      deedNumber: 'D/COL/2001/00789',
      planNumber: 'SP/COL/2001/334',
      landName: 'Easement Corridor – Nawala Road, Colombo 5',
      extent: '15 Perches (easement strip)',
      district: 'Colombo',
      gramaNiladari: 'Nawala GN Division',
      encumbrances: 'Registered Easement in favour of SLT',
    },
    proceedings: [],
    attachedDocs: [],
  },
  {
    id: 5,
    caseNo: 'LC-2025-012',
    title: 'Appeal Against Labour Tribunal Award – K.A. Perera',
    caseType: 'Appeals',
    plaintiff: 'SLT Mobitel PLC',
    defendant: 'K.A. Perera (Former Employee)',
    natureOfCase: 'Appeal against compensation awarded by Labour Tribunal.',
    dateOfOccurrence: '2025-08-30',
    filedDate: '2025-09-15',
    financialExposure: 2300000,
    court: 'Court of Appeal, Colombo',
    assignedLawyer: 'S. Dissanayake, Attorney-at-Law',
    status: 'Closed',
    nextHearing: null,
    summaryOfFacts:
      'SLT appealed a Labour Tribunal award of LKR 2.3M citing procedural error. Court of Appeal dismissed the appeal. Case closed.',
    poly: {
      additionalDetails:
        'Appeal dismissed. LKR 2.3M compensation paid to claimant as per final order dated 2025-12-10.',
    },
    proceedings: [
      {
        date: '2025-12-10',
        outcome: 'Judgment',
        nextDate: null,
        notes: 'Court of Appeal dismissed SLT appeal. Ordered payment of LKR 2.3M within 30 days.',
        recordedBy: 'S. Dissanayake',
        recordedAt: '2025-12-10',
      },
      {
        date: '2025-11-05',
        outcome: 'Evidence Submitted',
        nextDate: '2025-12-10',
        notes: 'Both parties submitted written submissions to the Court of Appeal.',
        recordedBy: 'S. Dissanayake',
        recordedAt: '2025-11-05',
      },
    ],
    attachedDocs: [
      { name: 'Court of Appeal Order.pdf', type: 'pdf', size: '340 KB', date: '2025-12-10' },
    ],
  },
])

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  KPI STRIP
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const kpiStats = computed(() => [
  {
    label: 'Total Cases',
    count: cases.value.length,
    icon: 'folder',
    color: 'primary',
    bg: 'blue-1',
  },
  {
    label: 'Active',
    count: cases.value.filter((c) => c.status === 'Active').length,
    icon: 'check_circle',
    color: 'positive',
    bg: 'green-1',
  },
  {
    label: 'Pending Hearing',
    count: cases.value.filter((c) => c.status === 'Pending Hearing').length,
    icon: 'schedule',
    color: 'warning',
    bg: 'orange-1',
  },
  {
    label: 'Closed',
    count: cases.value.filter((c) => c.status === 'Closed').length,
    icon: 'lock',
    color: 'grey-7',
    bg: 'grey-2',
  },
])

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  TABLE
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const filter = ref('')
const filterStatus = ref('All')
const filterType = ref('All')
const loading = ref(false)

const columns = [
  { name: 'caseNo', label: 'Case No.', field: 'caseNo', align: 'left', sortable: true },
  { name: 'title', label: 'Case Title', field: 'title', align: 'left', sortable: true },
  { name: 'caseType', label: 'Type', field: 'caseType', align: 'center', sortable: true },
  { name: 'court', label: 'Court', field: 'court', align: 'left', sortable: false },
  {
    name: 'assignedLawyer',
    label: 'Lawyer',
    field: 'assignedLawyer',
    align: 'left',
    sortable: false,
  },
  {
    name: 'financialExposure',
    label: 'Exposure (LKR)',
    field: 'financialExposure',
    align: 'right',
    sortable: true,
  },
  {
    name: 'nextHearing',
    label: 'Next Hearing',
    field: 'nextHearing',
    align: 'center',
    sortable: true,
  },
  { name: 'status', label: 'Status', field: 'status', align: 'center', sortable: true },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center', sortable: false },
]

const filteredCases = computed(() =>
  cases.value.filter((c) => {
    const okStatus = filterStatus.value === 'All' || c.status === filterStatus.value
    const okType = filterType.value === 'All' || c.caseType === filterType.value
    return okStatus && okType
  }),
)

function resetFilters() {
  filter.value = ''
  filterStatus.value = 'All'
  filterType.value = 'All'
}

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  DETAIL DIALOG
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const showDetailDialog = ref(false)
const activeCase = ref(null)
const originalCase = ref(null) // snapshot for cancel
const detailTab = ref('overview')
const editMode = ref(false)
const saving = ref(false)

function openDetails(row, forEdit = false) {
  // Deep-clone to allow cancel
  activeCase.value = JSON.parse(JSON.stringify(row))
  originalCase.value = JSON.parse(JSON.stringify(row))
  detailTab.value = 'overview'
  editMode.value = forEdit
  showDetailDialog.value = true
}

function cancelEdit() {
  activeCase.value = JSON.parse(JSON.stringify(originalCase.value))
  editMode.value = false
}

async function saveCase() {
  saving.value = true
  await new Promise((r) => setTimeout(r, 700))
  const idx = cases.value.findIndex((c) => c.id === activeCase.value.id)
  if (idx !== -1) cases.value[idx] = JSON.parse(JSON.stringify(activeCase.value))
  saving.value = false
  editMode.value = false
  $q.notify({
    type: 'positive',
    message: `Case #${activeCase.value.caseNo} updated successfully.`,
    icon: 'check_circle',
  })
}

function toggleClose(row) {
  const idx = cases.value.findIndex((c) => c.id === row.id)
  if (idx === -1) return
  const isClosing = cases.value[idx].status !== 'Closed'
  cases.value[idx].status = isClosing ? 'Closed' : 'Active'
  $q.notify({
    type: isClosing ? 'info' : 'positive',
    message: `Case #${row.caseNo} ${isClosing ? 'closed' : 'reopened'}.`,
    icon: isClosing ? 'lock' : 'lock_open',
  })
}

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  MONEY RECOVERY HELPERS
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const balance = computed(() => {
  if (!activeCase.value || activeCase.value.caseType !== 'Money Recovery') return 0
  const c = activeCase.value.poly.claimAmount || 0
  const p = activeCase.value.poly.paidAmount || 0
  return Math.max(0, c - p)
})

const recoveryPct = computed(() => {
  if (!activeCase.value) return 0
  const c = activeCase.value.poly.claimAmount || 0
  const p = activeCase.value.poly.paidAmount || 0
  if (c === 0) return 0
  return Math.min(100, Math.round((p / c) * 100))
})

function recalcBalance() {
  /* reactivity handles this */
}

const paymentCols = [
  { name: 'date', label: 'Date', field: 'date', align: 'left' },
  { name: 'amount', label: 'Amount (LKR)', field: 'amount', align: 'right' },
  { name: 'method', label: 'Method', field: 'method', align: 'center' },
  { name: 'ref', label: 'Reference', field: 'ref', align: 'left' },
]

function addPaymentRow() {
  if (!activeCase.value.poly.payments) activeCase.value.poly.payments = []
  activeCase.value.poly.payments.push({ id: Date.now(), date: '', amount: 0, method: '', ref: '' })
}

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  PROCEEDINGS
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const showHearingForm = ref(false)
const emptyHearing = () => ({ date: '', outcome: 'Adjourned', nextDate: '', notes: '' })
const newHearing = ref(emptyHearing())

function saveHearing() {
  if (!newHearing.value.date || !newHearing.value.notes) {
    $q.notify({ type: 'warning', message: 'Hearing date and notes are required.' })
    return
  }
  activeCase.value.proceedings.push({
    ...newHearing.value,
    recordedBy: 'Admin User',
    recordedAt: new Date().toISOString().slice(0, 10),
  })
  // Update nextHearing on the case
  if (newHearing.value.nextDate) {
    activeCase.value.nextHearing = newHearing.value.nextDate
  }
  newHearing.value = emptyHearing()
  showHearingForm.value = false
  $q.notify({ type: 'positive', message: 'Hearing record added.', icon: 'event_note' })
}

// Quick Add Hearing from table row
const showQuickHearingDialog = ref(false)
const quickHearingCase = ref(null)

function quickAddHearing(row) {
  quickHearingCase.value = row
  activeCase.value = JSON.parse(JSON.stringify(row))
  newHearing.value = emptyHearing()
  showQuickHearingDialog.value = true
}

function saveQuickHearing() {
  if (!newHearing.value.date || !newHearing.value.notes) {
    $q.notify({ type: 'warning', message: 'Hearing date and notes are required.' })
    return
  }
  const idx = cases.value.findIndex((c) => c.id === quickHearingCase.value.id)
  if (idx !== -1) {
    cases.value[idx].proceedings.push({
      ...newHearing.value,
      recordedBy: 'Admin User',
      recordedAt: new Date().toISOString().slice(0, 10),
    })
    if (newHearing.value.nextDate) cases.value[idx].nextHearing = newHearing.value.nextDate
  }
  showQuickHearingDialog.value = false
  $q.notify({
    type: 'positive',
    message: `Hearing added to case #${quickHearingCase.value.caseNo}.`,
    icon: 'event_note',
  })
}

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  UTILITY / LOOKUP HELPERS
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
function statusColor(s) {
  return (
    { Active: 'positive', 'Pending Hearing': 'warning', 'Under Review': 'info', Closed: 'grey-6' }[
      s
    ] || 'grey-6'
  )
}

function typeColor(t) {
  return (
    {
      'Money Recovery': 'blue-8',
      'Land Case': 'green-8',
      Damages: 'orange-8',
      Appeals: 'purple-8',
      Criminal: 'red-9',
      Other: 'grey-7',
    }[t] || 'grey-7'
  )
}

function typeIcon(t) {
  return (
    {
      'Money Recovery': 'payments',
      'Land Case': 'landscape',
      Damages: 'report',
      Appeals: 'balance',
      Criminal: 'security',
      Other: 'help_outline',
    }[t] || 'gavel'
  )
}

function outcomeColor(o) {
  return (
    {
      Judgment: 'positive',
      Settled: 'positive',
      Dismissed: 'negative',
      Adjourned: 'warning',
      'Evidence Submitted': 'info',
    }[o] || 'primary'
  )
}

function outcomeIcon(o) {
  return (
    {
      Judgment: 'gavel',
      Settled: 'handshake',
      Dismissed: 'cancel',
      Adjourned: 'schedule',
      'Evidence Submitted': 'upload_file',
    }[o] || 'event_note'
  )
}

function docIcon(type) {
  return (
    { pdf: 'picture_as_pdf', doc: 'description', docx: 'description', jpg: 'image', png: 'image' }[
      type
    ] || 'insert_drive_file'
  )
}

function docColor(type) {
  return (
    { pdf: 'negative', doc: 'info', docx: 'info', jpg: 'positive', png: 'positive' }[type] ||
    'grey-6'
  )
}

function isUrgent(dateStr) {
  if (!dateStr) return false
  return (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24) < 7
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

// KPI Card
.slt-kpi-card {
  border-radius: 8px !important;
  transition: box-shadow 0.15s;
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 63, 135, 0.1) !important;
  }
}

// Dialog bar
.slt-dialog-bar {
  background: linear-gradient(135deg, #002f6c, #003f87);
  min-height: 44px;
  font-size: 0.9rem;
}

// Detail card – large dialog
.slt-detail-card {
  width: 900px;
  max-width: 98vw;
  display: flex;
  flex-direction: column;
  max-height: 96vh;
}

// Tabs
.slt-tabs {
  border-bottom: 2px solid #e0e7ef;
}
.slt-panels {
  flex: 1;
  overflow-y: auto;
}

// Field group + section label
.slt-field-group {
  background: #f8f9fb;
  border: 1px solid #e0e7ef;
  border-radius: 8px;
  padding: 12px 16px;
}
.slt-section-label {
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: #003f87;
  border-bottom: 2px solid #003f87;
  padding-bottom: 4px;
  margin-bottom: 10px;
}
.slt-info-row {
  border-bottom: 1px solid #eef2f8;
  &:last-child {
    border-bottom: none;
  }
}

// Balance input colours
.slt-balance-positive :deep(.q-field__control) {
  background: #fff4f4;
}
.slt-balance-clear :deep(.q-field__control) {
  background: #f4fff6;
}

// Map placeholder
.slt-map-placeholder {
  height: 160px;
  background: #f0f5f0;
  border: 2px dashed #a5c8a8;
  border-radius: 8px;
}

// Inner tables (payments)
.slt-inner-table {
  :deep(thead tr th) {
    background: #eef2f8;
    color: #003f87;
    font-weight: 700;
    font-size: 0.7rem;
    text-transform: uppercase;
  }
}

// Main table
.slt-table {
  :deep(thead tr th) {
    background: #eef2f8;
    color: #003f87;
    font-weight: 700;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }
  :deep(tbody tr:hover) {
    background: #f0f5ff !important;
  }
  :deep(.q-table__top),
  :deep(.q-table__bottom) {
    background: #f8f9fb;
  }
}

// Next-date badge in timeline
.slt-next-date-badge {
  font-size: 0.7rem;
}
</style>
