const net = require('net')

/**
 * This is a helper function to ensure that we start the test suite only when the server is up
 * We will retry for
 */
const serverIsUp = (host, port, delay, maxAttempts) => new Promise((resolve, reject) => {
  let attempts = 1
  const tryConnecting = () => {
    const socket = net.connect(
      port,
      host,
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

module.exports = serverIsUp
