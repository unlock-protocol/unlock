/**
 * When running on travis, the CI env variable is set to true, so we run in a headless way without
 * dev tools. When running locally we can use a full chrome with dev tools/
 */
module.exports = {
  launch: {
    headless: true,
    devtools: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  },
  browserContext: 'default',
}
