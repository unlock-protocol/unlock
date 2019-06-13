const host = process.env.UNLOCK_HOST || '127.0.0.1'
const port = process.env.UNLOCK_PORT || 3000
const paywall = process.env.PAYWALL_URL || 'http://127.0.0.1:3001'
const provider = process.env.READ_ONLY_PROVIDER || 'http://localhost:8545'

/**
 * Use these helpers to get relative paths inside the main unlock-app and the paywall.
 * So, for instance, to access the paywall in the main window, use:
 *
 * paywall('/0x.....')
 *
 * To access the dashboard, use:
 *
 * main('/dashboard')
 */
module.exports = {
  main: (path = '/') => `http://${host}:${port}${path}`,
  paywall: (path = '/') => `${paywall}${path}`,
  provider,
}
