const { setup: setupPuppeteer } = require('jest-environment-puppeteer')
const reactApp = require('../../unlock-app/src/_server')


module.exports = async () => {
  const [http, app] = await reactApp(3000, true)

  global.UNLOCK_INTEGRATION_TESTS = {
    http,
    app
  }

  await setupPuppeteer()
}

