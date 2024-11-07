import { RequestHandler } from 'express'
import { z } from 'zod'
import {
  deployLockForEventCaster,
  getEventFormEventCaster,
  mintNFTForRsvp,
} from '../../operations/eventCasterOperations'

// This is the API endpoint used by EventCaster to create events
const CreateEventBody = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
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
  }),
})

export const createEvent: RequestHandler = async (request, response) => {
  const {
    title,
    id: eventId,
    hosts,
    description,
    image_url,
  } = await CreateEventBody.parseAsync(request.body)
  const { address, network } = await deployLockForEventCaster({
    title,
    hosts,
    eventId,
    imageUrl: image_url,
    description,
  })
  response.status(201).json({ address, network })
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

  const token = await mintNFTForRsvp({
    ownerAddress,
    contract: event.contract,
  })

  response.status(200).json({
    network: event.contract.network,
    address: event.contract.address,
    ...token,
  })
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
