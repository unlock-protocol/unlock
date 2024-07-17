const Sentry = require('@sentry/node')

// init sentry
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
  })
}

const symbols = {
  error: '❌ ',
  warning: '⚠️ ',
}

export const log = (msg, level = 'info') => {
  //log to stdout
  console.log(`${symbols[level] || ''}[${level}]: ${msg}`)

  // send to sentry
  if (process.env.SENTRY_DSN) {
    Sentry.captureMessage(msg, level)
  }
}
