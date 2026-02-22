<template>
  <q-layout view="lHh Lpr lFf">
    <!-- ─── TOP HEADER ─────────────────────────────────────── -->
    <q-header class="slt-header" elevated>
      <q-toolbar>
        <!-- Hamburger / drawer toggle -->
        <q-btn
          flat
          dense
          round
          icon="menu"
          color="white"
          aria-label="Toggle Menu"
          @click="toggleLeftDrawer"
        />

        <!-- Logo + Brand Name -->
        <q-toolbar-title class="slt-brand-title">
          <q-icon name="gavel" size="26px" class="q-mr-sm" />
          SLT LegalEdge
          <span class="slt-brand-sub">| Integrated Legal Management</span>
        </q-toolbar-title>

        <!-- Global Search -->
        <q-input
          v-model="globalSearch"
          dense
          outlined
          rounded
          placeholder="Search cases, agreements…"
          class="slt-global-search q-mr-md"
          bg-color="white"
          style="width: 260px"
        >
          <template #prepend><q-icon name="search" color="grey-6" /></template>
          <template #append>
            <q-icon
              v-if="globalSearch"
              name="close"
              class="cursor-pointer"
              @click="globalSearch = ''"
            />
          </template>
        </q-input>

        <!-- Right-side actions -->
        <q-btn
          flat
          round
          dense
          icon="notifications"
          color="white"
          class="q-mr-xs"
          @click="showNotifDrawer = true"
        >
          <q-badge v-if="notifStore.unreadCount" color="negative" floating>
            {{ notifStore.unreadCount }}
          </q-badge>
          <q-tooltip>Notifications</q-tooltip>
        </q-btn>

        <q-btn flat round dense icon="help_outline" color="white" class="q-mr-sm">
          <q-tooltip>Help</q-tooltip>
        </q-btn>

        <q-separator vertical inset color="white" class="q-mx-sm opacity-40" />

        <q-btn-dropdown flat no-caps color="white" class="q-ml-sm">
          <template #label>
            <q-avatar
              size="32px"
              color="white"
              text-color="primary"
              class="q-mr-sm"
              font-size="14px"
            >
              {{ authStore.userInitials }}
            </q-avatar>
            <span class="text-body2">{{ authStore.displayName }}</span>
          </template>
          <q-list style="min-width: 180px">
            <q-item clickable v-close-popup :to="'/profile'">
              <q-item-section avatar><q-icon name="person" /></q-item-section>
              <q-item-section>My Profile</q-item-section>
            </q-item>
            <q-item clickable v-close-popup :to="'/settings'">
              <q-item-section avatar><q-icon name="settings" /></q-item-section>
              <q-item-section>Settings</q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup class="text-negative" @click="logout">
              <q-item-section avatar><q-icon name="logout" color="negative" /></q-item-section>
              <q-item-section>Logout</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>

      <!-- ─── Breadcrumbs ──────────────────────────────────── -->
      <div class="slt-breadcrumb-bar q-px-md q-py-xs" v-if="breadcrumbs.length">
        <q-breadcrumbs active-color="white" class="text-white opacity-80" separator="›">
          <q-breadcrumbs-el
            v-for="crumb in breadcrumbs"
            :key="crumb.label"
            :label="crumb.label"
            :icon="crumb.icon"
            :to="crumb.to"
          />
        </q-breadcrumbs>
      </div>
    </q-header>

    <!-- ─── LEFT SIDEBAR ────────────────────────────────────── -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="slt-drawer">
      <!-- Drawer header / logo area -->
      <div class="slt-drawer-header column items-center justify-center q-py-lg">
        <q-icon name="gavel" size="42px" color="white" />
        <div class="text-white text-weight-bold text-h6 q-mt-sm">LegalEdge</div>
        <div class="text-white text-caption opacity-70">SLT Mobitel PLC</div>
      </div>

      <q-separator color="white" class="opacity-20" />

      <!-- Navigation items -->
      <q-list class="q-mt-sm">
        <q-item-label
          header
          class="text-white text-caption text-weight-bold opacity-60 q-pl-md q-mt-sm"
        >
          MAIN MENU
        </q-item-label>

        <template v-for="item in navItems" :key="item.label">
          <!-- Group header (dividers between sections) -->
          <q-item-label
            v-if="item.separator"
            header
            class="text-white text-caption text-weight-bold opacity-60 q-pl-md q-mt-md"
          >
            {{ item.separator }}
          </q-item-label>

          <!-- Navigation link -->
          <q-item
            v-else
            :to="item.route"
            exact
            clickable
            active-class="slt-nav-active"
            class="slt-nav-item text-white q-mx-sm q-mb-xs rounded-borders"
          >
            <q-item-section avatar>
              <q-icon :name="item.icon" size="22px" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">{{ item.label }}</q-item-label>
              <q-item-label caption class="opacity-60 text-white">{{ item.caption }}</q-item-label>
            </q-item-section>
            <q-item-section v-if="item.badge" side>
              <q-badge :color="item.badgeColor || 'accent'" :label="item.badge" rounded />
            </q-item-section>
          </q-item>
        </template>
      </q-list>

      <!-- Drawer footer -->
      <div class="slt-drawer-footer absolute-bottom q-pa-md text-white text-caption opacity-40">
        SLT LegalEdge v1.0.0
      </div>
    </q-drawer>

    <!-- ─── PAGE CONTAINER ──────────────────────────────────── -->
    <q-page-container class="slt-page-bg">
      <router-view />
    </q-page-container>

    <!-- ─── NOTIFICATION DRAWER ─────────────────────────────── -->
    <NotificationsDrawer v-model="showNotifDrawer" />
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from 'src/stores/authStore'
import { useNotificationStore } from 'src/stores/notificationStore'
import NotificationsDrawer from 'src/components/NotificationsDrawer.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const notifStore = useNotificationStore()

const leftDrawerOpen = ref(false)
const showNotifDrawer = ref(false)
const globalSearch = ref('')

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function logout() {
  authStore.logout()
  router.push('/login')
}

// ── Breadcrumbs ───────────────────────────────────────────────────
const routeMeta = {
  '/': { label: 'Dashboard', icon: 'dashboard' },
  '/initial-docs': { label: 'Initial Documents', icon: 'description' },
  '/cases': { label: 'Legal Cases', icon: 'gavel' },
  '/agreements': { label: 'Agreements', icon: 'handshake' },
  '/approvals': { label: 'Approvals', icon: 'verified' },
  '/reports': { label: 'Reports', icon: 'bar_chart' },
  '/settings': { label: 'Settings', icon: 'settings' },
  '/profile': { label: 'My Profile', icon: 'person' },
}

const breadcrumbs = computed(() => {
  const path = route.path
  if (path === '/') return []
  const crumbs = [{ label: 'Home', icon: 'home', to: '/' }]
  const meta = routeMeta[path]
  if (meta) crumbs.push({ label: meta.label, icon: meta.icon })
  return crumbs
})

// ── Navigation items ──────────────────────────────────────────────
const navItems = computed(() => [
  {
    label: 'Dashboard',
    caption: 'Overview & analytics',
    icon: 'dashboard',
    route: '/',
  },
  { separator: 'LEGAL CASES' },
  {
    label: 'Initial Documents',
    caption: 'Document intake',
    icon: 'description',
    route: '/initial-docs',
    badge: '5',
    badgeColor: 'warning',
  },
  {
    label: 'Legal Cases',
    caption: 'Active case management',
    icon: 'gavel',
    route: '/cases',
  },
  { separator: 'AGREEMENTS' },
  {
    label: 'Agreements',
    caption: 'Contracts & MOUs',
    icon: 'handshake',
    route: '/agreements',
  },
  {
    label: 'Approvals',
    caption: 'Multi-level approvals',
    icon: 'verified',
    route: '/approvals',
    badge: String(notifStore.unreadCount),
    badgeColor: 'negative',
  },
  { separator: 'SYSTEM' },
  {
    label: 'Reports',
    caption: 'Analytics & reports',
    icon: 'bar_chart',
    route: '/reports',
  },
  {
    label: 'Settings',
    caption: 'System configuration',
    icon: 'settings',
    route: '/settings',
  },
])
</script>

<style lang="scss" scoped>
// ── Header ────────────────────────────────────────────────────
.slt-header {
  background: linear-gradient(135deg, #002f6c 0%, #003f87 60%, #0055a5 100%);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
}

.slt-brand-title {
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;

  .slt-brand-sub {
    font-size: 0.7rem;
    font-weight: 400;
    opacity: 0.65;
    margin-left: 6px;
    display: none; // hide on mobile

    @media (min-width: 600px) {
      display: inline;
    }
  }
}

// ── Global search ─────────────────────────────────────────────
.slt-global-search {
  @media (max-width: 768px) {
    display: none !important;
  }
}

// ── Breadcrumbs ───────────────────────────────────────────────
.slt-breadcrumb-bar {
  background: rgba(0, 0, 0, 0.15);
  font-size: 0.78rem;
}

// ── Drawer ────────────────────────────────────────────────────
.slt-drawer {
  background: linear-gradient(180deg, #002056 0%, #003f87 40%, #004fa3 100%);
}

.slt-drawer-header {
  min-height: 110px;
  background: rgba(0, 0, 0, 0.2);
}

.slt-drawer-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

// ── Nav Items ─────────────────────────────────────────────────
.slt-nav-item {
  transition: background 0.18s ease;
  min-height: 48px;

  &:hover {
    background: rgba(255, 255, 255, 0.1) !important;
  }
}

.slt-nav-active {
  background: rgba(255, 255, 255, 0.18) !important;
  border-left: 3px solid #f7941d !important;

  .q-icon,
  .q-item__label {
    color: #fff !important;
    font-weight: 700;
  }
}

// ── Page background ───────────────────────────────────────────
.slt-page-bg {
  background: #f0f4f9;
}
</style>
