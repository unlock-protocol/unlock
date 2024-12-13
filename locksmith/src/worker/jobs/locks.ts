import { Op } from 'sequelize'
import { networks } from '@unlock-protocol/networks'
import {
  Hook,
  ProcessedHookItem,
  EventData,
  CheckoutConfig,
} from '../../models'
import { TOPIC_LOCKS } from '../topics'
import { notifyHook, filterHooksByTopic } from '../helpers'
import { logger } from '../../logger'
import { OrderDirection, SubgraphService } from '@unlock-protocol/unlock-js'
import { LockOrderBy } from '@unlock-protocol/unlock-js'
import { EventStatus } from '@unlock-protocol/types'
import { PaywallConfigType } from '@unlock-protocol/core'

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

async function updatePendingEvents(locks: any[], network: number) {
  // Get all pending events
  const pendingEvents = await EventData.findAll({
    where: {
      status: EventStatus.PENDING,
      transactionHash: {
        [Op.not]: null,
      },
    },
  })

  for (const event of pendingEvents) {
    // Find any lock that was created with this event's transaction hash
    const matchingLock = locks.find(
      (lock) =>
        lock.creationTransactionHash?.toLowerCase() ===
        event.transactionHash?.toLowerCase()
    )

    if (matchingLock) {
      // Create default checkout config for the event
      const config: PaywallConfigType = {
        title: 'Registration',
        locks: {
          [matchingLock.address]: {
            network,
          },
        },
      }

      // Create checkout config
      const checkoutConfig = await CheckoutConfig.create({
        id: `${event.slug}-${Date.now()}`,
        name: `Checkout config for ${event.name} (${event.slug})`,
        config,
        createdBy: event.createdBy,
      })

      // Update event with lock details and deployed status
      await event.update({
        status: EventStatus.DEPLOYED,
        checkoutConfigId: checkoutConfig.id,
      })

      logger.info(
        `Updated event ${event.slug} with lock ${matchingLock.address}`
      )
    }
  }
}

async function notifyHooksOfAllUnprocessedLocks(
  hooks: Hook[],
  network: number
) {
  let page = 0
  while (true) {
    logger.info(`Running job on ${network}`)
    const locks = await fetchUnprocessedLocks(network, page)

    if (!locks.length) {
      logger.info(`No new locks for, ${network}`)
      break
    }

    logger.info('Found new locks', {
      locks: locks.map((lock: any) => [network, lock.id]),
    })

    // Run both operations in parallel
    await Promise.all([
      // Notify hooks
      Promise.all(
        hooks.map(async (hook) => {
          const data = locks
          const hookEvent = await notifyHook(hook, {
            data,
            network,
          })
          return hookEvent
        })
      ),
      // Update any pending events
      updatePendingEvents(locks, network),
    ])

    const processedHookItems = locks.map((lock: any) => ({
      network,
      type: 'lock',
      objectId: lock.id,
    }))

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
