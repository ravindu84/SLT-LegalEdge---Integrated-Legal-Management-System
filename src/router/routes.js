const routes = [
  // ── Standalone pages (no sidebar layout) ─────────────────────
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
  },

  // ── Main application (with sidebar layout) ────────────────────
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'initial-docs', component: () => import('pages/InitialDocumentsPage.vue') },
      { path: 'cases', component: () => import('pages/LegalCasesPage.vue') },
      { path: 'agreements', component: () => import('pages/AgreementsPage.vue') },
      { path: 'approvals', component: () => import('pages/ApprovalsPage.vue') },
      { path: 'reports', component: () => import('pages/ReportsPage.vue') },
      { path: 'settings', component: () => import('pages/SettingsPage.vue') },
      { path: 'profile', component: () => import('pages/UserProfilePage.vue') },
    ],
  },

  // Always leave this as last one
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
