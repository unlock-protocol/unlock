import { Op } from 'sequelize'
import { networks } from '@unlock-protocol/networks'
import { EventData, Hook, ProcessedHookItem } from '../../models'
import { TOPIC_LOCKS } from '../topics'
import { notifyHook, filterHooksByTopic } from '../helpers'
import { logger } from '../../logger'
import { OrderDirection, SubgraphService } from '@unlock-protocol/unlock-js'
import { LockOrderBy } from '@unlock-protocol/unlock-js'
import { saveCheckoutConfig } from '../../operations/checkoutConfigOperations'
import { Task } from 'graphile-worker'

const FETCH_LIMIT = 25

async function fetchUnprocessedLocks(network: number, page = 0) {
  const subgraph = new SubgraphService()

  const locks = await subgraph.locks(
    {
      first: FETCH_LIMIT,
      skip: page ? page * FETCH_LIMIT : 0,
      orderBy: LockOrderBy.CreatedAtBlock,
      orderDirection: OrderDirection.Desc,
    },
    {
      networks: [network],
    }
  )

  const lockIds = locks.map((lock: any) => lock.id)
  const processedLocks = await ProcessedHookItem.findAll({
    where: {
      type: 'lock',
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
      logger.info(`No new locks for, ${network}`)
      break
    }

    logger.info('Found new locks', {
      locks: locks.map((lock: any) => [network, lock.id]),
    })

    // Check if any of these locks correspond to pending events
    await checkPendingEventsForLocks(locks, network)

    // Continue with existing notification logic
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

async function processNewLocks(locks: any[], network: number) {
  const pendingEvents = await EventData.findAll({
    where: {
      isPending: true,
      network,
      lockAddress: null,
    },
  })

  for (const event of pendingEvents) {
    // Find if any of the new locks corresponds to our pending transaction
    const matchingLock = locks.find(async (lock) => {
      const txHash = await lock.transactionHash
      return (
        txHash?.toLowerCase() === event.pendingTransactionHash?.toLowerCase()
      )
    })

    if (matchingLock) {
      // Create checkout config with actual lock address
      const checkoutConfig = await saveCheckoutConfig({
        ...defaultEventCheckoutConfigForLockOnNetwork(
          matchingLock.address,
          network
        ),
        name: `Checkout config for ${event.name}`,
      })

      // Update event with deployed lock
      await event.update({
        lockAddress: matchingLock.address,
        checkoutConfigId: checkoutConfig.id,
        pendingTransactionHash: null,
        isPending: false,
      })

      logger.info(`Lock deployed for event ${event.slug}`, {
        lockAddress: matchingLock.address,
        network,
      })
    }
  }
}

export const checkPendingEventsForLocks: Task = async () => {
  for (const network of Object.values(networks)) {
    if (network.id !== 31337) {
      const locks = await fetchUnprocessedLocks(network.id, 0)
      if (locks.length) {
        await processNewLocks(locks, network.id)
      }
    }
  }
}
