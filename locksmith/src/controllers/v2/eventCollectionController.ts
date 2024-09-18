import { RequestHandler } from 'express'
import { z } from 'zod'
import { EventCollection } from '../../models/EventCollection'
import { createSlug } from '../../utils/createSlug'
import '../../models/associations'
import { EventData } from '../../models'
import {
  addEventToCollectionOperation,
  getEventsInCollectionOperation,
} from '../../operations/eventCollectionOperations'

// schema for the event collection body
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

// schema for adding an event to a collection
const AddEventToCollectionBody = z.object({
  eventSlug: z.string(),
})

/**
 * Creates a new event collection.
 * @param req - The request object containing the event collection data.
 * @param res - The response object used to send the response.
 */
export const createEventCollection: RequestHandler = async (req, res) => {
  // Parse and validate the request body against the defined schema
  const parsedBody = await EventCollectionBody.parseAsync(req.body)

  // Generate a unique slug for the event collection based on the title
  const slug = await createSlug(parsedBody.title)

  // Use the provided manager addresses or fallback to the user's wallet address
  const managerAddresses = parsedBody.managerAddresses || [
    req.user!.walletAddress,
  ]

  // Transform the links array into an object for easier access
  const linksObject = parsedBody.links?.reduce(
    (acc, link) => {
      acc[link.name] = link.url
      return acc
    },
    {} as Record<string, string>
  )

  // Create the event collection in the database
  const eventCollection = await EventCollection.create({
    ...parsedBody,
    links: linksObject,
    slug,
    managerAddresses,
  })

  // Initialize the events array to an empty array
  eventCollection.events = []

  // Respond with the created event collection and a 201 status code
  return res.status(201).json(eventCollection)
}

/**
 * Retrieves an event collection by its slug.
 * @param req - The request object containing the slug parameter.
 * @param res - The response object used to send the response.
 */
export const getEventCollection: RequestHandler = async (req, res) => {
  const { slug } = req.params

  // Fetch the event collection from the database, including associated events
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

  // If the event collection is not found, return a 404 error
  if (!eventCollection) {
    return res.status(404).json({ error: 'Event collection not found' })
  }

  // Respond with the found event collection
  return res.json(eventCollection)
}

/**
 * Updates an existing event collection.
 * @param req - The request object containing the slug parameter and updated data.
 * @param res - The response object used to send the response.
 */
export const updateEventCollection: RequestHandler = async (req, res) => {
  const { slug } = req.params
  // Parse and validate the request body against the defined schema
  const parsedBody = await EventCollectionBody.parseAsync(req.body)

  // Fetch the event collection from the database
  const eventCollection = await EventCollection.findByPk(slug)

  // If the event collection is not found, return a 404 error
  if (!eventCollection) {
    return res.status(404).json({ error: 'Event collection not found' })
  }

  // Check if the user is authorized to update the collection
  if (!eventCollection.managerAddresses.includes(req.user!.walletAddress)) {
    return res
      .status(403)
      .json({ error: 'Not authorized to update this collection' })
  }

  // Update the event collection with the new data
  await eventCollection.update(parsedBody)

  // Respond with the updated event collection
  return res.json(eventCollection)
}

/**
 * Adds an event to a specified event collection.
 * @param req - The request object containing the event slug and collection slug.
 * @param res - The response object used to send the response.
 */
export const addEventToCollection: RequestHandler = async (req, res) => {
  const { slug: collectionSlug } = req.params

  // Validate the request body
  const parsedBody = await AddEventToCollectionBody.safeParseAsync(req.body)
  if (!parsedBody.success) {
    return res.status(400).json({
      error: 'Invalid request body',
      details: parsedBody.error.errors,
    })
  }
  const { eventSlug } = parsedBody.data

  // Fetch the event collection by its slug
  const collection = await EventCollection.findByPk(collectionSlug)
  if (!collection) {
    return res.status(404).json({ error: 'Collection not found' })
  }

  // Check if the user is a manager of the collection
  const isManager = collection.managerAddresses.includes(
    req.user?.walletAddress || ''
  )

  try {
    // Attempt to add the event to the collection
    const association = await addEventToCollectionOperation(
      collectionSlug,
      eventSlug,
      isManager
    )
    const status = association.isApproved
      ? 'approved and added'
      : 'submitted for approval'
    return res.status(200).json({ message: `Event ${status}`, association })
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message })
  }
}

/**
 * Retrieves events associated with a specific event collection.
 * @param req - The request object containing the collection slug and pagination parameters.
 * @param res - The response object used to send the response.
 */
export const getEventsInCollection: RequestHandler = async (req, res) => {
  const { slug: collectionSlug } = req.params
  const page = parseInt(req.query.page as string) || 1
  const pageSize = parseInt(req.query.pageSize as string) || 10

  // Fetch the event collection to check its existence
  const collection = await EventCollection.findByPk(collectionSlug)
  if (!collection) {
    return res.status(404).json({ error: 'Collection not found' })
  }

  // Determine if the user is a manager to include unapproved events
  const isManager = collection.managerAddresses.includes(
    req.user?.walletAddress || ''
  )
  const includeUnapproved = isManager

  // Retrieve events in the collection with pagination
  const result = await getEventsInCollectionOperation(
    collectionSlug,
    page,
    pageSize,
    includeUnapproved
  )
  return res.json(result)
}
