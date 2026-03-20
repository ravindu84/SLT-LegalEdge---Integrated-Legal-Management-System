import { defineStore } from 'pinia'
import { Preferences } from '@capacitor/preferences'
import { Network } from '@capacitor/network'
import { supabase } from 'src/boot/supabase'

export const useSyncStore = defineStore('sync', {
  state: () => ({
    isOnline: true,
    offlineQueue: [], // Array of { id, table, action, data, timestamp }
  }),
  actions: {
    async initializeNetworkListener() {
      // Check initial status
      const status = await Network.getStatus()
      this.isOnline = status.connected

      // Listen for changes
      Network.addListener('networkStatusChange', async (status) => {
        const wasOffline = !this.isOnline
        this.isOnline = status.connected
        console.log('Network status changed:', status.connected ? 'Online' : 'Offline')

        if (status.connected && wasOffline) {
          await this.flushQueue()
        }
      })

      // Load pending queue from preferences
      await this.loadQueue()
    },

    async loadQueue() {
      const { value } = await Preferences.get({ key: 'slt_offline_sync_queue' })
      if (value) {
        this.offlineQueue = JSON.parse(value)
      }
    },

    async saveQueue() {
      await Preferences.set({
        key: 'slt_offline_sync_queue',
        value: JSON.stringify(this.offlineQueue)
      })
    },

    async enqueueAction(table, action, data) {
      if (this.isOnline) {
        // Direct to supabase if online
        try {
          if (action === 'UPSERT') {
            await supabase.from(table).upsert(data)
          } else if (action === 'DELETE') {
            await supabase.from(table).delete().match(data)
          }
          return { success: true, offline: false }
        } catch (e) {
          console.error('Direct Sync Error, falling back to offline queue', e)
        }
      }

      // Add to queue
      this.offlineQueue.push({
        id: crypto.randomUUID(),
        table,
        action,
        data,
        timestamp: new Date().toISOString()
      })
      await this.saveQueue()
      return { success: true, offline: true }
    },

    async flushQueue() {
      if (this.offlineQueue.length === 0 || !this.isOnline) return

      console.log(`Flushing ${this.offlineQueue.length} items to Supabase...`)
      const failedItems = []

      for (const item of this.offlineQueue) {
        try {
          if (item.action === 'UPSERT') {
            await supabase.from(item.table).upsert(item.data)
          } else if (item.action === 'DELETE') {
            await supabase.from(item.table).delete().match(item.data)
          }
        } catch (error) {
          console.error(`Failed to flush item ${item.id}`, error)
          failedItems.push(item)
        }
      }

      // Keep only failed items in the queue
      this.offlineQueue = failedItems
      await this.saveQueue()
      console.log('Sync flush complete. Remaining in queue:', failedItems.length)
    },

    async clearQueue() {
      this.offlineQueue = []
      await Preferences.remove({ key: 'slt_offline_sync_queue' })
    }
  }
})
