import { Op } from 'sequelize'
import { networks } from '@unlock-protocol/networks'
import { Lock } from '../../graphql/datasource'
import { Hook, ProcessedHookItem } from '../../models'
import { TOPIC_LOCKS } from '../topics'
import { notifyHook, filterHooksByTopic } from '../helpers'
import { logger } from '../../logger'

const FETCH_LIMIT = 25

async function fetchUnprocessedLocks(network: number, page = 0) {
  const lockSource = new Lock(network)
  const locks = await lockSource.getLocks({
    first: FETCH_LIMIT,
    skip: page ? page * FETCH_LIMIT : 0,
  })

  const lockIds = locks.map((lock: any) => lock.id)
  const processedLocks = await ProcessedHookItem.findAll({
    where: {
      objectId: {
        [Op.in]: lockIds,
      },
    },
  })

  const unprocessedLocks = locks.filter(
    (lock: any) => !processedLocks.find((item) => item.objectId === lock.id)
  )
  return unprocessedLocks
}

async function notifyHooksOfAllUnprocessedLocks(
  hooks: Hook[],
  network: number
) {
  let page = 0
  while (true) {
    logger.info(`Running job on ${network}`)
    const locks = await fetchUnprocessedLocks(network, page)

    // If empty, break the loop and return as there are no more new locks to process.
    if (!locks.length) {
      logger.info('No new locks for', { network })
      break
    }

    logger.info('Found new locks', {
      locks: locks.map((lock: any) => [network, lock.id]),
    })

    await Promise.all(
      hooks.map(async (hook) => {
        const data = locks
        const hookEvent = await notifyHook(hook, {
          data,
          network,
        })
        return hookEvent
      })
    )

    const processedHookItems = locks.map((lock: any) => {
      return {
        network,
        type: 'lock',
        objectId: lock.id,
      }
    })

    await ProcessedHookItem.bulkCreate(processedHookItems)

    page += 1
  }
}

export async function notifyOfLocks(hooks: Hook[]) {
  const subscribedHooks = filterHooksByTopic(hooks, TOPIC_LOCKS)
  const tasks: Promise<void>[] = []

  for (const network of Object.values(networks)) {
    if (network.id !== 31337) {
      const hooksFilteredByNetwork = subscribedHooks.filter(
        (hook) => hook.network === network.id
      )
      const task = notifyHooksOfAllUnprocessedLocks(
        hooksFilteredByNetwork,
        network.id
      )
      tasks.push(task)
    }
  }
  await Promise.allSettled(tasks)
}
