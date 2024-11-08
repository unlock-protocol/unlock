import { EventCollection } from '../models/EventCollection'
import { EventData } from '../models/Event'
import { EventCollectionAssociation } from '../models/EventCollectionAssociation'
import { z } from 'zod'
import { kebabCase } from 'lodash'
import { sendEmail } from './wedlocksOperations'
import config from '../config/config'
import logger from '../logger'
import { getPrivyUserByAddress } from './privyUserOperations'

// event collection body schema
const EventCollectionBody = z.object({
  title: z.string(),
  description: z.string(),
  coverImage: z.string().optional(),
  banner: z.string().optional(),
  links: z
    .array(
      z.object({
        type: z.enum(['farcaster', 'website', 'x', 'github', 'youtube']),
        url: z.string().url(),
      })
    )
    .optional(),
  managerAddresses: z.array(z.string()),
})

/**
 * Creates a unique slug for an event collection based on the title.
 * It handles special characters, removes diacritics, and ensures uniqueness.
 *
 * @param title - The title of the event collection.
 * @param index - The current index for uniqueness (used recursively).
 * @returns A unique slug string.
 */
export async function createEventCollectionSlug(
  title: string,
  index: number | undefined = undefined
): Promise<string> {
  // Normalize the title to NFD form and remove diacritics
  const normalizedTitle = title.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const cleanTitle = normalizedTitle.replace(/[^\w\s-]/g, '').trim()

  const baseSlug = kebabCase(cleanTitle)
  const slug = index ? `${baseSlug}-${index}` : baseSlug

  // Check if the slug already exists
  const existingCollection = await EventCollection.findByPk(slug)
  if (existingCollection) {
    // If the slug already exists, increment the index and try again
    return createEventCollectionSlug(title, index ? index + 1 : 1)
  }

  return slug
}

/**
 * Creates a new event collection.
 * This operation generates a unique slug for the collection based on the title,
 * and associates the creator's address as a manager if no other addresses are provided.
 * It also sends email notifications to all managers.
 *
 * @param parsedBody - The parsed body containing event collection details.
 * @param creatorAddress - The wallet address of the user creating the collection.
 * @returns A promise that resolves to the created event collection object.
 */
export const createEventCollectionOperation = async (
  parsedBody: z.infer<typeof EventCollectionBody>,
  creatorAddress: string
) => {
  const slug = await createEventCollectionSlug(parsedBody.title)
  const managerAddresses = [
    ...new Set([...parsedBody.managerAddresses, creatorAddress]),
  ]

  const eventCollection = await EventCollection.create({
    ...parsedBody,
    slug,
    managerAddresses,
  })

  try {
    // Send email to each manager
    for (const manager of managerAddresses) {
      const result = await getPrivyUserByAddress(manager)
      if (result.success && result.user?.email?.address) {
        await sendEmail({
          template: 'eventCollectionCreated',
          recipient: result.user.email.address,
          params: {
            collectionName: parsedBody.title,
            collectionUrl: `${config.unlockApp}/events/${eventCollection.slug}`,
          },
        })
      }
    }
  } catch (error) {
    logger.error('Failed to send notification emails:', error)
  }

  eventCollection.events = []
  return eventCollection
}

/**
 * Retrieves an event collection by its slug, including all associated approved events.
 *
 * @param slug - The unique identifier (slug) of the event collection.
 * @returns A promise that resolves to the event collection object with events.
 * @throws An error if the event collection is not found.
 */
export const getEventCollectionOperation = async (slug: string) => {
  const eventCollection = await EventCollection.findByPk(slug, {
    include: [
      {
        model: EventData,
        as: 'events',
        through: {
          attributes: [],
          where: {
            isApproved: true,
          },
        },
      },
    ],
  })

  if (!eventCollection) {
    throw new Error('Event collection not found')
  }

  return eventCollection
}

/**
 * Retrieves unapproved events for a specific event collection.
 *
 * @param slug - The unique identifier (slug) of the event collection.
 * @returns A promise that resolves to an array of unapproved events.
 * @throws An error if the event collection is not found.
 */
export const getUnapprovedEventsForCollectionOperation = async (
  slug: string
) => {
  const eventCollection = await EventCollection.findByPk(slug, {
    include: [
      {
        model: EventData,
        as: 'events',
        through: {
          attributes: [],
          where: {
            isApproved: false,
          },
        },
      },
    ],
  })

  if (!eventCollection) {
    throw new Error('Event collection not found')
  }

  return eventCollection.events
}

/**
 * Updates an existing event collection.
 * It checks if the event collection exists and if the user is authorized
 * to make updates. If authorized, it updates the collection with the provided data.
 *
 * @param slug - The unique identifier (slug) of the event collection to update.
 * @param parsedBody - The parsed body containing updated event collection details.
 * @param userAddress - The wallet address of the user attempting to update the collection.
 * @returns A promise that resolves to the updated event collection object.
 * @throws An error if the collection is not found or the user is not authorized.
 */
export const updateEventCollectionOperation = async (
  slug: string,
  parsedBody: z.infer<typeof EventCollectionBody>,
  userAddress: string
) => {
  const eventCollection = await EventCollection.findByPk(slug)
  if (!eventCollection) {
    throw new Error('Event collection not found')
  }

  if (!eventCollection.managerAddresses.includes(userAddress)) {
    throw new Error('Not authorized to update this collection')
  }

  await eventCollection.update({
    ...parsedBody,
  })
  return eventCollection
}

/**
 * Adds a new manager address to an existing event collection.
 *
 * @param slug - The unique identifier (slug) of the event collection.
 * @param newManagerAddress - The wallet address to be added as a manager.
 * @param requesterAddress - The wallet address of the user attempting the operation.
 * @returns A promise that resolves to the updated event collection object.
 * @throws An error if the collection is not found or the user is not authorized.
 */
export const addManagerAddressOperation = async (
  slug: string,
  newManagerAddress: string,
  requesterAddress: string
): Promise<EventCollection> => {
  const eventCollection = await EventCollection.findByPk(slug)
  if (!eventCollection) {
    throw new Error('Event collection not found')
  }

  if (!eventCollection.managerAddresses.includes(requesterAddress)) {
    throw new Error('Not authorized to add managers to this collection')
  }

  if (eventCollection.managerAddresses.includes(newManagerAddress)) {
    throw new Error('Address is already a manager')
  }

  eventCollection.managerAddresses = [
    ...eventCollection.managerAddresses,
    newManagerAddress,
  ]

  await eventCollection.save()
  return eventCollection
}

/**
 * Removes an existing manager address from an event collection.
 *
 * @param slug - The unique identifier (slug) of the event collection.
 * @param managerAddressToRemove - The wallet address to be removed from managers.
 * @param requesterAddress - The wallet address of the user attempting the operation.
 * @returns A promise that resolves to the updated event collection object.
 * @throws An error if the collection is not found, the user is not authorized, or the address is not a manager.
 */
export const removeManagerAddressOperation = async (
  slug: string,
  managerAddressToRemove: string,
  requesterAddress: string
): Promise<EventCollection> => {
  const eventCollection = await EventCollection.findByPk(slug)
  if (!eventCollection) {
    throw new Error('Event collection not found')
  }

  if (!eventCollection.managerAddresses.includes(requesterAddress)) {
    throw new Error('Not authorized to remove managers from this collection')
  }

  if (!eventCollection.managerAddresses.includes(managerAddressToRemove)) {
    throw new Error('Address is not a manager')
  }

  // Prevent removing the last manager
  if (eventCollection.managerAddresses.length === 1) {
    throw new Error('Cannot remove the last manager of the collection')
  }

  eventCollection.managerAddresses = eventCollection.managerAddresses.filter(
    (address) => address !== managerAddressToRemove
  )

  await eventCollection.save()
  return eventCollection
}

/**
 * Adds an event to a specified event collection.
 * It checks for the existence of both the collection and the event
 * before creating an association between them. If the user is a manager,
 * they can approve the association if it was previously unapproved.
 *
 * @param collectionSlug - The unique identifier (slug) of the event collection
 * @param eventSlug - The unique identifier (slug) of the event
 * @param userAddress - The wallet address of the user attempting to add the event.
 * @returns A promise that resolves to the event collection association object,
 *          which includes details about the event and its approval status.
 * @throws An error if the specified collection or event cannot be found.
 */
export const addEventToCollectionOperation = async (
  collectionSlug: string,
  eventSlug: string,
  userAddress: string
): Promise<{ association: EventCollectionAssociation; status: string }> => {
  const collection = await EventCollection.findByPk(collectionSlug)
  if (!collection) {
    throw new Error('Collection not found')
  }

  const event = await EventData.scope('withoutId').findOne({
    where: { slug: eventSlug },
  })
  if (!event) {
    throw new Error('Event not found')
  }

  const isManager = collection.managerAddresses.includes(userAddress)

  const [association, created] = await EventCollectionAssociation.findOrCreate({
    where: {
      eventSlug: event.slug,
      collectionSlug: collection.slug,
    },
    defaults: {
      eventSlug: event.slug,
      collectionSlug: collection.slug,
      isApproved: isManager,
      submitterAddress: userAddress,
    },
  })

  // If this is a new submission (created) and the user is not a manager
  if (created && !isManager) {
    try {
      // Send email to submitter
      const submitterResult = await getPrivyUserByAddress(userAddress)
      if (submitterResult.success && submitterResult.user?.email?.address) {
        await sendEmail({
          template: 'eventSubmittedToCollectionSubmitter',
          recipient: submitterResult.user.email.address,
          params: {
            eventName: event.name,
            eventDate: event.data.startDate,
            eventUrl: `${config.unlockApp}/event/${event.slug}`,
            collectionName: collection.title,
          },
        })
      }

      // Send email to all managers
      for (const managerAddress of collection.managerAddresses) {
        const managerResult = await getPrivyUserByAddress(managerAddress)
        if (managerResult.success && managerResult.user?.email?.address) {
          await sendEmail({
            template: 'eventSubmittedToCollectionManager',
            recipient: managerResult.user.email.address,
            params: {
              eventName: event.name,
              eventDate: event.data.startDate,
              eventUrl: `${config.unlockApp}/event/${event.slug}`,
              collectionName: collection.title,
              collectionUrl: `${config.unlockApp}/events/${collection.slug}`,
            },
          })
        }
      }
    } catch (error) {
      logger.error('Failed to send notification emails:', error)
    }
  }

  if (!created && !association.isApproved && isManager) {
    await association.update({ isApproved: true })
  }

  return {
    association,
    status: association.isApproved
      ? 'approved and added'
      : 'submitted for approval',
  }
}

/**
 * Approves a single event in a collection.
 *
 * @param collectionSlug - The slug of the event collection.
 * @param eventSlug - The slug of the event to approve.
 * @param userAddress - The address of the user performing the operation.
 * @returns The updated association object.
 */
export const approveEventOperation = async (
  collectionSlug: string,
  eventSlug: string,
  userAddress: string
): Promise<EventCollectionAssociation> => {
  const collection = await EventCollection.findByPk(collectionSlug)
  if (!collection) {
    throw new Error('Collection not found')
  }

  if (!collection.managerAddresses.includes(userAddress)) {
    throw new Error('Not authorized to approve events')
  }

  const association = await EventCollectionAssociation.findOne({
    where: {
      eventSlug,
      collectionSlug,
    },
  })

  if (!association) {
    throw new Error('Event not found in collection')
  }

  // Update the approval status
  await association.update({ isApproved: true })

  try {
    // Get the event details for the email
    const event = await EventData.findOne({
      where: { slug: eventSlug },
    })

    if (event && association.submitterAddress) {
      const submitterResult = await getPrivyUserByAddress(
        association.submitterAddress
      )

      if (submitterResult.success && submitterResult.user?.email?.address) {
        await sendEmail({
          template: 'eventApprovedInCollection',
          recipient: submitterResult.user.email.address,
          params: {
            eventName: event.name,
            eventDate: event.data.startDate,
            eventUrl: `${config.unlockApp}/event/${event.slug}`,
            collectionName: collection.title,
            collectionUrl: `${config.unlockApp}/events/${collection.slug}`,
          },
        })
      }
    }
  } catch (error) {
    logger.error('Failed to send approval notification email:', error)
  }

  return association
}

/**
 * Removes an event from a collection. If the event was submitted but not yet approved,
 * sends a notification email to the submitter informing them that their event was denied.
 *
 * @param collectionSlug - The slug of the event collection.
 * @param eventSlug - The slug of the event to remove.
 * @param userAddress - The address of the user performing the operation.
 * @returns The updated event collection with its associated events.
 * @throws Error if collection not found, user not authorized, or event not in collection
 */
export const removeEventFromCollectionOperation = async (
  collectionSlug: string,
  eventSlug: string,
  userAddress: string
): Promise<EventCollection> => {
  const collection = await EventCollection.findByPk(collectionSlug)
  if (!collection) {
    throw new Error('Collection not found')
  }

  if (!collection.managerAddresses.includes(userAddress)) {
    throw new Error('Not authorized to remove events from this collection')
  }

  const association = await EventCollectionAssociation.findOne({
    where: { collectionSlug, eventSlug },
  })

  if (!association) {
    throw new Error('Event is not part of the collection')
  }

  // Check if this is a rejection of a submitted event
  if (!association.isApproved && association.submitterAddress) {
    try {
      // Get the event details for the email
      const event = await EventData.findOne({
        where: { slug: eventSlug },
      })

      if (event) {
        const submitterResult = await getPrivyUserByAddress(
          association.submitterAddress
        )

        if (submitterResult.success && submitterResult.user?.email?.address) {
          await sendEmail({
            template: 'eventDeniedInCollection',
            recipient: submitterResult.user.email.address,
            params: {
              eventName: event.name,
              eventDate: event.data.startDate,
              eventUrl: `${config.unlockApp}/event/${event.slug}`,
              collectionName: collection.title,
              collectionUrl: `${config.unlockApp}/events/${collection.slug}`,
            },
          })
        }
      }
    } catch (error) {
      logger.error('Failed to send rejection notification email:', error)
    }
  }

  await association.destroy()

  // fetch and return the updated collection
  return (await EventCollection.findByPk(collectionSlug, {
    include: [{ model: EventData, as: 'events' }],
  })) as EventCollection
}

/**
 * Bulk approves multiple events in a collection.
 *
 * @param collectionSlug - The slug of the event collection.
 * @param eventSlugs - An array of event slugs to approve.
 * @param userAddress - The address of the user performing the operation.
 * @returns An array of updated association objects.
 */
export const bulkApproveEventsOperation = async (
  collectionSlug: string,
  eventSlugs: string[],
  userAddress: string
): Promise<EventCollectionAssociation[]> => {
  const collection = await EventCollection.findByPk(collectionSlug)
  if (!collection) {
    throw new Error('Collection not found')
  }

  if (!collection.managerAddresses.includes(userAddress)) {
    throw new Error('Not authorized to approve events in this collection')
  }

  const associations = await EventCollectionAssociation.findAll({
    where: {
      collectionSlug,
      eventSlug: eventSlugs,
      isApproved: false,
    },
  })

  if (associations.length === 0) {
    throw new Error('No events to approve')
  }

  for (const association of associations) {
    association.isApproved = true
    await association.save()
  }

  return associations
}

/**
 * Bulk removes multiple events from a collection.
 *
 * @param collectionSlug - The slug of the event collection.
 * @param eventSlugs - An array of event slugs to remove.
 * @param userAddress - The address of the user performing the operation.
 * @returns The updated event collection.
 */
export const bulkRemoveEventsOperation = async (
  collectionSlug: string,
  eventSlugs: string[],
  userAddress: string
): Promise<EventCollection> => {
  const collection = await EventCollection.findByPk(collectionSlug)
  if (!collection) {
    throw new Error('Collection not found')
  }

  if (!collection.managerAddresses.includes(userAddress)) {
    throw new Error('Not authorized to remove events from this collection')
  }

  const associations = await EventCollectionAssociation.findAll({
    where: {
      collectionSlug,
      eventSlug: eventSlugs,
    },
  })

  if (associations.length === 0) {
    throw new Error('No events to remove')
  }

  for (const association of associations) {
    // Check if this is a rejection of a submitted event
    if (!association.isApproved && association.submitterAddress) {
      try {
        // Get the event details for the email
        const event = await EventData.findOne({
          where: { slug: association.eventSlug },
        })

        if (event) {
          const submitterResult = await getPrivyUserByAddress(
            association.submitterAddress
          )

          if (submitterResult.success && submitterResult.user?.email?.address) {
            await sendEmail({
              template: 'eventDeniedInCollection',
              recipient: submitterResult.user.email.address,
              params: {
                eventName: event.name,
                eventDate: event.data.startDate,
                eventUrl: `${config.unlockApp}/event/${event.slug}`,
                collectionName: collection.title,
                collectionUrl: `${config.unlockApp}/events/${collection.slug}`,
              },
            })
          }
        }
      } catch (error) {
        logger.error('Failed to send rejection notification email:', error)
      }
    }
    await association.destroy()
  }

  // fetch and return the updated collection
  return (await EventCollection.findByPk(collectionSlug, {
    include: [{ model: EventData, as: 'events' }],
  })) as EventCollection
}
