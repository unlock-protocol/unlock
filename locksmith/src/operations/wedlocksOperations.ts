import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import * as Normalizer from '../utils/normalizer'
import { UserTokenMetadata } from '../models'
import config from '../config/config'
import { logger } from '../logger'
import networks from '@unlock-protocol/networks'
import { createTicket } from '../utils/ticket'
import resvg from '@resvg/resvg-js'
import { KeyManager } from '@unlock-protocol/unlock-js'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkHtml from 'remark-html'
import * as emailOperations from './emailOperations'
import * as lockSettingOperations from './lockSettingOperations'

import { createEventIcs } from '../utils/calendar'
import { EventProps, getEventDetail } from './eventOperations'
import { LockSetting } from '../models/lockSetting'
import {
  DEFAULT_LOCK_SETTINGS,
  LockSettingProps,
} from '../controllers/v2/lockSettingController'
import { getLockMetadata } from './metadataOperations'
import { LockType, getLockTypeByMetadata } from '@unlock-protocol/core'
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
}

interface Key {
  lock: {
    address: string
    name: string
  }
  manager: string
  tokenId?: string
  owner: string
  keyId?: string
}

interface SendEmailProps {
  network: number
  template: string
  failoverTemplate: string
  recipient: string
  params: Params
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
  const { sendEmail: canSendEmail, replyTo } = await getLockSettings(
    params.lockAddress,
    network
  )

  if (!canSendEmail) {
    return
  }

  const payload = {
    template,
    failoverTemplate,
    recipient,
    params,
    attachments,
    replyTo,
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
export const notifyNewKeysToWedlocks = async (keys: any[], network: number) => {
  logger.info('Notifying following keys to wedlock', {
    keys: keys.map((key: any) => [key.lock.address, key.tokenId]),
  })
  for await (const key of keys) {
    notifyNewKeyToWedlocks(key, network, true)
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
  includeQrCode?: boolean
  event?: Partial<EventProps>
  types?: LockType
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

const svgStringToDataURI = (svgString: string) => {
  const svg = new resvg.Resvg(svgString)
  const pngData = svg.render()
  const pngBuffer = pngData.asPng()
  const dataURI = `data:image/png;base64,${pngBuffer.toString('base64')}`
  return dataURI
}

const getAttachments = async ({
  tokenId,
  network,
  lockAddress,
  owner,
  includeQrCode = false,
  event,
  types,
}: GetAttachmentProps): Promise<Attachment[]> => {
  const attachments: Attachment[] = []

  // QR-code attachment
  if (includeQrCode && network && tokenId) {
    const ticket = await createTicket({
      lockAddress,
      tokenId,
      network,
      owner,
    })
    attachments.push({ path: svgStringToDataURI(ticket) })
  }

  const { isEvent, isCertification } = types ?? {}

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
      attachments.push({ path: dataURI })
    }
  }

  // Add certificate when lock is certificate
  if (isCertification && network && tokenId) {
    const certificate = await createCertificate({
      network,
      lockAddress,
      tokenId,
    })
    attachments.push({ path: svgStringToDataURI(certificate) })
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

export const notifyNewKeyToWedlocks = async (
  key: Key,
  network: number,
  includeQrCode = true
) => {
  const keyManager = new KeyManager()
  const lockAddress = Normalizer.ethereumAddress(key.lock.address)
  const ownerAddress = Normalizer.ethereumAddress(key.owner)
  const tokenId = key?.tokenId
  const manager = key?.manager

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
    airdroppedRecipient?.toLowerCase() === ownerAddress?.toLowerCase() &&
    manager?.toLowerCase().trim() ===
      networks[network!]?.keyManagerAddress?.toLowerCase()?.trim()

  logger.info(`Sending ${recipient} key: ${lockAddress}-${tokenId}`)

  logger.info('Notifying wedlock for new key', {
    recipient,
    lock: lockAddress,
    keyId: tokenId,
  })

  const openSeaUrl =
    networks[network!] && tokenId && lockAddress
      ? networks[network!].opensea?.tokenUrl(lockAddress, tokenId) ?? undefined
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

  if (isCertification) {
    const certificationUrl = `${config.unlockApp}/certification?lockAddress=${lockAddress}&network=${network}&tokenId=${tokenId}`
    certificationDetail = {
      certificationUrl,
    }
  }

  // attachments list
  const attachments = await getAttachments({
    tokenId,
    lockAddress,
    network,
    owner: ownerAddress,
    includeQrCode,
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

  const customContent = await getCustomContent(lockAddress, network!, template)
  const withLockImage = (customContent || '')?.length > 0
  const lockImage = `${config.services.locksmith}/lock/${lockAddress}/icon`

  await sendEmail({
    network: network!,
    template: templates[0],
    failoverTemplate: templates[1],
    recipient,
    attachments,
    params: {
      lockAddress: key.lock.address ?? '',
      lockName: key.lock.name,
      keychainUrl: 'https://app.unlock-protocol.com/keychain',
      keyId: tokenId ?? '',
      network: networks[network!]?.name ?? '',
      openSeaUrl,
      transferUrl: transferUrl.toString(),
      customContent,
      lockImage: withLockImage ? lockImage : undefined, // add custom image only when custom content is present
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
}
