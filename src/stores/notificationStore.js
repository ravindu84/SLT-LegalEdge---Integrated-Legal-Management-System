import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useNotificationStore = defineStore('notifications', () => {
  // ── State ───────────────────────────────────────────────────────
  const notifications = ref([
    {
      id: 1,
      type: 'hearing',
      icon: 'event',
      color: 'negative',
      title: 'Urgent: Hearing Tomorrow',
      message: 'Land Acquisition – Kandy Zone (LC-2024-002) at District Court Kandy',
      timestamp: '2026-02-22T08:00:00',
      read: false,
    },
    {
      id: 2,
      type: 'approval',
      icon: 'verified',
      color: 'warning',
      title: 'Agreement Awaiting Your Approval',
      message: 'Network Maintenance Agreement (AGR-2024-008) – Pending L1 Approval',
      timestamp: '2026-02-22T07:30:00',
      read: false,
    },
    {
      id: 3,
      type: 'expiry',
      icon: 'event_busy',
      color: 'info',
      title: 'Agreement Expiring Soon',
      message: 'Data Center Lease (AGR-2023-015) expires in 30 days',
      timestamp: '2026-02-21T16:00:00',
      read: false,
    },
    {
      id: 4,
      type: 'case',
      icon: 'gavel',
      color: 'primary',
      title: 'Case Status Updated',
      message: 'Network Dispute – Galle (LC-2024-003) moved to "Active"',
      timestamp: '2026-02-21T14:20:00',
      read: true,
    },
    {
      id: 5,
      type: 'approval',
      icon: 'task_alt',
      color: 'positive',
      title: 'Document Approved',
      message: 'Initial Document ID-2024-012 approved by K. Fernando, AGM',
      timestamp: '2026-02-21T11:00:00',
      read: true,
    },
    {
      id: 6,
      type: 'system',
      icon: 'info',
      color: 'grey-7',
      title: 'System Maintenance',
      message: 'Scheduled maintenance window: 23 Feb 2026, 02:00 – 04:00 AM',
      timestamp: '2026-02-20T09:00:00',
      read: true,
    },
    {
      id: 7,
      type: 'hearing',
      icon: 'event',
      color: 'warning',
      title: 'Hearing in 5 Days',
      message: 'Tower Site Dispute – Kurunegala (LC-2024-006) at High Court, 28 Feb',
      timestamp: '2026-02-20T08:00:00',
      read: true,
    },
  ])

  // ── Getters ─────────────────────────────────────────────────────
  const unreadCount = computed(() => notifications.value.filter((n) => !n.read).length)

  const sortedNotifications = computed(() =>
    [...notifications.value].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
  )

  // ── Actions ─────────────────────────────────────────────────────
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
    markAsRead,
    markAllRead,
    dismiss,
    timeAgo,
  }
})
