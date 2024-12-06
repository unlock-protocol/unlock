import { SubgraphService, Web3Service } from '@unlock-protocol/unlock-js'
import { networks } from '@unlock-protocol/networks'

import dayjs from '../config/dayjs'
import { kebabCase, defaultsDeep } from 'lodash'
import * as metadataOperations from './metadataOperations'
import {
  PaywallConfig,
  getLockTypeByMetadata,
  toFormData,
} from '@unlock-protocol/core'
import { CheckoutConfig, EventData, KeyMetadata } from '../models'
import { saveCheckoutConfig } from './checkoutConfigOperations'
import { EventBodyType } from '../controllers/v2/eventsController'
import { Op } from 'sequelize'
import { removeProtectedAttributesFromObject } from '../utils/protectedAttributes'
import { ethers } from 'ethers'

interface AttributeProps {
  value: string
  trait_type: string
}

export interface EventProps {
  eventDescription: string
  eventTime: string
  eventDate: string
  eventAddress: string
  eventLocation: string
  eventIsInPerson: boolean
  eventName: string
  startDate: Date | null
  endDate: Date | null
  eventUrl: string | null
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

export const getEventForLock = async (
  lockAddress: string,
  network: number,
  includeProtected: boolean
) => {
  const checkoutConfigs = await CheckoutConfig.findAll({
    where: {
      [Op.or]: [
        { [`config.locks.${lockAddress}.network`]: network },
        { [`config.locks.${lockAddress.toLowerCase()}.network`]: network },
      ],
    },
    order: [['updatedAt', 'DESC']],
  })

  // If there are checkout configs, let's see if an even exists with them!
  // Let's now find any event that uses this checkout config!
  const event = await EventData.scope('withoutId').findOne({
    where: {
      checkoutConfigId: checkoutConfigs.map((record) => record.id),
    },
  })
  if (event && !includeProtected) {
    event.data = removeProtectedAttributesFromObject(event.data)
  }
  // Robustness principle: the front-end, as well as mailers expects a ticket object to be present
  if (event) {
    const ticket = toFormData(event?.data).ticket
    event.data.ticket = defaultsDeep(ticket, event.data.ticket)
  }
  return event
}

export const getEventMetadataForLock = async (
  lockAddress: string,
  network?: number
): Promise<EventProps | undefined> => {
  if (!network) return

  let eventDetail = undefined

  const lockMetadata = await metadataOperations.getLockMetadata({
    lockAddress,
    network: network!,
  })

  const types = getLockTypeByMetadata(lockMetadata)

  const attributes: AttributeProps[] = lockMetadata?.attributes || []

  // Util function!
  const getAttribute = (name: string): string | undefined => {
    return (
      attributes?.find(({ trait_type }: AttributeProps) => trait_type === name)
        ?.value || undefined
    )
  }

  if (types.isEvent) {
    const timeZone = getAttribute('event_timezone')
    const startDate =
      getEventDate(
        getAttribute('event_start_date'),
        getAttribute('event_start_time'),
        timeZone
      ) ?? null

    // get end date or fallback to 1 hour when not available
    const endDate =
      getEventDate(
        getAttribute('event_end_date'),
        getAttribute('event_end_time'),
        timeZone
      ) ?? (startDate ? dayjs(startDate).add(1, 'hour').toDate() : null)

    const eventAddress = getAttribute('event_address') ?? ''
    const eventLocation = getAttribute('event_location') ?? ''

    const eventIsInPerson = getAttribute('event_is_in_person') === 'true'

    const isSameDay = dayjs(startDate).isSame(endDate, 'day')

    const eventStartDate = startDate?.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone,
    })

    const eventEndDate = endDate?.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone,
    })

    const eventStartTime = startDate?.toLocaleTimeString('en-US', {
      timeZone,
    })

    const eventEndTime = endDate?.toLocaleTimeString('en-US', {
      timeZone,
    })

    const eventDate =
      isSameDay || !endDate
        ? `${eventStartDate}`
        : `${eventStartDate} to ${eventEndDate}`

    const eventTime = isSameDay
      ? `${eventStartTime} to ${eventEndTime}`
      : `${eventStartTime}`

    eventDetail = {
      eventName: lockMetadata?.name || '',
      eventDescription: lockMetadata?.description,
      eventDate,
      eventTime,
      eventAddress,
      eventLocation,
      eventIsInPerson,
      startDate,
      eventUrl: lockMetadata?.external_url,
      endDate,
    }
  }

  return eventDetail
}

export const getEventBySlug = async (
  slug: string,
  includeProtected: boolean
) => {
  const event = await EventData.scope('withoutId').findOne({
    where: {
      slug,
    },
  })
  // Robustness principle: the front-end, as well as mailers expects a ticket object to be present
  if (event) {
    const ticket = toFormData(event?.data).ticket
    event.data.ticket = defaultsDeep(ticket, event.data.ticket)
  }

  if (event && !includeProtected) {
    event.data = removeProtectedAttributesFromObject(event.data)
  }
  return event
}

export const createEventSlug = async (
  name: string,
  index: number | undefined = undefined
): Promise<string> => {
  const cleanName = name.replace(/[^\x20-\x7E]/g, '')
  const slug = index
    ? kebabCase([cleanName, index].join('-'))
    : kebabCase(cleanName)
  const event = await getEventBySlug(slug, false /** includeProtected */)
  if (event) {
    return createEventSlug(name, index ? index + 1 : 1)
  }
  return slug
}

export const saveEvent = async (
  parsed: EventBodyType,
  walletAddress: string
): Promise<[EventData, boolean]> => {
  const slug = parsed.data.slug || (await createEventSlug(parsed.data.name))

  let data = {}
  const previousEvent = await EventData.scope('withoutId').findOne({
    where: { slug },
  })
  if (previousEvent) {
    data = defaultsDeep(
      {
        ...parsed.data,
      },
      previousEvent.data
    )
  } else {
    data = {
      ...parsed.data,
      slug, // Making sure we add the slug to the data as well.
    }
  }

  const [savedEvent, _] = await EventData.upsert(
    {
      name: parsed.data.name,
      slug,
      data,
      createdBy: walletAddress,
    },
    {
      conflictFields: ['slug'],
    }
  )

  if (!savedEvent.checkoutConfigId) {
    const checkoutConfig = await PaywallConfig.strip().parseAsync(
      parsed.checkoutConfig.config
    )
    const createdConfig = await saveCheckoutConfig({
      name: `Checkout config for ${savedEvent.name} (${savedEvent.slug})`,
      config: checkoutConfig,
      user: walletAddress,
    })
    // And now attach the id to the savedEvent
    savedEvent.checkoutConfigId = createdConfig.id
    await savedEvent.save()
  }

  return [savedEvent, !parsed.data.slug]
}

export const getCheckedInAttendees = async (slug: string) => {
  // get the event, get the locks, get the KeyMetadata, get the owners for each of these
  // this can take a while? We need to use the subgraph!
  const event = await getEventBySlug(slug, false /** includeProtected */)
  if (!event || !event.checkoutConfigId) {
    return []
  }
  const checkout = await CheckoutConfig.findByPk(event.checkoutConfigId)
  if (!checkout) {
    return []
  }
  const locks = Object.keys(checkout.config.locks)
  const allKeys = await KeyMetadata.findAll({
    where: {
      address: locks,
    },
  })
  const filteredKeys = allKeys.filter((key) => !!key.data.metadata?.checkedInAt)
  // And now filter out the ones that have been checked in!

  const networks: number[] = checkout.config.network
    ? [checkout.config.network]
    : ([] as number[])
  for (let i = 0; i < locks.length; i++) {
    const network = checkout.config.locks[locks[i]].network
    if (network && networks.indexOf(network) === -1) {
      networks.push(network)
    }
  }
  const subgraph = new SubgraphService()

  // And finally let's get their owners!
  const keys = await subgraph.keys(
    {
      first: 1000, // How do we handle when there is more than 1000 atten
      where: {
        lock_in: locks.map((lock) => lock.toLowerCase()), // Subgraph are lowercase..
        tokenId_in: filteredKeys.map((key) => key.id),
      },
    },
    {
      networks,
    }
  )
  return keys.map((key) => key.owner)
}

/**
 * Updates an event with pending lock deployment information
 */
export const updateEventPendingLock = async (
  slug: string,
  pendingLock: {
    transaction: string
    network: number
  }
) => {
  const event = await EventData.findOne({
    where: { slug },
  })

  if (!event) {
    throw new Error('Event not found')
  }

  await event.setPendingLock(pendingLock)
  return event
}

/**
 * Checks if a lock has been deployed from a transaction
 * Returns the lock address if found
 */
export const getLockAddressFromTransaction = async (
  transactionHash: string,
  network: number
): Promise<string | null> => {
  const web3Service = new Web3Service(networks)
  const provider = web3Service.providerForNetwork(network)

  try {
    const receipt = await provider.getTransactionReceipt(transactionHash)

    if (!receipt || receipt.status !== 1) {
      return null
    }

    const unlock = new ethers.Contract(
      networks[network].unlockAddress,
      [
        'event NewLock(address indexed lockOwner, address indexed newLockAddress)',
      ],
      provider
    )

    const newLockEvent = receipt.logs
      .map((log) => {
        try {
          return unlock.interface.parseLog(log)
        } catch {
          return null
        }
      })
      .find((log) => log?.name === 'NewLock')

    return newLockEvent ? newLockEvent.args.newLockAddress : null
  } catch (error) {
    console.error('Error getting lock address from transaction:', error)
    return null
  }
}

/**
 * Updates an event with deployed lock information
 */
export const updateEventWithDeployedLock = async (
  slug: string,
  lockAddress: string,
  checkoutConfig: any
) => {
  const event = await EventData.findOne({
    where: { slug },
  })

  if (!event) {
    throw new Error('Event not found')
  }

  await event.update({
    lockAddress,
    checkoutConfigId: checkoutConfig.id,
    pendingTransactionHash: null,
    isPending: false,
  })

  return event
}

/**
 * Gets all events with pending lock deployments
 */
export const getPendingLockDeployments = async () => {
  return EventData.findAll({
    where: {
      pendingLockTransaction: {
        [Op.not]: null,
      },
    },
  })
}

export const createEventWithPendingLock = async (
  eventData: any,
  transactionHash: string,
  network: number,
  creator: string
) => {
  const event = await EventData.create({
    ...eventData,
    pendingTransactionHash: transactionHash,
    network,
    isPending: true,
    createdBy: creator,
  })
  return event
}
