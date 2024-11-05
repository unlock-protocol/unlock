import { RequestHandler, Request, Response } from 'express'
import { z } from 'zod'
import '../../models/associations'
import {
  addEventToCollectionOperation,
  addManagerAddressOperation,
  approveEventOperation,
  bulkApproveEventsOperation,
  bulkRemoveEventsOperation,
  createEventCollectionOperation,
  getEventCollectionOperation,
  getUnapprovedEventsForCollectionOperation,
  removeEventFromCollectionOperation,
  removeManagerAddressOperation,
  updateEventCollectionOperation,
} from '../../operations/eventCollectionOperations'

// schema for the event collection body
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

// schema for adding an event to a collection
const AddEventToCollectionBody = z.object({
  eventSlug: z.string(),
})

// schema for adding a manager
const AddManagerBody = z.object({
  newManagerAddress: z.string().min(1, 'Manager address is required'),
})

// schema for removing a manager
const RemoveManagerBody = z.object({
  managerAddressToRemove: z
    .string()
    .min(1, 'Manager address to remove is required'),
})

// Schema for approving events
const ApproveEventsBody = z.object({
  eventSlugs: z.array(z.string()).min(1, 'At least one event slug is required'),
})

// Schema for removing events
const RemoveEventsBody = z.object({
  eventSlugs: z.array(z.string()).min(1, 'At least one event slug is required'),
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
    res.status(201).json(eventCollection)
    return
  } catch (error) {
    res.status(400).json({ error: (error as Error).message })
    return
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
    res.json(eventCollection)
    return
  } catch (error) {
    if (error.message === 'Event collection not found') {
      res.status(404).json({ error: error.message })
      return
    }
    res.status(400).json({ error: (error as Error).message })
    return
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
    res.json(eventCollection)
    return
  } catch (error) {
    if (error.message === 'Event collection not found') {
      res.status(404).json({ error: error.message })
      return
    }
    if (error.message === 'Not authorized to update this collection') {
      res.status(403).json({ error: error.message })
      return
    }
    res.status(400).json({ error: error.message })
    return
  }
}

/**
 * Adds a new manager to an event collection.
 * @param req - The request object containing the collection slug and new manager address.
 * @param res - The response object used to send the response.
 */
export const addManagerAddress: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { slug } = req.params
  const parsedBody = await AddManagerBody.safeParseAsync(req.body)

  if (!parsedBody.success) {
    res.status(400).json({
      error: 'Invalid request body',
      details: parsedBody.error.errors,
    })
    return
  }

  const { newManagerAddress } = parsedBody.data

  try {
    const updatedCollection = await addManagerAddressOperation(
      slug,
      newManagerAddress,
      req.user!.walletAddress
    )
    res.status(200).json(updatedCollection)
    return
  } catch (error) {
    const errorMessage = (error as Error).message
    let statusCode = 400
    if (errorMessage.includes('not authorized')) {
      statusCode = 403
    } else if (errorMessage.includes('not found')) {
      statusCode = 404
    }
    res.status(statusCode).json({ error: errorMessage })
    return
  }
}

/**
 * Removes a manager from an event collection.
 * @param req - The request object containing the collection slug and manager address to remove.
 * @param res - The response object used to send the response.
 */
export const removeManagerAddress: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { slug } = req.params
  const parsedBody = await RemoveManagerBody.safeParseAsync(req.body)

  if (!parsedBody.success) {
    res.status(400).json({
      error: 'Invalid request body',
      details: parsedBody.error.errors,
    })
    return
  }

  const { managerAddressToRemove } = parsedBody.data

  try {
    const updatedCollection = await removeManagerAddressOperation(
      slug,
      managerAddressToRemove,
      req.user!.walletAddress
    )
    res.status(200).json(updatedCollection)
    return
  } catch (error) {
    const errorMessage = (error as Error).message
    let statusCode = 400
    if (errorMessage.includes('not authorized')) {
      statusCode = 403
    } else if (errorMessage.includes('not found')) {
      statusCode = 404
    }
    res.status(statusCode).json({ error: errorMessage })
    return
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
    res.status(400).json({
      error: 'Invalid request body',
      details: parsedBody.error.errors,
    })
    return
  }
  const { eventSlug } = parsedBody.data

  try {
    const result = await addEventToCollectionOperation(
      collectionSlug,
      eventSlug,
      req.user?.walletAddress || ''
    )
    res.status(200).json({
      message: `Event ${result.status}`,
      association: result.association,
    })
    return
  } catch (error) {
    res.status(400).json({ error: (error as Error).message })
    return
  }
}

/**
 * Retrieves unapproved events for a specific event collection.
 *
 * @param req - The request object containing the collection slug.
 * @param res - The response object used to send the response.
 */
export const getUnapprovedEventsForCollection: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { slug } = req.params
  try {
    const unapprovedEvents =
      await getUnapprovedEventsForCollectionOperation(slug)
    res.status(200).json(unapprovedEvents)
    return
  } catch (error) {
    res.status(400).json({ error: (error as Error).message })
    return
  }
}

/**
 * Approves a single event in a collection.
 * @param req - The request object containing collection and event slugs.
 * @param res - The response object used to send the response.
 */
export const approveEvent: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { slug: collectionSlug } = req.params
  const { eventSlug } = req.body

  if (!eventSlug) {
    res.status(400).json({ error: 'eventSlug is required' })
    return
  }

  try {
    const association = await approveEventOperation(
      collectionSlug,
      eventSlug,
      req.user!.walletAddress
    )
    res.status(200).json(association)
    return
  } catch (error) {
    const errorMessage = (error as Error).message
    let statusCode = 400
    if (errorMessage.includes('not authorized')) {
      statusCode = 403
    } else if (errorMessage.includes('not found')) {
      statusCode = 404
    }
    res.status(statusCode).json({ error: errorMessage })
    return
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
    res.status(400).json({ error: 'eventSlug is required' })
    return
  }

  try {
    const updatedCollection = await removeEventFromCollectionOperation(
      collectionSlug,
      eventSlug,
      req.user!.walletAddress
    )
    res.status(200).json(updatedCollection)
    return
  } catch (error) {
    const errorMessage = (error as Error).message
    let statusCode = 400
    if (errorMessage.includes('not authorized')) {
      statusCode = 403
    } else if (errorMessage.includes('not found')) {
      statusCode = 404
    }
    res.status(statusCode).json({ error: errorMessage })
    return
  }
}

/**
 * Bulk approves multiple events in a collection.
 * @param req - The request object containing collection slug and event slugs.
 * @param res - The response object used to send the response.
 */
export const bulkApproveEvents: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { slug: collectionSlug } = req.params
  const parsedBody = ApproveEventsBody.safeParse(req.body)

  if (!parsedBody.success) {
    res.status(400).json({
      error: 'Invalid request body',
      details: parsedBody.error.errors,
    })
    return
  }

  const { eventSlugs } = parsedBody.data

  try {
    const associations = await bulkApproveEventsOperation(
      collectionSlug,
      eventSlugs,
      req.user!.walletAddress
    )
    res.status(200).json(associations)
    return
  } catch (error) {
    const errorMessage = (error as Error).message
    let statusCode = 400
    if (errorMessage.includes('not authorized')) {
      statusCode = 403
    } else if (errorMessage.includes('not found')) {
      statusCode = 404
    }
    res.status(statusCode).json({ error: errorMessage })
    return
  }
}

/**
 * Bulk removes multiple events from a collection.
 * @param req - The request object containing collection slug and event slugs.
 * @param res - The response object used to send the response.
 */
export const bulkRemoveEvents: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { slug: collectionSlug } = req.params
  const parsedBody = RemoveEventsBody.safeParse(req.body)

  if (!parsedBody.success) {
    res.status(400).json({
      error: 'Invalid request body',
      details: parsedBody.error.errors,
    })
    return
  }

  const { eventSlugs } = parsedBody.data

  try {
    const updatedCollection = await bulkRemoveEventsOperation(
      collectionSlug,
      eventSlugs,
      req.user!.walletAddress
    )
    res.status(200).json(updatedCollection)
    return
  } catch (error) {
    const errorMessage = (error as Error).message
    let statusCode = 400
    if (errorMessage.includes('not authorized')) {
      statusCode = 403
    } else if (errorMessage.includes('not found')) {
      statusCode = 404
    }
    res.status(statusCode).json({ error: errorMessage })
    return
  }
}
