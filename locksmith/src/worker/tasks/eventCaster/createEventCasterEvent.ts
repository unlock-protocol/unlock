import { Task } from 'graphile-worker'
import {
  deployLockForEventCaster,
  saveContractOnEventCasterEvent,
} from '../../../operations/eventCasterOperations'
import { z } from 'zod'

export const CreateEventCasterEventPayload = z.object({
  title: z.string(),
  hosts: z.array(
    z.object({
      verified_addresses: z.object({
        eth_addresses: z.array(z.string()),
      }),
    })
  ),
  eventId: z.string(),
  imageUrl: z.string(),
  description: z.string().nullish(),
})

export const createEventCasterEvent: Task = async (payload) => {
  const { title, hosts, eventId, imageUrl, description } =
    await CreateEventCasterEventPayload.parse(payload)
  const { address, network } = await deployLockForEventCaster({
    title,
    hosts,
    eventId,
    imageUrl,
    description,
  })
  await saveContractOnEventCasterEvent({
    eventId,
    network,
    address,
  })
}
