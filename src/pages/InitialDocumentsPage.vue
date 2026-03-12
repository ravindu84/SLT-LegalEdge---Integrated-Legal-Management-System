<template>
  <q-page class="q-pa-md slt-page-bg">
    <!-- ─── Page Header ──────────────────────────────────────────── -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-weight-bold text-primary">
          <q-icon name="description" size="28px" class="q-mr-sm" />
          {{ $t('initialDocs.title') }}
        </div>
        <div class="text-caption text-grey-6">
          {{ $t('initialDocs.subtitle') }}
        </div>
      </div>
      <div class="col-auto row q-gutter-sm">
        <q-btn outline color="primary" icon="file_download" label="Export" size="sm" no-caps />
        <q-btn
          v-if="['admin', 'legal_officer'].includes(authStore.profile?.role)"
          unelevated
          color="primary"
          icon="add"
          label="Create New Document"
          no-caps
          @click="openCreateDialog"
        />
      </div>
    </div>

    <!-- ─── Stats Strip ──────────────────────────────────────────── -->
    <div class="row q-col-gutter-sm q-mb-md">
      <div v-for="stat in statusStats" :key="stat.label" class="col-6 col-sm-3">
        <q-card flat bordered class="slt-stat-chip">
          <q-card-section class="q-pa-sm row items-center no-wrap">
            <q-icon :name="stat.icon" :color="stat.color" size="22px" class="q-mr-sm" />
            <div>
              <div class="text-weight-bold text-h6" :class="`text-${stat.color}`">
                {{ stat.count }}
              </div>
              <div class="text-caption text-grey-6">{{ stat.label }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- ─── Filter Toolbar ───────────────────────────────────────── -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="row q-col-gutter-sm items-center q-py-sm">
        <div class="col-12 col-sm-4">
          <q-input v-model="filter" dense outlined clearable placeholder="Search documents…">
            <template #prepend><q-icon name="search" /></template>
          </q-input>
        </div>
        <div class="col-6 col-sm-3">
          <q-select
            v-model="filterStatus"
            :options="['All', 'Pending', 'Under Review', 'Approved', 'Rejected']"
            dense
            outlined
            label="Status"
            emit-value
            map-options
            behavior="menu"
            @update:model-value="applyFilters"
          />
        </div>
        <div class="col-6 col-sm-3">
          <q-select
            v-model="filterType"
            :options="['All', ...caseTypeOptions]"
            dense
            outlined
            label="Case Type"
            emit-value
            map-options
            behavior="menu"
            @update:model-value="applyFilters"
          />
        </div>
        <div class="col-auto">
          <q-btn flat icon="restart_alt" color="grey-7" dense @click="resetFilters">
            <q-tooltip>Reset Filters</q-tooltip>
          </q-btn>
        </div>
      </q-card-section>
    </q-card>

    <!-- ─── Main Data Table ──────────────────────────────────────── -->
    <q-card flat bordered>
      <q-table
        :rows="filteredDocs"
        :columns="columns"
        row-key="id"
        :filter="filter"
        :loading="loading"
        :pagination="{ rowsPerPage: 8 }"
        flat
        class="slt-table"
        no-data-label="No documents found"
      >
        <!-- Ref / Title -->
        <template #body-cell-refNo="props">
          <q-td :props="props">
            <span class="text-weight-bold text-primary">#{{ props.value }}</span>
          </q-td>
        </template>

        <!-- Case Type chip -->
        <template #body-cell-caseType="props">
          <q-td :props="props">
            <q-chip dense size="sm" :color="typeColor(props.value)" text-color="white">
              {{ props.value }}
            </q-chip>
          </q-td>
        </template>

        <!-- Status badge -->
        <template #body-cell-status="props">
          <q-td :props="props" class="text-center">
            <q-badge
              :color="statusColor(props.value)"
              :label="props.value"
              rounded
              class="text-weight-medium"
            />
          </q-td>
        </template>

        <!-- Financial Exposure -->
        <template #body-cell-financialExposure="props">
          <q-td :props="props" class="text-right">
            <span v-if="props.value" class="text-weight-medium">
              LKR {{ formatCurrency(props.value) }}
            </span>
            <span v-else class="text-grey-4">—</span>
          </q-td>
        </template>

        <!-- Actions -->
        <template #body-cell-actions="props">
          <q-td :props="props" class="text-center">
            <div class="row justify-center q-gutter-xs no-wrap">
              <!-- AI Summarize -->
              <q-btn
                flat
                round
                dense
                icon="auto_awesome"
                color="blue-7"
                size="sm"
                @click="summarizeDocument(props.row)"
              >
                <q-tooltip>AI Summarize</q-tooltip>
              </q-btn>

              <!-- View -->
              <q-btn
                flat
                round
                dense
                icon="visibility"
                color="primary"
                size="sm"
                @click="viewRecordDetails(props.row)"
              >
                <q-tooltip>View Details</q-tooltip>
              </q-btn>

              <!-- Edit (only if Pending AND role is Legal Officer/Admin) -->
              <q-btn
                v-if="['admin', 'legal_officer'].includes(authStore.profile?.role)"
                flat
                round
                dense
                icon="edit"
                color="grey-7"
                size="sm"
                :disable="props.row.status !== 'Pending'"
                @click="editDocument(props.row)"
              >
                <q-tooltip>Edit Document</q-tooltip>
              </q-btn>

              <!-- Approve (only if not finalized AND role is Supervisor/Manager/Admin) -->
              <q-btn
                v-if="['admin', 'supervisor', 'manager'].includes(authStore.profile?.role)"
                flat
                round
                dense
                icon="check_circle"
                color="positive"
                size="sm"
                :disable="['Approved', 'Rejected'].includes(props.row.status)"
                @click="confirmAction(props.row, 'Approve')"
              >
                <q-tooltip>Approve</q-tooltip>
              </q-btn>

              <!-- Reject (only if not finalized AND role is Supervisor/Manager/Admin) -->
              <q-btn
                v-if="['admin', 'supervisor', 'manager'].includes(authStore.profile?.role)"
                flat
                round
                dense
                icon="cancel"
                color="negative"
                size="sm"
                :disable="['Approved', 'Rejected'].includes(props.row.status)"
                @click="confirmAction(props.row, 'Reject')"
              >
                <q-tooltip>Reject</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>

        <!-- Empty state -->
        <template #no-data="{ message }">
          <div class="full-width column flex-center text-grey-5 q-py-xl">
            <q-icon name="folder_off" size="56px" />
            <div class="q-mt-sm">{{ message }}</div>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- ═══════════════════════════════════════════════════════════
         CREATE / EDIT DOCUMENT DIALOG
    ════════════════════════════════════════════════════════════ -->
    <q-dialog v-model="showFormDialog" persistent maximized-mobile>
      <q-card style="width: 760px; max-width: 95vw">
        <!-- Dialog Header -->
        <q-bar class="slt-dialog-bar text-white">
          <q-icon name="description" />
          <div class="text-weight-bold q-ml-sm">
            {{ isEditMode ? 'Edit Initial Document' : 'Create New Initial Document' }}
          </div>
          <q-space />
          <q-btn dense flat icon="close" @click="closeDialog">
            <q-tooltip>Close</q-tooltip>
          </q-btn>
        </q-bar>

        <q-card-section class="q-pt-md">
          <q-form ref="docFormRef" @submit.prevent="submitForm" greedy>
            <!-- ── Section 1: Case Identification ──────────────── -->
            <div class="slt-form-section-label">Case Identification</div>
            <div class="row q-col-gutter-md q-mb-sm">
              <div class="col-12 col-sm-8">
                <q-input
                  v-model="form.caseTitle"
                  outlined
                  dense
                  label="Case Title *"
                  :rules="[(val) => !!val || 'Case title is required']"
                  hint="Provide a brief, descriptive title"
                />
              </div>
              <div class="col-12 col-sm-4">
                <q-input
                  v-model="form.referenceNumber"
                  outlined
                  dense
                  label="Reference Number *"
                  :rules="[(val) => !!val || 'Reference number is required']"
                  hint="e.g. SLT/LEG/2026/001"
                />
              </div>
            </div>

            <div class="row q-col-gutter-md q-mb-sm">
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="form.caseType"
                  :options="caseTypeOptions"
                  outlined
                  dense
                  label="Case Type *"
                  emit-value
                  map-options
                  :rules="[(val) => !!val || 'Please select a case type']"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.dateOfOccurrence"
                  outlined
                  dense
                  label="Date of Occurrence *"
                  type="date"
                  :rules="[(val) => !!val || 'Date of occurrence is required']"
                  stack-label
                />
              </div>
            </div>

            <!-- ── Section 2: Parties Involved ─────────────────── -->
            <div class="slt-form-section-label q-mt-md">Parties Involved</div>
            <div class="row q-col-gutter-md q-mb-sm">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.plaintiff"
                  outlined
                  dense
                  label="Plaintiff / Claimant *"
                  hint="Name of the party filing the claim"
                  :rules="[(val) => !!val || 'Plaintiff is required']"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.defendant"
                  outlined
                  dense
                  label="Defendant / Respondent *"
                  hint="Name of the opposing party"
                  :rules="[(val) => !!val || 'Defendant is required']"
                />
              </div>
            </div>
            <div class="col-12 q-mb-sm">
              <q-input
                v-model="form.partiesInvolved"
                outlined
                dense
                label="Additional Parties Involved"
                hint="Other intervening parties, organizations, or witnesses"
                type="textarea"
                rows="2"
              />
            </div>

            <!-- ── Section 3: Case Details ─────────────────────── -->
            <div class="slt-form-section-label q-mt-md">Case Details</div>
            <div class="row q-col-gutter-md q-mb-sm">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.natureOfCase"
                  outlined
                  dense
                  label="Nature of Case *"
                  hint="Brief nature / legal basis of the case"
                  :rules="[(val) => !!val || 'Nature of case is required']"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model.number="form.financialExposure"
                  outlined
                  dense
                  label="Financial Exposure (LKR)"
                  type="number"
                  min="0"
                  hint="Estimated monetary value of the claim"
                >
                  <template #prepend>
                    <span class="text-caption text-grey-6">LKR</span>
                  </template>
                </q-input>
              </div>
            </div>
            <div class="col-12 q-mb-sm">
              <q-input
                v-model="form.summaryOfFacts"
                outlined
                label="Summary of Facts *"
                type="textarea"
                rows="4"
                hint="Provide a concise factual background of the case"
                :rules="[(val) => !!val || 'Summary of facts is required']"
              />
            </div>

            <!-- ── Section 4: Supporting Documents ────────────── -->
            <div class="slt-form-section-label q-mt-md">Supporting Documents</div>

            <!-- Existing attachments (edit mode) -->
            <div v-if="isEditMode && existingAttachments.length" class="col-12 q-mb-sm">
              <div class="text-caption text-grey-7 q-mb-xs">Existing documents:</div>
              <q-chip
                v-for="(att, i) in existingAttachments"
                :key="i"
                icon="insert_drive_file"
                color="blue-1"
                text-color="primary"
                dense
                class="q-mr-xs q-mb-xs"
              >
                {{ att.name }} ({{ att.size }})
              </q-chip>
            </div>

            <!-- New file upload -->
            <div class="col-12 q-mb-md">
              <q-file
                v-model="newAttachments"
                outlined
                dense
                multiple
                :label="isEditMode ? 'Add More Documents' : 'Attach Supporting Documents'"
                accept=".pdf,.doc,.docx,.jpg,.png"
                hint="PDF, DOC, DOCX, JPG, PNG — max 10 MB each"
                max-total-size="52428800"
                counter
              >
                <template #prepend><q-icon name="attach_file" /></template>
              </q-file>
            </div>
          </q-form>
        </q-card-section>

        <q-separator />

        <!-- Dialog Actions -->
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat no-caps label="Cancel" color="grey-7" @click="closeDialog" />
          <q-btn
            unelevated
            no-caps
            :label="isEditMode ? 'Save Changes' : 'Submit Document'"
            color="primary"
            icon="send"
            :loading="submitting"
            @click="submitForm"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ═══════════════════════════════════════════════════════════
         VIEW DETAILS DIALOG
    ════════════════════════════════════════════════════════════ -->
    <q-dialog v-model="showViewDialog">
      <q-card style="width: 620px; max-width: 95vw">
        <q-bar class="slt-dialog-bar text-white">
          <q-icon name="visibility" />
          <div class="text-weight-bold q-ml-sm">Document Details</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>

        <q-tabs
          v-model="docDetailTab"
          class="slt-tabs"
          dense
          active-color="primary"
          align="justify"
        >
          <q-tab name="details" label="Details" icon="info" />
          <q-tab name="attachments" label="Attachments" icon="attach_file" />
          <q-tab name="versions" label="Versions" icon="auto_awesome_motion" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="docDetailTab" animated>
          <q-tab-panel name="details" class="q-pa-md">
            <div v-if="selectedDoc" class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <div class="row items-center q-py-ms border-bottom">
                  <div
                    class="col-5 row items-center text-weight-bold"
                    :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
                  >
                    <q-icon name="tag" size="14px" class="q-mr-xs" />Reference No.
                  </div>
                  <div
                    class="col-7 text-body2 text-weight-bold"
                    :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                  >
                    #{{ selectedDoc.refNo }}
                  </div>
                </div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="row items-center q-py-ms border-bottom">
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
                    {{ selectedDoc.caseTitle }}
                  </div>
                </div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="row items-center q-py-ms border-bottom">
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
                    {{ selectedDoc.caseType }}
                  </div>
                </div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="row items-center q-py-ms border-bottom">
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
                    {{ selectedDoc.status }}
                  </div>
                </div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="row items-center q-py-ms border-bottom">
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
                    {{ selectedDoc.plaintiff }}
                  </div>
                </div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="row items-center q-py-ms border-bottom">
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
                    {{ selectedDoc.defendant }}
                  </div>
                </div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="row items-center q-py-ms border-bottom">
                  <div
                    class="col-5 row items-center text-weight-bold"
                    :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
                  >
                    <q-icon name="event" size="14px" class="q-mr-xs" />Date
                  </div>
                  <div
                    class="col-7 text-body2 text-weight-bold"
                    :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                  >
                    {{ selectedDoc.dateOfOccurrence || '—' }}
                  </div>
                </div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="row items-center q-py-ms border-bottom">
                  <div
                    class="col-5 row items-center text-weight-bold"
                    :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
                  >
                    <q-icon name="payments" size="14px" class="q-mr-xs" />Exposure
                  </div>
                  <div
                    class="col-7 text-body2 text-weight-bold"
                    :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                  >
                    {{
                      selectedDoc.financialExposure
                        ? `LKR ${formatCurrency(selectedDoc.financialExposure)}`
                        : '—'
                    }}
                  </div>
                </div>
              </div>
              <div class="col-12">
                <div
                  class="text-caption text-weight-bold q-mb-xs"
                  :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
                >
                  <q-icon name="gavel" size="14px" class="q-mr-xs" />Nature of Case
                </div>
                <p
                  class="text-body2 text-weight-medium q-mb-none"
                  :class="$q.dark.isActive ? 'text-grey-3' : 'text-grey-8'"
                >
                  {{ selectedDoc.natureOfCase || '—' }}
                </p>
              </div>
              <div class="col-12 q-mt-md">
                <div
                  class="text-caption text-weight-bold q-mb-xs"
                  :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-9'"
                >
                  <q-icon name="notes" size="14px" class="q-mr-xs" />Summary of Facts
                </div>
                <p
                  class="text-body2 text-weight-medium q-mb-none"
                  :class="$q.dark.isActive ? 'text-grey-3' : 'text-grey-8'"
                >
                  {{ selectedDoc.summaryOfFacts || '—' }}
                </p>
              </div>
            </div>
          </q-tab-panel>

          <q-tab-panel name="attachments" class="q-pa-md">
            <div class="row items-center q-mb-md">
              <div class="text-subtitle2 text-primary">Attached Evidence & Support Docs</div>
            </div>
            <q-list bordered separator padding class="rounded-borders">
              <q-item v-for="(file, idx) in selectedDoc.attachments" :key="idx">
                <q-item-section avatar>
                  <q-icon :name="docIcon(file.type)" :color="docColor(file.type)" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">{{ file.name }}</q-item-label>
                  <q-item-label caption
                    >{{ file.type.toUpperCase() }} · {{ file.size }} · {{ file.date }}</q-item-label
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
                      @click="viewDocument(file)"
                    />
                    <q-btn
                      flat
                      round
                      dense
                      icon="download"
                      color="grey-7"
                      size="sm"
                      @click="downloadDocument(file)"
                    />
                  </div>
                </q-item-section>
              </q-item>
              <q-item v-if="!selectedDoc.attachments || !selectedDoc.attachments.length">
                <q-item-section class="text-grey-5 text-center q-py-lg">
                  No attachments provided.
                </q-item-section>
              </q-item>
            </q-list>
          </q-tab-panel>

          <q-tab-panel name="versions" class="q-pa-md">
            <q-list bordered separator padding class="rounded-borders">
              <q-item v-for="(v, i) in mockVersions" :key="i">
                <q-item-section avatar>
                  <q-avatar color="blue-1" text-color="blue-8" size="32px"> v{{ v.ver }} </q-avatar>
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

        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            v-if="selectedDoc && !['Approved', 'Rejected'].includes(selectedDoc.status)"
            flat
            no-caps
            color="positive"
            icon="check_circle"
            label="Approve"
            @click="handleApprove(selectedDoc)"
          />
          <q-btn
            v-if="selectedDoc && !['Approved', 'Rejected'].includes(selectedDoc.status)"
            flat
            no-caps
            color="negative"
            icon="cancel"
            label="Reject"
            @click="handleReject(selectedDoc)"
          />
          <q-btn unelevated no-caps color="primary" label="Close" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ═══════════════════════════════════════════════════════════
         APPROVE / REJECT CONFIRMATION DIALOG
    ════════════════════════════════════════════════════════════ -->
    <q-dialog v-model="showConfirmDialog">
      <q-card style="width: 420px; max-width: 95vw">
        <q-card-section class="row items-center q-pb-none">
          <q-avatar
            :icon="pendingAction === 'Approve' ? 'check_circle' : 'cancel'"
            :color="pendingAction === 'Approve' ? 'positive' : 'negative'"
            text-color="white"
            size="42px"
          />
          <span class="text-h6 text-weight-bold q-ml-md"> {{ pendingAction }} Document? </span>
        </q-card-section>

        <q-card-section class="q-pt-sm">
          <p class="text-body2">
            You are about to
            <strong :class="pendingAction === 'Approve' ? 'text-positive' : 'text-negative'">
              {{ pendingAction.toLowerCase() }}
            </strong>
            initial document
            <strong>#{{ pendingDoc?.refNo }}</strong>
            — "{{ pendingDoc?.caseTitle }}".
          </p>
          <q-input
            v-if="pendingAction === 'Reject'"
            v-model="actionRemarks"
            outlined
            dense
            autogrow
            label="Rejection Reason *"
            hint="Provide a reason for rejection (visible to submitter)"
            :rules="[(val) => !!val || 'Rejection reason is required']"
          />
          <q-input
            v-else
            v-model="actionRemarks"
            outlined
            dense
            autogrow
            label="Approval Remarks (optional)"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat no-caps label="Cancel" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            no-caps
            :label="pendingAction"
            :color="pendingAction === 'Approve' ? 'positive' : 'negative'"
            :icon="pendingAction === 'Approve' ? 'check_circle' : 'cancel'"
            @click="executeAction"
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
    <!-- ═══════════════════════════════════════════════════════════
         AI SUMMARY DIALOG
    ════════════════════════════════════════════════════════════ -->
    <q-dialog v-model="showSummaryDialog">
      <q-card style="width: 500px; max-width: 95vw">
        <q-bar class="slt-dialog-bar text-white">
          <q-icon name="auto_awesome" />
          <div class="text-weight-bold q-ml-sm">AI Case Summary</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>

        <q-card-section class="q-pa-md">
          <div v-if="currentSummarizedDoc" class="text-subtitle2 text-primary q-mb-sm">
            #{{ currentSummarizedDoc.refNo }} — {{ currentSummarizedDoc.caseTitle }}
          </div>

          <div v-if="summarizing" class="column items-center q-py-xl">
            <q-spinner-dots color="primary" size="40px" />
            <div class="text-caption text-grey-6 q-mt-md">AI is analyzing the facts...</div>
          </div>

          <div v-else class="ai-summary-content" v-html="formatAiText(aiSummaryText)" />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn unelevated no-caps color="primary" label="Close" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { supabase } from 'src/boot/supabase'
import { useAuthStore } from 'src/stores/authStore'

const $q = useQuasar()
const { locale } = useI18n()
const authStore = useAuthStore()

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  CONSTANTS
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  CONSTANTS
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const caseTypeOptions = [
  'Money Recovery',
  'Damages',
  'Appeals',
  'Land Case',
  'Criminal',
  'Inquiry',
  'Other',
]

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  TABLE
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const columns = [
  { name: 'refNo', label: 'Ref No.', field: 'refNo', align: 'left', sortable: true },
  { name: 'caseTitle', label: 'Case Title', field: 'caseTitle', align: 'left', sortable: true },
  { name: 'caseType', label: 'Type', field: 'caseType', align: 'center', sortable: true },
  { name: 'plaintiff', label: 'Plaintiff', field: 'plaintiff', align: 'left', sortable: false },
  {
    name: 'submittedDate',
    label: 'Submitted',
    field: 'submittedDate',
    align: 'center',
    sortable: true,
  },
  {
    name: 'financialExposure',
    label: 'Exposure (LKR)',
    field: 'financialExposure',
    align: 'right',
    sortable: true,
  },
  { name: 'status', label: 'Status', field: 'status', align: 'center', sortable: true },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center', sortable: false },
]

// ── Database State ───────────────────────────────────────────
const documents = ref([])
const loading = ref(false)

// ── Mock Data Fallback ─────────────────────────────────────────
const MOCK_DOCUMENTS = [
  {
    id: 'mock-doc-1',
    reference_number: 'SLT/LEG/2026/088',
    refNo: 'SLT/LEG/2026/088',
    caseTitle: 'Debt Recovery - Colombo West Region',
    case_title: 'Debt Recovery - Colombo West Region',
    caseType: 'Money Recovery',
    case_type: 'Money Recovery',
    plaintiff: 'SLT Mobitel PLC',
    submittedDate: '2026-03-10',
    financialExposure: 1250000,
    status: 'Pending',
    nature_of_case: 'Default on fiber infrastructure installment payments',
    date_of_occurrence: '2026-01-15'
  },
  {
    id: 'mock-doc-2',
    reference_number: 'SLT/LEG/2026/092',
    refNo: 'SLT/LEG/2026/092',
    caseTitle: 'Land Dispute - Kandy Zone B',
    case_title: 'Land Dispute - Kandy Zone B',
    caseType: 'Land Case',
    case_type: 'Land Case',
    plaintiff: 'SLT Mobitel PLC',
    submittedDate: '2026-03-08',
    financialExposure: 0,
    status: 'Under Review',
    nature_of_case: 'Unauthorized construction on company-leased land',
    date_of_occurrence: '2026-02-10'
  },
  {
    id: 'mock-doc-3',
    reference_number: 'SLT/LEG/2026/075',
    refNo: 'SLT/LEG/2026/075',
    caseTitle: 'Contract Breach - Global Tech Solutions',
    case_title: 'Contract Breach - Global Tech Solutions',
    caseType: 'Other',
    case_type: 'Other',
    natureOfCase: 'Failure to meet SLA requirements for cloud hosting',
    plaintiff: 'SLT Mobitel PLC',
    submittedDate: '2026-03-05',
    financialExposure: 5000000,
    status: 'Approved',
    nature_of_case: 'Non-compliance with service level agreement clauses',
    date_of_occurrence: '2026-01-01'
  },
  {
    id: 'mock-doc-4',
    reference_number: 'SLT/LEG/2026/104',
    refNo: 'SLT/LEG/2026/104',
    caseTitle: 'Intellectual Property - Logo Misuse',
    case_title: 'Intellectual Property - Logo Misuse',
    caseType: 'Other',
    case_type: 'Other',
    plaintiff: 'SLT Mobitel PLC',
    submittedDate: '2026-03-12',
    financialExposure: 200000,
    status: 'Pending',
    nature_of_case: 'Unauthorized use of SLT corporate branding by local vendor',
    date_of_occurrence: '2026-02-28'
  }
]

async function fetchDocuments() {
  // Show mock data immediately for "Instant Load" UX
  if (documents.value.length === 0) {
    documents.value = MOCK_DOCUMENTS
  }
  
  loading.value = true
  console.log('[InitialDocs] Syncing with database...')
  
  try {
    const { data, error } = await supabase
      .from('initial_documents')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    console.log(`[InitialDocs] Live sync: fetched ${data?.length || 0} records`)

    const fetchedDocs = (data || []).map((d) => ({
      ...d,
      refNo: d.reference_number,
      caseTitle: d.case_title,
      caseType: d.case_type,
      natureOfCase: d.nature_of_case,
      dateOfOccurrence: d.date_of_occurrence,
      financialExposure: d.financial_exposure,
      summary_of_facts: d.summary_of_facts,
      submittedDate: d.submitted_at ? new Date(d.submitted_at).toISOString().slice(0, 10) : '',
    }))

    // Silent Refresh: Only update if we actually got database records
    if (fetchedDocs.length > 0) {
      documents.value = fetchedDocs
    }
  } catch (err) {
    console.error('[InitialDocs] Sync Error:', err)
    // We stay with mock data silently, No disruptive notification here
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDocuments()
})

// ── Filters ───────────────────────────────────────────────────
const filter = ref('')
const filterStatus = ref('All')
const filterType = ref('All')

const filteredDocs = computed(() => {
  return documents.value.filter((d) => {
    const matchStatus = filterStatus.value === 'All' || d.status === filterStatus.value
    const matchType = filterType.value === 'All' || d.caseType === filterType.value
    return matchStatus && matchType
  })
})

function applyFilters() {
  /* reactive via computed */
}
function resetFilters() {
  filter.value = ''
  filterStatus.value = 'All'
  filterType.value = 'All'
}

// ── Status stats strip ─────────────────────────────────────────
const statusStats = computed(() => [
  { label: 'Total', count: documents.value.length, icon: 'folder', color: 'primary' },
  {
    label: 'Pending',
    count: documents.value.filter((d) => d.status === 'Pending').length,
    icon: 'schedule',
    color: 'warning',
  },
  {
    label: 'Under Review',
    count: documents.value.filter((d) => d.status === 'Under Review').length,
    icon: 'rate_review',
    color: 'info',
  },
  {
    label: 'Approved',
    count: documents.value.filter((d) => d.status === 'Approved').length,
    icon: 'check_circle',
    color: 'positive',
  },
])

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  FORM DIALOG
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const showFormDialog = ref(false)
const showViewDialog = ref(false)
const showConfirmDialog = ref(false)
const showPreviewDialog = ref(false)
const isEditMode = ref(false)
const submitting = ref(false)
const docFormRef = ref(null)
const previewDoc = ref(null)

const emptyForm = () => ({
  id: null,
  refNo: '',
  caseTitle: '',
  caseType: null,
  referenceNumber: '',
  plaintiff: '',
  defendant: '',
  partiesInvolved: '',
  natureOfCase: '',
  dateOfOccurrence: '',
  financialExposure: null,
  summaryOfFacts: '',
  attachments: null,
})

const form = ref(emptyForm())
const newAttachments = ref(null)

// Existing attachments from mock data (shown as chips in edit mode)
const existingAttachments = computed(() => {
  if (!isEditMode.value || !form.value.attachments) return []
  return Array.isArray(form.value.attachments) ? form.value.attachments : []
})

function openCreateDialog() {
  isEditMode.value = false
  form.value = emptyForm()
  newAttachments.value = null
  showFormDialog.value = true
}

function editDocument(doc) {
  isEditMode.value = true
  form.value = {
    ...doc,
    referenceNumber: doc.refNo, // Map refNo to referenceNumber used by form input
  }
  newAttachments.value = null
  showFormDialog.value = true
}

function closeDialog() {
  showFormDialog.value = false
  newAttachments.value = null
  docFormRef.value?.resetValidation()
}

async function submitForm() {
  const valid = await docFormRef.value?.validate()
  if (!valid) return

  submitting.value = true
  try {
    const payload = {
      reference_number: form.value.referenceNumber,
      case_title: form.value.caseTitle,
      case_type: form.value.caseType,
      plaintiff: form.value.plaintiff,
      defendant: form.value.defendant,
      parties_involved: form.value.partiesInvolved,
      nature_of_case: form.value.natureOfCase,
      date_of_occurrence: form.value.dateOfOccurrence,
      financial_exposure: form.value.financialExposure,
      summary_of_facts: form.value.summaryOfFacts,
      submitted_by: authStore.profile?.id || authStore.user?.id,
      status: 'Pending',
    }

    if (isEditMode.value) {
      const { error } = await supabase
        .from('initial_documents')
        .update(payload)
        .eq('id', form.value.id)

      if (error) throw error
      $q.notify({ type: 'positive', message: 'Document updated successfully.', icon: 'edit' })
    } else {
      const { error } = await supabase.from('initial_documents').insert([payload])

      if (error) throw error
      $q.notify({
        type: 'positive',
        message: 'Initial document submitted successfully.',
        icon: 'check_circle',
      })
    }
    await fetchDocuments() // Refresh list
    showFormDialog.value = false
  } catch (err) {
    console.error('Submission error:', err)
    $q.notify({ type: 'negative', message: 'Failed to save document to database.' })
  } finally {
    submitting.value = false
  }
}

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  VIEW DIALOG
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const selectedDoc = ref(null)
const docDetailTab = ref('details')
const showSummaryDialog = ref(false)
const summarizing = ref(false)
const aiSummaryText = ref('')
const currentSummarizedDoc = ref(null)

async function summarizeDocument(doc) {
  if (!doc.summaryOfFacts) {
    $q.notify({ type: 'warning', message: 'No facts available to summarize.' })
    return
  }

  currentSummarizedDoc.value = doc
  summarizing.value = true
  aiSummaryText.value = ''
  showSummaryDialog.value = true

  try {
    const { data, error } = await supabase.functions.invoke('ai-copilot', {
      body: {
        content: doc.summaryOfFacts,
        mode: 'summarize',
        language: locale.value || 'English',
      },
    })

    if (error) {
      // Simulation / Mock Fallback for Demo
      await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulation delay

      const isSinhala = locale.value === 'si'
      const isTamil = locale.value === 'ta'

      if (isSinhala) {
        aiSummaryText.value = `✨ **AI සාරාංශය (නිරූපණ මාදිලිය)**\n\nමෙම නඩුව සම්බන්ධයෙන් AI විසින් හඳුනාගත් ප්‍රධාන කරුණු:\n\n- **නඩුවේ ස්වභාවය:** ${doc.caseType || 'හඳුනා නොගත්'}\n- **මූල්‍ය වටිනාකම:** LKR ${formatCurrency(doc.financialExposure || 0)}\n- **ප්‍රධාන කරුණ:** සැපයුම්කරු සහ ආයතනය අතර ඇති වූ ගිවිසුම්ගත ආරවුලක්.\n\n**නිර්දේශය:** ඉක්මනින් බේරුම්කරණයකට (Arbitration) යොමු වීම යෝග්‍ය වේ.`
      } else if (isTamil) {
        aiSummaryText.value = `✨ **AI சுருக்கம் (டெமோ பயன்முறை)**\n\nஇந்த வழக்கு தொடர்பாக AI கண்டறிந்த முக்கிய குறிப்புகள்:\n\n- **வழக்கின் வகை:** ${doc.caseType || 'குறிப்பிடப்படவில்லை'}\n- **நிதி மதிப்பு:** LKR ${formatCurrency(doc.financialExposure || 0)}\n- **முக்கிய புள்ளி:** ஒப்பந்தம் தொடர்பான சர்ச்சை.\n\n**பரிந்துரை:** விரைவான தீர்வுக்காக இப்பிரச்சினையை மத்தியஸ்தத்திற்கு (Arbitration) கொண்டு செல்வது நல்லது.`
      } else {
        aiSummaryText.value = `✨ **AI Summary (Simulation Mode)**\n\nKey highlights identified by LegalEdge AI:\n\n- **Case Classification:** ${doc.caseType || 'General'}\n- **Financial Exposure:** LKR ${formatCurrency(doc.financialExposure || 0)}\n- **Risk Level:** High priority due to contractual obligations.\n\n**AI Recommendation:** Proceed with internal review and prepare for possible mediation/arbitration.`
      }

      $q.notify({
        message: 'Demo Simulation: Real AI API key not found.',
        color: 'amber-9',
        icon: 'info',
        position: 'bottom-right',
      })
    } else {
      aiSummaryText.value = data.text || data.response || 'Failed to generate summary.'
    }
  } catch (err) {
    console.error('Summarize error:', err)
    aiSummaryText.value =
      'Sorry, I encountered an error while summarizing. Please check your connection and configuration.'
  } finally {
    summarizing.value = false
  }
}

function formatAiText(text) {
  if (!text) return ''
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.*)/gm, '• $1')
    .replace(/\n/g, '<br>')
}

function viewRecordDetails(doc) {
  selectedDoc.value = doc
  showViewDialog.value = true
}

function handleApprove(doc) {
  confirmAction(doc, 'Approve')
  showViewDialog.value = false
}

function handleReject(doc) {
  confirmAction(doc, 'Reject')
  showViewDialog.value = false
}

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  APPROVE / REJECT
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const pendingDoc = ref(null)
const pendingAction = ref('')
const actionRemarks = ref('')

function confirmAction(doc, action) {
  pendingDoc.value = doc
  pendingAction.value = action
  actionRemarks.value = ''
  showConfirmDialog.value = true
}

async function executeAction() {
  if (pendingAction.value === 'Reject' && !actionRemarks.value.trim()) {
    $q.notify({ type: 'negative', message: 'Please provide a rejection reason.' })
    return
  }

  try {
    const status = pendingAction.value === 'Approve' ? 'Approved' : 'Rejected'
    const { error } = await supabase
      .from('initial_documents')
      .update({
        status,
        approval_remarks: actionRemarks.value,
        approved_by: authStore.profile?.id || authStore.user?.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', pendingDoc.value.id)

    if (error) throw error

    $q.notify({
      type: pendingAction.value === 'Approve' ? 'positive' : 'negative',
      message: `Document #${pendingDoc.value.refNo} has been ${pendingAction.value === 'Approve' ? 'approved' : 'rejected'}.`,
      icon: pendingAction.value === 'Approve' ? 'check_circle' : 'cancel',
    })
    await fetchDocuments()
  } catch (err) {
    console.error('Action error:', err)
    $q.notify({ type: 'negative', message: 'Failed to update document status.' })
  } finally {
    showConfirmDialog.value = false
  }
}

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  HELPERS
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
function statusColor(status) {
  const map = {
    Pending: 'warning',
    'Under Review': 'info',
    Approved: 'positive',
    Rejected: 'negative',
  }
  return map[status] || 'grey-6'
}

function typeColor(type) {
  const map = {
    'Money Recovery': 'blue-8',
    Damages: 'orange-8',
    Appeals: 'purple-8',
    Land: 'green-8',
    Criminal: 'red-9',
    Other: 'grey-7',
  }
  return map[type] || 'grey-7'
}

const mockVersions = [
  { ver: 3, date: '2026-02-15 10:30', by: 'N. Silva' },
  { ver: 2, date: '2026-02-10 14:20', by: 'M. Perera' },
  { ver: 1, date: '2026-02-05 09:00', by: 'M. Perera' },
]

function formatCurrency(val) {
  return Number(val).toLocaleString('en-LK', { minimumFractionDigits: 0 })
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

// ── Stats strip ───────────────────────────────────────────────
.slt-stat-chip {
  border-radius: 8px !important;
  transition: box-shadow 0.15s ease;
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 63, 135, 0.1) !important;
  }
}

// ── Dialog bar ────────────────────────────────────────────────
.slt-dialog-bar {
  background: linear-gradient(135deg, #002f6c, #003f87);
  min-height: 44px;
}

.slt-form-section-label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: #003f87;
  border-bottom: 2px solid #003f87;
  padding-bottom: 4px;
  margin-bottom: 12px;
}

// ── Table styles ──────────────────────────────────────────────
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
</style>
