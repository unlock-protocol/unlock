import { Task } from 'graphile-worker'
import { z } from 'zod'
import {
  emailTemplate,
  sendSimpleEmail,
} from '../../operations/wedlocksOperations'

const SimpleEmailPayload = z.object({
  template: z.nativeEnum(emailTemplate),
  recipient: z.string().email(),
  params: z.any().default({}), // Assuming SimpleParams is compatible with z.any(), otherwise define its shape
  attachments: z.array(z.any()).default([]), // Assuming SimpleAttachment is compatible with z.any(), otherwise define its shape
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
