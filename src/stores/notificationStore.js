import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from 'src/boot/supabase'

export const useNotificationStore = defineStore('notifications', () => {
  // ── State ───────────────────────────────────────────────────────
  const notifications = ref([])
  const loading = ref(false)

  // ── Getters ─────────────────────────────────────────────────────
  const unreadCount = computed(() => notifications.value.filter((n) => !n.read).length)

  const sortedNotifications = computed(() =>
    [...notifications.value].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
  )

  // ── Actions ─────────────────────────────────────────────────────
  async function syncNotifications() {
    loading.value = true
    try {
      // Parallelize fetches to avoid waterfall bottleneck
      const [hearingsResult, expiriesResult, pendingDocsResult] = await Promise.all([
        supabase
          .from('case_proceedings')
          .select('id, hearing_date, legal_cases(case_no, title)')
          .gte('hearing_date', new Date().toISOString().split('T')[0])
          .lte('hearing_date', new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]),
        supabase
          .from('agreements')
          .select('id, title, expiry_date')
          .lte('expiry_date', new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0])
          .gte('expiry_date', new Date().toISOString().split('T')[0]),
        supabase
          .from('initial_documents')
          .select('id, case_title')
          .eq('status', 'Pending')
      ])

      const newAlerts = []

      // 1. Upcoming Hearings
      if (hearingsResult.data) {
        hearingsResult.data.forEach((h) => {
          newAlerts.push({
            id: `hearing-${h.id}`,
            type: 'hearing',
            icon: 'event',
            color: 'negative',
            title: 'Upcoming Hearing',
            message: `${h.legal_cases?.title} (${h.legal_cases?.case_no}) is scheduled for ${h.hearing_date}`,
            timestamp: new Date().toISOString(),
            read: false,
          })
        })
      }

      // 2. Agreement Expiries
      if (expiriesResult.data) {
        expiriesResult.data.forEach((e) => {
          newAlerts.push({
            id: `expiry-${e.id}`,
            type: 'expiry',
            icon: 'event_busy',
            color: 'warning',
            title: 'Agreement Expiring',
            message: `${e.title} will expire on ${e.expiry_date}`,
            timestamp: new Date().toISOString(),
            read: false,
          })
        })
      }

      // 3. Pending Initial Documents
      if (pendingDocsResult.data) {
        pendingDocsResult.data.forEach((d) => {
          newAlerts.push({
            id: `doc-${d.id}`,
            type: 'approval',
            icon: 'verified',
            color: 'info',
            title: 'Pending Review',
            message: `New case document "${d.case_title}" is awaiting your review.`,
            timestamp: new Date().toISOString(),
            read: false,
          })
        })
      }

      notifications.value = newAlerts
    } catch (err) {
      console.error('Error syncing notifications:', err)
    } finally {
      loading.value = false
    }
  }

  function markAsRead(id) {
    const n = notifications.value.find((n) => n.id === id)
    if (n) n.read = true
  }

  function markAllRead() {
    notifications.value.forEach((n) => (n.read = true))
  }

  function dismiss(id) {
    notifications.value = notifications.value.filter((n) => n.id !== id)
  }

  function timeAgo(ts) {
    const diff = Date.now() - new Date(ts).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    return `${days}d ago`
  }

  return {
    notifications,
    unreadCount,
    sortedNotifications,
    syncNotifications,
    markAsRead,
    markAllRead,
    dismiss,
    timeAgo,
  }
})
