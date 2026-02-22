import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // ── State ───────────────────────────────────────────────────────
  const user = ref({
    id: 2,
    name: 'N. Silva',
    email: 'n.silva@slt.com.lk',
    role: 'Legal Officer',
    department: 'Legal',
    initials: 'NS',
    phone: '+94 11 2 021 001',
    joinedDate: '2022-03-15',
  })

  const isLoggedIn = ref(true)

  // ── Getters ─────────────────────────────────────────────────────
  const displayName = computed(() => user.value.name)
  const userInitials = computed(() => user.value.initials)
  const userRole = computed(() => user.value.role)

  // ── Actions ─────────────────────────────────────────────────────
  function login(rolePreset) {
    const presets = {
      officer: {
        id: 2,
        name: 'N. Silva',
        email: 'n.silva@slt.com.lk',
        role: 'Legal Officer',
        department: 'Legal',
        initials: 'NS',
        phone: '+94 11 2 021 001',
        joinedDate: '2022-03-15',
      },
      manager: {
        id: 1,
        name: 'K. Fernando, AGM',
        email: 'k.fernando@slt.com.lk',
        role: 'Manager',
        department: 'Legal',
        initials: 'KF',
        phone: '+94 11 2 021 010',
        joinedDate: '2019-06-01',
      },
      executive: {
        id: 5,
        name: 'S. Karunaratne, DGM',
        email: 's.karunaratne@slt.com.lk',
        role: 'Executive',
        department: 'Legal',
        initials: 'SK',
        phone: '+94 11 2 021 100',
        joinedDate: '2017-01-10',
      },
      admin: {
        id: 8,
        name: 'System Admin',
        email: 'admin@slt.com.lk',
        role: 'Admin',
        department: 'IT',
        initials: 'AD',
        phone: '+94 11 2 021 999',
        joinedDate: '2020-01-01',
      },
    }
    user.value = presets[rolePreset] || presets.officer
    isLoggedIn.value = true
  }

  function logout() {
    isLoggedIn.value = false
  }

  return { user, isLoggedIn, displayName, userInitials, userRole, login, logout }
})
