<template>
  <q-dialog v-model="drawerOpen" position="right" maximized>
    <q-card class="slt-notif-card column no-wrap" style="width: 400px; max-width: 90vw">
      <!-- ─── Header ───────────────────────────────────────────── -->
      <q-bar class="slt-notif-bar text-white">
        <q-icon name="notifications" />
        <div class="text-weight-bold q-ml-sm">Notifications</div>
        <q-badge
          v-if="store.unreadCount"
          :label="store.unreadCount"
          color="negative"
          rounded
          class="q-ml-sm"
        />
        <q-space />
        <q-btn
          flat
          dense
          no-caps
          size="sm"
          label="Mark All Read"
          icon="done_all"
          class="text-white"
          @click="store.markAllRead()"
        />
        <q-btn dense flat icon="close" class="text-white" @click="drawerOpen = false" />
      </q-bar>

      <!-- ─── Notification List ────────────────────────────────── -->
      <q-scroll-area class="col" style="height: calc(100vh - 50px)">
        <div
          v-if="!store.sortedNotifications.length"
          class="column flex-center q-pa-xl text-grey-5"
        >
          <q-icon name="notifications_off" size="56px" />
          <div class="q-mt-sm text-body2">No notifications</div>
        </div>

        <q-list separator v-else>
          <q-item
            v-for="notif in store.sortedNotifications"
            :key="notif.id"
            clickable
            v-ripple
            :class="{ 'slt-notif-unread': !notif.read }"
            class="q-py-sm"
            @click="store.markAsRead(notif.id)"
          >
            <q-item-section avatar>
              <q-avatar :color="notif.color" text-color="white" size="38px">
                <q-icon :name="notif.icon" size="20px" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-bold text-grey-9" style="font-size: 0.82rem">
                {{ notif.title }}
              </q-item-label>
              <q-item-label
                caption
                lines="2"
                class="text-grey-6"
                style="font-size: 0.75rem; line-height: 1.3"
              >
                {{ notif.message }}
              </q-item-label>
              <q-item-label caption class="text-grey-4 q-mt-xs" style="font-size: 0.7rem">
                {{ store.timeAgo(notif.timestamp) }}
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <div class="column q-gutter-xs">
                <q-badge
                  v-if="!notif.read"
                  color="primary"
                  rounded
                  dot
                  style="width: 8px; height: 8px"
                />
                <q-btn
                  flat
                  round
                  dense
                  icon="close"
                  size="xs"
                  color="grey-5"
                  @click.stop="store.dismiss(notif.id)"
                >
                  <q-tooltip>Dismiss</q-tooltip>
                </q-btn>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useNotificationStore } from 'src/stores/notificationStore'

const store = useNotificationStore()

const drawerOpen = defineModel({ type: Boolean, default: false })
</script>

<style lang="scss" scoped>
.slt-notif-card {
  border-radius: 0 !important;
}

.slt-notif-bar {
  background: linear-gradient(135deg, #002f6c 0%, #003f87 100%);
  min-height: 50px;
}

.slt-notif-unread {
  background: #f0f5ff;
  border-left: 3px solid #003f87;
}
</style>
