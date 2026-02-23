<template>
  <q-page class="q-pa-md slt-page-bg">
    <!-- ─── Page Header ──────────────────────────────────────────── -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-weight-bold text-primary">
          <q-icon name="task_alt" size="28px" class="q-mr-sm" />
          {{ $t('approvals.title') }}
        </div>
        <div class="text-caption text-grey-6">
          Logged in as: <strong>K. Fernando, AGM – Legal</strong> &nbsp;·&nbsp; Items requiring your
          action are listed below
        </div>
      </div>
      <div class="col-auto">
        <q-btn
          outline
          color="primary"
          icon="refresh"
          label="Refresh"
          size="sm"
          no-caps
          @click="refreshInbox"
          :loading="refreshing"
        />
      </div>
    </div>

    <!-- ─── Summary KPI Cards ────────────────────────────────────── -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-6 col-sm-3" v-for="kpi in kpiCards" :key="kpi.label">
        <q-card flat bordered class="slt-kpi-card">
          <q-card-section class="row items-center no-wrap q-pa-sm">
            <q-avatar :color="kpi.bg" size="42px">
              <q-icon :name="kpi.icon" :color="kpi.color" size="22px" />
            </q-avatar>
            <div class="q-ml-sm">
              <div class="text-h5 text-weight-bold" :class="`text-${kpi.color}`">
                {{ kpi.count }}
              </div>
              <div class="text-caption text-grey-6 ellipsis" style="max-width: 110px">
                {{ kpi.label }}
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- ─── Tabbed Inbox ─────────────────────────────────────────── -->
    <q-card flat bordered>
      <!-- Tab Headers -->
      <q-tabs
        v-model="activeTab"
        align="left"
        indicator-color="accent"
        active-color="primary"
        class="border-bottom"
        :class="$q.dark.isActive ? 'bg-dark' : 'bg-grey-1'"
        dense
      >
        <q-tab name="agreements" no-caps>
          <div class="row items-center q-gutter-xs">
            <q-icon name="handshake" size="18px" />
            <span>Pending Agreements</span>
            <q-badge v-if="pendingAgreements.length" color="warning" rounded floating>
              {{ pendingAgreements.length }}
            </q-badge>
          </div>
        </q-tab>

        <q-tab name="initial_docs" no-caps>
          <div class="row items-center q-gutter-xs">
            <q-icon name="description" size="18px" />
            <span>Pending Initial Docs</span>
            <q-badge v-if="pendingDocs.length" color="orange" rounded floating>
              {{ pendingDocs.length }}
            </q-badge>
          </div>
        </q-tab>

        <q-tab name="history" no-caps>
          <div class="row items-center q-gutter-xs">
            <q-icon name="history" size="18px" />
            <span>My Actions History</span>
          </div>
        </q-tab>
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="activeTab" animated>
        <!-- ╔══════════════════════════════════════════════════════
             TAB 1 — PENDING AGREEMENTS
        ═══════════════════════════════════════════════════════╗ -->
        <q-tab-panel name="agreements" class="q-pa-none">
          <!-- Empty state -->
          <div v-if="!pendingAgreements.length" class="column flex-center text-grey-5 q-py-xl">
            <q-icon name="inbox" size="56px" />
            <div class="q-mt-sm text-body2">No agreements pending your approval.</div>
          </div>

          <q-table
            v-else
            :rows="pendingAgreements"
            :columns="agrmCols"
            row-key="id"
            flat
            class="slt-table"
            :pagination="{ rowsPerPage: 8 }"
          >
            <!-- Title cell -->
            <template #body-cell-title="props">
              <q-td :props="props">
                <div
                  class="text-weight-bold"
                  :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                >
                  {{ props.value }}
                </div>
                <div class="text-caption text-grey-5">{{ props.row.agreementType }}</div>
              </q-td>
            </template>

            <!-- Value cell -->
            <template #body-cell-value="props">
              <q-td :props="props" class="text-right">
                <span v-if="props.value" class="text-weight-medium">
                  LKR {{ fmt(props.value) }}
                </span>
                <span v-else class="text-grey-4">—</span>
              </q-td>
            </template>

            <!-- Stage badge -->
            <template #body-cell-status="props">
              <q-td :props="props" class="text-center">
                <q-badge
                  rounded
                  :color="props.value === 'Pending L1 Approval' ? 'warning' : 'orange-8'"
                  :label="props.value"
                  class="text-weight-medium"
                />
              </q-td>
            </template>

            <!-- Age cell -->
            <template #body-cell-daysPending="props">
              <q-td :props="props" class="text-center">
                <span :class="props.value > 7 ? 'text-negative text-weight-bold' : 'text-grey-7'">
                  <q-icon v-if="props.value > 7" name="warning" size="13px" class="q-mr-xs" />
                  {{ props.value }}d
                </span>
              </q-td>
            </template>

            <!-- Actions -->
            <template #body-cell-actions="props">
              <q-td :props="props" class="text-center">
                <div class="row justify-center no-wrap q-gutter-xs">
                  <q-btn
                    flat
                    round
                    dense
                    icon="visibility"
                    color="primary"
                    size="sm"
                    @click="viewItem(props.row, 'agreement')"
                  >
                    <q-tooltip>View Details</q-tooltip>
                  </q-btn>
                  <q-btn
                    unelevated
                    dense
                    color="positive"
                    icon="check_circle"
                    :label="
                      props.row.status === 'Pending L1 Approval' ? 'L1 Approve' : 'L2 Final Approve'
                    "
                    size="sm"
                    no-caps
                    class="q-px-sm"
                    @click="openAction(props.row, 'approve', 'agreement')"
                  />
                  <q-btn
                    unelevated
                    dense
                    color="negative"
                    icon="cancel"
                    label="Reject"
                    size="sm"
                    no-caps
                    class="q-px-sm"
                    @click="openAction(props.row, 'reject', 'agreement')"
                  />
                </div>
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>

        <!-- ╔══════════════════════════════════════════════════════
             TAB 2 — PENDING INITIAL DOCUMENTS
        ═══════════════════════════════════════════════════════╗ -->
        <q-tab-panel name="initial_docs" class="q-pa-none">
          <div v-if="!pendingDocs.length" class="column flex-center text-grey-5 q-py-xl">
            <q-icon name="inbox" size="56px" />
            <div class="q-mt-sm text-body2">No initial documents pending your approval.</div>
          </div>

          <q-table
            v-else
            :rows="pendingDocs"
            :columns="docCols"
            row-key="id"
            flat
            class="slt-table"
            :pagination="{ rowsPerPage: 8 }"
          >
            <!-- Title cell -->
            <template #body-cell-title="props">
              <q-td :props="props">
                <div
                  class="text-weight-bold"
                  :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                >
                  {{ props.value }}
                </div>
                <div class="text-caption text-grey-5">{{ props.row.caseType }}</div>
              </q-td>
            </template>

            <!-- Status badge -->
            <template #body-cell-status="props">
              <q-td :props="props" class="text-center">
                <q-badge rounded color="orange" :label="props.value" class="text-weight-medium" />
              </q-td>
            </template>

            <!-- Exposure -->
            <template #body-cell-financialExposure="props">
              <q-td :props="props" class="text-right">
                <span class="text-weight-medium">LKR {{ fmt(props.value) }}</span>
              </q-td>
            </template>

            <!-- Age cell -->
            <template #body-cell-daysPending="props">
              <q-td :props="props" class="text-center">
                <span :class="props.value > 5 ? 'text-negative text-weight-bold' : 'text-grey-7'">
                  <q-icon v-if="props.value > 5" name="warning" size="13px" class="q-mr-xs" />
                  {{ props.value }}d
                </span>
              </q-td>
            </template>

            <!-- Actions -->
            <template #body-cell-actions="props">
              <q-td :props="props" class="text-center">
                <div class="row justify-center no-wrap q-gutter-xs">
                  <q-btn
                    flat
                    round
                    dense
                    icon="visibility"
                    color="primary"
                    size="sm"
                    @click="viewItem(props.row, 'doc')"
                  >
                    <q-tooltip>View Details</q-tooltip>
                  </q-btn>
                  <q-btn
                    unelevated
                    dense
                    color="positive"
                    icon="check"
                    label="Approve"
                    size="sm"
                    no-caps
                    class="q-px-sm"
                    @click="openAction(props.row, 'approve', 'doc')"
                  />
                  <q-btn
                    unelevated
                    dense
                    color="negative"
                    icon="cancel"
                    label="Reject"
                    size="sm"
                    no-caps
                    class="q-px-sm"
                    @click="openAction(props.row, 'reject', 'doc')"
                  />
                </div>
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>

        <!-- ╔══════════════════════════════════════════════════════
             TAB 3 — MY ACTIONS HISTORY
        ═══════════════════════════════════════════════════════╗ -->
        <q-tab-panel name="history" class="q-pa-md">
          <div v-if="!actionHistory.length" class="column flex-center text-grey-5 q-py-xl">
            <q-icon name="history" size="48px" />
            <div class="q-mt-sm">No actions taken yet this session.</div>
          </div>

          <q-timeline color="primary" layout="comfortable" v-else>
            <q-timeline-entry
              v-for="(h, i) in [...actionHistory].reverse()"
              :key="i"
              :color="h.action === 'Rejected' ? 'negative' : 'positive'"
              :icon="h.action === 'Rejected' ? 'cancel' : 'check_circle'"
              :subtitle="h.at"
            >
              <template #title>
                <span class="text-weight-bold">{{ h.action }}</span>
                <q-badge
                  class="q-ml-sm"
                  :color="h.itemType === 'agreement' ? 'primary' : 'orange'"
                  :label="h.itemType === 'agreement' ? 'Agreement' : 'Initial Doc'"
                  rounded
                />
              </template>
              <div class="text-body2 text-grey-8">{{ h.title }}</div>
              <div class="text-caption text-grey-5 q-mt-xs" v-if="h.remarks">
                Remarks: "{{ h.remarks }}"
              </div>
            </q-timeline-entry>
          </q-timeline>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <!-- ═══════════════════════════════════════════════════════════
         APPROVE / REJECT CONFIRMATION DIALOG
    ════════════════════════════════════════════════════════════ -->
    <q-dialog v-model="showActionDialog" persistent>
      <q-card style="width: 480px; max-width: 95vw">
        <!-- Header bar -->
        <q-bar :class="actionType === 'approve' ? 'bg-positive' : 'bg-negative'" class="text-white">
          <q-icon :name="actionType === 'approve' ? 'check_circle' : 'cancel'" />
          <div class="text-weight-bold q-ml-sm">
            {{ actionType === 'approve' ? approveLabel : 'Reject' }}
          </div>
          <q-space />
          <q-btn dense flat icon="close" @click="showActionDialog = false" />
        </q-bar>

        <q-card-section class="q-pt-md">
          <!-- Item summary card -->
          <q-card
            flat
            bordered
            class="q-mb-md"
            :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-1'"
          >
            <q-card-section class="q-pa-sm">
              <div class="row items-center q-gutter-sm">
                <q-icon
                  :name="activeItemType === 'agreement' ? 'handshake' : 'description'"
                  color="primary"
                  size="20px"
                />
                <div class="col">
                  <div
                    class="text-weight-bold ellipsis"
                    :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                  >
                    {{ actionItem?.title }}
                  </div>
                  <div class="text-caption text-grey-5">
                    {{
                      activeItemType === 'agreement'
                        ? actionItem?.agreementType
                        : actionItem?.caseType
                    }}
                    &nbsp;·&nbsp;
                    <q-badge
                      rounded
                      :color="actionItem?.status?.includes('L1') ? 'warning' : 'orange-8'"
                      :label="actionItem?.status"
                    />
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Remarks field -->
          <q-input
            v-model="actionRemarks"
            outlined
            autogrow
            label="Remarks / Comments *"
            hint="Mandatory — will be recorded in approval history and visible to submitter"
            :color="actionType === 'approve' ? 'positive' : 'negative'"
            :rules="[(v) => !!v?.trim() || 'Remarks are required before proceeding']"
            ref="remarksRef"
          />
        </q-card-section>

        <q-separator />
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat no-caps label="Cancel" color="grey-7" @click="showActionDialog = false" />
          <q-btn
            unelevated
            no-caps
            :color="actionType === 'approve' ? 'positive' : 'negative'"
            :icon="actionType === 'approve' ? 'check_circle' : 'cancel'"
            :label="actionType === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'"
            :loading="processing"
            @click="confirmAction"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ═══════════════════════════════════════════════════════════
         VIEW ITEM DETAIL DIALOG
    ════════════════════════════════════════════════════════════ -->
    <q-dialog v-model="showViewDialog">
      <q-card v-if="viewingItem" style="width: 600px; max-width: 95vw">
        <q-bar class="slt-dialog-bar text-white">
          <q-icon :name="viewingItemType === 'agreement' ? 'handshake' : 'description'" />
          <div class="text-weight-bold q-ml-sm col ellipsis">{{ viewingItem.title }}</div>
          <q-btn dense flat icon="close" @click="showViewDialog = false" />
        </q-bar>

        <q-card-section class="q-pa-md">
          <div class="row q-col-gutter-md">
            <!-- Agreement fields -->
            <template v-if="viewingItemType === 'agreement'">
              <div class="col-12 col-sm-6">
                <ViewRow icon="tag" label="Reference" :value="viewingItem.referenceNo" />
                <ViewRow icon="category" label="Type" :value="viewingItem.agreementType" />
                <ViewRow icon="person" label="Party 1" :value="viewingItem.party1" />
                <ViewRow icon="people" label="Party 2" :value="viewingItem.party2" />
              </div>
              <div class="col-12 col-sm-6">
                <ViewRow
                  icon="payments"
                  label="Value"
                  :value="`LKR ${fmt(viewingItem.value || 0)}`"
                />
                <ViewRow icon="event" label="Start" :value="viewingItem.startDate" />
                <ViewRow icon="event_busy" label="Expiry" :value="viewingItem.expiryDate" />
                <ViewRow icon="info" label="Stage" :value="viewingItem.status" />
              </div>
              <div class="col-12">
                <div class="text-caption text-grey-5 q-mb-xs">Description</div>
                <p class="text-body2 text-grey-8 q-mb-none">{{ viewingItem.description }}</p>
              </div>
            </template>

            <!-- Initial Doc fields -->
            <template v-else>
              <div class="col-12 col-sm-6">
                <ViewRow icon="tag" label="Reference" :value="viewingItem.referenceNo" />
                <ViewRow icon="category" label="Case Type" :value="viewingItem.caseType" />
                <ViewRow icon="people" label="Parties" :value="viewingItem.parties" />
                <ViewRow icon="event" label="Date Filed" :value="viewingItem.submittedDate" />
              </div>
              <div class="col-12 col-sm-6">
                <ViewRow
                  icon="payments"
                  label="Exposure"
                  :value="`LKR ${fmt(viewingItem.financialExposure)}`"
                />
                <ViewRow icon="gavel" label="Court" :value="viewingItem.court" />
                <ViewRow icon="info" label="Status" :value="viewingItem.status" />
              </div>
              <div class="col-12">
                <div class="text-caption text-grey-5 q-mb-xs">Summary of Facts</div>
                <p class="text-body2 text-grey-8 q-mb-none">{{ viewingItem.summaryOfFacts }}</p>
              </div>
            </template>

            <!-- Shared Attachments Section -->
            <div class="col-12 q-mt-md">
              <div class="text-subtitle2 text-primary q-mb-sm">Relevant Attachments</div>
              <q-list bordered separator padding class="rounded-borders bg-white">
                <q-item
                  v-for="(doc, idx) in viewingItem.docs || viewingItem.attachments"
                  :key="idx"
                  dense
                >
                  <q-item-section avatar>
                    <q-icon :name="docIcon(doc.type)" :color="docColor(doc.type)" size="20px" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-bold text-body2">{{ doc.name }}</q-item-label>
                    <q-item-label caption
                      >{{ doc.type.toUpperCase() }} · {{ doc.size }}</q-item-label
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
                <q-item v-if="!(viewingItem.docs || viewingItem.attachments)?.length">
                  <q-item-section class="text-grey-5 text-center text-caption q-py-sm">
                    No attachments available for this item.
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </q-card-section>

        <q-separator />
        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            unelevated
            no-caps
            color="positive"
            icon="check_circle"
            :label="viewingItemType === 'agreement' ? approveLabel : 'Approve Document'"
            @click="handleOpenAction(viewingItem, 'approve', viewingItemType)"
          />
          <q-btn
            unelevated
            no-caps
            color="negative"
            icon="cancel"
            label="Reject"
            @click="handleOpenAction(viewingItem, 'reject', viewingItemType)"
          />
          <q-btn flat no-caps label="Close" color="grey-7" @click="showViewDialog = false" />
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
//  INLINE COMPONENT
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const ViewRow = {
  props: { label: String, value: String, icon: String },
  template: `
    <div class="row items-start q-py-xs" style="border-bottom:1px solid #eef2f8">
      <div class="col-5 row items-center text-caption text-grey-5">
        <q-icon :name="icon" size="13px" class="q-mr-xs"/>{{ label }}
      </div>
      <div class="col-7 text-body2 text-weight-medium text-grey-9">{{ value || '—' }}</div>
    </div>
  `,
}

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  MOCK DATA — PENDING AGREEMENTS  (L1 & L2 stage)
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const pendingAgreements = ref([
  {
    id: 101,
    title: 'Software Licensing Agreement – Oracle',
    agreementType: 'Vendor Agreement',
    referenceNo: 'AGR/SLT/2026/003',
    party1: 'SLT Mobitel PLC – IT Department',
    party2: 'Oracle Corporation Lanka (Pvt) Ltd',
    value: 34000000,
    startDate: '2026-02-01',
    expiryDate: '2029-01-31',
    status: 'Pending L1 Approval',
    daysPending: 12,
    submittedBy: 'T. Gunathilaka',
    description:
      '3-year Oracle Database Enterprise Edition licensing and support for SLT core billing systems.',
    docs: [
      { name: 'Oracle-License-Agreement.pdf', type: 'pdf', size: '4.2 MB' },
      { name: 'IT_Infrastructure_Certificate.pdf', type: 'pdf', size: '1.2 MB' },
    ],
  },
  {
    id: 102,
    title: 'Data Centre Co-location MOU – Virtusa',
    agreementType: 'MOU',
    referenceNo: 'AGR/SLT/2026/002',
    party1: 'SLT Mobitel PLC – ICT Division',
    party2: 'Virtusa Corporation',
    value: 6200000,
    startDate: '2026-03-01',
    expiryDate: '2027-02-28',
    status: 'Pending L2 Approval',
    daysPending: 5,
    submittedBy: 'A. Ranasinghe',
    description:
      'Co-location of Virtusa development servers at SLT Welikade data centre with managed connectivity.',
    docs: [
      { name: 'Virtusa_MOU_Draft_Final.pdf', type: 'pdf', size: '1.4 MB' },
      { name: 'Commercial_Terms_Matrix.xlsx', type: 'xlsx', size: '42 KB' },
    ],
  },
  {
    id: 103,
    title: 'Cybersecurity Managed Services – SecureCo',
    agreementType: 'Service Level Agreement',
    referenceNo: 'AGR/SLT/2026/007',
    party1: 'SLT Mobitel PLC – IT Security',
    party2: 'SecureCo Lanka (Pvt) Ltd',
    value: 9500000,
    startDate: '2026-04-01',
    expiryDate: '2027-03-31',
    status: 'Pending L1 Approval',
    daysPending: 3,
    submittedBy: 'R. Kulathunga',
    description:
      'Annual managed SOC and threat monitoring services for SLT enterprise network boundary.',
  },
  {
    id: 104,
    title: 'Fleet Vehicle Maintenance Contract – AutoCare',
    agreementType: 'Maintenance Contract',
    referenceNo: 'AGR/SLT/2026/008',
    party1: 'SLT Mobitel PLC – Administration',
    party2: 'AutoCare Services Ltd',
    value: 3400000,
    startDate: '2026-03-01',
    expiryDate: '2027-02-28',
    status: 'Pending L2 Approval',
    daysPending: 9,
    submittedBy: 'D. Wijesinghe',
    description:
      'Full preventive and corrective maintenance of 45 SLT fleet vehicles including trucks and vans.',
  },
])

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  MOCK DATA — PENDING INITIAL DOCUMENTS
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const pendingDocs = ref([
  {
    id: 201,
    title: 'Recovery Suit – Netsync Solutions',
    caseType: 'Money Recovery',
    referenceNo: 'ID/SLT/2026/014',
    parties: 'SLT Mobitel PLC vs. Netsync Solutions (Pvt) Ltd',
    submittedDate: '2026-02-10',
    submittedBy: 'P. Jayawardena',
    financialExposure: 2750000,
    court: 'Magistrate Court, Colombo',
    status: 'Pending',
    daysPending: 8,
    summaryOfFacts:
      'SLT seeks recovery of LKR 2.75M in unpaid co-location charges from Netsync Solutions accumulated over 14 months.',
    attachments: [
      { name: 'Arrears_Notice_03.pdf', type: 'pdf', size: '240 KB' },
      { name: 'Billing_Summary_2025.xlsx', type: 'xlsx', size: '120 KB' },
    ],
  },
  {
    id: 202,
    title: 'Encroachment Claim – Galle Road Tower Site',
    caseType: 'Land Case',
    referenceNo: 'ID/SLT/2026/015',
    parties: 'SLT Mobitel PLC vs. Urban Infrastructure Authority',
    submittedDate: '2026-02-14',
    submittedBy: 'N. Silva',
    financialExposure: 18000000,
    court: 'District Court, Colombo',
    status: 'Pending',
    daysPending: 4,
    summaryOfFacts:
      'The Urban Infrastructure Authority initiated road widening that encroaches on an SLT tower compound at 122 Galle Road without prior notice or compensation.',
  },
  {
    id: 203,
    title: 'Ex-Employee Damages Claim – W.M.D. Priya',
    caseType: 'Employee Dispute',
    referenceNo: 'ID/SLT/2026/016',
    parties: 'W.M.D. Priya vs. SLT Mobitel PLC',
    submittedDate: '2026-02-18',
    submittedBy: 'S. Dissanayake',
    financialExposure: 1200000,
    court: 'Labour Tribunal, Kandy',
    status: 'Pending',
    daysPending: 2,
    summaryOfFacts:
      'Former employee W.M.D. Priya claims wrongful termination and seeks LKR 1.2M in damages. SLT legal submitted initial documents for review.',
  },
  {
    id: 204,
    title: 'Fiber Cable Damage Claim – Greenfield Dev.',
    caseType: 'Damages',
    referenceNo: 'ID/SLT/2026/017',
    parties: 'SLT Mobitel PLC vs. Greenfield Developers Ltd',
    submittedDate: '2026-02-19',
    submittedBy: 'M. Perera',
    financialExposure: 540000,
    court: 'Galle Magistrate Court',
    status: 'Pending',
    daysPending: 1,
    summaryOfFacts:
      'Greenfield Developers damaged 400m of SLT underground fiber during excavation on the Matara bypass, causing a 6-hour outage affecting 800+ subscribers.',
  },
])

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  KPI CARDS
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const kpiCards = computed(() => [
  {
    label: 'Total Pending',
    count: pendingAgreements.value.length + pendingDocs.value.length,
    icon: 'inbox',
    color: 'primary',
    bg: 'blue-1',
  },
  {
    label: 'Pending Agreements',
    count: pendingAgreements.value.length,
    icon: 'handshake',
    color: 'warning',
    bg: 'orange-1',
  },
  {
    label: 'L1 Approval Required',
    count: pendingAgreements.value.filter((a) => a.status === 'Pending L1 Approval').length,
    icon: 'approval',
    color: 'info',
    bg: 'blue-1',
  },
  {
    label: 'Pending Initial Docs',
    count: pendingDocs.value.length,
    icon: 'description',
    color: 'orange',
    bg: 'orange-1',
  },
])

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  TABLE COLUMNS
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const agrmCols = [
  { name: 'title', label: 'Agreement Title', field: 'title', align: 'left', sortable: true },
  { name: 'party2', label: 'Vendor / Party', field: 'party2', align: 'left', sortable: true },
  { name: 'value', label: 'Value (LKR)', field: 'value', align: 'right', sortable: true },
  { name: 'status', label: 'Stage', field: 'status', align: 'center', sortable: true },
  {
    name: 'submittedBy',
    label: 'Submitted By',
    field: 'submittedBy',
    align: 'left',
    sortable: false,
  },
  { name: 'daysPending', label: 'Waiting', field: 'daysPending', align: 'center', sortable: true },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center', sortable: false },
]

const docCols = [
  { name: 'title', label: 'Document Title', field: 'title', align: 'left', sortable: true },
  { name: 'parties', label: 'Parties', field: 'parties', align: 'left', sortable: false },
  {
    name: 'financialExposure',
    label: 'Exposure (LKR)',
    field: 'financialExposure',
    align: 'right',
    sortable: true,
  },
  { name: 'status', label: 'Status', field: 'status', align: 'center', sortable: false },
  {
    name: 'submittedBy',
    label: 'Submitted By',
    field: 'submittedBy',
    align: 'left',
    sortable: false,
  },
  { name: 'daysPending', label: 'Waiting', field: 'daysPending', align: 'center', sortable: true },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center', sortable: false },
]

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  TAB STATE
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const activeTab = ref('agreements')

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  VIEW DIALOG
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const showViewDialog = ref(false)
const showPreviewDialog = ref(false)
const viewingItem = ref(null)
const viewingItemType = ref('')
const previewDoc = ref(null)

function viewItem(row, type) {
  viewingItem.value = row
  viewingItemType.value = type
  showViewDialog.value = true
}

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  ACTION (APPROVE / REJECT) DIALOG
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const showActionDialog = ref(false)
const actionItem = ref(null)
const actionType = ref('approve') // 'approve' | 'reject'
const activeItemType = ref('agreement') // 'agreement' | 'doc'
const actionRemarks = ref('')
const processing = ref(false)
const remarksRef = ref(null)

const nextStateMap = {
  'Pending L1 Approval': 'Pending L2 Approval',
  'Pending L2 Approval': 'Active',
  Pending: 'Approved',
}

const approveLabel = computed(() => {
  if (!actionItem.value) return 'Approve'
  return (
    {
      'Pending L1 Approval': 'L1 Approve & Send to L2',
      'Pending L2 Approval': 'L2 Final Approval',
      Pending: 'Approve Document',
    }[actionItem.value.status] || 'Approve'
  )
})

function openAction(row, type, itemType) {
  actionItem.value = row
  actionType.value = type
  activeItemType.value = itemType
  actionRemarks.value = ''
  showActionDialog.value = true
}

async function confirmAction() {
  // Validate remarks field
  const valid = await remarksRef.value?.validate()
  if (!valid) return

  processing.value = true
  await new Promise((r) => setTimeout(r, 700))

  const isApprove = actionType.value === 'approve'
  const item = actionItem.value
  const list = activeItemType.value === 'agreement' ? pendingAgreements : pendingDocs

  if (isApprove) {
    const nextStatus = nextStateMap[item.status]
    if (nextStatus === 'Active' || nextStatus === 'Approved') {
      // Remove from pending list — it advanced past this inbox
      const idx = list.value.findIndex((i) => i.id === item.id)
      if (idx !== -1) list.value.splice(idx, 1)
      $q.notify({
        type: 'positive',
        icon: 'check_circle',
        message: `"${item.title}" — Final approval granted. Now ${nextStatus}.`,
      })
    } else {
      // Advance to next stage but keep in list (still pending the next level)
      const idx = list.value.findIndex((i) => i.id === item.id)
      if (idx !== -1) list.value[idx].status = nextStatus
      $q.notify({
        type: 'positive',
        icon: 'send',
        message: `"${item.title}" advanced to ${nextStatus}.`,
      })
    }
  } else {
    // Reject → remove from pending list
    const idx = list.value.findIndex((i) => i.id === item.id)
    if (idx !== -1) list.value.splice(idx, 1)
    $q.notify({ type: 'negative', icon: 'cancel', message: `"${item.title}" rejected.` })
  }

  // Log to history
  actionHistory.value.push({
    action: isApprove ? 'Approved' : 'Rejected',
    title: item.title,
    itemType: activeItemType.value,
    remarks: actionRemarks.value,
    at: new Date().toLocaleString('en-LK'),
  })

  processing.value = false
  showActionDialog.value = false
}

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  ACTION HISTORY (session)
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const actionHistory = ref([])

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  REFRESH
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const refreshing = ref(false)
async function refreshInbox() {
  refreshing.value = true
  await new Promise((r) => setTimeout(r, 800))
  refreshing.value = false
  $q.notify({ type: 'info', icon: 'refresh', message: 'Inbox refreshed.', timeout: 1500 })
}

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
//  HELPERS
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
function fmt(val) {
  return Number(val).toLocaleString('en-LK')
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

// ── KPI cards ─────────────────────────────────────────────────
.slt-kpi-card {
  border-radius: 10px;
  transition: box-shadow 0.15s;
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 63, 135, 0.1);
  }
}

// ── Dialog header ─────────────────────────────────────────────
.slt-dialog-bar {
  background: linear-gradient(135deg, #002f6c, #003f87);
  min-height: 44px;
}

// ── Tab bottom border ─────────────────────────────────────────
.border-bottom {
  border-bottom: 1px solid var(--q-primary);
  opacity: 0.2;
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
</style>
