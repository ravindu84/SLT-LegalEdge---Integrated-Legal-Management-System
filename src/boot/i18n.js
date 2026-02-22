import { defineBoot } from '#q-app/wrappers'
import { createI18n } from 'vue-i18n'
import messages from 'src/i18n'

// Create i18n instance and export it so other files can import the locale ref
export const i18n = createI18n({
  locale: 'en-US',
  fallbackLocale: 'en-US',
  legacy: false,
  globalInjection: true,
  messages,
})

export default defineBoot(({ app }) => {
  app.use(i18n)
})
