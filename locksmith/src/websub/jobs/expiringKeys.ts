import networks from '@unlock-protocol/networks'
import config from '../../config/config'
import {
  KeyOrderBy,
  OrderDirection,
  SubgraphService,
} from '@unlock-protocol/unlock-js'
import dayjs from 'dayjs'

import { logger } from '../../logger'
import { hasReminderAlreadySent } from '../../operations/keyExpirationReminderOperations'
import { sendEmail } from '../../operations/wedlocksOperations'
import * as userMetadataOperations from './../../operations/userMetadataOperations'
import * as membershipOperations from './../../operations/membershipOperations'
import * as Normalizer from '../../utils/normalizer'

/**
 * send email notification for key that are about to expire
 * @param key key object
 * @param network network
 * @returns
 */
async function notifyExpiringKey(key: any, network: number) {
  const lockName = key?.lock?.name ?? ''
  const lockAddress = Normalizer.ethereumAddress(key.lock.address)
  const ownerAddress = Normalizer.ethereumAddress(key.owner)
  const tokenAddress = key?.lock?.tokenAddress ?? ''
  const keyId = key?.tokenId ?? ''

  try {
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
    } = await membershipOperations.getMembershipState({
      owner: ownerAddress,
      key,
      tokenAddress,
      tokenId: keyId,
      lockAddress,
      network,
    })

    // expiration date example: 1 December 2022 - 10:55
    const expirationDate = dayjs(key.expiration * 1000).format(
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
  } catch (err) {
    logger.error(`There is some error with notifyExpiredKey:`, err)
  }
}

export async function notifyExpiringKeysForNetwork() {
  const now = new Date()

  const end = new Date(now.getTime())
  end.setDate(now.getDate() + 1)

  const expirationFrom = Math.floor(now.getTime() / 1000).toString()
  const expirationTo = Math.floor(end.getTime() / 1000).toString()

  // get expiring keys for every network
  for (const networkId in networks) {
    const subgraph = new SubgraphService()
    // get keys that are about to expire

    const keys = await subgraph.keys(
      {
        first: 1000, //  TODO: handle more than 1000 keys
        orderBy: KeyOrderBy.Expiration,
        orderDirection: OrderDirection.Desc,
        where: {
          expiration_gt: expirationFrom,
          expiration_lt: expirationTo,
        },
      },
      {
        networks: [Number(networkId)],
      }
    )
    logger.info(
      `keys expiring for ${networks[networkId].name}: ${keys?.length}`
    )

    for (const key of keys) {
      await notifyExpiringKey(key, Number(networkId))
    }
  }
}
