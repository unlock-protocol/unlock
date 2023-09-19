import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import * as Normalizer from '../utils/normalizer'
import config from '../config/config'
import { logger } from '../logger'
import networks from '@unlock-protocol/networks'
import { createTicket } from '../utils/ticket'
import { KeyManager } from '@unlock-protocol/unlock-js'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkHtml from 'remark-html'
import * as emailOperations from './emailOperations'
import * as lockSettingOperations from './lockSettingOperations'
import * as userMetadataOperations from './userMetadataOperations'
import { createEventIcs } from '../utils/calendar'
import { EventProps, getEventDetail } from './eventOperations'
import { LockSetting } from '../models/lockSetting'
import {
  DEFAULT_LOCK_SETTINGS,
  LockSettingProps,
} from '../controllers/v2/lockSettingController'
import { getLockMetadata, generateKeyMetadata } from './metadataOperations'
import { LockType, getLockTypeByMetadata } from '@unlock-protocol/core'
import { getCertificateLinkedinShareUrl } from '../utils/certificationHelpers'
import { svgStringToDataURI } from '../utils/image'
import { createCertificate } from '../utils/certification'

dayjs.extend(utc)
dayjs.extend(timezone)

type Params = {
  [key: string]: string | number | undefined | boolean
  keyId: string
  keychainUrl?: string
  lockName: string
  network: string
  lockAddress: string
  txUrl?: string
  openSeaUrl?: string
}

type Attachment = {
  path: string
  filename: string
}
// TODO: replace with SubgraphKey schema
interface Key {
  lock: {
    address: string
    name: string
  }
  manager: string
  tokenId?: string
  owner: string
  keyId?: string
  transactionsHash?: string[]
}

interface SendEmailProps {
  network: number
  template: string
  failoverTemplate: string
  recipient: string
  params?: Params
  attachments?: Attachment[]
}
/**
 * Function to send an email with the Wedlocks service
 * Pass a template, a recipient, some params and attachments
 */
export const sendEmail = async ({
  network,
  template,
  failoverTemplate,
  recipient,
  params = {} as any,
  attachments = [],
}: SendEmailProps) => {
  // prevent send email when is not enabled
  const {
    sendEmail: canSendEmail,
    replyTo,
    emailSender,
  } = await getLockSettings(params.lockAddress, network)

  if (!canSendEmail) {
    logger.info('Email sending disabled for', {
      lockAddress: params.lockAddress,
    })
    return `Email sending disabled for ${params.lockAddress}`
  }

  const payload = {
    template,
    failoverTemplate,
    recipient,
    params,
    attachments,
    replyTo,
    emailSender,
  }

  try {
    const response = await fetch(config.services.wedlocks, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    if (response.status !== 204) {
      const reason = await response.text()
      logger.info(
        'Wedlocks returned unexpected status code',
        response.status,
        reason
      )
      return reason
    }
    return true
  } catch (error: any) {
    logger.error(`Sending email to ${config.services.wedlocks} failed`, error)
    return `Sending email to ${config.services.wedlocks} failed`
  }
}

/**
 * Resolves when all new keys have been processed
 * @param keys
 */
export const notifyNewKeysToWedlocks = async (keys: any[], network: number) => {
  logger.info('Notifying following keys to wedlock', {
    keys: keys.map((key: any) => [key.lock.address, key.tokenId]),
  })
  for await (const key of keys) {
    notifyNewKeyToWedlocks(key, network)
  }
}
interface GetTemplateProps {
  types?: LockType
  isAirdropped: boolean
  lockAddress?: string
}

interface GetAttachmentProps {
  tokenId?: string
  network?: number
  lockAddress: string
  owner: string
  event?: Partial<EventProps>
  types?: LockType
}

const getTransactionHashUrl = (
  key: Key,
  network: number
): string | undefined => {
  const hashes = key?.transactionsHash ?? []
  const lockAddress = Normalizer.ethereumAddress(key.lock.address)
  const lastHashIndex = Math.max(hashes?.length - 1, 0)

  const transactionsHash = hashes[lastHashIndex] // get last transaction hash

  const transactionReceiptUrl = transactionsHash
    ? `${config.unlockApp}/receipts?address=${lockAddress}&network=${network}&hash=${transactionsHash}`
    : undefined

  return transactionReceiptUrl
}

const getCustomContent = async (
  lockAddress: string,
  network: number,
  template: string
): Promise<string | undefined> => {
  let customContent = undefined
  try {
    const res = await emailOperations.getCustomTemplateContent({
      network: Number(network),
      lockAddress,
      template,
    })

    // parse markdown to HTML
    if (res) {
      const parsedContent = await unified()
        .use(remarkParse)
        .use(remarkHtml)
        .process(res?.content || '')

      if (parsedContent?.value?.length > 0) {
        customContent = String(parsedContent?.value)
      }
    }
  } catch (err: any) {
    console.warn('No custom email content present')
  }
  return customContent
}

export const getAttachments = async ({
  tokenId,
  network,
  lockAddress,
  owner,
  event,
  types,
}: GetAttachmentProps): Promise<Attachment[]> => {
  const { isEvent, isCertification } = types ?? {}
  const attachments: Attachment[] = []

  // QR-code attachment for event
  if (isEvent && network && tokenId) {
    const ticket = await createTicket({
      lockAddress,
      tokenId,
      network,
      owner,
    })
    attachments.push({
      path: svgStringToDataURI(ticket),
      filename: 'ticket.png',
    })
  }

  // Add ICS attachment when event is present
  if (isEvent && event) {
    const file: Buffer | undefined = await createEventIcs({
      title: event?.eventName ?? '',
      description: event?.eventDescription ?? '',
      startDate: event?.startDate || null,
      endDate: event?.endDate ?? null,
    })

    if (file) {
      const url = file.toString('base64')
      const dataURI = `data:text/calendar;base64,${url}`
      attachments.push({ path: dataURI, filename: 'calendar.ics' })
    }
  }

  // Add certificate when lock is certificate
  if (isCertification && !!network && !!tokenId) {
    const certificate = await createCertificate({
      network,
      lockAddress,
      tokenId,
    })
    if (certificate) {
      attachments.push({
        path: svgStringToDataURI(certificate),
        filename: 'certification.png',
      })
    }
  }

  return attachments
}

export const getCustomTemplate = ({
  types,
  isAirdropped = false,
}: GetTemplateProps) => {
  const MappingByType: Record<string, { minted: string; airdropped: string }> =
    {
      isCertification: {
        minted: 'certificationKeyMined',
        airdropped: 'certificationKeyAirdropped',
      },
      isEvent: {
        minted: 'eventKeyMined',
        airdropped: 'eventKeyAirdropped',
      },
    }

  // find lock type
  const [template] =
    Object.entries(types ?? {}).find(([, value]) => value === true) ?? []

  // return template based on lock type if found
  if (template) {
    const { minted, airdropped } = MappingByType[template]
    return isAirdropped ? airdropped : minted
  }

  // return default template
  return isAirdropped ? 'keyAirdropped' : `keyMined`
}

export const getTemplates = ({
  types,
  isAirdropped = false,
  lockAddress = '',
}: GetTemplateProps): [string, string] => {
  const MappingByType: Record<
    string,
    {
      minted: [string, string]
      airdropped: [string, string]
    }
  > = {
    isEvent: {
      minted: [`eventKeyMined${lockAddress.trim()}`, 'eventKeyMined'],
      airdropped: [
        `eventKeyAirdropped${lockAddress.trim()}`,
        `eventKeyAirdropped`,
      ],
    },
    isCertification: {
      minted: [
        `certificationKeyMined${lockAddress.trim()}`,
        'certificationKeyMined',
      ],
      airdropped: [
        `certificationKeyAirdropped${lockAddress.trim()}`,
        `certificationKeyAirdropped`,
      ],
    },
  }

  // find lock type
  const [template] =
    Object.entries(types ?? {}).find(([, value]) => value === true) ?? []

  // return template based on lock type if found
  if (template) {
    const { minted, airdropped } = MappingByType[template]
    return isAirdropped ? airdropped : minted
  }

  // Lock address to find the specific template
  return isAirdropped
    ? [`keyAirdropped${lockAddress.trim()}`, `keyAirdropped`]
    : [`keyMined${lockAddress.trim()}`, 'keyMined']
}

const getLockSettings = async (
  lockAddress: string,
  network?: number
): Promise<LockSetting | LockSettingProps> => {
  if (lockAddress && network) {
    const settings = await lockSettingOperations.getSettings({
      lockAddress: Normalizer.ethereumAddress(lockAddress),
      network,
      includeProtected: true,
    })
    return settings
  }
  return DEFAULT_LOCK_SETTINGS
}
/**
 * Check if there are metadata with an email address for a key and sends
 * and email based on the lock's template if applicable
 * @param key
 */

export interface CertificationProps {
  certificationUrl: string
}

export const notifyNewKeyToWedlocks = async (key: Key, network: number) => {
  try {
    const keyManager = new KeyManager()
    const lockAddress = Normalizer.ethereumAddress(key.lock.address)
    const ownerAddress = Normalizer.ethereumAddress(key.owner)
    const tokenId = key?.tokenId
    const manager = key?.manager

    const recipient = await userMetadataOperations.getUserEmailRecipient({
      lockAddress,
      ownerAddress,
    })

    if (!recipient) {
      logger.info('No recipient found for', { lockAddress, ownerAddress })
      return `No recipient found for owner ${ownerAddress} on lock ${lockAddress}`
    }

    const airdroppedRecipient = keyManager.createTransferAddress({
      params: {
        email: recipient,
        lockAddress,
      },
    })

    const isAirdroppedRecipient =
      Normalizer.ethereumAddress(airdroppedRecipient) ===
        Normalizer.ethereumAddress(ownerAddress) ||
      Normalizer.ethereumAddress(manager) ===
        Normalizer.ethereumAddress(networks[network!]?.keyManagerAddress)

    logger.info(`Sending ${recipient} key: ${lockAddress}-${tokenId}`)

    logger.info('Notifying wedlock for new key', {
      recipient,
      lock: lockAddress,
      keyId: tokenId,
    })

    const openSeaUrl =
      networks[network!] && tokenId && lockAddress
        ? networks[network!].opensea?.tokenUrl(lockAddress, tokenId) ??
          undefined
        : undefined

    const transferUrl = new URL('/transfer', config.unlockApp)
    transferUrl.searchParams.set('lockAddress', lockAddress)
    transferUrl.searchParams.set('keyId', tokenId ?? '')
    transferUrl.searchParams.set('network', network?.toString() ?? '')

    const metadata = await getLockMetadata({ lockAddress, network })
    const types = getLockTypeByMetadata(metadata)

    const { isEvent, isCertification } = types
    let eventDetail: EventProps | undefined = undefined
    let certificationDetail: CertificationProps | undefined = undefined

    // get event details only when lock is event
    if (isEvent) {
      eventDetail = await getEventDetail(lockAddress, network)
    }

    if (isCertification && tokenId) {
      const hostUrl = new URL(config.unlockApp)
      const keyData = await generateKeyMetadata(
        lockAddress,
        tokenId,
        true, // include protected data
        hostUrl.host, // host
        network
      )
      const certificationUrl = getCertificateLinkedinShareUrl({
        lockAddress,
        network,
        tokenId,
        metadata: keyData,
      })

      if (certificationUrl) {
        certificationDetail = {
          certificationUrl,
        }
      }
    }

    // attachments list
    const attachments = await getAttachments({
      tokenId,
      lockAddress,
      network,
      owner: ownerAddress,
      event: eventDetail,
      types,
    })

    // email templates
    const templates = getTemplates({
      types,
      isAirdropped: isAirdroppedRecipient,
      lockAddress,
    })

    // get custom email content
    const template = getCustomTemplate({
      types,
      isAirdropped: isAirdroppedRecipient,
    })

    const customContent = await getCustomContent(
      lockAddress,
      network!,
      template
    )
    const withLockImage = (customContent || '')?.length > 0
    const lockImage = `${config.services.locksmith}/lock/${lockAddress}/icon`

    const keychainUrl = `${config.unlockApp}/keychain`
    const transactionReceiptUrl = getTransactionHashUrl(key, network)

    return sendEmail({
      network: network!,
      template: templates[0],
      failoverTemplate: templates[1],
      recipient,
      attachments,
      params: {
        lockAddress: key.lock.address ?? '',
        lockName: key.lock.name,
        keyId: tokenId ?? '',
        network: networks[network!]?.name ?? '',
        customContent,
        lockImage: withLockImage ? lockImage : undefined, // add custom image only when custom content is present
        // urls
        keychainUrl,
        transactionReceiptUrl,
        transferUrl: transferUrl.toString(),
        openSeaUrl,
        // add event details props
        eventName: eventDetail?.eventName,
        eventDate: eventDetail?.eventDate,
        eventDescription: eventDetail?.eventDescription,
        eventTime: eventDetail?.eventTime,
        eventAddress: eventDetail?.eventAddress,
        // add certification props
        ...certificationDetail,
      },
    })
  } catch (error) {
    logger.error('failed to send new key to wedlocks ', {
      key,
      network,
      error,
    })
    return null
  }
}
