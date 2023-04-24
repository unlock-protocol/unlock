import * as z from 'zod'
import { Request, RequestHandler, Response } from 'express'
import Normalizer from '../../utils/normalizer'
import logger from '../../logger'
import * as lockSettingOperations from '../../operations/lockSettingOperations'

const LockSettingSchema = z.object({
  sendEmail: z
    .boolean({
      description: 'When true enable to send emails',
    })
    .default(true),
  replyTo: z
    .string({
      description:
        'Set the email address that will appear on the Reply-To: field.',
    })
    .optional(),
  creditCardPrice: z
    .number({
      description: 'Credit card default price to use on checkout.',
    })
    .optional(),
})

export type LockSettingProps = z.infer<typeof LockSettingSchema>

export const DEFAULT_LOCK_SETTINGS: LockSettingProps = {
  sendEmail: true,
  replyTo: undefined,
  creditCardPrice: undefined,
}

export const updateSettings: RequestHandler = async (
  request: Request,
  response: Response
) => {
  try {
    const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
    const network = Number(request.params.network)

    const options = await LockSettingSchema.parseAsync(request.body)

    const [settings] = await lockSettingOperations.saveSettings({
      lockAddress,
      network,
      ...options,
    })
    return response.status(200).send(settings)
  } catch (err: any) {
    logger.error(err.message)
    return response.status(500).send({
      message: 'Could not save setting, please try again.',
    })
  }
}

export const getSettings: RequestHandler = async (
  request: Request,
  response: Response
) => {
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

    // return default settings
    return response.status(200).send(DEFAULT_LOCK_SETTINGS)
  } catch (err: any) {
    logger.error(err.message)
    return response.status(500).send({
      message: 'Could not get settings for this Lock.',
    })
  }
}
