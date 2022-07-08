import fetch from 'cross-fetch'
import * as Normalizer from '../utils/normalizer'
import { UserTokenMetadata } from '../models'
import config from '../../config/config'
import { logger } from '../logger'
import { generateQrCode } from '../utils/qrcode'

type Params = {
  [key: string]: any
}

type Attachment = {
  path: string
}

interface Key {
  lock: {
    address: string
    name?: string
  }
  owner: {
    address: string
  }
  keyId?: string
}

/**
 * Function to send an email with the Wedlocks service
 * Pass a template, a recipient, some params and attachements
 * @param template
 * @param failoverTemplate
 * @param recipient
 * @param params
 * @param attachments
 * @returns
 */
export const sendEmail = async (
  template: string,
  failoverTemplate: string,
  recipient: string,
  params: Params = {},
  attachments: Attachment[] = []
) => {
  const payload = {
    template,
    failoverTemplate,
    recipient,
    params,
    attachments,
  }
  try {
    const response = await fetch(config.services.wedlocks, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    if (response.status === 200) {
      logger.info(
        'Wedlocks returned unexpected status code',
        response.status,
        await response.text()
      )
    }
  } catch (error: any) {
    logger.error(error)
  }
}

/**
 * Resolves when all new keys have been processed
 * @param keys
 */
export const notifyNewKeysToWedlocks = async (
  keys: any[],
  network?: number
) => {
  logger.info('Notifying following keys to wedlock', {
    keys: keys.map((key: any) => [key.lock.address, key.keyId]),
  })
  for (const key of keys) {
    await notifyNewKeyToWedlocks(key, network)
  }
}

/**
 * Check if there are metadata with an email address for a key and sends
 * and email based on the lock's template if applicable
 * @param key
 */
export const notifyNewKeyToWedlocks = async (
  key: Key,
  network?: number,
  includeQrCode = false
) => {
  const userTokenMetadataRecord = await UserTokenMetadata.findOne({
    where: {
      tokenAddress: Normalizer.ethereumAddress(key.lock.address),
      userAddress: Normalizer.ethereumAddress(key.owner.address),
    },
  })
  logger.info(
    'Found the relevant token metadata',
    userTokenMetadataRecord?.data
  )

  const protectedData = Normalizer.toLowerCaseKeys({
    ...userTokenMetadataRecord?.data?.userMetadata?.protected,
  })

  const recipient = protectedData?.email as string

  logger.info(`Sending ${recipient} key: ${key.lock.address}-${key.keyId}`)

  if (recipient) {
    logger.info('Notifying wedlock for new key', {
      recipient,
      lock: key.lock.address,
      keyId: key.keyId,
    })

    const attachments: Attachment[] = []
    if (includeQrCode && network && key?.keyId) {
      const qrCode = await generateQrCode({
        network,
        lockAddress: key.lock.address,
        tokenId: key.keyId,
      })
      attachments.push({ path: qrCode })
    }
    // Lock address to find the specific template
    await sendEmail(
      `keyMined${key.lock.address}`,
      'keyMined',
      recipient,
      {
        lockName: key.lock.name,
        keychainUrl: 'https://app.unlock-protocol.com/keychain',
      },
      attachments
    )
  }
}
