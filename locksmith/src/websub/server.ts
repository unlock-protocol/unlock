import cron from 'node-cron'
import { Op } from 'sequelize'
import { Hook } from '../models'
import { notifyOfKeys, notifyOfLocks, renewAllKeys } from './jobs'
import { logger } from '../logger'

logger.info('Websub server started.')

// every 5 minute
const CURRENT_CRON_SCHEDULE = '*/5 * * * *'

const run = async () => {
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
    renewAllKeys(),
  ])

  logger.info('Finished running keys and locks job')
}
run()
cron.schedule(CURRENT_CRON_SCHEDULE, run)
