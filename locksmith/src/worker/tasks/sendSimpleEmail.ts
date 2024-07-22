import { Task } from 'graphile-worker'
import { z } from 'zod'
import {
  EmailTemplate,
  sendSimpleEmail,
} from '../../operations/wedlocksOperations'

const SimpleEmailPayload = z.object({
  template: z.nativeEnum(EmailTemplate),
  recipient: z.string().email(),
  params: z.any().default({}),
  attachments: z.array(z.any()).default([]),
  replyTo: z.string().email().optional().nullable(),
  emailSender: z.string().optional().nullable(),
})

export const sendSimpleEmailJob: Task = async (payload) => {
  const parsed = await SimpleEmailPayload.parse(payload)
  await sendSimpleEmail(
    parsed.template,
    parsed.recipient,
    parsed.params,
    parsed.attachments,
    parsed.replyTo,
    parsed.emailSender
  )
}
