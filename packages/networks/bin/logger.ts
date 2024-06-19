import * as Sentry from '@sentry/node'
import type { SeverityLevel } from '@sentry/node'

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

export const log = (msg: string, level: SeverityLevel | undefined = 'info') => {
  //log to stdout
  console.log(`${symbols[level as string] || ''}[${level}]: ${msg}`)

  // send to sentry
  Sentry.captureMessage(`[TOKENS]: ${msg}`, level)
}
