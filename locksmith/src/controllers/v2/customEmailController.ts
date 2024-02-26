import { Request, RequestHandler, Response } from 'express'
import * as z from 'zod'
import Normalizer from '../../utils/normalizer'
import logger from '../../logger'
import { CustomEmailContent } from '../../models/customEmailContent'
import * as emailOperations from '../../operations/emailOperations'
import { addJob } from '../../worker/worker'

const CustomEmail = z.object({
  content: z
    .string({
      description: 'Custom content of the email',
    })
    .optional()
    .default(''),
})

export class CustomEmailController {
  async saveCustomContent(request: Request, response: Response) {
    try {
      const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
      const network = Number(request.params.network)
      const template = request.params.template?.toUpperCase()

      const { content } = await CustomEmail.parseAsync(request.body)

      const [customEmail] = await CustomEmailContent.upsert(
        {
          lockAddress,
          network,
          content,
          template,
        },
        {
          returning: true,
          conflictFields: ['lockAddress', 'network', 'template'],
        }
      )
      return response.status(200).send(customEmail)
    } catch (err: any) {
      logger.error(err.message)
      return response.status(500).send({
        message: 'Could not save custom email content.',
      })
    }
  }

  async getCustomContent(request: Request, response: Response) {
    try {
      const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
      const network = Number(request.params.network)
      const template = request.params.template?.toUpperCase()

      const customEmail = await emailOperations.getCustomTemplateContent({
        lockAddress,
        network,
        template,
      })

      if (customEmail) {
        return response.status(200).send(customEmail)
      }
      return response.status(404).json({
        message: 'Custom email content not found for this template.',
      })
    } catch (err: any) {
      logger.error(err.message)
      return response.status(500).send({
        message: 'Could not get custom email content.',
      })
    }
  }
}

const SendCustomEmailBody = z.object({
  content: z.string(),
  subject: z.string(),
})

export const sendCustomEmail: RequestHandler = async (request, response) => {
  const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
  const network = Number(request.params.network)

  const parsed = await SendCustomEmailBody.parseAsync(request.body)

  if (!(lockAddress && network)) {
    return response.status(400).send({
      message: 'Invalid lock address or network',
    })
  }

  await addJob(
    'sendToAllJob',
    {
      lockAddress,
      network,
      ...parsed,
    },
    {
      maxAttempts: 3,
    }
  )

  return response.status(200).send({
    success: true,
  })
}
