/* eslint no-console: 0 */

const PuppeteerEnvironment = require('jest-environment-puppeteer')
const serverIsUp = require('./serverIsUp')
const erc20IsUp = require('./erc20IsUp')
const locksAreDeployed = require('./locksAreDeployed')

const {
  unlockPort,
  locksmithPort,
  paywallPort,
  unlockHost,
  locksmithHost,
  paywallHost,
  theGraphHost,
  theGraphPort,
} = require('./vars.js')

class UnlockEnvironment extends PuppeteerEnvironment {
  async setup() {
    console.log('Setting up environment')
    await super.setup()
    console.log(`Waiting for Unlock at ${unlockHost}:${unlockPort}`)
    await serverIsUp(
      unlockHost,
      unlockPort,
      1000 /* every s */,
      60 * 5 /* up to 5m, building takes more than 1 minute! */
    )
    console.log(`Waiting for Locksmith at ${locksmithHost}:${locksmithPort}`)
    await serverIsUp(
      locksmithHost,
      locksmithPort,
      1000 /* every s */,
      60 * 2 /* up to 2m */
    )
    console.log(`Waiting for Subgraph at ${theGraphHost}:${theGraphPort}`)
    await serverIsUp(
      theGraphHost,
      theGraphPort,
      1000 /* every s */,
      60 * 2 /* up to 2m */
    )
    console.log(`Waiting for Paywall at ${paywallHost}:${paywallPort}`)
    await serverIsUp(
      paywallHost,
      paywallPort,
      1000 /* every s */,
      60 * 2 /* up to 2m */
    )

    console.log('Waiting for ERC20 setup')
    await erc20IsUp({ delay: 100, maxAttempts: 600 })

    console.log('Waiting for Locks to Deploy')
    await locksAreDeployed({ delay: 1000, maxAttempts: 60 })

    console.log('Setting viewport')
    this.global.page.setViewport({ width: 1024, height: 768 })

    console.log('Ready!')
  }

  async teardown() {
    await super.teardown()
  }
}

module.exports = UnlockEnvironment
