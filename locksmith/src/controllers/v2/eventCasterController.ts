import networks from '@unlock-protocol/networks'
import { WalletService, Web3Service } from '@unlock-protocol/unlock-js'
import { RequestHandler } from 'express'
import { z } from 'zod'
import {
  getProviderForNetwork,
  getPurchaser,
} from '../../fulfillment/dispatcher'
import { deployLockForEventCaster } from '../../operations/eventCasterOperations'

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

  // make the request to @event api
  const eventCasterResponse = await fetch(
    `https://events.xyz/api/v1/event?event_id=${request.params.eventId}`
  )
  // parse the response and continue
  const { success, event } = await eventCasterResponse.json()

  if (!success) {
    response.status(422).json({ message: 'Could not retrieve event' })
    return
  }

  if (!(event.contract?.address && event.contract?.network)) {
    response
      .status(422)
      .json({ message: 'This event does not have a contract attached.' })
    return
  }

  // Get the recipient
  if (!user.verified_addresses.eth_addresses[0]) {
    response
      .status(422)
      .json({ message: 'User does not have a verified address.' })
    return
  }

  const [provider, wallet] = await Promise.all([
    getProviderForNetwork(event.contract.network),
    getPurchaser({ network: event.contract.network }),
  ])

  const ownerAddress = user.verified_addresses.eth_addresses[0]
  // Check first if the user has a key
  const web3Service = new Web3Service(networks)
  const existingKey = await web3Service.getKeyByLockForOwner(
    event.contract.address,
    ownerAddress,
    event.contract.network
  )

  if (existingKey.tokenId > 0) {
    response.status(200).json({
      network: event.contract.network,
      address: event.contract.address,
      id: Number(existingKey.tokenId),
      owner: ownerAddress,
    })
    return
  }

  const walletService = new WalletService(networks)
  await walletService.connect(provider, wallet)

  const token = await walletService.grantKey({
    lockAddress: event.contract.address,
    recipient: ownerAddress,
  })

  response.status(201).json({
    network: event.contract.network,
    address: event.contract.address,
    ...token,
  })
  return
}

// Deletes an event. Unsure how to proceed here...
export const deleteEvent: RequestHandler = async (_request, response) => {
  response.status(200).json({})
  return
}

// Removes the RSVP for an event (burns the ticket!)
export const unrsvpForEvent: RequestHandler = async (_request, response) => {
  // TODO: implement this
  response.status(200).json({})
  return
}
