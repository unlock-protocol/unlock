import { RequestHandler } from 'express'
import { z } from 'zod'
import { getEventFormEventCaster } from '../../operations/eventCasterOperations'
import { addJob } from '../../worker/worker'

// This is the API endpoint used by EventCaster to create events
const CreateEventBody = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullish(),
  image_url: z.string(),
  hosts: z.array(
    z.object({
      verified_addresses: z.object({
        eth_addresses: z.array(z.string()),
      }),
    })
  ),
})

// This is the API endpoint used by EventCaster to create events
const RsvpBody = z.object({
  user: z.object({
    verified_addresses: z.object({
      eth_addresses: z.array(z.string()),
    }),
    fid: z.number(),
  }),
})

// Asynchronously creates an event on EventCaster
export const createEvent: RequestHandler = async (request, response) => {
  const {
    title,
    id: eventId,
    hosts,
    description,
    image_url,
  } = await CreateEventBody.parseAsync(request.body)
  await addJob('createEventCasterEvent', {
    title,
    hosts,
    eventId,
    imageUrl: image_url,
    description,
  })
  response.sendStatus(204)
  return
}

// This is the API endpoint used by EventCaster to mint RSVP tokens
export const rsvpForEvent: RequestHandler = async (request, response) => {
  const { user } = await RsvpBody.parseAsync(request.body)

  let event
  try {
    event = await getEventFormEventCaster(request.params.eventId)
  } catch (error) {
    response.status(422).json({ message: error.message })
    return
  }

  // Get the recipient
  const ownerAddress = user.verified_addresses.eth_addresses[0]
  if (!ownerAddress) {
    response
      .status(422)
      .json({ message: 'User does not have a verified address.' })
    return
  }

  await addJob('rsvpForEventCasterEvent', {
    farcasterId: user.fid,
    ownerAddress,
    contract: event.contract,
    eventId: request.params.eventId,
  })

  response.sendStatus(204)
  return
}

// Deletes an event. Unsure how to proceed here...
export const deleteEvent: RequestHandler = async (_request, response) => {
  // TODO: implement this
  response.status(200).json({})
  return
}

// Removes the RSVP for an event (burns the ticket!)
export const unrsvpForEvent: RequestHandler = async (_request, response) => {
  // TODO: implement this
  response.status(200).json({})
  return
}
