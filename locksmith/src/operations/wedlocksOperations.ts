import * as Normalizer from '../utils/normalizer'
import { UserTokenMetadata } from '../models'
import config from '../config/config'
import { logger } from '../logger'
import networks from '@unlock-protocol/networks'
import { createTicket } from '../utils/ticket'
import resvg from '@resvg/resvg-js'
import { KeyManager, LocksmithService } from '@unlock-protocol/unlock-js'
type Params = {
  [key: string]: string | number | undefined
  keyId: string
  keychainUrl?: string
  lockName: string
  network: string
  txUrl?: string
  openSeaUrl?: string
}

type Attachment = {
  path: string
}

interface Key {
  lock: {
    address: string
    name: string
  }
  tokenId?: string
  owner: string
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
  params: Params = {} as any,
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
    keys: keys.map((key: any) => [key.lock.address, key.tokenId]),
  })
  for await (const key of keys) {
    notifyNewKeyToWedlocks(key, network, true)
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
  includeQrCode = true
) => {
  const keyManager = new KeyManager()
  const lockAddress = Normalizer.ethereumAddress(key.lock.address)
  const ownerAddress = Normalizer.ethereumAddress(key.owner)
  const tokenId = key?.tokenId

  const userTokenMetadataRecord = await UserTokenMetadata.findOne({
    where: {
      tokenAddress: lockAddress,
      userAddress: ownerAddress,
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

  if (!recipient) {
    return
  }

  const airdroppedRecipient = keyManager.createTransferAddress({
    params: {
      email: recipient,
      lockAddress,
    },
  })

  const isAirdroppedRecipient =
    airdroppedRecipient.toLowerCase() === ownerAddress.toLowerCase()

  logger.info(`Sending ${recipient} key: ${lockAddress}-${tokenId}`)

  logger.info('Notifying wedlock for new key', {
    recipient,
    lock: lockAddress,
    keyId: tokenId,
  })

  const attachments: Attachment[] = []
  if (includeQrCode && network && tokenId) {
    const ticket = await createTicket({
      lockAddress,
      tokenId,
      network,
      owner: ownerAddress,
    })
    const svg = new resvg.Resvg(ticket)
    const pngData = svg.render()
    const pngBuffer = pngData.asPng()
    const dataURI = `data:image/png;base64,${pngBuffer.toString('base64')}`
    attachments.push({ path: dataURI })
  }

  const openSeaUrl =
    networks[network!] && tokenId && lockAddress
      ? networks[network!].opensea?.tokenUrl(lockAddress, tokenId) ?? undefined
      : undefined

  const transferUrl = new URL('/transfer', config.unlockApp)
  transferUrl.searchParams.set('lockAddress', lockAddress)
  transferUrl.searchParams.set('keyId', tokenId ?? '')
  transferUrl.searchParams.set('network', network?.toString() ?? '')

  const templates = isAirdroppedRecipient
    ? [`keyAirdropped${lockAddress.trim()}`, `keyAirdropped`]
    : [`keyMined${lockAddress.trim()}`, 'keyMined']
  // Lock address to find the specific template

  // get custom email content
  const template = isAirdroppedRecipient ? `keyAirdropped` : `keyMined`
  const locksmithService = new LocksmithService()
  let customEmailContent = ''
  try {
    const res = await locksmithService.getCustomEmailContent(
      Number(network),
      lockAddress,
      template
    )
    customEmailContent = res.data.content || ''
  } catch (err: any) {
    console.warn('No custom email content present')
  }

  await sendEmail(
    templates[0],
    templates[1],
    recipient,
    {
      lockName: key.lock.name,
      keychainUrl: 'https://app.unlock-protocol.com/keychain',
      keyId: tokenId ?? '',
      network: networks[network!]?.name ?? '',
      openSeaUrl,
      transferUrl: transferUrl.toString(),
      customEmailContent,
    },
    attachments
  )
}
