const net = require('net')
const PuppeteerEnvironment = require('jest-environment-puppeteer')

const port = process.env.UNLOCK_PORT || 3000

/**
 * This is a helper function to ensure that we start the test suite only when the server is up
 * We will retry for
 */
const serverIsUp = (delay, maxAttempts) => new Promise((resolve, reject) => {
  let attempts = 1
  const tryConnecting = () => {
    const socket = net.connect(
      port,
      'unlock',
      () => {
        resolve()
        return socket.end() // clean-up
      }
    )

    socket.on('error', (error) => {
      if (error.code === 'ECONNREFUSED') {
        if (attempts < maxAttempts) {
          attempts += 1
          return setTimeout(tryConnecting, delay)
        }
        return reject(error)
      }
      return reject(error)
    })
  }
  tryConnecting()
})

class UnlockEnvironment extends PuppeteerEnvironment {
  async setup() {
    await super.setup()
    await serverIsUp(1000 /* every second */, 120 /* up to 2 minutes */)
  }

  async teardown() {
    await super.teardown()
  }
}

module.exports = UnlockEnvironment
