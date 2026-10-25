import { logger } from '../../logger'
import { Task } from 'graphile-worker'
import { Hook } from '../../models'
import { notifyOfKeys } from '../jobs/keys'
import { notifyOfLocks } from '../jobs/locks'
import { Op } from 'sequelize'

export const allJobs: Task = async (payload) => {
  const fullScan = Boolean((payload as { fullScan?: boolean })?.fullScan)
  try {
    logger.info('Running keys and locks job', { fullScan })
    const subscribers = await Hook.findAll({
      where: {
        mode: 'subscribe',
        expiration: {
          [Op.gte]: new Date(),
        },
      },
    })

    await notifyOfKeys(subscribers, { fullScan })
    await notifyOfLocks(subscribers)

    logger.info('Finished running keys and locks job')
  } catch (error) {
    logger.error('Error running keys and locks job', error)
  }
}
