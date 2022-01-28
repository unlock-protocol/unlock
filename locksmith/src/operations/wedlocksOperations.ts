import fetch from 'cross-fetch'
import * as Normalizer from '../utils/normalizer'
import { UserTokenMetadata } from '../models'
import config from '../../config/config'

type Params = {
  [key: string]: any
}

type Attachment = {
  path: string
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
  return fetch(config.services.wedlocks, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}

/**
 * Resolves when all new keys have been processed
 * @param keys
 */
export const notifyNewKeysToWedlocks = async (keys: any[]) => {
  for (const key of keys) {
    await notifyNewKeyToWedlocks(key)
  }
}

/**
 * Check if there are metadata with an email address for a key and sends
 * and email based on the lock's template if applicable
 * @param key
 */
export const notifyNewKeyToWedlocks = async (key: any) => {
  const userTokenMetadataRecord = await UserTokenMetadata.findOne({
    where: {
      tokenAddress: Normalizer.ethereumAddress(key.lock.address),
      userAddress: Normalizer.ethereumAddress(key.owner.address),
    },
  })
  const recipient =
    userTokenMetadataRecord?.data?.userMetadata?.protected?.email
  if (recipient) {
    await sendEmail(`keyMined-${key.owner.address}`, 'keyMined', recipient, {
      lockName: key.lock.name,
      keychainUrl: 'https://app.unlock-protocol.com/keychain',
    })
  }
}
