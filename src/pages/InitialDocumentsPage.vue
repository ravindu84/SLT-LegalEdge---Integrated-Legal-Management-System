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

              <!-- Edit (only if Pending) -->
              <q-btn
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

              <!-- Approve -->
              <q-btn
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

              <!-- Reject -->
              <q-btn
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
            <div class="col-12 q-mb-md">
              <q-file
                v-model="form.attachments"
                outlined
                dense
                multiple
                label="Attach Supporting Documents"
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
          dense
          :class="$q.dark.isActive ? 'bg-dark' : 'bg-blue-1'"
          active-color="primary"
          indicator-color="primary"
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
              <div class="col-12 col-sm-6 q-py-xs">
                <div class="text-caption text-grey-6 row items-center">
                  <q-icon name="tag" size="14px" class="q-mr-xs" />Reference No.
                </div>
                <div class="text-body2 text-weight-medium truncate">#{{ selectedDoc.refNo }}</div>
              </div>
              <div class="col-12 col-sm-6 q-py-xs">
                <div class="text-caption text-grey-6 row items-center">
                  <q-icon name="title" size="14px" class="q-mr-xs" />Case Title
                </div>
                <div class="text-body2 text-weight-medium truncate">
                  {{ selectedDoc.caseTitle }}
                </div>
              </div>
              <div class="col-12 col-sm-6 q-py-xs">
                <div class="text-caption text-grey-6 row items-center">
                  <q-icon name="category" size="14px" class="q-mr-xs" />Case Type
                </div>
                <div class="text-body2 text-weight-medium truncate">{{ selectedDoc.caseType }}</div>
              </div>
              <div class="col-12 col-sm-6 q-py-xs">
                <div class="text-caption text-grey-6 row items-center">
                  <q-icon name="info" size="14px" class="q-mr-xs" />Status
                </div>
                <div class="text-body2 text-weight-medium truncate">{{ selectedDoc.status }}</div>
              </div>
              <div class="col-12 col-sm-6 q-py-xs">
                <div class="text-caption text-grey-6 row items-center">
                  <q-icon name="person" size="14px" class="q-mr-xs" />Plaintiff
                </div>
                <div class="text-body2 text-weight-medium truncate">
                  {{ selectedDoc.plaintiff }}
                </div>
              </div>
              <div class="col-12 col-sm-6 q-py-xs">
                <div class="text-caption text-grey-6 row items-center">
                  <q-icon name="person_off" size="14px" class="q-mr-xs" />Defendant
                </div>
                <div class="text-body2 text-weight-medium truncate">
                  {{ selectedDoc.defendant }}
                </div>
              </div>
              <div class="col-12 col-sm-6 q-py-xs">
                <div class="text-caption text-grey-6 row items-center">
                  <q-icon name="event" size="14px" class="q-mr-xs" />Date of Occurrence
                </div>
                <div class="text-body2 text-weight-medium truncate">
                  {{ selectedDoc.dateOfOccurrence || '—' }}
                </div>
              </div>
              <div class="col-12 col-sm-6 q-py-xs">
                <div class="text-caption text-grey-6 row items-center">
                  <q-icon name="payments" size="14px" class="q-mr-xs" />Financial Exposure
                </div>
                <div class="text-body2 text-weight-medium truncate">
                  {{
                    selectedDoc.financialExposure
                      ? `LKR ${formatCurrency(selectedDoc.financialExposure)}`
                      : '—'
                  }}
                </div>
              </div>
              <div class="col-12 q-py-xs">
                <div class="text-caption text-grey-6 row items-center">
                  <q-icon name="gavel" size="14px" class="q-mr-xs" />Nature of Case
                </div>
                <div class="text-body2 text-weight-medium truncate">
                  {{ selectedDoc.natureOfCase || '—' }}
                </div>
              </div>
              <div class="col-12 q-py-xs">
                <div class="text-caption text-grey-6 row items-center">
                  <q-icon name="notes" size="14px" class="q-mr-xs" />Summary of Facts
                </div>
                <div class="text-body2 text-weight-medium truncate">
                  {{ selectedDoc.summaryOfFacts || '—' }}
                </div>
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
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  CONSTANTS
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  CONSTANTS
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const caseTypeOptions = ['Money Recovery', 'Damages', 'Appeals', 'Land', 'Criminal', 'Other']

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

// ── Mock dataset ──────────────────────────────────────────────
const documents = ref([
  {
    id: 1,
    refNo: 'SLT/LEG/2026/001',
    caseTitle: 'Recovery of Outstanding Payments – Netwin Pvt Ltd',
    caseType: 'Money Recovery',
    plaintiff: 'SLT Mobitel PLC',
    defendant: 'Netwin Pvt Ltd',
    partiesInvolved: '',
    natureOfCase: 'Unpaid dues for leased circuit charges spanning 18 months.',
    dateOfOccurrence: '2025-06-01',
    financialExposure: 4500000,
    summaryOfFacts:
      'SLT Mobitel initiated recovery proceedings against Netwin Pvt Ltd for outstanding leased-circuit charges amounting to LKR 4.5M.',
    submittedDate: '2026-01-15',
    status: 'Pending',
    attachments: [
      { name: 'Unpaid_Invoices_Bundle.pdf', type: 'pdf', size: '2.4 MB', date: '2026-01-15' },
      { name: 'Lease_Agreement_Scan.pdf', type: 'pdf', size: '1.1 MB', date: '2026-01-15' },
      { name: 'Arrears_Calculation.xlsx', type: 'xlsx', size: '32 KB', date: '2026-01-15' },
    ],
  },
  {
    id: 2,
    refNo: 'SLT/LEG/2026/002',
    caseTitle: 'Land Acquisition Dispute – Kandy Exchange Site',
    caseType: 'Land',
    plaintiff: 'SLT Mobitel PLC',
    defendant: 'Kandy Municipal Council',
    partiesInvolved: 'Urban Development Authority',
    natureOfCase: 'Encroachment on SLT registered land parcel.',
    dateOfOccurrence: '2025-09-12',
    financialExposure: 12000000,
    summaryOfFacts:
      'Portion of the Kandy Exchange land was encroached upon during urban development activities without prior notice to SLT.',
    submittedDate: '2026-01-22',
    status: 'Under Review',
    attachments: [
      { name: 'Survey_Plan_Kandy.jpg', type: 'jpg', size: '1.8 MB', date: '2026-01-22' },
      { name: 'Land_Registry_Extract.pdf', type: 'pdf', size: '890 KB', date: '2026-01-22' },
    ],
  },
  {
    id: 3,
    refNo: 'SLT/LEG/2026/003',
    caseTitle: 'Damages Claim – Fiber Cut by Contractor',
    caseType: 'Damages',
    plaintiff: 'SLT Mobitel PLC',
    defendant: 'Gamage Constructions',
    partiesInvolved: '',
    natureOfCase: 'Negligent excavation causing fiber cable damage.',
    dateOfOccurrence: '2025-11-03',
    financialExposure: 870000,
    summaryOfFacts:
      'During road widening, contractor cut 600m of SLT Fiber backbone cable resulting in service disruption for 4,200 customers.',
    submittedDate: '2026-02-01',
    status: 'Approved',
    attachments: [
      { name: 'Incident_Report_Southern.pdf', type: 'pdf', size: '560 KB', date: '2026-02-01' },
      { name: 'Repair_Estimate_v2.xlsx', type: 'xlsx', size: '24 KB', date: '2026-02-01' },
    ],
  },
  {
    id: 4,
    refNo: 'SLT/LEG/2026/004',
    caseTitle: 'Criminal Complaint – Telecom Fraud',
    caseType: 'Criminal',
    plaintiff: 'SLT Mobitel PLC',
    defendant: 'Unknown Parties',
    partiesInvolved: 'CID Sri Lanka',
    natureOfCase: 'SIM-swap fraud causing financial loss.',
    dateOfOccurrence: '2025-12-20',
    financialExposure: 0,
    summaryOfFacts:
      'Fraudulent SIM swaps detected on 14 corporate accounts. Complaint filed with CID for investigation.',
    submittedDate: '2026-02-10',
    status: 'Pending',
    attachments: null,
  },
  {
    id: 5,
    refNo: 'SLT/LEG/2026/005',
    caseTitle: 'Appeal Against Labour Tribunal Award',
    caseType: 'Appeals',
    plaintiff: 'SLT Mobitel PLC',
    defendant: 'Former Employee K.A. Perera',
    partiesInvolved: '',
    natureOfCase: 'Appeal against compensation awarded by Labour Tribunal.',
    dateOfOccurrence: '2025-08-30',
    financialExposure: 2300000,
    summaryOfFacts:
      'Labour Tribunal awarded LKR 2.3M to former employee. SLT is appealing on grounds of procedural error and new evidence.',
    submittedDate: '2026-02-14',
    status: 'Rejected',
    attachments: null,
  },
])

// ── Filters ───────────────────────────────────────────────────
const filter = ref('')
const filterStatus = ref('All')
const filterType = ref('All')
const loading = ref(false)

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

function openCreateDialog() {
  isEditMode.value = false
  form.value = emptyForm()
  showFormDialog.value = true
}

function editDocument(doc) {
  isEditMode.value = true
  form.value = {
    ...doc,
    referenceNumber: doc.refNo, // Map refNo to referenceNumber used by form input
  }
  showFormDialog.value = true
}

function closeDialog() {
  showFormDialog.value = false
  docFormRef.value?.resetValidation()
}

async function submitForm() {
  const valid = await docFormRef.value?.validate()
  if (!valid) return

  submitting.value = true
  // Simulate async API call
  await new Promise((r) => setTimeout(r, 800))

  if (isEditMode.value) {
    const idx = documents.value.findIndex((d) => d.id === form.value.id)
    if (idx !== -1) documents.value[idx] = { ...form.value }
    $q.notify({ type: 'positive', message: 'Document updated successfully.', icon: 'edit' })
  } else {
    const newDoc = {
      ...form.value,
      id: Date.now(),
      refNo: form.value.referenceNumber,
      submittedDate: new Date().toISOString().slice(0, 10),
      status: 'Pending',
    }
    documents.value.unshift(newDoc)
    $q.notify({
      type: 'positive',
      message: 'Initial document submitted successfully.',
      icon: 'check_circle',
    })
  }

  submitting.value = false
  showFormDialog.value = false
}

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  VIEW DIALOG
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const selectedDoc = ref(null)
const docDetailTab = ref('details')

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

function executeAction() {
  if (pendingAction.value === 'Reject' && !actionRemarks.value.trim()) {
    $q.notify({ type: 'negative', message: 'Please provide a rejection reason.' })
    return
  }
  const idx = documents.value.findIndex((d) => d.id === pendingDoc.value.id)
  if (idx !== -1) {
    documents.value[idx].status = pendingAction.value === 'Approve' ? 'Approved' : 'Rejected'
  }
  $q.notify({
    type: pendingAction.value === 'Approve' ? 'positive' : 'negative',
    message: `Document #${pendingDoc.value.refNo} has been ${pendingAction.value === 'Approve' ? 'approved' : 'rejected'}.`,
    icon: pendingAction.value === 'Approve' ? 'check_circle' : 'cancel',
  })
  showConfirmDialog.value = false
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

// ── Form section label ────────────────────────────────────────
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
