const Sentry = require('@sentry/node')

if (!process.env.SENTRY_DSN) {
  throw Error(`No dsn defined. Please export SENTRY_DSN to the shell`)
}

// init sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
})

const symbols = {
  error: '❌ ',
  warning: '⚠️ ',
}

const log = (msg, level = 'info') => {
  //log to stdout
  console.log(`${symbols[level] || ''}[${level}]: ${msg}`)

  // send to sentry
  Sentry.captureMessage(msg, level)
}

module.exports = { log }
