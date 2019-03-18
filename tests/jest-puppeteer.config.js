/**
 * When running on travis, the CI env variable is set to true, so we run in a headless way without
 * dev tools. When running locally we can use a full chrome with dev tools/
 */
module.exports = {
  launch: {
    headless: true,
    devtools: false,
    args: [
      // Required for Docker version of Puppeteer
      '--no-sandbox',
      '--disable-setuid-sandbox',
      // This will write shared memory files into /tmp instead of /dev/shm,
      // because Docker’s default for /dev/shm is 64MB
      '--disable-dev-shm-usage',
    ],
  },
  browserContext: 'default',
}
