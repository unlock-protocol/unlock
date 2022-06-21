/* eslint no-console: 0 */

console.log('Starting Locksmith...')
const args = require('yargs').argv
const net = require('net')
const listEndpoints = require('express-list-endpoints')
const app = require('./src/app')

const config = require('./config/config')

const port = process.env.PORT || 8080
const databasePort = 5432

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

    socket.on('error', (error) => {
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

if (args.routes) {
  console.log('Routes:')
  listEndpoints(app).forEach((endpoint) => {
    endpoint.methods.forEach((method) => {
      console.log(
        `${method.padStart(6)} ${endpoint.path.padEnd(56)} => ${
          endpoint.middleware
        }`
      )
    })
  })
  process.exit(0)
}

if (!config.host || process.env.NODE_ENV === 'production') {
  // in prod, we start immediately
  console.log(`Listening on ${port}`)
  app.listen(port)
} else {
  // We wait for the db server to be up before starting the app
  serverIsUp(config.host, databasePort, 100, 120, (error) => {
    if (error) {
      console.error(error)
      return process.exit(1)
    }
    app.listen(port)
  })
}
