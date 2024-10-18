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
    .json({ contract: lockAddress, network: DEFAULT_NETWORK })
}

export const rsvpForEvent: RequestHandler = (request, response) => {
  // Given the event let's get the lock address from eventCaster
  // And mint!
  return response.json({ message: 'Event RSVP!' })
}
