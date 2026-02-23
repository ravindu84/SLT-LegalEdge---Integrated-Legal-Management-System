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
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&auto=format&fit=crop',
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
        avatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&auto=format&fit=crop',
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
        avatar:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&h=256&auto=format&fit=crop',
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
        avatar:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256&h=256&auto=format&fit=crop',
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
        avatar:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&h=256&auto=format&fit=crop',
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
