/* eslint no-console: 0 */

const net = require('net')
const app = require('./src/app')

const env = process.env.NODE_ENV || 'development'
const config = require('./config/config')[env]

const port = process.env.PORT || 8080

/**
 * This is a helper function to ensure that we start the test suite only when the server is up
 * We will retry for
 */
const serverIsUp = (host, port, delay, maxAttempts, callback) => {
  let attempts = 1
  const tryConnecting = () => {
    const socket = net.connect(port, host, () => {
      callback(null)
      return socket.end() // clean-up
    })

    socket.on('error', error => {
      if (error.code === 'ECONNREFUSED') {
        if (attempts < maxAttempts) {
          attempts += 1
          return setTimeout(tryConnecting, delay)
        }
        return callback(error)
      }
      return callback(error)
    })
  }
  tryConnecting()
}

if (!config.host || env === 'production') {
  return app.listen(port)
}

// We wait for the db server to be up before starting the app
serverIsUp(config.host, config.port, 100, 120, error => {
  if (error) {
    console.error(error)
    return process.exit(1)
  }
  app.listen(port)
})
