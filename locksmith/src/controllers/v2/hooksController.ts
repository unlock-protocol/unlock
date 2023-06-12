import { RequestHandler } from 'express'
import { guild } from '@guildxyz/sdk'
import * as z from 'zod'
import normalizer from '../../utils/normalizer'
import { getSettings } from '../../operations/lockSettingOperations'
import { ethers } from 'ethers'
import config from '../../config/config'
import { getPurchaser } from '../../fulfillment/dispatcher'

const guildHookQuery = z.object({
  network: z.preprocess((a) => parseInt(z.string().parse(a), 10), z.number()),
  lockAddress: z.string(),
  recipients: z
    .preprocess((a) => {
      if (typeof a === 'string') return [a]
      return a
    }, z.array(z.string()))
    .transform((item) => item.map((item) => normalizer.ethereumAddress(item))),
})

export const guildHook: RequestHandler = async (request, response) => {
  const { network, recipients, lockAddress } = await guildHookQuery.parseAsync(
    request.query
  )
  const settings = await getSettings({
    lockAddress,
    network,
  })
  if (!settings?.hookGuildId) {
    return response.status(401)
  }
  const hookGuildId = settings.hookGuildId

  const { wallet } = await getPurchaser()
  const accesses = await Promise.all(
    recipients.map(async (recipient: string) => {
      const roles = await guild.getUserAccess(hookGuildId, recipient)
      const hasAtLeastOne = roles.some((role) => role.access)
      if (!hasAtLeastOne) {
        return ''
      }
      const message = recipient.toLowerCase()
      const messageHash = ethers.utils.solidityKeccak256(['string'], [message])
      return wallet.signMessage(ethers.utils.arrayify(messageHash))
    })
  )
  return response.status(200).send({
    result: accesses,
  })
}
