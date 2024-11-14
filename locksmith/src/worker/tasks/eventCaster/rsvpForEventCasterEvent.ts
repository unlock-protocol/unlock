import { Task } from 'graphile-worker'
import {
  mintNFTForRsvp,
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
  farcasterId: z.number(),
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
}
