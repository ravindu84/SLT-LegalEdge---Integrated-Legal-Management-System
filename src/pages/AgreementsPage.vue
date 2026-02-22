<template>
  <q-page class="q-pa-md slt-page-bg">
    <!-- ─── Page Header ──────────────────────────────────────────── -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-weight-bold text-primary">
          <q-icon name="handshake" size="28px" class="q-mr-sm" />
          {{ $t('agreements.title') }}
        </div>
        <div class="text-caption text-grey-6">
          {{ $t('agreements.subtitle') }}
        </div>
      </div>
      <div class="col-auto row q-gutter-sm">
        <q-btn outline color="primary" icon="file_download" label="Export" size="sm" no-caps />
        <q-btn
          unelevated
          color="primary"
          icon="add"
          label="Create Agreement"
          no-caps
          @click="openCreateDialog"
        />
      </div>
    </div>

    <!-- ─── Workflow Pipeline KPI ────────────────────────────────── -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="q-py-sm">
        <div class="text-caption text-weight-bold text-grey-6 q-mb-sm">APPROVAL PIPELINE</div>
        <div class="row items-center q-col-gutter-xs">
          <div v-for="(stage, idx) in workflowStages" :key="stage.key" class="col">
            <div
              class="slt-pipeline-stage"
              :class="{ 'slt-pipeline-stage--active': stageCounts[stage.key] > 0 }"
            >
              <div class="row items-center justify-between q-mb-xs">
                <q-icon :name="stage.icon" :color="stage.color" size="18px" />
                <span class="text-h6 text-weight-bold" :class="`text-${stage.color}`">
                  {{ stageCounts[stage.key] }}
                </span>
              </div>
              <div class="text-caption text-grey-7 ellipsis">{{ stage.label }}</div>
            </div>
            <!-- Arrow between stages -->
            <q-icon
              v-if="idx < workflowStages.length - 1"
              name="chevron_right"
              color="grey-4"
              size="16px"
              class="slt-pipeline-arrow"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- ─── Filter Toolbar ───────────────────────────────────────── -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="row q-col-gutter-sm items-center q-py-sm">
        <div class="col-12 col-sm-4">
          <q-input v-model="filter" dense outlined clearable placeholder="Search agreements…">
            <template #prepend><q-icon name="search" /></template>
          </q-input>
        </div>
        <div class="col-6 col-sm-3">
          <q-select
            v-model="filterStatus"
            :options="['All', ...workflowStages.map((s) => s.label)]"
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
            :options="['All', ...agreementTypes]"
            dense
            outlined
            label="Type"
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
        :rows="filteredAgreements"
        :columns="columns"
        row-key="id"
        :filter="filter"
        :pagination="{ rowsPerPage: 8 }"
        flat
        class="slt-table"
        no-data-label="No agreements found"
      >
        <!-- Title -->
        <template #body-cell-title="props">
          <q-td :props="props">
            <div class="text-weight-bold text-grey-9">{{ props.value }}</div>
            <div class="text-caption text-grey-5">{{ props.row.agreementType }}</div>
          </q-td>
        </template>

        <!-- Value -->
        <template #body-cell-value="props">
          <q-td :props="props" class="text-right">
            <span v-if="props.value" class="text-weight-medium">LKR {{ fmt(props.value) }}</span>
            <span v-else class="text-grey-4">—</span>
          </q-td>
        </template>

        <!-- Status with stepper indicator -->
        <template #body-cell-status="props">
          <q-td :props="props" class="text-center">
            <q-badge
              rounded
              :color="statusMeta(props.value).color"
              :label="props.value"
              class="text-weight-medium"
            />
            <div class="slt-mini-stepper row justify-center q-mt-xs">
              <div
                v-for="(s, i) in mainStages"
                :key="i"
                class="slt-mini-dot"
                :class="{
                  'slt-mini-dot--done': stageIndex(props.value) > i,
                  'slt-mini-dot--active': stageIndex(props.value) === i,
                  'slt-mini-dot--reject': props.value === 'Rejected',
                }"
              />
            </div>
          </q-td>
        </template>

        <!-- Expiry -->
        <template #body-cell-expiryDate="props">
          <q-td :props="props" class="text-center">
            <span
              v-if="props.value"
              :class="isNearExpiry(props.value) ? 'text-negative text-weight-bold' : ''"
            >
              <q-icon v-if="isNearExpiry(props.value)" name="warning" size="14px" class="q-mr-xs" />
              {{ props.value }}
            </span>
            <span v-else class="text-grey-4">—</span>
          </q-td>
        </template>

        <!-- Actions -->
        <template #body-cell-actions="props">
          <q-td :props="props" class="text-center">
            <div class="row justify-center no-wrap q-gutter-xs">
              <!-- View -->
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

              <!-- Submit (Draft only) -->
              <q-btn
                v-if="props.row.status === 'Draft'"
                flat
                round
                dense
                icon="send"
                color="info"
                size="sm"
                @click="advance(props.row, 'submit')"
              >
                <q-tooltip>Submit for Review</q-tooltip>
              </q-btn>

              <!-- Approve (pending states) -->
              <q-btn
                v-if="
                  ['Under Review', 'Pending L1 Approval', 'Pending L2 Approval'].includes(
                    props.row.status,
                  )
                "
                flat
                round
                dense
                icon="check_circle"
                color="positive"
                size="sm"
                @click="confirmWorkflow(props.row, 'approve')"
              >
                <q-tooltip>{{ approveLabel(props.row.status) }}</q-tooltip>
              </q-btn>

              <!-- Reject (pending states) -->
              <q-btn
                v-if="
                  ['Under Review', 'Pending L1 Approval', 'Pending L2 Approval'].includes(
                    props.row.status,
                  )
                "
                flat
                round
                dense
                icon="cancel"
                color="negative"
                size="sm"
                @click="confirmWorkflow(props.row, 'reject')"
              >
                <q-tooltip>Reject</q-tooltip>
              </q-btn>

              <!-- Revert to Draft (Rejected only) -->
              <q-btn
                v-if="props.row.status === 'Rejected'"
                flat
                round
                dense
                icon="restart_alt"
                color="warning"
                size="sm"
                @click="advance(props.row, 'revert')"
              >
                <q-tooltip>Revert to Draft</q-tooltip>
              </q-btn>

              <!-- Terminate (Active only) -->
              <q-btn
                v-if="props.row.status === 'Active'"
                flat
                round
                dense
                icon="do_not_disturb_on"
                color="grey-6"
                size="sm"
                @click="confirmWorkflow(props.row, 'terminate')"
              >
                <q-tooltip>Terminate Agreement</q-tooltip>
              </q-btn>

              <!-- Edit (Draft only) -->
              <q-btn
                v-if="props.row.status === 'Draft'"
                flat
                round
                dense
                icon="edit"
                color="grey-7"
                size="sm"
                @click="openEditDialog(props.row)"
              >
                <q-tooltip>Edit</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>

        <template #no-data="{ message }">
          <div class="full-width column flex-center text-grey-5 q-py-xl">
            <q-icon name="handshake" size="56px" />
            <div class="q-mt-sm">{{ message }}</div>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- ═══════════════════════════════════════════════════════════
         CREATE / EDIT DIALOG
    ════════════════════════════════════════════════════════════ -->
    <q-dialog v-model="showFormDialog" persistent>
      <q-card style="width: 720px; max-width: 95vw">
        <q-bar class="slt-dialog-bar text-white">
          <q-icon name="handshake" />
          <div class="text-weight-bold q-ml-sm">
            {{ isEditMode ? 'Edit Agreement' : 'Create New Agreement' }}
          </div>
          <q-space />
          <q-btn dense flat icon="close" @click="closeDialog" />
        </q-bar>

        <q-card-section class="q-pt-md">
          <q-form ref="formRef" greedy>
            <div class="slt-form-section-label">Agreement Details</div>
            <div class="row q-col-gutter-md q-mb-sm">
              <div class="col-12">
                <q-input
                  v-model="form.title"
                  outlined
                  dense
                  label="Agreement Title *"
                  :rules="[(v) => !!v || 'Title is required']"
                  hint="Provide a clear, descriptive title"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="form.agreementType"
                  :options="agreementTypes"
                  outlined
                  dense
                  label="Agreement Type *"
                  emit-value
                  map-options
                  :rules="[(v) => !!v || 'Type is required']"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.referenceNo"
                  outlined
                  dense
                  label="Reference Number *"
                  hint="e.g. AGR/SLT/2026/001"
                  :rules="[(v) => !!v || 'Reference required']"
                />
              </div>
            </div>

            <div class="slt-form-section-label q-mt-md">Parties &amp; Financial</div>
            <div class="row q-col-gutter-md q-mb-sm">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.party1"
                  outlined
                  dense
                  label="Party 1 (SLT Side) *"
                  :rules="[(v) => !!v || 'Required']"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.party2"
                  outlined
                  dense
                  label="Party 2 (Vendor / Counter-party) *"
                  :rules="[(v) => !!v || 'Required']"
                />
              </div>
              <div class="col-12 col-sm-4">
                <q-input
                  v-model.number="form.value"
                  outlined
                  dense
                  label="Agreement Value (LKR)"
                  type="number"
                  min="0"
                >
                  <template #prepend><span class="text-caption text-grey-6">LKR</span></template>
                </q-input>
              </div>
              <div class="col-12 col-sm-4">
                <q-input
                  v-model="form.startDate"
                  outlined
                  dense
                  label="Start Date *"
                  type="date"
                  stack-label
                  :rules="[(v) => !!v || 'Required']"
                />
              </div>
              <div class="col-12 col-sm-4">
                <q-input
                  v-model="form.expiryDate"
                  outlined
                  dense
                  label="Expiry Date *"
                  type="date"
                  stack-label
                  :rules="[(v) => !!v || 'Required']"
                />
              </div>
            </div>

            <div class="slt-form-section-label q-mt-md">Description &amp; Documents</div>
            <div class="row q-col-gutter-md q-mb-sm">
              <div class="col-12">
                <q-input
                  v-model="form.description"
                  outlined
                  label="Description / Scope *"
                  type="textarea"
                  rows="3"
                  :rules="[(v) => !!v || 'Description is required']"
                />
              </div>
              <div class="col-12">
                <q-file
                  v-model="form.file"
                  outlined
                  dense
                  multiple
                  label="Upload Agreement Document(s)"
                  accept=".pdf,.doc,.docx"
                  counter
                  hint="PDF or DOCX · max 20 MB"
                >
                  <template #prepend><q-icon name="upload_file" /></template>
                </q-file>
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-separator />
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat no-caps label="Cancel" color="grey-7" @click="closeDialog" />
          <q-btn
            unelevated
            no-caps
            :label="isEditMode ? 'Save Changes' : 'Save as Draft'"
            color="primary"
            icon="save"
            :loading="submitting"
            @click="submitForm"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ═══════════════════════════════════════════════════════════
         VIEW DETAILS DIALOG
    ════════════════════════════════════════════════════════════ -->
    <q-dialog v-model="showViewDialog" persistent>
      <q-card v-if="selected" style="width: 780px; max-width: 95vw">
        <q-bar class="slt-dialog-bar text-white">
          <q-icon name="handshake" />
          <div class="text-weight-bold q-ml-sm col ellipsis">{{ selected.title }}</div>
          <q-badge
            :color="statusMeta(selected.status).color"
            :label="selected.status"
            rounded
            class="q-mr-md"
          />
          <q-btn dense flat icon="close" @click="showViewDialog = false" />
        </q-bar>

        <!-- Workflow Stepper -->
        <div class="slt-stepper-wrap q-pa-md bg-blue-1">
          <div class="row justify-between items-start">
            <div
              v-for="(stage, idx) in mainStages"
              :key="stage"
              class="col column items-center slt-step"
            >
              <!-- connector line left -->
              <div
                class="slt-step-line slt-step-line--left"
                :class="{
                  'slt-step-line--done': stageIndex(selected.status) > idx,
                  'slt-step-line--reject':
                    selected.status === 'Rejected' && stageIndex(selected.status) === idx,
                }"
                v-if="idx > 0"
              />
              <!-- icon circle -->
              <q-avatar
                size="38px"
                :color="stepCircleColor(idx, selected.status)"
                text-color="white"
              >
                <q-icon
                  :name="
                    stageIndex(selected.status) > idx
                      ? 'check'
                      : selected.status === 'Rejected' && stageIndex(selected.status) === idx
                        ? 'close'
                        : workflowStages[idx]?.icon
                  "
                  size="18px"
                />
              </q-avatar>
              <!-- connector line right -->
              <div
                class="slt-step-line slt-step-line--right"
                :class="{ 'slt-step-line--done': stageIndex(selected.status) > idx }"
                v-if="idx < mainStages.length - 1"
              />
              <div
                class="text-caption text-center q-mt-xs slt-step-label"
                :class="
                  stageIndex(selected.status) === idx
                    ? 'text-weight-bold text-primary'
                    : 'text-grey-6'
                "
              >
                {{ stage }}
              </div>
            </div>
          </div>
        </div>

        <q-separator />

        <!-- Tabbed content -->
        <q-tabs
          v-model="viewTab"
          dense
          align="left"
          indicator-color="accent"
          active-color="primary"
          class="bg-grey-1"
        >
          <q-tab name="details" icon="info" label="Details" />
          <q-tab name="history" icon="history" label="Approval History" />
          <q-tab name="docs" icon="folder" label="Documents" />
        </q-tabs>
        <q-separator />

        <q-tab-panels v-model="viewTab" animated style="max-height: 380px; overflow-y: auto">
          <!-- Details tab -->
          <q-tab-panel name="details" class="q-pa-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <VDetailRow icon="tag" label="Reference No." :value="selected.referenceNo" />
                <VDetailRow icon="category" label="Type" :value="selected.agreementType" />
                <VDetailRow icon="person" label="Party 1" :value="selected.party1" />
                <VDetailRow icon="people" label="Party 2" :value="selected.party2" />
              </div>
              <div class="col-12 col-sm-6">
                <VDetailRow
                  icon="payments"
                  label="Value"
                  :value="selected.value ? `LKR ${fmt(selected.value)}` : '—'"
                />
                <VDetailRow icon="event" label="Start Date" :value="selected.startDate" />
                <VDetailRow icon="event_busy" label="Expiry Date" :value="selected.expiryDate" />
                <VDetailRow icon="info" label="Status" :value="selected.status" />
              </div>
              <div class="col-12">
                <div class="text-caption text-grey-5 q-mb-xs">Description / Scope</div>
                <p class="text-body2 text-grey-8 q-mb-none">{{ selected.description }}</p>
              </div>
            </div>
          </q-tab-panel>

          <!-- History tab -->
          <q-tab-panel name="history" class="q-pa-md">
            <q-timeline color="primary" layout="comfortable" v-if="selected.history?.length">
              <q-timeline-entry
                v-for="(h, i) in [...selected.history].reverse()"
                :key="i"
                :color="
                  h.action === 'Rejected'
                    ? 'negative'
                    : h.action === 'Submitted'
                      ? 'info'
                      : 'positive'
                "
                :icon="
                  h.action === 'Rejected'
                    ? 'cancel'
                    : h.action === 'Submitted'
                      ? 'send'
                      : 'check_circle'
                "
                :subtitle="h.date"
              >
                <template #title>
                  <span class="text-weight-bold">{{ h.action }}</span>
                  <span class="text-caption text-grey-6 q-ml-sm">by {{ h.by }}</span>
                </template>
                <div v-if="h.remarks" class="text-body2 text-grey-7">{{ h.remarks }}</div>
              </q-timeline-entry>
            </q-timeline>
            <div v-else class="column flex-center text-grey-5 q-py-xl">
              <q-icon name="history" size="40px" />
              <div class="q-mt-sm">No workflow actions recorded yet.</div>
            </div>
          </q-tab-panel>

          <!-- Documents tab -->
          <q-tab-panel name="docs" class="q-pa-md">
            <q-list bordered separator rounded-borders>
              <q-item v-for="doc in selected.docs" :key="doc.name" clickable v-ripple>
                <q-item-section avatar>
                  <q-icon name="picture_as_pdf" color="negative" size="24px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ doc.name }}</q-item-label>
                  <q-item-label caption>PDF · {{ doc.size }} · {{ doc.date }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn flat round dense icon="download" color="grey-7" size="sm" />
                </q-item-section>
              </q-item>
              <q-item v-if="!selected.docs?.length">
                <q-item-section class="text-grey-5 text-center q-py-md"
                  >No documents uploaded.</q-item-section
                >
              </q-item>
            </q-list>
          </q-tab-panel>
        </q-tab-panels>

        <q-separator />
        <q-card-actions align="right" class="q-pa-md">
          <!-- Same contextual actions as table row -->
          <q-btn
            v-if="selected.status === 'Draft'"
            unelevated
            no-caps
            color="info"
            icon="send"
            label="Submit for Review"
            @click="
              advance(selected, 'submit')
              showViewDialog = false
            "
          />
          <q-btn
            v-if="
              ['Under Review', 'Pending L1 Approval', 'Pending L2 Approval'].includes(
                selected.status,
              )
            "
            unelevated
            no-caps
            color="positive"
            icon="check_circle"
            :label="approveLabel(selected.status)"
            @click="
              confirmWorkflow(selected, 'approve')
              showViewDialog = false
            "
          />
          <q-btn
            v-if="
              ['Under Review', 'Pending L1 Approval', 'Pending L2 Approval'].includes(
                selected.status,
              )
            "
            unelevated
            no-caps
            color="negative"
            icon="cancel"
            label="Reject"
            @click="
              confirmWorkflow(selected, 'reject')
              showViewDialog = false
            "
          />
          <q-btn flat no-caps label="Close" color="grey-7" @click="showViewDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ═══════════════════════════════════════════════════════════
         WORKFLOW ACTION CONFIRMATION DIALOG
    ════════════════════════════════════════════════════════════ -->
    <q-dialog v-model="showWorkflowDialog">
      <q-card style="width: 440px; max-width: 95vw">
        <q-card-section class="row items-center q-pb-none">
          <q-avatar
            :icon="
              pendingAction === 'approve'
                ? 'check_circle'
                : pendingAction === 'reject'
                  ? 'cancel'
                  : 'do_not_disturb_on'
            "
            :color="
              pendingAction === 'approve'
                ? 'positive'
                : pendingAction === 'reject'
                  ? 'negative'
                  : 'grey-7'
            "
            text-color="white"
            size="42px"
          />
          <span class="text-h6 text-weight-bold q-ml-md">
            {{
              pendingAction === 'approve'
                ? approveLabel(pendingDoc?.status)
                : pendingAction === 'reject'
                  ? 'Reject Agreement'
                  : 'Terminate Agreement'
            }}?
          </span>
        </q-card-section>
        <q-card-section>
          <p class="text-body2">
            Agreement: <strong>{{ pendingDoc?.title }}</strong>
          </p>
          <q-input
            v-model="workflowRemark"
            outlined
            dense
            autogrow
            :label="pendingAction === 'approve' ? 'Remarks (optional)' : 'Reason *'"
            :hint="pendingAction !== 'approve' ? 'Required — visible in approval history' : ''"
          />
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat no-caps label="Cancel" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            no-caps
            :label="
              pendingAction === 'approve'
                ? 'Confirm Approval'
                : pendingAction === 'reject'
                  ? 'Reject'
                  : 'Terminate'
            "
            :color="
              pendingAction === 'approve'
                ? 'positive'
                : pendingAction === 'reject'
                  ? 'negative'
                  : 'grey-7'
            "
            :icon="
              pendingAction === 'approve'
                ? 'check_circle'
                : pendingAction === 'reject'
                  ? 'cancel'
                  : 'do_not_disturb_on'
            "
            @click="executeWorkflow"
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
//  INLINE DETAIL ROW COMPONENT
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const VDetailRow = {
  props: { label: String, value: String, icon: String },
  template: `
    <div class="row items-start q-py-xs border-bottom">
      <div class="col-5 row items-center text-caption text-grey-5">
        <q-icon :name="icon" size="13px" class="q-mr-xs" />{{ label }}
      </div>
      <div class="col-7 text-body2 text-weight-medium text-grey-9">{{ value || '—' }}</div>
    </div>
  `,
}

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  WORKFLOW DEFINITION  (single source of truth)
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
/**
 * Stage progression:
 *  Draft → Under Review → Pending L1 Approval → Pending L2 Approval → Active
 *  Any pending stage → Rejected
 *  Rejected → Draft  (revert)
 *  Active   → Terminated
 */
const mainStages = ['Draft', 'Under Review', 'Pending L1 Approval', 'Pending L2 Approval', 'Active']

const workflowStages = [
  { key: 'Draft', label: 'Draft', icon: 'edit_note', color: 'grey-7' },
  { key: 'Under Review', label: 'Under Review', icon: 'rate_review', color: 'info' },
  { key: 'Pending L1 Approval', label: 'L1 Approval', icon: 'approval', color: 'warning' },
  { key: 'Pending L2 Approval', label: 'L2 Approval', icon: 'verified', color: 'orange-8' },
  { key: 'Active', label: 'Active', icon: 'check_circle', color: 'positive' },
  { key: 'Rejected', label: 'Rejected', icon: 'cancel', color: 'negative' },
  { key: 'Terminated', label: 'Terminated', icon: 'do_not_disturb', color: 'grey-6' },
]

// Next state map for approve action
const nextStateMap = {
  'Under Review': 'Pending L1 Approval',
  'Pending L1 Approval': 'Pending L2 Approval',
  'Pending L2 Approval': 'Active',
}

function approveLabel(status) {
  return (
    {
      'Under Review': 'Approve & Send to L1',
      'Pending L1 Approval': 'L1 Approve & Send to L2',
      'Pending L2 Approval': 'L2 Final Approval',
    }[status] || 'Approve'
  )
}

function stageIndex(status) {
  const idx = mainStages.indexOf(status)
  return idx === -1 ? (status === 'Rejected' ? 1 : 4) : idx
}

function stepCircleColor(idx, status) {
  const cur = stageIndex(status)
  if (status === 'Rejected' && idx === cur) return 'negative'
  if (idx < cur) return 'positive'
  if (idx === cur) return 'primary'
  return 'grey-4'
}

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  AGREEMENT TYPES
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const agreementTypes = [
  'Service Level Agreement',
  'Vendor Agreement',
  'MOU',
  'Lease Agreement',
  'Maintenance Contract',
  'Non-Disclosure Agreement',
  'Partnership Agreement',
  'Other',
]

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  MOCK DATA  (rich — all statuses represented)
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const agreements = ref([
  {
    id: 1,
    title: 'Network Maintenance SLA – TechServ Solutions',
    agreementType: 'Service Level Agreement',
    referenceNo: 'AGR/SLT/2026/001',
    party1: 'SLT Mobitel PLC – Network Division',
    party2: 'TechServ Solutions (Pvt) Ltd',
    value: 18500000,
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    status: 'Active',
    description:
      'Annual network maintenance and 24x7 NOC support services for SLT backbone infrastructure.',
    history: [
      { action: 'Created', date: '2025-11-10', by: 'M. Perera', remarks: '' },
      {
        action: 'Submitted',
        date: '2025-11-15',
        by: 'M. Perera',
        remarks: 'Ready for legal review',
      },
      {
        action: 'Approved (Review)',
        date: '2025-11-22',
        by: 'Legal Team',
        remarks: 'Documents verified',
      },
      {
        action: 'L1 Approved',
        date: '2025-11-28',
        by: 'K. Fernando, AGM',
        remarks: 'Agreed terms acceptable',
      },
      {
        action: 'L2 Approved',
        date: '2025-12-05',
        by: 'GM – Legal, SLT',
        remarks: 'Final approval granted',
      },
    ],
    docs: [
      { name: 'SLA-TechServ-2026.pdf', size: '2.1 MB', date: '2025-11-10' },
      { name: 'Annexure-A-Rates.pdf', size: '560 KB', date: '2025-11-10' },
    ],
  },
  {
    id: 2,
    title: 'Data Centre Co-location MOU – Virtusa',
    agreementType: 'MOU',
    referenceNo: 'AGR/SLT/2026/002',
    party1: 'SLT Mobitel PLC – ICT Division',
    party2: 'Virtusa Corporation',
    value: 6200000,
    startDate: '2026-03-01',
    expiryDate: '2027-02-28',
    status: 'Pending L2 Approval',
    description:
      'Co-location of Virtusa development servers at SLT Welikade data centre with managed connectivity.',
    history: [
      { action: 'Submitted', date: '2026-01-12', by: 'A. Ranasinghe', remarks: '' },
      {
        action: 'Approved (Review)',
        date: '2026-01-18',
        by: 'Legal Team',
        remarks: 'SLA terms reviewed and cleared',
      },
      {
        action: 'L1 Approved',
        date: '2026-01-25',
        by: 'N. Silva, AGM',
        remarks: 'Commercial terms acceptable',
      },
    ],
    docs: [{ name: 'MOU-Virtusa-Draft.pdf', size: '1.4 MB', date: '2026-01-12' }],
  },
  {
    id: 3,
    title: 'Software Licensing Agreement – Oracle',
    agreementType: 'Vendor Agreement',
    referenceNo: 'AGR/SLT/2026/003',
    party1: 'SLT Mobitel PLC – IT Department',
    party2: 'Oracle Corporation Lanka (Pvt) Ltd',
    value: 34000000,
    startDate: '2026-02-01',
    expiryDate: '2029-01-31',
    status: 'Pending L1 Approval',
    description:
      '3-year Oracle Database Enterprise Edition licensing and support for SLT core billing systems.',
    history: [
      { action: 'Submitted', date: '2026-01-20', by: 'T. Gunathilaka', remarks: '' },
      {
        action: 'Approved (Review)',
        date: '2026-02-01',
        by: 'Legal Team',
        remarks: 'Licensing terms verified with IT',
      },
    ],
    docs: [{ name: 'Oracle-License-Agreement.pdf', size: '4.2 MB', date: '2026-01-20' }],
  },
  {
    id: 4,
    title: 'Office Space Lease – Colombo 3 Branch',
    agreementType: 'Lease Agreement',
    referenceNo: 'AGR/SLT/2026/004',
    party1: 'SLT Mobitel PLC',
    party2: 'Urban Properties (Pvt) Ltd',
    value: 2400000,
    startDate: '2026-04-01',
    expiryDate: '2028-03-31',
    status: 'Under Review',
    description:
      'Lease of 4,500 sq ft commercial space at 45 Galle Road, Colombo 3 for SLT regional office.',
    history: [
      {
        action: 'Submitted',
        date: '2026-02-10',
        by: 'P. Jayawardena',
        remarks: 'Draft submitted for legal review',
      },
    ],
    docs: [{ name: 'Lease-Draft-Col3.pdf', size: '890 KB', date: '2026-02-10' }],
  },
  {
    id: 5,
    title: 'NDA – Huawei Technologies Partnership',
    agreementType: 'Non-Disclosure Agreement',
    referenceNo: 'AGR/SLT/2026/005',
    party1: 'SLT Mobitel PLC',
    party2: 'Huawei Technologies Lanka Co. Ltd',
    value: null,
    startDate: '2026-02-15',
    expiryDate: '2028-02-14',
    status: 'Draft',
    description:
      'Mutual NDA covering confidential technical specifications shared during 5G feasibility discussions.',
    history: [],
    docs: [],
  },
  {
    id: 6,
    title: 'Tower Site Maintenance Contract – Techno Build',
    agreementType: 'Maintenance Contract',
    referenceNo: 'AGR/SLT/2025/044',
    party1: 'SLT Mobitel PLC – Infrastructure',
    party2: 'Techno Build Engineering (Pvt) Ltd',
    value: 7800000,
    startDate: '2025-07-01',
    expiryDate: '2026-06-30',
    status: 'Rejected',
    description: 'Annual civil maintenance of 120 SLT tower sites across Southern Province.',
    history: [
      { action: 'Submitted', date: '2025-06-01', by: 'S. Dissanayake', remarks: '' },
      { action: 'Approved (Review)', date: '2025-06-10', by: 'Legal Team', remarks: '' },
      {
        action: 'Rejected',
        date: '2025-06-18',
        by: 'K. Fernando, AGM',
        remarks: 'Pricing not competitive. Vendor must resubmit with revised rates.',
      },
    ],
    docs: [{ name: 'Maintenance-Contract-Draft.pdf', size: '1.1 MB', date: '2025-06-01' }],
  },
  {
    id: 7,
    title: 'Cloud Services Partnership – Dialog Axiata',
    agreementType: 'Partnership Agreement',
    referenceNo: 'AGR/SLT/2025/051',
    party1: 'SLT Mobitel PLC',
    party2: 'Dialog Axiata PLC',
    value: 12000000,
    startDate: '2025-01-01',
    expiryDate: '2025-12-31',
    status: 'Terminated',
    description: 'Joint cloud services reselling partnership — terminated by mutual agreement.',
    history: [
      { action: 'Submitted', date: '2024-11-20', by: 'Admin', remarks: '' },
      { action: 'L2 Approved', date: '2024-12-10', by: 'GM Legal', remarks: '' },
      {
        action: 'Terminated',
        date: '2025-09-01',
        by: 'Admin',
        remarks: 'Mutual termination by both parties.',
      },
    ],
    docs: [{ name: 'Cloud-Partnership-Signed.pdf', size: '3.3 MB', date: '2024-12-10' }],
  },
])

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  COMPUTED & FILTERS
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const filter = ref('')
const filterStatus = ref('All')
const filterType = ref('All')

const filteredAgreements = computed(() =>
  agreements.value.filter((a) => {
    const okStatus = filterStatus.value === 'All' || a.status === filterStatus.value
    const okType = filterType.value === 'All' || a.agreementType === filterType.value
    return okStatus && okType
  }),
)

function resetFilters() {
  filter.value = ''
  filterStatus.value = 'All'
  filterType.value = 'All'
}

const stageCounts = computed(() => {
  const counts = {}
  workflowStages.forEach((s) => {
    counts[s.key] = 0
  })
  agreements.value.forEach((a) => {
    if (counts[a.status] !== undefined) counts[a.status]++
  })
  return counts
})

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  TABLE COLUMNS
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const columns = [
  { name: 'title', label: 'Agreement Title', field: 'title', align: 'left', sortable: true },
  { name: 'party2', label: 'Vendor / Party', field: 'party2', align: 'left', sortable: true },
  { name: 'startDate', label: 'Start', field: 'startDate', align: 'center', sortable: true },
  { name: 'expiryDate', label: 'Expiry', field: 'expiryDate', align: 'center', sortable: true },
  { name: 'value', label: 'Value (LKR)', field: 'value', align: 'right', sortable: true },
  { name: 'status', label: 'Status', field: 'status', align: 'center', sortable: true },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center', sortable: false },
]

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  VIEW DIALOG
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const showViewDialog = ref(false)
const selected = ref(null)
const viewTab = ref('details')

function viewAgreement(row) {
  selected.value = row
  viewTab.value = 'details'
  showViewDialog.value = true
}

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  CREATE / EDIT DIALOG
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const showFormDialog = ref(false)
const isEditMode = ref(false)
const submitting = ref(false)
const formRef = ref(null)

const emptyForm = () => ({
  title: '',
  agreementType: null,
  referenceNo: '',
  party1: 'SLT Mobitel PLC',
  party2: '',
  value: null,
  startDate: '',
  expiryDate: '',
  description: '',
  file: null,
})
const form = ref(emptyForm())

function openCreateDialog() {
  isEditMode.value = false
  form.value = emptyForm()
  showFormDialog.value = true
}

function openEditDialog(row) {
  isEditMode.value = true
  form.value = { ...row, file: null }
  showFormDialog.value = true
}

function closeDialog() {
  showFormDialog.value = false
  formRef.value?.resetValidation()
}

async function submitForm() {
  const valid = await formRef.value?.validate()
  if (!valid) return
  submitting.value = true
  await new Promise((r) => setTimeout(r, 700))

  if (isEditMode.value) {
    const idx = agreements.value.findIndex((a) => a.id === form.value.id)
    if (idx !== -1) agreements.value[idx] = { ...agreements.value[idx], ...form.value }
    $q.notify({ type: 'positive', message: 'Agreement updated.', icon: 'edit' })
  } else {
    agreements.value.unshift({
      ...form.value,
      id: Date.now(),
      status: 'Draft',
      history: [],
      docs: [],
    })
    $q.notify({ type: 'positive', message: 'Agreement saved as Draft.', icon: 'save' })
  }
  submitting.value = false
  closeDialog()
}

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  WORKFLOW ACTIONS
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const showWorkflowDialog = ref(false)
const pendingDoc = ref(null)
const pendingAction = ref('') // 'approve' | 'reject' | 'terminate'
const workflowRemark = ref('')

// Direct advance actions (no confirmation needed)
function advance(row, type) {
  const idx = agreements.value.findIndex((a) => a.id === row.id)
  if (idx === -1) return

  if (type === 'submit') {
    agreements.value[idx].status = 'Under Review'
    agreements.value[idx].history.push({
      action: 'Submitted',
      date: today(),
      by: 'Current User',
      remarks: 'Submitted for legal review',
    })
    $q.notify({ type: 'info', message: `"${row.title}" submitted for review.`, icon: 'send' })
  } else if (type === 'revert') {
    agreements.value[idx].status = 'Draft'
    agreements.value[idx].history.push({
      action: 'Reverted to Draft',
      date: today(),
      by: 'Current User',
      remarks: 'Reverted for revision',
    })
    $q.notify({
      type: 'warning',
      message: `"${row.title}" reverted to Draft.`,
      icon: 'restart_alt',
    })
  }
}

// Confirmation-required actions
function confirmWorkflow(row, action) {
  pendingDoc.value = row
  pendingAction.value = action
  workflowRemark.value = ''
  showWorkflowDialog.value = true
}

function executeWorkflow() {
  if (pendingAction.value !== 'approve' && !workflowRemark.value.trim()) {
    $q.notify({ type: 'warning', message: 'Please provide a reason.' })
    return
  }
  const idx = agreements.value.findIndex((a) => a.id === pendingDoc.value.id)
  if (idx === -1) return

  const doc = agreements.value[idx]

  if (pendingAction.value === 'approve') {
    const next = nextStateMap[doc.status]
    if (next) {
      doc.history.push({
        action: `Approved (${doc.status})`,
        date: today(),
        by: 'Current User',
        remarks: workflowRemark.value,
      })
      doc.status = next
      $q.notify({ type: 'positive', message: `Approved! Status → ${next}`, icon: 'check_circle' })
    }
  } else if (pendingAction.value === 'reject') {
    doc.history.push({
      action: 'Rejected',
      date: today(),
      by: 'Current User',
      remarks: workflowRemark.value,
    })
    doc.status = 'Rejected'
    $q.notify({ type: 'negative', message: `"${doc.title}" rejected.`, icon: 'cancel' })
  } else if (pendingAction.value === 'terminate') {
    doc.history.push({
      action: 'Terminated',
      date: today(),
      by: 'Current User',
      remarks: workflowRemark.value,
    })
    doc.status = 'Terminated'
    $q.notify({ type: 'info', message: `"${doc.title}" terminated.`, icon: 'do_not_disturb_on' })
  }

  showWorkflowDialog.value = false
}

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  HELPERS
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
function statusMeta(status) {
  return workflowStages.find((s) => s.key === status) || { color: 'grey-6' }
}

function isNearExpiry(dateStr) {
  if (!dateStr) return false
  const diff = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24)
  return diff >= 0 && diff <= 30
}

function fmt(val) {
  return Number(val || 0).toLocaleString('en-LK')
}

function today() {
  return new Date().toISOString().slice(0, 10)
}
</script>

<style lang="scss" scoped>
.slt-page-bg {
  background: #f0f4f9;
  min-height: 100vh;
}

// ── Dialog header ─────────────────────────────────────────────
.slt-dialog-bar {
  background: linear-gradient(135deg, #002f6c, #003f87);
  min-height: 44px;
}

// ── Form section label ────────────────────────────────────────
.slt-form-section-label {
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: #003f87;
  border-bottom: 2px solid #003f87;
  padding-bottom: 4px;
  margin-bottom: 12px;
}

// ── Pipeline strip ────────────────────────────────────────────
.slt-pipeline-stage {
  background: #f8f9fb;
  border: 1px solid #e0e7ef;
  border-radius: 8px;
  padding: 8px 10px;
  position: relative;
  transition: box-shadow 0.15s;
  &--active {
    border-color: #003f87;
    box-shadow: 0 2px 10px rgba(0, 63, 135, 0.1);
  }
}
.slt-pipeline-arrow {
  position: absolute;
  right: -10px;
  top: 12px;
}

// ── Workflow stepper ──────────────────────────────────────────
.slt-stepper-wrap {
  overflow-x: auto;
}
.slt-step {
  position: relative;
  flex: 1 1 0;
}
.slt-step-line {
  position: absolute;
  top: 19px;
  height: 3px;
  width: 50%;
  background: #e0e7ef;
  &--left {
    left: 0;
  }
  &--right {
    right: 0;
  }
  &--done {
    background: #21ba45;
  }
  &--reject {
    background: #c10015;
  }
}
.slt-step-label {
  font-size: 0.68rem;
  max-width: 80px;
  line-height: 1.2;
}

// ── Mini progress dots in table ───────────────────────────────
.slt-mini-stepper {
  gap: 3px;
}
.slt-mini-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e0e7ef;
  &--done {
    background: #21ba45;
  }
  &--active {
    background: #003f87;
  }
  &--reject {
    background: #c10015 !important;
  }
}

// ── Table ─────────────────────────────────────────────────────
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

// Detail row separator
.border-bottom {
  border-bottom: 1px solid #eef2f8;
  &:last-child {
    border-bottom: none;
  }
}
</style>
