import * as Sentry from '@sentry/node'
import { logger } from '../logger'
import { startWorker } from './worker'
import config from '../config/config'

Sentry.init({
  ...config.sentry,
  integrations: [],
  enabled: true, // process.env.NODE_ENV === 'production',
  environment: process.env.NODE_ENV,
})

logger.info('Worker server started.')

startWorker()
  .then(async () => {
    logger.info('Worker server done!')
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
