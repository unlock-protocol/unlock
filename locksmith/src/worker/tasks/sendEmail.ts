import { Task } from 'graphile-worker'
import { z } from 'zod'
import { sendEmail } from '../../operations/wedlocksOperations'

const Payload = z.object({
  params: z.any().default({}),
  recipient: z.string().email(),
  template: z.string(),
  failoverTemplate: z.string(),
  attachments: z.array(z.any()).default([]),
})

export const sendEmailJob: Task = async (payload) => {
  const parsed = await Payload.parse(payload)
  await sendEmail({
    network: parsed.params.network,
    ...parsed,
  })
}
