const {
  unlockHost,
  unlockPort,
  paywallHost,
  paywallPort,
  httpProviderHost,
  httpProviderPort,
} = require('./vars')

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
  main: (path = '/') => `http://${unlockHost}:${unlockPort}${path}`,
  paywall: (path = '/') => `http://${paywallHost}:${paywallPort}${path}`,
  newdemo: (lockAddress) =>
    `http://${paywallHost}:${paywallPort}/newdemo?lock=${lockAddress}`,
  provider: () => `http://${httpProviderHost}:${httpProviderPort}`,
}
