import { EventCollection } from '../models/EventCollection'
import { EventData } from '../models/Event'
import { EventCollectionAssociation } from '../models/EventCollectionAssociation'

/**
 * Adds an event to a specified event collection.
 * This operation checks for the existence of both the collection and the event
 * before creating an association between them. If the user is a manager,
 * they can approve the association if it was previously unapproved.
 *
 * @param collectionSlug - The unique identifier (slug) of the event collection
 * @param eventSlug - The unique identifier (slug) of the event
 * @param isManager - A boolean flag indicating whether the user has manager
 *                    privileges, which allows them to approve the association.
 * @returns A promise that resolves to the event collection association object,
 *          which includes details about the event and its approval status.
 * @throws An error if the specified collection or event cannot be found.
 */
export const addEventToCollectionOperation = async (
  collectionSlug: string,
  eventSlug: string,
  isManager: boolean
) => {
  // Fetch the event collection by its slug
  const collection = await EventCollection.findByPk(collectionSlug)
  if (!collection) {
    throw new Error('Collection not found') // Ensure collection exists before proceeding
  }

  // Fetch the event by its slug
  const event = await EventData.findOne({ where: { slug: eventSlug } })
  if (!event) {
    throw new Error('Event not found') // Ensure event exists before proceeding
  }

  // Attempt to find or create an association between the event and the collection
  const [association, created] = await EventCollectionAssociation.findOrCreate({
    where: {
      eventSlug: event.slug,
      collectionSlug: collection.slug,
    },
    defaults: {
      eventSlug: event.slug,
      collectionSlug: collection.slug,
      isApproved: isManager, // Set initial approval status based on manager privileges
    },
  })

  // If the association already exists and is not approved, and the user is a manager, approve it
  if (!created && !association.isApproved && isManager) {
    await association.update({ isApproved: true }) // Update approval status
  }

  return association
}

/**
 * Retrieves events associated with a specific event collection.
 * This operation supports pagination and can optionally include unapproved
 * events based on the provided flag. It returns a structured response
 * containing the events and pagination details.
 *
 * @param collectionSlug - The unique identifier (slug) of the event collection
 * @param page - The current page number for pagination (default is 1).
 * @param pageSize - The number of events to return per page (default is 10).
 * @param includeUnapproved - A boolean flag indicating whether to include
 *                            unapproved events in the response (default is false).
 * @returns A promise that resolves to an object containing the events,
 *          total count, current page, and total pages for pagination.
 */
export const getEventsInCollectionOperation = async (
  collectionSlug: string,
  page = 1,
  pageSize = 10,
  includeUnapproved = false
) => {
  // Calculate the offset for pagination
  const offset = (page - 1) * pageSize

  // Fetch events associated with the specified collection, applying pagination and approval filters
  const { count, rows } = await EventData.findAndCountAll({
    include: [
      {
        model: EventCollection,
        as: 'collections',
        where: { slug: collectionSlug },
        through: {
          attributes: [],
          // If includeUnapproved is true, return all events, otherwise return only approved events
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
  }
}
