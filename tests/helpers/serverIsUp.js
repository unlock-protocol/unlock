const net = require('net')

/**
 * This is a helper function to ensure that we start the test suite only when the server is up
 * We will retry for
 */
const serverIsUp = (host, port, delay, maxAttempts) =>
  new Promise((resolve, reject) => {
    const tryConnecting = attempts => {
      const socket = net.connect(port, host, () => {
        socket.end() // clean-up
        return resolve()
      })

      socket.on('error', error => {
        if (error.code === 'ECONNREFUSED') {
          if (attempts <= maxAttempts) {
            return setTimeout(() => {
              tryConnecting(attempts + 1)
            }, delay)
          }
          return reject(
            new Error(
              `We could not reach ${host}:${port} after ${attempts} attempts (${(delay *
                maxAttempts) /
                1000} seconds)`
            )
          )
        }
        return reject(
          new Error(
            `There was an unexpected error reaching ${host}:${port}. ${error.message}`
          )
        )
      })
    }
    tryConnecting(1)
  })

module.exports = serverIsUp
