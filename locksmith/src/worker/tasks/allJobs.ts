import { logger } from '../../logger'
import { Task } from 'graphile-worker'
import { Hook } from '../../models'
import { notifyOfKeys } from '../jobs/keys'
import { notifyOfLocks } from '../jobs/locks'
import { Op } from 'sequelize'

export const allJobs: Task = async () => {
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

    await notifyOfKeys(subscribers)
    await notifyOfLocks(subscribers)

    logger.info('Finished running keys and locks job')
  } catch (error) {
    logger.error('Error running keys and locks job', error)
  }
}
