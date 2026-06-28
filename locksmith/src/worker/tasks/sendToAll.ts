import { Task } from 'graphile-worker'
import { z } from 'zod'
import { UnsubscribeList, UserTokenMetadata } from '../../models'
import normalizer from '../../utils/normalizer'
import config from '../../config/config'
import logger from '../../logger'
import { minifyAddress } from '@unlock-protocol/ui'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkHtml from 'remark-html'

const Payload = z.object({
  lockAddress: z.string().transform((item) => normalizer.ethereumAddress(item)),
  network: z.coerce.number(),
  content: z.string(),
  subject: z.string(),
})

// Extracts the recipient email from a member's protected metadata, trimming
// and lowercasing it. Returns undefined when no email is present so that
// members without an email are skipped rather than enqueued as failing jobs.
export const resolveRecipientEmail = (
  protectedMetadata?: Record<string, unknown>
): string | undefined => {
  if (!protectedMetadata) {
    return undefined
  }
  const lowercased = normalizer.toLowerCaseKeys(protectedMetadata)
  const raw =
    lowercased.email || lowercased.emailaddress || lowercased.email_address
  if (typeof raw !== 'string' || !raw.trim()) {
    return undefined
  }
  return normalizer.emailAddress(raw)
}

export const sendToAllJob: Task = async (payload, helper) => {
  const parsed = await Payload.parse(payload)
  const users = await UserTokenMetadata.findAll({
    where: {
      tokenAddress: parsed.lockAddress,
      chain: parsed.network,
    },
  })
  const recipients = users.map((item) => {
    const email = resolveRecipientEmail(item.data?.userMetadata?.protected)
    if (!email) {
      return null
    }
    return {
      email,
      walletAddress: item.userAddress,
    }
  })

  const unsubscribedList = await UnsubscribeList.findAll({
    where: {
      lockAddress: parsed.lockAddress,
      network: parsed.network,
    },
  })

  const unsubscribed = unsubscribedList.map((item) =>
    item.userAddress.toLowerCase().trim()
  )

  for (const recipient of recipients) {
    if (!recipient) {
      continue
    }

    // Skip if the user has unsubscribed
    if (unsubscribed.includes(recipient.walletAddress.toLowerCase().trim())) {
      logger.info(
        `${minifyAddress(recipient.walletAddress)} has unsubscribed from ${
          parsed.lockAddress
        }`
      )
      continue
    }

    const unsubscribeLink = new URL('/email/unsubscribe', config.unlockApp)
    unsubscribeLink.searchParams.set('lockAddress', parsed.lockAddress)
    unsubscribeLink.searchParams.set('network', parsed.network.toString())

    const content = await unified()
      .use(remarkParse)
      .use(remarkHtml)
      .process(parsed.content)

    await helper.addJob('sendEmailJob', {
      recipient: recipient.email,
      attachments: [],
      params: {
        content: String(content?.value),
        subject: parsed.subject,
        lockAddress: parsed.lockAddress,
        network: parsed.network,
        unsubscribeLink: unsubscribeLink.toString(),
      },
      template: 'custom',
      failoverTemplate: 'debug',
    })
  }
}
