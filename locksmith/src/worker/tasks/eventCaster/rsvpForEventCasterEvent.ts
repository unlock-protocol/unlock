import { Task } from 'graphile-worker'
import {
  deployLockForEventCaster,
  mintNFTForRsvp,
  saveContractOnEventCasterEvent,
  saveTokenOnEventCasterRSVP,
} from '../../../operations/eventCasterOperations'
import { z } from 'zod'

export const RsvpForEventCasterEventPayload = z.object({
  ownerAddress: z.string(),
  eventId: z.string(),
  contract: z.object({
    network: z.number(),
    address: z.string(),
  }),
  farcasterId: z.string(),
})

export const rsvpForEventCasterEvent: Task = async (payload) => {
  const { ownerAddress, eventId, contract, farcasterId } =
    await RsvpForEventCasterEventPayload.parse(payload)
  const token = await mintNFTForRsvp({
    ownerAddress,
    contract: contract,
  })
  await saveTokenOnEventCasterRSVP({
    eventId,
    tokenId: token.id,
    farcasterId,
  })
  // response.status(200).json({
  //   network: contract.network,
  //   address: contract.address,
  //   ...token,
  // })

  await saveContractOnEventCasterEvent({
    eventId,
    network,
    address,
  })
}
