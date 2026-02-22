<template>
  <q-page class="q-pa-md slt-page-bg">
    <!-- ─── Page Header ──────────────────────────────────────────── -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-weight-bold text-primary">
          <q-icon name="settings" size="28px" class="q-mr-sm" />
          System Settings
        </div>
        <div class="text-caption text-grey-6">
          User management, workflow configuration &amp; system administration
        </div>
      </div>
    </div>

    <!-- ─── Tabbed Settings ──────────────────────────────────────── -->
    <q-card flat bordered>
      <q-tabs
        v-model="activeTab"
        align="left"
        indicator-color="accent"
        active-color="primary"
        class="bg-grey-1"
        dense
      >
        <q-tab name="users" icon="group" label="Users & Roles" no-caps />
        <q-tab name="workflow" icon="account_tree" label="Workflow Config" no-caps />
        <q-tab name="notif" icon="notifications" label="Notifications" no-caps />
        <q-tab name="casetypes" icon="category" label="Case Types" no-caps />
        <q-tab name="audit" icon="manage_search" label="Audit Trail" no-caps />
      </q-tabs>
      <q-separator />

      <q-tab-panels v-model="activeTab" animated>
        <!-- ╔═══════════════════════════════════════════════════════
             TAB 1 — USERS & ROLES
        ═══════════════════════════════════════════════════════════╗ -->
        <q-tab-panel name="users" class="q-pa-none">
          <div class="q-pa-md row items-center justify-between">
            <div class="text-subtitle1 text-weight-bold text-grey-8">System Users</div>
            <q-btn
              unelevated
              no-caps
              color="primary"
              icon="person_add"
              label="Add User"
              size="sm"
              @click="openUserDialog(null)"
            />
          </div>
          <q-separator />

          <q-table
            :rows="users"
            :columns="userCols"
            row-key="id"
            flat
            class="slt-table"
            :pagination="{ rowsPerPage: 8 }"
          >
            <!-- Avatar + Name cell -->
            <template #body-cell-name="props">
              <q-td :props="props">
                <div class="row items-center q-gutter-sm">
                  <q-avatar
                    size="34px"
                    :color="roleColor(props.row.role)"
                    text-color="white"
                    font-size="13px"
                  >
                    {{ initials(props.row.name) }}
                  </q-avatar>
                  <div>
                    <div class="text-weight-bold text-grey-9">{{ props.row.name }}</div>
                    <div class="text-caption text-grey-5">{{ props.row.email }}</div>
                  </div>
                </div>
              </q-td>
            </template>

            <!-- Role badge -->
            <template #body-cell-role="props">
              <q-td :props="props">
                <q-badge rounded :color="roleColor(props.row.role)" :label="props.row.role" />
              </q-td>
            </template>

            <!-- Status chip -->
            <template #body-cell-active="props">
              <q-td :props="props" class="text-center">
                <q-chip
                  dense
                  :color="props.row.active ? 'positive' : 'grey-4'"
                  :text-color="props.row.active ? 'white' : 'grey-7'"
                  :icon="props.row.active ? 'check_circle' : 'cancel'"
                  :label="props.row.active ? 'Active' : 'Inactive'"
                  size="sm"
                />
              </q-td>
            </template>

            <!-- Actions -->
            <template #body-cell-actions="props">
              <q-td :props="props" class="text-center">
                <q-btn
                  flat
                  round
                  dense
                  icon="edit"
                  size="sm"
                  color="primary"
                  @click="openUserDialog(props.row)"
                >
                  <q-tooltip>Edit User</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  :icon="props.row.active ? 'person_off' : 'person'"
                  :color="props.row.active ? 'negative' : 'positive'"
                  size="sm"
                  @click="toggleUserActive(props.row)"
                >
                  <q-tooltip>{{ props.row.active ? 'Deactivate' : 'Activate' }}</q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>

        <!-- ╔═══════════════════════════════════════════════════════
             TAB 2 — WORKFLOW CONFIG
        ═══════════════════════════════════════════════════════════╗ -->
        <q-tab-panel name="workflow" class="q-pa-md">
          <div class="text-subtitle1 text-weight-bold text-grey-8 q-mb-md">
            Approval Workflow Configuration
          </div>

          <div v-for="module in workflowModules" :key="module.name">
            <q-card flat bordered class="q-mb-md">
              <q-card-section class="row items-center bg-grey-1 q-py-sm">
                <q-icon :name="module.icon" color="primary" size="20px" class="q-mr-sm" />
                <div class="text-weight-bold text-grey-9">{{ module.name }}</div>
                <q-space />
                <q-toggle
                  v-model="module.enabled"
                  color="primary"
                  dense
                  :label="module.enabled ? 'Enabled' : 'Disabled'"
                />
              </q-card-section>
              <q-separator />
              <q-card-section class="q-pa-md">
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="module.l1Approver"
                      outlined
                      dense
                      label="L1 Approver Role"
                      hint="Role required for first-level approval"
                    >
                      <template #prepend><q-icon name="approval" color="warning" /></template>
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="module.l2Approver"
                      outlined
                      dense
                      label="L2 Approver Role"
                      hint="Role required for final approval"
                    >
                      <template #prepend><q-icon name="verified" color="positive" /></template>
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-4">
                    <q-input
                      v-model.number="module.slaHours"
                      outlined
                      dense
                      type="number"
                      label="SLA (hours)"
                      hint="Max hours per approval stage"
                    >
                      <template #prepend><q-icon name="timer" /></template>
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-8">
                    <q-toggle
                      v-model="module.requireRemarks"
                      color="primary"
                      label="Mandatory remarks on approve/reject"
                    />
                    <br />
                    <q-toggle
                      v-model="module.notifyOnEachStage"
                      color="info"
                      label="Notify submitter on each stage change"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="row justify-end">
            <q-btn
              unelevated
              no-caps
              color="primary"
              icon="save"
              label="Save Workflow Config"
              @click="saveWorkflow"
            />
          </div>
        </q-tab-panel>

        <!-- ╔═══════════════════════════════════════════════════════
             TAB 3 — NOTIFICATIONS
        ═══════════════════════════════════════════════════════════╗ -->
        <q-tab-panel name="notif" class="q-pa-md">
          <div class="text-subtitle1 text-weight-bold text-grey-8 q-mb-md">
            Notification &amp; Alert Settings
          </div>

          <div class="row q-col-gutter-md">
            <div v-for="cat in notifCategories" :key="cat.key" class="col-12 col-sm-6">
              <q-card flat bordered>
                <q-card-section class="row items-center bg-grey-1 q-py-sm">
                  <q-icon :name="cat.icon" color="primary" size="18px" class="q-mr-sm" />
                  <div class="text-weight-bold text-grey-9 col">{{ cat.label }}</div>
                  <q-toggle v-model="cat.enabled" color="primary" dense />
                </q-card-section>
                <q-separator />
                <q-card-section class="q-pa-sm q-pl-md">
                  <div v-for="sub in cat.subs" :key="sub.key" class="q-mb-xs">
                    <q-toggle
                      v-model="sub.enabled"
                      :disable="!cat.enabled"
                      color="primary"
                      :label="sub.label"
                      size="sm"
                      dense
                    />
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <div class="row justify-end q-mt-md">
            <q-btn
              unelevated
              no-caps
              color="primary"
              icon="save"
              label="Save Notification Settings"
              @click="saveNotif"
            />
          </div>
        </q-tab-panel>

        <!-- ╔═══════════════════════════════════════════════════════
             TAB 4 — CASE TYPES
        ═══════════════════════════════════════════════════════════╗ -->
        <q-tab-panel name="casetypes" class="q-pa-none">
          <div class="q-pa-md row items-center justify-between">
            <div class="text-subtitle1 text-weight-bold text-grey-8">
              Supported Case Types (BRD: OTH-FR-01)
            </div>
            <q-btn unelevated no-caps color="primary" icon="add" label="Add Type" size="sm" />
          </div>
          <q-separator />

          <q-markup-table flat dense separator="horizontal" class="slt-mu-table">
            <thead>
              <tr>
                <th class="text-left">Case Type</th>
                <th class="text-left">BRD FR ID</th>
                <th class="text-left">Specific Fields</th>
                <th class="text-center">Configurable</th>
                <th class="text-center">Active</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ct in caseTypes" :key="ct.type">
                <td class="text-weight-bold text-grey-9">{{ ct.type }}</td>
                <td><q-badge outline color="primary" :label="ct.frId" /></td>
                <td>
                  <div class="row q-gutter-xs">
                    <q-chip
                      v-for="f in ct.fields"
                      :key="f"
                      dense
                      size="sm"
                      color="blue-1"
                      text-color="primary"
                      :label="f"
                    />
                  </div>
                </td>
                <td class="text-center">
                  <q-icon
                    :name="ct.configurable ? 'check_circle' : 'remove'"
                    :color="ct.configurable ? 'positive' : 'grey-4'"
                  />
                </td>
                <td class="text-center">
                  <q-toggle v-model="ct.active" color="primary" dense />
                </td>
                <td class="text-center">
                  <q-btn flat round dense icon="edit" size="sm" color="grey-7">
                    <q-tooltip>Edit Type</q-tooltip>
                  </q-btn>
                </td>
              </tr>
            </tbody>
          </q-markup-table>
        </q-tab-panel>

        <!-- ╔═══════════════════════════════════════════════════════
             TAB 5 — AUDIT TRAIL
        ═══════════════════════════════════════════════════════════╗ -->
        <q-tab-panel name="audit" class="q-pa-none">
          <!-- Filters -->
          <div class="q-pa-md row q-col-gutter-sm items-center bg-grey-1">
            <div class="col-12 col-sm-3">
              <q-input v-model="auditFilter" dense outlined clearable placeholder="Search actions…">
                <template #prepend><q-icon name="search" /></template>
              </q-input>
            </div>
            <div class="col-6 col-sm-2">
              <q-select
                v-model="auditModule"
                dense
                outlined
                clearable
                :options="[
                  'All Modules',
                  'Agreements',
                  'Legal Cases',
                  'Initial Docs',
                  'Settings',
                  'Login',
                ]"
                label="Module"
              />
            </div>
            <div class="col-6 col-sm-2">
              <q-select
                v-model="auditUser"
                dense
                outlined
                clearable
                :options="['All Users', ...users.map((u) => u.name)]"
                label="User"
              />
            </div>
            <div class="col-auto">
              <q-btn
                flat
                icon="restart_alt"
                color="grey-7"
                dense
                @click="
                  auditFilter = ''
                  auditModule = null
                  auditUser = null
                "
              >
                <q-tooltip>Reset</q-tooltip>
              </q-btn>
            </div>
            <div class="col-auto q-ml-auto">
              <q-btn
                outline
                no-caps
                size="sm"
                icon="file_download"
                color="primary"
                label="Export Log"
              />
            </div>
          </div>
          <q-separator />

          <q-table
            :rows="filteredAuditLog"
            :columns="auditCols"
            row-key="id"
            flat
            class="slt-table"
            :pagination="{ rowsPerPage: 12 }"
          >
            <!-- Action badge -->
            <template #body-cell-action="props">
              <q-td :props="props">
                <q-badge rounded :color="auditActionColor(props.value)" :label="props.value" />
              </q-td>
            </template>

            <!-- Module badge -->
            <template #body-cell-module="props">
              <q-td :props="props">
                <q-badge outline :color="auditModuleColor(props.value)" :label="props.value" />
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <!-- ═══════════════════════════════════════════════════════════
         USER ADD / EDIT DIALOG
    ════════════════════════════════════════════════════════════ -->
    <q-dialog v-model="showUserDialog" persistent>
      <q-card style="width: 480px; max-width: 95vw">
        <q-bar class="slt-dialog-bar text-white">
          <q-icon name="person" />
          <div class="text-weight-bold q-ml-sm">
            {{ editingUser ? 'Edit User' : 'Add New User' }}
          </div>
          <q-space />
          <q-btn dense flat icon="close" @click="showUserDialog = false" />
        </q-bar>

        <q-card-section class="q-pa-md">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input
                v-model="userForm.name"
                outlined
                dense
                label="Full Name *"
                :rules="[(v) => !!v || 'Required']"
              />
            </div>
            <div class="col-12">
              <q-input
                v-model="userForm.email"
                outlined
                dense
                label="Email Address *"
                type="email"
                :rules="[(v) => !!v || 'Required']"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-select
                v-model="userForm.role"
                :options="['Legal Officer', 'Manager', 'Executive', 'Admin']"
                outlined
                dense
                label="Role *"
                :rules="[(v) => !!v || 'Required']"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="userForm.department" outlined dense label="Department" />
            </div>
            <div class="col-12">
              <q-toggle v-model="userForm.active" color="primary" label="Account Active" />
            </div>
          </div>
        </q-card-section>

        <q-separator />
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat no-caps label="Cancel" color="grey-7" @click="showUserDialog = false" />
          <q-btn
            unelevated
            no-caps
            color="primary"
            icon="save"
            :label="editingUser ? 'Save Changes' : 'Add User'"
            @click="saveUser"
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
//  TAB STATE
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
const activeTab = ref('users')

// ══════════════════════════════════════════════════════════════
//  TAB 1 — USERS & ROLES
// ══════════════════════════════════════════════════════════════
const users = ref([
  {
    id: 1,
    name: 'K. Fernando',
    email: 'k.fernando@slt.com.lk',
    role: 'Manager',
    department: 'Legal',
    active: true,
    lastLogin: '2026-02-22 08:15',
  },
  {
    id: 2,
    name: 'N. Silva',
    email: 'n.silva@slt.com.lk',
    role: 'Legal Officer',
    department: 'Legal',
    active: true,
    lastLogin: '2026-02-22 09:42',
  },
  {
    id: 3,
    name: 'P. Jayawardena',
    email: 'p.jayawardena@slt.com.lk',
    role: 'Legal Officer',
    department: 'Legal',
    active: true,
    lastLogin: '2026-02-21 14:30',
  },
  {
    id: 4,
    name: 'S. Dissanayake',
    email: 's.dissanayake@slt.com.lk',
    role: 'Legal Officer',
    department: 'Legal',
    active: true,
    lastLogin: '2026-02-22 11:05',
  },
  {
    id: 5,
    name: 'S. Karunaratne',
    email: 's.karunaratne@slt.com.lk',
    role: 'Executive',
    department: 'Legal',
    active: true,
    lastLogin: '2026-02-20 16:00',
  },
  {
    id: 6,
    name: 'D. Wijesinghe',
    email: 'd.wijesinghe@slt.com.lk',
    role: 'Legal Officer',
    department: 'Admin',
    active: true,
    lastLogin: '2026-02-19 10:22',
  },
  {
    id: 7,
    name: 'A. Bandara, PC',
    email: 'a.bandara@slt.com.lk',
    role: 'Legal Officer',
    department: 'Legal',
    active: true,
    lastLogin: '2026-02-18 09:00',
  },
  {
    id: 8,
    name: 'System Admin',
    email: 'admin@slt.com.lk',
    role: 'Admin',
    department: 'IT',
    active: true,
    lastLogin: '2026-02-22 07:55',
  },
  {
    id: 9,
    name: 'R. Kulathunga',
    email: 'r.kulathunga@slt.com.lk',
    role: 'Legal Officer',
    department: 'Legal',
    active: false,
    lastLogin: '2026-01-15 13:00',
  },
])

const userCols = [
  { name: 'name', label: 'User', field: 'name', align: 'left', sortable: true },
  { name: 'role', label: 'Role', field: 'role', align: 'left', sortable: true },
  { name: 'department', label: 'Department', field: 'department', align: 'left', sortable: true },
  { name: 'lastLogin', label: 'Last Login', field: 'lastLogin', align: 'left', sortable: true },
  { name: 'active', label: 'Status', field: 'active', align: 'center', sortable: false },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center', sortable: false },
]

function roleColor(role) {
  return (
    {
      Admin: 'deep-purple-7',
      Executive: 'positive',
      Manager: 'primary',
      'Legal Officer': 'info',
    }[role] || 'grey-6'
  )
}

function initials(name) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function toggleUserActive(user) {
  user.active = !user.active
  $q.notify({
    type: user.active ? 'positive' : 'warning',
    icon: user.active ? 'check_circle' : 'person_off',
    message: `${user.name} ${user.active ? 'activated' : 'deactivated'}.`,
    timeout: 2000,
  })
}

// User dialog
const showUserDialog = ref(false)
const editingUser = ref(null)
const userForm = ref({ name: '', email: '', role: 'Legal Officer', department: '', active: true })

function openUserDialog(user) {
  editingUser.value = user
  userForm.value = user
    ? { ...user }
    : { name: '', email: '', role: 'Legal Officer', department: '', active: true }
  showUserDialog.value = true
}

function saveUser() {
  if (editingUser.value) {
    const idx = users.value.findIndex((u) => u.id === editingUser.value.id)
    if (idx !== -1) users.value[idx] = { ...editingUser.value, ...userForm.value }
    $q.notify({ type: 'positive', icon: 'check', message: 'User updated.', timeout: 1800 })
  } else {
    users.value.push({ id: Date.now(), lastLogin: '—', ...userForm.value })
    $q.notify({ type: 'positive', icon: 'person_add', message: 'User added.', timeout: 1800 })
  }
  showUserDialog.value = false
}

// ══════════════════════════════════════════════════════════════
//  TAB 2 — WORKFLOW CONFIG
// ══════════════════════════════════════════════════════════════
const workflowModules = ref([
  {
    name: 'Agreement Approval',
    icon: 'handshake',
    enabled: true,
    l1Approver: 'Manager',
    l2Approver: 'Executive',
    slaHours: 48,
    requireRemarks: true,
    notifyOnEachStage: true,
  },
  {
    name: 'Initial Document Approval',
    icon: 'description',
    enabled: true,
    l1Approver: 'Manager',
    l2Approver: 'Executive',
    slaHours: 72,
    requireRemarks: true,
    notifyOnEachStage: false,
  },
  {
    name: 'Case Closure',
    icon: 'gavel',
    enabled: true,
    l1Approver: 'Manager',
    l2Approver: '',
    slaHours: 24,
    requireRemarks: true,
    notifyOnEachStage: false,
  },
])

function saveWorkflow() {
  $q.notify({
    type: 'positive',
    icon: 'save',
    message: 'Workflow configuration saved.',
    timeout: 2000,
  })
}

// ══════════════════════════════════════════════════════════════
//  TAB 3 — NOTIFICATIONS
// ══════════════════════════════════════════════════════════════
const notifCategories = ref([
  {
    key: 'expiry',
    label: 'Agreement Expiry Alerts',
    icon: 'event_busy',
    enabled: true,
    subs: [
      { key: 'exp90', label: 'Alert 90 days before expiry', enabled: true },
      { key: 'exp30', label: 'Alert 30 days before expiry', enabled: true },
      { key: 'exp7', label: 'Alert 7 days before expiry', enabled: true },
    ],
  },
  {
    key: 'approval',
    label: 'Approval Reminders',
    icon: 'task_alt',
    enabled: true,
    subs: [
      { key: 'apr24', label: 'Remind approver after 24h pending', enabled: true },
      { key: 'apr48', label: 'Remind approver after 48h pending', enabled: true },
      { key: 'aprEsc', label: 'Escalate after SLA breach', enabled: false },
    ],
  },
  {
    key: 'caseasgn',
    label: 'Case Assignment',
    icon: 'assignment_ind',
    enabled: true,
    subs: [
      { key: 'casNew', label: 'Notify officer on case assignment', enabled: true },
      { key: 'casUpd', label: 'Notify on case status change', enabled: true },
    ],
  },
  {
    key: 'hearing',
    label: 'Court Hearing Reminders',
    icon: 'event',
    enabled: true,
    subs: [
      { key: 'hr7', label: 'Remind 7 days before hearing', enabled: true },
      { key: 'hr1', label: 'Remind 1 day before hearing', enabled: true },
      { key: 'hrDay', label: 'Morning reminder on hearing day', enabled: false },
    ],
  },
])

function saveNotif() {
  $q.notify({
    type: 'positive',
    icon: 'save',
    message: 'Notification settings saved.',
    timeout: 2000,
  })
}

// ══════════════════════════════════════════════════════════════
//  TAB 4 — CASE TYPES
// ══════════════════════════════════════════════════════════════
const caseTypes = ref([
  {
    type: 'Money Recovery',
    frId: 'MR-FR-01',
    fields: ['Claim Amount', 'Recovered Amount', 'Outstanding Balance'],
    configurable: false,
    active: true,
  },
  {
    type: 'Damages Recovery',
    frId: 'DR-FR-01',
    fields: ['Damage Assessment', 'Compensation Amount', 'Settlement Details'],
    configurable: false,
    active: true,
  },
  {
    type: 'Appeals',
    frId: 'AP-FR-01',
    fields: ['Original Case Link', 'Appeal Deadline', 'Appeal Outcome'],
    configurable: false,
    active: true,
  },
  {
    type: 'Land Cases',
    frId: 'LC-FR-01',
    fields: ['Land Reference No.', 'Survey Plan', 'Deed No.', 'Ownership History'],
    configurable: false,
    active: true,
  },
  {
    type: 'Criminal Cases',
    frId: 'CR-FR-01',
    fields: ['Charges / Statute', 'Hearing History'],
    configurable: false,
    active: true,
  },
  {
    type: 'Inquiries / Disciplinary',
    frId: 'INQ-FR-01',
    fields: ['Panel Members', 'Findings', 'Decision'],
    configurable: false,
    active: true,
  },
  {
    type: 'Other Legal Matters',
    frId: 'OTH-FR-01',
    fields: ['Configurable Fields', 'Custom Templates'],
    configurable: true,
    active: true,
  },
])

// ══════════════════════════════════════════════════════════════
//  TAB 5 — AUDIT TRAIL
// ══════════════════════════════════════════════════════════════
const auditFilter = ref('')
const auditModule = ref(null)
const auditUser = ref(null)

const auditLog = ref([
  {
    id: 1,
    at: '2026-02-22 11:42',
    user: 'K. Fernando',
    module: 'Agreements',
    action: 'Approved',
    detail: 'Oracle Licensing Agreement advanced to Pending L2',
  },
  {
    id: 2,
    at: '2026-02-22 11:30',
    user: 'N. Silva',
    module: 'Legal Cases',
    action: 'Created',
    detail: 'New case LC-2026-009 created (Money Recovery)',
  },
  {
    id: 3,
    at: '2026-02-22 10:55',
    user: 'S. Dissanayake',
    module: 'Initial Docs',
    action: 'Submitted',
    detail: 'ID/SLT/2026/016 submitted for manager approval',
  },
  {
    id: 4,
    at: '2026-02-22 10:20',
    user: 'System Admin',
    module: 'Settings',
    action: 'Modified',
    detail: 'Workflow SLA updated for Agreement Approval',
  },
  {
    id: 5,
    at: '2026-02-22 09:42',
    user: 'N. Silva',
    module: 'Login',
    action: 'Login',
    detail: 'Signed in as Legal Officer',
  },
  {
    id: 6,
    at: '2026-02-22 09:10',
    user: 'P. Jayawardena',
    module: 'Legal Cases',
    action: 'Updated',
    detail: 'Hearing date updated for LC-2026-002',
  },
  {
    id: 7,
    at: '2026-02-22 08:55',
    user: 'K. Fernando',
    module: 'Agreements',
    action: 'Rejected',
    detail: 'Tower Site Maintenance Contract rejected — missing section 4',
  },
  {
    id: 8,
    at: '2026-02-22 08:30',
    user: 'System Admin',
    module: 'Settings',
    action: 'Created',
    detail: 'New user R. Kulathunga added (Legal Officer)',
  },
  {
    id: 9,
    at: '2026-02-21 17:10',
    user: 'S. Karunaratne',
    module: 'Agreements',
    action: 'Approved',
    detail: 'Network Maintenance SLA final L2 approval — now Active',
  },
  {
    id: 10,
    at: '2026-02-21 15:30',
    user: 'D. Wijesinghe',
    module: 'Initial Docs',
    action: 'Created',
    detail: 'ID/SLT/2026/017 created (Damages — Galle MC)',
  },
  {
    id: 11,
    at: '2026-02-21 14:00',
    user: 'A. Bandara, PC',
    module: 'Legal Cases',
    action: 'Closed',
    detail: 'Case LC-2025-044 closed with conclusion entered',
  },
  {
    id: 12,
    at: '2026-02-21 11:45',
    user: 'N. Silva',
    module: 'Legal Cases',
    action: 'Note Added',
    detail: 'Internal note added to LC-2026-001 regarding evidence',
  },
  {
    id: 13,
    at: '2026-02-20 16:00',
    user: 'S. Karunaratne',
    module: 'Login',
    action: 'Login',
    detail: 'Signed in as Executive (L2)',
  },
  {
    id: 14,
    at: '2026-02-20 14:20',
    user: 'P. Jayawardena',
    module: 'Agreements',
    action: 'Created',
    detail: 'Fleet Vehicle Maintenance Contract created (Draft)',
  },
  {
    id: 15,
    at: '2026-02-19 09:15',
    user: 'System Admin',
    module: 'Settings',
    action: 'Modified',
    detail: 'Notification: 30-day expiry alert enabled',
  },
])

const filteredAuditLog = computed(() => {
  return auditLog.value.filter((row) => {
    const matchText =
      !auditFilter.value ||
      JSON.stringify(row).toLowerCase().includes(auditFilter.value.toLowerCase())
    const matchModule =
      !auditModule.value || auditModule.value === 'All Modules' || row.module === auditModule.value
    const matchUser =
      !auditUser.value || auditUser.value === 'All Users' || row.user === auditUser.value
    return matchText && matchModule && matchUser
  })
})

const auditCols = [
  { name: 'at', label: 'Timestamp', field: 'at', align: 'left', sortable: true },
  { name: 'user', label: 'User', field: 'user', align: 'left', sortable: true },
  { name: 'module', label: 'Module', field: 'module', align: 'left', sortable: true },
  { name: 'action', label: 'Action', field: 'action', align: 'left', sortable: true },
  { name: 'detail', label: 'Detail', field: 'detail', align: 'left', sortable: false },
]

function auditActionColor(action) {
  return (
    {
      Approved: 'positive',
      Rejected: 'negative',
      Created: 'primary',
      Updated: 'info',
      Modified: 'warning',
      Submitted: 'info',
      Closed: 'grey-6',
      Login: 'grey-7',
      'Note Added': 'purple-6',
    }[action] || 'grey-6'
  )
}

function auditModuleColor(mod) {
  return (
    {
      Agreements: 'primary',
      'Legal Cases': 'purple-7',
      'Initial Docs': 'orange-8',
      Settings: 'grey-7',
      Login: 'teal-7',
    }[mod] || 'grey-6'
  )
}
</script>

<style lang="scss" scoped>
.slt-page-bg {
  background: #f0f4f9;
  min-height: 100vh;
}

.slt-dialog-bar {
  background: linear-gradient(135deg, #002f6c, #003f87);
  min-height: 44px;
}

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
}

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
</style>
