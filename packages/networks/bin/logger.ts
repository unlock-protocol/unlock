import * as Sentry from '@sentry/node'
import type { SeverityLevel } from '@sentry/node'

// init sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
})

const symbols = {
  error: '❌ ',
  warning: '⚠️ ',
}

export const log = (
  msg: string,
  level: SeverityLevel | undefined = 'debug'
) => {
  console.log(`${symbols[level] || ''}[${level}]: ${msg}`)
  Sentry.captureMessage(msg, level)
}
