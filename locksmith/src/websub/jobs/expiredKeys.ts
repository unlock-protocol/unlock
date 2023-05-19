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
import * as userMetadataOperations from './../../operations/userMetadataOperations'
import * as Normalizer from '../../utils/normalizer'
import dayjs from 'dayjs'

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

export async function notifyExpiredKeysForNetwork() {
  const now = dayjs().unix().toString()
  const yesterday = dayjs().subtract(1, 'day').unix().toString()

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
          expiration_lt: now,
          expiration_gt: yesterday,
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
  }
}
