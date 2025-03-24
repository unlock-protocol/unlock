import networks from '@unlock-protocol/networks'
import config from '../../config/config'
import {
  KeyOrderBy,
  OrderDirection,
  SubgraphService,
} from '@unlock-protocol/unlock-js'
import { logger } from '../../logger'
import { hasReminderAlreadySent } from '../../operations/keyExpirationReminderOperations'
import { sendEmail } from '../../operations/wedlocksOperations'
import * as userMetadataOperations from '../../operations/userMetadataOperations'
import * as Normalizer from '../../utils/normalizer'
import { Task } from 'graphile-worker'
import { Hook, ProcessedHookItem } from '../../models'
import { Op } from 'sequelize'
import { filterHooksByTopic, notifyHook } from '../helpers'
import { TOPIC_EXPIRED_KEYS_ON_NETWORK } from '../topics'

/**
 * Send email notification for expired key
 * @param key key object
 * @param network network
 * @returns
 */
async function notifyExpiredKey(key: any, network: number) {
  const lockName = key?.lock?.name ?? ''
  const lockAddress = Normalizer.ethereumAddress(key?.lock?.address)
  const ownerAddress = Normalizer.ethereumAddress(key.owner)
  const keyId = key?.tokenId ?? ''

  try {
    const recipient = await userMetadataOperations.getUserEmailRecipient({
      lockAddress,
      ownerAddress,
    })

    if (!recipient) return

    const reminderAlreadySent = await hasReminderAlreadySent({
      address: lockAddress,
      network,
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
      network: Number(`${network}`),
      template: 'keyExpired',
      failoverTemplate: 'keyExpired',
      recipient,
      params: {
        lockAddress,
        lockName,
        keyId,
        network: `${network}`,
        keychainUrl: `${config.unlockApp}/keychain`,
      },
    })
  } catch (err) {
    logger.error(`There is some error with notifyExpiredKey:`, err)
  }
}

export const filterUnprocessedExpiredKeys = async (keys: any[]) => {
  const keyIds = keys.map((key: any) => key.id)
  const processedKeys = await ProcessedHookItem.findAll({
    where: {
      type: 'expired-keys',
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

export const notifyExpiredKeysForLock = async (keys: any[]) => {
  const hooks = await Hook.findAll({
    where: {
      mode: 'subscribe',
      expiration: {
        [Op.gte]: new Date(),
      },
    },
  })
  const expiredKeysHook = await filterHooksByTopic(
    hooks,
    TOPIC_EXPIRED_KEYS_ON_NETWORK
  )
  for (let i = 0; i < expiredKeysHook.length; i++) {
    const hook = expiredKeysHook[i]
    const data = keys.filter((key: any) => key.lock.id === hook.lock)
    await notifyHook(hook, {
      data,
      network: hook.network,
    })
  }
  const items = keys.map((key: any) => ({
    type: 'expired-keys',
    objectId: key.id,
    network: key.lock.network,
  }))

  await ProcessedHookItem.bulkCreate(items)
}

export const notifyExpiredKeysForNetwork: Task = async () => {
  const now = new Date()

  const yesterday = new Date(now.getTime())
  yesterday.setDate(now.getDate() - 1)

  const expirationFrom = Math.floor(now.getTime() / 1000).toString()
  const expirationTo = Math.floor(yesterday.getTime() / 1000).toString()

  // get expired keys for every network
  for (const networkId in networks) {
    const subgraph = new SubgraphService()
    // get expired keys in the last 24h
    const keys = await subgraph.keys(
      {
        first: 1000, //  TODO: handle more than 1000 keys
        orderBy: KeyOrderBy.Expiration,
        orderDirection: OrderDirection.Desc,
        where: {
          expiration_lt: expirationFrom,
          expiration_gt: expirationTo,
        },
      },
      {
        networks: [Number(networkId)],
      }
    )
    logger.info(
      `keys expired for ${networks[networkId]?.name}: ${keys?.length}`
    )

    for (const key of keys) {
      await notifyExpiredKey(key, Number(networkId))
    }
    const unprocessedKeys = await filterUnprocessedExpiredKeys(keys)
    await notifyExpiredKeysForLock(unprocessedKeys)
  }
}
