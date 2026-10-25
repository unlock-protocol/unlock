import * as Sentry from '@sentry/node'
import { logger } from '../logger'
import { startWorker } from './worker'
import { retryForever } from './retry'
import config from '../config/config'

Sentry.init({
  ...config.sentry,
  integrations: [],
  enabled: true, // process.env.NODE_ENV === 'production',
  environment: process.env.NODE_ENV,
})

logger.info('Worker server started.')

// A lost database connection makes graphile-worker reject the runner promise.
// Rather than exiting (and relying on the platform restart budget, which a
// multi-minute network blip can exhaust), keep retrying with backoff.
retryForever(startWorker, {
  onError: (error, attempt, delayMs) => {
    logger.error(
      `Worker stopped (attempt ${attempt}), restarting in ${delayMs}ms`,
      { error }
    )
    Sentry.captureException(error)
  },
}).then(async () => {
  logger.info('Worker server done!')
})
