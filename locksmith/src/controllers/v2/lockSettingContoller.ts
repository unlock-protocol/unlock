import * as z from 'zod'
import { Request, Response } from 'express'
import Normalizer from '../../utils/normalizer'
import logger from '../../logger'
import * as lockSettingOperations from '../../operations/lockSettingOperations'

const LockSettingSchema = z.object({
  sendEmail: z
    .boolean({
      description: 'When true enable to send emails',
    })
    .default(true),
})

export class LockSettingController {
  async updateSettings(request: Request, response: Response) {
    try {
      const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
      const network = Number(request.params.network)

      const { sendEmail } = await LockSettingSchema.parseAsync(request.body)

      const [settings] = await lockSettingOperations.saveSettings({
        lockAddress,
        network,
        sendEmail,
      })
      return response.status(200).send(settings)
    } catch (err: any) {
      logger.error(err.message)
      return response.status(500).send({
        message: 'Could not save setting, please try again.',
      })
    }
  }

  async getSettings(request: Request, response: Response) {
    try {
      const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
      const network = Number(request.params.network)

      const settings = await lockSettingOperations.getSettings({
        lockAddress,
        network,
      })

      if (settings) {
        return response.status(200).send(settings)
      }

      return response.status(404).json({
        message: 'There is not settings for this Lock.',
      })
    } catch (err: any) {
      logger.error(err.message)
      return response.status(500).send({
        message: 'Could not get settings for this Lock.',
      })
    }
  }
}
