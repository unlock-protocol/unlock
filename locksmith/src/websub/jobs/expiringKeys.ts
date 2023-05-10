import networks from '@unlock-protocol/networks'
import config from '../../config/config'
import { SubgraphService } from '@unlock-protocol/unlock-js'
import dayjs from 'dayjs'
import { logger } from '../../logger'
import { hasReminderAlreadySent } from '../../operations/keyExpirationReminderOperations'
import { sendEmail } from '../../operations/wedlocksOperations'
import * as userMetadataOperations from './../../operations/userMetadataOperations'
import * as Normalizer from '../../utils/normalizer'
import { getMembershipState } from '../../utils/key'

function notifyExpiringKeys({
  keys,
  network,
}: {
  keys: any[]
  network: number
}) {
  return keys?.map(async (key: any) => {
    const lockName = key?.lock?.name ?? ''
    const lockAddress = Normalizer.ethereumAddress(key.lock.address)
    const ownerAddress = Normalizer.ethereumAddress(key.owner)
    const tokenAddress = key?.lock?.tokenAddress ?? ''
    const keyId = key?.tokenId ?? ''

    const recipient = await userMetadataOperations.getUserEmailRecipient({
      lockAddress,
      ownerAddress,
    })

    if (!recipient) return

    const {
      isAutoRenewable,
      isRenewable,
      isRenewableIfRePurchased,
      isRenewableIfReApproved,
      currency,
    } = await getMembershipState({
      owner: ownerAddress,
      key,
      tokenAddress,
      tokenId: keyId,
      lockAddress,
      network,
    })

    // expiration date example: 1 December 2022 - 10:55
    const expirationDate = dayjs(new Date(key.expiration)).format(
      'D MMMM YYYY - HH:mm'
    )

    const reminderAlreadySent = await hasReminderAlreadySent({
      address: lockAddress,
      network,
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
      network,
      template: 'keyExpiring',
      failoverTemplate: 'keyExpiring',
      recipient,
      params: {
        lockAddress,
        lockName,
        keyId,
        network: `${network}`,
        keychainUrl: `${config.unlockApp}/keychain`,
        currency,
        expirationDate,
        isRenewable,
        isAutoRenewable,
        isRenewableIfRePurchased,
        isRenewableIfReApproved,
      },
    })
  })
}

function notifyKeyExpiredForNetwork() {
  const now = new Date()

  const end = new Date(now.getTime())
  end.setDate(now.getDate() + 1)

  // get expiring keys for every network
  return Object.keys(networks).map(async (networkId: string) => {
    const subgraph = new SubgraphService()
    // get keys that are about to expire
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

    await Promise.allSettled(
      notifyExpiringKeys({
        keys,
        network: Number(networkId),
      })
    )
  })
}

export async function notifyKeyExpiration() {
  const now = new Date()

  const end = new Date(now.getTime())
  end.setDate(now.getDate() + 1)

  await Promise.allSettled(notifyKeyExpiredForNetwork())
}
