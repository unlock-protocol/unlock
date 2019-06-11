/* eslint no-console: 0 */

const PuppeteerEnvironment = require('jest-environment-puppeteer')
const serverIsUp = require('./serverIsUp')

const unlockPort = process.env.UNLOCK_PORT || 3000
const locksmithPort = process.env.LOCKSMITH_PORT || 8080
const paywallPort = process.env.PAYWALL_PORT || 3001
const ci = process.env.CI

const unlockHost = ci ? 'unlock-app' : '127.0.0.1'
const locksmithHost = ci ? 'locksmith' : '127.0.0.1'
const paywallHost = ci ? 'paywall-integration' : '127.0.0.1'

class UnlockEnvironment extends PuppeteerEnvironment {
  async setup() {
    await super.setup()
    console.log('Waiting for Unlock')
    await serverIsUp(
      unlockHost,
      unlockPort,
      1000 /* every s */,
      120 /* up to 2m */
    )
    console.log('Waiting for Locksmith')
    await serverIsUp(
      locksmithHost,
      locksmithPort,
      1000 /* every s */,
      120 /* up to 2m */
    )
    console.log('Waiting for Paywall')
    await serverIsUp(
      paywallHost,
      paywallPort,
      1000 /* every s */,
      120 /* up to 2m */
    )
    this.global.page.setViewport({ width: 1024, height: 768 })
    console.log('Ready!')
  }

  async teardown() {
    await super.teardown()
  }
}

module.exports = UnlockEnvironment
