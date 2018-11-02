const PuppeteerEnvironment = require('jest-environment-puppeteer')

class UnlockEnvironment extends PuppeteerEnvironment {
  async setup() {
    await super.setup()
  }

  async teardown() {
    await super.teardown()
  }
}

module.exports = UnlockEnvironment
