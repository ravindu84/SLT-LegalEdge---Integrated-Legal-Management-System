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
        <q-btn
          color="primary"
          icon="add"
          label="New Case"
          unelevated
          no-caps
          @click="openCreateDialog"
        />
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
            behavior="menu"
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
            behavior="menu"
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
              
              <!-- Edit: Only Legal Officer or Admin -->
              <q-btn
                v-if="['admin', 'legal_officer'].includes(authStore.profile?.role)"
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

              <!-- Add Hearing: Only Legal Officer or Admin -->
              <q-btn
                v-if="['admin', 'legal_officer'].includes(authStore.profile?.role)"
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

              <!-- Lock/Unlock: Closing (Legal Officer/Admin), Reopening (Supervisor/Manager/Admin) -->
              <q-btn
                v-if="canToggleLock(props.row)"
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
          <!-- Case Type Shift Button -->
          <q-btn
            flat
            dense
            icon="swap_horiz"
            color="amber-4"
            size="sm"
            class="q-mr-sm"
            :disable="activeCase.status === 'Closed'"
            @click="showTypeShiftDialog = true"
          >
            <q-tooltip>Change Case Type (Supervisor Approval Required)</q-tooltip>
          </q-btn>
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
          class="slt-tabs"
        >
          <q-tab name="overview" icon="info" label="Overview" />
          <q-tab
            name="type_fields"
            :icon="typeTabIcon(activeCase.caseType)"
            :label="typeTabLabel(activeCase.caseType)"
          />
          <q-tab name="proceedings" icon="event_note" label="Proceedings" />
          <q-tab name="documents" icon="folder_open" label="Documents" />
          <q-tab name="notes" icon="comment" label="Notes" />
          <q-tab name="audit" icon="history" label="Audit Trail" />
          <q-tab name="versions" icon="auto_awesome_motion" label="Versions" />
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

                  <div class="row items-start q-py-xs slt-info-row border-bottom">
                    <div
                      class="col-5 row items-center text-weight-bold"
                      :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
                    >
                      <q-icon name="tag" size="14px" class="q-mr-xs" />Case Number
                    </div>
                    <div
                      class="col-7 text-body2 text-weight-bold"
                      :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                    >
                      {{ activeCase.caseNo }}
                    </div>
                  </div>
                  <div class="row items-start q-py-xs slt-info-row border-bottom">
                    <div
                      class="col-5 row items-center text-weight-bold"
                      :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
                    >
                      <q-icon name="title" size="14px" class="q-mr-xs" />Case Title
                    </div>
                    <div
                      class="col-7 text-body2 text-weight-bold"
                      :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                    >
                      {{ activeCase.title }}
                    </div>
                  </div>
                  <div class="row items-start q-py-xs slt-info-row border-bottom">
                    <div
                      class="col-5 row items-center text-weight-bold"
                      :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
                    >
                      <q-icon name="category" size="14px" class="q-mr-xs" />Case Type
                    </div>
                    <div
                      class="col-7 text-body2 text-weight-bold"
                      :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                    >
                      {{ activeCase.caseType }}
                    </div>
                  </div>
                  <div class="row items-start q-py-xs slt-info-row border-bottom">
                    <div
                      class="col-5 row items-center text-weight-bold"
                      :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
                    >
                      <q-icon name="gavel" size="14px" class="q-mr-xs" />Nature of Case
                    </div>
                    <div
                      class="col-7 text-body2 text-weight-bold"
                      :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                    >
                      {{ activeCase.natureOfCase }}
                    </div>
                  </div>
                  <div class="row items-start q-py-xs slt-info-row border-bottom">
                    <div
                      class="col-5 row items-center text-weight-bold"
                      :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
                    >
                      <q-icon name="event" size="14px" class="q-mr-xs" />Date of Occurrence
                    </div>
                    <div
                      class="col-7 text-body2 text-weight-bold"
                      :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                    >
                      {{ activeCase.dateOfOccurrence }}
                    </div>
                  </div>
                  <div class="row items-start q-py-xs slt-info-row border-bottom">
                    <div
                      class="col-5 row items-center text-weight-bold"
                      :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
                    >
                      <q-icon name="task_alt" size="14px" class="q-mr-xs" />Filed Date
                    </div>
                    <div
                      class="col-7 text-body2 text-weight-bold"
                      :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                    >
                      {{ activeCase.filedDate }}
                    </div>
                  </div>
                  <div class="row items-start q-py-xs border-bottom">
                    <div
                      class="col-5 row items-center text-weight-bold"
                      :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
                    >
                      <q-icon name="info" size="14px" class="q-mr-xs" />Status
                    </div>
                    <div
                      class="col-7 text-body2 text-weight-bold"
                      :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                    >
                      {{ activeCase.status }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right column -->
              <div class="col-12 col-md-6">
                <div class="slt-field-group">
                  <div class="slt-section-label">Parties & Assignment</div>
                  <div class="row items-start q-py-xs border-bottom">
                    <div
                      class="col-5 row items-center text-weight-bold"
                      :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
                    >
                      <q-icon name="person" size="14px" class="q-mr-xs" />Plaintiff
                    </div>
                    <div
                      class="col-7 text-body2 text-weight-bold"
                      :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                    >
                      {{ activeCase.plaintiff }}
                    </div>
                  </div>
                  <div class="row items-start q-py-xs border-bottom">
                    <div
                      class="col-5 row items-center text-weight-bold"
                      :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
                    >
                      <q-icon name="person_off" size="14px" class="q-mr-xs" />Defendant
                    </div>
                    <div
                      class="col-7 text-body2 text-weight-bold"
                      :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                    >
                      {{ activeCase.defendant }}
                    </div>
                  </div>
                  <div class="row items-start q-py-xs border-bottom">
                    <div
                      class="col-5 row items-center text-weight-bold"
                      :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
                    >
                      <q-icon name="account_balance" size="14px" class="q-mr-xs" />Court
                    </div>
                    <div
                      class="col-7 text-body2 text-weight-bold"
                      :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                    >
                      {{ activeCase.court }}
                    </div>
                  </div>
                  <div class="row items-start q-py-xs border-bottom">
                    <div
                      class="col-5 row items-center text-weight-bold"
                      :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
                    >
                      <q-icon name="badge" size="14px" class="q-mr-xs" />Assigned Lawyer
                    </div>
                    <div
                      class="col-7 text-body2 text-weight-bold"
                      :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                    >
                      {{ activeCase.assignedLawyer }}
                    </div>
                  </div>
                  <div class="row items-start q-py-xs border-bottom">
                    <div
                      class="col-5 row items-center text-weight-bold"
                      :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
                    >
                      <q-icon name="payments" size="14px" class="q-mr-xs" />Financial Exposure
                    </div>
                    <div
                      class="col-7 text-body2 text-weight-bold"
                      :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                    >
                      {{
                        activeCase.financialExposure
                          ? `LKR ${fmt(activeCase.financialExposure)}`
                          : '—'
                      }}
                    </div>
                  </div>
                  <div class="row items-start q-py-xs border-bottom">
                    <div
                      class="col-5 row items-center text-weight-bold"
                      :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
                    >
                      <q-icon name="calendar_today" size="14px" class="q-mr-xs" />Next Hearing
                    </div>
                    <div
                      class="col-7 text-body2 text-weight-bold"
                      :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                    >
                      {{ activeCase.nextHearing || '—' }}
                    </div>
                  </div>
                </div>

                <!-- Summary of facts -->
                <div class="slt-field-group q-mt-md">
                  <div class="slt-section-label">Summary of Facts</div>
                  <p
                    class="text-body2 text-weight-medium q-mb-none q-pt-xs"
                    :class="$q.dark.isActive ? 'text-grey-3' : 'text-grey-8'"
                  >
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

              <!-- Ownership History -->
              <div class="slt-section-label q-mt-xl q-mb-sm">Ownership History</div>
              <q-table
                :rows="activeCase.poly.ownershipHistory || []"
                :columns="ownershipCols"
                flat
                bordered
                dense
                row-key="id"
                no-data-label="No ownership records"
                class="slt-inner-table"
              >
                <template #top-right v-if="editMode">
                  <q-btn
                    flat
                    dense
                    icon="add"
                    color="primary"
                    label="Add Record"
                    size="sm"
                    no-caps
                    @click="addOwnershipRow"
                  />
                </template>
              </q-table>

              <!-- Land boundary map placeholder -->
              <div class="slt-map-placeholder q-mt-md row items-center justify-center">
                <div class="column items-center text-grey-5">
                  <q-icon name="map" size="40px" />
                  <div class="text-caption q-mt-xs">Land boundary map preview (integrate GIS)</div>
                </div>
              </div>
            </template>

            <!-- ── DAMAGES RECOVERY ────────────────────────────── -->
            <template v-else-if="activeCase.caseType === 'Damages'">
              <div class="slt-section-label q-mb-md">Damage Assessment & Recovery</div>

              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-4">
                  <q-input
                    v-model.number="activeCase.poly.assessedDamage"
                    outlined
                    label="Assessed Damage Value (LKR)"
                    type="number"
                    min="0"
                    :disable="!editMode"
                  >
                    <template #prepend><span class="text-caption text-grey-6">LKR</span></template>
                  </q-input>
                </div>
                <div class="col-12 col-sm-4">
                  <q-input
                    v-model.number="activeCase.poly.compensationClaimed"
                    outlined
                    label="Compensation Claimed (LKR)"
                    type="number"
                    min="0"
                    :disable="!editMode"
                  >
                    <template #prepend><span class="text-caption text-grey-6">LKR</span></template>
                  </q-input>
                </div>
                <div class="col-12 col-sm-4">
                  <q-input
                    v-model.number="activeCase.poly.compensationReceived"
                    outlined
                    label="Compensation Received (LKR)"
                    type="number"
                    min="0"
                    :disable="!editMode"
                  >
                    <template #prepend><span class="text-caption text-grey-6">LKR</span></template>
                  </q-input>
                </div>
              </div>

              <!-- Damage Summary -->
              <div class="row q-col-gutter-md q-mt-sm">
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="activeCase.poly.damageType"
                    outlined
                    label="Type of Damage"
                    :disable="!editMode"
                    hint="e.g. Fiber Cut, Property Damage, Equipment Loss"
                  />
                </div>
                <div class="col-12 col-sm-6">
                  <q-select
                    v-model="activeCase.poly.assessmentStatus"
                    outlined
                    label="Assessment Status"
                    :disable="!editMode"
                    :options="[
                      'Pending Assessment',
                      'Assessment Complete',
                      'Under Dispute',
                      'Settled',
                    ]"
                    emit-value
                    map-options
                  />
                </div>
                <div class="col-12">
                  <q-input
                    v-model="activeCase.poly.damageDescription"
                    outlined
                    label="Damage Description"
                    type="textarea"
                    rows="3"
                    :disable="!editMode"
                  />
                </div>
              </div>

              <!-- Settlement Management -->
              <div class="slt-section-label q-mt-xl q-mb-sm">Settlement Details</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-4">
                  <q-select
                    v-model="activeCase.poly.settlementStatus"
                    outlined
                    label="Settlement Status"
                    :disable="!editMode"
                    :options="['Not Initiated', 'Negotiating', 'Settled', 'Failed']"
                    emit-value
                    map-options
                  />
                </div>
                <div class="col-12 col-sm-4">
                  <q-input
                    v-model.number="activeCase.poly.settlementAmount"
                    outlined
                    label="Settlement Amount (LKR)"
                    type="number"
                    :disable="!editMode"
                  >
                    <template #prepend><span class="text-caption text-grey-6">LKR</span></template>
                  </q-input>
                </div>
                <div class="col-12 col-sm-4">
                  <q-input
                    v-model="activeCase.poly.settlementDate"
                    outlined
                    label="Settlement Date"
                    type="date"
                    stack-label
                    :disable="!editMode"
                  />
                </div>
                <div class="col-12">
                  <q-input
                    v-model="activeCase.poly.settlementRemarks"
                    outlined
                    label="Settlement Remarks"
                    type="textarea"
                    rows="2"
                    :disable="!editMode"
                  />
                </div>
              </div>
            </template>

            <!-- ── APPEALS ─────────────────────────────────────── -->
            <template v-else-if="activeCase.caseType === 'Appeals'">
              <div class="slt-section-label q-mb-md">Appeal Details</div>

              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-6">
                  <q-select
                    v-model="activeCase.poly.originalCaseNo"
                    outlined
                    label="Original Case Reference *"
                    :disable="!editMode"
                    :options="originalCaseOptions"
                    emit-value
                    map-options
                    hint="Link to the original case record"
                  />
                </div>
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="activeCase.poly.originalCourt"
                    outlined
                    label="Original Court"
                    :disable="!editMode"
                  />
                </div>
                <div class="col-12 col-sm-4">
                  <q-input
                    v-model="activeCase.poly.appealFilingDate"
                    outlined
                    label="Appeal Filing Date *"
                    type="date"
                    stack-label
                    :disable="!editMode"
                  />
                </div>
                <div class="col-12 col-sm-4">
                  <q-input
                    v-model="activeCase.poly.appealDeadline"
                    outlined
                    label="Appeal Deadline"
                    type="date"
                    stack-label
                    :disable="!editMode"
                    :class="{ 'slt-deadline-urgent': isUrgent(activeCase.poly.appealDeadline) }"
                  />
                </div>
                <div class="col-12 col-sm-4">
                  <q-input
                    v-model="activeCase.poly.hearingDeadline"
                    outlined
                    label="Hearing Deadline"
                    type="date"
                    stack-label
                    :disable="!editMode"
                  />
                </div>
              </div>

              <!-- Appeal Outcome -->
              <div class="slt-section-label q-mt-xl q-mb-sm">Appeal Outcome</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-4">
                  <q-select
                    v-model="activeCase.poly.appealOutcome"
                    outlined
                    label="Outcome"
                    :disable="!editMode"
                    :options="['Pending', 'Allowed', 'Dismissed', 'Partially Allowed', 'Remanded']"
                    emit-value
                    map-options
                  />
                </div>
                <div class="col-12 col-sm-4">
                  <q-input
                    v-model="activeCase.poly.judgmentDate"
                    outlined
                    label="Judgment Date"
                    type="date"
                    stack-label
                    :disable="!editMode"
                  />
                </div>
                <div class="col-12 col-sm-4">
                  <q-input
                    v-model="activeCase.poly.judgmentRef"
                    outlined
                    label="Judgment Reference No."
                    :disable="!editMode"
                  />
                </div>
                <div class="col-12">
                  <q-input
                    v-model="activeCase.poly.judgmentSummary"
                    outlined
                    label="Judgment Summary"
                    type="textarea"
                    rows="3"
                    :disable="!editMode"
                  />
                </div>
              </div>
            </template>

            <!-- ── CRIMINAL CASES ──────────────────────────────── -->
            <template v-else-if="activeCase.caseType === 'Criminal'">
              <div class="slt-section-label q-mb-md">Criminal Case — Charges & Offences</div>

              <!-- Charges Table -->
              <q-table
                :rows="activeCase.poly.charges || []"
                :columns="chargeCols"
                flat
                bordered
                dense
                row-key="id"
                no-data-label="No charges recorded"
                class="slt-inner-table"
              >
                <template #top-right v-if="editMode">
                  <q-btn
                    flat
                    dense
                    icon="add"
                    color="primary"
                    label="Add Charge"
                    size="sm"
                    no-caps
                    @click="addChargeRow"
                  />
                </template>
              </q-table>

              <div class="row q-col-gutter-md q-mt-md">
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="activeCase.poly.investigatingOfficer"
                    outlined
                    label="Investigating Officer"
                    :disable="!editMode"
                  />
                </div>
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="activeCase.poly.prosecutionAuthority"
                    outlined
                    label="Prosecution Authority"
                    :disable="!editMode"
                  />
                </div>
                <div class="col-12 col-sm-6">
                  <q-select
                    v-model="activeCase.poly.bail"
                    outlined
                    label="Bail Status"
                    :disable="!editMode"
                    :options="['Not Applicable', 'Bail Granted', 'Bail Denied', 'Bail Revoked']"
                    emit-value
                    map-options
                  />
                </div>
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="activeCase.poly.nextCourtDate"
                    outlined
                    label="Next Court Date"
                    type="date"
                    stack-label
                    :disable="!editMode"
                  />
                </div>
              </div>

              <!-- Court Hearing History -->
              <div class="slt-section-label q-mt-xl q-mb-sm">Court Hearing History</div>
              <q-table
                :rows="activeCase.poly.hearingHistory || []"
                :columns="hearingHistoryCols"
                flat
                bordered
                dense
                row-key="id"
                no-data-label="No hearing history"
                class="slt-inner-table"
              >
                <template #top-right v-if="editMode">
                  <q-btn
                    flat
                    dense
                    icon="add"
                    color="primary"
                    label="Add Entry"
                    size="sm"
                    no-caps
                    @click="addHearingHistoryRow"
                  />
                </template>
              </q-table>
            </template>

            <!-- ── INQUIRIES / DISCIPLINARY ─────────────────────── -->
            <template v-else-if="activeCase.caseType === 'Inquiry'">
              <div class="slt-section-label q-mb-md">Inquiry / Disciplinary Investigation</div>

              <!-- Inquiry Panel -->
              <div class="slt-section-label q-mb-sm" style="border-bottom-color: #8b5cf6">
                Inquiry Panel Members
              </div>
              <q-table
                :rows="activeCase.poly.panelMembers || []"
                :columns="panelCols"
                flat
                bordered
                dense
                row-key="id"
                no-data-label="No panel members assigned"
                class="slt-inner-table"
              >
                <template #top-right v-if="editMode">
                  <q-btn
                    flat
                    dense
                    icon="add"
                    color="primary"
                    label="Add Member"
                    size="sm"
                    no-caps
                    @click="addPanelMember"
                  />
                </template>
              </q-table>

              <div class="row q-col-gutter-md q-mt-md">
                <div class="col-12 col-sm-6">
                  <q-select
                    v-model="activeCase.poly.inquiryType"
                    outlined
                    label="Inquiry Type"
                    :disable="!editMode"
                    :options="[
                      'Disciplinary',
                      'Preliminary',
                      'Formal Investigation',
                      'Special Inquiry',
                    ]"
                    emit-value
                    map-options
                  />
                </div>
                <div class="col-12 col-sm-6">
                  <q-select
                    v-model="activeCase.poly.inquiryStatus"
                    outlined
                    label="Inquiry Status"
                    :disable="!editMode"
                    :options="[
                      'Initiated',
                      'Investigation On',
                      'Findings Submitted',
                      'Decision Pending',
                      'Concluded',
                    ]"
                    emit-value
                    map-options
                  />
                </div>
              </div>

              <!-- Findings & Recommendations -->
              <div class="slt-section-label q-mt-xl q-mb-sm">Findings & Recommendations</div>
              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <q-input
                    v-model="activeCase.poly.findings"
                    outlined
                    label="Investigation Findings"
                    type="textarea"
                    rows="4"
                    :disable="!editMode"
                  />
                </div>
                <div class="col-12">
                  <q-input
                    v-model="activeCase.poly.recommendations"
                    outlined
                    label="Panel Recommendations"
                    type="textarea"
                    rows="3"
                    :disable="!editMode"
                  />
                </div>
              </div>

              <!-- Decision Tracking -->
              <div class="slt-section-label q-mt-xl q-mb-sm">Management Decision</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-4">
                  <q-select
                    v-model="activeCase.poly.decisionOutcome"
                    outlined
                    label="Decision"
                    :disable="!editMode"
                    :options="[
                      'Pending',
                      'Warning Issued',
                      'Suspension',
                      'Termination',
                      'Exonerated',
                      'Further Investigation',
                    ]"
                    emit-value
                    map-options
                  />
                </div>
                <div class="col-12 col-sm-4">
                  <q-input
                    v-model="activeCase.poly.decisionDate"
                    outlined
                    label="Decision Date"
                    type="date"
                    stack-label
                    :disable="!editMode"
                  />
                </div>
                <div class="col-12 col-sm-4">
                  <q-input
                    v-model="activeCase.poly.decisionAuthority"
                    outlined
                    label="Decision Authority"
                    :disable="!editMode"
                  />
                </div>
                <div class="col-12">
                  <q-input
                    v-model="activeCase.poly.decisionRemarks"
                    outlined
                    label="Remarks"
                    type="textarea"
                    rows="2"
                    :disable="!editMode"
                  />
                </div>
              </div>
            </template>

            <!-- ── OTHER TYPES (catch-all) ─────────────────────── -->
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
              <q-card v-if="showHearingForm" flat bordered class="q-mb-md">
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
              <q-file
                v-model="fileToUpload"
                style="display: none"
                ref="fileInputRef"
                @update:model-value="handleFileUpload"
                accept=".pdf,.doc,.docx,.jpg,.png"
              />
              <q-btn
                unelevated
                color="primary"
                icon="upload"
                label="Upload"
                size="sm"
                no-caps
                @click="$refs.fileInputRef.pickFiles()"
              />
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
                    <q-btn
                      flat
                      round
                      dense
                      icon="visibility"
                      color="primary"
                      size="sm"
                      @click="viewDocument(doc)"
                      ><q-tooltip>Preview</q-tooltip></q-btn
                    >
                    <q-btn
                      flat
                      round
                      dense
                      icon="download"
                      color="grey-7"
                      size="sm"
                      @click="downloadDocument(doc)"
                      ><q-tooltip>Download</q-tooltip></q-btn
                    >
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

          <!-- ╔═══════════════════════════ NOTES & COMMENTS TAB ══╗ -->
          <q-tab-panel name="notes" class="q-pa-md">
            <div class="row items-center q-mb-md">
              <div class="slt-section-label col q-mb-none">Internal Notes & Comments</div>
            </div>

            <!-- Add Note Form -->
            <q-card flat bordered class="q-mb-md">
              <q-card-section>
                <div class="row q-col-gutter-sm">
                  <div class="col-12">
                    <q-input
                      v-model="newNote"
                      outlined
                      dense
                      label="Add a note or comment…"
                      type="textarea"
                      rows="2"
                      autogrow
                    />
                  </div>
                </div>
              </q-card-section>
              <q-card-actions align="right" class="q-pa-md q-pt-none">
                <q-btn
                  unelevated
                  no-caps
                  color="primary"
                  icon="send"
                  label="Add Note"
                  :disable="!newNote"
                  @click="addNote"
                />
              </q-card-actions>
            </q-card>

            <!-- Existing Notes -->
            <q-timeline
              color="primary"
              layout="comfortable"
              v-if="activeCase.notes && activeCase.notes.length"
            >
              <q-timeline-entry
                v-for="(note, idx) in [...activeCase.notes].reverse()"
                :key="idx"
                color="blue-6"
                icon="comment"
                :subtitle="note.timestamp"
              >
                <template #title>
                  <span class="text-weight-bold">{{ note.author }}</span>
                  <q-badge v-if="note.isPrivate" color="grey-7" label="Private" class="q-ml-sm" />
                </template>
                <div class="text-body2 text-grey-8">{{ note.text }}</div>
              </q-timeline-entry>
            </q-timeline>

            <div v-else class="column flex-center text-grey-5 q-py-xl">
              <q-icon name="chat_bubble_outline" size="48px" />
              <div class="q-mt-sm text-body2">No notes yet. Add the first note above.</div>
            </div>
          </q-tab-panel>

          <!-- ╔═══════════════════════════ AUDIT TRAIL TAB ════════╗ -->
          <q-tab-panel name="audit" class="q-pa-md">
            <div class="row items-center q-mb-md">
              <div class="slt-section-label col q-mb-none">Audit Trail — All Actions</div>
            </div>

            <q-table
              :rows="activeCase.auditTrail || []"
              :columns="auditCols"
              flat
              bordered
              dense
              row-key="id"
              no-data-label="No audit entries"
              :pagination="{ rowsPerPage: 15 }"
              class="slt-inner-table"
            >
              <template #body-cell-action="props">
                <q-td :props="props">
                  <q-badge rounded :color="auditActionColor(props.value)" :label="props.value" />
                </q-td>
              </template>
            </q-table>
          </q-tab-panel>

          <!-- Versions Tab (LCH-BR-02 Simulation) -->
          <q-tab-panel name="versions" class="q-pa-md">
            <div class="row items-center q-mb-md">
              <div class="slt-section-label col q-mb-none">Document Version History</div>
            </div>
            <q-list bordered separator padding class="rounded-borders">
              <q-item v-for="(v, i) in activeCase.versions || mockVersions" :key="i">
                <q-item-section avatar>
                  <q-avatar color="blue-1" text-color="blue-8" size="32px">v{{ v.ver }}</q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Version {{ v.ver }}</q-item-label>
                  <q-item-label caption>{{ v.date }} by {{ v.by }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn flat dense round icon="visibility" color="grey-7" size="sm" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-tab-panel>
        </q-tab-panels>

        <q-separator />

        <!-- Dialog footer actions -->
        <q-card-actions align="right" class="q-pa-md">
          <div class="row q-gutter-sm">
            <q-btn flat no-caps label="Reports/PDF" color="accent" icon="picture_as_pdf" @click="generatePDF">
              <q-tooltip>Print Case Summary</q-tooltip>
            </q-btn>
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

    <!-- ═══════════════════════════════════════════════════════════
         CASE TYPE SHIFT DIALOG
    ════════════════════════════════════════════════════════════ -->
    <q-dialog v-model="showTypeShiftDialog">
      <q-card style="width: 440px; max-width: 95vw">
        <q-bar class="slt-dialog-bar text-white">
          <q-icon name="swap_horiz" />
          <div class="text-weight-bold q-ml-sm">Shift Case Type</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>
        <q-card-section>
          <div class="text-subtitle2 q-mb-md">Reclassify Case #{{ activeCase?.caseNo }}</div>
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-select
                v-model="proposedType"
                outlined
                dense
                label="New Case Type *"
                :options="[
                  'Money Recovery',
                  'Land Case',
                  'Damages',
                  'Appeals',
                  'Criminal',
                  'Inquiry',
                  'Other',
                ]"
                emit-value
                map-options
              />
            </div>
            <div class="col-12">
              <q-input
                v-model="shiftReason"
                outlined
                dense
                label="Reason for Shift / Supervisor Approval Ref *"
                type="textarea"
                rows="3"
              />
            </div>
          </div>
          <div class="q-mt-md text-caption text-negative">
            <q-icon name="warning" class="q-mr-xs" /> Moving a case between types may hide some
            type-specific data fields.
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat no-caps label="Cancel" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            no-caps
            color="amber-9"
            icon="check"
            label="Confirm Shift"
            :disabled="!proposedType || !shiftReason"
            @click="executeTypeShift"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ═══════════════════════════════════════════════════════════
         CREATE NEW CASE DIALOG
    ════════════════════════════════════════════════════════════ -->
    <q-dialog v-model="showCreateDialog" persistent>
      <q-card style="width: 700px; max-width: 90vw">
        <q-bar class="slt-dialog-bar text-white">
          <q-icon name="add_circle" />
          <div class="text-weight-bold q-ml-sm">Register New Legal Case</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>

        <q-card-section class="q-pa-md">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <q-input v-model="newCaseForm.caseNo" label="Case No." outlined dense readonly />
            </div>
            <div class="col-12 col-sm-6">
              <q-select
                v-model="newCaseForm.caseType"
                :options="[
                  'Money Recovery',
                  'Land Case',
                  'Damages',
                  'Appeals',
                  'Criminal',
                  'Other',
                ]"
                label="Case Type"
                outlined
                dense
              />
            </div>
            <div class="col-12">
              <q-input v-model="newCaseForm.title" label="Case Title" outlined dense />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="newCaseForm.court" label="Court Name" outlined dense />
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                v-model="newCaseForm.assignedLawyer"
                label="Assigned Lawyer"
                outlined
                dense
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="newCaseForm.plaintiff" label="Plaintiff" outlined dense />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="newCaseForm.defendant" label="Defendant" outlined dense />
            </div>
            <div class="col-12">
              <q-input
                v-model="newCaseForm.natureOfCase"
                label="Nature of Case"
                type="textarea"
                outlined
                dense
                rows="2"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pb-md q-px-md">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup no-caps />
          <q-btn
            unelevated
            label="Create Case"
            color="primary"
            icon="check"
            :loading="loading"
            @click="submitCreateCase"
            no-caps
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ═══════════════════════════════════════════════════════════
         DOCUMENT PREVIEW DIALOG
    ════════════════════════════════════════════════════════════ -->
    <q-dialog
      v-model="showPreviewDialog"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="column no-wrap bg-grey-3">
        <q-bar class="slt-dialog-bar text-white">
          <q-icon :name="docIcon(previewDoc?.type)" />
          <div class="text-weight-bold q-ml-sm">Preview: {{ previewDoc?.name }}</div>
          <q-space />
          <q-btn
            dense
            flat
            icon="download"
            label="Download"
            @click="downloadDocument(previewDoc)"
            no-caps
            class="q-mr-md"
          />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>

        <q-card-section class="col flex flex-center q-pa-none overflow-hidden">
          <div v-if="previewDoc?.type === 'pdf'" class="full-width full-height column flex-center">
            <q-icon name="picture_as_pdf" size="120px" color="negative" />
            <div class="text-h6 text-grey-8 q-mt-md">Secure PDF Viewer Simulation</div>
            <div class="text-caption text-grey-6">
              {{ previewDoc.name }} ({{ previewDoc.size }})
            </div>
            <q-btn
              unelevated
              color="primary"
              label="Open in External Viewer"
              icon="open_in_new"
              no-caps
              class="q-mt-lg"
              @click="downloadDocument(previewDoc)"
            />
          </div>
          <div v-else-if="['jpg', 'png'].includes(previewDoc?.type)" class="column flex-center">
            <q-img
              src="https://placehold.co/800x1200/e3f2fd/2196f3?text=SLT+Legal+Document+Sample"
              style="
                max-width: 800px;
                border: 1px solid #ccc;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
              "
            />
            <div class="text-caption text-grey-6 q-mt-md">
              Sample Document Image: {{ previewDoc.name }}
            </div>
          </div>
          <div v-else class="column flex-center">
            <q-icon name="insert_drive_file" size="120px" color="grey-6" />
            <div class="text-h6 text-grey-8 q-mt-md">Preview not available for this file type</div>
            <q-btn
              unelevated
              color="primary"
              label="Download to View"
              icon="download"
              no-caps
              class="q-mt-md"
              @click="downloadDocument(previewDoc)"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { supabase } from 'src/boot/supabase'
import { useAuthStore } from 'src/stores/authStore'

const $q = useQuasar()
const authStore = useAuthStore()

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  DATABASE STATE
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const cases = ref([])
const loading = ref(false)

async function fetchCases() {
  loading.value = true
  try {
    let query = supabase.from('legal_cases').select('*')

    // RBAC: All legal staff see all cases for transparency (Judge Board requirements).
    // Filtering is only for actions, not visibility.

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    cases.value = data.map((c) => ({
      ...c,
      caseNo: c.case_no,
      caseType: c.case_type,
      natureOfCase: c.nature_of_case,
      dateOfOccurrence: c.date_of_occurrence,
      filedDate: c.filed_date,
      financialExposure: c.financial_exposure,
      summaryOfFacts: c.summary_of_facts,
      assignedLawyer: c.assigned_lawyer,
      nextHearing: c.next_hearing,
      poly: {},
      proceedings: [],
      notes: [],
      auditTrail: [],
      attachedDocs: [],
    }))
  } catch (err) {
    console.error('Fetch error:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCases()
})

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
const showCreateDialog = ref(false)
const showQuickHearingDialog = ref(false)
const showTypeShiftDialog = ref(false)
const showPreviewDialog = ref(false)
const editMode = ref(false)
const activeCase = ref(null)
const previewDoc = ref(null)
const originalCase = ref(null)
const detailTab = ref('overview')
const saving = ref(false)

const newCaseForm = ref({
  caseNo: '',
  title: '',
  caseType: 'Money Recovery',
  court: '',
  plaintiff: '',
  defendant: '',
  natureOfCase: '',
  summaryOfFacts: '',
  financialExposure: 0,
  assignedLawyer: '',
  status: 'Active',
})

function openCreateDialog() {
  newCaseForm.value = {
    caseNo: 'LC-' + Date.now().toString().slice(-4),
    title: '',
    caseType: 'Money Recovery',
    court: '',
    plaintiff: '',
    defendant: '',
    natureOfCase: '',
    summaryOfFacts: '',
    financialExposure: 0,
    assignedLawyer: '',
    status: 'Active',
  }
  showCreateDialog.value = true
}

async function submitCreateCase() {
  loading.value = true
  try {
    const { error } = await supabase
      .from('legal_cases')
      .insert([
        {
          case_no: newCaseForm.value.caseNo,
          title: newCaseForm.value.title,
          case_type: newCaseForm.value.caseType,
          court: newCaseForm.value.court,
          plaintiff: newCaseForm.value.plaintiff,
          defendant: newCaseForm.value.defendant,
          nature_of_case: newCaseForm.value.natureOfCase,
          summary_of_facts: newCaseForm.value.summaryOfFacts,
          financial_exposure: newCaseForm.value.financialExposure,
          assigned_lawyer: newCaseForm.value.assignedLawyer,
          status: newCaseForm.value.status,
          created_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) throw error

    $q.notify({
      type: 'positive',
      message: 'New case created successfully',
      icon: 'check_circle',
    })

    showCreateDialog.value = false
    await fetchCases()
  } catch (err) {
    console.error('Create error:', err)
    $q.notify({ type: 'negative', message: 'Failed to create case' })
  } finally {
    loading.value = false
  }
}

async function openDetails(row, forEdit = false) {
  loading.value = true
  try {
    // Basic assignment
    activeCase.value = JSON.parse(JSON.stringify(row))
    originalCase.value = JSON.parse(JSON.stringify(row))

    // 1. Fetch Proceedings
    const { data: procData } = await supabase
      .from('case_proceedings')
      .select('*')
      .eq('case_id', row.id)
      .order('hearing_date', { ascending: true })
    activeCase.value.proceedings = (procData || []).map((p) => ({
      date: p.hearing_date,
      outcome: p.outcome,
      nextDate: p.next_date,
      notes: p.notes,
      recordedBy: 'User',
      recordedAt: p.recorded_at,
    }))

    // 2. Fetch Documents
    const { data: docData } = await supabase
      .from('case_documents')
      .select('*')
      .eq('case_id', row.id)
    activeCase.value.attachedDocs = (docData || []).map((d) => ({
      name: d.file_name,
      type: d.file_type,
      size: d.file_size,
      date: d.created_at?.slice(0, 10),
    }))

    // 3. Fetch Notes
    const { data: noteData } = await supabase
      .from('case_notes')
      .select('*')
      .eq('case_id', row.id)
      .order('created_at', { ascending: true })
    activeCase.value.notes = (noteData || []).map((n) => ({
      text: n.text,
      author: n.author_name || 'User',
      timestamp: n.created_at,
      isPrivate: n.is_private,
    }))

    // 4. Fetch Type-Specific (Poly) Data
    if (row.caseType === 'Money Recovery') {
      const { data: polyData } = await supabase
        .from('money_recovery_details')
        .select('*')
        .eq('case_id', row.id)
        .maybeSingle()
      if (polyData) {
        activeCase.value.poly = {
          claimAmount: polyData.claim_amount,
          paidAmount: polyData.paid_amount,
          payments: [],
        }
        // Fetch payments
        const { data: payData } = await supabase
          .from('money_recovery_payments')
          .select('*')
          .eq('case_id', row.id)
        activeCase.value.poly.payments = (payData || []).map((p) => ({
          date: p.payment_date,
          amount: p.amount,
          method: p.method,
          ref: p.reference,
        }))
      }
    } else if (row.caseType === 'Land Case') {
      const { data: polyData } = await supabase
        .from('land_case_details')
        .select('*')
        .eq('case_id', row.id)
        .maybeSingle()
      if (polyData) {
        activeCase.value.poly = {
          deedNumber: polyData.deed_number,
          planNumber: polyData.plan_number,
          landName: polyData.land_name,
          extent: polyData.extent,
          district: polyData.district,
          gramaNiladari: polyData.grama_niladari,
          encumbrances: polyData.encumbrances,
          ownershipHistory: [],
        }
      }
    } else if (row.caseType === 'Damages') {
      const { data: polyData } = await supabase
        .from('damages_details')
        .select('*')
        .eq('case_id', row.id)
        .maybeSingle()
      if (polyData) {
        activeCase.value.poly = {
          assessedDamage: polyData.assessed_damage,
          compensationClaimed: polyData.compensation_claimed,
          compensationReceived: polyData.compensation_received,
          damageType: polyData.damage_type,
          assessmentStatus: polyData.assessment_status,
          damageDescription: polyData.damage_description,
          settlementStatus: polyData.settlement_status,
          settlementAmount: polyData.settlement_amount,
          settlementDate: polyData.settlement_date,
          settlementRemarks: polyData.settlement_remarks,
        }
      }
    }

    // 5. Audit Trail
    const { data: auditData } = await supabase
      .from('case_audit_trail')
      .select('*')
      .eq('case_id', row.id)
      .order('performed_at', { ascending: false })
    activeCase.value.auditTrail = (auditData || []).map((a) => ({
      timestamp: a.performed_at,
      user: a.performer_name || 'System',
      action: a.action,
      remarks: a.details,
    }))

    // 6. Fetch Criminal/Inquiry specific lists if applicable
    if (row.caseType === 'Criminal') {
      const { data: chargeData } = await supabase
        .from('criminal_case_charges')
        .select('*')
        .eq('case_id', row.id)
      activeCase.value.poly.charges = (chargeData || []).map((c) => ({
        id: c.id,
        charge: c.charge,
        status: c.status,
      }))

      const { data: histData } = await supabase
        .from('criminal_hearing_history')
        .select('*')
        .eq('case_id', row.id)
        .order('hearing_date', { ascending: true })
      activeCase.value.poly.hearingHistory = (histData || []).map((h) => ({
        id: h.id,
        date: h.hearing_date,
        bench: h.judge_name,
        order: h.court_order,
      }))
    } else if (row.caseType === 'Other') {
      const { data: panelData } = await supabase
        .from('inquiry_panel_members')
        .select('*')
        .eq('case_id', row.id)
      activeCase.value.poly.panelMembers = (panelData || []).map((m) => ({
        id: m.id,
        name: m.member_name,
        role: m.role,
      }))
    }

    detailTab.value = 'overview'
    editMode.value = forEdit
    showDetailDialog.value = true
  } catch (err) {
    console.error('Error fetching details:', err)
    $q.notify({ type: 'negative', message: 'Failed to load case details' })
  } finally {
    loading.value = false
  }
}

function cancelEdit() {
  activeCase.value = JSON.parse(JSON.stringify(originalCase.value))
  editMode.value = false
}

async function saveCase() {
  saving.value = true
  try {
    // 1. Update main case record
    const { error } = await supabase
      .from('legal_cases')
      .update({
        title: activeCase.value.title,
        nature_of_case: activeCase.value.natureOfCase,
        court: activeCase.value.court,
        plaintiff: activeCase.value.plaintiff,
        defendant: activeCase.value.defendant,
        summary_of_facts: activeCase.value.summaryOfFacts,
        financial_exposure: activeCase.value.financialExposure,
        next_hearing: activeCase.value.nextHearing,
        updated_at: new Date().toISOString(),
      })
      .eq('id', activeCase.value.id)

    if (error) throw error

    // 2. Sync type-specific (poly) data
    if (activeCase.value.caseType === 'Money Recovery') {
      await supabase.from('money_recovery_details').upsert({
        case_id: activeCase.value.id,
        claim_amount: activeCase.value.poly.claimAmount,
        paid_amount: activeCase.value.poly.paidAmount,
        updated_at: new Date().toISOString(),
      })
    } else if (activeCase.value.caseType === 'Land Case') {
      await supabase.from('land_case_details').upsert({
        case_id: activeCase.value.id,
        deed_number: activeCase.value.poly.deedNumber,
        plan_number: activeCase.value.poly.planNumber,
        land_name: activeCase.value.poly.landName,
        extent: activeCase.value.poly.extent,
        district: activeCase.value.poly.district,
        grama_niladari: activeCase.value.poly.gramaNiladari,
        encumbrances: activeCase.value.poly.encumbrances,
        updated_at: new Date().toISOString(),
      })
    } else if (activeCase.value.caseType === 'Damages') {
      await supabase.from('damages_details').upsert({
        case_id: activeCase.value.id,
        assessed_damage: activeCase.value.poly.assessedDamage,
        compensation_claimed: activeCase.value.poly.compensationClaimed,
        compensation_received: activeCase.value.poly.compensationReceived,
        damage_type: activeCase.value.poly.damageType,
        assessment_status: activeCase.value.poly.assessmentStatus,
        damage_description: activeCase.value.poly.damageDescription,
        settlement_status: activeCase.value.poly.settlementStatus,
        settlement_amount: activeCase.value.poly.settlementAmount,
        settlement_date: activeCase.value.poly.settlementDate,
        settlement_remarks: activeCase.value.poly.settlementRemarks,
        updated_at: new Date().toISOString(),
      })
    }

    await fetchCases()
    saving.value = false
    editMode.value = false
    $q.notify({
      type: 'positive',
      message: `Case #${activeCase.value.caseNo} updated successfully.`,
      icon: 'check_circle',
    })
  } catch (err) {
    console.error('Save error:', err)
    $q.notify({ type: 'negative', message: 'Failed to save changes' })
    saving.value = false
  }
}

async function toggleClose(row) {
  const isClosing = row.status !== 'Closed'
  const newStatus = isClosing ? 'Closed' : 'Active'

  try {
    const { error } = await supabase
      .from('legal_cases')
      .update({
        status: newStatus,
        closed_at: isClosing ? new Date().toISOString() : null,
      })
      .eq('id', row.id)

    if (error) throw error

    await fetchCases()
    $q.notify({
      type: isClosing ? 'info' : 'positive',
      message: `Case #${row.caseNo} ${isClosing ? 'closed' : 'reopened'}.`,
      icon: isClosing ? 'lock' : 'lock_open',
    })
  } catch (err) {
    console.error('Status update error:', err)
    $q.notify({ type: 'negative', message: 'Failed to update case status' })
  }
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

async function addPaymentRow() {
  const newPayment = {
    case_id: activeCase.value.id,
    payment_date: new Date().toISOString().split('T')[0],
    amount: 0,
    method: 'Cash',
    reference: 'REF-' + Date.now().toString().slice(-4),
  }
  try {
    const { error } = await supabase.from('money_recovery_payments').insert([newPayment])
    if (error) throw error
    await openDetails(activeCase.value) // Refresh
    $q.notify({ type: 'positive', message: 'New payment record initialized in database.' })
  } catch (err) {
    console.error('Payment add error:', err)
    $q.notify({ type: 'negative', message: 'Failed to initialize payment record' })
  }
}

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  PROCEEDINGS
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const showHearingForm = ref(false)
const emptyHearing = () => ({ date: '', outcome: 'Adjourned', nextDate: '', notes: '' })
const newHearing = ref(emptyHearing())

async function saveHearing() {
  if (!newHearing.value.date || !newHearing.value.notes) {
    $q.notify({ type: 'warning', message: 'Hearing date and notes are required.' })
    return
  }

  try {
    // 1. Insert into proceedings
    const { error: pErr } = await supabase.from('case_proceedings').insert([
      {
        case_id: activeCase.value.id,
        hearing_date: newHearing.value.date,
        outcome: newHearing.value.outcome,
        next_date: newHearing.value.nextDate || null,
        notes: newHearing.value.notes,
        recorded_by: authStore.user?.id,
      },
    ])

    if (pErr) throw pErr

    // 2. Update case next_hearing
    if (newHearing.value.nextDate) {
      await supabase
        .from('legal_cases')
        .update({ next_hearing: newHearing.value.nextDate })
        .eq('id', activeCase.value.id)
    }

    await fetchCases()
    // Refresh local activeCase to show in timeline
    await openDetails(activeCase.value)

    newHearing.value = emptyHearing()
    showHearingForm.value = false
    $q.notify({ type: 'positive', message: 'Hearing record added.', icon: 'event_note' })
  } catch (err) {
    console.error('Hearing save error:', err)
    $q.notify({ type: 'negative', message: 'Failed to save hearing' })
  }
}

// Quick Add Hearing from table row
const quickHearingCase = ref(null)

function quickAddHearing(row) {
  quickHearingCase.value = row
  activeCase.value = JSON.parse(JSON.stringify(row))
  newHearing.value = emptyHearing()
  showQuickHearingDialog.value = true
}

async function saveQuickHearing() {
  if (!newHearing.value.date || !newHearing.value.notes) {
    $q.notify({ type: 'warning', message: 'Hearing date and notes are required.' })
    return
  }

  try {
    const { error: pErr } = await supabase.from('case_proceedings').insert([
      {
        case_id: quickHearingCase.value.id,
        hearing_date: newHearing.value.date,
        outcome: newHearing.value.outcome,
        next_date: newHearing.value.nextDate || null,
        notes: newHearing.value.notes,
        recorded_by: authStore.user?.id,
      },
    ])

    if (pErr) throw pErr

    if (newHearing.value.nextDate) {
      await supabase
        .from('legal_cases')
        .update({ next_hearing: newHearing.value.nextDate })
        .eq('id', quickHearingCase.value.id)
    }

    await fetchCases()
    showQuickHearingDialog.value = false
    $q.notify({
      type: 'positive',
      message: `Hearing added to case #${quickHearingCase.value.caseNo}.`,
      icon: 'event_note',
    })
  } catch (err) {
    console.error('Quick hearing save error:', err)
    $q.notify({ type: 'negative', message: 'Failed to add hearing' })
  }
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

function canToggleLock(row) {
  const role = authStore.profile?.role
  // Closing: Legal Officer or Admin
  if (row.status !== 'Closed') {
    return ['admin', 'legal_officer'].includes(role)
  }
  // Reopening: Supervisor, Manager or Admin
  return ['admin', 'supervisor', 'manager'].includes(role)
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
    {
      pdf: 'picture_as_pdf',
      doc: 'description',
      docx: 'description',
      jpg: 'image',
      png: 'image',
      xlsx: 'table_view',
      xls: 'table_view',
    }[type] || 'insert_drive_file'
  )
}

function docColor(type) {
  return (
    {
      pdf: 'negative',
      doc: 'info',
      docx: 'info',
      jpg: 'positive',
      png: 'positive',
      xlsx: 'green-8',
      xls: 'green-8',
    }[type] || 'grey-6'
  )
}

function isUrgent(dateStr) {
  if (!dateStr) return false
  return (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24) < 7
}

function fmt(val) {
  return Number(val || 0).toLocaleString('en-LK')
}

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  ADDITIONAL HELPERS
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
function typeTabLabel(type) {
  const map = {
    'Money Recovery': 'Financial Recovery',
    'Land Case': 'Land Title Details',
    Damages: 'Damage Assessment',
    Appeals: 'Appeal Details',
    Criminal: 'Criminal Proceedings',
    Other: 'Case Specifics',
  }
  return map[type] || 'Specific Details'
}

const originalCaseOptions = computed(() => {
  return cases.value
    .filter((c) => c.caseType !== 'Appeals')
    .map((c) => ({ label: `${c.caseNo} — ${c.title}`, value: c.caseNo }))
})

const ownershipCols = [
  { name: 'date', label: 'Date', field: 'date', align: 'left' },
  { name: 'owner', label: 'Owner Name', field: 'owner', align: 'left' },
  { name: 'type', label: 'Transfer Type', field: 'type', align: 'center' },
  { name: 'ref', label: 'Deed/Doc Ref', field: 'ref', align: 'left' },
]

function addOwnershipRow() {
  if (!activeCase.value.poly.ownershipHistory) activeCase.value.poly.ownershipHistory = []
  activeCase.value.poly.ownershipHistory.push({
    id: Date.now(),
    date: '',
    owner: '',
    type: '',
    ref: '',
  })
}

function typeTabIcon(type) {
  return typeIcon(type)
}

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  TYPE-SPECIFIC HELPERS (Charges, Panel, Audit, etc.)
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──

// Criminal Case Charges
const chargeCols = [
  { name: 'charge', label: 'Charge / Offence', field: 'charge', align: 'left' },
  { name: 'status', label: 'Charge Status', field: 'status', align: 'center' },
]
async function addChargeRow() {
  try {
    const { error } = await supabase.from('criminal_charges').insert([
      {
        case_id: activeCase.value.id,
        charge: 'New Charge',
        statute: 'Pending Statute',
        offence_details: 'Initial details...',
      },
    ])
    if (error) throw error
    await openDetails(activeCase.value)
    $q.notify({ type: 'info', message: 'Charge initialized.' })
  } catch (err) {
    console.error('Charge add error:', err)
  }
}

// Hearing History (Criminal)
const hearingHistoryCols = [
  { name: 'date', label: 'Date', field: 'date', align: 'left' },
  { name: 'bench', label: 'Magistrate/Judge', field: 'bench', align: 'left' },
  { name: 'order', label: 'Court Order', field: 'order', align: 'left' },
]
async function addHearingHistoryRow() {
  try {
    const { error } = await supabase.from('criminal_hearing_history').insert([
      {
        case_id: activeCase.value.id,
        hearing_date: new Date().toISOString().split('T')[0],
        judge_name: 'Hon. Judge',
        court_order: 'Mention',
      },
    ])
    if (error) throw error
    await openDetails(activeCase.value)
  } catch (err) {
    console.error('Hearing history add error:', err)
  }
}

function downloadDocument(doc) {
  if (!doc) return
  $q.notify({
    type: 'ongoing',
    message: `Downloading ${doc.name}...`,
    caption: 'Fetching from secure vault',
    icon: 'download',
    group: false,
    timeout: 1000,
  })

  // Simulated download trigger
  setTimeout(() => {
    const link = document.createElement('a')
    // Dummy PDF content
    link.href =
      'data:application/pdf;base64,JVBERi0xLjcK1f3pCjEgMCBvYmoKPDwvVHlwZS9DYXRhbG9nL1BhZ2VzIDIgMCBSPj4KZW5kb2JqCjIgMCBvYmoKPDwvVHlwZS9QYWdlcy9Db3VudCAxL0tpZHNbMyAwIFJdPj4KZW5kb2JqCjMgMCBvYmoKPDwvVHlwZS9QYWdlL1BhcmVudCAyIDAgUi9NZWRpYUJveFswIDAgNTk1IDg0Ml0vQ29udGVudHMgNCAwIFI+PgplbmRvYmoKNCAwIG9iago8PC9MZW5ndGggNTY+PnN0cmVhbQpCVAovRjEgMjQgVGYKNTAgODAwIFRkCihTTEQgTGVnYWxFZGdlIC0gRG9jdW1lbnQgRG93bmxvYWQgU2ltdWxhdGlvbikgVmoKRVQKZW5kc3RyZWFtCmVuZG9iago1IDAgb2JqCjw8L0Jhc2VGb250L0hlbHZldGljYS9UeXBlL0ZvbnQvU3VidHlwZS9UcnVlVHlwZT4+CmVuZG9iago2IDAgb2JqCjw8L1Byb2R1Y2VyIChTTEQgTGVnYWxFZGdlKS9DcmVhdGlvbkRhdGUgKEQ6MjAyNjAyMjMxMzI1MzcpPj4KZW5kb2JqCnRyYWlsZXIKPDwvUm9vdCAxIDAgUi9JbmZvIDYgMCBSL1NpemUgNz4+CnN0YXJ0eHJlZgo0OTQKJSVFT0Y='
    link.download = doc.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    $q.notify({
      type: 'positive',
      message: `${doc.name} saved successfully.`,
      icon: 'check_circle',
      timeout: 2000,
    })
  }, 1200)
}

function viewDocument(doc) {
  previewDoc.value = doc
  showPreviewDialog.value = true
}

const fileToUpload = ref(null)
const uploading = ref(false)

async function handleFileUpload(file) {
  if (!file) return
  uploading.value = true
  const fileName = `${Date.now()}_${file.name}`
  const filePath = `${activeCase.value.id}/${fileName}`

  try {
    // 1. Upload to Supabase Storage
    const { error: storageError } = await supabase.storage
      .from('case-documents')
      .upload(filePath, file)

    if (storageError) throw storageError

    // 2. Get Public URL
    const { data: urlData } = supabase.storage.from('case-documents').getPublicUrl(filePath)

    // 3. Record in database
    const { error: dbError } = await supabase.from('case_documents').insert([
      {
        case_id: activeCase.value.id,
        file_name: file.name,
        file_type: file.name.split('.').pop().toLowerCase(),
        file_size: (file.size / 1024).toFixed(1) + ' KB',
        file_url: urlData.publicUrl,
        uploaded_by: authStore.user?.id,
      },
    ])

    if (dbError) throw dbError

    $q.notify({
      type: 'positive',
      message: 'File uploaded successfully',
      icon: 'cloud_done',
    })

    // Refresh document list
    await openDetails(activeCase.value)
  } catch (err) {
    console.error('Upload error:', err)
    $q.notify({
      type: 'negative',
      message: 'Upload failed: ' + err.message,
    })
  } finally {
    uploading.value = false
    fileToUpload.value = null
  }
}

// Inquiry Panel Members
const panelCols = [
  { name: 'name', label: 'Panel Member Name', field: 'name', align: 'left' },
  { name: 'role', label: 'Role', field: 'role', align: 'center' },
]
async function addPanelMember() {
  try {
    const { error } = await supabase.from('inquiry_panel_members').insert([
      {
        case_id: activeCase.value.id,
        member_name: 'New Member',
        role: 'Inquiry Officer',
      },
    ])
    if (error) throw error
    await openDetails(activeCase.value)
  } catch (err) {
    console.error('Panel member add error:', err)
  }
}

// Notes & Audit
const newNote = ref('')
async function addNote() {
  if (!newNote.value) return
  try {
    const { error } = await supabase.from('case_notes').insert([
      {
        case_id: activeCase.value.id,
        text: newNote.value,
        author_name: 'Current User',
        is_private: false,
      },
    ])
    if (error) throw error

    newNote.value = ''
    // Refresh details to show new note
    await openDetails(activeCase.value)
    $q.notify({ type: 'info', message: 'Note added to case persistent storage.' })
  } catch (err) {
    console.error('Note add error:', err)
    $q.notify({ type: 'negative', message: 'Failed to save note' })
  }
}

const auditCols = [
  { name: 'timestamp', label: 'Timestamp', field: 'timestamp', align: 'left' },
  { name: 'user', label: 'User', field: 'user', align: 'left' },
  { name: 'action', label: 'Action', field: 'action', align: 'center' },
  { name: 'remarks', label: 'Remarks', field: 'remarks', align: 'left' },
]
function auditActionColor(a) {
  const map = {
    Created: 'info',
    Updated: 'primary',
    'Status Change': 'warning',
    Closed: 'negative',
  }
  return map[a] || 'grey-7'
}

// Case Type Shift Logic
const proposedType = ref(null)
const shiftReason = ref('')

function executeTypeShift() {
  if (!proposedType.value || !shiftReason.value) return
  const oldType = activeCase.value.caseType
  activeCase.value.caseType = proposedType.value

  // Ensure arrays exist for audit
  if (!activeCase.value.auditTrail) activeCase.value.auditTrail = []

  activeCase.value.auditTrail.push({
    id: Date.now(),
    timestamp: new Date().toLocaleString(),
    user: 'Supervisor',
    action: 'Status Change',
    remarks: `Type shifted from ${oldType} to ${proposedType.value}. Reason: ${shiftReason.value}`,
  })

  showTypeShiftDialog.value = false
  $q.notify({
    type: 'positive',
    message: `Case type shifted to ${proposedType.value}`,
    icon: 'swap_horiz',
  })
}

function generatePDF() {
  if (!activeCase.value) return
  $q.notify({
    type: 'ongoing',
    message: 'Generating Case Report Summary...',
    caption: 'Compiling legal history & audit trail',
    icon: 'picture_as_pdf',
    timeout: 1500,
  })

  setTimeout(() => {
    window.print()
    $q.notify({
      type: 'positive',
      message: 'Case report generated successfully.',
      icon: 'check_circle',
    })
  }, 1600)
}
</script>

<style lang="scss" scoped>
.slt-page-bg {
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

.slt-field-group {
  background: #f8f9fb;
  border: 1px solid #e0e7ef;
  border-radius: 8px;
  padding: 12px 16px;
  body.body--dark & {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }
}
.slt-section-label {
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #003f87;
  border-bottom: 3px solid #003f87;
  padding-bottom: 6px;
  margin-bottom: 12px;
  body.body--dark & {
    color: #4fc3f7;
    border-color: #4fc3f7;
  }
}
.slt-info-row {
  border-bottom: 1px solid #eef2f8;
  body.body--dark & {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  &:last-child {
    border-bottom: none;
  }
}

// Balance input colours
.slt-balance-positive :deep(.q-field__control) {
  background: rgba(255, 0, 0, 0.05);
}
.slt-balance-clear :deep(.q-field__control) {
  background: rgba(0, 255, 0, 0.05);
}

// Map placeholder
.slt-map-placeholder {
  height: 160px;
  background: rgba(var(--q-primary), 0.05);
  border: 2px dashed var(--q-primary);
  opacity: 0.6;
  border-radius: 8px;
}

// Inner tables (payments)
.slt-inner-table {
  :deep(thead tr th) {
    background: var(--q-dark-page);
    color: var(--q-primary);
    font-weight: 700;
    font-size: 0.7rem;
    text-transform: uppercase;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  body.body--light & {
    :deep(thead tr th) {
      background: #eef2f8;
      color: #003f87;
    }
  }
}

// Main table
.slt-table {
  :deep(thead tr th) {
    background: rgba(255, 255, 255, 0.03);
    color: var(--q-primary);
    font-weight: 700;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  body.body--light & {
    :deep(thead tr th) {
      background: #eef2f8;
      color: #003f87;
    }
  }
  :deep(tbody tr:hover) {
    background: rgba(var(--q-primary), 0.05) !important;
  }
  :deep(.q-table__top),
  :deep(.q-table__bottom) {
    background: transparent;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }
  body.body--light & {
    :deep(.q-table__top),
    :deep(.q-table__bottom) {
      background: #f8f9fb;
    }
  }
}

// Next-date badge in timeline
.slt-next-date-badge {
  font-size: 0.7rem;
}
</style>
