import { Task } from 'graphile-worker'
import { z } from 'zod'
import { UserTokenMetadata } from '../../models'
import normalizer from '../../utils/normalizer'

const Payload = z.object({
  lockAddress: z.string().transform((item) => normalizer.ethereumAddress(item)),
  network: z.string(),
  content: z.string(),
  subject: z.string(),
})

export const sendToAllJob: Task = async (payload, helper) => {
  const parsed = await Payload.parse(payload)
  const users = await UserTokenMetadata.findAll({
    where: {
      tokenAddress: parsed.lockAddress,
      chain: parsed.network,
    },
  })
  const recipients = await users.map((item) => {
    const metadata = item.data?.userMetadata?.protected
    if (!metadata) {
      return null
    }
    const lowercased = normalizer.toLowerCaseKeys(metadata)
    return (
      lowercased.email || lowercased.emailaddress || lowercased.email_address
    )
  })

  for (const recipient of recipients) {
    if (!recipient) {
      continue
    }
    await helper.addJob('sendEmail', {
      recipient,
      attachments: [],
      params: {
        content: parsed.content,
        subject: parsed.subject,
        lockAddress: parsed.lockAddress,
        network: parsed.network,
      },
      template: 'custom',
      fallbackTemplate: 'base',
    })
  }
}
