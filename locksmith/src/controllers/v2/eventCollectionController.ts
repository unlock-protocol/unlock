import { RequestHandler } from 'express'
import { z } from 'zod'
import { EventCollection } from '../../models/EventCollection'
import { createSlug } from '../../utils/createSlug'
import '../../models/associations'
import { EventData } from '../../models'

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
