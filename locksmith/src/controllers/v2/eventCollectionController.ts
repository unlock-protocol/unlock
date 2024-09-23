import { RequestHandler, Request, Response } from 'express'
import { z } from 'zod'
import '../../models/associations'
import {
  addEventToCollectionOperation,
  createEventCollectionOperation,
  getEventCollectionOperation,
  removeEventFromCollectionOperation,
  updateEventCollectionOperation,
} from '../../operations/eventCollectionOperations'

// schema for the event collection body
export const EventCollectionBody = z.object({
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
export const createEventCollection: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const parsedBody = await EventCollectionBody.parseAsync(req.body)
  try {
    const eventCollection = await createEventCollectionOperation(
      parsedBody,
      req.user!.walletAddress
    )
    return res.status(201).json(eventCollection)
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message })
  }
}

/**
 * Retrieves an event collection by its slug, including all associated events.
 * @param req - The request object containing the slug parameter.
 * @param res - The response object used to send the response.
 */
export const getEventCollection: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { slug } = req.params

  try {
    const eventCollection = await getEventCollectionOperation(slug)
    return res.json(eventCollection)
  } catch (error) {
    if (error.message === 'Event collection not found') {
      return res.status(404).json({ error: error.message })
    }
    return res.status(400).json({ error: (error as Error).message })
  }
}

/**
 * Updates an existing event collection.
 * @param req - The request object containing the slug parameter and updated data.
 * @param res - The response object used to send the response.
 */
export const updateEventCollection: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { slug } = req.params
  const parsedBody = await EventCollectionBody.parseAsync(req.body)
  try {
    const eventCollection = await updateEventCollectionOperation(
      slug,
      parsedBody,
      req.user!.walletAddress
    )
    return res.json(eventCollection)
  } catch (error) {
    if (error.message === 'Event collection not found') {
      return res.status(404).json({ error: error.message })
    }
    if (error.message === 'Not authorized to update this collection') {
      return res.status(403).json({ error: error.message })
    }
    return res.status(400).json({ error: error.message })
  }
}

/**
 * Adds an event to a specified event collection.
 * @param req - The request object containing the event slug and collection slug.
 * @param res - The response object used to send the response.
 */
export const addEventToCollection: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { slug: collectionSlug } = req.params
  const parsedBody = await AddEventToCollectionBody.safeParseAsync(req.body)
  if (!parsedBody.success) {
    return res.status(400).json({
      error: 'Invalid request body',
      details: parsedBody.error.errors,
    })
  }
  const { eventSlug } = parsedBody.data

  try {
    const result = await addEventToCollectionOperation(
      collectionSlug,
      eventSlug,
      req.user?.walletAddress || ''
    )
    return res.status(200).json({
      message: `Event ${result.status}`,
      association: result.association,
    })
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message })
  }
}

/**
 * Removes a single event from a collection.
 * @param req - The request object containing collection and event slugs.
 * @param res - The response object used to send the response.
 */
export const removeEventFromCollection: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { slug: collectionSlug } = req.params
  const { eventSlug } = req.body

  if (!eventSlug) {
    return res.status(400).json({ error: 'eventSlug is required' })
  }

  try {
    const updatedCollection = await removeEventFromCollectionOperation(
      collectionSlug,
      eventSlug,
      req.user!.walletAddress
    )
    return res.status(200).json(updatedCollection)
  } catch (error) {
    const errorMessage = (error as Error).message
    let statusCode = 400
    if (errorMessage.includes('not authorized')) {
      statusCode = 403
    } else if (errorMessage.includes('not found')) {
      statusCode = 404
    }
    return res.status(statusCode).json({ error: errorMessage })
  }
}
