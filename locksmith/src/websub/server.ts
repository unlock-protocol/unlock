import cron from 'node-cron'
import { Op } from 'sequelize'
import { Hook } from '../models'
import { notifyOfKeys, notifyOfLocks } from './jobs'
import { logger } from '../logger'
import { renewFiatKeys } from './jobs/renewFiatKeys'
import { runRenewal } from './helpers/renewal'
import { renewKeys } from './jobs/renewKeys'
import { notifyKeyExpiration, notifyKeyExpired } from './jobs/keys'

logger.info('Websub server started.')

const WEEKLY_CRON_SCHEDULE = '0 0 * * 0' // every Sunday at midnight

const DAY_CRON_SCHEDULE = '0 0 * * *' // every day at midnight

const HOURLY_CRON_SCHEDULE = '0 * * * *' // every hour

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

run()

cron.schedule(FREQUENT_CRON_SCHEDULE, run)

cron.schedule(FREQUENT_CRON_SCHEDULE, async () => {
  // An hour in seconds
  const within = 60 * 60
  await Promise.allSettled([
    runRenewal((network) => renewKeys(network, within)),
    runRenewal((network) => renewFiatKeys(network, within)),
  ])
})

cron.schedule(HOURLY_CRON_SCHEDULE, async () => {
  // A day in seconds
  const within = 86400
  await Promise.allSettled([
    runRenewal((network) => renewKeys(network, within)),
    runRenewal((network) => renewFiatKeys(network, within)),
  ])
})

cron.schedule(DAY_CRON_SCHEDULE, async () => {
  // Week in seconds
  const within = 86400 * 7
  await Promise.allSettled([
    runRenewal((network) => renewKeys(network, within)),
    runRenewal((network) => renewFiatKeys(network, within)),
  ])

  // Send "expired" and "expiring" email notification
  await Promise.allSettled([notifyKeyExpiration(), notifyKeyExpired()])
})

cron.schedule(WEEKLY_CRON_SCHEDULE, async () => {
  // A year in seconds
  const within = 86400 * 365
  await Promise.allSettled([
    runRenewal((network) => renewKeys(network, within)),
    runRenewal((network) => renewFiatKeys(network, within)),
  ])
})
