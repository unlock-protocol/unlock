import { Op } from 'sequelize'
import { networks } from '@unlock-protocol/networks'
import { Hook, ProcessedHookItem } from '../../models'
import { TOPIC_KEYS_ON_LOCK, TOPIC_KEYS_ON_NETWORK } from '../topics'
import { notifyHook, filterHooksByTopic } from '../helpers'
import {
  notifyNewKeysToWedlocks,
  sendEmail,
} from '../../operations/wedlocksOperations'
import { hasReminderAlreadySent } from '../../operations/keyExpirationReminderOperations'
import { logger } from '../../logger'
import * as Normalizer from '../../utils/normalizer'
import * as metadataOperations from './../../operations/metadataOperations'
import * as subscriptionOperations from './../../operations/subscriptionOperations'
import { ethers } from 'ethers'
import dayjs from 'dayjs'
import config from '../../config/config'
import { arrayToChunks } from '../../utils/array'
import {
  SubgraphService,
  KeyOrderBy,
  OrderDirection,
} from '@unlock-protocol/unlock-js'

const FETCH_LIMIT = 25
const MAX_UINT =
  '115792089237316195423570985008687907853269984665640564039457584007913129639935'
const KEYS_CHUNKS_SIZE = 25
const DELAY = 10000

const delay = (timeout: number) =>
  new Promise((resolve: any) => {
    setTimeout(() => resolve(), timeout)
  })

async function fetchUnprocessedKeys(network: number, page = 0) {
  const subgraph = new SubgraphService()
  const skip = page ? page * FETCH_LIMIT : 0

  const keys = await subgraph.keys(
    {
      first: FETCH_LIMIT,
      skip,
      orderBy: KeyOrderBy.CreatedAtBlock,
      orderDirection: OrderDirection.Desc,
    },
    {
      networks: [network],
    }
  )

  const keyIds = keys.map((key: any) => key.id)
  const processedKeys = await ProcessedHookItem.findAll({
    where: {
      objectId: {
        [Op.in]: keyIds,
      },
    },
  })

  const unprocessedKeys = keys.filter(
    (key: any) => !processedKeys.find((item) => item.objectId === key.id)
  )
  return unprocessedKeys
}

async function notifyHooksOfAllUnprocessedKeys(hooks: Hook[], network: number) {
  let page = 0
  const keysOnLockHooks = filterHooksByTopic(hooks, TOPIC_KEYS_ON_LOCK)
  const keysOnNetworkHooks = filterHooksByTopic(hooks, TOPIC_KEYS_ON_NETWORK)
  while (true) {
    const keys = await fetchUnprocessedKeys(network, page)

    // If empty, break the loop and return as there are no more new keys to process.
    if (!keys.length) {
      logger.info(`No new keys for ${network}`)
      break
    }
    logger.info('Found new keys', {
      keys: keys.map((key: any) => [network, key.lock.address, key.id]),
    })

    await Promise.allSettled([
      notifyNewKeysToWedlocks(keys, network), // send emails when applicable!
      // Send notification to hooks subscribed to keys on a specific lock address
      ...keysOnLockHooks.map(async (keysOnLockHook) => {
        const data = keys.filter(
          (key: any) => key.lock.id === keysOnLockHook.lock
        )
        const hookEvent = await notifyHook(keysOnLockHook, {
          data,
          network,
        })
        return hookEvent
      }),
      // Send notification to hooks subscribed to keys on a whole network
      ...keysOnNetworkHooks.map(async (keysOnNetworkHook) => {
        const hookEvent = await notifyHook(keysOnNetworkHook, {
          network,
          data: keys,
        })
        return hookEvent
      }),
    ])

    const processedHookItems = keys.map((key: any) => {
      return {
        network,
        type: 'key',
        objectId: key.id,
      }
    })

    await ProcessedHookItem.bulkCreate(processedHookItems)

    page += 1
  }
}

export async function notifyOfKeys(hooks: Hook[]) {
  const tasks: Promise<void>[] = []

  for (const network of Object.values(networks)) {
    if (network.id !== 31337) {
      const hooksFilteredByNetwork = hooks.filter(
        (hook) => hook.network === network.id
      )
      const task = notifyHooksOfAllUnprocessedKeys(
        hooksFilteredByNetwork,
        network.id
      )
      tasks.push(task)
    }
  }

  await Promise.allSettled(tasks)
}

const getMembershipStatus = async ({
  key,
  tokenAddress,
  network,
  lockAddress,
  tokenId,
  owner,
}: {
  key: any
  tokenAddress: string
  network: number
  lockAddress: string
  tokenId: string
  owner: string
}) => {
  const isERC20 = tokenAddress && tokenAddress !== ethers.constants.AddressZero

  const isRenewable =
    Number(key?.lock?.version) >= 11 && key?.expiration !== MAX_UINT && isERC20

  const subscriptions =
    await subscriptionOperations.getSubscriptionsForLockByOwner({
      tokenId,
      lockAddress,
      owner,
      network,
    })

  let currency = ''
  let isAutoRenewable = false
  let isRenewableIfReApproved = false

  // TODO: need new version of the lock contract to get the value easily
  const isRenewableIfRePurchased = false

  // get subscription and check for renews
  if (subscriptions?.length) {
    const [subscription] = subscriptions ?? []

    if (subscription) {
      const possible = ethers.BigNumber.from(subscription.possibleRenewals)
      const approved = ethers.BigNumber.from(subscription.approvedRenewals)

      isAutoRenewable = approved.gte(0) && possible.gte(0)

      isRenewableIfReApproved = approved.lte(0)

      currency = subscription.balance.symbol
    }
  }

  return {
    currency,
    isRenewable,
    isAutoRenewable,
    isRenewableIfReApproved,
    isRenewableIfRePurchased,
  }
}

export async function notifyKeyExpiration() {
  const now = new Date()

  const end = new Date(now.getTime())
  end.setDate(now.getDate() + 1)

  await Promise.allSettled(
    // get expiring keys for every network
    Object.keys(networks).map(async (networkId: string) => {
      const subgraph = new SubgraphService()
      // get keys from now to 24h in the future
      const keys = await subgraph.keys(
        {
          first: 1000, //  TODO: handle more than 1000 keys
          where: {
            expiration_gt: now.getTime().toString(),
            expiration_lt: end.getTime().toString(),
          },
        },
        {
          networks: [Number(networkId)],
        }
      )

      logger.info(
        `keys expiring for ${networks[networkId].name}: ${keys?.length}`
      )

      // split keys into groups to send email by group with some delay
      const chunks = arrayToChunks(keys, KEYS_CHUNKS_SIZE)
      await Promise.allSettled(
        Object.values(chunks).map(async (keys, index) => {
          const timeout = DELAY * (index + 1) // increase delay for each chunks
          await delay(timeout)

          logger.info(
            `send expiring emails for chunk group ${index + 1} on ${
              networks?.[networkId]?.name
            }`
          )

          await Promise.allSettled([
            keys?.map(async (key: any) => {
              const lockName = key?.lock?.name ?? ''
              const lockAddress = Normalizer.ethereumAddress(key.lock.address)
              const ownerAddress = Normalizer.ethereumAddress(key.owner)
              const tokenAddress = key?.lock?.tokenAddress ?? ''
              const keyId = key?.tokenId ?? ''

              const protectedData =
                await metadataOperations.getUserProtectedMetadata({
                  lockAddress,
                  userAddress: ownerAddress,
                })

              const recipient = protectedData?.email as string

              if (!recipient) return

              const {
                isAutoRenewable,
                isRenewable,
                isRenewableIfRePurchased,
                isRenewableIfReApproved,
                currency,
              } = await getMembershipStatus({
                owner: ownerAddress,
                key,
                tokenAddress,
                tokenId: keyId,
                lockAddress,
                network: Number(networkId),
              })

              // expiration date example: 1 December 2022 - 10:55
              const expirationDate = dayjs(new Date(key.expiration)).format(
                'D MMMM YYYY - HH:mm'
              )

              const reminderAlreadySent = await hasReminderAlreadySent({
                address: lockAddress,
                network: networkId,
                tokenId: keyId,
                type: 'keyExpiring',
                expiration: key.expiration,
              })

              if (reminderAlreadySent) {
                logger.info(
                  `Email reminder already sent for ${lockAddress} - token ${keyId}`
                )
                return
              }

              // send expiring email
              await sendEmail({
                network: Number(`${networkId}`),
                template: 'keyExpiring',
                failoverTemplate: 'keyExpiring',
                recipient,
                params: {
                  lockAddress,
                  lockName,
                  keyId,
                  network: networkId,
                  keychainUrl: `${config.unlockApp}/keychain`,
                  currency,
                  expirationDate,
                  isRenewable,
                  isAutoRenewable,
                  isRenewableIfRePurchased,
                  isRenewableIfReApproved,
                },
              })
            }),
          ])
        })
      )
    })
  )
}

export async function notifyKeyExpired() {
  const now = new Date()

  const yesterday = new Date(now.getTime())
  yesterday.setDate(now.getDate() - 1)

  await Promise.allSettled(
    // get expiring keys for every network
    Object.keys(networks).map(async (networkId: string) => {
      const subgraph = new SubgraphService()
      // get keys from now to 24h before
      const keys = await subgraph.keys(
        {
          first: 1000, //  TODO: handle more than 1000 keys
          where: {
            expiration_lt: now.getTime().toString(),
            expiration_gt: yesterday.getTime().toString(),
          },
        },
        {
          networks: [Number(networkId)],
        }
      )

      logger.info(
        `keys expired for ${networks[networkId]?.name}: ${keys?.length}`
      )

      // split keys into groups to send email by group with some delay
      const chunks = arrayToChunks(keys, KEYS_CHUNKS_SIZE)

      Object.values(chunks).map(async (keys, index) => {
        const timeout = DELAY * (index + 1) // increase delay for each chunks
        await delay(timeout)

        logger.info(
          `send expired emails for chunk group ${index + 1} on ${
            networks?.[networkId]?.name
          }`
        )

        await Promise.allSettled([
          keys?.map(async (key: any) => {
            const lockName = key?.lock?.name ?? ''
            const lockAddress = Normalizer.ethereumAddress(key?.lock?.address)
            const ownerAddress = Normalizer.ethereumAddress(key.owner)
            const keyId = key?.tokenId ?? ''

            const protectedData =
              await metadataOperations.getUserProtectedMetadata({
                lockAddress,
                userAddress: ownerAddress,
              })

            const recipient = protectedData?.email as string

            if (!recipient) return

            const reminderAlreadySent = await hasReminderAlreadySent({
              address: lockAddress,
              network: networkId,
              tokenId: keyId,
              type: 'keyExpired',
              expiration: key.expiration,
            })

            if (reminderAlreadySent) {
              logger.info(
                `Email reminder already sent for ${lockAddress} - token ${keyId}`
              )
              return
            }

            // send expiring email
            await sendEmail({
              network: Number(`${networkId}`),
              template: 'keyExpired',
              failoverTemplate: 'keyExpired',
              recipient,
              params: {
                lockAddress,
                lockName,
                keyId,
                network: networkId,
                keychainUrl: `${config.unlockApp}/keychain`,
              },
            })
          }),
        ])
      })
    })
  )
}
