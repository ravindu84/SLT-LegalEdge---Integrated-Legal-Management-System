<template>
  <q-layout view="lHh Lpr lFf">
    <!-- ─── TOP HEADER ─────────────────────────────────────── -->
    <q-header class="exec-header" elevated>
      <q-toolbar class="q-px-md">
        <!-- Hamburger -->
        <q-btn flat dense round icon="menu" color="white" @click="toggleLeftDrawer" />

        <!-- Brand -->
        <q-toolbar-title class="exec-brand cursor-pointer" @click="$router.push('/')">
          <q-icon name="gavel" size="24px" class="q-mr-sm" />
          SLT LegalEdge
        </q-toolbar-title>

        <!-- Global Search -->
        <q-input
          v-model="globalSearch"
          dense
          outlined
          rounded
          :placeholder="$t('common.search') || 'Search cases, agreements…'"
          class="exec-search q-mr-md"
          style="width: 280px"
        >
          <template #prepend><q-icon name="search" color="grey-5" /></template>
          <template #append>
            <q-icon
              v-if="globalSearch"
              name="close"
              class="cursor-pointer"
              @click="globalSearch = ''"
            />
          </template>
        </q-input>

        <!-- Right actions -->
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

        <q-separator vertical inset color="white" class="q-mx-sm opacity-30" />

        <!-- User dropdown -->
        <q-btn-dropdown flat no-caps color="white" class="q-ml-sm">
          <template #label>
            <q-avatar
              size="32px"
              color="primary"
              text-color="white"
              class="q-mr-sm"
              font-size="13px"
            >
              {{ authStore.userInitials }}
            </q-avatar>
            <span class="text-body2">{{ authStore.displayName }}</span>
          </template>
          <q-list style="min-width: 200px">
            <q-item clickable v-close-popup :to="'/profile'">
              <q-item-section avatar><q-icon name="person" /></q-item-section>
              <q-item-section>{{ $t('common.myProfile') }}</q-item-section>
            </q-item>
            <q-item clickable v-close-popup :to="'/settings'">
              <q-item-section avatar><q-icon name="settings" /></q-item-section>
              <q-item-section>{{ $t('nav.settings') }}</q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup class="text-negative" @click="logout">
              <q-item-section avatar><q-icon name="logout" color="negative" /></q-item-section>
              <q-item-section>{{ $t('common.logout') }}</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>

      <!-- Breadcrumbs -->
      <div class="exec-breadcrumb q-px-md q-py-xs" v-if="breadcrumbs.length">
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
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered dark class="exec-drawer">
      <!-- Profile section -->
      <div class="exec-drawer-profile column items-center q-py-lg">
        <q-avatar
          size="64px"
          color="primary"
          text-color="white"
          font-size="24px"
          class="exec-avatar-ring"
        >
          {{ authStore.userInitials }}
        </q-avatar>
        <div class="text-white text-weight-bold text-subtitle1 q-mt-sm">
          {{ authStore.displayName }}
        </div>
        <q-badge rounded :color="roleColor" :label="authStore.userRole" class="q-mt-xs" />
        <div class="row items-center q-mt-xs">
          <div class="exec-online-dot"></div>
          <span
            class="text-caption text-grey-5 q-ml-xs"
            style="color: rgba(255, 255, 255, 0.5) !important"
            >Online</span
          >
        </div>
      </div>

      <q-separator class="opacity-10" />

      <!-- Navigation -->
      <q-list class="q-mt-sm q-px-sm q-pb-xl">
        <q-item-label header class="exec-nav-header">
          {{ $t('nav.mainMenu') }}
        </q-item-label>

        <template v-for="(item, idx) in navItems" :key="item.label || item.separator || idx">
          <q-item-label v-if="item.separator" header class="exec-nav-header q-mt-md">
            {{ item.separator }}
          </q-item-label>

          <q-item
            v-else
            :to="item.route"
            exact
            clickable
            active-class="exec-nav-active"
            class="exec-nav-item text-white q-mb-xs rounded-borders"
          >
            <q-item-section avatar>
              <q-icon :name="item.icon" size="22px" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">{{ item.label }}</q-item-label>
              <q-item-label caption class="opacity-50 text-white" style="font-size: 0.7rem">
                {{ item.caption }}
              </q-item-label>
            </q-item-section>
            <q-item-section v-if="item.badge" side>
              <q-badge :color="item.badgeColor || 'accent'" :label="item.badge" rounded />
            </q-item-section>
          </q-item>
        </template>
      </q-list>

      <!-- Footer -->
      <div class="exec-drawer-footer absolute-bottom q-pa-md text-caption opacity-30 text-white">
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
import { useI18n } from 'vue-i18n'
import { useAuthStore } from 'src/stores/authStore'
import { useNotificationStore } from 'src/stores/notificationStore'
import NotificationsDrawer from 'src/components/NotificationsDrawer.vue'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
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

// ── Role color ────────────────────────────────────────────────
const roleColor = computed(() => {
  const map = {
    Admin: 'deep-purple',
    Executive: 'positive',
    Manager: 'info',
    'Legal Officer': 'cyan-7',
  }
  return map[authStore.userRole] || 'grey-6'
})

// ── Breadcrumbs ───────────────────────────────────────────────
const routeMetaKeys = {
  '/': { key: 'breadcrumb.dashboard', icon: 'dashboard' },
  '/initial-docs': { key: 'breadcrumb.initialDocs', icon: 'description' },
  '/cases': { key: 'breadcrumb.legalCases', icon: 'gavel' },
  '/agreements': { key: 'breadcrumb.agreements', icon: 'handshake' },
  '/approvals': { key: 'breadcrumb.approvals', icon: 'verified' },
  '/reports': { key: 'breadcrumb.reports', icon: 'bar_chart' },
  '/settings': { key: 'breadcrumb.settings', icon: 'settings' },
  '/profile': { key: 'breadcrumb.profile', icon: 'person' },
}

const breadcrumbs = computed(() => {
  const path = route.path
  if (path === '/') return []
  const crumbs = [{ label: t('breadcrumb.home'), icon: 'home', to: '/' }]
  const meta = routeMetaKeys[path]
  if (meta) crumbs.push({ label: t(meta.key), icon: meta.icon })
  return crumbs
})

// ── Navigation items (Filtered by Department) ─────────────────
const navItems = computed(() => {
  const dept = authStore.user.department
  const allItems = [
    {
      label: t('nav.dashboard'),
      caption: t('nav.dashboardCaption'),
      icon: 'dashboard',
      route: '/',
    },
    {
      group: 'Legal',
      separator: t('nav.legalCasesGroup'),
    },
    {
      group: 'Legal',
      label: t('nav.initialDocs'),
      caption: t('nav.initialDocsCaption'),
      icon: 'description',
      route: '/initial-docs',
      badge: '5',
      badgeColor: 'warning',
    },
    {
      group: 'Legal',
      label: t('nav.legalCases'),
      caption: t('nav.legalCasesCaption'),
      icon: 'gavel',
      route: '/cases',
    },
    { separator: t('nav.agreementsGroup') },
    {
      label: t('nav.agreements'),
      caption: t('nav.agreementsCaption'),
      icon: 'handshake',
      route: '/agreements',
    },
    {
      label: t('nav.approvals'),
      caption: t('nav.approvalsCaption'),
      icon: 'verified',
      route: '/approvals',
      badge: String(notifStore.unreadCount),
      badgeColor: 'negative',
    },
    { separator: t('nav.systemGroup') },
    {
      label: t('nav.reports'),
      caption: t('nav.reportsCaption'),
      icon: 'bar_chart',
      route: '/reports',
    },
    {
      label: t('nav.settings'),
      caption: t('nav.settingsCaption'),
      icon: 'settings',
      route: '/settings',
    },
  ]

  // Filter out Legal items if user is not in Legal department
  if (dept !== 'Legal') {
    return allItems.filter((item) => item.group !== 'Legal')
  }
  return allItems
})
</script>

<style lang="scss" scoped>
// ── Header — always dark (brand element) ──────────────────────
.exec-header {
  background: linear-gradient(135deg, #002f6c 0%, #003f87 60%, #0055a5 100%);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
}

.exec-brand {
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.4px;
  display: flex;
  align-items: center;
}

.exec-search {
  :deep(.q-field__control) {
    background: rgba(255, 255, 255, 0.1) !important;
    border-color: rgba(255, 255, 255, 0.15) !important;
  }
  :deep(.q-field__native) {
    color: #e0e0e0 !important;
  }

  @media (max-width: 768px) {
    display: none !important;
  }
}

.exec-breadcrumb {
  background: rgba(0, 0, 0, 0.15);
  font-size: 0.78rem;
}

// ── Drawer — always dark (brand element) ──────────────────────
.exec-drawer {
  background: linear-gradient(180deg, #002056 0%, #003f87 40%, #004fa3 100%) !important;
  border-right: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.exec-drawer-profile {
  min-height: 140px;
  background: rgba(0, 0, 0, 0.15);
}

.exec-avatar-ring {
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.25);
}

.exec-online-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4caf50;
  box-shadow: 0 0 6px rgba(76, 175, 80, 0.5);
}

.exec-drawer-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

// ── Nav Items ─────────────────────────────────────────────────
.exec-nav-header {
  color: rgba(255, 255, 255, 0.35) !important;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding-left: 12px;
}

.exec-nav-item {
  transition: background 0.18s ease;
  min-height: 44px;
  border-radius: 8px;

  &:hover {
    background: rgba(255, 255, 255, 0.08) !important;
  }
}

.exec-nav-active {
  background: rgba(255, 255, 255, 0.15) !important;
  border-left: 3px solid #f7941d !important;

  .q-icon {
    color: #fff !important;
  }
  .q-item__label {
    color: #fff !important;
    font-weight: 700;
  }
}
</style>
