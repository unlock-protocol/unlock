import { RequestHandler } from 'express'
import { getEventDetail } from '../../operations/eventOperations'
import normalizer from '../../utils/normalizer'

export const getEventDetails: RequestHandler = async (request, response) => {
  const network = Number(request.params.network)
  const lockAddress = normalizer.ethereumAddress(request.params.lockAddress)

  const eventDetails = await getEventDetail(lockAddress, network)
  return response.status(200).send(eventDetails)
}
