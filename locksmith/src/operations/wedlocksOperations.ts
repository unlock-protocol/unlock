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
import * as metadataOperations from './metadataOperations'
import { createEventIcs } from '../utils/calendar'
dayjs.extend(utc)
dayjs.extend(timezone)

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

interface AttributeProps {
  value: string
  trait_type: string
}
export interface EventProps {
  eventDescription: string
  eventDate: string
  eventTime: string
  eventAddress: string
  eventName: string
}

interface GetTemplateProps {
  isEvent: boolean
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
}
export const getEventDetail = async (
  lockAddress: string,
  network?: number
): Promise<Partial<EventProps> | undefined> => {
  if (!network) return
  let eventDetail = undefined
  const lockMetadata = await metadataOperations.getLockMetadata({
    lockAddress,
    network: network!,
  })

  const attributes: AttributeProps[] = lockMetadata?.attributes

  const getAttribute = (name: string): string | undefined => {
    return (
      attributes?.find(({ trait_type }: AttributeProps) => trait_type === name)
        ?.value || undefined
    )
  }

  const getEventDate = (
    startDate?: string,
    startTime?: string,
    timezone?: string
  ): Date | null => {
    if (startDate && startTime) {
      const timestamp = `${startDate} ${startTime}`
      const dayjsLocal = dayjs.tz(timestamp, timezone)
      return dayjsLocal.toDate()
    }

    return null
  }

  // This is an event, collect event information
  if (attributes) {
    const timeZone = getAttribute('event_timezone')
    const date = getEventDate(
      getAttribute('event_start_date'),
      getAttribute('event_start_time'),
      timeZone
    )
    const eventAddress = getAttribute('event_address')

    const eventDate = date?.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const eventTime = date?.toLocaleTimeString('en-US', {
      timeZone,
    })

    eventDetail = {
      eventName: lockMetadata?.name,
      eventDescription: lockMetadata?.description,
      eventDate,
      eventTime,
      eventAddress,
    }
  }

  return eventDetail
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

const getAttachments = async ({
  tokenId,
  network,
  lockAddress,
  owner,
  includeQrCode = false,
  event,
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
    const svg = new resvg.Resvg(ticket)
    const pngData = svg.render()
    const pngBuffer = pngData.asPng()
    const dataURI = `data:image/png;base64,${pngBuffer.toString('base64')}`
    attachments.push({ path: dataURI })
  }

  // Calendar ICS for event
  if (event) {
    const startDate = dayjs(`${event.eventTime} ${event.eventTime}`).toDate()
    const file = await createEventIcs({
      title: event?.eventName ?? '',
      description: event?.eventDescription ?? '',
      startDate,
    })
  }

  return attachments
}

const getCustomTemplate = ({
  isEvent = false,
  isAirdropped = false,
}: GetTemplateProps) => {
  if (isAirdropped) {
    return isEvent ? 'eventKeyAirdropped' : `keyAirdropped`
  }

  return isEvent ? `eventKeyMined` : `keyMined`
}

const getTemplates = ({
  isEvent = false,
  isAirdropped = false,
  lockAddress = '',
}: GetTemplateProps): [string, string] => {
  if (isEvent) {
    // Lock address to find the specific template
    return isAirdropped
      ? [`eventKeyAirdropped${lockAddress.trim()}`, `eventKeyAirdropped`]
      : [`eventKeyMined${lockAddress.trim()}`, 'eventKeyMined']
  }

  // Lock address to find the specific template
  return isAirdropped
    ? [`keyAirdropped${lockAddress.trim()}`, `keyAirdropped`]
    : [`keyMined${lockAddress.trim()}`, 'keyMined']
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

  const openSeaUrl =
    networks[network!] && tokenId && lockAddress
      ? networks[network!].opensea?.tokenUrl(lockAddress, tokenId) ?? undefined
      : undefined

  const transferUrl = new URL('/transfer', config.unlockApp)
  transferUrl.searchParams.set('lockAddress', lockAddress)
  transferUrl.searchParams.set('keyId', tokenId ?? '')
  transferUrl.searchParams.set('network', network?.toString() ?? '')

  const eventDetail = await getEventDetail(lockAddress, network)
  const isEvent = !!eventDetail

  // attachments list
  const attachments = await getAttachments({
    tokenId,
    lockAddress,
    network,
    owner: ownerAddress,
    includeQrCode,
    event: eventDetail,
  })

  // email templates
  const templates = getTemplates({
    isEvent,
    isAirdropped: isAirdroppedRecipient,
    lockAddress,
  })

  // get custom email content
  const template = getCustomTemplate({
    isEvent,
    isAirdropped: isAirdroppedRecipient,
  })

  const customContent = await getCustomContent(lockAddress, network!, template)
  const withLockImage = (customContent || '')?.length > 0
  const lockImage = `${config.services.locksmith}/lock/${lockAddress}/icon`

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
      customContent,
      lockImage: withLockImage ? lockImage : undefined, // add custom image only when custom content is present
      ...eventDetail, // add event details props
    },
    attachments
  )
}
