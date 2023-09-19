import * as z from 'zod'
import { Request, RequestHandler, Response } from 'express'
import Normalizer from '../../utils/normalizer'
import logger from '../../logger'
import * as lockSettingOperations from '../../operations/lockSettingOperations'
import networks from '@unlock-protocol/networks'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { Currencies } from '@unlock-protocol/core'

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
    .nullish(),
  creditCardPrice: z
    .number({
      description: 'Credit card default price to use on checkout.',
    })
    .nullish(),
  emailSender: z
    .string({
      description:
        'Custom name used as the email sender. This is the name that most email clients will show to readers.',
    })
    .nullish(),
  slug: z
    .string({
      description: 'Slug that will be used to retrieve the lock',
    })
    .optional(),
  checkoutConfigId: z
    .string({
      description: 'Checkout config URL id.',
    })
    .nullish(),
  unlockFeeChargedToUser: z
    .boolean({
      description:
        'When enabled the Unlock fee will be included to the total cost for the user, otherwise the lock manager will absorb" that cost.',
    })
    .optional(),
  hookGuildId: z
    .preprocess(
      (a) => parseInt(z.string().parse(a), 10),
      z.number({
        description: 'Guild Id for the Guild Hook.',
      })
    )
    .nullish(),
  creditCardCurrency: z
    .enum(
      Currencies.map((currency) => currency.currency) as [string, ...string[]], //zod requires at least 1 element
      {
        description: 'Currency to use for credit card payment.',
      }
    )
    .optional(),
  crossmintClientId: z
    .string({
      description: 'Client Id for Crossmint if cards are enabled.',
    })
    .optional(),
})

export type LockSettingProps = z.infer<typeof LockSettingSchema>

export const DEFAULT_LOCK_SETTINGS: LockSettingProps = {
  sendEmail: true,
  unlockFeeChargedToUser: true,
  replyTo: undefined,
  creditCardPrice: undefined,
  emailSender: undefined,
  slug: undefined,
  checkoutConfigId: undefined,
  hookGuildId: undefined,
  creditCardCurrency: 'usd',
  crossmintClientId: undefined,
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
    const web3Service = new Web3Service(networks)
    const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
    const network = Number(request.params.network)

    const userAddress = request.user?.walletAddress ?? ''

    let isLockManager = false
    if (userAddress) {
      isLockManager = await web3Service.isLockManager(
        lockAddress,
        userAddress,
        network
      )
    }

    const settings = await lockSettingOperations.getSettings({
      lockAddress,
      network,
      includeProtected: isLockManager,
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

export const getLockSettingsBySlug: RequestHandler = async (
  request: Request,
  response: Response
) => {
  try {
    const slug = request.params.slug.toLowerCase().trim()
    const settings = await lockSettingOperations.getLockSettingsBySlug(slug)

    return response.status(200).send(settings)
  } catch (err: any) {
    logger.error(err.message)
    return response.status(500).send({
      message: 'Could not get settings for this Lock.',
    })
  }
}
