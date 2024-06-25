import * as Sentry from '@sentry/node'
import type { SeverityLevel } from '@sentry/node'

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

export const log = (msg: string, level: SeverityLevel | undefined = 'info') => {
  //log to stdout
  console.log(`${symbols[level as string] || ''}[${level}]: ${msg}`)

  // send to sentry
  if (process.env.SENTRY_DSN) {
    Sentry.captureMessage(msg, level)
  }
}
