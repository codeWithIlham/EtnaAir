import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    env: {
      apiUrl: 'http://localhost:3000',
      adminEmail: 'admin@etnair.com',
      adminPassword: 'password',
      hostEmail: 'james.carter@email.com',
      hostPassword: 'password',
      guestEmail: 'oliver.davis@email.com',
      guestPassword: 'password',
    },
    setupNodeEvents(on, config) {},
  },
})
