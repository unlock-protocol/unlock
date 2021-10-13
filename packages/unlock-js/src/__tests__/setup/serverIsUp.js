const net = require('net')

/**
 * Helper function which will return a Promise.
 * The promise resolves when the server (host:port) is up.
 * @param {*} host
 * @param {*} port
 * @param {*} delay
 * @param {*} maxAttempts
 */
const serverIsUp = (host, port, delay, maxAttempts) =>
  new Promise((resolve, reject) => {
    let attempts = 1
    const tryConnecting = () => {
      const socket = net.connect(port, host, () => {
        resolve()
        return socket.end() // clean-up
      })

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
