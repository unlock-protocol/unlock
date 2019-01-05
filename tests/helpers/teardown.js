const { teardown: teardownPuppeteer } = require('jest-environment-puppeteer')

module.exports = async () => {
  await teardownPuppeteer()
}
