/* eslint no-console: 0 */

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

/**
 * Evalutes if the environment is properly configured to correctly run the application. In a
 * failure scenario the applicatioh will fail to run, and an appropriate errors will be displayed.
 */

const environmentEvaluation = () => {
  const errors = []
  const requiredEnvironmentVariables = [
    'DB_USERNAME',
    'DB_PASSWORD',
    'DB_NAME',
    'DB_HOSTNAME',
    'DEFAULT_NETWORK',
  ]

  requiredEnvironmentVariables.forEach((environmentVariable) => {
    if (!process.env[environmentVariable]) {
      errors.push(
        `${environmentVariable} is required to operate in this context`
      )
    }
  })

  if (errors.length != 0) {
    errors.forEach((error) => {
      console.error(error)
    })
    console.log('Halting execution.')
    return process.exit(1)
  }
}

if (!config.host || process.env.NODE_ENV === 'production') {
  return app.listen(port)
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

  return
}

// We wait for the db server to be up before starting the app
serverIsUp(config.host, databasePort, 100, 120, (error) => {
  if (error) {
    console.error(error)
    return process.exit(1)
  }
  app.listen(port)
})
