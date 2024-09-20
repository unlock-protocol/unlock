import { EventCollection } from '../models/EventCollection'
import { EventData } from '../models/Event'
import { EventCollectionAssociation } from '../models/EventCollectionAssociation'
import { z } from 'zod'
import { kebabCase } from 'lodash'

// event collection body schema
const EventCollectionBody = z.object({
  title: z.string(),
  description: z.string(),
  banner: z.string().optional(),
  links: z
    .array(
      z.object({
        name: z.string(),
        url: z.string(),
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

  const linksObject = parsedBody.links?.reduce(
    (acc, link) => {
      acc[link.name] = link.url
      return acc
    },
    {} as Record<string, string>
  )

  const eventCollection = await EventCollection.create({
    ...parsedBody,
    links: linksObject,
    slug,
    managerAddresses,
  })

  eventCollection.events = []
  return eventCollection
}

/**
 * Retrieves an event collection by its slug.
 * It fetches the event collection from the database
 * and includes associated events in the response.
 *
 * @param slug - The unique identifier (slug) of the event collection.
 * @returns A promise that resolves to the event collection object.
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

  const event = await EventData.findOne({ where: { slug: eventSlug } })
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
    },
  })

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
 * Retrieves events associated with a specific event collection.
 * It supports pagination and can optionally include unapproved
 * events based on the provided flag.
 *
 * @param collectionSlug - The unique identifier (slug) of the event collection
 * @param page - The current page number for pagination (default is 1).
 * @param pageSize - The number of events to return per page (default is 10).
 * @param userAddress - The wallet address of the user requesting the events.
 * @returns A promise that resolves to an object containing the events,
 *          total count, current page, and total pages for pagination.
 * @throws An error if the specified collection cannot be found.
 */
export const getEventsInCollectionOperation = async (
  collectionSlug: string,
  page = 1,
  pageSize = 10,
  userAddress?: string
) => {
  const collection = await EventCollection.findByPk(collectionSlug)
  if (!collection) {
    throw new Error('Collection not found')
  }

  const isManager = collection.managerAddresses.includes(userAddress || '')
  const includeUnapproved = isManager

  const offset = (page - 1) * pageSize

  const { count, rows } = await EventData.findAndCountAll({
    include: [
      {
        model: EventCollection,
        as: 'collections',
        where: { slug: collectionSlug },
        through: {
          attributes: [],
          where: includeUnapproved ? {} : { isApproved: true },
        },
      },
    ],
    limit: pageSize,
    offset,
    order: [['createdAt', 'DESC']],
    distinct: true,
  })

  return {
    events: rows,
    totalCount: count,
    currentPage: page,
    totalPages: Math.ceil(count / pageSize),
    isManager,
  }
}
