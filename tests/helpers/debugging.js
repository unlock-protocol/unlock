/* eslint no-console: 0 */

/**
 * debugPage [local dev only]
 *
 * Use debugPage() to display the output of console.log from within the page context.
 * It should be called at the point you would like logging to begin with:
 *
 * debugPage(page, true)
 *
 * ****************************
 * screenshot [local or CI dev]
 *
 * screenshot() will immediately take a screenshot and save it. It accepts
 * an optional filename prefix, which defaults to 'test'. With each call to
 * screenshot, the file generated has a unique name based on a counter. The
 * counter increments every time screenshot is called regardless of the filename
 * prefix. These calls:
 *
 * screenshot(page)
 * screenshot(page, 'different')
 * screenshot(page)
 *
 * will generate files '/screenshots/test-1.png', '/screenshots/different-2.png', and
 * '/screenshots/test-3.png'
 *
 * screenshot can be used either in development or production. Be aware that on Mac
 * OS X screenshots take a minimum of 1/6 second, and can distort timing results, so
 * should only be used for development of integration tests.
 *
 * screenshots are saved into /tmp/screenshots
 *
 * ****************************
 * screenshotOnFail [local and CI]
 *
 * screenshotOnFail() is designed to be a replacement for jest's "it"
 * that is used to take a screenshot on any test failure. It is a factory
 * that returns the replacement for "it." Usage:
 *
 * const it = screenshotOnFail(page)
 *
 * Note that there is no requirement that it replace "it", and one could just as easily use:
 *
 * const itWithScreenshot = screenshotOnFail(page)
 *
 * screenshots are saved into /tmp/screenshots for local dev, and will appear on CircleCI
 * in the Artifacts section of integration tests for viewing when the tests conplete.
 * Screenshot names are based on the test description.
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
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await
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
