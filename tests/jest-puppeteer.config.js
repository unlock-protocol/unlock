/**
 * Pupeteer options.
 * For debugging it may be helpful to run this with headless: false and slowMo:1000 (adds a second
 * to each action). See https://github.com/GoogleChrome/puppeteer for more.
 */
module.exports = {
  launch: {
    args: ['--no-sandbox'],
    headless: true,
    // devtools: true,
    // slowMo: 1000,
  },
  browserContext: 'default',
}
