<template>
  <q-layout view="lHh Lpr lFf">
    <!-- ─── TOP HEADER ─────────────────────────────────────── -->
    <q-header class="exec-header" elevated>
      <q-toolbar class="q-px-md">
        <!-- Hamburger -->
        <q-btn flat dense round icon="menu" color="white" @click="toggleLeftDrawer" />

        <!-- Brand -->
        <q-toolbar-title class="exec-brand cursor-pointer" @click="$router.push('/')">
          <img
            src="~assets/logo-main.png"
            style="
              height: 38px;
              vertical-align: middle;
              mix-blend-mode: screen;
              filter: brightness(1.2) contrast(1.1);
            "
            class="q-mr-sm"
          />
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
          <q-tooltip>{{ $t('common.notifications') }}</q-tooltip>
        </q-btn>

        <q-btn flat round dense icon="help_outline" color="white" class="q-mr-sm" :to="'/help'">
          <q-tooltip>{{ $t('common.help') }}</q-tooltip>
        </q-btn>

        <!-- Quick Language Switcher -->
        <q-btn-dropdown flat round dense icon="language" color="white" class="q-mr-xs">
          <q-list style="min-width: 150px">
            <q-item clickable v-close-popup @click="changeLang('en-US')">
              <q-item-section avatar
                ><q-icon name="img:https://flagcdn.com/w20/us.png"
              /></q-item-section>
              <q-item-section>English</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="changeLang('si')">
              <q-item-section avatar
                ><q-icon name="img:https://flagcdn.com/w20/lk.png"
              /></q-item-section>
              <q-item-section>සිංහල</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="changeLang('ta')">
              <q-item-section avatar
                ><q-icon name="img:https://flagcdn.com/w20/lk.png"
              /></q-item-section>
              <q-item-section>தமிழ்</q-item-section>
            </q-item>
          </q-list>
          <q-tooltip>{{ $t('settings.language') }}</q-tooltip>
        </q-btn-dropdown>

        <!-- Quick Dark Mode Toggle -->
        <q-btn
          flat
          round
          dense
          :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
          color="white"
          class="q-mr-xs"
          @click="$q.dark.toggle()"
        >
          <q-tooltip>{{
            $q.dark.isActive ? $t('settings.lightEnabled') : $t('settings.darkEnabled')
          }}</q-tooltip>
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
              <img v-if="authStore.userAvatar" :src="authStore.userAvatar" />
              <template v-else>{{ authStore.userInitials }}</template>
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
      <div class="exec-drawer-profile column items-center q-py-md">
        <q-avatar
          size="64px"
          color="primary"
          text-color="white"
          font-size="24px"
          class="exec-avatar-ring"
        >
          <img v-if="authStore.userAvatar" :src="authStore.userAvatar" />
          <template v-else>{{ authStore.userInitials }}</template>
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
            >{{ $t('common.online') }}</span
          >
        </div>
      </div>

      <q-separator class="opacity-10" />

      <!-- Branding/Logo section moved to bottom (will use absolute/relative container if needed, but here we just reorder the list) -->

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

      <!-- Branding Logo Area (BOTTOM) -->
      <div class="column items-center q-pb-xl">
        <div class="row flex-center q-pa-sm" style="transform: scale(0.8); opacity: 0.8">
          <img src="~assets/logo-main.png" style="width: 130px; filter: brightness(1.1)" />
        </div>
        <div class="text-caption opacity-30 text-white">SLT LegalEdge v1.0.0</div>
      </div>
    </q-drawer>

    <!-- ─── PAGE CONTAINER ──────────────────────────────────── -->
    <q-page-container class="slt-page-bg">
      <router-view />
    </q-page-container>

    <!-- ─── NOTIFICATION DRAWER ─────────────────────────────── -->
    <NotificationsDrawer v-model="showNotifDrawer" />

    <!-- ─── AI COPILOT CHAT ──────────────────────────────────── -->
    <AiCopilotChat />
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/authStore'
import { useNotificationStore } from 'src/stores/notificationStore'
import NotificationsDrawer from 'src/components/NotificationsDrawer.vue'
import AiCopilotChat from 'src/components/AiCopilotChat.vue'

const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()
const authStore = useAuthStore()
const notifStore = useNotificationStore()
const $q = useQuasar()

onMounted(() => {
  notifStore.syncNotifications()
})

const leftDrawerOpen = ref(false)
const showNotifDrawer = ref(false)
const globalSearch = ref('')

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function changeLang(lang) {
  locale.value = lang
  $q.notify({
    message: t('settings.languageChanged', {
      lang: lang === 'en-US' ? 'English' : lang === 'si' ? 'Sinhala' : 'Tamil',
    }),
    color: 'positive',
    icon: 'check',
    position: 'top',
    timeout: 1000,
  })
}

async function logout() {
  try {
    await authStore.logout()
  } catch (e) {
    console.error('Logout error:', e)
  }
  router.push('/login')
}

// ── Role color ────────────────────────────────────────────────
const roleColor = computed(() => {
  const map = {
    admin: 'deep-purple',
    supervisor: 'positive',
    manager: 'info',
    legal_officer: 'cyan-7',
    viewer: 'grey-6',
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
  '/history': { key: 'breadcrumb.history', icon: 'history' },
  '/reports': { key: 'breadcrumb.reports', icon: 'bar_chart' },
  '/help': { key: 'breadcrumb.help', icon: 'help_outline' },
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
  const dept = authStore.userDepartment
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
      label: t('nav.history'),
      caption: t('nav.historyCaption'),
      icon: 'history',
      route: '/history',
    },
    {
      label: t('nav.reports'),
      caption: t('nav.reportsCaption'),
      icon: 'bar_chart',
      route: '/reports',
    },
    {
      label: t('nav.help'),
      caption: t('nav.helpCaption'),
      icon: 'help_outline',
      route: '/help',
    },
    {
      label: t('nav.settings'),
      caption: t('nav.settingsCaption'),
      icon: 'settings',
      route: '/settings',
    },
    { separator: 'INNOVATION & AI' },
    {
      label: 'Innovation Portal',
      caption: 'Future legal tech vision',
      icon: 'auto_awesome',
      route: '/innovation',
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
