const { setup: setupPuppeteer } = require('jest-environment-puppeteer')
const config = require('./app.config')
const reactApp = require('../../unlock-app/src/_server')

/**
 * Function that setups the environment before running integration tests
 * Make sure you run npm run build inside `unlock-app` before running this
 */
module.exports = async () => {
  const [http, app] = await reactApp(config.port, false)

  global.UNLOCK_INTEGRATION_TESTS = {
    http,
    app,
  }
  await setupPuppeteer()
}
