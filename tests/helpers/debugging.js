/* eslint no-console: 0 */

/**
 * debugPage
 ***********
 *
 * debugPage is used to turn on the display of console.log calls within the browser context.
 * This includes calls within page.evaluate and page.waitForFunction.
 *
 * Usage:
 *
 * debugPage(page, true)
 *
 * screenshot
 ************
 *
 * screenshot is used to take a screenshot. It will work both locally when run with the
 * scripts/local-docker-integration-tests.sh script or on CI. Screenshots locally are
 * placed in the current directory. In CI, they are found in the artifacts on CircleCI.
 *
 * Usage:
 *
 * await screenshot(page) // creates test-1.jpg
 * await screenshot(page) // creates test-2.jpg
 * await screenshot(page, 'another') // creates another-3.jpg
 *
 * The numeric prefix is always unique and represents the order of the screenshot.
 */
let counter = 1
module.exports = {
  debugPage(page, debug = false) {
    if (debug) {
      page.on('console', async (msg) => {
        const locationInfo = msg.location()
        const fileInfo = `${locationInfo.url ? locationInfo.url : ''}${
          locationInfo.lineNumber !== undefined ? ` Line ${locationInfo.lineNumber}` : ''
        }`
        const args = await Promise.all(msg.args().map(arg => arg.jsonValue()))
        console.log(`console.${msg.type()} ${fileInfo}`, args)
      })
    }
  },
  async screenshot(page, file = 'test') {
    await page.screenshot({ path: `/screenshots/${file}-${counter}.jpg`, fullPage: true })
    counter += 1
  },
}
