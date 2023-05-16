import networks from '@unlock-protocol/networks'
import config from '../../config/config'
import { SubgraphService } from '@unlock-protocol/unlock-js'
import { logger } from '../../logger'
import { hasReminderAlreadySent } from '../../operations/keyExpirationReminderOperations'
import { sendEmail } from '../../operations/wedlocksOperations'
import * as userMetadataOperations from './../../operations/userMetadataOperations'
import * as Normalizer from '../../utils/normalizer'

/**
 * send email notification for expired keys
 * @param keys list of expired keys to notify
 * @param network network
 * @returns
 */
function notifyExpiredKeys({
  keys,
  network,
}: {
  keys: any[]
  network: number
}) {
  return keys?.map(async (key: any) => {
    const lockName = key?.lock?.name ?? ''
    const lockAddress = Normalizer.ethereumAddress(key?.lock?.address)
    const ownerAddress = Normalizer.ethereumAddress(key.owner)
    const keyId = key?.tokenId ?? ''

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
  })
}

function notifyKeyExpiredForNetwork() {
  const now = new Date()

  const yesterday = new Date(now.getTime())
  yesterday.setDate(now.getDate() - 1)

  // get expired keys for every network
  return Object.keys(networks).map(async (networkId: string) => {
    const subgraph = new SubgraphService()
    // get expired keys in the last 24h
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

    await Promise.allSettled(
      notifyExpiredKeys({
        keys,
        network: Number(networkId),
      })
    )
  })
}

export async function notifyKeyExpired() {
  await Promise.allSettled(notifyKeyExpiredForNetwork())
}
