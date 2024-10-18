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
  // We should cerate the corresponding Unlock Event (why not?)
  // We should deploy the lock!
  const { title, id } = await CreateEventBody.parseAsync(request.body)
  console.log({ title, id })
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

  console.log('_______')
  console.log(provider)
  console.log('_______')
  console.log(wallet)
  console.log('_______')
  const walletService = new WalletService(networks)
  await walletService.connect(provider, wallet)
  const lockAddress = await walletService.createLock(lockParams)
  console.log(lockAddress)

  //   if (lockAddress) {
  //     await locksmith.updateLockMetadata(formData.network, lockAddress, {
  //       metadata: {
  //         name: `Ticket for ${formData.lock.name}`,
  //         image: formData.metadata.image,
  //       },
  //     })
  //     const { data: event } = await locksmith.saveEventData({
  //       data: {
  //         ...formDataToMetadata({
  //           name: formData.lock.name,
  //           ...formData.metadata,
  //         }),
  //         ...formData.metadata,
  //       },
  //       checkoutConfig: {
  //         name: `Checkout config for ${formData.lock.name}`,
  //         config: defaultEventCheckoutConfigForLockOnNetwork(
  //           lockAddress,
  //           formData.network
  //         ),
  //       },
  //     })
  //     // Save slug for URL if present
  //     setSlug(event.slug)

  //     // Finally
  //     setLockAddress(lockAddress)
  //   }
  // }
  return response.status(201).json({ message: 'Event created!' })
}

export const rsvpForEvent: RequestHandler = (request, response) => {
  // Given the event let's get the lock address from eventCaster
  // And mint!
  return response.json({ message: 'Event RSVP!' })
}
