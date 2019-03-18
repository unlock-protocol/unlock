/* eslint no-console: 0 */

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
