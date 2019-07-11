/* eslint no-console: 0 */

const PuppeteerEnvironment = require('jest-environment-puppeteer')
const serverIsUp = require('./serverIsUp')
const erc20IsUp = require('./erc20IsUp')

const unlockPort = process.env.UNLOCK_PORT || 3000
const locksmithPort = process.env.LOCKSMITH_PORT || 8080
const paywallPort = process.env.PAYWALL_PORT || 3001
const ci = process.env.CI

const unlockHost = ci ? 'unlock-app' : '127.0.0.1'
const locksmithHost = ci ? 'locksmith' : '127.0.0.1'
const paywallHost = ci ? 'paywall' : '127.0.0.1'

class UnlockEnvironment extends PuppeteerEnvironment {
  async setup() {
    await super.setup()
    console.log(`Waiting for Unlock (${unlockHost})`)
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

    console.log('The Unlock Provider App')
    await serverIsUp(
      'unlock-provider-unlock-app',
      9000,
      1000 /* every s */,
      120 /* up to 2m */
    )

    console.log('Waiting for ERC20 setup')
    await erc20IsUp({ delay: 1000, maxAttempts: 60 })
    this.global.page.setViewport({ width: 1024, height: 768 })
    console.log('Ready!')
  }

  async teardown() {
    await super.teardown()
  }
}

module.exports = UnlockEnvironment
