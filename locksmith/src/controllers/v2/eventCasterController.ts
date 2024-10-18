import networks from '@unlock-protocol/networks'
import { WalletService } from '@unlock-protocol/unlock-js'
import { RequestHandler } from 'express'
import { z } from 'zod'
import {
  getProviderForNetwork,
  getPurchaser,
} from '../../fulfillment/dispatcher'
import { isProduction } from '../../config/config'

const DEFAULT_NETWORK = isProduction ? 8453 : 84532 // Base or Base Sepolia

// This is the API endpoint used by EventCaster to create events
const CreateEventBody = z.object({
  id: z.string(),
  title: z.string(),
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
  const { title } = await CreateEventBody.parseAsync(request.body)
  const lockParams = {
    name: title,
    expirationDuration: -1, // Never expire
    maxNumberOfKeys: 0, // none for sale (only granted!)
    keyPrice: 0, // free
  }
  const [provider, wallet] = await Promise.all([
    getProviderForNetwork(DEFAULT_NETWORK),
    getPurchaser({ network: DEFAULT_NETWORK }),
  ])

  const walletService = new WalletService(networks)
  await walletService.connect(provider, wallet)
  const lockAddress = await walletService.createLock(lockParams)

  // TODO: add managers
  // TODO: set transfers?
  // TODO: set metadata for event

  return response
    .status(201)
    .json({ address: lockAddress, network: DEFAULT_NETWORK })
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
    return response.status(422).json({ message: 'Could not retrieve event' })
  }

  if (!event.contract) {
    return response
      .status(422)
      .json({ message: 'This event does not have a contract attached.' })
  }

  const [provider, wallet] = await Promise.all([
    getProviderForNetwork(event.contract.network),
    getPurchaser({ network: event.contract.network }),
  ])

  // Get the recipient
  if (!user.verified_addresses.eth_addresses[0]) {
    return response
      .status(422)
      .json({ message: 'User does not have a verified address.' })
  }

  const walletService = new WalletService(networks)
  await walletService.connect(provider, wallet)

  const token = await walletService.grantKey({
    lockAddress: event.contract.address,
    recipient: user.verified_addresses.eth_addresses[0],
  })

  return response.status(201).json({
    network: event.contract.network,
    address: event.contract.address,
    ...token,
  })
}
