const { teardown: teardownPuppeteer } = require('jest-environment-puppeteer')

module.exports = async () => {
  await global.UNLOCK_INTEGRATION_TESTS.http.close()
  await global.UNLOCK_INTEGRATION_TESTS.app.close()
  await teardownPuppeteer()
}
