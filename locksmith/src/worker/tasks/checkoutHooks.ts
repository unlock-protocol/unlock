import { Task } from 'graphile-worker'
import { Payload } from '../../models/payload'
import logger from '../../logger'
import axios from 'axios'
import { getCheckoutConfigById } from '../../operations/checkoutConfigOperations'

export const checkoutHookJob: Task = async (payload: any) => {
  const { id } = payload
  const { checkoutId, event, data } = payload.payload

  const job = await Payload.findByPk(id)

  if (!job) {
    logger.warn(`No job found with id ${id}`)
    return
  }

  const checkout: any = await getCheckoutConfigById(checkoutId)
  const url = checkout?.config?.hooks && checkout.config.hooks[event]

  if (url) {
    try {
      await axios.post(url, data)

      job.payload = {
        ...job.payload,
        status: 'processed',
      }
      await job.save()
    } catch (error) {
      throw new Error('\nCould not send data to webhook')
    }
  } else {
    throw new Error('\nurl not found')
  }

  logger.info(`checkoutHookJob processed job with id ${id}`)
}
