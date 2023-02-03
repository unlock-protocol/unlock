import { Request, Response } from 'express'
import * as z from 'zod'
import Normalizer from '../../utils/normalizer'
import logger from '../../logger'
import { CustomEmailContent } from '../../models/customEmailContent'

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
          conflictFields: ['lockAddress'],
        }
      )
      return response.status(200).send(customEmail?.content)
    } catch (err: any) {
      console.log(err)
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

      const customEmail = await CustomEmailContent.findOne({
        where: {
          lockAddress,
          network,
          template,
        },
      })

      if (customEmail) {
        return response.status(200).send(customEmail?.content)
      }
      return response.status(404).json({
        message: 'Custom email content not found for this template.',
      })
    } catch (err: any) {
      logger.error(err.message)
      return response.status(500).send({
        message: 'Could get custom email content.',
      })
    }
  }
}
