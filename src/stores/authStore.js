import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from 'src/boot/supabase'

export const useAuthStore = defineStore('auth', () => {
  // ── State ───────────────────────────────────────────────────────
  const user = ref(null)
  const profile = ref(null)
  const isLoggedIn = ref(false)
  const loading = ref(true)

  // ── Getters ─────────────────────────────────────────────────────
  const displayName = computed(() => profile.value?.full_name || user.value?.email || 'User')
  const userInitials = computed(() => {
    const name = profile.value?.full_name || ''
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  })
  const userRole = computed(() => profile.value?.role || 'legal_officer')
  const userEmail = computed(() => user.value?.email || '')
  const userAvatar = computed(() => profile.value?.avatar_url || '')
  const userDepartment = computed(() => profile.value?.department || '')
  const userDesignation = computed(() => profile.value?.designation || '')
  const userPhone = computed(() => profile.value?.phone || '')

  // ── Actions ─────────────────────────────────────────────────────

  let initPromise = null

  /**
   * Initialize auth state — call on app startup
   */
  async function init() {
    if (isLoggedIn.value && user.value) return
    if (initPromise) return initPromise

    initPromise = (async () => {
      loading.value = true
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          user.value = session.user
          isLoggedIn.value = true
          await fetchProfile()
        }

        // Listen for auth state changes
        supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            user.value = session.user
            isLoggedIn.value = true
            await fetchProfile()
          } else if (event === 'SIGNED_OUT') {
            user.value = null
            profile.value = null
            isLoggedIn.value = false
          }
        })
      } catch (err) {
        console.error('Auth init error:', err)
      } finally {
        loading.value = false
        initPromise = null
      }
    })()

    return initPromise
  }

  /**
   * Fetch user profile from profiles table
   */
  async function fetchProfile() {
    if (!user.value) return

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.value.id)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      // Profile might not exist yet (trigger delay), create a fallback
      profile.value = {
        id: user.value.id,
        full_name: user.value.user_metadata?.full_name || 'User',
        email: user.value.email,
        role: 'legal_officer',
        department: user.value.user_metadata?.department || 'Legal',
        designation: user.value.user_metadata?.designation || '',
        phone: '',
        avatar_url: '',
        is_active: true,
      }
    } else {
      profile.value = data
    }
  }

  /**
   * Login with email and password
   */
  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    user.value = data.user
    isLoggedIn.value = true
    await fetchProfile()
    return data
  }

  /**
   * Register a new user
   */
  async function register(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: metadata.fullName || '',
          department: metadata.department || 'Legal',
          designation: metadata.designation || '',
          role: metadata.role || 'legal_officer',
        },
      },
    })

    if (error) throw error
    return data
  }

  /**
   * Logout
   */
  async function logout() {
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.error('Supabase signOut error:', err)
    } finally {
      // ALWAYS clear local state regardless of server response
      user.value = null
      profile.value = null
      isLoggedIn.value = false
      localStorage.clear() // Extra safety
      sessionStorage.clear()
    }
  }

  /**
   * Update profile in database
   */
  async function updateProfile(updates) {
    if (!user.value) return

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.value.id)
      .select()
      .single()

    if (error) throw error
    profile.value = data
    return data
  }

  return {
    // State
    user,
    profile,
    isLoggedIn,
    loading,
    // Getters
    displayName,
    userInitials,
    userRole,
    userEmail,
    userAvatar,
    userDepartment,
    userDesignation,
    userPhone,
    // Actions
    init,
    fetchProfile,
    login,
    register,
    logout,
    updateProfile,
  }
})
