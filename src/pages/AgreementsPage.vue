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
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.linkedCaseNo"
                  outlined
                  dense
                  label="Linked Case Number (Optional)"
                  placeholder="LCH/2026/..."
                  hint="AAM-FR-12: Link this agreement to a legal case"
                />
              </div>
              <div class="col-12 col-sm-3">
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
        <div class="slt-stepper-wrap q-pa-md" :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-blue-1'">
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
          :class="$q.dark.isActive ? 'bg-dark' : 'bg-grey-1'"
          active-color="primary"
        >
          <q-tab name="details" icon="info" label="Details" />
          <q-tab name="history" icon="history" label="Approval History" />
          <q-tab name="docs" icon="folder" label="Documents" />
          <q-tab name="versions" icon="auto_awesome_motion" label="Versions" />
        </q-tabs>
        <q-separator />

        <q-tab-panels v-model="viewTab" animated style="max-height: 380px; overflow-y: auto">
          <!-- Details tab -->
          <q-tab-panel name="details" class="q-pa-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <div class="row items-start q-py-xs border-bottom">
                  <div class="col-5 row items-center text-caption text-grey-5">
                    <q-icon name="tag" size="13px" class="q-mr-xs" />Reference No.
                  </div>
                  <div class="col-7 text-body2 text-weight-medium text-grey-9">
                    {{ selected.referenceNo || '—' }}
                  </div>
                </div>
                <div class="row items-start q-py-xs border-bottom">
                  <div class="col-5 row items-center text-caption text-grey-5">
                    <q-icon name="category" size="13px" class="q-mr-xs" />Type
                  </div>
                  <div class="col-7 text-body2 text-weight-medium text-grey-9">
                    {{ selected.agreementType || '—' }}
                  </div>
                </div>
                <div class="row items-start q-py-xs border-bottom">
                  <div class="col-5 row items-center text-caption text-grey-5">
                    <q-icon name="person" size="13px" class="q-mr-xs" />Party 1
                  </div>
                  <div class="col-7 text-body2 text-weight-medium text-grey-9">
                    {{ selected.party1 || '—' }}
                  </div>
                </div>
                <div class="row items-start q-py-xs border-bottom">
                  <div class="col-5 row items-center text-caption text-grey-5">
                    <q-icon name="people" size="13px" class="q-mr-xs" />Party 2
                  </div>
                  <div class="col-7 text-body2 text-weight-medium text-grey-9">
                    {{ selected.party2 || '—' }}
                  </div>
                </div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="row items-start q-py-xs border-bottom">
                  <div class="col-5 row items-center text-caption text-grey-5">
                    <q-icon name="payments" size="13px" class="q-mr-xs" />Value
                  </div>
                  <div class="col-7 text-body2 text-weight-medium text-grey-9">
                    {{ selected.value ? `LKR ${fmt(selected.value)}` : '—' }}
                  </div>
                </div>
                <div class="row items-start q-py-xs border-bottom">
                  <div class="col-5 row items-center text-caption text-grey-5">
                    <q-icon name="event" size="13px" class="q-mr-xs" />Start Date
                  </div>
                  <div class="col-7 text-body2 text-weight-medium text-grey-9">
                    {{ selected.startDate || '—' }}
                  </div>
                </div>
                <div class="row items-start q-py-xs border-bottom">
                  <div class="col-5 row items-center text-caption text-grey-5">
                    <q-icon name="event_busy" size="13px" class="q-mr-xs" />Expiry Date
                  </div>
                  <div class="col-7 text-body2 text-weight-medium text-grey-9">
                    {{ selected.expiryDate || '—' }}
                  </div>
                </div>
                <div class="row items-start q-py-xs border-bottom">
                  <div class="col-5 row items-center text-caption text-grey-5">
                    <q-icon name="link" size="13px" class="q-mr-xs" />Linked Case
                  </div>
                  <div class="col-7 text-body2 text-weight-medium text-grey-9">
                    {{ selected.linkedCaseNo || '—' }}
                  </div>
                </div>
                <div class="row items-start q-py-xs border-bottom">
                  <div class="col-5 row items-center text-caption text-grey-5">
                    <q-icon name="info" size="13px" class="q-mr-xs" />Status
                  </div>
                  <div class="col-7 text-body2 text-weight-medium text-grey-9">
                    {{ selected.status || '—' }}
                  </div>
                </div>
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
                  <q-icon :name="docIcon(doc.type)" :color="docColor(doc.type)" size="24px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ doc.name }}</q-item-label>
                  <q-item-label caption
                    >{{ (doc.type || 'PDF').toUpperCase() }} · {{ doc.size }} ·
                    {{ doc.date }}</q-item-label
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
                    />
                    <q-btn
                      flat
                      round
                      dense
                      icon="download"
                      color="grey-7"
                      size="sm"
                      @click="downloadDocument(doc)"
                    />
                  </div>
                </q-item-section>
              </q-item>
              <q-item v-if="!selected.docs?.length">
                <q-item-section class="text-grey-5 text-center q-py-md"
                  >No documents uploaded.</q-item-section
                >
              </q-item>
            </q-list>
          </q-tab-panel>

          <!-- Versions tab (AAM-FR-03) -->
          <q-tab-panel name="versions" class="q-pa-md">
            <q-list bordered separator padding>
              <q-item v-for="(v, i) in selected.versions || mockVersions" :key="i">
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
              <q-item v-if="!(selected.versions || mockVersions)?.length">
                <q-item-section class="text-grey-5 text-center"
                  >No version history available.</q-item-section
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
            @click="handleAdvance(selected, 'submit')"
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
            @click="handleConfirmWorkflow(selected, 'approve')"
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
            @click="handleConfirmWorkflow(selected, 'reject')"
          />
          <q-btn
            v-if="
              ['Pending L1 Approval', 'Pending L2 Approval', 'Active'].includes(selected.status)
            "
            unelevated
            no-caps
            color="accent"
            icon="draw"
            label="Sign Agreement"
            @click="simulateSignature(selected)"
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
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  WORKFLOW DEFINITION  (single source of truth)
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──

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
  { key: 'Archived', label: 'Archived', icon: 'archive', color: 'blue-grey-6' },
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

const mockVersions = [
  { ver: 3, date: '2026-02-15 10:30', by: 'N. Silva' },
  { ver: 2, date: '2026-02-10 14:20', by: 'M. Perera' },
  { ver: 1, date: '2026-02-05 09:00', by: 'M. Perera' },
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
      { name: 'SLA-TechServ-2026.pdf', type: 'pdf', size: '2.1 MB', date: '2025-11-10' },
      { name: 'Annexure-A-Rates.pdf', type: 'pdf', size: '560 KB', date: '2025-11-10' },
      { name: 'Service_Schedule_Matrix.xlsx', type: 'xlsx', size: '156 KB', date: '2025-11-12' },
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
    docs: [
      { name: 'MOU-Virtusa-Draft.pdf', type: 'pdf', size: '1.4 MB', date: '2026-01-12' },
      { name: 'Pricing_Proposal_v1.xlsx', type: 'xlsx', size: '42 KB', date: '2026-01-14' },
    ],
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
    docs: [
      { name: 'Oracle-License-Agreement.pdf', type: 'pdf', size: '4.2 MB', date: '2026-01-20' },
      { name: 'License_Count_Summary.xlsx', type: 'xlsx', size: '18 KB', date: '2026-01-22' },
    ],
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
const showPreviewDialog = ref(false)
const selected = ref(null)
const previewDoc = ref(null)
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
  linkedCaseNo: '',
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

function simulateSignature(doc) {
  $q.dialog({
    title: 'Digital Signature (AAM-FR-08)',
    message: `You are about to digitally sign ${doc.referenceNo}. Please confirm your identity.`,
    prompt: {
      model: '',
      type: 'password',
      label: 'Enter Password to Sign',
    },
    cancel: true,
    persistent: true,
  }).onOk(() => {
    $q.loading.show({ message: 'Applying cryptographic signature...' })
    setTimeout(() => {
      $q.loading.hide()
      doc.history.push({
        action: 'Digitally Signed',
        date: today(),
        by: 'Current User',
        remarks: 'Digital signature applied via system PKI.',
      })
      $q.notify({
        type: 'positive',
        message: 'Agreement digitally signed successfully.',
        icon: 'verified_user',
      })
    }, 1500)
  })
}

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

function handleAdvance(row, action) {
  advance(row, action)
  showViewDialog.value = false
}

function handleConfirmWorkflow(row, action) {
  confirmWorkflow(row, action)
  showViewDialog.value = false
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
  setTimeout(() => {
    const link = document.createElement('a')
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
    })
  }, 1200)
}

function viewDocument(doc) {
  previewDoc.value = doc
  showPreviewDialog.value = true
}
</script>

<style lang="scss" scoped>
.slt-page-bg {
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
  background: transparent;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 8px 10px;
  position: relative;
  transition: all 0.2s;

  body.body--dark & {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }

  body.body--light & {
    background: #f8f9fb;
    border-color: #e0e7ef;
  }
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
    background: var(--q-dark-page);
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
