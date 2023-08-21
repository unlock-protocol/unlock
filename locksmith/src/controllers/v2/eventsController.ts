import { RequestHandler } from 'express'
import { getEventDetail } from '../../operations/eventOperations'
import normalizer from '../../utils/normalizer'
import { Event } from '../../models'
import { z } from 'zod'
export const getEventDetails: RequestHandler = async (request, response) => {
  const network = Number(request.params.network)
  const lockAddress = normalizer.ethereumAddress(request.params.lockAddress)

  const eventDetails = await getEventDetail(lockAddress, network)
  return response.status(200).send(eventDetails)
}

const EventBody = z.object({
  id: z.number().optional(),
  name: z.string(),
  data: z.any(),
  locks: z.array(z.any()),
})

export const saveEventDetails: RequestHandler = async (request, response) => {
  const parsed = await EventBody.parseAsync(request.body)
  const [event, created] = await Event.upsert(
    {
      id: parsed.id,
      name: parsed.name,
      data: parsed.data,
      locks: parsed.locks,
      createdBy: request.user!.walletAddress,
    },
    {
      conflictFields: ['id'],
    }
  )
  const statusCode = created ? 201 : 200
  return response.status(statusCode).send(event.toJSON())
}
