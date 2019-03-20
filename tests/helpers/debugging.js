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
      page.on('console', async msg => {
        const locationInfo = msg.location()
        const fileInfo = `${locationInfo.url ? locationInfo.url : '_'}${
          locationInfo.lineNumber !== undefined
            ? ` Line ${locationInfo.lineNumber}`
            : 'Line _'
        }`
        const args = await Promise.all(msg.args().map(arg => arg.jsonValue()))
        console.log(`console.${msg.type()} ${fileInfo}`, args)
      })
    }
  },
  async screenshot(page, file = 'test') {
    await page.screenshot({
      path: `/screenshots/${file}-${counter}.png`,
      fullPage: true,
    })
    counter += 1
  },
  screenshotOnFail: page => (testDescription, code) => {
    const runTest = async () => {
      try {
        // await will do nothing for non-async code, and make async tests work
        module.exports.debugPage(page, true, true)
        await code()
        // if the code does not throw, we did not fail
      } catch (e) {
        // locally, we use the volume mounted at /screenshots
        // on CI, we use the /home/unlock/screenshots directory used to retrieve artifacts
        const screenshotPath = `/screenshots/${testDescription.replace(
          /[ ,/"'^$\\]+/g,
          '-'
        )}.png`
        console.error(`writing screenshot to ${screenshotPath}`)
        try {
          await page.screenshot({ path: screenshotPath, fullPage: true })
        } catch (screenshotError) {
          console.error(screenshotError)
        }
        throw e
      }
    }
    it(testDescription, runTest)
  },
}
