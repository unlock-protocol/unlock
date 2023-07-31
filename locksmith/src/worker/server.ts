import * as Sentry from '@sentry/node'
import cron from 'node-cron'
import { Op } from 'sequelize'
import { Hook } from '../models'
import { notifyOfKeys, notifyOfLocks } from './jobs'
import { logger } from '../logger'
import { notifyExpiredKeysForNetwork } from './jobs/expiredKeys'
import { notifyExpiringKeysForNetwork } from './jobs/expiringKeys'
import { startWorker } from './worker'
import config from '../config/config'

Sentry.init({
  ...config.sentry,
  integrations: [],
  enabled: true, // process.env.NODE_ENV === 'production',
  environment: process.env.NODE_ENV,
})

logger.info('Websub server started.')

const DAY_CRON_SCHEDULE = '0 0 * * *' // every day at midnight

const FREQUENT_CRON_SCHEDULE = '*/5 * * * *' // every 5 minutes

const run = async () => {
  try {
    logger.info('Running keys and locks job')

    const subscribers = await Hook.findAll({
      where: {
        mode: 'subscribe',
        expiration: {
          [Op.gte]: new Date(),
        },
      },
    })

    await Promise.allSettled([
      notifyOfKeys(subscribers),
      notifyOfLocks(subscribers),
    ])

    logger.info('Finished running keys and locks job')
  } catch (error) {
    logger.error('Error running keys and locks job', error)
  }
}

cron.schedule(FREQUENT_CRON_SCHEDULE, run)

cron.schedule(DAY_CRON_SCHEDULE, async () => {
  // Send "expired" and "expiring" email notification
  await notifyExpiringKeysForNetwork()
  await notifyExpiredKeysForNetwork()
})

startWorker()
  .then(async () => {
    logger.info('Websub server done!')
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
