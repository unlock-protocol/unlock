/* eslint no-console: 0 */

const PuppeteerEnvironment = require('jest-environment-puppeteer')
const serverIsUp = require('./serverIsUp')
const erc20IsUp = require('./erc20IsUp')
const locksAreDeployed = require('./locksAreDeployed')

const {
  unlockPort,
  locksmithPort,
  paywallPort,
  unlockProviderAppPort,
  unlockHost,
  locksmithHost,
  paywallHost,
  unlockProviderUnlockHost,
} = require('./vars.js')

class UnlockEnvironment extends PuppeteerEnvironment {
  async setup() {
    await super.setup()
    console.log(`Waiting for Unlock at ${unlockHost}:${unlockPort}`)
    await serverIsUp(
      unlockHost,
      unlockPort,
      1000 /* every s */,
      120 /* up to 2m */
    )
    console.log(`Waiting for Locksmith at ${locksmithHost}:${locksmithPort}`)
    await serverIsUp(
      locksmithHost,
      locksmithPort,
      1000 /* every s */,
      120 /* up to 2m */
    )
    console.log(`Waiting for Paywall at ${paywallHost}:${paywallPort}`)
    await serverIsUp(
      paywallHost,
      paywallPort,
      1000 /* every s */,
      120 /* up to 2m */
    )
    console.log(
      `Waiting for Unlock without an injected provider at ${unlockProviderUnlockHost}:${unlockProviderAppPort}`
    )
    await serverIsUp(
      unlockProviderUnlockHost,
      unlockProviderAppPort,
      1000 /* every s */,
      120 /* up to 2m */
    )
    console.log('Waiting for ERC20 setup')
    await erc20IsUp({ delay: 1000, maxAttempts: 60 })

    console.log('Waiting for Locks to Deploy')
    await locksAreDeployed({ delay: 1000, maxAttempts: 60 })
    this.global.page.setViewport({ width: 1024, height: 768 })
    console.log('Ready!')
  }

  async teardown() {
    await super.teardown()
  }
}

module.exports = UnlockEnvironment
