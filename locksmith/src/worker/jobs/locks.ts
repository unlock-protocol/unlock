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
import { getEventUrl } from '../../utils/eventHelpers'
import { sendEmail } from '../../operations/wedlocksOperations'

/**
 * Number of locks to fetch in each batch
 */
const FETCH_LIMIT = 25

/**
 * Fetches all unprocessed locks for a given network
 * Uses pagination to fetch locks in batches
 * Filters out any locks that have already been processed
 *
 * @param network - Network ID to fetch locks from
 * @param page - Page number for pagination
 * @returns Array of unprocessed locks
 */
async function fetchUnprocessedLocks(network: number, page = 0) {
  try {
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
        network: {
          [Op.eq]: network,
        },
      },
    })

    const unprocessedLocks = locks.filter(
      (lock: any) => !processedLocks.find((item) => item.objectId === lock.id)
    )
    return unprocessedLocks
  } catch (error) {
    logger.error('Error fetching unprocessed locks', { network, error })
    return []
  }
}

/**
 * Updates pending events with new lock information
 * Creates checkout configs for matching events
 * Updates event status to DEPLOYED when matches are found
 *
 * @param locks - Array of new locks to check against pending events
 * @param network - Network ID where locks exist
 */
async function updatePendingEvents(locks: any[], network: number) {
  const pendingEvents = await EventData.findAll({
    where: {
      status: EventStatus.PENDING,
      transactionHash: {
        [Op.not]: null,
      },
    },
  })

  for (const event of pendingEvents) {
    const matchingLock = locks.find(
      (lock) =>
        lock.creationTransactionHash?.toLowerCase() ===
        event.transactionHash?.toLowerCase()
    )

    if (matchingLock) {
      const config: PaywallConfigType = {
        title: 'Registration',
        locks: {
          [matchingLock.address]: {
            network,
          },
        },
      }

      // create checkout config for the event
      const checkoutConfig = await CheckoutConfig.create({
        id: `${event.slug}-${Date.now()}`,
        name: `Checkout config for ${event.name} (${event.slug})`,
        config,
        createdBy: event.createdBy,
      })

      // update event status to DEPLOYED
      await event.update({
        status: EventStatus.DEPLOYED,
        checkoutConfigId: checkoutConfig.id,
      })

      // send email notification to event creator
      await sendEmail({
        template: 'eventDeployed',
        recipient: event.data.replyTo,
        params: {
          eventName: event!.name,
          eventDate: event!.data.ticket.event_start_date,
          eventTime: event!.data.ticket.event_start_time,
          eventUrl: getEventUrl(event!),
        },
        attachments: [],
      })

      logger.info(
        `Updated event ${event.slug} with lock ${matchingLock.address}`
      )
    }
  }
}

/**
 * Notifies all relevant hooks about new locks
 * Sends parallel notifications to each hook
 *
 * @param hooks - Array of hooks to notify
 * @param locks - Array of new locks to notify about
 * @param network - Network ID where locks exist
 */
async function notifyHooksOfNewLocks(
  hooks: Hook[],
  locks: any[],
  network: number
) {
  for (let i = 0; i < hooks.length; i++) {
    const hook = hooks[i]
    await notifyHook(hook, {
      data: locks,
      network,
    })
  }
}

/**
 * Marks locks as processed
 * Creates bulk records to track processed locks
 *
 * @param locks - Array of locks to mark as processed
 * @param network - Network ID where locks exist
 */
async function markLocksAsProcessed(locks: any[], network: number) {
  await ProcessedHookItem.bulkCreate(
    locks.map((lock: any) => ({
      network,
      type: 'lock',
      objectId: lock.id,
    }))
  )
}

/**
 * Finalizes the processing of new locks
 * Handles both event updates and marking locks as processed
 * Both tasks run in parallel for efficiency
 *
 * @param locks - Array of locks to finalize
 * @param network - Network ID where locks exist
 */
async function finalizeLockProcessing(locks: any[], network: number) {
  await updatePendingEvents(locks, network)
  await markLocksAsProcessed(locks, network)
}

/**
 * Processes a single batch of newly discovered locks
 * Runs webhook notifications and lock finalization in parallel
 *
 * @param hooks - Relevant webhooks to notify
 * @param locks - Array of new locks to process
 * @param network - Network ID where locks were found
 */
async function processLockBatch(hooks: Hook[], locks: any[], network: number) {
  await notifyHooksOfNewLocks(hooks, locks, network)
  await finalizeLockProcessing(locks, network)
}

/**
 * Handles lock processing for a specific network
 * Implements pagination to process all unprocessed locks in batches
 *
 * Process:
 * 1. Fetches unprocessed locks in batches of FETCH_LIMIT
 * 2. For each batch:
 *    - Notifies relevant webhooks
 *    - Updates associated events
 *    - Marks locks as processed
 * 3. Continues until no new locks are found
 *
 * @param hooks - Array of webhooks for this specific network
 * @param network - Network ID being processed
 */
async function handleNetworkLocks(hooks: Hook[], network: number) {
  let page = 0
  while (true) {
    logger.info(`Processing locks for network ${network}`)
    const newLocks = await fetchUnprocessedLocks(network, page)

    if (!newLocks.length) {
      logger.info(`No more new locks found for network ${network}`)
      break
    }

    logger.info('Found new locks', {
      locks: newLocks.map((lock: any) => [network, lock.id]),
    })

    await processLockBatch(hooks, newLocks, network)
    page += 1
  }
}

/**
 * Main entry point for lock notifications system
 * Orchestrates the processing of new locks across all supported networks
 *
 * Process:
 * 1. Filters hooks by relevant topic and network
 * 2. For each network, initiates parallel processing
 * 3. Skips local development network (31337)
 *
 * @param hooks - Array of webhook configurations to be notified
 */
export async function notifyOfLocks(hooks: Hook[]) {
  const subscribedHooks = filterHooksByTopic(hooks, TOPIC_LOCKS)

  for (const network of Object.values(networks)) {
    if (network.id === 31337) continue // Skip local network

    const networkHooks = subscribedHooks.filter(
      (hook) => hook.network === network.id
    )
    await handleNetworkLocks(networkHooks, network.id)
  }
}
